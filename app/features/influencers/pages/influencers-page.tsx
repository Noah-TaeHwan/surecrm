import type { Route } from '.react-router/types/app/features/influencers/pages/+types/influencers-page';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/common/components/ui/tabs';
import { useState } from 'react';
import { MainLayout } from '~/common/layouts/main-layout';
import { Form, useNavigate } from 'react-router';

// 컴포넌트 imports
import { StatsCards } from '../components/stats-cards';
import { InfluencerRankingCard } from '../components/influencer-ranking-card';
import { InfluencerAnalysisCard } from '../components/influencer-analysis-card';
import { GratitudeManagement } from '../components/gratitude-management';
import { GratitudeModal } from '../components/gratitude-modal';

// 타입 imports
import type {
  Influencer,
  NetworkAnalysis,
  GratitudeHistoryItem,
  GratitudeFormData,
} from '../components/types';

// 데이터 함수 imports
import {
  getTopInfluencers,
  getGratitudeHistory,
  getNetworkAnalysis,
  createGratitude,
} from '../lib/influencers-data';
import { requireAuth } from '../lib/auth-utils';

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireAuth(request);
  const formData = await request.formData();

  const actionType = formData.get('actionType') as string;

  if (actionType === 'createGratitude') {
    try {
      const gratitudeData = {
        clientId: formData.get('influencerId') as string,
        agentId: userId,
        type: formData.get('type') as string,
        message: formData.get('message') as string,
        giftType: (formData.get('giftType') as string) || undefined,
        scheduledDate: (formData.get('scheduledDate') as string) || undefined,
      };

      await createGratitude(gratitudeData);

      return {
        success: true,
        message: '감사 표현이 성공적으로 전송되었습니다.',
      };
    } catch (error) {
      console.error('감사 표현 생성 오류:', error);
      return {
        success: false,
        error: '감사 표현 전송 중 오류가 발생했습니다.',
      };
    }
  }

  return { success: false, error: '알 수 없는 액션입니다.' };
}

export async function loader({ request }: Route.LoaderArgs) {
  // 인증 확인
  const userId = await requireAuth(request);

  // URL에서 기간 파라미터 추출
  const url = new URL(request.url);
  const period = url.searchParams.get('period') || 'all';

  try {
    // 모든 데이터를 병렬로 조회
    const [topInfluencers, gratitudeHistory, networkAnalysis] =
      await Promise.all([
        getTopInfluencers(userId, 10, period),
        getGratitudeHistory(userId, 10),
        getNetworkAnalysis(userId),
      ]);

    return {
      topInfluencers,
      gratitudeHistory,
      networkAnalysis,
      selectedPeriod: period,
    };
  } catch (error) {
    console.error('Influencers 페이지 로더 오류:', error);

    // 에러 시 기본값 반환
    return {
      topInfluencers: [],
      gratitudeHistory: [],
      networkAnalysis: {
        totalInfluencers: 0,
        averageConversionRate: 0,
        totalNetworkValue: 0,
        avgNetworkDepth: 0,
        avgNetworkWidth: 0,
        monthlyGrowth: 0,
      },
      selectedPeriod: 'all',
    };
  }
}

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '핵심 소개자 - SureCRM' },
    {
      name: 'description',
      content: '가장 많은 소개를 제공한 고객을 관리합니다',
    },
  ];
}

export default function InfluencersPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { topInfluencers, gratitudeHistory, networkAnalysis, selectedPeriod } =
    loaderData;
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('ranking');
  const [isGratitudeOpen, setIsGratitudeOpen] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] =
    useState<Influencer | null>(null);

  // 기간 변경 핸들러
  const handlePeriodChange = (period: string) => {
    const url = new URL(window.location.href);
    if (period === 'all') {
      url.searchParams.delete('period');
    } else {
      url.searchParams.set('period', period);
    }
    navigate(url.pathname + url.search);
  };

  // 감사 표현 클릭 핸들러
  const handleGratitudeClick = (influencer: Influencer) => {
    setSelectedInfluencer(influencer);
    setIsGratitudeOpen(true);
  };

  // 감사 표현 제출 핸들러
  const handleGratitudeSubmit = async (
    data: GratitudeFormData & { influencerId: string }
  ) => {
    // 폼 데이터 생성
    const formData = new FormData();
    formData.append('actionType', 'createGratitude');
    formData.append('influencerId', data.influencerId);
    formData.append('type', data.type);
    formData.append('message', data.message);
    if (data.giftType) formData.append('giftType', data.giftType);
    if (data.scheduledDate)
      formData.append('scheduledDate', data.scheduledDate);

    // 폼 제출
    const form = document.createElement('form');
    form.method = 'POST';
    form.style.display = 'none';

    for (const [key, value] of formData.entries()) {
      const input = document.createElement('input');
      input.name = key;
      input.value = value as string;
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    // 모달 닫기
    setIsGratitudeOpen(false);
  };

  return (
    <MainLayout title="핵심 소개자">
      <div className="min-h-screen w-full">
        <div className="space-y-6 stable-scrollbar w-full max-w-none">
          {/* 헤더 */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <p className="text-muted-foreground">
                소개 네트워크의 핵심 인물들을 분석하고 관계를 관리하세요
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-40 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="cursor-pointer" value="all">
                    전체 기간
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="year">
                    올해
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="quarter">
                    이번 분기
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="month">
                    이번 달
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 요약 통계 */}
          <StatsCards networkAnalysis={networkAnalysis} />

          {/* 탭 컨텐츠 */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4 w-full"
          >
            <TabsList className="h-full">
              <TabsTrigger value="ranking">소개자 랭킹</TabsTrigger>
              <TabsTrigger value="analysis">영향력 분석</TabsTrigger>
              <TabsTrigger value="gratitude">감사 관리</TabsTrigger>
            </TabsList>

            {/* 소개자 랭킹 탭 */}
            <TabsContent value="ranking" className="w-full">
              <InfluencerRankingCard
                influencers={topInfluencers}
                onGratitudeClick={handleGratitudeClick}
              />
            </TabsContent>

            {/* 영향력 분석 탭 */}
            <TabsContent value="analysis" className="w-full">
              <InfluencerAnalysisCard influencers={topInfluencers} />
            </TabsContent>

            {/* 감사 관리 탭 */}
            <TabsContent value="gratitude" className="w-full">
              <GratitudeManagement
                influencers={topInfluencers}
                gratitudeHistory={gratitudeHistory}
                onGratitudeClick={handleGratitudeClick}
              />
            </TabsContent>
          </Tabs>

          {/* 감사 표현 모달 */}
          <GratitudeModal
            isOpen={isGratitudeOpen}
            onOpenChange={setIsGratitudeOpen}
            selectedInfluencer={selectedInfluencer}
            onSubmit={handleGratitudeSubmit}
          />
        </div>
      </div>
    </MainLayout>
  );
}
