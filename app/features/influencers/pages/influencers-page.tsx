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

export function loader({ request }: Route.LoaderArgs) {
  // TODO: 실제 API에서 데이터 가져오기

  // 핵심 소개자 랭킹 데이터
  const topInfluencers: Influencer[] = [
    {
      id: '1',
      name: '김영희',
      avatar: '',
      rank: 1,
      totalReferrals: 12,
      successfulContracts: 8,
      conversionRate: 67,
      totalContractValue: 240000000,
      networkDepth: 3,
      networkWidth: 15,
      lastGratitude: '2024-01-10',
      monthlyReferrals: [2, 3, 4, 3], // 최근 4개월
      referralPattern: {
        family: 6,
        health: 3,
        car: 2,
        life: 1,
      },
      relationshipStrength: 95,
    },
    {
      id: '2',
      name: '박철수',
      avatar: '',
      rank: 2,
      totalReferrals: 10,
      successfulContracts: 7,
      conversionRate: 70,
      totalContractValue: 180000000,
      networkDepth: 2,
      networkWidth: 12,
      lastGratitude: '2024-01-05',
      monthlyReferrals: [3, 2, 3, 2],
      referralPattern: {
        car: 4,
        health: 3,
        family: 2,
        life: 1,
      },
      relationshipStrength: 88,
    },
    {
      id: '3',
      name: '이민수',
      avatar: '',
      rank: 3,
      totalReferrals: 8,
      successfulContracts: 6,
      conversionRate: 75,
      totalContractValue: 150000000,
      networkDepth: 2,
      networkWidth: 10,
      lastGratitude: '2023-12-20',
      monthlyReferrals: [2, 2, 2, 2],
      referralPattern: {
        health: 4,
        family: 3,
        life: 1,
      },
      relationshipStrength: 82,
    },
    {
      id: '4',
      name: '정수연',
      avatar: '',
      rank: 4,
      totalReferrals: 6,
      successfulContracts: 5,
      conversionRate: 83,
      totalContractValue: 120000000,
      networkDepth: 1,
      networkWidth: 6,
      lastGratitude: '2024-01-15',
      monthlyReferrals: [1, 2, 2, 1],
      referralPattern: {
        family: 4,
        health: 2,
      },
      relationshipStrength: 90,
    },
  ];

  // 감사 관리 데이터
  const gratitudeHistory: GratitudeHistoryItem[] = [
    {
      id: '1',
      influencerId: '1',
      influencerName: '김영희',
      type: 'message',
      message: '항상 좋은 분들을 소개해주셔서 감사합니다.',
      giftType: null,
      sentDate: '2024-01-10',
      scheduledDate: null,
      status: 'sent',
    },
    {
      id: '2',
      influencerId: '2',
      influencerName: '박철수',
      type: 'gift',
      message: '새해 복 많이 받으시고, 올해도 잘 부탁드립니다.',
      giftType: 'flower',
      sentDate: null,
      scheduledDate: '2024-02-01',
      status: 'scheduled',
    },
  ];

  // 네트워크 효과 분석
  const networkAnalysis: NetworkAnalysis = {
    totalInfluencers: topInfluencers.length,
    averageConversionRate: 71,
    totalNetworkValue: 690000000,
    avgNetworkDepth: 2.0,
    avgNetworkWidth: 10.8,
    monthlyGrowth: 12, // percentage
  };

  return {
    topInfluencers,
    gratitudeHistory,
    networkAnalysis,
  };
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

export default function InfluencersPage({ loaderData }: Route.ComponentProps) {
  const { topInfluencers, gratitudeHistory, networkAnalysis } = loaderData;

  const [activeTab, setActiveTab] = useState('ranking');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [isGratitudeOpen, setIsGratitudeOpen] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] =
    useState<Influencer | null>(null);

  // 감사 표현 클릭 핸들러
  const handleGratitudeClick = (influencer: Influencer) => {
    setSelectedInfluencer(influencer);
    setIsGratitudeOpen(true);
  };

  // 감사 표현 제출 핸들러
  const handleGratitudeSubmit = (
    data: GratitudeFormData & { influencerId: string }
  ) => {
    console.log('감사 표현:', data);
    // TODO: API 호출
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
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
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
