'use client';

import { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import * as d3 from 'd3';

// 브라우저 환경인지 확인하는 변수 - 정의 위치 수정
const isBrowser = typeof window !== 'undefined';

// ForceGraph2D는 동적으로 임포트될 예정
let ForceGraph2D = null;

// 디바운스 함수 추가
const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

interface NetworkNode {
  id: string;
  name: string;
  group?: string;
  importance?: number;
  stage?: string;
  referredBy?: string;
  x?: number;
  y?: number;
}

// source와 target이 string 또는 NetworkNode 타입이 될 수 있도록 정의
interface NetworkLink {
  source: string | NetworkNode;
  target: string | NetworkNode;
  value: number;
}

interface NetworkData {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

interface NetworkGraphProps {
  data: NetworkData;
  onNodeSelect: (nodeId: string) => void;
  filters: {
    stageFilter: string;
    depthFilter: string;
    importanceFilter: number;
    showInfluencersOnly?: boolean;
  };
  layout?: string;
  searchQuery?: string;
  graphRef?: React.MutableRefObject<any>;
  highlightedNodeId?: string | null;
}

// 디버그 정보 표시 컴포넌트
const DebugInfo = ({ data, filteredData, layout, graphRef }: any) => {
  return (
    <div className="absolute top-2 right-2 bg-black/70 text-white p-2 rounded text-xs z-10">
      <div>노드 수: {filteredData.nodes.length}</div>
      <div>링크 수: {filteredData.links.length}</div>
      <div>레이아웃: {layout}</div>
      <div>그래프 ref: {graphRef.current ? '있음' : '없음'}</div>
    </div>
  );
};

// 그래프 실패 시 대체 UI
const FallbackGraph = ({ data, onNodeSelect }: any) => {
  return (
    <div className="w-full h-full p-4 overflow-auto">
      <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
        그래프 렌더링에 문제가 발생했습니다. 대체 UI를 표시합니다.
      </div>

      <div className="grid grid-cols-1 gap-2">
        <h3 className="font-medium">노드 목록</h3>
        {data.nodes.map((node: any) => (
          <div
            key={node.id}
            className="p-2 border rounded cursor-pointer hover:bg-gray-100"
            onClick={() => onNodeSelect(node.id)}
          >
            <div className="font-medium">{node.name}</div>
            <div className="text-sm text-gray-500">
              중요도: {node.importance} / 단계: {node.stage}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 색상 상수 선언 (코드 시작 부분 수정)
const HIGHLIGHT_COLORS = {
  // 불투명 원색 (소스 노드가 하이라이트된 경우)
  ORANGE: 'rgb(255, 140, 0)', // 일관된 주황색 값으로 수정
  // 불투명 원색 (타겟 노드가 하이라이트된 경우)
  BLUE: 'rgb(66, 133, 244)',
  // 발광 효과용 색상
  ORANGE_GLOW: 'rgba(255, 140, 0, 0.5)', // 주황색 발광 (투명도 통일)
  BLUE_GLOW: 'rgba(66, 133, 244, 0.5)', // 파란색 발광 (투명도 통일)
  // 비하이라이트 링크용 색상
  ORANGE_LIGHT: 'rgba(255, 140, 0, 0.7)', // 약한 주황색 (일관된 값으로 수정)
  ORANGE_LIGHTER: 'rgba(255, 140, 0, 0.3)', // 매우 약한 주황색 (일관된 값으로 수정)
  BLUE_LIGHT: 'rgba(66, 133, 244, 0.3)', // 약한 파란색
  BLUE_LIGHTER: 'rgba(66, 133, 244, 0.2)', // 매우 약한 파란색
  NEUTRAL: 'rgba(180, 180, 180, 0.3)', // 중립 색상
  ARROW_DEFAULT: 'rgba(80, 140, 200, 0.7)', // 기본 화살표 색상
};

export default function NetworkGraphClient({
  data,
  onNodeSelect,
  filters,
  layout = 'force',
  searchQuery = '',
  graphRef: externalGraphRef,
  highlightedNodeId: externalHighlightedNodeId = null,
}: NetworkGraphProps) {
  // 내부 ref 생성 및 외부 ref 처리
  const internalGraphRef = useRef<any>(null);
  const graphRef = externalGraphRef || internalGraphRef;

  // ForceGraph2D 컴포넌트 로딩 상태 관리
  const [graphComponent, setGraphComponent] = useState<any>(null);

  // 브라우저 환경에서만 ForceGraph2D 로드 (동적 import 방식으로 변경)
  useEffect(() => {
    if (isBrowser && !graphComponent) {
      // 동적 import 사용
      import('react-force-graph-2d')
        .then((module) => {
          setGraphComponent(() => module.default);
        })
        .catch((err) => {
          console.error('ForceGraph2D 로딩 실패:', err);
          setGraphState((prev) => ({ ...prev, renderingFailed: true }));
        });
    }
  }, [graphComponent]);

  // 초기화 상태 관리 (단일 상태로 통합)
  const [graphState, setGraphState] = useState({
    mounted: false,
    initialized: false,
    renderingFailed: false,
    initAttempted: false,
    showDebug: false,
    highlightedNodeId: externalHighlightedNodeId,
    searchResults: [] as string[], // 검색 결과에 해당하는 노드 ID 배열 추가
    nodeTransitionInProgress: false, // 노드 전환 중인지 추적
  });

  // 마운트 확인
  useEffect(() => {
    setGraphState((prev) => ({ ...prev, mounted: true }));
    return () => setGraphState((prev) => ({ ...prev, mounted: false }));
  }, []);

  // 상태 관리
  const [animationTime, setAnimationTime] = useState(0);

  // 애니메이션 타이머 처리
  useEffect(() => {
    if (!isBrowser) return;

    const timer = setInterval(() => {
      setAnimationTime((prev) => prev + 1);
    }, 50); // 50ms마다 업데이트하여 부드러운 애니메이션 효과

    return () => clearInterval(timer);
  }, []);

  // 외부 highlightedNodeId가 변경되면 상태 업데이트
  useEffect(() => {
    setGraphState((prev) => ({
      ...prev,
      highlightedNodeId: externalHighlightedNodeId,
    }));
  }, [externalHighlightedNodeId]);

  // 필터링된 데이터 계산 - 메모이제이션 강화
  const filteredData = useMemo(() => {
    let filteredNodes = [...data.nodes];

    // 영업 단계별 필터링
    if (filters.stageFilter !== 'all') {
      filteredNodes = filteredNodes.filter(
        (node) => node.stage === filters.stageFilter
      );
    }

    // 중요도별 필터링
    if (filters.importanceFilter > 0) {
      filteredNodes = filteredNodes.filter(
        (node) => (node.importance || 0) >= filters.importanceFilter
      );
    }

    // 핵심 소개자 필터링 - 핵심 소개자와 연결된 노드 모두 표시
    if (filters.showInfluencersOnly) {
      // 모든 영향력 있는 사용자 노드와 그들과 직접 연결된 노드들을 식별합니다
      const influencersAndConnections = new Set<string>();

      // 우선 모든 영향력 있는 사용자(influencer) 식별
      const influencers = data.nodes.filter(
        (node) => node.group === 'influencer'
      );
      influencers.forEach((influencer) =>
        influencersAndConnections.add(influencer.id)
      );

      // 각 영향력 있는 사용자와 직접 연결된 모든 노드를 추가
      data.links.forEach((link) => {
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

    // 검색어 필터링
    if (searchQuery && searchQuery.trim()) {
      const normalizedQuery = searchQuery.trim().toLowerCase();

      // 검색어와 일치하는 노드 찾기 - 모든 노드 중에서 찾기 (필터링된 노드가 아닌)
      const searchMatchNodes = data.nodes.filter((node) =>
        node.name.toLowerCase().includes(normalizedQuery)
      );

      // 검색어와 일치하는 노드들의 ID 배열
      const searchMatchNodeIds = searchMatchNodes.map((node) => node.id);

      // 중요: 이제 필터링하지 않고 전체 노드를 표시하면서 검색 결과만 하이라이트
      // filteredNodes = searchMatchNodes; <- 이 코드 제거

      // 첫 번째 노드를 메인 하이라이트로, 전체 검색 결과를 searchResults에 저장
      if (searchMatchNodes.length > 0) {
        setGraphState((prev) => ({
          ...prev,
          highlightedNodeId: searchMatchNodes[0].id,
          searchResults: searchMatchNodeIds,
        }));
      }
    } else {
      // 검색어가 없을 때 상태 초기화 (외부 상태 유지)
      if (!externalHighlightedNodeId) {
        setGraphState((prev) => ({
          ...prev,
          highlightedNodeId: null,
          searchResults: [],
        }));
      }
    }

    // 소개 깊이 필터링
    if (filters.depthFilter !== 'all') {
      const directConnectionIds = new Set<string>();
      const indirectConnectionIds = new Set<string>();

      // 직접 연결된 노드 (1촌) 찾기
      data.links.forEach((link) => {
        const sourceId =
          typeof link.source === 'string' ? link.source : link.source.id;
        const targetId =
          typeof link.target === 'string' ? link.target : link.target.id;

        directConnectionIds.add(sourceId);
        directConnectionIds.add(targetId);
      });

      // 간접 연결된 노드 (2촌) 찾기
      if (filters.depthFilter === 'indirect') {
        directConnectionIds.forEach((nodeId) => {
          data.links.forEach((link) => {
            const sourceId =
              typeof link.source === 'string' ? link.source : link.source.id;
            const targetId =
              typeof link.target === 'string' ? link.target : link.target.id;

            if (sourceId === nodeId) {
              indirectConnectionIds.add(targetId);
            } else if (targetId === nodeId) {
              indirectConnectionIds.add(sourceId);
            }
          });
        });
      }

      // 필터 적용
      if (filters.depthFilter === 'direct') {
        filteredNodes = filteredNodes.filter((node) =>
          directConnectionIds.has(node.id)
        );
      } else if (filters.depthFilter === 'indirect') {
        filteredNodes = filteredNodes.filter(
          (node) =>
            directConnectionIds.has(node.id) ||
            indirectConnectionIds.has(node.id)
        );
      }
    }

    // 필터링된 노드ID 목록
    const filteredNodeIds = new Set(filteredNodes.map((node) => node.id));

    // 링크 필터링 (양쪽 노드가 모두 필터링된 결과에 있는 경우만 포함)
    const filteredLinks = data.links.filter((link) => {
      const sourceId =
        typeof link.source === 'string'
          ? link.source
          : (link.source as NetworkNode).id;

      const targetId =
        typeof link.target === 'string'
          ? link.target
          : (link.target as NetworkNode).id;

      return filteredNodeIds.has(sourceId) && filteredNodeIds.has(targetId);
    });

    return {
      nodes: filteredNodes,
      links: filteredLinks,
    };
  }, [data, filters, searchQuery]); // externalHighlightedNodeId 제거

  // 초기 그래프 데이터 캐시 - 전체 데이터로 한 번만 초기화
  const initialGraphData = useMemo(() => {
    return {
      nodes: [...data.nodes], // 전체 노드
      links: [...data.links], // 전체 링크
    };
  }, [data]);

  // 그래프 초기화 - 한 번만 실행되도록 최적화
  useEffect(() => {
    if (!graphState.mounted || !isBrowser || !graphComponent) return;
    if (graphState.initialized) return;

    // 초기화 상태 업데이트
    setGraphState((prev) => ({ ...prev, initAttempted: true }));

    // 실패 감지를 위한 타이머 (시간 단축)
    const failureTimer = setTimeout(() => {
      if (!graphState.initialized) {
        console.error('그래프 초기화 실패: 시간 초과');
        setGraphState((prev) => ({ ...prev, renderingFailed: true }));
      }
    }, 8000); // 8초로 단축

    // 안정적인 그래프 초기화 함수
    const initializeGraph = () => {
      if (!graphRef.current || graphState.initialized) return;

      try {
        // 전체 데이터로 초기화 - 필터링 데이터가 아닌
        const nodeCount = initialGraphData.nodes.length;
        // 노드 수에 따라 더 넓은 반경으로 계산 (크게 증가)
        const baseRadius = Math.max(1200, Math.sqrt(nodeCount) * 250);

        // 소개자(influencer) 노드와 일반 노드 분리
        const influencers = initialGraphData.nodes.filter(
          (n) => n.group === 'influencer'
        );
        const clients = initialGraphData.nodes.filter(
          (n) => n.group !== 'influencer'
        );

        // 노드를 더 넓게 분산 배치하기 위한 고급 레이아웃 알고리즘
        const nodePositions = new Map();

        // 소개자 노드를 중심 근처에 원형으로 배치 (더 넓게)
        if (influencers.length > 0) {
          influencers.forEach((node, idx) => {
            const angle = (idx / Math.max(1, influencers.length)) * 2 * Math.PI;
            // 소개자는 중심에서 적절한 거리에 배치 (반경 대폭 증가)
            const radius = baseRadius * 0.3;
            nodePositions.set(node.id, {
              x: Math.cos(angle) * radius,
              y: Math.sin(angle) * radius,
            });
          });
        }

        // 일반 노드는 소개자를 둘러싸도록 배치 (훨씬 더 넓게 분산)
        clients.forEach((node, idx) => {
          // 중요도에 따라 다른 층에 배치
          const importance = node.importance || 1;
          // 중요도가 높을수록 중심에 가깝게, 낮을수록 바깥쪽에 배치
          const radiusFactor = 1 - ((importance - 1) / 5) * 0.1;

          // 넓게 분산된 시작 위치 계산 (Fermat's spiral 사용으로 더 균등하게 분포)
          const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // 황금각 약 137.5도
          const spiralFactor = Math.sqrt(idx + 1); // 나선형 분산
          const angle = idx * goldenAngle;
          const radius = baseRadius * radiusFactor * (0.5 + spiralFactor * 0.1);

          // 더 큰 지터로 자연스러운 분포 (겹침 방지)
          const jitter = baseRadius * 0.3;
          const jitterX = (Math.random() - 0.5) * jitter;
          const jitterY = (Math.random() - 0.5) * jitter;

          nodePositions.set(node.id, {
            x: Math.cos(angle) * radius + jitterX,
            y: Math.sin(angle) * radius + jitterY,
          });
        });

        // 동일한 단계(stage)의 노드들은 서로 가까이 배치하도록 조정 (약하게)
        const stageGroups = new Map();
        initialGraphData.nodes.forEach((node) => {
          if (node.stage && node.group !== 'influencer') {
            if (!stageGroups.has(node.stage)) {
              stageGroups.set(node.stage, []);
            }
            stageGroups.get(node.stage).push(node.id);
          }
        });

        // 같은 단계끼리 위치 일부 조정 (매우 약하게 - 자연스러운 분산 유지)
        stageGroups.forEach((nodeIds, stage) => {
          if (nodeIds.length <= 1) return;

          // 같은 단계 노드들의 평균 위치 계산
          const positions = nodeIds
            .map((id: string) => nodePositions.get(id))
            .filter((p: unknown): p is { x: number; y: number } => !!p);

          if (positions.length === 0) return;

          const avgX =
            positions.reduce(
              (sum: number, pos: { x: number; y: number }) => sum + pos.x,
              0
            ) / positions.length;
          const avgY =
            positions.reduce(
              (sum: number, pos: { x: number; y: number }) => sum + pos.y,
              0
            ) / positions.length;

          // 같은 단계 노드들을 평균 위치 쪽으로 매우 약하게 당김 (그룹화 강도 최소화)
          positions.forEach((pos: { x: number; y: number }, idx: number) => {
            const nodeId = nodeIds[idx];
            const weight = 0.05; // 그룹화 강도 최소화 (넓은 분산 우선)
            pos.x = pos.x * (1 - weight) + avgX * weight;
            pos.y = pos.y * (1 - weight) + avgY * weight;
            nodePositions.set(nodeId, pos);
          });
        });

        // 최종 노드 위치 적용
        initialGraphData.nodes.forEach((node) => {
          const pos = nodePositions.get(node.id);
          if (pos) {
            node.x = pos.x;
            node.y = pos.y;
          }
        });

        // 노드 충돌 방지를 위한 개선된 처리 (더 효과적인 알고리즘)
        for (let iter = 0; iter < 25; iter++) {
          const moved = new Set();
          let hasMovement = false;

          // 모든 노드 쌍을 확인하여 겹침 방지
          for (let i = 0; i < initialGraphData.nodes.length; i++) {
            const nodeA = initialGraphData.nodes[i];
            const posA = nodePositions.get(nodeA.id);
            if (!posA) continue;

            for (let j = i + 1; j < initialGraphData.nodes.length; j++) {
              const nodeB = initialGraphData.nodes[j];
              const posB = nodePositions.get(nodeB.id);
              if (!posB) continue;

              // 두 노드 간 거리 계산
              const dx = posB.x - posA.x;
              const dy = posB.y - posA.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              // 노드 크기 기반 최소 거리 (중요도 고려) - 충분한 여백
              const sizeA =
                ((nodeA.group === 'influencer' ? 70 : 55) *
                  (nodeA.importance || 1)) /
                2;
              const sizeB =
                ((nodeB.group === 'influencer' ? 70 : 55) *
                  (nodeB.importance || 1)) /
                2;
              const minDistance = sizeA + sizeB + 30; // 추가 여백

              // 너무 가까우면 서로 밀어내기 (더 강한 밀어내기)
              if (distance < minDistance && distance > 0) {
                const moveFactor = ((minDistance - distance) / distance) * 1.0; // 밀어내기 강도 증가
                const moveX = dx * moveFactor;
                const moveY = dy * moveFactor;

                // 이미 이동된 노드는 덜 이동
                if (!moved.has(nodeA.id)) {
                  posA.x -= moveX / 2;
                  posA.y -= moveY / 2;
                  moved.add(nodeA.id);
                  hasMovement = true;
                }

                if (!moved.has(nodeB.id)) {
                  posB.x += moveX / 2;
                  posB.y += moveY / 2;
                  moved.add(nodeB.id);
                  hasMovement = true;
                }
              }
            }
          }

          // 충돌 조정 후 노드 위치 업데이트
          initialGraphData.nodes.forEach((node) => {
            const pos = nodePositions.get(node.id);
            if (pos) {
              node.x = pos.x;
              node.y = pos.y;
            }
          });

          // 더 이상 움직임이 없으면 조기 종료
          if (!hasMovement) break;
        }

        // 포스 레이아웃 최적화 설정 (더 넓게 펼쳐지도록)
        if (typeof graphRef.current.d3Force === 'function') {
          // 반발력 대폭 증가 - 노드들이 서로 멀어지도록
          const chargeForce = graphRef.current.d3Force('charge');
          if (chargeForce && typeof chargeForce.strength === 'function') {
            chargeForce.strength(-400); // 반발력 대폭 증가
          }

          // 링크 설정 - 더 긴 거리와 약한 강도로 느슨하게 연결
          const linkForce = graphRef.current.d3Force('link');
          if (linkForce) {
            if (typeof linkForce.distance === 'function') {
              // 동적 링크 거리 - 노드 수에 따라 조정
              const linkDistance = Math.min(300, 150 + nodeCount * 2);
              linkForce.distance(linkDistance);
            }
            if (typeof linkForce.strength === 'function') {
              linkForce.strength(0.05); // 연결 강도 최소화
            }
          }

          // 중앙 정렬력 거의 제거
          const centerForce = graphRef.current.d3Force('center');
          if (centerForce && typeof centerForce.strength === 'function') {
            centerForce.strength(0.005); // 중앙 당김 거의 제거
          }

          // X-Y 포지셔닝 거의 제거 (자연스러운 분산 우선)
          if (typeof graphRef.current.d3Force === 'function') {
            // X축 힘 최소화
            const forceX = d3.forceX();
            forceX.strength(0.005);
            graphRef.current.d3Force('x', forceX);

            // Y축 힘 최소화
            const forceY = d3.forceY();
            forceY.strength(0.005);
            graphRef.current.d3Force('y', forceY);

            // 충돌 방지 힘 최대화 (겹침 완전 방지)
            const forceCollide = d3
              .forceCollide()
              .radius((node: any) => {
                // 충돌 반경 대폭 증가 (여백 충분히 확보)
                const size = node.group === 'influencer' ? 70 : 55;
                return (size * (node.importance || 1)) / 2 + 15; // 추가 여백
              })
              .strength(1.0); // 충돌 방지 최대화
            graphRef.current.d3Force('collide', forceCollide);
          }
        }

        // 향상된 시뮬레이션 설정으로 노드 배치 최적화
        if (typeof graphRef.current.d3ReheatSimulation === 'function') {
          // 프리 워밍: 오프스크린에서 초기 시뮬레이션 실행 (충분한 반복으로 안정화)
          if (
            graphRef.current._simulation &&
            typeof graphRef.current._simulation.tick === 'function'
          ) {
            // 수동으로 시뮬레이션 틱 여러 번 진행 (충분한 반복으로 안정화)
            try {
              for (let i = 0; i < 200; i++) {
                // 반복 횟수 증가
                graphRef.current._simulation.tick();
              }
            } catch (e) {
              // 필터 변경 시 수동 틱 진행 실패 (오류 무시)
            }
          }

          // 알파 목표 즉시 0으로 설정하여 추가 시뮬레이션 최소화
          if (
            graphRef.current._simulation &&
            typeof graphRef.current._simulation.alphaTarget === 'function'
          ) {
            graphRef.current._simulation.alphaTarget(0).alphaDecay(0.2); // 빠른 안정화
          }

          // 화면 정렬 - 단 한 번, 부드럽게
          setTimeout(() => {
            if (
              graphRef.current &&
              typeof graphRef.current.zoomToFit === 'function'
            ) {
              // 한 번에 전체 그래프가 보이도록 조정 (더 넓은 여백)
              graphRef.current.zoomToFit(1500, 120); // 더 긴 전환 시간, 더 넓은 여백

              // 초기화 완료 표시
              setGraphState((prev) => ({ ...prev, initialized: true }));
            }
          }, 200);
        }
      } catch (err) {
        console.error('그래프 초기화 오류:', err);
        setGraphState((prev) => ({ ...prev, renderingFailed: true }));
      }
    };

    // 즉시 초기화 실행 (지연 없이)
    initializeGraph();

    return () => {
      clearTimeout(failureTimer);
    };
  }, [
    graphRef,
    graphState.mounted,
    graphState.initialized,
    initialGraphData, // 전체 데이터 의존성
    graphComponent,
  ]);

  // 필터링 기반 노드 가시성 관리 - 그래프 재로드 없이 처리
  useEffect(() => {
    if (!graphState.mounted || !graphRef.current || !graphState.initialized)
      return;

    try {
      // 필터링된 노드 ID 셋
      const filteredNodeIds = new Set(filteredData.nodes.map((n) => n.id));

      // 현재 그래프 데이터 가져오기
      const currentGraphData = safeGraphData();

      if (currentGraphData && currentGraphData.nodes) {
        // 모든 노드의 가시성 업데이트 (재로드 없이)
        currentGraphData.nodes.forEach((node: any) => {
          // 필터링 결과에 따라 노드 투명도 조정
          const isVisible = filteredNodeIds.has(node.id);
          node._filtered = !isVisible; // 필터링 마커 추가
        });

        // 링크 가시성도 업데이트
        const filteredLinkSet = new Set(
          filteredData.links.map((link) => {
            const sourceId =
              typeof link.source === 'string' ? link.source : link.source.id;
            const targetId =
              typeof link.target === 'string' ? link.target : link.target.id;
            return `${sourceId}-${targetId}`;
          })
        );

        if (currentGraphData.links) {
          currentGraphData.links.forEach((link: any) => {
            const sourceId =
              typeof link.source === 'object' ? link.source.id : link.source;
            const targetId =
              typeof link.target === 'object' ? link.target.id : link.target;
            const linkKey = `${sourceId}-${targetId}`;
            link._filtered = !filteredLinkSet.has(linkKey);
          });
        }

        // 부드러운 전환을 위해 그래프 다시 그리기 (데이터 변경 없이)
        if (typeof graphRef.current.refresh === 'function') {
          graphRef.current.refresh();
        }
      }
    } catch (err) {
      console.error('필터링 업데이트 오류:', err);
    }
  }, [filteredData, graphState.initialized, graphState.mounted]);

  // 그래프 설정 변경 시 효과 (필터 변경 등) - 간소화하여 재로드 방지
  useEffect(() => {
    if (!graphState.mounted || !graphRef.current) return;

    // 하이라이트나 검색 결과가 변경되었을 때만 부드러운 카메라 이동 처리
    if (graphState.highlightedNodeId && graphState.initialized) {
      try {
        // 하이라이트된 노드 찾기
        const currentGraphData = safeGraphData();
        if (!currentGraphData || !currentGraphData.nodes) return;

        const targetNode = currentGraphData.nodes.find(
          (node: any) => node.id === graphState.highlightedNodeId
        );
        if (!targetNode) return;

        // 연결된 노드들 찾기
        const connectedNodes: any[] = [];
        if (currentGraphData.links) {
          currentGraphData.links.forEach((link: any) => {
            const sourceId =
              typeof link.source === 'object' ? link.source.id : link.source;
            const targetId =
              typeof link.target === 'object' ? link.target.id : link.target;

            if (sourceId === graphState.highlightedNodeId) {
              const connectedNode = currentGraphData.nodes.find(
                (n: any) => n.id === targetId
              );
              if (connectedNode) connectedNodes.push(connectedNode);
            } else if (targetId === graphState.highlightedNodeId) {
              const connectedNode = currentGraphData.nodes.find(
                (n: any) => n.id === sourceId
              );
              if (connectedNode) connectedNodes.push(connectedNode);
            }
          });
        }

        // 타겟 노드와 연결된 노드들의 바운딩 박스 계산
        const allRelevantNodes = [targetNode, ...connectedNodes];
        const validNodes = allRelevantNodes.filter(
          (node) =>
            node && typeof node.x === 'number' && typeof node.y === 'number'
        );

        if (validNodes.length === 0) return;

        // 바운딩 박스 계산
        let minX = Infinity,
          maxX = -Infinity,
          minY = Infinity,
          maxY = -Infinity;
        validNodes.forEach((node: any) => {
          minX = Math.min(minX, node.x);
          maxX = Math.max(maxX, node.x);
          minY = Math.min(minY, node.y);
          maxY = Math.max(maxY, node.y);
        });

        // 바운딩 박스의 중심점 계산
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        // 줌 없이 중심점으로만 부드럽게 이동
        if (typeof graphRef.current.centerAt === 'function') {
          graphRef.current.centerAt(centerX, centerY, 1000);
        }
      } catch (err) {
        console.error('하이라이트 이동 오류:', err);
      }
    }
  }, [
    graphState.highlightedNodeId,
    graphState.initialized,
    graphState.mounted,
  ]);

  // 렌더링 실패 시 대체 UI 표시
  if (graphState.renderingFailed) {
    return <FallbackGraph data={filteredData} onNodeSelect={onNodeSelect} />;
  }

  // 마운트되지 않은 경우 또는 ForceGraph2D가 로드되지 않은 경우 로딩 표시
  if (!graphState.mounted || !graphComponent) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="mb-2">그래프 준비 중...</p>
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  // GraphComponent는 동적으로 로드된 ForceGraph2D를 나타냅니다
  const GraphComponent = graphComponent;

  // 안전하게 graphData 메서드를 호출하기 위한 헬퍼 함수 추가
  function safeGraphData() {
    if (graphRef.current && typeof graphRef.current.graphData === 'function') {
      return graphRef.current.graphData();
    }
    return { nodes: [], links: [] } as { nodes: any[]; links: any[] };
  }

  // 하이라이트된 노드와 연결된 노드인지 확인하는 특별 헬퍼 함수
  function isNodeConnectedToHighlight(nodeId: string): boolean {
    if (
      !graphState.highlightedNodeId ||
      nodeId === graphState.highlightedNodeId
    ) {
      return false;
    }

    // graphData를 직접 가져와서 연결 확인 (graphRef 의존성 제거)
    const links = filteredData.links;

    // filteredData에서 연결 여부 확인
    for (const link of links) {
      const sourceId =
        typeof link.source === 'object' ? link.source.id : link.source;
      const targetId =
        typeof link.target === 'object' ? link.target.id : link.target;

      // 하이라이트 노드와 현재 노드가 연결되어 있는지 확인
      if (
        (sourceId === graphState.highlightedNodeId && targetId === nodeId) ||
        (targetId === graphState.highlightedNodeId && sourceId === nodeId)
      ) {
        return true;
      }
    }

    return false;
  }

  // 노드가 검색 결과에 포함되는지 확인하는 헬퍼 함수
  function isNodeInSearchResults(nodeId: string): boolean {
    return graphState.searchResults.includes(nodeId);
  }

  return (
    <div className="h-full w-full relative flex items-center justify-center">
      {graphState.showDebug && (
        <DebugInfo
          data={data}
          filteredData={filteredData}
          layout="force" // 항상 force 레이아웃 사용
          graphRef={graphRef}
        />
      )}

      <GraphComponent
        ref={graphRef}
        graphData={initialGraphData} // 전체 데이터 사용 (필터링 데이터 대신)
        nodeId="id"
        nodeLabel="name"
        nodeAutoColorBy="group"
        nodeRelSize={8}
        nodeVal={(node: any) => {
          // 노드 크기를 중요도와 그룹에 따라 차별화
          const baseSize = (node.importance || 1) * 1.8;
          return node.group === 'influencer' ? baseSize * 1.4 : baseSize;
        }}
        // 배경 클릭 이벤트 핸들러 추가
        onBackgroundClick={() => {
          // 하이라이트 상태가 있을 때만 해제
          if (graphState.highlightedNodeId) {
            // 내부 하이라이트 상태 초기화
            setGraphState((prev) => ({
              ...prev,
              highlightedNodeId: null,
            }));

            // 그래프 전체가 보이도록 줌 아웃
            if (
              graphRef.current &&
              typeof graphRef.current.zoomToFit === 'function'
            ) {
              graphRef.current.zoomToFit(1000, 100);
            }
          }
        }}
        linkWidth={(link: any) => {
          // 연결선 굵기 강화: 하이라이트된 링크는 훨씬 더 두껍게
          const sourceNode =
            typeof link.source === 'object' ? link.source : null;
          const targetNode =
            typeof link.target === 'object' ? link.target : null;

          // 하이라이트된 노드와 연결된 링크인지 확인
          const isHighlighted =
            graphState.highlightedNodeId &&
            ((sourceNode && sourceNode.id === graphState.highlightedNodeId) ||
              (targetNode && targetNode.id === graphState.highlightedNodeId));

          // 일반 링크는 1.5, 하이라이트된 링크는 8로 굵기 대폭 증가
          return isHighlighted ? 8 : 1.5;
        }}
        linkColor={(link: any) => {
          // 연결선 색상 - 소개 방향에 따라 구분하여 표시
          const sourceNode =
            typeof link.source === 'object' ? link.source : null;
          const targetNode =
            typeof link.target === 'object' ? link.target : null;

          if (!sourceNode || !targetNode) return HIGHLIGHT_COLORS.NEUTRAL;

          const sourceId = sourceNode.id;
          const targetId = targetNode.id;

          // 하이라이트된 노드와 연결된 링크인지 확인
          const isHighlighted =
            graphState.highlightedNodeId &&
            (sourceId === graphState.highlightedNodeId ||
              targetId === graphState.highlightedNodeId);

          // 하이라이트된 노드의 연결선은 더 진한 색상으로 표시
          if (isHighlighted) {
            // 소개 방향에 따라 다른 색상 적용
            const isSourceHighlighted =
              sourceId === graphState.highlightedNodeId;

            // 하이라이트된 노드가 소스인 경우 (소개한 관계) - 진한 주황색
            if (isSourceHighlighted) {
              return HIGHLIGHT_COLORS.ORANGE; // 상수 사용
            }
            // 하이라이트된 노드가 타겟인 경우 (소개받은 관계) - 진한 파란색
            else {
              return HIGHLIGHT_COLORS.BLUE; // 상수 사용
            }
          }

          // 하이라이트된 노드가 있을 때는 비하이라이트 링크를 매우 흐리게
          if (graphState.highlightedNodeId) {
            return HIGHLIGHT_COLORS.NEUTRAL; // 중립 색상 사용
          }

          // 하이라이트된 노드가 없을 때는 기본적으로 회색 사용
          return HIGHLIGHT_COLORS.NEUTRAL;
        }}
        linkDirectionalArrowLength={12} // 화살표 길이 증가 (더 뚜렷하게)
        linkDirectionalArrowRelPos={0.8} // 화살표 위치 조정 (끝에 더 가깝게)
        linkDirectionalArrowColor={(link: any) => {
          // 모든 링크에 화살표 표시 (소개 관계를 명확히 하기 위해)
          const sourceNode =
            typeof link.source === 'object' ? link.source : null;
          const targetNode =
            typeof link.target === 'object' ? link.target : null;

          // 하이라이트된 노드와 연결된 링크인지 확인
          const isHighlighted =
            graphState.highlightedNodeId &&
            ((sourceNode && sourceNode.id === graphState.highlightedNodeId) ||
              (targetNode && targetNode.id === graphState.highlightedNodeId));

          // 하이라이트된 노드의 연결선은 특별한 색상으로 표시 - 항상 완전 불투명하게
          if (isHighlighted) {
            // 소개 방향에 따라 다른 색상 적용
            const isSourceHighlighted =
              sourceNode && sourceNode.id === graphState.highlightedNodeId;

            // 하이라이트된 노드가 소스인 경우 (소개한 관계) - 주황색
            if (isSourceHighlighted) {
              return HIGHLIGHT_COLORS.ORANGE; // 상수 사용
            }
            // 하이라이트된 노드가 타겟인 경우 (소개받은 관계) - 파란색
            else {
              return HIGHLIGHT_COLORS.BLUE; // 상수 사용
            }
          }

          // 하이라이트 되지 않은 일반 화살표도 색상 적용 (소개 관계를 모두 표시)
          // 소개자(influencer)가 소스인 링크는 선명한 주황색
          if (sourceNode && sourceNode.group === 'influencer') {
            return HIGHLIGHT_COLORS.ORANGE_LIGHT; // 약한 주황색
          }

          // 일반 화살표는 중립 색상
          return HIGHLIGHT_COLORS.ARROW_DEFAULT;
        }}
        linkCurvature={0} // 곡률 제거 - 직선으로 변경
        // 링크 대시 애니메이션 커스텀 렌더링 (모든 링크에 화살표 표시)
        linkCanvasObjectMode={() => 'after'} // 모든 링크에 커스텀 렌더링 적용
        linkCanvasObject={(link: any, ctx: any, globalScale: number) => {
          // 소스와 타겟 노드 가져오기
          const sourceNode =
            typeof link.source === 'object' ? link.source : null;
          const targetNode =
            typeof link.target === 'object' ? link.target : null;

          if (!sourceNode || !targetNode) return;

          const sourceId = sourceNode.id;
          const targetId = targetNode.id;

          // 하이라이트된 링크 확인 (더 명확한 로직)
          const isHighlighted = !!(
            graphState.highlightedNodeId &&
            (sourceId === graphState.highlightedNodeId ||
              targetId === graphState.highlightedNodeId)
          );

          // 링크 시작점과 끝점
          const start = { x: link.source.x, y: link.source.y };
          const end = { x: link.target.x, y: link.target.y };

          // 소개 방향에 따른 색상 설정 (모든 연결선 방향에 따라 색상 구분)
          let dashColor;
          if (isHighlighted) {
            // 하이라이트된 노드가 소스인지 확인
            const isSourceHighlighted =
              sourceNode && sourceNode.id === graphState.highlightedNodeId;
            // 하이라이트된 연결선 색상 - 항상 완전 불투명하게
            dashColor = isSourceHighlighted
              ? HIGHLIGHT_COLORS.ORANGE // 상수 사용
              : HIGHLIGHT_COLORS.BLUE; // 상수 사용
          } else {
            // 하이라이트되지 않은 링크도 방향에 따라 색상 구분
            // 소개자(influencer)가 소스인 경우 - 선명한 주황색
            if (sourceNode && sourceNode.group === 'influencer') {
              dashColor = HIGHLIGHT_COLORS.ORANGE_LIGHT; // 약한 주황색
            }
            // 소개자(influencer)가 타겟인 경우 - 약한 파란색
            else if (targetNode && targetNode.group === 'influencer') {
              dashColor = HIGHLIGHT_COLORS.BLUE_LIGHT;
            }
            // 일반 노드 간 연결 - 중요도 비교로 방향 추정
            else if (sourceNode && targetNode) {
              const sourceImportance = sourceNode.importance || 0;
              const targetImportance = targetNode.importance || 0;

              if (sourceImportance > targetImportance) {
                dashColor = HIGHLIGHT_COLORS.ORANGE_LIGHT; // 약한 주황색
              } else if (targetImportance > sourceImportance) {
                dashColor = HIGHLIGHT_COLORS.BLUE_LIGHT; // 약한 파란색
              } else {
                dashColor = HIGHLIGHT_COLORS.NEUTRAL; // 중립 색상
              }
            } else {
              dashColor = HIGHLIGHT_COLORS.NEUTRAL; // 기본 중립 색상
            }
          }

          // 하이라이트된 링크에는 눈에 띄는 애니메이션 효과 적용
          if (isHighlighted) {
            // 펄싱 효과 (더 부드러운 애니메이션)
            const primaryPulse = Math.sin(animationTime * 0.15) * 0.3 + 0.7; // 0~1 사이 펄싱 값 (더 부드럽게)
            const secondaryPulse =
              Math.sin(animationTime * 0.25 + 1) * 0.2 + 0.8; // 약간 다른 주기
            const combinedPulse = primaryPulse * 0.7 + secondaryPulse * 0.3; // 두 펄스 혼합

            // 소개 방향에 따라 색상 선택
            const isSourceHighlighted =
              sourceNode && sourceNode.id === graphState.highlightedNodeId;
            const baseGlowColor = isSourceHighlighted
              ? HIGHLIGHT_COLORS.ORANGE_GLOW
              : HIGHLIGHT_COLORS.BLUE_GLOW;
            const baseSolidColor = isSourceHighlighted
              ? HIGHLIGHT_COLORS.ORANGE
              : HIGHLIGHT_COLORS.BLUE;

            // 외부 발광 효과 (더 넓은 영역)
            ctx.beginPath();
            ctx.setLineDash([]); // 실선으로
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.lineWidth = (8 + 2 * combinedPulse) / globalScale; // 펄싱 크기 효과
            ctx.strokeStyle = baseGlowColor;
            ctx.stroke();

            // 방향을 나타내는 흐르는 화살표 효과 (더 부드럽게)
            ctx.beginPath();
            // 짧은 대시, 긴 간격으로 방향성 표현
            ctx.setLineDash([8, 8]);
            // 애니메이션 속도 조절 (더 부드럽게)
            ctx.lineDashOffset = (animationTime % 30) * -1.5;
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.strokeStyle = baseSolidColor;
            ctx.lineWidth = (4 + combinedPulse) / globalScale; // 펄싱에 따라 선 두께 변화
            ctx.stroke();

            // 화살표 방향 표시를 위한 중간 원 그리기 (펄스/글로우 효과 제거)
            const t = 0.7; // 선의 70% 지점에 방향 표시 (더 타겟에 가깝게)
            const midX = start.x + t * (end.x - start.x);
            const midY = start.y + t * (end.y - start.y);

            // 간소화된 방향 표시 원
            ctx.beginPath();
            ctx.arc(midX, midY, 5 / globalScale, 0, 2 * Math.PI);
            ctx.fillStyle = baseSolidColor;
            ctx.fill();

            // 방향 표현을 위한 추가 표시 (작은 원 추가)
            const t2 = 0.4; // 중간 지점에 추가 방향 표시
            const midX2 = start.x + t2 * (end.x - start.x);
            const midY2 = start.y + t2 * (end.y - start.y);

            ctx.beginPath();
            ctx.arc(midX2, midY2, 3 / globalScale, 0, 2 * Math.PI);
            ctx.fillStyle = baseSolidColor;
            ctx.fill();
          } else {
            // 하이라이트가 있는 경우와 없는 경우 구분
            if (graphState.highlightedNodeId) {
              // 하이라이트가 있는 상황에서 하이라이트되지 않은 링크는 매우 희미하게 표시
              // 투명도를 극히 낮게 설정하여 하이라이트된 링크가 더 강조되도록
              ctx.globalAlpha = 0.05;

              // 중간 지점 계산
              const t = 0.7; // 선의 70% 지점에 표시
              const midX = start.x + t * (end.x - start.x);
              const midY = start.y + t * (end.y - start.y);

              // 작은 원 그리기 (방향 표시)
              ctx.beginPath();
              ctx.arc(midX, midY, 1.5 / globalScale, 0, 2 * Math.PI);
              ctx.fillStyle = HIGHLIGHT_COLORS.NEUTRAL;
              ctx.fill();

              // 그림자 비활성화
              ctx.shadowColor = 'transparent';
              ctx.shadowBlur = 0;

              // 투명도 원래대로 복구
              ctx.globalAlpha = 1;
            } else {
              // 하이라이트가 없는 상황에서는 보통 강도로 표시
              // 중간 지점 계산
              const t = 0.7; // 선의 70% 지점에 표시
              const midX = start.x + t * (end.x - start.x);
              const midY = start.y + t * (end.y - start.y);

              // 작은 원 그리기 (방향 표시)
              ctx.beginPath();
              ctx.arc(midX, midY, 3 / globalScale, 0, 2 * Math.PI);
              ctx.fillStyle = dashColor;
              ctx.fill();
            }
          }

          // 대시 설정 초기화
          ctx.setLineDash([]);
        }}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        enableNodeDrag={true}
        cooldownTime={3000}
        warmupTicks={60}
        onEngineStop={() => {
          // 엔진 정지 시 항상 초기화 완료로 표시
          if (!graphState.initialized) {
            setGraphState((prev) => ({ ...prev, initialized: true }));
          }
        }}
        onNodeClick={(node: any) => {
          // 이미 선택된 노드를 다시 클릭하면 무시
          if (graphState.highlightedNodeId === node.id) {
            onNodeSelect(node.id);
            return;
          }

          // 내부 하이라이트 상태 업데이트
          setGraphState((prev) => ({
            ...prev,
            highlightedNodeId: node.id,
            nodeTransitionInProgress: true,
          }));

          // 노드 및 연결된 노드들을 화면에 적절하게 표시하는 개선된 함수
          if (graphRef.current) {
            try {
              // 연결된 노드들 찾기
              const connectedNodes: any[] = [];
              const graphData = safeGraphData();

              if (graphData && graphData.links) {
                // 현재 하이라이트 노드와 직접 연결된 노드들의 ID와 위치 수집
                graphData.links.forEach((link: any) => {
                  const sourceId =
                    typeof link.source === 'object'
                      ? link.source.id
                      : link.source;
                  const targetId =
                    typeof link.target === 'object'
                      ? link.target.id
                      : link.target;

                  if (sourceId === node.id) {
                    const targetNode = graphData.nodes.find(
                      (n: any) => n.id === targetId
                    );
                    if (targetNode) connectedNodes.push(targetNode);
                  } else if (targetId === node.id) {
                    const sourceNode = graphData.nodes.find(
                      (n: any) => n.id === sourceId
                    );
                    if (sourceNode) connectedNodes.push(sourceNode);
                  }
                });
              }

              // 개선된 두 단계 애니메이션 접근법
              const animateToNode = () => {
                if (!graphRef.current) {
                  setGraphState((prev) => ({
                    ...prev,
                    nodeTransitionInProgress: false,
                  }));
                  return;
                }

                try {
                  if (typeof graphRef.current.centerAt === 'function') {
                    // 노드 위치 확인
                    const targetX = node.x || 0;
                    const targetY = node.y || 0;

                    // 연결된 노드들의 위치 계산 (바운딩 박스 계산용)
                    const nodePositions = [{ x: targetX, y: targetY }];
                    connectedNodes.forEach((connNode) => {
                      if (
                        connNode.x !== undefined &&
                        connNode.y !== undefined
                      ) {
                        nodePositions.push({ x: connNode.x, y: connNode.y });
                      }
                    });

                    // 연결 노드들의 경계 계산
                    let minX = Infinity,
                      maxX = -Infinity,
                      minY = Infinity,
                      maxY = -Infinity;
                    nodePositions.forEach((pos) => {
                      minX = Math.min(minX, pos.x);
                      maxX = Math.max(maxX, pos.x);
                      minY = Math.min(minY, pos.y);
                      maxY = Math.max(maxY, pos.y);
                    });

                    // 바운딩 박스의 중심 계산
                    const centerX = (minX + maxX) / 2;
                    const centerY = (minY + maxY) / 2;

                    // 줌 없이 중심점으로만 이동
                    graphRef.current.centerAt(centerX, centerY, 1000, () => {
                      // 애니메이션 완료 후 상태 업데이트
                      setGraphState((prev) => ({
                        ...prev,
                        nodeTransitionInProgress: false,
                      }));
                    });
                  } else {
                    // 아무 기능도 없는 경우 상태 초기화
                    setGraphState((prev) => ({
                      ...prev,
                      nodeTransitionInProgress: false,
                    }));
                  }
                } catch (err) {
                  console.error('노드 중앙 이동 오류:', err);
                  setGraphState((prev) => ({
                    ...prev,
                    nodeTransitionInProgress: false,
                  }));
                }
              };

              // 짧은 지연 후 애니메이션 시작
              setTimeout(animateToNode, 50);
            } catch (err) {
              console.error('노드 중앙 이동 오류:', err);
              setGraphState((prev) => ({
                ...prev,
                nodeTransitionInProgress: false,
              }));
            }
          }

          // 노드 선택 콜백 호출
          onNodeSelect(node.id);
        }}
        onNodeDragEnd={() => {
          // 노드 드래그 후 간단한 타이머로 안정화
          setTimeout(() => {
            if (
              graphRef.current &&
              typeof graphRef.current.d3ReheatSimulation === 'function'
            ) {
              graphRef.current.d3ReheatSimulation();
            }
          }, 300);
        }}
        width={graphRef.current?.width || undefined}
        height={graphRef.current?.height || undefined}
        nodeCanvasObject={(node: any, ctx: any, globalScale: number) => {
          try {
            const label = node.name;
            // 폰트 설정 세련되게 변경
            const fontSize = 16 / globalScale;
            ctx.font = `600 ${fontSize}px 'Inter', 'Helvetica Neue', sans-serif`;

            // 필터링 상태 확인
            const isFiltered = node._filtered === true;

            // 하이라이트 관련 노드인지 확인
            const isHighlightNode = node.id === graphState.highlightedNodeId;
            const isSearchResultNode = isNodeInSearchResults(node.id);
            const isConnectedNode = isNodeConnectedToHighlight(node.id);

            // 하이라이트 관련 노드 여부 (주 하이라이트, 검색 결과, 연결된 노드)
            const isHighlightRelated =
              isHighlightNode || isConnectedNode || isSearchResultNode;

            // 노드 크기 (하이라이트 관련 노드는 더 크게)
            let nodeSize;
            if (isHighlightRelated) {
              nodeSize =
                node.group === 'influencer'
                  ? (node.importance || 1) * 8.5 // 소개자 더 크게 (강조)
                  : (node.importance || 1) * 6; // 일반 노드 크기 (강조)
            } else {
              // 하이라이트와 관련 없는 노드는 작게
              nodeSize =
                node.group === 'influencer'
                  ? (node.importance || 1) * 6
                  : (node.importance || 1) * 3.5;
            }

            // 그룹/단계별 색상
            let baseColor = node.group === 'influencer' ? '#ff9500' : '#666666';
            if (node.group !== 'influencer') {
              if (node.stage === '첫 상담') baseColor = '#3498db';
              if (node.stage === '니즈 분석') baseColor = '#2ecc71';
              if (node.stage === '상품 설명') baseColor = '#f39c12';
              if (node.stage === '계약 검토') baseColor = '#e74c3c';
              if (node.stage === '계약 완료') baseColor = '#9b59b6';
            }

            // 투명도 설정 - 필터링된 노드와 하이라이트 관련 상태 모두 고려
            if (isFiltered) {
              // 필터링된 노드는 매우 투명하게
              ctx.globalAlpha = 0.15;
            } else if (
              graphState.highlightedNodeId ||
              graphState.searchResults.length > 0
            ) {
              // 하이라이트 관련 노드는 완전 불투명하게
              if (isHighlightRelated) {
                ctx.globalAlpha = 1.0;
              } else {
                // 관련 없는 노드는 흐리게
                ctx.globalAlpha = 0.35;
              }
            } else {
              // 하이라이트가 없을 때는 모든 노드 불투명
              ctx.globalAlpha = 1.0;
            }

            // 외부 발광 효과 (하이라이트 관련 노드만, 필터링되지 않은 경우에만)
            if (
              !isFiltered &&
              (isHighlightRelated ||
                (!graphState.highlightedNodeId &&
                  graphState.searchResults.length === 0))
            ) {
              ctx.beginPath();
              ctx.arc(node.x, node.y, nodeSize + 4, 0, 2 * Math.PI);
              ctx.fillStyle = `${baseColor}33`; // 약한 투명도
              ctx.fill();
            }

            // 노드 본체 그리기
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);

            // 하이라이트된 주요 노드 (첫 번째 검색 결과) - 필터링되지 않은 경우에만
            if (isHighlightNode && !isFiltered) {
              // 펄싱 효과 개선 - 좀 더 눈에 띄게 하되 은은하게
              const pulseFactor = Math.sin(animationTime * 0.12) * 0.35 + 0.75; // 펄스 강도 증가
              const secondaryPulse =
                Math.sin(animationTime * 0.18 + 1) * 0.25 + 0.8; // 보조 펄스 강화
              const combinedPulse = pulseFactor * 0.6 + secondaryPulse * 0.4;

              // 외부 글로우 링 (다층 구조로 더 뚜렷하게)
              // 첫 번째 글로우 링 - 가장 큰 범위
              ctx.beginPath();
              ctx.arc(
                node.x,
                node.y,
                nodeSize * (1.8 + 0.15 * combinedPulse),
                0,
                2 * Math.PI
              );
              ctx.fillStyle = `rgba(255, 120, 70, ${0.08 * combinedPulse})`;
              ctx.fill();

              // 두 번째 글로우 링 - 중간 범위
              ctx.beginPath();
              ctx.arc(
                node.x,
                node.y,
                nodeSize * (1.4 + 0.12 * combinedPulse),
                0,
                2 * Math.PI
              );
              ctx.fillStyle = `rgba(255, 140, 70, ${0.15 * combinedPulse})`;
              ctx.fill();

              // 세 번째 글로우 링 - 가장 가까운 범위
              ctx.beginPath();
              ctx.arc(
                node.x,
                node.y,
                nodeSize * (1.15 + 0.08 * combinedPulse),
                0,
                2 * Math.PI
              );
              ctx.fillStyle = `rgba(255, 160, 80, ${0.25 * combinedPulse})`;
              ctx.fill();

              // 메인 노드 테두리 효과 강화
              ctx.beginPath();
              ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);

              // 외부 빛나는 효과 강화
              ctx.shadowColor = `rgba(255, 120, 70, ${
                0.6 + 0.15 * combinedPulse
              })`;
              ctx.shadowBlur = 15 + 5 * combinedPulse;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;

              // 메인 테두리 효과 - 더 뚜렷하게
              ctx.strokeStyle = `rgba(255, 140, 70, ${
                0.8 + 0.15 * combinedPulse
              })`;
              ctx.lineWidth = (2.5 + 0.8 * combinedPulse) / globalScale;
              ctx.stroke();

              // 내부 하이라이트 링
              ctx.beginPath();
              ctx.arc(node.x, node.y, nodeSize * 0.85, 0, 2 * Math.PI);
              ctx.strokeStyle = `rgba(255, 180, 100, ${
                0.4 + 0.2 * combinedPulse
              })`;
              ctx.lineWidth = (1.5 + 0.5 * combinedPulse) / globalScale;
              ctx.stroke();

              // 외부 대비 테두리 (흰색) - 좀 더 뚜렷하게
              ctx.beginPath();
              ctx.arc(
                node.x,
                node.y,
                nodeSize + (3 + 0.8 * combinedPulse) / globalScale,
                0,
                2 * Math.PI
              );
              ctx.strokeStyle = `rgba(255, 255, 255, ${
                0.7 + 0.15 * combinedPulse
              })`;
              ctx.lineWidth = (1.5 + 0.3 * combinedPulse) / globalScale;
              ctx.stroke();

              // 기본 색상 채우기
              ctx.fillStyle = baseColor;
              ctx.fill();
            }
            // 검색 결과 노드 (첫 번째 제외) - 필터링되지 않은 경우에만
            else if (isSearchResultNode && !isFiltered) {
              // 검색 결과 노드 효과 (주황색 테두리)
              ctx.shadowColor = 'rgba(255, 140, 0, 0.5)';
              ctx.shadowBlur = 8;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;

              // 테두리 효과
              ctx.strokeStyle = 'rgba(255, 140, 0, 0.8)';
              ctx.lineWidth = 2 / globalScale;
              ctx.stroke();

              // 기본 색상 채우기
              ctx.fillStyle = baseColor;
              ctx.fill();
            }
            // 연결된 노드 강조 효과 - 필터링되지 않은 경우에만
            else if (isConnectedNode && !isFiltered) {
              // 단순한 테두리만 추가
              ctx.strokeStyle = 'rgba(100, 150, 230, 0.8)';
              ctx.lineWidth = 2 / globalScale;
              ctx.stroke();

              // 기본 색상 채우기
              ctx.fillStyle = baseColor;
              ctx.fill();
            } else {
              // 일반 노드 스타일링
              // 기본 그림자 효과 - 필터링되지 않은 경우에만
              if (
                !isFiltered &&
                !graphState.highlightedNodeId &&
                graphState.searchResults.length === 0
              ) {
                ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                ctx.shadowBlur = 5;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
              }

              // 기본 색상 채우기
              ctx.fillStyle = baseColor;
              ctx.fill();
            }

            // 기본 그림자 효과 (하이라이트 관련 노드만, 필터링되지 않은 경우에만)
            if (
              !isFiltered &&
              (isHighlightRelated || !graphState.highlightedNodeId)
            ) {
              if (!isConnectedNode) {
                // 이미 그림자 효과가 있는 연결 노드는 제외
                ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                ctx.shadowBlur = 5;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
              }
            }

            // 일반 노드만 여기서 색상 채우기 (연결된 노드는 이미 위에서 채웠음)
            if (!isConnectedNode) {
              ctx.fillStyle = baseColor;
              ctx.fill();
            }

            // 그림자 비활성화
            ctx.shadowColor = 'transparent';

            // 노드 내부에 텍스트 그리기 - 더 깔끔하고 가독성 높게
            // 필터링된 노드의 텍스트는 표시하지 않거나 매우 흐리게
            if (!isFiltered || ctx.globalAlpha > 0.3) {
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = 'white';

              // 텍스트 크기 노드 크기에 비례하여 더 크게 조정
              // 최소 폰트 사이즈 증가 (작은 노드에서도 텍스트 잘 보이게)
              const baseFontSize = Math.max(16, nodeSize * 1.2);
              const textSize =
                Math.min(22, Math.max(14, baseFontSize)) / globalScale;
              ctx.font = `600 ${textSize}px 'Inter', 'Helvetica Neue', sans-serif`;

              // 최소한의 그림자만 적용 (가독성 위해) - 필터링된 경우 제외
              if (!isFiltered) {
                ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
                ctx.shadowBlur = 3;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
              }

              // 라벨 텍스트가 길면 줄이기 (길이 제한 증가)
              let displayLabel = label;
              if (label.length > 8) {
                displayLabel = label.substring(0, 6) + '..';
              }

              // 텍스트 노드 안에 깔끔하게 그리기 (테두리 없이)
              ctx.fillText(displayLabel, node.x, node.y);

              // 그림자 비활성화
              ctx.shadowColor = 'transparent';
              ctx.shadowBlur = 0;
            }
          } catch (err) {
            console.error('노드 렌더링 오류:', err);
          }
        }}
      />
    </div>
  );
}
