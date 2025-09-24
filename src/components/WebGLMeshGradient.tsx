'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MeshPoint } from './GradientGenerator';

interface WebGLMeshGradientProps {
  meshPoints: MeshPoint[];
  gradientType: 'linear' | 'radial' | 'circular' | 'effects' | 'nothing';
  gradientAngle: number;
  backgroundColor: string;
  enabledGradientTypes?: {
    linear: boolean;
    radial: boolean;
    circular: boolean;
    effects: boolean;
  };
  width?: number;
  height?: number;
  className?: string;
}

export default function WebGLMeshGradient({
  meshPoints,
  gradientType,
  gradientAngle,
  backgroundColor,
  enabledGradientTypes = { linear: false, radial: false, circular: false, effects: false },
  width = 800,
  height = 600,
  className = ''
}: WebGLMeshGradientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert color string to RGB
  const colorToRgb = (color: string): [number, number, number] => {
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;
      return [r, g, b];
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

    // Vertex shader source
    const vertexShaderSource = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = (a_position + 1.0) * 0.5;
      }
    `;

    // Fragment shader source - Enhanced for mesh gradients
    const fragmentShaderSource = `
      precision mediump float;
      
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform float u_gradientAngle;
      uniform vec3 u_backgroundColor;
      uniform vec4 u_meshPoints[16]; // x, y, blur, enabled
      uniform vec3 u_meshColors[16]; // r, g, b for each point
      uniform int u_meshPointsCount;
      uniform int u_gradientType;
      
      varying vec2 v_texCoord;
      
      // Smooth step function for better blending
      float smoothstep2(float edge0, float edge1, float x) {
        float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
        return t * t * (3.0 - 2.0 * t);
      }
      
      // Distance function for radial gradients
      float getRadialInfluence(vec2 uv, vec2 center, float blur) {
        float dist = distance(uv, center);
        float radius = blur * 0.01; // Convert blur to normalized radius
        return 1.0 - smoothstep2(0.0, radius, dist);
      }
      
      // Linear gradient influence
      float getLinearInfluence(vec2 uv, vec2 center, float angle, float blur) {
        vec2 dir = vec2(cos(angle), sin(angle));
        vec2 toPoint = uv - center;
        float projection = dot(toPoint, dir);
        float radius = blur * 0.01;
        return 1.0 - smoothstep2(-radius, radius, abs(projection));
      }
      
      // Circular gradient influence (mesh-like)
      float getCircularInfluence(vec2 uv, vec2 center, float blur) {
        float dist = distance(uv, center);
        float radius = blur * 0.01;
        float influence = 1.0 - smoothstep2(0.0, radius, dist);
        return influence * influence; // Square for more circular falloff
      }
      
      // Effects gradient with noise
      float getEffectsInfluence(vec2 uv, vec2 center, float blur, float time) {
        float dist = distance(uv, center);
        float radius = blur * 0.01;
        
        // Add some noise for effects
        float noise = sin(uv.x * 20.0 + time) * cos(uv.y * 20.0 + time) * 0.05;
        float influence = 1.0 - smoothstep2(0.0, radius, dist + noise);
        
        return influence * influence;
      }
      
      void main() {
        vec2 uv = v_texCoord;
        vec3 color = u_backgroundColor;
        
        if (u_meshPointsCount > 0) {
          for (int i = 0; i < 16; i++) {
            if (i >= u_meshPointsCount) break;
            
            vec4 point = u_meshPoints[i];
            vec3 pointColor = u_meshColors[i];
            vec2 center = point.xy;
            float blur = point.z;
            float enabled = point.w;
            
            if (enabled < 0.5) continue;
            
            float influence = 0.0;
            
            if (u_gradientType == 0) {
              // Linear gradient
              influence = getLinearInfluence(uv, center, u_gradientAngle * 3.14159 / 180.0, blur);
            } else if (u_gradientType == 1) {
              // Radial gradient
              influence = getRadialInfluence(uv, center, blur);
            } else if (u_gradientType == 2) {
              // Circular gradient
              influence = getCircularInfluence(uv, center, blur);
            } else if (u_gradientType == 3) {
              // Effects gradient
              influence = getEffectsInfluence(uv, center, blur, u_time);
            }
            
            // Blend with existing color
            color = mix(color, pointColor, influence * 0.8);
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

    programRef.current = program;

    // Create quad geometry
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]);

    // Create position buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // Set up viewport
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Animation loop
    const animate = (time: number) => {
      if (!gl || !program) return;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);

      // Set up attributes
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      const positionLocation = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      // Set uniforms
      gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), canvas.width, canvas.height);
      gl.uniform1f(gl.getUniformLocation(program, 'u_time'), time * 0.001);
      gl.uniform1f(gl.getUniformLocation(program, 'u_gradientAngle'), gradientAngle);
      
      const bgColor = colorToRgb(backgroundColor);
      gl.uniform3f(gl.getUniformLocation(program, 'u_backgroundColor'), bgColor[0], bgColor[1], bgColor[2]);

      // Prepare mesh points data
      const visiblePoints = meshPoints.filter(point => !point.hideColor);
      const meshPointsData = new Float32Array(16 * 4); // x, y, blur, enabled
      const meshColorsData = new Float32Array(16 * 3); // r, g, b
      
      for (let i = 0; i < Math.min(visiblePoints.length, 16); i++) {
        const point = visiblePoints[i];
        const rgb = colorToRgb(point.color);
        
        // Position (normalized to 0-1)
        meshPointsData[i * 4] = point.x / 100;
        meshPointsData[i * 4 + 1] = point.y / 100;
        meshPointsData[i * 4 + 2] = point.blur || 100; // Blur value
        meshPointsData[i * 4 + 3] = 1.0; // Enabled
        
        // Color
        meshColorsData[i * 3] = rgb[0];
        meshColorsData[i * 3 + 1] = rgb[1];
        meshColorsData[i * 3 + 2] = rgb[2];
      }

      // Fill remaining slots with disabled points
      for (let i = visiblePoints.length; i < 16; i++) {
        meshPointsData[i * 4] = 0.0;
        meshPointsData[i * 4 + 1] = 0.0;
        meshPointsData[i * 4 + 2] = 0.0;
        meshPointsData[i * 4 + 3] = 0.0; // Disabled
        
        meshColorsData[i * 3] = 0.0;
        meshColorsData[i * 3 + 1] = 0.0;
        meshColorsData[i * 3 + 2] = 0.0;
      }

      gl.uniform4fv(gl.getUniformLocation(program, 'u_meshPoints'), meshPointsData);
      gl.uniform3fv(gl.getUniformLocation(program, 'u_meshColors'), meshColorsData);
      gl.uniform1i(gl.getUniformLocation(program, 'u_meshPointsCount'), visiblePoints.length);
      
      // Determine gradient type based on enabled types (same logic as CSS version)
      let gradientTypeValue = 0;
      if (enabledGradientTypes.linear) {
        gradientTypeValue = 0; // Linear
      } else if (enabledGradientTypes.radial) {
        gradientTypeValue = 1; // Radial
      } else if (enabledGradientTypes.circular) {
        gradientTypeValue = 2; // Circular
      } else if (enabledGradientTypes.effects) {
        gradientTypeValue = 3; // Effects
      } else {
        // No gradient types enabled, use individual texture types
        gradientTypeValue = 2; // Default to circular for individual points
      }
      
      gl.uniform1i(gl.getUniformLocation(program, 'u_gradientType'), gradientTypeValue);

      // Draw
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate(0);
  }, []); // Remove dependencies to prevent re-initialization

  // Initialize WebGL when component mounts
  useEffect(() => {
    initWebGL();
    
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []); // Only run once on mount

  // Update WebGL when props change (without re-initializing)
  useEffect(() => {
    if (glRef.current && programRef.current) {
      // Update uniforms without re-initializing the entire WebGL context
      const gl = glRef.current;
      const program = programRef.current;
      
      // Update uniforms
      gl.uniform1f(gl.getUniformLocation(program, 'u_gradientAngle'), gradientAngle);
      
      const bgColor = colorToRgb(backgroundColor);
      gl.uniform3f(gl.getUniformLocation(program, 'u_backgroundColor'), bgColor[0], bgColor[1], bgColor[2]);

      // Update mesh points
      const visiblePoints = meshPoints.filter(point => !point.hideColor);
      const meshPointsData = new Float32Array(16 * 4);
      const meshColorsData = new Float32Array(16 * 3);
      
      for (let i = 0; i < Math.min(visiblePoints.length, 16); i++) {
        const point = visiblePoints[i];
        const rgb = colorToRgb(point.color);
        
        meshPointsData[i * 4] = point.x / 100;
        meshPointsData[i * 4 + 1] = point.y / 100;
        meshPointsData[i * 4 + 2] = point.blur || 100;
        meshPointsData[i * 4 + 3] = 1.0;
        
        meshColorsData[i * 3] = rgb[0];
        meshColorsData[i * 3 + 1] = rgb[1];
        meshColorsData[i * 3 + 2] = rgb[2];
      }

      for (let i = visiblePoints.length; i < 16; i++) {
        meshPointsData[i * 4] = 0.0;
        meshPointsData[i * 4 + 1] = 0.0;
        meshPointsData[i * 4 + 2] = 0.0;
        meshPointsData[i * 4 + 3] = 0.0;
        
        meshColorsData[i * 3] = 0.0;
        meshColorsData[i * 3 + 1] = 0.0;
        meshColorsData[i * 3 + 2] = 0.0;
      }

      gl.uniform4fv(gl.getUniformLocation(program, 'u_meshPoints'), meshPointsData);
      gl.uniform3fv(gl.getUniformLocation(program, 'u_meshColors'), meshColorsData);
      gl.uniform1i(gl.getUniformLocation(program, 'u_meshPointsCount'), visiblePoints.length);
      
      // Determine gradient type based on enabled types (same logic as CSS version)
      let gradientTypeValue = 0;
      if (enabledGradientTypes.linear) {
        gradientTypeValue = 0; // Linear
      } else if (enabledGradientTypes.radial) {
        gradientTypeValue = 1; // Radial
      } else if (enabledGradientTypes.circular) {
        gradientTypeValue = 2; // Circular
      } else if (enabledGradientTypes.effects) {
        gradientTypeValue = 3; // Effects
      } else {
        // No gradient types enabled, use individual texture types
        gradientTypeValue = 2; // Default to circular for individual points
      }
      
      gl.uniform1i(gl.getUniformLocation(program, 'u_gradientType'), gradientTypeValue);
    }
  }, [meshPoints, gradientType, gradientAngle, backgroundColor, enabledGradientTypes]);

  // Optimized animation update - only update mesh points for smooth animation
  useEffect(() => {
    if (glRef.current && programRef.current && meshPoints.length > 0) {
      const gl = glRef.current;
      const program = programRef.current;
      
      // Only update mesh points for animation (skip other uniforms)
      const visiblePoints = meshPoints.filter(point => !point.hideColor);
      const meshPointsData = new Float32Array(16 * 4);
      const meshColorsData = new Float32Array(16 * 3);
      
      for (let i = 0; i < Math.min(visiblePoints.length, 16); i++) {
        const point = visiblePoints[i];
        const rgb = colorToRgb(point.color);
        
        meshPointsData[i * 4] = point.x / 100;
        meshPointsData[i * 4 + 1] = point.y / 100;
        meshPointsData[i * 4 + 2] = point.blur || 100;
        meshPointsData[i * 4 + 3] = 1.0;
        
        meshColorsData[i * 3] = rgb[0];
        meshColorsData[i * 3 + 1] = rgb[1];
        meshColorsData[i * 3 + 2] = rgb[2];
      }

      for (let i = visiblePoints.length; i < 16; i++) {
        meshPointsData[i * 4] = 0.0;
        meshPointsData[i * 4 + 1] = 0.0;
        meshPointsData[i * 4 + 2] = 0.0;
        meshPointsData[i * 4 + 3] = 0.0;
        
        meshColorsData[i * 3] = 0.0;
        meshColorsData[i * 3 + 1] = 0.0;
        meshColorsData[i * 3 + 2] = 0.0;
      }

      gl.uniform4fv(gl.getUniformLocation(program, 'u_meshPoints'), meshPointsData);
      gl.uniform3fv(gl.getUniformLocation(program, 'u_meshColors'), meshColorsData);
      gl.uniform1i(gl.getUniformLocation(program, 'u_meshPointsCount'), visiblePoints.length);
    }
  }, [meshPoints]); // Only depend on meshPoints for animation updates

  if (!isWebGLSupported) {
    return (
      <div className={`flex items-center justify-center w-full h-full bg-gray-100 text-gray-600 ${className}`}>
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">WebGL Not Supported</p>
          <p className="text-sm">Your browser doesn't support WebGL. Please use a modern browser.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center w-full h-full bg-red-100 text-red-600 ${className}`}>
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">WebGL Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
    </div>
  );
}
