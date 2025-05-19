'use client';

import React, { useRef, useState } from 'react';
import { cn } from '../../../lib/utils';

interface LensProps {
  className?: string;
  children: React.ReactNode;
  size?: number;
  magnification?: number;
  borderColor?: string;
  borderWidth?: number;
}

export function Lens({
  className,
  children,
  size = 150,
  magnification = 1.6,
  borderColor = 'rgba(var(--primary-rgb), 0.3)',
  borderWidth = 1,
}: LensProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showLens, setShowLens] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPosition({ x, y });
  };

  const handleMouseEnter = () => {
    setShowLens(true);
  };

  const handleMouseLeave = () => {
    setShowLens(false);
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden group', className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative z-10 w-full h-full">{children}</div>
      <div
        className="absolute pointer-events-none z-20 rounded-full shadow-md transition-opacity duration-200"
        style={{
          opacity: showLens ? 1 : 0,
          width: `${size}px`,
          height: `${size}px`,
          top: 0,
          left: 0,
          transform: `translate(calc(${position.x}% - ${size / 2}px), calc(${
            position.y
          }% - ${size / 2}px))`,
          border: `${borderWidth}px solid ${borderColor}`,
          background: 'transparent',
          overflow: 'hidden',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: `scale(${magnification})`,
            transformOrigin: `${position.x}% ${position.y}%`,
          }}
        >
          <div className="relative w-full h-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
