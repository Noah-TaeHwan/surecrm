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
import {
  getPerformanceData,
  getTopPerformers,
  createDefaultReportTemplates,
  type PerformanceData,
  type TopPerformer,
} from '../lib/supabase-reports-data';

// 🔧 수정: 실제 인증 함수 import
import { getCurrentUser } from '~/lib/auth/core';
import { redirect } from 'react-router';

// 분리된 컴포넌트들 import
import { PerformanceMetrics, KakaoReport, InsightsTabs } from '../components';

// 기간 계산 헬퍼 함수
function getDateRange(period: string): { startDate: Date; endDate: Date } {
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

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '보고서 - SureCRM' },
    { name: 'description', content: '비즈니스 성과 보고서를 확인하세요' },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    // 🔧 수정: 실제 인증된 사용자 정보 가져오기
    const user = await getCurrentUser(request);
    if (!user) {
      throw redirect('/auth/login');
    }

    const userId = user.id;

    // URL에서 기간 파라미터 확인
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'month';
    const { startDate, endDate } = getDateRange(period);

    // 기본 리포트 템플릿 생성 (없는 경우)
    await createDefaultReportTemplates(userId);

    // 성과 데이터와 최고 성과자 데이터를 병렬로 가져오기
    const [performance, topPerformers] = await Promise.all([
      getPerformanceData(userId, startDate, endDate),
      getTopPerformers(userId, 5),
    ]);

    return {
      performance,
      topPerformers,
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    };
  } catch (error) {
    console.error('Error loading reports data:', error);

    // 오류 발생 시 기본값 반환
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
    };

    return {
      performance: defaultPerformance,
      topPerformers: [] as TopPerformer[],
      period: 'month',
      dateRange: {
        start: new Date().toISOString(),
        end: new Date().toISOString(),
      },
    };
  }
}

export function action({ request }: Route.ActionArgs) {
  return { success: true };
}

export default function ReportsPage({ loaderData }: Route.ComponentProps) {
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
    },
    topPerformers: [],
    period: 'month',
    dateRange: {
      start: new Date().toISOString(),
      end: new Date().toISOString(),
    },
  };

  const { performance, topPerformers, period, dateRange } =
    loaderData || defaultData;
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
    const reportData = {
      기간:
        selectedPeriod === 'week'
          ? '이번 주'
          : selectedPeriod === 'month'
          ? '이번 달'
          : selectedPeriod === 'quarter'
          ? '이번 분기'
          : '올해',
      조회기간: `${new Date(dateRange.start).toLocaleDateString()} ~ ${new Date(
        dateRange.end
      ).toLocaleDateString()}`,
      총고객수: performance.totalClients,
      신규고객: performance.newClients,
      총소개건수: performance.totalReferrals,
      전환율: `${performance.conversionRate}%`,
      매출: `${performance.revenue.toLocaleString()}원`,
      성장률: {
        고객: `${performance.growth.clients > 0 ? '+' : ''}${
          performance.growth.clients
        }%`,
        소개: `${performance.growth.referrals > 0 ? '+' : ''}${
          performance.growth.referrals
        }%`,
        매출: `${performance.growth.revenue > 0 ? '+' : ''}${
          performance.growth.revenue
        }%`,
      },
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `보고서_${selectedPeriod}_${
      new Date().toISOString().split('T')[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <MainLayout title="보고서">
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              비즈니스 성과와 주요 지표를 확인하세요
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              <Calendar className="inline h-4 w-4 mr-1" />
              {new Date(dateRange.start).toLocaleDateString()} ~{' '}
              {new Date(dateRange.end).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={selectedPeriod}
              onValueChange={handlePeriodChange}
              disabled={isLoading}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
                {isLoading && (
                  <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                )}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">이번 주</SelectItem>
                <SelectItem value="month">이번 달</SelectItem>
                <SelectItem value="quarter">이번 분기</SelectItem>
                <SelectItem value="year">올해</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              다운로드
            </Button>
          </div>
        </div>

        {/* 핵심 지표 카드들 */}
        <PerformanceMetrics performance={performance} />

        {/* 카카오톡 업무 보고 양식 */}
        <KakaoReport performance={performance} />

        {/* 비즈니스 인사이트 탭 */}
        <InsightsTabs performance={performance} topPerformers={topPerformers} />
      </div>
    </MainLayout>
  );
}
