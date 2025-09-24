'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MeshPoint } from './GradientGenerator';

interface WebGLGradientRendererProps {
  meshPoints: MeshPoint[];
  gradientType: 'linear' | 'radial' | 'circular' | 'effects' | 'nothing';
  gradientAngle: number;
  backgroundColor: string;
  width?: number;
  height?: number;
  onWebGLContext?: (gl: WebGLRenderingContext) => void;
}

interface WebGLProgram {
  program: WebGLProgram;
  attribLocations: {
    vertexPosition: number;
    vertexColor?: number;
  };
  uniformLocations: {
    resolution: WebGLUniformLocation | null;
    time: WebGLUniformLocation | null;
    gradientAngle: WebGLUniformLocation | null;
    backgroundColor: WebGLUniformLocation | null;
    meshPoints: WebGLUniformLocation | null;
    meshPointsCount: WebGLUniformLocation | null;
  };
}

export default function WebGLGradientRenderer({
  meshPoints,
  gradientType,
  gradientAngle,
  backgroundColor,
  width = 800,
  height = 600,
  onWebGLContext
}: WebGLGradientRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert hex color to RGB
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255
    ] : [0, 0, 0];
  };

  // Convert color string to RGB
  const colorToRgb = (color: string): [number, number, number] => {
    if (color.startsWith('#')) {
      return hexToRgb(color);
    } else if (color.startsWith('rgb')) {
      const matches = color.match(/\d+/g);
      if (matches && matches.length >= 3) {
        return [
          parseInt(matches[0]) / 255,
          parseInt(matches[1]) / 255,
          parseInt(matches[2]) / 255
        ];
      }
    } else if (color.startsWith('hsl')) {
      // Simple HSL to RGB conversion (basic implementation)
      const matches = color.match(/\d+/g);
      if (matches && matches.length >= 3) {
        const h = parseInt(matches[0]) / 360;
        const s = parseInt(matches[1]) / 100;
        const l = parseInt(matches[2]) / 100;
        
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h * 6) % 2 - 1));
        const m = l - c / 2;
        
        let r = 0, g = 0, b = 0;
        if (h < 1/6) { r = c; g = x; b = 0; }
        else if (h < 2/6) { r = x; g = c; b = 0; }
        else if (h < 3/6) { r = 0; g = c; b = x; }
        else if (h < 4/6) { r = 0; g = x; b = c; }
        else if (h < 5/6) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }
        
        return [r + m, g + m, b + m];
      }
    }
    return [0, 0, 0];
  };

  // Create shader
  const createShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  };

  // Create program
  const createProgram = (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null => {
    const program = gl.createProgram();
    if (!program) return null;
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    
    return program;
  };

  // Initialize WebGL
  const initWebGL = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      setIsWebGLSupported(false);
      setError('WebGL not supported in this browser');
      return;
    }

    glRef.current = gl;
    onWebGLContext?.(gl);

    // Vertex shader source
    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `;

    // Fragment shader source
    const fragmentShaderSource = `
      precision mediump float;
      
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform float u_gradientAngle;
      uniform vec3 u_backgroundColor;
      uniform vec4 u_meshPoints[16]; // x, y, r, g, b for each point
      uniform int u_meshPointsCount;
      
      varying vec2 v_texCoord;
      
      // Convert HSL to RGB
      vec3 hsl2rgb(vec3 c) {
        vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0);
        return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
      }
      
      // Convert hex color to RGB
      vec3 hex2rgb(vec3 hex) {
        return hex;
      }
      
      // Distance from point to line
      float distanceToLine(vec2 p, vec2 a, vec2 b) {
        vec2 pa = p - a;
        vec2 ba = b - a;
        float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        return length(pa - ba * h);
      }
      
      // Linear gradient
      vec3 getLinearGradient(vec2 uv, vec4 points[16], int count) {
        vec2 gradientDir = vec2(cos(u_gradientAngle * 3.14159 / 180.0), sin(u_gradientAngle * 3.14159 / 180.0));
        
        float minDist = 1.0;
        vec3 color = u_backgroundColor;
        
        for (int i = 0; i < 16; i++) {
          if (i >= count) break;
          
          vec2 pointPos = points[i].xy;
          vec3 pointColor = points[i].rgb;
          
          // Project point onto gradient line
          float projection = dot(pointPos - uv, gradientDir);
          float normalizedProjection = (projection + 1.0) * 0.5; // Normalize to 0-1
          
          // Create gradient based on projection
          float influence = 1.0 - abs(normalizedProjection - 0.5) * 2.0;
          influence = smoothstep(0.0, 1.0, influence);
          
          color = mix(color, pointColor, influence * 0.8);
        }
        
        return color;
      }
      
      // Radial gradient
      vec3 getRadialGradient(vec2 uv, vec4 points[16], int count) {
        vec3 color = u_backgroundColor;
        
        for (int i = 0; i < 16; i++) {
          if (i >= count) break;
          
          vec2 pointPos = points[i].xy;
          vec3 pointColor = points[i].rgb;
          
          float dist = distance(uv, pointPos);
          float influence = 1.0 - smoothstep(0.0, 0.5, dist);
          
          color = mix(color, pointColor, influence);
        }
        
        return color;
      }
      
      // Circular gradient (mesh-like)
      vec3 getCircularGradient(vec2 uv, vec4 points[16], int count) {
        vec3 color = u_backgroundColor;
        
        for (int i = 0; i < 16; i++) {
          if (i >= count) break;
          
          vec2 pointPos = points[i].xy;
          vec3 pointColor = points[i].rgb;
          
          float dist = distance(uv, pointPos);
          float influence = 1.0 - smoothstep(0.0, 0.3, dist);
          influence = pow(influence, 2.0); // Make it more circular
          
          color = mix(color, pointColor, influence * 0.6);
        }
        
        return color;
      }
      
      // Effects gradient (enhanced)
      vec3 getEffectsGradient(vec2 uv, vec4 points[16], int count) {
        vec3 color = u_backgroundColor;
        
        for (int i = 0; i < 16; i++) {
          if (i >= count) break;
          
          vec2 pointPos = points[i].xy;
          vec3 pointColor = points[i].rgb;
          
          float dist = distance(uv, pointPos);
          float influence = 1.0 - smoothstep(0.0, 0.4, dist);
          influence = pow(influence, 1.5);
          
          // Add some noise for effects
          float noise = sin(uv.x * 10.0 + u_time) * cos(uv.y * 10.0 + u_time) * 0.1;
          influence += noise;
          
          color = mix(color, pointColor, influence * 0.7);
        }
        
        return color;
      }
      
      void main() {
        vec2 uv = v_texCoord;
        vec3 color = u_backgroundColor;
        
        if (u_meshPointsCount > 0) {
          if (u_gradientAngle >= 0.0) {
            // Linear gradient
            color = getLinearGradient(uv, u_meshPoints, u_meshPointsCount);
          } else {
            // Radial gradient
            color = getRadialGradient(uv, u_meshPoints, u_meshPointsCount);
          }
        }
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // Create shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    if (!vertexShader || !fragmentShader) {
      setError('Failed to create shaders');
      return;
    }

    // Create program
    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) {
      setError('Failed to create program');
      return;
    }

    // Get attribute and uniform locations
    const programInfo: WebGLProgram = {
      program,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(program, 'a_position'),
        vertexColor: gl.getAttribLocation(program, 'a_texCoord')
      },
      uniformLocations: {
        resolution: gl.getUniformLocation(program, 'u_resolution'),
        time: gl.getUniformLocation(program, 'u_time'),
        gradientAngle: gl.getUniformLocation(program, 'u_gradientAngle'),
        backgroundColor: gl.getUniformLocation(program, 'u_backgroundColor'),
        meshPoints: gl.getUniformLocation(program, 'u_meshPoints'),
        meshPointsCount: gl.getUniformLocation(program, 'u_meshPointsCount')
      }
    };

    programRef.current = programInfo;

    // Create quad geometry
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]);

    const texCoords = new Float32Array([
      0, 0,
      1, 0,
      0, 1,
      1, 1,
    ]);

    // Create buffers
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    // Set up viewport
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Animation loop
    const animate = (time: number) => {
      if (!gl || !programInfo) return;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(programInfo.program);

      // Set up attributes
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
      gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor!);
      gl.vertexAttribPointer(programInfo.attribLocations.vertexColor!, 2, gl.FLOAT, false, 0, 0);

      // Set uniforms
      gl.uniform2f(programInfo.uniformLocations.resolution, canvas.width, canvas.height);
      gl.uniform1f(programInfo.uniformLocations.time, time * 0.001);
      gl.uniform1f(programInfo.uniformLocations.gradientAngle, gradientAngle);
      
      const bgColor = colorToRgb(backgroundColor);
      gl.uniform3f(programInfo.uniformLocations.backgroundColor, bgColor[0], bgColor[1], bgColor[2]);

      // Prepare mesh points data
      const visiblePoints = meshPoints.filter(point => !point.hideColor);
      const meshPointsData = new Float32Array(16 * 4); // 16 points max, 4 floats each (x, y, r, g, b)
      
      for (let i = 0; i < Math.min(visiblePoints.length, 16); i++) {
        const point = visiblePoints[i];
        const rgb = colorToRgb(point.color);
        const x = point.x / 100; // Convert percentage to 0-1
        const y = point.y / 100;
        
        meshPointsData[i * 4] = x;
        meshPointsData[i * 4 + 1] = y;
        meshPointsData[i * 4 + 2] = rgb[0];
        meshPointsData[i * 4 + 3] = rgb[1];
      }

      // We need to pass the blue component separately or use a different approach
      // For now, let's create a texture to store the full RGB data
      const textureData = new Float32Array(16 * 3); // 16 points, 3 components (r, g, b)
      for (let i = 0; i < Math.min(visiblePoints.length, 16); i++) {
        const point = visiblePoints[i];
        const rgb = colorToRgb(point.color);
        textureData[i * 3] = rgb[0];
        textureData[i * 3 + 1] = rgb[1];
        textureData[i * 3 + 2] = rgb[2];
      }

      gl.uniform4fv(programInfo.uniformLocations.meshPoints, meshPointsData);
      gl.uniform1i(programInfo.uniformLocations.meshPointsCount, visiblePoints.length);

      // Draw
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate(0);
  }, [meshPoints, gradientAngle, backgroundColor, onWebGLContext]);

  // Initialize WebGL when component mounts
  useEffect(() => {
    initWebGL();
    
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [initWebGL]);

  // Update when props change
  useEffect(() => {
    if (programRef.current && glRef.current) {
      // The animation loop will pick up the new values
    }
  }, [meshPoints, gradientType, gradientAngle, backgroundColor]);

  if (!isWebGLSupported) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-600">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">WebGL Not Supported</p>
          <p className="text-sm">Your browser doesn't support WebGL. Please use a modern browser.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-red-100 text-red-600">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">WebGL Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
        WebGL Renderer
      </div>
    </div>
  );
}
