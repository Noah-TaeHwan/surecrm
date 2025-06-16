import * as React from 'react';
import { useViewport } from '~/common/hooks/useViewport';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/common/components/ui/dialog';
import {
  MobileDialog,
  MobileDialogClose,
  MobileDialogContent,
  MobileDialogDescription,
  MobileDialogFooter,
  MobileDialogHeader,
  MobileDialogTitle,
  MobileDialogTrigger,
  type MobileDialogSize,
  type MobileDialogProps,
  type MobileDialogContentProps,
} from './mobile-dialog';

interface ResponsiveDialogProps extends MobileDialogProps {
  mobileBreakpoint?: number;
}

interface ResponsiveDialogContentProps extends MobileDialogContentProps {
  mobileBreakpoint?: number;
}

function ResponsiveDialog({ 
  mobileBreakpoint = 768, 
  ...props 
}: ResponsiveDialogProps) {
  const { width } = useViewport();
  const isMobile = width < mobileBreakpoint;

  if (isMobile) {
    return <MobileDialog {...props} />;
  }

  return <Dialog {...props} />;
}

function ResponsiveDialogTrigger({
  children,
  mobileBreakpoint = 768,
  ...props
}: React.ComponentProps<typeof DialogTrigger> & { mobileBreakpoint?: number }) {
  const { width } = useViewport();
  const isMobile = width < mobileBreakpoint;

  if (isMobile) {
    return <MobileDialogTrigger {...props}>{children}</MobileDialogTrigger>;
  }

  return <DialogTrigger {...props}>{children}</DialogTrigger>;
}

function ResponsiveDialogContent({
  children,
  mobileBreakpoint = 768,
  size = 'md',
  dismissible = true,
  swipeToClose = true,
  showDragHandle = true,
  ...props
}: ResponsiveDialogContentProps) {
  const { width } = useViewport();
  const isMobile = width < mobileBreakpoint;

  if (isMobile) {
    return (
      <MobileDialogContent
        size={size}
        dismissible={dismissible}
        swipeToClose={swipeToClose}
        showDragHandle={showDragHandle}
        {...props}
      >
        {children}
      </MobileDialogContent>
    );
  }

  return <DialogContent {...props}>{children}</DialogContent>;
}

function ResponsiveDialogHeader({
  children,
  mobileBreakpoint = 768,
  ...props
}: React.ComponentProps<typeof DialogHeader> & { mobileBreakpoint?: number }) {
  const { width } = useViewport();
  const isMobile = width < mobileBreakpoint;

  if (isMobile) {
    return <MobileDialogHeader {...props}>{children}</MobileDialogHeader>;
  }

  return <DialogHeader {...props}>{children}</DialogHeader>;
}

function ResponsiveDialogFooter({
  children,
  mobileBreakpoint = 768,
  ...props
}: React.ComponentProps<typeof DialogFooter> & { mobileBreakpoint?: number }) {
  const { width } = useViewport();
  const isMobile = width < mobileBreakpoint;

  if (isMobile) {
    return <MobileDialogFooter {...props}>{children}</MobileDialogFooter>;
  }

  return <DialogFooter {...props}>{children}</DialogFooter>;
}

function ResponsiveDialogTitle({
  children,
  mobileBreakpoint = 768,
  ...props
}: React.ComponentProps<typeof DialogTitle> & { mobileBreakpoint?: number }) {
  const { width } = useViewport();
  const isMobile = width < mobileBreakpoint;

  if (isMobile) {
    return <MobileDialogTitle {...props}>{children}</MobileDialogTitle>;
  }

  return <DialogTitle {...props}>{children}</DialogTitle>;
}

function ResponsiveDialogDescription({
  children,
  mobileBreakpoint = 768,
  ...props
}: React.ComponentProps<typeof DialogDescription> & { mobileBreakpoint?: number }) {
  const { width } = useViewport();
  const isMobile = width < mobileBreakpoint;

  if (isMobile) {
    return <MobileDialogDescription {...props}>{children}</MobileDialogDescription>;
  }

  return <DialogDescription {...props}>{children}</DialogDescription>;
}

function ResponsiveDialogClose({
  children,
  mobileBreakpoint = 768,
  ...props
}: React.ComponentProps<typeof DialogClose> & { mobileBreakpoint?: number }) {
  const { width } = useViewport();
  const isMobile = width < mobileBreakpoint;

  if (isMobile) {
    return <MobileDialogClose {...props}>{children}</MobileDialogClose>;
  }

  return <DialogClose {...props}>{children}</DialogClose>;
}

export {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
  type ResponsiveDialogProps,
  type ResponsiveDialogContentProps,
}; 