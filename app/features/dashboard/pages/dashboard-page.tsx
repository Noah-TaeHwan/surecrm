import type { Route } from './+types/dashboard-page';
import { useState } from 'react';
import { MainLayout } from '~/common/layouts/main-layout';
import { WelcomeSection } from '../components/welcome-section';
import { PerformanceKPICards } from '../components/performance-kpi-cards';
// 🗓️ 오늘의 일정 - 일정 관리 기능 개발 후 활성화 예정
// import { TodayAgenda } from '../components/today-agenda';
import { MyGoals } from '../components/my-goals';
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
  getUserGoals,
  setMonthlyGoal,
} from '../lib/dashboard-data';
import { requireAuth } from '~/lib/auth/middleware';
import { useFetcher } from 'react-router';

// 새로운 타입 시스템 import
import type {
  DashboardUserInfo,
  DashboardTodayStats,
  DashboardKPIData,
  DashboardMeeting,
  DashboardPipelineData,
  DashboardClientData,
  DashboardReferralInsights,
} from '../types';

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '대시보드 - SureCRM' },
    {
      name: 'description',
      content: 'SureCRM 대시보드 - 업무 현황을 한눈에 확인하세요',
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  // 인증 확인
  const user = await requireAuth(request);

  try {
    // 모든 데이터를 병렬로 조회 (성능 최적화)
    const [
      userInfo,
      todayStats,
      kpiData,
      todayMeetings,
      pipelineData,
      recentClientsData,
      referralInsights,
      userGoals,
    ] = await Promise.all([
      getUserInfo(user.id),
      getTodayStats(user.id),
      getKPIData(user.id),
      getTodayMeetings(user.id),
      getPipelineData(user.id),
      getRecentClientsData(user.id),
      getReferralInsights(user.id),
      getUserGoals(user.id),
    ]);

    return {
      user: userInfo,
      todayStats,
      kpiData,
      todayMeetings,
      pipelineData,
      recentClientsData,
      topReferrers: referralInsights.topReferrers,
      networkStats: referralInsights.networkStats,
      userGoals,
      // 성능 메트릭 (개발용)
      loadTime: Date.now(),
    };
  } catch (error) {
    console.error('Dashboard 페이지 로더 오류:', error);

    // 에러 시 안전한 기본값 반환
    const fallbackUserInfo: DashboardUserInfo = {
      id: user.id,
      name: user.fullName || '사용자',
      fullName: user.fullName || '사용자',
      role: 'agent',
      preferences: {
        theme: 'dark',
        language: 'ko',
        timezone: 'Asia/Seoul',
        dashboardLayout: 'grid',
      },
    };

    const fallbackTodayStats: DashboardTodayStats = {
      scheduledMeetings: 0,
      pendingTasks: 0,
      newReferrals: 0,
      completedMeetings: 0,
      missedMeetings: 0,
      urgentNotifications: 0,
      morningMeetings: 0,
      afternoonMeetings: 0,
      eveningMeetings: 0,
    };

    const fallbackKPIData: DashboardKPIData = {
      totalClients: 0,
      monthlyNewClients: 0,
      totalReferrals: 0,
      conversionRate: 0,
      monthlyGrowth: {
        clients: 0,
        referrals: 0,
        revenue: 0,
      },
      clientGrowthPercentage: 0,
      referralGrowthPercentage: 0,
      revenueGrowthPercentage: 0,
      averageClientValue: 0,
    };

    const fallbackPipelineData: DashboardPipelineData = {
      stages: [],
      totalValue: 0,
      monthlyTarget: 8000,
      progressPercentage: 0,
      weeklyTrend: [],
    };

    const fallbackClientData: DashboardClientData = {
      recentClients: [],
      totalClients: 0,
      newClientsThisMonth: 0,
      topClientsByValue: [],
      stageDistribution: [],
      importanceDistribution: [],
    };

    const fallbackReferralInsights: DashboardReferralInsights = {
      topReferrers: [],
      networkStats: {
        totalConnections: 0,
        networkDepth: 0,
        activeReferrers: 0,
        monthlyGrowth: 0,
        averageReferralsPerContact: 0,
      },
      monthlyReferralTrend: [],
    };

    return {
      user: fallbackUserInfo,
      todayStats: fallbackTodayStats,
      kpiData: fallbackKPIData,
      todayMeetings: [] as DashboardMeeting[],
      pipelineData: fallbackPipelineData,
      recentClientsData: fallbackClientData,
      topReferrers: fallbackReferralInsights.topReferrers,
      networkStats: fallbackReferralInsights.networkStats,
      userGoals: [],
      error: '데이터를 불러오는 중 오류가 발생했습니다.',
    };
  }
}

export async function action({ request }: Route.ActionArgs) {
  const user = await requireAuth(request);
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'setGoal') {
    try {
      const goalType = formData.get('goalType') as
        | 'revenue'
        | 'clients'
        | 'meetings'
        | 'referrals';
      const targetValue = Number(formData.get('targetValue'));
      const title = formData.get('title') as string;

      await setMonthlyGoal(user.id, goalType, targetValue, title || undefined);

      return {
        success: true,
        message: '목표가 성공적으로 설정되었습니다.',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('목표 설정 오류:', error);
      return {
        success: false,
        message: '목표 설정에 실패했습니다. 다시 시도해주세요.',
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }

  return {
    success: false,
    message: '알 수 없는 요청입니다.',
  };
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
    userGoals,
    error,
  } = loaderData;

  const fetcher = useFetcher();
  const [isLoading, setIsLoading] = useState(false);

  // 기존 컴포넌트와의 호환성을 위한 데이터 변환
  const transformedTodayMeetings = todayMeetings.map(
    (meeting: DashboardMeeting) => ({
      id: meeting.id,
      clientName: meeting.clientName,
      time: new Date(meeting.startTime).toTimeString().slice(0, 5), // HH:MM 형식
      duration: Math.round(
        (new Date(meeting.endTime).getTime() -
          new Date(meeting.startTime).getTime()) /
          (1000 * 60)
      ),
      type: meeting.type,
      location: meeting.location,
      status:
        meeting.status === 'scheduled'
          ? ('upcoming' as const)
          : meeting.status === 'in_progress'
          ? ('in-progress' as const)
          : meeting.status === 'completed'
          ? ('completed' as const)
          : ('cancelled' as const),
      reminderSent: false, // TODO: 실제 알림 상태로 대체
    })
  );

  // PipelineOverview 컴포넌트용 데이터 변환 (완전한 타입 호환성 확보)
  const transformedPipelineStages = pipelineData.stages.map((stage: any) => ({
    id: stage.id,
    name: stage.name,
    count: stage.clientCount || stage.count || 0, // clientCount를 count로 변환
    value: stage.value || 0,
    conversionRate: stage.conversionRate || 0,
  }));

  // RecentClients 컴포넌트용 데이터 변환 (완전한 타입 호환성 확보)
  const transformedRecentClients = recentClientsData.recentClients.map(
    (client: any) => ({
      id: client.id,
      name: client.fullName || client.name || '이름 없음',
      status: (() => {
        if (!client.currentStage) return 'prospect';
        switch (client.currentStage) {
          case '잠재고객':
            return 'prospect';
          case '접촉완료':
            return 'contacted';
          case '제안중':
            return 'proposal';
          case '계약체결':
            return 'contracted';
          case '완료':
            return 'completed';
          default:
            return 'prospect';
        }
      })() as
        | 'prospect'
        | 'contacted'
        | 'proposal'
        | 'contracted'
        | 'completed',
      lastContactDate: client.lastContactDate || new Date().toISOString(),
      potentialValue: (client.contractAmount || 0) / 10000, // 원을 만원으로 변환
      referredBy: client.referralDepth > 0 ? '소개 고객' : undefined,
      stage: client.currentStage || client.stage || '잠재고객',
    })
  );

  // ReferralInsights 컴포넌트용 데이터 변환 (완전한 타입 호환성 확보)
  const transformedTopReferrers = topReferrers.map(
    (referrer: any, index: number) => ({
      id: referrer.id,
      name: referrer.fullName || referrer.name || '이름 없음',
      totalReferrals: referrer.referralCount || referrer.totalReferrals || 0,
      successfulConversions: Math.round(
        ((referrer.conversionRate || 0) / 100) *
          (referrer.referralCount || referrer.totalReferrals || 0)
      ),
      conversionRate: referrer.conversionRate || 0,
      lastReferralDate: referrer.lastReferralDate || new Date().toISOString(),
      rank: index + 1,
      recentActivity: `최근 ${
        referrer.referralCount || referrer.totalReferrals || 0
      }건의 소개를 진행했습니다. 평균 전환율 ${(
        referrer.conversionRate || 0
      ).toFixed(1)}%를 기록하고 있습니다.`,
    })
  );

  // KPI 데이터 호환성 확보
  const compatibleKPIData = {
    ...kpiData,
    // 기존 필드가 없는 경우 기본값 제공
    clientGrowthPercentage:
      kpiData.clientGrowthPercentage ?? kpiData.monthlyGrowth?.clients ?? 0,
    referralGrowthPercentage:
      kpiData.referralGrowthPercentage ?? kpiData.monthlyGrowth?.referrals ?? 0,
    revenueGrowthPercentage:
      kpiData.revenueGrowthPercentage ?? kpiData.monthlyGrowth?.revenue ?? 0,
    averageClientValue: kpiData.averageClientValue ?? 0,
  };

  const handleSetGoal = async (goalData: {
    goalType: 'revenue' | 'clients' | 'meetings' | 'referrals';
    targetValue: number;
    title?: string;
  }) => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append('intent', 'setGoal');
    formData.append('goalType', goalData.goalType);
    formData.append('targetValue', goalData.targetValue.toString());
    if (goalData.title) {
      formData.append('title', goalData.title);
    }

    fetcher.submit(formData, { method: 'post' });
    setIsLoading(false);
  };

  // 에러 상태 표시
  if (error) {
    return (
      <MainLayout title="대시보드">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="text-lg font-medium text-muted-foreground">
              {error}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="대시보드">
      <div className="space-y-8">
        {/* 환영 섹션 */}
        <WelcomeSection userName={user.name} todayStats={todayStats} />

        {/* 성과 지표 카드 */}
        <PerformanceKPICards data={compatibleKPIData} isLoading={isLoading} />

        {/* 오늘의 일정 및 영업 파이프라인 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 🗓️ 오늘의 일정 - 일정 관리 기능 개발 후 활성화 예정 */}
          {/* <TodayAgenda meetings={transformedTodayMeetings} /> */}
          <MyGoals currentGoals={userGoals} onSetGoal={handleSetGoal} />
          <PipelineOverview
            stages={transformedPipelineStages}
            totalValue={pipelineData.totalValue}
            monthlyTarget={pipelineData.monthlyTarget}
            currentGoals={userGoals}
            onSaveGoal={handleSetGoal}
          />
        </div>

        {/* 최근 고객 현황 및 소개 네트워크 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentClients
            recentClients={transformedRecentClients}
            totalClients={recentClientsData.totalClients}
          />
          <ReferralInsights
            topReferrers={transformedTopReferrers}
            networkStats={networkStats}
          />
        </div>

        {/* 성공 메시지 표시 */}
        {fetcher.data?.success && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg">
            {fetcher.data.message}
          </div>
        )}

        {/* 에러 메시지 표시 */}
        {fetcher.data?.success === false && (
          <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-md shadow-lg">
            {fetcher.data.message}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
