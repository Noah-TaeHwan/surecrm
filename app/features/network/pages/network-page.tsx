'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { MainLayout } from '~/common/layouts/main-layout';
import NetworkControls from '../components/NetworkControls';
import NetworkSidebar from '../components/NetworkSidebar';
import NetworkDetailPanel from '../components/NetworkDetailPanel';
import {
  useRef,
  useState,
  useCallback,
  useEffect,
  Suspense,
  Component,
} from 'react';
import type { ErrorInfo, ReactNode } from 'react';

// 더미 데이터 (실제로는 loader에서 가져와야 함)
const DUMMY_NETWORK_DATA = {
  nodes: [
    // 주요 소개자 (핵심 소개자)
    {
      id: '1',
      name: '김철수',
      group: 'influencer',
      importance: 5,
      stage: '계약 완료',
    },
    // 1차 소개받은 사람들
    {
      id: '2',
      name: '이영희',
      group: 'client',
      importance: 4,
      stage: '계약 완료',
    },
    {
      id: '3',
      name: '박지성',
      group: 'client',
      importance: 3,
      stage: '계약 검토',
    },
    {
      id: '4',
      name: '최민수',
      group: 'client',
      importance: 4,
      stage: '계약 완료',
    },
    // 2차 소개받은 사람들 (이영희가 소개)
    {
      id: '5',
      name: '정다운',
      group: 'client',
      importance: 2,
      stage: '니즈 분석',
    },
    {
      id: '6',
      name: '한미영',
      group: 'client',
      importance: 3,
      stage: '상품 설명',
    },
    // 2차 소개받은 사람들 (박지성이 소개)
    {
      id: '7',
      name: '윤석진',
      group: 'client',
      importance: 2,
      stage: '첫 상담',
    },
    {
      id: '8',
      name: '송지원',
      group: 'client',
      importance: 4,
      stage: '계약 검토',
    },
    // 2차 소개받은 사람들 (최민수가 소개)
    {
      id: '9',
      name: '장현우',
      group: 'client',
      importance: 3,
      stage: '니즈 분석',
    },
    // 또 다른 핵심 소개자
    {
      id: '10',
      name: '오민지',
      group: 'influencer',
      importance: 5,
      stage: '계약 완료',
    },
    // 오민지가 소개한 사람들
    {
      id: '11',
      name: '임재현',
      group: 'client',
      importance: 3,
      stage: '상품 설명',
    },
    {
      id: '12',
      name: '강수민',
      group: 'client',
      importance: 4,
      stage: '계약 완료',
    },
    // 3차 소개
    {
      id: '13',
      name: '조예진',
      group: 'client',
      importance: 2,
      stage: '첫 상담',
    },
    {
      id: '14',
      name: '신동훈',
      group: 'client',
      importance: 3,
      stage: '니즈 분석',
    },
    {
      id: '15',
      name: '류민호',
      group: 'client',
      importance: 1,
      stage: '첫 상담',
    },
  ],
  links: [
    // 김철수로부터 소개된 사람들
    { source: '1', target: '2', value: 1 },
    { source: '1', target: '3', value: 1 },
    { source: '1', target: '4', value: 1 },

    // 이영희가 소개한 사람들
    { source: '2', target: '5', value: 1 },
    { source: '2', target: '6', value: 1 },

    // 박지성이 소개한 사람들
    { source: '3', target: '7', value: 1 },
    { source: '3', target: '8', value: 1 },

    // 최민수가 소개한 사람
    { source: '4', target: '9', value: 1 },

    // 오민지가 소개한 사람들
    { source: '10', target: '11', value: 1 },
    { source: '10', target: '12', value: 1 },

    // 3차 소개
    { source: '5', target: '13', value: 1 },
    { source: '8', target: '14', value: 1 },
    { source: '9', target: '15', value: 1 },

    // 상호 소개 관계 (네트워크 복잡성 추가)
    { source: '4', target: '10', value: 1 }, // 최민수와 오민지는 서로 알고 있음
    { source: '6', target: '11', value: 1 }, // 한미영과 임재현은 연결됨
  ],
};

export function loader() {
  // 실제로는 DB에서 네트워크 데이터를 가져와야 함
  return DUMMY_NETWORK_DATA;
}

export function meta() {
  return [
    { title: '소개 네트워크 - SureCRM' },
    {
      name: 'description',
      content: '고객 간 소개 관계를 시각화하여 네트워크 효과를 극대화하세요.',
    },
  ];
}

// 데이터 타입 정의
interface NetworkNode {
  id: string;
  name: string;
  group?: string;
  importance?: number;
  stage?: string;
  referredBy?: string;
}

interface NetworkLink {
  source: string | NetworkNode;
  target: string | NetworkNode;
  value: number;
}

interface NetworkData {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

interface FilterSettings {
  stageFilter: string;
  depthFilter: string;
  importanceFilter: number;
  showInfluencersOnly: boolean;
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

export default function NetworkPage() {
  const graphRef = useRef<any>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [filterSettings, setFilterSettings] = useState({
    stageFilter: 'all',
    depthFilter: 'all',
    importanceFilter: 0,
    showInfluencersOnly: false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  // 네트워크 데이터 통계 상태 추가
  const [networkStats, setNetworkStats] = useState({
    totalNodes: DUMMY_NETWORK_DATA.nodes.length,
    filteredNodes: DUMMY_NETWORK_DATA.nodes.length,
    influencerCount: DUMMY_NETWORK_DATA.nodes.filter(
      (n) => n.group === 'influencer'
    ).length,
    connectionCount: DUMMY_NETWORK_DATA.links.length,
  });

  // 실제로는 props를 통해 loaderData를 받아야 함
  const networkData = DUMMY_NETWORK_DATA;

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

  const handleNodeSelect = useCallback((nodeId: string) => {
    setSelectedNode(nodeId);
  }, []);

  // 필터링된 데이터 계산 함수
  const calculateFilteredData = useCallback(
    (data: NetworkData, filters: FilterSettings, query: string = '') => {
      // 노드 필터링 로직 (NetworkGraphClient와 동일한 로직)
      let filteredNodes = [...data.nodes];

      // 영업 단계별 필터링
      if (filters.stageFilter !== 'all') {
        filteredNodes = filteredNodes.filter(
          (node) => node.stage === filters.stageFilter
        );
      }

      // 중요도 기준 필터링
      if (filters.importanceFilter > 0) {
        filteredNodes = filteredNodes.filter(
          (node) => (node.importance || 0) >= filters.importanceFilter
        );
      }

      // 핵심 소개자만 보기
      if (filters.showInfluencersOnly) {
        filteredNodes = filteredNodes.filter(
          (node) => node.group === 'influencer'
        );
      }

      // 소개 깊이에 따른 필터링
      if (filters.depthFilter !== 'all') {
        // 원본 데이터에서 링크 정보 추출
        const nodeConnections = new Map();

        // 모든 직접 연결 관계 수집
        data.links.forEach((link: NetworkLink) => {
          const sourceId =
            typeof link.source === 'string' ? link.source : link.source.id;
          const targetId =
            typeof link.target === 'string' ? link.target : link.target.id;

          if (!nodeConnections.has(sourceId)) {
            nodeConnections.set(sourceId, new Set());
          }
          nodeConnections.get(sourceId).add(targetId);
        });

        if (filters.depthFilter === 'direct') {
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
      if (query.trim()) {
        const lowerQuery = query.toLowerCase().trim();
        filteredNodes = filteredNodes.filter((node) =>
          node.name.toLowerCase().includes(lowerQuery)
        );
      }

      // 필터링된 노드ID 목록
      const filteredNodeIds = new Set(filteredNodes.map((node) => node.id));

      // 링크 필터링 (양쪽 노드가 모두 필터링된 결과에 있는 경우만 포함)
      const filteredLinks = data.links.filter((link: NetworkLink) => {
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
    },
    []
  );

  // 필터 변경 시 통계 업데이트
  const handleFilterChange = useCallback(
    (newFilters: FilterSettings) => {
      setFilterSettings(newFilters);

      // 필터 변경 시 필터링된 데이터 기반 통계 업데이트
      const filteredData = calculateFilteredData(
        networkData,
        newFilters,
        searchQuery
      );
      setNetworkStats({
        totalNodes: networkData.nodes.length,
        filteredNodes: filteredData.nodes.length,
        influencerCount: filteredData.nodes.filter(
          (n) => n.group === 'influencer'
        ).length,
        connectionCount: filteredData.links.length,
      });
    },
    [networkData, calculateFilteredData, searchQuery]
  );

  // 검색어 변경 시도 통계 업데이트
  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);

      // 검색어 변경 시 필터링된 데이터 기반 통계 업데이트
      const filteredData = calculateFilteredData(
        networkData,
        filterSettings,
        query
      );
      setNetworkStats({
        totalNodes: networkData.nodes.length,
        filteredNodes: filteredData.nodes.length,
        influencerCount: filteredData.nodes.filter(
          (n) => n.group === 'influencer'
        ).length,
        connectionCount: filteredData.links.length,
      });

      // 검색어가 있고 필터링 결과 노드가 있으면 첫 번째 노드 자동 선택
      if (query.trim() !== '' && filteredData.nodes.length > 0) {
        // 필터링된 첫 번째 노드 선택
        const firstMatchNode = filteredData.nodes[0];
        setSelectedNode(firstMatchNode.id);
      } else if (query.trim() === '') {
        // 검색어가 비어있으면 선택 해제
        setSelectedNode(null);
      }
    },
    [networkData, filterSettings, calculateFilteredData]
  );

  // 초기 통계 설정
  useEffect(() => {
    // 컴포넌트 마운트 시 초기 통계 설정
    const filteredData = calculateFilteredData(
      networkData,
      filterSettings,
      searchQuery
    );
    setNetworkStats({
      totalNodes: networkData.nodes.length,
      filteredNodes: filteredData.nodes.length,
      influencerCount: filteredData.nodes.filter(
        (n) => n.group === 'influencer'
      ).length,
      connectionCount: filteredData.links.length,
    });
  }, [networkData, calculateFilteredData, filterSettings, searchQuery]);

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
        {/* 필터 사이드바 - 모바일에서는 좁게, 데스크톱에서는 충분한 너비 */}
        <div className="lg:w-1/4 w-full shrink-0 max-h-screen overflow-y-auto">
          <NetworkSidebar
            filters={filterSettings}
            onFilterChange={handleFilterChange}
            stats={networkStats}
          />
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Card className="m-2 lg:m-4 flex-1 overflow-hidden flex flex-col">
            <CardHeader className="pb-0">
              <CardTitle>소개 네트워크</CardTitle>
              <CardDescription>
                고객 간 소개 관계를 시각화합니다. 노드를 클릭하면 상세 정보를 볼
                수 있습니다.
              </CardDescription>

              {/* 컨트롤 패널 */}
              <NetworkControls onSearch={handleSearchChange} />
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden relative">
              {/* 그래프 시각화 */}
              <div className="w-full h-full">{renderNetworkGraph()}</div>
            </CardContent>
          </Card>
        </div>

        {/* 고객 상세 정보 패널 (선택된 노드가 있을 때만 표시) */}
        {selectedNode && (
          <div className="lg:w-1/4 w-full shrink-0 max-h-screen overflow-y-auto">
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
