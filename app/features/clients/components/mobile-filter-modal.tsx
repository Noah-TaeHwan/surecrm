import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/common/components/ui/sheet';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { Separator } from '~/common/components/ui/separator';
import { ScrollArea } from '~/common/components/ui/scroll-area';
import { Checkbox } from '~/common/components/ui/checkbox';
import { Label } from '~/common/components/ui/label';
import { Slider } from '~/common/components/ui/slider';
import { Input } from '~/common/components/ui/input';
import {
  Filter,
  X,
  RotateCcw,
  Check,
  Calendar,
  DollarSign,
  Tag,
  Users,
  Briefcase,
} from 'lucide-react';
import { format, subDays, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '~/lib/utils';

// 🎯 필터 옵션 타입 정의
export interface MobileFilterOptions {
  // 기존 필터들
  importance: string[];
  stages: string[];
  referralStatus: string[];
  
  // 새로운 고급 필터들
  insuranceTypes: string[];
  premiumRange: [number, number];
  dateRange: {
    type: 'all' | 'lastContact' | 'nextAction' | 'joinDate';
    from?: Date;
    to?: Date;
    preset?: 'week' | 'month' | 'quarter' | 'year';
  };
  tags: string[];
  engagementScore: [number, number];
  conversionProbability: [number, number];
  referralCount: [number, number];
}

interface MobileFilterModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filters: MobileFilterOptions;
  onFiltersChange: (filters: MobileFilterOptions) => void;
  onApply: () => void;
  onReset: () => void;
  activeFilterCount: number;
}

// 🎯 필터 옵션 데이터
const IMPORTANCE_OPTIONS = [
  { value: 'high', label: '키맨', color: 'bg-red-100 text-red-800' },
  { value: 'medium', label: '일반', color: 'bg-blue-100 text-blue-800' },
  { value: 'low', label: '관찰', color: 'bg-gray-100 text-gray-800' },
];

const STAGE_OPTIONS = [
  { value: 'prospect', label: '잠재고객', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'consultation', label: '첫 상담', color: 'bg-blue-100 text-blue-800' },
  { value: 'needs_analysis', label: '니즈 분석', color: 'bg-purple-100 text-purple-800' },
  { value: 'proposal', label: '상품 설명', color: 'bg-orange-100 text-orange-800' },
  { value: 'negotiation', label: '계약 검토', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'closed_won', label: '계약 완료', color: 'bg-green-100 text-green-800' },
];

const INSURANCE_TYPE_OPTIONS = [
  { value: 'life', label: '생명보험', icon: '🛡️' },
  { value: 'health', label: '건강보험', icon: '🏥' },
  { value: 'accident', label: '상해보험', icon: '🚑' },
  { value: 'car', label: '자동차보험', icon: '🚗' },
  { value: 'fire', label: '화재보험', icon: '🔥' },
  { value: 'travel', label: '여행보험', icon: '✈️' },
  { value: 'pension', label: '연금보험', icon: '💰' },
  { value: 'savings', label: '저축보험', icon: '💳' },
];

const REFERRAL_STATUS_OPTIONS = [
  { value: 'has_referrer', label: '소개받은 고객', icon: '👥' },
  { value: 'no_referrer', label: '직접 영업', icon: '🎯' },
  { value: 'top_referrer', label: '핵심 소개자 (3명+)', icon: '⭐' },
];

const DATE_PRESET_OPTIONS = [
  { value: 'week', label: '최근 1주일' },
  { value: 'month', label: '최근 1개월' },
  { value: 'quarter', label: '최근 3개월' },
  { value: 'year', label: '최근 1년' },
];

export function MobileFilterModal({
  isOpen,
  onOpenChange,
  filters,
  onFiltersChange,
  onApply,
  onReset,
  activeFilterCount,
}: MobileFilterModalProps) {
  const [localFilters, setLocalFilters] = useState<MobileFilterOptions>(filters);

  // 🎯 필터 업데이트 헬퍼 함수
  const updateFilter = <K extends keyof MobileFilterOptions>(
    key: K,
    value: MobileFilterOptions[K]
  ) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  // 🎯 멀티셀렉트 토글 헬퍼
  const toggleMultiSelect = (
    key: 'importance' | 'stages' | 'referralStatus' | 'insuranceTypes' | 'tags',
    value: string
  ) => {
    const current = localFilters[key];
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  // 🎯 적용 및 리셋 핸들러
  const handleApply = () => {
    onFiltersChange(localFilters);
    onApply();
    onOpenChange(false);
  };

  const handleReset = () => {
    const resetFilters: MobileFilterOptions = {
      importance: [],
      stages: [],
      referralStatus: [],
      insuranceTypes: [],
      premiumRange: [0, 1000000],
      dateRange: { type: 'all' },
      tags: [],
      engagementScore: [0, 10],
      conversionProbability: [0, 100],
      referralCount: [0, 50],
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    onReset();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] sm:h-[80vh] p-0">
        <div className="flex flex-col h-full">
          {/* 🎯 헤더 */}
          <SheetHeader className="px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  고급 필터
                </SheetTitle>
                <SheetDescription>
                  다양한 조건으로 고객을 필터링하세요
                </SheetDescription>
              </div>
              
              {/* 활성 필터 개수 표시 */}
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="px-2 py-1">
                  {activeFilterCount}개 필터 적용됨
                </Badge>
              )}
            </div>
          </SheetHeader>

          {/* 🎯 필터 컨텐츠 */}
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-6 py-6">
              
              {/* 중요도 필터 */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  고객 중요도
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {IMPORTANCE_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`importance-${option.value}`}
                        checked={localFilters.importance.includes(option.value)}
                        onCheckedChange={() => toggleMultiSelect('importance', option.value)}
                      />
                      <Label
                        htmlFor={`importance-${option.value}`}
                        className={cn(
                          'text-sm px-2 py-1 rounded-md cursor-pointer',
                          option.color
                        )}
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* 영업 단계 필터 */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  영업 단계
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {STAGE_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`stage-${option.value}`}
                        checked={localFilters.stages.includes(option.value)}
                        onCheckedChange={() => toggleMultiSelect('stages', option.value)}
                      />
                      <Label
                        htmlFor={`stage-${option.value}`}
                        className={cn(
                          'text-sm px-2 py-1 rounded-md cursor-pointer flex-1',
                          option.color
                        )}
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* 보험 타입 필터 */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  보험 상품 타입
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {INSURANCE_TYPE_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`insurance-${option.value}`}
                        checked={localFilters.insuranceTypes.includes(option.value)}
                        onCheckedChange={() => toggleMultiSelect('insuranceTypes', option.value)}
                      />
                      <Label
                        htmlFor={`insurance-${option.value}`}
                        className="text-sm cursor-pointer flex items-center gap-2 flex-1"
                      >
                        <span>{option.icon}</span>
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* 월 보험료 범위 */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  월 보험료 범위
                </Label>
                <div className="space-y-4">
                  <Slider
                    value={localFilters.premiumRange}
                    onValueChange={(value) => updateFilter('premiumRange', value as [number, number])}
                    max={1000000}
                    min={0}
                    step={10000}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>₩{localFilters.premiumRange[0].toLocaleString()}</span>
                    <span>₩{localFilters.premiumRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 소개 상태 */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  소개 상태
                </Label>
                <div className="space-y-2">
                  {REFERRAL_STATUS_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`referral-${option.value}`}
                        checked={localFilters.referralStatus.includes(option.value)}
                        onCheckedChange={() => toggleMultiSelect('referralStatus', option.value)}
                      />
                      <Label
                        htmlFor={`referral-${option.value}`}
                        className="text-sm cursor-pointer flex items-center gap-2 flex-1"
                      >
                        <span>{option.icon}</span>
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* 참여도 점수 */}
              <div className="space-y-3">
                <Label className="text-base font-medium">참여도 점수 (1-10)</Label>
                <div className="space-y-4">
                  <Slider
                    value={localFilters.engagementScore}
                    onValueChange={(value) => updateFilter('engagementScore', value as [number, number])}
                    max={10}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{localFilters.engagementScore[0]}점</span>
                    <span>{localFilters.engagementScore[1]}점</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 전환 확률 */}
              <div className="space-y-3">
                <Label className="text-base font-medium">전환 확률 (%)</Label>
                <div className="space-y-4">
                  <Slider
                    value={localFilters.conversionProbability}
                    onValueChange={(value) => updateFilter('conversionProbability', value as [number, number])}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{localFilters.conversionProbability[0]}%</span>
                    <span>{localFilters.conversionProbability[1]}%</span>
                  </div>
                </div>
              </div>

              <div className="pb-20" /> {/* 하단 버튼 공간 확보 */}
            </div>
          </ScrollArea>

          {/* 🎯 하단 액션 버튼들 */}
          <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-6">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1"
                size="lg"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                초기화
              </Button>
              <Button
                onClick={handleApply}
                className="flex-2"
                size="lg"
              >
                <Check className="h-4 w-4 mr-2" />
                필터 적용
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
