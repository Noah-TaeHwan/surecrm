// 🎯 SureCRM 네트워크 시스템 통합 타입 정의
// 옵시디언 그래프뷰 스타일 네트워크 시각화를 위한 타입 시스템

// ===============================================
// 🔸 기본 네트워크 노드 타입
// ===============================================
export interface NetworkNode {
  id: string;
  name: string;
  group?: string;
  importance?: number;
  stage?: string;
  referredBy?: string;
  type?: 'agent' | 'client' | 'referrer';
  level?: number;
  referralCount?: number;
  contractValue?: number;
  status?: 'active' | 'inactive' | 'prospect';
  avatar?: string;
  // 시각화용 속성 (옵시디언 스타일)
  x?: number;
  y?: number;
  fx?: number; // 고정 x 좌표
  fy?: number; // 고정 y 좌표
  vx?: number; // 속도 x
  vy?: number; // 속도 y
  // 메타데이터
  metadata?: Record<string, any>;
}

// ===============================================
// 🔸 네트워크 링크/엣지 타입
// ===============================================
export interface NetworkLink {
  source: string | NetworkNode;
  target: string | NetworkNode;
  value: number;
  strength?: number; // 관계 강도 (옵시디언 스타일 엣지 굵기용)
  type?: 'referral' | 'collaboration' | 'influence';
  direction?: 'bidirectional' | 'unidirectional';
  weight?: number; // 가중치
  // 시각화용 속성
  color?: string;
  opacity?: number;
}

// ===============================================
// 🔸 네트워크 데이터 구조
// ===============================================
export interface NetworkData {
  nodes: NetworkNode[];
  links: NetworkLink[];
  metadata?: {
    generated: Date;
    version: string;
    nodeCount: number;
    linkCount: number;
  };
}

// ===============================================
// 🔸 네트워크 필터링 타입
// ===============================================
export interface NetworkFilters {
  stageFilter: string;
  depthFilter: string;
  importanceFilter: number;
  showInfluencersOnly?: boolean;
  nodeTypes?: string[];
  strengthRange?: {
    min: number;
    max: number;
  };
  influenceRange?: {
    min: number;
    max: number;
  };
  isActive?: boolean;
  tags?: string[];
  location?: string;
}

// ===============================================
// 🔸 그래프 시각화 Props 타입
// ===============================================
export interface NetworkGraphProps {
  data: NetworkData;
  onNodeSelect: (nodeId: string) => void;
  filters: NetworkFilters;
  layout?: string;
  searchQuery?: string;
  graphRef?: React.MutableRefObject<any>;
  highlightedNodeId?: string | null;
  // 옵시디언 스타일 확장 속성
  enableZoom?: boolean;
  enableDrag?: boolean;
  enablePanning?: boolean;
  showLabels?: boolean;
  animation?: {
    enabled: boolean;
    duration: number;
    easing: string;
  };
}

// ===============================================
// 🔸 네트워크 통계 타입
// ===============================================
export interface NetworkStats {
  totalNodes: number;
  totalConnections: number;
  totalEdges: number;
  maxDepth: number;
  averageConnections: number;
  avgReferralsPerNode: number;
  networkDensity: number;
  averagePathLength: number;
  clusteringCoefficient: number;
  topInfluencers: Array<{
    nodeId: string;
    id: string;
    name: string;
    influenceScore: number;
    connectionsCount: number;
    referralCount: number;
  }>;
  topReferrers: Array<{
    id: string;
    name: string;
    referralCount: number;
  }>;
  networkGrowth: Array<{
    month: string;
    newNodes: number;
    newConnections: number;
  }>;
}

// ===============================================
// 🔸 네트워크 분석 결과 타입
// ===============================================
export interface NetworkAnalysisResult {
  id: string;
  type: 'cluster' | 'bridge' | 'influencer' | 'isolated';
  score: number;
  description: string;
  affectedNodes: string[];
  recommendations: string[];
  createdAt: Date;
}

// ===============================================
// 🔸 네트워크 기회 타입
// ===============================================
export interface NetworkOpportunity {
  id: string;
  type: 'connection' | 'introduction' | 'collaboration';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  involvedNodes: string[];
  potentialValue: number;
  confidence: number;
  deadline?: Date;
  createdAt: Date;
}

// ===============================================
// 🔸 네트워크 개요 타입
// ===============================================
export interface NetworkOverview {
  nodes: NetworkNode[];
  connections: NetworkLink[];
  analysisResults: NetworkAnalysisResult[];
  opportunities: NetworkOpportunity[];
  stats: NetworkStats;
}

// ===============================================
// 🔸 옵시디언 스타일 시각화 설정 타입
// ===============================================
export interface ObsidianStyleConfig {
  // 노드 스타일링
  nodeStyle: {
    defaultRadius: number;
    highlightRadius: number;
    colors: {
      default: string;
      highlighted: string;
      connected: string;
      dimmed: string;
    };
    stroke: {
      width: number;
      color: string;
    };
  };
  // 엣지 스타일링
  linkStyle: {
    defaultWidth: number;
    highlightWidth: number;
    colors: {
      default: string;
      highlighted: string;
      connected: string;
      dimmed: string;
    };
    opacity: {
      default: number;
      highlighted: number;
      dimmed: number;
    };
  };
  // 애니메이션 설정
  animation: {
    duration: number;
    easing: string;
    enablePhysics: boolean;
    damping: number;
    repulsion: number;
    attraction: number;
  };
  // 인터랙션 설정
  interaction: {
    enableZoom: boolean;
    zoomRange: [number, number];
    enableDrag: boolean;
    enableHover: boolean;
    clickBehavior: 'select' | 'focus' | 'expand';
  };
}

// ===============================================
// 🔸 검색 및 하이라이팅 타입
// ===============================================
export interface NetworkSearchState {
  query: string;
  results: string[];
  highlightedNodeId: string | null;
  searchMode: 'node' | 'connection' | 'path';
  filters: NetworkFilters;
}

// ===============================================
// 🔸 유틸리티 타입들
// ===============================================
export type NetworkNodeType = 'agent' | 'client' | 'referrer';
export type NetworkConnectionType = 'referral' | 'collaboration' | 'influence';
export type NetworkLayoutType = 'force' | 'circular' | 'hierarchical' | 'grid';
export type NetworkImportanceLevel = 'high' | 'medium' | 'low';
export type NetworkStatusType = 'active' | 'inactive' | 'prospect';

// ===============================================
// 🔸 이벤트 타입들
// ===============================================
export interface NetworkNodeClickEvent {
  nodeId: string;
  node: NetworkNode;
  event: MouseEvent;
}

export interface NetworkLinkClickEvent {
  linkId: string;
  link: NetworkLink;
  event: MouseEvent;
}

export interface NetworkGraphEvent {
  type: 'nodeClick' | 'linkClick' | 'backgroundClick' | 'zoom' | 'pan';
  data: any;
  timestamp: Date;
}
