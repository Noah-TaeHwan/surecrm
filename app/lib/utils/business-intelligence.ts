/**
 * 🏢 비즈니스 인텔리전스 & 고급 사용자 분석 시스템
 *
 * 이 시스템은 사용자 경험 개선과 비즈니스 최적화를 위한
 * 포괄적인 데이터 수집 및 분석 기능을 제공합니다.
 */

import { InsuranceAgentEvents } from './analytics';

// === 📊 비즈니스 인텔리전스 설정 ===
interface BusinessConfig {
  enableAdvancedAnalytics: boolean;
  enableBehavioralTracking: boolean;
  enablePerformanceMonitoring: boolean;
  enableUserJourneyMapping: boolean;
  dataRetentionDays: number;
  samplingRate: number;
}

interface UserProfile {
  id: string;
  sessionStartTime: number;
  totalSessions: number;
  engagementScore: number;
  behaviorPattern: string;
  preferenceProfile: Record<string, any>;
  riskScore: number;
  valueSegment: 'premium' | 'standard' | 'basic';
  lastActivity: number;
  deviceFingerprint: string;
  locationPattern: Array<{
    timestamp: number;
    timezone: string;
    language: string;
  }>;
}

interface BehaviorMetrics {
  mouseMovements: Array<{ x: number; y: number; timestamp: number }>;
  clickHeatmap: Array<{ element: string; count: number; avgTime: number }>;
  scrollPattern: Array<{ depth: number; time: number; bounced: boolean }>;
  keystrokes: Array<{ key: string; interval: number; context: string }>;
  focusEvents: Array<{ element: string; duration: number; abandoned: boolean }>;
  errorRecovery: Array<{
    error: string;
    recoveryTime: number;
    success: boolean;
  }>;
}

interface SessionIntelligence {
  intentPrediction: string;
  frustrationLevel: number;
  engagementDepth: number;
  conversionProbability: number;
  churnRisk: number;
  nextBestAction: string;
  personalizedRecommendations: string[];
  behaviorAnomalies: string[];
}

// === 🔍 고급 비즈니스 인텔리전스 클래스 ===
class BusinessIntelligenceSystem {
  private config: BusinessConfig;
  private userProfile: UserProfile | null = null;
  private behaviorMetrics: BehaviorMetrics;
  private sessionIntelligence: SessionIntelligence;
  private collectionInterval: number = 100; // 매 100ms마다 수집
  private analysisInterval: number = 5000; // 매 5초마다 분석

  constructor(config: Partial<BusinessConfig> = {}) {
    this.config = {
      enableAdvancedAnalytics: true,
      enableBehavioralTracking: true,
      enablePerformanceMonitoring: true,
      enableUserJourneyMapping: true,
      dataRetentionDays: 90,
      samplingRate: 1.0,
      ...config,
    };

    this.behaviorMetrics = {
      mouseMovements: [],
      clickHeatmap: [],
      scrollPattern: [],
      keystrokes: [],
      focusEvents: [],
      errorRecovery: [],
    };

    this.sessionIntelligence = {
      intentPrediction: 'exploring',
      frustrationLevel: 0,
      engagementDepth: 0,
      conversionProbability: 0,
      churnRisk: 0,
      nextBestAction: 'continue_exploration',
      personalizedRecommendations: [],
      behaviorAnomalies: [],
    };

    this.initializeIntelligenceSystem();
  }

  // === 🚀 시스템 초기화 ===
  private initializeIntelligenceSystem(): void {
    if (!this.config.enableAdvancedAnalytics) return;

    this.setupUserProfileTracking();
    this.setupBehaviorTracking();
    this.setupPerformanceMonitoring();
    this.setupUserJourneyMapping();
    this.startContinuousAnalysis();
  }

  // === 👤 사용자 프로필 추적 ===
  private setupUserProfileTracking(): void {
    const sessionId = this.generateSessionId();
    const deviceFingerprint = this.generateDeviceFingerprint();

    this.userProfile = {
      id: sessionId,
      sessionStartTime: Date.now(),
      totalSessions: this.getStoredSessionCount() + 1,
      engagementScore: 0,
      behaviorPattern: 'new_user',
      preferenceProfile: {},
      riskScore: 0,
      valueSegment: 'standard',
      lastActivity: Date.now(),
      deviceFingerprint,
      locationPattern: [
        {
          timestamp: Date.now(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language,
        },
      ],
    };

    // 사용자 프로필 데이터 수집
    InsuranceAgentEvents.userIntentAnalysis('profile_creation', 0, 0);

    this.storeUserProfile();
  }

  // === 🖱️ 행동 추적 시스템 ===
  private setupBehaviorTracking(): void {
    if (!this.config.enableBehavioralTracking) return;

    // 마우스 움직임 추적 (극한 정밀도)
    document.addEventListener('mousemove', (e) => {
      this.behaviorMetrics.mouseMovements.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now(),
      });

      // 마우스 움직임 패턴 분석
      this.analyzeMousePattern();
    });

    // 클릭 히트맵 생성
    document.addEventListener('click', (e) => {
      const element = this.getElementSelector(e.target as Element);
      const existingClick = this.behaviorMetrics.clickHeatmap.find(
        (click) => click.element === element
      );

      if (existingClick) {
        existingClick.count++;
      } else {
        this.behaviorMetrics.clickHeatmap.push({
          element,
          count: 1,
          avgTime: Date.now() - this.userProfile!.lastActivity,
        });
      }

      InsuranceAgentEvents.mouseHeatmapData(
        e.clientX,
        e.clientY,
        existingClick?.count || 1,
        element
      );
    });

    // 스크롤 패턴 분석
    let scrollTimeout: NodeJS.Timeout;
    document.addEventListener('scroll', () => {
      const scrollDepth =
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
        100;

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.behaviorMetrics.scrollPattern.push({
          depth: Math.round(scrollDepth),
          time: Date.now() - this.userProfile!.lastActivity,
          bounced: scrollDepth < 25,
        });
      }, 150);
    });

    // 키스트로크 패턴 분석 (타이핑 생체인식)
    let lastKeyTime = 0;
    document.addEventListener('keydown', (e) => {
      const currentTime = Date.now();
      const interval = lastKeyTime > 0 ? currentTime - lastKeyTime : 0;

      this.behaviorMetrics.keystrokes.push({
        key: e.key.length === 1 ? 'char' : e.key, // 개인정보 보호
        interval,
        context: this.getCurrentContext(),
      });

      lastKeyTime = currentTime;

      // 타이핑 속도 분석
      if (this.behaviorMetrics.keystrokes.length >= 10) {
        this.analyzeTypingPattern();
      }
    });

    // 포커스 이벤트 추적
    document.addEventListener('focusin', (e) => {
      const element = this.getElementSelector(e.target as Element);
      const focusStart = Date.now();

      const handleFocusOut = () => {
        const duration = Date.now() - focusStart;
        this.behaviorMetrics.focusEvents.push({
          element,
          duration,
          abandoned: duration < 2000, // 2초 미만은 포기로 간주
        });

        (e.target as Element).removeEventListener('focusout', handleFocusOut);
      };

      (e.target as Element).addEventListener('focusout', handleFocusOut);
    });
  }

  // === ⚡ 성능 모니터링 ===
  private setupPerformanceMonitoring(): void {
    if (!this.config.enablePerformanceMonitoring) return;

    // 페이지 로드 성능 분석
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      InsuranceAgentEvents.pagePerformanceAnalysis(
        perfData.loadEventEnd - perfData.loadEventStart,
        perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        perfData.responseEnd - perfData.requestStart
      );
    });

    // 리소스 로딩 모니터링
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          InsuranceAgentEvents.resourceLoadPerformance(
            resourceEntry.name,
            resourceEntry.duration,
            resourceEntry.transferSize || 0
          );
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });

    // 메모리 사용량 모니터링 (Chrome 전용)
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        InsuranceAgentEvents.pagePerformanceAnalysis(
          memory.usedJSHeapSize,
          memory.totalJSHeapSize,
          memory.jsHeapSizeLimit
        );
      }, 30000); // 30초마다
    }
  }

  // === 🗺️ 사용자 여정 매핑 ===
  private setupUserJourneyMapping(): void {
    if (!this.config.enableUserJourneyMapping) return;

    // 페이지 변경 추적
    let currentPath = window.location.pathname;
    const pathHistory: Array<{
      path: string;
      timestamp: number;
      duration: number;
    }> = [];

    const trackPageChange = () => {
      const newPath = window.location.pathname;
      if (newPath !== currentPath) {
        const now = Date.now();
        pathHistory.push({
          path: currentPath,
          timestamp: now,
          duration: now - this.userProfile!.lastActivity,
        });

        currentPath = newPath;
        this.userProfile!.lastActivity = now;

        // 사용자 여정 패턴 분석
        this.analyzeUserJourney(pathHistory);
      }
    };

    // History API 추적
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      trackPageChange();
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      trackPageChange();
    };

    window.addEventListener('popstate', trackPageChange);
  }

  // === 🧠 지속적 분석 시스템 ===
  private startContinuousAnalysis(): void {
    // 🚀 Production 환경에서만 극한 분석 실행
    if (
      typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      // 실시간 행동 분석
      setInterval(() => {
        this.analyzeCurrentBehavior();
      }, this.analysisInterval);

      // 예측 모델 업데이트
      setInterval(() => {
        this.updatePredictiveModels();
      }, this.analysisInterval * 2);

      // 사용자 세그먼테이션 업데이트
      setInterval(() => {
        this.updateUserSegmentation();
      }, this.analysisInterval * 4);
    }
  }

  // === 📊 행동 분석 메서드들 ===
  private analyzeMousePattern(): void {
    const recentMovements = this.behaviorMetrics.mouseMovements.slice(-10);
    if (recentMovements.length < 5) return;

    // 마우스 속도 계산
    let totalDistance = 0;
    let totalTime = 0;

    for (let i = 1; i < recentMovements.length; i++) {
      const prev = recentMovements[i - 1];
      const curr = recentMovements[i];

      const distance = Math.sqrt(
        Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
      );

      totalDistance += distance;
      totalTime += curr.timestamp - prev.timestamp;
    }

    const velocity = totalDistance / (totalTime || 1);

    // 망설임 패턴 감지
    const hesitations = recentMovements.filter((_, i, arr) => {
      if (i === 0) return false;
      const prev = arr[i - 1];
      const curr = arr[i];
      return curr.timestamp - prev.timestamp > 500; // 500ms 이상 정지
    }).length;

    // 🚀 Production 환경에서만 데이터 전송
    if (
      typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      // 사용자 의도 분석 전송
      InsuranceAgentEvents.userIntentAnalysis(
        this.predictUserIntent(velocity, hesitations),
        hesitations,
        velocity
      );
    }
  }

  private analyzeTypingPattern(): void {
    const recentKeystrokes = this.behaviorMetrics.keystrokes.slice(-20);
    const intervals = recentKeystrokes
      .map((k) => k.interval)
      .filter((i) => i > 0);

    if (intervals.length < 5) return;

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const wpm = Math.round(60000 / (avgInterval * 5)); // 대략적 WPM 계산

    // 🚀 Production 환경에서만 데이터 전송
    if (
      typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      InsuranceAgentEvents.typingSpeedAnalysis(wpm, recentKeystrokes.length);

      // 생체인식 서명 생성
      const signature = this.generateBiometricSignature(intervals);
      InsuranceAgentEvents.biometricSignature('typing_rhythm', signature);
    }
  }

  private analyzeCurrentBehavior(): void {
    if (!this.userProfile) return;

    // 참여도 점수 계산
    const engagementScore = this.calculateEngagementScore();

    // 좌절감 수준 분석
    const frustrationLevel = this.calculateFrustrationLevel();

    // 신뢰도 점수
    const confidenceLevel = this.calculateConfidenceLevel();

    // 🚀 Production 환경에서만 데이터 전송
    if (
      typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      // 감정 상태 분석 전송
      InsuranceAgentEvents.emotionalStateAnalysis(
        frustrationLevel,
        engagementScore,
        confidenceLevel
      );
    }

    // 세션 인텔리전스 업데이트
    this.sessionIntelligence = {
      ...this.sessionIntelligence,
      engagementDepth: engagementScore,
      frustrationLevel,
      conversionProbability: this.calculateConversionProbability(),
      churnRisk: this.calculateChurnRisk(),
    };
  }

  private analyzeUserJourney(
    pathHistory: Array<{ path: string; timestamp: number; duration: number }>
  ): void {
    if (pathHistory.length < 2) return;

    const journeyPattern = pathHistory
      .slice(-5)
      .map((p) => p.path)
      .join(' -> ');
    const avgTimePerPage =
      pathHistory.reduce((sum, p) => sum + p.duration, 0) / pathHistory.length;

    // 🚀 Production 환경에서만 데이터 전송
    if (
      typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      InsuranceAgentEvents.userIntentAnalysis(
        `journey_${journeyPattern.replace(/\//g, '_')}`,
        pathHistory.filter((p) => p.duration < 3000).length, // 빠른 이탈 페이지 수
        avgTimePerPage
      );
    }
  }

  // === 🔮 예측 및 분석 헬퍼 메서드들 ===
  private predictUserIntent(velocity: number, hesitations: number): string {
    if (velocity > 100 && hesitations < 2) return 'confident_navigation';
    if (velocity < 20 && hesitations > 3) return 'confused_searching';
    if (hesitations > 5) return 'decision_making';
    if (velocity > 50) return 'goal_oriented';
    return 'casual_browsing';
  }

  private calculateEngagementScore(): number {
    const clickCount = this.behaviorMetrics.clickHeatmap.reduce(
      (sum, click) => sum + click.count,
      0
    );
    const scrollDepth = Math.max(
      ...this.behaviorMetrics.scrollPattern.map((s) => s.depth),
      0
    );
    const timeOnPage = Date.now() - this.userProfile!.sessionStartTime;

    return Math.min(10, clickCount * 2 + scrollDepth / 10 + timeOnPage / 10000);
  }

  private calculateFrustrationLevel(): number {
    const errorCount = this.behaviorMetrics.errorRecovery.length;
    const abandonedFocus = this.behaviorMetrics.focusEvents.filter(
      (f) => f.abandoned
    ).length;
    const rapidClicks = this.behaviorMetrics.clickHeatmap.filter(
      (c) => c.avgTime < 1000
    ).length;

    return Math.min(10, errorCount * 2 + abandonedFocus + rapidClicks);
  }

  private calculateConfidenceLevel(): number {
    const successfulActions = this.behaviorMetrics.focusEvents.filter(
      (f) => !f.abandoned
    ).length;
    const consistentScrolling = this.behaviorMetrics.scrollPattern.filter(
      (s) => !s.bounced
    ).length;

    return Math.min(10, successfulActions + consistentScrolling);
  }

  private calculateConversionProbability(): number {
    const engagementScore = this.calculateEngagementScore();
    const timeSpent = Date.now() - this.userProfile!.sessionStartTime;
    const pageDepth = this.behaviorMetrics.scrollPattern.length;

    return Math.min(
      1,
      engagementScore * 0.1 + timeSpent / 300000 + pageDepth * 0.05
    );
  }

  private calculateChurnRisk(): number {
    const frustration = this.calculateFrustrationLevel();
    const bounceRate =
      this.behaviorMetrics.scrollPattern.filter((s) => s.bounced).length /
      Math.max(1, this.behaviorMetrics.scrollPattern.length);

    return Math.min(1, frustration * 0.1 + bounceRate);
  }

  // === 🔧 유틸리티 메서드들 ===
  private generateSessionId(): string {
    return (
      'session_' +
      Date.now().toString(36) +
      Math.random().toString(36).substr(2)
    );
  }

  private generateDeviceFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.textBaseline = 'top';
    ctx!.font = '14px Arial';
    ctx!.fillText('Device fingerprint', 2, 2);

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
    ].join('|');

    return btoa(fingerprint).substr(0, 32);
  }

  private generateBiometricSignature(intervals: number[]): string {
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance =
      intervals.reduce(
        (sum, interval) => sum + Math.pow(interval - avgInterval, 2),
        0
      ) / intervals.length;

    return btoa(`${avgInterval.toFixed(2)}_${variance.toFixed(2)}`);
  }

  private getElementSelector(element: Element): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  private getCurrentContext(): string {
    const activeElement = document.activeElement;
    if (!activeElement) return 'unknown';

    return this.getElementSelector(activeElement);
  }

  private getStoredSessionCount(): number {
    const stored = localStorage.getItem('bi_session_count');
    return stored ? parseInt(stored, 10) : 0;
  }

  private storeUserProfile(): void {
    if (this.userProfile) {
      localStorage.setItem(
        'bi_session_count',
        this.userProfile.totalSessions.toString()
      );
      sessionStorage.setItem(
        'bi_current_profile',
        JSON.stringify(this.userProfile)
      );
    }
  }

  private updatePredictiveModels(): void {
    // 예측 모델 업데이트 로직
    this.sessionIntelligence.nextBestAction = this.predictNextBestAction();
    this.sessionIntelligence.personalizedRecommendations =
      this.generateRecommendations();
  }

  private updateUserSegmentation(): void {
    if (!this.userProfile) return;

    const engagement = this.calculateEngagementScore();
    const timeSpent = Date.now() - this.userProfile.sessionStartTime;

    if (engagement > 7 && timeSpent > 300000) {
      // 5분 이상, 높은 참여도
      this.userProfile.valueSegment = 'premium';
    } else if (engagement > 4 && timeSpent > 120000) {
      // 2분 이상, 중간 참여도
      this.userProfile.valueSegment = 'standard';
    } else {
      this.userProfile.valueSegment = 'basic';
    }

    this.storeUserProfile();
  }

  private predictNextBestAction(): string {
    const frustration = this.calculateFrustrationLevel();
    const engagement = this.calculateEngagementScore();

    if (frustration > 5) return 'show_help';
    if (engagement > 7) return 'suggest_upgrade';
    if (engagement < 3) return 'engage_content';
    return 'continue_journey';
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const userSegment = this.userProfile?.valueSegment;

    if (userSegment === 'premium') {
      recommendations.push(
        'advanced_features',
        'priority_support',
        'exclusive_content'
      );
    } else if (userSegment === 'standard') {
      recommendations.push(
        'feature_discovery',
        'productivity_tips',
        'community_access'
      );
    } else {
      recommendations.push('getting_started', 'basic_tutorial', 'free_trial');
    }

    return recommendations;
  }

  // === 📊 공개 API ===
  public getCurrentProfile(): UserProfile | null {
    return this.userProfile;
  }

  public getSessionIntelligence(): SessionIntelligence {
    return this.sessionIntelligence;
  }

  public getBehaviorMetrics(): BehaviorMetrics {
    return this.behaviorMetrics;
  }

  public startAdvancedTracking(): void {
    this.config.enableAdvancedAnalytics = true;
    this.config.enableBehavioralTracking = true;
    this.initializeIntelligenceSystem();
  }

  public stopAdvancedTracking(): void {
    this.config.enableAdvancedAnalytics = false;
    this.config.enableBehavioralTracking = false;
  }
}

// === 🌐 전역 비즈니스 인텔리전스 인스턴스 ===
let businessIntelligenceSystem: BusinessIntelligenceSystem | null = null;

export function initializeBusinessIntelligence(
  config: Partial<BusinessConfig> = {}
): void {
  if (typeof window === 'undefined') return; // SSR 체크

  businessIntelligenceSystem = new BusinessIntelligenceSystem(config);
}

export function getBusinessIntelligence(): BusinessIntelligenceSystem | null {
  return businessIntelligenceSystem;
}

export function getCurrentUserProfile(): UserProfile | null {
  return businessIntelligenceSystem?.getCurrentProfile() || null;
}

export function getSessionIntelligence(): SessionIntelligence | null {
  return businessIntelligenceSystem?.getSessionIntelligence() || null;
}

// === 🎯 자동 초기화 ===
if (typeof window !== 'undefined') {
  // 페이지 로드 시 자동으로 비즈니스 인텔리전스 시작
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeBusinessIntelligence();
    });
  } else {
    initializeBusinessIntelligence();
  }
}
