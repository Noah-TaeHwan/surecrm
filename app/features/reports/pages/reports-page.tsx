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

// 분리된 컴포넌트들 import
import {
  PerformanceMetrics,
  KakaoReport,
  InsightsTabs,
  type PerformanceData,
  type TopPerformer,
} from '../components';

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '보고서 - SureCRM' },
    { name: 'description', content: '비즈니스 성과 보고서를 확인하세요' },
  ];
}

export function loader({ request }: Route.LoaderArgs) {
  const performance: PerformanceData = {
    totalClients: 245,
    newClients: 28,
    totalReferrals: 89,
    conversionRate: 68.5,
    revenue: 125000000,
    growth: {
      clients: 12.5,
      referrals: 15.2,
      revenue: 18.3,
    },
  };

  const topPerformers: TopPerformer[] = [
    {
      id: '1',
      name: '김영희',
      clients: 45,
      conversions: 32,
      revenue: 28000000,
    },
    {
      id: '2',
      name: '박철수',
      clients: 38,
      conversions: 28,
      revenue: 24000000,
    },
    {
      id: '3',
      name: '이민수',
      clients: 32,
      conversions: 22,
      revenue: 19000000,
    },
  ];

  return { performance, topPerformers };
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
