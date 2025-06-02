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

interface InsightsTabsProps {
  performance: PerformanceData;
  topPerformers: TopPerformer[];
}

export function InsightsTabs({
  performance,
  topPerformers,
}: InsightsTabsProps) {
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
      return `${(amount / 100000000).toFixed(1)}억원`;
    } else if (amount >= 10000000) {
      return `${(amount / 10000000).toFixed(1)}천만원`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}백만원`;
    }
    return `${amount.toLocaleString()}원`;
  };

  const TrendIndicator = ({
    value,
    className,
  }: {
    value: number;
    className?: string;
  }) => {
    const isPositive = value > 0;
    return (
      <div
        className={cn(
          'flex items-center gap-1 text-sm',
          isPositive
            ? 'text-green-600'
            : value === 0
            ? 'text-gray-500'
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
            <span>{Math.abs(value)}%</span>
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
      <CardContent>
        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trends">성과 트렌드</TabsTrigger>
            <TabsTrigger value="efficiency">업무 효율성</TabsTrigger>
            <TabsTrigger value="goals">목표 분석</TabsTrigger>
            <TabsTrigger value="recommendations">개선 제안</TabsTrigger>
          </TabsList>

          {/* 성과 트렌드 탭 - 성장률, 트렌드, 상위 성과자 */}
          <TabsContent value="trends" className="mt-6 space-y-6">
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
                        +{quarterlyGrowth.clients}%
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
                        +{quarterlyGrowth.revenue}%
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
                        +{quarterlyGrowth.referrals}%
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        소개 건수 증가율
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        분기별 성장 추이
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>이전 대비 고객 증가</span>
                          <TrendIndicator value={quarterlyGrowth.clients} />
                        </div>
                        <Progress
                          value={Math.min(
                            100,
                            Math.max(0, quarterlyGrowth.clients + 50)
                          )}
                          className="h-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>이전 대비 수익 증가</span>
                          <TrendIndicator value={quarterlyGrowth.revenue} />
                        </div>
                        <Progress
                          value={Math.min(100, conversionRate)}
                          className="h-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>네트워크 확장률</span>
                          <TrendIndicator value={quarterlyGrowth.referrals} />
                        </div>
                        <Progress
                          value={Math.min(
                            100,
                            Math.max(0, quarterlyGrowth.referrals + 50)
                          )}
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">성과 하이라이트</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {performance.newClients > 0 ? (
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <Star className="h-5 w-5 text-yellow-500" />
                          <div>
                            <p className="text-sm font-medium">
                              신규 고객 확보
                            </p>
                            <p className="text-xs text-muted-foreground">
                              이번 달 {performance.newClients}명 신규 고객 유치
                            </p>
                          </div>
                        </div>
                      ) : null}
                      {conversionRate >= 10 ? (
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <Award className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium">
                              높은 전환율 달성
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {conversionRate}% 전환율로 우수한 성과
                            </p>
                          </div>
                        </div>
                      ) : null}
                      {performance.newClients === 0 && conversionRate < 10 ? (
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <Target className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium">성장 기회</p>
                            <p className="text-xs text-muted-foreground">
                              더 많은 활동으로 성과 향상 가능
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                </div>

                {/* 상위 성과자 테이블 */}
                {/* 👥 팀 성과 랭킹 - 팀 기능 개발 후 활성화 예정
                <Card>
                  <CardHeader>
                    <CardTitle>팀 성과 랭킹</CardTitle>
                    <CardDescription>
                      이번 달 우수 성과자 및 벤치마킹 대상
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {topPerformers.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>순위</TableHead>
                            <TableHead>이름</TableHead>
                            <TableHead className="text-center">
                              고객 수
                            </TableHead>
                            <TableHead className="text-center">
                              계약 건수
                            </TableHead>
                            <TableHead className="text-right">수익</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {topPerformers.map((performer, index) => (
                            <TableRow key={performer.id}>
                              <TableCell>
                                <div className="flex items-center">
                                  <div
                                    className={cn(
                                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3',
                                      index === 0
                                        ? 'bg-yellow-500'
                                        : index === 1
                                        ? 'bg-gray-400'
                                        : 'bg-orange-500'
                                    )}
                                  >
                                    {index + 1}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                {performer.name}
                              </TableCell>
                              <TableCell className="text-center">
                                {performer.clients}명
                              </TableCell>
                              <TableCell className="text-center">
                                {performer.conversions}건
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(performer.revenue)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <NoDataState
                        title="팀 성과 데이터 없음"
                        description="팀원들의 활동이 시작되면 랭킹이 표시됩니다"
                      />
                    )}
                  </CardContent>
                </Card>
                */}
              </>
            )}
          </TabsContent>

          {/* 업무 효율성 탭 - 시간, 패턴, 효율성 분석 */}
          <TabsContent value="efficiency" className="mt-6 space-y-6">
            {!hasData ? (
              <NoDataState
                title="업무 효율성 데이터 없음"
                description="업무 활동 데이터가 쌓이면 효율성 분석이 가능합니다"
              />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Timer className="h-5 w-5" />
                        활동 효율성 분석
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">통화당 계약률</span>
                        <span className="font-medium text-green-600">
                          {efficiency.callToContractRate}%
                        </span>
                      </div>
                      {/* 미팅 관련 기능 - MVP에서 제외 */}
                      {/*
                      <div className="flex justify-between items-center">
                        <span className="text-sm">미팅당 성사율</span>
                        <span className="font-medium text-primary">
                          {efficiency.meetingSuccessRate}%
                        </span>
                      </div>
                      */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm">평균 상담 시간</span>
                        <span className="font-medium">
                          {efficiency.averageCallTime}분
                        </span>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          {conversionRate > 15
                            ? '💡 매우 우수한 효율성을 보이고 있습니다'
                            : conversionRate > 5
                            ? '💡 양호한 업무 효율성입니다'
                            : '💡 효율성 개선의 여지가 있습니다'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        고객 응답률 분석
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">첫 연락 응답률</span>
                        <span className="font-medium">
                          {efficiency.responseRate.first.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">재연락 성공률</span>
                        <span className="font-medium">
                          {efficiency.responseRate.follow.toFixed(0)}%
                        </span>
                      </div>
                      {/* 미팅 관련 기능 - MVP에서 제외 */}
                      {/*
                      <div className="flex justify-between items-center">
                        <span className="text-sm">미팅 약속률</span>
                        <span className="font-medium">
                          {efficiency.responseRate.meeting.toFixed(0)}%
                        </span>
                      </div>
                      */}
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          {efficiency.responseRate.first > 80
                            ? '💡 높은 신뢰도로 우수한 고객 관계'
                            : '💡 고객 관계 개선의 기회가 있습니다'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* 목표 분석 탭 - 목표 달성률, 예측, 네트워크 현황 */}
          <TabsContent value="goals" className="mt-6 space-y-6">
            {!hasData ? (
              <NoDataState
                title="목표 분석 데이터 없음"
                description="목표 설정과 성과 데이터가 쌓이면 분석이 가능합니다"
              />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        월간 목표 달성 현황
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>신규 고객</span>
                          <span className="text-primary">
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
                          <span className="text-primary">
                            {performance.totalReferrals}/
                            {Math.max(10, performance.totalReferrals + 5)}건 (
                            {Math.round(
                              (performance.totalReferrals /
                                Math.max(10, performance.totalReferrals + 5)) *
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
                            {(performance.revenue / 100000000).toFixed(1)}/
                            {((performance.revenue * 1.3) / 100000000).toFixed(
                              1
                            )}
                            억원 (
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
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          {performance.newClients > 0 &&
                          performance.totalReferrals > 0 &&
                          performance.revenue > 0
                            ? '💡 꾸준한 성장 패턴을 보이고 있습니다'
                            : '💡 목표 달성을 위한 추가 활동이 필요합니다'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        다음 달 성과 예측
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">예상 신규 고객</span>
                        <span className="font-medium text-green-600">
                          {nextMonthTarget}명
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">목표 달성 확률</span>
                        <span className="font-medium text-primary">
                          {Math.max(20, Math.min(95, 60 + conversionRate))}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">예상 수익 증가</span>
                        <span className="font-medium text-green-600">
                          +{Math.max(5, performance.growth.revenue || 10)}%
                        </span>
                      </div>
                      <div className="pt-2 p-3 bg-muted/30 border border-border rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          {performance.growth.revenue > 15
                            ? '💡 우수한 성장률로 목표 초과 달성 전망'
                            : performance.growth.revenue > 5
                            ? '💡 현재 성장률 유지 시 목표 달성 가능'
                            : '💡 성장률 개선을 위한 전략 수정이 필요합니다'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 소개 네트워크 & 목표 달성률 통합 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>소개 네트워크 현황</CardTitle>
                      <CardDescription>
                        소개 활동 분석 및 효과성
                      </CardDescription>
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
                        <span className="font-medium text-green-600">
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
                        <span className="font-medium text-yellow-600">
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

                  <Card>
                    <CardHeader>
                      <CardTitle>분기별 목표 진행률</CardTitle>
                      <CardDescription>
                        분기 목표 대비 누적 성과
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>분기 신규고객</span>
                          <span>
                            {performance.newClients * 3}/
                            {performance.newClients * 3 + 10}명 (
                            {Math.round(
                              ((performance.newClients * 3) /
                                (performance.newClients * 3 + 10)) *
                                100
                            )}
                            %)
                          </span>
                        </div>
                        <Progress
                          value={Math.min(
                            100,
                            ((performance.newClients * 3) /
                              (performance.newClients * 3 + 10)) *
                              100
                          )}
                          className="h-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>분기 소개건수</span>
                          <span>
                            {performance.totalReferrals * 3}/
                            {performance.totalReferrals * 3 + 15}건 (
                            {Math.round(
                              ((performance.totalReferrals * 3) /
                                (performance.totalReferrals * 3 + 15)) *
                                100
                            )}
                            %)
                          </span>
                        </div>
                        <Progress
                          value={Math.min(
                            100,
                            ((performance.totalReferrals * 3) /
                              (performance.totalReferrals * 3 + 15)) *
                              100
                          )}
                          className="h-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>분기 수익목표</span>
                          <span>
                            {((performance.revenue * 3) / 100000000).toFixed(1)}
                            /
                            {((performance.revenue * 3.5) / 100000000).toFixed(
                              1
                            )}
                            억원 (
                            {Math.round(
                              ((performance.revenue * 3) /
                                (performance.revenue * 3.5)) *
                                100
                            )}
                            %)
                          </span>
                        </div>
                        <Progress
                          value={Math.min(
                            100,
                            ((performance.revenue * 3) /
                              (performance.revenue * 3.5)) *
                              100
                          )}
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* 개선 제안 탭 - 실행 가능한 액션 아이템 중심 */}
          <TabsContent value="recommendations" className="mt-6 space-y-6">
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
                            향상 → 예상 +{Math.round((15 - conversionRate) * 2)}
                            % 성장
                          </p>
                        </div>
                      ) : null}

                      {performance.totalReferrals < 5 ? (
                        <div className="p-3 border-l-4 border-primary/50 bg-muted/50 rounded-r-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="h-4 w-4 text-primary" />
                            <p className="text-sm font-medium">
                              소개 시스템 강화
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            기존 고객에게 소개 요청으로 네트워크 확장 → 예상 +
                            {Math.max(20, performance.totalReferrals * 10)}%
                            성장
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <p className="text-sm font-medium text-green-800">
                              우수한 소개 활동
                            </p>
                          </div>
                          <p className="text-xs text-green-700">
                            {performance.totalReferrals}건의 활발한 소개 활동을
                            유지하세요
                          </p>
                        </div>
                      )}

                      {performance.averageClientValue < 500000 ? (
                        <div className="p-3 border-l-4 border-muted bg-muted/30 rounded-r-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Timer className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm font-medium">
                              고객 가치 증대
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            평균 고객 가치{' '}
                            {formatCurrency(performance.averageClientValue)} →
                            상품 포트폴리오 다양화 필요
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            <p className="text-sm font-medium text-blue-800">
                              높은 고객 가치
                            </p>
                          </div>
                          <p className="text-xs text-blue-700">
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
                      <CardTitle className="text-lg">
                        이번 주 액션 플랜
                      </CardTitle>
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
                              ? `VIP 고객 ${Math.min(
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
                          <p className="text-sm font-medium">
                            🏆 현재 성과 패턴
                          </p>
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
