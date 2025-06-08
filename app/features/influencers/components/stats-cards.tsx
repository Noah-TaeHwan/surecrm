import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Progress } from '~/common/components/ui/progress';
import { Badge } from '~/common/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/common/components/ui/tooltip';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Users,
  Heart,
  Award,
  DollarSign,
  Star,
  Target,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '~/lib/utils';

// 새로운 타입 시스템 import
import type { InfluencerKPIData, NetworkAnalysisDisplayData } from '../types';

interface StatsCardsProps {
  kpiData?: InfluencerKPIData;
  networkAnalysis?: NetworkAnalysisDisplayData;
  isLoading?: boolean;
}

export function StatsCards({
  kpiData,
  networkAnalysis,
  isLoading = false,
}: StatsCardsProps) {
  // KPI 데이터가 있으면 사용하고, 없으면 networkAnalysis에서 변환
  const displayData: InfluencerKPIData =
    kpiData || convertNetworkAnalysisToKPI(networkAnalysis);

  if (isLoading) {
    return <StatsCardsLoading />;
  }

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 총 핵심 소개자 - app.css 색상 적용 */}
        <KPICard
          title="총 핵심 소개자"
          value={displayData.totalInfluencers.value}
          change={displayData.totalInfluencers.change}
          trend={displayData.totalInfluencers.trend}
          icon={<Users className="h-4 w-4" />}
          suffix="명"
          tooltip="활발한 소개 활동을 하는 고객의 총 수입니다."
          target={displayData.totalInfluencers.target}
          gradientColors="from-blue-500 to-blue-600"
        />

        {/* 평균 계약 전환율 - app.css 색상 적용 */}
        <KPICard
          title="평균 계약 전환율"
          value={displayData.averageConversionRate.value}
          change={displayData.averageConversionRate.change}
          trend={displayData.averageConversionRate.trend}
          icon={<Target className="h-4 w-4" />}
          suffix="%"
          tooltip="소개받은 고객 중 실제 계약으로 이어진 비율의 평균입니다."
          showProgress={true}
          target={displayData.averageConversionRate.target}
          gradientColors="from-green-500 to-green-600"
        />

        {/* 총 네트워크 가치 - app.css 색상 적용 */}
        <KPICard
          title="총 네트워크 가치"
          value={displayData.totalNetworkValue.value}
          change={displayData.totalNetworkValue.change}
          trend={displayData.totalNetworkValue.trend}
          icon={<DollarSign className="h-4 w-4" />}
          format="currency"
          tooltip="소개 네트워크를 통해 발생한 총 계약 금액입니다."
          target={displayData.totalNetworkValue.target}
          gradientColors="from-purple-500 to-purple-600"
        />

        {/* 평균 관계 강도 - app.css 색상 적용 */}
        <KPICard
          title="평균 관계 강도"
          value={displayData.avgRelationshipStrength.value}
          change={displayData.avgRelationshipStrength.change}
          trend={displayData.avgRelationshipStrength.trend}
          icon={<Heart className="h-4 w-4" />}
          suffix={`/${displayData.avgRelationshipStrength.maxValue}`}
          tooltip="소개자들과의 관계 강도를 종합적으로 평가한 점수입니다."
          showProgress={true}
          maxValue={displayData.avgRelationshipStrength.maxValue}
          target={displayData.avgRelationshipStrength.target}
          gradientColors="from-red-500 to-pink-500"
        />

        {/* 월별 성장률 - app.css 색상 적용 */}
        <KPICard
          title="월별 성장률"
          value={displayData.monthlyGrowth.value}
          change={displayData.monthlyGrowth.change}
          trend={displayData.monthlyGrowth.trend}
          icon={<BarChart3 className="h-4 w-4" />}
          suffix="%"
          tooltip="지난 달 대비 소개 네트워크 성장률입니다."
          showTrendColor={true}
          gradientColors="from-indigo-500 to-indigo-600"
        />

        {/* 감사 표현 전송 - app.css 색상 적용 */}
        <KPICard
          title="감사 표현 전송"
          value={displayData.gratitudesSent.value}
          change={displayData.gratitudesSent.change}
          trend={displayData.gratitudesSent.trend}
          icon={<Star className="h-4 w-4" />}
          suffix="건"
          tooltip="이번 달 전송한 감사 표현의 총 건수입니다."
          target={displayData.gratitudesSent.target}
          gradientColors="from-yellow-500 to-orange-500"
        />
      </div>
    </TooltipProvider>
  );
}

// 🎨 Enhanced KPI 카드 컴포넌트 - app.css 스타일 완전 적용
interface KPICardProps {
  title: string;
  value: number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  suffix?: string;
  format?: 'number' | 'currency' | 'percentage' | 'score';
  tooltip?: string;
  showProgress?: boolean;
  showTrendColor?: boolean;
  maxValue?: number;
  target?: number;
  gradientColors?: string;
}

function KPICard({
  title,
  value,
  change,
  trend,
  icon,
  suffix = '',
  format = 'number',
  tooltip,
  showProgress = false,
  showTrendColor = false,
  maxValue = 100,
  target,
  gradientColors = 'from-gray-500 to-gray-600',
}: KPICardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        if (val >= 100000000) {
          return `${(val / 100000000).toFixed(1)}억원`;
        } else if (val >= 10000) {
          return `${(val / 10000).toFixed(1)}만원`;
        }
        return `${val.toLocaleString()}원`;
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'score':
        return val.toFixed(1);
      default:
        return val.toLocaleString();
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    if (!showTrendColor) return 'text-foreground';
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const progressValue = showProgress
    ? Math.min((value / (maxValue || 100)) * 100, 100)
    : 0;

  const achievementRate = target ? (value / target) * 100 : 0;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-border cursor-pointer">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r text-white',
                  gradientColors
                )}
              >
                {icon}
              </div>
              {change !== undefined && (
                <div className="flex items-center gap-1">
                  {getTrendIcon()}
                  <span className="text-xs font-medium text-muted-foreground">
                    {isFinite(change) && !isNaN(change)
                      ? Math.abs(change) >= 500
                        ? change > 0
                          ? '대폭↑'
                          : '대폭↓'
                        : `${Math.round(Math.abs(change) * 10) / 10}%`
                      : '신규'}
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground leading-none">
                  {title}
                </h3>
                <div
                  className={cn(
                    'text-2xl font-bold leading-none',
                    getTrendColor()
                  )}
                >
                  {formatValue(value)}
                  {suffix && (
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      {suffix}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar (조건부 표시) */}
              {showProgress && (
                <div className="space-y-1">
                  <Progress value={progressValue} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {progressValue.toFixed(0)}% 달성
                  </div>
                </div>
              )}

              {/* Target Achievement (목표가 있는 경우) */}
              {target && achievementRate > 0 && (
                <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                  <div
                    className={cn(
                      'text-xs font-medium',
                      achievementRate >= 100
                        ? 'text-green-600'
                        : achievementRate >= 80
                        ? 'text-blue-600'
                        : achievementRate >= 60
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    )}
                  >
                    목표: {formatValue(target)}
                    {suffix}
                  </div>
                  <Badge
                    variant={achievementRate >= 100 ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {achievementRate.toFixed(0)}%
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="text-sm">{tooltip}</p>
        {target && (
          <p className="text-xs text-muted-foreground mt-1">
            목표 달성률: {achievementRate.toFixed(1)}%
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

// 🎭 Loading State - 향상된 스켈레톤
function StatsCardsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 bg-muted rounded-lg" />
              <div className="h-4 w-8 bg-muted rounded" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-8 w-16 bg-muted rounded" />
              <div className="h-2 w-full bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// 🔄 NetworkAnalysis를 KPI로 변환하는 함수 (기존 로직 유지하되 개선)
function convertNetworkAnalysisToKPI(
  networkAnalysis?: NetworkAnalysisDisplayData
): InfluencerKPIData {
  if (!networkAnalysis) {
    return getDefaultKPIData();
  }

  const {
    totalInfluencers,
    activeInfluencers,
    averageConversionRate,
    totalNetworkValue,
    averageRelationshipStrength,
    monthlyGrowth,
    totalGratitudesSent,
  } = networkAnalysis;

  return {
    totalInfluencers: {
      value: totalInfluencers,
      change: monthlyGrowth > 0 ? monthlyGrowth : 0,
      trend: monthlyGrowth > 0 ? 'up' : monthlyGrowth < 0 ? 'down' : 'stable',
      target: Math.max(totalInfluencers * 1.1, 50), // 10% 증가 또는 최소 50명
      label: '총 핵심 소개자',
    },
    averageConversionRate: {
      value: averageConversionRate,
      change: 0, // 기본값
      trend: 'stable',
      target: 80, // 80% 목표
      label: '평균 계약 전환율',
      format: 'percentage',
    },
    totalNetworkValue: {
      value: totalNetworkValue,
      change: monthlyGrowth,
      trend: monthlyGrowth > 0 ? 'up' : monthlyGrowth < 0 ? 'down' : 'stable',
      target: totalNetworkValue * 1.2, // 20% 증가 목표
      label: '총 네트워크 가치',
      format: 'currency',
    },
    avgRelationshipStrength: {
      value: averageRelationshipStrength,
      change: 0,
      trend: 'stable',
      target: 8.0, // 8점 목표
      label: '평균 관계 강도',
      format: 'score',
      maxValue: 10,
    },
    monthlyGrowth: {
      value: monthlyGrowth,
      change: 0,
      trend: monthlyGrowth > 0 ? 'up' : monthlyGrowth < 0 ? 'down' : 'stable',
      label: '월별 성장률',
      format: 'percentage',
    },
    gratitudesSent: {
      value: totalGratitudesSent,
      change: 0,
      trend: 'stable',
      target: totalInfluencers * 2, // 인당 2건 목표
      label: '감사 표현 전송',
    },
  };
}

// 기본 KPI 데이터
function getDefaultKPIData(): InfluencerKPIData {
  return {
    totalInfluencers: {
      value: 0,
      change: 0,
      trend: 'stable',
      label: '총 핵심 소개자',
    },
    averageConversionRate: {
      value: 0,
      change: 0,
      trend: 'stable',
      label: '평균 계약 전환율',
      format: 'percentage',
    },
    totalNetworkValue: {
      value: 0,
      change: 0,
      trend: 'stable',
      label: '총 네트워크 가치',
      format: 'currency',
    },
    avgRelationshipStrength: {
      value: 0,
      change: 0,
      trend: 'stable',
      label: '평균 관계 강도',
      format: 'score',
      maxValue: 10,
    },
    monthlyGrowth: {
      value: 0,
      change: 0,
      trend: 'stable',
      label: '월별 성장률',
      format: 'percentage',
    },
    gratitudesSent: {
      value: 0,
      change: 0,
      trend: 'stable',
      label: '감사 표현 전송',
    },
  };
}
