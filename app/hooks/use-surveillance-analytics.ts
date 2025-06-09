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
  samplingRate: number; // 0-1, 데이터 수집 빈도 조절
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

interface MouseTrackingData {
  x: number;
  y: number;
  timestamp: number;
  velocity: number;
  element?: string;
}

interface ScrollTrackingData {
  depth: number;
  timestamp: number;
  direction: 'up' | 'down';
  velocity: number;
}

interface AttentionData {
  focusTime: number;
  blurTime: number;
  tabSwitches: number;
  idleTime: number;
}

export function useSurveillanceAnalytics(
  config: Partial<SurveillanceConfig> = {}
) {
  const settings = { ...DEFAULT_CONFIG, ...config };
  const sessionData = useRef({
    startTime: Date.now(),
    mouseMovements: [] as MouseTrackingData[],
    scrollData: [] as ScrollTrackingData[],
    attentionData: {
      focusTime: 0,
      blurTime: 0,
      tabSwitches: 0,
      idleTime: 0,
    } as AttentionData,
    keyboardPatterns: [] as number[],
    lastMousePosition: { x: 0, y: 0, timestamp: 0 },
    lastScrollPosition: 0,
    lastActivity: Date.now(),
    isIdle: false,
    frustrationScore: 0,
    engagementScore: 0,
    confidenceScore: 0,
  });

  // 🖱️ 마우스 움직임 극한 추적
  const trackMouseMovements = useCallback(() => {
    if (!settings.trackMouseMovements) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (Math.random() > settings.samplingRate) return;

      const currentTime = Date.now();
      const lastPos = sessionData.current.lastMousePosition;

      // 속도 계산
      const distance = Math.sqrt(
        Math.pow(e.clientX - lastPos.x, 2) + Math.pow(e.clientY - lastPos.y, 2)
      );
      const timeDiff = currentTime - lastPos.timestamp;
      const velocity = timeDiff > 0 ? distance / timeDiff : 0;

      const mouseData: MouseTrackingData = {
        x: e.clientX,
        y: e.clientY,
        timestamp: currentTime,
        velocity,
        element: (e.target as HTMLElement)?.tagName?.toLowerCase(),
      };

      // 메모리 효율성을 위해 최근 1000개만 유지
      sessionData.current.mouseMovements.push(mouseData);
      if (sessionData.current.mouseMovements.length > 1000) {
        sessionData.current.mouseMovements =
          sessionData.current.mouseMovements.slice(-500);
      }

      // 사용자 의도 분석
      const recentMoves = sessionData.current.mouseMovements.slice(-10);
      const avgVelocity =
        recentMoves.reduce((sum, move) => sum + move.velocity, 0) /
        recentMoves.length;
      const hesitations = recentMoves.filter(
        (move) => move.velocity < 0.1
      ).length;

      if (recentMoves.length === 10) {
        let intent = 'exploring';
        if (hesitations > 5) intent = 'uncertain';
        if (avgVelocity > 5) intent = 'goal_oriented';

        InsuranceAgentEvents.userIntentAnalysis(
          intent,
          hesitations,
          avgVelocity
        );
      }

      // 히트맵 데이터 전송 (5초마다)
      if (currentTime % 5000 < 50) {
        InsuranceAgentEvents.mouseHeatmapData(
          e.clientX,
          e.clientY,
          1,
          mouseData.element
        );
      }

      sessionData.current.lastMousePosition = {
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

      // 클릭 패턴으로 감정 상태 분석
      sessionData.current.confidenceScore += 1;
      if (e.detail > 1) {
        // 더블클릭 등
        sessionData.current.frustrationScore += 1;
      }

      InsuranceAgentEvents.buttonClick(
        clickData.text,
        clickData.element,
        window.location.pathname
      );
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
    };
  }, [settings.trackMouseMovements, settings.samplingRate]);

  // ⌨️ 키보드 패턴 추적 (개인정보 제외)
  const trackKeyboardPatterns = useCallback(() => {
    if (!settings.trackKeyboardPatterns) return;

    let lastKeyTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentTime = Date.now();
      const interval = currentTime - lastKeyTime;

      sessionData.current.keyboardPatterns.push(interval);

      // 타이핑 속도 분석 (20회마다)
      if (sessionData.current.keyboardPatterns.length % 20 === 0) {
        const avgInterval =
          sessionData.current.keyboardPatterns
            .slice(-20)
            .reduce((a, b) => a + b, 0) / 20;
        const wpm = Math.round(60000 / (avgInterval * 5));

        InsuranceAgentEvents.typingSpeedAnalysis(wpm, 20);

        // 타이핑 숙련도로 자신감 점수 증가
        if (wpm > 40) sessionData.current.confidenceScore += 0.5;
      }

      // 특수 키 추적
      if (['Escape', 'Tab', 'Enter', 'Backspace', 'Delete'].includes(e.key)) {
        InsuranceAgentEvents.featureUsage('keyboard_shortcut', e.key, false);

        // ESC 키는 좌절감 지표
        if (e.key === 'Escape') {
          sessionData.current.frustrationScore += 1;
        }
      }

      lastKeyTime = currentTime;
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [settings.trackKeyboardPatterns]);

  // 📜 스크롤 행동 극한 분석
  const trackScrollBehavior = useCallback(() => {
    if (!settings.trackScrollBehavior) return;

    let scrollStartTime = Date.now();
    let pausePoints: number[] = [];
    let readingTime = 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const pageHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = (currentScrollY / pageHeight) * 100;
      const scrollDirection =
        currentScrollY > sessionData.current.lastScrollPosition ? 'down' : 'up';
      const scrollVelocity = Math.abs(
        currentScrollY - sessionData.current.lastScrollPosition
      );

      const scrollData: ScrollTrackingData = {
        depth: scrollDepth,
        timestamp: Date.now(),
        direction: scrollDirection,
        velocity: scrollVelocity,
      };

      sessionData.current.scrollData.push(scrollData);

      // 스크롤 멈춤 지점 감지 (150ms 후 체크)
      setTimeout(() => {
        if (window.scrollY === currentScrollY) {
          pausePoints.push(scrollDepth);
          readingTime = Date.now() - scrollStartTime;

          // 컨텐츠 관심도 분석
          if (pausePoints.length > 3) {
            sessionData.current.engagementScore += 1;
            InsuranceAgentEvents.scrollDepthAnalysis(
              scrollDepth,
              readingTime / 1000,
              pausePoints.length
            );
          }
        }
      }, 150);

      // 뒤로 스크롤하면 혼란 지표
      if (scrollDirection === 'up') {
        sessionData.current.frustrationScore += 0.2;
      }

      sessionData.current.lastScrollPosition = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [settings.trackScrollBehavior]);

  // 👁️ 주의집중 패턴 추적
  const trackAttention = useCallback(() => {
    if (!settings.trackAttention) return;

    let focusStartTime = Date.now();
    let isVisible = !document.hidden;
    let idleStartTime = 0;

    const handleVisibilityChange = () => {
      const currentTime = Date.now();

      if (document.hidden && isVisible) {
        // 포커스 잃음
        sessionData.current.attentionData.focusTime +=
          currentTime - focusStartTime;
        sessionData.current.attentionData.tabSwitches += 1;
        isVisible = false;

        // 탭 전환이 많으면 산만함 지표
        if (sessionData.current.attentionData.tabSwitches > 5) {
          sessionData.current.frustrationScore += 0.5;
        }
      } else if (!document.hidden && !isVisible) {
        // 포커스 회복
        focusStartTime = currentTime;
        isVisible = true;
      }

      // 주의집중 분석 전송
      const { focusTime, blurTime, tabSwitches } =
        sessionData.current.attentionData;
      InsuranceAgentEvents.attentionPatternAnalysis(
        focusTime,
        blurTime,
        tabSwitches
      );
    };

    // 유휴 상태 감지
    let idleTimer: NodeJS.Timeout;
    const resetIdleTimer = () => {
      if (sessionData.current.isIdle) {
        sessionData.current.attentionData.idleTime +=
          Date.now() - idleStartTime;
        sessionData.current.isIdle = false;
      }

      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        idleStartTime = Date.now();
        sessionData.current.isIdle = true;
        // 유휴 상태는 참여도 감소
        sessionData.current.engagementScore -= 0.5;
      }, 30000); // 30초
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(
      (event) => {
        document.addEventListener(event, resetIdleTimer, { passive: true });
      }
    );

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(
        (event) => {
          document.removeEventListener(event, resetIdleTimer);
        }
      );
      clearTimeout(idleTimer);
    };
  }, [settings.trackAttention]);

  // 🎭 감정 상태 실시간 분석
  const analyzeEmotionalState = useCallback(() => {
    if (!settings.trackEmotionalState) return;

    const interval = setInterval(() => {
      const { frustrationScore, engagementScore, confidenceScore } =
        sessionData.current;

      InsuranceAgentEvents.emotionalStateAnalysis(
        frustrationScore,
        engagementScore,
        confidenceScore
      );

      // 사용자 세그멘트 분석
      let segment = 'neutral';
      if (frustrationScore > 5) segment = 'frustrated_user';
      else if (engagementScore > 10) segment = 'highly_engaged';
      else if (confidenceScore > 8) segment = 'power_user';

      InsuranceAgentEvents.userSegmentAnalysis(segment, {
        frustration: frustrationScore,
        engagement: engagementScore,
        confidence: confidenceScore,
        session_length: Date.now() - sessionData.current.startTime,
      });

      // 점수 리셋 (누적 방지)
      sessionData.current.frustrationScore *= 0.9;
      sessionData.current.engagementScore *= 0.95;
      sessionData.current.confidenceScore *= 0.95;
    }, 10000); // 10초마다 분석

    return () => clearInterval(interval);
  }, [settings.trackEmotionalState]);

  // 🎯 의사결정 패턴 추적
  const trackDecisionPatterns = useCallback(() => {
    if (!settings.trackDecisionPatterns) return;

    const observeDecisionPoints = () => {
      // 모든 상호작용 요소 감시
      const elements = document.querySelectorAll(
        'button, a, [role="button"], input, select'
      );

      elements.forEach((element) => {
        let hoverStartTime = 0;
        let hoverCount = 0;

        const handleMouseEnter = () => {
          hoverStartTime = Date.now();
          hoverCount++;
        };

        const handleMouseLeave = () => {
          // 호버 시간 추적
          if (hoverStartTime > 0) {
            const hoverDuration = Date.now() - hoverStartTime;
            if (hoverDuration > 1000) {
              // 1초 이상 호버하면 고민하는 상태
              sessionData.current.frustrationScore += 0.3;
            }
          }
        };

        const handleClick = () => {
          const hesitationTime = hoverCount * 500; // 호버 횟수 기반 추정
          const clickDelay = Date.now() - hoverStartTime;

          InsuranceAgentEvents.decisionMakingPattern(
            element.tagName.toLowerCase(),
            hesitationTime,
            clickDelay
          );

          // 빠른 결정은 자신감 증가
          if (clickDelay < 1000) {
            sessionData.current.confidenceScore += 1;
          }
        };

        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);
        element.addEventListener('click', handleClick);
      });
    };

    // DOM 변경 시 새로운 요소도 감시
    const observer = new MutationObserver(observeDecisionPoints);
    observer.observe(document.body, { childList: true, subtree: true });

    // 초기 요소들 감시 시작
    observeDecisionPoints();

    return () => {
      observer.disconnect();
    };
  }, [settings.trackDecisionPatterns]);

  // 📊 성능 메트릭 추적
  const trackPerformance = useCallback(() => {
    if (!settings.trackPerformance) return;

    // 페이지 로드 성능
    const handleLoad = () => {
      const perfData = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      InsuranceAgentEvents.pagePerformanceAnalysis(
        perfData.loadEventEnd - perfData.loadEventStart,
        perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        perfData.responseEnd - perfData.requestStart
      );
    };

    // 리소스 성능 모니터링
    const perfObserver = new PerformanceObserver((entries) => {
      entries.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          InsuranceAgentEvents.resourceLoadPerformance(
            resourceEntry.name,
            resourceEntry.duration,
            resourceEntry.transferSize
          );
        }
      });
    });

    perfObserver.observe({ entryTypes: ['resource'] });
    window.addEventListener('load', handleLoad);

    return () => {
      perfObserver.disconnect();
      window.removeEventListener('load', handleLoad);
    };
  }, [settings.trackPerformance]);

  // 🧬 생체인식 패턴 수집
  const trackBiometrics = useCallback(() => {
    if (!settings.trackBiometrics) return;

    let mouseSignature: number[] = [];
    let keyboardSignature: number[] = [];

    const collectMouseBiometrics = (e: MouseEvent) => {
      const signature = Math.round(e.clientX + e.clientY + e.timeStamp) % 1000;
      mouseSignature.push(signature);

      if (mouseSignature.length >= 50) {
        const biometricHash = mouseSignature
          .reduce((a, b) => a + b, 0)
          .toString(36);
        InsuranceAgentEvents.biometricSignature('mouse', biometricHash);
        mouseSignature = mouseSignature.slice(-25);
      }
    };

    const collectKeyboardBiometrics = (e: KeyboardEvent) => {
      const signature = Math.round(e.timeStamp) % 1000;
      keyboardSignature.push(signature);

      if (keyboardSignature.length >= 20) {
        const biometricHash = keyboardSignature
          .reduce((a, b) => a + b, 0)
          .toString(36);
        InsuranceAgentEvents.biometricSignature('keyboard', biometricHash);
        keyboardSignature = keyboardSignature.slice(-10);
      }
    };

    document.addEventListener('mousemove', collectMouseBiometrics, {
      passive: true,
    });
    document.addEventListener('keydown', collectKeyboardBiometrics);

    return () => {
      document.removeEventListener('mousemove', collectMouseBiometrics);
      document.removeEventListener('keydown', collectKeyboardBiometrics);
    };
  }, [settings.trackBiometrics]);

  // 🚀 모든 추적 시스템 초기화
  useEffect(() => {
    // 사용자 세션 가치 실시간 계산
    const calculateBusinessValue = () => {
      const sessionLength = Date.now() - sessionData.current.startTime;
      const mouseActivity = sessionData.current.mouseMovements.length;
      const scrollActivity = sessionData.current.scrollData.length;
      const { engagementScore, confidenceScore, frustrationScore } =
        sessionData.current;

      const businessValue = Math.round(
        (sessionLength / 1000) * 0.1 + // 세션 시간
          mouseActivity * 0.5 + // 마우스 활동
          scrollActivity * 1.0 + // 스크롤 활동
          engagementScore * 10 - // 참여도
          frustrationScore * 5 + // 좌절감 (음수)
          confidenceScore * 15 // 자신감
      );

      InsuranceAgentEvents.userBusinessValueCalculation(businessValue, {
        session_length: sessionLength / 1000,
        mouse_activity: mouseActivity,
        scroll_activity: scrollActivity,
        engagement: engagementScore,
        frustration: frustrationScore,
        confidence: confidenceScore,
      });
    };

    // 각 추적 시스템 초기화
    const cleanupFunctions = [
      trackMouseMovements(),
      trackKeyboardPatterns(),
      trackScrollBehavior(),
      trackAttention(),
      trackDecisionPatterns(),
      trackPerformance(),
      trackBiometrics(),
      analyzeEmotionalState(),
    ].filter(Boolean);

    // 비즈니스 가치 계산 (30초마다)
    const valueCalculationInterval = setInterval(calculateBusinessValue, 30000);

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup && cleanup());
      clearInterval(valueCalculationInterval);
    };
  }, [
    trackMouseMovements,
    trackKeyboardPatterns,
    trackScrollBehavior,
    trackAttention,
    trackDecisionPatterns,
    trackPerformance,
    trackBiometrics,
    analyzeEmotionalState,
  ]);

  // 세션 데이터 접근을 위한 getter
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
