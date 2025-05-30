'use client';

import React from 'react';
import { cn } from '../../../lib/utils';

interface AnimatedShinyTextProps {
  children: React.ReactNode;
  className?: string;
  shimmerWidth?: number;
}

export function AnimatedShinyText({
  children,
  className,
  shimmerWidth = 100,
}: AnimatedShinyTextProps) {
  return (
    <div className={cn('relative overflow-hidden inline-block', className)}>
      <span className="relative z-10">{children}</span>
      <div
        className="absolute inset-0 w-full z-5 animate-shimmer"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)`,
          transform: 'translateX(-100%)',
          backgroundSize: `${shimmerWidth}% 100%`,
          backgroundRepeat: 'no-repeat',
        }}
      />
    </div>
  );
}
