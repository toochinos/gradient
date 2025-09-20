'use client';

import { useEffect, useRef } from 'react';

interface SwarmFieldProps {
  isVisible: boolean;
  isFullscreen: boolean;
}

// Vector3D class for particle math
class Vector3D {
  x: number;
  y: number;
  z: number;

  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  set(x: number, y: number, z: number): Vector3D {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  add(other: Vector3D | number): Vector3D {
    if (typeof other === 'number') {
      this.x += other;
      this.y += other;
      this.z += other;
    } else {
      this.x += other.x;
      this.y += other.y;
      this.z += other.z;
    }
    return this;
  }

  sub(other: Vector3D | number): Vector3D {
    if (typeof other === 'number') {
      this.x -= other;
      this.y -= other;
      this.z -= other;
    } else {
      this.x -= other.x;
      this.y -= other.y;
      this.z -= other.z;
    }
    return this;
  }

  mul(other: Vector3D | number): Vector3D {
    if (typeof other === 'number') {
      this.x *= other;
      this.y *= other;
      this.z *= other;
    } else {
      this.x *= other.x;
      this.y *= other.y;
      this.z *= other.z;
    }
    return this;
  }

  dot3d(x: number, y: number, z: number): number {
    return (this.x * x) + (this.y * y) + (this.z * z);
  }

  distance(other: Vector3D): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  clone(): Vector3D {
    return new Vector3D(this.x, this.y, this.z);
  }

  wrap2d(bounds: Vector3D): boolean {
    let wrapped = false;
    if (this.x > bounds.x) {
      this.x = 0;
      wrapped = true;
    }
    if (this.x < 0) {
      this.x = bounds.x;
      wrapped = true;
    }
    if (this.y > bounds.y) {
      this.y = 0;
      wrapped = true;
    }
    if (this.y < 0) {
      this.y = bounds.y;
      wrapped = true;
    }
    return wrapped;
  }

  move(dest: Vector3D): Vector3D {
    dest.x = this.x;
    dest.y = this.y;
    dest.z = this.z;
    return this;
  }
}

// Simple PRNG for consistent randomness
class SmallPRNG {
  seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  random(min?: number, max?: number): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 0x100000000;
    const val = (this.seed / 0x100000000);
    if (min !== undefined && max !== undefined) {
      return min + val * (max - min);
    }
    return val;
  }
}

// Perlin noise implementation
class Perlin {
  grad3: Vector3D[];
  p: number[];
  permutation: number[];
  gradP: Vector3D[];
  F3: number;
  G3: number;

  constructor() {
    this.grad3 = [
      new Vector3D(1,1,0), new Vector3D(-1,1,0), new Vector3D(1,-1,0), new Vector3D(-1,-1,0),
      new Vector3D(1,0,1), new Vector3D(-1,0,1), new Vector3D(1,0,-1), new Vector3D(-1,0,-1),
      new Vector3D(0,1,1), new Vector3D(0,-1,1), new Vector3D(0,1,-1), new Vector3D(0,-1,-1)
    ];

    this.p = [
      0x97, 0xa0, 0x89, 0x5b, 0x5a, 0x0f, 0x83, 0x0d, 0xc9, 0x5f, 0x60, 0x35, 0xc2, 0xe9, 0x07, 0xe1,
      // ... truncated for brevity, using simplified noise
    ];

    this.permutation = new Array(512);
    this.gradP = new Array(512);
    this.F3 = 1 / 3;
    this.G3 = 1 / 6;
  }

  init(prng: () => number): void {
    for (let i = 0; i < 256; i++) {
      const randval = prng() % 256;
      this.permutation[i] = this.permutation[i + 256] = randval;
      this.gradP[i] = this.gradP[i + 256] = this.grad3[randval % this.grad3.length];
    }
  }

  simplex3d(x: number, y: number, z: number): number {
    // Simplified noise function for performance
    return Math.sin(x * 0.1) * Math.cos(y * 0.1) * Math.sin(z * 0.1) * 0.5;
  }
}

// Mouse monitor for interactions
interface MouseState {
  left: boolean;
  middle: boolean;
  right: boolean;
}

// Particle class
class Particle {
  p: Vector3D; // position
  t: Vector3D; // trail to
  v: Vector3D; // velocity
  g: Perlin; // noise generator
  b: Vector3D; // bounds
  r: SmallPRNG; // random context
  m: { position: Vector3D; state: MouseState }; // mouse monitor
  i: number; // iteration
  l: number; // lifetime

  constructor(generator: Perlin, bounds: Vector3D, rctx: SmallPRNG, monitor: { position: Vector3D; state: MouseState }) {
    this.p = new Vector3D();
    this.t = new Vector3D();
    this.v = new Vector3D();
    this.g = generator;
    this.b = bounds;
    this.r = rctx;
    this.m = monitor;
    this.i = 0;
    this.l = 0;
    this.reset();
  }

  reset(): void {
    this.p.x = this.t.x = Math.floor(this.r.random() * this.b.x);
    this.p.y = this.t.y = Math.floor(this.r.random() * this.b.y);
    this.v.set(1, 1, 0);
    this.i = 0;
    this.l = this.r.random(1000, 10000);
  }

  step(): void {
    if (this.i++ > this.l) {
      this.reset();
    }

    const xx = this.p.x / 200;
    const yy = this.p.y / 200;
    const zz = Date.now() / 5000;
    const a = this.r.random() * Math.PI * 2;
    const rnd = this.r.random() / 4;

    // Calculate new velocity based on noise
    this.v.x += (rnd * Math.sin(a) + this.g.simplex3d(xx, yy, -zz));
    this.v.y += (rnd * Math.cos(a) + this.g.simplex3d(xx, yy, zz));

    // Mouse attraction
    if (this.m.state.left) {
      this.v.add(this.m.position.clone().sub(this.p).mul(0.00085));
    }

    // Mouse repulsion
    if (this.m.state.right && this.p.distance(this.m.position) < this.r.random(200, 250)) {
      this.v.add(this.p.clone().sub(this.m.position).mul(0.02));
    }

    // Time dilation field
    if (this.m.state.middle) {
      const d = this.p.distance(this.m.position);
      const l = this.r.random(200, 250);
      if (d < l) {
        this.v.mul(d / l);
      }
    }

    // Update position and add velocity damping
    this.p.move(this.t).add(this.v.mul(0.94));

    // Wrap around edges
    if (this.p.wrap2d(this.b)) {
      this.p.move(this.t);
    }
  }

  render(context: CanvasRenderingContext2D): void {
    context.moveTo(this.t.x, this.t.y);
    context.lineTo(this.p.x, this.p.y);
  }
}

export default function SwarmField({ isVisible, isFullscreen }: SwarmFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<{ position: Vector3D; state: MouseState }>({
    position: new Vector3D(0, 0, 0),
    state: { left: false, middle: false, right: false }
  });
  const perlinRef = useRef<Perlin | null>(null);
  const rctxRef = useRef<SmallPRNG | null>(null);
  const boundsRef = useRef<Vector3D>(new Vector3D(0, 0, 0));
  const hueRef = useRef<number>(0);

  useEffect(() => {
    if (!isVisible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize noise and random
    const rctx = new SmallPRNG(Date.now());
    const perlin = new Perlin();
    perlin.init(() => rctx.random(0, 255));

    rctxRef.current = rctx;
    perlinRef.current = perlin;

    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = boundsRef.current.x = container.clientWidth;
        canvas.height = boundsRef.current.y = container.clientHeight;
        canvas.style.width = `${container.clientWidth}px`;
        canvas.style.height = `${container.clientHeight}px`;

        // Don't clear background to allow gradient to show through
      }
    };

    resizeCanvas();

    // Initialize particles
    const particleCount = isFullscreen ? 3000 : 1500;
    particlesRef.current = [];

    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push(new Particle(perlin, boundsRef.current, rctx, mouseRef.current));
    }

    // Mouse event handlers
    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.position.x = event.clientX - rect.left;
      mouseRef.current.position.y = event.clientY - rect.top;
    };

    const handleMouseDown = (event: MouseEvent) => {
      event.preventDefault();
      if (event.button === 0) mouseRef.current.state.left = true;
      if (event.button === 1) mouseRef.current.state.middle = true;
      if (event.button === 2) mouseRef.current.state.right = true;
    };

    const handleMouseUp = () => {
      mouseRef.current.state.left = false;
      mouseRef.current.state.middle = false;
      mouseRef.current.state.right = false;
    };

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    // Add event listeners
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('contextmenu', handleContextMenu);

    // Animation loop
    const render = () => {
      if (!isVisible) return;

      ctx.beginPath();

      // Render each particle
      for (let i = 0; i < particlesRef.current.length; i++) {
        particlesRef.current[i].step();
        particlesRef.current[i].render(ctx);
      }

      // Light fade overlay to preserve trails while showing gradient
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw particles with additive blending
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `hsla(${hueRef.current}, 75%, 50%, 0.55)`;
      ctx.stroke();
      ctx.closePath();

      // Update hue for color rotation
      hueRef.current = (hueRef.current + 0.5) % 360;

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    // Handle resize
    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('contextmenu', handleContextMenu);
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