'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '../../../lib/utils';

interface DotPatternProps {
  className?: string;
  width?: number;
  height?: number;
  gap?: number;
  radius?: number;
  color?: string;
  rows?: number;
  columns?: number;
}

export function DotPattern({
  className,
  width = 20,
  height = 20,
  gap = 0,
  radius = 1,
  color = 'currentColor',
  rows,
  columns,
}: DotPatternProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const calcSize = () => {
      const container = canvas.parentElement;
      if (!container)
        return { width: window.innerWidth, height: window.innerHeight };

      return {
        width: container.clientWidth,
        height: container.clientHeight,
      };
    };

    const drawPattern = () => {
      const { width: canvasWidth, height: canvasHeight } = calcSize();

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      const actualRows = rows || Math.ceil(canvasHeight / (height + gap));
      const actualColumns = columns || Math.ceil(canvasWidth / (width + gap));

      // Center the pattern
      const startX = (canvasWidth - (actualColumns * (width + gap) - gap)) / 2;
      const startY = (canvasHeight - (actualRows * (height + gap) - gap)) / 2;

      ctx.fillStyle = color;

      for (let row = 0; row < actualRows; row++) {
        for (let col = 0; col < actualColumns; col++) {
          const x = startX + col * (width + gap) + width / 2;
          const y = startY + row * (height + gap) + height / 2;

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    // Initial draw
    drawPattern();

    // Redraw on resize
    const handleResize = () => {
      drawPattern();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [width, height, gap, radius, color, rows, columns]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('w-full h-full', className)}
      style={{ display: 'block' }}
    />
  );
}
