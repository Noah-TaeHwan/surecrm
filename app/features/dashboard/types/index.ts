// 📊 Dashboard 기능 전용 타입 정의
// Prefix 네이밍 컨벤션: app_dashboard_ 사용 (완전 통일)

// 스키마에서 기본 타입들 import (이름 충돌 방지)
import type {
  DashboardPerformanceMetrics as SchemaDashboardPerformanceMetrics,
  DashboardGoal as SchemaDashboardGoal,
  DashboardActivityLog,
  DashboardNotification as SchemaDashboardNotification,
  DashboardWidget,
  DashboardQuickAction,
  NewDashboardGoal,
  NewDashboardWidget,
  NewDashboardQuickAction,
  DashboardGoalType,
  DashboardGoalPeriod,
  DashboardActivityType,
  DashboardNotificationType,
  DashboardNotificationPriority,
  DashboardMetricPeriod,
} from '../lib/schema';

// 글로벌 스키마에서 관련 타입들 import
import type { Client, Meeting, Referral, Profile } from '~/lib/schema';

// 🎯 **Dashboard 화면 표시용 타입들**

// 대시보드 메인 개요 데이터
export interface DashboardOverview {
  metrics: SchemaDashboardPerformanceMetrics | null;
  goals: SchemaDashboardGoal[];
  recentActivities: DashboardActivityLog[];
  notifications: SchemaDashboardNotification[];
  widgets: DashboardWidget[];
  quickActions: DashboardQuickAction[];
  // 계산된 필드들
  totalNotifications: number;
  unreadNotifications: number;
  activeGoalsCount: number;
  achievedGoalsCount: number;
}

// 사용자 정보 (대시보드용)
export interface DashboardUserInfo {
  id: string;
  name: string;
  fullName: string;
  role: string;
  profileImageUrl?: string;
  lastLoginAt?: string;
  // 개인화 설정
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    timezone: string;
    dashboardLayout: 'grid' | 'list';
  };
}

// 📊 **통계 및 KPI 관련 타입들**

// 핵심 성과 지표
export interface DashboardKPIData {
  totalClients: number;
  monthlyNewClients: number;
  totalReferrals: number;
  conversionRate: number;
  monthlyGrowth: {
    clients: number;
    referrals: number;
    revenue: number;
  };
  // 계산된 필드들
  clientGrowthPercentage: number;
  referralGrowthPercentage: number;
  revenueGrowthPercentage: number;
  averageClientValue: number;
  // 🏢 보험계약 관련 KPI
  totalActiveContracts?: number;
  totalMonthlyPremium?: number;
  actualTotalCommission?: number;
}

// 오늘의 통계
export interface DashboardTodayStats {
  scheduledMeetings: number;
  pendingTasks: number;
  newReferrals: number;
  completedMeetings: number;
  missedMeetings: number;
  urgentNotifications: number;
  // 시간대별 세분화
  morningMeetings: number;
  afternoonMeetings: number;
  eveningMeetings: number;
}

// 파이프라인 데이터
export interface DashboardPipelineData {
  stages: {
    id: string;
    name: string;
    clientCount: number;
    value: number;
    color: string;
    order: number;
    conversionRate: number;
  }[];
  totalValue: number;
  monthlyTarget: number;
  progressPercentage: number;
  // 트렌드 데이터
  weeklyTrend: {
    date: string;
    value: number;
    clientCount: number;
  }[];
}

// 📈 **차트 및 시각화 관련 타입들**

// 차트 데이터 기본 구조
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, any>;
}

// 시계열 차트 데이터
export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  category?: string;
  metadata?: Record<string, any>;
}

// 차트 설정
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  title: string;
  subtitle?: string;
  colors: string[];
  showLegend: boolean;
  showGrid: boolean;
  animation: boolean;
  responsive: boolean;
  height?: number;
}

// 📅 **일정 및 미팅 관련 타입들**

// 오늘의 미팅 (대시보드용)
export interface DashboardMeeting {
  id: string;
  title: string;
  clientName: string;
  clientId: string;
  startTime: string;
  endTime: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'in_progress';
  location: string;
  isUrgent: boolean;
  description?: string;
  // 관련 정보
  clientImportance: 'high' | 'medium' | 'low';
  hasChecklist: boolean;
  checklistProgress?: number;
}

// 일정 요약
export interface DashboardAgendaSummary {
  todayMeetings: DashboardMeeting[];
  upcomingMeetings: DashboardMeeting[];
  pendingTasks: {
    id: string;
    title: string;
    dueDate: string;
    priority: 'high' | 'medium' | 'low';
    relatedClientId?: string;
    relatedClientName?: string;
  }[];
  // 통계
  totalMeetingsToday: number;
  completedMeetingsToday: number;
  overdueTasks: number;
}

// 👥 **고객 관련 타입들**

// 최근 고객 (대시보드용)
export interface DashboardRecentClient {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  currentStage: string;
  importance: 'high' | 'medium' | 'low';
  lastContactDate?: string;
  nextMeetingDate?: string;
  referralDepth: number;
  contractAmount?: number;
  // 계산된 필드들
  daysSinceLastContact: number;
  engagementScore: number;
}

// 고객 현황 데이터
export interface DashboardClientData {
  recentClients: DashboardRecentClient[];
  totalClients: number;
  newClientsThisMonth: number;
  topClientsByValue: DashboardRecentClient[];
  // 분포 통계
  stageDistribution: {
    stageName: string;
    count: number;
    percentage: number;
  }[];
  importanceDistribution: {
    importance: 'high' | 'medium' | 'low';
    count: number;
    percentage: number;
  }[];
}

// 🔗 **소개 네트워크 관련 타입들**

// 소개 인사이트
export interface DashboardReferralInsights {
  topReferrers: {
    id: string;
    fullName: string;
    referralCount: number;
    conversionRate: number;
    totalValue: number;
    lastReferralDate: string;
    relationship: string;
  }[];
  networkStats: {
    totalConnections: number;
    networkDepth: number;
    activeReferrers: number;
    monthlyGrowth: number;
    averageReferralsPerContact: number;
  };
  // 트렌드 데이터
  monthlyReferralTrend: {
    month: string;
    referralCount: number;
    conversionCount: number;
    conversionRate: number;
  }[];
}

// 🎯 **목표 관리 관련 타입들**

// 목표 설정 폼 데이터
export interface DashboardGoalFormData {
  title: string;
  description?: string;
  goalType: DashboardGoalType;
  targetValue: number;
  period: DashboardGoalPeriod;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// 목표 진행 상황
export interface DashboardGoalProgress
  extends Omit<SchemaDashboardGoal, 'progressPercentage'> {
  progressPercentage: number;
  remainingDays: number;
  isOnTrack: boolean;
  projectedCompletion: number;
  // 세부 진행 상황
  dailyProgress: {
    date: string;
    value: number;
    target: number;
  }[];
}

// 🔔 **알림 관련 타입들**

// 알림 표시용
export interface DashboardNotificationDisplay
  extends Omit<SchemaDashboardNotification, 'actionUrl' | 'actionLabel'> {
  relativeTime: string; // "2분 전", "1시간 전" 등
  categoryIcon: string;
  actionUrl?: string | null;
  actionLabel?: string | null;
}

// 알림 요약
export interface DashboardNotificationSummary {
  total: number;
  unread: number;
  urgent: number;
  byType: {
    type: DashboardNotificationType;
    count: number;
  }[];
  recent: DashboardNotificationDisplay[];
}

// 🔧 **위젯 관련 타입들**

// 위젯 표시용 데이터
export interface DashboardWidgetData {
  widget: DashboardWidget;
  data: any; // 위젯별로 다른 데이터 구조
  isLoading: boolean;
  error?: string;
  lastUpdated: string;
}

// 위젯 레이아웃
export interface DashboardLayout {
  widgets: {
    id: string;
    type: string;
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    isVisible: boolean;
  }[];
  gridSize: {
    columns: number;
    rows: number;
  };
}

// ⚡ **빠른 액션 관련 타입들**

// 빠른 액션 표시용
export interface DashboardQuickActionDisplay extends DashboardQuickAction {
  isRecentlyUsed: boolean;
  badgeCount?: number; // 알림이나 미완료 항목 수
  category: 'primary' | 'secondary' | 'utility';
}

// 📊 **필터링 및 검색 관련 타입들**

// 대시보드 필터
export interface DashboardFilter {
  period: DashboardMetricPeriod;
  dateRange?: {
    start: Date;
    end: Date;
  };
  teamId?: string;
  goalTypes?: DashboardGoalType[];
  activityTypes?: DashboardActivityType[];
  clientImportance?: ('high' | 'medium' | 'low')[];
  meetingStatus?: ('scheduled' | 'completed' | 'cancelled')[];
}

// 검색 결과
export interface DashboardSearchResult {
  clients: DashboardRecentClient[];
  meetings: DashboardMeeting[];
  goals: SchemaDashboardGoal[];
  activities: DashboardActivityLog[];
  totalResults: number;
}

// 🎨 **UI 관련 타입들**

// 테마 설정
export interface DashboardTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
}

// 레스폰시브 브레이크포인트
export type DashboardBreakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

// 로딩 상태
export interface DashboardLoadingState {
  overview: boolean;
  kpi: boolean;
  agenda: boolean;
  pipeline: boolean;
  clients: boolean;
  referrals: boolean;
  notifications: boolean;
}

// 에러 상태
export interface DashboardErrorState {
  overview?: string;
  kpi?: string;
  agenda?: string;
  pipeline?: string;
  clients?: string;
  referrals?: string;
  notifications?: string;
}

// 🔄 **액션 및 이벤트 관련 타입들**

// 대시보드 액션 타입
export type DashboardActionType =
  | 'SET_GOAL'
  | 'UPDATE_WIDGET'
  | 'REFRESH_DATA'
  | 'MARK_NOTIFICATION_READ'
  | 'QUICK_ACTION_EXECUTE'
  | 'FILTER_CHANGE'
  | 'LAYOUT_CHANGE';

// 액션 페이로드
export interface DashboardActionPayload {
  type: DashboardActionType;
  data: any;
  timestamp: Date;
  userId: string;
}

// 📈 **성능 및 분석 관련 타입들**

// 대시보드 성능 메트릭
export interface DashboardPerformanceMetrics {
  loadTime: number;
  renderTime: number;
  dataFetchTime: number;
  userInteractions: number;
  errorCount: number;
  lastOptimized: Date;
}

// 사용자 행동 분석
export interface DashboardUserBehavior {
  mostUsedWidgets: string[];
  frequentActions: string[];
  sessionDuration: number;
  bounceRate: number;
  conversionRate: number;
}

// 🔄 **호환성 및 마이그레이션 관련 타입들**

// 레거시 타입들 (하위 호환성)
/** @deprecated Use SchemaDashboardGoal instead */
export type LegacyGoal = SchemaDashboardGoal;

/** @deprecated Use DashboardWidget instead */
export type LegacyWidget = DashboardWidget;

/** @deprecated Use SchemaDashboardNotification instead */
export type LegacyNotification = SchemaDashboardNotification;

// 타입 헬퍼 함수들
export const dashboardTypeHelpers = {
  // 진행률 계산
  calculateProgress: (current: number, target: number): number => {
    return target > 0 ? Math.min((current / target) * 100, 100) : 0;
  },

  // 목표 상태 확인
  getGoalStatus: (
    goal: SchemaDashboardGoal
  ): 'on_track' | 'behind' | 'ahead' | 'completed' => {
    if (goal.isAchieved) return 'completed';

    const progress = dashboardTypeHelpers.calculateProgress(
      Number(goal.currentValue),
      Number(goal.targetValue)
    );

    const today = new Date();
    const endDate = new Date(goal.endDate);
    const startDate = new Date(goal.startDate);
    const totalDays =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const elapsedDays =
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const expectedProgress = (elapsedDays / totalDays) * 100;

    if (progress >= expectedProgress + 10) return 'ahead';
    if (progress >= expectedProgress - 10) return 'on_track';
    return 'behind';
  },

  // 상대 시간 계산
  getRelativeTime: (date: Date | string): string => {
    const now = new Date();
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    const diffInMinutes = (now.getTime() - targetDate.getTime()) / (1000 * 60);

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return `${Math.floor(diffInMinutes / 1440)}일 전`;
  },

  // 중요도 순 정렬
  sortByImportance: <T extends { importance: 'high' | 'medium' | 'low' }>(
    items: T[]
  ): T[] => {
    const importanceOrder = { high: 3, medium: 2, low: 1 };
    return items.sort(
      (a, b) => importanceOrder[b.importance] - importanceOrder[a.importance]
    );
  },
};

// 📤 **Export 정리**

// 스키마 타입들 re-export (편의성)
export type {
  DashboardPerformanceMetrics as AppDashboardPerformanceMetrics,
  DashboardGoal as AppDashboardGoal,
  DashboardActivityLog as AppDashboardActivityLog,
  DashboardNotification as AppDashboardNotification,
  DashboardWidget as AppDashboardWidget,
  DashboardQuickAction as AppDashboardQuickAction,
  DashboardGoalType,
  DashboardGoalPeriod,
  DashboardActivityType,
  DashboardNotificationType,
  DashboardNotificationPriority,
  DashboardMetricPeriod,
} from '../lib/schema';
