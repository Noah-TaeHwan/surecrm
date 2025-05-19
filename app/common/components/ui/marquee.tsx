'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../../lib/utils';

interface MarqueeProps {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  vertical?: boolean;
  children: React.ReactNode;
  speed?: number;
}

export const Marquee = ({
  className,
  reverse = false,
  pauseOnHover = false,
  vertical = false,
  speed = 40,
  children,
}: MarqueeProps) => {
  const [duration, setDuration] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !scrollerRef.current) return;

    const calculateDuration = () => {
      if (!containerRef.current || !scrollerRef.current) return;

      const contentWidth = vertical
        ? scrollerRef.current.offsetHeight
        : scrollerRef.current.offsetWidth;

      // 픽셀 당 속도 조정 (숫자가 클수록 느려짐)
      const calculatedDuration = contentWidth / speed;
      setDuration(calculatedDuration);
    };

    calculateDuration();
    window.addEventListener('resize', calculateDuration);

    return () => {
      window.removeEventListener('resize', calculateDuration);
    };
  }, [speed, vertical, children]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex overflow-hidden',
        vertical ? 'flex-col h-full' : 'w-full',
        className
      )}
      style={
        pauseOnHover
          ? { ['--pause-on-hover' as string]: 'paused' }
          : { ['--pause-on-hover' as string]: 'running' }
      }
    >
      <div
        ref={scrollerRef}
        className={cn(
          'flex shrink-0 gap-4',
          vertical ? 'flex-col py-4' : 'px-4',
          reverse
            ? vertical
              ? 'animate-marquee-vertical-reverse'
              : 'animate-marquee-reverse'
            : vertical
            ? 'animate-marquee-vertical'
            : 'animate-marquee'
        )}
        style={{
          ['--duration' as string]: `${duration}s`,
          ['--gap' as string]: '1rem',
          animationPlayState: 'var(--pause-on-hover)',
        }}
      >
        {children}
      </div>
      <div
        className={cn(
          'flex shrink-0 gap-4',
          vertical ? 'flex-col py-4' : 'px-4',
          reverse
            ? vertical
              ? 'animate-marquee-vertical-reverse'
              : 'animate-marquee-reverse'
            : vertical
            ? 'animate-marquee-vertical'
            : 'animate-marquee'
        )}
        style={{
          ['--duration' as string]: `${duration}s`,
          ['--gap' as string]: '1rem',
          animationPlayState: 'var(--pause-on-hover)',
        }}
      >
        {children}
      </div>
    </div>
  );
};
