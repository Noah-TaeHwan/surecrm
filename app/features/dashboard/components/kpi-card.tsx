import type { ReactNode } from 'react';
import { useState, useCallback } from 'react';
import { cn } from '~/lib/utils';
import { Card, CardContent } from '~/common/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/common/components/ui/tooltip';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  QuestionMarkCircledIcon,
} from '@radix-ui/react-icons';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ComponentType<{ className?: string }>;
  color?: 'primary' | 'success' | 'warning' | 'info' | 'destructive';
  description?: string;
  loading?: boolean;
  error?: string | null;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  tooltipContent?: ReactNode;
  priority?: 'high' | 'medium' | 'low'; // 모바일 정렬 우선순위
}

/**
 * 모바일 최적화된 KPI 카드 컴포넌트
 * - 반응형 디자인 (모바일/태블릿/데스크톱)
 * - 터치 최적화 및 햅틱 피드백
 * - 모바일 타이포그래피 최적화
 * - 접근성 지원
 */
export function KPICard({
  title,
  value,
  change,
  icon: IconComponent,
  color = 'primary',
  description,
  loading = false,
  error = null,
  onClick,
  className,
  size = 'md',
  showTooltip = true,
  tooltipContent,
  priority = 'medium',
}: KPICardProps) {
  const [isPressed, setIsPressed] = useState(false);

  // 햅틱 피드백이 있는 클릭 핸들러
  const handleClick = useCallback(() => {
    if (!onClick) return;

    // 햅틱 피드백 (모바일)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50); // 50ms 짧은 진동
    }

    onClick();
  }, [onClick]);

  // 터치 이벤트 핸들러 (모바일 최적화)
  const handleTouchStart = useCallback(() => {
    setIsPressed(true);
    // 가벼운 햅틱 피드백
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
  }, []);

  // 색상 테마 계산
  const getColorClasses = () => {
    const colorMap = {
      primary: {
        icon: 'text-blue-600 dark:text-blue-400',
        iconBg: 'bg-blue-100 dark:bg-blue-900/20',
        border: 'hover:border-blue-200 dark:hover:border-blue-800',
        glow: 'hover:shadow-blue-100/50 dark:hover:shadow-blue-900/20',
      },
      success: {
        icon: 'text-green-600 dark:text-green-400',
        iconBg: 'bg-green-100 dark:bg-green-900/20',
        border: 'hover:border-green-200 dark:hover:border-green-800',
        glow: 'hover:shadow-green-100/50 dark:hover:shadow-green-900/20',
      },
      warning: {
        icon: 'text-orange-600 dark:text-orange-400',
        iconBg: 'bg-orange-100 dark:bg-orange-900/20',
        border: 'hover:border-orange-200 dark:hover:border-orange-800',
        glow: 'hover:shadow-orange-100/50 dark:hover:shadow-orange-900/20',
      },
      info: {
        icon: 'text-cyan-600 dark:text-cyan-400',
        iconBg: 'bg-cyan-100 dark:bg-cyan-900/20',
        border: 'hover:border-cyan-200 dark:hover:border-cyan-800',
        glow: 'hover:shadow-cyan-100/50 dark:hover:shadow-cyan-900/20',
      },
      destructive: {
        icon: 'text-red-600 dark:text-red-400',
        iconBg: 'bg-red-100 dark:bg-red-900/20',
        border: 'hover:border-red-200 dark:hover:border-red-800',
        glow: 'hover:shadow-red-100/50 dark:hover:shadow-red-900/20',
      },
    };
    return colorMap[color];
  };

  // 변화 지표 계산
  const getChangeIndicator = (changeValue: number) => {
    if (!isFinite(changeValue)) {
      return {
        icon: null,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        prefix: '',
        label: '신규',
        isSpecial: true,
      };
    }

    if (Math.abs(changeValue) >= 500) {
      return {
        icon: changeValue > 0 ? ArrowUpIcon : ArrowDownIcon,
        color: changeValue > 0 ? 'text-green-600' : 'text-red-600',
        bgColor:
          changeValue > 0
            ? 'bg-green-100 dark:bg-green-900/20'
            : 'bg-red-100 dark:bg-red-900/20',
        prefix: changeValue > 0 ? '+' : '',
        label: changeValue > 0 ? '대폭증가' : '대폭감소',
        isSpecial: true,
      };
    }

    if (changeValue > 0) {
      return {
        icon: ArrowUpIcon,
        color: 'text-green-600',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        prefix: '+',
        isSpecial: false,
      };
    } else if (changeValue < 0) {
      return {
        icon: ArrowDownIcon,
        color: 'text-red-600',
        bgColor: 'bg-red-100 dark:bg-red-900/20',
        prefix: '',
        isSpecial: false,
      };
    } else {
      return {
        icon: null,
        color: 'text-muted-foreground',
        bgColor: 'bg-muted/20',
        prefix: '',
        isSpecial: false,
      };
    }
  };

  // 사이즈별 스타일 계산
  const getSizeClasses = () => {
    const sizeMap = {
      sm: {
        padding: 'p-4',
        titleSize: 'text-xs',
        valueSize: 'text-lg',
        iconSize: 'h-4 w-4',
        changeSize: 'text-xs',
      },
      md: {
        padding: 'p-6',
        titleSize: 'text-sm',
        valueSize: 'text-2xl',
        iconSize: 'h-5 w-5',
        changeSize: 'text-xs',
      },
      lg: {
        padding: 'p-8',
        titleSize: 'text-base',
        valueSize: 'text-3xl',
        iconSize: 'h-6 w-6',
        changeSize: 'text-sm',
      },
    };
    return sizeMap[size];
  };

  const colorClasses = getColorClasses();
  const sizeClasses = getSizeClasses();
  const changeIndicator =
    change !== undefined ? getChangeIndicator(change) : null;

  // 로딩 상태
  if (loading) {
    return (
      <Card
        className={cn(
          'animate-pulse',
          'transition-all duration-200 ease-in-out',
          className
        )}
      >
        <CardContent className={sizeClasses.padding}>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-8 bg-muted rounded w-1/2" />
            <div className="h-3 bg-muted rounded w-1/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Card className={cn('border-destructive/20 bg-destructive/5', className)}>
        <CardContent className={sizeClasses.padding}>
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-destructive">오류</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CardWrapper = showTooltip ? TooltipProvider : 'div';

  return (
    <CardWrapper>
      <Card
        className={cn(
          // 기본 스타일
          'group relative overflow-hidden',
          'border-border/50 bg-card text-card-foreground',
          'transition-all duration-200 ease-in-out',

          // 호버/포커스 효과 (데스크톱)
          'hover:shadow-lg hover:border-border/80',
          colorClasses.border,

          // 클릭 가능한 경우
          onClick && [
            'cursor-pointer select-none',
            // 터치 최적화
            'active:scale-[0.98] md:active:scale-[0.99]',
            'touch-manipulation',
            // 눌림 상태
            isPressed && 'scale-[0.98] shadow-sm',
            // 글로우 효과
            `hover:shadow-lg ${colorClasses.glow}`,
          ],

          // 접근성
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',

          className
        )}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseLeave={() => setIsPressed(false)}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={onClick ? `${title}: ${value}` : undefined}
      >
        <CardContent className={sizeClasses.padding}>
          <div className="flex items-center justify-between">
            {/* 텍스트 영역 */}
            <div className="space-y-2 flex-1 min-w-0">
              {/* 제목 */}
              <div className="flex items-center gap-2">
                <p
                  className={cn(
                    'font-medium text-muted-foreground truncate',
                    sizeClasses.titleSize
                  )}
                >
                  {title}
                </p>

                {/* 툴팁 */}
                {showTooltip && (description || tooltipContent) && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <QuestionMarkCircledIcon
                        className={cn(
                          'text-muted-foreground hover:text-foreground transition-colors cursor-help',
                          size === 'sm' ? 'h-3 w-3' : 'h-3 w-3'
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      {tooltipContent || <p>{description}</p>}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>

              {/* 값 */}
              <div className="flex items-baseline gap-2 flex-wrap">
                <p
                  className={cn(
                    'font-bold text-foreground break-all',
                    sizeClasses.valueSize
                  )}
                >
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </p>

                {/* 변화 지표 */}
                {changeIndicator && change !== 0 && (
                  <div
                    className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded-full font-medium',
                      changeIndicator.bgColor,
                      sizeClasses.changeSize
                    )}
                  >
                    {changeIndicator.icon && (
                      <changeIndicator.icon
                        className={cn('h-3 w-3', changeIndicator.color)}
                      />
                    )}
                    <span className={changeIndicator.color}>
                      {changeIndicator.isSpecial && changeIndicator.label
                        ? changeIndicator.label
                        : `${changeIndicator.prefix}${Math.abs(change!).toFixed(1)}%`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 아이콘 */}
            {IconComponent && (
              <div
                className={cn(
                  'flex-shrink-0 rounded-full p-3 ml-4',
                  colorClasses.iconBg,
                  'group-hover:scale-110 transition-transform duration-200'
                )}
              >
                <IconComponent
                  className={cn(sizeClasses.iconSize, colorClasses.icon)}
                />
              </div>
            )}
          </div>
        </CardContent>

        {/* 그라데이션 오버레이 (선택사항) */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-background/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Card>
    </CardWrapper>
  );
}
