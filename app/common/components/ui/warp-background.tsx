'use client';

import { motion } from 'motion/react';
import { cn } from '~/lib/utils';

interface WarpBackgroundProps {
  className?: string;
  fill?: string;
  speed?: number;
  xOffset?: number;
  yOffset?: number;
}

export function WarpBackground({
  className,
  fill = 'currentColor',
  speed = 10,
  xOffset = 0,
  yOffset = 0,
}: WarpBackgroundProps) {
  return (
    <div className={cn('absolute inset-0 -z-10 overflow-hidden', className)}>
      <div className="relative size-full">
        <motion.svg
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
          className="absolute inset-0 size-full opacity-10"
          style={{
            filter: 'blur(50px)',
            transform: `translateX(${xOffset}px) translateY(${yOffset}px)`,
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: speed,
            ease: 'linear',
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        >
          <defs>
            <radialGradient
              id="warpBackgroundGradient"
              cx="50%"
              cy="50%"
              r="50%"
              fx="50%"
              fy="50%"
            >
              <stop offset="0%" style={{ stopColor: fill, stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: fill, stopOpacity: 0 }} />
            </radialGradient>
          </defs>
          <motion.circle
            cx="50"
            cy="50"
            r="50"
            fill="url(#warpBackgroundGradient)"
            animate={{
              r: ['35%', '50%'],
              cx: ['35%', '65%'],
              cy: ['35%', '65%'],
            }}
            transition={{
              duration: speed * 1.2,
              ease: 'easeInOut',
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
          <motion.circle
            cx="50"
            cy="50"
            r="50"
            fill="url(#warpBackgroundGradient)"
            animate={{
              r: ['45%', '30%'],
              cx: ['65%', '35%'],
              cy: ['45%', '55%'],
            }}
            transition={{
              duration: speed,
              ease: 'easeInOut',
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
          <motion.circle
            cx="50"
            cy="50"
            r="50"
            fill="url(#warpBackgroundGradient)"
            animate={{
              r: ['25%', '40%'],
              cx: ['45%', '55%'],
              cy: ['65%', '35%'],
            }}
            transition={{
              duration: speed * 0.8,
              ease: 'easeInOut',
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        </motion.svg>
      </div>
    </div>
  );
}
