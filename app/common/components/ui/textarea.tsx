import * as React from 'react';

import { cn } from '~/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        // 🚫 모바일 줌인 방지 - iOS Safari 16px 최소 폰트 사이즈 보장
        'text-[max(16px,1rem)] sm:text-sm',
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

export { Textarea };
