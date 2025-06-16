import * as React from 'react';
import { useViewport } from '~/common/hooks/useViewport';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '~/common/components/ui/table';
import {
  MobileTable,
  MobileTableHeader,
  MobileTableRow,
  MobileTableCell,
  MobileTableBody,
  MobileTableFooter,
  type MobileTableMode,
  type MobileTableDensity,
  type MobileTableInteraction,
} from './mobile-table';

// Responsive table props that combine both desktop and mobile options
interface ResponsiveTableProps extends React.ComponentProps<'div'> {
  // Mobile-specific props
  mobileMode?: MobileTableMode;
  mobileDensity?: MobileTableDensity;
  mobileInteraction?: MobileTableInteraction;
  onMobileRowClick?: (index: number, data: any) => void;
  onMobileRowLongPress?: (index: number, data: any) => void;
  mobileHapticFeedback?: boolean;
  mobileVirtualScrolling?: boolean;
  mobileMaxHeight?: string;
  
  // Force mode (useful for testing)
  forceMode?: 'mobile' | 'desktop';
}

interface ResponsiveTableHeaderProps extends React.ComponentProps<'thead'> {
  // Mobile-specific props
  mobileSortable?: boolean;
  mobileSortDirection?: 'asc' | 'desc' | null;
  onMobileSort?: () => void;
  mobileSticky?: boolean;
}

interface ResponsiveTableRowProps extends React.ComponentProps<'tr'> {
  // Mobile-specific props
  mobileIndex?: number;
  mobileData?: any;
  mobileIsSelected?: boolean;
  mobileIsHighlighted?: boolean;
}

interface ResponsiveTableCellProps extends React.ComponentProps<'td'> {
  // Mobile-specific props
  mobileLabel?: string;
  mobilePrimary?: boolean;
  mobileSecondary?: boolean;
  mobileNumeric?: boolean;
  mobileTruncate?: boolean;
}

interface ResponsiveTableFooterProps extends React.ComponentProps<'tfoot'> {
  // Mobile-specific props
  mobileSticky?: boolean;
}

// Responsive Table Root
const ResponsiveTable = React.forwardRef<HTMLDivElement, ResponsiveTableProps>(
  ({
    className,
    children,
    mobileMode = 'cards',
    mobileDensity = 'comfortable',
    mobileInteraction = 'tap',
    onMobileRowClick,
    onMobileRowLongPress,
    mobileHapticFeedback = true,
    mobileVirtualScrolling = false,
    mobileMaxHeight,
    forceMode,
    ...props
  }, ref) => {
    const { isMobile } = useViewport();
    
    const shouldUseMobile = forceMode === 'mobile' || (forceMode !== 'desktop' && isMobile);

    if (shouldUseMobile) {
      return (
        <MobileTable
          ref={ref}
          className={className}
          mode={mobileMode}
          density={mobileDensity}
          interaction={mobileInteraction}
          onRowClick={onMobileRowClick}
          onRowLongPress={onMobileRowLongPress}
          hapticFeedback={mobileHapticFeedback}
          virtualScrolling={mobileVirtualScrolling}
          maxHeight={mobileMaxHeight}
          {...props}
        >
          {children}
        </MobileTable>
      );
    }

    // Desktop mode - use regular Table
    return (
      <div ref={ref} className={className} {...props}>
        <Table>
          {children}
        </Table>
      </div>
    );
  }
);
ResponsiveTable.displayName = 'ResponsiveTable';

// Responsive Table Header
const ResponsiveTableHeader = React.forwardRef<HTMLTableSectionElement, ResponsiveTableHeaderProps>(
  ({
    className,
    children,
    mobileSortable = false,
    mobileSortDirection = null,
    onMobileSort,
    mobileSticky = false,
    ...props
  }, ref) => {
    const { isMobile } = useViewport();

    if (isMobile) {
      return (
        <MobileTableHeader
          className={className}
          sortable={mobileSortable}
          sortDirection={mobileSortDirection}
          onSort={onMobileSort}
          sticky={mobileSticky}
          {...props}
        >
          {children}
        </MobileTableHeader>
      );
    }

    return (
      <TableHeader ref={ref} className={className} {...props}>
        {children}
      </TableHeader>
    );
  }
);
ResponsiveTableHeader.displayName = 'ResponsiveTableHeader';

// Responsive Table Body
const ResponsiveTableBody = React.forwardRef<HTMLTableSectionElement, React.ComponentProps<'tbody'>>(
  ({ className, children, ...props }, ref) => {
    const { isMobile } = useViewport();

    if (isMobile) {
      return (
        <MobileTableBody className={className} {...props}>
          {children}
        </MobileTableBody>
      );
    }

    return (
      <TableBody ref={ref} className={className} {...props}>
        {children}
      </TableBody>
    );
  }
);
ResponsiveTableBody.displayName = 'ResponsiveTableBody';

// Responsive Table Row
const ResponsiveTableRow = React.forwardRef<HTMLTableRowElement, ResponsiveTableRowProps>(
  ({
    className,
    children,
    mobileIndex = 0,
    mobileData,
    mobileIsSelected = false,
    mobileIsHighlighted = false,
    ...props
  }, ref) => {
    const { isMobile } = useViewport();

    if (isMobile) {
      return (
        <MobileTableRow
          className={className}
          index={mobileIndex}
          data={mobileData}
          isSelected={mobileIsSelected}
          isHighlighted={mobileIsHighlighted}
          {...props}
        >
          {children}
        </MobileTableRow>
      );
    }

    return (
      <TableRow ref={ref} className={className} {...props}>
        {children}
      </TableRow>
    );
  }
);
ResponsiveTableRow.displayName = 'ResponsiveTableRow';

// Responsive Table Cell
const ResponsiveTableCell = React.forwardRef<HTMLTableCellElement, ResponsiveTableCellProps>(
  ({
    className,
    children,
    mobileLabel,
    mobilePrimary = false,
    mobileSecondary = false,
    mobileNumeric = false,
    mobileTruncate = false,
    ...props
  }, ref) => {
    const { isMobile } = useViewport();

    if (isMobile) {
      return (
        <MobileTableCell
          className={className}
          label={mobileLabel}
          primary={mobilePrimary}
          secondary={mobileSecondary}
          numeric={mobileNumeric}
          truncate={mobileTruncate}
          {...props}
        >
          {children}
        </MobileTableCell>
      );
    }

    return (
      <TableCell ref={ref} className={className} {...props}>
        {children}
      </TableCell>
    );
  }
);
ResponsiveTableCell.displayName = 'ResponsiveTableCell';

// Responsive Table Head (desktop only)
const ResponsiveTableHead = React.forwardRef<HTMLTableCellElement, React.ComponentProps<'th'>>(
  ({ className, children, ...props }, ref) => {
    const { isMobile } = useViewport();

    if (isMobile) {
      // Mobile doesn't use table heads in the same way
      return null;
    }

    return (
      <TableHead ref={ref} className={className} {...props}>
        {children}
      </TableHead>
    );
  }
);
ResponsiveTableHead.displayName = 'ResponsiveTableHead';

// Responsive Table Footer
const ResponsiveTableFooter = React.forwardRef<HTMLTableSectionElement, ResponsiveTableFooterProps>(
  ({
    className,
    children,
    mobileSticky = false,
    ...props
  }, ref) => {
    const { isMobile } = useViewport();

    if (isMobile) {
      return (
        <MobileTableFooter
          className={className}
          sticky={mobileSticky}
          {...props}
        >
          {children}
        </MobileTableFooter>
      );
    }

    return (
      <TableFooter ref={ref} className={className} {...props}>
        {children}
      </TableFooter>
    );
  }
);
ResponsiveTableFooter.displayName = 'ResponsiveTableFooter';

// Responsive Table Caption (desktop only)
const ResponsiveTableCaption = React.forwardRef<HTMLTableCaptionElement, React.ComponentProps<'caption'>>(
  ({ className, children, ...props }, ref) => {
    const { isMobile } = useViewport();

    if (isMobile) {
      // Caption doesn't make sense in mobile card/stacked mode
      return null;
    }

    return (
      <TableCaption ref={ref} className={className} {...props}>
        {children}
      </TableCaption>
    );
  }
);
ResponsiveTableCaption.displayName = 'ResponsiveTableCaption';

export {
  ResponsiveTable,
  ResponsiveTableHeader,
  ResponsiveTableBody,
  ResponsiveTableRow,
  ResponsiveTableCell,
  ResponsiveTableHead,
  ResponsiveTableFooter,
  ResponsiveTableCaption,
};

export type {
  ResponsiveTableProps,
  ResponsiveTableHeaderProps,
  ResponsiveTableRowProps,
  ResponsiveTableCellProps,
  ResponsiveTableFooterProps,
}; 