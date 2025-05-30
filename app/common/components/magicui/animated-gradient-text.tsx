'use client';

import { cn } from '~/lib/utils';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

interface AnimatedGradientTextProps {
  children: React.ReactNode;
  className?: string;
  from?: string;
  via?: string;
  to?: string;
  animate?: boolean;
  duration?: number;
}

export function AnimatedGradientText({
  children,
  className,
  from = '#9E7AFF',
  via = '#FE8BBB',
  to = '#FFBE7B',
  animate = true,
  duration = 8,
}: AnimatedGradientTextProps) {
  const [backgroundSize, setBackgroundSize] = useState<string>('150%');
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <span
        className={cn('bg-clip-text text-transparent', className)}
        style={{
          backgroundImage: `linear-gradient(to right, ${from}, ${via}, ${to})`,
          backgroundSize,
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        {children}
      </span>
    );
  }

  return (
    <motion.span
      className={cn('bg-clip-text text-transparent inline-block', className)}
      style={{
        backgroundImage: `linear-gradient(to right, ${from}, ${via}, ${to})`,
        backgroundSize,
        backgroundClip: 'text',
        color: 'transparent',
      }}
      animate={
        animate
          ? {
              backgroundPosition: ['0%', '100%', '0%'],
            }
          : undefined
      }
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {children}
    </motion.span>
  );
}
