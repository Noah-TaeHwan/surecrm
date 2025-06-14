import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Badge } from '~/common/components/ui/badge';
import { Switch } from '~/common/components/ui/switch';
import { Label } from '~/common/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '~/common/components/ui/dropdown-menu';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  MixerVerticalIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MixerHorizontalIcon,
  EyeOpenIcon,
  EyeClosedIcon,
} from '@radix-ui/react-icons';

interface ClientsFiltersBarProps {
  initialSearchParams?: any;
  totalCount: number;
  selectedCount: number;
  showConfidentialData: boolean;
  onShowConfidentialDataChange: (show: boolean) => void;
  onAddClick: () => void;
}

export function ClientsFiltersBar({
  initialSearchParams,
  totalCount,
  selectedCount,
  showConfidentialData,
  onShowConfidentialDataChange,
  onAddClick,
}: ClientsFiltersBarProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    initialSearchParams?.search || ''
  );
  const [sortBy, setSortBy] = useState(
    initialSearchParams?.sortBy || 'fullName'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    initialSearchParams?.sortOrder || 'asc'
  );
  const [filterStage, setFilterStage] = useState('all');
  const [filterImportance, setFilterImportance] = useState('all');

  // 검색 실행
  const handleSearch = () => {
    const newParams = new URLSearchParams(searchParams);
    if (searchQuery) {
      newParams.set('search', searchQuery);
    } else {
      newParams.delete('search');
    }
    newParams.set('page', '1'); // 검색 시 첫 페이지로
    setSearchParams(newParams);
  };

  // 정렬 변경
  const handleSortChange = (newSortBy: string) => {
    const newParams = new URLSearchParams(searchParams);
    const newSortOrder =
      sortBy === newSortBy && sortOrder === 'asc' ? 'desc' : 'asc';

    newParams.set('sortBy', newSortBy);
    newParams.set('sortOrder', newSortOrder);
    setSearchParams(newParams);

    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  // 필터 변경
  const handleFilterChange = (filterType: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all') {
      newParams.delete(filterType);
    } else {
      newParams.set(filterType, value);
    }
    newParams.set('page', '1'); // 필터 변경 시 첫 페이지로
    setSearchParams(newParams);
  };

  return (
    <div className="p-4 bg-background border rounded-lg space-y-4">
      {/* 상단: 검색 */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="이름, 전화번호, 이메일로 검색..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="pl-10 h-10 py-2 text-sm"
          />
        </div>
        <Button
          onClick={handleSearch}
          size="sm"
          className="h-10 py-2 text-sm flex-shrink-0"
        >
          검색
        </Button>
      </div>

      {/* 중단: 필터 및 정렬 */}
      <div className="flex flex-wrap items-center gap-2">
        {/* 필터 드롭다운 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 h-10 py-2 text-sm"
            >
              <MixerVerticalIcon className="h-4 w-4" />
              필터
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>영업 단계</DropdownMenuLabel>
            <Select
              value={filterStage}
              onValueChange={value => {
                setFilterStage(value);
                handleFilterChange('stageId', value);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="단계 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="lead">리드</SelectItem>
                <SelectItem value="contact">접촉</SelectItem>
                <SelectItem value="proposal">제안</SelectItem>
                <SelectItem value="contract">계약</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenuSeparator />

            <DropdownMenuLabel>중요도</DropdownMenuLabel>
            <Select
              value={filterImportance}
              onValueChange={value => {
                setFilterImportance(value);
                handleFilterChange('importance', value);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="중요도 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="high">높음</SelectItem>
                <SelectItem value="medium">보통</SelectItem>
                <SelectItem value="low">낮음</SelectItem>
              </SelectContent>
            </Select>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 정렬 드롭다운 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 h-10 py-2 text-sm"
            >
              <MixerHorizontalIcon className="h-4 w-4" />
              정렬
              {sortOrder === 'asc' ? (
                <ArrowUpIcon className="h-3 w-3" />
              ) : (
                <ArrowDownIcon className="h-3 w-3" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => handleSortChange('fullName')}>
              이름순
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSortChange('lastContactDate')}
            >
              최근 연락일
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange('createdAt')}>
              등록일
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange('importance')}>
              중요도
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSortChange('contractAmount')}
            >
              계약 금액
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 민감정보 표시 토글 */}
        <div className="flex items-center gap-2 h-10">
          <Label htmlFor="show-confidential" className="text-sm">
            민감정보 표시
          </Label>
          <Switch
            id="show-confidential"
            checked={showConfidentialData}
            onCheckedChange={onShowConfidentialDataChange}
          />
          {showConfidentialData ? (
            <EyeOpenIcon className="h-4 w-4 text-muted-foreground" />
          ) : (
            <EyeClosedIcon className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* 하단: 통계 및 액션 */}
      <div className="flex items-center justify-between">
        {/* 통계 표시 */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>전체 {totalCount.toLocaleString()}명</span>
          {selectedCount > 0 && (
            <Badge variant="secondary">{selectedCount}명 선택</Badge>
          )}
        </div>

        {/* 액션 버튼들 */}
        <div className="flex items-center gap-2">
          <Button onClick={onAddClick} className="gap-2 h-10 py-2 text-sm">
            <PlusIcon className="h-4 w-4" />
            고객 추가
          </Button>
        </div>
      </div>
    </div>
  );
}
