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
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
  Suspense,
  Component,
} from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import type {
  NetworkNode,
  NetworkLink,
  NetworkData,
  NetworkFilters,
} from '../types';

// 실제 데이터베이스 함수들 import
import { getNetworkData, searchNetwork } from '../lib/network-data';
import { requireAuth } from '~/lib/auth/middleware';

export async function loader({ request }: Route.LoaderArgs) {
  try {
    // 인증 확인
    const user = await requireAuth(request);

    // 실제 네트워크 데이터 조회
    const networkData = await getNetworkData(user.id);

    return {
      nodes: networkData.nodes,
      edges: networkData.edges,
      stats: networkData.stats,
      agentId: user.id,
    };
  } catch (error) {
    console.error('네트워크 데이터 로딩 실패:', error);

    // 에러 시 빈 데이터 반환
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

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '소개 네트워크 - SureCRM' },
    {
      name: 'description',
      content: '고객 간 소개 관계를 시각화하여 네트워크 효과를 극대화하세요.',
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
  const { nodes, edges, stats, agentId } = loaderData;

  const graphRef = useRef<any>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [filterSettings, setFilterSettings] = useState<NetworkFilters>({
    stageFilter: 'all',
    depthFilter: 'all',
    importanceFilter: 0,
    showInfluencersOnly: false,
  });
  const [searchQuery, setSearchQuery] = useState('');

  // 검색 결과 상태 추가 (옵시디언 스타일)
  const [searchResults, setSearchResults] = useState<
    Array<{
      id: string;
      name: string;
      type: string;
      stage?: string;
      importance?: number;
    }>
  >([]);

  // 실제 네트워크 데이터 사용 - useMemo로 최적화
  const networkData = useMemo(
    () => ({
      nodes: nodes.map((node) => ({
        id: node.id,
        name: node.name,
        group: node.type === 'agent' ? 'influencer' : 'client',
        importance:
          node.importance === 'high' ? 5 : node.importance === 'medium' ? 3 : 1,
        stage: node.status === 'active' ? '계약 완료' : '첫 상담',
      })),
      links: edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
        value: edge.strength,
      })),
    }),
    [nodes, edges]
  );

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
        .then((module) => {
          setNetworkGraphComponent(() => module.default);
        })
        .catch((err) => {
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

  // 검색 처리 함수 (옵시디언 스타일 즉시 검색)
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      // 실시간 검색 - 노드 이름으로 필터링
      const results = nodes
        .filter((node) => node.name.toLowerCase().includes(query.toLowerCase()))
        .map((node) => ({
          id: node.id,
          name: node.name,
          type: node.type === 'agent' ? 'influencer' : 'client',
          stage: node.status === 'active' ? '계약 완료' : '첫 상담',
          importance:
            node.importance === 'high'
              ? 5
              : node.importance === 'medium'
              ? 3
              : 1,
        }))
        .slice(0, 10); // 최대 10개 결과

      setSearchResults(results);
    },
    [nodes]
  );

  // 노드 포커스 함수 (옵시디언 스타일)
  const handleNodeFocus = useCallback(
    (nodeId: string) => {
      setSelectedNode(nodeId);

      // 그래프에서 해당 노드로 이동
      if (graphRef.current && typeof graphRef.current.centerAt === 'function') {
        const node = nodes.find((n) => n.id === nodeId);
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
        (node) => node.stage === filterSettings.stageFilter
      );
    }

    // 중요도 기준 필터링
    if (filterSettings.importanceFilter > 0) {
      filteredNodes = filteredNodes.filter(
        (node) => (node.importance || 0) >= filterSettings.importanceFilter
      );
    }

    // 핵심 소개자 필터링
    if (filterSettings.showInfluencersOnly) {
      const influencersAndConnections = new Set<string>();

      // 우선 모든 영향력 있는 사용자(influencer) 식별
      const influencers = networkData.nodes.filter(
        (node) => node.group === 'influencer'
      );
      influencers.forEach((influencer) =>
        influencersAndConnections.add(influencer.id)
      );

      // 각 영향력 있는 사용자와 직접 연결된 모든 노드를 추가
      networkData.links.forEach((link: NetworkLink) => {
        const sourceId =
          typeof link.source === 'string' ? link.source : link.source.id;
        const targetId =
          typeof link.target === 'string' ? link.target : link.target.id;

        // 소스가 influencer인 경우 타겟 노드 추가
        if (influencers.some((inf) => inf.id === sourceId)) {
          influencersAndConnections.add(targetId);
        }

        // 타겟이 influencer인 경우 소스 노드 추가
        if (influencers.some((inf) => inf.id === targetId)) {
          influencersAndConnections.add(sourceId);
        }
      });

      // 핵심 소개자와 그들의 연결 노드만 남김
      filteredNodes = filteredNodes.filter((node) =>
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
          typeof link.source === 'string' ? link.source : link.source.id;
        const targetId =
          typeof link.target === 'string' ? link.target : link.target.id;

        if (!nodeConnections.has(sourceId)) {
          nodeConnections.set(sourceId, new Set());
        }
        nodeConnections.get(sourceId).add(targetId);
      });

      if (filterSettings.depthFilter === 'direct') {
        // 직접 소개만 표시 (1촌)
        const directConnectionNodes = new Set();

        // 영향력 있는 사용자(influencer)와 그들의 직접 연결 노드만 선택
        filteredNodes.forEach((node) => {
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

        filteredNodes = filteredNodes.filter((node) =>
          directConnectionNodes.has(node.id)
        );
      }
    }

    // 검색어 필터링 (검색어가 있는 경우)
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase().trim();
      filteredNodes = filteredNodes.filter((node) =>
        node.name.toLowerCase().includes(lowerQuery)
      );
    }

    // 필터링된 노드ID 목록
    const filteredNodeIds = new Set(filteredNodes.map((node) => node.id));

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

  // 네트워크 데이터 통계 상태 - useMemo로 최적화
  const networkStats = useMemo(
    () => ({
      totalNodes: networkData.nodes.length,
      filteredNodes: filteredData.nodes.length,
      influencerCount: filteredData.nodes.filter(
        (n) => n.group === 'influencer'
      ).length,
      connectionCount: filteredData.links.length,
    }),
    [networkData.nodes.length, filteredData.nodes, filteredData.links.length]
  );

  // 필터 변경 시 통계 업데이트
  const handleFilterChange = useCallback((newFilters: NetworkFilters) => {
    setFilterSettings(newFilters);
  }, []);

  // 그래프 컴포넌트 렌더링
  const renderNetworkGraph = () => {
    // 서버 렌더링 시 표시할 내용
    if (typeof window === 'undefined') {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="mb-2">그래프 로딩 중...</p>
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
              그래프를 로드하는데 문제가 발생했습니다.
            </p>
            <button
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
              onClick={() => window.location.reload()}
            >
              페이지 새로고침
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
            <p className="mb-2">그래프 로딩 중...</p>
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
                그래프 렌더링 중 오류가 발생했습니다.
              </p>
              <button
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                onClick={() => window.location.reload()}
              >
                페이지 새로고침
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

  return (
    <MainLayout title="소개 네트워크">
      <div className="flex flex-col lg:flex-row h-full overflow-hidden">
        {/* 필터 사이드바 - 모바일에서는 독립 버튼, 데스크톱에서는 적정 너비 */}
        <div className="lg:w-[280px] w-auto shrink-0">
          <NetworkSidebar
            filters={filterSettings}
            onFilterChange={handleFilterChange}
            stats={networkStats}
          />
        </div>

        {/* 메인 콘텐츠 영역 - 더 넓은 공간 차지 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Card className="m-2 lg:m-4 flex-1 overflow-hidden flex flex-col">
            <CardHeader className="pb-0">
              <CardTitle>소개 네트워크</CardTitle>
              <CardDescription>
                고객 간 소개 관계를 시각화합니다. 노드를 클릭하면 상세 정보를 볼
                수 있습니다.
              </CardDescription>

              {/* 컨트롤 패널 */}
              <NetworkControls
                onSearch={handleSearch}
                searchResults={searchResults}
                onNodeFocus={handleNodeFocus}
              />
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden relative">
              {/* 그래프 시각화 */}
              <div className="w-full h-full">{renderNetworkGraph()}</div>
            </CardContent>
          </Card>
        </div>

        {/* 고객 상세 정보 패널 (선택된 노드가 있을 때만 표시) - 좀 더 좁게 조정 */}
        {selectedNode && (
          <div className="lg:w-[320px] w-full shrink-0 max-h-screen overflow-y-auto">
            <NetworkDetailPanel
              nodeId={selectedNode}
              data={networkData}
              onClose={() => setSelectedNode(null)}
              onNodeSelect={handleNodeSelect}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
}
