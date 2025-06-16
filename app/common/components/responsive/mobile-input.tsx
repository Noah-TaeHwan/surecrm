import * as React from 'react';
import { cn } from '~/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const mobileInputVariants = cva(
  // 기본 스타일 - WCAG 2.5.5 AAA 준수 (최소 44px 높이)
  [
    'flex w-full rounded-md border border-input bg-background text-foreground',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'placeholder:text-muted-foreground',
    'disabled:cursor-not-allowed disabled:opacity-50',
    // 터치 최적화
    'touch-manipulation',
    // 포커스 스타일 - 명확한 시각적 피드백
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    // 활성 상태 피드백
    'active:scale-[0.98] transition-transform duration-75',
    // 접근성 - 충분한 색상 대비
    'contrast-more:border-foreground contrast-more:placeholder:text-foreground/70',
  ],
  {
    variants: {
      size: {
        sm: 'h-11 px-3 py-2 text-sm min-h-[44px]', // WCAG 최소 크기 보장
        default: 'h-12 px-3 py-2 text-base min-h-[44px]',
        lg: 'h-14 px-4 py-3 text-lg min-h-[44px]',
        xl: 'h-16 px-4 py-4 text-xl min-h-[44px]',
      },
      state: {
        default: '',
        error: 'border-destructive focus-visible:ring-destructive',
        success: 'border-green-500 focus-visible:ring-green-500',
        warning: 'border-yellow-500 focus-visible:ring-yellow-500',
      },
      touchFeedback: {
        none: '',
        subtle: 'active:scale-[0.99]',
        medium: 'active:scale-[0.98]',
        strong: 'active:scale-[0.96]',
      },
    },
    defaultVariants: {
      size: 'default',
      state: 'default',
      touchFeedback: 'medium',
    },
  }
);

export interface MobileInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof mobileInputVariants> {
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
  /**
   * 성공 메시지
   */
  successMessage?: string;
  /**
   * 경고 메시지
   */
  warningMessage?: string;
  /**
   * 입력 필드 앞에 표시할 아이콘
   */
  startIcon?: React.ReactNode;
  /**
   * 입력 필드 뒤에 표시할 아이콘
   */
  endIcon?: React.ReactNode;
  /**
   * 네이티브 키보드 타입 (모바일 최적화)
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
   * 자동완성 타입
   */
  autoComplete?: string;
  /**
   * 햅틱 피드백 활성화 (지원되는 기기에서)
   */
  enableHapticFeedback?: boolean;
  /**
   * 컨테이너 클래스명
   */
  containerClassName?: string;
  /**
   * 라벨 클래스명
   */
  labelClassName?: string;
  /**
   * 에러 메시지 클래스명
   */
  errorClassName?: string;
  /**
   * 도움말 텍스트 클래스명
   */
  helperClassName?: string;
}

const MobileInput = React.forwardRef<HTMLInputElement, MobileInputProps>(
  (
    {
      className,
      containerClassName,
      labelClassName,
      errorClassName,
      helperClassName,
      type = 'text',
      size,
      state,
      touchFeedback,
      label,
      error,
      helperText,
      successMessage,
      warningMessage,
      startIcon,
      endIcon,
      inputMode,
      autoComplete,
      enableHapticFeedback = true,
      id,
      'aria-describedby': ariaDescribedBy,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    const successId = `${inputId}-success`;
    const warningId = `${inputId}-warning`;

    // 상태에 따른 메시지와 ID 결정
    const currentState = error
      ? 'error'
      : successMessage
        ? 'success'
        : warningMessage
          ? 'warning'
          : state;
    const currentMessage = error || successMessage || warningMessage;
    const messageId = error
      ? errorId
      : successMessage
        ? successId
        : warningMessage
          ? warningId
          : helperId;

    // aria-describedby 구성
    const describedByIds = [
      helperText && helperId,
      currentMessage && messageId,
      ariaDescribedBy,
    ]
      .filter(Boolean)
      .join(' ');

    // 햅틱 피드백 함수
    const triggerHapticFeedback = React.useCallback(() => {
      if (enableHapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate(10); // 10ms 짧은 진동
      }
    }, [enableHapticFeedback]);

    // 포커스 핸들러
    const handleFocus = React.useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        triggerHapticFeedback();
        onFocus?.(event);
      },
      [onFocus, triggerHapticFeedback]
    );

    // 블러 핸들러
    const handleBlur = React.useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        onBlur?.(event);
      },
      [onBlur]
    );

    return (
      <div className={cn('space-y-2', containerClassName)}>
        {/* 라벨 */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              'block mb-2',
              labelClassName
            )}
          >
            {label}
            {props.required && (
              <span className="text-destructive ml-1" aria-label="필수 입력">
                *
              </span>
            )}
          </label>
        )}

        {/* 입력 필드 컨테이너 */}
        <div className="relative">
          {/* 시작 아이콘 */}
          {startIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
              {startIcon}
            </div>
          )}

          {/* 입력 필드 */}
          <input
            type={type}
            inputMode={inputMode}
            autoComplete={autoComplete}
            className={cn(
              mobileInputVariants({ size, state: currentState, touchFeedback }),
              startIcon && 'pl-10',
              endIcon && 'pr-10',
              className
            )}
            ref={ref}
            id={inputId}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedByIds || undefined}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />

          {/* 끝 아이콘 */}
          {endIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
              {endIcon}
            </div>
          )}
        </div>

        {/* 도움말 텍스트 */}
        {helperText && !currentMessage && (
          <p
            id={helperId}
            className={cn('text-sm text-muted-foreground', helperClassName)}
          >
            {helperText}
          </p>
        )}

        {/* 에러 메시지 */}
        {error && (
          <p
            id={errorId}
            role="alert"
            className={cn(
              'text-sm text-destructive font-medium',
              errorClassName
            )}
          >
            {error}
          </p>
        )}

        {/* 성공 메시지 */}
        {successMessage && !error && (
          <p
            id={successId}
            role="status"
            className={cn(
              'text-sm text-green-600 font-medium',
              helperClassName
            )}
          >
            {successMessage}
          </p>
        )}

        {/* 경고 메시지 */}
        {warningMessage && !error && !successMessage && (
          <p
            id={warningId}
            role="alert"
            className={cn(
              'text-sm text-yellow-600 font-medium',
              helperClassName
            )}
          >
            {warningMessage}
          </p>
        )}
      </div>
    );
  }
);

MobileInput.displayName = 'MobileInput';

export { MobileInput, mobileInputVariants };
