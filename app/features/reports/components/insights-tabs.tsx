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
  const conversionRate = performance.conversionRate;
  const avgCallsPerDay = Math.round(performance.totalReferrals / 30);
  const nextMonthTarget = Math.round(performance.newClients * 1.25);

  const formatCurrency = (amount: number) => {
    return `${(amount / 10000000).toFixed(1)}천만원`;
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
          isPositive ? 'text-green-600' : 'text-red-600',
          className
        )}
      >
        {isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        <span>{Math.abs(value)}%</span>
      </div>
    );
  };

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription>고객 성장률</CardDescription>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl">
                    +{performance.growth.clients}%
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
                    +{performance.growth.revenue}%
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
                    +{performance.growth.referrals}%
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
                  <CardTitle className="text-lg">분기별 성장 추이</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Q1 대비 고객 증가</span>
                      <span className="text-green-600">+28%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Q1 대비 수익 증가</span>
                      <span className="text-green-600">+35%</span>
                    </div>
                    <Progress value={conversionRate} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>네트워크 확장률</span>
                      <span className="text-primary">+42%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">성과 하이라이트</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">연간 최고 실적</p>
                      <p className="text-xs text-muted-foreground">
                        올해 최고 월간 신규 고객 기록
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Award className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">
                        3개월 연속 목표 달성
                      </p>
                      <p className="text-xs text-muted-foreground">
                        안정적인 성장세 유지
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 상위 성과자 테이블 */}
            <Card>
              <CardHeader>
                <CardTitle>팀 성과 랭킹</CardTitle>
                <CardDescription>
                  이번 달 우수 성과자 및 벤치마킹 대상
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>순위</TableHead>
                      <TableHead>이름</TableHead>
                      <TableHead className="text-center">고객 수</TableHead>
                      <TableHead className="text-center">계약 건수</TableHead>
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* 업무 효율성 탭 - 시간, 패턴, 효율성 분석 */}
          <TabsContent value="efficiency" className="mt-6 space-y-6">
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
                      {(conversionRate / avgCallsPerDay).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">미팅당 성사율</span>
                    <span className="font-medium text-primary">72%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">평균 상담 시간</span>
                    <span className="font-medium">24분</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      💡 업계 평균 대비 28% 높은 효율성
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
                    <span className="font-medium">89%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">재연락 성공률</span>
                    <span className="font-medium">72%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">미팅 약속률</span>
                    <span className="font-medium">65%</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      💡 높은 신뢰도로 우수한 고객 관계
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">최적 업무 패턴</CardTitle>
                <CardDescription>
                  데이터 기반 최고 효율 시간대 및 방법론
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-lg font-semibold">화요일</p>
                    <p className="text-sm text-muted-foreground">최고 성과일</p>
                    <p className="text-xs text-green-600 mt-1">+35% 성과</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-lg font-semibold">14:00-17:00</p>
                    <p className="text-sm text-muted-foreground">골든 타임</p>
                    <p className="text-xs text-green-600 mt-1">+42% 전환율</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <Phone className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-lg font-semibold">3.2건</p>
                    <p className="text-sm text-muted-foreground">일평균 성사</p>
                    <p className="text-xs text-green-600 mt-1">
                      업계 평균 +28%
                    </p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-lg font-semibold">24분</p>
                    <p className="text-sm text-muted-foreground">
                      최적 상담시간
                    </p>
                    <p className="text-xs text-green-600 mt-1">+15% 만족도</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 목표 분석 탭 - 목표 달성률, 예측, 네트워크 현황 */}
          <TabsContent value="goals" className="mt-6 space-y-6">
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
                        {performance.newClients}/35명 (80%)
                      </span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>소개 건수</span>
                      <span className="text-primary">
                        {performance.totalReferrals}/100건 (89%)
                      </span>
                    </div>
                    <Progress value={89} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>수익 목표</span>
                      <span className="text-muted-foreground">
                        1.25/1.5억원 (83%)
                      </span>
                    </div>
                    <Progress value={83} className="h-2" />
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      💡 모든 지표에서 목표 달성 궤도
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">다음 달 성과 예측</CardTitle>
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
                    <span className="font-medium text-primary">92%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">예상 수익 증가</span>
                    <span className="font-medium text-green-600">+25%</span>
                  </div>
                  <div className="pt-2 p-3 bg-muted/30 border border-border rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      💡 현재 성장률 유지 시 조기 목표 달성 가능
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
                    <span className="font-medium text-green-600">
                      {Math.round(
                        (performance.totalReferrals *
                          performance.conversionRate) /
                          100
                      )}
                      건 (
                      {Math.round(
                        (performance.totalReferrals *
                          performance.conversionRate) /
                          performance.totalReferrals
                      )}
                      %)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">진행 중</span>
                    <span className="font-medium text-yellow-600">
                      {performance.totalReferrals -
                        Math.round(
                          (performance.totalReferrals *
                            performance.conversionRate) /
                            100
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
                  <CardDescription>Q4 목표 대비 누적 성과</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>분기 신규고객</span>
                      <span>85/100명 (85%)</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>분기 소개건수</span>
                      <span>267/300건 (89%)</span>
                    </div>
                    <Progress value={89} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>분기 수익목표</span>
                      <span>3.8/4.5억원 (84%)</span>
                    </div>
                    <Progress value={84} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 개선 제안 탭 - 실행 가능한 액션 아이템 중심 */}
          <TabsContent value="recommendations" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-primary flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    즉시 실행 가능한 개선사항
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 border-l-4 border-primary bg-primary/5 rounded-r-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium">소개 시스템 강화</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      기존 고객 5명에게 이번 주 소개 요청 → 예상 +25% 성장
                    </p>
                  </div>
                  <div className="p-3 border-l-4 border-primary/50 bg-muted/50 rounded-r-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium">
                        골든타임 활용도 증대
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      화요일 14-17시 미팅 집중 배치 → 전환율 +15% 향상
                    </p>
                  </div>
                  <div className="p-3 border-l-4 border-muted bg-muted/30 rounded-r-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Timer className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        상담 프로세스 최적화
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      24분 표준 상담시간 준수 → 고객 만족도 +12% 개선
                    </p>
                  </div>
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
                        진행 중인 소개 건 5건 팔로우업 전화
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
                        VIP 고객 3명에게 소개 프로그램 안내
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
                        화요일 오후 미팅 일정 재배치 및 최적화
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
                  데이터 분석 기반 검증된 성공 방법론
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 border border-border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <p className="text-sm font-medium">🏆 최고 성과 패턴</p>
                    </div>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p>• 화요일 15:00 미팅 진행</p>
                      <p>• 사전 고객 니즈 분석 (10분)</p>
                      <p>• 맞춤형 솔루션 제안</p>
                      <p>• 3일 후 정확한 팔로우업</p>
                    </div>
                    <p className="text-xs text-primary mt-3 font-medium">
                      → 전환율: 85% (평균 대비 +24%)
                    </p>
                  </div>

                  <div className="p-4 bg-muted/30 border border-border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      <p className="text-sm font-medium">💡 핵심 인사이트</p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      소개받은 고객의 전환율이 일반 고객보다 2.3배 높으며, 기존
                      고객의 소개 의향도는 만족도와 직접적 상관관계가 있습니다.
                    </p>
                    <p className="text-xs text-primary font-medium">
                      → 고객 만족도 관리가 성장의 핵심 동력
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
