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
} from 'lucide-react';
import { cn } from '~/lib/utils';
import type { PerformanceMetricsProps } from '../types';

export function PerformanceMetrics({ performance }: PerformanceMetricsProps) {
  const formatCurrency = (amount: number) => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}억원`;
    } else if (amount >= 10000000) {
      return `${(amount / 10000000).toFixed(1)}천만원`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}백만원`;
    } else {
      return `${amount.toLocaleString()}원`;
    }
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

    if (isZero) {
      return (
        <Badge variant="secondary" className="text-xs">
          변화없음
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
          {Math.abs(value)}
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
    <div className="space-y-4">
      {/* 상단 요약 카드 - 다크 테마에 맞춘 색상 조정 */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 border-slate-200 dark:border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-slate-900 dark:text-slate-100">
            이번 달 핵심 성과
          </CardTitle>
          <CardDescription className="text-slate-700 dark:text-slate-300">
            주요 비즈니스 지표 요약
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {formatNumber(performance.totalClients)}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                총 고객수
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {formatNumber(performance.newClients)}
              </div>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                신규 고객
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-violet-700 dark:text-violet-400">
                {performance.conversionRate}%
              </div>
              <p className="text-sm text-violet-600 dark:text-violet-400">
                전환율
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                {formatCurrency(performance.revenue)}
              </div>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                총 수익
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
              <CardDescription>총 고객 수</CardDescription>
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
            <p className="text-xs text-muted-foreground mt-1">지난 기간 대비</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg dark:hover:shadow-slate-900/50 transition-shadow border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>신규 고객</CardDescription>
              <UserPlus className="h-4 w-4 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl text-emerald-700 dark:text-emerald-400">
              {formatNumber(performance.newClients)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                소개 {formatNumber(performance.totalReferrals)}건
              </span>
              <Badge variant="outline" className="text-xs">
                활발
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">소개 활동 포함</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg dark:hover:shadow-slate-900/50 transition-shadow border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>계약 전환율</CardDescription>
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
            <p className="text-xs text-muted-foreground">업계 평균: 50-70%</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg dark:hover:shadow-slate-900/50 transition-shadow border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>총 수익</CardDescription>
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
                고객당 평균: {formatCurrency(performance.averageClientValue)}
              </span>
              <Badge variant="secondary" className="text-xs">
                {performance.activeClients}명 계약중
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 추가 인사이트 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
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

        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              활성 고객
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
              {performance.activeClients}
            </div>
            <p className="text-sm text-muted-foreground">현재 계약중</p>
            <div className="mt-2 text-xs text-muted-foreground">
              전체 대비:{' '}
              {performance.totalClients > 0
                ? (
                    (performance.activeClients / performance.totalClients) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />월 수수료
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              {formatCurrency(performance.monthlyRecurringRevenue)}
            </div>
            <p className="text-sm text-muted-foreground">예상 월수익</p>
            <div className="mt-2 text-xs text-muted-foreground">
              보험료의 약 10% 기준
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
