import * as React from 'react';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';

import { cn } from '~/lib/utils';
import {
  isMobile,
  isIOS,
  getMobileMotionConfig,
} from '~/lib/utils/mobile-animation';
import { useMobileModalHeight } from '~/common/hooks/use-viewport-height';

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  const mobile = isMobile();
  const ios = isIOS();

  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
        mobile && 'will-change-auto',
        ios && 'backdrop-blur-none', // iOS Safari에서 백드롭 블러 제거로 성능 향상
        className
      )}
      style={{
        ...(mobile && {
          transform: 'translateZ(0)', // GPU 가속 강제 활성화
          backfaceVisibility: 'hidden',
        }),
      }}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = 'right',
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: 'top' | 'right' | 'bottom' | 'left';
}) {
  const mobile = isMobile();
  const ios = isIOS();
  const contentRef = React.useRef<HTMLDivElement>(null);

  // 🚀 iPhone Safari 하단 주소창 대응 모바일 모달 높이
  const mobileModalHeight = useMobileModalHeight();

  // 🚀 모바일 최적화 애니메이션 설정
  const getMobileOptimizedDuration = () => {
    if (!mobile) return { open: 500, close: 300 };
    if (ios) return { open: 250, close: 200 }; // iOS는 더 빠르게
    return { open: 350, close: 250 }; // 안드로이드
  };

  const durations = getMobileOptimizedDuration();

  // GPU 가속 및 성능 최적화 적용
  React.useEffect(() => {
    if (mobile && contentRef.current) {
      const element = contentRef.current;

      // GPU 가속 강제 활성화
      element.style.willChange = 'transform, opacity';
      element.style.transform = 'translate3d(0, 0, 0)';
      element.style.backfaceVisibility = 'hidden';

      // iOS Safari 특별 최적화
      if (ios) {
        element.style.webkitTransform = 'translate3d(0, 0, 0)';
        element.style.webkitBackfaceVisibility = 'hidden';
        element.style.webkitPerspective = '1000px';
      }

      return () => {
        element.style.willChange = 'auto';
      };
    }
  }, [mobile, ios]);

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        ref={contentRef}
        data-slot="sheet-content"
        data-mobile={mobile ? 'true' : 'false'}
        data-ios={ios ? 'true' : 'false'}
        className={cn(
          'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out',
          // 🚀 동적 애니메이션 duration 적용
          mobile
            ? ''
            : 'data-[state=closed]:duration-300 data-[state=open]:duration-500',
          // 사이드별 슬라이드 애니메이션
          side === 'right' &&
            'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
          side === 'left' &&
            'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
          side === 'top' &&
            'data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b',
          side === 'bottom' &&
            'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t',
          // 🚀 모바일 전용 최적화 클래스
          mobile && 'mobile-sidebar-container',
          ios && 'ios-sidebar-optimized',
          className
        )}
        style={
          {
            // 🚀 동적 애니메이션 duration
            ...(mobile && {
              '--tw-enter-duration': `${durations.open}ms`,
              '--tw-exit-duration': `${durations.close}ms`,
              transitionDuration: `${durations.open}ms`,
            }),
            // 🚀 iPhone Safari 하단 주소창 대응 동적 높이
            ...(mobile &&
              (side === 'left' || side === 'right') && {
                height: `${mobileModalHeight.height}px`,
                maxHeight: `${mobileModalHeight.height}px`,
                top: `${mobileModalHeight.top}px`,
              }),
          } as React.CSSProperties
        }
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-header"
      className={cn('flex flex-col gap-1.5 p-4', className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn('text-foreground font-semibold', className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
