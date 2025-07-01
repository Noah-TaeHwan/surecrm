import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
// 사용하지 않는 import들 제거
import { Progress } from '~/common/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  Lightbulb,
  BarChart3,
  Zap,
  CheckCircle,
  AlertTriangle,
  Star,
  Timer,
} from 'lucide-react';
import { cn } from '~/lib/utils';
// formatCurrencyByUnit 제거 - useHydrationSafeTranslation의 formatCurrency 사용
import type { PerformanceData, TopPerformer } from '../types';
import { Badge } from '~/common/components/ui/badge';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';

interface InsightsTabsProps {
  performance: PerformanceData;
  topPerformers?: TopPerformer[];
  userGoals?: Array<{
    id: string;
    title: string;
    goalType:
      | 'revenue'
      | 'clients'
      | 'referrals'
      | 'conversion_rate'
      | 'meetings';
    targetValue: number;
    currentValue: number;
    progress: number;
    period: string;
    startDate: string;
    endDate: string;
    agentId: string;
    teamId?: string | null;
    description?: string | null;
    isActive: boolean;
    isAchieved: boolean;
    achievedAt?: Date | null;
    progressPercentage: string; // 🔧 수정: decimal 타입은 문자열로 반환됨
    metadata?: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export function InsightsTabs({
  performance,
  userGoals = [],
}: Omit<InsightsTabsProps, 'topPerformers'>) {
  const { t, formatCurrency, formatNumber } =
    useHydrationSafeTranslation('reports');
  // 🎯 실제 사용자 목표 데이터 활용
  const currentMonthGoals = userGoals
    .filter(goal => goal.goalType !== 'meetings') // meetings 타입 제외
    .filter(goal => {
      const goalStart = new Date(goal.startDate);
      const goalEnd = new Date(goal.endDate);
      const now = new Date();
      return goalStart <= now && goalEnd >= now;
    });

  // 목표별 데이터 매핑 (현재 사용되지 않음)

  const conversionRate = performance.conversionRate || 0;
  const nextMonthTarget = Math.round((performance.newClients || 0) * 1.25);

  // 🔧 개선: 실제 데이터 기반 계산
  const hasData =
    performance.totalClients > 0 ||
    performance.newClients > 0 ||
    performance.revenue > 0;
  const quarterlyGrowth = {
    clients: performance.growth?.clients || 0,
    revenue: performance.growth?.revenue || 0,
    referrals: performance.growth?.referrals || 0,
  };

  // 업무 효율성 지표 계산 (현재 주석처리된 섹션에서만 사용)

  // 🛡️ hydration-safe formatCurrency는 useHydrationSafeTranslation에서 제공

  // 🛡️ hydration-safe 목표값 포맷팅
  const formatGoalValue = (value: number, type: string) => {
    switch (type) {
      case 'revenue':
        return formatCurrency(value);
      case 'conversion_rate':
        return `${value}%`;
      default:
        return `${formatNumber(value)}${type === 'clients' ? t('insights.common.people') : t('insights.common.cases')}`;
    }
  };

  const TrendIndicator = ({
    value,
    className,
  }: {
    value: number;
    className?: string;
  }) => {
    // 🔥 UX 개선: Infinity/NaN 처리
    if (!isFinite(value) || isNaN(value)) {
      return (
        <Badge variant="outline" className={cn('text-xs', className)}>
          {t('insights.common.newData')}
        </Badge>
      );
    }

    // 극단적 변화 처리
    if (Math.abs(value) >= 500) {
      return (
        <Badge
          variant={value > 0 ? 'default' : 'destructive'}
          className={cn('text-xs', className)}
        >
          {value > 0
            ? t('insights.common.majorIncrease')
            : t('insights.common.majorDecrease')}
        </Badge>
      );
    }

    const isPositive = value > 0;
    return (
      <div
        className={cn(
          'flex items-center gap-1 text-sm',
          value === 0
            ? 'text-muted-foreground'
            : isPositive
              ? 'text-green-600'
              : 'text-red-600',
          className
        )}
      >
        {value === 0 ? (
          <span>{t('insights.common.noChange')}</span>
        ) : (
          <>
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{Math.round(Math.abs(value) * 10) / 10}%</span>
          </>
        )}
      </div>
    );
  };

  // 🔧 개선: 데이터 없음 상태 컴포넌트
  const NoDataState = ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
        <BarChart3 className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-medium text-sm">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          {t('insights.title')}
        </CardTitle>
        <CardDescription>{t('insights.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* 성과 트렌드 섹션 */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">
              {t('insights.performanceTrends.title')}
            </h3>
          </div>

          {!hasData ? (
            <NoDataState
              title={t('insights.performanceTrends.noDataTitle')}
              description={t('insights.performanceTrends.noDataDesc')}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardDescription>
                        {t('insights.performanceTrends.clientGrowth')}
                      </CardDescription>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl">
                      <TrendIndicator
                        value={quarterlyGrowth.clients}
                        className="text-sm font-bold"
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {t('insights.performanceTrends.clientGrowthDesc')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardDescription>
                        {t('insights.performanceTrends.revenueGrowth')}
                      </CardDescription>
                      <BarChart3 className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">
                      <TrendIndicator
                        value={quarterlyGrowth.revenue}
                        className="text-sm font-bold"
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {t('insights.performanceTrends.revenueGrowthDesc')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardDescription>
                        {t('insights.performanceTrends.referralNetwork')}
                      </CardDescription>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-2xl">
                      <TrendIndicator
                        value={quarterlyGrowth.referrals}
                        className="text-sm font-bold"
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {t('insights.performanceTrends.referralGrowthDesc')}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>

        {/* 업무 효율성 섹션 */}
        {/* 🚫 주석처리: MVP 실제 기능 개발 전에는 의미없는 섹션
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Activity className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">업무 효율성 분석</h3>
          </div>

          {!hasData ? (
            <NoDataState
              title="업무 효율성 데이터 없음"
              description="업무 활동 데이터가 쌓이면 효율성 분석이 가능합니다"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Timer className="h-5 w-5" />
                    활동 효율성 분석
                  </CardTitle>
                  <CardDescription>
                    현재는 MVP 버전으로 추정값을 사용합니다
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">통화당 계약률</span>
                    <span className="font-medium text-green-600">
                      {efficiency.callToContractRate}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">평균 상담 시간</span>
                    <span className="font-medium">
                      {efficiency.averageCallTime}분 (추정값)
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      💡 미팅 기능 개발 후 실제 데이터로 업데이트 예정
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    고객 응답률 분석
                  </CardTitle>
                  <CardDescription>
                    현재 고객 수와 전환율 기반 추정
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">첫 연락 응답률</span>
                    <span className="font-medium">
                      {efficiency.responseRate.first.toFixed(0)}% (추정)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">재연락 성공률</span>
                    <span className="font-medium">
                      {efficiency.responseRate.follow.toFixed(0)}% (추정)
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      💡 통화 기록 기능 개발 후 실제 데이터로 업데이트 예정
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        */}

        {/* 목표 분석 탭 - 목표 달성률, 예측, 네트워크 현황 */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">
              {t('insights.goalAnalysis.title')}
            </h3>
          </div>

          {!hasData ? (
            <NoDataState
              title={t('insights.goalAnalysis.noDataTitle')}
              description={t('insights.goalAnalysis.noDataDesc')}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      {t('insights.goalAnalysis.monthlyGoals')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 🎯 실제 사용자 목표 표시 */}
                    {currentMonthGoals.length > 0 ? (
                      currentMonthGoals.map(goal => (
                        <div key={goal.id} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{goal.title}</span>
                            <span className="text-primary font-medium">
                              {goal.goalType === 'revenue'
                                ? formatGoalValue(
                                    goal.currentValue,
                                    goal.goalType
                                  )
                                : `${formatNumber(goal.currentValue)}${
                                    goal.goalType === 'clients'
                                      ? t('insights.common.people')
                                      : t('insights.common.cases')
                                  }`}
                              /
                              {goal.goalType === 'revenue'
                                ? formatGoalValue(
                                    goal.targetValue,
                                    goal.goalType
                                  )
                                : `${formatNumber(goal.targetValue)}${
                                    goal.goalType === 'clients'
                                      ? t('insights.common.people')
                                      : t('insights.common.cases')
                                  }`}
                              ({goal.progress.toFixed(1)}%){' '}
                              {/* 🎯 초과 달성률 소수점 표시 */}
                            </span>
                          </div>
                          <Progress
                            value={goal.progress} // 🎯 초과 달성률도 표시
                            className="h-2"
                          />
                        </div>
                      ))
                    ) : (
                      /* 기본 목표 표시 (사용자 목표가 없는 경우) */
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{t('insights.goalAnalysis.newClients')}</span>
                            <span className="text-primary font-medium">
                              {performance.newClients}/{nextMonthTarget}
                              {t('insights.common.people')} (
                              {(
                                (performance.newClients / nextMonthTarget) *
                                100
                              ).toFixed(1)}
                              % {/* 🎯 초과 달성률 소수점 표시 */})
                            </span>
                          </div>
                          <Progress
                            value={
                              (performance.newClients / nextMonthTarget) * 100
                            } // 🎯 초과 달성률도 표시
                            className="h-2"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>
                              {t('insights.goalAnalysis.referralCases')}
                            </span>
                            <span className="text-primary font-medium">
                              {performance.totalReferrals}/
                              {Math.max(10, performance.totalReferrals + 5)}
                              {t('insights.common.cases')} (
                              {(
                                (performance.totalReferrals /
                                  Math.max(
                                    10,
                                    performance.totalReferrals + 5
                                  )) *
                                100
                              ).toFixed(1)}
                              % {/* 🎯 초과 달성률 소수점 표시 */})
                            </span>
                          </div>
                          <Progress
                            value={
                              (performance.totalReferrals /
                                Math.max(10, performance.totalReferrals + 5)) *
                              100
                            } // 🎯 초과 달성률도 표시
                            className="h-2"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>
                              {t('insights.goalAnalysis.revenueGoal')}
                            </span>
                            <span className="text-muted-foreground">
                              {formatCurrency(performance.revenue)}/
                              {formatCurrency(performance.revenue * 1.3)} (
                              {(
                                (performance.revenue /
                                  (performance.revenue * 1.3)) *
                                100
                              ).toFixed(1)}
                              % {/* 🎯 초과 달성률 소수점 표시 */})
                            </span>
                          </div>
                          <Progress
                            value={
                              (performance.revenue /
                                (performance.revenue * 1.3)) *
                              100
                            } // 🎯 초과 달성률도 표시
                            className="h-2"
                          />
                        </div>
                      </>
                    )}
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        {currentMonthGoals.length > 0
                          ? t('insights.goalAnalysis.goalBasedNote')
                          : performance.newClients > 0 &&
                              performance.totalReferrals > 0 &&
                              performance.revenue > 0
                            ? t('insights.goalAnalysis.steadyGrowthNote')
                            : t('insights.goalAnalysis.needMoreActivityNote')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 소개 네트워크 현황만 유지 (분기별 목표 진행률 카드 제거) */}
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {t('insights.goalAnalysis.referralStatus')}
                    </CardTitle>
                    <CardDescription>
                      {t('insights.goalAnalysis.referralStatusDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        {t('insights.goalAnalysis.totalReferrals')}
                      </span>
                      <span className="font-medium">
                        {performance.totalReferrals}
                        {t('insights.common.cases')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        {t('insights.goalAnalysis.successfulConversions')}
                      </span>
                      <span className="font-medium text-primary">
                        {Math.round(
                          (performance.totalReferrals *
                            performance.conversionRate) /
                            100
                        )}
                        {t('insights.common.cases')} (
                        {performance.totalReferrals > 0
                          ? Math.round(performance.conversionRate)
                          : 0}
                        %)
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        {t('insights.goalAnalysis.inProgress')}
                      </span>
                      <span className="font-medium text-muted-foreground">
                        {Math.max(
                          0,
                          performance.totalReferrals -
                            Math.round(
                              (performance.totalReferrals *
                                performance.conversionRate) /
                                100
                            )
                        )}
                        {t('insights.common.cases')}
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <TrendIndicator value={performance.growth.referrals} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>

        {/* 개선 제안 탭 - 실행 가능한 액션 아이템 중심 */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Zap className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">
              {t('insights.improvements.title')}
            </h3>
          </div>

          {!hasData ? (
            <NoDataState
              title={t('insights.improvements.noDataTitle')}
              description={t('insights.improvements.noDataDesc')}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-primary flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      {t('insights.improvements.subtitle')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {conversionRate < 10 ? (
                      <div className="p-3 border-l-4 border-primary bg-primary/5 rounded-r-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <p className="text-sm font-medium">
                            {t('insights.improvements.conversionFocus')}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t(
                            'insights.improvements.conversionImprovementText',
                            {
                              currentRate: conversionRate.toFixed(1),
                              growth: Math.round((15 - conversionRate) * 2),
                            }
                          )}
                        </p>
                      </div>
                    ) : null}

                    {performance.totalReferrals < 5 ? (
                      <div className="p-3 border-l-4 border-muted bg-muted/20 rounded-r-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm font-medium">
                            {t(
                              'insights.improvements.referralSystemStrengthen'
                            )}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t('insights.improvements.referralExpansionText', {
                            growth: Math.max(
                              20,
                              performance.totalReferrals * 10
                            ),
                          })}
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 border-l-4 border-primary bg-primary/5 rounded-r-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <p className="text-sm font-medium text-primary">
                            {t(
                              'insights.improvements.excellentReferralActivity'
                            )}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t('insights.improvements.maintainReferralText', {
                            count: performance.totalReferrals,
                          })}
                        </p>
                      </div>
                    )}

                    {performance.averageClientValue < 500000 ? (
                      <div className="p-3 border-l-4 border-muted bg-muted/30 rounded-r-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Timer className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm font-medium">
                            {t('insights.improvements.clientValueIncrease')}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t(
                            'insights.improvements.portfolioDiversificationText',
                            {
                              value: formatCurrency(
                                performance.averageClientValue
                              ),
                            }
                          )}
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 border-l-4 border-primary bg-primary/10 rounded-r-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <p className="text-sm font-medium text-primary">
                            {t('insights.improvements.highClientValue')}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t('insights.improvements.excellentPerformanceText', {
                            value: formatCurrency(
                              performance.averageClientValue
                            ),
                          })}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {t('insights.actionPlan.title')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-primary">
                          {t('insights.actionPlan.urgent')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {performance.totalReferrals > 0
                            ? t('insights.actionPlan.urgentFollowUp', {
                                count: performance.totalReferrals,
                              })
                            : t('insights.actionPlan.urgentAction')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary/70 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-primary/70">
                          {t('insights.actionPlan.thisWeek')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {performance.activeClients > 0
                            ? t('insights.actionPlan.weeklyAction', {
                                count: Math.min(5, performance.activeClients),
                              })
                            : t('insights.actionPlan.weeklyAlternative')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {t('insights.actionPlan.thisMonth')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {conversionRate < 10
                            ? t('insights.actionPlan.monthlyAction')
                            : t('insights.actionPlan.monthlyAdvanced')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t('insights.successPatterns.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('insights.successPatterns.subtitle')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 border border-border rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <p className="text-sm font-medium">
                          {t('insights.successPatterns.currentPattern')}
                        </p>
                      </div>
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <p>
                          • {t('insights.successPatterns.conversionRate')}:{' '}
                          {conversionRate.toFixed(1)}%
                        </p>
                        <p>
                          • {t('insights.successPatterns.avgClientValue')}:{' '}
                          {formatCurrency(performance.averageClientValue)}
                        </p>
                        <p>
                          • {t('insights.successPatterns.monthlyNewClients')}:{' '}
                          {performance.newClients}
                          {t('insights.common.people')}
                        </p>
                        <p>
                          • {t('insights.successPatterns.activeClients')}:{' '}
                          {performance.activeClients}
                          {t('insights.common.people')}
                        </p>
                      </div>
                      <p className="text-xs text-primary mt-3 font-medium">
                        →{' '}
                        {conversionRate > 15
                          ? t('insights.successPatterns.excellentPerformance')
                          : conversionRate > 5
                            ? t('insights.successPatterns.goodPerformance')
                            : t('insights.successPatterns.needsImprovement')}
                      </p>
                    </div>

                    <div className="p-4 bg-muted/30 border border-border rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="h-5 w-5 text-primary" />
                        <p className="text-sm font-medium">
                          {t('insights.successPatterns.keyImprovements')}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        {performance.totalReferrals > performance.newClients
                          ? t('insights.successPatterns.activeReferralPattern')
                          : performance.newClients > 0
                            ? t('insights.successPatterns.directSalesPattern')
                            : t('insights.successPatterns.needBasicActivity')}
                      </p>
                      <p className="text-xs text-primary font-medium">
                        →{' '}
                        {conversionRate > 10 && performance.totalReferrals > 3
                          ? t('insights.successPatterns.needSystemization')
                          : t('insights.successPatterns.needBasicIncrease')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
