import type { Route } from '.react-router/types/app/features/dashboard/pages/+types/dashboard-page';
import { MainLayout } from '~/common/layouts/main-layout';
import { WelcomeSection } from '../components/welcome-section';
import { PerformanceKPICards } from '../components/performance-kpi-cards';
import { TodayAgenda } from '../components/today-agenda';
import { PipelineOverview } from '../components/pipeline-overview';
import { RecentClients } from '../components/recent-clients';
import { ReferralInsights } from '../components/referral-insights';
import {
  getUserInfo,
  getTodayStats,
  getKPIData,
  getTodayMeetings,
  getPipelineData,
  getRecentClientsData,
  getReferralInsights,
} from '../lib/dashboard-data';
import { requireAuth } from '../lib/auth-utils';

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '대시보드 - SureCRM' },
    { name: 'description', content: 'SureCRM 대시보드' },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  // 인증 확인
  const userId = await requireAuth(request);

  try {
    // 모든 데이터를 병렬로 조회
    const [
      user,
      todayStats,
      kpiData,
      todayMeetings,
      pipelineData,
      recentClientsData,
      referralInsights,
    ] = await Promise.all([
      getUserInfo(userId),
      getTodayStats(userId),
      getKPIData(userId),
      getTodayMeetings(userId),
      getPipelineData(userId),
      getRecentClientsData(userId),
      getReferralInsights(userId),
    ]);

    return {
      user,
      todayStats,
      kpiData,
      todayMeetings,
      pipelineData,
      recentClientsData,
      topReferrers: referralInsights.topReferrers,
      networkStats: referralInsights.networkStats,
    };
  } catch (error) {
    console.error('Dashboard 페이지 로더 오류:', error);

    // 에러 시 기본값 반환
    return {
      user: { name: '사용자' },
      todayStats: {
        scheduledMeetings: 0,
        pendingTasks: 0,
        newReferrals: 0,
      },
      kpiData: {
        totalClients: 0,
        monthlyNewClients: 0,
        totalReferrals: 0,
        conversionRate: 0,
        monthlyGrowth: {
          clients: 0,
          referrals: 0,
          revenue: 0,
        },
      },
      todayMeetings: [],
      pipelineData: {
        stages: [],
        totalValue: 0,
        monthlyTarget: 8000,
      },
      recentClientsData: {
        recentClients: [],
        totalClients: 0,
      },
      topReferrers: [],
      networkStats: {
        totalConnections: 0,
        networkDepth: 0,
        activeReferrers: 0,
        monthlyGrowth: 0,
      },
    };
  }
}

export default function DashboardPage({ loaderData }: Route.ComponentProps) {
  const {
    user,
    todayStats,
    kpiData,
    todayMeetings,
    pipelineData,
    recentClientsData,
    topReferrers,
    networkStats,
  } = loaderData;

  return (
    <MainLayout title="대시보드">
      <div className="space-y-8">
        {/* 환영 섹션 */}
        <WelcomeSection userName={user.name} todayStats={todayStats} />

        {/* 성과 지표 카드 */}
        <PerformanceKPICards data={kpiData} />

        {/* 오늘의 일정 및 영업 파이프라인 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TodayAgenda meetings={todayMeetings} />
          <PipelineOverview
            stages={pipelineData.stages}
            totalValue={pipelineData.totalValue}
            monthlyTarget={pipelineData.monthlyTarget}
          />
        </div>

        {/* 최근 고객 현황 및 소개 네트워크 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentClients
            recentClients={recentClientsData.recentClients}
            totalClients={recentClientsData.totalClients}
          />
          <div>
            <ReferralInsights
              topReferrers={topReferrers}
              networkStats={networkStats}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
