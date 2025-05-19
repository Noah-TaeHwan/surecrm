'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '../../../lib/utils';

interface IconCloudProps {
  className?: string;
  icons: string[];
  randomColor?: boolean;
  colors?: string[];
  speed?: number;
  size?: number;
}

export function IconCloud({
  className,
  icons,
  randomColor = false,
  colors = ['#4f46e5', '#f97316', '#10b981', '#8b5cf6', '#f43f5e', '#0ea5e9'],
  speed = 1,
  size = 16,
}: IconCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const radius = 150;
  const depth = 2 * radius;
  const iconRefs = useRef<
    {
      word: string;
      x: number;
      y: number;
      z: number;
      color: string;
    }[]
  >([]);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    // Initialize canvas
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const setCanvasSize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Generate random positions for icons
    iconRefs.current = icons.map((word) => {
      const alpha = Math.acos(2 * Math.random() - 1) - Math.PI / 2;
      const beta = 2 * Math.PI * Math.random();
      const color = randomColor
        ? colors[Math.floor(Math.random() * colors.length)]
        : '#ccc';

      return {
        word,
        x: radius * Math.cos(alpha) * Math.cos(beta),
        y: radius * Math.cos(alpha) * Math.sin(beta),
        z: radius * Math.sin(alpha),
        color,
      };
    });

    let animationFrameId: number;
    let mouseX = 0;
    let mouseY = 0;
    let defaultRotation = true;

    // Mouse movement handling
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left - canvas.width / 2;
      mouseY = e.clientY - rect.top - canvas.height / 2;
      defaultRotation = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', () => {
      defaultRotation = true;
    });

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate rotation based on mouse position or use default rotation
      const rotationX = defaultRotation
        ? Date.now() * 0.0001 * speed
        : mouseY * 0.00008 * speed;
      const rotationY = defaultRotation
        ? Date.now() * 0.0001 * speed
        : mouseX * 0.00008 * speed;

      // Update positions
      iconRefs.current.forEach((icon) => {
        // Apply rotation - simple 3D matrix rotation around X and Y
        const x = icon.x;
        const y = icon.y * Math.cos(rotationX) - icon.z * Math.sin(rotationX);
        const z = icon.y * Math.sin(rotationX) + icon.z * Math.cos(rotationX);

        const newX = x * Math.cos(rotationY) + z * Math.sin(rotationY);
        const newY = y;
        const newZ = -x * Math.sin(rotationY) + z * Math.cos(rotationY);

        // Calculate size and opacity based on z-position
        const scale = (depth + newZ) / (2 * depth);

        // Draw only if in front of the canvas
        if (newZ > -radius) {
          ctx.font = `${Math.floor(size * scale)}px Arial`;
          ctx.fillStyle = icon.color;
          ctx.globalAlpha = 0.4 + 0.6 * scale;

          // Center text on canvas with adjusted position
          const textWidth = ctx.measureText(icon.word).width;
          ctx.fillText(
            icon.word,
            canvas.width / 2 + newX - textWidth / 2,
            canvas.height / 2 + newY
          );
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [icons, colors, randomColor, speed, size]);

  return (
    <div ref={containerRef} className={cn('relative w-full h-32', className)}>
      <canvas ref={canvasRef} className="w-full h-full cursor-pointer" />
    </div>
  );
}
