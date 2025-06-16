import React, { forwardRef, useCallback, useState } from 'react';
import { cn } from '~/lib/utils';

export interface TouchableAreaProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** 자식 요소들 */
  children: React.ReactNode;

  /** 클릭/터치 이벤트 핸들러 */
  onPress?: (
    event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => void;

  /** 터치 시작 이벤트 핸들러 */
  onTouchStart?: (event: React.TouchEvent<HTMLDivElement>) => void;

  /** 터치 종료 이벤트 핸들러 */
  onTouchEnd?: (event: React.TouchEvent<HTMLDivElement>) => void;

  /** 키보드 이벤트 핸들러 (Enter/Space) */
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;

  /** 비활성화 상태 */
  disabled?: boolean;

  /** 최소 터치 타겟 크기 적용 여부 (기본: true) */
  enforceMinSize?: boolean;

  /** 터치 피드백 효과 활성화 여부 (기본: true) */
  enableFeedback?: boolean;

  /** 접근성 역할 */
  role?: 'button' | 'link' | 'menuitem' | 'tab' | 'option' | 'none';

  /** 접근성 라벨 */
  'aria-label'?: string;

  /** 접근성 설명 */
  'aria-describedby'?: string;

  /** 현재 상태 (토글 버튼용) */
  'aria-pressed'?: boolean;

  /** 확장 상태 (드롭다운용) */
  'aria-expanded'?: boolean;

  /** 선택 상태 */
  'aria-selected'?: boolean;

  /** 키보드 포커스 가능 여부 */
  focusable?: boolean;

  /** 커스텀 tabIndex */
  tabIndex?: number;

  /** 터치 영역 크기 변형 */
  size?: 'sm' | 'md' | 'lg' | 'xl';

  /** 터치 피드백 강도 */
  feedbackIntensity?: 'subtle' | 'medium' | 'strong';

  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * TouchableArea - 범용 터치 상호작용 컴포넌트
 *
 * WCAG 2.5.5 Target Size (AAA) 준수:
 * - 최소 44x44px 터치 타겟 크기 보장
 * - 키보드 접근성 완전 지원
 * - 스크린 리더 호환성
 * - 터치/마우스/키보드 모든 입력 방식 지원
 *
 * 주요 기능:
 * - 일관된 터치 피드백 (시각적 + 햅틱)
 * - 접근성 속성 자동 관리
 * - 반응형 크기 조정
 * - 다양한 상호작용 패턴 지원
 */
export const TouchableArea = forwardRef<HTMLDivElement, TouchableAreaProps>(
  (
    {
      children,
      onPress,
      onTouchStart,
      onTouchEnd,
      onKeyDown,
      disabled = false,
      enforceMinSize = true,
      enableFeedback = true,
      role = 'button',
      focusable = true,
      tabIndex,
      size = 'md',
      feedbackIntensity = 'medium',
      className,
      ...props
    },
    ref
  ) => {
    const [isPressed, setIsPressed] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // 터치/클릭 이벤트 통합 처리
    const handlePress = useCallback(
      (
        event:
          | React.MouseEvent<HTMLDivElement>
          | React.TouchEvent<HTMLDivElement>
      ) => {
        if (disabled) return;

        // 햅틱 피드백 (지원되는 경우)
        if ('vibrate' in navigator && enableFeedback) {
          const intensity =
            feedbackIntensity === 'subtle'
              ? 10
              : feedbackIntensity === 'medium'
                ? 20
                : 30;
          navigator.vibrate(intensity);
        }

        onPress?.(event);
      },
      [disabled, enableFeedback, feedbackIntensity, onPress]
    );

    // 터치 시작 처리
    const handleTouchStart = useCallback(
      (event: React.TouchEvent<HTMLDivElement>) => {
        if (disabled) return;

        setIsPressed(true);
        onTouchStart?.(event);
      },
      [disabled, onTouchStart]
    );

    // 터치 종료 처리
    const handleTouchEnd = useCallback(
      (event: React.TouchEvent<HTMLDivElement>) => {
        if (disabled) return;

        setIsPressed(false);
        onTouchEnd?.(event);
        handlePress(event);
      },
      [disabled, onTouchEnd, handlePress]
    );

    // 마우스 다운 처리
    const handleMouseDown = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        if (disabled) return;
        setIsPressed(true);
      },
      [disabled]
    );

    // 마우스 업 처리
    const handleMouseUp = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        if (disabled) return;
        setIsPressed(false);
      },
      [disabled]
    );

    // 마우스 클릭 처리
    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        if (disabled) return;
        handlePress(event);
      },
      [disabled, handlePress]
    );

    // 키보드 이벤트 처리
    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;

        // Enter 또는 Space 키로 활성화
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setIsPressed(true);

          // 키보드로 활성화된 경우 즉시 onPress 호출
          const syntheticEvent = event as any;
          handlePress(syntheticEvent);

          // 짧은 시간 후 pressed 상태 해제
          setTimeout(() => setIsPressed(false), 150);
        }

        onKeyDown?.(event);
      },
      [disabled, handlePress, onKeyDown]
    );

    // 포커스 이벤트 처리
    const handleFocus = useCallback(() => {
      if (disabled) return;
      setIsFocused(true);
    }, [disabled]);

    const handleBlur = useCallback(() => {
      setIsFocused(false);
      setIsPressed(false);
    }, []);

    // 크기 클래스 계산
    const sizeClasses = {
      sm: enforceMinSize ? 'min-w-[44px] min-h-[44px] p-2' : 'p-1',
      md: enforceMinSize ? 'min-w-[44px] min-h-[44px] p-3' : 'p-2',
      lg: enforceMinSize ? 'min-w-[48px] min-h-[48px] p-4' : 'p-3',
      xl: enforceMinSize ? 'min-w-[56px] min-h-[56px] p-5' : 'p-4',
    };

    // 피드백 효과 클래스
    const feedbackClasses = enableFeedback
      ? {
          subtle: 'active:scale-[0.98] transition-transform duration-75',
          medium: 'active:scale-95 transition-transform duration-100',
          strong: 'active:scale-90 transition-transform duration-150',
        }
      : {};

    // 상태별 스타일 클래스
    const stateClasses = cn(
      // 기본 스타일
      'relative inline-flex items-center justify-center',
      'cursor-pointer select-none',
      'rounded-md',

      // 크기 적용
      sizeClasses[size],

      // 피드백 효과
      enableFeedback && feedbackClasses[feedbackIntensity],

      // 포커스 스타일 (키보드 접근성)
      focusable && [
        'focus:outline-none',
        'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
      ],

      // 상태별 스타일
      {
        // 비활성화 상태
        'opacity-50 cursor-not-allowed pointer-events-none': disabled,

        // 눌림 상태 (터치/마우스)
        'bg-gray-100 dark:bg-gray-800': isPressed && !disabled,

        // 포커스 상태
        'ring-2 ring-blue-500 ring-offset-2': isFocused && !disabled,
      },

      className
    );

    // 접근성 속성 계산
    const accessibilityProps = {
      role: role === 'none' ? undefined : role,
      tabIndex: disabled ? -1 : (tabIndex ?? (focusable ? 0 : -1)),
      'aria-disabled': disabled,
      'aria-pressed': props['aria-pressed'],
      'aria-expanded': props['aria-expanded'],
      'aria-selected': props['aria-selected'],
      'aria-label': props['aria-label'],
      'aria-describedby': props['aria-describedby'],
    };

    return (
      <div
        ref={ref}
        className={stateClasses}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...accessibilityProps}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TouchableArea.displayName = 'TouchableArea';

export default TouchableArea;
