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
import { Search, Filter, Download, LayoutGrid, LayoutList } from 'lucide-react';

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
}: ClientFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>고객 검색 및 필터</CardTitle>
            <p className="text-sm text-muted-foreground">
              {filteredClientsCount}명의 고객이 검색되었습니다
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-10"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              필터 {showFilters ? '숨기기' : '보기'}
            </Button>
            <Separator orientation="vertical" className="h-6" />
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
          {/* 기본 검색 */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="이름, 전화번호, 이메일, 직업, 주소로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>
            <Select
              value={filterImportance}
              onValueChange={(value) =>
                setFilterImportance(value as 'all' | 'high' | 'medium' | 'low')
              }
            >
              <SelectTrigger className="w-[120px] h-10">
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

          {/* 고급 필터 */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
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
    </Card>
  );
}
