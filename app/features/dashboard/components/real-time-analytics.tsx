import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Button } from '~/common/components/ui/button';
import { InsuranceAgentEvents } from '~/lib/utils/analytics';

interface AnalyticsEvent {
  timestamp: string;
  action: string;
  category: string;
  label?: string;
  value?: number;
  details?: any;
}

export function RealTimeAnalytics() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [isTracking, setIsTracking] = useState(false);

  // 실시간 이벤트 수집
  useEffect(() => {
    if (!isTracking) return;

    // 원래 gtag 함수를 래핑해서 이벤트 캡처
    if (typeof window !== 'undefined' && window.gtag) {
      const originalGtag = window.gtag;

      window.gtag = function (command: any, eventName: any, parameters?: any) {
        // GA로 실제 데이터 전송
        originalGtag(command, eventName, parameters);

        // 로컬 모니터링에 추가
        if (command === 'event') {
          const newEvent: AnalyticsEvent = {
            timestamp: new Date().toLocaleTimeString(),
            action: eventName,
            category: parameters?.event_category || 'Unknown',
            label: parameters?.event_label,
            value: parameters?.value,
            details: parameters,
          };

          setEvents((prev) => [newEvent, ...prev.slice(0, 49)]); // 최근 50개만 유지
        }
      };

      return () => {
        // 정리: 원래 gtag 함수 복원
        window.gtag = originalGtag;
      };
    }
  }, [isTracking]);

  // 테스트 이벤트 생성
  const generateTestEvents = () => {
    const testEvents = [
      () =>
        InsuranceAgentEvents.dashboardView({
          totalClients: 42,
          monthlyNewClients: 5,
          conversionRate: 23.5,
          totalPremium: 1250000,
        }),
      () =>
        InsuranceAgentEvents.clientView('test-client-id', {
          importance: 'high',
          currentStage: '제안중',
          daysSinceCreated: 15,
          meetingCount: 3,
          contractCount: 1,
        }),
      () => InsuranceAgentEvents.opportunityCreate('health', 150000, 'high'),
      () =>
        InsuranceAgentEvents.contractCreate({
          insuranceType: 'life',
          insuranceCompany: 'Samsung Life',
          monthlyPremium: 200000,
          expectedCommission: 50000,
          hasAttachments: true,
          status: 'pending',
        }),
      () =>
        InsuranceAgentEvents.meetingSchedule(
          'first_consultation',
          'high',
          false
        ),
      () =>
        InsuranceAgentEvents.networkView({
          totalConnections: 35,
          networkDepth: 3,
          topReferrerCount: 8,
          referralConversionRate: 45.2,
        }),
      () => InsuranceAgentEvents.goalAchievement('monthly_revenue', 110, 28),
      () => InsuranceAgentEvents.notificationReceive('contract_expiry', 'high'),
    ];

    testEvents.forEach((eventFn, index) => {
      setTimeout(() => eventFn(), index * 1000); // 1초 간격으로 실행
    });
  };

  const clearEvents = () => {
    setEvents([]);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Dashboard: 'bg-blue-100 text-blue-800',
      'Client Management': 'bg-green-100 text-green-800',
      'Sales Pipeline': 'bg-purple-100 text-purple-800',
      'Insurance Contract': 'bg-yellow-100 text-yellow-800',
      Calendar: 'bg-orange-100 text-orange-800',
      Network: 'bg-pink-100 text-pink-800',
      Performance: 'bg-red-100 text-red-800',
      Notifications: 'bg-indigo-100 text-indigo-800',
      'Team Management': 'bg-cyan-100 text-cyan-800',
      Reports: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            🔥 실시간 Google Analytics 모니터링
            {isTracking && (
              <Badge className="bg-green-100 text-green-800 animate-pulse">
                추적 중
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsTracking(!isTracking)}
              variant={isTracking ? 'destructive' : 'default'}
              size="sm"
            >
              {isTracking ? '추적 중지' : '추적 시작'}
            </Button>
            <Button onClick={generateTestEvents} variant="outline" size="sm">
              테스트 이벤트 생성
            </Button>
            <Button onClick={clearEvents} variant="ghost" size="sm">
              초기화
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 통계 요약 */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {events.length}
              </div>
              <div className="text-sm text-gray-600">총 이벤트</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {new Set(events.map((e) => e.category)).size}
              </div>
              <div className="text-sm text-gray-600">카테고리</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {events.filter((e) => e.value).length}
              </div>
              <div className="text-sm text-gray-600">가치 있는 이벤트</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {events
                  .reduce((sum, e) => sum + (e.value || 0), 0)
                  .toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">총 가치</div>
            </div>
          </div>

          {/* 이벤트 스트림 */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {events.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {isTracking ? (
                  <div>
                    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p>이벤트를 기다리는 중...</p>
                    <p className="text-sm mt-1">
                      앱을 사용하거나 "테스트 이벤트 생성" 버튼을 클릭하세요
                    </p>
                  </div>
                ) : (
                  <p>"추적 시작" 버튼을 클릭하여 실시간 분석을 시작하세요</p>
                )}
              </div>
            ) : (
              events.map((event, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-3 bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(event.category)}>
                        {event.category}
                      </Badge>
                      <span className="font-medium">{event.action}</span>
                      {event.value && (
                        <Badge variant="outline">
                          값: {event.value.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {event.timestamp}
                    </span>
                  </div>

                  {event.label && (
                    <div className="text-sm text-gray-600 mb-1">
                      라벨: {event.label}
                    </div>
                  )}

                  {event.details && Object.keys(event.details).length > 1 && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-500">
                        상세 정보
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-50 rounded overflow-x-auto">
                        {JSON.stringify(event.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 사용법 예시를 위한 데모 컴포넌트
export function AnalyticsDemo() {
  return (
    <div className="space-y-6 p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">
          🎯 SureCRM 극한 Analytics 테스트
        </h2>
        <p className="text-gray-600">
          아래 버튼들을 클릭하여 다양한 보험설계사 워크플로우 이벤트를
          테스트해보세요
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Button
          onClick={() =>
            InsuranceAgentEvents.dashboardView({
              totalClients: 42,
              monthlyNewClients: 5,
              conversionRate: 23.5,
              totalPremium: 1250000,
            })
          }
          className="w-full"
        >
          📊 대시보드 조회
        </Button>

        <Button
          onClick={() =>
            InsuranceAgentEvents.clientView('demo-client', {
              importance: 'high',
              currentStage: '제안중',
              daysSinceCreated: 15,
              meetingCount: 3,
              contractCount: 1,
            })
          }
          variant="outline"
          className="w-full"
        >
          👤 고객 상세보기
        </Button>

        <Button
          onClick={() =>
            InsuranceAgentEvents.contractCreate({
              insuranceType: 'life',
              insuranceCompany: 'Samsung Life',
              monthlyPremium: 200000,
              expectedCommission: 50000,
              hasAttachments: true,
              status: 'pending',
            })
          }
          variant="outline"
          className="w-full"
        >
          📋 계약 생성
        </Button>

        <Button
          onClick={() =>
            InsuranceAgentEvents.goalAchievement('monthly_revenue', 110, 28)
          }
          variant="outline"
          className="w-full"
        >
          🎯 목표 달성
        </Button>

        <Button
          onClick={() =>
            InsuranceAgentEvents.meetingSchedule(
              'first_consultation',
              'high',
              false
            )
          }
          variant="outline"
          className="w-full"
        >
          📅 미팅 일정
        </Button>

        <Button
          onClick={() =>
            InsuranceAgentEvents.networkView({
              totalConnections: 35,
              networkDepth: 3,
              topReferrerCount: 8,
              referralConversionRate: 45.2,
            })
          }
          variant="outline"
          className="w-full"
        >
          🌐 네트워크 조회
        </Button>

        <Button
          onClick={() =>
            InsuranceAgentEvents.reportExport('monthly_performance', 'pdf', 156)
          }
          variant="outline"
          className="w-full"
        >
          📊 보고서 내보내기
        </Button>

        <Button
          onClick={() =>
            InsuranceAgentEvents.vipClientInteraction(
              'gift_sent',
              'vip-client-123'
            )
          }
          variant="outline"
          className="w-full"
        >
          💎 VIP 고객 상호작용
        </Button>
      </div>

      <RealTimeAnalytics />
    </div>
  );
}
