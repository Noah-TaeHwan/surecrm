import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '~/common/components/ui/sheet';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { Separator } from '~/common/components/ui/separator';
import { Checkbox } from '~/common/components/ui/checkbox';
import { Label } from '~/common/components/ui/label';
import { Slider } from '~/common/components/ui/slider';
import { Input } from '~/common/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Filter, X, Settings, RotateCcw } from 'lucide-react';
import { cn } from '~/lib/utils';

export interface MobileFilterOptions {
  stages: string[];
  importance: string[];
  sources: string[];
  ageRange: [number, number];
  hasPolicy: boolean | null;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

interface StageOption {
  id: string;
  name: string;
}

interface ImportanceOption {
  value: string;
  label: string;
}

interface SourceOption {
  value: string;
  label: string;
}

export interface MobileFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: MobileFilterOptions;
  onFiltersChange: (filters: MobileFilterOptions) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  availableStages: StageOption[];
  availableImportance: ImportanceOption[];
  availableSources: SourceOption[];
  activeFiltersCount: number;
}

export default function MobileFilterModal({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  availableStages,
  availableImportance,
  availableSources,
  activeFiltersCount,
}: MobileFilterModalProps) {
  const [localFilters, setLocalFilters] =
    useState<MobileFilterOptions>(filters);

  const handleFilterChange = (newFilters: Partial<MobileFilterOptions>) => {
    const updatedFilters = { ...localFilters, ...newFilters };
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handleApply = () => {
    onApplyFilters();
    onClose();
  };

  const handleClear = () => {
    onClearFilters();
    onClose();
  };

  const handleStageToggle = (stageId: string, checked: boolean) => {
    const newStages = checked
      ? [...localFilters.stages, stageId]
      : localFilters.stages.filter(id => id !== stageId);
    handleFilterChange({ stages: newStages });
  };

  const handleImportanceToggle = (
    importanceValue: string,
    checked: boolean
  ) => {
    const newImportance = checked
      ? [...localFilters.importance, importanceValue]
      : localFilters.importance.filter(val => val !== importanceValue);
    handleFilterChange({ importance: newImportance });
  };

  const handleSourceToggle = (sourceValue: string, checked: boolean) => {
    const newSources = checked
      ? [...localFilters.sources, sourceValue]
      : localFilters.sources.filter(val => val !== sourceValue);
    handleFilterChange({ sources: newSources });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="h-[85vh] flex flex-col p-0 [&>button]:hidden"
      >
        <SheetHeader className="p-6 pb-4 flex-shrink-0 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <SheetTitle className="text-xl font-semibold tracking-tight">
                고급 필터
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                {activeFiltersCount > 0
                  ? `${activeFiltersCount}개의 필터가 활성화됨`
                  : '상세한 조건으로 고객을 필터링하세요'}
              </SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">닫기</span>
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground">
                  영업 단계
                </Label>
                {localFilters.stages.length > 0 && (
                  <Badge variant="secondary" className="h-5 px-2 text-xs">
                    {localFilters.stages.length}개 선택
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {availableStages.map(stage => (
                  <div
                    key={stage.id}
                    className="flex items-center space-x-2 p-3 rounded-lg border border-border/50 bg-card/30"
                  >
                    <Checkbox
                      id={`stage-${stage.id}`}
                      checked={localFilters.stages.includes(stage.id)}
                      onCheckedChange={checked =>
                        handleStageToggle(stage.id, checked as boolean)
                      }
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label
                      htmlFor={`stage-${stage.id}`}
                      className="text-sm font-normal text-foreground cursor-pointer flex-1"
                    >
                      {stage.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-border/60" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground">
                  중요도
                </Label>
                {localFilters.importance.length > 0 && (
                  <Badge variant="secondary" className="h-5 px-2 text-xs">
                    {localFilters.importance.length}개 선택
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-1 gap-3">
                {availableImportance.map(importance => (
                  <div
                    key={importance.value}
                    className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 bg-card/30"
                  >
                    <Checkbox
                      id={`importance-${importance.value}`}
                      checked={localFilters.importance.includes(
                        importance.value
                      )}
                      onCheckedChange={checked =>
                        handleImportanceToggle(
                          importance.value,
                          checked as boolean
                        )
                      }
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label
                      htmlFor={`importance-${importance.value}`}
                      className="text-sm font-normal text-foreground cursor-pointer flex-1"
                    >
                      {importance.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-border/60" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground">
                  고객 출처
                </Label>
                {localFilters.sources.length > 0 && (
                  <Badge variant="secondary" className="h-5 px-2 text-xs">
                    {localFilters.sources.length}개 선택
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {availableSources.map(source => (
                  <div
                    key={source.value}
                    className="flex items-center space-x-2 p-3 rounded-lg border border-border/50 bg-card/30"
                  >
                    <Checkbox
                      id={`source-${source.value}`}
                      checked={localFilters.sources.includes(source.value)}
                      onCheckedChange={checked =>
                        handleSourceToggle(source.value, checked as boolean)
                      }
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label
                      htmlFor={`source-${source.value}`}
                      className="text-sm font-normal text-foreground cursor-pointer flex-1"
                    >
                      {source.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-border/60" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground">
                  나이 범위
                </Label>
                <Badge variant="outline" className="h-5 px-2 text-xs">
                  {localFilters.ageRange[0]}세 - {localFilters.ageRange[1]}세
                </Badge>
              </div>
              <div className="px-3">
                <Slider
                  value={localFilters.ageRange}
                  onValueChange={value =>
                    handleFilterChange({ ageRange: value as [number, number] })
                  }
                  min={18}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>18세</span>
                  <span>100세</span>
                </div>
              </div>
            </div>

            <Separator className="bg-border/60" />

            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">
                보험 가입 여부
              </Label>
              <Select
                value={
                  localFilters.hasPolicy === null
                    ? 'all'
                    : localFilters.hasPolicy
                      ? 'yes'
                      : 'no'
                }
                onValueChange={value => {
                  const hasPolicy = value === 'all' ? null : value === 'yes';
                  handleFilterChange({ hasPolicy });
                }}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="yes">가입함</SelectItem>
                  <SelectItem value="no">미가입</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator className="bg-border/60" />

            <div className="space-y-4">
              <Label className="text-sm font-medium text-foreground">
                정렬 설정
              </Label>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    정렬 기준
                  </Label>
                  <Select
                    value={localFilters.sortBy}
                    onValueChange={value =>
                      handleFilterChange({ sortBy: value })
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">이름</SelectItem>
                      <SelectItem value="createdAt">등록일</SelectItem>
                      <SelectItem value="importance">중요도</SelectItem>
                      <SelectItem value="stage">영업 단계</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    정렬 방향
                  </Label>
                  <Select
                    value={localFilters.sortDirection}
                    onValueChange={value =>
                      handleFilterChange({
                        sortDirection: value as 'asc' | 'desc',
                      })
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">오름차순</SelectItem>
                      <SelectItem value="desc">내림차순</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 p-6 pt-4 border-t border-border/40 bg-background/80 backdrop-blur-sm">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClear}
              className="flex-1 h-11 text-sm font-medium"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              초기화
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1 h-11 text-sm font-medium bg-primary hover:bg-primary/90"
            >
              <Filter className="h-4 w-4 mr-2" />
              필터 적용
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
