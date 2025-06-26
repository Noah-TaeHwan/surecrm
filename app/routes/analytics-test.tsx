/**
 * 🧠 비즈니스 인텔리전스 & 고급 분석 테스트 페이지
 *
 * 사용자 경험 최적화를 위한 실시간 분석 및 인사이트 대시보드
 */

// import type { Route } from './+types/analytics-test';
import { useState, useEffect } from 'react';
import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Progress } from '~/common/components/ui/progress';
import { useBusinessIntelligence } from '~/hooks/use-business-intelligence';
import { InsuranceAgentEvents } from '~/lib/utils/analytics';
import {
  getUltraDataSystem,
  initializeUltraDataCollection,
} from '~/lib/utils/ultra-data-collection';
import {
  getGTMSystem,
  initializeEnhancedGTM,
  SureCRMGTMEvents,
} from '~/lib/utils/enhanced-gtm';
import { shouldCollectAnalytics } from '~/lib/utils/analytics-config';

export function meta() {
  return [
    { title: '비즈니스 인텔리전스 & 분석 테스트' },
    { name: 'description', content: '실시간 사용자 분석 및 인사이트 대시보드' },
  ];
}

export function loader() {
  return {
    message: '비즈니스 인텔리전스 시스템이 활성화되었습니다.',
  };
}

export default function AnalyticsTestPage() {
  const {
    isActive,
    userInsights,
    toggleAdvancedMode,
    getAnalyticsStream,
    predictUserBehavior,
    getPersonalizedRecommendations,
  } = useBusinessIntelligence();

  const [realTimeData, setRealTimeData] = useState<any>(null);
  const [predictions, setPredictions] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // 🔥 극한 데이터 수집 시스템 상태
  const [ultraDataActive, setUltraDataActive] = useState(false);
  const [ultraCollectedData, setUltraCollectedData] = useState<any>(null);
  const [gtmDataLayer, setGtmDataLayer] = useState<any[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>({
    totalEvents: 0,
    dataPointsPerSecond: 0,
    sessionDuration: 0,
    behaviorScore: 0,
  });

  // 실시간 데이터 스트림 업데이트
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const stream = getAnalyticsStream();
      if (stream) {
        setRealTimeData(stream);
      }

      const behaviorPredictions = predictUserBehavior();
      if (behaviorPredictions) {
        setPredictions(behaviorPredictions);
      }

      const personalizedRecs = getPersonalizedRecommendations();
      setRecommendations(personalizedRecs);
    }, 1000);

    return () => clearInterval(interval);
  }, [
    isActive,
    getAnalyticsStream,
    predictUserBehavior,
    getPersonalizedRecommendations,
  ]);

  // 🚀 극한 데이터 수집 시스템 업데이트
  useEffect(() => {
    if (!ultraDataActive) return;

    const interval = setInterval(() => {
      const ultraSystem = getUltraDataSystem();
      const gtmSystem = getGTMSystem();

      if (ultraSystem) {
        const collectedData = ultraSystem.getCollectedData();
        setUltraCollectedData(collectedData);

        // 실시간 메트릭 계산
        setRealTimeMetrics({
          totalEvents: collectedData.dataPoints?.length || 0,
          dataPointsPerSecond: Math.round(
            (collectedData.dataPoints?.length || 0) /
              ((Date.now() - collectedData.sessionStartTime) / 1000)
          ),
          sessionDuration: Math.round(
            (Date.now() - collectedData.sessionStartTime) / 1000
          ),
          behaviorScore: collectedData.businessMetrics?.satisfactionScore || 0,
        });
      }

      if (gtmSystem) {
        const dataLayer = gtmSystem.getDataLayer();
        setGtmDataLayer(dataLayer.slice(-10)); // 최근 10개만 표시
      }
    }, 500); // 더 빠른 업데이트

    return () => clearInterval(interval);
  }, [ultraDataActive]);

  // 테스트 이벤트 함수들
  const testEvents = {
    customerJourney: () => {
      InsuranceAgentEvents.clientView('test_client_123', {
        importance: '키맨',
        currentStage: '상담',
        daysSinceCreated: 15,
        meetingCount: 3,
        contractCount: 1,
      });
    },

    salesActivity: () => {
      InsuranceAgentEvents.opportunityCreate('생명보험', 5000000, '키맨');
    },

    userBehavior: () => {
      InsuranceAgentEvents.userIntentAnalysis('deep_analysis', 2, 85);
      InsuranceAgentEvents.emotionalStateAnalysis(3, 8, 7);
    },

    performanceTracking: () => {
      InsuranceAgentEvents.pagePerformanceAnalysis(1250, 800, 300);
      InsuranceAgentEvents.typingSpeedAnalysis(65, 120);
    },

    biometricData: () => {
      InsuranceAgentEvents.biometricSignature('mouse_pattern', 'ABC123XYZ789');
      InsuranceAgentEvents.mouseHeatmapData(250, 450, 5, 'button');
    },

    businessInsights: () => {
      InsuranceAgentEvents.featureUsage('advanced_analytics', 'testing', true);
      InsuranceAgentEvents.dashboardView({
        totalClients: 45,
        totalRevenue: 15000000,
        monthlyGrowth: 12.5,
        conversionRate: 8.3,
      });
    },

    // 🏢 새로운 보험설계사 특화 고급 이벤트들
    insuranceAI: () => {
      InsuranceAgentEvents.insuranceProductRecommendation(
        {
          ageGroup: '30-40',
          incomeLevel: 'high',
          familyStatus: 'married_with_children',
          riskProfile: 'moderate',
          preferences: 'comprehensive_coverage',
        },
        ['생명보험', '건강보험', '자녀보험'],
        0.85
      );
    },

    premiumOptimization: () => {
      InsuranceAgentEvents.premiumOptimizationAnalysis(
        1500000, // 원래 보험료
        1200000, // 최적화된 보험료
        {
          riskAdjustment: -15,
          discountApplied: 20,
          bundleDiscount: 5,
          loyaltyDiscount: 10,
        }
      );
    },

    customerLifetimeValue: () => {
      InsuranceAgentEvents.customerLifetimeValuePrediction(
        'client_test_456',
        25000000, // 예상 CLV
        {
          accuracy: 0.87,
          keyDrivers: [
            'income_stability',
            'family_expansion',
            'risk_awareness',
          ],
          timeHorizon: 15,
          marketConditions: 'stable',
          churnProbability: 0.12,
        }
      );
    },

    competitorAnalysis: () => {
      InsuranceAgentEvents.competitorAnalysis(
        '생명보험',
        {
          ourPremium: 800000,
          avgCompetitorPremium: 950000,
          premiumAdvantage: 15.8,
          coverageComparison: 'superior',
          competitiveEdge: 'better_service_lower_cost',
          winProbability: 0.78,
        },
        'market_leader'
      );
    },

    riskAssessment: () => {
      InsuranceAgentEvents.riskAssessmentModeling(
        {
          healthIndicators: 'excellent',
          lifestyleFactors: 'active_non_smoker',
          financialStability: 'high',
          occupationRisk: 'low',
          geographicRisk: 'minimal',
        },
        25, // 리스크 점수 (낮을수록 좋음)
        ['age_factor', 'lifestyle_health']
      );
    },

    salesFunnelAnalysis: () => {
      InsuranceAgentEvents.salesFunnelEfficiencyAnalysis(
        'proposal',
        32.5, // 전환율
        ['pricing_concerns', 'competitor_comparison', 'decision_delay']
      );
    },

    crossSellOpportunity: () => {
      InsuranceAgentEvents.crossSellUpsellAnalysis(
        'client_789',
        ['생명보험'],
        ['건강보험', '자동차보험'],
        0.72
      );
    },

    marketTrends: () => {
      InsuranceAgentEvents.marketTrendAnalysis(
        'digital_insurance_adoption',
        {
          direction: 'upward',
          strength: 'strong',
          duration: '6_months',
          segment: 'young_professionals',
          strategicImplications: 'expand_digital_offerings',
          actionRecommendations: 'invest_in_mobile_app',
        },
        'high_positive_impact'
      );
    },

    customerSatisfaction: () => {
      InsuranceAgentEvents.customerSatisfactionPrediction(
        'client_101',
        8.7, // 예상 만족도 (10점 만점)
        {
          keyDrivers: [
            'response_speed',
            'personalized_service',
            'claim_efficiency',
          ],
          serviceQuality: 9.2,
          productSuitability: 8.5,
          communicationEffectiveness: 8.8,
          responseTime: 9.0,
        }
      );
    },

    teamBenchmarking: () => {
      InsuranceAgentEvents.salesTeamBenchmarking(
        'agent_007',
        {
          salesVolume: 150000000,
          conversionRate: 18.5,
          customerRetention: 92.3,
          avgDealSize: 850000,
        },
        {
          avgSalesVolume: 120000000,
          avgConversionRate: 15.2,
          avgRetention: 88.7,
          avgDealSize: 750000,
        }
      );
    },

    marketingROI: () => {
      InsuranceAgentEvents.digitalMarketingROITracking(
        'campaign_2024_q1',
        {
          channel: 'social_media',
          duration: 90,
        },
        {
          totalInvestment: 5000000,
          totalRevenue: 18000000,
          totalROI: 360,
          costPerAcquisition: 125000,
          lifetimeValueRatio: 4.2,
        }
      );
    },

    complianceCheck: () => {
      InsuranceAgentEvents.complianceMonitoring(
        'data_protection',
        'compliant',
        'low'
      );
    },

    customerJourneyOpt: () => {
      InsuranceAgentEvents.customerJourneyOptimization(
        'onboarding',
        {
          currentConversionRate: 65,
          optimizedConversionRate: 78,
          improvementPercentage: 20,
          frictionPointsRemoved: 3,
          personalizationApplied: true,
          abTestWinner: 'variant_b',
          implementationEffort: 'medium',
          expectedRevenueImpact: 15000000,
        },
        85
      );
    },

    aiAssistantPerformance: () => {
      InsuranceAgentEvents.aiAssistantPerformanceTracking(
        'insurance_advisor_ai',
        {
          queryAccuracy: 94.5,
          responseTime: 1.2,
          taskCompletionRate: 87.3,
          learningImprovementRate: 12.8,
          modelVersion: 'v2.3.1',
          trainingDataFreshness: 7,
          fallbackToHumanRate: 5.2,
        },
        8.7
      );
    },

    predictiveAccuracy: () => {
      InsuranceAgentEvents.predictiveAnalyticsAccuracy(
        'churn_prediction',
        {
          overallAccuracy: 0.89,
          precisionScore: 0.85,
          recallScore: 0.92,
          f1Score: 0.88,
        },
        {
          confidence: 0.87,
          featureImportance: 'engagement_score,claim_frequency,premium_changes',
          modelDrift: false,
          retrainingRequired: false,
        }
      );
    },
  };

  // 🔥 극한 데이터 수집 테스트 함수들
  const ultraTestEvents = {
    activateUltraCollection: () => {
      initializeUltraDataCollection();
      initializeEnhancedGTM('GTM-WTCFV4DC');
      setUltraDataActive(true);
    },

    deactivateUltraCollection: () => {
      setUltraDataActive(false);
    },

    generateMouseHeatmap: () => {
      // 가상의 마우스 클릭 데이터 생성
      for (let i = 0; i < 20; i++) {
        setTimeout(() => {
          const x = Math.random() * window.innerWidth;
          const y = Math.random() * window.innerHeight;
          document.dispatchEvent(
            new MouseEvent('click', {
              clientX: x,
              clientY: y,
              bubbles: true,
            })
          );
        }, i * 100);
      }
    },

    simulateTypingPattern: () => {
      // 타이핑 패턴 시뮬레이션
      const keys = ['a', 'b', 'c', 'd', 'e', 'f'];
      keys.forEach((key, index) => {
        setTimeout(() => {
          document.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: key,
              bubbles: true,
            })
          );
        }, index * 200);
      });
    },

    triggerScrollEvents: () => {
      // 스크롤 이벤트 시뮬레이션
      let scrollPosition = 0;
      const scrollInterval = setInterval(() => {
        scrollPosition += 100;
        window.scrollTo(0, scrollPosition);
        if (scrollPosition > 500) {
          clearInterval(scrollInterval);
          window.scrollTo(0, 0);
        }
      }, 100);
    },

    sendCustomGTMEvent: () => {
      SureCRMGTMEvents.dashboardView({
        testEvent: true,
        timestamp: Date.now(),
        userAction: 'manual_test',
      });
    },

    testConversionTracking: () => {
      const ultraSystem = getUltraDataSystem();
      if (ultraSystem) {
        ultraSystem.trackConversion('test_conversion', 1000);
        ultraSystem.setCustomDimension('test_dimension', 'ultra_test_value');
      }
    },

    generateBehaviorPattern: () => {
      // 복잡한 사용자 행동 패턴 시뮬레이션
      ultraTestEvents.generateMouseHeatmap();
      setTimeout(() => ultraTestEvents.simulateTypingPattern(), 1000);
      setTimeout(() => ultraTestEvents.triggerScrollEvents(), 2000);
      setTimeout(() => ultraTestEvents.sendCustomGTMEvent(), 3000);
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🧠 비즈니스 인텔리전스 대시보드
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            실시간 사용자 분석, 행동 예측, 개인화 추천을 통한 최적의 사용자 경험
            제공
          </p>

          {/* 시스템 상태 */}
          <div className="flex justify-center items-center gap-4">
            <Button
              onClick={toggleAdvancedMode}
              variant={isActive ? 'destructive' : 'default'}
              className="px-8 py-2"
            >
              {isActive ? '🛑 고급 분석 중지' : '🚀 고급 분석 시작'}
            </Button>
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {isActive ? '분석 시스템 활성화' : '분석 시스템 비활성화'}
            </Badge>
          </div>
        </div>

        {/* 실시간 사용자 인사이트 */}
        {isActive && userInsights && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 실시간 사용자 인사이트
                <Badge variant="outline">LIVE</Badge>
              </CardTitle>
              <CardDescription>
                현재 세션의 사용자 행동 분석 및 예측 결과
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-slate-600">
                    참여도 분석
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>참여 수준</span>
                      <Badge
                        variant={
                          userInsights.engagementLevel === 'high'
                            ? 'default'
                            : userInsights.engagementLevel === 'medium'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {userInsights.engagementLevel === 'high'
                          ? '높음'
                          : userInsights.engagementLevel === 'medium'
                            ? '보통'
                            : '낮음'}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>전환 가능성</span>
                        <span>
                          {Math.round(userInsights.conversionProbability * 100)}
                          %
                        </span>
                      </div>
                      <Progress
                        value={userInsights.conversionProbability * 100}
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>이탈 위험도</span>
                        <span>{Math.round(userInsights.churnRisk * 100)}%</span>
                      </div>
                      <Progress
                        value={userInsights.churnRisk * 100}
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-slate-600">
                    행동 예측
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>의도 분석</span>
                      <Badge variant="outline">
                        {userInsights.intentPrediction}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>사용자 세그먼트</span>
                      <Badge
                        variant={
                          userInsights.valueSegment === 'premium'
                            ? 'default'
                            : userInsights.valueSegment === 'standard'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {userInsights.valueSegment === 'premium'
                          ? '프리미엄'
                          : userInsights.valueSegment === 'standard'
                            ? '스탠다드'
                            : '베이직'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>권장 액션</span>
                      <Badge variant="outline">
                        {userInsights.nextBestAction}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-slate-600">
                    개인화 추천
                  </h4>
                  <div className="space-y-1">
                    {userInsights.recommendations
                      .slice(0, 3)
                      .map((rec, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="block text-center"
                        >
                          {rec}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 행동 예측 결과 */}
        {predictions && (
          <Card>
            <CardHeader>
              <CardTitle>🔮 AI 행동 예측</CardTitle>
              <CardDescription>
                머신러닝 기반 사용자 행동 예측 결과
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center space-y-2">
                  <div
                    className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                      predictions.willConvert
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    💰
                  </div>
                  <p className="text-sm font-medium">전환 예상</p>
                  <p className="text-xs text-slate-500">
                    {predictions.willConvert ? '높음' : '낮음'}
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div
                    className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                      predictions.willChurn
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    🚪
                  </div>
                  <p className="text-sm font-medium">이탈 위험</p>
                  <p className="text-xs text-slate-500">
                    {predictions.willChurn ? '높음' : '낮음'}
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div
                    className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                      predictions.needsSupport
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    🆘
                  </div>
                  <p className="text-sm font-medium">지원 필요</p>
                  <p className="text-xs text-slate-500">
                    {predictions.needsSupport ? '필요함' : '양호함'}
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div
                    className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                      predictions.isEngaged
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    🎯
                  </div>
                  <p className="text-sm font-medium">참여도</p>
                  <p className="text-xs text-slate-500">
                    {predictions.isEngaged ? '높음' : '낮음'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 테스트 이벤트 버튼들 */}
        <Card>
          <CardHeader>
            <CardTitle>🧪 분석 이벤트 테스트</CardTitle>
            <CardDescription>
              다양한 비즈니스 시나리오의 분석 이벤트를 테스트해보세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Button
                onClick={testEvents.customerJourney}
                disabled={!isActive}
                variant="outline"
                className="h-auto p-4 flex flex-col gap-2"
              >
                <span className="text-lg">👥</span>
                <span className="text-sm">고객 여정 분석</span>
              </Button>

              <Button
                onClick={testEvents.salesActivity}
                disabled={!isActive}
                variant="outline"
                className="h-auto p-4 flex flex-col gap-2"
              >
                <span className="text-lg">💼</span>
                <span className="text-sm">영업 활동 추적</span>
              </Button>

              <Button
                onClick={testEvents.userBehavior}
                disabled={!isActive}
                variant="outline"
                className="h-auto p-4 flex flex-col gap-2"
              >
                <span className="text-lg">🧠</span>
                <span className="text-sm">사용자 행동 분석</span>
              </Button>

              <Button
                onClick={testEvents.performanceTracking}
                disabled={!isActive}
                variant="outline"
                className="h-auto p-4 flex flex-col gap-2"
              >
                <span className="text-lg">⚡</span>
                <span className="text-sm">성능 추적</span>
              </Button>

              <Button
                onClick={testEvents.biometricData}
                disabled={!isActive}
                variant="outline"
                className="h-auto p-4 flex flex-col gap-2"
              >
                <span className="text-lg">🔍</span>
                <span className="text-sm">생체인식 분석</span>
              </Button>

              <Button
                onClick={testEvents.businessInsights}
                disabled={!isActive}
                variant="outline"
                className="h-auto p-4 flex flex-col gap-2"
              >
                <span className="text-lg">📈</span>
                <span className="text-sm">비즈니스 인사이트</span>
              </Button>

              <Button
                onClick={testEvents.insuranceAI}
                disabled={!isActive}
                variant="outline"
                className="h-auto p-4 flex flex-col gap-2"
              >
                <span className="text-lg">🏢</span>
                <span className="text-sm">보험설계사 특화 고급 이벤트</span>
              </Button>

              <Button
                onClick={testEvents.premiumOptimization}
                disabled={!isActive}
                variant="outline"
                className="h-auto p-4 flex flex-col gap-2"
              >
                <span className="text-lg">💸</span>
                <span className="text-sm">보험료 최적화</span>
              </Button>

              <Button
                onClick={testEvents.customerLifetimeValue}
                disabled={!isActive}
                variant="outline"
                className="h-auto p-4 flex flex-col gap-2"
              >
                <span className="text-lg">💵</span>
                <span className="text-sm">고객 생애가치 예측</span>
              </Button>

              <Button
                onClick={testEvents.competitorAnalysis}
                disabled={!isActive}
                variant="outline"
                className="h-auto p-4 flex flex-col gap-2"
              >
                <span className="text-lg">🤝</span>
                <span className="text-sm">경쟁사 분석</span>
              </Button>

              <Button
                onClick={testEvents.riskAssessment}
                disabled={!isActive}
                variant="outline"
                className="h-auto p-4 flex flex-col gap-2"
              >
                <span className="text-lg">🚨</span>
                <span className="text-sm">리스크 평가</span>
              </Button>

              <Button
                onClick={testEvents.salesFunnelAnalysis}
                disabled={!isActive}
                variant="outline"
                className="h-auto p-4 flex flex-col gap-2"
              >
                <span className="text-lg">🛣️</span>
                <span className="text-sm">영업 판매 피라미드 분석</span>
              </Button>

              <Button
                onClick={testEvents.crossSellOpportunity}
                disabled={!isActive}
                variant="outline"
                className="h-auto p-4 flex flex-col gap-2"
              >
                <span className="text-lg">🎯</span>
                <span className="text-sm">교차 판매 기회 분석</span>
              </Button>

              <Button
                onClick={testEvents.marketTrends}
                disabled={!isActive}
                variant="outline"
                className="h-auto p-4 flex flex-col gap-2"
              >
                <span className="text-lg">📈</span>
                <span className="text-sm">시장 트렌드 분석</span>
              </Button>

              <Button
                onClick={testEvents.customerSatisfaction}
                disabled={!isActive}
                variant="outline"
                className="h-auto p-4 flex flex-col gap-2"
              >
                <span className="text-lg">🌟</span>
                <span className="text-sm">고객 만족도 예측</span>
              </Button>

              <Button
                onClick={testEvents.teamBenchmarking}
                disabled={!isActive}
                variant="outline"
                className="h-auto p-4 flex flex-col gap-2"
              >
                <span className="text-lg">🏆</span>
                <span className="text-sm">판매팀 벤치마크</span>
              </Button>

              <Button
                onClick={testEvents.marketingROI}
                disabled={!isActive}
                variant="outline"
                className="h-auto p-4 flex flex-col gap-2"
              >
                <span className="text-lg">💰</span>
                <span className="text-sm">마케팅 ROI 추적</span>
              </Button>

              <Button
                onClick={testEvents.complianceCheck}
                disabled={!isActive}
                variant="outline"
                className="h-auto p-4 flex flex-col gap-2"
              >
                <span className="text-lg">🔒</span>
                <span className="text-sm">준수 모니터링</span>
              </Button>

              <Button
                onClick={testEvents.customerJourneyOpt}
                disabled={!isActive}
                variant="outline"
                className="h-auto p-4 flex flex-col gap-2"
              >
                <span className="text-lg">🛣️</span>
                <span className="text-sm">고객 여정 최적화</span>
              </Button>

              <Button
                onClick={testEvents.aiAssistantPerformance}
                disabled={!isActive}
                variant="outline"
                className="h-auto p-4 flex flex-col gap-2"
              >
                <span className="text-lg">🤖</span>
                <span className="text-sm">보험 상담 AI 성능 추적</span>
              </Button>

              <Button
                onClick={testEvents.predictiveAccuracy}
                disabled={!isActive}
                variant="outline"
                className="h-auto p-4 flex flex-col gap-2"
              >
                <span className="text-lg">🎯</span>
                <span className="text-sm">예측 정확도</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 실시간 데이터 스트림 */}
        {realTimeData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 실시간 데이터 스트림
                <Badge variant="outline" className="animate-pulse">
                  LIVE
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">마우스 활동</h4>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-sm">
                      최근 움직임: {realTimeData.mouseMovements?.length || 0}개
                    </p>
                    <p className="text-sm">
                      클릭 히트맵: {realTimeData.clickHeatmap?.length || 0}개
                      요소
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">스크롤 패턴</h4>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-sm">
                      스크롤 이벤트: {realTimeData.scrollPattern?.length || 0}개
                    </p>
                    <p className="text-sm">
                      키 입력: {realTimeData.keystrokes?.length || 0}개
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 개인화 추천 */}
        {recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>🎯 개인화 추천</CardTitle>
              <CardDescription>
                AI 기반 개인화된 콘텐츠 및 기능 추천
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{rec.type}</p>
                      <p className="text-sm text-slate-500">
                        세그먼트: {rec.targeting.segment} | 참여도:{' '}
                        {rec.targeting.engagement}
                      </p>
                    </div>
                    <Badge
                      variant={
                        rec.priority === 'high' ? 'default' : 'secondary'
                      }
                    >
                      {rec.priority === 'high'
                        ? '높음'
                        : rec.priority === 'medium'
                          ? '보통'
                          : '낮음'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 시스템 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>ℹ️ 시스템 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <p>
                <strong>분석 시스템:</strong>{' '}
                {isActive ? '활성화됨' : '비활성화됨'}
              </p>
              <p>
                <strong>데이터 수집:</strong> 실시간 100ms 간격
              </p>
              <p>
                <strong>AI 예측:</strong> 2초 간격 업데이트
              </p>
              <p>
                <strong>보안:</strong> 개인정보 익명화 처리
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 📚 이벤트 설명 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">📚</span>
              SureCRM 고급 GA4 이벤트 가이드
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 기본 이벤트 */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-blue-600">
                🚀 기본 이벤트
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="border rounded-lg p-3">
                  <h4 className="font-medium mb-2">📊 비즈니스 인사이트</h4>
                  <p className="text-gray-600">
                    대시보드 조회, 고객 통계, 월별 성장률, 전환율 등 핵심 KPI
                    추적
                  </p>
                </div>
                <div className="border rounded-lg p-3">
                  <h4 className="font-medium mb-2">👥 고객 여정</h4>
                  <p className="text-gray-600">
                    고객 상세조회, 중요도, 영업단계, 미팅횟수, 계약건수 등
                  </p>
                </div>
                <div className="border rounded-lg p-3">
                  <h4 className="font-medium mb-2">🎯 영업 활동</h4>
                  <p className="text-gray-600">
                    영업기회 생성, 보험유형, 예상가치, 고객중요도 등
                  </p>
                </div>
                <div className="border rounded-lg p-3">
                  <h4 className="font-medium mb-2">🔬 사용자 행동</h4>
                  <p className="text-gray-600">
                    사용자 의도분석, 감정상태, 좌절감, 몰입도, 자신감 수치
                  </p>
                </div>
              </div>
            </div>

            {/* 고급 이벤트 */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-purple-600">
                🏢 보험설계사 특화 고급 이벤트
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="border rounded-lg p-3 bg-purple-50">
                  <h4 className="font-medium mb-2">🤖 AI 상품 추천</h4>
                  <p className="text-gray-600">
                    고객 프로필 기반 맞춤 보험상품 추천, 신뢰도 점수, 개인화
                    수준
                  </p>
                </div>
                <div className="border rounded-lg p-3 bg-green-50">
                  <h4 className="font-medium mb-2">💸 보험료 최적화</h4>
                  <p className="text-gray-600">
                    리스크 조정, 할인 적용, 번들 할인으로 보험료 최적화 분석
                  </p>
                </div>
                <div className="border rounded-lg p-3 bg-blue-50">
                  <h4 className="font-medium mb-2">💵 고객 생애가치</h4>
                  <p className="text-gray-600">
                    CLV 예측, 정확도, 핵심 동인, 시장 조건, 이탈 확률
                  </p>
                </div>
                <div className="border rounded-lg p-3 bg-orange-50">
                  <h4 className="font-medium mb-2">🤝 경쟁사 분석</h4>
                  <p className="text-gray-600">
                    경쟁 보험료, 보장 비교, 시장 포지션, 승률 예측
                  </p>
                </div>
                <div className="border rounded-lg p-3 bg-red-50">
                  <h4 className="font-medium mb-2">🚨 리스크 평가</h4>
                  <p className="text-gray-600">
                    건강지표, 라이프스타일, 재정안정성, 직업리스크, 지역리스크
                  </p>
                </div>
                <div className="border rounded-lg p-3 bg-indigo-50">
                  <h4 className="font-medium mb-2">🛣️ 영업 퍼널 분석</h4>
                  <p className="text-gray-600">
                    단계별 전환율, 병목지점, 최적화 기회, 벤치마크 비교
                  </p>
                </div>
                <div className="border rounded-lg p-3 bg-pink-50">
                  <h4 className="font-medium mb-2">🎯 교차판매 기회</h4>
                  <p className="text-gray-600">
                    현재 상품, 기회 상품, 기회 점수, 수익 잠재력, 성공 확률
                  </p>
                </div>
                <div className="border rounded-lg p-3 bg-yellow-50">
                  <h4 className="font-medium mb-2">📈 시장 트렌드</h4>
                  <p className="text-gray-600">
                    트렌드 방향, 강도, 지속기간, 시장 세그먼트, 전략적 함의
                  </p>
                </div>
              </div>
            </div>

            {/* GA4 확인 방법 */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-green-600">
                ✅ GA4에서 확인하는 방법
              </h3>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-green-50">
                  <h4 className="font-medium mb-2">1. 실시간 이벤트 확인</h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>경로:</strong> GA4 → Reports → Realtime
                    </p>
                    <p>
                      <strong>확인사항:</strong> 활성 사용자, 실시간 이벤트
                      스트림
                    </p>
                    <p>
                      <strong>링크:</strong>{' '}
                      <a
                        href="https://analytics.google.com/analytics/web/#/p{GA_PROPERTY_ID}/reports/realtime"
                        className="text-blue-600 hover:underline"
                      >
                        실시간 보고서
                      </a>
                    </p>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-blue-50">
                  <h4 className="font-medium mb-2">2. DebugView로 상세 확인</h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>경로:</strong> GA4 → Configure → DebugView
                    </p>
                    <p>
                      <strong>확인사항:</strong> 이벤트 매개변수, 사용자 속성
                    </p>
                    <p>
                      <strong>주의:</strong> 개발 환경에서만 표시됩니다
                    </p>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-purple-50">
                  <h4 className="font-medium mb-2">3. 커스텀 보고서 생성</h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>경로:</strong> GA4 → Explore → Create new
                      exploration
                    </p>
                    <p>
                      <strong>추천 차원:</strong> Event name, Custom parameters,
                      User properties
                    </p>
                    <p>
                      <strong>추천 지표:</strong> Event count, Total users,
                      Sessions
                    </p>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-orange-50">
                  <h4 className="font-medium mb-2">4. 브라우저 개발자 도구</h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>방법:</strong> F12 → Console
                    </p>
                    <div className="bg-gray-100 p-2 rounded font-mono text-xs mt-2">
                      console.log('GA4 Status:', window.gtag ? '✅' : '❌');
                      <br />
                      console.log('DataLayer:', window.dataLayer?.length || 0);
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 환경변수 확인 */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-amber-600">
                ⚙️ 현재 설정 상태
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-3 bg-amber-50">
                  <h4 className="font-medium mb-2">환경변수</h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>GA4 ID:</strong>{' '}
                      {import.meta.env.VITE_GA_MEASUREMENT_ID || '❌ 미설정'}
                    </p>
                    <p>
                      <strong>GTM ID:</strong>{' '}
                      {import.meta.env.VITE_GTM_CONTAINER_ID || '❌ 미설정'}
                    </p>
                    <p>
                      <strong>도메인:</strong>{' '}
                      {typeof window !== 'undefined'
                        ? window.location.hostname
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="border rounded-lg p-3 bg-blue-50">
                  <h4 className="font-medium mb-2">수집 상태</h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>분석 수집:</strong>{' '}
                      {typeof window !== 'undefined' &&
                      window.location.hostname.includes('surecrm.pro')
                        ? '✅ 활성 (프로덕션)'
                        : import.meta.env.MODE === 'development'
                          ? '❌ 비활성 (개발환경)'
                          : '⚠️ 확인 필요'}
                    </p>
                    <p>
                      <strong>환경:</strong> {import.meta.env.MODE || 'unknown'}
                    </p>
                    <p>
                      <strong>프로덕션:</strong>{' '}
                      {typeof window !== 'undefined' &&
                      window.location.hostname.includes('surecrm.pro')
                        ? '✅'
                        : '❌'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
