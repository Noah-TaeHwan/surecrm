'use client';

import { motion } from 'motion/react';
import type { ComponentPropsWithoutRef } from 'react';
import { useEffect, useId, useRef, useState } from 'react';

import { cn } from '~/lib/utils';

export interface AnimatedGridPatternProps
  extends ComponentPropsWithoutRef<'svg'> {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  strokeDasharray?: any;
  numSquares?: number;
  maxOpacity?: number;
  duration?: number;
  repeatDelay?: number;
}

export function AnimatedGridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  numSquares = 50,
  className,
  maxOpacity = 0.5,
  duration = 4,
  repeatDelay = 0.5,
  ...props
}: AnimatedGridPatternProps) {
  const id = useId();
  const containerRef = useRef(null);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [squares, setSquares] = useState(() => generateSquares(numSquares));

  function getPos() {
    if (containerDimensions.width === 0 || containerDimensions.height === 0) {
      return [0, 0];
    }
    return [
      Math.floor((Math.random() * containerDimensions.width) / width),
      Math.floor((Math.random() * containerDimensions.height) / height),
    ];
  }

  // Adjust the generateSquares function to return objects with an id, x, and y
  function generateSquares(count: number) {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      pos: getPos(),
    }));
  }

  // Function to update a single square's position
  const updateSquarePosition = (id: number) => {
    setSquares(currentSquares =>
      currentSquares.map(sq =>
        sq.id === id
          ? {
              ...sq,
              pos: getPos(),
            }
          : sq
      )
    );
  };

  // Update squares to animate in
  useEffect(() => {
    if (containerDimensions.width && containerDimensions.height) {
      setSquares(generateSquares(numSquares));
    }
  }, [containerDimensions, numSquares]);

  // Resize observer to update container dimensions with debouncing
  useEffect(() => {
    if (!containerRef.current) return;

    // Resize observer to update container dimensions with debouncing
    let resizeTimer: NodeJS.Timeout;
    const resizeObserver = new ResizeObserver(entries => {
      // 디바운싱: 100ms 후에 실행
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        try {
          for (const entry of entries) {
            if (entry.target === containerRef.current) {
              const newWidth = Math.floor(entry.contentRect.width);
              const newHeight = Math.floor(entry.contentRect.height);

              // 값이 실제로 변경되었을 때만 업데이트
              if (
                newWidth !== containerDimensions.width ||
                newHeight !== containerDimensions.height
              ) {
                setContainerDimensions({ width: newWidth, height: newHeight });
              }
            }
          }
        } catch (error) {
          console.warn('🔧 AnimatedGridPattern ResizeObserver 오류:', error);
        }
      }, 100);
    });

    try {
      resizeObserver.observe(containerRef.current);
    } catch (error) {
      console.warn(
        '🔧 AnimatedGridPattern ResizeObserver observe 실패:',
        error
      );
    }

    return () => {
      clearTimeout(resizeTimer);
      try {
        if (containerRef.current) {
          resizeObserver.unobserve(containerRef.current);
        }
        resizeObserver.disconnect();
      } catch (error) {
        console.warn(
          '🔧 AnimatedGridPattern ResizeObserver cleanup 오류:',
          error
        );
      }
    };
  }, []); // 빈 의존성 배열로 한 번만 실행

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30',
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      <svg x={x} y={y} className="overflow-visible">
        {squares.map(({ pos: [x, y], id }, index) => (
          <motion.rect
            initial={{ opacity: 0 }}
            animate={{ opacity: maxOpacity }}
            transition={{
              duration,
              repeat: 1,
              delay: index * 0.1,
              repeatType: 'reverse',
            }}
            onAnimationComplete={() => updateSquarePosition(id)}
            key={`${x}-${y}-${index}`}
            width={width - 1}
            height={height - 1}
            x={x * width + 1}
            y={y * height + 1}
            fill="currentColor"
            strokeWidth="0"
          />
        ))}
      </svg>
    </svg>
  );
}
