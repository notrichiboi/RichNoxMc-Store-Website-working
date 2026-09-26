'use client';

import React, { useEffect, useRef } from 'react';

export type ParticleType = 'portal' | 'embers' | 'stars' | 'snow' | 'fireflies' | 'glyphs';

interface ParticleCanvasProps {
  type?: ParticleType;
  amount?: number;
  speed?: number;
  opacity?: number;
  size?: number;
  color?: string;
  className?: string;
}

const GLYPH_CHARS = ['ᔑ', 'ʖ', 'ᓵ', '↸', 'ᒷ', 'Ϙ', 'ᓭ', 'ℸ', '⚚', '✦', '✧', '◈', 'ᑑ', 'ᘜ', 'ᒲ', 'ᓖ'];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  opacity: number;
  baseOpacity: number;
  color: string;
  angle: number;
  vAngle: number;
  wobble: number;
  wobbleSpeed: number;
  char?: string;
  life: number;
  maxLife: number;
}

export function ParticleCanvas({
  type = 'portal',
  amount = 40,
  speed = 1,
  opacity = 0.7,
  size = 3,
  color,
  className = 'absolute inset-0 w-full h-full pointer-events-none',
}: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;

    // Handle high DPI
    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect() || canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      
      const width = rect.width || window.innerWidth;
      const height = rect.height || window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const onVisibilityChange = () => {
      isVisible = document.visibilityState !== 'hidden';
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Particle palette configurations
    const getColorsForType = (particleType: ParticleType): string[] => {
      if (color) return [color];
      switch (particleType) {
        case 'embers':
          return ['#ff5722', '#ff9800', '#ffb300', '#f44336', '#ffeb3b'];
        case 'portal':
          return ['#cc33ff', '#9933ff', '#d946ef', '#a855f7', '#7c3aed'];
        case 'stars':
          return ['#ffffff', '#e0e7ff', '#c7d2fe', '#a5f3fc', '#f3e8ff'];
        case 'snow':
          return ['#ffffff', '#f1f5f9', '#e2e8f0', '#bae6fd', '#e0f2fe'];
        case 'fireflies':
          return ['#a3e635', '#facc15', '#4ade80', '#eab308'];
        case 'glyphs':
          return ['#c084fc', '#d8b4fe', '#a855f7', '#818cf8', '#e9d5ff'];
        default:
          return ['#cc33ff', '#9933ff', '#a855f7'];
      }
    };

    const colors = getColorsForType(type);

    const getWidth = () => (canvas.parentElement?.clientWidth || window.innerWidth);
    const getHeight = () => (canvas.parentElement?.clientHeight || window.innerHeight);

    // Initialize particles
    const effectiveAmount = Math.max(10, Math.min(amount, 120));
    const particles: Particle[] = [];

    const createParticle = (spawnOnEdges: boolean = false): Particle => {
      const w = getWidth();
      const h = getHeight();
      const chosenColor = colors[Math.floor(Math.random() * colors.length)];
      const baseSz = (Math.random() * 2 + 1) * (size / 3);
      const baseOp = (Math.random() * 0.4 + 0.3) * (opacity);
      const chosenChar = GLYPH_CHARS[Math.floor(Math.random() * GLYPH_CHARS.length)];

      let startX = Math.random() * w;
      let startY = Math.random() * h;
      let vx = 0;
      let vy = 0;

      if (spawnOnEdges) {
        if (type === 'snow') {
          startY = -10;
          startX = Math.random() * w;
        } else if (type === 'embers' || type === 'portal' || type === 'glyphs') {
          startY = h + 10;
          startX = Math.random() * w;
        }
      }

      const spd = speed * 0.8;

      switch (type) {
        case 'embers':
          vx = (Math.random() - 0.5) * 0.8 * spd;
          vy = -(Math.random() * 1.5 + 0.8) * spd;
          break;
        case 'portal':
          vx = (Math.random() - 0.5) * 0.6 * spd;
          vy = -(Math.random() * 1.0 + 0.4) * spd;
          break;
        case 'snow':
          vx = (Math.random() - 0.5) * 0.5 * spd;
          vy = (Math.random() * 1.2 + 0.6) * spd;
          break;
        case 'fireflies':
          vx = (Math.random() - 0.5) * 0.7 * spd;
          vy = (Math.random() - 0.5) * 0.7 * spd;
          break;
        case 'glyphs':
          vx = (Math.random() - 0.5) * 0.4 * spd;
          vy = -(Math.random() * 0.8 + 0.3) * spd;
          break;
        case 'stars':
        default:
          vx = (Math.random() - 0.5) * 0.25 * spd;
          vy = (Math.random() - 0.5) * 0.25 * spd;
          break;
      }

      return {
        x: startX,
        y: startY,
        vx,
        vy,
        size: baseSz,
        baseSize: baseSz,
        opacity: baseOp,
        baseOpacity: baseOp,
        color: chosenColor,
        angle: Math.random() * Math.PI * 2,
        vAngle: (Math.random() - 0.5) * 0.04,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.03 + 0.01,
        char: chosenChar,
        life: 0,
        maxLife: Math.random() * 300 + 200,
      };
    };

    for (let i = 0; i < effectiveAmount; i++) {
      particles.push(createParticle(false));
    }

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.66, 2.5); // normalization factor ~60fps
      lastTime = time;

      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const w = getWidth();
      const h = getHeight();

      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life += dt;

        // Position update with wobble/sway
        p.wobble += p.wobbleSpeed * dt;
        p.angle += p.vAngle * dt;

        let curVx = p.vx;
        let curVy = p.vy;

        if (type === 'portal' || type === 'embers') {
          curVx += Math.sin(p.wobble) * 0.4 * speed;
        } else if (type === 'snow') {
          curVx += Math.cos(p.wobble) * 0.3 * speed;
        } else if (type === 'fireflies') {
          curVx += Math.sin(p.wobble) * 0.5 * speed;
          curVy += Math.cos(p.wobble * 0.8) * 0.5 * speed;
        }

        p.x += curVx * dt;
        p.y += curVy * dt;

        // Life cycle opacity fade
        const lifeFraction = p.life / p.maxLife;
        let currentAlpha = p.baseOpacity;

        if (type === 'embers') {
          // Embers shrink and fade as they rise
          currentAlpha = p.baseOpacity * (1 - lifeFraction);
          p.size = Math.max(0.8, p.baseSize * (1 - lifeFraction * 0.6));
        } else if (type === 'stars') {
          // Twinkle pulse
          currentAlpha = p.baseOpacity * (0.4 + 0.6 * Math.sin(p.wobble * 2));
        } else if (type === 'fireflies') {
          // Firefly glowing pulse
          currentAlpha = p.baseOpacity * (0.3 + 0.7 * Math.abs(Math.sin(p.wobble * 1.5)));
        } else if (type === 'glyphs' || type === 'portal') {
          currentAlpha = p.baseOpacity * (0.6 + 0.4 * Math.sin(p.wobble));
        }

        // Draw particle based on type
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(currentAlpha, 1));

        if (type === 'glyphs' && p.char) {
          // Render enchanting table rune
          ctx.font = `${Math.round(p.size * 3.5 + 8)}px monospace`;
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.fillText(p.char, p.x, p.y);
        } else if (type === 'embers') {
          // Minecraft square embers
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2);
        } else if (type === 'snow') {
          // Minecraft pixel snowflakes
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
        } else if (type === 'portal') {
          // Diamond / rhombic portal motes
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2);
        } else if (type === 'fireflies') {
          // Glowing soft orbs with ambient halo
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
          gradient.addColorStop(0, p.color);
          gradient.addColorStop(0.3, p.color);
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Stars: bright center + 4 point cross for larger ones
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          if (p.size > 2.2) {
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(p.x - p.size * 2.5, p.y);
            ctx.lineTo(p.x + p.size * 2.5, p.y);
            ctx.moveTo(p.x, p.y - p.size * 2.5);
            ctx.lineTo(p.x, p.y + p.size * 2.5);
            ctx.stroke();
          }
        }

        ctx.restore();

        // Respawn condition
        const isOutOfBounds =
          p.x < -40 || p.x > w + 40 || p.y < -40 || p.y > h + 40 || p.life >= p.maxLife;

        if (isOutOfBounds) {
          particles[i] = createParticle(true);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [type, amount, speed, opacity, size, color]);

  return <canvas ref={canvasRef} className={className} />;
}
