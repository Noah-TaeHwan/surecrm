import type { Route } from '.react-router/types/app/features/reports/pages/+types/reports-page';
import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Badge } from '~/common/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/common/components/ui/tabs';
import { Progress } from '~/common/components/ui/progress';
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/common/components/ui/table';
import {
  CalendarIcon,
  TriangleUpIcon,
  TriangleDownIcon,
  DownloadIcon,
  InfoCircledIcon,
  ActivityLogIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  BarChartIcon,
  PersonIcon,
  Link2Icon,
  StarIcon,
} from '@radix-ui/react-icons';
import { Link } from 'react-router';
import { useState } from 'react';
import { MainLayout } from '~/common/layouts/main-layout';
import { cn } from '~/lib/utils';

export function loader({ request }: Route.LoaderArgs) {
  // TODO: 실제 API에서 데이터 가져오기

  // 성과 지표 데이터
  const performanceMetrics = {
    totalClients: 245,
    totalReferrals: 89,
    conversionRate: 68.5,
    totalContractValue: 1250000000,
    monthlyGrowth: {
      clients: 12.5,
      referrals: 15.2,
      contracts: 8.7,
      revenue: 18.3,
    },
    quarterlyTargets: {
      clients: { current: 245, target: 300, completion: 81.7 },
      referrals: { current: 89, target: 120, completion: 74.2 },
      contracts: { current: 61, target: 80, completion: 76.3 },
      revenue: { current: 1250, target: 1500, completion: 83.3 },
    },
  };

  // 네트워크 분석 데이터
  const networkAnalysis = {
    totalNodes: 245,
    totalConnections: 89,
    averagePathLength: 2.4,
    clusteringCoefficient: 0.75,
    topInfluencers: [
      { id: '1', name: '김영희', influence: 95, connections: 12 },
      { id: '2', name: '박철수', influence: 88, connections: 10 },
      { id: '3', name: '이민수', influence: 82, connections: 8 },
    ],
    networkGrowth: [
      { month: '10월', nodes: 180, connections: 65 },
      { month: '11월', nodes: 205, connections: 74 },
      { month: '12월', nodes: 230, connections: 82 },
      { month: '1월', nodes: 245, connections: 89 },
    ],
  };

  // 예측 분석 데이터
  const predictions = {
    nextQuarterClients: {
      predicted: 320,
      confidence: 85,
      factors: ['계절적 요인', '마케팅 캠페인', '소개 증가'],
    },
    riskClients: [
      {
        id: '10',
        name: '최민수',
        risk: 'high',
        lastContact: '2023-11-15',
        reason: '장기간 미접촉',
      },
      {
        id: '11',
        name: '정수연',
        risk: 'medium',
        lastContact: '2023-12-20',
        reason: '관심도 하락',
      },
    ],
    opportunities: [
      {
        type: '교차 판매',
        potential: 15,
        description: '기존 고객 대상 추가 상품',
      },
      {
        type: '소개 확대',
        potential: 23,
        description: '핵심 소개자 네트워크 활용',
      },
      { type: '신규 채널', potential: 8, description: '디지털 마케팅 채널' },
    ],
  };

  // 인사이트 데이터
  const insights = [
    {
      id: '1',
      type: 'network',
      title: '소개 네트워크 확장 기회',
      description: '김영희님을 통한 소개 성공률이 높아 추가 연결 개발 권장',
      impact: 'high',
      actionable: true,
      recommendation: '김영희님과의 정기 미팅 설정 및 네트워크 확장 전략 수립',
    },
    {
      id: '2',
      type: 'performance',
      title: '가족보험 상품 집중 필요',
      description: '가족보험 전환율이 다른 상품 대비 25% 높음',
      impact: 'medium',
      actionable: true,
      recommendation: '가족 단위 고객 대상 맞춤형 마케팅 강화',
    },
    {
      id: '3',
      type: 'risk',
      title: '장기 미접촉 고객 주의',
      description: '3개월 이상 미접촉 고객 5명의 이탈 위험 증가',
      impact: 'medium',
      actionable: true,
      recommendation: '즉시 연락 및 관계 회복 프로그램 실행',
    },
  ];

  return {
    performanceMetrics,
    networkAnalysis,
    predictions,
    insights,
  };
}

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '보고서 - SureCRM' },
    {
      name: 'description',
      content: '소개 네트워크 및 영업 성과 보고서를 확인합니다',
    },
  ];
}

export default function ReportsPage({ loaderData }: Route.ComponentProps) {
  const { performanceMetrics, networkAnalysis, predictions, insights } =
    loaderData;

  const [activeTab, setActiveTab] = useState('performance');
  const [selectedPeriod, setSelectedPeriod] = useState('quarter');

  // 증감 표시 컴포넌트
  const TrendIndicator = ({
    value,
    isPositive,
  }: {
    value: number;
    isPositive: boolean;
  }) => (
    <div
      className={cn(
        'flex items-center gap-1 text-sm',
        isPositive ? 'text-green-600' : 'text-red-600'
      )}
    >
      {isPositive ? (
        <TriangleUpIcon className="h-3 w-3" />
      ) : (
        <TriangleDownIcon className="h-3 w-3" />
      )}
      <span>{Math.abs(value)}%</span>
    </div>
  );

  // 영향도별 색상
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <MainLayout title="보고서">
      <div className="container mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">비즈니스 보고서</h1>
            <p className="text-muted-foreground">
              성과 분석과 예측을 통한 비즈니스 인사이트
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">이번 달</SelectItem>
                <SelectItem value="quarter">이번 분기</SelectItem>
                <SelectItem value="year">올해</SelectItem>
                <SelectItem value="custom">사용자 정의</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <DownloadIcon className="mr-2 h-4 w-4" />
              보고서 다운로드
            </Button>
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="performance">성과 대시보드</TabsTrigger>
            <TabsTrigger value="network">네트워크 분석</TabsTrigger>
            <TabsTrigger value="predictions">예측 분석</TabsTrigger>
            <TabsTrigger value="insights">인사이트</TabsTrigger>
          </TabsList>

          {/* 성과 대시보드 탭 */}
          <TabsContent value="performance" className="mt-6">
            <div className="space-y-6">
              {/* 핵심 지표 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>총 고객 수</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {performanceMetrics.totalClients}명
                    </div>
                    <TrendIndicator
                      value={performanceMetrics.monthlyGrowth.clients}
                      isPositive={true}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>총 소개 건수</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {performanceMetrics.totalReferrals}건
                    </div>
                    <TrendIndicator
                      value={performanceMetrics.monthlyGrowth.referrals}
                      isPositive={true}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>계약 전환율</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {performanceMetrics.conversionRate}%
                    </div>
                    <TrendIndicator
                      value={performanceMetrics.monthlyGrowth.contracts}
                      isPositive={true}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>총 계약 가치</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(
                        performanceMetrics.totalContractValue / 100000000
                      ).toFixed(1)}
                      억원
                    </div>
                    <TrendIndicator
                      value={performanceMetrics.monthlyGrowth.revenue}
                      isPositive={true}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* 분기 목표 달성률 */}
              <Card>
                <CardHeader>
                  <CardTitle>분기 목표 달성률</CardTitle>
                  <CardDescription>현재 분기 목표 대비 성과</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.entries(performanceMetrics.quarterlyTargets).map(
                      ([key, target]) => (
                        <div key={key} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium capitalize">
                              {key}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {target.completion.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={target.completion} className="h-2" />
                          <div className="text-sm text-muted-foreground">
                            {target.current} / {target.target}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 성과 트렌드 차트 영역 */}
              <Card>
                <CardHeader>
                  <CardTitle>성과 트렌드</CardTitle>
                  <CardDescription>월별 주요 지표 변화</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChartIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium text-muted-foreground">
                        트렌드 차트
                      </p>
                      <p className="text-sm text-muted-foreground">
                        월별 고객 수, 소개 건수, 계약 성과 변화
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 네트워크 분석 탭 */}
          <TabsContent value="network" className="mt-6">
            <div className="space-y-6">
              {/* 네트워크 지표 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>총 노드 수</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {networkAnalysis.totalNodes}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>총 연결 수</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {networkAnalysis.totalConnections}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>평균 경로 길이</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {networkAnalysis.averagePathLength}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>클러스터링 계수</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {networkAnalysis.clusteringCoefficient}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 상위 영향력자 */}
              <Card>
                <CardHeader>
                  <CardTitle>네트워크 핵심 인물</CardTitle>
                  <CardDescription>
                    가장 높은 영향력을 가진 소개자들
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {networkAnalysis.topInfluencers.map((influencer, index) => (
                      <div
                        key={influencer.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold',
                              index === 0
                                ? 'bg-yellow-500'
                                : index === 1
                                ? 'bg-gray-400'
                                : 'bg-orange-500'
                            )}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <Link
                              to={`/clients/${influencer.id}`}
                              className="font-medium hover:underline"
                            >
                              {influencer.name}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {influencer.connections}개 연결
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-medium">영향력 점수</div>
                            <div className="text-sm text-muted-foreground">
                              {influencer.influence}/100
                            </div>
                          </div>
                          <Progress
                            value={influencer.influence}
                            className="w-20"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 네트워크 성장 */}
              <Card>
                <CardHeader>
                  <CardTitle>네트워크 성장</CardTitle>
                  <CardDescription>시간에 따른 네트워크 확장</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {networkAnalysis.networkGrowth.map((period, index) => (
                      <div
                        key={period.month}
                        className="flex items-center justify-between"
                      >
                        <span className="font-medium">{period.month}</span>
                        <div className="flex items-center gap-6">
                          <div className="text-sm">
                            노드:{' '}
                            <span className="font-medium">{period.nodes}</span>
                          </div>
                          <div className="text-sm">
                            연결:{' '}
                            <span className="font-medium">
                              {period.connections}
                            </span>
                          </div>
                          {index > 0 && (
                            <TrendIndicator
                              value={Math.round(
                                ((period.nodes -
                                  networkAnalysis.networkGrowth[index - 1]
                                    .nodes) /
                                  networkAnalysis.networkGrowth[index - 1]
                                    .nodes) *
                                  100
                              )}
                              isPositive={
                                period.nodes >
                                networkAnalysis.networkGrowth[index - 1].nodes
                              }
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 예측 분석 탭 */}
          <TabsContent value="predictions" className="mt-6">
            <div className="space-y-6">
              {/* 다음 분기 예측 */}
              <Card>
                <CardHeader>
                  <CardTitle>다음 분기 예측</CardTitle>
                  <CardDescription>AI 기반 성과 예측 분석</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <div className="text-3xl font-bold text-blue-600">
                          {predictions.nextQuarterClients.predicted}명
                        </div>
                        <div className="text-sm text-muted-foreground">
                          예상 신규 고객 수 (신뢰도:{' '}
                          {predictions.nextQuarterClients.confidence}%)
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm font-medium">
                          주요 영향 요인:
                        </div>
                        {predictions.nextQuarterClients.factors.map(
                          (factor, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="mr-2"
                            >
                              {factor}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                    <div className="h-40 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <TriangleUpIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          예측 모델 차트
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 위험 고객 */}
              <Card>
                <CardHeader>
                  <CardTitle>위험 고객 분석</CardTitle>
                  <CardDescription>이탈 위험이 높은 고객들</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>고객명</TableHead>
                        <TableHead>위험도</TableHead>
                        <TableHead>최종 접촉일</TableHead>
                        <TableHead>위험 요인</TableHead>
                        <TableHead className="text-right">권장 조치</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {predictions.riskClients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell>
                            <Link
                              to={`/clients/${client.id}`}
                              className="font-medium hover:underline"
                            >
                              {client.name}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                client.risk === 'high'
                                  ? 'destructive'
                                  : 'default'
                              }
                            >
                              {client.risk === 'high' ? '높음' : '보통'}
                            </Badge>
                          </TableCell>
                          <TableCell>{client.lastContact}</TableCell>
                          <TableCell>{client.reason}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline">
                              즉시 연락
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* 기회 분석 */}
              <Card>
                <CardHeader>
                  <CardTitle>성장 기회</CardTitle>
                  <CardDescription>수익 증대 기회 분석</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {predictions.opportunities.map((opportunity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{opportunity.type}</div>
                          <div className="text-sm text-muted-foreground">
                            {opportunity.description}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            +{opportunity.potential}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            예상 수익 증가
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 인사이트 탭 */}
          <TabsContent value="insights" className="mt-6">
            <div className="space-y-6">
              <Alert>
                <ActivityLogIcon className="h-4 w-4" />
                <AlertDescription>
                  AI가 분석한 비즈니스 인사이트와 실행 가능한 권장사항입니다.
                </AlertDescription>
              </Alert>

              {insights.map((insight) => (
                <Card key={insight.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {insight.type === 'network' && (
                            <Link2Icon className="h-5 w-5" />
                          )}
                          {insight.type === 'performance' && (
                            <BarChartIcon className="h-5 w-5" />
                          )}
                          {insight.type === 'risk' && (
                            <InfoCircledIcon className="h-5 w-5" />
                          )}
                          {insight.title}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {insight.description}
                        </CardDescription>
                      </div>
                      <Badge variant={getImpactBadge(insight.impact) as any}>
                        {insight.impact === 'high'
                          ? '높음'
                          : insight.impact === 'medium'
                          ? '보통'
                          : '낮음'}{' '}
                        영향도
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-medium mb-2">
                          권장 조치사항:
                        </div>
                        <p className="text-sm bg-muted p-3 rounded-lg">
                          {insight.recommendation}
                        </p>
                      </div>
                      {insight.actionable && (
                        <Button size="sm">조치사항 실행</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
