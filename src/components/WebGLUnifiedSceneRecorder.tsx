import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface WebGLUnifiedSceneRecorderProps {
  width?: number;
  height?: number;
  frameRate?: number;
}

// Simple gradient fragment shader adapted for ShaderMaterial
const GradientFragmentShader = `
  precision mediump float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_angle; // in radians
  uniform vec3 u_bg;

  // Two-color gradient as example; extend to mesh points if needed
  vec3 colorA = vec3(0.996, 0.420, 0.420); // #ff6b6b
  vec3 colorB = vec3(0.278, 0.804, 0.769); // #47cdc4 (close to #4ecdc4)

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy; // 0..1

    // Rotate UV by angle to create a directional gradient
    float c = cos(u_angle);
    float s = sin(u_angle);
    vec2 centered = uv - 0.5;
    vec2 rotated = vec2(
      centered.x * c - centered.y * s,
      centered.x * s + centered.y * c
    ) + 0.5;

    float t = clamp(rotated.x, 0.0, 1.0);
    vec3 col = mix(colorA, colorB, t);

    // Slight time-based pulsing for visual feedback
    float pulse = 0.03 * sin(u_time * 0.8);
    col += pulse;

    col = mix(u_bg, col, 0.95);
    gl_FragColor = vec4(col, 1.0);
  }
`;

const GradientVertexShader = `
  precision mediump float;
  attribute vec3 position;
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

export default function WebGLUnifiedSceneRecorder({ width = 1280, height = 720, frameRate = 30 }: WebGLUnifiedSceneRecorderProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const gradientMeshRef = useRef<THREE.Mesh | null>(null);
  const rotatingMeshRef = useRef<THREE.Mesh | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    if (!mountRef.current) return;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Setup scene/camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0b0f);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.2);
    cameraRef.current = camera;

    // Full-screen quad for gradient (clip-space -1..1 plane)
    const quadGeo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      -1, -1, 0,
       1, -1, 0,
       1,  1, 0,
      -1,  1, 0,
    ]);
    const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
    quadGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    quadGeo.setIndex(new THREE.BufferAttribute(indices, 1));

    const gradientUniforms = {
      u_resolution: { value: new THREE.Vector2(width, height) },
      u_time: { value: 0.0 },
      u_angle: { value: Math.PI * 0.25 },
      u_bg: { value: new THREE.Color(0x0b0b0f).toArray().slice(0, 3) },
    } as Record<string, THREE.IUniform>;

    const gradientMat = new THREE.RawShaderMaterial({
      uniforms: gradientUniforms,
      vertexShader: GradientVertexShader,
      fragmentShader: GradientFragmentShader,
      depthTest: false,
      depthWrite: false,
    });

    const gradientMesh = new THREE.Mesh(quadGeo, gradientMat);
    gradientMesh.renderOrder = -1; // render first
    scene.add(gradientMesh);
    gradientMeshRef.current = gradientMesh;

    // Foreground Three.js content: a simple rotating icosahedron
    const geo = new THREE.IcosahedronGeometry(0.6, 2);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.2,
      roughness: 0.35,
      emissive: new THREE.Color(0x222222),
      emissiveIntensity: 0.25,
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    rotatingMeshRef.current = mesh;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, 0.8);
    key.position.set(2, 2, 3);
    scene.add(key);

    const animate = (t: number) => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
      if (!startTimeRef.current) startTimeRef.current = t;
      const elapsed = (t - startTimeRef.current) / 1000;

      // Update uniforms
      (gradientMat.uniforms.u_time as THREE.IUniform).value = elapsed;

      // Rotate mesh
      if (rotatingMeshRef.current) {
        rotatingMeshRef.current.rotation.y = elapsed * 0.6;
        rotatingMeshRef.current.rotation.x = Math.sin(elapsed * 0.5) * 0.2;
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
      animationIdRef.current = requestAnimationFrame(animate);
    };

    animationIdRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current) return;
      const w = width;
      const h = height;
      rendererRef.current.setSize(w, h);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      (gradientMat.uniforms.u_resolution as THREE.IUniform).value = new THREE.Vector2(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (rendererRef.current.domElement && rendererRef.current.domElement.parentElement) {
          rendererRef.current.domElement.parentElement.removeChild(rendererRef.current.domElement);
        }
      }
      scene.traverse(obj => {
        if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
        if ((obj as THREE.Mesh).material) {
          const m = (obj as THREE.Mesh).material as THREE.Material | THREE.Material[];
          if (Array.isArray(m)) m.forEach(mm => mm.dispose()); else m.dispose();
        }
      });
    };
  }, [width, height]);

  const startRecording = () => {
    if (!rendererRef.current) return;
    const canvas = rendererRef.current.domElement as HTMLCanvasElement;
    const stream = canvas.captureStream(frameRate);

    recordedChunksRef.current = [];

    try {
      const mr = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 6_000_000,
      });
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      mr.onstart = () => setStatus('Recording…');
      mr.onstop = () => {
        setStatus('Processing…');
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'unified-webgl-recording.webm';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setStatus('Saved webm');
      };

      mr.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      setStatus('MediaRecorder not supported with requested mimeType');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-4 py-2 rounded text-white ${isRecording ? 'bg-red-600 hover:bg-red-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording (WebM)'}
        </button>
        <span className="text-sm text-gray-400">{status}</span>
      </div>
      <div ref={mountRef} style={{ width, height, borderRadius: 8, overflow: 'hidden', border: '1px solid #1f2937' }} />
    </div>
  );
}
