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
} from '@radix-ui/react-icons';
import { Input } from '~/common/components/ui/input';
import { Link } from 'react-router';
import { useState } from 'react';
import { MainLayout } from '~/common/layouts/main-layout';

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
        referredBy: '박철수',
        lastContactDate: '2024-01-15',
        tags: ['VIP', '기업'],
        contractAmount: 50000000,
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
        referredBy: '김영희',
        lastContactDate: '2024-01-20',
        tags: ['개인'],
        contractAmount: 30000000,
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
        referredBy: '이철수',
        lastContactDate: '2024-01-25',
        tags: ['VIP', '잠재'],
        contractAmount: 45000000,
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
        referredBy: '박지민',
        lastContactDate: '2024-01-18',
        tags: ['기업', '진행중'],
        contractAmount: 60000000,
        createdAt: '2023-05-15T14:20:00.000Z',
        updatedAt: '2023-06-01T11:45:00.000Z',
      },
    ],
    totalCount: 5,
    pageSize: 10,
    currentPage: 1,
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
  } = loaderData;

  // 상태 관리
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterStage, setFilterStage] = useState('all');
  const [filterImportance, setFilterImportance] = useState('all');
  const [filterReferrer, setFilterReferrer] = useState('all');

  // 고객 상태별 배지 색상 매핑
  const statusBadgeVariant: Record<
    string,
    'default' | 'secondary' | 'outline' | 'destructive'
  > = {
    active: 'default',
    inactive: 'secondary',
  };

  // 고객 상태 텍스트 매핑
  const statusText: Record<string, string> = {
    active: '활성',
    inactive: '비활성',
  };

  // 영업 단계별 배지 색상 매핑
  const stageBadgeVariant: Record<
    string,
    'default' | 'secondary' | 'outline' | 'destructive'
  > = {
    '첫 상담': 'outline',
    '니즈 분석': 'outline',
    '상품 설명': 'outline',
    '계약 검토': 'outline',
    '계약 완료': 'default',
  };

  // 중요도별 배지 색상 매핑
  const importanceBadgeVariant: Record<
    string,
    'default' | 'secondary' | 'outline' | 'destructive'
  > = {
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
        filterReferrer === 'all' || client.referredBy === filterReferrer;

      return (
        matchesSearch && matchesStage && matchesImportance && matchesReferrer
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
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (sortBy === 'contractAmount') {
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

  // 총 페이지 수 계산
  const totalPages = Math.ceil(totalCount / pageSize);

  // 고유 소개자 목록
  const uniqueReferrers = Array.from(
    new Set(clients.map((c) => c.referredBy).filter(Boolean))
  );

  return (
    <MainLayout title="고객 관리">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">고객 관리</h1>
          <div className="flex items-center gap-4">
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
            <Link to="/clients/edit">
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                고객 추가
              </Button>
            </Link>
          </div>
        </div>

        {/* 필터 섹션 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">필터 및 정렬</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  정렬 기준
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="정렬 기준" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name" className="cursor-pointer">
                      이름순
                    </SelectItem>
                    <SelectItem value="lastContact" className="cursor-pointer">
                      최근 접촉일
                    </SelectItem>
                    <SelectItem
                      value="contractAmount"
                      className="cursor-pointer"
                    >
                      계약 금액
                    </SelectItem>
                    <SelectItem value="createdAt" className="cursor-pointer">
                      등록일
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
                  <TableHead>이메일</TableHead>
                  <TableHead>회사</TableHead>
                  <TableHead>소개인</TableHead>
                  <TableHead>단계</TableHead>
                  <TableHead>중요도</TableHead>
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
                    <TableCell className="font-medium">
                      <Link
                        to={`/clients/${client.id}`}
                        className="hover:underline"
                      >
                        {client.name}
                      </Link>
                    </TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.company || '-'}</TableCell>
                    <TableCell>{client.referredBy || '-'}</TableCell>
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
                    <TableCell>{client.lastContactDate || '-'}</TableCell>
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
                            <Link to={`/clients/${client.id}`}>상세 보기</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Link to={`/clients/edit/${client.id}`}>수정</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 cursor-pointer">
                            삭제
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
      </div>
    </MainLayout>
  );
}
