'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '../../../lib/utils';

interface ScrollProgressProps {
  className?: string;
  height?: number;
  color?: string;
  zIndex?: number;
  showOnMobile?: boolean;
  gradientColor?: string;
}

export function ScrollProgress({
  className,
  height = 3,
  color = 'var(--primary)',
  zIndex = 50,
  showOnMobile = true,
  gradientColor,
}: ScrollProgressProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    // Set initial progress
    handleScroll();

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Gradient style if a gradient color is provided
  const backgroundStyle = gradientColor
    ? `linear-gradient(to right, ${color}, ${gradientColor})`
    : color;

  return (
    <div
      className={cn(
        'fixed top-0 left-0 w-full transition-opacity duration-300',
        showOnMobile ? '' : 'hidden md:block',
        className
      )}
      style={{
        height: `${height}px`,
        zIndex,
      }}
    >
      <div
        className="h-full"
        style={{
          width: `${scrollProgress}%`,
          background: backgroundStyle,
          borderTopRightRadius: '2px',
          borderBottomRightRadius: '2px',
          transition: 'width 0.1s ease-out',
        }}
      />
    </div>
  );
}
