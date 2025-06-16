import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon, ChevronDownIcon } from 'lucide-react';
import { cn } from '~/lib/utils';

// Size variants for mobile optimization
type MobileDialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface MobileDialogProps extends React.ComponentProps<typeof DialogPrimitive.Root> {
  size?: MobileDialogSize;
  dismissible?: boolean;
  swipeToClose?: boolean;
}

interface MobileDialogContentProps extends React.ComponentProps<typeof DialogPrimitive.Content> {
  size?: MobileDialogSize;
  dismissible?: boolean;
  swipeToClose?: boolean;
  showDragHandle?: boolean;
}

// Size class mappings for mobile-optimized dimensions
const sizeClasses = {
  sm: 'max-h-[40vh] w-full max-w-sm',
  md: 'max-h-[60vh] w-full max-w-md', 
  lg: 'max-h-[80vh] w-full max-w-lg',
  xl: 'max-h-[90vh] w-full max-w-xl',
  full: 'h-full w-full max-w-none'
} as const;

// Haptic feedback utility
const triggerHapticFeedback = (intensity: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [50]
    };
    navigator.vibrate(patterns[intensity]);
  }
};

function MobileDialog({ size = 'md', dismissible = true, swipeToClose = true, ...props }: MobileDialogProps) {
  return <DialogPrimitive.Root data-slot="mobile-dialog" {...props} />;
}

function MobileDialogTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  const handlePress = (e: React.MouseEvent | React.TouchEvent) => {
    triggerHapticFeedback('light');
    // Ensure minimum touch target size
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    if (rect.width < 44 || rect.height < 44) {
      console.warn('Touch target smaller than recommended 44px minimum');
    }
  };

  return (
    <DialogPrimitive.Trigger
      data-slot="mobile-dialog-trigger"
      className={cn(
        // Minimum touch target size (WCAG 2.5.5 AAA)
        'min-h-[44px] min-w-[44px]',
        // Touch-friendly padding
        'px-4 py-3',
        // Visual feedback for touch
        'transition-all duration-150',
        'active:scale-[0.98]',
        'focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      onMouseDown={handlePress}
      onTouchStart={handlePress}
      {...props}
    >
      {children}
    </DialogPrimitive.Trigger>
  );
}

function MobileDialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="mobile-dialog-portal" {...props} />;
}

function MobileDialogClose({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  const handleClose = () => {
    triggerHapticFeedback('medium');
  };

  return (
    <DialogPrimitive.Close
      data-slot="mobile-dialog-close"
      className={cn(
        // Touch-friendly close button
        'min-h-[44px] min-w-[44px]',
        'flex items-center justify-center',
        'rounded-full',
        'transition-all duration-150',
        'hover:bg-gray-100 active:bg-gray-200',
        'focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
        'disabled:opacity-50',
        className
      )}
      onClick={handleClose}
      {...props}
    >
      {children}
    </DialogPrimitive.Close>
  );
}

function MobileDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="mobile-dialog-overlay"
      className={cn(
        // Mobile-optimized overlay
        'fixed inset-0 z-50',
        'bg-black/60', // Slightly darker for mobile
        // Animation classes
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=open]:duration-300 data-[state=closed]:duration-200',
        className
      )}
      {...props}
    />
  );
}

function MobileDialogContent({
  className,
  children,
  size = 'md',
  dismissible = true,
  swipeToClose = true,
  showDragHandle = true,
  ...props
}: MobileDialogContentProps) {
  const [dragOffset, setDragOffset] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const startYRef = React.useRef(0);
  const currentYRef = React.useRef(0);

  // Touch handlers for swipe-to-dismiss
  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    if (!swipeToClose) return;
    
    const touch = e.touches[0];
    startYRef.current = touch.clientY;
    currentYRef.current = touch.clientY;
    setIsDragging(true);
    triggerHapticFeedback('light');
  }, [swipeToClose]);

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    if (!swipeToClose || !isDragging) return;
    
    const touch = e.touches[0];
    currentYRef.current = touch.clientY;
    const deltaY = currentYRef.current - startYRef.current;
    
    // Only allow downward swipes
    if (deltaY > 0) {
      setDragOffset(deltaY);
      // Haptic feedback at threshold
      if (deltaY > 100) {
        triggerHapticFeedback('medium');
      }
    }
  }, [swipeToClose, isDragging]);

  const handleTouchEnd = React.useCallback(() => {
    if (!swipeToClose || !isDragging) return;
    
    setIsDragging(false);
    const deltaY = currentYRef.current - startYRef.current;
    
    // Close if swiped down enough
    if (deltaY > 150) {
      triggerHapticFeedback('heavy');
      // Trigger close through Radix
      const closeButton = contentRef.current?.querySelector('[data-slot="mobile-dialog-close"]') as HTMLButtonElement;
      closeButton?.click();
    } else {
      // Snap back
      setDragOffset(0);
    }
  }, [swipeToClose, isDragging]);

  // Reset drag offset when dialog closes
  React.useEffect(() => {
    if (!isDragging) {
      const timer = setTimeout(() => setDragOffset(0), 200);
      return () => clearTimeout(timer);
    }
  }, [isDragging]);

  return (
    <MobileDialogPortal>
      <MobileDialogOverlay />
      <DialogPrimitive.Content
        ref={contentRef}
        data-slot="mobile-dialog-content"
        className={cn(
          // Mobile-first positioning
          'fixed inset-x-0 bottom-0 z-50',
          'bg-white rounded-t-2xl',
          // Size variants
          sizeClasses[size],
          // Shadow and border
          'border-t border-gray-200',
          'shadow-2xl',
          // Animation classes
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
          'data-[state=open]:duration-300 data-[state=closed]:duration-200',
          // Transform for drag
          isDragging && 'transition-none',
          className
        )}
        style={{
          transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        {...props}
      >
        {/* Drag handle */}
        {showDragHandle && (
          <div 
            className="flex justify-center pt-3 pb-2"
            aria-label="Drag to close"
          >
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>
        )}

        {/* Content */}
        <div className="px-4 pb-4">
          {children}
        </div>

        {/* Close button */}
        {dismissible && (
          <MobileDialogClose className="absolute top-4 right-4">
            <XIcon className="h-5 w-5" />
            <span className="sr-only">Close dialog</span>
          </MobileDialogClose>
        )}
      </DialogPrimitive.Content>
    </MobileDialogPortal>
  );
}

function MobileDialogHeader({ 
  className, 
  ...props 
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="mobile-dialog-header"
      className={cn(
        // Mobile-optimized header
        'flex flex-col gap-3 pb-4',
        'text-center',
        className
      )}
      {...props}
    />
  );
}

function MobileDialogFooter({ 
  className, 
  ...props 
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="mobile-dialog-footer"
      className={cn(
        // Mobile-optimized footer with safe area
        'flex flex-col gap-3 pt-4',
        'pb-safe-area-inset-bottom',
        className
      )}
      {...props}
    />
  );
}

function MobileDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="mobile-dialog-title"
      className={cn(
        // Mobile-optimized title
        'text-xl font-semibold leading-tight',
        'text-gray-900',
        className
      )}
      {...props}
    />
  );
}

function MobileDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="mobile-dialog-description"
      className={cn(
        // Mobile-optimized description
        'text-base text-gray-600 leading-relaxed',
        className
      )}
      {...props}
    />
  );
}

export {
  MobileDialog,
  MobileDialogClose,
  MobileDialogContent,
  MobileDialogDescription,
  MobileDialogFooter,
  MobileDialogHeader,
  MobileDialogOverlay,
  MobileDialogPortal,
  MobileDialogTitle,
  MobileDialogTrigger,
};

export type {
  MobileDialogSize,
  MobileDialogProps,
  MobileDialogContentProps,
}; 