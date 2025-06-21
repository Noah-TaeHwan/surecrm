import * as React from 'react';

import { cn } from '~/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        // 🚫 모바일 줌인 방지 - iOS Safari 16px 최소 폰트 사이즈 보장
        'text-[max(16px,1rem)] sm:text-sm',
        // Date/Time input specific styles
        (type === 'date' || type === 'time' || type === 'datetime-local') && [
          '[color-scheme:light] dark:[color-scheme:dark]',
          // 브라우저 기본 스타일과 호환성
          '[&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100',
          '[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
          // 텍스트 색상 보정 (일부 브라우저에서 date input 텍스트가 투명해지는 문제 해결)
          'text-foreground',
          // 모바일에서 줌인 방지를 위한 16px 최소 폰트 사이즈
          'text-[max(16px,1rem)]',
        ],
        className
      )}
      style={{
        // 🍎 iOS Safari 추가 안전 장치 - 인라인 스타일로 강제 적용
        fontSize: 'max(16px, 1rem)',
        WebkitTextSizeAdjust: '100%',
        ...('style' in props && typeof props.style === 'object' ? props.style : {}),
      }}
      {...props}
    />
  );
}

export { Input };
