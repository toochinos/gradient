'use client';

import { useEffect, useRef } from 'react';

interface CreaturesFieldProps {
  isVisible: boolean;
  isFullscreen: boolean;
}

// Simple animation utilities (replacing anime.js functionality)
class AnimationUtils {
  static lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * factor;
  }

  static easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  static easeInQuad(t: number): number {
    return t * t;
  }

  static stagger(values: [number, number], options: { grid: [number, number], from: string, ease?: string }): number[] {
    const [rows, cols] = options.grid;
    const [min, max] = values;
    const centerRow = Math.floor(rows / 2);
    const centerCol = Math.floor(cols / 2);
    const results: number[] = [];

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const distanceFromCenter = Math.sqrt(
          Math.pow(i - centerRow, 2) + Math.pow(j - centerCol, 2)
        );
        const maxDistance = Math.sqrt(Math.pow(centerRow, 2) + Math.pow(centerCol, 2));
        const normalizedDistance = distanceFromCenter / maxDistance;
        const value = min + (max - min) * normalizedDistance;
        results.push(value);
      }
    }
    return results;
  }
}

interface Particle {
  element: HTMLDivElement;
  baseScale: number;
  baseOpacity: number;
  baseDelay: number;
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  animationSpeed: number;
}

export default function CreaturesField({ isVisible, isFullscreen }: CreaturesFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const creatureRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const cursorRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const autoMoveRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const isManualMoveRef = useRef<boolean>(false);
  const manualTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    const container = containerRef.current;
    const creature = document.createElement('div');
    creature.className = 'creature';
    creatureRef.current = creature;
    container.appendChild(creature);

    const rows = isFullscreen ? 15 : 13;
    const particleCount = rows * rows;
    const viewport = {
      w: container.clientWidth * 0.5,
      h: container.clientHeight * 0.5
    };

    // Generate stagger values
    const scaleStagger = AnimationUtils.stagger([2, 5], { grid: [rows, rows], from: 'center', ease: 'inQuad' });
    const opacityStagger = AnimationUtils.stagger([1, 0.1], { grid: [rows, rows], from: 'center' });
    const delayStagger = AnimationUtils.stagger([0, 200], { grid: [rows, rows], from: 'center' });

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particleEl = document.createElement('div');
      particleEl.className = 'creature-particle';

      const row = Math.floor(i / rows);
      const col = i % rows;
      const distanceFromCenter = Math.sqrt(
        Math.pow(row - Math.floor(rows / 2), 2) +
        Math.pow(col - Math.floor(rows / 2), 2)
      );
      const maxDistance = Math.sqrt(Math.pow(Math.floor(rows / 2), 2) * 2);

      // Set initial styles
      const scale = scaleStagger[i];
      const opacity = opacityStagger[i];
      const hue = 4 + (distanceFromCenter / maxDistance) * 60; // Red to orange gradient
      const lightness = 80 - (distanceFromCenter / maxDistance) * 60; // Bright center, darker edges
      const blur = 8 - (distanceFromCenter / maxDistance) * 7; // More blur at edges

      particleEl.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: hsl(${hue}, 70%, ${lightness}%);
        border-radius: 50%;
        transform: scale(${scale});
        opacity: ${opacity};
        box-shadow: 0px 0px ${blur}px 0px hsl(${hue}, 70%, ${lightness}%);
        mix-blend-mode: screen;
        will-change: transform;
        transition: transform 0.3s ease-out;
        left: ${col * 8}px;
        top: ${row * 8}px;
        z-index: ${Math.round(particleCount - i)};
      `;

      const particle: Particle = {
        element: particleEl,
        baseScale: scale,
        baseOpacity: opacity,
        baseDelay: delayStagger[i],
        currentX: 0,
        currentY: 0,
        targetX: 0,
        targetY: 0,
        animationSpeed: 0.02 + Math.random() * 0.03
      };

      particlesRef.current.push(particle);
      creature.appendChild(particleEl);
    }

    // Set container styles
    container.style.cssText = `
      position: absolute;
      inset: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      pointer-events: auto;
    `;

    creature.style.cssText = `
      position: relative;
      width: ${rows * 8}px;
      height: ${rows * 8}px;
      transform-style: preserve-3d;
    `;

    // Pulse animation
    const pulse = () => {
      particlesRef.current.forEach((particle, i) => {
        setTimeout(() => {
          particle.element.style.transform = `scale(5) translate(${particle.currentX}px, ${particle.currentY}px)`;
          particle.element.style.opacity = '1';

          setTimeout(() => {
            particle.element.style.transform = `scale(${particle.baseScale}) translate(${particle.currentX}px, ${particle.currentY}px)`;
            particle.element.style.opacity = particle.baseOpacity.toString();
          }, 150);
        }, particle.baseDelay);
      });
    };

    // Mouse follow handler
    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      cursorRef.current.x = event.clientX - rect.left - viewport.w;
      cursorRef.current.y = event.clientY - rect.top - viewport.h;

      isManualMoveRef.current = true;
      if (manualTimeoutRef.current) {
        clearTimeout(manualTimeoutRef.current);
      }
      manualTimeoutRef.current = setTimeout(() => {
        isManualMoveRef.current = false;
      }, 1500);
    };

    // Animation loop
    const animate = () => {
      if (!isVisible) return;

      autoMoveRef.current.time += 16; // ~60fps

      // Auto movement when not manually controlled
      if (!isManualMoveRef.current) {
        autoMoveRef.current.x = Math.sin(autoMoveRef.current.time * 0.0007) * viewport.w * 0.45;
        autoMoveRef.current.y = Math.cos(autoMoveRef.current.time * 0.00012) * viewport.h * 0.45;
        cursorRef.current.x = autoMoveRef.current.x;
        cursorRef.current.y = autoMoveRef.current.y;

        // Trigger pulse every few seconds
        if (autoMoveRef.current.time % 3000 < 16) {
          pulse();
        }
      }

      // Update particle positions
      particlesRef.current.forEach((particle, i) => {
        // Smooth movement towards cursor
        particle.targetX = cursorRef.current.x;
        particle.targetY = cursorRef.current.y;

        particle.currentX = AnimationUtils.lerp(
          particle.currentX,
          particle.targetX,
          particle.animationSpeed
        );
        particle.currentY = AnimationUtils.lerp(
          particle.currentY,
          particle.targetY,
          particle.animationSpeed
        );

        // Apply transform
        particle.element.style.transform = `scale(${particle.baseScale}) translate(${particle.currentX}px, ${particle.currentY}px)`;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animations
    container.addEventListener('mousemove', handleMouseMove);
    animationRef.current = requestAnimationFrame(animate);

    // Initial pulse
    setTimeout(pulse, 500);

    // Cleanup
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (manualTimeoutRef.current) {
        clearTimeout(manualTimeoutRef.current);
      }
      if (creatureRef.current && container.contains(creatureRef.current)) {
        container.removeChild(creatureRef.current);
      }
      particlesRef.current = [];
    };
  }, [isVisible, isFullscreen]);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 1 }}
    />
  );
}