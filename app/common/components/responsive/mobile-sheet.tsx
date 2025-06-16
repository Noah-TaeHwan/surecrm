import * as React from 'react';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { XIcon, GripHorizontalIcon } from 'lucide-react';
import { useViewport } from '~/common/hooks/useViewport';
import { cn } from '~/lib/utils';

// Mobile-specific sheet positions
type MobileSheetSide = 'top' | 'bottom' | 'left' | 'right';

// Mobile sheet size variants
type MobileSheetSize = 'compact' | 'default' | 'large' | 'full';

// Mobile sheet interaction modes
type MobileSheetInteraction = 'swipe' | 'button' | 'both';

interface MobileSheetProps extends React.ComponentProps<typeof SheetPrimitive.Root> {
  side?: MobileSheetSide;
  size?: MobileSheetSize;
  interaction?: MobileSheetInteraction;
  hapticFeedback?: boolean;
  swipeThreshold?: number;
  onSwipeClose?: () => void;
}

interface MobileSheetContentProps extends React.ComponentProps<typeof SheetPrimitive.Content> {
  side?: MobileSheetSide;
  size?: MobileSheetSize;
  interaction?: MobileSheetInteraction;
  hapticFeedback?: boolean;
  swipeThreshold?: number;
  onSwipeClose?: () => void;
  showDragHandle?: boolean;
}

// Haptic feedback utility
const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    const patterns = {
      light: 20,
      medium: 40,
      heavy: 60,
    };
    navigator.vibrate(patterns[type]);
  }
};

// Get size classes for mobile sheet
const getSizeClasses = (side: MobileSheetSide, size: MobileSheetSize) => {
  const sizeMap = {
    top: {
      compact: 'h-[25vh] max-h-[300px]',
      default: 'h-[50vh] max-h-[500px]',
      large: 'h-[75vh] max-h-[700px]',
      full: 'h-[90vh]',
    },
    bottom: {
      compact: 'h-[25vh] max-h-[300px]',
      default: 'h-[50vh] max-h-[500px]',
      large: 'h-[75vh] max-h-[700px]',
      full: 'h-[90vh]',
    },
    left: {
      compact: 'w-[250px]',
      default: 'w-[300px]',
      large: 'w-[400px]',
      full: 'w-[90vw]',
    },
    right: {
      compact: 'w-[250px]',
      default: 'w-[300px]',
      large: 'w-[400px]',
      full: 'w-[90vw]',
    },
  };
  
  return sizeMap[side][size];
};

// Mobile Sheet Root Component
const MobileSheet: React.FC<MobileSheetProps> = ({ children, ...props }) => {
  return (
    <SheetPrimitive.Root {...props}>
      {children}
    </SheetPrimitive.Root>
  );
};
MobileSheet.displayName = 'MobileSheet';

// Mobile Sheet Trigger
const MobileSheetTrigger = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Trigger>,
  React.ComponentProps<typeof SheetPrimitive.Trigger> & { hapticFeedback?: boolean }
>(({ className, hapticFeedback = true, onClick, ...props }, ref) => {
  const handleClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (hapticFeedback) {
      triggerHapticFeedback('light');
    }
    onClick?.(e);
  }, [hapticFeedback, onClick]);

  return (
    <SheetPrimitive.Trigger
      ref={ref}
      className={cn(
        // Touch-friendly sizing (44px minimum)
        'min-h-[44px] min-w-[44px]',
        // Touch feedback
        'active:scale-95 transition-transform duration-150',
        // Focus states
        'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
        className
      )}
      onClick={handleClick}
      {...props}
    />
  );
});
MobileSheetTrigger.displayName = 'MobileSheetTrigger';

// Mobile Sheet Close
const MobileSheetClose = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Close>,
  React.ComponentProps<typeof SheetPrimitive.Close> & { hapticFeedback?: boolean }
>(({ className, hapticFeedback = true, onClick, ...props }, ref) => {
  const handleClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (hapticFeedback) {
      triggerHapticFeedback('medium');
    }
    onClick?.(e);
  }, [hapticFeedback, onClick]);

  return (
    <SheetPrimitive.Close
      ref={ref}
      className={cn(
        // Touch-friendly sizing
        'min-h-[44px] min-w-[44px]',
        'rounded-full p-2',
        // Touch feedback
        'active:scale-95 transition-all duration-150',
        // Visual feedback
        'hover:bg-gray-100 active:bg-gray-200',
        // Focus states
        'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
        className
      )}
      onClick={handleClick}
      {...props}
    />
  );
});
MobileSheetClose.displayName = 'MobileSheetClose';

// Mobile Sheet Portal
const MobileSheetPortal = SheetPrimitive.Portal;

// Mobile Sheet Overlay
const MobileSheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentProps<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50',
      // Mobile-optimized backdrop
      'bg-black/60 backdrop-blur-sm',
      // Animation
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      'data-[state=open]:duration-300 data-[state=closed]:duration-200',
      className
    )}
    {...props}
  />
));
MobileSheetOverlay.displayName = 'MobileSheetOverlay';

// Mobile Sheet Content with drag gestures
const MobileSheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  MobileSheetContentProps
>(({ 
  className, 
  children, 
  side = 'bottom',
  size = 'default',
  interaction = 'both',
  hapticFeedback = true,
  swipeThreshold = 100,
  onSwipeClose,
  showDragHandle = true,
  ...props 
}, ref) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragDistance, setDragDistance] = React.useState(0);
  const startPos = React.useRef<{ x: number; y: number } | null>(null);
  const currentPos = React.useRef<{ x: number; y: number } | null>(null);

  // Drag handlers
  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    if (interaction === 'button') return;
    
    const touch = e.touches[0];
    startPos.current = { x: touch.clientX, y: touch.clientY };
    setIsDragging(true);
    
    if (hapticFeedback) {
      triggerHapticFeedback('light');
    }
  }, [interaction, hapticFeedback]);

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    if (!isDragging || !startPos.current || interaction === 'button') return;
    
    const touch = e.touches[0];
    currentPos.current = { x: touch.clientX, y: touch.clientY };
    
    let distance = 0;
    if (side === 'bottom') {
      distance = Math.max(0, touch.clientY - startPos.current.y);
    } else if (side === 'top') {
      distance = Math.max(0, startPos.current.y - touch.clientY);
    } else if (side === 'right') {
      distance = Math.max(0, touch.clientX - startPos.current.x);
    } else if (side === 'left') {
      distance = Math.max(0, startPos.current.x - touch.clientX);
    }
    
    setDragDistance(distance);
  }, [isDragging, side, interaction]);

  const handleTouchEnd = React.useCallback(() => {
    if (!isDragging || interaction === 'button') return;
    
    if (dragDistance > swipeThreshold) {
      if (hapticFeedback) {
        triggerHapticFeedback('medium');
      }
      onSwipeClose?.();
    } else if (dragDistance > 20 && hapticFeedback) {
      // Small haptic feedback for attempted but unsuccessful swipe
      triggerHapticFeedback('light');
    }
    
    setIsDragging(false);
    setDragDistance(0);
    startPos.current = null;
    currentPos.current = null;
  }, [isDragging, dragDistance, swipeThreshold, hapticFeedback, onSwipeClose, interaction]);

  // Get position-specific classes
  const getPositionClasses = () => {
    const baseClasses = 'fixed z-50 bg-background shadow-lg transition-all ease-out';
    const sizeClasses = getSizeClasses(side, size);
    
    const positionMap = {
      top: `inset-x-0 top-0 border-b rounded-b-lg ${sizeClasses}`,
      bottom: `inset-x-0 bottom-0 border-t rounded-t-lg ${sizeClasses} pb-safe-area-inset-bottom`,
      left: `inset-y-0 left-0 border-r rounded-r-lg ${sizeClasses}`,
      right: `inset-y-0 right-0 border-l rounded-l-lg ${sizeClasses}`,
    };
    
    return `${baseClasses} ${positionMap[side]}`;
  };

  // Get animation classes
  const getAnimationClasses = () => {
    const animationMap = {
      top: 'data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top',
      bottom: 'data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom',
      left: 'data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left',
      right: 'data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right',
    };
    
    return `data-[state=open]:animate-in data-[state=closed]:animate-out ${animationMap[side]} data-[state=open]:duration-300 data-[state=closed]:duration-200`;
  };

  // Apply drag transform
  const getDragStyle = (): React.CSSProperties => {
    if (!isDragging || dragDistance === 0) return {};
    
    const transformMap = {
      top: `translateY(-${dragDistance}px)`,
      bottom: `translateY(${dragDistance}px)`,
      left: `translateX(-${dragDistance}px)`,
      right: `translateX(${dragDistance}px)`,
    };
    
    return {
      transform: transformMap[side],
      opacity: Math.max(0.3, 1 - dragDistance / (swipeThreshold * 2)),
    };
  };

  return (
    <MobileSheetPortal>
      <MobileSheetOverlay />
      <SheetPrimitive.Content
        ref={ref}
        className={cn(
          getPositionClasses(),
          getAnimationClasses(),
          'flex flex-col',
          isDragging && 'transition-none', // Disable CSS transitions during drag
          className
        )}
        style={getDragStyle()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        {...props}
      >
        {/* Drag Handle */}
        {showDragHandle && (side === 'top' || side === 'bottom') && (
          <div className={cn(
            'flex justify-center py-2',
            side === 'top' ? 'order-last' : 'order-first'
          )}>
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
        )}
        
        {/* Close Button */}
        <MobileSheetClose 
          className={cn(
            'absolute z-10',
            side === 'top' ? 'bottom-4 right-4' : 'top-4 right-4'
          )}
          hapticFeedback={hapticFeedback}
        >
          <XIcon className="h-5 w-5" />
          <span className="sr-only">닫기</span>
        </MobileSheetClose>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </SheetPrimitive.Content>
    </MobileSheetPortal>
  );
});
MobileSheetContent.displayName = 'MobileSheetContent';

// Mobile Sheet Header
const MobileSheetHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { compact?: boolean }
>(({ className, compact = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col space-y-2 px-4',
      compact ? 'py-2' : 'py-4',
      'border-b border-gray-100',
      className
    )}
    {...props}
  />
));
MobileSheetHeader.displayName = 'MobileSheetHeader';

// Mobile Sheet Footer
const MobileSheetFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { sticky?: boolean }
>(({ className, sticky = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 px-4 py-4',
      'border-t border-gray-100',
      sticky && 'sticky bottom-0 bg-background',
      'pb-safe-area-inset-bottom',
      className
    )}
    {...props}
  />
));
MobileSheetFooter.displayName = 'MobileSheetFooter';

// Mobile Sheet Title
const MobileSheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentProps<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold text-foreground',
      'sm:text-xl',
      className
    )}
    {...props}
  />
));
MobileSheetTitle.displayName = 'MobileSheetTitle';

// Mobile Sheet Description
const MobileSheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentProps<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn(
      'text-sm text-muted-foreground/90',
      'sm:text-base',
      className
    )}
    {...props}
  />
));
MobileSheetDescription.displayName = 'MobileSheetDescription';

// Mobile Sheet Body (scrollable content area)
const MobileSheetBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { maxHeight?: string }
>(({ className, maxHeight, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex-1 overflow-y-auto px-4 py-2',
      // Custom scrollbar for mobile
      'scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent',
      className
    )}
    style={maxHeight ? { maxHeight } : undefined}
    {...props}
  />
));
MobileSheetBody.displayName = 'MobileSheetBody';

export {
  MobileSheet,
  MobileSheetTrigger,
  MobileSheetClose,
  MobileSheetContent,
  MobileSheetHeader,
  MobileSheetFooter,
  MobileSheetTitle,
  MobileSheetDescription,
  MobileSheetBody,
};

export type {
  MobileSheetSide,
  MobileSheetSize,
  MobileSheetInteraction,
}; 