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
  averageClientValue: number;
  meetingsCount: number;
  activeClients: number;
  monthlyRecurringRevenue: number;
  consultationStats: {
    totalConsultations: number;
    consultationsThisPeriod: number;
    averageConsultationsPerClient: number;
    mostFrequentNoteType: string;
    consultationGrowth: number;
  };
}

export interface TopPerformer {
  id: string;
  name: string;
  clients: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  efficiency: number;
}

export interface KakaoReportData {
  workStartTime: string;
  workEndTime: string;
  clientMeetings: number;
  phoneCalls: number;
  quotations: number;
  contracts: number;
  referrals: number;
  prospects: number;
  followUps: number;
  adminTasks: number;
}

export interface ReportPeriod {
  type: 'week' | 'month' | 'quarter' | 'year';
  startDate: Date;
  endDate: Date;
  label: string;
}

export interface PerformanceGrade {
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  score: number;
  label: string;
  color: string;
}

export interface ImprovementSuggestion {
  category: 'conversion' | 'acquisition' | 'referral' | 'revenue';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
}

export interface ReportTemplateConfig {
  sections: string[];
  format: 'kakao' | 'detailed' | 'comprehensive';
  autoGenerate: boolean;
  includeCharts?: boolean;
  includeTrends?: boolean;
  includeComparisons?: boolean;
}

export interface DownloadOptions {
  format: 'json' | 'csv' | 'pdf';
  includeCharts: boolean;
  dateRange: ReportPeriod;
  sections: string[];
}

export interface PerformanceMetricsProps {
  performance: PerformanceData;
  period?: ReportPeriod;
  showComparison?: boolean;
  t?: (key: string, options?: any) => string;
}

export interface KakaoReportProps {
  performance: PerformanceData;
  user?: {
    id: string;
    name: string;
    email?: string;
  };
  period?: string;
  defaultData?: Partial<KakaoReportData>;
  onDataChange?: (data: KakaoReportData) => void;
}

export interface TopPerformersProps {
  performers: TopPerformer[];
  currentUserId?: string;
  showEfficiency?: boolean;
}

export interface NetworkStatusProps {
  performance: PerformanceData;
  grade?: PerformanceGrade;
  suggestions?: ImprovementSuggestion[];
}

export interface GoalProgressProps {
  currentValue: number;
  targetValue: number;
  metric: string;
  period: ReportPeriod;
  trend?: 'up' | 'down' | 'stable';
}

export interface InsightsTabsProps {
  performance: PerformanceData;
  topPerformers: TopPerformer[];
  period?: ReportPeriod;
  showAdvancedMetrics?: boolean;
}

export interface ReportsPageProps {
  performance: PerformanceData;
  topPerformers: TopPerformer[];
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
    borderWidth?: number;
  }[];
}

export interface MetricCard {
  title: string;
  value: number | string;
  change?: {
    value: number;
    percentage: number;
    direction: 'up' | 'down' | 'neutral';
  };
  format: 'number' | 'currency' | 'percentage';
  icon?: string;
  color?: string;
}

export interface ReportFilters {
  dateRange: ReportPeriod;
  includeInactive?: boolean;
  clientTypes?: string[];
  insuranceTypes?: string[];
  teamMembers?: string[];
}

export interface ReportStatus {
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  lastUpdated?: Date;
}

export interface UserReportSettings {
  defaultPeriod: 'week' | 'month' | 'quarter' | 'year';
  autoRefresh: boolean;
  refreshInterval: number;
  emailNotifications: boolean;
  preferredFormat: 'kakao' | 'detailed' | 'comprehensive';
  customMetrics: string[];
}

export type ReportType =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly';
export type MetricType =
  | 'clients'
  | 'revenue'
  | 'conversion'
  | 'referrals'
  | 'meetings';
export type TrendDirection = 'up' | 'down' | 'stable';
export type PerformanceLevel =
  | 'excellent'
  | 'good'
  | 'average'
  | 'needs_improvement'
  | 'critical';

export interface ReportGenerationResult {
  success: boolean;
  reportId?: string;
  downloadUrl?: string;
  errorMessage?: string;
  generatedAt: Date;
  expiresAt?: Date;
}
