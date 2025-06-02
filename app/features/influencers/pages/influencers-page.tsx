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
import { requireAuth } from '~/lib/auth/middleware';

export async function action({ request }: Route.ActionArgs) {
  const user = await requireAuth(request);
  const userId = user.id;
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
  try {
    // 인증 확인
    const user = await requireAuth(request);
    const userId = user.id;

    // URL에서 기간 파라미터 추출 (확장된 옵션)
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'all';
    const tab = url.searchParams.get('tab') || 'ranking';

    // 각 데이터를 개별적으로 조회하여 하나가 실패해도 다른 것들은 정상적으로 로드
    let topInfluencers: any[] = [];
    let gratitudeHistory: any[] = [];
    let networkAnalysis: any = null;

    // 핵심 소개자 데이터 조회
    try {
      topInfluencers = await getTopInfluencers(userId, 20, period);
    } catch (error) {
      console.error('핵심 소개자 조회 실패:', error);
      topInfluencers = [];
    }

    // 감사 표현 이력 조회
    try {
      gratitudeHistory = await getGratitudeHistory(userId, 15);
    } catch (error) {
      console.error('감사 표현 이력 조회 실패:', error);
      gratitudeHistory = [];
    }

    // 네트워크 분석 조회
    try {
      networkAnalysis = await getNetworkAnalysis(userId);
    } catch (error) {
      console.error('네트워크 분석 조회 실패:', error);
      networkAnalysis = getDefaultNetworkAnalysis();
    }

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
      networkAnalysis: getDefaultNetworkAnalysis(),
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
    <MainLayout title="핵심 소개자">
      <div className="space-y-6">
        {/* 🎯 핵심 소개자 관리 요약 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 빠른 현황 요약 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                핵심 소개자 현황
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                현재 관리 중인 핵심 소개자들의 주요 지표
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">총 핵심 소개자</span>
                  <Badge variant="default">{totalInfluencers}명</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">활성 소개자</span>
                  <Badge variant="secondary">
                    {kpiData.totalInfluencers.value}명
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">평균 전환율</span>
                  <Badge variant="outline">
                    {kpiData.averageConversionRate.value.toFixed(1)}%
                  </Badge>
                </div>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full h-10 opacity-60 cursor-not-allowed"
                    disabled
                  >
                    <Download className="h-4 w-4 mr-2" />
                    소개자 목록 내보내기
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    MVP에서는 제공되지 않는 기능입니다
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 네트워크 가치 요약 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                네트워크 가치
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                소개 네트워크가 창출한 총 가치
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {(kpiData.totalNetworkValue.value / 100000000).toFixed(1)}
                    억원
                  </div>
                  <div className="text-sm text-muted-foreground">
                    총 네트워크 가치
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">월별 성장률</span>
                  <Badge
                    variant={
                      kpiData.monthlyGrowth.trend === 'up'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {kpiData.monthlyGrowth.value > 0 ? '+' : ''}
                    {kpiData.monthlyGrowth.value.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">평균 관계 강도</span>
                  <Badge variant="outline">
                    {kpiData.avgRelationshipStrength.value.toFixed(1)}/10
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 📊 KPI 요약 카드 */}
        <StatsCards kpiData={kpiData} />

        {/* 🔍 검색 및 필터 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>소개자 검색 및 분석</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {totalInfluencers}명의 핵심 소개자가 등록되어 있습니다
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={currentPeriod}
                  onValueChange={handlePeriodChange}
                >
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
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs
              value={currentTab}
              onValueChange={handleTabChange as (value: string) => void}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
                <TabsTrigger value="ranking" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  랭킹 분석
                </TabsTrigger>
                <TabsTrigger value="analysis" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  네트워크 분석
                </TabsTrigger>
              </TabsList>

              {/* 랭킹 분석 탭 */}
              <TabsContent value="ranking" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
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
                      <BarChart3 className="h-5 w-5 text-primary" />
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
            </Tabs>
          </CardContent>
        </Card>

        {/* 🎁 감사 표현 모달 - MVP 방침에 따라 주석처리 */}
        {/* 
        <GratitudeModal
          isOpen={modalState.isOpen}
          type={modalState.type}
          influencer={modalState.data?.influencer}
          onClose={() => setModalState({ isOpen: false, type: 'gratitude' })}
          onSubmit={handleGratitudeSubmit}
        />
        */}
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

function getDefaultNetworkAnalysis() {
  return {
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
  };
}
