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
        <Badge key="importance" variant="secondary" className="gap-1">
          중요도: {filterImportance}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => setFilterImportance('all')}
          />
        </Badge>
      );
    }
    
    if (filterStage !== 'all') {
      badges.push(
        <Badge key="stage" variant="secondary" className="gap-1">
          단계: {filterStage}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => setFilterStage('all')}
          />
        </Badge>
      );
    }
    
    if (currentAdvancedFilters.insuranceTypes.length > 0) {
      badges.push(
        <Badge key="insurance" variant="secondary" className="gap-1">
          보험타입: {currentAdvancedFilters.insuranceTypes.length}개
          <X 
            className="h-3 w-3 cursor-pointer" 
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
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle className="flex items-center gap-2">
              고객 검색 및 필터
              {activeFilterCount > 0 && (
                <Badge variant="default" className="px-2 py-1">
                  {activeFilterCount}
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {filteredClientsCount}명의 고객이 검색되었습니다
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* 모바일: 고급 필터 버튼 */}
            {deviceType === 'mobile' && (
              <Button
                variant="outline"
                className="h-10"
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
            
            <Separator orientation="vertical" className="h-6" />
            
            {/* 뷰 모드 토글 */}
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              className="h-10 w-10"
              onClick={() => setViewMode('cards')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              className="h-10 w-10"
              onClick={() => setViewMode('table')}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 기본 검색 (모든 디바이스) */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="이름, 전화번호, 이메일, 직업, 주소로 검색..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>
            
            {/* 빠른 중요도 필터 */}
            <Select
              value={filterImportance}
              onValueChange={value =>
                setFilterImportance(value as 'all' | 'high' | 'medium' | 'low')
              }
            >
              <SelectTrigger className="w-[120px] h-10">
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

          {/* 활성 필터 배지들 */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground">활성 필터:</span>
              {renderActiveFilterBadges()}
              {activeFilterCount > 3 && (
                <Badge variant="outline">
                  +{activeFilterCount - 3}개 더
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetAllFilters}
                className="h-6 px-2 text-xs"
              >
                전체 초기화
              </Button>
            </div>
          )}

          {/* 데스크톱: 기존 고급 필터 */}
          {deviceType !== 'mobile' && showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <Select value={filterStage} onValueChange={setFilterStage}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="영업 단계" />
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

              <Select
                value={filterReferralStatus}
                onValueChange={setFilterReferralStatus}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="소개 상태" />
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

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full h-10 opacity-60 cursor-not-allowed"
                    disabled
                  >
                    <Download className="h-4 w-4 mr-2" />
                    내보내기
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    MVP에서는 제공되지 않는 기능입니다
                  </p>
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
