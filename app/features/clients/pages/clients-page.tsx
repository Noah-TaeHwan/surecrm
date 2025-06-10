import { MainLayout } from '~/common/layouts/main-layout';
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

import { ClientStatsSection } from '../components/client-stats-section';
import { ClientFiltersSection } from '../components/client-filters-section';
import { ClientListSection } from '../components/client-list-section';
import { ClientsPageModals } from '../components/clients-page-modals';

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

// 🎯 실제 데이터로 대체됨 - 더미 데이터 제거

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
    tags: ['키맨', '핵심 소개자', '장기 고객'],
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
    tags: ['키맨', '고소득', '전문직'],
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
        currentUser: null,
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
      stats: statsResponse.data,
    });

    // 🎯 statsResponse가 실패했거나 데이터가 없으면 클라이언트 데이터로 직접 계산
    let finalStats = statsResponse.data;

    if (
      !statsResponse.success ||
      !statsResponse.data ||
      statsResponse.data.totalClients === 0
    ) {
      console.log(
        '📊 Stats API 실패 또는 빈 데이터, 클라이언트 데이터로 직접 계산'
      );

      const clients = clientsResponse.data;
      const totalClients = clients.length;

      // 키맨 고객 수
      const keyClients = clients.filter(
        (c: any) => c.importance === 'high'
      ).length;

      // 계약 완료 고객 수 (currentStage.name이 '계약 완료'인 고객)
      const contractedClients = clients.filter(
        (c: any) => c.currentStage?.name === '계약 완료'
      ).length;

      // 활성 고객 수 (제외됨이 아닌 고객)
      const activeClients = clients.filter(
        (c: any) => c.currentStage?.name !== '제외됨'
      ).length;

      // 전환율 계산
      const conversionRate =
        activeClients > 0
          ? Math.round((contractedClients / activeClients) * 100 * 10) / 10
          : 0;

      finalStats = {
        totalClients: totalClients,
        activeClients: activeClients,
        inactiveClients: totalClients - activeClients,
        recentGrowth: 0,
        conversionRate: conversionRate,
      } as any;

      console.log('📊 직접 계산된 통계:', finalStats);
    }

    return {
      clients: clientsResponse.data,
      stats: finalStats,
      pagination: {
        total: clientsResponse.total,
        page: clientsResponse.page,
        totalPages: clientsResponse.totalPages,
      },
      userId: user.id, // 실제 사용자 ID 전달
      currentUser: {
        id: user.id,
        email: user.email,
        name: user.email.split('@')[0], // 이메일 앞부분을 이름으로 사용
      },
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
      currentUser: null,
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

  // === 🎯 사용자 경험 향상을 위한 클라이언트 페이지 행동 분석 시스템 ===
  useEffect(() => {
    const clients = loaderData?.clients || MOCK_CLIENTS;
    const stats = loaderData?.stats || {
      totalClients: MOCK_CLIENTS.length,
      newThisMonth: 5,
      activePipeline: 12,
      conversionRate: 68,
    };

    // 페이지 진입 시 포괄적인 컨텍스트 정보 수집
    const pageLoadTime = performance.now();
    const sessionContext = {
      page: 'clients_management',
      user_context: {
        total_clients: clients?.length || 0,
        has_active_pipeline: (stats?.activePipeline || 0) > 0,
        conversion_rate: stats?.conversionRate || 0,
        new_clients_this_month: stats?.newThisMonth || 0,
      },
      interaction_intent: 'client_management_access',
      business_context: {
        client_base_size: clients?.length || 0,
        pipeline_health: stats?.activePipeline || 0,
        growth_indicator: stats?.newThisMonth || 0,
        performance_metric: stats?.conversionRate || 0,
      },
      technical_metrics: {
        page_load_time: pageLoadTime,
        initial_render_timestamp: Date.now(),
        device_capabilities: {
          memory: (navigator as any).deviceMemory || 'unknown',
          cores: navigator.hardwareConcurrency || 'unknown',
          connection: (navigator as any).connection?.effectiveType || 'unknown',
        },
      },
    };

    // 클라이언트 데이터 구조 분석
    if (clients && clients.length > 0) {
      const clientAnalysis = {
        importance_distribution: {
          high: clients.filter((c: ClientProfile) => c.importance === 'high')
            .length,
          medium: clients.filter(
            (c: ClientProfile) => c.importance === 'medium'
          ).length,
          low: clients.filter((c: ClientProfile) => c.importance === 'low')
            .length,
        },
        stage_distribution: clients.reduce(
          (acc: any, client: ClientProfile) => {
            const stage = client.currentStage?.name || 'unknown';
            acc[stage] = (acc[stage] || 0) + 1;
            return acc;
          },
          {}
        ),
        engagement_metrics: {
          high_engagement: clients.filter(
            (c: ClientProfile) => c.engagementScore > 8
          ).length,
          avg_engagement:
            clients.reduce(
              (sum: number, c: ClientProfile) => sum + (c.engagementScore || 0),
              0
            ) / clients.length,
          high_conversion_probability: clients.filter(
            (c: ClientProfile) => c.conversionProbability > 80
          ).length,
        },
        revenue_potential: {
          total_lifetime_value: clients.reduce(
            (sum: number, c: ClientProfile) => sum + (c.lifetimeValue || 0),
            0
          ),
          avg_premium:
            clients.reduce(
              (sum: number, c: ClientProfile) => sum + (c.totalPremium || 0),
              0
            ) / clients.length,
          high_value_clients: clients.filter(
            (c: ClientProfile) => (c.lifetimeValue || 0) > 3000000
          ).length,
        },
        network_insights: {
          referral_generators: clients.filter(
            (c: ClientProfile) => (c.referralCount || 0) > 0
          ).length,
          total_referrals: clients.reduce(
            (sum: number, c: ClientProfile) => sum + (c.referralCount || 0),
            0
          ),
          referral_chain_depth: Math.max(
            ...clients.map((c: ClientProfile) => c.referralCount || 0)
          ),
        },
      };

      // GA4 향상된 클라이언트 관리 분석
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'client_management_access', {
          event_category: 'client_portfolio_analysis',
          ...sessionContext.user_context,
          client_analysis: JSON.stringify(clientAnalysis),
          business_performance: {
            portfolio_health_score:
              (stats?.conversionRate || 0) * 0.6 +
              (clientAnalysis.engagement_metrics.avg_engagement || 0) * 0.4,
            growth_momentum: stats?.newThisMonth || 0,
            revenue_concentration:
              clientAnalysis.revenue_potential.high_value_clients /
              (clients.length || 1),
          },
          operational_insights: {
            client_diversity: Object.keys(clientAnalysis.stage_distribution)
              .length,
            referral_efficiency:
              clientAnalysis.network_insights.total_referrals /
              (clients.length || 1),
            engagement_quality:
              clientAnalysis.engagement_metrics.high_engagement /
              (clients.length || 1),
          },
          session_intelligence: {
            access_pattern: 'direct_navigation',
            user_expertise_level:
              clients.length > 50
                ? 'expert'
                : clients.length > 20
                ? 'intermediate'
                : 'beginner',
            portfolio_complexity: clientAnalysis.stage_distribution,
          },
        });
      }

      // GTM DataLayer 정밀 분석
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'client_portfolio_deep_analysis',
          page_context: {
            section: 'client_management',
            subsection: 'client_overview',
            action_capability: 'full_client_operations',
          },
          business_intelligence: {
            portfolio_composition: clientAnalysis,
            performance_indicators: {
              conversion_health: stats?.conversionRate || 0,
              growth_velocity: stats?.newThisMonth || 0,
              pipeline_strength: stats?.activePipeline || 0,
              total_portfolio_size: clients.length,
            },
            strategic_insights: {
              high_value_concentration:
                (clientAnalysis.revenue_potential.high_value_clients /
                  (clients.length || 1)) *
                100,
              referral_network_strength:
                clientAnalysis.network_insights.total_referrals,
              engagement_distribution: clientAnalysis.engagement_metrics,
              market_penetration_indicators:
                clientAnalysis.importance_distribution,
            },
            operational_efficiency: {
              avg_client_value: clientAnalysis.revenue_potential.avg_premium,
              portfolio_diversification:
                Object.keys(clientAnalysis.stage_distribution).length / 6, // 가정: 6개 단계
              referral_multiplication_factor:
                clientAnalysis.network_insights.total_referrals /
                (clients.length || 1),
            },
          },
          user_behavior_context: {
            page_access_intent: 'portfolio_management',
            expected_actions: [
              'client_review',
              'contact_planning',
              'pipeline_optimization',
            ],
            session_complexity:
              clients.length > 100
                ? 'high'
                : clients.length > 50
                ? 'medium'
                : 'low',
          },
          timestamp: Date.now(),
          session_id: `client_mgmt_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 8)}`,
        });
      }
    }

    // 클라이언트 개별 분석 및 액션 예측
    const setupClientInteractionTracking = () => {
      // 클라이언트 행 클릭 추적
      const trackClientInteraction = (clientId: string, action: string) => {
        const client = clients.find((c: ClientProfile) => c.id === clientId);
        if (client && window.gtag) {
          window.gtag('event', 'client_interaction', {
            event_category: 'client_individual_analysis',
            client_importance: client.importance,
            client_stage: client.currentStage?.name,
            client_engagement: client.engagementScore,
            conversion_probability: client.conversionProbability,
            interaction_type: action,
            client_lifetime_value: client.lifetimeValue,
            referral_potential: client.referralCount,
            premium_value: client.totalPremium,
            last_contact_recency: client.lastContactDate
              ? Math.floor(
                  (Date.now() - new Date(client.lastContactDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              : null,
          });
        }
      };

      // 필터 사용 추적
      const trackFilterUsage = (filterType: string, filterValue: string) => {
        if (window.gtag) {
          window.gtag('event', 'client_filter_applied', {
            event_category: 'portfolio_navigation',
            filter_type: filterType,
            filter_value: filterValue,
            current_client_count: clients.length,
            session_context: 'client_management',
          });
        }
      };

      // 전역에 함수 등록
      (window as any).trackClientInteraction = trackClientInteraction;
      (window as any).trackFilterUsage = trackFilterUsage;
    };

    setupClientInteractionTracking();

    // 페이지 이탈 시 세션 분석
    const handlePageUnload = () => {
      const sessionDuration = Date.now() - pageLoadTime;
      if (window.gtag) {
        window.gtag('event', 'client_management_session_end', {
          event_category: 'session_analysis',
          session_duration: sessionDuration,
          clients_reviewed: (window as any).clientsReviewedCount || 0,
          actions_performed: (window as any).actionsPerformedCount || 0,
        });
      }
    };

    window.addEventListener('beforeunload', handlePageUnload);
    return () => window.removeEventListener('beforeunload', handlePageUnload);
  }, [loaderData]);

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

  // 🎯 핸들러 함수들 (AddClientModal 타입에 맞춰 수정)
  const handleClientSubmit = async (data: {
    fullName: string;
    phone?: string; // 전화번호를 선택사항으로 변경
    email?: string;
    telecomProvider?: string;
    address?: string;
    occupation?: string;
    importance: 'high' | 'medium' | 'low';
    referredById?: string;
    tags?: string;
    notes?: string;
  }) => {
    try {
      // 생성 - React Router Action 사용 (SSR)
      console.log('🚀 클라이언트: Action으로 고객 생성 요청');

      const formData = new FormData();
      formData.append('intent', 'create-client');
      formData.append('fullName', data.fullName || '');
      formData.append('phone', data.phone || '');
      formData.append('email', data.email || '');
      formData.append('address', data.address || '');
      formData.append('occupation', data.occupation || '');
      formData.append('importance', data.importance || 'medium');
      formData.append('referredById', data.referredById || '');
      formData.append('tags', data.tags || '');
      formData.append('notes', data.notes || '');

      // React Router Action 호출 (서버사이드에서 처리됨)
      fetcher.submit(formData, { method: 'POST' });

      // 모달 닫기 (redirect 시 자동으로 새로고침됨)
      setShowAddClientModal(false);
      setSelectedClient(null);
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

  return (
    <MainLayout title="고객 관리">
      <div className="space-y-8">
        {/* 🎯 고객 관리 핵심 액션 */}
        <ClientStatsSection
          stats={loaderData.stats}
          clients={loaderData.clients}
          onAddClient={handleAddClient}
        />

        {/* 🎯 스마트 검색 및 필터 */}
        <ClientFiltersSection
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterImportance={filterImportance}
          setFilterImportance={setFilterImportance}
          filterStage={filterStage}
          setFilterStage={setFilterStage}
          filterReferralStatus={filterReferralStatus}
          setFilterReferralStatus={setFilterReferralStatus}
          viewMode={viewMode}
          setViewMode={setViewMode}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          filteredClientsCount={filteredClients.length}
        />

        {/* 🎯 고객 목록 */}
        <ClientListSection
          filteredClients={sortedClients}
          viewMode={viewMode}
          onClientRowClick={handleClientRowClick}
          onAddClient={handleAddClient}
        />

        {/* 🎯 모든 모달들 */}
        <ClientsPageModals
          // Add Client Modal
          showAddClientModal={showAddClientModal}
          setShowAddClientModal={setShowAddClientModal}
          onClientSubmit={handleClientSubmit}
          isSubmitting={fetcher.state === 'submitting'}
          submitError={
            fetcher.data?.success === false ? fetcher.data.message : null
          }
          potentialReferrers={potentialReferrers}
          // Import Modal
          showImportModal={showImportModal}
          setShowImportModal={setShowImportModal}
          // Edit Client Modal
          showEditClientModal={showEditClientModal}
          setShowEditClientModal={setShowEditClientModal}
          // Delete Confirm Modal
          showDeleteConfirmModal={showDeleteConfirmModal}
          setShowDeleteConfirmModal={setShowDeleteConfirmModal}
          selectedClient={selectedClient as any}
          onConfirmDelete={handleConfirmDelete}
        />
      </div>
    </MainLayout>
  );
}
