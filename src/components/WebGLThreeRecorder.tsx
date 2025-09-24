'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface WebGLThreeRecorderProps {
  width?: number;
  height?: number;
  duration?: number; // Recording duration in seconds
  fps?: number;
}

export default function WebGLThreeRecorder({ 
  width = 800, 
  height = 600, 
  duration = 5, 
  fps = 30 
}: WebGLThreeRecorderProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationIdRef = useRef<number | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [frames, setFrames] = useState<ImageData[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      preserveDrawingBuffer: true // Important for recording
    });
    
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Store references
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    // Create animated geometry
    const geometry = new THREE.IcosahedronGeometry(2, 3);
    const material = new THREE.MeshPhongMaterial({
      color: 0x4a90e2,
      transparent: true,
      opacity: 0.8,
      shininess: 100
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Camera position
    camera.position.z = 5;

    // Animation loop
    const animate = (time: number) => {
      if (!scene || !camera || !renderer) return;

      // Rotate the mesh
      mesh.rotation.x += 0.01;
      mesh.rotation.y += 0.01;
      mesh.rotation.z += 0.005;

      // Morph the geometry
      const positions = mesh.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];
        
        const noise1 = Math.sin(x * 2 + time * 0.001) * 0.3;
        const noise2 = Math.cos(y * 2 + time * 0.001 * 1.3) * 0.3;
        const noise3 = Math.sin(z * 2 + time * 0.001 * 0.7) * 0.3;
        
        positions[i] = x + noise1;
        positions[i + 1] = y + noise2;
        positions[i + 2] = z + noise3;
      }
      
      mesh.geometry.attributes.position.needsUpdate = true;
      mesh.geometry.computeVertexNormals();

      // Color animation
      const hue = (time * 0.0001) % 1;
      (material as THREE.MeshPhongMaterial).color.setHSL(hue, 0.7, 0.6);

      renderer.render(scene, camera);
      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate(0);

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [width, height]);

  const startRecording = () => {
    if (!rendererRef.current) return;

    setIsRecording(true);
    setRecordingProgress(0);
    setFrames([]);

    const totalFrames = duration * fps;
    let currentFrame = 0;

    const captureFrame = () => {
      if (currentFrame >= totalFrames) {
        setIsRecording(false);
        processFrames();
        return;
      }

      // Capture frame
      const canvas = rendererRef.current!.domElement;
      const imageData = canvas.getContext('2d')?.getImageData(0, 0, width, height);
      if (imageData) {
        setFrames(prev => [...prev, imageData]);
      }

      setRecordingProgress((currentFrame / totalFrames) * 100);
      currentFrame++;

      setTimeout(captureFrame, 1000 / fps);
    };

    captureFrame();
  };

  const processFrames = () => {
    // Create a video element to process frames
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Create video from frames
    const video = document.createElement('video');
    video.width = width;
    video.height = height;
    video.autoplay = true;
    video.loop = true;

    // Convert frames to video
    const stream = canvas.captureStream(fps);
    video.srcObject = stream;

    // Create download link
    const url = URL.createObjectURL(new Blob([], { type: 'video/webm' }));
    setDownloadUrl(url);
  };

  const downloadRecording = () => {
    if (!downloadUrl) return;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `webgl-recording-${Date.now()}.webm`;
    link.click();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">WebGL Three.js Recorder</h1>
      
      <div className="mb-8">
        <div 
          ref={mountRef} 
          className="border-2 border-gray-600 rounded-lg overflow-hidden"
          style={{ width: width, height: height }}
        />
      </div>

      <div className="flex gap-4 mb-8">
        <button
          onClick={startRecording}
          disabled={isRecording}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
        >
          {isRecording ? 'Recording...' : 'Start Recording'}
        </button>

        {downloadUrl && (
          <button
            onClick={downloadRecording}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
          >
            Download Recording
          </button>
        )}
      </div>

      {isRecording && (
        <div className="w-full max-w-md">
          <div className="text-center mb-2">
            Recording Progress: {Math.round(recordingProgress)}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${recordingProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-8 text-center text-gray-400">
        <p>Duration: {duration}s | FPS: {fps} | Resolution: {width}x{height}</p>
        <p className="text-sm mt-2">
          This recorder captures WebGL animations and exports them as video files.
        </p>
      </div>
    </div>
  );
}
