/**
 * 🕵️‍♂️ 감시자본주의 수준 극한 추적 테스트 페이지
 * "The Age of Surveillance Capitalism" 방식의 완전한 사용자 감시 시스템
 */

import { useState, useEffect, useRef } from 'react';
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
import { Input } from '~/common/components/ui/input';
import { Textarea } from '~/common/components/ui/textarea';
import { useSurveillanceAnalytics } from '~/hooks/use-surveillance-analytics';
import { InsuranceAgentEvents } from '~/lib/utils/analytics';

export function meta() {
  return [
    { title: '🕵️‍♂️ 감시자본주의 테스트 | SureCRM' },
    {
      name: 'description',
      content: 'Surveillance Capitalism Level Data Collection Test',
    },
    { name: 'robots', content: 'noindex, nofollow' }, // 검색엔진에서 숨김
  ];
}

interface SurveillanceStats {
  mouseMovements: number;
  keyboardInputs: number;
  scrollEvents: number;
  focusChanges: number;
  frustrationScore: number;
  engagementScore: number;
  confidenceScore: number;
  businessValue: number;
  biometricSignatures: number;
  decisionHesitations: number;
}

export default function SurveillanceCapitalismTestPage() {
  // 🕵️‍♂️ 극한 감시 시스템 활성화
  const { getSessionData } = useSurveillanceAnalytics({
    trackMouseMovements: true,
    trackKeyboardPatterns: true,
    trackScrollBehavior: true,
    trackAttention: true,
    trackPerformance: true,
    trackBiometrics: true,
    trackEmotionalState: true,
    trackDecisionPatterns: true,
    samplingRate: 1.0, // 100% 데이터 수집
  });

  const [isTracking, setIsTracking] = useState(false);
  const [stats, setStats] = useState<SurveillanceStats>({
    mouseMovements: 0,
    keyboardInputs: 0,
    scrollEvents: 0,
    focusChanges: 0,
    frustrationScore: 0,
    engagementScore: 0,
    confidenceScore: 0,
    businessValue: 0,
    biometricSignatures: 0,
    decisionHesitations: 0,
  });

  const [realTimeEvents, setRealTimeEvents] = useState<any[]>([]);
  const eventLogRef = useRef<HTMLDivElement>(null);

  // 실시간 통계 업데이트
  useEffect(() => {
    if (!isTracking) return;

    const updateStats = () => {
      const sessionData = getSessionData();

      setStats({
        mouseMovements: sessionData.mouseMovements.length,
        keyboardInputs: sessionData.keyboardPatterns.length,
        scrollEvents: sessionData.scrollData.length,
        focusChanges: sessionData.attentionData.tabSwitches,
        frustrationScore: Math.round(sessionData.frustrationScore * 10) / 10,
        engagementScore: Math.round(sessionData.engagementScore * 10) / 10,
        confidenceScore: Math.round(sessionData.confidenceScore * 10) / 10,
        businessValue: Math.round(
          sessionData.mouseMovements.length * 0.5 +
            sessionData.scrollData.length * 1.0 +
            sessionData.engagementScore * 20 +
            sessionData.confidenceScore * 15 -
            sessionData.frustrationScore * 10
        ),
        biometricSignatures:
          Math.floor(sessionData.mouseMovements.length / 50) +
          Math.floor(sessionData.keyboardPatterns.length / 20),
        decisionHesitations: Math.floor(
          sessionData.mouseMovements.filter((m) => m.velocity < 0.1).length / 5
        ),
      });
    };

    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, [isTracking, getSessionData]);

  // 실시간 이벤트 로깅
  const logEvent = (eventType: string, data: any) => {
    const event = {
      timestamp: new Date().toLocaleTimeString(),
      type: eventType,
      data: data,
      id: Math.random().toString(36).substr(2, 9),
    };

    setRealTimeEvents((prev) => {
      const newEvents = [event, ...prev.slice(0, 49)]; // 최근 50개만 유지
      return newEvents;
    });

    // 자동 스크롤
    setTimeout(() => {
      if (eventLogRef.current) {
        eventLogRef.current.scrollTop = 0;
      }
    }, 100);
  };

  // 다양한 테스트 액션들
  const testActions = {
    // 의사결정 테스트
    hesitantClick: () => {
      setTimeout(() => {
        InsuranceAgentEvents.decisionMakingPattern('button', 2000, 2500);
        logEvent('결정 패턴', { type: '망설임', hesitation: '높음' });
      }, 2000);
    },

    // 감정 상태 테스트
    frustrationTest: () => {
      // 연속 클릭으로 좌절감 시뮬레이션
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          InsuranceAgentEvents.buttonClick(
            'frustration-test',
            'button',
            '/surveillance-test'
          );
          if (i === 4) {
            logEvent('감정 분석', { type: '좌절감 증가', level: 'high' });
          }
        }, i * 100);
      }
    },

    // 참여도 테스트
    engagementTest: () => {
      InsuranceAgentEvents.featureUsage(
        'deep_engagement',
        'exploration_mode',
        false
      );
      logEvent('참여도 분석', { type: '높은 참여도', behavior: 'exploration' });
    },

    // 비즈니스 가치 계산
    calculateValue: () => {
      const sessionData = getSessionData();
      const value = Math.round(
        (sessionData.sessionDuration / 1000) * 0.2 +
          sessionData.mouseMovements.length * 0.3 +
          sessionData.scrollData.length * 0.5 +
          sessionData.engagementScore * 20
      );

      InsuranceAgentEvents.userBusinessValueCalculation(value, {
        session_duration: sessionData.sessionDuration / 1000,
        mouse_activity: sessionData.mouseMovements.length,
        scroll_activity: sessionData.scrollData.length,
        engagement: sessionData.engagementScore,
      });

      logEvent('비즈니스 가치', {
        calculatedValue: value,
        tier: value > 500 ? 'high' : value > 200 ? 'medium' : 'low',
      });
    },

    // 생체인식 테스트
    biometricTest: () => {
      InsuranceAgentEvents.biometricSignature(
        'test_mouse',
        'signature_' + Date.now().toString(36)
      );
      InsuranceAgentEvents.biometricSignature(
        'test_keyboard',
        'pattern_' + Math.random().toString(36)
      );
      logEvent('생체인식', { type: '패턴 수집', signatures: 2 });
    },

    // 예측 행동 분석
    predictiveBehavior: () => {
      const predictions = ['upgrade_likely', 'churn_risk', 'feature_adoption'];
      const randomPrediction =
        predictions[Math.floor(Math.random() * predictions.length)];

      InsuranceAgentEvents.predictiveBehaviorAnalysis(
        randomPrediction,
        Math.random() * 0.4 + 0.6, // 0.6-1.0 confidence
        'test_environment'
      );

      logEvent('예측 분석', {
        prediction: randomPrediction,
        aiConfidence: 'high',
      });
    },

    // A/B 테스트 참여
    abTestParticipation: () => {
      const testVariants = ['control', 'variant_a', 'variant_b'];
      const randomVariant =
        testVariants[Math.floor(Math.random() * testVariants.length)];

      InsuranceAgentEvents.abTestParticipation(
        'surveillance_ui_test',
        randomVariant,
        { user_segment: 'test_user', behavior_type: 'engaged' }
      );

      logEvent('A/B 테스트', {
        test: 'surveillance_ui_test',
        variant: randomVariant,
      });
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-gray-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto py-8 px-4">
        {/* 경고 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">
            🕵️‍♂️ 감시자본주의 수준 극한 추적 시스템
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            "The Age of Surveillance Capitalism" 방식의 완전한 사용자 행동 분석
            및 데이터 수집 시스템을 테스트합니다.
          </p>
        </div>

        {/* 경고 섹션 */}
        <Card className="border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 mb-8">
          <CardHeader>
            <CardTitle className="text-red-800 dark:text-red-200 flex items-center gap-2">
              ⚠️ 극한 감시 모드 활성화
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">
              이 페이지에서는 마우스 움직임, 키보드 패턴, 스크롤 행동, 주의집중,
              감정 상태, 의사결정 패턴, 생체인식 데이터 등 모든 사용자 행동이
              실시간으로 수집되고 분석됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setIsTracking(!isTracking)}
                variant={isTracking ? 'destructive' : 'default'}
                size="lg"
              >
                {isTracking ? '🛑 추적 중지' : '🚀 극한 추적 시작'}
              </Button>
              <Badge variant={isTracking ? 'destructive' : 'secondary'}>
                {isTracking ? '감시 활성화' : '감시 비활성화'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 실시간 통계 */}
          <Card>
            <CardHeader>
              <CardTitle>📊 실시간 감시 통계</CardTitle>
              <CardDescription>수집된 사용자 데이터 포인트</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.mouseMovements}
                  </div>
                  <div className="text-sm text-blue-500">마우스 움직임</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.keyboardInputs}
                  </div>
                  <div className="text-sm text-green-500">키보드 패턴</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.scrollEvents}
                  </div>
                  <div className="text-sm text-purple-500">스크롤 이벤트</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded">
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.biometricSignatures}
                  </div>
                  <div className="text-sm text-orange-500">생체인식 패턴</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>좌절감 지수</span>
                  <span className="text-red-600">{stats.frustrationScore}</span>
                </div>
                <Progress
                  value={Math.min(stats.frustrationScore * 10, 100)}
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>참여도 지수</span>
                  <span className="text-green-600">
                    {stats.engagementScore}
                  </span>
                </div>
                <Progress
                  value={Math.min(stats.engagementScore * 5, 100)}
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>자신감 지수</span>
                  <span className="text-blue-600">{stats.confidenceScore}</span>
                </div>
                <Progress
                  value={Math.min(stats.confidenceScore * 8, 100)}
                  className="h-2"
                />
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                <div className="text-lg font-bold text-yellow-800 dark:text-yellow-200">
                  💰 비즈니스 가치: {stats.businessValue}점
                </div>
                <div className="text-sm text-yellow-600 dark:text-yellow-300">
                  {stats.businessValue > 500
                    ? '고가치 사용자'
                    : stats.businessValue > 200
                    ? '중간가치 사용자'
                    : '저가치 사용자'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 테스트 액션들 */}
          <Card>
            <CardHeader>
              <CardTitle>🧪 감시 시스템 테스트</CardTitle>
              <CardDescription>
                다양한 사용자 행동 패턴을 시뮬레이션하여 추적 시스템을
                테스트합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={testActions.hesitantClick}
                variant="outline"
                className="w-full justify-start"
                disabled={!isTracking}
              >
                🤔 의사결정 망설임 테스트 (2초 지연)
              </Button>

              <Button
                onClick={testActions.frustrationTest}
                variant="outline"
                className="w-full justify-start"
                disabled={!isTracking}
              >
                😤 좌절감 패턴 테스트 (연속 클릭)
              </Button>

              <Button
                onClick={testActions.engagementTest}
                variant="outline"
                className="w-full justify-start"
                disabled={!isTracking}
              >
                🎯 높은 참여도 신호 발생
              </Button>

              <Button
                onClick={testActions.calculateValue}
                variant="outline"
                className="w-full justify-start"
                disabled={!isTracking}
              >
                💰 비즈니스 가치 실시간 계산
              </Button>

              <Button
                onClick={testActions.biometricTest}
                variant="outline"
                className="w-full justify-start"
                disabled={!isTracking}
              >
                🧬 생체인식 패턴 수집
              </Button>

              <Button
                onClick={testActions.predictiveBehavior}
                variant="outline"
                className="w-full justify-start"
                disabled={!isTracking}
              >
                🔮 AI 예측 행동 분석
              </Button>

              <Button
                onClick={testActions.abTestParticipation}
                variant="outline"
                className="w-full justify-start"
                disabled={!isTracking}
              >
                🧪 A/B 테스트 참여 시뮬레이션
              </Button>

              {/* 상호작용 유도 요소들 */}
              <div className="pt-4 border-t space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    타이핑 패턴 수집용 텍스트 입력
                  </label>
                  <Input
                    placeholder="여기에 타이핑하면 키보드 패턴이 분석됩니다..."
                    disabled={!isTracking}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    스크롤 행동 분석용 긴 텍스트
                  </label>
                  <Textarea
                    placeholder="이 영역을 스크롤하면 읽기 패턴이 분석됩니다. 사용자의 스크롤 속도, 멈춤 지점, 뒤로가기 패턴 등을 통해 컨텐츠에 대한 관심도와 이해도를 측정할 수 있습니다. 스크롤을 해보세요!"
                    rows={6}
                    disabled={!isTracking}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 실시간 이벤트 로그 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>📡 실시간 이벤트 스트림</CardTitle>
            <CardDescription>
              감시 시스템에서 수집되는 실시간 데이터 포인트들 (최근 50개)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              ref={eventLogRef}
              className="h-96 overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded p-4 font-mono text-sm space-y-2"
            >
              {realTimeEvents.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  추적을 시작하면 실시간 이벤트가 여기에 표시됩니다
                </div>
              ) : (
                realTimeEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex gap-3 p-2 bg-white dark:bg-gray-800 rounded border-l-4 border-blue-500"
                  >
                    <span className="text-gray-500 shrink-0">
                      {event.timestamp}
                    </span>
                    <span className="font-semibold text-blue-600">
                      {event.type}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 break-words">
                      {JSON.stringify(event.data)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* 데이터 정책 안내 */}
        <Card className="mt-8 border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <CardHeader>
            <CardTitle className="text-amber-800 dark:text-amber-200">
              🔒 데이터 수집 정책
            </CardTitle>
          </CardHeader>
          <CardContent className="text-amber-700 dark:text-amber-300 text-sm space-y-2">
            <p>• 수집된 모든 데이터는 테스트 목적으로만 사용됩니다</p>
            <p>• 개인식별 정보는 수집하지 않으며, 행동 패턴만 분석합니다</p>
            <p>• 생체인식 데이터는 해시화되어 원본 복원이 불가능합니다</p>
            <p>• 모든 데이터는 세션 종료 시 자동으로 삭제됩니다</p>
            <p>• 이 기능은 개발 환경에서만 활성화됩니다</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
