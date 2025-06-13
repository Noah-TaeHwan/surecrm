'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../../lib/utils';

interface RippleProps {
  className?: string;
  color?: string;
  duration?: number;
  size?: number;
}

export function Ripple({
  className,
  color = 'rgba(255, 255, 255, 0.35)',
  duration = 850,
  size = 100,
}: RippleProps) {
  const [ripples, setRipples] = useState<
    { x: number; y: number; size: number; id: number }[]
  >([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  useEffect(() => {
    // Add ripple effect keyframes to the document if not already present
    if (!document.querySelector('#ripple-keyframes')) {
      const style = document.createElement('style');
      style.id = 'ripple-keyframes';
      style.textContent = `
        @keyframes ripple-effect {
          0% {
            transform: scale(0);
            opacity: 0.5;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    if (!containerRef.current) return;

    const container = containerRef.current;

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Calculate ripple size based on container size
      const containerSize = Math.max(
        container.offsetWidth,
        container.offsetHeight
      );
      const rippleSize = size > 0 ? size : containerSize * 2;

      // Add a new ripple
      setRipples(prevRipples => [
        ...prevRipples,
        { x, y, size: rippleSize, id: nextId.current },
      ]);
      nextId.current += 1;
    };

    container.addEventListener('click', handleClick);

    return () => {
      container.removeEventListener('click', handleClick);
    };
  }, [size]);

  // Remove ripples after animation completes
  useEffect(() => {
    if (ripples.length === 0) return;

    const timeoutId = setTimeout(() => {
      setRipples(prevRipples => prevRipples.slice(1));
    }, duration);

    return () => clearTimeout(timeoutId);
  }, [ripples, duration]);

  return (
    <div
      ref={containerRef}
      className={cn('absolute inset-0 overflow-hidden', className)}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          style={{
            position: 'absolute',
            top: `${ripple.y - ripple.size / 2}px`,
            left: `${ripple.x - ripple.size / 2}px`,
            width: `${ripple.size}px`,
            height: `${ripple.size}px`,
            borderRadius: '50%',
            backgroundColor: color,
            transform: 'scale(0)',
            animation: `ripple-effect ${duration}ms ease-out`,
            pointerEvents: 'none',
          }}
        />
      ))}
    </div>
  );
}
