import type { Route } from './+types/clients-page';
import { MainLayout } from '~/common/layouts/main-layout';
import { useState } from 'react';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Checkbox } from '~/common/components/ui/checkbox';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from '~/common/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '~/common/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/common/components/ui/tooltip';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '~/common/components/ui/pagination';
import { Label } from '~/common/components/ui/label';
import { Switch } from '~/common/components/ui/switch';
import { Link } from 'react-router';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  DownloadIcon,
  Link2Icon,
  Share1Icon,
  EyeOpenIcon,
  EyeClosedIcon,
  PersonIcon,
  LockClosedIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  DotsHorizontalIcon,
  Pencil2Icon,
} from '@radix-ui/react-icons';

import { ClientCard } from '~/features/clients/components/client-card';
import { ClientStatsCards } from '~/features/clients/components/client-stats-cards';
import { ClientAddChoiceModal } from '~/features/clients/components/client-add-choice-modal';
import { ClientImportModal } from '~/features/clients/components/client-import-modal';
import { AddClientModal } from '~/features/clients/components/add-client-modal';
import { ReferralDepthIndicator } from '~/features/clients/components/referral-depth-indicator';
import {
  insuranceTypeIcons,
  insuranceTypeText,
} from '~/features/clients/components/insurance-config';

import type {
  ClientDisplay,
  ClientStats,
  ClientPrivacyLevel,
} from '~/features/clients/types';
import { typeHelpers } from '~/features/clients/types';
import {
  getClients,
  getClientStats,
  logDataAccess,
} from '~/features/clients/lib/client-data';
import { requireAuth, getSearchParams } from '~/lib/auth/helpers';
import { data } from 'react-router';
import { ClientsEmptyState } from '~/features/clients/components/clients-empty-state';

// 🎨 BadgeVariant 타입 정의
type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

export async function loader({ request }: Route.LoaderArgs) {
  // 🔒 인증 확인 (보안 강화)
  const userId = await requireAuth(request);

  // 🔍 검색 파라미터 추출 (새 필터 지원)
  const url = new URL(request.url);
  const searchParams = {
    page: parseInt(url.searchParams.get('page') || '1'),
    pageSize: parseInt(url.searchParams.get('pageSize') || '10'),
    search: url.searchParams.get('search') || undefined,
    stageIds: url.searchParams.getAll('stageId'),
    tagIds: url.searchParams.getAll('tagId'),
    importance: url.searchParams.getAll('importance'),
    sources: url.searchParams.getAll('source'),
    privacyLevels: url.searchParams.getAll(
      'privacyLevel'
    ) as ClientPrivacyLevel[],
    sortBy: url.searchParams.get('sortBy') || 'fullName',
    sortOrder: (url.searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc',
    // 🔒 보안 관련 파라미터
    ipAddress:
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
  };

  try {
    // 🔒 고객 목록 조회 (접근 로그 포함)
    const clientsData = await getClients({
      agentId: userId,
      ...searchParams,
    });

    // 📊 통계 조회
    const stats = await getClientStats(userId);

    return {
      ...clientsData,
      stats,
      searchParams, // 현재 검색 상태 반환
    };
  } catch (error) {
    console.error('Clients 페이지 로더 오류:', error);

    // 🔒 에러 시 안전한 빈 데이터 반환
    return {
      clients: [],
      totalCount: 0,
      pageSize: searchParams.pageSize,
      currentPage: searchParams.page,
      totalPages: 0,
      stats: {
        totalClients: 0,
        activeClients: 0,
        inactiveClients: 0,
        importanceDistribution: {
          high: 0,
          medium: 0,
          low: 0,
        },
        privacyDistribution: {
          public: 0,
          restricted: 0,
          private: 0,
          confidential: 0,
        },
        dataComplianceStatus: {
          gdprCompliant: 0,
          consentExpiring: 0,
          backupRequired: 0,
        },
      },
      searchParams,
    };
  }
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireAuth(request);
  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  switch (intent) {
    case 'bulkDelete':
      try {
        const clientIds = formData.getAll('clientIds') as string[];
        // TODO: 일괄 삭제 로직 구현
        return data({
          success: true,
          message: '선택된 고객이 삭제되었습니다.',
        });
      } catch (error) {
        return data(
          { success: false, error: '일괄 삭제 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }

    case 'bulkExport':
      try {
        const clientIds = formData.getAll('clientIds') as string[];
        // TODO: 일괄 내보내기 로직 구현
        return data({ success: true, message: '데이터가 내보내기되었습니다.' });
      } catch (error) {
        return data(
          { success: false, error: '내보내기 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }

    default:
      return data(
        { success: false, error: '알 수 없는 작업입니다.' },
        { status: 400 }
      );
  }
}

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '고객 관리 - SureCRM' },
    {
      name: 'description',
      content: '보험설계사를 위한 안전한 고객 관계 관리 시스템',
    },
  ];
}

export default function ClientsPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const {
    clients = [],
    totalCount = 0,
    pageSize = 10,
    currentPage = 1,
    totalPages: loaderTotalPages = 0,
    stats,
    searchParams: initialSearchParams,
  } = loaderData;

  // 🔒 상태 관리 (보안 강화)
  const [searchQuery, setSearchQuery] = useState(
    initialSearchParams?.search || ''
  );
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState(
    initialSearchParams?.sortBy || 'fullName'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    initialSearchParams?.sortOrder || 'asc'
  );
  const [filterStage, setFilterStage] = useState('all');
  const [filterImportance, setFilterImportance] = useState('all');
  const [filterReferrer, setFilterReferrer] = useState('all');
  const [filterPrivacyLevel, setFilterPrivacyLevel] = useState<
    ClientPrivacyLevel | 'all'
  >('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showConfidentialData, setShowConfidentialData] = useState(false);
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [addChoiceOpen, setAddChoiceOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [filterInsuranceType, setFilterInsuranceType] = useState('all');
  const [filterDepth, setFilterDepth] = useState('all');

  // 🔒 클라이언트를 ClientDisplay로 타입 캐스팅
  const typedClients = clients as ClientDisplay[];

  // 🔒 현재 사용자 ID (실제로는 loader에서 가져와야 함)
  const currentUserId = 'current-user-id'; // TODO: loader에서 실제 사용자 ID 전달

  // 🎨 배지 설정들 (app.css 준수)
  const statusBadgeVariant: Record<string, BadgeVariant> = {
    active: 'default',
    inactive: 'secondary',
    pending: 'outline',
  };

  const statusText: Record<string, string> = {
    active: '활성',
    inactive: '비활성',
  };

  const stageBadgeVariant: Record<string, BadgeVariant> = {
    lead: 'outline',
    contact: 'secondary',
    proposal: 'default',
    contract: 'destructive',
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

  // 🔒 개인정보 보호 레벨 설정
  const privacyLevelIcon: Record<ClientPrivacyLevel, any> = {
    public: PersonIcon,
    restricted: PersonIcon,
    private: LockClosedIcon,
    confidential: LockClosedIcon,
  };

  const privacyLevelBadgeVariant: Record<ClientPrivacyLevel, BadgeVariant> = {
    public: 'outline',
    restricted: 'secondary',
    private: 'default',
    confidential: 'destructive',
  };

  const privacyLevelText: Record<ClientPrivacyLevel, string> = {
    public: '공개',
    restricted: '제한',
    private: '비공개',
    confidential: '기밀',
  };

  // 🔍 필터링된 고객 목록 (클라이언트 사이드 - 추가 보안 필터링)
  const filteredAndSortedClients = typedClients
    .filter((client) => {
      // 🔒 개인정보 보호 레벨 확인
      if (!showConfidentialData && client.accessLevel === 'confidential') {
        return false;
      }

      const matchesSearch =
        !searchQuery ||
        client.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone.includes(searchQuery) ||
        client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.occupation?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStage =
        filterStage === 'all' || client.currentStage?.name === filterStage;

      const matchesImportance =
        filterImportance === 'all' || client.importance === filterImportance;

      const matchesReferrer =
        filterReferrer === 'all' ||
        client.referredBy?.fullName === filterReferrer;

      const matchesPrivacyLevel =
        filterPrivacyLevel === 'all' ||
        client.accessLevel === filterPrivacyLevel;

      return (
        matchesSearch &&
        matchesStage &&
        matchesImportance &&
        matchesReferrer &&
        matchesPrivacyLevel
      );
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'fullName':
          aValue = a.fullName;
          bValue = b.fullName;
          break;
        case 'lastContactDate':
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
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'importance':
          // 중요도 정렬을 위한 가중치
          const importanceWeight: Record<string, number> = {
            high: 3,
            medium: 2,
            low: 1,
          };
          aValue = importanceWeight[a.importance] || 0;
          bValue = importanceWeight[b.importance] || 0;
          break;
        default:
          aValue = a.fullName;
          bValue = b.fullName;
      }

      // 숫자 정렬
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      }

      // 문자열 정렬
      const comparison = String(aValue).localeCompare(String(bValue), 'ko-KR');
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  // 🔒 고객 개인정보 보호 표시 함수
  const renderPrivacyIndicator = (client: ClientDisplay) => {
    const level = (client.accessLevel ||
      client.privacyLevel ||
      'private') as ClientPrivacyLevel;
    const Icon = privacyLevelIcon[level];
    return (
      <Tooltip>
        <TooltipTrigger>
          <Badge variant={privacyLevelBadgeVariant[level]} className="gap-1">
            <Icon className="h-3 w-3" />
            {privacyLevelText[level]}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>개인정보 보호 레벨: {privacyLevelText[level]}</p>
          {client.hasConfidentialData && (
            <p className="text-yellow-600">⚠️ 민감정보 포함</p>
          )}
        </TooltipContent>
      </Tooltip>
    );
  };

  // 🔒 고객 데이터 마스킹 함수
  const maskSensitiveData = (data: string, level: ClientPrivacyLevel) => {
    if (showConfidentialData || level === 'public') return data;

    if (level === 'confidential') {
      return '***';
    }

    if (level === 'restricted' && data.length > 4) {
      return data.slice(0, 2) + '***' + data.slice(-2);
    }

    return data;
  };

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

  // 🔒 고객 추가 방식 선택 핸들러
  const handleAddClientChoice = (choice: 'individual' | 'import') => {
    setAddChoiceOpen(false);
    if (choice === 'individual') {
      setAddClientOpen(true);
    } else {
      setImportModalOpen(true);
    }
  };

  // 🔒 개별 고객 추가 핸들러
  const handleAddClient = async (clientData: any) => {
    try {
      // TODO: 고객 추가 로직 구현
      console.log('새 고객 추가:', clientData);
      setAddClientOpen(false);
      // 페이지 새로고침 또는 상태 업데이트
    } catch (error) {
      console.error('고객 추가 실패:', error);
    }
  };

  // 고유 소개자 목록 (fullName 사용)
  const uniqueReferrers = Array.from(
    new Set(typedClients.map((c) => c.referredBy?.fullName).filter(Boolean))
  ) as string[];

  // 페이지네이션 계산
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <MainLayout title="고객 관리">
      <div className="space-y-6">
        {/* 헤더 섹션 */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">고객 관리</h1>
            <p className="text-muted-foreground">
              보험설계사를 위한 안전한 고객 관계 관리 시스템
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setAddChoiceOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              고객 추가
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  내보내기
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>CSV로 내보내기</DropdownMenuItem>
                <DropdownMenuItem>Excel로 내보내기</DropdownMenuItem>
                <DropdownMenuItem>PDF로 내보내기</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 통계 카드 섹션 - 호환성을 위해 타입 변환 */}
        {stats && (
          <ClientStatsCards
            totalCount={totalCount}
            stats={{
              totalReferrals: 0, // 임시값 - 추후 실제 데이터로 교체
              averageDepth: 0, // 임시값 - 추후 실제 데이터로 교체
              topReferrers: [], // 임시값 - 추후 실제 데이터로 교체
              ...(stats as any), // 타입 호환성을 위한 임시 처리
            }}
          />
        )}

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
                              {typeHelpers
                                .getClientDisplayName(client)
                                .charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Link
                              to={`/clients/${client.id}`}
                              className="text-sm font-medium hover:underline"
                            >
                              {typeHelpers.getClientDisplayName(client)}
                            </Link>
                            <div className="text-xs text-muted-foreground">
                              {client.occupation || '직업 미등록'}
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
                              {client.referredBy.fullName}
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
                          {client.insuranceTypes?.map((type: string) => (
                            <TooltipProvider key={type}>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge
                                    variant="outline"
                                    className="flex items-center gap-1 text-xs"
                                  >
                                    {insuranceTypeIcons[type]}
                                    {insuranceTypeText[type]}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{insuranceTypeText[type]}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {(client.referralCount || 0) > 0 ? (
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1 w-fit"
                            >
                              <Share1Icon className="h-3 w-3" />
                              {client.referralCount || 0}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              -
                            </span>
                          )}
                          <ReferralDepthIndicator
                            depth={client.referralDepth || 0}
                          />
                        </div>
                        {client.lastContactDate && (
                          <div className="text-xs text-muted-foreground mt-1">
                            최근: {client.lastContactDate}
                          </div>
                        )}
                        {client.nextMeetingDate && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            다음: {client.nextMeetingDate}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {client.tags?.map((tag, index: number) => (
                            <Badge
                              key={typeHelpers.getTagId(tag) || index}
                              variant="outline"
                              className="text-xs"
                            >
                              {typeHelpers.getTagName(tag)}
                            </Badge>
                          ))}
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
          <ClientsEmptyState
            onAddClient={() => setAddChoiceOpen(true)}
            isFiltered={
              searchQuery !== '' ||
              filterStage !== 'all' ||
              filterImportance !== 'all'
            }
            isSecurityRestricted={false}
          />
        )}

        {/* 고객 추가 선택 모달 */}
        <ClientAddChoiceModal
          open={addChoiceOpen}
          onOpenChange={setAddChoiceOpen}
          onChoiceSelect={handleAddClientChoice}
        />

        {/* 개별 고객 추가 모달 */}
        <AddClientModal
          open={addClientOpen}
          onOpenChange={setAddClientOpen}
          onSubmit={handleAddClient}
          agentId={currentUserId}
        />

        {/* 일괄 고객 임포트 모달 */}
        <ClientImportModal
          open={importModalOpen}
          onOpenChange={setImportModalOpen}
        />
      </div>
    </MainLayout>
  );
}
