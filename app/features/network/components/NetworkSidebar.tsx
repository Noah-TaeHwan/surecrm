import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useLayoutEffect,
} from 'react';
import { Separator } from '~/common/components/ui/separator';
import { Badge } from '~/common/components/ui/badge';
import { Button } from '~/common/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/common/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/common/components/ui/dropdown-menu';
import { Slider } from '~/common/components/ui/slider';
import { Switch } from '~/common/components/ui/switch';
import { cn } from '~/lib/utils';
import {
  Filter,
  Star,
  Network,
  BarChart4,
  RefreshCw,
  X,
  CheckCircle,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/common/components/ui/tooltip';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/common/components/ui/accordion';
import { Input } from '~/common/components/ui/input';

interface NetworkSidebarProps {
  filters: {
    stageFilter: string;
    depthFilter: string;
    importanceFilter: number | string;
    showInfluencersOnly?: boolean;
  };
  onFilterChange: (filters: any) => void;
  stats?: {
    totalNodes?: number;
    filteredNodes?: number;
    influencerCount?: number;
    connectionCount?: number;
  };
}

export default function NetworkSidebar({
  filters,
  onFilterChange,
  stats = {
    totalNodes: 0,
    filteredNodes: 0,
    influencerCount: 0,
    connectionCount: 0,
  },
}: NetworkSidebarProps) {
  // 모바일 화면에서 필터 패널 열림/닫힘 상태
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // CSS 로딩 상태 추가
  const [cssLoaded, setCssLoaded] = useState(false);

  // 컴포넌트가 마운트된 후 CSS가 로드되었다고 표시
  useEffect(() => {
    // 약간의 지연을 두고 CSS가 로드되었다고 표시 (더 안전하게)
    const timer = setTimeout(() => {
      setCssLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleStageFilterChange = useCallback(
    (value: string) => {
      onFilterChange({ ...filters, stageFilter: value });
    },
    [filters, onFilterChange]
  );

  const handleImportanceFilterChange = useCallback(
    (value: number | string) => {
      onFilterChange({ ...filters, importanceFilter: value });
    },
    [filters, onFilterChange]
  );

  const handleResetFilters = useCallback(() => {
    onFilterChange({
      stageFilter: 'all',
      depthFilter: 'all',
      importanceFilter: 'all',
      showInfluencersOnly: false,
    });
  }, [onFilterChange]);

  // 현재 적용된 필터 수 계산
  const activeFilterCount = [
    filters.stageFilter !== 'all',
    filters.importanceFilter !== 'all',
  ].filter(Boolean).length;

  // 영업 단계 정보 - 테마 색상 활용
  const stages = [
    { value: 'all', label: '전체', color: 'bg-muted' },
    { value: '첫 상담', label: '첫 상담', color: 'bg-sky-500' },
    { value: '니즈 분석', label: '니즈 분석', color: 'bg-emerald-500' },
    { value: '상품 설명', label: '상품 설명', color: 'bg-amber-500' },
    { value: '계약 검토', label: '계약 검토', color: 'bg-rose-500' },
    { value: '계약 완료', label: '계약 완료', color: 'bg-violet-500' },
  ];

  // 화면 크기에 따라 모바일 모드 설정
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // 활성화된 필터 칩 렌더링 함수
  const renderActiveFilterChips = () => {
    const activeFilters = [];

    if (filters.stageFilter !== 'all') {
      const stage = stages.find((s) => s.value === filters.stageFilter);
      activeFilters.push(
        <Badge
          key="stage"
          variant="outline"
          className="gap-1 rounded-full border pl-1.5 pr-1 text-sm font-normal group"
        >
          <span
            className={`h-2.5 w-2.5 rounded-full mr-1 ${
              stage?.color || 'bg-primary'
            }`}
          ></span>
          {stage?.label}
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0 ml-1 opacity-60 group-hover:opacity-100"
            onClick={() => {
              handleStageFilterChange('all');
            }}
          >
            <X size={14} />
          </Button>
        </Badge>
      );
    }

    if (filters.importanceFilter !== 'all') {
      const importanceLabels = {
        high: 'VIP',
        medium: '일반',
        low: '관심',
      };

      activeFilters.push(
        <Badge
          key="importance"
          variant="outline"
          className="gap-1 rounded-full border pl-1.5 pr-1 text-sm font-normal group"
        >
          <Star size={12} className="fill-amber-400 text-amber-400" />
          {
            importanceLabels[
              filters.importanceFilter as keyof typeof importanceLabels
            ]
          }
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0 ml-1 opacity-60 group-hover:opacity-100"
            onClick={() => {
              handleImportanceFilterChange('all');
            }}
          >
            <X size={14} />
          </Button>
        </Badge>
      );
    }

    return activeFilters;
  };

  // 모바일 뷰를 위한 필터 버튼
  const FilterMobileTrigger = () => (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-2 md:hidden"
      onClick={() => setIsFilterOpen(!isFilterOpen)}
    >
      <Filter size={16} />
      <span className="text-base">필터</span>
      {activeFilterCount > 0 && (
        <Badge
          variant="secondary"
          className="h-5 w-5 p-0 flex items-center justify-center"
        >
          {activeFilterCount}
        </Badge>
      )}
    </Button>
  );

  // 필터 컨텐츠 (데스크톱 및 모바일)
  const FilterContent = () => (
    <>
      {/* 필터 헤더 */}
      <div className="pb-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-primary" />
          <h2 className="text-base font-medium">필터</h2>
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="h-5 w-5 p-0 flex items-center justify-center"
            >
              {activeFilterCount}
            </Badge>
          )}
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleResetFilters}
              className="h-8 w-8"
              disabled={activeFilterCount === 0}
            >
              <RefreshCw size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">필터 초기화</TooltipContent>
        </Tooltip>
      </div>

      {/* 활성화된 필터 칩 */}
      {activeFilterCount > 0 && (
        <div className="py-3 border-b">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            적용된 필터
          </div>
          <div className="flex flex-wrap gap-1.5">
            {renderActiveFilterChips()}
          </div>
        </div>
      )}

      {/* 스크롤 가능한 필터 콘텐츠 영역 */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3 py-2 pb-6">
          {/* 네트워크 현황 */}
          <div className="rounded-lg border">
            <div className="p-3 border-b">
              <div className="flex items-center gap-2 mb-1">
                <Network size={16} className="text-primary" />
                <h3 className="text-sm font-medium">네트워크 현황</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                네트워크에 포함된 총 고객 수입니다
              </p>
            </div>

            <div className="grid grid-cols-2 divide-x">
              <div className="p-3 flex flex-col items-center">
                <span className="text-2xl font-semibold text-primary">
                  {Math.max(0, (stats.filteredNodes || 0) - 1)}
                </span>
                <span className="text-sm text-muted-foreground">
                  필터링 표시
                </span>
              </div>
              <div className="p-3 flex flex-col items-center">
                <span className="text-2xl font-semibold">
                  {Math.max(0, (stats.totalNodes || 0) - 1)}
                </span>
                <span className="text-sm text-muted-foreground">전체 고객</span>
              </div>
            </div>
          </div>

          {/* 아코디언 필터 */}
          <Accordion
            type="multiple"
            defaultValue={['importance', 'stage']}
            className="space-y-2 mb-10"
          >
            {/* 고객 중요도 필터 */}
            <AccordionItem
              value="importance"
              className="border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-3 py-3 text-left hover:no-underline hover:bg-muted/20 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-amber-400" />
                  <span className="text-sm font-medium">고객 중요도</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-2 border-t">
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    중요도별로 고객을 필터링합니다.
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      variant={
                        filters.importanceFilter === 'all'
                          ? 'secondary'
                          : 'ghost'
                      }
                      className={cn(
                        'justify-start h-9 text-sm',
                        filters.importanceFilter === 'all'
                          ? 'font-medium'
                          : 'font-normal'
                      )}
                      onClick={() => handleImportanceFilterChange('all')}
                    >
                      <span className="h-3 w-3 rounded-full mr-2 bg-muted"></span>
                      전체
                      {filters.importanceFilter === 'all' && (
                        <CheckCircle className="ml-auto h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      variant={
                        filters.importanceFilter === 'high'
                          ? 'secondary'
                          : 'ghost'
                      }
                      className={cn(
                        'justify-start h-9 text-sm',
                        filters.importanceFilter === 'high'
                          ? 'font-medium'
                          : 'font-normal'
                      )}
                      onClick={() => handleImportanceFilterChange('high')}
                    >
                      <span className="h-3 w-3 rounded-full mr-2 bg-orange-500"></span>
                      VIP
                      {filters.importanceFilter === 'high' && (
                        <CheckCircle className="ml-auto h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      variant={
                        filters.importanceFilter === 'medium'
                          ? 'secondary'
                          : 'ghost'
                      }
                      className={cn(
                        'justify-start h-9 text-sm',
                        filters.importanceFilter === 'medium'
                          ? 'font-medium'
                          : 'font-normal'
                      )}
                      onClick={() => handleImportanceFilterChange('medium')}
                    >
                      <span className="h-3 w-3 rounded-full mr-2 bg-blue-500"></span>
                      일반
                      {filters.importanceFilter === 'medium' && (
                        <CheckCircle className="ml-auto h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      variant={
                        filters.importanceFilter === 'low'
                          ? 'secondary'
                          : 'ghost'
                      }
                      className={cn(
                        'justify-start h-9 text-sm',
                        filters.importanceFilter === 'low'
                          ? 'font-medium'
                          : 'font-normal'
                      )}
                      onClick={() => handleImportanceFilterChange('low')}
                    >
                      <span className="h-3 w-3 rounded-full mr-2 bg-gray-400"></span>
                      관심
                      {filters.importanceFilter === 'low' && (
                        <CheckCircle className="ml-auto h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p>중요도가 높은 고객일수록 더 큰 노드로 표시됩니다.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 영업 단계 필터 */}
            <AccordionItem
              value="stage"
              className="border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-3 py-3 text-left hover:no-underline hover:bg-muted/20 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:text-muted-foreground">
                <div className="flex items-center gap-2">
                  <BarChart4 size={16} className="text-primary" />
                  <span className="text-sm font-medium">영업 단계</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-2 border-t">
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    영업 단계별로 고객을 필터링합니다.
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {stages.map((stage) => (
                      <Button
                        key={stage.value}
                        variant={
                          filters.stageFilter === stage.value
                            ? 'secondary'
                            : 'ghost'
                        }
                        className={cn(
                          'justify-start h-9 text-sm',
                          filters.stageFilter === stage.value
                            ? 'font-medium'
                            : 'font-normal'
                        )}
                        onClick={() => handleStageFilterChange(stage.value)}
                      >
                        <span
                          className={`h-3 w-3 rounded-full mr-2 ${stage.color}`}
                        ></span>
                        {stage.label}
                        {filters.stageFilter === stage.value && (
                          <CheckCircle className="ml-auto h-4 w-4" />
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </>
  );

  // 모바일 뷰에서는 필터 패널이 슬라이드 인/아웃되는 형태로 구현
  if (isMobile) {
    return (
      <>
        <FilterMobileTrigger />

        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-full max-w-[280px] bg-background shadow-lg transition-transform duration-300 flex flex-col h-full border-r',
            isFilterOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="p-4 flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between pb-3">
              <h2 className="text-base font-medium">필터</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFilterOpen(false)}
              >
                <X size={18} />
              </Button>
            </div>
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <FilterContent />
            </div>
          </div>
        </div>

        {/* 배경 오버레이 */}
        {isFilterOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setIsFilterOpen(false)}
          />
        )}
      </>
    );
  }

  // 데스크톱 뷰에서는 사이드바 형태로 표시
  return (
    <div
      className={cn(
        'hidden md:flex h-full border-r bg-background flex-col',
        !cssLoaded && 'invisible' // 스타일이 로드될 때까지 일시적으로 감춤
      )}
    >
      <div className="p-4 flex-1 flex flex-col h-full overflow-hidden">
        <FilterContent />
      </div>
    </div>
  );
}
