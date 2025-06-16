import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '~/lib/utils';

// Mobile Select Variants
const mobileSelectTriggerVariants = cva(
  [
    // Base styles
    "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground",
    'focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
    'aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50',
    'flex w-full items-center justify-between gap-3 rounded-lg border bg-transparent text-sm',
    'whitespace-nowrap shadow-sm transition-all duration-200 outline-none',
    'focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
    'active:scale-[0.98] touch-manipulation',
    // Mobile optimizations
    '*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex',
    '*:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  ],
  {
    variants: {
      size: {
        sm: 'h-11 px-3 py-2 text-sm min-h-[44px]', // WCAG minimum
        md: 'h-12 px-4 py-3 text-base min-h-[48px]',
        lg: 'h-14 px-5 py-4 text-lg min-h-[56px]',
        xl: 'h-16 px-6 py-5 text-xl min-h-[64px]',
      },
      feedback: {
        subtle: 'hover:bg-accent/5 active:bg-accent/10',
        medium: 'hover:bg-accent/10 active:bg-accent/20 hover:shadow-md',
        strong:
          'hover:bg-accent/15 active:bg-accent/30 hover:shadow-lg active:shadow-xl',
      },
      state: {
        default: '',
        error: 'border-destructive bg-destructive/5 text-destructive',
        success:
          'border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
        warning:
          'border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
      },
    },
    defaultVariants: {
      size: 'md',
      feedback: 'medium',
      state: 'default',
    },
  }
);

const mobileSelectContentVariants = cva(
  [
    'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95',
    'data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
    'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
    'relative z-50 max-h-[var(--radix-select-content-available-height)] min-w-[8rem]',
    'origin-[var(--radix-select-content-transform-origin)] overflow-hidden rounded-lg border shadow-lg',
  ],
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const mobileSelectItemVariants = cva(
  [
    "cursor-pointer focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground",
    'relative flex w-full cursor-default items-center gap-3 rounded-md select-none outline-none',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors duration-150',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
    '*:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2',
    'touch-manipulation active:scale-[0.98]',
  ],
  {
    variants: {
      size: {
        sm: 'py-2 pr-8 pl-3 text-sm min-h-[44px]',
        md: 'py-3 pr-10 pl-4 text-base min-h-[48px]',
        lg: 'py-4 pr-12 pl-5 text-lg min-h-[56px]',
        xl: 'py-5 pr-14 pl-6 text-xl min-h-[64px]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

// Haptic feedback utility
const triggerHapticFeedback = (
  intensity: 'light' | 'medium' | 'heavy' = 'light'
) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 30,
    };
    navigator.vibrate(patterns[intensity]);
  }
};

// Mobile Select Interfaces
export interface MobileSelectTriggerProps
  extends React.ComponentProps<typeof SelectPrimitive.Trigger>,
    VariantProps<typeof mobileSelectTriggerVariants> {
  hapticFeedback?: boolean;
  hapticIntensity?: 'light' | 'medium' | 'heavy';
}

export interface MobileSelectContentProps
  extends React.ComponentProps<typeof SelectPrimitive.Content>,
    VariantProps<typeof mobileSelectContentVariants> {}

export interface MobileSelectItemProps
  extends React.ComponentProps<typeof SelectPrimitive.Item>,
    VariantProps<typeof mobileSelectItemVariants> {
  hapticFeedback?: boolean;
  hapticIntensity?: 'light' | 'medium' | 'heavy';
}

// Mobile Select Components
const MobileSelect = SelectPrimitive.Root;

const MobileSelectGroup = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Group>,
  React.ComponentProps<typeof SelectPrimitive.Group>
>(({ ...props }, ref) => {
  return (
    <SelectPrimitive.Group
      ref={ref}
      data-slot="mobile-select-group"
      {...props}
    />
  );
});
MobileSelectGroup.displayName = 'MobileSelectGroup';

const MobileSelectValue = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Value>,
  React.ComponentProps<typeof SelectPrimitive.Value>
>(({ ...props }, ref) => {
  return (
    <SelectPrimitive.Value
      ref={ref}
      data-slot="mobile-select-value"
      {...props}
    />
  );
});
MobileSelectValue.displayName = 'MobileSelectValue';

const MobileSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  MobileSelectTriggerProps
>(
  (
    {
      className,
      size,
      feedback,
      state,
      hapticFeedback = true,
      hapticIntensity = 'light',
      children,
      onPointerDown,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const handlePointerDown = React.useCallback(
      (event: React.PointerEvent<HTMLButtonElement>) => {
        if (hapticFeedback) {
          triggerHapticFeedback(hapticIntensity);
        }
        onPointerDown?.(event);
      },
      [hapticFeedback, hapticIntensity, onPointerDown]
    );

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if ((event.key === 'Enter' || event.key === ' ') && hapticFeedback) {
          triggerHapticFeedback(hapticIntensity);
        }
        onKeyDown?.(event);
      },
      [hapticFeedback, hapticIntensity, onKeyDown]
    );

    return (
      <SelectPrimitive.Trigger
        ref={ref}
        data-slot="mobile-select-trigger"
        data-size={size}
        className={cn(
          mobileSelectTriggerVariants({ size, feedback, state }),
          className
        )}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-haspopup="listbox"
        {...props}
      >
        {children}
        <SelectPrimitive.Icon asChild>
          <ChevronDownIcon className="opacity-50 transition-transform duration-200 data-[state=open]:rotate-180" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
    );
  }
);
MobileSelectTrigger.displayName = 'MobileSelectTrigger';

const MobileSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  MobileSelectContentProps
>(({ className, children, position = 'popper', size, ...props }, ref) => {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        data-slot="mobile-select-content"
        className={cn(
          mobileSelectContentVariants({ size }),
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          className
        )}
        position={position}
        role="listbox"
        {...props}
      >
        <MobileSelectScrollUpButton size={size || 'md'} />
        <SelectPrimitive.Viewport
          className={cn(
            'p-2',
            position === 'popper' &&
              'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1'
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <MobileSelectScrollDownButton size={size || 'md'} />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});
MobileSelectContent.displayName = 'MobileSelectContent';

const MobileSelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentProps<typeof SelectPrimitive.Label> & {
    size?: 'sm' | 'md' | 'lg' | 'xl';
  }
>(({ className, size = 'md', ...props }, ref) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
    xl: 'px-6 py-3.5 text-lg',
  };

  return (
    <SelectPrimitive.Label
      ref={ref}
      data-slot="mobile-select-label"
      className={cn(
        'text-muted-foreground font-medium',
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
});
MobileSelectLabel.displayName = 'MobileSelectLabel';

const MobileSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  MobileSelectItemProps
>(
  (
    {
      className,
      children,
      size,
      hapticFeedback = true,
      hapticIntensity = 'light',
      onSelect,
      onPointerDown,
      ...props
    },
    ref
  ) => {
    const handleSelect = React.useCallback(() => {
      if (hapticFeedback) {
        triggerHapticFeedback(hapticIntensity);
      }
    }, [hapticFeedback, hapticIntensity]);

    const handlePointerDown = React.useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        if (hapticFeedback) {
          triggerHapticFeedback('light'); // Lighter feedback for hover
        }
        onPointerDown?.(event);
      },
      [hapticFeedback, onPointerDown]
    );

    const indicatorSizeClasses = {
      sm: 'right-3 size-4',
      md: 'right-4 size-5',
      lg: 'right-5 size-6',
      xl: 'right-6 size-7',
    };

    return (
      <SelectPrimitive.Item
        ref={ref}
        data-slot="mobile-select-item"
        className={cn(mobileSelectItemVariants({ size }), className)}
        onSelect={value => {
          handleSelect();
          onSelect?.(value);
        }}
        onPointerDown={handlePointerDown}
        role="option"
        {...props}
      >
        <span
          className={cn(
            'absolute flex items-center justify-center',
            indicatorSizeClasses[size || 'md']
          )}
        >
          <SelectPrimitive.ItemIndicator>
            <CheckIcon className="size-full" />
          </SelectPrimitive.ItemIndicator>
        </span>
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      </SelectPrimitive.Item>
    );
  }
);
MobileSelectItem.displayName = 'MobileSelectItem';

const MobileSelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentProps<typeof SelectPrimitive.Separator> & {
    size?: 'sm' | 'md' | 'lg' | 'xl';
  }
>(({ className, size = 'md', ...props }, ref) => {
  const sizeClasses = {
    sm: '-mx-2 my-1',
    md: '-mx-3 my-1.5',
    lg: '-mx-4 my-2',
    xl: '-mx-5 my-2.5',
  };

  return (
    <SelectPrimitive.Separator
      ref={ref}
      data-slot="mobile-select-separator"
      className={cn(
        'bg-border pointer-events-none h-px',
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
});
MobileSelectSeparator.displayName = 'MobileSelectSeparator';

const MobileSelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentProps<typeof SelectPrimitive.ScrollUpButton> & {
    size?: 'sm' | 'md' | 'lg' | 'xl';
  }
>(({ className, size = 'md', ...props }, ref) => {
  const sizeClasses = {
    sm: 'py-1',
    md: 'py-1.5',
    lg: 'py-2',
    xl: 'py-2.5',
  };

  return (
    <SelectPrimitive.ScrollUpButton
      ref={ref}
      data-slot="mobile-select-scroll-up-button"
      className={cn(
        'flex cursor-default items-center justify-center',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-5" />
    </SelectPrimitive.ScrollUpButton>
  );
});
MobileSelectScrollUpButton.displayName = 'MobileSelectScrollUpButton';

const MobileSelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentProps<typeof SelectPrimitive.ScrollDownButton> & {
    size?: 'sm' | 'md' | 'lg' | 'xl';
  }
>(({ className, size = 'md', ...props }, ref) => {
  const sizeClasses = {
    sm: 'py-1',
    md: 'py-1.5',
    lg: 'py-2',
    xl: 'py-2.5',
  };

  return (
    <SelectPrimitive.ScrollDownButton
      ref={ref}
      data-slot="mobile-select-scroll-down-button"
      className={cn(
        'flex cursor-default items-center justify-center',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-5" />
    </SelectPrimitive.ScrollDownButton>
  );
});
MobileSelectScrollDownButton.displayName = 'MobileSelectScrollDownButton';

// Export variants for external use
export {
  mobileSelectTriggerVariants,
  mobileSelectContentVariants,
  mobileSelectItemVariants,
};

export {
  MobileSelect,
  MobileSelectContent,
  MobileSelectGroup,
  MobileSelectItem,
  MobileSelectLabel,
  MobileSelectScrollDownButton,
  MobileSelectScrollUpButton,
  MobileSelectSeparator,
  MobileSelectTrigger,
  MobileSelectValue,
};
