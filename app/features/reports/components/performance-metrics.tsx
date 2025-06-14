import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Progress } from '~/common/components/ui/progress';
import { Badge } from '~/common/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  BarChart3,
  DollarSign,
  UserPlus,
  ArrowUpRight,
  MessageSquare,
} from 'lucide-react';
import { cn } from '~/lib/utils';
import { formatCurrencyByUnit } from '~/lib/utils/currency';
import type { PerformanceData } from '../lib/supabase-reports-data';
import type { PerformanceMetricsProps } from '../types';

export function PerformanceMetrics({
  performance,
  period,
}: PerformanceMetricsProps) {
  // 🔥 기간에 맞는 텍스트 생성
  const getPeriodText = (periodType?: string) => {
    switch (periodType) {
      case 'week':
        return '이번 주';
      case 'month':
        return '이번 달';
      case 'quarter':
        return '이번 분기';
      case 'year':
        return '올해';
      default:
        return '이번 달';
    }
  };

  const periodText = getPeriodText(period?.type);
  // 통일된 통화 포맷팅 함수 사용
  const formatCurrency = (amount: number) => {
    return formatCurrencyByUnit(amount);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const TrendIndicator = ({
    value,
    className,
    showPercentage = true,
  }: {
    value: number;
    className?: string;
    showPercentage?: boolean;
  }) => {
    const isPositive = value > 0;
    const isZero = value === 0;
    const isInfinite = !isFinite(value);

    // 0인 경우
    if (isZero) {
      return (
        <Badge variant="secondary" className="text-xs">
          변화없음
        </Badge>
      );
    }

    // Infinity나 NaN인 경우 (처음 생성된 데이터)
    if (isInfinite) {
      return (
        <Badge
          variant="outline"
          className="text-xs text-blue-600 dark:text-blue-400"
        >
          신규 데이터
        </Badge>
      );
    }

    // 매우 큰 값인 경우 (500% 이상)
    if (Math.abs(value) >= 500) {
      return (
        <Badge
          variant="outline"
          className="text-xs text-purple-600 dark:text-purple-400"
        >
          {isPositive ? '대폭 증가' : '대폭 감소'}
        </Badge>
      );
    }

    return (
      <div
        className={cn(
          'flex items-center gap-1 text-sm font-medium',
          isPositive
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400',
          className
        )}
      >
        {isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        <span>
          {isPositive ? '+' : ''}
          {Math.round(Math.abs(value) * 10) / 10}
          {showPercentage ? '%' : ''}
        </span>
      </div>
    );
  };

  // 전환율에 따른 상태 표시
  const getConversionStatus = (rate: number) => {
    if (rate >= 80) return { color: 'green', label: '매우 좋음' };
    if (rate >= 60) return { color: 'blue', label: '좋음' };
    if (rate >= 40) return { color: 'yellow', label: '보통' };
    if (rate >= 20) return { color: 'orange', label: '개선 필요' };
    return { color: 'red', label: '요주의' };
  };

  const conversionStatus = getConversionStatus(performance.conversionRate);

  return (
    <div className="space-y-6">
      {/* 핵심 성과 지표 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 총 고객 수 */}
        <Card className="hover:shadow-md transition-all duration-200 border-border/50 hover:border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 p-2 bg-slate-500/10 rounded-lg">
                  <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    총 고객 수
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    전체 관리 고객
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="flex items-center justify-end gap-2">
                  <p className="text-xl font-bold text-foreground">
                    {formatNumber(performance.totalClients)}
                  </p>
                  {performance.growth.clients !== 0 && (
                    <TrendIndicator value={performance.growth.clients} />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 신규 고객 */}
        <Card className="hover:shadow-md transition-all duration-200 border-border/50 hover:border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 p-2 bg-emerald-500/10 rounded-lg">
                  <UserPlus className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    신규 고객
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    소개 {formatNumber(performance.totalReferrals)}건
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                  {formatNumber(performance.newClients)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 계약 전환율 */}
        <Card className="hover:shadow-md transition-all duration-200 border-border/50 hover:border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 p-2 bg-violet-500/10 rounded-lg">
                  <BarChart3 className="h-4 w-4 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    계약 전환율
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    업계 평균: 50-70%
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="flex items-center justify-end gap-2">
                  <p className="text-xl font-bold text-violet-700 dark:text-violet-400">
                    {performance.conversionRate}%
                  </p>
                  <Badge
                    variant={
                      conversionStatus.color === 'green'
                        ? 'default'
                        : 'secondary'
                    }
                    className="text-xs"
                  >
                    {conversionStatus.label}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 총 수수료 */}
        <Card className="hover:shadow-md transition-all duration-200 border-border/50 hover:border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 p-2 bg-amber-500/10 rounded-lg">
                  <DollarSign className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    총 수수료
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    계약당 평균:{' '}
                    {formatCurrency(performance.averageClientValue)}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="flex items-center justify-end gap-2">
                  <p className="text-xl font-bold text-amber-700 dark:text-amber-400">
                    {formatCurrency(performance.revenue)}
                  </p>
                  {performance.growth.revenue !== 0 && (
                    <TrendIndicator value={performance.growth.revenue} />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 추가 인사이트 카드들 - 콤팩트한 가로 레이아웃 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {/* 상담 효율성 */}
        <Card className="hover:shadow-md transition-all duration-200 border-border/50 hover:border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 p-2 bg-blue-500/10 rounded-lg">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    상담 효율성
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {periodText} 상담 건수
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="flex items-center justify-end gap-2">
                  <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
                    {performance.consultationStats.consultationsThisPeriod}
                  </p>
                  {performance.consultationStats.consultationGrowth !== 0 && (
                    <TrendIndicator
                      value={performance.consultationStats.consultationGrowth}
                    />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 활성 고객 */}
        <Card className="hover:shadow-md transition-all duration-200 border-border/50 hover:border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 p-2 bg-purple-500/10 rounded-lg">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    활성 고객
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    영업 파이프라인 진행 중
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-xl font-bold text-purple-700 dark:text-purple-400">
                  {performance.activeClients}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 계약 수수료 */}
        <Card className="hover:shadow-md transition-all duration-200 border-border/50 hover:border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 p-2 bg-green-500/10 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    계약 수수료
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    실제 영업 수수료
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-xl font-bold text-green-700 dark:text-green-400">
                  {formatCurrency(performance.monthlyRecurringRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
