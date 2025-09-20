'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface BlobFieldProps {
  isVisible: boolean;
  className?: string;
  isFullscreen?: boolean;
}

const BlobField: React.FC<BlobFieldProps> = ({ isVisible, className = '', isFullscreen = false }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const blobRef = useRef<THREE.Mesh>();
  const animationIdRef = useRef<number>();

  useEffect(() => {
    if (!mountRef.current || !isVisible) return;

    console.log('BlobField initializing:', { isVisible, isFullscreen });

    // Clean up any existing three.js scene
    if (rendererRef.current && mountRef.current.contains(rendererRef.current.domElement)) {
      mountRef.current.removeChild(rendererRef.current.domElement);
    }
    if (rendererRef.current) {
      rendererRef.current.dispose();
    }

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    mountRef.current.appendChild(renderer.domElement);

    // Store references
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    // Create blob geometry using IcosahedronGeometry as base
    const blobGeometry = new THREE.IcosahedronGeometry(2, 3);
    
    // Create blob material with gradient colors
    const blobMaterial = new THREE.MeshPhongMaterial({
      color: 0x4a90e2,
      transparent: true,
      opacity: 0.8,
      shininess: 100,
      side: THREE.DoubleSide
    });

    // Create the blob mesh
    const blob = new THREE.Mesh(blobGeometry, blobMaterial);
    scene.add(blob);
    blobRef.current = blob;

    // Add lighting for better blob appearance
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Add point lights for more dynamic lighting
    const pointLight1 = new THREE.PointLight(0xff6b6b, 1, 100);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x4ecdc4, 1, 100);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    // Camera position
    camera.position.z = 5;

    // Animation loop
    const animate = () => {
      if (!isVisible) return;
      
      animationIdRef.current = requestAnimationFrame(animate);
      
      if (blobRef.current) {
        const time = Date.now() * 0.001;
        
        // Enhanced animation for fullscreen mode
        const rotationSpeed = isFullscreen ? 0.01 : 0.005;
        const morphSpeed = isFullscreen ? 0.02 : 0.01;
        const scaleSpeed = isFullscreen ? 0.003 : 0.001;
        
        // Rotate the blob
        blobRef.current.rotation.x += rotationSpeed;
        blobRef.current.rotation.y += rotationSpeed * 1.2;
        blobRef.current.rotation.z += rotationSpeed * 0.8;
        
        // Morph the blob by modifying vertices
        const positions = blobRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          const x = positions[i];
          const y = positions[i + 1];
          const z = positions[i + 2];
          
          // Create organic blob-like movement
          const noise1 = Math.sin(x * 2 + time * morphSpeed) * 0.3;
          const noise2 = Math.cos(y * 2 + time * morphSpeed * 1.3) * 0.3;
          const noise3 = Math.sin(z * 2 + time * morphSpeed * 0.7) * 0.3;
          
          positions[i] = x + noise1;
          positions[i + 1] = y + noise2;
          positions[i + 2] = z + noise3;
        }
        
        blobRef.current.geometry.attributes.position.needsUpdate = true;
        blobRef.current.geometry.computeVertexNormals();
        
        // Pulsing scale effect
        const scale = 1 + Math.sin(time * scaleSpeed) * 0.2;
        blobRef.current.scale.setScalar(scale);
        
        // Color animation
        const hue = (time * 0.1) % 1;
        blobRef.current.material.color.setHSL(hue, 0.7, 0.6);
        
        // Enhanced effects for fullscreen
        if (isFullscreen) {
          // More dramatic morphing
          const positions = blobRef.current.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];
            
            const noise1 = Math.sin(x * 3 + time * morphSpeed * 2) * 0.5;
            const noise2 = Math.cos(y * 3 + time * morphSpeed * 2.5) * 0.5;
            const noise3 = Math.sin(z * 3 + time * morphSpeed * 1.5) * 0.5;
            
            positions[i] = x + noise1;
            positions[i + 1] = y + noise2;
            positions[i + 2] = z + noise3;
          }
          blobRef.current.geometry.attributes.position.needsUpdate = true;
          blobRef.current.geometry.computeVertexNormals();
          
          // More dramatic pulsing
          const scale = 1 + Math.sin(time * scaleSpeed * 2) * 0.4;
          blobRef.current.scale.setScalar(scale);
        }
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isVisible, isFullscreen]);

  if (!isVisible) return null;

  return (
    <div 
      ref={mountRef} 
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 10 }}
    />
  );
};

export default BlobField;
