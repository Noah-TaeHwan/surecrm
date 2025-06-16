import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '~/lib/utils';

const mobileButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-base font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-95 touch-manipulation select-none",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 active:bg-primary/80',
        destructive:
          'bg-destructive text-white shadow-lg hover:bg-destructive/90 active:bg-destructive/80 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border-2 bg-background shadow-lg hover:bg-accent hover:text-accent-foreground active:bg-accent/80 dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground shadow-lg hover:bg-secondary/80 active:bg-secondary/70',
        ghost:
          'hover:bg-accent hover:text-accent-foreground active:bg-accent/80 dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline active:text-primary/80',
      },
      size: {
        // 모바일 터치 타겟 최소 44px 준수
        default: 'h-12 px-6 py-3 min-w-[44px] has-[>svg]:px-4',
        sm: 'h-10 rounded-lg gap-2 px-4 py-2 min-w-[44px] has-[>svg]:px-3',
        lg: 'h-14 rounded-lg px-8 py-4 min-w-[44px] has-[>svg]:px-6',
        xl: 'h-16 rounded-xl px-10 py-5 min-w-[44px] has-[>svg]:px-8 text-lg',
        icon: 'size-12 min-w-[44px] min-h-[44px]',
        'icon-sm': 'size-10 min-w-[44px] min-h-[44px]',
        'icon-lg': 'size-14 min-w-[44px] min-h-[44px]',
      },
      touchFeedback: {
        none: '',
        subtle: 'active:brightness-95',
        strong: 'active:scale-95 active:brightness-90',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      touchFeedback: 'strong',
    },
  }
);

interface MobileButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof mobileButtonVariants> {
  asChild?: boolean;
  /**
   * 터치 피드백 강도 설정
   */
  touchFeedback?: 'none' | 'subtle' | 'strong';
  /**
   * 접근성을 위한 추가 레이블
   */
  'aria-label'?: string;
  /**
   * 로딩 상태 표시
   */
  loading?: boolean;
  /**
   * 로딩 시 표시할 텍스트
   */
  loadingText?: string;
}

const MobileButton = React.forwardRef<HTMLButtonElement, MobileButtonProps>(
  (
    {
      className,
      variant,
      size,
      touchFeedback,
      asChild = false,
      loading = false,
      loadingText,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    // 로딩 상태일 때 disabled 처리
    const isDisabled = disabled || loading;

    return (
      <Comp
        ref={ref}
        data-slot="mobile-button"
        className={cn(
          mobileButtonVariants({ variant, size, touchFeedback, className })
        )}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {loading ? loadingText || children : children}
      </Comp>
    );
  }
);

MobileButton.displayName = 'MobileButton';

export { MobileButton, mobileButtonVariants };
export type { MobileButtonProps };
