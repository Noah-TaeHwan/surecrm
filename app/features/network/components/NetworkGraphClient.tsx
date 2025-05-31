'use client';

import { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import * as d3 from 'd3';
import type {
  NetworkNode,
  NetworkLink,
  NetworkData,
  NetworkGraphProps,
} from '../types';

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

// 옵시디언 스타일 색상 시스템 (CSS 변수 기반으로 완전 교체)
const OBSIDIAN_COLORS = {
  // 노드 색상 시스템
  NODE: {
    DEFAULT: 'hsl(var(--accent))', // 기본 노드
    HIGHLIGHTED: 'hsl(var(--primary))', // 하이라이트된 노드
    CONNECTED: 'hsl(var(--secondary))', // 연결된 노드
    DIMMED: 'hsl(var(--muted))', // 비활성 노드
    STROKE: 'hsl(var(--border))', // 노드 테두리
    GLOW: 'hsl(var(--primary) / 0.3)', // 발광 효과
  },
  // 엣지 색상 시스템 (관계 방향성 표현)
  EDGE: {
    REFERRAL_OUT: 'hsl(var(--primary) / 0.8)', // 소개 방향 (나가는)
    REFERRAL_IN: 'hsl(var(--secondary) / 0.8)', // 소개 방향 (들어오는)
    BIDIRECTIONAL: 'hsl(var(--accent) / 0.7)', // 양방향
    DEFAULT: 'hsl(var(--muted-foreground) / 0.4)', // 기본
    HIGHLIGHTED: 'hsl(var(--primary))', // 하이라이트
    DIMMED: 'hsl(var(--muted-foreground) / 0.2)', // 비활성
  },
  // 애니메이션 및 효과
  ANIMATION: {
    PULSE_PRIMARY: 'hsl(var(--primary) / 0.6)',
    PULSE_SECONDARY: 'hsl(var(--secondary) / 0.6)',
    SEARCH_HIGHLIGHT: 'hsl(var(--destructive) / 0.8)',
    HOVER_GLOW: 'hsl(var(--accent) / 0.5)',
  },
};

// 옵시디언 스타일 시각화 설정
const OBSIDIAN_CONFIG = {
  // 노드 스타일링
  NODE: {
    DEFAULT_RADIUS: 8,
    HIGHLIGHT_RADIUS: 12,
    IMPORTANT_RADIUS: 14,
    MIN_RADIUS: 6,
    STROKE_WIDTH: 2,
    GLOW_RADIUS: 20,
  },
  // 엣지 스타일링
  EDGE: {
    DEFAULT_WIDTH: 1.5,
    HIGHLIGHT_WIDTH: 4,
    IMPORTANT_WIDTH: 6,
    ARROW_SIZE: 8,
    MIN_WIDTH: 0.5,
  },
  // 물리 시뮬레이션 (옵시디언 스타일)
  PHYSICS: {
    CHARGE_STRENGTH: -300, // 노드 간 반발력
    LINK_DISTANCE: 80, // 링크 기본 거리
    LINK_STRENGTH: 0.7, // 링크 강도
    VELOCITY_DECAY: 0.4, // 속도 감쇠
    ALPHA_DECAY: 0.0228, // 알파 감쇠
    COLLISION_RADIUS: 15, // 충돌 반경
  },
  // 애니메이션
  ANIMATION: {
    DURATION: 300,
    EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
    PULSE_CYCLE: 2000, // 펄스 주기 (ms)
    HOVER_DELAY: 100,
  },
  // 줌 및 팬
  ZOOM: {
    MIN: 0.1,
    MAX: 8,
    DURATION: 750,
    EASE: d3.easeCubicInOut,
  },
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

  // 옵시디언 스타일 필터링 및 검색 시스템
  const filteredData = useMemo(() => {
    let filteredNodes = [...data.nodes];
    let searchResults: string[] = [];
    let highlightedNode: string | null = null;

    // 🔍 검색어 처리 (옵시디언 스타일 - 최우선)
    if (searchQuery && searchQuery.trim()) {
      const normalizedQuery = searchQuery.trim().toLowerCase();

      // 정확한 매치 우선, 부분 매치 후순위
      const exactMatches = data.nodes.filter(
        (node) => node.name.toLowerCase() === normalizedQuery
      );
      const partialMatches = data.nodes.filter(
        (node) =>
          node.name.toLowerCase().includes(normalizedQuery) &&
          !exactMatches.includes(node)
      );

      const allMatches = [...exactMatches, ...partialMatches];
      searchResults = allMatches.map((node) => node.id);

      if (allMatches.length > 0) {
        highlightedNode = allMatches[0].id;

        // 검색 시에는 연결된 노드들도 함께 표시 (옵시디언 스타일)
        const connectedNodeIds = new Set<string>();
        allMatches.forEach((match) => connectedNodeIds.add(match.id));

        data.links.forEach((link) => {
          const sourceId =
            typeof link.source === 'string' ? link.source : link.source.id;
          const targetId =
            typeof link.target === 'string' ? link.target : link.target.id;

          if (searchResults.includes(sourceId)) {
            connectedNodeIds.add(targetId);
          }
          if (searchResults.includes(targetId)) {
            connectedNodeIds.add(sourceId);
          }
        });

        // 검색 결과와 연결된 노드들만 표시
        filteredNodes = data.nodes.filter((node) =>
          connectedNodeIds.has(node.id)
        );
      }
    }

    // 🎯 영업 단계 필터링 (옵시디언 클러스터 스타일)
    if (filters.stageFilter !== 'all') {
      filteredNodes = filteredNodes.filter(
        (node) => node.stage === filters.stageFilter
      );
    }

    // ⭐ 중요도 필터링 (옵시디언 노드 크기 기반)
    if (filters.importanceFilter > 0) {
      filteredNodes = filteredNodes.filter(
        (node) => (node.importance || 0) >= filters.importanceFilter
      );
    }

    // 🌟 핵심 소개자 필터링 (옵시디언 허브 노드 중심)
    if (filters.showInfluencersOnly) {
      const influencerNetwork = new Set<string>();

      // 영향력 노드 식별
      const influencers = data.nodes.filter(
        (node) => node.group === 'influencer'
      );
      influencers.forEach((inf) => influencerNetwork.add(inf.id));

      // 영향력 노드와 직접 연결된 모든 노드 포함
      data.links.forEach((link) => {
        const sourceId =
          typeof link.source === 'string' ? link.source : link.source.id;
        const targetId =
          typeof link.target === 'string' ? link.target : link.target.id;

        if (influencers.some((inf) => inf.id === sourceId)) {
          influencerNetwork.add(targetId);
        }
        if (influencers.some((inf) => inf.id === targetId)) {
          influencerNetwork.add(sourceId);
        }
      });

      filteredNodes = filteredNodes.filter((node) =>
        influencerNetwork.has(node.id)
      );
    }

    // 🔗 소개 깊이 필터링 (옵시디언 연결 레벨)
    if (filters.depthFilter !== 'all') {
      const connectionLevels = new Map<string, number>();

      // 1차 연결 (직접 연결)
      const directConnections = new Set<string>();
      data.links.forEach((link) => {
        const sourceId =
          typeof link.source === 'string' ? link.source : link.source.id;
        const targetId =
          typeof link.target === 'string' ? link.target : link.target.id;

        directConnections.add(sourceId);
        directConnections.add(targetId);
        connectionLevels.set(
          sourceId,
          Math.min(connectionLevels.get(sourceId) || Infinity, 1)
        );
        connectionLevels.set(
          targetId,
          Math.min(connectionLevels.get(targetId) || Infinity, 1)
        );
      });

      // 2차 연결 (간접 연결)
      if (filters.depthFilter === 'indirect') {
        const indirectConnections = new Set<string>();

        directConnections.forEach((nodeId) => {
          data.links.forEach((link) => {
            const sourceId =
              typeof link.source === 'string' ? link.source : link.source.id;
            const targetId =
              typeof link.target === 'string' ? link.target : link.target.id;

            if (sourceId === nodeId && !directConnections.has(targetId)) {
              indirectConnections.add(targetId);
              connectionLevels.set(
                targetId,
                Math.min(connectionLevels.get(targetId) || Infinity, 2)
              );
            }
            if (targetId === nodeId && !directConnections.has(sourceId)) {
              indirectConnections.add(sourceId);
              connectionLevels.set(
                sourceId,
                Math.min(connectionLevels.get(sourceId) || Infinity, 2)
              );
            }
          });
        });
      }

      // 필터 적용
      if (filters.depthFilter === 'direct') {
        filteredNodes = filteredNodes.filter((node) =>
          directConnections.has(node.id)
        );
      } else if (filters.depthFilter === 'indirect') {
        filteredNodes = filteredNodes.filter(
          (node) =>
            directConnections.has(node.id) ||
            connectionLevels.get(node.id) === 2
        );
      }
    }

    // 📊 필터링된 노드 기반 링크 계산
    const filteredNodeIds = new Set(filteredNodes.map((node) => node.id));
    const filteredLinks = data.links.filter((link) => {
      const sourceId =
        typeof link.source === 'string' ? link.source : link.source.id;
      const targetId =
        typeof link.target === 'string' ? link.target : link.target.id;
      return filteredNodeIds.has(sourceId) && filteredNodeIds.has(targetId);
    });

    // 🎯 상태 업데이트 (옵시디언 스타일)
    if (searchQuery && searchQuery.trim()) {
      setGraphState((prev) => ({
        ...prev,
        highlightedNodeId: highlightedNode,
        searchResults: searchResults,
      }));
    } else if (!externalHighlightedNodeId) {
      setGraphState((prev) => ({
        ...prev,
        highlightedNodeId: null,
        searchResults: [],
      }));
    }

    return {
      nodes: filteredNodes,
      links: filteredLinks,
      metadata: {
        totalNodes: data.nodes.length,
        filteredNodes: filteredNodes.length,
        searchResults: searchResults.length,
        highlightedNode,
      },
    };
  }, [data, filters, searchQuery, externalHighlightedNodeId]);

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
        // 옵시디언 스타일 초기 레이아웃 계산
        const nodeCount = initialGraphData.nodes.length;
        const baseRadius = Math.max(
          800,
          Math.sqrt(nodeCount) * OBSIDIAN_CONFIG.PHYSICS.LINK_DISTANCE
        );

        // 영향력 기반 계층 구조 (옵시디언 스타일)
        const influencers = initialGraphData.nodes.filter(
          (n) => n.group === 'influencer'
        );
        const clients = initialGraphData.nodes.filter(
          (n) => n.group !== 'influencer'
        );

        const nodePositions = new Map();

        // 중심 영향력 노드들을 황금비 기반 위치에 배치
        if (influencers.length > 0) {
          const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // 137.5도
          influencers.forEach((node, idx) => {
            const angle = idx * goldenAngle;
            const radius = baseRadius * 0.2 * Math.sqrt(idx + 1);
            nodePositions.set(node.id, {
              x: Math.cos(angle) * radius,
              y: Math.sin(angle) * radius,
            });
          });
        }

        // 클라이언트 노드들을 자연스러운 나선형으로 배치 (옵시디언 스타일)
        clients.forEach((node, idx) => {
          const importance = node.importance || 1;
          const radiusFactor = 0.6 + (importance / 10) * 0.4; // 중요도 기반 거리

          // 피보나치 나선을 사용한 자연스러운 분포
          const goldenAngle = Math.PI * (3 - Math.sqrt(5));
          const spiralRadius =
            baseRadius * radiusFactor * Math.sqrt(idx + 1) * 0.1;
          const angle = idx * goldenAngle;

          // 단계별 그룹화 (옵시디언 클러스터 스타일)
          let stageOffset = { x: 0, y: 0 };
          switch (node.stage) {
            case '첫 상담':
              stageOffset = { x: -100, y: -100 };
              break;
            case '니즈 분석':
              stageOffset = { x: 100, y: -100 };
              break;
            case '상품 설명':
              stageOffset = { x: 100, y: 100 };
              break;
            case '계약 검토':
              stageOffset = { x: -100, y: 100 };
              break;
            case '계약 완료':
              stageOffset = { x: 0, y: 0 };
              break;
          }

          nodePositions.set(node.id, {
            x:
              Math.cos(angle) * spiralRadius +
              stageOffset.x +
              (Math.random() - 0.5) * 50,
            y:
              Math.sin(angle) * spiralRadius +
              stageOffset.y +
              (Math.random() - 0.5) * 50,
          });
        });

        // 충돌 방지 알고리즘 (옵시디언 스타일)
        for (let iter = 0; iter < 15; iter++) {
          let hasMovement = false;

          for (let i = 0; i < initialGraphData.nodes.length; i++) {
            const nodeA = initialGraphData.nodes[i];
            const posA = nodePositions.get(nodeA.id);
            if (!posA) continue;

            for (let j = i + 1; j < initialGraphData.nodes.length; j++) {
              const nodeB = initialGraphData.nodes[j];
              const posB = nodePositions.get(nodeB.id);
              if (!posB) continue;

              const dx = posB.x - posA.x;
              const dy = posB.y - posA.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              // 옵시디언 스타일 최소 거리 계산
              const radiusA =
                OBSIDIAN_CONFIG.NODE.DEFAULT_RADIUS +
                (nodeA.importance || 1) * 2;
              const radiusB =
                OBSIDIAN_CONFIG.NODE.DEFAULT_RADIUS +
                (nodeB.importance || 1) * 2;
              const minDistance = radiusA + radiusB + 25;

              if (distance < minDistance && distance > 0) {
                const moveFactor = ((minDistance - distance) / distance) * 0.8;
                const moveX = dx * moveFactor;
                const moveY = dy * moveFactor;

                posA.x -= moveX / 2;
                posA.y -= moveY / 2;
                posB.x += moveX / 2;
                posB.y += moveY / 2;
                hasMovement = true;
              }
            }
          }

          if (!hasMovement) break;
        }

        // 노드 위치 적용
        initialGraphData.nodes.forEach((node) => {
          const pos = nodePositions.get(node.id);
          if (pos) {
            node.x = pos.x;
            node.y = pos.y;
          }
        });

        // 옵시디언 스타일 물리 시뮬레이션 설정
        if (typeof graphRef.current.d3Force === 'function') {
          // 노드 간 반발력 (옵시디언 설정)
          const chargeForce = graphRef.current.d3Force('charge');
          if (chargeForce && typeof chargeForce.strength === 'function') {
            chargeForce.strength(OBSIDIAN_CONFIG.PHYSICS.CHARGE_STRENGTH);
          }

          // 링크 힘 설정 (옵시디언 스타일)
          const linkForce = graphRef.current.d3Force('link');
          if (linkForce) {
            if (typeof linkForce.distance === 'function') {
              linkForce.distance(OBSIDIAN_CONFIG.PHYSICS.LINK_DISTANCE);
            }
            if (typeof linkForce.strength === 'function') {
              linkForce.strength(OBSIDIAN_CONFIG.PHYSICS.LINK_STRENGTH);
            }
          }

          // 중심 정렬력 (옵시디언 스타일 - 약하게)
          const centerForce = graphRef.current.d3Force('center');
          if (centerForce) {
            centerForce.strength(0.1);
          }

          // 충돌 감지 (옵시디언 스타일)
          if (typeof graphRef.current.d3Force === 'function') {
            const collisionForce = d3
              .forceCollide()
              .radius((d: any) => {
                const importance = d.importance || 1;
                return (
                  OBSIDIAN_CONFIG.PHYSICS.COLLISION_RADIUS + importance * 3
                );
              })
              .strength(0.8);

            graphRef.current.d3Force('collision', collisionForce);
          }

          // 시뮬레이션 속도 제어 (옵시디언 스타일)
          const simulation = graphRef.current.d3Force();
          if (simulation) {
            simulation
              .velocityDecay(OBSIDIAN_CONFIG.PHYSICS.VELOCITY_DECAY)
              .alphaDecay(OBSIDIAN_CONFIG.PHYSICS.ALPHA_DECAY);
          }
        }

        // 초기화 완료 표시
        setGraphState((prev) => ({
          ...prev,
          initialized: true,
          initAttempted: true,
        }));

        console.log('✅ 옵시디언 스타일 네트워크 그래프 초기화 완료');
      } catch (error) {
        console.error('❌ 그래프 초기화 오류:', error);
        setGraphState((prev) => ({
          ...prev,
          renderingFailed: true,
          initAttempted: true,
        }));
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

          if (!sourceNode || !targetNode) return OBSIDIAN_COLORS.EDGE.DEFAULT;

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
              return OBSIDIAN_COLORS.EDGE.REFERRAL_OUT; // 상수 사용
            }
            // 하이라이트된 노드가 타겟인 경우 (소개받은 관계) - 진한 파란색
            else {
              return OBSIDIAN_COLORS.EDGE.REFERRAL_IN; // 상수 사용
            }
          }

          // 하이라이트된 노드가 있을 때는 비하이라이트 링크를 매우 흐리게
          if (graphState.highlightedNodeId) {
            return OBSIDIAN_COLORS.EDGE.DIMMED; // 중립 색상 사용
          }

          // 하이라이트된 노드가 없을 때는 기본적으로 회색 사용
          return OBSIDIAN_COLORS.EDGE.DEFAULT;
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
              return OBSIDIAN_COLORS.EDGE.REFERRAL_OUT; // 상수 사용
            }
            // 하이라이트된 노드가 타겟인 경우 (소개받은 관계) - 파란색
            else {
              return OBSIDIAN_COLORS.EDGE.REFERRAL_IN; // 상수 사용
            }
          }

          // 하이라이트 되지 않은 일반 화살표도 색상 적용 (소개 관계를 모두 표시)
          // 소개자(influencer)가 소스인 링크는 선명한 주황색
          if (sourceNode && sourceNode.group === 'influencer') {
            return OBSIDIAN_COLORS.EDGE.REFERRAL_OUT; // 약한 주황색
          }

          // 일반 화살표는 중립 색상
          return OBSIDIAN_COLORS.EDGE.DEFAULT;
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
              ? OBSIDIAN_COLORS.EDGE.REFERRAL_OUT
              : OBSIDIAN_COLORS.EDGE.REFERRAL_IN; // 상수 사용
          } else {
            // 하이라이트되지 않은 링크도 방향에 따라 색상 구분
            // 소개자(influencer)가 소스인 경우 - 선명한 주황색
            if (sourceNode && sourceNode.group === 'influencer') {
              dashColor = OBSIDIAN_COLORS.EDGE.REFERRAL_OUT; // 약한 주황색
            }
            // 소개자(influencer)가 타겟인 경우 - 약한 파란색
            else if (targetNode && targetNode.group === 'influencer') {
              dashColor = OBSIDIAN_COLORS.EDGE.REFERRAL_IN;
            }
            // 일반 노드 간 연결 - 중요도 비교로 방향 추정
            else if (sourceNode && targetNode) {
              const sourceImportance = sourceNode.importance || 0;
              const targetImportance = targetNode.importance || 0;

              if (sourceImportance > targetImportance) {
                dashColor = OBSIDIAN_COLORS.EDGE.REFERRAL_OUT; // 약한 주황색
              } else if (targetImportance > sourceImportance) {
                dashColor = OBSIDIAN_COLORS.EDGE.REFERRAL_IN; // 약한 파란색
              } else {
                dashColor = OBSIDIAN_COLORS.EDGE.DEFAULT; // 중립 색상
              }
            } else {
              dashColor = OBSIDIAN_COLORS.EDGE.DEFAULT; // 기본 중립 색상
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
              ? OBSIDIAN_COLORS.ANIMATION.PULSE_PRIMARY
              : OBSIDIAN_COLORS.ANIMATION.PULSE_SECONDARY;
            const baseSolidColor = isSourceHighlighted
              ? OBSIDIAN_COLORS.NODE.HIGHLIGHTED
              : OBSIDIAN_COLORS.NODE.CONNECTED;

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
              ctx.fillStyle = OBSIDIAN_COLORS.NODE.DIMMED;
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
            // 옵시디언 스타일 폰트 설정
            const fontSize = Math.max(12, 16 / globalScale);
            ctx.font = `600 ${fontSize}px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif`;

            // 필터링 및 하이라이트 상태 확인
            const isFiltered = node._filtered === true;
            const isHighlightNode = node.id === graphState.highlightedNodeId;
            const isSearchResultNode = isNodeInSearchResults(node.id);
            const isConnectedNode = isNodeConnectedToHighlight(node.id);
            const isHighlightRelated =
              isHighlightNode || isConnectedNode || isSearchResultNode;

            // 옵시디언 스타일 노드 크기 계산
            const importance = node.importance || 1;
            let nodeRadius;
            if (isHighlightNode) {
              nodeRadius =
                OBSIDIAN_CONFIG.NODE.HIGHLIGHT_RADIUS + importance * 2;
            } else if (isHighlightRelated) {
              nodeRadius =
                OBSIDIAN_CONFIG.NODE.DEFAULT_RADIUS + importance * 1.5;
            } else {
              nodeRadius = Math.max(
                OBSIDIAN_CONFIG.NODE.MIN_RADIUS,
                OBSIDIAN_CONFIG.NODE.DEFAULT_RADIUS + importance
              );
            }

            // 옵시디언 스타일 색상 시스템
            let nodeColor = '#64748b'; // 기본 muted-foreground
            if (node.group === 'influencer') {
              nodeColor = '#a73f03'; // primary
            } else {
              // 단계별 색상 구분 (옵시디언 스타일)
              switch (node.stage) {
                case '첫 상담':
                  nodeColor = '#64748b';
                  break; // muted-foreground
                case '니즈 분석':
                  nodeColor = '#f59e0b';
                  break; // amber-500
                case '상품 설명':
                  nodeColor = '#3b82f6';
                  break; // blue-500
                case '계약 검토':
                  nodeColor = '#ef4444';
                  break; // red-500
                case '계약 완료':
                  nodeColor = '#22c55e';
                  break; // green-500
                default:
                  nodeColor = '#64748b';
              }
            }

            // 투명도 설정 - 옵시디언 스타일
            if (isFiltered) {
              ctx.globalAlpha = 0.1;
            } else if (
              graphState.highlightedNodeId ||
              graphState.searchResults.length > 0
            ) {
              ctx.globalAlpha = isHighlightRelated ? 1.0 : 0.25;
            } else {
              ctx.globalAlpha = 1.0;
            }

            // 하이라이트된 주요 노드 - 옵시디언 스타일 펄스 효과
            if (isHighlightNode && !isFiltered) {
              const time = animationTime * 0.003;
              const primaryPulse = (Math.sin(time * Math.PI) + 1) * 0.5;
              const secondaryPulse =
                (Math.sin(time * Math.PI * 1.618) + 1) * 0.5;
              const pulse = primaryPulse * 0.7 + secondaryPulse * 0.3;

              // 외부 발광 링 (3단계 - 옵시디언 스타일)
              for (let i = 3; i >= 1; i--) {
                ctx.beginPath();
                ctx.arc(
                  node.x,
                  node.y,
                  nodeRadius * (1.2 + i * 0.3 + pulse * 0.2),
                  0,
                  2 * Math.PI
                );
                const alpha = (0.15 + pulse * 0.1) / i;
                ctx.fillStyle = `rgba(167, 63, 3, ${alpha})`;
                ctx.fill();
              }

              // 메인 발광 효과
              ctx.shadowColor = 'rgba(167, 63, 3, 0.6)';
              ctx.shadowBlur = 20 + pulse * 15;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;

              // 펄스 테두리
              ctx.strokeStyle = `rgba(167, 63, 3, ${0.8 + pulse * 0.2})`;
              ctx.lineWidth = (3 + pulse * 2) / globalScale;
              ctx.stroke();
            }

            // 연결된 노드 - 서브틀한 강조 (옵시디언 스타일)
            if (isConnectedNode && !isHighlightNode && !isFiltered) {
              ctx.beginPath();
              ctx.arc(node.x, node.y, nodeRadius + 3, 0, 2 * Math.PI);
              ctx.fillStyle = 'rgba(100, 116, 139, 0.3)';
              ctx.fill();

              // 연결 표시 테두리
              ctx.strokeStyle = 'rgba(100, 116, 139, 0.8)';
              ctx.lineWidth = 2 / globalScale;
              ctx.stroke();
            }

            // 검색 결과 노드 강조
            if (isSearchResultNode && !isHighlightNode && !isFiltered) {
              ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)'; // red-500
              ctx.lineWidth = 2 / globalScale;
              ctx.stroke();
            }

            // 메인 노드 렌더링
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
            ctx.fillStyle = nodeColor;
            ctx.fill();

            // 노드 테두리 (기본)
            if (!isHighlightNode && !isConnectedNode && !isSearchResultNode) {
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
              ctx.lineWidth = 1 / globalScale;
              ctx.stroke();
            }

            // 라벨 렌더링 - 옵시디언 스타일
            if (
              globalScale > 0.6 &&
              (isHighlightRelated || globalScale > 1.2)
            ) {
              const labelY = node.y + nodeRadius + 20 / globalScale;

              // 라벨 배경 (옵시디언 스타일)
              if (isHighlightRelated) {
                const textMetrics = ctx.measureText(label);
                const padding = 6 / globalScale;
                const bgRadius = 4 / globalScale;

                // 둥근 배경
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.beginPath();
                ctx.roundRect(
                  node.x - textMetrics.width / 2 - padding,
                  labelY - fontSize / 2 - padding,
                  textMetrics.width + padding * 2,
                  fontSize + padding * 2,
                  bgRadius
                );
                ctx.fill();
              }

              // 라벨 텍스트
              ctx.fillStyle = isHighlightRelated ? '#ffffff' : '#e2e8f0';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(label, node.x, labelY);
            }

            // 그림자 및 글로벌 알파 리셋
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1.0;
          } catch (err) {
            console.error('노드 렌더링 오류:', err);
            // 폴백 렌더링
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#64748b';
            ctx.beginPath();
            ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI);
            ctx.fill();
          }
        }}
      />
    </div>
  );
}
