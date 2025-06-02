import { MainLayout } from '~/common/layouts/main-layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import { Badge } from '~/common/components/ui/badge';
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
} from '~/common/components/ui/table';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import { Separator } from '~/common/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '~/common/components/ui/dialog';
import { Label } from '~/common/components/ui/label';
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import {
  Users,
  Network,
  TrendingUp,
  Shield,
  Search,
  Filter,
  Plus,
  Upload,
  Download,
  LayoutGrid,
  LayoutList,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Edit2,
  Trash2,
  FileDown,
  DollarSign,
  Target,
  Eye,
  Star,
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useFetcher, useNavigate } from 'react-router';
import { z } from 'zod';
import type { Route } from './+types/clients-page';
import type {
  Client,
  AppClientTag,
  AppClientContactHistory,
  PipelineStage,
  Importance,
  ClientPrivacyLevel,
} from '~/features/clients/lib/schema';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { AddClientModal } from '../components/add-client-modal';

// 🎯 보험설계사 특화 고객 관리 페이지
// 실제 스키마 타입 사용으로 데이터베이스 연동 준비 완료

// 🎯 확장된 고객 프로필 타입 (페이지에서 사용)
interface ClientProfile extends Client {
  // 추가 계산 필드들 (런타임에서 계산됨)
  referralCount: number;
  insuranceTypes: string[];
  totalPremium: number;
  currentStage: {
    id: string;
    name: string;
    color: string;
  };
  engagementScore: number;
  conversionProbability: number;
  lifetimeValue: number;
  lastContactDate?: string;
  nextActionDate?: string;
  upcomingMeeting?: {
    date: string;
    type: string;
  };
  referredBy?: {
    id: string;
    name: string;
    relationship: string;
  };
}

// 🎯 MVP 핵심 통계 (보험설계사 관점)
const MOCK_STATS = {
  totalClients: 47,
  activeClients: 42,
  inactiveClients: 5,
  networkStats: {
    totalReferrals: 28,
    directReferrers: 12,
    secondDegreeConnections: 15,
    networkValue: 8420000,
  },
  salesStats: {
    totalContracts: 23,
    monthlyPremium: 1240000,
    averageContractValue: 180000,
    conversionRate: 48.9,
  },
  activityStats: {
    scheduledMeetings: 8,
    pendingActions: 6,
    overdueFollowups: 2,
  },
};

// 🎯 보험설계사 특화 풍부한 고객 데이터 (실제 스키마 기반)
const MOCK_CLIENTS: ClientProfile[] = [
  {
    // 🎯 기본 Client 필드들 (스키마 기반)
    id: '1',
    agentId: 'demo-agent',
    teamId: 'team-1',
    fullName: '김철수',
    email: 'kimcs@example.com',
    phone: '010-1234-5678',
    telecomProvider: 'SKT',
    address: '서울시 강남구 역삼동',
    occupation: '회사원 (삼성전자)',
    hasDrivingLicense: true,
    height: 175,
    weight: 70,
    tags: ['VIP', '핵심 소개자', '장기 고객'],
    importance: 'high' as Importance,
    currentStageId: 'stage3',
    referredById: null,
    notes: '매우 적극적인 고객. 추가 소개 가능성 높음.',
    customFields: {},
    isActive: true,
    createdAt: new Date('2023-08-15'),
    updatedAt: new Date('2024-01-10'),

    // 🎯 계산/확장 필드들
    referralCount: 3,
    insuranceTypes: ['자동차보험', '건강보험', '연금보험'],
    totalPremium: 320000,
    currentStage: {
      id: 'stage3',
      name: '상품 설명',
      color: '#3b82f6',
    },
    engagementScore: 8.5,
    conversionProbability: 85,
    lifetimeValue: 2400000,
    lastContactDate: '2024-01-10',
    nextActionDate: '2024-01-15',
    upcomingMeeting: {
      date: '2024-01-15',
      type: '계약 체결',
    },
    referredBy: {
      id: 'ref1',
      name: '박영희',
      relationship: '대학 동기',
    },
  },
  {
    // 🎯 기본 Client 필드들 (스키마 기반)
    id: '2',
    agentId: 'demo-agent',
    teamId: 'team-1',
    fullName: '이미영',
    email: 'leemy@example.com',
    phone: '010-9876-5432',
    telecomProvider: 'KT',
    address: '서울시 서초구 반포동',
    occupation: '의사 (강남세브란스)',
    hasDrivingLicense: true,
    height: 165,
    weight: 55,
    tags: ['VIP', '고소득', '전문직'],
    importance: 'high' as Importance,
    currentStageId: 'stage4',
    referredById: '1', // 김철수가 소개
    notes: '의료진 네트워크 활용 가능',
    customFields: {},
    isActive: true,
    createdAt: new Date('2023-09-20'),
    updatedAt: new Date('2024-01-08'),

    // 🎯 계산/확장 필드들
    referralCount: 2,
    insuranceTypes: ['의료배상보험', '연금보험'],
    totalPremium: 580000,
    currentStage: {
      id: 'stage4',
      name: '계약 검토',
      color: '#8b5cf6',
    },
    engagementScore: 9.2,
    conversionProbability: 92,
    lifetimeValue: 4200000,
    lastContactDate: '2024-01-08',
    nextActionDate: '2024-01-12',
    referredBy: {
      id: '1',
      name: '김철수',
      relationship: '직장 동료',
    },
  },
  {
    // 🎯 기본 Client 필드들 (스키마 기반)
    id: '3',
    agentId: 'demo-agent',
    teamId: 'team-1',
    fullName: '박준호',
    email: 'parkjh@example.com',
    phone: '010-5555-1234',
    telecomProvider: 'LG U+',
    address: '경기도 성남시 분당구',
    occupation: '자영업 (카페 운영)',
    hasDrivingLicense: true,
    height: 178,
    weight: 75,
    tags: ['자영업', '소상공인'],
    importance: 'medium' as Importance,
    currentStageId: 'stage2',
    referredById: '2', // 이미영이 소개
    notes: '사업 확장 계획 있음',
    customFields: {},
    isActive: true,
    createdAt: new Date('2023-10-10'),
    updatedAt: new Date('2024-01-05'),

    // 🎯 계산/확장 필드들
    referralCount: 1,
    insuranceTypes: ['화재보험', '사업자보험'],
    totalPremium: 180000,
    currentStage: {
      id: 'stage2',
      name: '니즈 분석',
      color: '#10b981',
    },
    engagementScore: 6.8,
    conversionProbability: 65,
    lifetimeValue: 1800000,
    lastContactDate: '2024-01-05',
    nextActionDate: '2024-01-18',
    referredBy: {
      id: '2',
      name: '이미영',
      relationship: '친구',
    },
  },
  // 더 많은 고객 데이터...
];

// 🎯 Loader 함수 - 실제 데이터베이스 연동
export async function loader({ request }: { request: Request }) {
  try {
    console.log('🔄 Loader: 고객 목록 로딩 중...');

    // 🎯 실제 사용자 ID 가져오기
    const { getCurrentUser } = await import('~/lib/auth/core');
    const user = await getCurrentUser(request);

    if (!user) {
      console.error('❌ Loader: 인증되지 않은 사용자');
      return {
        clients: [],
        stats: {
          totalClients: 0,
          newThisMonth: 0,
          activeDeals: 0,
          totalRevenue: 0,
          conversionRate: 0,
          topStages: [],
        },
        pagination: {
          total: 0,
          page: 1,
          totalPages: 0,
        },
      };
    }

    // 🎯 실제 API 호출
    const { getClients, getClientStats } = await import('~/api/shared/clients');

    // 병렬로 데이터 조회
    const [clientsResponse, statsResponse] = await Promise.all([
      getClients({
        agentId: user.id,
        page: 1,
        limit: 50, // 첫 로딩에서는 많이 가져오기
      }),
      getClientStats(user.id),
    ]);

    console.log('✅ Loader: 데이터 로딩 완료', {
      clientsCount: clientsResponse.data.length,
      statsLoaded: statsResponse.success,
    });

    return {
      clients: clientsResponse.data,
      stats: statsResponse.data,
      pagination: {
        total: clientsResponse.total,
        page: clientsResponse.page,
        totalPages: clientsResponse.totalPages,
      },
      userId: user.id, // 실제 사용자 ID 전달
    };
  } catch (error) {
    console.error('❌ Loader: 데이터 로딩 실패:', error);

    // 오류 시 빈 데이터 반환
    return {
      clients: [],
      stats: {
        totalClients: 0,
        newThisMonth: 0,
        activeDeals: 0,
        totalRevenue: 0,
        conversionRate: 0,
        topStages: [],
      },
      pagination: {
        total: 0,
        page: 1,
        totalPages: 0,
      },
    };
  }
}

export function meta() {
  return [{ title: '고객 관리 | SureCRM' }];
}

// 🎯 고객 데이터 유효성 검사 스키마
const clientValidationSchema = z.object({
  fullName: z.string().min(2, '이름은 2글자 이상이어야 합니다'),
  phone: z.string().min(10, '올바른 전화번호를 입력해주세요'),
  email: z
    .string()
    .email('올바른 이메일 주소를 입력해주세요')
    .optional()
    .or(z.literal('')),
  address: z.string().optional(),
  occupation: z.string().optional(),
  importance: z.enum(['high', 'medium', 'low']).default('medium'),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export async function action({ request }: Route.ActionArgs) {
  try {
    console.log('🔄 Action: 고객 관리 액션 시작');

    // 실제 사용자 ID 가져오기
    const { getCurrentUser } = await import('~/lib/auth/core');
    const user = await getCurrentUser(request);

    if (!user) {
      return {
        success: false,
        message: '인증이 필요합니다.',
      };
    }

    const formData = await request.formData();
    const intent = formData.get('intent') as string;

    if (intent === 'create-client') {
      console.log('➕ Action: 고객 생성 시작');

      // 서버사이드에서만 API 호출
      const { createClient } = await import('~/api/shared/clients');
      const { getPipelineStages } = await import(
        '~/features/pipeline/lib/supabase-pipeline-data'
      );

      // pipeline stages 조회
      const stages = await getPipelineStages(user.id);

      if (!stages || stages.length === 0) {
        return {
          success: false,
          message: '파이프라인 단계 정보를 가져올 수 없습니다.',
        };
      }

      // 기본 단계 찾기
      const defaultStage =
        stages.find(
          (stage: any) => stage.name === '첫 상담' || stage.isDefault
        ) || stages[0];

      // 폼 데이터 파싱 및 유효성 검사
      const fullName = formData.get('fullName') as string;
      const phone = formData.get('phone') as string;

      if (!fullName || !phone) {
        return {
          success: false,
          message: '이름과 전화번호는 필수 항목입니다.',
        };
      }

      const email = formData.get('email') as string;
      const address = formData.get('address') as string;
      const occupation = formData.get('occupation') as string;
      const importance = formData.get('importance') as string;
      const tagsString = formData.get('tags') as string;
      const notes = formData.get('notes') as string;
      const referredById = formData.get('referredById') as string;

      // tags 배열 변환
      const tags = tagsString
        ? tagsString
            .split(',')
            .map((tag: string) => tag.trim())
            .filter(Boolean)
        : [];

      const clientData = {
        fullName,
        phone,
        email: email || null,
        address: address || null,
        occupation: occupation || null,
        importance: importance || 'medium',
        currentStageId: defaultStage.id,
        referredById: referredById || null,
        tags,
        notes: notes || null,
      };

      console.log('📝 Action: 고객 데이터 준비 완료', clientData);

      const result = await createClient(clientData, user.id);

      if (result.success) {
        console.log('✅ Action: 고객 생성 성공', result.data);

        // 성공 시 현재 페이지로 redirect (데이터 새로고침됨)
        return Response.redirect(request.url + '?success=created');
      } else {
        console.error('❌ Action: 고객 생성 실패', result.message);
        return {
          success: false,
          message: result.message,
        };
      }
    }

    return {
      success: false,
      message: '알 수 없는 작업입니다.',
    };
  } catch (error) {
    console.error('❌ Action: 처리 중 오류:', error);
    return {
      success: false,
      message: '서버 오류가 발생했습니다.',
    };
  }
}

export default function ClientsPage({ loaderData }: any) {
  const fetcher = useFetcher();
  const navigate = useNavigate();

  // 🎯 상태 관리
  const [searchQuery, setSearchQuery] = useState('');
  const [filterImportance, setFilterImportance] = useState<
    'all' | 'high' | 'medium' | 'low'
  >('all');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [filterReferralStatus, setFilterReferralStatus] =
    useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<
    'name' | 'stage' | 'importance' | 'premium' | 'lastContact' | 'createdAt'
  >('createdAt');

  // 🎯 모달 상태 관리
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(
    null
  );

  // 🎯 성공 메시지 처리 (URL 파라미터 확인)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');

    if (success === 'created') {
      // URL에서 성공 파라미터 제거 (깔끔하게)
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);

      // 성공 메시지는 이제 Toast로 표시하거나 생략 (redirect 자체가 성공 표시)
      console.log('✅ 고객 생성 성공 - 페이지가 새로고침되었습니다');
    }
  }, []);

  // 🎯 Fetcher 상태 처리 (에러만 모달에서 처리)
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success === false) {
      // 에러는 모달 내부에서 표시되므로 여기서는 로그만
      console.error('❌ 고객 생성 실패:', fetcher.data.message);
    }
  }, [fetcher.state, fetcher.data]);

  // 🎯 핸들러 함수들
  const handleClientSubmit = async (
    clientData: Partial<ClientProfile>,
    isEdit: boolean = false
  ) => {
    try {
      if (isEdit && selectedClient) {
        // 수정 - 기존 방식 유지 (나중에 action으로 이동)
        const { updateClient } = await import('~/api/shared/clients');
        const result = await updateClient(
          selectedClient.id,
          clientData,
          loaderData.userId
        );

        if (result.success) {
          console.log('고객 수정 성공:', result.data);
          // 성공 메시지는 Toast 시스템으로 교체 예정
          console.log('✅ 고객 정보가 수정되었습니다:', result.message);
        } else {
          console.error('고객 수정 실패:', result.message);
          // 에러 메시지는 별도 에러 처리 시스템으로 교체 예정
          console.error('❌ 고객 수정 실패:', result.message);
        }

        setShowEditClientModal(false);
        setSelectedClient(null);
      } else {
        // 생성 - React Router Action 사용 (SSR)
        console.log('🚀 클라이언트: Action으로 고객 생성 요청');

        const formData = new FormData();
        formData.append('intent', 'create-client');
        formData.append('fullName', clientData.fullName || '');
        formData.append('phone', clientData.phone || '');
        formData.append('email', clientData.email || '');
        formData.append('address', clientData.address || '');
        formData.append('occupation', clientData.occupation || '');
        formData.append('importance', clientData.importance || 'medium');
        formData.append('referredById', clientData.referredById || '');
        formData.append(
          'tags',
          Array.isArray(clientData.tags)
            ? clientData.tags.join(',')
            : clientData.tags || ''
        );
        formData.append('notes', clientData.notes || '');

        // React Router Action 호출 (서버사이드에서 처리됨)
        fetcher.submit(formData, { method: 'POST' });

        // 모달 닫기 (redirect 시 자동으로 새로고침됨)
        setShowAddClientModal(false);
        setSelectedClient(null);
      }
    } catch (error) {
      console.error('클라이언트 처리 중 오류:', error);
      // Alert 대신 콘솔 로그 (모달에서 fetcher.data로 에러 표시됨)
      console.error('❌ 처리 중 오류가 발생했습니다');
    }
  };

  // 🎯 고객 관리 핵심 액션
  const handleAddClient = () => {
    setSelectedClient(null);
    setShowAddClientModal(true);
  };

  const handleEditClient = (e: React.MouseEvent, client: ClientProfile) => {
    e.stopPropagation(); // 🎯 이벤트 버블링 방지
    setSelectedClient(client);
    setShowEditClientModal(true);
  };

  const handleDeleteClient = (e: React.MouseEvent, client: ClientProfile) => {
    e.stopPropagation(); // 🎯 이벤트 버블링 방지
    setSelectedClient(client);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedClient) return;

    try {
      // 🎯 실제 API 호출 (Phase 3에서 완전 구현)
      const { deleteClient } = await import('~/api/shared/clients');

      const result = await deleteClient(selectedClient.id, loaderData.userId);
      if (result.success) {
        console.log('고객 삭제 성공:', result.data);
        alert(
          `${selectedClient.fullName} 고객이 삭제되었습니다.\n(Phase 3에서 실제 페이지 새로고침 및 연관 데이터 정리 구현 예정)`
        );

        // 경고 메시지 표시
        if (result.warnings && result.warnings.length > 0) {
          alert('주의사항:\n' + result.warnings.join('\n'));
        }

        setShowDeleteConfirmModal(false);
        setSelectedClient(null);
        // TODO: Phase 3에서 페이지 데이터 새로고침 구현
      } else {
        console.error('고객 삭제 실패:', result.message);
        alert(result.message || '고객 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('고객 삭제 오류:', error);
      alert('고객 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleImportClients = () => {
    setShowImportModal(true);
  };

  // 🎯 고급 필터링 (보험설계사 특화)
  const filteredClients = loaderData.clients.filter((client: ClientProfile) => {
    // 검색어 필터링
    const matchesSearch =
      !searchQuery ||
      client.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery) ||
      (client.email &&
        client.email.toLowerCase().includes(searchQuery.toLowerCase()));

    // 중요도 필터링
    const matchesImportance =
      filterImportance === 'all' || client.importance === filterImportance;

    // 영업 단계 필터링
    const matchesStage =
      filterStage === 'all' || client.currentStage?.name === filterStage;

    // 소개 상태 필터링
    const matchesReferralStatus =
      filterReferralStatus === 'all' ||
      (filterReferralStatus === 'has_referrer' && client.referredBy) ||
      (filterReferralStatus === 'no_referrer' && !client.referredBy) ||
      (filterReferralStatus === 'top_referrer' && client.referralCount >= 3);

    return (
      matchesSearch &&
      matchesImportance &&
      matchesStage &&
      matchesReferralStatus
    );
  });

  // 🎯 정렬 로직
  const sortedClients = useMemo(() => {
    const sorted = [...filteredClients].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.fullName.localeCompare(b.fullName);
        case 'stage':
          return a.currentStage.name.localeCompare(b.currentStage.name);
        case 'importance':
          const importanceOrder = { high: 3, medium: 2, low: 1 };
          return (
            (importanceOrder[b.importance as keyof typeof importanceOrder] ||
              0) -
            (importanceOrder[a.importance as keyof typeof importanceOrder] || 0)
          );
        case 'premium':
          return b.totalPremium - a.totalPremium;
        case 'lastContact':
          if (!a.lastContactDate && !b.lastContactDate) return 0;
          if (!a.lastContactDate) return 1;
          if (!b.lastContactDate) return -1;
          return (
            new Date(b.lastContactDate).getTime() -
            new Date(a.lastContactDate).getTime()
          );
        case 'createdAt':
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });
    return sorted;
  }, [filteredClients, sortBy]);

  // 🎯 헬퍼 함수들
  const getImportanceBadgeColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImportanceText = (importance: string) => {
    switch (importance) {
      case 'high':
        return '높음';
      case 'medium':
        return '보통';
      case 'low':
        return '낮음';
      default:
        return '미설정';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'yyyy.MM.dd', { locale: ko });
  };

  // 🎯 핸들러 함수들 (데이터베이스 연동 고려)
  const handleClientRowClick = (clientId: string) => {
    // 🎯 React Router를 사용한 정확한 라우팅
    navigate(`/clients/${clientId}`);
  };

  // 소개자 후보 목록 생성 (모든 기존 고객이 소개자가 될 수 있음)
  const potentialReferrers = loaderData.clients
    .map((client: ClientProfile) => ({
      id: client.id,
      name: client.fullName,
    }))
    .sort((a: any, b: any) => a.name.localeCompare(b.name)); // 이름순 정렬

  // 🎯 카드 뷰 렌더링
  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedClients.map((client: ClientProfile) => (
        <Card
          key={client.id}
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-l-4"
          style={{ borderLeftColor: client.currentStage.color }}
          onClick={() => handleClientRowClick(client.id)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {client.fullName.charAt(0)}
                </div>
                <div>
                  <CardTitle className="text-lg">{client.fullName}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {client.phone}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant="outline"
                  className={getImportanceBadgeColor(client.importance)}
                >
                  {getImportanceText(client.importance)}
                </Badge>
                {client.importance === 'high' && (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* 현재 단계 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">현재 단계</span>
              <Badge
                variant="outline"
                style={{
                  borderColor: client.currentStage.color,
                  color: client.currentStage.color,
                }}
              >
                {client.currentStage.name}
              </Badge>
            </div>

            {/* 보험 정보 */}
            {client.insuranceTypes.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">보험 종류</span>
                <span className="text-sm font-medium">
                  {client.insuranceTypes.slice(0, 2).join(', ')}
                  {client.insuranceTypes.length > 2 &&
                    ` 외 ${client.insuranceTypes.length - 2}개`}
                </span>
              </div>
            )}

            {/* 총 보험료 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">총 보험료</span>
              <span className="text-sm font-semibold text-green-600">
                {formatCurrency(client.totalPremium)}
              </span>
            </div>

            {/* 소개 정보 */}
            {client.referredBy && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">소개자</span>
                <span className="text-sm">{client.referredBy.name}</span>
              </div>
            )}

            {/* 최근 연락 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">최근 연락</span>
              <span className="text-sm">
                {formatDate(client.lastContactDate)}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // 🎯 테이블 뷰 렌더링
  const renderTableView = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>고객 정보</TableHead>
          <TableHead>연락처</TableHead>
          <TableHead>소개 관계</TableHead>
          <TableHead>중요도</TableHead>
          <TableHead>영업 단계</TableHead>
          <TableHead className="text-center">성과</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedClients.map((client) => (
          <TableRow
            key={client.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => handleClientRowClick(client.id)}
          >
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                    {client.fullName.charAt(0)}
                  </div>
                </div>
                <div>
                  <p className="font-medium">{client.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {client.phone}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <p className="text-sm">{client.occupation || '미입력'}</p>
                <p className="text-xs text-muted-foreground">
                  {client.address || '주소 미입력'}
                </p>
              </div>
            </TableCell>
            <TableCell>
              {client.referredBy ? (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {client.referredBy.name}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    ({client.referredBy.relationship})
                  </span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">직접 고객</span>
              )}
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  client.importance === 'high'
                    ? 'destructive'
                    : client.importance === 'medium'
                    ? 'default'
                    : 'secondary'
                }
              >
                {client.importance === 'high'
                  ? 'VIP'
                  : client.importance === 'medium'
                  ? '일반'
                  : '낮음'}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${client.currentStage.color}`}
                />
                <span className="text-sm">{client.currentStage.name}</span>
              </div>
            </TableCell>
            <TableCell className="text-center">
              <div className="text-sm">
                <div className="font-medium">{client.referralCount}명 소개</div>
                <div className="text-xs text-muted-foreground">
                  {(client.totalPremium / 10000).toFixed(0)}만원 월납
                </div>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <MainLayout title="고객 관리">
      <div className="space-y-8">
        {/* 🎯 고객 관리 핵심 액션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 빠른 고객 등록 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-600" />새 고객 등록
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                새 고객을 빠르게 추가하고 관리를 시작하세요
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button onClick={handleAddClient} className="w-full h-10">
                  <Plus className="h-4 w-4 mr-2" />새 고객 추가
                </Button>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full h-10 opacity-60 cursor-not-allowed"
                    disabled
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    엑셀로 가져오기
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    MVP에서는 제공되지 않는 기능입니다
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 고객 관리 통계 요약 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                고객 현황 요약
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                현재 관리 중인 고객들의 핵심 지표
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">전체 고객</span>
                  <Badge variant="default">
                    {loaderData.stats.totalClients}명
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">활성 고객</span>
                  <Badge variant="secondary">
                    {loaderData.stats.activeClients}명
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">VIP 고객</span>
                  <Badge variant="destructive">
                    {
                      filteredClients.filter(
                        (c: ClientProfile) => c.importance === 'high'
                      ).length
                    }
                    명
                  </Badge>
                </div>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full h-10 opacity-60 cursor-not-allowed"
                    disabled
                  >
                    <Download className="h-4 w-4 mr-2" />
                    고객 목록 내보내기
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    MVP에서는 제공되지 않는 기능입니다
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 🎯 스마트 검색 및 필터 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>고객 검색 및 필터</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {filteredClients.length}명의 고객이 검색되었습니다
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
                    setFilterImportance(
                      value as 'all' | 'high' | 'medium' | 'low'
                    )
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
                      <SelectItem value="has_referrer">
                        소개받은 고객
                      </SelectItem>
                      <SelectItem value="no_referrer">
                        직접 영업 고객
                      </SelectItem>
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

        {/* 🎯 고객 목록 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  고객 목록
                  <Badge variant="outline" className="ml-2">
                    {filteredClients.length}명
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {viewMode === 'cards'
                    ? '카드 뷰로 고객 상세 정보를 확인하세요'
                    : '테이블 뷰로 고객을 빠르게 비교하세요'}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredClients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="rounded-full bg-primary/10 p-6 mb-6">
                  <Users className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  검색 결과가 없습니다
                </h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  검색 조건을 변경하거나 새 고객을 추가해보세요.
                </p>
                <Button onClick={handleAddClient}>
                  <Plus className="h-4 w-4 mr-2" />새 고객 추가하기
                </Button>
              </div>
            ) : viewMode === 'cards' ? (
              renderCardView()
            ) : (
              renderTableView()
            )}
          </CardContent>
        </Card>

        {/* 🎯 고객 추가 모달 */}
        <AddClientModal
          open={showAddClientModal}
          onOpenChange={setShowAddClientModal}
          onSubmit={handleClientSubmit}
          isSubmitting={fetcher.state === 'submitting'}
          error={fetcher.data?.success === false ? fetcher.data.message : null}
          referrers={potentialReferrers}
        />

        {/* 🎯 엑셀 가져오기 모달 */}
        {showImportModal && (
          <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>엑셀 가져오기</DialogTitle>
                <DialogDescription>
                  Phase 3에서 실제 파일 업로드 기능을 구현할 예정입니다.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    CSV 또는 Excel 파일을 드래그하거나 클릭하여 업로드
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowImportModal(false)}
                  >
                    취소
                  </Button>
                  <Button
                    onClick={() => {
                      alert(
                        'Phase 3에서 실제 파일 업로드 기능을 구현할 예정입니다.'
                      );
                      setShowImportModal(false);
                    }}
                  >
                    업로드
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* 🎯 고객 수정 모달 */}
        {showEditClientModal && (
          <Dialog
            open={showEditClientModal}
            onOpenChange={setShowEditClientModal}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>고객 정보 수정</DialogTitle>
                <DialogDescription>
                  Phase 3에서 실제 수정 기능을 구현할 예정입니다.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>이름</Label>
                  <Input placeholder="고객 이름" />
                </div>
                <div>
                  <Label>전화번호</Label>
                  <Input placeholder="010-1234-5678" />
                </div>
                <div>
                  <Label>이메일</Label>
                  <Input placeholder="example@email.com" />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowEditClientModal(false)}
                  >
                    취소
                  </Button>
                  <Button
                    onClick={() => {
                      alert('Phase 3에서 실제 수정 기능을 구현할 예정입니다.');
                      setShowEditClientModal(false);
                    }}
                  >
                    수정
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* 🎯 고객 삭제 확인 모달 */}
        {showDeleteConfirmModal && (
          <Dialog
            open={showDeleteConfirmModal}
            onOpenChange={setShowDeleteConfirmModal}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>고객 삭제 확인</DialogTitle>
                <DialogDescription>
                  {selectedClient?.fullName} 고객을 정말로 삭제하시겠습니까?
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirmModal(false)}
                >
                  취소
                </Button>
                <Button variant="destructive" onClick={handleConfirmDelete}>
                  삭제
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
}
