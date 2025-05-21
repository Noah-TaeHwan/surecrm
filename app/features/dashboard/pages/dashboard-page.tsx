import type { Route } from '.react-router/types/app/features/dashboard/pages/+types/dashboard-page';
import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { MainLayout } from '~/common/layouts/main-layout';
import {
  CalendarDays,
  Landmark,
  MoveUp,
  Network,
  Users,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router';
import { PipelineChart } from '../components/pipeline-chart';

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '대시보드 - SureCRM' },
    { name: 'description', content: 'SureCRM 대시보드' },
  ];
}

export function loader({ request }: Route.LoaderArgs) {
  // 실제 구현에서는 DB에서 데이터를 가져오는 로직이 들어갑니다
  return {
    stats: {
      totalClients: 12,
      activeDeals: 5,
      completedDeals: 3,
      todayMeetings: 2,
    },
    todayEvents: [
      // 샘플 데이터
      {
        id: '1',
        clientName: '김영희',
        time: '10:00 AM',
        type: '초기 상담',
        note: '상품 설명 자료 준비 필요',
      },
      {
        id: '2',
        clientName: '이철수',
        time: '2:30 PM',
        type: '계약 검토',
        note: '계약서 초안 검토',
      },
    ],
    topInfluencers: [
      {
        id: '1',
        name: '박지성',
        referrals: 5,
        conversionRate: 0.8,
      },
      {
        id: '2',
        name: '김민지',
        referrals: 3,
        conversionRate: 0.67,
      },
      {
        id: '3',
        name: '정현우',
        referrals: 2,
        conversionRate: 0.5,
      },
    ],
    pipelineStages: [
      {
        name: '첫 상담',
        count: 4,
        color: '#8884d8',
      },
      {
        name: '니즈 분석',
        count: 3,
        color: '#82ca9d',
      },
      {
        name: '상품 설명',
        count: 2,
        color: '#ffc658',
      },
      {
        name: '계약 검토',
        count: 1,
        color: '#ff8042',
      },
      {
        name: '계약 완료',
        count: 2,
        color: '#0088fe',
      },
    ],
  };
}

export default function DashboardPage({ loaderData }: Route.ComponentProps) {
  const { stats, todayEvents, topInfluencers, pipelineStages } = loaderData;

  return (
    <MainLayout title="대시보드">
      <div className="space-y-6">
        {/* 요약 카드 섹션 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 고객 수</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col items-start">
              <div className="text-2xl font-bold mb-4">
                {stats.totalClients}
              </div>
              <p className="text-xs text-muted-foreground">
                전주 대비 <span className="text-green-500">+20%</span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                영업 중인 고객
              </CardTitle>
              <MoveUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col items-start">
              <div className="text-2xl font-bold mb-4">{stats.activeDeals}</div>
              <p className="text-xs text-muted-foreground">
                전주 대비 <span className="text-green-500">+25%</span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">완료된 계약</CardTitle>
              <Landmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col items-start">
              <div className="text-2xl font-bold mb-4">
                {stats.completedDeals}
              </div>
              <p className="text-xs text-muted-foreground">
                전주 대비 <span className="text-green-500">+50%</span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">오늘의 미팅</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col items-start">
              <div className="text-2xl font-bold mb-4">
                {stats.todayMeetings}
              </div>
              <p className="text-xs text-muted-foreground">
                전주 대비 <span className="text-blue-500">±0%</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 메인 콘텐츠 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>오늘의 일정</CardTitle>
              <Link to="/calendar">
                <Button variant="ghost" size="sm" className="gap-1">
                  <span>모든 일정</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {todayEvents.length > 0 ? (
                <div className="space-y-4">
                  {todayEvents.map((event, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{event.clientName}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.time}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {event.type}
                        </p>
                        {event.note && <p className="text-sm">{event.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 space-y-3">
                  <CalendarDays className="h-12 w-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground">
                    예정된 미팅이 없습니다.
                  </p>
                  <Link to="/calendar">
                    <Button>미팅 예약</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>영업 단계별 분포</CardTitle>
            </CardHeader>
            <CardContent>
              {pipelineStages.length > 0 ? (
                <div>
                  <PipelineChart data={pipelineStages} />
                  <div className="mt-2 text-center">
                    <Link to="/pipeline">
                      <Button variant="outline" size="sm">
                        파이프라인 보기
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 space-y-3">
                  <div className="h-40 w-full flex items-center justify-center border rounded-md border-dashed">
                    <p className="text-muted-foreground">
                      아직 고객 데이터가 없습니다.
                    </p>
                  </div>
                  <Link to="/clients">
                    <Button>고객 추가</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>핵심 소개자 리스트</CardTitle>
            </CardHeader>
            <CardContent>
              {topInfluencers.length > 0 ? (
                <div className="space-y-4">
                  {topInfluencers.map((influencer) => (
                    <div
                      key={influencer.id}
                      className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium mb-2">{influencer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          소개 {influencer.referrals}건 / 전환율{' '}
                          {(influencer.conversionRate * 100).toFixed(0)}%
                        </p>
                      </div>
                      <Link to={`/influencers?id=${influencer.id}`}>
                        <Button variant="outline" size="sm">
                          상세보기
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <Network className="h-12 w-12 text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">
                    소개 데이터가 없습니다.
                  </p>
                </div>
              )}
              <div className="mt-4 text-center">
                <Link to="/network">
                  <Button variant="outline" size="sm" className="w-full">
                    소개 네트워크 보기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
