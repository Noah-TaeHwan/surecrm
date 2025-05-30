'use client';

import React, { useRef, useState, useEffect } from 'react';
import { cn } from '../../../lib/utils';

interface AnimatedBeamProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
  color?: string;
  size?: number;
  duration?: number;
  delay?: number;
  backgroundClass?: string;
}

export const AnimatedBeam = ({
  className,
  children,
  color = '#ff9500',
  size = 200,
  duration = 15,
  delay = 0,
  backgroundClass = 'bg-background',
  ...rest
}: AnimatedBeamProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [randomOffset, setRandomOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 빔 위치에 약간의 무작위성을 추가
    const intervalId = setInterval(() => {
      if (isHovered) {
        setRandomOffset({
          x: Math.random() * 40 - 20,
          y: Math.random() * 40 - 20,
        });
      }
    }, 500);

    return () => clearInterval(intervalId);
  }, [isHovered]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      {...rest}
    >
      {/* 빔 효과 */}
      <div
        className="pointer-events-none absolute -inset-px z-0 opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 0.85 : 0,
        }}
      >
        <div
          className="absolute inset-0 z-10"
          style={{
            background: `radial-gradient(circle ${size}px at ${
              mousePosition.x + randomOffset.x
            }px ${mousePosition.y + randomOffset.y}px, ${color}, transparent)`,
            transition: `opacity ${duration / 30}s ease-in-out`,
          }}
        />
      </div>

      {/* 컨텐츠 */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
