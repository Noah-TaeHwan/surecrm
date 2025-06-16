import * as React from 'react';
import { Input } from '~/common/components/ui/input';
import { MobileInput, type MobileInputProps } from './mobile-input';
import { useViewportWidth } from '~/common/hooks';

// 기본 Input props와 Mobile Input props의 공통 부분만 추출
interface BaseInputProps extends Omit<React.ComponentProps<'input'>, 'size'> {
  /**
   * 입력 필드의 라벨 (접근성을 위해 권장)
   */
  label?: string;
  /**
   * 에러 메시지
   */
  error?: string;
  /**
   * 도움말 텍스트
   */
  helperText?: string;
}

interface ResponsiveInputProps extends BaseInputProps {
  /**
   * 강제로 특정 버전 사용 (테스트용)
   */
  forceVariant?: 'desktop' | 'mobile';
  /**
   * 모바일에서만 사용할 추가 props
   */
  mobileOnly?: {
    size?: 'sm' | 'default' | 'lg' | 'xl';
    state?: 'default' | 'error' | 'success' | 'warning';
    touchFeedback?: 'none' | 'subtle' | 'medium' | 'strong';
    successMessage?: string;
    warningMessage?: string;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    inputMode?:
      | 'none'
      | 'text'
      | 'tel'
      | 'url'
      | 'email'
      | 'numeric'
      | 'decimal'
      | 'search';
    enableHapticFeedback?: boolean;
    containerClassName?: string;
    labelClassName?: string;
    errorClassName?: string;
    helperClassName?: string;
  };
  /**
   * 모바일 크기 (모바일에서만 적용)
   */
  size?: 'sm' | 'default' | 'lg' | 'xl';
  /**
   * 입력 상태 (모바일에서만 적용)
   */
  state?: 'default' | 'error' | 'success' | 'warning';
  /**
   * 터치 피드백 (모바일에서만 적용)
   */
  touchFeedback?: 'none' | 'subtle' | 'medium' | 'strong';
  /**
   * 성공 메시지 (모바일에서만 적용)
   */
  successMessage?: string;
  /**
   * 경고 메시지 (모바일에서만 적용)
   */
  warningMessage?: string;
  /**
   * 시작 아이콘 (모바일에서만 적용)
   */
  startIcon?: React.ReactNode;
  /**
   * 끝 아이콘 (모바일에서만 적용)
   */
  endIcon?: React.ReactNode;
  /**
   * 네이티브 키보드 타입 (모바일에서만 적용)
   */
  inputMode?:
    | 'none'
    | 'text'
    | 'tel'
    | 'url'
    | 'email'
    | 'numeric'
    | 'decimal'
    | 'search';
  /**
   * 햅틱 피드백 활성화 (모바일에서만 적용)
   */
  enableHapticFeedback?: boolean;
  /**
   * 컨테이너 클래스명 (모바일에서만 적용)
   */
  containerClassName?: string;
  /**
   * 라벨 클래스명 (모바일에서만 적용)
   */
  labelClassName?: string;
  /**
   * 에러 메시지 클래스명 (모바일에서만 적용)
   */
  errorClassName?: string;
  /**
   * 도움말 텍스트 클래스명 (모바일에서만 적용)
   */
  helperClassName?: string;
}

const ResponsiveInput = React.forwardRef<
  HTMLInputElement,
  ResponsiveInputProps
>(
  (
    {
      forceVariant,
      mobileOnly,
      size,
      state,
      touchFeedback,
      successMessage,
      warningMessage,
      startIcon,
      endIcon,
      inputMode,
      enableHapticFeedback,
      containerClassName,
      labelClassName,
      errorClassName,
      helperClassName,
      label,
      error,
      helperText,
      ...props
    },
    ref
  ) => {
    const viewportWidth = useViewportWidth();
    const isMobile = viewportWidth < 768; // 768px 미만을 모바일로 간주

    // 강제 설정이 있으면 그것을 우선 사용
    const shouldUseMobile =
      forceVariant === 'mobile' || (forceVariant !== 'desktop' && isMobile);

    if (shouldUseMobile) {
      // 모바일 버전 사용 - 모바일 전용 props 포함
      const mobileProps: MobileInputProps = {
        ...props,
        label,
        error,
        helperText,
        size: mobileOnly?.size || size,
        state: mobileOnly?.state || state,
        touchFeedback: mobileOnly?.touchFeedback || touchFeedback,
        successMessage: mobileOnly?.successMessage || successMessage,
        warningMessage: mobileOnly?.warningMessage || warningMessage,
        startIcon: mobileOnly?.startIcon || startIcon,
        endIcon: mobileOnly?.endIcon || endIcon,
        inputMode: mobileOnly?.inputMode || inputMode,
        enableHapticFeedback:
          mobileOnly?.enableHapticFeedback ?? enableHapticFeedback,
        containerClassName:
          mobileOnly?.containerClassName || containerClassName,
        labelClassName: mobileOnly?.labelClassName || labelClassName,
        errorClassName: mobileOnly?.errorClassName || errorClassName,
        helperClassName: mobileOnly?.helperClassName || helperClassName,
      };

      return <MobileInput ref={ref} {...mobileProps} />;
    }

    // 데스크톱 버전 사용 - 기본 Input 컴포넌트 사용
    // 모바일 전용 props는 제거하고 기본 props만 전달
    const desktopProps = {
      ...props,
      // 데스크톱에서는 기본적인 props만 지원
    };

    // 데스크톱에서는 라벨과 에러를 별도로 처리해야 할 수 있음
    if (label || error || helperText) {
      return (
        <div className="space-y-2">
          {label && (
            <label
              htmlFor={props.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {label}
              {props.required && (
                <span className="text-destructive ml-1" aria-label="필수 입력">
                  *
                </span>
              )}
            </label>
          )}
          <Input
            ref={ref}
            {...desktopProps}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error
                ? `${props.id}-error`
                : helperText
                  ? `${props.id}-helper`
                  : undefined
            }
          />
          {helperText && !error && (
            <p
              id={`${props.id}-helper`}
              className="text-sm text-muted-foreground"
            >
              {helperText}
            </p>
          )}
          {error && (
            <p
              id={`${props.id}-error`}
              role="alert"
              className="text-sm text-destructive font-medium"
            >
              {error}
            </p>
          )}
        </div>
      );
    }

    return <Input ref={ref} {...desktopProps} />;
  }
);

ResponsiveInput.displayName = 'ResponsiveInput';

export { ResponsiveInput };
export type { ResponsiveInputProps };
