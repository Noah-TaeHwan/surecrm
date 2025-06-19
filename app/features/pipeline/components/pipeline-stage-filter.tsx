import { useState, useCallback } from 'react';
import { Badge } from '~/common/components/ui/badge';
import { Button } from '~/common/components/ui/button';
import { Card, CardContent } from '~/common/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '~/common/components/ui/dropdown-menu';
import {
  Filter,
  ChevronDown,
  Users,
  Eye,
  EyeOff,
  Grid3X3,
  Layers,
  CheckCircle,
  Circle,
  Star,
  Clock,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import type { PipelineStage, Client } from '~/features/pipeline/types/types';

// 🎯 PipelineStageFilter Props
interface PipelineStageFilterProps {
  stages: PipelineStage[];
  clients: Client[];
  selectedStages: string[]; // 선택된 스테이지 ID들
  onStagesChange: (stageIds: string[]) => void;
  viewMode: 'all' | 'single' | 'custom';
  onViewModeChange: (mode: 'all' | 'single' | 'custom') => void;
  currentSingleStage?: string;
  onSingleStageChange?: (stageId: string) => void;
  isMobile?: boolean;
}

// 🎯 스테이지별 통계 계산
interface StageStats {
  total: number;
  highPriority: number;
  urgent: number; // 7일 이상 연락 없음
  stale: number; // 30일 이상 체류
}

export function PipelineStageFilter({
  stages,
  clients,
  selectedStages,
  onStagesChange,
  viewMode,
  onViewModeChange,
  currentSingleStage,
  onSingleStageChange,
  isMobile = false,
}: PipelineStageFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 🎯 스테이지별 통계 계산
  const getStageStats = useCallback(
    (stageId: string): StageStats => {
      const stageClients = clients.filter(client => client.stageId === stageId);

      const stats: StageStats = {
        total: stageClients.length,
        highPriority: 0,
        urgent: 0,
        stale: 0,
      };

      stageClients.forEach(client => {
        // 높은 중요도
        if (client.importance === 'high') {
          stats.highPriority++;
        }

        // 7일 이상 연락 없음
        if (client.lastContactDate) {
          const lastContactDate = new Date(client.lastContactDate);
          if (!isNaN(lastContactDate.getTime())) {
            const daysSince = Math.floor(
              (new Date().getTime() - lastContactDate.getTime()) /
                (1000 * 60 * 60 * 24)
            );
            if (daysSince >= 7) {
              stats.urgent++;
            }
          }
        }

        // 30일 이상 체류
        if (client.createdAt) {
          const createdAt = new Date(client.createdAt);
          if (!isNaN(createdAt.getTime())) {
            const daysInPipeline = Math.floor(
              (new Date().getTime() - createdAt.getTime()) /
                (1000 * 60 * 60 * 24)
            );
            if (daysInPipeline >= 30) {
              stats.stale++;
            }
          }
        }
      });

      return stats;
    },
    [clients]
  );

  // 🎯 전체 통계
  const totalStats = stages.reduce(
    (acc, stage) => {
      const stats = getStageStats(stage.id);
      return {
        total: acc.total + stats.total,
        highPriority: acc.highPriority + stats.highPriority,
        urgent: acc.urgent + stats.urgent,
        stale: acc.stale + stats.stale,
      };
    },
    { total: 0, highPriority: 0, urgent: 0, stale: 0 }
  );

  // 🎯 스테이지 토글
  const toggleStage = useCallback(
    (stageId: string) => {
      if (selectedStages.includes(stageId)) {
        onStagesChange(selectedStages.filter(id => id !== stageId));
      } else {
        onStagesChange([...selectedStages, stageId]);
      }
    },
    [selectedStages, onStagesChange]
  );

  // 🎯 전체 선택/해제
  const selectAllStages = useCallback(() => {
    const allStageIds = stages.map(stage => stage.id);
    onStagesChange(allStageIds);
    onViewModeChange('all');
  }, [stages, onStagesChange, onViewModeChange]);

  const deselectAllStages = useCallback(() => {
    onStagesChange([]);
    onViewModeChange('custom');
  }, [onStagesChange, onViewModeChange]);

  // 🎯 모바일 뷰 렌더링
  if (isMobile) {
    return (
      <div className="space-y-3">
        {/* 🎯 뷰 모드 선택 */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              onViewModeChange('all');
              selectAllStages();
            }}
            className="flex-1"
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            전체 ({totalStats.total})
          </Button>

          <Select
            value={currentSingleStage || ''}
            onValueChange={value => {
              onSingleStageChange?.(value);
              onViewModeChange('single');
            }}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="단일 단계 선택" />
            </SelectTrigger>
            <SelectContent>
              {stages.map(stage => {
                const stats = getStageStats(stage.id);
                return (
                  <SelectItem key={stage.id} value={stage.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{stage.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        {stats.total}
                      </Badge>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* 🎯 커스텀 필터 (확장 가능) */}
        {viewMode === 'custom' && (
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">커스텀 필터</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </Button>
              </div>

              {isExpanded && (
                <div className="space-y-2">
                  {stages.map(stage => {
                    const stats = getStageStats(stage.id);
                    const isSelected = selectedStages.includes(stage.id);

                    return (
                      <div
                        key={stage.id}
                        className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-primary/5 border-primary'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => toggleStage(stage.id)}
                      >
                        <div className="flex items-center gap-2">
                          {isSelected ? (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm font-medium">
                            {stage.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Badge variant={isSelected ? 'default' : 'secondary'}>
                            {stats.total}
                          </Badge>
                          {stats.urgent > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {stats.urgent}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 🎯 전체 통계 */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 bg-muted/30 rounded-lg">
            <div className="text-sm font-semibold">{totalStats.total}</div>
            <div className="text-xs text-muted-foreground">전체</div>
          </div>
          <div className="p-2 bg-orange-50 rounded-lg">
            <div className="text-sm font-semibold text-orange-600">
              {totalStats.highPriority}
            </div>
            <div className="text-xs text-orange-600">중요</div>
          </div>
          <div className="p-2 bg-red-50 rounded-lg">
            <div className="text-sm font-semibold text-red-600">
              {totalStats.urgent}
            </div>
            <div className="text-xs text-red-600">긴급</div>
          </div>
          <div className="p-2 bg-yellow-50 rounded-lg">
            <div className="text-sm font-semibold text-yellow-600">
              {totalStats.stale}
            </div>
            <div className="text-xs text-yellow-600">지연</div>
          </div>
        </div>
      </div>
    );
  }

  // 🎯 데스크톱 뷰 렌더링
  return (
    <div className="flex items-center gap-4 p-4 bg-card border rounded-lg">
      {/* 🎯 필터 아이콘 */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">파이프라인 필터</span>
      </div>

      {/* 🎯 뷰 모드 토글 */}
      <div className="flex items-center gap-2">
        <Button
          variant={viewMode === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            onViewModeChange('all');
            selectAllStages();
          }}
        >
          <Grid3X3 className="h-4 w-4 mr-2" />
          전체 보기
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Layers className="h-4 w-4 mr-2" />
              단계 선택
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={selectAllStages}>
              <Eye className="h-4 w-4 mr-2" />
              모든 단계 보기
            </DropdownMenuItem>
            <DropdownMenuItem onClick={deselectAllStages}>
              <EyeOff className="h-4 w-4 mr-2" />
              모든 단계 숨기기
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {stages.map(stage => {
              const stats = getStageStats(stage.id);
              const isSelected = selectedStages.includes(stage.id);

              return (
                <DropdownMenuItem
                  key={stage.id}
                  onClick={() => toggleStage(stage.id)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {isSelected ? (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{stage.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {stats.total}
                    </Badge>
                    {stats.urgent > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {stats.urgent}
                      </Badge>
                    )}
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 🎯 선택된 단계 표시 */}
      {viewMode === 'custom' && selectedStages.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">선택됨:</span>
          <div className="flex gap-1 flex-wrap">
            {selectedStages.slice(0, 3).map(stageId => {
              const stage = stages.find(s => s.id === stageId);
              const stats = getStageStats(stageId);
              return stage ? (
                <Badge key={stageId} variant="secondary">
                  {stage.name} ({stats.total})
                </Badge>
              ) : null;
            })}
            {selectedStages.length > 3 && (
              <Badge variant="secondary">
                +{selectedStages.length - 3}개 더
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* 🎯 전체 통계 (간단히) */}
      <div className="flex items-center gap-4 ml-auto text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>{totalStats.total}</span>
        </div>
        {totalStats.urgent > 0 && (
          <div className="flex items-center gap-1 text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span>{totalStats.urgent}</span>
          </div>
        )}
        {totalStats.highPriority > 0 && (
          <div className="flex items-center gap-1 text-orange-600">
            <Star className="h-4 w-4" />
            <span>{totalStats.highPriority}</span>
          </div>
        )}
      </div>
    </div>
  );
}
