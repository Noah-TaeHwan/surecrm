import * as React from 'react';
import { useViewportWidth } from '~/common/hooks/useViewport';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from '~/common/components/ui/select';
import {
  MobileSelect,
  MobileSelectContent,
  MobileSelectItem,
  MobileSelectTrigger,
  MobileSelectValue,
  MobileSelectGroup,
  MobileSelectLabel,
  MobileSelectSeparator,
  type MobileSelectTriggerProps,
  type MobileSelectContentProps,
  type MobileSelectItemProps,
} from './mobile-select';

// Responsive Select Types
export interface ResponsiveSelectProps
  extends React.ComponentProps<typeof Select> {
  forceVariant?: 'desktop' | 'mobile';
  mobileOnly?: boolean;
  // Mobile-specific props
  mobileSize?: 'sm' | 'md' | 'lg' | 'xl';
  mobileFeedback?: 'subtle' | 'medium' | 'strong';
  mobileState?: 'default' | 'error' | 'success' | 'warning';
  hapticFeedback?: boolean;
  hapticIntensity?: 'light' | 'medium' | 'heavy';
}

export interface ResponsiveSelectTriggerProps
  extends Omit<React.ComponentProps<typeof SelectTrigger>, 'size'> {
  forceVariant?: 'desktop' | 'mobile';
  mobileOnly?: boolean;
  // Mobile-specific props
  size?: 'sm' | 'md' | 'lg' | 'xl';
  feedback?: 'subtle' | 'medium' | 'strong';
  state?: 'default' | 'error' | 'success' | 'warning';
  hapticFeedback?: boolean;
  hapticIntensity?: 'light' | 'medium' | 'heavy';
}

export interface ResponsiveSelectContentProps
  extends React.ComponentProps<typeof SelectContent> {
  forceVariant?: 'desktop' | 'mobile';
  mobileOnly?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface ResponsiveSelectItemProps
  extends React.ComponentProps<typeof SelectItem> {
  forceVariant?: 'desktop' | 'mobile';
  mobileOnly?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hapticFeedback?: boolean;
  hapticIntensity?: 'light' | 'medium' | 'heavy';
}

// Responsive Select Components
const ResponsiveSelect = React.forwardRef<
  React.ElementRef<typeof Select>,
  ResponsiveSelectProps
>(
  (
    {
      forceVariant,
      mobileOnly,
      mobileSize,
      mobileFeedback,
      mobileState,
      hapticFeedback,
      hapticIntensity,
      ...props
    },
    ref
  ) => {
    const viewportWidth = useViewportWidth();
    const isMobile =
      mobileOnly ||
      forceVariant === 'mobile' ||
      (forceVariant !== 'desktop' && viewportWidth < 768);

    if (isMobile) {
      return <MobileSelect {...props} />;
    }

    return <Select {...props} />;
  }
);
ResponsiveSelect.displayName = 'ResponsiveSelect';

const ResponsiveSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectTrigger>,
  ResponsiveSelectTriggerProps
>(
  (
    {
      forceVariant,
      mobileOnly,
      size,
      feedback,
      state,
      hapticFeedback,
      hapticIntensity,
      className,
      ...props
    },
    ref
  ) => {
    const viewportWidth = useViewportWidth();
    const isMobile =
      mobileOnly ||
      forceVariant === 'mobile' ||
      (forceVariant !== 'desktop' && viewportWidth < 768);

    if (isMobile) {
      return (
        <MobileSelectTrigger
          ref={ref}
          size={size}
          feedback={feedback}
          state={state}
          hapticFeedback={hapticFeedback}
          hapticIntensity={hapticIntensity}
          className={className}
          {...props}
        />
      );
    }

    // Map mobile size to desktop size
    const desktopSize = size === 'sm' ? 'sm' : 'default';

    return (
      <SelectTrigger
        ref={ref}
        size={desktopSize}
        className={className}
        {...props}
      />
    );
  }
);
ResponsiveSelectTrigger.displayName = 'ResponsiveSelectTrigger';

const ResponsiveSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectContent>,
  ResponsiveSelectContentProps
>(({ forceVariant, mobileOnly, size, ...props }, ref) => {
  const viewportWidth = useViewportWidth();
  const isMobile =
    mobileOnly ||
    forceVariant === 'mobile' ||
    (forceVariant !== 'desktop' && viewportWidth < 768);

  if (isMobile) {
    return <MobileSelectContent ref={ref} size={size} {...props} />;
  }

  return <SelectContent ref={ref} {...props} />;
});
ResponsiveSelectContent.displayName = 'ResponsiveSelectContent';

const ResponsiveSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectItem>,
  ResponsiveSelectItemProps
>(
  (
    {
      forceVariant,
      mobileOnly,
      size,
      hapticFeedback,
      hapticIntensity,
      ...props
    },
    ref
  ) => {
    const viewportWidth = useViewportWidth();
    const isMobile =
      mobileOnly ||
      forceVariant === 'mobile' ||
      (forceVariant !== 'desktop' && viewportWidth < 768);

    if (isMobile) {
      return (
        <MobileSelectItem
          ref={ref}
          size={size}
          hapticFeedback={hapticFeedback}
          hapticIntensity={hapticIntensity}
          {...props}
        />
      );
    }

    return <SelectItem ref={ref} {...props} />;
  }
);
ResponsiveSelectItem.displayName = 'ResponsiveSelectItem';

const ResponsiveSelectValue = React.forwardRef<
  React.ElementRef<typeof SelectValue>,
  React.ComponentProps<typeof SelectValue> & {
    forceVariant?: 'desktop' | 'mobile';
    mobileOnly?: boolean;
  }
>(({ forceVariant, mobileOnly, ...props }, ref) => {
  const viewportWidth = useViewportWidth();
  const isMobile =
    mobileOnly ||
    forceVariant === 'mobile' ||
    (forceVariant !== 'desktop' && viewportWidth < 768);

  if (isMobile) {
    return <MobileSelectValue ref={ref} {...props} />;
  }

  return <SelectValue ref={ref} {...props} />;
});
ResponsiveSelectValue.displayName = 'ResponsiveSelectValue';

const ResponsiveSelectGroup = React.forwardRef<
  React.ElementRef<typeof SelectGroup>,
  React.ComponentProps<typeof SelectGroup> & {
    forceVariant?: 'desktop' | 'mobile';
    mobileOnly?: boolean;
  }
>(({ forceVariant, mobileOnly, ...props }, ref) => {
  const viewportWidth = useViewportWidth();
  const isMobile =
    mobileOnly ||
    forceVariant === 'mobile' ||
    (forceVariant !== 'desktop' && viewportWidth < 768);

  if (isMobile) {
    return <MobileSelectGroup ref={ref} {...props} />;
  }

  return <SelectGroup ref={ref} {...props} />;
});
ResponsiveSelectGroup.displayName = 'ResponsiveSelectGroup';

const ResponsiveSelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectLabel>,
  React.ComponentProps<typeof SelectLabel> & {
    forceVariant?: 'desktop' | 'mobile';
    mobileOnly?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
  }
>(({ forceVariant, mobileOnly, size, ...props }, ref) => {
  const viewportWidth = useViewportWidth();
  const isMobile =
    mobileOnly ||
    forceVariant === 'mobile' ||
    (forceVariant !== 'desktop' && viewportWidth < 768);

  if (isMobile) {
    return <MobileSelectLabel ref={ref} size={size} {...props} />;
  }

  return <SelectLabel ref={ref} {...props} />;
});
ResponsiveSelectLabel.displayName = 'ResponsiveSelectLabel';

const ResponsiveSelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectSeparator>,
  React.ComponentProps<typeof SelectSeparator> & {
    forceVariant?: 'desktop' | 'mobile';
    mobileOnly?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
  }
>(({ forceVariant, mobileOnly, size, ...props }, ref) => {
  const viewportWidth = useViewportWidth();
  const isMobile =
    mobileOnly ||
    forceVariant === 'mobile' ||
    (forceVariant !== 'desktop' && viewportWidth < 768);

  if (isMobile) {
    return <MobileSelectSeparator ref={ref} size={size} {...props} />;
  }

  return <SelectSeparator ref={ref} {...props} />;
});
ResponsiveSelectSeparator.displayName = 'ResponsiveSelectSeparator';

export {
  ResponsiveSelect,
  ResponsiveSelectContent,
  ResponsiveSelectGroup,
  ResponsiveSelectItem,
  ResponsiveSelectLabel,
  ResponsiveSelectSeparator,
  ResponsiveSelectTrigger,
  ResponsiveSelectValue,
};
