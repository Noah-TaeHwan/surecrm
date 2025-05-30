'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { cn } from '../../../lib/utils';

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  opacity: number;
}

interface ParticlesProps {
  className?: string;
  quantity?: number;
  color?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
}

export function Particles({
  className,
  quantity = 50,
  color = '#ffffff',
  minSize = 1,
  maxSize = 3,
  speed = 1,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const animationFrameId = useRef<number | null>(null);
  const isAnimating = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      setDimensions({ width, height });
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
      isAnimating.current = false;
    };
  }, []);

  const initializeParticles = useCallback(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const newParticles: Particle[] = [];
    for (let i = 0; i < quantity; i++) {
      newParticles.push({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: Math.random() * (maxSize - minSize) + minSize,
        color,
        speedX: (Math.random() - 0.5) * speed,
        speedY: (Math.random() - 0.5) * speed,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }
    particlesRef.current = newParticles;
  }, [dimensions, quantity, color, minSize, maxSize, speed]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isAnimating.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isAnimating.current = true;

    const animateFrame = () => {
      if (!isAnimating.current) return;

      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      particlesRef.current = particlesRef.current.map((particle) => {
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `${particle.color}${Math.floor(particle.opacity * 255)
          .toString(16)
          .padStart(2, '0')}`;
        ctx.fill();

        // Update position
        let newX = particle.x + particle.speedX;
        let newY = particle.y + particle.speedY;

        // Bounce off edges
        if (newX < 0 || newX > dimensions.width) {
          particle.speedX *= -1;
          newX = particle.x + particle.speedX;
        }
        if (newY < 0 || newY > dimensions.height) {
          particle.speedY *= -1;
          newY = particle.y + particle.speedY;
        }

        return {
          ...particle,
          x: newX,
          y: newY,
        };
      });

      animationFrameId.current = requestAnimationFrame(animateFrame);
    };

    animateFrame();
  }, [dimensions]);

  useEffect(() => {
    initializeParticles();
  }, [initializeParticles]);

  useEffect(() => {
    if (
      particlesRef.current.length > 0 &&
      dimensions.width > 0 &&
      dimensions.height > 0
    ) {
      animate();
    }

    return () => {
      isAnimating.current = false;
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [animate, dimensions]);

  return <canvas ref={canvasRef} className={cn('w-full h-full', className)} />;
}
