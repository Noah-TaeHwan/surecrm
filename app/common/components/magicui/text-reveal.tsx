'use client';

import React, { useRef, useEffect, useState } from 'react';
import { cn } from '../../../lib/utils';

interface TextRevealProps {
  text: string;
  className?: string;
  revealDuration?: number;
  staggerDelay?: number;
  triggerOnce?: boolean;
  threshold?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export function TextReveal({
  text,
  className,
  revealDuration = 1,
  staggerDelay = 0,
  triggerOnce = true,
  threshold = 0.2,
  direction = 'up',
}: TextRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const characters = text.split('');

  useEffect(() => {
    if (!containerRef.current) return;

    // Add a keyframe animation for the reveal effect
    const styleId = 'text-reveal-animation';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes text-reveal-up {
          0% { transform: translateY(2em); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes text-reveal-down {
          0% { transform: translateY(-2em); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes text-reveal-left {
          0% { transform: translateX(2em); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes text-reveal-right {
          0% { transform: translateX(-2em); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    // Set up the intersection observer
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsRevealed(false);
        }
      });
    }, observerOptions);

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [threshold, triggerOnce]);

  // Determine which animation to use based on the direction
  const getAnimationName = () => {
    switch (direction) {
      case 'up':
        return 'text-reveal-up';
      case 'down':
        return 'text-reveal-down';
      case 'left':
        return 'text-reveal-left';
      case 'right':
        return 'text-reveal-right';
      default:
        return 'text-reveal-up';
    }
  };

  return (
    <span
      ref={containerRef}
      className={cn('inline-block overflow-hidden', className)}
      aria-label={text}
    >
      {characters.map((char, index) => (
        <span
          key={`${index}-${char}`}
          className="inline-block"
          style={{
            opacity: isRevealed ? 1 : 0,
            transform: isRevealed ? 'none' : getTransformInitial(),
            animation: isRevealed
              ? `${getAnimationName()} ${revealDuration}s forwards ${
                  index * staggerDelay
                }s`
              : 'none',
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );

  function getTransformInitial() {
    switch (direction) {
      case 'up':
        return 'translateY(2em)';
      case 'down':
        return 'translateY(-2em)';
      case 'left':
        return 'translateX(2em)';
      case 'right':
        return 'translateX(-2em)';
      default:
        return 'translateY(2em)';
    }
  }
}
