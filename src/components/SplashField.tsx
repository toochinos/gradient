'use client';

import { useEffect, useRef } from 'react';

interface SplashFieldProps {
  isVisible: boolean;
  isFullscreen: boolean;
}

export default function SplashField({ isVisible, isFullscreen }: SplashFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!isVisible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: false
    });

    if (!gl) {
      console.error('WebGL 2 not supported');
      return;
    }

    // Enable blending for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Set clear color to transparent
    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    glRef.current = gl;

    // Vertex shader source
    const vertexShaderSource = `#version 300 es
      in vec4 aPosition;
      void main() {
          gl_Position = aPosition;
      }`;

    // Fragment shader source with the splash effect
    const fragmentShaderSource = `#version 300 es
      precision highp float;

      uniform vec3 iResolution;
      uniform float iTime;
      uniform vec4 iMouse;
      out vec4 fragColor;

      vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }

      vec4 mod289(vec4 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }

      vec4 permute(vec4 x) {
        return mod289(((x*34.0)+1.0)*x);
      }

      vec4 taylorInvSqrt(vec4 r) {
        return 1.79284291400159 - 0.85373472095314 * r;
      }

      vec3 fade(vec3 t) {
        return t*t*t*(t*(t*6.0-15.0)+10.0);
      }

      float cnoise(vec3 P) {
        vec3 Pi0 = floor(P);
        vec3 Pi1 = Pi0 + vec3(1.0);
        Pi0 = mod289(Pi0);
        Pi1 = mod289(Pi1);
        vec3 Pf0 = fract(P);
        vec3 Pf1 = Pf0 - vec3(1.0);
        vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
        vec4 iy = vec4(Pi0.yy, Pi1.yy);
        vec4 iz0 = Pi0.zzzz;
        vec4 iz1 = Pi1.zzzz;

        vec4 ixy = permute(permute(ix) + iy);
        vec4 ixy0 = permute(ixy + iz0);
        vec4 ixy1 = permute(ixy + iz1);

        vec4 gx0 = ixy0 * (1.0 / 7.0);
        vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
        gx0 = fract(gx0);
        vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
        vec4 sz0 = step(gz0, vec4(0.0));
        gx0 -= sz0 * (step(0.0, gx0) - 0.5);
        gy0 -= sz0 * (step(0.0, gy0) - 0.5);

        vec4 gx1 = ixy1 * (1.0 / 7.0);
        vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
        gx1 = fract(gx1);
        vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
        vec4 sz1 = step(gz1, vec4(0.0));
        gx1 -= sz1 * (step(0.0, gx1) - 0.5);
        gy1 -= sz1 * (step(0.0, gy1) - 0.5);

        vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
        vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
        vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
        vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
        vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
        vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
        vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
        vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

        float n000 = dot(g000, Pf0);
        float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
        float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
        float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
        float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
        float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
        float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
        float n111 = dot(g111, Pf1);

        vec3 fade_xyz = fade(Pf0);
        vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
        vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
        float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
        return 2.2 * n_xyz;
      }

      vec4 map2( vec3 p ) {
          float v = 2.5;
          float wiggle = iTime * 0.25;

          p.x += .95*sin( v*p.y + 1.0 * wiggle);
          p.y += .95*sin( v*p.z + 2.0 * wiggle);
          p.z += .95*sin( v*p.x + 4.0 * wiggle);

          p.z += pow(cnoise(p*4.0),3.0)*6.0;

          float d1 = 0.02 * (length(p) - 0.90*smoothstep(0.0,2.0,iTime));

          return vec4( d1, p );
      }

      vec4 map( vec3 p ) {
          vec4 res = map2(p);

          float d2 = p.y - 0.5;
          if( d2<res.x ) res = mix(res, vec4( d2, 0.0, 0.0, 0.0 ), smoothstep(0.0, 1.0, -d2*0.1));

          return res;
      }

      vec4 intersect( in vec3 ro, in vec3 rd, in float maxd ) {
          vec3 res = vec3(-1.0);
          float precis = 0.005;
          float t = 1.0;
          for( int i=0; i<256; i++ ) {
              vec4 tmp = map( ro+rd*t );
              res = tmp.yzw;
              float h = tmp.x;
              if( h<precis||t>maxd ) break;
              t += h;
          }

          return vec4( t, res );
      }

      vec3 calcNormal( in vec3 pos ) {
          vec2 e = vec2(1.0,-1.0)*0.001;
          return normalize( e.xyy*map( pos + e.xyy ).x +
                            e.yyx*map( pos + e.yyx ).x +
                            e.yxy*map( pos + e.yxy ).x +
                            e.xxx*map( pos + e.xxx ).x );
      }

      float softshadow( in vec3 ro, in vec3 rd, float mint, float k ) {
          float res = 1.0;
          float t = mint;
          float h = 1.0;
          for( int i=0; i<64; i++ ) {
              h = map(ro + rd*t).x;
              res = min( res, k*h/t );
              if( res<0.0001 ) break;
              t += clamp( h, 0.01, 0.05 );
          }
          return clamp(res,0.0,1.0);
      }

      float calcOcc( in vec3 pos, in vec3 nor ) {
          const float h = 0.2;
          float ao = 0.0;
          for( int i=0; i<4; i++ ) {
              vec3 dir = sin( float(i)*vec3(1.0,7.13,13.71)+vec3(0.0,2.0,4.0) );
              dir *= sign(dot(dir,nor));
              float d = map2( pos + h*dir ).x;
              ao += max(0.0,h-d*2.0);
          }
          return clamp( 4.0 - 2.5*ao, 0.0, 1.0 )*(0.5+0.5*nor.y);
      }

      vec3 lig = normalize(vec3(1.0,0.7,0.9));

      void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
          vec2 q = fragCoord.xy / iResolution.xy;
          vec2 p = -1.0 + 2.0 * q;
          p.x *= iResolution.x/iResolution.y;
          vec2 m = vec2(0.5);
          if( iMouse.z>0.0 ) m = iMouse.xy/iResolution.xy;

          float an = 0.005*iTime + 7.5 - 5.0*m.x;

          vec3 ro = vec3(4.5*sin(an),0.5,4.5*cos(an));
          vec3 ta = vec3(0.0,0.5,0.0);

          vec3 ww = normalize( ta - ro );
          vec3 uu = normalize( cross(ww,vec3(0.0,1.0,0.0) ) );
          vec3 vv = normalize( cross(uu,ww));

          vec3 rd = normalize( p.x*uu + p.y*vv + 2.0*ww );

          vec3 col = vec3(0.0);
          float alpha = 0.0;
          const float maxd = 9.0;
          vec4  inn = intersect(ro,rd,maxd);
          float t = inn.x;
          if( t<maxd ) {
              alpha = 1.0;
              vec3 tra = inn.yzw;

              vec3 pos = ro + t*rd;
              vec3 nor = calcNormal(pos);
              vec3 ref = reflect( rd, nor );

              col = vec3(0.3,0.3,0.3);
              col += 0.2*tra;

              vec3 pat = vec3(
                  0.5 + 0.5 * sin(iTime * 0.8 + pos.x * 2.0),
                  0.5 + 0.5 * sin(iTime * 1.2 + pos.y * 4.0 + 2.0),
                  0.5 + 0.5 * sin(iTime * 1.6 + pos.z * 6.0 + 4.0)
              );

              col *= pat;
              col *= 0.5;

              float occ = calcOcc( pos, nor );

              float amb = 0.5 + 0.5*nor.y;
              float dif = max(dot(nor,lig),0.0);
              float bou = max(0.0,-nor.y);
              float bac = max(0.2 + 0.8*dot(nor,-lig),0.0);
              float sha = 0.0; if( dif>0.01 ) sha=softshadow( pos+0.01*nor, lig, 0.0005, 128.0 );
              float fre = pow( clamp( 1.0 + dot(nor,rd), 0.0, 1.0 ), 3.0 );
              float spe = 15.0*pat.x*max( 0.0, pow( clamp( dot(lig,reflect(rd,nor)), 0.0, 1.0), 16.0 ) )*dif*sha*(0.04+0.96*fre);

              vec3 lin = vec3(0.0);

              lin += 3.5*dif*vec3(6.00,4.00,3.00)*pow(vec3(sha),vec3(1.0,1.2,1.5));
              lin += 1.0*amb*vec3(0.30,0.30,0.30)*occ;
              lin += 1.0*bac*vec3(0.80,0.50,0.20)*occ;
              lin += 1.0*bou*vec3(1.00,0.30,0.20)*occ;
              lin += 4.0*fre*vec3(1.00,0.80,0.70)*(0.3+0.7*dif*sha)*occ;
              lin += spe*2.0;

              col = col*lin + spe;

              col *= min(200.0*exp(-1.5*t),1.0);
              col *= 1.0-smoothstep( 1.0,6.0,length(pos.xz) );
          }

          col = pow( clamp(col,0.0,1.0), vec3(0.4545) );

          col = pow( col, vec3(0.6,1.0,1.0) );
          col *= pow( 16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y), 0.1 );

          fragColor = vec4( col, alpha );
      }

      void main() {
          mainImage(fragColor, gl_FragCoord.xy);
      }
      `;

    // Create shader function
    const createShader = (gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    // Create program function
    const createProgram = (gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null => {
      const program = gl.createProgram();
      if (!program) return null;

      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
      }
      return program;
    };

    // Create shaders and program
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) {
      console.error('Failed to create shaders');
      return;
    }

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) {
      console.error('Failed to create program');
      return;
    }

    programRef.current = program;

    // Get uniform and attribute locations
    const positionAttributeLocation = gl.getAttribLocation(program, 'aPosition');
    const resolutionUniformLocation = gl.getUniformLocation(program, 'iResolution');
    const timeUniformLocation = gl.getUniformLocation(program, 'iTime');
    const mouseUniformLocation = gl.getUniformLocation(program, 'iMouse');

    // Create and bind vertex buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    gl.useProgram(program);

    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    // Resize canvas function
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        canvas.style.width = `${container.clientWidth}px`;
        canvas.style.height = `${container.clientHeight}px`;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    resizeCanvas();

    // Mouse move handler
    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = event.clientX - rect.left;
      mouseRef.current.y = canvas.height - (event.clientY - rect.top); // Flip Y coordinate
    };

    // Add event listeners
    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', resizeCanvas);

    // Render loop
    const render = (time: number) => {
      if (!isVisible || !gl || !program) return;

      gl.uniform3f(
        resolutionUniformLocation,
        canvas.width,
        canvas.height,
        1.0
      );
      gl.uniform1f(timeUniformLocation, time * 0.001);
      gl.uniform4f(
        mouseUniformLocation,
        mouseRef.current.x,
        mouseRef.current.y,
        0.0,
        0.0
      );

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    // Cleanup
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (gl && program) {
        gl.deleteProgram(program);
      }
    };
  }, [isVisible, isFullscreen]);

  if (!isVisible) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto"
      style={{ zIndex: 1 }}
    />
  );
}