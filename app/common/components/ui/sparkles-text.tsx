'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '../../../lib/utils';

interface SparkleProps {
  size: number;
  color: string;
  style: React.CSSProperties;
}

const Sparkle = ({ size, color, style }: SparkleProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      className="absolute animate-ping"
    >
      <path
        d="M80 0C80 0 84.2846 41.2925 101.496 58.504C118.707 75.7154 160 80 160 80C160 80 118.707 84.2846 101.496 101.496C84.2846 118.707 80 160 80 160C80 160 75.7154 118.707 58.504 101.496C41.2925 84.2846 0 80 0 80C0 80 41.2925 75.7154 58.504 58.504C75.7154 41.2925 80 0 80 0Z"
        fill={color}
      />
    </svg>
  );
};

interface SparklesTextProps {
  children: React.ReactNode;
  className?: string;
  sparklesCount?: number;
  colors?: {
    first: string;
    second: string;
  };
}

export function SparklesText({
  children,
  className,
  sparklesCount = 10,
  colors = { first: '#A07CFE', second: '#FE8FB5' },
}: SparklesTextProps) {
  const [sparkles, setSparkles] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    // 화면에 표시될 별들을 생성
    const generateSparkles = () => {
      const newSparkles = [];

      for (let i = 0; i < sparklesCount; i++) {
        const size = Math.random() * 15 + 5; // 5-20px
        const left = Math.random() * 100; // 0-100%
        const top = Math.random() * 100; // 0-100%
        const color = Math.random() > 0.5 ? colors.first : colors.second;

        const style = {
          left: `${left}%`,
          top: `${top}%`,
          animationDelay: `${Math.random() * 1.5}s`,
          animationDuration: `${Math.random() * 2 + 1}s`,
          position: 'absolute' as const,
          opacity: Math.random() * 0.5 + 0.3,
        };

        newSparkles.push(
          <Sparkle key={i} size={size} color={color} style={style} />
        );
      }

      setSparkles(newSparkles);
    };

    generateSparkles();
    const intervalId = setInterval(generateSparkles, 2000);

    return () => clearInterval(intervalId);
  }, [sparklesCount, colors]);

  return (
    <div className={cn('relative inline-block font-bold', className)}>
      {sparkles}
      <span className="relative z-10">{children}</span>
    </div>
  );
}
