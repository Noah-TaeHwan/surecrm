'use client';

import { cn } from '~/lib/utils';

interface RetroGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Additional CSS classes to apply to the grid container
   */
  className?: string;
  /**
   * Rotation angle of the grid in degrees
   * @default 65
   */
  angle?: number;
  /**
   * Grid cell size in pixels
   * @default 60
   */
  cellSize?: number;
  /**
   * Grid opacity value between 0 and 1
   * @default 0.5
   */
  opacity?: number;
  /**
   * Grid line color in light mode
   * @default "gray"
   */
  lightLineColor?: string;
  /**
   * Grid line color in dark mode
   * @default "gray"
   */
  darkLineColor?: string;
  /**
   * Add a glow effect to the grid
   * @default false
   */
  glow?: boolean;
}

export function RetroGrid({
  className,
  angle = 65,
  cellSize = 60,
  opacity = 0.5,
  lightLineColor = 'gray',
  darkLineColor = 'gray',
  glow = false,
  ...props
}: RetroGridProps) {
  const gridStyles = {
    '--grid-angle': `${angle}deg`,
    '--cell-size': `${cellSize}px`,
    '--opacity': opacity,
    '--light-line': lightLineColor,
    '--dark-line': darkLineColor,
  } as React.CSSProperties;

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 size-full overflow-hidden [perspective:200px]',
        `opacity-[var(--opacity)]`,
        className
      )}
      style={gridStyles}
      {...props}
    >
      {/* 배경 그라데이션 레이어 */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-500/20 via-transparent to-transparent dark:from-blue-500/10" />

      {/* 블러 효과 (글로우가 활성화된 경우) */}
      {glow && (
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
      )}

      {/* 그리드 레이어 */}
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div className="animate-grid [background-image:linear-gradient(to_right,var(--light-line)_1px,transparent_0),linear-gradient(to_bottom,var(--light-line)_1px,transparent_0)] [background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw] dark:[background-image:linear-gradient(to_right,var(--dark-line)_1px,transparent_0),linear-gradient(to_bottom,var(--dark-line)_1px,transparent_0)]" />
      </div>

      {/* 그라데이션 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent to-90% dark:from-black" />

      {/* 글로우 효과 (활성화된 경우) */}
      {glow && (
        <div className="absolute inset-0 opacity-30 mix-blend-overlay">
          <div className="absolute inset-0 animate-pulse [background:radial-gradient(circle_at_50%_50%,var(--light-line),transparent_70%)] dark:[background:radial-gradient(circle_at_50%_50%,var(--dark-line),transparent_70%)]" />
        </div>
      )}
    </div>
  );
}
