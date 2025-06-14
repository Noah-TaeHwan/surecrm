import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Separator } from './separator';
import { LayoutGrid, LayoutList, Filter } from 'lucide-react';
import { useDeviceDetection } from '~/hooks/use-device-detection';

// 제네릭 데이터 표시 컴포넌트의 Props 타입
interface ResponsiveDataDisplayProps<T = any> {
  // 📊 데이터 관련
  data: T[];
  title: ReactNode;
  description?: string;
  emptyStateConfig?: {
    title: string;
    description: string;
    action?: ReactNode;
  };

  // 🎨 뷰 컴포넌트
  TableComponent: React.ComponentType<any>;
  CardComponent: React.ComponentType<any>;
  tableProps?: Record<string, any>;
  cardProps?: Record<string, any>;

  // 🔄 뷰 모드 제어
  defaultViewMode?: 'cards' | 'table' | 'auto';
  allowViewModeToggle?: boolean;
  showViewModeButtons?: boolean;

  // 🔍 필터링 관련
  showFilters?: boolean;
  filterComponent?: ReactNode;
  filteredCount?: number;
  totalCount?: number;

  // 📱 반응형 설정
  mobileBreakpoint?: number; // 기본값: 768px
  forceViewMode?: 'cards' | 'table'; // 강제로 특정 뷰 모드 사용

  // 🎛️ 추가 기능
  headerActions?: ReactNode;
  className?: string;
  showItemCount?: boolean;
}

export function ResponsiveDataDisplay<T = any>({
  data,
  title,
  description,
  emptyStateConfig,
  TableComponent,
  CardComponent,
  tableProps = {},
  cardProps = {},
  defaultViewMode = 'auto',
  allowViewModeToggle = true,
  showViewModeButtons = true,
  showFilters = false,
  filterComponent,
  filteredCount,
  totalCount,
  mobileBreakpoint = 768,
  forceViewMode,
  headerActions,
  className = '',
  showItemCount = true,
}: ResponsiveDataDisplayProps<T>) {
  const { isMobile, isDesktop } = useDeviceDetection();

  // 🎯 반응형 뷰모드: 자동 감지 + 사용자 override 옵션
  const [userViewModeOverride, setUserViewModeOverride] = useState<
    'cards' | 'table' | null
  >(null);

  // 자동 뷰모드 계산 (SSR 안전)
  const getAutoViewMode = (): 'cards' | 'table' => {
    if (forceViewMode) return forceViewMode;

    // SSR에서는 항상 테이블 뷰를 기본으로 (hydration 에러 방지)
    // 모바일/데스크톱 모두 테이블 뷰가 기본
    return 'table';
  };

  const autoViewMode = getAutoViewMode();

  // 최종 뷰모드: 사용자 override > 기본값 > 자동 감지
  const viewMode =
    userViewModeOverride ||
    (defaultViewMode === 'auto' ? autoViewMode : defaultViewMode);

  // 🎯 화면 크기 변경 시 사용자 override 초기화 (선택적)
  useEffect(() => {
    if (defaultViewMode === 'auto' && !forceViewMode) {
      // 화면 크기 변경으로 자동 모드가 변경되면 override 초기화
      const handleResize = () => {
        const newAutoMode = getAutoViewMode();
        if (newAutoMode !== autoViewMode && userViewModeOverride) {
          // 화면 크기 변경으로 자동 모드가 바뀌면 잠시 후 override 초기화
          setTimeout(() => {
            setUserViewModeOverride(null);
          }, 500); // 화면 회전/리사이징 딜레이 고려
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [autoViewMode, userViewModeOverride, defaultViewMode, forceViewMode]);

  // 뷰모드 변경 핸들러
  const handleViewModeChange = (mode: 'cards' | 'table') => {
    setUserViewModeOverride(mode);
  };

  // 아이템 카운트 계산
  const displayCount = filteredCount ?? data.length;
  const totalDisplayCount = totalCount ?? data.length;

  // 빈 상태 렌더링
  const renderEmptyState = () => {
    const config = emptyStateConfig || {
      title: '데이터가 없습니다',
      description: '표시할 항목이 없습니다.',
    };

    return (
      <div
        className="flex flex-col items-center justify-center py-12 sm:py-16 px-4"
        role="status"
        aria-label="빈 상태"
      >
        <div className="text-center">
          <h3
            className="text-lg sm:text-xl font-semibold text-foreground mb-2"
            id="empty-state-title"
          >
            {config.title}
          </h3>
          <p
            className="text-sm sm:text-base text-muted-foreground text-center max-w-md mb-4 sm:mb-6"
            id="empty-state-description"
            aria-describedby="empty-state-title"
          >
            {config.description}
          </p>
          {config.action}
        </div>
      </div>
    );
  };

  // 데이터 뷰 렌더링
  const renderDataView = () => {
    if (viewMode === 'cards') {
      return <CardComponent data={data} {...cardProps} />;
    } else {
      return <TableComponent data={data} {...tableProps} />;
    }
  };

  return (
    <div className={`responsive-data-display ${className}`}>
      {/* 필터 섹션 (선택적) */}
      {showFilters && filterComponent && (
        <div className="mb-6">{filterComponent}</div>
      )}

      {/* 메인 데이터 표시 카드 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {title}
                {showItemCount && (
                  <Badge variant="outline" className="ml-2">
                    {displayCount === totalDisplayCount
                      ? `${displayCount}개`
                      : `${displayCount}/${totalDisplayCount}개`}
                  </Badge>
                )}
              </CardTitle>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>

            {/* 헤더 액션 영역 */}
            <div className="flex items-center gap-2">
              {headerActions}

              {/* 뷰 모드 토글 버튼 */}
              {allowViewModeToggle && showViewModeButtons && !forceViewMode && (
                <>
                  <Separator orientation="vertical" className="h-6" />
                  <div
                    role="group"
                    aria-label="뷰 모드 선택"
                    className="flex gap-1"
                  >
                    <Button
                      variant={viewMode === 'cards' ? 'default' : 'outline'}
                      size="sm"
                      className="h-10 w-10"
                      onClick={() => handleViewModeChange('cards')}
                      aria-label="카드 뷰로 전환"
                      aria-pressed={viewMode === 'cards'}
                      title="카드 뷰"
                      type="button"
                    >
                      <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">카드 뷰</span>
                    </Button>
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'outline'}
                      size="sm"
                      className="h-10 w-10"
                      onClick={() => handleViewModeChange('table')}
                      aria-label="테이블 뷰로 전환"
                      aria-pressed={viewMode === 'table'}
                      title="테이블 뷰"
                      type="button"
                    >
                      <LayoutList className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">테이블 뷰</span>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {data.length === 0 ? renderEmptyState() : renderDataView()}
        </CardContent>
      </Card>
    </div>
  );
}

// 편의 타입 export
export type { ResponsiveDataDisplayProps };
