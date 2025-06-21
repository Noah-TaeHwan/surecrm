import { useState, useRef, useEffect } from 'react';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/common/components/ui/collapsible';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '~/common/components/ui/carousel';
import {
  ChevronDown,
  Users,
  TrendingUp,
  CheckCircle,
  Star,
  BarChart3,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '~/lib/utils';
import { Input } from '~/common/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '~/common/components/ui/dropdown-menu';
import { PipelineFilters } from './pipeline-filters';
import { PipelineBoard } from './pipeline-board';
import type { PipelineStage, Client } from '~/features/pipeline/types/types';

interface MobilePipelineLayoutProps {
  // 통계 카드 데이터
  statsCards: Array<{
    title: string;
    value: string | number;
    description?: string;
    icon: React.ComponentType<{ className?: string }>;
    color: 'blue' | 'orange' | 'green' | 'red' | 'emerald';
    trend?: {
      value: number;
      isPositive: boolean;
    };
  }>;
  
  // 파이프라인 데이터
  stages: (PipelineStage & {
    stats: { clientCount: number; highImportanceCount: number };
  })[];
  clients: Client[];
  
  // 검색 및 필터
  searchQuery: string;
  onSearchChange: (query: string) => void;
  
  // 필터 관련
  selectedReferrerId: string | null;
  onReferrerChange: (id: string | null) => void;
  selectedImportance: 'all' | 'high' | 'medium' | 'low';
  onImportanceChange: (importance: 'all' | 'high' | 'medium' | 'low') => void;
  potentialReferrers: any[];
  isFilterActive: boolean;
  
  // 파이프라인 이벤트 핸들러
  onClientMove: (
    clientId: string,
    sourceStageId: string,
    destinationStageId: string
  ) => void;
  onAddClientToStage?: (stageId: string) => void;
  onRemoveFromPipeline?: (clientId: string, clientName: string) => void;
  onCreateContract?: (
    clientId: string,
    clientName: string,
    products: any[]
  ) => void;
  onEditOpportunity?: (clientId: string, clientName: string) => void;
  
  // 모달 핸들러
  onAddNewClient: () => void;
  onExistingClientOpportunity: () => void;
  
  // 필터 초기화
  onFilterReset: () => void;
  
  // 필터된 클라이언트 수
  filteredClientsCount: number;
}

export function MobilePipelineLayout({
  statsCards,
  stages,
  clients,
  searchQuery,
  onSearchChange,
  selectedReferrerId,
  onReferrerChange,
  selectedImportance,
  onImportanceChange,
  potentialReferrers,
  isFilterActive,
  onClientMove,
  onAddClientToStage,
  onRemoveFromPipeline,
  onCreateContract,
  onEditOpportunity,
  onAddNewClient,
  onExistingClientOpportunity,
  onFilterReset,
  filteredClientsCount,
}: MobilePipelineLayoutProps) {
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // 통계 카드 토글 버튼 텍스트 생성
  const getStatsToggleText = () => {
    const totalClients = statsCards.find(card => card.title === '전체 고객')?.value || 0;
    const managingClients = statsCards.find(card => card.title === '영업 관리 중')?.value || 0;
    const completedClients = statsCards.find(card => card.title === '계약 완료')?.value || 0;
    
    return `전체 ${totalClients}명 • 관리 중 ${managingClients}명 • 완료 ${completedClients}명`;
  };

  // 스테이지 캐러셀 네비게이션
  const goToPrevStage = () => {
    if (activeStageIndex > 0) {
      setActiveStageIndex(activeStageIndex - 1);
    }
  };

  const goToNextStage = () => {
    if (activeStageIndex < stages.length - 1) {
      setActiveStageIndex(activeStageIndex + 1);
    }
  };

  // 스테이지 탭 클릭 시 캐러셀 스크롤
  const scrollToStage = (index: number) => {
    setActiveStageIndex(index);
    if (carouselRef.current) {
      const carousel = carouselRef.current;
      const tabButton = carousel.children[index] as HTMLElement;

      if (tabButton) {
        requestAnimationFrame(() => {
          const carouselRect = carousel.getBoundingClientRect();
          const buttonRect = tabButton.getBoundingClientRect();
          const scrollLeft =
            buttonRect.left -
            carouselRect.left +
            carousel.scrollLeft -
            carouselRect.width / 2 +
            buttonRect.width / 2;

          carousel.scrollTo({
            left: scrollLeft,
            behavior: 'smooth',
          });
        });
      }
    }
  };

  // 색상 매핑 함수 - 서비스 표준 색상 시스템 적용
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-card',
          border: 'border',
          text: 'text-foreground',
        };
      case 'orange':
        return {
          bg: 'bg-card',
          border: 'border',
          text: 'text-foreground',
        };
      case 'green':
        return {
          bg: 'bg-card',
          border: 'border',
          text: 'text-foreground',
        };
      case 'red':
        return {
          bg: 'bg-card',
          border: 'border',
          text: 'text-foreground',
        };
      case 'emerald':
        return {
          bg: 'bg-card',
          border: 'border',
          text: 'text-foreground',
        };
      default:
        return {
          bg: 'bg-card',
          border: 'border',
          text: 'text-foreground',
        };
    }
  };

  return (
    <div 
      className="lg:hidden bg-background min-h-screen"
      style={{
        // 모바일에서 의도하지 않은 터치 동작 제한
        touchAction: 'pan-y pinch-zoom',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        overscrollBehavior: 'contain',
      }}
    >
      {/* 🎯 상단 통계 카드 토글 섹션 - non-sticky로 변경 */}
      <div className="border-b bg-background">
        <Collapsible
          open={isStatsExpanded}
          onOpenChange={setIsStatsExpanded}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-4 h-auto hover:bg-muted/50"
            >
              <div className="flex flex-col items-start gap-1">
                <span className="font-semibold text-base">영업 현황</span>
                <span className="text-sm text-muted-foreground">
                  {getStatsToggleText()}
                </span>
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  isStatsExpanded && 'rotate-180'
                )}
              />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-3">
              {statsCards.map((card, index) => {
                const colors = getColorClasses(card.color);
                
                return (
                  <div
                    key={index}
                    className={cn(
                      'flex flex-col space-y-2 p-4 rounded-lg border',
                      colors.bg,
                      colors.border
                    )}
                  >
                    {/* 아이콘 제거, 텍스트만 표시 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-muted-foreground leading-tight">
                        {card.title}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className={cn('text-xl font-bold', colors.text)}>
                          {card.value}
                        </p>
                        {card.trend && (
                          <Badge
                            variant={card.trend.isPositive ? 'default' : 'destructive'}
                            className="text-xs px-1.5 py-0.5 flex-shrink-0"
                          >
                            {card.trend.isPositive ? '+' : ''}{card.trend.value}%
                          </Badge>
                        )}
                      </div>
                      {card.description && (
                        <p className="text-xs text-muted-foreground mt-1 leading-tight">
                          {card.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* 🎯 검색/필터 및 스테이지 탭 통합 Sticky 영역 */}
      <div className="sticky -top-4 z-40 bg-background border-b border-border/50 -mx-4 px-4 shadow-sm py-1">
        {/* 검색 및 필터 섹션 */}
        <div className="space-y-3 py-3">
          {/* 검색바 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="고객명, 전화번호 검색..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
              autoComplete="off"
              style={{ touchAction: 'manipulation' }} // 터치 최적화
            />
          </div>

          {/* 필터 및 액션 버튼들 */}
          <div className="flex items-center justify-between gap-2">
            {/* 필터 버튼 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={isFilterActive ? 'default' : 'outline'}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>필터</span>
                  {isFilterActive && (
                    <Badge
                      variant="destructive"
                      className="ml-1 px-1 text-xs"
                    >
                      ●
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[320px] p-4 bg-background"
                align="start"
                sideOffset={4}
              >
                <PipelineFilters
                  referrers={potentialReferrers}
                  selectedReferrerId={selectedReferrerId}
                  onReferrerChange={onReferrerChange}
                  selectedImportance={selectedImportance}
                  onImportanceChange={onImportanceChange}
                />
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 액션 버튼들 */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onAddNewClient}
                className="text-xs"
              >
                신규 고객 추가
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={onExistingClientOpportunity}
                className="text-xs"
              >
                영업 기회 추가
              </Button>
            </div>
          </div>

          {/* 활성 필터 표시 */}
          {isFilterActive && (
            <div className="flex items-center gap-2 flex-wrap">
              {searchQuery && (
                <Badge variant="secondary" className="text-xs">
                  검색: {searchQuery}
                </Badge>
              )}
              {selectedImportance !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  중요도:{' '}
                  {selectedImportance === 'high'
                    ? '높음'
                    : selectedImportance === 'medium'
                      ? '보통'
                      : '낮음'}
                </Badge>
              )}
              {selectedReferrerId && (
                <Badge variant="secondary" className="text-xs">
                  소개자:{' '}
                  {potentialReferrers.find(r => r.id === selectedReferrerId)?.name}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onFilterReset}
                className="text-xs h-6 px-2"
              >
                초기화
              </Button>
            </div>
          )}
        </div>

        {/* 🎯 스테이지 캐러셀 탭 네비게이션 - 통합 sticky 영역 내부 */}
        <div className="border-t border-border/30 pt-2 pb-1">
          <div className="relative overflow-hidden">
            <div
              ref={carouselRef}
              className="flex gap-2 px-0 py-2.5 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide"
              style={{
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                touchAction: 'pan-x', // 가로 스크롤만 허용
              }}
            >
              {stages.map((stage, index) => {
                const isActive = activeStageIndex === index;
                const stageClients = clients.filter(client => client.stageId === stage.id);
                
                return (
                  <button
                    key={stage.id}
                    onClick={() => scrollToStage(index)}
                    className={cn(
                      'relative flex-shrink-0 flex items-center justify-center text-sm font-medium',
                      'snap-center border min-w-fit overflow-hidden px-4 py-3 rounded-lg',
                      'transition-all duration-300 ease-out',
                      isActive
                        ? [
                            'bg-primary text-white',
                            'shadow-sm shadow-primary/20 border-primary/30',
                          ]
                        : [
                            'bg-muted/30 text-muted-foreground border-border/30',
                            'hover:bg-muted/50 hover:text-foreground/80',
                          ]
                    )}
                    style={{ touchAction: 'manipulation' }} // 터치 최적화
                  >
                    {/* 스테이지 이름만 표시 */}
                    <span className="font-semibold whitespace-nowrap">
                      {stage.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 칸반보드 캐러셀 */}
      <div 
        className="p-4 pb-20"
        style={{
          touchAction: 'pan-y', // 세로 스크롤만 허용
        }}
      >
        <PipelineBoard
          stages={stages}
          clients={clients}
          onClientMove={onClientMove}
          onAddClientToStage={onAddClientToStage}
          onRemoveFromPipeline={onRemoveFromPipeline}
          onCreateContract={onCreateContract}
          onEditOpportunity={onEditOpportunity}
        />
      </div>

      {/* 필터 결과 안내 */}
      {isFilterActive && (
        <div className="fixed bottom-4 left-4 right-4 z-30">
          <div className="flex items-center justify-between p-3 bg-muted/95 backdrop-blur-sm rounded-lg border border-dashed shadow-lg">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                필터 적용됨: {filteredClientsCount}명의 고객이 표시되고 있습니다
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 