import type { ReactNode } from 'react';
import { cn } from '~/lib/utils';

interface DashboardGridProps {
  children: ReactNode;
  className?: string;
}

interface DashboardGridItemProps {
  children: ReactNode;
  className?: string;
  colSpan?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  priority?: 'high' | 'medium' | 'low'; // 모바일에서 우선순위 기반 정렬
}

/**
 * 반응형 대시보드 그리드 레이아웃
 * - Desktop: 4 columns
 * - Tablet: 2 columns  
 * - Mobile: 1 column
 */
export function DashboardGrid({ children, className }: DashboardGridProps) {
  return (
    <div
      className={cn(
        // 기본 그리드 설정
        'grid gap-6',
        // 반응형 컬럼 설정
        'grid-cols-1',      // Mobile: 1 column
        'md:grid-cols-2',   // Tablet: 2 columns
        'lg:grid-cols-4',   // Desktop: 4 columns
        // 최대 너비 제한 및 중앙 정렬
        'max-w-7xl mx-auto',
        // 모바일 최적화 패딩
        'px-4 sm:px-6 lg:px-8',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * 대시보드 그리드 아이템 (위젯 컨테이너)
 * 반응형 컬럼 스팬과 우선순위 기반 정렬 지원
 */
export function DashboardGridItem({ 
  children, 
  className, 
  colSpan = { default: 1 },
  priority = 'medium' 
}: DashboardGridItemProps) {
  // 컬럼 스팬 클래스 생성
  const getColSpanClasses = () => {
    const classes = [];
    
    if (colSpan.default) {
      classes.push(`col-span-${Math.min(colSpan.default, 1)}`); // 모바일은 최대 1
    }
    if (colSpan.sm) {
      classes.push(`sm:col-span-${Math.min(colSpan.sm, 1)}`); // 작은 화면도 최대 1
    }
    if (colSpan.md) {
      classes.push(`md:col-span-${Math.min(colSpan.md, 2)}`); // 태블릿은 최대 2
    }
    if (colSpan.lg) {
      classes.push(`lg:col-span-${Math.min(colSpan.lg, 4)}`); // 데스크톱은 최대 4
    }
    if (colSpan.xl) {
      classes.push(`xl:col-span-${Math.min(colSpan.xl, 4)}`); // XL도 최대 4
    }
    
    return classes.join(' ');
  };

  // 우선순위 기반 순서 클래스 (모바일에서 활용)
  const getPriorityOrderClass = () => {
    switch (priority) {
      case 'high':
        return 'order-1 md:order-none'; // 모바일에서만 우선순위 적용
      case 'medium':
        return 'order-2 md:order-none';
      case 'low':
        return 'order-3 md:order-none';
      default:
        return '';
    }
  };

  return (
    <div
      className={cn(
        // 기본 그리드 아이템 스타일
        'min-h-0', // 그리드 아이템이 내용에 맞게 축소되도록
        // 반응형 컬럼 스팬
        getColSpanClasses(),
        // 우선순위 기반 정렬 (모바일)
        getPriorityOrderClass(),
        // 애니메이션 및 호버 효과
        'transition-all duration-300 ease-in-out',
        // 모바일 터치 최적화
        'touch-manipulation',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * 섹션별 그리드 (서브 그리드)
 * 대시보드 내에서 특정 섹션을 위한 그리드
 */
interface DashboardSectionGridProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export function DashboardSectionGrid({ 
  children, 
  className, 
  title, 
  description 
}: DashboardSectionGridProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {children}
      </div>
    </div>
  );
}

/**
 * 위젯 래퍼 컴포넌트
 * 모든 대시보드 위젯을 위한 공통 래퍼
 */
interface WidgetWrapperProps {
  children: ReactNode;
  className?: string;
  loading?: boolean;
  error?: string | null;
  title?: string;
  action?: ReactNode;
}

export function WidgetWrapper({
  children,
  className,
  loading = false,
  error = null,
  title,
  action
}: WidgetWrapperProps) {
  if (error) {
    return (
      <div className={cn(
        'rounded-lg border border-destructive/20 bg-destructive/5 p-6',
        'flex items-center justify-center min-h-[200px]',
        className
      )}>
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-destructive">오류가 발생했습니다</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cn(
        'rounded-lg border bg-card p-6',
        'flex items-center justify-center min-h-[200px]',
        'animate-pulse',
        className
      )}>
        <div className="text-center space-y-3">
          <div className="w-8 h-8 rounded-full bg-muted mx-auto" />
          <div className="text-sm text-muted-foreground">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'rounded-lg border bg-card text-card-foreground shadow-sm',
      'transition-all duration-200 ease-in-out',
      // 호버 효과 (데스크톱)
      'hover:shadow-md hover:border-border/80',
      // 모바일 터치 최적화
      'active:scale-[0.98] md:active:scale-100',
      className
    )}>
      {(title || action) && (
        <div className="flex items-center justify-between p-6 pb-4">
          {title && (
            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      
      <div className={title || action ? 'px-6 pb-6' : 'p-6'}>
        {children}
      </div>
    </div>
  );
}
