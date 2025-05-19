'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '../../../lib/utils';

interface AuroraTextProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  blur?: number;
  speed?: number;
  size?: number;
  intensity?: number;
}

export function AuroraText({
  children,
  className,
  color = 'orange',
  blur = 40,
  speed = 15,
  size = 150,
  intensity = 0.3,
}: AuroraTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 via-cyan-300 to-sky-500',
    purple: 'from-purple-500 via-indigo-300 to-violet-500',
    pink: 'from-pink-500 via-rose-300 to-pink-500',
    orange: 'from-orange-500 via-amber-300 to-yellow-500',
    green: 'from-green-500 via-emerald-300 to-teal-500',
    red: 'from-red-500 via-rose-300 to-red-500',
  };

  const gradientClass = colorMap[color] || colorMap.orange;

  useEffect(() => {
    // Add aurora animation keyframes to the document if not already present
    if (!document.querySelector('#aurora-keyframes')) {
      const style = document.createElement('style');
      style.id = 'aurora-keyframes';
      style.textContent = `
        @keyframes aurora {
          0% {
            transform: rotate(0deg) scale(0.7);
          }
          100% {
            transform: rotate(360deg) scale(1.3);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <span ref={containerRef} className={cn('relative inline-block', className)}>
      <span className="relative z-10">{children}</span>
      <span
        className={cn(
          'absolute inset-0 -z-10 bg-gradient-to-r blur opacity-70',
          gradientClass
        )}
        style={{
          filter: `blur(${blur}px)`,
          animation: `aurora ${speed}s linear infinite`,
          opacity: intensity,
          animationDirection: 'alternate',
        }}
      />
    </span>
  );
}
