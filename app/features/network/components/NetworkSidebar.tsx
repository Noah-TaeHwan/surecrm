import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Label } from '~/common/components/ui/label';
import { RadioGroup, RadioGroupItem } from '~/common/components/ui/radio-group';
import { Separator } from '~/common/components/ui/separator';
import { Switch } from '~/common/components/ui/switch';
import { Badge } from '~/common/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Button } from '~/common/components/ui/button';
import {
  Filter,
  Info,
  Star,
  StarHalf,
  Users,
  Network,
  BarChart4,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { ScrollArea } from '~/common/components/ui/scroll-area';
import { cn } from '~/lib/utils';

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
      onFilterChange({ ...filters, showInfluencersOnly: checked });
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

  return (
    <div className="h-full border-r bg-background overflow-hidden flex flex-col">
      <div className="p-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-primary" />
          <h2 className="text-md font-semibold">네트워크 필터</h2>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFilterCount}개 적용됨
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetFilters}
          className="text-xs flex items-center gap-1"
          disabled={activeFilterCount === 0}
        >
          <RefreshCw size={14} /> 초기화
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-5">
          {/* 네트워크 현황 */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Network size={16} className="text-primary" />
              <h3 className="text-sm font-semibold">네트워크 현황</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="flex flex-col items-center p-2 bg-muted/10 rounded-md">
                <span className="text-lg font-semibold text-primary">
                  {stats.filteredNodes}
                </span>
                <span className="text-xs text-muted-foreground">표시 중</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-muted/10 rounded-md">
                <span className="text-lg font-semibold">
                  {stats.totalNodes}
                </span>
                <span className="text-xs text-muted-foreground">전체</span>
              </div>
            </div>
          </div>

          {/* 빠른 필터 */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={
                filters.importanceFilter === 0 &&
                filters.stageFilter === 'all' &&
                filters.depthFilter === 'all' &&
                !filters.showInfluencersOnly
                  ? 'default'
                  : 'outline'
              }
              size="sm"
              className="h-auto py-2 text-xs"
              onClick={() => handleResetFilters()}
            >
              전체 보기
            </Button>

            <Button
              variant={filters.importanceFilter >= 3 ? 'default' : 'outline'}
              size="sm"
              className="h-auto py-2 text-xs flex flex-col gap-0.5"
              onClick={() => handleImportanceFilterChange(3)}
            >
              <span>주요 고객</span>
              <div className="flex">
                <Star size={10} className="fill-current" />
                <Star size={10} className="fill-current" />
                <Star size={10} className="fill-current" />
              </div>
            </Button>

            <Button
              variant={filters.showInfluencersOnly ? 'default' : 'outline'}
              size="sm"
              className="h-auto py-2 text-xs"
              onClick={() =>
                handleInfluencersToggle(!filters.showInfluencersOnly)
              }
            >
              <span>핵심 소개자</span>
            </Button>
          </div>

          <Separator />

          {/* 고객 중요도 선택 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-0.5">
              <Star size={16} className="text-amber-400" />
              <h3 className="text-sm font-semibold">고객 중요도</h3>
            </div>

            <div className="flex items-center justify-between gap-1 pt-1">
              {[0, 1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  className={`flex flex-col items-center cursor-pointer transition-all ${
                    filters.importanceFilter === value
                      ? 'scale-110'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  onClick={() => handleImportanceFilterChange(value)}
                >
                  <div className="flex mb-1">
                    {value === 0 ? (
                      <span className="text-sm text-muted-foreground">
                        전체
                      </span>
                    ) : (
                      Array.from({ length: value }).map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className={`fill-current ${
                            filters.importanceFilter === value
                              ? 'text-amber-400'
                              : 'text-amber-400/70'
                          }`}
                        />
                      ))
                    )}
                  </div>
                  {filters.importanceFilter === value && (
                    <div className="h-0.5 w-full bg-primary rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* 영업 단계 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-0.5">
              <BarChart4 size={16} className="text-primary" />
              <h3 className="text-sm font-semibold">영업 단계</h3>
            </div>

            <RadioGroup
              value={filters.stageFilter}
              onValueChange={handleStageFilterChange}
              className="grid grid-cols-2 gap-1"
            >
              <div className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-muted/20">
                <RadioGroupItem value="all" id="all-stages" />
                <Label htmlFor="all-stages" className="cursor-pointer text-sm">
                  전체
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-muted/20">
                <RadioGroupItem value="첫 상담" id="stage-1" />
                <Label htmlFor="stage-1" className="cursor-pointer text-sm">
                  첫 상담
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-muted/20">
                <RadioGroupItem value="니즈 분석" id="stage-2" />
                <Label htmlFor="stage-2" className="cursor-pointer text-sm">
                  니즈 분석
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-muted/20">
                <RadioGroupItem value="상품 설명" id="stage-3" />
                <Label htmlFor="stage-3" className="cursor-pointer text-sm">
                  상품 설명
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-muted/20">
                <RadioGroupItem value="계약 검토" id="stage-4" />
                <Label htmlFor="stage-4" className="cursor-pointer text-sm">
                  계약 검토
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-muted/20">
                <RadioGroupItem value="계약 완료" id="stage-5" />
                <Label htmlFor="stage-5" className="cursor-pointer text-sm">
                  계약 완료
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* 소개 관계 깊이 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-0.5">
              <Users size={16} className="text-primary" />
              <h3 className="text-sm font-semibold">소개 관계 범위</h3>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={filters.depthFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                className="h-auto py-2 text-xs"
                onClick={() => handleDepthFilterChange('all')}
              >
                전체
              </Button>
              <Button
                variant={
                  filters.depthFilter === 'direct' ? 'default' : 'outline'
                }
                size="sm"
                className="h-auto py-2 text-xs"
                onClick={() => handleDepthFilterChange('direct')}
              >
                직접 소개
              </Button>
              <Button
                variant={
                  filters.depthFilter === 'indirect' ? 'default' : 'outline'
                }
                size="sm"
                className="h-auto py-2 text-xs"
                onClick={() => handleDepthFilterChange('indirect')}
              >
                간접 소개
              </Button>
            </div>

            <div className="text-xs text-muted-foreground mt-1">
              직접 소개는 1촌, 간접 소개는 2촌 관계를 의미합니다.
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
