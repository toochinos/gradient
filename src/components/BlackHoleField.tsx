'use client';

import { useEffect, useRef } from 'react';

interface BlackHoleFieldProps {
  isVisible: boolean;
  isFullscreen: boolean;
}

interface Disc {
  x: number;
  y: number;
  w: number;
  h: number;
  p: number;
}

interface Particle {
  x: number;
  sx: number;
  dx: number;
  y: number;
  vy: number;
  p: number;
  r: number;
  c: string;
}

export default function BlackHoleField({ isVisible, isFullscreen }: BlackHoleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const discsRef = useRef<Disc[]>([]);
  const linesRef = useRef<Array<Array<{x: number, y: number}>>>([]);
  const particlesRef = useRef<Particle[]>([]);
  const clipRef = useRef<{disc: Disc, i: number, path: Path2D} | null>(null);
  const linesCanvasRef = useRef<OffscreenCanvas | null>(null);
  const rectRef = useRef<{width: number, height: number}>({width: 0, height: 0});
  const particleAreaRef = useRef<{sx: number, ex: number, sw: number, ew: number, h: number}>({
    sx: 0, ex: 0, sw: 0, ew: 0, h: 0
  });

  // Easing functions
  const easeInExpo = (t: number): number => {
    return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
  };

  const linear = (t: number): number => t;

  useEffect(() => {
    if (!isVisible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setSize = () => {
      const container = canvas.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        rectRef.current = { width: rect.width, height: rect.height };

        const dpi = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpi;
        canvas.height = rect.height * dpi;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        ctx.scale(dpi, dpi);
      }
    };

    // Tween value with easing
    const tweenValue = (start: number, end: number, p: number, ease?: string): number => {
      const delta = end - start;
      const easeFn = ease === 'inExpo' ? easeInExpo : linear;
      return start + delta * easeFn(p);
    };

    // Tween disc
    const tweenDisc = (disc: Disc, startDisc: Disc, endDisc: Disc): Disc => {
      disc.x = tweenValue(startDisc.x, endDisc.x, disc.p);
      disc.y = tweenValue(startDisc.y, endDisc.y, disc.p, 'inExpo');
      disc.w = tweenValue(startDisc.w, endDisc.w, disc.p);
      disc.h = tweenValue(startDisc.h, endDisc.h, disc.p);
      return disc;
    };

    // Set discs
    const setDiscs = () => {
      const { width, height } = rectRef.current;

      discsRef.current = [];

      const startDisc = {
        x: width * 0.5,
        y: height * 0.45,
        w: width * 0.75,
        h: height * 0.7,
        p: 0
      };

      const endDisc = {
        x: width * 0.5,
        y: height * 0.95,
        w: 0,
        h: 0,
        p: 1
      };

      const totalDiscs = isFullscreen ? 120 : 100;
      let prevBottom = height;
      clipRef.current = null;

      for (let i = 0; i < totalDiscs; i++) {
        const p = i / totalDiscs;
        const disc = { x: 0, y: 0, w: 0, h: 0, p };
        tweenDisc(disc, startDisc, endDisc);

        const bottom = disc.y + disc.h;

        if (bottom <= prevBottom && !clipRef.current) {
          clipRef.current = {
            disc: { ...disc },
            i,
            path: new Path2D()
          };
        }

        prevBottom = bottom;
        discsRef.current.push(disc);
      }

      if (clipRef.current) {
        clipRef.current.path.ellipse(
          clipRef.current.disc.x,
          clipRef.current.disc.y,
          clipRef.current.disc.w,
          clipRef.current.disc.h,
          0,
          0,
          Math.PI * 2
        );
        clipRef.current.path.rect(
          clipRef.current.disc.x - clipRef.current.disc.w,
          0,
          clipRef.current.disc.w * 2,
          clipRef.current.disc.y
        );
      }
    };

    // Set lines
    const setLines = () => {
      const { width, height } = rectRef.current;

      linesRef.current = [];

      const totalLines = isFullscreen ? 120 : 100;
      const linesAngle = (Math.PI * 2) / totalLines;

      for (let i = 0; i < totalLines; i++) {
        linesRef.current.push([]);
      }

      discsRef.current.forEach((disc) => {
        for (let i = 0; i < totalLines; i++) {
          const angle = i * linesAngle;
          const p = {
            x: disc.x + Math.cos(angle) * disc.w,
            y: disc.y + Math.sin(angle) * disc.h
          };
          linesRef.current[i].push(p);
        }
      });

      // Create offscreen canvas for lines
      linesCanvasRef.current = new OffscreenCanvas(width, height);
      const linesCtx = linesCanvasRef.current.getContext('2d');
      if (!linesCtx || !clipRef.current) return;

      linesRef.current.forEach((line) => {
        linesCtx.save();
        let lineIsIn = false;

        line.forEach((p1, j) => {
          if (j === 0) return;

          const p0 = line[j - 1];

          if (!lineIsIn && clipRef.current &&
              (linesCtx.isPointInPath(clipRef.current.path, p1.x, p1.y) ||
               linesCtx.isPointInStroke(clipRef.current.path, p1.x, p1.y))) {
            lineIsIn = true;
          } else if (lineIsIn && clipRef.current) {
            linesCtx.clip(clipRef.current.path);
          }

          linesCtx.beginPath();
          linesCtx.moveTo(p0.x, p0.y);
          linesCtx.lineTo(p1.x, p1.y);
          linesCtx.strokeStyle = '#444';
          linesCtx.lineWidth = 2;
          linesCtx.stroke();
          linesCtx.closePath();
        });

        linesCtx.restore();
      });
    };

    // Initialize particle
    const initParticle = (start = false): Particle => {
      const { sx, sw, ex, ew, h } = particleAreaRef.current;
      const particleSx = sx + sw * Math.random();
      const particleEx = ex + ew * Math.random();
      const dx = particleEx - particleSx;
      const y = start ? h * Math.random() : h;
      const r = 0.5 + Math.random() * 4;
      const vy = 0.5 + Math.random();

      return {
        x: particleSx,
        sx: particleSx,
        dx,
        y,
        vy,
        p: 0,
        r,
        c: `rgba(255, 255, 255, ${Math.random()})`
      };
    };

    // Set particles
    const setParticles = () => {
      const { width, height } = rectRef.current;

      particlesRef.current = [];

      if (clipRef.current) {
        particleAreaRef.current = {
          sw: clipRef.current.disc.w * 0.5,
          ew: clipRef.current.disc.w * 2,
          h: height * 0.85,
          sx: 0,
          ex: 0
        };
        particleAreaRef.current.sx = (width - particleAreaRef.current.sw) / 2;
        particleAreaRef.current.ex = (width - particleAreaRef.current.ew) / 2;
      }

      const totalParticles = isFullscreen ? 150 : 100;

      for (let i = 0; i < totalParticles; i++) {
        const particle = initParticle(true);
        particlesRef.current.push(particle);
      }
    };

    // Initialize everything
    const init = () => {
      setSize();
      setDiscs();
      setLines();
      setParticles();
    };

    init();

    // Animation functions
    const moveDiscs = () => {
      const startDisc = {
        x: rectRef.current.width * 0.5,
        y: rectRef.current.height * 0.45,
        w: rectRef.current.width * 0.75,
        h: rectRef.current.height * 0.7,
        p: 0
      };

      const endDisc = {
        x: rectRef.current.width * 0.5,
        y: rectRef.current.height * 0.95,
        w: 0,
        h: 0,
        p: 1
      };

      discsRef.current.forEach((disc) => {
        disc.p = (disc.p + 0.001) % 1;
        tweenDisc(disc, startDisc, endDisc);
      });
    };

    const moveParticles = () => {
      particlesRef.current.forEach((particle) => {
        particle.p = 1 - particle.y / particleAreaRef.current.h;
        particle.x = particle.sx + particle.dx * particle.p;
        particle.y -= particle.vy;

        if (particle.y < 0) {
          const newParticle = initParticle();
          particle.y = newParticle.y;
        }
      });
    };

    const drawDiscs = () => {
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 2;

      // Outer disc
      const { width, height } = rectRef.current;
      const outerDisc = {
        x: width * 0.5,
        y: height * 0.45,
        w: width * 0.75,
        h: height * 0.7
      };

      ctx.beginPath();
      ctx.ellipse(outerDisc.x, outerDisc.y, outerDisc.w, outerDisc.h, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();

      // Inner discs
      discsRef.current.forEach((disc, i) => {
        if (i % 5 !== 0) return;

        if (clipRef.current && disc.w < clipRef.current.disc.w - 5) {
          ctx.save();
          ctx.clip(clipRef.current.path);
        }

        ctx.beginPath();
        ctx.ellipse(disc.x, disc.y, disc.w, disc.h, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();

        if (clipRef.current && disc.w < clipRef.current.disc.w - 5) {
          ctx.restore();
        }
      });
    };

    const drawLines = () => {
      if (linesCanvasRef.current) {
        ctx.drawImage(linesCanvasRef.current, 0, 0);
      }
    };

    const drawParticles = () => {
      if (!clipRef.current) return;

      ctx.save();
      ctx.clip(clipRef.current.path);

      particlesRef.current.forEach((particle) => {
        ctx.fillStyle = particle.c;
        ctx.beginPath();
        ctx.rect(particle.x, particle.y, particle.r, particle.r);
        ctx.closePath();
        ctx.fill();
      });

      ctx.restore();
    };

    // Main animation loop
    const tick = () => {
      if (!isVisible) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      moveDiscs();
      moveParticles();

      drawDiscs();
      drawLines();
      drawParticles();

      animationRef.current = requestAnimationFrame(tick);
    };

    tick();

    // Handle resize
    const handleResize = () => {
      init();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, isFullscreen]);

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
}