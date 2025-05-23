export interface PerformanceData {
  totalClients: number;
  newClients: number;
  totalReferrals: number;
  conversionRate: number;
  revenue: number;
  growth: {
    clients: number;
    referrals: number;
    revenue: number;
  };
}

export interface TopPerformer {
  id: string;
  name: string;
  clients: number;
  conversions: number;
  revenue: number;
}

export interface KakaoReportData {
  startTime: string;
  endTime: string;
  activities: string;
  newClients: number;
  meetings: number;
  calls: number;
  tomorrowPlan: string;
  notes: string;
}

export interface PerformanceMetricsProps {
  performance: PerformanceData;
}

export interface KakaoReportProps {
  performance: PerformanceData;
}

export interface TopPerformersProps {
  performers: TopPerformer[];
}

export interface NetworkStatusProps {
  performance: PerformanceData;
}

export interface GoalProgressProps {
  // 향후 확장 가능한 목표 데이터
}
