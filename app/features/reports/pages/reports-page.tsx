import type { Route } from '.react-router/types/app/features/reports/pages/+types/reports-page';
import { useState } from 'react';
import { Button } from '~/common/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Download } from 'lucide-react';
import { MainLayout } from '~/common/layouts/main-layout';
import {
  getPerformanceData,
  getTopPerformers,
  createDefaultReportTemplates,
  type PerformanceData,
  type TopPerformer,
} from '../lib/supabase-reports-data';

// 분리된 컴포넌트들 import
import { PerformanceMetrics, KakaoReport, InsightsTabs } from '../components';

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '보고서 - SureCRM' },
    { name: 'description', content: '비즈니스 성과 보고서를 확인하세요' },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    // 하드코딩된 사용자 ID (실제로는 인증에서 가져와야 함)
    const userId = '80b0993a-4194-4165-be5a-aec24b88cd80';

    // 기본 날짜 범위 설정 (이번 달)
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // 기본 리포트 템플릿 생성 (없는 경우)
    await createDefaultReportTemplates(userId);

    // 성과 데이터와 최고 성과자 데이터를 병렬로 가져오기
    const [performance, topPerformers] = await Promise.all([
      getPerformanceData(userId, startDate, endDate),
      getTopPerformers(userId, 5),
    ]);

    return { performance, topPerformers };
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
    };

    return {
      performance: defaultPerformance,
      topPerformers: [] as TopPerformer[],
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
    },
    topPerformers: [],
  };

  const { performance, topPerformers } = loaderData || defaultData;
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  return (
    <MainLayout title="보고서">
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              비즈니스 성과와 주요 지표를 확인하세요
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">이번 주</SelectItem>
                <SelectItem value="month">이번 달</SelectItem>
                <SelectItem value="quarter">이번 분기</SelectItem>
                <SelectItem value="year">올해</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
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
