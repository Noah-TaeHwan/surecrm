import type { Route } from '.react-router/types/app/features/dashboard/pages/+types/dashboard-page';
import { MainLayout } from '~/common/layouts/main-layout';
import { WelcomeSection } from '../components/welcome-section';
import { PerformanceKPICards } from '../components/performance-kpi-cards';
import { TodayAgenda } from '../components/today-agenda';
import { PipelineOverview } from '../components/pipeline-overview';
import { RecentClients } from '../components/recent-clients';
import { ReferralInsights } from '../components/referral-insights';

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '대시보드 - SureCRM' },
    { name: 'description', content: 'SureCRM 대시보드' },
  ];
}

export function loader({ request }: Route.LoaderArgs) {
  // 실제 구현에서는 DB에서 데이터를 가져오는 로직이 들어갑니다
  return {
    // Welcome Section 데이터
    user: {
      name: '김보험',
    },
    todayStats: {
      scheduledMeetings: 3,
      pendingTasks: 7,
      newReferrals: 2,
    },

    // Performance KPI 데이터
    kpiData: {
      totalClients: 247,
      monthlyNewClients: 18,
      totalReferrals: 85,
      conversionRate: 68.5,
      monthlyGrowth: {
        clients: 12.3,
        referrals: 25.6,
        revenue: 8.4,
      },
    },

    // Today Agenda 데이터 (미팅만)
    todayMeetings: [
      {
        id: '1',
        clientName: '김영희',
        time: '10:00',
        duration: 60,
        type: '첫 상담',
        location: '사무실 1층 상담실',
        status: 'upcoming' as const,
        reminderSent: true,
      },
      {
        id: '2',
        clientName: '이철수',
        time: '14:30',
        duration: 45,
        type: '계약 검토',
        location: '온라인 미팅',
        status: 'upcoming' as const,
        reminderSent: false,
      },
      {
        id: '3',
        clientName: '박지성',
        time: '16:00',
        duration: 30,
        type: '니즈 분석',
        location: '카페 미팅',
        status: 'upcoming' as const,
        reminderSent: true,
      },
    ],

    // Pipeline Overview 데이터
    pipelineData: {
      stages: [
        {
          id: '1',
          name: '리드 확보',
          count: 12,
          value: 2400,
          conversionRate: 85,
        },
        {
          id: '2',
          name: '첫 상담',
          count: 8,
          value: 1600,
          conversionRate: 70,
        },
        {
          id: '3',
          name: '제안서 작성',
          count: 5,
          value: 1200,
          conversionRate: 60,
        },
        {
          id: '4',
          name: '계약 협상',
          count: 3,
          value: 800,
          conversionRate: 90,
        },
        {
          id: '5',
          name: '계약 체결',
          count: 2,
          value: 600,
        },
      ],
      totalValue: 6600,
      monthlyTarget: 8000,
    },

    // Recent Clients 데이터
    recentClientsData: {
      recentClients: [
        {
          id: '1',
          name: '김영희',
          status: 'proposal' as const,
          lastContactDate: '2024-01-15',
          potentialValue: 450,
          referredBy: '박지성',
          stage: '생명보험 제안 진행중',
        },
        {
          id: '2',
          name: '이철수',
          status: 'contacted' as const,
          lastContactDate: '2024-01-14',
          potentialValue: 320,
          stage: '니즈 분석 완료',
        },
        {
          id: '3',
          name: '정수현',
          status: 'contracted' as const,
          lastContactDate: '2024-01-13',
          potentialValue: 680,
          referredBy: '김민지',
          stage: '화재보험 계약 체결',
        },
        {
          id: '4',
          name: '박민지',
          status: 'prospect' as const,
          lastContactDate: '2024-01-12',
          potentialValue: 250,
          stage: '초기 접촉 대기',
        },
        {
          id: '5',
          name: '최수진',
          status: 'proposal' as const,
          lastContactDate: '2024-01-11',
          potentialValue: 520,
          referredBy: '정현우',
          stage: '자동차보험 제안 검토중',
        },
      ],
      totalClients: 247,
    },

    // Referral Insights 데이터
    topReferrers: [
      {
        id: '1',
        name: '박지성',
        totalReferrals: 12,
        successfulConversions: 10,
        conversionRate: 83.3,
        lastReferralDate: '2024-01-15',
        rank: 1,
        recentActivity: '김민수님을 통해 새로운 리드 확보',
      },
      {
        id: '2',
        name: '김민지',
        totalReferrals: 8,
        successfulConversions: 6,
        conversionRate: 75.0,
        lastReferralDate: '2024-01-12',
        rank: 2,
        recentActivity: '이영호님 화재보험 계약 성공',
      },
      {
        id: '3',
        name: '정현우',
        totalReferrals: 6,
        successfulConversions: 4,
        conversionRate: 66.7,
        lastReferralDate: '2024-01-10',
        rank: 3,
        recentActivity: '가족 대상 보험 상품 소개 진행',
      },
      {
        id: '4',
        name: '최수진',
        totalReferrals: 5,
        successfulConversions: 3,
        conversionRate: 60.0,
        lastReferralDate: '2024-01-08',
        rank: 4,
        recentActivity: '직장 동료 네트워크 확장 중',
      },
      {
        id: '5',
        name: '한도윤',
        totalReferrals: 4,
        successfulConversions: 2,
        conversionRate: 50.0,
        lastReferralDate: '2024-01-05',
        rank: 5,
        recentActivity: '동네 상인회 멤버 소개 예정',
      },
    ],

    networkStats: {
      totalConnections: 124,
      networkDepth: 4,
      activeReferrers: 23,
      monthlyGrowth: 15.6,
    },
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
