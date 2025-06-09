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
      </div>
    </div>
  );
}
