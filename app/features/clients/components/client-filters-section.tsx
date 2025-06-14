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
import { Search, Filter } from 'lucide-react';

interface ClientFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterImportance: 'all' | 'high' | 'medium' | 'low';
  setFilterImportance: (filter: 'all' | 'high' | 'medium' | 'low') => void;
  filterStage: string;
  setFilterStage: (stage: string) => void;
  filterReferralStatus: string;
  setFilterReferralStatus: (status: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filteredClientsCount: number;
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
  showFilters,
  setShowFilters,
  filteredClientsCount,
}: ClientFiltersProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Search className="h-4 w-4 text-primary" />
              </div>
              고객 검색 및 필터
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredClientsCount}명의 고객이 검색되었습니다
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-10 w-full sm:w-auto"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            필터 {showFilters ? '숨기기' : '보기'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* 기본 검색 및 중요도 필터 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="이름, 전화번호, 이메일, 직업, 주소로 검색..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
          </div>
          <div className="w-full sm:w-36">
            <Select
              value={filterImportance}
              onValueChange={value =>
                setFilterImportance(value as 'all' | 'high' | 'medium' | 'low')
              }
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 중요도</SelectItem>
                <SelectItem value="high">높음</SelectItem>
                <SelectItem value="medium">보통</SelectItem>
                <SelectItem value="low">낮음</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 고급 필터 */}
        {showFilters && (
          <div className="pt-4 border-t space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Select value={filterStage} onValueChange={setFilterStage}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="영업 단계" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 단계</SelectItem>
                    <SelectItem value="첫 상담">첫 상담</SelectItem>
                    <SelectItem value="니즈 분석">니즈 분석</SelectItem>
                    <SelectItem value="상품 설명">상품 설명</SelectItem>
                    <SelectItem value="계약 검토">계약 검토</SelectItem>
                    <SelectItem value="계약 완료">계약 완료</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
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
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
