import * as React from 'react';
import { useViewport } from '~/common/hooks/useViewport';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from '~/common/components/ui/card';
import {
  MobileCard,
  MobileCardHeader,
  MobileCardTitle,
  MobileCardDescription,
  MobileCardAction,
  MobileCardContent,
  MobileCardFooter,
  type MobileCardSize,
  type MobileCardInteraction,
  type MobileCardElevation,
} from './mobile-card';

// Responsive card props that combine both desktop and mobile options
interface ResponsiveCardProps extends React.ComponentProps<'div'> {
  // Mobile-specific props
  mobileSize?: MobileCardSize;
  mobileInteraction?: MobileCardInteraction;
  mobileElevation?: MobileCardElevation;
  mobileTouchFeedback?: boolean;
  mobileSwipeActions?: boolean;
  onMobileTap?: () => void;
  onMobileLongPress?: () => void;
  onMobileSwipeLeft?: () => void;
  onMobileSwipeRight?: () => void;

  // Breakpoint for switching between desktop and mobile (default: 768px)
  mobileBreakpoint?: number;
}

interface ResponsiveCardHeaderProps extends React.ComponentProps<'div'> {
  mobileCompact?: boolean;
  mobileCenterAlign?: boolean;
}

interface ResponsiveCardContentProps extends React.ComponentProps<'div'> {
  mobileScrollable?: boolean;
  mobileMaxHeight?: string;
}

interface ResponsiveCardFooterProps extends React.ComponentProps<'div'> {
  mobileSticky?: boolean;
  mobileActions?: boolean;
}

interface ResponsiveCardActionProps extends React.ComponentProps<'div'> {
  mobilePosition?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'center';
  mobileFloating?: boolean;
}

function ResponsiveCard({
  mobileSize = 'default',
  mobileInteraction = 'none',
  mobileElevation = 'low',
  mobileTouchFeedback = false,
  mobileSwipeActions = false,
  onMobileTap,
  onMobileLongPress,
  onMobileSwipeLeft,
  onMobileSwipeRight,
  mobileBreakpoint = 768,
  children,
  ...props
}: ResponsiveCardProps) {
  const { width } = useViewport();
  const isMobile = width < mobileBreakpoint;

  if (isMobile) {
    return (
      <MobileCard
        size={mobileSize}
        interaction={mobileInteraction}
        elevation={mobileElevation}
        touchFeedback={mobileTouchFeedback}
        swipeActions={mobileSwipeActions}
        onTap={onMobileTap}
        onLongPress={onMobileLongPress}
        onSwipeLeft={onMobileSwipeLeft}
        onSwipeRight={onMobileSwipeRight}
        {...props}
      >
        {children}
      </MobileCard>
    );
  }

  return <Card {...props}>{children}</Card>;
}

function ResponsiveCardHeader({
  mobileCompact = false,
  mobileCenterAlign = false,
  ...props
}: ResponsiveCardHeaderProps) {
  const { width } = useViewport();
  const isMobile = width < 768;

  if (isMobile) {
    return (
      <MobileCardHeader
        compact={mobileCompact}
        centerAlign={mobileCenterAlign}
        {...props}
      />
    );
  }

  return <CardHeader {...props} />;
}

function ResponsiveCardTitle(props: React.ComponentProps<'div'>) {
  const { width } = useViewport();
  const isMobile = width < 768;

  if (isMobile) {
    return <MobileCardTitle {...props} />;
  }

  return <CardTitle {...props} />;
}

function ResponsiveCardDescription(props: React.ComponentProps<'div'>) {
  const { width } = useViewport();
  const isMobile = width < 768;

  if (isMobile) {
    return <MobileCardDescription {...props} />;
  }

  return <CardDescription {...props} />;
}

function ResponsiveCardAction({
  mobilePosition = 'top-right',
  mobileFloating = false,
  ...props
}: ResponsiveCardActionProps) {
  const { width } = useViewport();
  const isMobile = width < 768;

  if (isMobile) {
    return (
      <MobileCardAction
        position={mobilePosition}
        floating={mobileFloating}
        {...props}
      />
    );
  }

  return <CardAction {...props} />;
}

function ResponsiveCardContent({
  mobileScrollable = false,
  mobileMaxHeight,
  ...props
}: ResponsiveCardContentProps) {
  const { width } = useViewport();
  const isMobile = width < 768;

  if (isMobile) {
    return (
      <MobileCardContent
        scrollable={mobileScrollable}
        maxHeight={mobileMaxHeight}
        {...props}
      />
    );
  }

  return <CardContent {...props} />;
}

function ResponsiveCardFooter({
  mobileSticky = false,
  mobileActions = false,
  ...props
}: ResponsiveCardFooterProps) {
  const { width } = useViewport();
  const isMobile = width < 768;

  if (isMobile) {
    return (
      <MobileCardFooter
        sticky={mobileSticky}
        actions={mobileActions}
        {...props}
      />
    );
  }

  return <CardFooter {...props} />;
}

export {
  ResponsiveCard,
  ResponsiveCardHeader,
  ResponsiveCardTitle,
  ResponsiveCardDescription,
  ResponsiveCardAction,
  ResponsiveCardContent,
  ResponsiveCardFooter,
};

export type {
  ResponsiveCardProps,
  ResponsiveCardHeaderProps,
  ResponsiveCardContentProps,
  ResponsiveCardFooterProps,
  ResponsiveCardActionProps,
};
