import * as React from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { cn } from '~/lib/utils';

// Mobile table display modes
type MobileTableMode = 'cards' | 'horizontal-scroll' | 'stacked';

// Mobile table density
type MobileTableDensity = 'compact' | 'comfortable' | 'spacious';

// Mobile table interaction
type MobileTableInteraction = 'none' | 'tap' | 'swipe' | 'long-press';

interface MobileTableProps extends React.ComponentProps<'div'> {
  mode?: MobileTableMode;
  density?: MobileTableDensity;
  interaction?: MobileTableInteraction;
  onRowClick?: (index: number, data: any) => void;
  onRowLongPress?: (index: number, data: any) => void;
  hapticFeedback?: boolean;
  virtualScrolling?: boolean;
  maxHeight?: string;
}

interface MobileTableRowProps extends React.ComponentProps<'div'> {
  index?: number;
  data?: any;
  mode?: MobileTableMode;
  density?: MobileTableDensity;
  interaction?: MobileTableInteraction;
  onRowClick?: (index: number, data: any) => void;
  onRowLongPress?: (index: number, data: any) => void;
  hapticFeedback?: boolean;
  isSelected?: boolean;
  isHighlighted?: boolean;
}

interface MobileTableCellProps extends React.ComponentProps<'div'> {
  label?: string;
  primary?: boolean;
  secondary?: boolean;
  numeric?: boolean;
  truncate?: boolean;
}

interface MobileTableHeaderProps extends React.ComponentProps<'div'> {
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
  sticky?: boolean;
}

// Haptic feedback utility
const triggerHapticFeedback = (
  type: 'light' | 'medium' | 'heavy' = 'light'
) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    const patterns = {
      light: 20,
      medium: 40,
      heavy: 60,
    };
    navigator.vibrate(patterns[type]);
  }
};

// Get density classes
const getDensityClasses = (density: MobileTableDensity) => {
  const densityMap = {
    compact: 'p-2 gap-1',
    comfortable: 'p-3 gap-2',
    spacious: 'p-4 gap-3',
  };
  return densityMap[density];
};

// Mobile Table Root
const MobileTable = React.forwardRef<HTMLDivElement, MobileTableProps>(
  (
    {
      className,
      children,
      mode = 'cards',
      density = 'comfortable',
      interaction = 'tap',
      onRowClick,
      onRowLongPress,
      hapticFeedback = true,
      virtualScrolling = false,
      maxHeight,
      ...props
    },
    ref
  ) => {
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useImperativeHandle(ref, () => containerRef.current!);

    const containerClasses = React.useMemo(() => {
      const baseClasses = 'mobile-table w-full';

      if (mode === 'horizontal-scroll') {
        return cn(
          baseClasses,
          'overflow-x-auto',
          'scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent',
          className
        );
      }

      if (mode === 'cards') {
        return cn(
          baseClasses,
          'space-y-2',
          virtualScrolling && 'max-h-[60vh] overflow-y-auto',
          className
        );
      }

      if (mode === 'stacked') {
        return cn(baseClasses, 'divide-y divide-gray-100', className);
      }

      return cn(baseClasses, className);
    }, [mode, virtualScrolling, className]);

    const containerStyle = React.useMemo(() => {
      return maxHeight ? { maxHeight } : undefined;
    }, [maxHeight]);

    return (
      <div
        ref={containerRef}
        className={containerClasses}
        style={containerStyle}
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            const additionalProps = {
              mode,
              density,
              interaction,
              onRowClick,
              onRowLongPress,
              hapticFeedback,
              index,
            };
            return React.cloneElement(child, additionalProps);
          }
          return child;
        })}
      </div>
    );
  }
);
MobileTable.displayName = 'MobileTable';

// Mobile Table Header
const MobileTableHeader = React.forwardRef<
  HTMLDivElement,
  MobileTableHeaderProps
>(
  (
    {
      className,
      children,
      sortable = false,
      sortDirection = null,
      onSort,
      sticky = false,
      ...props
    },
    ref
  ) => {
    const handleSort = React.useCallback(() => {
      if (sortable && onSort) {
        triggerHapticFeedback('light');
        onSort();
      }
    }, [sortable, onSort]);

    if (sticky) {
      return (
        <div
          ref={ref}
          className={cn(
            'sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b',
            'min-h-[44px] flex items-center justify-between px-4 py-2',
            sortable && 'cursor-pointer active:bg-gray-50',
            className
          )}
          onClick={handleSort}
          {...props}
        >
          <div className="flex items-center space-x-2">{children}</div>
          {sortable && (
            <div className="flex items-center space-x-1">
              {sortDirection === 'asc' && <ChevronUpIcon className="h-4 w-4" />}
              {sortDirection === 'desc' && (
                <ChevronDownIcon className="h-4 w-4" />
              )}
              {sortDirection === null && (
                <div className="h-4 w-4 opacity-40">
                  <ChevronUpIcon className="h-3 w-3" />
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'bg-gray-50 border-b',
          'min-h-[44px] flex items-center justify-between px-4 py-2',
          sortable && 'cursor-pointer active:bg-gray-100',
          className
        )}
        onClick={handleSort}
        {...props}
      >
        <div className="flex items-center space-x-2">{children}</div>
        {sortable && (
          <div className="flex items-center space-x-1">
            {sortDirection === 'asc' && <ChevronUpIcon className="h-4 w-4" />}
            {sortDirection === 'desc' && (
              <ChevronDownIcon className="h-4 w-4" />
            )}
            {sortDirection === null && (
              <div className="h-4 w-4 opacity-40">
                <ChevronUpIcon className="h-3 w-3" />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);
MobileTableHeader.displayName = 'MobileTableHeader';

// Mobile Table Row
const MobileTableRow = React.forwardRef<HTMLDivElement, MobileTableRowProps>(
  (
    {
      className,
      children,
      index = 0,
      data,
      mode = 'cards',
      density = 'comfortable',
      interaction = 'tap',
      onRowClick,
      onRowLongPress,
      hapticFeedback = true,
      isSelected = false,
      isHighlighted = false,
      ...props
    },
    ref
  ) => {
    const [isPressed, setIsPressed] = React.useState(false);
    const longPressTimer = React.useRef<NodeJS.Timeout | null>(null);

    const handleTouchStart = React.useCallback(() => {
      if (interaction === 'none') return;

      setIsPressed(true);

      if (hapticFeedback) {
        triggerHapticFeedback('light');
      }

      if (interaction === 'long-press' || interaction === 'tap') {
        longPressTimer.current = setTimeout(() => {
          if (hapticFeedback) {
            triggerHapticFeedback('medium');
          }
          onRowLongPress?.(index, data);
        }, 500);
      }
    }, [interaction, hapticFeedback, onRowLongPress, index, data]);

    const handleTouchEnd = React.useCallback(() => {
      setIsPressed(false);

      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      if (interaction === 'tap') {
        onRowClick?.(index, data);
      }
    }, [interaction, onRowClick, index, data]);

    const handleClick = React.useCallback(() => {
      if (interaction === 'tap') {
        if (hapticFeedback) {
          triggerHapticFeedback('light');
        }
        onRowClick?.(index, data);
      }
    }, [interaction, hapticFeedback, onRowClick, index, data]);

    // Card mode styling
    if (mode === 'cards') {
      return (
        <div
          ref={ref}
          className={cn(
            'bg-white border border-gray-200 rounded-lg shadow-sm',
            getDensityClasses(density),
            // Interactive states
            interaction !== 'none' && [
              'cursor-pointer transition-all duration-150',
              'hover:shadow-md hover:border-gray-300',
              'active:scale-[0.98] active:shadow-sm',
            ],
            // Selection states
            isSelected && 'border-red-500 bg-red-50',
            isHighlighted && 'border-blue-500 bg-blue-50',
            // Press state
            isPressed && 'scale-[0.98] shadow-sm',
            className
          )}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={handleClick}
          {...props}
        >
          <div className="space-y-2">{children}</div>
        </div>
      );
    }

    // Stacked mode styling
    if (mode === 'stacked') {
      return (
        <div
          ref={ref}
          className={cn(
            'bg-white',
            getDensityClasses(density),
            // Interactive states
            interaction !== 'none' && [
              'cursor-pointer transition-all duration-150',
              'hover:bg-gray-50',
              'active:bg-gray-100',
            ],
            // Selection states
            isSelected && 'bg-red-50 border-l-4 border-l-red-500',
            isHighlighted && 'bg-blue-50 border-l-4 border-l-blue-500',
            // Press state
            isPressed && 'bg-gray-100',
            className
          )}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={handleClick}
          {...props}
        >
          <div className="space-y-1">{children}</div>
        </div>
      );
    }

    // Horizontal scroll mode (traditional table row)
    return (
      <div
        ref={ref}
        className={cn(
          'flex min-w-max border-b border-gray-100',
          getDensityClasses(density),
          // Interactive states
          interaction !== 'none' && [
            'cursor-pointer transition-all duration-150',
            'hover:bg-gray-50',
            'active:bg-gray-100',
          ],
          // Selection states
          isSelected && 'bg-red-50',
          isHighlighted && 'bg-blue-50',
          // Press state
          isPressed && 'bg-gray-100',
          className
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
        {...props}
      >
        {children}
      </div>
    );
  }
);
MobileTableRow.displayName = 'MobileTableRow';

// Mobile Table Cell
const MobileTableCell = React.forwardRef<HTMLDivElement, MobileTableCellProps>(
  (
    {
      className,
      children,
      label,
      primary = false,
      secondary = false,
      numeric = false,
      truncate = false,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col',
          // Text alignment
          numeric && 'items-end text-right',
          !numeric && 'items-start text-left',
          className
        )}
        {...props}
      >
        {label && (
          <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
            {label}
          </div>
        )}
        <div
          className={cn(
            'w-full',
            // Text styling
            primary && 'font-semibold text-foreground text-base',
            secondary && 'text-muted-foreground text-sm',
            !primary && !secondary && 'text-foreground text-sm',
            // Truncation
            truncate && 'truncate'
          )}
        >
          {children}
        </div>
      </div>
    );
  }
);
MobileTableCell.displayName = 'MobileTableCell';

// Mobile Table Body (for wrapping rows)
const MobileTableBody = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('mobile-table-body', className)} {...props}>
    {children}
  </div>
));
MobileTableBody.displayName = 'MobileTableBody';

// Mobile Table Footer
const MobileTableFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { sticky?: boolean }
>(({ className, sticky = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'bg-gray-50 border-t px-4 py-3',
      sticky && 'sticky bottom-0',
      'pb-safe-area-inset-bottom',
      className
    )}
    {...props}
  />
));
MobileTableFooter.displayName = 'MobileTableFooter';

export {
  MobileTable,
  MobileTableHeader,
  MobileTableRow,
  MobileTableCell,
  MobileTableBody,
  MobileTableFooter,
};

export type { MobileTableMode, MobileTableDensity, MobileTableInteraction };
