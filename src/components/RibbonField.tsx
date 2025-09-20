'use client';

import { useEffect, useRef } from 'react';

interface RibbonFieldProps {
  isVisible: boolean;
  isFullscreen: boolean;
}

interface PointInstance {
  x: number;
  y: number;
  a: number;
  dx: number;
  dy: number;
  hue: number;
  color: string;
  neighbor?: PointInstance;
  update(): void;
}

export default function RibbonField({ isVisible, isFullscreen }: RibbonFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const pointsRef = useRef<PointInstance[]>([]);
  const tickSpeedRef = useRef(10);
  const baseRef = useRef(180);
  const numPointsRef = useRef(isFullscreen ? 15 : 10);
  const maxTicksRef = useRef(3000);
  const ticksRef = useRef(0);

  useEffect(() => {
    if (!isVisible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        canvas.style.width = `${container.clientWidth}px`;
        canvas.style.height = `${container.clientHeight}px`;
        init();
      }
    };

    // Point class
    class Point {
      x: number;
      y: number;
      a: number;
      dx: number;
      dy: number;
      hue: number;
      color: string;
      neighbor?: Point;

      constructor(x?: number, y?: number, a?: number) {
        this.x = x ?? Math.random() * canvas.width;
        this.y = y ?? Math.random() * canvas.height;
        this.a = a ?? Math.random() * Math.PI;
        this.dx = Math.cos(this.a);
        this.dy = Math.sin(this.a);
        this.hue = (Math.random() * 100 + baseRef.current) % 360;
        this.color = `hsla(${this.hue}, 100%, 50%, 0.01)`;
      }

      update() {
        this.x += this.dx;
        this.y += this.dy;

        if (this.x < 0 || this.x >= canvas.width) this.dx *= -1;
        if (this.y < 0 || this.y >= canvas.height) this.dy *= -1;

        if (this.neighbor && ctx) {
          ctx.strokeStyle = this.color;
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.neighbor.x, this.neighbor.y);
          ctx.stroke();
        }
      }
    }

    const init = () => {
      pointsRef.current = [];
      baseRef.current = Math.random() * 360;
      ticksRef.current = 0;

      for (let i = 0; i < numPointsRef.current; i++) {
        pointsRef.current.push(new Point());
      }

      for (let i = 0; i < pointsRef.current.length; i++) {
        let j = i;
        while (j === i) j = Math.floor(Math.random() * pointsRef.current.length);
        pointsRef.current[i].neighbor = pointsRef.current[j];
      }
    };

    // Setup canvas
    resizeCanvas();

    // Set canvas properties
    ctx.globalCompositeOperation = 'lighter'; // Equivalent to p5.js ADD blend mode
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';

    // Clear canvas
    const clearCanvas = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    clearCanvas();

    // Animation loop
    const draw = () => {
      if (!isVisible) return;

      if (ticksRef.current > maxTicksRef.current) {
        // Reset and continue instead of stopping
        clearCanvas();
        init();
      }

      for (let n = 0; n < tickSpeedRef.current; n++) {
        for (let i = 0; i < pointsRef.current.length; i++) {
          pointsRef.current[i].update();
        }
        ticksRef.current++;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    // Handle resize
    const handleResize = () => {
      resizeCanvas();
    };

    // Handle click to reset
    const handleClick = () => {
      clearCanvas();
      init();
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('click', handleClick);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('click', handleClick);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
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