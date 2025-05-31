// 🌟 Influencers 기능 통합 타입 시스템
// 모든 Influencers 관련 타입들을 중앙 집중 관리

// 🔗 Schema 기반 타입 import
import type {
  InfluencerProfile,
  NewInfluencerProfile,
  InfluencerGratitudeHistory,
  NewInfluencerGratitudeHistory,
  InfluencerNetworkAnalysis,
  NewInfluencerNetworkAnalysis,
  InfluencerActivityLog,
  NewInfluencerActivityLog,
  InfluencerGratitudeTemplate,
  NewInfluencerGratitudeTemplate,
  // Enum 타입들
  InfluencerGratitudeType,
  InfluencerGratitudeStatus,
  InfluencerGiftType,
  InfluencerTier,
  InfluencerContactMethod,
  InfluencerActivityType,
  InfluencerDataSource,
  // 인터페이스들
  InfluencerOverview,
  InfluencerFilter,
  InfluencerNetworkMap,
  InfluencerRankingData,
  InfluencerAnalytics,
  // 공통 타입들
  Client,
  Profile,
} from '../lib/schema';

// 🎯 화면 표시용 핵심 타입들 (기존 컴포넌트와의 호환성 유지)

// 기존 Influencer 타입 (컴포넌트 호환성)
export interface InfluencerDisplayData {
  id: string;
  name: string;
  avatar: string;
  rank: number;
  totalReferrals: number;
  successfulContracts: number;
  conversionRate: number;
  totalContractValue: number;
  averageContractValue: number;
  networkDepth: number;
  networkWidth: number;
  relationshipStrength: number;
  lastGratitude: string | null;
  lastReferralDate: string | null;
  tier: InfluencerTier;
  monthlyReferrals: number[];
  referralPattern: Record<string, number>;
  isActive: boolean;
  // 추가 정보
  contactMethod: InfluencerContactMethod;
  specialNotes?: string;
  dataQuality: {
    isVerified: boolean;
    score: number;
    lastUpdated: string;
  };
}

// 감사 표현 이력 표시용 타입
export interface GratitudeHistoryDisplayItem {
  id: string;
  influencerId: string;
  influencerName: string;
  influencerAvatar?: string;
  type: InfluencerGratitudeType;
  typeLabel: string;
  message: string;
  personalizedMessage?: string;
  giftType?: InfluencerGiftType;
  giftTypeLabel?: string;
  title: string;
  scheduledDate: string | null;
  sentDate: string | null;
  deliveredDate: string | null;
  status: InfluencerGratitudeStatus;
  statusLabel: string;
  cost: number;
  vendor?: string;
  trackingNumber?: string;
  recipientFeedback?: string;
  deliveryConfirmed: boolean;
  isRecurring: boolean;
  nextScheduledDate?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  createdAt: string;
}

// 네트워크 분석 결과 표시용 타입
export interface NetworkAnalysisDisplayData {
  totalInfluencers: number;
  activeInfluencers: number;
  averageConversionRate: number;
  totalNetworkValue: number;
  avgNetworkDepth: number;
  avgNetworkWidth: number;
  monthlyGrowth: number;
  averageRelationshipStrength: number;
  totalGratitudesSent: number;
  averageGratitudeFrequency: number;
  // 품질 지표
  dataQualityScore: number;
  confidenceLevel: number;
  lastCalculated: string;
  // 추가 속성들 (influencer-analysis-card.tsx 호환성)
  lastUpdated: string;
  overallNetworkStrength: number;
  networkGrowthRate: number;
  averageReferralsPerInfluencer: number;
  maxNetworkDepth: number;
  totalSecondDegreeConnections: number;
  strongConnections: number;
  conversionRate: number;
  averageContractValue: number;
  // 트렌드 데이터
  trends: {
    referrals: Array<{ month: string; count: number }>;
    conversions: Array<{ month: string; rate: number }>;
    value: Array<{ month: string; amount: number }>;
    gratitude: Array<{ month: string; sent: number }>;
  };
  // 컴포넌트에서 직접 사용하는 월별 트렌드
  monthlyTrends: Array<{ month: string; count: number }>;
}

// 감사 표현 폼 데이터 타입
export interface GratitudeFormData {
  influencerId: string;
  type: InfluencerGratitudeType;
  giftType?: InfluencerGiftType;
  title: string;
  message: string;
  personalizedMessage?: string;
  scheduledDate?: Date;
  cost?: number;
  vendor?: string;
  isRecurring?: boolean;
  recurringInterval?: number;
  templateId?: string;
  // 배송 정보 (선물인 경우)
  deliveryInfo?: {
    recipientName: string;
    address: string;
    phone: string;
    specialInstructions?: string;
  };
}

// 감사 표현 템플릿 표시용 타입
export interface GratitudeTemplateDisplayData {
  id: string;
  name: string;
  type: InfluencerGratitudeType;
  giftType: InfluencerGiftType;
  title: string;
  messageTemplate: string;
  placeholders: string[];
  isDefault: boolean;
  usageCount: number;
  lastUsed?: string;
  isActive: boolean;
  preview: {
    sampleTitle: string;
    sampleMessage: string;
  };
}

// 🔍 필터링 및 검색 관련 타입들

// 기간 필터 타입
export interface PeriodFilter {
  type:
    | 'all'
    | 'last7days'
    | 'last30days'
    | 'last3months'
    | 'last6months'
    | 'lastYear'
    | 'custom';
  startDate?: string;
  endDate?: string;
  label: string;
}

// 정렬 옵션 타입
export interface SortOption {
  field:
    | 'rank'
    | 'totalReferrals'
    | 'conversionRate'
    | 'totalValue'
    | 'lastReferral'
    | 'lastGratitude'
    | 'relationshipStrength';
  direction: 'asc' | 'desc';
  label: string;
}

// 고급 필터 타입
export interface AdvancedFilter extends InfluencerFilter {
  period: PeriodFilter;
  sort: SortOption;
  groupBy?: 'tier' | 'contactMethod' | 'month' | 'quarter';
  includeInactive?: boolean;
  onlyRecentActivity?: boolean;
}

// 📊 통계 및 분석 관련 타입들

// 순위 변화 타입
export interface RankingChange {
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'stable' | 'new';
  changeLabel: string;
}

// 월별 성과 데이터 타입
export interface MonthlyPerformanceData {
  month: string;
  referrals: number;
  conversions: number;
  conversionRate: number;
  contractValue: number;
  averageValue: number;
  gratitudesSent: number;
  newInfluencers: number;
}

// Tier별 분포 데이터 타입
export interface TierDistributionData {
  tier: InfluencerTier;
  count: number;
  percentage: number;
  totalValue: number;
  averageValue: number;
  avgConversionRate: number;
  color: string;
  icon: string;
}

// KPI 카드 데이터 타입
export interface InfluencerKPIData {
  totalInfluencers: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
    target?: number;
    label: string;
  };
  averageConversionRate: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
    target?: number;
    label: string;
    format: 'percentage';
  };
  totalNetworkValue: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
    target?: number;
    label: string;
    format: 'currency';
  };
  avgRelationshipStrength: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
    target?: number;
    label: string;
    format: 'score';
    maxValue: 10;
  };
  monthlyGrowth: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
    label: string;
    format: 'percentage';
  };
  gratitudesSent: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
    target?: number;
    label: string;
  };
}

// 📱 UI 컴포넌트 관련 타입들

// 모달 상태 타입
export interface ModalState {
  isOpen: boolean;
  type: 'gratitude' | 'template' | 'network' | 'analytics' | 'filter';
  data?: any;
}

// 탭 상태 타입
export interface TabState {
  active: 'ranking' | 'analysis' | 'gratitude' | 'network' | 'templates';
  history: string[];
}

// 테이블 상태 타입
export interface TableState {
  sortField: string;
  sortDirection: 'asc' | 'desc';
  currentPage: number;
  pageSize: number;
  selectedRows: string[];
  searchQuery: string;
  filters: Record<string, any>;
}

// 차트 데이터 타입
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, any>;
}

export interface TimeSeriesChartData {
  data: Array<{
    date: string;
    value: number;
    secondaryValue?: number;
    label?: string;
  }>;
  config: {
    xAxisKey: string;
    yAxisKey: string;
    secondaryYAxisKey?: string;
    colors: string[];
    format: 'number' | 'currency' | 'percentage';
  };
}

// 네트워크 차트 노드 타입
export interface NetworkChartNode {
  id: string;
  name: string;
  tier: InfluencerTier;
  value: number;
  size: number;
  color: string;
  position: { x: number; y: number };
  connections: number;
  isSelected?: boolean;
  metadata: {
    totalReferrals: number;
    conversionRate: number;
    relationshipStrength: number;
  };
}

// 네트워크 차트 엣지 타입
export interface NetworkChartEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  strength: number;
  type: 'direct' | 'indirect';
  color: string;
  animated?: boolean;
}

// 🔄 API 응답 관련 타입들

// 기본 API 응답 타입
export interface InfluencerAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
}

// 영향력자 목록 API 응답
export interface InfluencersListResponse extends InfluencerAPIResponse {
  data: {
    influencers: InfluencerDisplayData[];
    totalCount: number;
    filters: AdvancedFilter;
    aggregations: {
      totalValue: number;
      averageConversion: number;
      topTier: InfluencerTier;
      mostActiveMonth: string;
    };
  };
}

// 감사 표현 이력 API 응답
export interface GratitudeHistoryResponse extends InfluencerAPIResponse {
  data: {
    history: GratitudeHistoryDisplayItem[];
    summary: {
      totalSent: number;
      deliveryRate: number;
      averageCost: number;
      topType: InfluencerGratitudeType;
      monthlyTrend: Array<{ month: string; count: number }>;
    };
  };
}

// 네트워크 분석 API 응답
export interface NetworkAnalysisResponse extends InfluencerAPIResponse {
  data: {
    analysis: NetworkAnalysisDisplayData;
    networkMap: InfluencerNetworkMap;
    insights: Array<{
      type: 'strength' | 'opportunity' | 'risk' | 'trend';
      title: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
      actionable: boolean;
    }>;
  };
}

// 🔧 유틸리티 타입들

// 부분 업데이트 타입
export type PartialInfluencerUpdate = Partial<
  Pick<
    InfluencerProfile,
    | 'tier'
    | 'relationshipStrength'
    | 'preferredContactMethod'
    | 'specialNotes'
    | 'isActive'
  >
>;

// 감사 표현 유효성 검사 타입
export interface GratitudeValidation {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  suggestions: string[];
}

// 네트워크 분석 설정 타입
export interface NetworkAnalysisSettings {
  includeInactive: boolean;
  minReferrals: number;
  timeRange: number; // days
  calculationMethod: 'weighted' | 'simple' | 'exponential';
  refreshInterval: number; // minutes
}

// 📈 대시보드 통합 타입 (dashboard 기능과의 연동)

export interface InfluencerDashboardData {
  overview: {
    totalInfluencers: number;
    activeInfluencers: number;
    topTier: InfluencerTier;
    totalValue: number;
    growthRate: number;
  };
  recent: {
    newInfluencers: InfluencerDisplayData[];
    recentGratitudes: GratitudeHistoryDisplayItem[];
    upcomingGratitudes: GratitudeHistoryDisplayItem[];
    topPerformers: InfluencerDisplayData[];
  };
  alerts: Array<{
    type:
      | 'gratitude_due'
      | 'tier_change'
      | 'performance_drop'
      | 'new_opportunity';
    priority: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    influencerId?: string;
    actionUrl?: string;
    createdAt: string;
  }>;
  quickActions: Array<{
    id: string;
    label: string;
    icon: string;
    count?: number;
    url: string;
  }>;
}

// 🎨 테마 및 스타일 관련 타입들

export interface InfluencerThemeConfig {
  tierColors: Record<InfluencerTier, string>;
  statusColors: Record<InfluencerGratitudeStatus, string>;
  chartColors: {
    primary: string[];
    secondary: string[];
    gradients: string[];
  };
  icons: Record<InfluencerGratitudeType | InfluencerTier, string>;
}

// 🔗 기존 컴포넌트 호환성을 위한 타입 별칭
export type Influencer = InfluencerDisplayData;
export type NetworkAnalysis = NetworkAnalysisDisplayData;
export type GratitudeHistoryItem = GratitudeHistoryDisplayItem;

// Re-export schema types for convenience
export type {
  InfluencerProfile,
  NewInfluencerProfile,
  InfluencerGratitudeHistory,
  NewInfluencerGratitudeHistory,
  InfluencerNetworkAnalysis,
  NewInfluencerNetworkAnalysis,
  InfluencerActivityLog,
  NewInfluencerActivityLog,
  InfluencerGratitudeTemplate,
  NewInfluencerGratitudeTemplate,
  InfluencerGratitudeType,
  InfluencerGratitudeStatus,
  InfluencerGiftType,
  InfluencerTier,
  InfluencerContactMethod,
  InfluencerActivityType,
  InfluencerDataSource,
  InfluencerOverview,
  InfluencerFilter,
  InfluencerNetworkMap,
  InfluencerRankingData,
  InfluencerAnalytics,
  Client,
  Profile,
};

// 🔧 타입 헬퍼 함수들

export function getTierDisplayName(tier: InfluencerTier): string {
  const tierNames: Record<InfluencerTier, string> = {
    bronze: '브론즈',
    silver: '실버',
    gold: '골드',
    platinum: '플래티넘',
    diamond: '다이아몬드',
  };
  return tierNames[tier];
}

export function getGratitudeTypeDisplayName(
  type: InfluencerGratitudeType
): string {
  const typeNames: Record<InfluencerGratitudeType, string> = {
    thank_you_call: '감사 전화',
    thank_you_message: '감사 메시지',
    gift_delivery: '선물 배송',
    meal_invitation: '식사 초대',
    event_invitation: '행사 초대',
    holiday_greetings: '명절 인사',
    birthday_wishes: '생일 축하',
    custom: '기타',
  };
  return typeNames[type];
}

export function getStatusDisplayName(
  status: InfluencerGratitudeStatus
): string {
  const statusNames: Record<InfluencerGratitudeStatus, string> = {
    planned: '계획됨',
    scheduled: '예약됨',
    sent: '발송됨',
    delivered: '전달됨',
    completed: '완료됨',
    cancelled: '취소됨',
    failed: '실패',
  };
  return statusNames[status];
}

export function calculateInfluencerScore(
  totalReferrals: number,
  conversionRate: number,
  totalValue: number,
  relationshipStrength: number
): number {
  const referralScore = Math.min(totalReferrals * 2, 40);
  const conversionScore = conversionRate * 30;
  const valueScore = Math.min(totalValue / 100000, 20);
  const relationshipScore = relationshipStrength;

  return referralScore + conversionScore + valueScore + relationshipScore;
}

export function determineInfluencerTier(score: number): InfluencerTier {
  if (score >= 90) return 'diamond';
  if (score >= 75) return 'platinum';
  if (score >= 60) return 'gold';
  if (score >= 40) return 'silver';
  return 'bronze';
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffMs = now.getTime() - targetDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
  return `${Math.floor(diffDays / 365)}년 전`;
}

export function isGratitudeDue(
  lastGratitudeDate: string | null,
  relationshipStrength: number,
  totalReferrals: number
): boolean {
  if (!lastGratitudeDate) return totalReferrals > 0;

  const daysSinceLastGratitude = Math.floor(
    (new Date().getTime() - new Date(lastGratitudeDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  // 관계 강도에 따른 감사 표현 주기 결정
  const baseInterval = 90; // 기본 90일
  const adjustedInterval =
    baseInterval - relationshipStrength * 5 - Math.min(totalReferrals * 2, 30);

  return daysSinceLastGratitude >= Math.max(adjustedInterval, 30);
}

export function sortInfluencersByImportance(
  influencers: InfluencerDisplayData[],
  priorityField:
    | 'totalContractValue'
    | 'conversionRate'
    | 'totalReferrals'
    | 'score' = 'totalContractValue'
): InfluencerDisplayData[] {
  return [...influencers].sort((a, b) => {
    if (priorityField === 'score') {
      const scoreA = calculateInfluencerScore(
        a.totalReferrals,
        a.conversionRate,
        a.totalContractValue,
        a.relationshipStrength
      );
      const scoreB = calculateInfluencerScore(
        b.totalReferrals,
        b.conversionRate,
        b.totalContractValue,
        b.relationshipStrength
      );
      return scoreB - scoreA;
    }
    return b[priorityField] - a[priorityField];
  });
}

// 감사 표현 유형 (enum에서 추출한 타입)
export type GratitudeType =
  | 'thank_you_call'
  | 'thank_you_message'
  | 'gift_delivery'
  | 'meal_invitation'
  | 'event_invitation'
  | 'holiday_greetings'
  | 'birthday_wishes'
  | 'custom';

// 감사 표현 상태 (enum에서 추출한 타입)
export type GratitudeStatus =
  | 'sent'
  | 'scheduled'
  | 'failed'
  | 'cancelled'
  | 'planned'
  | 'delivered'
  | 'completed';

// 감사 표현 선물 유형
export type GiftType =
  | 'flowers'
  | 'food_voucher'
  | 'coffee_voucher'
  | 'traditional_gift'
  | 'cash_gift'
  | 'experience_voucher'
  | 'custom_gift';
