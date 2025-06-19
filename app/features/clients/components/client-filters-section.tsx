import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Separator } from '~/common/components/ui/separator';
import { Badge } from '~/common/components/ui/badge';
import { 
  Search, 
  Filter, 
  Download, 
  LayoutGrid, 
  LayoutList,
  Settings,
  X,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useDeviceType } from '~/common/hooks';
import { 
  MobileFilterModal, 
  type MobileFilterOptions 
} from './mobile-filter-modal';

interface ClientFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterImportance: 'all' | 'high' | 'medium' | 'low';
  setFilterImportance: (filter: 'all' | 'high' | 'medium' | 'low') => void;
  filterStage: string;
  setFilterStage: (stage: string) => void;
  filterReferralStatus: string;
  setFilterReferralStatus: (status: string) => void;
  viewMode: 'cards' | 'table';
  setViewMode: (mode: 'cards' | 'table') => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filteredClientsCount: number;
  // 새로운 고급 필터 Props
  advancedFilters?: MobileFilterOptions;
  onAdvancedFiltersChange?: (filters: MobileFilterOptions) => void;
}

export function ClientFiltersSection({
  searchQuery,
  setSearchQuery,
  filterImportance,
  setFilterImportance,
  filterStage,
  setFilterStage,
  filterReferralStatus,
  setFilterReferralStatus,
  viewMode,
  setViewMode,
  showFilters,
  setShowFilters,
  filteredClientsCount,
  advancedFilters,
  onAdvancedFiltersChange,
}: ClientFiltersProps) {
  const deviceType = useDeviceType();
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  
  // 기본 고급 필터 상태
  const defaultAdvancedFilters: MobileFilterOptions = {
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

  const currentAdvancedFilters = advancedFilters || defaultAdvancedFilters;

  // 활성 필터 개수 계산
  const activeFilterCount = useMemo(() => {
    let count = 0;
    
    // 기본 필터들
    if (filterImportance !== 'all') count++;
    if (filterStage !== 'all') count++;
    if (filterReferralStatus !== 'all') count++;
    if (searchQuery.trim()) count++;
    
    // 고급 필터들
    if (currentAdvancedFilters.importance.length > 0) count++;
    if (currentAdvancedFilters.stages.length > 0) count++;
    if (currentAdvancedFilters.referralStatus.length > 0) count++;
    if (currentAdvancedFilters.insuranceTypes.length > 0) count++;
    if (currentAdvancedFilters.tags.length > 0) count++;
    if (currentAdvancedFilters.premiumRange[0] > 0 || currentAdvancedFilters.premiumRange[1] < 1000000) count++;
    if (currentAdvancedFilters.engagementScore[0] > 0 || currentAdvancedFilters.engagementScore[1] < 10) count++;
    if (currentAdvancedFilters.conversionProbability[0] > 0 || currentAdvancedFilters.conversionProbability[1] < 100) count++;
    if (currentAdvancedFilters.referralCount[0] > 0 || currentAdvancedFilters.referralCount[1] < 50) count++;
    if (currentAdvancedFilters.dateRange.type !== 'all') count++;
    
    return count;
  }, [
    filterImportance, 
    filterStage, 
    filterReferralStatus, 
    searchQuery, 
    currentAdvancedFilters
  ]);

  // 필터 초기화 핸들러
  const handleResetAllFilters = () => {
    setSearchQuery('');
    setFilterImportance('all');
    setFilterStage('all');
    setFilterReferralStatus('all');
    onAdvancedFiltersChange?.(defaultAdvancedFilters);
  };

  // 활성 필터 배지 렌더링
  const renderActiveFilterBadges = () => {
    const badges = [];
    
    if (filterImportance !== 'all') {
      badges.push(
        <Badge key="importance" variant="secondary" className="gap-1 text-xs py-1 px-2">
          중요도: {filterImportance}
          <X 
            className="h-3 w-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full p-0.5" 
            onClick={() => setFilterImportance('all')}
          />
        </Badge>
      );
    }
    
    if (filterStage !== 'all') {
      badges.push(
        <Badge key="stage" variant="secondary" className="gap-1 text-xs py-1 px-2">
          단계: {filterStage}
          <X 
            className="h-3 w-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full p-0.5" 
            onClick={() => setFilterStage('all')}
          />
        </Badge>
      );
    }
    
    if (currentAdvancedFilters.insuranceTypes.length > 0) {
      badges.push(
        <Badge key="insurance" variant="secondary" className="gap-1 text-xs py-1 px-2">
          보험타입: {currentAdvancedFilters.insuranceTypes.length}개
          <X 
            className="h-3 w-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full p-0.5" 
            onClick={() => onAdvancedFiltersChange?.({
              ...currentAdvancedFilters,
              insuranceTypes: []
            })}
          />
        </Badge>
      );
    }
    
    return badges;
  };

  return (
    <Card>
      <CardHeader>
        {/* 🎯 모바일 우선 레이아웃 - 세로 배치 */}
        <div className="space-y-4">
          {/* 제목과 결과 개수 - 모바일에서 전체 너비 */}
          <div className="flex flex-col gap-2 md:gap-1">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              고객 검색 및 필터
              {activeFilterCount > 0 && (
                <Badge variant="default" className="px-2 py-1 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {filteredClientsCount}명의 고객이 검색되었습니다
            </p>
          </div>
          
          {/* 액션 버튼 영역 - 모바일에서 세로 배치 */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* 필터 버튼 그룹 - 모바일에서 전체 너비 */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              {/* 모바일: 고급 필터 버튼 */}
              {deviceType === 'mobile' && (
                <Button
                  variant="outline"
                  className="h-10 flex-1"
                  onClick={() => setIsAdvancedFilterOpen(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  고급 필터
                </Button>
              )}
              
              {/* 데스크톱: 기존 필터 토글 */}
              {deviceType !== 'mobile' && (
                <Button
                  variant="outline"
                  className="h-10"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  필터 {showFilters ? '숨기기' : '보기'}
                </Button>
              )}
            </div>
            
            {/* 뷰 모드 토글 - 모바일에서도 한 줄로 우측 정렬 */}
            <div className="flex items-center gap-2 justify-end md:justify-start">
              <Separator orientation="vertical" className="h-6 hidden md:block" />
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                className="h-10 w-10"
                onClick={() => setViewMode('cards')}
                title="카드 보기"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                className="h-10 w-10"
                onClick={() => setViewMode('table')}
                title="테이블 보기"
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 🎯 모바일 우선 검색 영역 - 세로 배치 */}
          <div className="flex flex-col gap-3 md:flex-row md:gap-4">
            {/* 검색 박스 - 모바일에서 전체 너비 */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="이름, 전화번호, 이메일, 직업, 주소로 검색..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 w-full"
                />
              </div>
            </div>
            
            {/* 빠른 중요도 필터 - 모바일에서 전체 너비 */}
            <div className="w-full md:w-[140px]">
              <Select
                value={filterImportance}
                onValueChange={value =>
                  setFilterImportance(value as 'all' | 'high' | 'medium' | 'low')
                }
              >
                <SelectTrigger className="w-full h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 중요도</SelectItem>
                  <SelectItem value="high">키맨</SelectItem>
                  <SelectItem value="medium">일반</SelectItem>
                  <SelectItem value="low">관찰</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 🎯 활성 필터 배지들 - 모바일 최적화 */}
          {activeFilterCount > 0 && (
            <div className="space-y-2">
              {/* 라벨과 초기화 버튼 - 모바일에서 한 줄 */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">활성 필터:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetAllFilters}
                  className="h-6 px-2 text-xs"
                >
                  전체 초기화
                </Button>
              </div>
              
              {/* 배지들 - 모바일에서 줄바꿈 적극 활용 */}
              <div className="flex flex-wrap gap-1.5">
                {renderActiveFilterBadges()}
                {activeFilterCount > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{activeFilterCount - 3}개 더
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* 🎯 데스크톱: 기존 고급 필터 - 모바일 우선 레이아웃 */}
          {deviceType !== 'mobile' && showFilters && (
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 영업 단계 필터 */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    영업 단계
                  </label>
                  <Select value={filterStage} onValueChange={setFilterStage}>
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="단계 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">모든 단계</SelectItem>
                      <SelectItem value="prospect">잠재고객</SelectItem>
                      <SelectItem value="consultation">첫 상담</SelectItem>
                      <SelectItem value="needs_analysis">니즈 분석</SelectItem>
                      <SelectItem value="proposal">상품 설명</SelectItem>
                      <SelectItem value="negotiation">계약 검토</SelectItem>
                      <SelectItem value="closed_won">계약 완료</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 소개 상태 필터 */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    소개 상태
                  </label>
                  <Select
                    value={filterReferralStatus}
                    onValueChange={setFilterReferralStatus}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="상태 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">모든 고객</SelectItem>
                      <SelectItem value="has_referrer">소개받은 고객</SelectItem>
                      <SelectItem value="no_referrer">직접 영업 고객</SelectItem>
                      <SelectItem value="top_referrer">
                        핵심 소개자 (3명+)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 내보내기 버튼 */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    데이터 관리
                  </label>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full h-10 opacity-60 cursor-not-allowed"
                      disabled
                    >
                      <Download className="h-4 w-4 mr-2" />
                      내보내기
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      MVP에서는 제공되지 않는 기능입니다
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {/* 모바일 고급 필터 모달 */}
      <MobileFilterModal
        isOpen={isAdvancedFilterOpen}
        onOpenChange={setIsAdvancedFilterOpen}
        filters={currentAdvancedFilters}
        onFiltersChange={onAdvancedFiltersChange || (() => {})}
        onApply={() => {
          // 필터 적용 후 추가 처리 로직
          console.log('Advanced filters applied:', currentAdvancedFilters);
        }}
        onReset={() => {
          onAdvancedFiltersChange?.(defaultAdvancedFilters);
        }}
        activeFilterCount={activeFilterCount}
      />
    </Card>
  );
}
