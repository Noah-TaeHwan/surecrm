'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../../lib/utils';

interface PointerProps {
  className?: string;
  color?: string;
  size?: number;
  ringSize?: number;
  duration?: number;
}

export function Pointer({
  className,
  color = 'rgba(var(--primary-rgb), 0.8)',
  size = 15,
  ringSize = 30,
  duration = 150,
}: PointerProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [isPointer, setIsPointer] = useState(false);
  const pointerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (e.target instanceof HTMLElement) {
        setIsPointer(window.getComputedStyle(e.target).cursor === 'pointer');
      }
    };

    const handleMouseEnter = () => setOpacity(1);
    const handleMouseLeave = () => setOpacity(0);

    document.addEventListener('mousemove', updatePosition);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={pointerRef}
      className={cn(
        'fixed pointer-events-none z-50 transition-opacity',
        className
      )}
      style={{
        opacity,
        left: `${position.x}px`,
        top: `${position.y}px`,
        transition: `opacity 0.2s ease, transform ${duration}ms ease`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        className="rounded-full absolute"
        style={{
          width: `${isPointer ? ringSize + 5 : ringSize}px`,
          height: `${isPointer ? ringSize + 5 : ringSize}px`,
          backgroundColor: 'transparent',
          border: `1.5px solid ${color}`,
          transform: 'translate(-50%, -50%)',
          transition: `width ${duration}ms ease, height ${duration}ms ease`,
        }}
      />
      <div
        className="rounded-full absolute"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  );
}
