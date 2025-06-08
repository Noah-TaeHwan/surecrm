import * as React from 'react';
import { cn } from '~/lib/utils';

function Progress({
  className,
  value,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value?: number }) {
  const progressValue = value || 0;
  const isExactlyComplete = progressValue === 100;
  const isOverAchieved = progressValue > 100;
  const displayValue = isOverAchieved ? 100 : progressValue; // 바는 최대 100%까지만 표시

  return (
    <div
      className={cn(
        'bg-primary/20 relative h-2 w-full rounded-full overflow-hidden',
        className
      )}
      {...props}
    >
      {/* 기본 진행률 바 */}
      <div
        className={cn(
          'h-full transition-all duration-500 ease-out rounded-full relative',
          isExactlyComplete || isOverAchieved
            ? 'bg-green-500' // 🎯 100% 달성 또는 초과 달성 시 녹색
            : 'bg-primary' // 일반 진행 시 기본색
        )}
        style={{ width: `${displayValue}%` }}
      >
        {/* 100% 초과 시에만 특별한 시각적 표시 */}
        {isOverAchieved && (
          <>
            {/* 그라데이션 효과 (초과 달성만) */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-green-400 to-green-300 rounded-full" />

            {/* 은은한 내부 하이라이트 */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-300/20 to-green-300/40 rounded-full" />

            {/* 오른쪽 끝 강조 표시 */}
            <div className="absolute top-0 right-0 h-full w-1 bg-green-300 rounded-r-full shadow-sm" />
          </>
        )}
      </div>
    </div>
  );
}

export { Progress };
