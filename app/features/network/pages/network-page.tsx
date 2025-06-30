import type { Route } from './+types/network-page';
import { MainLayout } from '~/common/layouts/main-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import NetworkControls from '../components/NetworkControls';
import NetworkSidebar from '../components/NetworkSidebar';
import NetworkDetailPanel from '../components/NetworkDetailPanel';
import {
  NetworkMobileTabs,
  type NetworkMobileTabType,
} from '../components/NetworkMobileTabs';
import { useBreakpoint } from '~/common/hooks/use-window-size';
import {
  useMobileModalHeight,
  useFullScreenMode,
} from '~/common/hooks/use-viewport-height';
import {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
  Suspense,
  Component,
} from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';
import type {
  NetworkNode,
  NetworkLink,
  NetworkData,
  NetworkFilters,
} from '../types';

// 실제 데이터베이스 함수들 import
import { getNetworkData, searchNetwork } from '../lib/network-data';
import { requireAuth } from '~/lib/auth/middleware.server';

// 아이콘 import 추가
import {
  Filter,
  X,
  Search,
  Settings,
  Star,
  CheckCircle,
  BarChart4,
} from 'lucide-react';

export async function loader({ request }: Route.LoaderArgs) {
  try {
    // 🌍 서버사이드에서 언어 감지
    const acceptLanguage = request.headers.get('Accept-Language') || '';
    const cookieHeader = request.headers.get('Cookie') || '';

    // 쿠키에서 언어 우선 확인
    let detectedLang = 'ko';
    const langMatch = cookieHeader.match(/i18nextLng=([^;]+)/);
    if (langMatch) {
      detectedLang = langMatch[1];
    } else {
      // Accept-Language 헤더에서 언어 감지
      if (acceptLanguage.includes('en')) {
        detectedLang = 'en';
      } else if (acceptLanguage.includes('ja')) {
        detectedLang = 'ja';
      }
    }

    // 🔥 구독 상태 확인 (트라이얼 만료 시 billing 페이지로 리다이렉트)
    const { requireActiveSubscription } = await import(
      '~/lib/auth/subscription-middleware.server'
    );
    const { user } = await requireActiveSubscription(request);

    // 실제 네트워크 데이터 조회
    const networkData = await getNetworkData(user.id);

    // 파이프라인 단계 조회
    const { getPipelineStages } = await import(
      '~/features/pipeline/lib/supabase-pipeline-data'
    );
    const stages = await getPipelineStages(user.id);

    // 모든 활성 클라이언트의 상세 정보 조회
    const { db } = await import('~/lib/core/db.server');
    const { clients, clientDetails, pipelineStages, profiles } = await import(
      '~/lib/schema/core'
    );
    const { eq, and } = await import('drizzle-orm');

    const clientsWithDetails = await db
      .select({
        id: clients.id,
        fullName: clients.fullName,
        email: clients.email,
        phone: clients.phone,
        telecomProvider: clients.telecomProvider,
        address: clients.address,
        occupation: clients.occupation,
        importance: clients.importance,
        currentStageId: clients.currentStageId,
        referredById: clients.referredById,
        notes: clients.notes,
        createdAt: clients.createdAt,
        // 클라이언트 기본 정보 (clients 테이블에 있는 필드)
        height: clients.height,
        weight: clients.weight,
        hasDrivingLicense: clients.hasDrivingLicense,
        // 클라이언트 상세 정보 (clientDetails 테이블)
        birthDate: clientDetails.birthDate,
        gender: clientDetails.gender,
        // 파이프라인 단계 정보
        stageName: pipelineStages.name,
        stageColor: pipelineStages.color,
      })
      .from(clients)
      .leftJoin(clientDetails, eq(clients.id, clientDetails.clientId))
      .leftJoin(pipelineStages, eq(clients.currentStageId, pipelineStages.id))
      .where(and(eq(clients.agentId, user.id), eq(clients.isActive, true)));

    // 에이전트(사용자) 정보 조회 - app_user_profiles 테이블과 auth.users에서
    const { createAdminClient } = await import('~/lib/core/supabase');

    // app_user_profiles(profiles)에서 프로필 정보 조회
    const userProfile = await db
      .select({
        id: profiles.id,
        fullName: profiles.fullName,
        phone: profiles.phone,
        company: profiles.company,
        role: profiles.role,
        createdAt: profiles.createdAt,
      })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    // auth.users에서 이메일 정보 조회
    const supabaseAdmin = createAdminClient();
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(
      user.id
    );

    const agentInfo = userProfile[0]
      ? {
          ...userProfile[0],
          email: authUser.user?.email || '',
        }
      : null;

    // 소개 관계 데이터 구성
    const clientMap = new Map();
    const referralData = new Map();

    for (const client of clientsWithDetails) {
      clientMap.set(client.id, client);

      // 소개한 고객들 찾기
      const referredClients = clientsWithDetails.filter(
        (c: any) => c.referredById === client.id
      );
      referralData.set(client.id, {
        referredBy: client.referredById
          ? clientMap.get(client.referredById)
          : null,
        referredClients: referredClients,
      });
    }

    return {
      nodes: networkData.nodes,
      edges: networkData.edges,
      stats: networkData.stats,
      agentId: user.id,
      agentInfo,
      stages,
      clientsData: clientsWithDetails,
      referralData: Object.fromEntries(referralData),
      detectedLang, // 🌍 감지된 언어 정보 추가
    };
  } catch (error) {
    console.error('네트워크 데이터 로딩 실패:', error);

    // 에러 시 빈 데이터 반환 (언어 정보도 포함)
    return {
      nodes: [],
      edges: [],
      stats: {
        totalNodes: 0,
        totalEdges: 0,
        maxDepth: 0,
        avgReferralsPerNode: 0,
        topReferrers: [],
        networkGrowth: [],
      },
      agentId: 'fallback-agent-id',
      agentInfo: null,
      stages: [],
      clientsData: [],
      referralData: {},
      detectedLang: 'ko', // 🌍 기본 언어
    };
  }
}

export async function action({ request }: Route.ActionArgs) {
  try {
    const user = await requireAuth(request);
    const formData = await request.formData();
    const intent = formData.get('intent');

    if (intent === 'search') {
      const query = formData.get('query') as string;
      const results = await searchNetwork(user.id, query);
      return { searchResults: results };
    }

    return { success: false, message: '알 수 없는 요청입니다.' };
  } catch (error) {
    console.error('네트워크 액션 오류:', error);
    return { success: false, message: '요청 처리에 실패했습니다.' };
  }
}

export function meta({ data }: Route.MetaArgs) {
  // loader에서 감지된 언어 정보 사용
  const detectedLang = data?.detectedLang || 'ko';

  // 언어별 메타 데이터
  const metaData = {
    ko: {
      title: '소개 네트워크 - SureCRM',
      description:
        '고객 간 소개 관계를 시각화하여 네트워크 효과를 극대화하세요.',
    },
    en: {
      title: 'Referral Network - SureCRM',
      description:
        'Visualize customer referral relationships to maximize network effects.',
    },
    ja: {
      title: '紹介ネットワーク - SureCRM',
      description:
        '顧客間の紹介関係を可視化してネットワーク効果を最大化しましょう。',
    },
  };

  const currentMeta =
    metaData[detectedLang as keyof typeof metaData] || metaData.ko;

  return [
    { title: currentMeta.title },
    {
      name: 'description',
      content: currentMeta.description,
    },
    {
      property: 'og:title',
      content: currentMeta.title,
    },
    {
      property: 'og:description',
      content: currentMeta.description,
    },
    {
      name: 'twitter:title',
      content: currentMeta.title,
    },
    {
      name: 'twitter:description',
      content: currentMeta.description,
    },
    {
      httpEquiv: 'Content-Language',
      content: detectedLang,
    },
  ];
}

// Error Boundary 컴포넌트 추가
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  onError?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('NetworkGraph 오류:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError();
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default function NetworkPage({ loaderData }: Route.ComponentProps) {
  const {
    nodes,
    edges,
    stats,
    agentId,
    agentInfo,
    stages,
    clientsData,
    referralData,
  } = loaderData;

  // 🌍 다국어 번역 훅
  const { t } = useHydrationSafeTranslation('network');

  // 반응형 브레이크포인트 훅
  const { isMobile, isTablet, isDesktop, isHydrated } = useBreakpoint();

  // 🚀 iPhone Safari 하단 주소창 대응 모바일 모달 높이
  const mobileModalHeight = useMobileModalHeight();

  // 🚀 iPhone Safari 전체 화면 모드
  const fullScreen = useFullScreenMode();

  // 디버깅용 로그 (개발 환경에서만)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && fullScreen.isIOSSafari) {
      console.log('🚀 네트워크 페이지 - iPhone Safari 전체 화면 모드:', {
        isEnabled: fullScreen.isEnabled,
        fullHeight: fullScreen.fullHeight,
        actualHeight: fullScreen.actualHeight,
        addressBarHeight: fullScreen.addressBarHeight,
        contentHeight: fullScreen.contentHeight,
      });
    }
  }, [fullScreen]);

  // 모바일 탭 상태 관리
  const [activeMobileTab, setActiveMobileTab] =
    useState<NetworkMobileTabType>('graph');

  const graphRef = useRef<any>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [filterSettings, setFilterSettings] = useState<NetworkFilters>({
    stageFilter: 'all',
    depthFilter: 'all',
    importanceFilter: 'all',
    showInfluencersOnly: false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false); // 모바일 필터 접힘/펼침 상태

  // 네트워크 페이지 전용 스타일 적용 (데스크톱에서만)
  useEffect(() => {
    // 모바일에서는 스타일 적용하지 않음 (스크롤 가능해야 함)
    if (!isHydrated || isMobile || isTablet) return;

    // HTML과 body 요소의 스크롤 방지 (데스크톱에서만)
    const originalHTMLOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    const originalHTMLHeight = document.documentElement.style.height;
    const originalBodyHeight = document.body.style.height;

    // CSS 강제 적용 (데스크톱에서만)
    document.documentElement.style.setProperty(
      'overflow',
      'hidden',
      'important'
    );
    document.body.style.setProperty('overflow', 'hidden', 'important');
    document.documentElement.style.setProperty('height', '100vh', 'important');
    document.body.style.setProperty('height', '100vh', 'important');

    // 모든 부모 컨테이너들도 강제 제어 (데스크톱에서만)
    const mainElement = document.querySelector('main');
    if (mainElement) {
      (mainElement as HTMLElement).style.setProperty(
        'overflow',
        'hidden',
        'important'
      );
      (mainElement as HTMLElement).style.setProperty(
        'height',
        'calc(100vh - 4rem)',
        'important'
      );
    }

    return () => {
      // 스타일 원복
      document.documentElement.style.overflow = originalHTMLOverflow;
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.height = originalHTMLHeight;
      document.body.style.height = originalBodyHeight;

      const mainElement = document.querySelector('main');
      if (mainElement) {
        (mainElement as HTMLElement).style.removeProperty('overflow');
        (mainElement as HTMLElement).style.removeProperty('height');
      }
    };
  }, [isHydrated, isMobile, isTablet]);

  // 실제 네트워크 데이터 사용 - useMemo로 최적화
  const networkData = useMemo(() => {
    return {
      nodes: nodes.map(node => {
        // 실제 고객 데이터에서 영업 단계 정보 찾기
        const clientData = clientsData.find(
          (client: any) => client.id === node.id
        );

        return {
          id: node.id,
          name: node.name,
          type: node.type, // 중요: 원본 타입 필드 보존
          group: node.type === 'agent' ? 'influencer' : 'client',
          importance:
            node.importance === 'high'
              ? 5
              : node.importance === 'medium'
                ? 3
                : 1,
          // 실제 고객의 영업 단계 사용 (fallback: 기존 로직)
          stage:
            clientData?.stageName ||
            (node.status === 'active' ? '계약 완료' : '첫 상담'),
        };
      }),
      links: edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        value: edge.strength,
      })),
    };
  }, [nodes, edges, clientsData]);

  // 에러 상태 관리
  const [graphLoadError, setGraphLoadError] = useState(false);

  // 그래프 컴포넌트 동적 로딩 상태 관리
  const [NetworkGraphComponent, setNetworkGraphComponent] = useState<any>(null);

  // 브라우저 환경 확인
  const isBrowser = typeof window !== 'undefined';

  // 컴포넌트 동적 로드 (dynamic import 방식으로 변경)
  useEffect(() => {
    if (isBrowser && !NetworkGraphComponent) {
      // 동적 import 사용 (브라우저 환경에서 작동)
      import('../components/NetworkGraphClient')
        .then(module => {
          setNetworkGraphComponent(() => module.default);
        })
        .catch(err => {
          console.error('네트워크 그래프 로딩 실패:', err);
          setGraphLoadError(true);
        });
    }
  }, [isBrowser, NetworkGraphComponent]);

  // 오류 처리 함수
  const handleError = useCallback(() => {
    console.error('네트워크 그래프 오류 발생');
    setGraphLoadError(true);
  }, []);

  // 🎯 검색 기능 (옵시디언 스타일)
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (!query.trim()) {
        return [];
      }

      // 모든 노드에서 검색
      const results = nodes
        .filter(node => {
          const searchTerm = query.toLowerCase();
          return (
            node.name.toLowerCase().includes(searchTerm) ||
            (node.type && node.type.toLowerCase().includes(searchTerm)) ||
            (node.status && node.status.toLowerCase().includes(searchTerm))
          );
        })
        .map(node => ({
          id: node.id,
          name: node.name,
          type: node.type || 'client',
          stage: node.status === 'active' ? '계약 완료' : '첫 상담',
          importance:
            node.importance === 'high'
              ? 5
              : node.importance === 'medium'
                ? 3
                : 1,
        }))
        .slice(0, 10); // 최대 10개 결과

      return results;
    },
    [nodes]
  );

  // 검색 결과 state
  const [searchResults, setSearchResults] = useState<
    Array<{
      id: string;
      name: string;
      type: string;
      stage?: string;
      importance?: number;
    }>
  >([]);

  // 검색 실행 함수
  const executeSearch = useCallback(
    (query: string) => {
      const results = handleSearch(query);
      setSearchResults(results);
    },
    [handleSearch]
  );

  // 노드 포커스 함수 (옵시디언 스타일)
  const handleNodeFocus = useCallback(
    (nodeId: string) => {
      setSelectedNode(nodeId);

      // 그래프에서 해당 노드로 이동
      if (graphRef.current && typeof graphRef.current.centerAt === 'function') {
        const node = nodes.find(n => n.id === nodeId);
        if (node && node.position) {
          // 노드 위치로 부드럽게 이동
          graphRef.current.centerAt(node.position.x, node.position.y, 1000);
        }
      }
    },
    [nodes]
  );

  const handleNodeSelect = useCallback((nodeId: string) => {
    setSelectedNode(nodeId);
  }, []);

  // 필터링된 데이터 계산 함수 - useMemo로 최적화
  const filteredData = useMemo(() => {
    // 노드 필터링 로직
    let filteredNodes = [...networkData.nodes];

    // 영업 단계별 필터링
    if (filterSettings.stageFilter !== 'all') {
      filteredNodes = filteredNodes.filter(
        node => node.stage === filterSettings.stageFilter
      );
    }

    // 중요도 기준 필터링
    if (filterSettings.importanceFilter !== 'all') {
      filteredNodes = filteredNodes.filter(node => {
        const nodeImportance =
          node.importance === 5
            ? 'high'
            : node.importance === 3
              ? 'medium'
              : 'low';
        return nodeImportance === filterSettings.importanceFilter;
      });
    }

    // 핵심 소개자 필터링
    if (filterSettings.showInfluencersOnly) {
      const influencersAndConnections = new Set<string>();

      // 우선 모든 영향력 있는 사용자(influencer) 식별
      const influencers = networkData.nodes.filter(
        node => node.group === 'influencer'
      );
      influencers.forEach(influencer =>
        influencersAndConnections.add(influencer.id)
      );

      // 각 영향력 있는 사용자와 직접 연결된 모든 노드를 추가
      networkData.links.forEach((link: NetworkLink) => {
        const sourceId =
          typeof link.source === 'string' ? link.source : link.source.id;
        const targetId =
          typeof link.target === 'string' ? link.target : link.target.id;

        // 소스가 influencer인 경우 타겟 노드 추가
        if (influencers.some(inf => inf.id === sourceId)) {
          influencersAndConnections.add(targetId);
        }

        // 타겟이 influencer인 경우 소스 노드 추가
        if (influencers.some(inf => inf.id === targetId)) {
          influencersAndConnections.add(sourceId);
        }
      });

      // 핵심 소개자와 그들의 연결 노드만 남김
      filteredNodes = filteredNodes.filter(node =>
        influencersAndConnections.has(node.id)
      );
    }

    // 소개 깊이에 따른 필터링
    if (filterSettings.depthFilter !== 'all') {
      // 원본 데이터에서 링크 정보 추출
      const nodeConnections = new Map();

      // 모든 직접 연결 관계 수집
      networkData.links.forEach((link: NetworkLink) => {
        const sourceId =
          typeof link.source === 'string'
            ? link.source
            : (link.source as any).id;
        const targetId =
          typeof link.target === 'string'
            ? link.target
            : (link.target as any).id;

        if (!nodeConnections.has(sourceId)) {
          nodeConnections.set(sourceId, new Set());
        }
        nodeConnections.get(sourceId).add(targetId);
      });

      if (filterSettings.depthFilter === 'direct') {
        // 직접 소개만 표시 (1촌)
        const directConnectionNodes = new Set();

        // 영향력 있는 사용자(influencer)와 그들의 직접 연결 노드만 선택
        filteredNodes.forEach(node => {
          if (node.group === 'influencer') {
            directConnectionNodes.add(node.id);
            const connections = nodeConnections.get(node.id);
            if (connections) {
              connections.forEach((targetId: string) => {
                directConnectionNodes.add(targetId);
              });
            }
          }
        });

        filteredNodes = filteredNodes.filter(node =>
          directConnectionNodes.has(node.id)
        );
      }
    }

    // 검색어 필터링 (검색어가 있는 경우)
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase().trim();
      filteredNodes = filteredNodes.filter(node =>
        node.name.toLowerCase().includes(lowerQuery)
      );
    }

    // 필터링된 노드ID 목록
    const filteredNodeIds = new Set(filteredNodes.map(node => node.id));

    // 링크 필터링 (양쪽 노드가 모두 필터링된 결과에 있는 경우만 포함)
    const filteredLinks = networkData.links.filter((link: NetworkLink) => {
      const sourceId =
        typeof link.source === 'string' ? link.source : link.source.id;
      const targetId =
        typeof link.target === 'string' ? link.target : link.target.id;
      return filteredNodeIds.has(sourceId) && filteredNodeIds.has(targetId);
    });

    return {
      nodes: filteredNodes,
      links: filteredLinks,
    };
  }, [networkData, filterSettings, searchQuery]);

  // 개선된 네트워크 데이터 통계 상태 - useMemo로 최적화
  const networkStats = useMemo(() => {
    const nodes = networkData.nodes;
    const links = networkData.links;

    // 에이전트 노드 제외한 실제 고객 노드들
    const clientNodes = nodes.filter(
      n => n.type !== 'agent' && n.group !== 'influencer'
    );

    // 최대 레벨 계산 (소개 체인 깊이)
    const maxLevel = clientNodes.reduce(
      (max, node) => Math.max(max, (node as any).level || 1),
      1
    );

    // 평균 소개 수 계산 (각 노드가 소개한 평균 고객 수)
    const totalReferrals = links.length;
    const avgReferralsPerNode =
      clientNodes.length > 0
        ? totalReferrals / Math.max(clientNodes.length, 1)
        : 0;

    // 탑 소개자 분석 (각 노드가 소개한 고객 수 기준)
    const referralCounts = new Map();

    // 각 노드의 소개 횟수 계산
    links.forEach(link => {
      const sourceId =
        typeof link.source === 'string' ? link.source : (link.source as any).id;
      const sourceName =
        nodes.find(n => n.id === sourceId)?.name || '알 수 없음';

      // 에이전트가 아닌 경우만 카운트
      if (nodes.find(n => n.id === sourceId)?.type !== 'agent') {
        referralCounts.set(sourceId, {
          id: sourceId,
          name: sourceName,
          referralCount: (referralCounts.get(sourceId)?.referralCount || 0) + 1,
        });
      }
    });

    // 소개 횟수 기준으로 정렬하여 TOP 소개자 선별
    const topReferrers = Array.from(referralCounts.values())
      .sort((a, b) => b.referralCount - a.referralCount)
      .slice(0, 5); // TOP 5까지

    return {
      totalNodes: nodes.length,
      filteredNodes: filteredData.nodes.length,
      influencerCount: filteredData.nodes.filter(
        n => n.group === 'influencer' || n.type === 'agent'
      ).length,
      connectionCount: filteredData.links.length,
      maxDepth: maxLevel,
      avgReferralsPerNode,
      topReferrers,
    };
  }, [
    networkData.nodes,
    networkData.links,
    filteredData.nodes,
    filteredData.links,
  ]);

  // 필터 변경 시 통계 업데이트
  const handleFilterChange = useCallback(
    (newFilters: Partial<NetworkFilters>) => {
      setFilterSettings(prevFilters => ({ ...prevFilters, ...newFilters }));
    },
    []
  );

  // 그래프 컴포넌트 렌더링
  const renderNetworkGraph = () => {
    // 서버 렌더링 시 표시할 내용
    if (typeof window === 'undefined') {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="mb-2">{t('graph.loading', '그래프 로딩 중...')}</p>
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          </div>
        </div>
      );
    }

    // 에러 상태일 때 표시할 내용
    if (graphLoadError) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md p-4">
            <p className="text-red-500 mb-4">
              {t(
                'graph.renderingError',
                '그래프를 로드하는데 문제가 발생했습니다.'
              )}
            </p>
            <button
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
              onClick={() => window.location.reload()}
            >
              {t('graph.refreshPage', '페이지 새로고침')}
            </button>
          </div>
        </div>
      );
    }

    // 컴포넌트 로딩 중일 때 표시할 내용
    if (!NetworkGraphComponent) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="mb-2">{t('graph.loading', '그래프 로딩 중...')}</p>
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          </div>
        </div>
      );
    }

    // NetworkGraphComponent가 로드되었을 때 렌더링
    return (
      <ErrorBoundary
        fallback={
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md p-4">
              <p className="text-red-500 mb-4">
                {t(
                  'graph.renderingErrorDetailed',
                  '그래프 렌더링 중 오류가 발생했습니다.'
                )}
              </p>
              <button
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                onClick={() => window.location.reload()}
              >
                {t('graph.refreshPage', '페이지 새로고침')}
              </button>
            </div>
          </div>
        }
        onError={handleError}
      >
        <NetworkGraphComponent
          data={networkData}
          onNodeSelect={handleNodeSelect}
          filters={filterSettings}
          searchQuery={searchQuery}
          graphRef={graphRef}
          highlightedNodeId={selectedNode}
        />
      </ErrorBoundary>
    );
  };

  // 사이드바 닫기 핸들러 (700ms 애니메이션과 동기화된 지연)
  const handleCloseSidebar = useCallback(() => {
    // 닫기 버튼 클릭 효과와 애니메이션 시작을 위한 지연
    setTimeout(() => {
      setSelectedNode(null);
    }, 100); // 클릭 피드백 후 애니메이션 시작
  }, []);

  // 모바일 레이아웃
  if (isHydrated && isMobile) {
    return (
      <MainLayout title={t('page.title', '소개 네트워크')}>
        <div className="space-y-4">
          {/* 필터 버튼 */}
          <div className="flex justify-start">
            <button
              onClick={() => setIsFilterExpanded(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v4.172a1 1 0 01-.293.707L10 20.414a1 1 0 01-.707.293H9a1 1 0 01-1-1v-3.586a1 1 0 00-.293-.707L1.293 9.707A1 1 0 011 9V4z"
                />
              </svg>
              {t('filters.title', '필터')}
            </button>
          </div>

          {/* 좌측 슬라이드인 필터 사이드바 - 데스크톱과 동일한 UI */}
          {isHydrated && isFilterExpanded && (
            <>
              {/* 백드롭 */}
              <div
                className="fixed inset-0 bg-black/20 z-40 animate-fade-in"
                onClick={() => setIsFilterExpanded(false)}
              />

              {/* 좌측 슬라이드인 사이드바 */}
              <div
                className="fixed top-0 left-0 bottom-0 z-50 bg-background border-r border-border shadow-2xl animate-slide-in-left flex flex-col"
                style={{
                  width: '280px', // 데스크톱과 동일한 너비
                  paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))', // 헤더 높이 고려
                  paddingBottom:
                    'calc(env(safe-area-inset-bottom, 0px) + 1rem)',
                }}
              >
                {/* 헤더 */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-background flex-shrink-0">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {t('sidebar.title', '필터 및 통계')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t('sidebar.description', '네트워크 데이터 필터링')}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsFilterExpanded(false)}
                    className="text-muted-foreground hover:text-foreground p-2 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* 스크롤 가능한 콘텐츠 영역 */}
                <div
                  className="flex-1 overflow-y-auto min-h-0"
                  style={{
                    WebkitOverflowScrolling: 'touch', // iOS 모바일 스크롤 최적화
                    overscrollBehavior: 'contain', // 스크롤 바운싱 제어
                  }}
                >
                  <NetworkSidebar
                    filters={filterSettings}
                    onFilterChange={handleFilterChange}
                    stats={networkStats}
                  />
                </div>
              </div>
            </>
          )}
          {/* 그래프 영역 - 동적 높이 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                {t('page.title', '소개 네트워크')}
              </CardTitle>
              <CardDescription className="text-sm">
                {t(
                  'page.description',
                  '고객 간 소개 관계를 시각화합니다. 노드를 클릭하면 상세 정보를 볼 수 있습니다.'
                )}
              </CardDescription>

              {/* 검색 컨트롤 */}
              <div className="mt-3">
                <NetworkControls
                  onSearch={executeSearch}
                  onNodeFocus={handleNodeFocus}
                  searchResults={searchResults}
                />
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div
                className="relative transition-all duration-300 ease-in-out"
                style={{
                  height: selectedNode ? '25vh' : '45vh', // 🎯 모달 열렸을 때 더 작게 (30vh → 25vh)
                  minHeight: selectedNode ? '200px' : '300px', // 🎯 최소 높이도 줄임 (250px → 200px)
                  maxHeight: selectedNode ? '30vh' : '52vh', // 🎯 최대 높이도 줄임 (40vh → 30vh)
                }}
              >
                {renderNetworkGraph()}
              </div>
            </CardContent>
          </Card>

          {/* 선택된 노드 상세 정보 */}
          {selectedNode && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t('detail.title', '노드 상세 정보')}</CardTitle>
                    <CardDescription>
                      {t(
                        'detail.description',
                        '선택한 노드의 상세 정보입니다.'
                      )}
                    </CardDescription>
                  </div>
                  <button
                    onClick={handleCloseSidebar}
                    className="text-muted-foreground hover:text-foreground p-1"
                  >
                    ✕
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <NetworkDetailPanel
                  nodeId={selectedNode}
                  data={networkData}
                  onClose={handleCloseSidebar}
                  onNodeSelect={handleNodeSelect}
                  clientsData={clientsData}
                  stages={stages}
                  referralData={referralData}
                  agentInfo={agentInfo}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* 하단 슬라이드업 사이드바 */}
        {selectedNode && (
          <>
            {/* 백드롭 - 더 진한 색상과 블러 효과 */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
              onClick={handleCloseSidebar}
              style={{
                /* 터치 영역 최적화 */
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'none',
              }}
            />

            {/* 슬라이드업 패널 - 🚀 iPhone Safari 전체 화면 모드 대응 */}
            <div
              className={`fixed left-0 right-0 z-50 bg-background border-t border-border rounded-t-xl shadow-2xl animate-slide-up flex flex-col ${fullScreen.isEnabled ? 'h-screen-full-ios content-safe-area' : 'ios-mobile-modal'}`}
              style={{
                ...mobileModalHeight.style, // 🚀 동적 높이 적용
                ...fullScreen.cssVars, // 🚀 전체 화면 모드 CSS 변수
                // iPhone Safari 추가 최적화
                willChange: 'transform, height',
                transform: 'translateZ(0)', // GPU 가속
                backfaceVisibility: 'hidden',
                // 전체 화면 모드에서 주소창 영역까지 활용
                ...(fullScreen.isEnabled && {
                  height: `${fullScreen.fullHeight}px`,
                  maxHeight: `${fullScreen.fullHeight}px`,
                  bottom: 0,
                }),
              }}
            >
              {/* 드래그 핸들 - sticky로 고정 */}
              <div className="flex justify-center pt-3 pb-2 bg-background sticky top-0 z-10 border-b border-border/20">
                <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
              </div>

              {/* NetworkDetailPanel 직접 렌더링 (데스크톱과 동일) - 스크롤 가능 */}
              <div
                className="flex-1 overflow-y-auto px-4"
                style={
                  {
                    WebkitOverflowScrolling: 'touch', // iOS 모바일 스크롤 최적화
                    overscrollBehavior: 'contain', // 스크롤 바운싱 제어
                    paddingBottom: fullScreen.isEnabled
                      ? `${fullScreen.addressBarHeight + 16}px` // 🚀 전체 화면 모드: 주소창 높이 + 여백
                      : `${mobileModalHeight.bottom}px`, // 🚀 일반 모드: 동적 하단 여백
                    // iPhone Safari 스크롤 최적화
                    scrollBehavior: 'smooth',
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none',
                  } as React.CSSProperties
                }
              >
                <NetworkDetailPanel
                  nodeId={selectedNode}
                  data={networkData}
                  onClose={handleCloseSidebar}
                  onNodeSelect={handleNodeSelect}
                  clientsData={clientsData}
                  stages={stages}
                  referralData={referralData}
                  agentInfo={agentInfo}
                />
              </div>
            </div>
          </>
        )}

        {/* 애니메이션 스타일 */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes slideInLeft {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease-in-out;
          }
          .animate-slide-up {
            animation: slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            /* iOS Safari 최적화된 easing과 duration */
          }
          .animate-slide-in-left {
            animation: slideInLeft 0.3s ease-in-out;
          }
        `}</style>
      </MainLayout>
    );
  }

  // 태블릿 레이아웃
  if (isHydrated && isTablet) {
    return (
      <MainLayout title={t('page.title', '소개 네트워크')}>
        <div className="space-y-6">
          {/* 그래프 영역 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('page.title', '소개 네트워크')}</CardTitle>
              <CardDescription>
                {t(
                  'page.description',
                  '고객 간 소개 관계를 시각화합니다. 노드를 클릭하면 상세 정보를 볼 수 있습니다.'
                )}
              </CardDescription>

              {/* 검색 컨트롤 */}
              <div className="mt-4">
                <NetworkControls
                  onSearch={executeSearch}
                  onNodeFocus={handleNodeFocus}
                />
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div
                className="relative"
                style={{
                  height: '50vh',
                  minHeight: '400px',
                  maxHeight: '60vh',
                }}
              >
                {renderNetworkGraph()}
              </div>
            </CardContent>
          </Card>

          {/* 필터 및 통계 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('sidebar.title', '필터 및 통계')}</CardTitle>
              <CardDescription>
                {t(
                  'sidebar.description',
                  '네트워크 데이터를 필터링하고 통계를 확인하세요.'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NetworkSidebar
                filters={filterSettings}
                onFilterChange={handleFilterChange}
                stats={networkStats}
              />
            </CardContent>
          </Card>

          {/* 선택된 노드 상세 정보 */}
          {selectedNode && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t('detail.title', '노드 상세 정보')}</CardTitle>
                    <CardDescription>
                      {t(
                        'detail.description',
                        '선택한 노드의 상세 정보입니다.'
                      )}
                    </CardDescription>
                  </div>
                  <button
                    onClick={handleCloseSidebar}
                    className="text-muted-foreground hover:text-foreground p-1"
                  >
                    ✕
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <NetworkDetailPanel
                  nodeId={selectedNode}
                  data={networkData}
                  onClose={handleCloseSidebar}
                  onNodeSelect={handleNodeSelect}
                  clientsData={clientsData}
                  stages={stages}
                  referralData={referralData}
                  agentInfo={agentInfo}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </MainLayout>
    );
  }

  // 데스크톱 레이아웃
  return (
    <MainLayout title={t('page.title', '소개 네트워크')}>
      <div
        data-network-main
        className="flex gap-3" // CSS Grid 대신 Flexbox 사용
        style={{
          height: 'calc(100vh - 4rem)',
          maxHeight: 'calc(100vh - 4rem)',
          overflow: 'hidden',
          padding: '0.75rem',
        }}
      >
        {/* 필터 사이드바 - 고정 너비 */}
        <div
          data-filter-area
          className="flex-shrink-0"
          style={{
            width: '280px', // 고정 너비
            height: 'calc(100vh - 5.5rem)',
            maxHeight: 'calc(100vh - 5.5rem)',
            overflow: 'hidden',
          }}
        >
          <NetworkSidebar
            filters={filterSettings}
            onFilterChange={handleFilterChange}
            stats={networkStats}
          />
        </div>

        {/* 메인 콘텐츠 영역 - flex-grow로 남은 공간 차지 */}
        <div
          data-graph-area
          className="flex-grow transition-all duration-700 ease-out"
          style={{
            height: 'calc(100vh - 5.5rem)',
            maxHeight: 'calc(100vh - 5.5rem)',
            overflow: 'hidden',
            willChange: 'margin-right',
            // 사이드바 상태에 따라 오른쪽 여백 조정
            marginRight: selectedNode ? '320px' : '0px',
          }}
        >
          <Card
            className="h-full flex flex-col graph-card transition-all duration-700 ease-out"
            style={{
              overflow: 'hidden',
              height: '100%',
              willChange: 'transform',
            }}
          >
            <CardHeader className="flex-shrink-0 pb-2 px-4 pt-3 graph-card-header">
              <CardTitle className="text-lg">
                {t('page.title', '소개 네트워크')}
              </CardTitle>
              <CardDescription className="text-sm">
                {t(
                  'page.description',
                  '고객 간 소개 관계를 시각화합니다. 노드를 클릭하면 상세 정보를 볼 수 있습니다.'
                )}
              </CardDescription>

              {/* 컨트롤 패널 */}
              <div>
                <NetworkControls
                  onSearch={executeSearch}
                  onNodeFocus={handleNodeFocus}
                />
              </div>
            </CardHeader>

            <CardContent
              className="flex-1 p-0 overflow-hidden graph-card-content"
              style={{
                overflow: 'hidden',
                height: '100%',
              }}
            >
              {/* 그래프 시각화 */}
              <div
                className="w-full h-full relative"
                style={{
                  overflow: 'hidden',
                }}
              >
                {renderNetworkGraph()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 고객 상세 정보 패널 - 절대 위치로 오버레이 */}
        <div
          data-sidebar-area
          className={`fixed right-0 top-16 transition-all duration-700 ease-out ${
            selectedNode
              ? 'translate-x-0 opacity-100'
              : 'translate-x-full opacity-0'
          }`}
          style={{
            width: '320px', // 고정 너비
            height: 'calc(100vh - 5.5rem)',
            maxHeight: 'calc(100vh - 5.5rem)',
            overflow: 'hidden',
            zIndex: 50,
            pointerEvents: selectedNode ? 'auto' : 'none',
            willChange: 'transform',
            paddingRight: '0.75rem', // 메인 컨테이너 패딩과 맞춤
          }}
        >
          {/* 배경 블러 효과 */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            style={{ borderRadius: '0.5rem' }}
          />

          {/* 실제 사이드바 콘텐츠 */}
          <div
            className={`relative h-full transition-all duration-500 ease-out ${
              selectedNode
                ? 'translate-y-0 opacity-100'
                : 'translate-y-4 opacity-0'
            }`}
            style={{
              transitionDelay: selectedNode ? '200ms' : '0ms',
              willChange: 'transform',
            }}
          >
            {/* 항상 렌더링하되 selectedNode가 있을 때만 데이터 전달 */}
            {selectedNode && (
              <NetworkDetailPanel
                nodeId={selectedNode}
                data={networkData}
                onClose={handleCloseSidebar}
                onNodeSelect={handleNodeSelect}
                clientsData={clientsData}
                stages={stages}
                referralData={referralData}
                agentInfo={agentInfo}
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
