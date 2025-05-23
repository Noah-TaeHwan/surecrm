import type { Route } from '.react-router/types/app/features/clients/pages/+types/clients-page';
import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/common/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/common/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Badge } from '~/common/components/ui/badge';
import { Checkbox } from '~/common/components/ui/checkbox';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '~/common/components/ui/pagination';
import {
  DotsHorizontalIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DownloadIcon,
  TrashIcon,
  PersonIcon,
  Link2Icon,
  CalendarIcon,
  Share1Icon,
  EyeOpenIcon,
  MixerVerticalIcon,
  Pencil2Icon,
} from '@radix-ui/react-icons';
import { Input } from '~/common/components/ui/input';
import { Link } from 'react-router';
import { useState } from 'react';
import { MainLayout } from '~/common/layouts/main-layout';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/common/components/ui/tooltip';

// 분리된 컴포넌트들 import
import { ReferralDepthIndicator } from '../components/referral-depth-indicator';
import { ClientCard } from '../components/client-card';
import { ClientStatsCards } from '../components/client-stats-cards';
import { AddClientModal } from '../components/add-client-modal';
import {
  insuranceTypeIcons,
  insuranceTypeText,
} from '../components/insurance-config';
import type { Client, ClientStats, BadgeVariant } from '../components/types';

export function loader({ request }: Route.LoaderArgs) {
  // TODO: 실제 API에서 데이터 가져오기
  return {
    clients: [
      {
        id: '1',
        name: '김영희',
        email: 'kim@example.com',
        phone: '010-1234-5678',
        company: 'ABC 회사',
        status: 'active' as const,
        stage: '첫 상담',
        importance: 'high' as const,
        referredBy: {
          id: '2',
          name: '박철수',
        },
        lastContactDate: '2024-01-15',
        nextMeetingDate: '2024-01-20',
        tags: ['VIP', '기업'],
        contractAmount: 50000000,
        insuranceTypes: ['auto', 'health'],
        referralCount: 3,
        referralDepth: 1,
        profileImage: null,
        createdAt: '2023-03-15T09:30:00.000Z',
        updatedAt: '2023-04-02T14:15:00.000Z',
      },
      {
        id: '2',
        name: '이철수',
        email: 'lee@example.com',
        phone: '010-9876-5432',
        company: 'XYZ 기업',
        status: 'active' as const,
        stage: '니즈 분석',
        importance: 'medium' as const,
        referredBy: {
          id: '1',
          name: '김영희',
        },
        lastContactDate: '2024-01-20',
        nextMeetingDate: '2024-01-25',
        tags: ['개인'],
        contractAmount: 30000000,
        insuranceTypes: ['life'],
        referralCount: 1,
        referralDepth: 2,
        profileImage: null,
        createdAt: '2023-02-22T13:45:00.000Z',
        updatedAt: '2023-04-05T10:20:00.000Z',
      },
      {
        id: '3',
        name: '박지민',
        email: 'park@example.com',
        phone: '010-2345-6789',
        company: '대한 기업',
        status: 'inactive' as const,
        stage: '계약 완료',
        importance: 'low' as const,
        lastContactDate: '2024-01-10',
        tags: ['완료'],
        contractAmount: 70000000,
        insuranceTypes: ['property', 'life'],
        referralCount: 5,
        referralDepth: 0,
        profileImage: null,
        createdAt: '2023-01-10T11:30:00.000Z',
        updatedAt: '2023-03-28T15:45:00.000Z',
      },
      {
        id: '4',
        name: '최민수',
        email: 'choi@example.com',
        phone: '010-3456-7890',
        company: '스타트업 Inc',
        status: 'active' as const,
        stage: '상품 설명',
        importance: 'high' as const,
        referredBy: {
          id: '2',
          name: '이철수',
        },
        lastContactDate: '2024-01-25',
        nextMeetingDate: '2024-01-30',
        tags: ['VIP', '잠재'],
        contractAmount: 45000000,
        insuranceTypes: ['auto', 'prenatal'],
        referralCount: 0,
        referralDepth: 3,
        profileImage: null,
        createdAt: '2023-04-01T10:00:00.000Z',
        updatedAt: '2023-04-10T16:30:00.000Z',
      },
      {
        id: '5',
        name: '정수연',
        email: 'jung@example.com',
        phone: '010-4567-8901',
        company: '글로벌 코프',
        status: 'active' as const,
        stage: '계약 검토',
        importance: 'medium' as const,
        referredBy: {
          id: '3',
          name: '박지민',
        },
        lastContactDate: '2024-01-18',
        nextMeetingDate: '2024-01-22',
        tags: ['기업', '진행중'],
        contractAmount: 60000000,
        insuranceTypes: ['health', 'other'],
        referralCount: 2,
        referralDepth: 1,
        profileImage: null,
        createdAt: '2023-05-15T14:20:00.000Z',
        updatedAt: '2023-06-01T11:45:00.000Z',
      },
    ],
    totalCount: 5,
    pageSize: 10,
    currentPage: 1,
    stats: {
      totalReferrals: 11,
      averageDepth: 1.4,
      topReferrers: [
        { name: '박지민', count: 5 },
        { name: '김영희', count: 3 },
        { name: '정수연', count: 2 },
      ],
    },
  };
}

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '고객 관리 - SureCRM' },
    { name: 'description', content: '고객 목록 관리 및 조회' },
  ];
}

export default function ClientsPage({ loaderData }: Route.ComponentProps) {
  const {
    clients = [],
    totalCount = 0,
    pageSize = 10,
    currentPage = 1,
    stats,
  } = loaderData;

  // 상태 관리
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterStage, setFilterStage] = useState('all');
  const [filterImportance, setFilterImportance] = useState('all');
  const [filterReferrer, setFilterReferrer] = useState('all');
  const [filterInsuranceType, setFilterInsuranceType] = useState('all');
  const [filterDepth, setFilterDepth] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [addClientOpen, setAddClientOpen] = useState(false);

  // 배지 설정들
  const statusBadgeVariant: Record<string, BadgeVariant> = {
    active: 'default',
    inactive: 'secondary',
  };

  const statusText: Record<string, string> = {
    active: '활성',
    inactive: '비활성',
  };

  const stageBadgeVariant: Record<string, BadgeVariant> = {
    '첫 상담': 'outline',
    '니즈 분석': 'outline',
    '상품 설명': 'outline',
    '계약 검토': 'outline',
    '계약 완료': 'default',
  };

  const importanceBadgeVariant: Record<string, BadgeVariant> = {
    high: 'destructive',
    medium: 'default',
    low: 'secondary',
  };

  const importanceText: Record<string, string> = {
    high: '높음',
    medium: '보통',
    low: '낮음',
  };

  // 필터링 및 정렬된 고객 목록
  const filteredAndSortedClients = clients
    .filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone.includes(searchQuery) ||
        client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.company?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStage =
        filterStage === 'all' || client.stage === filterStage;
      const matchesImportance =
        filterImportance === 'all' || client.importance === filterImportance;
      const matchesReferrer =
        filterReferrer === 'all' || client.referredBy?.name === filterReferrer;
      const matchesInsuranceType =
        filterInsuranceType === 'all' ||
        client.insuranceTypes?.includes(filterInsuranceType);
      const matchesDepth =
        filterDepth === 'all' ||
        (filterDepth === 'direct' && client.referralDepth === 0) ||
        (filterDepth === '1st' && client.referralDepth === 1) ||
        (filterDepth === '2nd' && client.referralDepth === 2) ||
        (filterDepth === '3rd+' && client.referralDepth >= 3);

      return (
        matchesSearch &&
        matchesStage &&
        matchesImportance &&
        matchesReferrer &&
        matchesInsuranceType &&
        matchesDepth
      );
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'lastContact':
          aValue = a.lastContactDate || '';
          bValue = b.lastContactDate || '';
          break;
        case 'contractAmount':
          aValue = a.contractAmount || 0;
          bValue = b.contractAmount || 0;
          break;
        case 'referralCount':
          aValue = a.referralCount || 0;
          bValue = b.referralCount || 0;
          break;
        case 'referralDepth':
          aValue = a.referralDepth || 0;
          bValue = b.referralDepth || 0;
          break;
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (
        ['contractAmount', 'referralCount', 'referralDepth'].includes(sortBy)
      ) {
        return sortOrder === 'asc'
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      } else {
        return sortOrder === 'asc'
          ? (aValue as string).localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue as string);
      }
    });

  // 전체 선택/해제
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClients(filteredAndSortedClients.map((client) => client.id));
    } else {
      setSelectedClients([]);
    }
  };

  // 개별 선택/해제
  const handleSelectClient = (clientId: string, checked: boolean) => {
    if (checked) {
      setSelectedClients([...selectedClients, clientId]);
    } else {
      setSelectedClients(selectedClients.filter((id) => id !== clientId));
    }
  };

  // 정렬 핸들러
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // 일괄 작업 핸들러
  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'delete':
        console.log('삭제할 고객:', selectedClients);
        break;
      case 'changeStage':
        console.log('단계 변경할 고객:', selectedClients);
        break;
      case 'addTag':
        console.log('태그 추가할 고객:', selectedClients);
        break;
      case 'export':
        console.log('내보낼 고객:', selectedClients);
        break;
    }
  };

  // 고객 추가 핸들러
  const handleAddClient = async (data: any) => {
    try {
      console.log('새 고객 추가:', data);
      // TODO: 실제 API 호출로 고객 추가
      // await addClient(data);
      alert('고객이 성공적으로 추가되었습니다.');
    } catch (error) {
      console.error('고객 추가 실패:', error);
      throw error;
    }
  };

  // 총 페이지 수 계산
  const totalPages = Math.ceil(totalCount / pageSize);

  // 고유 소개자 목록
  const uniqueReferrers = Array.from(
    new Set(clients.map((c) => c.referredBy?.name).filter(Boolean))
  );

  return (
    <MainLayout title="고객 관리">
      <div className="space-y-6">
        {/* 헤더 섹션 */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="text-muted-foreground">
              소개 네트워크 기반 고객 관계 관리
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="고객 검색..."
                className="pl-8 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() =>
                setViewMode(viewMode === 'table' ? 'cards' : 'table')
              }
            >
              {viewMode === 'table' ? '카드 뷰로 전환' : '리스트 뷰로 전환'}
            </Button>
            <Button onClick={() => setAddClientOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              고객 추가
            </Button>
          </div>
        </div>

        {/* 통계 카드 섹션 - 분리된 컴포넌트 사용 */}
        {stats && <ClientStatsCards totalCount={totalCount} stats={stats} />}

        {/* 필터 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">필터 및 정렬</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  영업 단계
                </label>
                <Select value={filterStage} onValueChange={setFilterStage}>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="단계 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">
                      모든 단계
                    </SelectItem>
                    <SelectItem value="첫 상담" className="cursor-pointer">
                      첫 상담
                    </SelectItem>
                    <SelectItem value="니즈 분석" className="cursor-pointer">
                      니즈 분석
                    </SelectItem>
                    <SelectItem value="상품 설명" className="cursor-pointer">
                      상품 설명
                    </SelectItem>
                    <SelectItem value="계약 검토" className="cursor-pointer">
                      계약 검토
                    </SelectItem>
                    <SelectItem value="계약 완료" className="cursor-pointer">
                      계약 완료
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">중요도</label>
                <Select
                  value={filterImportance}
                  onValueChange={setFilterImportance}
                >
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="중요도 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">
                      모든 중요도
                    </SelectItem>
                    <SelectItem value="high" className="cursor-pointer">
                      높음
                    </SelectItem>
                    <SelectItem value="medium" className="cursor-pointer">
                      보통
                    </SelectItem>
                    <SelectItem value="low" className="cursor-pointer">
                      낮음
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">소개자</label>
                <Select
                  value={filterReferrer}
                  onValueChange={setFilterReferrer}
                >
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="소개자 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">
                      모든 소개자
                    </SelectItem>
                    {uniqueReferrers.map((referrer) => (
                      <SelectItem
                        key={referrer}
                        value={referrer || ''}
                        className="cursor-pointer"
                      >
                        {referrer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  보험 유형
                </label>
                <Select
                  value={filterInsuranceType}
                  onValueChange={setFilterInsuranceType}
                >
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="보험 유형" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">
                      모든 유형
                    </SelectItem>
                    <SelectItem value="life" className="cursor-pointer">
                      생명보험
                    </SelectItem>
                    <SelectItem value="health" className="cursor-pointer">
                      건강보험
                    </SelectItem>
                    <SelectItem value="auto" className="cursor-pointer">
                      자동차보험
                    </SelectItem>
                    <SelectItem value="prenatal" className="cursor-pointer">
                      태아보험
                    </SelectItem>
                    <SelectItem value="property" className="cursor-pointer">
                      재산보험
                    </SelectItem>
                    <SelectItem value="other" className="cursor-pointer">
                      기타
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  소개 깊이
                </label>
                <Select value={filterDepth} onValueChange={setFilterDepth}>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="소개 깊이" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">
                      모든 깊이
                    </SelectItem>
                    <SelectItem value="direct" className="cursor-pointer">
                      직접 고객
                    </SelectItem>
                    <SelectItem value="1st" className="cursor-pointer">
                      1차 소개
                    </SelectItem>
                    <SelectItem value="2nd" className="cursor-pointer">
                      2차 소개
                    </SelectItem>
                    <SelectItem value="3rd+" className="cursor-pointer">
                      3차+ 소개
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">정렬</label>
                <Select
                  value={`${sortBy}_${sortOrder}`}
                  onValueChange={(value) => {
                    const [column, order] = value.split('_');
                    setSortBy(column);
                    setSortOrder(order as 'asc' | 'desc');
                  }}
                >
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="정렬 방식" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name_asc" className="cursor-pointer">
                      이름 오름차순
                    </SelectItem>
                    <SelectItem value="name_desc" className="cursor-pointer">
                      이름 내림차순
                    </SelectItem>
                    <SelectItem
                      value="contractAmount_desc"
                      className="cursor-pointer"
                    >
                      계약금액 높은순
                    </SelectItem>
                    <SelectItem
                      value="contractAmount_asc"
                      className="cursor-pointer"
                    >
                      계약금액 낮은순
                    </SelectItem>
                    <SelectItem
                      value="lastContact_desc"
                      className="cursor-pointer"
                    >
                      최근 연락순
                    </SelectItem>
                    <SelectItem
                      value="referralCount_desc"
                      className="cursor-pointer"
                    >
                      소개 건수 많은순
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 일괄 작업 섹션 */}
        {selectedClients.length > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedClients.length}명 선택됨
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('changeStage')}
                  >
                    <PersonIcon className="mr-1 h-3 w-3" />
                    단계 변경
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('addTag')}
                  >
                    태그 추가
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('export')}
                  >
                    <DownloadIcon className="mr-1 h-3 w-3" />
                    내보내기
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="mr-1 h-3 w-3" />
                    삭제
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 고객 목록 - 카드 뷰 */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedClients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                importanceBadgeVariant={importanceBadgeVariant}
                importanceText={importanceText}
                stageBadgeVariant={stageBadgeVariant}
              />
            ))}
          </div>
        ) : (
          /* 고객 목록 - 테이블 뷰 */
          <Card>
            <CardHeader>
              <CardTitle>고객 목록</CardTitle>
              <CardDescription>
                전체 {totalCount}명 중 {filteredAndSortedClients.length}명 표시
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>전체 고객 목록</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={
                          selectedClients.length ===
                            filteredAndSortedClients.length &&
                          filteredAndSortedClients.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        고객명
                        {sortBy === 'name' &&
                          (sortOrder === 'asc' ? (
                            <ArrowUpIcon className="ml-1 h-3 w-3" />
                          ) : (
                            <ArrowDownIcon className="ml-1 h-3 w-3" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead>연락처</TableHead>
                    <TableHead>회사</TableHead>
                    <TableHead>소개 관계</TableHead>
                    <TableHead>단계</TableHead>
                    <TableHead>중요도</TableHead>
                    <TableHead>보험 유형</TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('referralCount')}
                    >
                      <div className="flex items-center">
                        소개 건수
                        {sortBy === 'referralCount' &&
                          (sortOrder === 'asc' ? (
                            <ArrowUpIcon className="ml-1 h-3 w-3" />
                          ) : (
                            <ArrowDownIcon className="ml-1 h-3 w-3" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('lastContact')}
                    >
                      <div className="flex items-center">
                        최근 접촉
                        {sortBy === 'lastContact' &&
                          (sortOrder === 'asc' ? (
                            <ArrowUpIcon className="ml-1 h-3 w-3" />
                          ) : (
                            <ArrowDownIcon className="ml-1 h-3 w-3" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead>태그</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedClients.includes(client.id)}
                          onCheckedChange={(checked) =>
                            handleSelectClient(client.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">
                              {client.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Link
                              to={`/clients/${client.id}`}
                              className="font-medium hover:underline"
                            >
                              {client.name}
                            </Link>
                            <div className="text-xs text-muted-foreground">
                              <ReferralDepthIndicator
                                depth={client.referralDepth}
                              />
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{client.phone}</div>
                          {client.email && (
                            <div className="text-xs text-muted-foreground">
                              {client.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{client.company || '-'}</TableCell>
                      <TableCell>
                        {client.referredBy ? (
                          <div className="flex items-center gap-2">
                            <Link2Icon className="h-3 w-3 text-muted-foreground" />
                            <Link
                              to={`/clients/${client.referredBy.id}`}
                              className="text-sm hover:underline"
                            >
                              {client.referredBy.name}
                            </Link>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            직접 개발
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={stageBadgeVariant[client.stage] || 'outline'}
                        >
                          {client.stage}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={importanceBadgeVariant[client.importance]}
                        >
                          {importanceText[client.importance]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {client.insuranceTypes?.map((type) => (
                            <TooltipProvider key={type}>
                              <Tooltip>
                                <TooltipTrigger>
                                  <div className="p-1 rounded border">
                                    {insuranceTypeIcons[type]}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{insuranceTypeText[type]}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )) || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {client.referralCount > 0 ? (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 w-fit"
                          >
                            <Share1Icon className="h-3 w-3" />
                            {client.referralCount}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">
                            {client.lastContactDate || '-'}
                          </div>
                          {client.nextMeetingDate && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              다음: {client.nextMeetingDate}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {client.tags?.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          )) || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">메뉴 열기</span>
                              <DotsHorizontalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>작업</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer">
                              <Link to={`/clients/${client.id}`}>
                                <div className="flex items-center gap-2">
                                  <EyeOpenIcon className="h-3 w-3" />
                                  상세 보기
                                </div>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Link to={`/clients/edit/${client.id}`}>
                                <div className="flex items-center gap-2">
                                  <Pencil2Icon className="h-3 w-3" />
                                  수정
                                </div>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="h-3 w-3" />
                                미팅 예약
                              </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <div className="flex items-center gap-2">
                                <Share1Icon className="h-3 w-3" />
                                소개 네트워크 보기
                              </div>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 cursor-pointer">
                              <div className="flex items-center gap-2">
                                <TrashIcon className="h-3 w-3" />
                                삭제
                              </div>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious href="#" />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              isActive={page === currentPage}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}
                      <PaginationItem>
                        <PaginationNext href="#" />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 빈 상태 */}
        {filteredAndSortedClients.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center">
              <PersonIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                조건에 맞는 고객이 없습니다
              </h3>
              <p className="mt-2 text-muted-foreground">
                필터 조건을 변경하거나 새 고객을 추가해보세요.
              </p>
              <Button className="mt-4" onClick={() => setAddClientOpen(true)}>
                <PlusIcon className="mr-2 h-4 w-4" />첫 고객 추가하기
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 고객 추가 모달 */}
        <AddClientModal
          open={addClientOpen}
          onOpenChange={setAddClientOpen}
          onSubmit={handleAddClient}
        />
      </div>
    </MainLayout>
  );
}
