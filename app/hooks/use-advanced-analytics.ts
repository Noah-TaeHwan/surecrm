/**
 * 📊 고급 지능형 분석 React Hook
 * 정밀한 사용자 경험 최적화를 위한 심층 행동 분석
 */

import { useEffect, useRef, useCallback } from 'react';
import { InsuranceAgentEvents } from '~/lib/utils/analytics';

interface AnalyticsConfig {
  trackInteractionPatterns: boolean;
  trackInputBehavior: boolean;
  trackNavigationFlow: boolean;
  trackEngagementMetrics: boolean;
  trackPerformanceData: boolean;
  trackUserSignatures: boolean;
  trackEmotionalIndicators: boolean;
  trackDecisionProcesses: boolean;
  samplingRate: number;
}

const DEFAULT_CONFIG: AnalyticsConfig = {
  trackInteractionPatterns: true,
  trackInputBehavior: true,
  trackNavigationFlow: true,
  trackEngagementMetrics: true,
  trackPerformanceData: true,
  trackUserSignatures: true,
  trackEmotionalIndicators: true,
  trackDecisionProcesses: true,
  samplingRate: 1.0,
};

interface InteractionData {
  x: number;
  y: number;
  timestamp: number;
  velocity: number;
  element?: string;
}

interface NavigationData {
  depth: number;
  timestamp: number;
  direction: 'up' | 'down';
  velocity: number;
}

interface EngagementMetrics {
  focusTime: number;
  blurTime: number;
  tabSwitches: number;
  idleTime: number;
}

export function useAdvancedAnalytics(config: Partial<AnalyticsConfig> = {}) {
  const settings = { ...DEFAULT_CONFIG, ...config };
  const sessionData = useRef({
    startTime: Date.now(),
    interactionPoints: [] as InteractionData[],
    navigationFlow: [] as NavigationData[],
    engagementData: {
      focusTime: 0,
      blurTime: 0,
      tabSwitches: 0,
      idleTime: 0,
    } as EngagementMetrics,
    inputPatterns: [] as number[],
    lastPosition: { x: 0, y: 0, timestamp: 0 },
    lastScrollPosition: 0,
    lastActivity: Date.now(),
    isIdle: false,
    emotionalIndicators: {
      frustration: 0,
      engagement: 0,
      confidence: 0,
    },
  });

  // 🖱️ 상호작용 패턴 수집
  const trackInteractionPatterns = useCallback(() => {
    if (!settings.trackInteractionPatterns) return;

    const handleInteraction = (e: MouseEvent) => {
      if (Math.random() > settings.samplingRate) return;

      const currentTime = Date.now();
      const lastPos = sessionData.current.lastPosition;

      const distance = Math.sqrt(
        Math.pow(e.clientX - lastPos.x, 2) + Math.pow(e.clientY - lastPos.y, 2)
      );
      const timeDiff = currentTime - lastPos.timestamp;
      const velocity = timeDiff > 0 ? distance / timeDiff : 0;

      const interactionData: InteractionData = {
        x: e.clientX,
        y: e.clientY,
        timestamp: currentTime,
        velocity,
        element: (e.target as HTMLElement)?.tagName?.toLowerCase(),
      };

      sessionData.current.interactionPoints.push(interactionData);

      // 메모리 최적화
      if (sessionData.current.interactionPoints.length > 1000) {
        sessionData.current.interactionPoints =
          sessionData.current.interactionPoints.slice(-500);
      }

      // 사용자 의도 분석
      const recentMoves = sessionData.current.interactionPoints.slice(-10);
      const avgVelocity =
        recentMoves.reduce((sum, move) => sum + move.velocity, 0) /
        recentMoves.length;
      const hesitations = recentMoves.filter(
        (move) => move.velocity < 0.1
      ).length;

      if (recentMoves.length === 10) {
        let intent = 'exploring';
        if (hesitations > 5) intent = 'uncertain';
        if (avgVelocity > 5) intent = 'focused';

        InsuranceAgentEvents.userIntentAnalysis(
          intent,
          hesitations,
          avgVelocity
        );

        // GTM 데이터레이어에 푸시
        if (typeof window !== 'undefined' && window.dataLayer) {
          window.dataLayer.push({
            event: 'user_intent_detected',
            intent_type: intent,
            hesitation_level: hesitations,
            interaction_velocity: avgVelocity,
            timestamp: currentTime,
          });
        }
      }

      sessionData.current.lastPosition = {
        x: e.clientX,
        y: e.clientY,
        timestamp: currentTime,
      };
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const clickData = {
        element: target.tagName.toLowerCase(),
        text: target.textContent?.substring(0, 50) || '',
        timestamp: Date.now(),
      };

      // 클릭 패턴으로 감정 지표 업데이트
      sessionData.current.emotionalIndicators.confidence += 1;

      if (e.detail > 1) {
        // 더블클릭 등 - 급함/좌절 지표
        sessionData.current.emotionalIndicators.frustration += 1;
      }

      // GTM 이벤트
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'intelligent_click',
          element_type: clickData.element,
          element_content: clickData.text,
          emotional_state: {
            confidence: sessionData.current.emotionalIndicators.confidence,
            frustration: sessionData.current.emotionalIndicators.frustration,
          },
          timestamp: clickData.timestamp,
        });
      }

      InsuranceAgentEvents.buttonClick(
        clickData.text,
        clickData.element,
        window.location.pathname
      );
    };

    document.addEventListener('mousemove', handleInteraction, {
      passive: true,
    });
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('mousemove', handleInteraction);
      document.removeEventListener('click', handleClick);
    };
  }, [settings.trackInteractionPatterns, settings.samplingRate]);

  // ⌨️ 입력 행동 분석
  const trackInputBehavior = useCallback(() => {
    if (!settings.trackInputBehavior) return;

    let lastKeyTime = 0;

    const handleKeyInput = (e: KeyboardEvent) => {
      const currentTime = Date.now();
      const interval = currentTime - lastKeyTime;

      sessionData.current.inputPatterns.push(interval);

      // 타이핑 지능 분석 (20회마다)
      if (sessionData.current.inputPatterns.length % 20 === 0) {
        const avgInterval =
          sessionData.current.inputPatterns
            .slice(-20)
            .reduce((a, b) => a + b, 0) / 20;
        const wpm = Math.round(60000 / (avgInterval * 5));

        InsuranceAgentEvents.typingSpeedAnalysis(wpm, 20);

        // 타이핑 숙련도로 자신감 지수 업데이트
        if (wpm > 40) sessionData.current.emotionalIndicators.confidence += 0.5;

        // GTM 이벤트
        if (typeof window !== 'undefined' && window.dataLayer) {
          window.dataLayer.push({
            event: 'typing_intelligence',
            words_per_minute: wpm,
            proficiency_level:
              wpm > 60 ? 'expert' : wpm > 40 ? 'proficient' : 'average',
            typing_confidence:
              sessionData.current.emotionalIndicators.confidence,
            timestamp: currentTime,
          });
        }
      }

      // 특수 키 분석
      if (['Escape', 'Tab', 'Enter', 'Backspace', 'Delete'].includes(e.key)) {
        if (e.key === 'Escape') {
          sessionData.current.emotionalIndicators.frustration += 1;
        }

        // GTM 이벤트
        if (typeof window !== 'undefined' && window.dataLayer) {
          window.dataLayer.push({
            event: 'special_key_usage',
            key_type: e.key,
            emotional_impact: e.key === 'Escape' ? 'frustration' : 'navigation',
            timestamp: currentTime,
          });
        }
      }

      lastKeyTime = currentTime;
    };

    document.addEventListener('keydown', handleKeyInput);

    return () => {
      document.removeEventListener('keydown', handleKeyInput);
    };
  }, [settings.trackInputBehavior]);

  // 📜 내비게이션 흐름 분석
  const trackNavigationFlow = useCallback(() => {
    if (!settings.trackNavigationFlow) return;

    let focusPoints: number[] = [];
    let readingTime = 0;

    const handleNavigation = () => {
      const currentScrollY = window.scrollY;
      const pageHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = (currentScrollY / pageHeight) * 100;
      const scrollDirection =
        currentScrollY > sessionData.current.lastScrollPosition ? 'down' : 'up';
      const scrollVelocity = Math.abs(
        currentScrollY - sessionData.current.lastScrollPosition
      );

      const navigationData: NavigationData = {
        depth: scrollDepth,
        timestamp: Date.now(),
        direction: scrollDirection,
        velocity: scrollVelocity,
      };

      sessionData.current.navigationFlow.push(navigationData);

      // 스크롤 멈춤 지점 감지 (관심 영역)
      setTimeout(() => {
        if (window.scrollY === currentScrollY) {
          focusPoints.push(scrollDepth);
          readingTime = Date.now() - sessionData.current.startTime;

          // 컨텐츠 참여도 분석
          if (focusPoints.length > 3) {
            sessionData.current.emotionalIndicators.engagement += 1;

            // GTM 이벤트
            if (typeof window !== 'undefined' && window.dataLayer) {
              window.dataLayer.push({
                event: 'content_engagement',
                scroll_depth: Math.round(scrollDepth),
                focus_points: focusPoints.length,
                reading_time: readingTime / 1000,
                engagement_level: scrollDepth > 80 ? 'high' : 'medium',
                timestamp: Date.now(),
              });
            }
          }
        }
      }, 200);

      // 뒤로 스크롤 = 혼란/재탐색 지표
      if (scrollDirection === 'up') {
        sessionData.current.emotionalIndicators.frustration += 0.2;
      }

      sessionData.current.lastScrollPosition = currentScrollY;
    };

    window.addEventListener('scroll', handleNavigation, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleNavigation);
    };
  }, [settings.trackNavigationFlow]);

  // 👁️ 참여도 메트릭 추적
  const trackEngagementMetrics = useCallback(() => {
    if (!settings.trackEngagementMetrics) return;

    let focusStartTime = Date.now();
    let isVisible = !document.hidden;

    const handleFocusChange = () => {
      const currentTime = Date.now();

      if (document.hidden && isVisible) {
        // 포커스 잃음
        sessionData.current.engagementData.focusTime +=
          currentTime - focusStartTime;
        sessionData.current.engagementData.tabSwitches += 1;
        isVisible = false;

        // 탭 전환이 많으면 집중도 부족
        if (sessionData.current.engagementData.tabSwitches > 5) {
          sessionData.current.emotionalIndicators.frustration += 0.5;
        }
      } else if (!document.hidden && !isVisible) {
        // 포커스 회복
        focusStartTime = currentTime;
        isVisible = true;
      }

      // GTM 이벤트
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'attention_analysis',
          focus_time: sessionData.current.engagementData.focusTime,
          tab_switches: sessionData.current.engagementData.tabSwitches,
          attention_stability:
            sessionData.current.engagementData.tabSwitches < 5
              ? 'stable'
              : 'unstable',
          timestamp: currentTime,
        });
      }
    };

    // 유휴 상태 감지
    let idleTimer: NodeJS.Timeout;
    const resetIdleTimer = () => {
      if (sessionData.current.isIdle) {
        sessionData.current.engagementData.idleTime +=
          Date.now() - sessionData.current.lastActivity;
        sessionData.current.isIdle = false;
      }

      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        sessionData.current.lastActivity = Date.now();
        sessionData.current.isIdle = true;
        sessionData.current.emotionalIndicators.engagement -= 0.5;

        // GTM 이벤트
        if (typeof window !== 'undefined' && window.dataLayer) {
          window.dataLayer.push({
            event: 'user_idle_detected',
            idle_duration: 30000,
            engagement_impact: 'negative',
            timestamp: Date.now(),
          });
        }
      }, 30000);
    };

    document.addEventListener('visibilitychange', handleFocusChange);
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(
      (event) => {
        document.addEventListener(event, resetIdleTimer, { passive: true });
      }
    );

    return () => {
      document.removeEventListener('visibilitychange', handleFocusChange);
      ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(
        (event) => {
          document.removeEventListener(event, resetIdleTimer);
        }
      );
      clearTimeout(idleTimer);
    };
  }, [settings.trackEngagementMetrics]);

  // 📊 성능 데이터 수집
  const trackPerformanceData = useCallback(() => {
    if (!settings.trackPerformanceData) return;

    // 페이지 로드 성능
    const handleLoad = () => {
      const perfData = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      // GTM 이벤트
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'performance_analysis',
          load_time: perfData.loadEventEnd - perfData.loadEventStart,
          dom_ready:
            perfData.domContentLoadedEventEnd -
            perfData.domContentLoadedEventStart,
          network_time: perfData.responseEnd - perfData.requestStart,
          performance_score:
            perfData.loadEventEnd - perfData.loadEventStart < 3000
              ? 'good'
              : 'poor',
          timestamp: Date.now(),
        });
      }
    };

    window.addEventListener('load', handleLoad);

    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, [settings.trackPerformanceData]);

  // 🧬 사용자 서명 수집
  const trackUserSignatures = useCallback(() => {
    if (!settings.trackUserSignatures) return;

    let interactionSignature: number[] = [];
    let inputSignature: number[] = [];

    const collectInteractionSignature = (e: MouseEvent) => {
      const signature = Math.round(e.clientX + e.clientY + e.timeStamp) % 1000;
      interactionSignature.push(signature);

      if (interactionSignature.length >= 50) {
        const signatureHash = interactionSignature
          .reduce((a, b) => a + b, 0)
          .toString(36);

        // GTM 이벤트
        if (typeof window !== 'undefined' && window.dataLayer) {
          window.dataLayer.push({
            event: 'user_signature_collected',
            signature_type: 'interaction_pattern',
            pattern_hash: signatureHash,
            confidence: 0.85,
            timestamp: Date.now(),
          });
        }

        interactionSignature = interactionSignature.slice(-25);
      }
    };

    const collectInputSignature = (e: KeyboardEvent) => {
      const signature = Math.round(e.timeStamp) % 1000;
      inputSignature.push(signature);

      if (inputSignature.length >= 20) {
        const signatureHash = inputSignature
          .reduce((a, b) => a + b, 0)
          .toString(36);

        // GTM 이벤트
        if (typeof window !== 'undefined' && window.dataLayer) {
          window.dataLayer.push({
            event: 'input_pattern_detected',
            pattern_type: 'typing_rhythm',
            rhythm_hash: signatureHash,
            proficiency: 'average',
            timestamp: Date.now(),
          });
        }

        inputSignature = inputSignature.slice(-10);
      }
    };

    document.addEventListener('mousemove', collectInteractionSignature, {
      passive: true,
    });
    document.addEventListener('keydown', collectInputSignature);

    return () => {
      document.removeEventListener('mousemove', collectInteractionSignature);
      document.removeEventListener('keydown', collectInputSignature);
    };
  }, [settings.trackUserSignatures]);

  // 🎭 감정 지표 분석
  const trackEmotionalIndicators = useCallback(() => {
    if (!settings.trackEmotionalIndicators) return;

    const interval = setInterval(() => {
      const { frustration, engagement, confidence } =
        sessionData.current.emotionalIndicators;

      // 감정 상태 분석 이벤트
      InsuranceAgentEvents.emotionalStateAnalysis(
        frustration,
        engagement,
        confidence
      );

      // 사용자 세그먼트 분류
      let segment = 'neutral_user';
      if (frustration > 5) segment = 'struggling_user';
      else if (engagement > 10) segment = 'highly_engaged';
      else if (confidence > 8) segment = 'confident_user';

      // GTM 이벤트
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'emotional_analysis',
          frustration_level: frustration,
          engagement_level: engagement,
          confidence_level: confidence,
          user_segment: segment,
          emotional_state:
            frustration > 5
              ? 'frustrated'
              : engagement > 5
              ? 'engaged'
              : 'neutral',
          timestamp: Date.now(),
        });
      }

      // 점수 감쇠 (누적 방지)
      sessionData.current.emotionalIndicators.frustration *= 0.9;
      sessionData.current.emotionalIndicators.engagement *= 0.95;
      sessionData.current.emotionalIndicators.confidence *= 0.95;
    }, 15000); // 15초마다 분석

    return () => clearInterval(interval);
  }, [settings.trackEmotionalIndicators]);

  // 🎯 의사결정 프로세스 추적
  const trackDecisionProcesses = useCallback(() => {
    if (!settings.trackDecisionProcesses) return;

    const observeDecisionElements = () => {
      document
        .querySelectorAll('button, a, [role="button"], input, select')
        .forEach((element) => {
          let hoverStartTime = 0;
          let hoverCount = 0;

          const handleHoverStart = () => {
            hoverStartTime = Date.now();
            hoverCount++;
          };

          const handleHoverEnd = () => {
            if (hoverStartTime > 0) {
              const hoverDuration = Date.now() - hoverStartTime;
              if (hoverDuration > 1000) {
                // 1초 이상 호버 = 고민/망설임
                sessionData.current.emotionalIndicators.frustration += 0.3;
              }
            }
          };

          const handleDecision = () => {
            const hesitationTime = hoverCount * 500; // 호버 횟수 기반 추정
            const clickDelay = Date.now() - hoverStartTime;

            // GTM 이벤트
            if (typeof window !== 'undefined' && window.dataLayer) {
              window.dataLayer.push({
                event: 'decision_analysis',
                element_type: element.tagName.toLowerCase(),
                hesitation_time: hesitationTime,
                click_delay: clickDelay,
                decision_confidence:
                  clickDelay < 1000
                    ? 'high'
                    : clickDelay < 3000
                    ? 'medium'
                    : 'low',
                cognitive_load: hesitationTime > 2000 ? 'high' : 'low',
                timestamp: Date.now(),
              });
            }

            // 빠른 결정 = 자신감 증가
            if (clickDelay < 1000) {
              sessionData.current.emotionalIndicators.confidence += 1;
            }
          };

          element.addEventListener('mouseenter', handleHoverStart);
          element.addEventListener('mouseleave', handleHoverEnd);
          element.addEventListener('click', handleDecision);
        });
    };

    // DOM 변경 시 새로운 요소도 관찰
    const observer = new MutationObserver(observeDecisionElements);
    observer.observe(document.body, { childList: true, subtree: true });

    observeDecisionElements();

    return () => {
      observer.disconnect();
    };
  }, [settings.trackDecisionProcesses]);

  // 🚀 모든 추적 시스템 초기화
  useEffect(() => {
    // 실시간 비즈니스 가치 계산
    const calculateBusinessValue = () => {
      const sessionLength = Date.now() - sessionData.current.startTime;
      const interactionActivity = sessionData.current.interactionPoints.length;
      const navigationActivity = sessionData.current.navigationFlow.length;
      const { engagement, confidence, frustration } =
        sessionData.current.emotionalIndicators;

      const businessValue = Math.round(
        (sessionLength / 1000) * 0.1 +
          interactionActivity * 0.5 +
          navigationActivity * 1.0 +
          engagement * 10 -
          frustration * 5 +
          confidence * 15
      );

      // GTM 이벤트
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'business_intelligence',
          user_value: businessValue,
          session_duration: sessionLength / 1000,
          interaction_count: interactionActivity,
          navigation_count: navigationActivity,
          emotional_profile: {
            engagement: engagement,
            confidence: confidence,
            frustration: frustration,
          },
          value_tier:
            businessValue > 1000
              ? 'high_value'
              : businessValue > 500
              ? 'medium_value'
              : 'standard',
          timestamp: Date.now(),
        });
      }
    };

    // 각 추적 시스템 초기화
    const cleanupFunctions = [
      trackInteractionPatterns(),
      trackInputBehavior(),
      trackNavigationFlow(),
      trackEngagementMetrics(),
      trackPerformanceData(),
      trackUserSignatures(),
      trackEmotionalIndicators(),
      trackDecisionProcesses(),
    ].filter(Boolean);

    // 비즈니스 가치 계산 (30초마다)
    const valueCalculationInterval = setInterval(calculateBusinessValue, 30000);

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup && cleanup());
      clearInterval(valueCalculationInterval);
    };
  }, [
    trackInteractionPatterns,
    trackInputBehavior,
    trackNavigationFlow,
    trackEngagementMetrics,
    trackPerformanceData,
    trackUserSignatures,
    trackEmotionalIndicators,
    trackDecisionProcesses,
  ]);

  // 세션 데이터 접근
  const getSessionData = useCallback(
    () => ({
      ...sessionData.current,
      sessionDuration: Date.now() - sessionData.current.startTime,
    }),
    []
  );

  return {
    getSessionData,
    settings,
  };
}

// 전역 DataLayer 타입 선언
declare global {
  interface Window {
    dataLayer: any[];
  }
}
