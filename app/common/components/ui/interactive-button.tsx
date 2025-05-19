'use client';

import React, { useState, useRef } from 'react';
import { cn } from '../../../lib/utils';

interface InteractiveButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  text?: string;
  children?: React.ReactNode;
}

export const InteractiveButton = ({
  className,
  text = 'Button',
  children,
  ...props
}: InteractiveButtonProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    setPosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  return (
    <button
      ref={buttonRef}
      className={cn(
        'relative inline-flex h-12 overflow-hidden rounded-md bg-primary px-6 font-medium text-primary-foreground shadow-md transition-all duration-300 hover:scale-105',
        className
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
      {...props}
    >
      <div
        className="absolute inset-0 z-0 bg-gradient-to-tr from-primary-foreground/0 via-primary-foreground/5 to-primary-foreground/20 opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovering ? 0.15 : 0,
          transform: `translate(${position.x * 100}%, ${position.y * 100}%)`,
          background: isHovering
            ? `radial-gradient(circle at ${position.x * 100}% ${
                position.y * 100
              }%, rgba(255, 255, 255, 0.4) 0%, transparent 60%)`
            : '',
        }}
      />
      <span className="relative z-10 flex items-center justify-center">
        {children || text}
      </span>
    </button>
  );
};
