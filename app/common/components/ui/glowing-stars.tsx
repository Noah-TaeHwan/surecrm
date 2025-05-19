'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '../../../lib/utils';

interface StarSize {
  large: number;
  medium: number;
  small: number;
}

interface GlowingStarsProps {
  className?: string;
  stars?: StarSize;
  colors?: string[];
}

interface Star {
  size: 'small' | 'medium' | 'large';
  x: number;
  y: number;
  animate: string;
  color: string;
}

export function GlowingStars({
  className,
  stars = { large: 4, medium: 8, small: 15 },
  colors = ['#ffffff', '#ffcc00'],
}: GlowingStarsProps) {
  const [starsArray, setStarsArray] = useState<Star[]>([]);

  useEffect(() => {
    // Create animation keyframes
    if (!document.querySelector('#glowing-stars-keyframes')) {
      const style = document.createElement('style');
      style.id = 'glowing-stars-keyframes';
      style.textContent = `
        @keyframes pulse-star-small {
          0%, 100% { opacity: 0.3; transform: scale(0.75); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse-star-medium {
          0%, 100% { opacity: 0.5; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes pulse-star-large {
          0%, 100% { opacity: 0.7; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `;
      document.head.appendChild(style);
    }

    // Generate stars
    const generatedStars: Star[] = [];

    // Add large stars
    for (let i = 0; i < stars.large; i++) {
      generatedStars.push({
        size: 'large',
        x: Math.random() * 100,
        y: Math.random() * 100,
        animate: `pulse-star-large ${(Math.random() * 3 + 4).toFixed(
          1
        )}s ease-in-out infinite`,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Add medium stars
    for (let i = 0; i < stars.medium; i++) {
      generatedStars.push({
        size: 'medium',
        x: Math.random() * 100,
        y: Math.random() * 100,
        animate: `pulse-star-medium ${(Math.random() * 4 + 3).toFixed(
          1
        )}s ease-in-out infinite`,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Add small stars
    for (let i = 0; i < stars.small; i++) {
      generatedStars.push({
        size: 'small',
        x: Math.random() * 100,
        y: Math.random() * 100,
        animate: `pulse-star-small ${(Math.random() * 5 + 2).toFixed(
          1
        )}s ease-in-out infinite`,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    setStarsArray(generatedStars);
  }, [stars.large, stars.medium, stars.small, colors]);

  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {starsArray.map((star, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: `${star.y}%`,
            left: `${star.x}%`,
            width:
              star.size === 'large'
                ? '6px'
                : star.size === 'medium'
                ? '4px'
                : '2px',
            height:
              star.size === 'large'
                ? '6px'
                : star.size === 'medium'
                ? '4px'
                : '2px',
            backgroundColor: star.color,
            borderRadius: '50%',
            filter: `blur(${star.size === 'large' ? '1px' : '0.5px'})`,
            boxShadow: `0 0 ${
              star.size === 'large'
                ? '10px'
                : star.size === 'medium'
                ? '6px'
                : '4px'
            } ${star.color}`,
            animation: star.animate,
            opacity:
              star.size === 'large' ? 0.7 : star.size === 'medium' ? 0.5 : 0.3,
          }}
        />
      ))}
    </div>
  );
}
