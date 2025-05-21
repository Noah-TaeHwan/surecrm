import { useState, useCallback, useEffect } from 'react';
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
import { ScrollArea } from '~/common/components/ui/scroll-area';
import { cn } from '~/lib/utils';
import {
  Filter,
  Star,
  Users,
  Network,
  BarChart4,
  RefreshCw,
  ChevronDown,
  Info,
  X,
  ChevronsUpDown,
  CheckCircle,
  Sparkles,
  Link as LinkIcon,
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
    importanceFilter: number;
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

  const handleStageFilterChange = useCallback(
    (value: string) => {
      onFilterChange({ ...filters, stageFilter: value });
    },
    [filters, onFilterChange]
  );

  const handleDepthFilterChange = useCallback(
    (value: string) => {
      onFilterChange({ ...filters, depthFilter: value });
    },
    [filters, onFilterChange]
  );

  const handleImportanceFilterChange = useCallback(
    (value: number) => {
      onFilterChange({ ...filters, importanceFilter: value });
    },
    [filters, onFilterChange]
  );

  const handleInfluencersToggle = useCallback(
    (checked: boolean) => {
      if (checked) {
        onFilterChange({
          ...filters,
          showInfluencersOnly: checked,
          depthFilter: 'direct',
        });
      } else {
        onFilterChange({ ...filters, showInfluencersOnly: checked });
      }
    },
    [filters, onFilterChange]
  );

  const handleResetFilters = useCallback(() => {
    onFilterChange({
      stageFilter: 'all',
      depthFilter: 'all',
      importanceFilter: 0,
      showInfluencersOnly: false,
    });
  }, [onFilterChange]);

  // 현재 적용된 필터 수 계산
  const activeFilterCount = [
    filters.stageFilter !== 'all',
    filters.depthFilter !== 'all',
    filters.importanceFilter > 0,
    filters.showInfluencersOnly,
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

  // 소개 관계 범위 정보
  const depthOptions = [
    { value: 'all', label: '전체 관계', description: '모든 고객을 표시합니다' },
    {
      value: 'direct',
      label: '직접 소개',
      description: '1촌 관계만 표시합니다',
    },
    {
      value: 'indirect',
      label: '간접 소개',
      description: '2촌 관계까지 표시합니다',
    },
  ];

  // 중요도를 슬라이더로 표현하기 위한 값 변환
  const importanceSliderValue =
    filters.importanceFilter === 0 ? 0 : filters.importanceFilter;

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
            onClick={() => handleStageFilterChange('all')}
          >
            <X size={14} />
          </Button>
        </Badge>
      );
    }

    if (filters.depthFilter !== 'all') {
      const depth = depthOptions.find((d) => d.value === filters.depthFilter);
      activeFilters.push(
        <Badge
          key="depth"
          variant="outline"
          className="gap-1 rounded-full border pl-1.5 pr-1 text-sm font-normal group"
        >
          <Users size={14} className="mr-1" />
          {depth?.label}
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0 ml-1 opacity-60 group-hover:opacity-100"
            onClick={() => handleDepthFilterChange('all')}
          >
            <X size={14} />
          </Button>
        </Badge>
      );
    }

    if (filters.importanceFilter > 0) {
      activeFilters.push(
        <Badge
          key="importance"
          variant="outline"
          className="gap-1 rounded-full border pl-1.5 pr-1 text-sm font-normal group"
        >
          <span className="flex items-center mr-1">
            {Array.from({ length: filters.importanceFilter }).map((_, i) => (
              <Star
                key={i}
                size={12}
                className="fill-amber-400 text-amber-400"
              />
            ))}
          </span>
          <span className="sr-only">
            중요도 {filters.importanceFilter}점 이상
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0 ml-1 opacity-60 group-hover:opacity-100"
            onClick={() => handleImportanceFilterChange(0)}
          >
            <X size={14} />
          </Button>
        </Badge>
      );
    }

    if (filters.showInfluencersOnly) {
      activeFilters.push(
        <Badge
          key="influencers"
          variant="outline"
          className="gap-1 rounded-full border pl-1.5 pr-1 text-sm font-normal group"
        >
          <Sparkles size={14} className="mr-1 text-primary" />
          핵심 소개자
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0 ml-1 opacity-60 group-hover:opacity-100"
            onClick={() => handleInfluencersToggle(false)}
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

      <ScrollArea className="flex-1 pr-3 h-full overflow-y-auto">
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
                  {stats.filteredNodes}
                </span>
                <span className="text-sm text-muted-foreground">
                  필터링 표시
                </span>
              </div>
              <div className="p-3 flex flex-col items-center">
                <span className="text-2xl font-semibold">
                  {stats.totalNodes}
                </span>
                <span className="text-sm text-muted-foreground">전체 고객</span>
              </div>
            </div>
          </div>

          {/* 아코디언 필터 */}
          <Accordion
            type="multiple"
            defaultValue={['importance', 'stage', 'depth', 'influencer']}
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      최소 중요도
                    </span>
                    <div className="flex items-center gap-1">
                      {importanceSliderValue > 0 ? (
                        <div className="flex">
                          {Array.from({ length: importanceSliderValue }).map(
                            (_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className="fill-amber-400 text-amber-400"
                              />
                            )
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          전체
                        </span>
                      )}
                    </div>
                  </div>

                  <Slider
                    value={[importanceSliderValue]}
                    min={0}
                    max={5}
                    step={1}
                    onValueChange={(value) =>
                      handleImportanceFilterChange(value[0])
                    }
                    className="[&>.sliderRange]:bg-primary [&>.sliderThumb]:border-primary"
                  />

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

            {/* 소개 관계 범위 필터 */}
            <AccordionItem
              value="depth"
              className="border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-3 py-3 text-left hover:no-underline hover:bg-muted/20 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-primary" />
                  <span className="text-sm font-medium">소개 관계 범위</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-2 border-t">
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    직접 소개는 1촌 관계, 간접 소개는 2촌 관계까지 표시합니다.
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {depthOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={
                          filters.depthFilter === option.value
                            ? 'secondary'
                            : 'ghost'
                        }
                        className={cn(
                          'justify-start h-auto py-2.5 text-sm',
                          filters.depthFilter === option.value
                            ? 'font-medium'
                            : 'font-normal'
                        )}
                        onClick={() => handleDepthFilterChange(option.value)}
                      >
                        <div className="flex flex-col items-start">
                          <div className="flex items-center w-full">
                            <span>{option.label}</span>
                            {filters.depthFilter === option.value && (
                              <CheckCircle className="ml-auto h-4 w-4" />
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground font-normal mt-0.5">
                            {option.description}
                          </span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 핵심 소개자 필터 */}
            <AccordionItem
              value="influencer"
              className="border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-3 py-3 text-left hover:no-underline hover:bg-muted/20 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-primary" />
                  <span className="text-sm font-medium">핵심 소개자</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-2 border-t">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">핵심 소개자</span>
                      {filters.showInfluencersOnly && (
                        <LinkIcon size={12} className="text-primary ml-1" />
                      )}
                    </div>
                    <Switch
                      checked={filters.showInfluencersOnly}
                      onCheckedChange={handleInfluencersToggle}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>
                      핵심 소개자는 다수의 고객을 소개한 영향력 있는 고객입니다.
                    </p>
                    <p
                      className={
                        filters.showInfluencersOnly
                          ? 'text-primary text-xs mt-1.5'
                          : 'hidden'
                      }
                    >
                      핵심 소개자와 직접 연결된 고객도 함께 표시됩니다
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* 추가 여백 - 줄임 */}
          <div className="h-4" aria-hidden="true"></div>
        </div>
      </ScrollArea>
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
          <div className="p-4 flex-1 overflow-hidden flex flex-col h-full">
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
            <div className="flex-1 overflow-hidden flex flex-col h-full">
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
    <div className="hidden md:flex h-full border-r bg-background overflow-hidden flex flex-col">
      <div className="p-4 flex-1 overflow-hidden flex flex-col h-full">
        <FilterContent />
      </div>
    </div>
  );
}
