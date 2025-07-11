import type { Route } from './+types/reports-page';
import { useState, useEffect } from 'react';
import { Button } from '~/common/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Download, Calendar, RefreshCw } from 'lucide-react';
import { MainLayout } from '~/common/layouts/main-layout';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';
import {
  getPerformanceData,
  getTopPerformers,
  createDefaultReportTemplates,
  type PerformanceData,
  type TopPerformer,
} from '../lib/supabase-reports-data';

import { redirect } from 'react-router';

// 🔧 추가: 설정에서 사용자 프로필 가져오기
import { getUserProfile } from '~/features/settings/lib/supabase-settings-data';

// 🔧 추가: 대시보드 목표 데이터 가져오기
import { getUserGoals } from '~/features/dashboard/lib/dashboard-data';

// 분리된 컴포넌트들 import
import { PerformanceMetrics, KakaoReport, InsightsTabs } from '../components';

// 🔧 수정: 서버 전용 기간 계산 헬퍼 함수 (클라이언트에서는 사용하지 않음)
function getDateRangeOnServer(period: string): {
  startDate: Date;
  endDate: Date;
} {
  // 서버에서만 실행
  if (typeof window !== 'undefined') {
    throw new Error('이 함수는 서버에서만 실행되어야 합니다.');
  }

  const now = new Date();
  let startDate: Date;
  let endDate: Date = new Date(); // 오늘까지

  switch (period) {
    case 'week':
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 7
      );
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'quarter':
      const quarterStart = Math.floor(now.getMonth() / 3) * 3;
      startDate = new Date(now.getFullYear(), quarterStart, 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return { startDate, endDate };
}

// 🌍 다국어 메타 정보
export function meta({ data }: Route.MetaArgs) {
  const meta = data?.meta;

  if (!meta) {
    // 기본값 fallback
    return [
      { title: '보고서 - SureCRM' },
      {
        name: 'description',
        content: 'SureCRM 보고서 - 비즈니스 성과와 주요 지표를 확인하세요',
      },
    ];
  }

  return [
    { title: meta.title + ' - SureCRM' },
    { name: 'description', content: meta.description },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    // 🔥 구독 상태 확인 (트라이얼 만료 시 billing 페이지로 리다이렉트)
    const { requireActiveSubscription } = await import(
      '~/lib/auth/subscription-middleware.server'
    );
    const { user } = await requireActiveSubscription(request);

    // 🌍 서버에서 다국어 번역 로드
    const { createServerTranslator } = await import(
      '~/lib/i18n/language-manager.server'
    );
    const translator = await createServerTranslator(request, 'reports');
    const t = translator.t;

    // 🎯 실제 데이터 조회 (수익 리포트 강화)
    const agentId = user.id;

    // URL에서 기간 파라미터 확인
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'month';

    // 🔧 수정: 서버에서만 날짜 계산
    const { startDate, endDate } = getDateRangeOnServer(period);

    // 🔧 추가: 사용자 프로필 정보 가져오기 (설정 페이지에서 관리하는 이름)
    const userProfile = await getUserProfile(agentId);

    // 기본 리포트 템플릿 생성 (없는 경우)
    await createDefaultReportTemplates(agentId);

    // 성과 데이터, 최고 성과자 데이터, 사용자 목표 데이터를 병렬로 가져오기
    const [performance, topPerformers, userGoals] = await Promise.all([
      getPerformanceData(agentId, startDate, endDate),
      getTopPerformers(agentId, 5),
      getUserGoals(agentId), // 🔧 추가: 사용자 목표 데이터
    ]);

    // 🔧 수정: 서버에서 날짜 포맷팅하여 Hydration 오류 방지
    const formatServerDate = (date: Date) => {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      });
    };

    return {
      performance,
      topPerformers,
      userGoals, // 🔧 추가: 사용자 목표 데이터 반환
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        formatted: `${formatServerDate(startDate)} ~ ${formatServerDate(
          endDate
        )}`,
      },
      // 🔧 수정: 설정 페이지의 실제 사용자 이름 사용
      user: {
        id: user.id,
        name: userProfile?.name || user.email?.split('@')[0] || '사용자',
        email: user.email,
      },
      // 🔧 추가: 서버 타임스탬프 추가 (클라이언트 동기화용)
      serverTimestamp: new Date().toISOString(),
      // 🌍 meta용 번역 데이터
      meta: {
        title: t('meta.title', '보고서'),
        description: t(
          'meta.description',
          'SureCRM 보고서 - 비즈니스 성과와 주요 지표를 확인하세요'
        ),
      },
    };
  } catch (error) {
    console.error('Error loading reports data:', error);

    // 🌍 에러 발생 시에도 번역 시도
    let meta = {
      title: '보고서',
      description: 'SureCRM 보고서 - 비즈니스 성과와 주요 지표를 확인하세요',
    };

    try {
      const { createServerTranslator } = await import(
        '~/lib/i18n/language-manager.server'
      );
      const translator = await createServerTranslator(request, 'reports');
      const t = translator.t;

      meta = {
        title: t('meta.title', '보고서'),
        description: t(
          'meta.description',
          'SureCRM 보고서 - 비즈니스 성과와 주요 지표를 확인하세요'
        ),
      };
    } catch (translationError) {
      // 번역 실패 시 기본값 사용
      console.error('번역 로드 실패:', translationError);
    }

    // 🔧 수정: 오류 발생 시에도 서버 타임스탬프 포함
    const now = new Date().toISOString();
    const nowDate = new Date();
    const defaultPerformance: PerformanceData = {
      totalClients: 0,
      newClients: 0,
      totalReferrals: 0,
      conversionRate: 0,
      revenue: 0,
      growth: { clients: 0, referrals: 0, revenue: 0 },
      averageClientValue: 0,
      meetingsCount: 0,
      activeClients: 0,
      monthlyRecurringRevenue: 0,
      consultationStats: {
        totalConsultations: 0,
        consultationsThisPeriod: 0,
        averageConsultationsPerClient: 0,
        mostFrequentNoteType: '상담',
        consultationGrowth: 0,
      },
    };

    return {
      performance: defaultPerformance,
      topPerformers: [] as TopPerformer[],
      userGoals: [], // 🔧 추가: 빈 목표 배열
      period: 'month',
      dateRange: {
        start: now,
        end: now,
        formatted: nowDate.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
        }),
      },
      user: {
        id: 'unknown',
        name: '사용자',
        email: '',
      },
      serverTimestamp: now,
      // 🌍 meta 데이터 (번역 처리됨)
      meta,
    };
  }
}

export function action({ request }: Route.ActionArgs) {
  return { success: true };
}

export default function ReportsPage({ loaderData }: Route.ComponentProps) {
  const { t } = useHydrationSafeTranslation('reports');

  const defaultData = {
    performance: {
      totalClients: 0,
      newClients: 0,
      totalReferrals: 0,
      conversionRate: 0,
      revenue: 0,
      growth: { clients: 0, referrals: 0, revenue: 0 },
      averageClientValue: 0,
      meetingsCount: 0,
      activeClients: 0,
      monthlyRecurringRevenue: 0,
      consultationStats: {
        totalConsultations: 0,
        consultationsThisPeriod: 0,
        averageConsultationsPerClient: 0,
        mostFrequentNoteType: '상담',
        consultationGrowth: 0,
      },
    },
    topPerformers: [],
    userGoals: [], // 🔧 추가: 기본 빈 목표 배열
    period: 'month',
    dateRange: {
      start: '2024-01-01T00:00:00.000Z',
      end: '2024-01-01T00:00:00.000Z',
      formatted: '2024. 1. 1. ~ 2024. 1. 1.',
    },
    user: {
      id: 'unknown',
      name: '사용자',
      email: '',
    },
    serverTimestamp: '2024-01-01T00:00:00.000Z',
  };

  const {
    performance,
    topPerformers,
    userGoals, // 🔧 추가: 사용자 목표 데이터 추출
    period,
    dateRange,
    user,
    serverTimestamp,
  } = loaderData || defaultData;
  const [selectedPeriod, setSelectedPeriod] = useState(period || 'month');
  const [isLoading, setIsLoading] = useState(false);

  // 기간 변경시 페이지 새로고침
  const handlePeriodChange = (newPeriod: string) => {
    setSelectedPeriod(newPeriod);
    setIsLoading(true);
    const url = new URL(window.location.href);
    url.searchParams.set('period', newPeriod);
    window.location.href = url.toString();
  };

  // 데이터 다운로드 기능
  const handleDownload = () => {
    // 🔧 수정: 서버 타임스탬프 사용
    const downloadDate = serverTimestamp
      ? new Date(serverTimestamp).toISOString().split('T')[0]
      : 'unknown';

    const reportData = {
      [t('downloadData.period')]: t(`periods.${selectedPeriod}`),
      [t('downloadData.dateRange')]: dateRange.formatted,
      [t('downloadData.totalClients')]: performance.totalClients,
      [t('downloadData.newClients')]: performance.newClients,
      [t('downloadData.totalReferrals')]: performance.totalReferrals,
      [t('downloadData.conversionRate')]: `${performance.conversionRate}%`,
      [t('downloadData.revenue')]: `${performance.revenue.toLocaleString()}원`,
      [t('downloadData.growth')]: {
        [t('downloadData.clientsGrowth')]:
          `${performance.growth.clients > 0 ? '+' : ''}${
            performance.growth.clients
          }%`,
        [t('downloadData.referralsGrowth')]:
          `${performance.growth.referrals > 0 ? '+' : ''}${
            performance.growth.referrals
          }%`,
        [t('downloadData.revenueGrowth')]:
          `${performance.growth.revenue > 0 ? '+' : ''}${
            performance.growth.revenue
          }%`,
      },
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${t('title')}_${t(`periods.${selectedPeriod}`)}_${downloadDate}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <MainLayout title={t('title')}>
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
        {/* 🎯 모바일 최적화: 헤더 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="space-y-1">
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t('subtitle')}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center">
              <Calendar className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              {dateRange.formatted}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Select
              value={selectedPeriod}
              onValueChange={handlePeriodChange}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full sm:w-32 min-h-[44px]">
                <SelectValue />
                {isLoading && (
                  <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                )}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">{t('periods.week')}</SelectItem>
                <SelectItem value="month">{t('periods.month')}</SelectItem>
                <SelectItem value="quarter">{t('periods.quarter')}</SelectItem>
                <SelectItem value="year">{t('periods.year')}</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="min-h-[44px] px-3 sm:px-4 flex-shrink-0"
            >
              <Download className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{t('buttons.download')}</span>
              <span className="sm:hidden">{t('buttons.save')}</span>
            </Button>
          </div>
        </div>

        {/* 🎯 모바일 최적화: 핵심 지표 카드들 */}
        <PerformanceMetrics
          performance={performance}
          period={{
            type: selectedPeriod as any,
            startDate: new Date(dateRange.start),
            endDate: new Date(dateRange.end),
            label: dateRange.formatted,
          }}
          t={t}
        />

        {/* 🎯 모바일 최적화: 카카오톡 업무 보고 양식 */}
        <KakaoReport
          performance={performance}
          user={user}
          period={selectedPeriod}
        />

        {/* 🎯 모바일 최적화: 비즈니스 인사이트 탭 - 🔧 수정: userGoals 전달 */}
        <InsightsTabs performance={performance} userGoals={userGoals} />
      </div>
    </MainLayout>
  );
}
