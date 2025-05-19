'use client';

import createGlobe from 'cobe';
import type { COBEOptions } from 'cobe';
import { MotionValue, spring } from 'motion';
import { useEffect, useRef, useState } from 'react';

import { cn } from '~/lib/utils';

const MOVEMENT_DAMPING = 1400;

const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  markerColor: [251 / 255, 100 / 255, 21 / 255],
  glowColor: [1, 1, 1],
  markers: [
    { location: [14.5995, 120.9842], size: 0.03 },
    { location: [19.076, 72.8777], size: 0.1 },
    { location: [23.8103, 90.4125], size: 0.05 },
    { location: [30.0444, 31.2357], size: 0.07 },
    { location: [39.9042, 116.4074], size: 0.08 },
    { location: [-23.5505, -46.6333], size: 0.05 },
    { location: [48.8566, 2.3522], size: 0.07 },
    { location: [34.0522, -118.2437], size: 0.08 },
    { location: [51.5074, -0.1278], size: 0.1 },
    { location: [40.7128, -74.006], size: 0.08 },
    { location: [55.7558, 37.6173], size: 0.07 },
    { location: [37.5665, 126.978], size: 0.05 },
    { location: [35.6762, 139.6503], size: 0.08 },
    { location: [41.9028, 12.4964], size: 0.05 },
    { location: [52.52, 13.405], size: 0.06 },
    { location: [55.6761, 12.5683], size: 0.04 },
  ],
};

interface GlobeProps {
  className?: string;
  globeConfig?: Partial<COBEOptions>;
  globeWidth?: number;
  globeHeight?: number;
}

export function Globe({
  className,
  globeConfig,
  globeWidth = 500,
  globeHeight = 500,
}: GlobeProps) {
  const phi = useRef(new MotionValue(0));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const fadeInAnimationRef = useRef(0);
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    try {
      const options: COBEOptions = {
        ...GLOBE_CONFIG,
        width: globeWidth,
        height: globeHeight,
        ...globeConfig,
        onRender: (state) => {
          // This is called every frame. Used to update phi.
          state.phi = phi.current.get();
          fadeInAnimationRef.current += 1;

          // Set loaded state after a few frames
          if (fadeInAnimationRef.current === 10) {
            setIsLoaded(true);
          }

          if (
            globeConfig?.onRender &&
            typeof globeConfig.onRender === 'function'
          ) {
            globeConfig.onRender(state);
          }
        },
      };

      try {
        globeRef.current = createGlobe(canvasRef.current, options);
      } catch (err) {
        console.error('Error creating globe:', err);
        setHasError(true);
      }

      // Make sure to dispose to prevent memory leaks
      return () => {
        if (globeRef.current) {
          try {
            globeRef.current.destroy();
          } catch (err) {
            console.error('Error destroying globe:', err);
          }
          globeRef.current = null;
        }
      };
    } catch (err) {
      console.error('Error in globe setup:', err);
      setHasError(true);
    }
  }, [globeWidth, globeHeight, globeConfig]);

  useEffect(() => {
    if (hasError) return;

    const currentPhi = phi.current;

    // Auto-rotation
    const rotateSphere = () => {
      if (
        !pointerInteracting.current &&
        pointerInteractionMovement.current < 5
      ) {
        currentPhi.set(currentPhi.get() + 0.005);
      }

      requestAnimationFrame(rotateSphere);
    };

    const animationFrame = requestAnimationFrame(rotateSphere);

    // Handle pointer/mouse/touch interactions
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
      pointerInteracting.current = clientX;
      pointerInteractionMovement.current = 0;
    };

    const handlePointerUp = () => {
      pointerInteracting.current = null;
      pointerInteractionMovement.current = 0;
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (pointerInteracting.current === null) return;

      const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
      const delta = (clientX - pointerInteracting.current) / MOVEMENT_DAMPING;
      pointerInteractionMovement.current += Math.abs(delta);
      currentPhi.set(currentPhi.get() + delta);
      pointerInteracting.current = clientX;
    };

    const handleTouchStart = (e: TouchEvent) => handlePointerDown(e);
    const handleTouchMove = (e: TouchEvent) => handlePointerMove(e);
    const handleTouchEnd = () => handlePointerUp();

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [hasError]);

  if (hasError) {
    return (
      <div
        className={cn('relative flex justify-center items-center', className)}
        style={{ width: globeWidth, height: globeHeight }}
      >
        <div className="text-center text-muted-foreground">
          <p>지구본을 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative flex justify-center', className)}>
      <canvas
        className="h-auto w-full max-w-full"
        height={globeHeight}
        ref={canvasRef}
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 1s ease',
          contain: 'layout paint size',
          maxWidth: globeWidth,
        }}
        width={globeWidth}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse text-primary">로딩 중...</div>
        </div>
      )}
    </div>
  );
}
