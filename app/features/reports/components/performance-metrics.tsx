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
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';

export function PerformanceMetrics({
  performance,
  period,
  t: propT,
}: PerformanceMetricsProps) {
  const { t: hookT, i18n } = useHydrationSafeTranslation('reports');
  const t = propT || hookT;

  // 🔥 기간에 맞는 텍스트 생성
  const getPeriodText = (periodType?: string) => {
    return t(`periods.${periodType}`, '이번 달');
  };

  const periodText = getPeriodText(period?.type);
  // 통일된 통화 포맷팅 함수 사용 (현재 언어 적용)
  const formatCurrency = (amount: number) => {
    const currentLocale = i18n?.language || 'ko';
    const supportedLocale = ['ko', 'en', 'ja'].includes(currentLocale)
      ? (currentLocale as 'ko' | 'en' | 'ja')
      : 'ko';
    return formatCurrencyByUnit(amount, supportedLocale);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // 상담 타입 번역 함수
  const translateConsultationType = (type: string) => {
    return t(`consultationTypes.${type}`, type);
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
          {t('growth.noChange')}
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
          {t('growth.newData')}
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
          {isPositive ? t('growth.majorIncrease') : t('growth.majorDecrease')}
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
    if (rate >= 80)
      return { color: 'green', label: t('conversionStatus.excellent') };
    if (rate >= 60) return { color: 'blue', label: t('conversionStatus.good') };
    if (rate >= 40)
      return { color: 'yellow', label: t('conversionStatus.average') };
    if (rate >= 20)
      return { color: 'orange', label: t('conversionStatus.needsImprovement') };
    return { color: 'red', label: t('conversionStatus.warning') };
  };

  const conversionStatus = getConversionStatus(performance.conversionRate);

  return (
    <div className="space-y-4">
      {/* 상단 요약 카드 - 다크 테마에 맞춘 색상 조정 */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 border-slate-200 dark:border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-slate-900 dark:text-slate-100">
            {t('metrics.title', { period: periodText })}
          </CardTitle>
          <CardDescription className="text-slate-700 dark:text-slate-300">
            {t('metrics.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {formatNumber(performance.totalClients)}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t('metrics.totalClients')}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {formatNumber(performance.newClients)}
              </div>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                {t('metrics.newClients')}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-violet-700 dark:text-violet-400">
                {performance.conversionRate}%
              </div>
              <p className="text-sm text-violet-600 dark:text-violet-400">
                {t('metrics.conversionRate')}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                {formatCurrency(performance.revenue)}
              </div>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                {t('metrics.revenue')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 상세 지표 카드들 - 다크 테마 맞춤 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg dark:hover:shadow-slate-900/50 transition-shadow border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>{t('metrics.totalClients')}</CardDescription>
              <Users className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </div>
            <CardTitle className="text-2xl flex items-center gap-2">
              {formatNumber(performance.totalClients)}
              {performance.growth.clients !== 0 && (
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrendIndicator value={performance.growth.clients} />
            <p className="text-xs text-muted-foreground mt-1">
              {t('growth.comparison')}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg dark:hover:shadow-slate-900/50 transition-shadow border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>{t('metrics.newClients')}</CardDescription>
              <UserPlus className="h-4 w-4 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl text-emerald-700 dark:text-emerald-400">
              {formatNumber(performance.newClients)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t('metrics.referrals')}{' '}
                {formatNumber(performance.totalReferrals)}
                {t('metrics.contracts')}
              </span>
              <Badge variant="outline" className="text-xs">
                {t('badges.active')}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('metrics.referrals')} {t('efficiency.includesActivity')}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg dark:hover:shadow-slate-900/50 transition-shadow border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>{t('metrics.conversionRate')}</CardDescription>
              <BarChart3 className="h-4 w-4 text-violet-500" />
            </div>
            <CardTitle className="text-2xl flex items-center gap-2">
              {performance.conversionRate}%
              <Badge
                variant={
                  conversionStatus.color === 'green' ? 'default' : 'secondary'
                }
                className="text-xs"
              >
                {conversionStatus.label}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={performance.conversionRate} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">
              {t('conversionStatus.industryAverage')}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg dark:hover:shadow-slate-900/50 transition-shadow border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>{t('metrics.revenue')}</CardDescription>
              <DollarSign className="h-4 w-4 text-amber-500" />
            </div>
            <CardTitle className="text-2xl text-amber-700 dark:text-amber-400">
              {formatCurrency(performance.revenue)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrendIndicator value={performance.growth.revenue} />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {t('efficiency.averagePerContract')}:{' '}
                {formatCurrency(performance.averageClientValue)}
              </span>
              <Badge variant="secondary" className="text-xs">
                {performance.activeClients}
                {t('units.people')} {t('badges.inProgress')}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 추가 인사이트 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {/* 🚨 MVP: 미팅 기능 주석 처리 
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              미팅 효율성
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {performance.meetingsCount}
            </div>
            <p className="text-sm text-muted-foreground">총 미팅 수</p>
            <div className="mt-2 text-xs text-muted-foreground">
              미팅당 평균 전환:{' '}
              {performance.meetingsCount > 0
                ? (
                    (performance.newClients / performance.meetingsCount) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
        */}

        {/* 🆕 상담 효율성 (실제 상담 기록 데이터 활용) */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              {t('metrics.consultationStats.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {performance.consultationStats.consultationsThisPeriod}
            </div>
            <p className="text-sm text-muted-foreground">
              {t('metrics.consultationStats.thisPeriod', {
                period: periodText,
              })}
            </p>
            <div className="mt-2 space-y-1">
              <div className="text-xs text-muted-foreground">
                {t('metrics.consultationStats.averagePerClient', {
                  count:
                    performance.consultationStats.averageConsultationsPerClient,
                })}
              </div>
              <div className="text-xs text-muted-foreground">
                {t('metrics.consultationStats.mostFrequentType', {
                  type: translateConsultationType(
                    performance.consultationStats.mostFrequentNoteType
                  ),
                })}
              </div>
              {performance.consultationStats.consultationGrowth !== 0 && (
                <div className="text-xs">
                  <TrendIndicator
                    value={performance.consultationStats.consultationGrowth}
                    className="justify-start"
                  />
                  <span className="text-muted-foreground ml-1">
                    {t('metrics.consultationStats.growth')}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              {t('metrics.activeClients')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
              {performance.activeClients}
            </div>
            <p className="text-sm text-muted-foreground">
              {t('efficiency.activeInPipeline')}
            </p>
            <div className="mt-2 text-xs text-muted-foreground">
              {t('efficiency.percentageOfTotal', {
                percentage:
                  performance.totalClients > 0
                    ? (
                        (performance.activeClients / performance.totalClients) *
                        100
                      ).toFixed(1)
                    : 0,
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              {t('efficiency.contractCommission')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              {formatCurrency(performance.monthlyRecurringRevenue)}
            </div>
            <p className="text-sm text-muted-foreground">
              {t('efficiency.actualSalesCommission')}
            </p>
            <div className="mt-2 text-xs text-muted-foreground">
              {t('efficiency.oneTimeCommission')}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
