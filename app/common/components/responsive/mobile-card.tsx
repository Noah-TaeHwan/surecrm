import * as React from 'react';
import { cn } from '~/lib/utils';

// Mobile-specific card size variants
type MobileCardSize = 'compact' | 'default' | 'comfortable' | 'spacious';

// Mobile card interaction types
type MobileCardInteraction = 'none' | 'tap' | 'swipe' | 'long-press';

// Mobile card elevation levels
type MobileCardElevation = 'flat' | 'low' | 'medium' | 'high';

interface MobileCardProps extends React.ComponentProps<'div'> {
  size?: MobileCardSize;
  interaction?: MobileCardInteraction;
  elevation?: MobileCardElevation;
  touchFeedback?: boolean;
  swipeActions?: boolean;
  onTap?: () => void;
  onLongPress?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

interface MobileCardHeaderProps extends React.ComponentProps<'div'> {
  compact?: boolean;
  centerAlign?: boolean;
}

interface MobileCardContentProps extends React.ComponentProps<'div'> {
  scrollable?: boolean;
  maxHeight?: string;
}

interface MobileCardFooterProps extends React.ComponentProps<'div'> {
  sticky?: boolean;
  actions?: boolean;
}

interface MobileCardActionProps extends React.ComponentProps<'div'> {
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'center';
  floating?: boolean;
}

// Size variant styles
const sizeVariants: Record<MobileCardSize, string> = {
  compact: 'gap-2 py-3',
  default: 'gap-4 py-4',
  comfortable: 'gap-5 py-5',
  spacious: 'gap-6 py-6',
};

// Interaction variant styles
const interactionVariants: Record<MobileCardInteraction, string> = {
  none: '',
  tap: 'cursor-pointer active:scale-[0.98] transition-transform duration-150',
  swipe: 'touch-pan-x',
  'long-press': 'cursor-pointer select-none',
};

// Elevation variant styles
const elevationVariants: Record<MobileCardElevation, string> = {
  flat: 'border shadow-none',
  low: 'border shadow-sm',
  medium: 'border shadow-md',
  high: 'border shadow-lg',
};

// Touch feedback styles
const touchFeedbackStyles = 'active:bg-muted/50 transition-colors duration-150';

function MobileCard({
  className,
  size = 'default',
  interaction = 'none',
  elevation = 'low',
  touchFeedback = false,
  swipeActions = false,
  onTap,
  onLongPress,
  onSwipeLeft,
  onSwipeRight,
  children,
  ...props
}: MobileCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [isPressed, setIsPressed] = React.useState(false);
  const [touchStart, setTouchStart] = React.useState<{
    x: number;
    y: number;
    time: number;
  } | null>(null);

  // Touch event handlers
  const handleTouchStart = React.useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      setTouchStart({
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      });
      setIsPressed(true);

      // Long press detection
      if (interaction === 'long-press' && onLongPress) {
        const longPressTimer = setTimeout(() => {
          onLongPress();
          // Haptic feedback for long press
          if ('vibrate' in navigator) {
            navigator.vibrate(50);
          }
        }, 500);

        const cleanup = () => {
          clearTimeout(longPressTimer);
          setIsPressed(false);
        };

        const handleTouchEnd = () => {
          cleanup();
          document.removeEventListener('touchend', handleTouchEnd);
          document.removeEventListener('touchcancel', handleTouchEnd);
        };

        document.addEventListener('touchend', handleTouchEnd);
        document.addEventListener('touchcancel', handleTouchEnd);
      }
    },
    [interaction, onLongPress]
  );

  const handleTouchEnd = React.useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      const deltaTime = Date.now() - touchStart.time;

      setIsPressed(false);
      setTouchStart(null);

      // Swipe detection
      if (
        swipeActions &&
        Math.abs(deltaX) > 50 &&
        Math.abs(deltaY) < 100 &&
        deltaTime < 300
      ) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
          // Haptic feedback for swipe
          if ('vibrate' in navigator) {
            navigator.vibrate(30);
          }
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
          // Haptic feedback for swipe
          if ('vibrate' in navigator) {
            navigator.vibrate(30);
          }
        }
        return;
      }

      // Tap detection
      if (
        interaction === 'tap' &&
        onTap &&
        Math.abs(deltaX) < 10 &&
        Math.abs(deltaY) < 10 &&
        deltaTime < 300
      ) {
        onTap();
        // Light haptic feedback for tap
        if ('vibrate' in navigator) {
          navigator.vibrate(20);
        }
      }
    },
    [touchStart, interaction, swipeActions, onTap, onSwipeLeft, onSwipeRight]
  );

  const handleTouchCancel = React.useCallback(() => {
    setIsPressed(false);
    setTouchStart(null);
  }, []);

  return (
    <div
      ref={cardRef}
      data-slot="mobile-card"
      className={cn(
        'bg-card text-card-foreground flex flex-col rounded-xl',
        sizeVariants[size],
        interactionVariants[interaction],
        elevationVariants[elevation],
        touchFeedback && touchFeedbackStyles,
        isPressed && touchFeedback && 'bg-muted/30',
        // Mobile-specific optimizations
        'min-h-[44px]', // WCAG 2.5.5 AAA minimum touch target
        'relative overflow-hidden',
        // Safe area support
        'pb-safe-area-inset-bottom',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      {...props}
    >
      {children}
    </div>
  );
}

function MobileCardHeader({
  className,
  compact = false,
  centerAlign = false,
  ...props
}: MobileCardHeaderProps) {
  return (
    <div
      data-slot="mobile-card-header"
      className={cn(
        '@container/mobile-card-header grid auto-rows-min items-start',
        compact ? 'gap-1 px-4' : 'gap-1.5 px-4 sm:px-6',
        centerAlign ? 'text-center items-center' : 'items-start',
        'has-data-[slot=mobile-card-action]:grid-cols-[1fr_auto]',
        '[.border-b]:pb-3 sm:[.border-b]:pb-4',
        className
      )}
      {...props}
    />
  );
}

function MobileCardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="mobile-card-title"
      className={cn(
        'leading-tight font-semibold',
        // Mobile-optimized typography
        'text-base sm:text-lg',
        // Better line height for mobile reading
        'leading-[1.4]',
        className
      )}
      {...props}
    />
  );
}

function MobileCardDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="mobile-card-description"
      className={cn(
        'text-muted-foreground',
        // Mobile-optimized typography
        'text-sm sm:text-base',
        'leading-[1.5]',
        // Better contrast for mobile
        'text-muted-foreground/90',
        className
      )}
      {...props}
    />
  );
}

function MobileCardAction({
  className,
  position = 'top-right',
  floating = false,
  ...props
}: MobileCardActionProps) {
  const positionStyles = {
    'top-right':
      'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
    'top-left':
      'col-start-1 row-span-2 row-start-1 self-start justify-self-start',
    'bottom-right': 'absolute bottom-4 right-4',
    'bottom-left': 'absolute bottom-4 left-4',
    center:
      'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
  };

  return (
    <div
      data-slot="mobile-card-action"
      className={cn(
        positionStyles[position],
        floating && 'z-10 shadow-lg rounded-full',
        // Ensure minimum touch target size
        'min-h-[44px] min-w-[44px] flex items-center justify-center',
        className
      )}
      {...props}
    />
  );
}

function MobileCardContent({
  className,
  scrollable = false,
  maxHeight,
  ...props
}: MobileCardContentProps) {
  return (
    <div
      data-slot="mobile-card-content"
      className={cn(
        'px-4 sm:px-6',
        scrollable && 'overflow-y-auto',
        // Mobile-optimized spacing
        'space-y-3',
        className
      )}
      style={maxHeight ? { maxHeight } : undefined}
      {...props}
    />
  );
}

function MobileCardFooter({
  className,
  sticky = false,
  actions = false,
  ...props
}: MobileCardFooterProps) {
  return (
    <div
      data-slot="mobile-card-footer"
      className={cn(
        'flex items-center px-4 sm:px-6',
        sticky && 'sticky bottom-0 bg-card/95 backdrop-blur-sm',
        actions ? 'justify-between gap-3' : 'justify-start',
        // Mobile-optimized spacing and touch targets
        'min-h-[52px] gap-3',
        '[.border-t]:pt-3 sm:[.border-t]:pt-4',
        // Safe area support for sticky footers
        sticky && 'pb-safe-area-inset-bottom',
        className
      )}
      {...props}
    />
  );
}

export {
  MobileCard,
  MobileCardHeader,
  MobileCardTitle,
  MobileCardDescription,
  MobileCardAction,
  MobileCardContent,
  MobileCardFooter,
};

export type { MobileCardSize, MobileCardInteraction, MobileCardElevation };
