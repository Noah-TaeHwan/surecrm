import type { Route } from './+types/influencers-page';
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
import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { useState } from 'react';
import { MainLayout } from '~/common/layouts/main-layout';
import { Form, useNavigate } from 'react-router';
import {
  TrendingUp,
  Users,
  Heart,
  Award,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  BarChart3,
} from 'lucide-react';

// 업데이트된 컴포넌트 imports
import { StatsCards } from '../components/stats-cards';
import { InfluencerRankingCard } from '../components/influencer-ranking-card';
import { InfluencerAnalysisCard } from '../components/influencer-analysis-card';
import { GratitudeManagement } from '../components/gratitude-management';
import { GratitudeModal } from '../components/gratitude-modal';

// 새로운 타입 시스템 imports
import type {
  InfluencerDisplayData,
  NetworkAnalysisDisplayData,
  GratitudeHistoryDisplayItem,
  GratitudeFormData,
  InfluencerKPIData,
  PeriodFilter,
  ModalState,
  TabState,
} from '../types';

// 업데이트된 데이터 함수 imports
import {
  getTopInfluencers,
  getGratitudeHistory,
  getNetworkAnalysis,
  createGratitude,
} from '../lib/influencers-data';
import { requireAuth } from '~/lib/auth/helpers';

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireAuth(request);
  const formData = await request.formData();

  const actionType = formData.get('actionType') as string;

  if (actionType === 'createGratitude') {
    try {
      const gratitudeData: GratitudeFormData = {
        influencerId: formData.get('influencerId') as string,
        type: formData.get('type') as any,
        title: formData.get('title') as string,
        message: formData.get('message') as string,
        giftType: (formData.get('giftType') as any) || undefined,
        scheduledDate: formData.get('scheduledDate')
          ? new Date(formData.get('scheduledDate') as string)
          : undefined,
        personalizedMessage:
          (formData.get('personalizedMessage') as string) || undefined,
        cost: formData.get('cost') ? Number(formData.get('cost')) : undefined,
        vendor: (formData.get('vendor') as string) || undefined,
        isRecurring: formData.get('isRecurring') === 'true',
        recurringInterval: formData.get('recurringInterval')
          ? Number(formData.get('recurringInterval'))
          : undefined,
        templateId: (formData.get('templateId') as string) || undefined,
      };

      const result = await createGratitude(gratitudeData);

      if (result.success) {
        return {
          success: true,
          message: result.message || '감사 표현이 성공적으로 전송되었습니다.',
        };
      } else {
        return {
          success: false,
          error: result.error || '감사 표현 전송 중 오류가 발생했습니다.',
        };
      }
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

  // URL에서 기간 파라미터 추출 (확장된 옵션)
  const url = new URL(request.url);
  const period = url.searchParams.get('period') || 'all';
  const tab = url.searchParams.get('tab') || 'ranking';

  try {
    // 모든 데이터를 병렬로 조회 (성능 최적화)
    const [topInfluencers, gratitudeHistory, networkAnalysis] =
      await Promise.all([
        getTopInfluencers(userId, 20, period), // 더 많은 데이터 조회
        getGratitudeHistory(userId, 15),
        getNetworkAnalysis(userId),
      ]);

    // KPI 데이터 생성 (networkAnalysis 기반)
    const kpiData: InfluencerKPIData = generateKPIData(
      networkAnalysis,
      topInfluencers
    );

    return {
      topInfluencers,
      gratitudeHistory,
      networkAnalysis,
      kpiData,
      selectedPeriod: period,
      activeTab: tab,
      // 추가 필터 옵션들
      periodOptions: getPeriodOptions(),
      totalInfluencers: topInfluencers.length,
      hasMoreData: topInfluencers.length >= 20,
    };
  } catch (error) {
    console.error('Influencers 페이지 로더 오류:', error);

    // 에러 시 기본값 반환
    return {
      topInfluencers: [],
      gratitudeHistory: [],
      networkAnalysis: {
        totalInfluencers: 0,
        activeInfluencers: 0,
        averageConversionRate: 0,
        totalNetworkValue: 0,
        avgNetworkDepth: 0,
        avgNetworkWidth: 0,
        monthlyGrowth: 0,
        averageRelationshipStrength: 0,
        totalGratitudesSent: 0,
        averageGratitudeFrequency: 0,
        dataQualityScore: 0,
        confidenceLevel: 0,
        lastCalculated: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        overallNetworkStrength: 0,
        networkGrowthRate: 0,
        averageReferralsPerInfluencer: 0,
        maxNetworkDepth: 1,
        totalSecondDegreeConnections: 0,
        strongConnections: 0,
        conversionRate: 0,
        averageContractValue: 0,
        trends: {
          referrals: [],
          conversions: [],
          value: [],
          gratitude: [],
        },
        monthlyTrends: [],
      },
      kpiData: getDefaultKPIData(),
      selectedPeriod: 'all',
      activeTab: 'ranking',
      periodOptions: getPeriodOptions(),
      totalInfluencers: 0,
      hasMoreData: false,
    };
  }
}

export function meta({ data, params }: Route.MetaArgs) {
  const totalInfluencers = data?.totalInfluencers || 0;
  const networkValue = data?.networkAnalysis?.totalNetworkValue || 0;
  const formattedValue =
    networkValue >= 100000000
      ? `${(networkValue / 100000000).toFixed(1)}억원`
      : `${(networkValue / 10000).toFixed(0)}만원`;

  return [
    { title: `핵심 소개자 관리 (${totalInfluencers}명) - SureCRM` },
    {
      name: 'description',
      content: `${totalInfluencers}명의 핵심 소개자가 ${formattedValue}의 네트워크 가치를 창출했습니다. 체계적인 감사 관리로 소개 관계를 강화하세요.`,
    },
    {
      name: 'keywords',
      content:
        '핵심 소개자, 소개 네트워크, 감사 관리, 관계 강화, 보험 영업, CRM',
    },
  ];
}

export default function InfluencersPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const {
    topInfluencers,
    gratitudeHistory,
    networkAnalysis,
    kpiData,
    selectedPeriod,
    activeTab,
    periodOptions,
    totalInfluencers,
    hasMoreData,
  } = loaderData;

  const navigate = useNavigate();

  // 상태 관리 (기존 로직 유지)
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    type: 'gratitude',
  });

  const [currentTab, setCurrentTab] = useState<TabState['active']>(
    activeTab as TabState['active']
  );

  const [currentPeriod, setCurrentPeriod] = useState(selectedPeriod);

  // 이벤트 핸들러들
  const handlePeriodChange = (period: string) => {
    setCurrentPeriod(period);
    const url = new URL(window.location.href);
    url.searchParams.set('period', period);
    if (currentTab !== 'ranking') {
      url.searchParams.set('tab', currentTab);
    }
    navigate(url.pathname + url.search, { replace: true });
  };

  const handleTabChange = (tab: TabState['active']) => {
    setCurrentTab(tab);
    const url = new URL(window.location.href);
    if (tab !== 'ranking') {
      url.searchParams.set('tab', tab);
    } else {
      url.searchParams.delete('tab');
    }
    if (currentPeriod !== 'all') {
      url.searchParams.set('period', currentPeriod);
    }
    navigate(url.pathname + url.search, { replace: true });
  };

  const handleGratitudeClick = (influencer: InfluencerDisplayData) => {
    setModalState({
      isOpen: true,
      type: 'gratitude',
      data: { influencer },
    });
  };

  const handleGratitudeSubmit = async (data: any) => {
    // Form 제출 로직은 기존 유지
    try {
      const formData = new FormData();
      formData.append('actionType', 'createGratitude');
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const response = await fetch(window.location.href, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setModalState({ isOpen: false, type: 'gratitude' });
        // 성공 피드백 표시
        navigate(window.location.pathname + window.location.search, {
          replace: true,
        });
      } else {
        console.error('감사 표현 전송 실패:', result.error);
      }
    } catch (error) {
      console.error('감사 표현 제출 오류:', error);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* 🎯 헤더 영역 - app.css 스타일 적용 */}
        <div className="border-b bg-card">
          <div className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    핵심 소개자 관리
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    소개 네트워크의 핵심 인물들을 체계적으로 관리하고 관계를
                    강화하세요
                  </p>
                </div>
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex items-center gap-3">
              <Select value={currentPeriod} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-36">
                  <Calendar className="h-4 w-4" />
                  <SelectValue placeholder="기간 선택" />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                새로고침
              </Button>

              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                내보내기
              </Button>

              <Button
                onClick={() => handleGratitudeClick(topInfluencers[0])}
                className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Heart className="h-4 w-4" />
                감사 표현하기
              </Button>
            </div>
          </div>
        </div>

        {/* 📊 KPI 요약 카드 */}
        <div className="p-6">
          <StatsCards kpiData={kpiData} />
        </div>

        {/* 🗂️ 메인 탭 컨텐츠 */}
        <div className="px-6 pb-6">
          <Tabs
            value={currentTab}
            onValueChange={handleTabChange as (value: string) => void}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
              <TabsTrigger value="ranking" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                랭킹 분석
              </TabsTrigger>
              <TabsTrigger value="analysis" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                네트워크 분석
              </TabsTrigger>
              <TabsTrigger value="gratitude" className="gap-2">
                <Heart className="h-4 w-4" />
                감사 관리
              </TabsTrigger>
              <TabsTrigger value="network" className="gap-2">
                <Users className="h-4 w-4" />
                관계 지도
              </TabsTrigger>
            </TabsList>

            {/* 랭킹 분석 탭 */}
            <TabsContent value="ranking" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      핵심 소개자 랭킹
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-sm">
                        총 {totalInfluencers}명
                      </Badge>
                      {hasMoreData && (
                        <Badge variant="secondary" className="text-sm">
                          더 보기 가능
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <InfluencerRankingCard
                    influencers={topInfluencers}
                    onGratitudeClick={handleGratitudeClick}
                    period={currentPeriod}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* 네트워크 분석 탭 */}
            <TabsContent value="analysis" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    소개 네트워크 분석
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <InfluencerAnalysisCard
                    analysisData={networkAnalysis}
                    period={currentPeriod}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* 감사 관리 탭 */}
            <TabsContent value="gratitude" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    감사 표현 관리
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <GratitudeManagement
                    influencers={topInfluencers}
                    gratitudeHistory={gratitudeHistory}
                    onGratitudeClick={handleGratitudeClick}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* 관계 지도 탭 */}
            <TabsContent value="network" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    소개 관계 지도
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      관계 지도 뷰
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      소개 네트워크의 시각적 관계도를 제공합니다
                    </p>
                    <Button variant="outline">네트워크 지도 보기</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* 🎁 감사 표현 모달 */}
        <GratitudeModal
          isOpen={modalState.isOpen}
          onOpenChange={(open) =>
            setModalState((prev) => ({ ...prev, isOpen: open }))
          }
          selectedInfluencer={modalState.data?.influencer || null}
          onSubmit={handleGratitudeSubmit}
        />
      </div>
    </MainLayout>
  );
}

// 헬퍼 함수들 (기존 로직 유지)

function generateKPIData(
  networkAnalysis: NetworkAnalysisDisplayData,
  topInfluencers: InfluencerDisplayData[]
): InfluencerKPIData {
  // 실제 데이터 기반으로 KPI 생성
  const averageRelationshipStrength =
    topInfluencers.length > 0
      ? topInfluencers.reduce((sum, inf) => sum + inf.relationshipStrength, 0) /
        topInfluencers.length
      : 0;

  return {
    totalInfluencers: {
      value: networkAnalysis.totalInfluencers,
      change: 12.5, // 실제로는 이전 기간과 비교
      trend: 'up',
      label: '총 핵심 소개자',
      target: Math.ceil(networkAnalysis.totalInfluencers * 1.2), // 20% 성장 목표
    },
    averageConversionRate: {
      value: networkAnalysis.averageConversionRate,
      change: 5.8,
      trend: 'up',
      label: '평균 계약 전환율',
      format: 'percentage',
      target: 75, // 75% 목표
    },
    totalNetworkValue: {
      value: networkAnalysis.totalNetworkValue,
      change: 18.3,
      trend: 'up',
      label: '총 네트워크 가치',
      format: 'currency',
      target: Math.ceil(networkAnalysis.totalNetworkValue * 1.3), // 30% 성장 목표
    },
    avgRelationshipStrength: {
      value: averageRelationshipStrength,
      change: 4.2,
      trend: 'up',
      label: '평균 관계 강도',
      format: 'score',
      maxValue: 10,
      target: 8.0, // 8.0 목표
    },
    monthlyGrowth: {
      value: networkAnalysis.monthlyGrowth,
      change: 2.1,
      trend: networkAnalysis.monthlyGrowth > 0 ? 'up' : 'down',
      label: '월별 성장률',
      format: 'percentage',
    },
    gratitudesSent: {
      value: networkAnalysis.totalGratitudesSent,
      change: 25.7,
      trend: 'up',
      label: '감사 표현 전송',
      target: Math.ceil(networkAnalysis.totalInfluencers * 2), // 인당 2건 목표
    },
  };
}

function getPeriodOptions(): Array<{ value: string; label: string }> {
  return [
    { value: 'all', label: '전체 기간' },
    { value: 'last7days', label: '최근 7일' },
    { value: 'last30days', label: '최근 30일' },
    { value: 'last3months', label: '최근 3개월' },
    { value: 'month', label: '이번 달' },
    { value: 'quarter', label: '이번 분기' },
    { value: 'year', label: '올해' },
  ];
}

function getDefaultKPIData(): InfluencerKPIData {
  return {
    totalInfluencers: {
      value: 0,
      change: 0,
      trend: 'stable',
      label: '총 핵심 소개자',
    },
    averageConversionRate: {
      value: 0,
      change: 0,
      trend: 'stable',
      label: '평균 계약 전환율',
      format: 'percentage',
    },
    totalNetworkValue: {
      value: 0,
      change: 0,
      trend: 'stable',
      label: '총 네트워크 가치',
      format: 'currency',
    },
    avgRelationshipStrength: {
      value: 0,
      change: 0,
      trend: 'stable',
      label: '평균 관계 강도',
      format: 'score',
      maxValue: 10,
    },
    monthlyGrowth: {
      value: 0,
      change: 0,
      trend: 'stable',
      label: '월별 성장률',
      format: 'percentage',
    },
    gratitudesSent: {
      value: 0,
      change: 0,
      trend: 'stable',
      label: '감사 표현 전송',
    },
  };
}
