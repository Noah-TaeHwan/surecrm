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
  // 🔥 임시 디버깅 로그 제거 (무한 재렌더링 방지)
  // console.log('📊 NetworkGraphClient 데이터 검증:', {
  //   노드수: data?.nodes?.length || 0,
  //   링크수: data?.links?.length || 0,
  //   샘플노드: data?.nodes?.[0],
  //   샘플링크: data?.links?.[0]
  // });

  // 초기화 상태 관리 (단일 상태로 통합) - 컴포넌트 시작 부분에 정의
  const [graphState, setGraphState] = useState({
    mounted: false,
    initialized: false,
    renderingFailed: false,
    initAttempted: false,
    showDebug: false,
    highlightedNodeId: externalHighlightedNodeId,
    searchResults: [] as string[], // 검색 결과에 해당하는 노드 ID 배열 추가
    nodeTransitionInProgress: false, // 노드 전환 중인지 추적
    sidebarResizing: false, // 사이드바 크기 변화 중인지 추적
  });

  // 🔥 안전장치: 데이터가 없거나 잘못된 경우 빈 데이터로 처리
  const safeData = useMemo(() => {
    if (!data || !data.nodes || !Array.isArray(data.nodes)) {
      return { nodes: [], links: [] };
    }

    if (!data.links || !Array.isArray(data.links)) {
      return { nodes: data.nodes, links: [] };
    }

    // 노드 ID 집합 생성
    const nodeIds = new Set(
      data.nodes
        .map((node) => {
          if (!node || typeof node.id !== 'string') {
            return null;
          }
          return node.id;
        })
        .filter(Boolean)
    );

    // 유효한 링크만 필터링
    const validLinks = data.links.filter((link) => {
      if (!link || !link.source || !link.target) {
        return false;
      }

      const sourceId =
        typeof link.source === 'string' ? link.source : link.source.id;
      const targetId =
        typeof link.target === 'string' ? link.target : link.target.id;

      if (!nodeIds.has(sourceId) || !nodeIds.has(targetId)) {
        return false;
      }

      return true;
    });

    return {
      nodes: data.nodes.filter((node) => node && typeof node.id === 'string'),
      links: validLinks,
    };
  }, [data?.nodes, data?.links]); // 🔥 의존성 최적화

  // 내부 ref 생성 및 외부 ref 처리
  const internalGraphRef = useRef<any>(null);
  const graphRef = externalGraphRef || internalGraphRef;

  // 컨테이너 크기를 감지하기 위한 ref 추가
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // ForceGraph2D 컴포넌트 로딩 상태 관리
  const [graphComponent, setGraphComponent] = useState<any>(null);

  // 컨테이너 크기 감지 useEffect 추가
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newDimensions = {
          width: rect.width,
          height: rect.height,
        };

        // 크기가 실제로 변경되었을 때만 업데이트 (임계값 증가)
        setDimensions((prev) => {
          if (
            Math.abs(prev.width - newDimensions.width) > 10 ||
            Math.abs(prev.height - newDimensions.height) > 10
          ) {
            // 크기 변화 로그 간소화
            console.log('📏 컨테이너 크기 변화:', {
              이전폭: Math.round(prev.width),
              현재폭: Math.round(newDimensions.width),
              이전높이: Math.round(prev.height),
              현재높이: Math.round(newDimensions.height),
            });
            return newDimensions;
          }
          return prev;
        });
      }
    };

    // 초기 크기 설정
    updateDimensions();

    // 렌더링 완료 대기를 위한 지연 업데이트 (더 적은 횟수로 최적화)
    const timeouts = [200, 500].map((delay) =>
      setTimeout(updateDimensions, delay)
    );

    // ResizeObserver로 크기 변화 감지 (디바운싱 추가)
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const resizeObserver = new ResizeObserver((entries) => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          setDimensions((prev) => {
            if (
              Math.abs(prev.width - width) > 10 ||
              Math.abs(prev.height - height) > 10
            ) {
              console.log('🔍 ResizeObserver 감지 (디바운스):', {
                폭: Math.round(width),
                높이: Math.round(height),
              });
              return { width, height };
            }
            return prev;
          });
        }
      }, 150); // 150ms 디바운싱
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // MutationObserver로 DOM 변화 감지 (디바운싱 강화)
    let mutationTimeout: ReturnType<typeof setTimeout>;
    const mutationObserver = new MutationObserver(() => {
      clearTimeout(mutationTimeout);
      mutationTimeout = setTimeout(updateDimensions, 300); // 300ms 디바운싱
    });

    if (containerRef.current?.parentElement) {
      mutationObserver.observe(containerRef.current.parentElement, {
        attributes: true,
        attributeFilter: ['class', 'style'],
        subtree: true,
      });
    }

    // 윈도우 리사이즈 이벤트도 감지 (디바운싱 강화)
    const debouncedResize = debounce(updateDimensions, 200); // 200ms 디바운싱
    window.addEventListener('resize', debouncedResize);

    // 정리 함수
    return () => {
      timeouts.forEach(clearTimeout);
      clearTimeout(resizeTimeout);
      clearTimeout(mutationTimeout);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('resize', debouncedResize);
    };
  }, []);

  // 컨테이너 크기가 변경되면 그래프 크기 업데이트
  useEffect(() => {
    if (
      dimensions.width > 0 &&
      dimensions.height > 0 &&
      graphRef.current &&
      !graphState.sidebarResizing
    ) {
      // 🔥 700ms 애니메이션과 완전 동기화된 부드러운 크기 업데이트
      const updateGraphSize = () => {
        if (graphRef.current && typeof graphRef.current.width === 'function') {
          const currentWidth = graphRef.current.width();
          const currentHeight = graphRef.current.height();

          // 의미있는 크기 변화만 감지 (임계값 낮춤)
          const widthDiff = Math.abs(currentWidth - dimensions.width);
          const heightDiff = Math.abs(currentHeight - dimensions.height);

          if (widthDiff > 30 || heightDiff > 20) {
            // CSS 애니메이션과 완전 동기화된 부드러운 크기 변경
            graphRef.current.width(dimensions.width);
            graphRef.current.height(dimensions.height);

            console.log('🎯 그래프 크기 동기화 (700ms):', {
              폭: `${Math.round(currentWidth)} → ${Math.round(
                dimensions.width
              )}`,
              높이: `${Math.round(currentHeight)} → ${Math.round(
                dimensions.height
              )}`,
            });
          }
        }
      };

      // CSS 애니메이션 완료 후 그래프 크기 조정 (700ms + 50ms 여유)
      const updateTimeout = setTimeout(updateGraphSize, 750);

      return () => clearTimeout(updateTimeout);
    }
  }, [dimensions.width, dimensions.height, graphState.sidebarResizing]);

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
      sidebarResizing: true, // 사이드바 크기 변화 시작
    }));

    // 🔥 Flexbox 기반 레이아웃에 최적화된 크기 감지
    const handleLayoutChange = setTimeout(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newDimensions = { width: rect.width, height: rect.height };

        setDimensions((prev) => {
          // 의미있는 크기 변화만 감지
          const widthDiff = Math.abs(prev.width - newDimensions.width);

          if (widthDiff > 20) {
            console.log('📐 Flexbox 레이아웃 변화 감지:', {
              변화: `${Math.round(prev.width)} → ${Math.round(
                newDimensions.width
              )}px`,
              사이드바상태: externalHighlightedNodeId ? '열림' : '닫힌',
            });
            return newDimensions;
          }
          return prev;
        });
      }

      // 레이아웃 변화 완료
      setGraphState((prev) => ({
        ...prev,
        sidebarResizing: false,
      }));
    }, 750); // 700ms 애니메이션 + 50ms 여유

    return () => {
      clearTimeout(handleLayoutChange);
    };
  }, [externalHighlightedNodeId]);

  // 옵시디언 스타일 필터링 및 검색 시스템
  const filteredData = useMemo(() => {
    let filteredNodes = [...safeData.nodes];
    let searchResults: string[] = [];
    let highlightedNode: string | null = null;

    // 🔍 검색어 처리 (옵시디언 스타일 - 최우선)
    if (searchQuery && searchQuery.trim()) {
      const normalizedQuery = searchQuery.trim().toLowerCase();

      // 정확한 매치 우선, 부분 매치 후순위
      const exactMatches = safeData.nodes.filter(
        (node) => node.name.toLowerCase() === normalizedQuery
      );
      const partialMatches = safeData.nodes.filter(
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

        safeData.links.forEach((link) => {
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
      safeData.links.forEach((link) => {
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
      nodes: [...safeData.nodes], // 🔥 safeData 사용
      links: [...safeData.links], // 🔥 safeData 사용
    };
  }, [safeData]); // 🔥 의존성 최적화

  // 현재 하이라이트된 노드의 확장된 네트워크 경로 계산 (Hook 순서 유지를 위해 여기에 배치)
  const highlightPath = useMemo(() => {
    if (!graphState.highlightedNodeId) return [];

    // 에이전트 노드에서 선택된 노드까지의 경로를 찾는 함수
    const findPathFromAgentToNode = (targetNodeId: string): string[] => {
      if (!targetNodeId) return [];

      // 에이전트 노드 찾기 (influencer 그룹 또는 중심 노드)
      const agentNode = safeData.nodes.find(
        (node) => node.group === 'influencer'
      );
      if (!agentNode) return [];

      if (agentNode.id === targetNodeId) return [targetNodeId];

      // BFS를 사용해 최단 경로 찾기
      const queue = [{ nodeId: agentNode.id, path: [agentNode.id] }];
      const visited = new Set([agentNode.id]);

      while (queue.length > 0) {
        const { nodeId: currentId, path } = queue.shift()!;

        // 연결된 모든 노드 확인
        for (const link of safeData.links) {
          const sourceId =
            typeof link.source === 'object' ? link.source.id : link.source;
          const targetId =
            typeof link.target === 'object' ? link.target.id : link.target;

          let nextNodeId = null;
          if (sourceId === currentId && !visited.has(targetId)) {
            nextNodeId = targetId;
          } else if (targetId === currentId && !visited.has(sourceId)) {
            nextNodeId = sourceId;
          }

          if (nextNodeId) {
            const newPath = [...path, nextNodeId];

            if (nextNodeId === targetNodeId) {
              return newPath; // 목표 노드 도달
            }

            visited.add(nextNodeId);
            queue.push({ nodeId: nextNodeId, path: newPath });
          }
        }
      }

      return []; // 경로를 찾을 수 없음
    };

    // 선택된 노드에서 직접 연결된 모든 노드를 찾는 함수
    const findDirectlyConnectedNodes = (nodeId: string): string[] => {
      const connectedNodes: string[] = [];

      for (const link of safeData.links) {
        const sourceId =
          typeof link.source === 'object' ? link.source.id : link.source;
        const targetId =
          typeof link.target === 'object' ? link.target.id : link.target;

        if (sourceId === nodeId) {
          connectedNodes.push(targetId);
        } else if (targetId === nodeId) {
          connectedNodes.push(sourceId);
        }
      }

      return connectedNodes;
    };

    // 1. 에이전트에서 선택된 노드까지의 경로
    const mainPath = findPathFromAgentToNode(graphState.highlightedNodeId);

    // 2. 선택된 노드에서 직접 연결된 모든 노드들 추가
    const directConnectedNodes = findDirectlyConnectedNodes(
      graphState.highlightedNodeId
    );

    // 3. 경로에 포함되지 않은 직접 연결 노드들을 경로에 추가
    const extendedPath = [...mainPath];
    for (const connectedNode of directConnectedNodes) {
      if (!extendedPath.includes(connectedNode)) {
        extendedPath.push(connectedNode);
      }
    }

    return extendedPath;
  }, [graphState.highlightedNodeId, safeData]);

  // 그래프 초기화 - 한 번만 실행되도록 최적화
  useEffect(() => {
    if (!graphState.mounted || !isBrowser || !graphComponent) return;
    if (graphState.initialized) return;

    // 초기화 상태 업데이트
    setGraphState((prev) => ({ ...prev, initAttempted: true }));

    // 실패 감지를 위한 타이머 (시간 단축)
    const failureTimer = setTimeout(() => {
      if (!graphState.initialized) {
        // console.error('그래프 초기화 실패: 시간 초과');
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

        // console.log('✅ 옵시디언 스타일 네트워크 그래프 초기화 완료');
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

  // 노드가 하이라이트 경로에 포함되는지 확인하는 헬퍼 함수
  function isNodeInHighlightPath(nodeId: string): boolean {
    return highlightPath.includes(nodeId);
  }

  // 링크가 하이라이트 경로에 포함되는지 확인하는 헬퍼 함수 (확장된 경로 지원)
  function isLinkInHighlightPath(link: any): boolean {
    if (highlightPath.length < 1) return false;

    const sourceId =
      typeof link.source === 'object' ? link.source.id : link.source;
    const targetId =
      typeof link.target === 'object' ? link.target.id : link.target;

    // 하이라이트 경로에 포함된 노드들 간의 모든 연결을 확인
    // (에이전트→A→B→C 경로와 C에서 직접 연결된 D까지 포함)
    if (highlightPath.includes(sourceId) && highlightPath.includes(targetId)) {
      return true;
    }

    return false;
  }

  // 링크의 방향성을 판단하는 헬퍼 함수 (실제 A→B 흐름 기준)
  function getLinkDirection(link: any): 'incoming' | 'outgoing' | 'none' {
    if (!graphState.highlightedNodeId || !isLinkInHighlightPath(link)) {
      return 'none';
    }

    const sourceId =
      typeof link.source === 'object' ? link.source.id : link.source;
    const targetId =
      typeof link.target === 'object' ? link.target.id : link.target;

    // 에이전트에서 선택된 노드까지의 메인 경로 찾기 (순서 중요)
    const agentNode = safeData.nodes.find(
      (node) => node.group === 'influencer'
    );
    if (!agentNode) return 'none';

    // BFS로 에이전트에서 선택된 노드까지의 순서있는 경로 찾기
    const queue = [{ nodeId: agentNode.id, path: [agentNode.id] }];
    const visited = new Set([agentNode.id]);
    let mainPath: string[] = [];

    while (queue.length > 0) {
      const { nodeId: currentId, path } = queue.shift()!;

      if (currentId === graphState.highlightedNodeId) {
        mainPath = path;
        break;
      }

      for (const pathLink of safeData.links) {
        const pathSourceId =
          typeof pathLink.source === 'object'
            ? pathLink.source.id
            : pathLink.source;
        const pathTargetId =
          typeof pathLink.target === 'object'
            ? pathLink.target.id
            : pathLink.target;

        let nextNodeId = null;
        if (pathSourceId === currentId && !visited.has(pathTargetId)) {
          nextNodeId = pathTargetId;
        } else if (pathTargetId === currentId && !visited.has(pathSourceId)) {
          nextNodeId = pathSourceId;
        }

        if (nextNodeId) {
          visited.add(nextNodeId);
          queue.push({ nodeId: nextNodeId, path: [...path, nextNodeId] });
        }
      }
    }

    // 메인 경로 상의 순차적 연결인지 확인 (A→B→C 순서대로)
    for (let i = 0; i < mainPath.length - 1; i++) {
      const pathNode1 = mainPath[i];
      const pathNode2 = mainPath[i + 1];

      if (sourceId === pathNode1 && targetId === pathNode2) {
        return 'incoming'; // 정방향: A → B (소개 흐름 방향)
      } else if (sourceId === pathNode2 && targetId === pathNode1) {
        return 'incoming'; // 역방향이지만 같은 경로상의 연결
      }
    }

    // 선택된 노드에서 다른 노드로 나가는 연결 (선택된 노드가 소개한 경우)
    if (sourceId === graphState.highlightedNodeId) {
      return 'outgoing'; // 선택된 노드 → 다른 노드 (정방향)
    } else if (targetId === graphState.highlightedNodeId) {
      return 'outgoing'; // 다른 노드 → 선택된 노드 (역방향이지만 outgoing으로 처리)
    }

    return 'none';
  }

  // 하이라이트된 노드와 연결된 노드인지 확인하는 특별 헬퍼 함수 (기존 로직 유지하되 경로 기반으로 수정)
  function isNodeConnectedToHighlight(nodeId: string): boolean {
    return (
      isNodeInHighlightPath(nodeId) && nodeId !== graphState.highlightedNodeId
    );
  }

  // 노드가 검색 결과에 포함되는지 확인하는 헬퍼 함수
  function isNodeInSearchResults(nodeId: string): boolean {
    return graphState.searchResults.includes(nodeId);
  }

  // 연결된 노드 개수 계산 함수
  function getNodeConnectionCount(nodeId: string): number {
    if (!filteredData.links) return 0;

    return filteredData.links.filter((link: any) => {
      const sourceId =
        typeof link.source === 'string' ? link.source : link.source.id;
      const targetId =
        typeof link.target === 'string' ? link.target : link.target.id;
      return sourceId === nodeId || targetId === nodeId;
    }).length;
  }

  // 연결 개수를 기반으로 노드 크기 계산 (더 명확하게 차이나게)
  function calculateNodeRadius(
    node: any,
    isHighlightNode: boolean,
    isHighlightRelated: boolean
  ): number {
    const connectionCount = getNodeConnectionCount(node.id);
    const importance = node.importance || 1;

    // 기본 크기에 연결 개수 비례 추가 (더 크게 - 최대 +70% 정도)
    const connectionBonus = Math.min(connectionCount * 1.5, 8); // 최대 8픽셀 추가

    let baseRadius;
    if (isHighlightNode) {
      baseRadius = OBSIDIAN_CONFIG.NODE.HIGHLIGHT_RADIUS + importance * 2;
    } else if (isHighlightRelated) {
      baseRadius = OBSIDIAN_CONFIG.NODE.DEFAULT_RADIUS + importance * 1.5;
    } else {
      baseRadius = Math.max(
        OBSIDIAN_CONFIG.NODE.MIN_RADIUS,
        OBSIDIAN_CONFIG.NODE.DEFAULT_RADIUS + importance
      );
    }

    return baseRadius + connectionBonus;
  }

  return (
    <div
      ref={containerRef}
      className="h-full w-full absolute inset-0"
      style={{ width: '100%', height: '100%' }}
    >
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
        graphData={filteredData} // 필터링된 데이터 사용
        nodeId="id"
        nodeLabel={() => ''} // 호버 라벨 완전 비활성화
        nodeVal={(node: any) => {
          // 간단한 노드 크기 계산
          const importance = node.importance || 1;
          return node.group === 'influencer'
            ? importance * 2
            : importance * 1.5;
        }}
        width={dimensions.width || window.innerWidth}
        height={dimensions.height || window.innerHeight - 200}
        // 기본 설정들
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={0.8}
        linkDirectionalArrowColor={(link: any) => {
          if (graphState.highlightedNodeId) {
            const direction = getLinkDirection(link);

            if (direction === 'incoming') {
              return '#4FC3F7'; // 소개받는 흐름 - 밝은 블루
            } else if (direction === 'outgoing') {
              return '#FF8A65'; // 소개하는 흐름 - 밝은 오렌지
            } else if (isLinkInHighlightPath(link)) {
              return '#cccccc'; // 기타 하이라이트된 링크
            } else {
              return 'rgba(150, 150, 150, 0.3)'; // 경로에 포함되지 않은 화살표는 투명하게
            }
          }

          return '#666666'; // 기본 화살표 색상을 더 어둡게 (하이라이트 없을 때)
        }}
        // 기본 상호작용
        enableZoomInteraction={true}
        enablePanInteraction={true}
        enableNodeDrag={true}
        // 중요도에 따른 노드 색상 설정
        nodeColor={(node: any) => {
          const importance = node.importance || 1;

          // 소개자(influencer)는 별도 색상
          if (node.group === 'influencer') {
            if (node.id === graphState.highlightedNodeId) {
              return '#ff4500'; // 하이라이트된 소개자
            }
            if (isNodeConnectedToHighlight(node.id)) {
              return '#ff7f50'; // 연결된 소개자
            }
            return '#ff6b35'; // 기본 소개자 (오렌지)
          }

          // 일반 고객의 중요도별 색상 (고객 카드와 동일한 어두운 은은한 색상)
          let baseColor;
          if (importance >= 5) {
            // VIP (높음) - 어두운 오렌지 계열
            baseColor = 'oklch(0.35 0.08 35)'; // 어두운 오렌지 톤
          } else if (importance >= 3) {
            // 일반 (보통) - 어두운 블루 계열
            baseColor = 'oklch(0.35 0.06 240)'; // 어두운 블루 톤
          } else {
            // 관심 (낮음) - 어두운 회색 계열
            baseColor = 'oklch(0.30 0.01 285)'; // 어두운 회색 톤
          }

          // 하이라이트 상태에 따른 색상 조정
          if (node.id === graphState.highlightedNodeId) {
            // 하이라이트된 노드는 조금 더 밝게
            if (importance >= 5) {
              return 'oklch(0.50 0.12 35)'; // 밝은 오렌지
            } else if (importance >= 3) {
              return 'oklch(0.50 0.10 240)'; // 밝은 블루
            } else {
              return 'oklch(0.45 0.02 285)'; // 밝은 회색
            }
          }

          if (isNodeConnectedToHighlight(node.id)) {
            // 연결된 노드는 중간 강도
            if (importance >= 5) {
              return 'oklch(0.42 0.10 35)'; // 중간 오렌지
            } else if (importance >= 3) {
              return 'oklch(0.42 0.08 240)'; // 중간 블루
            } else {
              return 'oklch(0.38 0.015 285)'; // 중간 회색
            }
          }

          // 하이라이트된 노드가 있지만 연결되지 않은 노드들은 살짝만 어둡게 처리
          if (graphState.highlightedNodeId) {
            if (importance >= 5) {
              return 'oklch(0.28 0.06 35 / 0.8)'; // 살짝 어두운 오렌지 + 약한 투명도
            } else if (importance >= 3) {
              return 'oklch(0.28 0.05 240 / 0.8)'; // 살짝 어두운 블루 + 약한 투명도
            } else {
              return 'oklch(0.25 0.01 285 / 0.8)'; // 살짝 어두운 회색 + 약한 투명도
            }
          }

          return baseColor; // 기본 은은한 색상
        }}
        linkColor={(link: any) => {
          if (graphState.highlightedNodeId) {
            const direction = getLinkDirection(link);

            if (direction === 'incoming') {
              return '#29B6F6'; // 소개받는 흐름 - 블루 계열
            } else if (direction === 'outgoing') {
              return '#FF7043'; // 소개하는 흐름 - 오렌지 계열
            } else if (isLinkInHighlightPath(link)) {
              return '#cccccc'; // 기타 하이라이트된 링크
            } else {
              return 'rgba(150, 150, 150, 0.3)'; // 경로에 포함되지 않은 링크는 투명하게
            }
          }

          return '#666666'; // 기본 링크를 더 어둡게 (하이라이트 없을 때)
        }}
        linkWidth={(link: any) => {
          if (graphState.highlightedNodeId) {
            const direction = getLinkDirection(link);

            if (direction === 'incoming' || direction === 'outgoing') {
              return 4; // 방향성 있는 하이라이트 링크 두께 조정 (6 → 4)
            } else if (isLinkInHighlightPath(link)) {
              return 3; // 기타 하이라이트된 링크 두께 조정 (4 → 3)
            }
          }

          return 1; // 기본 링크 굵기
        }}
        // 커스텀 링크 렌더링으로 그라디언트 플로우 애니메이션 효과
        linkCanvasObjectMode={() => 'after'}
        linkCanvasObject={(link: any, ctx: any) => {
          if (!graphState.highlightedNodeId) return;

          const direction = getLinkDirection(link);
          if (direction === 'incoming' || direction === 'outgoing') {
            const start = link.source;
            const end = link.target;

            if (
              !start ||
              !end ||
              typeof start.x !== 'number' ||
              typeof end.x !== 'number'
            )
              return;

            // 부드러운 애니메이션을 위한 시간 기반 진행도 (0-1 순환)
            const progress = (animationTime * 0.02) % 1; // 더 부드러운 애니메이션

            ctx.save();

            // 연결선의 길이와 각도 계산
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const length = Math.sqrt(dx * dx + dy * dy);

            // 그라디언트가 움직이는 효과를 위한 위치 계산
            const gradientStart = progress * length;
            const gradientEnd = gradientStart + length * 0.3; // 그라디언트 폭

            // 선형 그라디언트 생성 (실제 A→B 방향으로)
            const gradient = ctx.createLinearGradient(
              start.x + (dx * gradientStart) / length,
              start.y + (dy * gradientStart) / length,
              start.x + (dx * gradientEnd) / length,
              start.y + (dy * gradientEnd) / length
            );

            // 방향에 따른 색상 설정
            let baseColor, brightColor;
            if (direction === 'incoming') {
              baseColor = 'rgba(66, 165, 245, 0.2)'; // 연한 블루
              brightColor = 'rgba(66, 165, 245, 0.9)'; // 밝은 블루
            } else {
              baseColor = 'rgba(255, 112, 67, 0.2)'; // 연한 오렌지
              brightColor = 'rgba(255, 112, 67, 0.9)'; // 밝은 오렌지
            }

            gradient.addColorStop(0, baseColor);
            gradient.addColorStop(0.5, brightColor);
            gradient.addColorStop(1, baseColor);

            // 그라디언트 플로우 렌더링
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';

            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();

            ctx.restore();
          }
        }}
        // 노드 클릭 이벤트
        onNodeClick={(node: any) => {
          setGraphState((prev) => ({
            ...prev,
            highlightedNodeId: node.id,
          }));

          // 클릭한 노드를 화면 중앙으로 이동
          if (
            graphRef.current &&
            typeof graphRef.current.centerAt === 'function'
          ) {
            graphRef.current.centerAt(node.x, node.y, 1000); // 1초 동안 부드럽게 이동
          }

          onNodeSelect(node.id);
        }}
        // 배경 클릭으로 하이라이트 해제
        onBackgroundClick={() => {
          setGraphState((prev) => ({
            ...prev,
            highlightedNodeId: null,
          }));
        }}
        // 노드 위에 고객명 추가로 표시 (노드는 그대로 유지)
        nodeCanvasObjectMode={() => 'after'}
        nodeCanvasObject={(node: any, ctx: any, globalScale: number) => {
          // 하이라이트된 노드에만 은은한 발광 효과 추가
          if (node.id === graphState.highlightedNodeId) {
            const nodeRadius = calculateNodeRadius(node, true, false);

            // 애니메이션을 위한 시간 기반 펄스 효과 (더 눈에 띄게)
            const pulseIntensity = 0.6 + Math.sin(animationTime * 0.03) * 0.3; // 0.3~0.9 범위

            // 발광 효과를 위한 그라디언트 생성 (범위 좁게)
            const glowRadius = nodeRadius * 1.5; // 노드 크기의 1.5배로 좁게
            const gradient = ctx.createRadialGradient(
              node.x,
              node.y,
              nodeRadius * 0.6,
              node.x,
              node.y,
              glowRadius
            );

            // 더 눈에 띄는 발광 색상 (노드 색상 기반)
            let glowColor;
            if (node.group === 'influencer') {
              glowColor = `rgba(255, 107, 53, ${0.25 * pulseIntensity})`; // 더 눈에 띄는 오렌지 발광
            } else {
              const importance = node.importance || 1;
              if (importance >= 5) {
                glowColor = `rgba(255, 140, 0, ${0.22 * pulseIntensity})`; // VIP - 더 눈에 띄는 오렌지 발광
              } else if (importance >= 3) {
                glowColor = `rgba(70, 130, 255, ${0.2 * pulseIntensity})`; // 일반 - 더 눈에 띄는 블루 발광
              } else {
                glowColor = `rgba(150, 150, 150, ${0.18 * pulseIntensity})`; // 관심 - 더 눈에 띄는 회색 발광
              }
            }

            gradient.addColorStop(0, glowColor);
            gradient.addColorStop(
              0.6,
              `rgba(255, 255, 255, ${0.08 * pulseIntensity})`
            );
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            // 발광 효과 렌더링
            ctx.save();
            ctx.globalCompositeOperation = 'screen'; // 발광 효과를 위한 블렌드 모드
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(node.x, node.y, glowRadius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
          }

          // 기존 텍스트 렌더링
          const label = node.name;
          const fontSize = Math.max(10, 13 / globalScale);

          // 깔끔한 폰트 설정
          ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // 텍스트 위치 계산 (노드 아래쪽)
          const nodeRadius =
            (node.importance || 1) * (node.group === 'influencer' ? 2 : 1.5);
          const textY = node.y + nodeRadius + 18 / globalScale;

          // 하이라이트 상태에 따른 텍스트 opacity 적용
          const isHighlighted = node.id === graphState.highlightedNodeId;
          const isConnected = isNodeInHighlightPath(node.id);

          if (graphState.highlightedNodeId && !isHighlighted && !isConnected) {
            // 하이라이트되지 않은 노드의 텍스트도 같은 opacity 적용
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; // 50% 투명도 (노드와 동일)
          } else {
            ctx.fillStyle = '#ffffff'; // 기본 흰색
          }

          ctx.fillText(label, node.x, textY);
        }}
      />
    </div>
  );
}
