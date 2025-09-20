'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface StarFieldProps {
  isVisible: boolean;
  className?: string;
  isFullscreen?: boolean;
}

const StarField: React.FC<StarFieldProps> = ({ isVisible, className = '', isFullscreen = false }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const starsRef = useRef<THREE.Points>();
  const animationIdRef = useRef<number>();

  useEffect(() => {
    if (!mountRef.current || !isVisible) return;

    console.log('StarField initializing:', { isVisible, isFullscreen });

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

    // Create star field
    const starGeometry = new THREE.BufferGeometry();
    const starCount = isFullscreen ? 2000 : 1000; // More stars in fullscreen
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      // Random positions
      positions[i * 3] = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;

      // Random colors (white to blue)
      const color = new THREE.Color();
      color.setHSL(0.6, 0.1, Math.random() * 0.5 + 0.5);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Random sizes
      sizes[i] = Math.random() * 3 + 1;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Star material with enhanced settings for fullscreen
    const starMaterial = new THREE.PointsMaterial({
      size: isFullscreen ? 3 : 2,
      vertexColors: true,
      transparent: true,
      opacity: isFullscreen ? 0.9 : 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    starsRef.current = stars;

    // Camera position
    camera.position.z = 100;

    // Animation loop
    const animate = () => {
      if (!isVisible) return;
      
      animationIdRef.current = requestAnimationFrame(animate);
      
      if (starsRef.current) {
        // Enhanced rotation for fullscreen mode
        const rotationSpeed = isFullscreen ? 0.005 : 0.001;
        const rotationSpeedY = isFullscreen ? 0.007 : 0.002;
        const rotationSpeedZ = isFullscreen ? 0.003 : 0.001;
        
        starsRef.current.rotation.x += rotationSpeed;
        starsRef.current.rotation.y += rotationSpeedY;
        starsRef.current.rotation.z += rotationSpeedZ;
        
        // Move stars towards camera for parallax effect
        const positions = starsRef.current.geometry.attributes.position.array as Float32Array;
        const moveSpeed = isFullscreen ? 5 : 2; // Much faster movement in fullscreen
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 2] += moveSpeed; // Move towards camera
          if (positions[i + 2] > 1000) {
            positions[i + 2] = -1000; // Reset when too close
          }
        }
        starsRef.current.geometry.attributes.position.needsUpdate = true;
        
        // Add pulsing effect in fullscreen mode
        if (isFullscreen) {
          const time = Date.now() * 0.001;
          starsRef.current.scale.setScalar(1 + Math.sin(time) * 0.1);
        } else {
          starsRef.current.scale.setScalar(1);
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

export default StarField;
