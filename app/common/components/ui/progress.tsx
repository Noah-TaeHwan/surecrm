import * as React from 'react';
import { cn } from '~/lib/utils';

function Progress({
  className,
  value,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value?: number }) {
  const progressValue = value || 0;
  const isOverAchieved = progressValue > 100;

  return (
    <div
      className={cn(
        'bg-primary/20 relative h-2 w-full rounded-full',
        className
      )}
      {...props}
    >
      {/* 기본 진행률 바 (0-100%) */}
      <div
        className={cn(
          'h-full transition-all duration-500 ease-out rounded-full relative',
          isOverAchieved
            ? 'bg-green-500' // 🎯 초과 달성 시 초록색
            : 'bg-primary' // 일반 달성 시 기본색
        )}
        style={{ width: `${Math.min(progressValue, 100)}%` }}
      >
        {/* 100% 초과 시 깔끔한 오버플로우 표시 */}
        {isOverAchieved && (
          <>
            {/* 끝 부분 그라데이션 */}
            <div className="absolute top-0 right-0 h-full w-2 bg-gradient-to-r from-green-500 to-green-400 rounded-r-full" />
            {/* 은은한 글로우 효과 */}
            <div className="absolute top-0 right-0 h-full w-1 bg-green-300/60 rounded-r-full animate-pulse" />
          </>
        )}
      </div>
    </div>
  );
}

export { Progress };
