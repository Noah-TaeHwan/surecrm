import * as React from 'react';
import { Button, buttonVariants } from '~/common/components/ui/button';
import {
  MobileButton,
  mobileButtonVariants,
  type MobileButtonProps,
} from './mobile-button';
import { useViewport } from '~/common/hooks/useViewport';
import type { VariantProps } from 'class-variance-authority';

// 기본 Button props와 Mobile Button props의 공통 부분만 추출
interface BaseButtonProps extends React.ComponentProps<'button'> {
  asChild?: boolean;
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

interface ResponsiveButtonProps extends BaseButtonProps {
  /**
   * 강제로 특정 버전 사용 (테스트용)
   */
  forceVariant?: 'desktop' | 'mobile';
  /**
   * 모바일에서만 사용할 추가 props
   */
  mobileOnly?: {
    touchFeedback?: 'none' | 'subtle' | 'strong';
    loading?: boolean;
    loadingText?: string;
    size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon' | 'icon-sm' | 'icon-lg';
  };
  /**
   * 터치 피드백 (모바일에서만 적용)
   */
  touchFeedback?: 'none' | 'subtle' | 'strong';
  /**
   * 로딩 상태 (모바일에서만 적용)
   */
  loading?: boolean;
  /**
   * 로딩 텍스트 (모바일에서만 적용)
   */
  loadingText?: string;
}

const ResponsiveButton = React.forwardRef<
  HTMLButtonElement,
  ResponsiveButtonProps
>(
  (
    { forceVariant, mobileOnly, touchFeedback, loading, loadingText, ...props },
    ref
  ) => {
    const viewport = useViewport();
    const isMobile = viewport.width < 768; // 768px 미만을 모바일로 간주

    // 강제 설정이 있으면 그것을 우선 사용
    const shouldUseMobile =
      forceVariant === 'mobile' || (forceVariant !== 'desktop' && isMobile);

    if (shouldUseMobile) {
      // 모바일 버전 사용 - 모바일 전용 size 옵션 포함
      const mobileSize = mobileOnly?.size || (props.size as any);
      const mobileProps: any = {
        ...props,
        size: mobileSize,
        touchFeedback: mobileOnly?.touchFeedback || touchFeedback,
        loading: mobileOnly?.loading || loading,
        loadingText: mobileOnly?.loadingText || loadingText,
      };

      return <MobileButton ref={ref} {...mobileProps} />;
    }

    // 데스크톱 버전 사용 (모바일 전용 props 제거)
    const desktopProps = { ...props };

    return <Button ref={ref} {...desktopProps} />;
  }
);

ResponsiveButton.displayName = 'ResponsiveButton';

export { ResponsiveButton, buttonVariants, mobileButtonVariants };
export type { ResponsiveButtonProps };
