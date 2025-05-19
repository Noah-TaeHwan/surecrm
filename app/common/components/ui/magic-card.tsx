'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '../../../lib/utils';

interface MagicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glareSize?: number;
  glareOpacity?: number;
  glareColor?: string;
  rotationIntensity?: number;
  borderRadius?: string;
  shadow?: string;
  rotate?: boolean;
}

export function MagicCard({
  children,
  className,
  glareSize = 0.4,
  glareOpacity = 0,
  glareColor = 'white',
  rotationIntensity = 10,
  borderRadius = '1rem',
  shadow = '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
  rotate = true,
  ...props
}: MagicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !rotate) return;

    const rect = cardRef.current.getBoundingClientRect();

    // Calculate the mouse position relative to the card
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setPosition({ x, y });
  };

  useEffect(() => {
    if (!cardRef.current || !glareRef.current || !isHovering) return;

    // Update the rotation and glare position based on the mouse position
    const rotateX = rotate ? rotationIntensity * (0.5 - position.y) : 0;
    const rotateY = rotate ? rotationIntensity * (position.x - 0.5) : 0;

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

    // Position the glare effect
    const glarePosX = position.x * 100;
    const glarePosY = position.y * 100;

    glareRef.current.style.transform = `translate(${glarePosX}%, ${glarePosY}%) translate(-50%, -50%)`;
  }, [position, isHovering, rotationIntensity, rotate]);

  return (
    <div
      ref={cardRef}
      className={cn(
        'relative overflow-hidden transition-transform duration-200 ease-out bg-card border border-border/20',
        className
      )}
      style={{
        borderRadius,
        boxShadow: shadow,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        if (cardRef.current) {
          cardRef.current.style.transform =
            'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        }
      }}
      {...props}
    >
      <div className="relative z-10">{children}</div>
      <div
        ref={glareRef}
        className="absolute top-0 left-0 w-0 h-0 pointer-events-none opacity-0 transition-opacity duration-500"
        style={{
          width: `${glareSize * 100}%`,
          height: `${glareSize * 100}%`,
          background: `radial-gradient(circle at center, ${glareColor} 0%, transparent 80%)`,
          opacity: isHovering ? glareOpacity : 0,
        }}
      />
    </div>
  );
}
