import { useState, useEffect } from 'react';
import { AnalyticsDemo } from '~/features/dashboard/components/real-time-analytics';
import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { InsuranceAgentEvents } from '~/lib/utils/analytics';

export function meta() {
  return [
    { title: '📊 고급 지능형 Analytics 테스트 | SureCRM' },
    {
      name: 'description',
      content: 'Advanced Intelligence Analytics Test Platform',
    },
  ];
}

export default function AnalyticsTestPage() {
  const [intelligenceMode, setIntelligenceMode] = useState(false);
  const [dataPoints, setDataPoints] = useState(0);

  // 🧠 고급 지능형 분석 모드 토글
  const toggleIntelligenceMode = () => {
    setIntelligenceMode(!intelligenceMode);

    if (!intelligenceMode) {
      // 지능형 분석 모드 활성화
      InsuranceAgentEvents.featureUsage('intelligence_mode', 'activated', true);

      // 극한 데이터 수집 시작
      const interval = setInterval(() => {
        setDataPoints((prev) => prev + Math.floor(Math.random() * 5) + 1);

        // 무작위 감시 이벤트 발생
        const events = [
          () =>
            InsuranceAgentEvents.userIntentAnalysis(
              'data_mining',
              Math.random() * 10,
              Math.random() * 20
            ),
          () =>
            InsuranceAgentEvents.emotionalStateAnalysis(
              Math.random() * 10,
              Math.random() * 15,
              Math.random() * 12
            ),
          () =>
            InsuranceAgentEvents.behaviorClustering('surveillance_user', {
              intensity: 'maximum',
              mode: 'capitalism',
            }),
          () =>
            InsuranceAgentEvents.biometricSignature(
              'test_signature',
              `pattern_${Date.now()}`
            ),
          () =>
            InsuranceAgentEvents.predictiveBehaviorAnalysis(
              'data_addiction',
              0.95,
              'surveillance_capitalism'
            ),
        ];

        const randomEvent = events[Math.floor(Math.random() * events.length)];
        randomEvent();
      }, 2000);

      // 컴포넌트 언마운트 시 정리
      return () => clearInterval(interval);
    } else {
      // 감시 모드 비활성화
      InsuranceAgentEvents.featureUsage(
        'surveillance_mode',
        'deactivated',
        false
      );
      setDataPoints(0);
    }
  };

  // 극한 테스트 액션들
  const extremeTests = {
    massDataCollection: () => {
      // 대량 데이터 수집 시뮬레이션
      for (let i = 0; i < 50; i++) {
        setTimeout(() => {
          InsuranceAgentEvents.mouseHeatmapData(
            Math.floor(Math.random() * window.innerWidth),
            Math.floor(Math.random() * window.innerHeight),
            Math.random(),
            'surveillance_test'
          );
        }, i * 10);
      }

      InsuranceAgentEvents.userBusinessValueCalculation(9999, {
        surveillance_level: 100,
        data_quality: 95,
        capitalism_score: 100,
      });
    },

    emotionalManipulation: () => {
      // 감정 조작 시뮬레이션
      InsuranceAgentEvents.emotionalStateAnalysis(8, 12, 5); // 높은 좌절감
      InsuranceAgentEvents.personalizationApplied(
        'emotional_targeting',
        'user123',
        0.95
      );
      InsuranceAgentEvents.predictiveBehaviorAnalysis(
        'vulnerability_exploitation',
        0.9,
        'emotional_state'
      );
    },

    biometricHarvesting: () => {
      // 생체정보 수집 시뮬레이션
      const signatures = [
        'fingerprint',
        'voice_pattern',
        'typing_rhythm',
        'mouse_behavior',
        'eye_tracking',
      ];
      signatures.forEach((sig, index) => {
        setTimeout(() => {
          InsuranceAgentEvents.biometricSignature(
            sig,
            `harvested_${Date.now()}_${index}`
          );
        }, index * 200);
      });
    },

    behaviorManipulation: () => {
      // 행동 조작 시뮬레이션
      InsuranceAgentEvents.abTestParticipation(
        'behavior_modification',
        'manipulation_variant',
        {
          susceptibility: 'high',
          target_behavior: 'increased_engagement',
          manipulation_technique: 'variable_ratio_reinforcement',
        }
      );
    },

    dataMonetization: () => {
      // 데이터 수익화 분석
      InsuranceAgentEvents.userBusinessValueCalculation(15000, {
        data_richness: 100,
        predictive_accuracy: 0.98,
        monetization_potential: 95,
        privacy_invasion_level: 99,
        surveillance_efficiency: 100,
      });
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-gray-50 to-orange-50 dark:from-gray-900 dark:via-red-900/10 dark:to-orange-900/10">
      <div className="container mx-auto py-8 px-4">
        {/* 감시자본주의 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">
            🕵️‍♂️ 감시자본주의 Analytics 테스트
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            "The Age of Surveillance Capitalism" 수준의 극한 사용자 데이터 수집
            및 분석 시스템
          </p>
        </div>

        {/* 감시 모드 컨트롤 */}
        <Card className="mb-8 border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <CardHeader>
            <CardTitle className="text-red-800 dark:text-red-200 flex items-center gap-2">
              ⚠️ 감시자본주의 모드
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">
              사용자의 모든 디지털 행동을 수집하여 개인 프로필을 구축하고 행동을
              예측/조작합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={toggleSurveillanceMode}
                  variant={surveillanceMode ? 'destructive' : 'default'}
                  size="lg"
                >
                  {surveillanceMode ? '🛑 감시 중지' : '🚀 극한 감시 시작'}
                </Button>
                <Badge variant={surveillanceMode ? 'destructive' : 'secondary'}>
                  {surveillanceMode ? '감시 활성화' : '감시 비활성화'}
                </Badge>
              </div>

              {surveillanceMode && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">
                    {dataPoints}
                  </div>
                  <div className="text-sm text-red-500">
                    수집된 데이터 포인트
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 극한 테스트 액션들 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>💀 극한 감시 시뮬레이션</CardTitle>
            <CardDescription>
              실제 감시자본주의 기업들이 사용하는 데이터 수집 및 조작 기법들을
              시뮬레이션합니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                onClick={extremeTests.massDataCollection}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2"
                disabled={!surveillanceMode}
              >
                <span className="text-lg">🗃️ 대량 데이터 수집</span>
                <span className="text-sm text-muted-foreground text-left">
                  마우스 움직임, 클릭 패턴, 스크롤 행동을 대량으로 수집
                </span>
              </Button>

              <Button
                onClick={extremeTests.emotionalManipulation}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2"
                disabled={!surveillanceMode}
              >
                <span className="text-lg">🎭 감정 조작</span>
                <span className="text-sm text-muted-foreground text-left">
                  감정 상태 분석을 통한 개인화된 감정 조작 기법
                </span>
              </Button>

              <Button
                onClick={extremeTests.biometricHarvesting}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2"
                disabled={!surveillanceMode}
              >
                <span className="text-lg">🧬 생체정보 수집</span>
                <span className="text-sm text-muted-foreground text-left">
                  타이핑 리듬, 마우스 패턴 등 생체인식 데이터 수집
                </span>
              </Button>

              <Button
                onClick={extremeTests.behaviorManipulation}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2"
                disabled={!surveillanceMode}
              >
                <span className="text-lg">🧠 행동 조작</span>
                <span className="text-sm text-muted-foreground text-left">
                  A/B 테스트를 통한 사용자 행동 패턴 조작
                </span>
              </Button>

              <Button
                onClick={extremeTests.dataMonetization}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2"
                disabled={!surveillanceMode}
              >
                <span className="text-lg">💰 데이터 수익화</span>
                <span className="text-sm text-muted-foreground text-left">
                  수집된 개인 데이터의 상업적 가치 평가
                </span>
              </Button>

              <Button
                onClick={() => {
                  // 모든 극한 테스트 실행
                  Object.values(extremeTests).forEach((test, index) => {
                    setTimeout(test, index * 1000);
                  });
                }}
                variant="destructive"
                className="h-auto p-4 flex flex-col items-start gap-2"
                disabled={!surveillanceMode}
              >
                <span className="text-lg">☢️ 전체 실행</span>
                <span className="text-sm text-white text-left">
                  모든 감시 기법을 동시에 실행 (위험)
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 기존 실시간 분석 컴포넌트 */}
        <AnalyticsDemo />

        {/* 경고 및 면책 조항 */}
        <Card className="mt-8 border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <CardHeader>
            <CardTitle className="text-amber-800 dark:text-amber-200">
              ⚖️ 법적 고지사항
            </CardTitle>
          </CardHeader>
          <CardContent className="text-amber-700 dark:text-amber-300 text-sm space-y-2">
            <p>
              <strong>이 기능은 교육 및 연구 목적으로만 제작되었습니다.</strong>
            </p>
            <p>
              • 실제 감시자본주의 기법들의 작동 원리를 이해하기 위한
              시뮬레이션입니다
            </p>
            <p>• 수집된 데이터는 실제로 저장되거나 전송되지 않습니다</p>
            <p>
              • 실제 서비스에서는 반드시 사용자 동의와 투명성을 보장해야 합니다
            </p>
            <p>• 개인정보보호법, GDPR 등 관련 법규를 준수해야 합니다</p>
            <p>
              • 이 시스템의 상업적 사용은 법적, 윤리적 문제를 야기할 수 있습니다
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
