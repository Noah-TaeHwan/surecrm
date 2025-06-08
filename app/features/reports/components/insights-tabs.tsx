import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/common/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/common/components/ui/table';
import { Progress } from '~/common/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Users,
  Phone,
  MessageSquare,
  Award,
  Lightbulb,
  BarChart3,
  Clock,
  Zap,
  CheckCircle,
  AlertTriangle,
  Star,
  Activity,
  Timer,
} from 'lucide-react';
import { cn } from '~/lib/utils';
import type { PerformanceData, TopPerformer } from '../types';
import { Badge } from '~/common/components/ui/badge';

interface InsightsTabsProps {
  performance: PerformanceData;
  topPerformers: TopPerformer[];
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
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export function InsightsTabs({
  performance,
  topPerformers,
  userGoals = [],
}: InsightsTabsProps) {
  // 🎯 실제 사용자 목표 데이터 활용
  const currentMonthGoals = userGoals
    .filter((goal) => goal.goalType !== 'meetings') // meetings 타입 제외
    .filter((goal) => {
      const goalStart = new Date(goal.startDate);
      const goalEnd = new Date(goal.endDate);
      const now = new Date();
      return goalStart <= now && goalEnd >= now;
    });

  // 목표별 데이터 매핑
  const revenueGoal = currentMonthGoals.find(
    (goal) => goal.goalType === 'revenue'
  );
  const clientsGoal = currentMonthGoals.find(
    (goal) => goal.goalType === 'clients'
  );
  const referralsGoal = currentMonthGoals.find(
    (goal) => goal.goalType === 'referrals'
  );

  const conversionRate = performance.conversionRate || 0;
  const avgCallsPerDay =
    performance.totalReferrals > 0
      ? Math.round(performance.totalReferrals / 30)
      : 0;
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

  // 업무 효율성 지표 계산
  const efficiency = {
    callToContractRate:
      avgCallsPerDay > 0 ? (conversionRate / avgCallsPerDay).toFixed(1) : '0',
    meetingSuccessRate:
      performance.meetingsCount > 0 && performance.newClients > 0
        ? Math.min(
            100,
            (performance.newClients / performance.meetingsCount) * 100
          )
        : 0,
    averageCallTime: '24', // 기본값, 실제로는 데이터베이스에서 가져와야 함
    responseRate: {
      first:
        performance.totalClients > 0
          ? Math.min(100, 60 + performance.conversionRate * 0.5)
          : 85,
      follow:
        performance.totalReferrals > 0
          ? Math.min(100, 50 + performance.totalReferrals * 2)
          : 72,
      meeting: conversionRate > 0 ? Math.min(100, 40 + conversionRate) : 65,
    },
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 100000000) {
      return `${Math.round(amount / 100000000)}억원`;
    } else if (amount >= 10000000) {
      return `${Math.round(amount / 10000000)}천만원`;
    } else if (amount >= 1000000) {
      return `${Math.round(amount / 1000000)}백만원`;
    }
    return `${amount.toLocaleString()}원`;
  };

  const formatGoalValue = (value: number, type: string) => {
    switch (type) {
      case 'revenue':
        return value >= 10000
          ? `${(value / 10000).toFixed(1)}억원`
          : `${value.toLocaleString()}만원`;
      case 'conversion_rate':
        return `${value}%`;
      default:
        return `${value.toLocaleString()}${type === 'clients' ? '명' : '건'}`;
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
          신규 데이터
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
          {value > 0 ? '대폭 증가' : '대폭 감소'}
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
          <span>변화없음</span>
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
          비즈니스 인사이트
        </CardTitle>
        <CardDescription>
          데이터 기반 분석과 개선 제안을 확인하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* 성과 트렌드 섹션 */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">성과 트렌드</h3>
          </div>

          {!hasData ? (
            <NoDataState
              title="성과 트렌드 데이터 없음"
              description="고객 및 수익 데이터가 쌓이면 트렌드 분석이 가능합니다"
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardDescription>고객 성장률</CardDescription>
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
                      지난 달 대비 고객 증가율
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardDescription>수익 성장률</CardDescription>
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
                      월간 수익 증가율
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardDescription>소개 네트워크</CardDescription>
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
                      소개 건수 증가율
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
            <h3 className="text-lg font-semibold">목표 분석</h3>
          </div>

          {!hasData ? (
            <NoDataState
              title="목표 분석 데이터 없음"
              description="목표 설정과 성과 데이터가 쌓이면 분석이 가능합니다"
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      월간 목표 달성 현황
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 🎯 실제 사용자 목표 표시 */}
                    {currentMonthGoals.length > 0 ? (
                      currentMonthGoals.map((goal) => (
                        <div key={goal.id} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{goal.title}</span>
                            <span className="text-primary font-medium">
                              {goal.goalType === 'revenue'
                                ? formatGoalValue(
                                    goal.currentValue,
                                    goal.goalType
                                  )
                                : `${goal.currentValue.toLocaleString()}${
                                    goal.goalType === 'clients' ? '명' : '건'
                                  }`}
                              /
                              {goal.goalType === 'revenue'
                                ? formatGoalValue(
                                    goal.targetValue,
                                    goal.goalType
                                  )
                                : `${goal.targetValue.toLocaleString()}${
                                    goal.goalType === 'clients' ? '명' : '건'
                                  }`}
                              ({Math.round(goal.progress)}%)
                            </span>
                          </div>
                          <Progress
                            value={Math.min(100, goal.progress)}
                            className="h-2"
                          />
                        </div>
                      ))
                    ) : (
                      /* 기본 목표 표시 (사용자 목표가 없는 경우) */
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>신규 고객</span>
                            <span className="text-primary font-medium">
                              {performance.newClients}/{nextMonthTarget}명 (
                              {Math.round(
                                (performance.newClients / nextMonthTarget) * 100
                              )}
                              %)
                            </span>
                          </div>
                          <Progress
                            value={Math.min(
                              100,
                              (performance.newClients / nextMonthTarget) * 100
                            )}
                            className="h-2"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>소개 건수</span>
                            <span className="text-primary font-medium">
                              {performance.totalReferrals}/
                              {Math.max(10, performance.totalReferrals + 5)}건 (
                              {Math.round(
                                (performance.totalReferrals /
                                  Math.max(
                                    10,
                                    performance.totalReferrals + 5
                                  )) *
                                  100
                              )}
                              %)
                            </span>
                          </div>
                          <Progress
                            value={Math.min(
                              100,
                              (performance.totalReferrals /
                                Math.max(10, performance.totalReferrals + 5)) *
                                100
                            )}
                            className="h-2"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>수익 목표</span>
                            <span className="text-muted-foreground">
                              {Math.round(
                                performance.revenue / 10000
                              ).toLocaleString()}
                              /
                              {Math.round(
                                (performance.revenue * 1.3) / 10000
                              ).toLocaleString()}
                              만원 (
                              {Math.round(
                                (performance.revenue /
                                  (performance.revenue * 1.3)) *
                                  100
                              )}
                              %)
                            </span>
                          </div>
                          <Progress
                            value={Math.min(
                              100,
                              (performance.revenue /
                                (performance.revenue * 1.3)) *
                                100
                            )}
                            className="h-2"
                          />
                        </div>
                      </>
                    )}
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        {currentMonthGoals.length > 0
                          ? '💡 설정된 목표를 기반으로 진행률을 표시합니다'
                          : performance.newClients > 0 &&
                            performance.totalReferrals > 0 &&
                            performance.revenue > 0
                          ? '💡 꾸준한 성장 패턴을 보이고 있습니다'
                          : '💡 목표 달성을 위한 추가 활동이 필요합니다'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 소개 네트워크 현황만 유지 (분기별 목표 진행률 카드 제거) */}
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>소개 네트워크 현황</CardTitle>
                    <CardDescription>소개 활동 분석 및 효과성</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">총 소개 건수</span>
                      <span className="font-medium">
                        {performance.totalReferrals}건
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">성공 전환</span>
                      <span className="font-medium text-primary">
                        {Math.round(
                          (performance.totalReferrals *
                            performance.conversionRate) /
                            100
                        )}
                        건 (
                        {performance.totalReferrals > 0
                          ? Math.round(performance.conversionRate)
                          : 0}
                        %)
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">진행 중</span>
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
                        건
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
            <h3 className="text-lg font-semibold">개선 제안</h3>
          </div>

          {!hasData ? (
            <NoDataState
              title="개선 제안 데이터 없음"
              description="활동 데이터가 쌓이면 맞춤형 개선 제안을 제공합니다"
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-primary flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      즉시 실행 가능한 개선사항
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {conversionRate < 10 ? (
                      <div className="p-3 border-l-4 border-primary bg-primary/5 rounded-r-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <p className="text-sm font-medium">
                            전환율 개선 집중
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          현재 {conversionRate.toFixed(1)}% 전환율을 15%까지
                          향상 → 예상 +{Math.round((15 - conversionRate) * 2)}%
                          성장
                        </p>
                      </div>
                    ) : null}

                    {performance.totalReferrals < 5 ? (
                      <div className="p-3 border-l-4 border-muted bg-muted/20 rounded-r-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm font-medium">
                            소개 시스템 강화
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          기존 고객에게 소개 요청으로 네트워크 확장 → 예상 +
                          {Math.max(20, performance.totalReferrals * 10)}% 성장
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 border-l-4 border-primary bg-primary/5 rounded-r-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <p className="text-sm font-medium text-primary">
                            우수한 소개 활동
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {performance.totalReferrals}건의 활발한 소개 활동을
                          유지하세요
                        </p>
                      </div>
                    )}

                    {performance.averageClientValue < 500000 ? (
                      <div className="p-3 border-l-4 border-muted bg-muted/30 rounded-r-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Timer className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm font-medium">고객 가치 증대</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          평균 고객 가치{' '}
                          {formatCurrency(performance.averageClientValue)} →
                          상품 포트폴리오 다양화 필요
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 border-l-4 border-primary bg-primary/10 rounded-r-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <p className="text-sm font-medium text-primary">
                            높은 고객 가치
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          평균 고객 가치{' '}
                          {formatCurrency(performance.averageClientValue)} -
                          우수한 성과입니다
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">이번 주 액션 플랜</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-primary">
                          긴급 (오늘)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {performance.totalReferrals > 0
                            ? `진행 중인 소개 건 ${performance.totalReferrals}건 팔로우업`
                            : '신규 고객 연락 및 상담 일정 확정'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary/70 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-primary/70">
                          이번 주
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {performance.activeClients > 0
                            ? `키맨 고객 ${Math.min(
                                5,
                                performance.activeClients
                              )}명에게 소개 프로그램 안내`
                            : '기존 고객 관계 강화 및 만족도 향상 활동'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          이번 달
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {conversionRate < 10
                            ? '고객 니즈 분석 프로세스 개선 및 상담 스킬 향상'
                            : '성공 패턴 분석 및 팀 공유를 통한 시너지 확대'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    성공 패턴 & 베스트 프랙티스
                  </CardTitle>
                  <CardDescription>
                    현재 성과 분석 기반 개선 방향
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 border border-border rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <p className="text-sm font-medium">🏆 현재 성과 패턴</p>
                      </div>
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <p>• 전환율: {conversionRate.toFixed(1)}%</p>
                        <p>
                          • 평균 고객 가치:{' '}
                          {formatCurrency(performance.averageClientValue)}
                        </p>
                        <p>• 월간 신규 고객: {performance.newClients}명</p>
                        <p>• 활성 고객: {performance.activeClients}명</p>
                      </div>
                      <p className="text-xs text-primary mt-3 font-medium">
                        →{' '}
                        {conversionRate > 15
                          ? '우수한 성과를 유지하고 있습니다'
                          : conversionRate > 5
                          ? '양호한 성과입니다'
                          : '개선의 여지가 있습니다'}
                      </p>
                    </div>

                    <div className="p-4 bg-muted/30 border border-border rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="h-5 w-5 text-primary" />
                        <p className="text-sm font-medium">
                          💡 핵심 개선 포인트
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        {performance.totalReferrals > performance.newClients
                          ? '소개를 통한 고객 확보가 활발합니다. 소개 고객의 전환율 최적화에 집중하세요.'
                          : performance.newClients > 0
                          ? '직접 영업 활동이 활발합니다. 기존 고객을 통한 소개 확대로 시너지를 창출하세요.'
                          : '신규 고객 확보 활동을 늘리고 소개 네트워크 구축에 집중하세요.'}
                      </p>
                      <p className="text-xs text-primary font-medium">
                        →{' '}
                        {conversionRate > 10 && performance.totalReferrals > 3
                          ? '우수한 성과 지속을 위한 시스템화 필요'
                          : '기본 활동량 증대가 우선 과제'}
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
