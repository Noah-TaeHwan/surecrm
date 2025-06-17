import { type ReactNode, useMemo, useCallback, useState, useEffect } from 'react';
import { cn } from '~/lib/utils';
import { DashboardGridItem, WidgetWrapper } from './dashboard-grid';

interface WidgetConfig {
  id: string;
  title: string;
  component: ReactNode;
  priority: 'high' | 'medium' | 'low';
  category?: 'kpi' | 'analytics' | 'activity' | 'insights';
  colSpan?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  loading?: boolean;
  error?: string | null;
  visible?: boolean;
  mobileOrder?: number; // 모바일에서의 명시적 순서
}

interface WidgetContainerProps {
  widgets: WidgetConfig[];
  className?: string;
  enableReordering?: boolean; // 사용자 커스터마이징 가능 여부
  onReorder?: (newOrder: string[]) => void;
  mobileBreakpoint?: number; // px 단위
}

/**
 * 위젯 컨테이너 - 우선순위 기반 모바일 정렬
 * - 데스크톱: 원래 순서 유지
 * - 모바일: 우선순위 기반 자동 정렬
 * - 카테고리별 그룹화 지원
 * - 사용자 커스터마이징 지원 (선택적)
 */
export function WidgetContainer({
  widgets,
  className,
  enableReordering = false,
  onReorder,
  mobileBreakpoint = 768
}: WidgetContainerProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [customOrder, setCustomOrder] = useState<string[]>([]);

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mobileBreakpoint]);

  // 우선순위 점수 계산
  const getPriorityScore = useCallback((priority: 'high' | 'medium' | 'low', category?: string) => {
    const baseScore = {
      high: 100,
      medium: 50,
      low: 10
    }[priority];

    // 카테고리별 보너스 점수 (모바일에서 중요도)
    const categoryBonus = {
      kpi: 20,        // KPI는 가장 중요
      analytics: 15,  // 분석 차트
      activity: 10,   // 활동 관련
      insights: 5     // 인사이트
    }[category || 'insights'] || 0;

    return baseScore + categoryBonus;
  }, []);

  // 정렬된 위젯 계산
  const sortedWidgets = useMemo(() => {
    const visibleWidgets = widgets.filter(widget => widget.visible !== false);
    
    if (!isMobile) {
      // 데스크톱: 원래 순서 유지
      return visibleWidgets;
    }

    // 모바일: 우선순위 기반 정렬
    const sorted = [...visibleWidgets].sort((a, b) => {
      // 커스텀 순서가 있으면 우선 적용
      if (customOrder.length > 0) {
        const aIndex = customOrder.indexOf(a.id);
        const bIndex = customOrder.indexOf(b.id);
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
      }

      // mobileOrder가 명시되어 있으면 우선 적용
      if (a.mobileOrder !== undefined || b.mobileOrder !== undefined) {
        const aOrder = a.mobileOrder ?? 999;
        const bOrder = b.mobileOrder ?? 999;
        if (aOrder !== bOrder) {
          return aOrder - bOrder;
        }
      }

      // 우선순위 점수로 정렬
      const aScore = getPriorityScore(a.priority, a.category);
      const bScore = getPriorityScore(b.priority, b.category);
      
      return bScore - aScore; // 높은 점수가 먼저
    });

    return sorted;
  }, [widgets, isMobile, customOrder, getPriorityScore]);

  // 위젯 재정렬 핸들러
  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    if (!enableReordering) return;

    const newWidgets = [...sortedWidgets];
    const [removed] = newWidgets.splice(fromIndex, 1);
    newWidgets.splice(toIndex, 0, removed);

    const newOrder = newWidgets.map(w => w.id);
    setCustomOrder(newOrder);
    onReorder?.(newOrder);
  }, [sortedWidgets, enableReordering, onReorder]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* 모바일 정렬 상태 표시 (개발 모드) */}
      {process.env.NODE_ENV === 'development' && isMobile && (
        <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
          모바일 모드: 우선순위 기반 정렬 활성화
        </div>
      )}

      {/* 위젯 렌더링 */}
      <div className="space-y-6">
        {sortedWidgets.map((widget, index) => (
          <WidgetItem
            key={widget.id}
            widget={widget}
            index={index}
            isMobile={isMobile}
            enableReordering={enableReordering}
            onReorder={handleReorder}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * 개별 위젯 아이템 컴포넌트
 */
interface WidgetItemProps {
  widget: WidgetConfig;
  index: number;
  isMobile: boolean;
  enableReordering: boolean;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

function WidgetItem({ 
  widget, 
  index, 
  isMobile, 
  enableReordering, 
  onReorder 
}: WidgetItemProps) {
  const [isDragging, setIsDragging] = useState(false);

  // 드래그 핸들러 (향후 구현 예정)
  const handleDragStart = useCallback((e: React.DragEvent) => {
    if (!enableReordering) {
      e.preventDefault();
      return;
    }
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', index.toString());
  }, [enableReordering, index]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!enableReordering) return;
    e.preventDefault();
  }, [enableReordering]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    if (!enableReordering) return;
    
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    const toIndex = index;
    
    if (fromIndex !== toIndex) {
      onReorder(fromIndex, toIndex);
    }
  }, [enableReordering, index, onReorder]);

  // 우선순위 인디케이터
  const getPriorityIndicator = () => {
    if (!isMobile || process.env.NODE_ENV !== 'development') return null;
    
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500', 
      low: 'bg-green-500'
    };

    return (
      <div className="absolute top-2 right-2 z-10">
        <div className={cn(
          'w-2 h-2 rounded-full',
          colors[widget.priority]
        )} />
      </div>
    );
  };

  return (
    <div
      className={cn(
        'relative',
        // 드래그 상태
        isDragging && 'opacity-50',
        // 드래그 가능한 경우 커서
        enableReordering && 'cursor-move'
      )}
      draggable={enableReordering}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* 우선순위 인디케이터 */}
      {getPriorityIndicator()}

      {/* 위젯 래퍼 */}
      <DashboardGridItem
        colSpan={widget.colSpan}
        priority={widget.priority}
        className={cn(
          // 모바일 최적화 스타일
          isMobile && 'col-span-1',
          // 카테고리별 스타일
          widget.category === 'kpi' && isMobile && 'order-1',
          widget.category === 'analytics' && isMobile && 'order-2',
          widget.category === 'activity' && isMobile && 'order-3',
          widget.category === 'insights' && isMobile && 'order-4'
        )}
      >
        <WidgetWrapper
          title={widget.title}
          loading={widget.loading}
          error={widget.error}
          className={cn(
            // 드래그 중 스타일
            isDragging && 'shadow-lg border-primary/50',
            // 터치 최적화
            'touch-manipulation'
          )}
        >
          {widget.component}
        </WidgetWrapper>
      </DashboardGridItem>

      {/* 재정렬 핸들 (모바일, 개발 모드) */}
      {enableReordering && isMobile && process.env.NODE_ENV === 'development' && (
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
          <div className="flex flex-col space-y-1">
            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 위젯 컨테이너 훅 - 위젯 관리 로직
 */
export function useWidgetContainer(initialWidgets: WidgetConfig[]) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(initialWidgets);
  const [userPreferences, setUserPreferences] = useState<{
    order: string[];
    hidden: string[];
  }>({
    order: [],
    hidden: []
  });

  // 위젯 표시/숨김 토글
  const toggleWidget = useCallback((widgetId: string) => {
    setWidgets(prev => prev.map(widget =>
      widget.id === widgetId
        ? { ...widget, visible: !widget.visible }
        : widget
    ));
  }, []);

  // 위젯 순서 변경
  const reorderWidgets = useCallback((newOrder: string[]) => {
    setUserPreferences(prev => ({
      ...prev,
      order: newOrder
    }));
  }, []);

  // 위젯 로딩 상태 설정
  const setWidgetLoading = useCallback((widgetId: string, loading: boolean) => {
    setWidgets(prev => prev.map(widget =>
      widget.id === widgetId
        ? { ...widget, loading }
        : widget
    ));
  }, []);

  // 위젯 에러 상태 설정
  const setWidgetError = useCallback((widgetId: string, error: string | null) => {
    setWidgets(prev => prev.map(widget =>
      widget.id === widgetId
        ? { ...widget, error }
        : widget
    ));
  }, []);

  return {
    widgets,
    userPreferences,
    toggleWidget,
    reorderWidgets,
    setWidgetLoading,
    setWidgetError,
    setWidgets
  };
}
