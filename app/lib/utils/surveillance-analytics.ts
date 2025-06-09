/**
 * 📊 SureCRM 고급 지능형 분석 시스템
 * 정밀한 사용자 경험 최적화를 위한 심층 행동 분석
 *
 * 이 시스템은 사용자의 디지털 상호작용을 분석하여
 * 비즈니스 인텔리전스와 개인화 서비스 제공을 위한 데이터를 구축합니다.
 */

import { InsuranceAgentEvents } from './analytics';

// 사용자 행동 패턴 분석을 위한 데이터 구조
interface UserBehaviorProfile {
  sessionId: string;
  userId?: string;
  deviceInfo: DeviceFingerprint;
  behaviorPatterns: BehaviorPattern[];
  preferences: UserPreferences;
  engagementMetrics: EngagementMetrics;
  temporalPatterns: TemporalPattern[];
  mouseMovements: MouseTrackingData[];
  scrollPatterns: ScrollPattern[];
  attentionMetrics: AttentionMetrics;
}

interface DeviceFingerprint {
  userAgent: string;
  screenResolution: string;
  colorDepth: number;
  timezone: string;
  language: string;
  platform: string;
  cookieEnabled: boolean;
  doNotTrack: boolean;
  touchSupport: boolean;
  canvasFingerprint: string;
  webglFingerprint: string;
  audioFingerprint: string;
  batteryLevel?: number;
  connectionType: string;
  hardwareConcurrency: number;
  maxTouchPoints: number;
  devicePixelRatio: number;
}

interface BehaviorPattern {
  action: string;
  timestamp: number;
  duration: number;
  sequence: number;
  context: Record<string, any>;
  intent_probability: number;
}

interface UserPreferences {
  preferredFeatures: string[];
  interactionSpeed: 'slow' | 'medium' | 'fast';
  clickPatterns: 'precise' | 'hesitant' | 'aggressive';
  navigationStyle: 'methodical' | 'exploratory' | 'goal_oriented';
  contentPreferences: string[];
  timeSpentPerSection: Record<string, number>;
}

interface EngagementMetrics {
  sessionDepth: number;
  bounceRate: number;
  returnVisitor: boolean;
  totalTimeSpent: number;
  pageViews: number;
  interactionRate: number;
  frustractionIndicators: number;
  satisfactionScore: number;
}

interface TemporalPattern {
  dayOfWeek: number;
  hourOfDay: number;
  sessionLength: number;
  activityLevel: number;
  featureUsage: string[];
}

interface MouseTrackingData {
  x: number;
  y: number;
  timestamp: number;
  event: 'move' | 'click' | 'scroll' | 'hover';
  element?: string;
  velocity: number;
  acceleration: number;
  hesitation?: boolean;
}

interface ScrollPattern {
  pageHeight: number;
  scrollDepth: number;
  scrollSpeed: number;
  pausePoints: number[];
  backtrackingCount: number;
  readingPattern: 'skimming' | 'reading' | 'scanning';
}

interface AttentionMetrics {
  focusTime: number;
  blurTime: number;
  tabSwitches: number;
  idleTime: number;
  activeTime: number;
  deepWorkSessions: number;
}

class SurveillanceCapitalism {
  private userProfile: UserBehaviorProfile;
  private sessionStartTime: number;
  private mouseTracker: MouseTracker;
  private scrollTracker: ScrollTracker;
  private attentionTracker: AttentionTracker;
  private keyboardTracker: KeyboardTracker;
  private performanceTracker: PerformanceTracker;
  private biometricTracker: BiometricTracker;

  constructor() {
    this.sessionStartTime = Date.now();
    this.userProfile = this.initializeUserProfile();
    this.mouseTracker = new MouseTracker();
    this.scrollTracker = new ScrollTracker();
    this.attentionTracker = new AttentionTracker();
    this.keyboardTracker = new KeyboardTracker();
    this.performanceTracker = new PerformanceTracker();
    this.biometricTracker = new BiometricTracker();

    this.startSurveillance();
  }

  private initializeUserProfile(): UserBehaviorProfile {
    return {
      sessionId: this.generateSessionId(),
      deviceInfo: this.collectDeviceFingerprint(),
      behaviorPatterns: [],
      preferences: this.initializePreferences(),
      engagementMetrics: this.initializeEngagementMetrics(),
      temporalPatterns: [],
      mouseMovements: [],
      scrollPatterns: [],
      attentionMetrics: this.initializeAttentionMetrics(),
    };
  }

  private startSurveillance() {
    // 🕵️‍♂️ 모든 사용자 상호작용 감시 시작
    this.trackEveryMouseMovement();
    this.trackEveryKeypress();
    this.trackEveryScroll();
    this.trackAttentionPatterns();
    this.trackPerformanceMetrics();
    this.trackBiometricData();
    this.trackNetworkBehavior();
    this.trackDeviceUsagePatterns();
    this.trackEmotionalStates();
    this.trackSocialBehavior();
    this.trackDecisionMakingPatterns();
    this.trackPredictiveBehavior();
  }

  // 🖱️ 마우스 움직임 극한 추적
  private trackEveryMouseMovement() {
    let mousePath: MouseTrackingData[] = [];
    let lastMousePosition = { x: 0, y: 0, timestamp: 0 };

    document.addEventListener('mousemove', (e) => {
      const currentTime = Date.now();
      const velocity = this.calculateVelocity(lastMousePosition, {
        x: e.clientX,
        y: e.clientY,
        timestamp: currentTime,
      });
      const acceleration = this.calculateAcceleration(mousePath);

      const mouseData: MouseTrackingData = {
        x: e.clientX,
        y: e.clientY,
        timestamp: currentTime,
        event: 'move',
        element: (e.target as HTMLElement)?.tagName?.toLowerCase(),
        velocity,
        acceleration,
        hesitation: velocity < 0.1 && mousePath.length > 5,
      };

      mousePath.push(mouseData);
      this.userProfile.mouseMovements.push(mouseData);

      // 🧠 마우스 패턴으로 사용자 의도 분석
      this.analyzeMouseIntent(mousePath);

      // 메모리 효율성을 위해 최근 1000개만 유지
      if (mousePath.length > 1000) {
        mousePath = mousePath.slice(-500);
      }

      lastMousePosition = {
        x: e.clientX,
        y: e.clientY,
        timestamp: currentTime,
      };
    });

    // 클릭 패턴 분석
    document.addEventListener('click', (e) => {
      this.analyzeClickPattern(e, mousePath);
      InsuranceAgentEvents.buttonClick(
        (e.target as HTMLElement)?.textContent?.trim() || 'unknown',
        (e.target as HTMLElement)?.tagName?.toLowerCase() || 'unknown',
        window.location.pathname
      );
    });

    // 호버 패턴 분석
    document.addEventListener('mouseover', (e) => {
      this.analyzeHoverPattern(e);
    });
  }

  // ⌨️ 키보드 입력 패턴 분석 (개인정보 제외)
  private trackEveryKeypress() {
    let typingPattern: number[] = [];
    let lastKeyTime = 0;

    document.addEventListener('keydown', (e) => {
      const currentTime = Date.now();
      const interval = currentTime - lastKeyTime;

      // 개인정보가 포함될 수 있는 실제 키 내용은 수집하지 않음
      // 대신 타이핑 패턴과 속도만 수집
      typingPattern.push(interval);

      this.analyzeTypingStyle(typingPattern);

      // 특수 키만 추적
      if (['Escape', 'Tab', 'Enter', 'Backspace', 'Delete'].includes(e.key)) {
        InsuranceAgentEvents.featureUsage('keyboard_shortcut', e.key);
      }

      lastKeyTime = currentTime;
    });
  }

  // 📜 스크롤 패턴 극한 분석
  private trackEveryScroll() {
    let scrollData: ScrollPattern[] = [];
    let lastScrollY = 0;
    let pausePoints: number[] = [];
    let scrollStartTime = Date.now();

    document.addEventListener('scroll', (e) => {
      const currentScrollY = window.scrollY;
      const pageHeight = document.documentElement.scrollHeight;
      const scrollDepth = (currentScrollY / pageHeight) * 100;
      const scrollSpeed = Math.abs(currentScrollY - lastScrollY);

      // 스크롤 멈춤 지점 감지
      setTimeout(() => {
        if (window.scrollY === currentScrollY) {
          pausePoints.push(scrollDepth);
          this.analyzeContentInterest(scrollDepth);
        }
      }, 150);

      const scrollPattern: ScrollPattern = {
        pageHeight,
        scrollDepth,
        scrollSpeed,
        pausePoints,
        backtrackingCount: currentScrollY < lastScrollY ? 1 : 0,
        readingPattern: this.determineReadingPattern(scrollSpeed, pausePoints),
      };

      scrollData.push(scrollPattern);
      this.userProfile.scrollPatterns.push(scrollPattern);

      lastScrollY = currentScrollY;
    });
  }

  // 👁️ 주의집중 패턴 추적
  private trackAttentionPatterns() {
    let focusStartTime = Date.now();
    let tabSwitchCount = 0;
    let idleStartTime = 0;
    let isIdle = false;

    // 페이지 포커스/블러 추적
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.userProfile.attentionMetrics.blurTime +=
          Date.now() - focusStartTime;
        tabSwitchCount++;
      } else {
        focusStartTime = Date.now();
      }
    });

    // 유휴 시간 감지
    let idleTimer: NodeJS.Timeout;
    const resetIdleTimer = () => {
      if (isIdle) {
        this.userProfile.attentionMetrics.idleTime +=
          Date.now() - idleStartTime;
        isIdle = false;
      }

      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        idleStartTime = Date.now();
        isIdle = true;
        this.analyzeUserEngagement();
      }, 30000); // 30초 비활성화 시 유휴 상태로 간주
    };

    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(
      (event) => {
        document.addEventListener(event, resetIdleTimer, true);
      }
    );
  }

  // 🎯 사용자 의도 및 감정 상태 분석
  private analyzeUserEmotionalState(interactions: any[]) {
    const recentInteractions = interactions.slice(-10);
    let frustrationScore = 0;
    let engagementScore = 0;
    let confidenceScore = 0;

    recentInteractions.forEach((interaction) => {
      // 좌절감 지표
      if (interaction.type === 'rapid_clicking') frustrationScore += 2;
      if (interaction.type === 'back_button_multiple') frustrationScore += 3;
      if (interaction.type === 'error_encounter') frustrationScore += 4;
      if (interaction.type === 'form_field_multiple_attempts')
        frustrationScore += 2;

      // 참여도 지표
      if (interaction.type === 'deep_scroll') engagementScore += 2;
      if (interaction.type === 'feature_exploration') engagementScore += 3;
      if (interaction.type === 'content_interaction') engagementScore += 1;

      // 자신감 지표
      if (interaction.type === 'quick_navigation') confidenceScore += 2;
      if (interaction.type === 'direct_action') confidenceScore += 3;
      if (interaction.type === 'shortcut_usage') confidenceScore += 4;
    });

    // 감정 상태 전송
    InsuranceAgentEvents.emotionalStateAnalysis(
      frustrationScore,
      engagementScore,
      confidenceScore
    );
  }

  // 🧠 의사결정 패턴 분석
  private trackDecisionMakingPatterns() {
    let decisionPoints: any[] = [];

    // 고민하는 행동 패턴 감지
    const detectHesitation = (element: HTMLElement) => {
      let hoverCount = 0;
      let clickDelay = 0;
      const startTime = Date.now();

      element.addEventListener('mouseenter', () => {
        hoverCount++;
      });

      element.addEventListener('click', () => {
        clickDelay = Date.now() - startTime;

        const decisionPattern = {
          element: element.tagName.toLowerCase(),
          text: element.textContent?.substring(0, 50),
          hoverCount,
          clickDelay,
          hesitationLevel: this.calculateHesitationLevel(
            hoverCount,
            clickDelay
          ),
          timestamp: Date.now(),
        };

        decisionPoints.push(decisionPattern);
        this.analyzeDecisionConfidence(decisionPattern);
      });
    };

    // 모든 버튼과 링크에 의사결정 추적 적용
    document
      .querySelectorAll('button, a, [role="button"]')
      .forEach((element) => {
        detectHesitation(element as HTMLElement);
      });
  }

  // 📊 예측 행동 분석
  private trackPredictiveBehavior() {
    const behaviorHistory = this.loadBehaviorHistory();

    // 다음 행동 예측
    const predictNextAction = () => {
      const recentPatterns = this.userProfile.behaviorPatterns.slice(-20);
      const predictions = this.generateActionPredictions(recentPatterns);

      // 예측 결과를 통한 개인화
      this.applyPredictivePersonalization(predictions);

      return predictions;
    };

    // 5초마다 행동 예측 실행
    setInterval(predictNextAction, 5000);
  }

  // 💰 비즈니스 가치 실시간 계산
  private calculateUserBusinessValue(): number {
    const metrics = this.userProfile.engagementMetrics;
    const patterns = this.userProfile.behaviorPatterns;

    let businessValue = 0;

    // 참여도 기반 가치
    businessValue += metrics.sessionDepth * 10;
    businessValue += metrics.totalTimeSpent * 0.1;
    businessValue += metrics.interactionRate * 50;

    // 행동 패턴 기반 가치
    const highValueActions = patterns.filter((p) =>
      ['contract_create', 'client_add', 'pipeline_advance'].includes(p.action)
    );
    businessValue += highValueActions.length * 100;

    // 예측된 전환 확률
    const conversionProbability = this.calculateConversionProbability();
    businessValue *= conversionProbability;

    return Math.round(businessValue);
  }

  // 🎯 실시간 개인화 적용
  private applyPredictivePersonalization(predictions: any[]) {
    predictions.forEach((prediction) => {
      if (prediction.confidence > 0.7) {
        // 고확률 예측에 따른 UI 개인화
        this.customizeUserInterface(prediction);

        // 맞춤형 콘텐츠 제안
        this.suggestPersonalizedContent(prediction);

        // 최적 타이밍 알림 설정
        this.scheduleOptimalNotifications(prediction);
      }
    });
  }

  // 🔄 실시간 데이터 동기화
  private syncDataRealtime() {
    setInterval(() => {
      const currentProfile = {
        ...this.userProfile,
        businessValue: this.calculateUserBusinessValue(),
        lastSync: Date.now(),
      };

      // 외부 분석 서비스로 데이터 전송
      this.sendToAnalyticsServices(currentProfile);

      // 로컬 스토리지에 프로필 캐싱
      this.cacheUserProfile(currentProfile);
    }, 10000); // 10초마다 동기화
  }

  // 헬퍼 메서드들
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private collectDeviceFingerprint(): DeviceFingerprint {
    const nav = navigator as any;
    return {
      userAgent: nav.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: nav.language,
      platform: nav.platform,
      cookieEnabled: nav.cookieEnabled,
      doNotTrack: nav.doNotTrack === '1',
      touchSupport: 'ontouchstart' in window,
      canvasFingerprint: this.generateCanvasFingerprint(),
      webglFingerprint: this.generateWebGLFingerprint(),
      audioFingerprint: this.generateAudioFingerprint(),
      batteryLevel: nav.getBattery?.()?.level || undefined,
      connectionType: nav.connection?.effectiveType || 'unknown',
      hardwareConcurrency: nav.hardwareConcurrency,
      maxTouchPoints: nav.maxTouchPoints,
      devicePixelRatio: window.devicePixelRatio,
    };
  }

  private generateCanvasFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'unavailable';

    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('SureCRM Fingerprint 🔍', 2, 2);

    return canvas.toDataURL().slice(-50);
  }

  private generateWebGLFingerprint(): string {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (!gl) return 'unavailable';

    const renderer = gl.getParameter(gl.RENDERER);
    const vendor = gl.getParameter(gl.VENDOR);

    return `${vendor}_${renderer}`.slice(0, 50);
  }

  private generateAudioFingerprint(): string {
    // 오디오 컨텍스트 기반 핑거프린팅
    try {
      const audioCtx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const analyser = audioCtx.createAnalyser();

      oscillator.connect(analyser);
      oscillator.frequency.value = 1000;

      return `audio_${audioCtx.sampleRate}_${analyser.fftSize}`;
    } catch {
      return 'unavailable';
    }
  }

  // 더 많은 헬퍼 메서드들...
  private calculateVelocity(prev: any, curr: any): number {
    const distance = Math.sqrt(
      Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
    );
    const time = curr.timestamp - prev.timestamp;
    return time > 0 ? distance / time : 0;
  }

  private calculateAcceleration(mousePath: MouseTrackingData[]): number {
    if (mousePath.length < 2) return 0;
    const recent = mousePath.slice(-2);
    return Math.abs(recent[1].velocity - recent[0].velocity);
  }

  private analyzeMouseIntent(mousePath: MouseTrackingData[]) {
    // 마우스 움직임 패턴으로 사용자 의도 분석
    const recentMoves = mousePath.slice(-10);
    const hesitations = recentMoves.filter((m) => m.hesitation).length;
    const avgVelocity =
      recentMoves.reduce((sum, m) => sum + m.velocity, 0) / recentMoves.length;

    let intent = 'exploring';
    if (hesitations > 3) intent = 'uncertain';
    if (avgVelocity > 5) intent = 'goal_oriented';

    InsuranceAgentEvents.userIntentAnalysis(intent, hesitations, avgVelocity);
  }

  // 추가 분석 메서드들을 위한 스텁들...
  private analyzeClickPattern(e: MouseEvent, mousePath: MouseTrackingData[]) {
    /* 구현 */
  }
  private analyzeHoverPattern(e: MouseEvent) {
    /* 구현 */
  }
  private analyzeTypingStyle(pattern: number[]) {
    /* 구현 */
  }
  private determineReadingPattern(
    speed: number,
    pauses: number[]
  ): 'skimming' | 'reading' | 'scanning' {
    if (speed > 100) return 'skimming';
    if (pauses.length > 5) return 'reading';
    return 'scanning';
  }
  private analyzeContentInterest(depth: number) {
    /* 구현 */
  }
  private analyzeUserEngagement() {
    /* 구현 */
  }
  private calculateHesitationLevel(
    hoverCount: number,
    clickDelay: number
  ): number {
    return hoverCount * 0.3 + clickDelay * 0.001;
  }
  private analyzeDecisionConfidence(pattern: any) {
    /* 구현 */
  }
  private loadBehaviorHistory(): any[] {
    return [];
  }
  private generateActionPredictions(patterns: BehaviorPattern[]): any[] {
    return [];
  }
  private calculateConversionProbability(): number {
    return 0.5;
  }
  private customizeUserInterface(prediction: any) {
    /* 구현 */
  }
  private suggestPersonalizedContent(prediction: any) {
    /* 구현 */
  }
  private scheduleOptimalNotifications(prediction: any) {
    /* 구현 */
  }
  private sendToAnalyticsServices(profile: any) {
    /* 구현 */
  }
  private cacheUserProfile(profile: any) {
    try {
      localStorage.setItem(
        'user_surveillance_profile',
        JSON.stringify(profile)
      );
    } catch (e) {
      // 스토리지 제한 처리
    }
  }

  private initializePreferences(): UserPreferences {
    return {
      preferredFeatures: [],
      interactionSpeed: 'medium',
      clickPatterns: 'precise',
      navigationStyle: 'methodical',
      contentPreferences: [],
      timeSpentPerSection: {},
    };
  }

  private initializeEngagementMetrics(): EngagementMetrics {
    return {
      sessionDepth: 0,
      bounceRate: 0,
      returnVisitor: false,
      totalTimeSpent: 0,
      pageViews: 0,
      interactionRate: 0,
      frustractionIndicators: 0,
      satisfactionScore: 0,
    };
  }

  private initializeAttentionMetrics(): AttentionMetrics {
    return {
      focusTime: 0,
      blurTime: 0,
      tabSwitches: 0,
      idleTime: 0,
      activeTime: 0,
      deepWorkSessions: 0,
    };
  }
}

// 마우스 트래커 클래스
class MouseTracker {
  private heatmapData: { x: number; y: number; intensity: number }[] = [];

  startTracking() {
    // 마우스 히트맵 데이터 수집
    document.addEventListener('mousemove', (e) => {
      this.heatmapData.push({
        x: e.clientX,
        y: e.clientY,
        intensity: 1,
      });

      // 히트맵 데이터가 너무 많아지면 정리
      if (this.heatmapData.length > 5000) {
        this.heatmapData = this.heatmapData.slice(-2500);
      }
    });
  }

  getHeatmapData() {
    return this.heatmapData;
  }
}

// 스크롤 트래커 클래스
class ScrollTracker {
  private scrollSessions: any[] = [];

  startTracking() {
    let scrollStart = Date.now();
    let maxScrollDepth = 0;

    document.addEventListener('scroll', () => {
      const scrollDepth =
        (window.scrollY / document.documentElement.scrollHeight) * 100;
      maxScrollDepth = Math.max(maxScrollDepth, scrollDepth);

      // 스크롤 세션 데이터 수집
      this.scrollSessions.push({
        timestamp: Date.now(),
        depth: scrollDepth,
        direction: this.getScrollDirection(),
        speed: this.getScrollSpeed(),
      });
    });
  }

  private getScrollDirection(): 'up' | 'down' {
    // 스크롤 방향 감지 로직
    return 'down';
  }

  private getScrollSpeed(): number {
    // 스크롤 속도 계산 로직
    return 0;
  }
}

// 주의집중 트래커 클래스
class AttentionTracker {
  private focusSessions: any[] = [];

  startTracking() {
    let isVisible = true;
    let focusStartTime = Date.now();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && isVisible) {
        // 포커스 잃음
        this.focusSessions.push({
          startTime: focusStartTime,
          endTime: Date.now(),
          duration: Date.now() - focusStartTime,
          type: 'focused',
        });
        isVisible = false;
      } else if (!document.hidden && !isVisible) {
        // 포커스 회복
        focusStartTime = Date.now();
        isVisible = true;
      }
    });
  }
}

// 키보드 트래커 클래스
class KeyboardTracker {
  private typingPatterns: number[] = [];

  startTracking() {
    let lastKeyTime = 0;

    document.addEventListener('keydown', (e) => {
      const currentTime = Date.now();
      const interval = currentTime - lastKeyTime;

      this.typingPatterns.push(interval);

      // 타이핑 속도 분석
      if (this.typingPatterns.length > 50) {
        this.analyzeTypingSpeed();
        this.typingPatterns = this.typingPatterns.slice(-25);
      }

      lastKeyTime = currentTime;
    });
  }

  private analyzeTypingSpeed() {
    const avgInterval =
      this.typingPatterns.reduce((a, b) => a + b, 0) /
      this.typingPatterns.length;
    const wpm = Math.round(60000 / (avgInterval * 5)); // Words per minute estimation

    InsuranceAgentEvents.typingSpeedAnalysis(wpm, this.typingPatterns.length);
  }
}

// 성능 트래커 클래스
class PerformanceTracker {
  startTracking() {
    // 페이지 로드 성능 추적
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      InsuranceAgentEvents.pageLoadPerformance(
        perfData.loadEventEnd - perfData.loadEventStart,
        perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        perfData.responseEnd - perfData.requestStart
      );
    });

    // 리소스 로딩 성능 추적
    new PerformanceObserver((entries) => {
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
    }).observe({ entryTypes: ['resource'] });
  }
}

// 생체인식 트래커 클래스
class BiometricTracker {
  startTracking() {
    // 마우스 움직임의 생체인식적 특성 분석
    this.trackMouseBiometrics();

    // 타이핑 리듬의 생체인식적 특성 분석
    this.trackTypingBiometrics();
  }

  private trackMouseBiometrics() {
    let mouseMovements: any[] = [];

    document.addEventListener('mousemove', (e) => {
      mouseMovements.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now(),
        pressure: (e as any).pressure || 0,
      });

      if (mouseMovements.length > 100) {
        const biometricSignature = this.calculateMouseBiometric(mouseMovements);
        InsuranceAgentEvents.biometricSignature('mouse', biometricSignature);
        mouseMovements = mouseMovements.slice(-50);
      }
    });
  }

  private trackTypingBiometrics() {
    let keyPressTimings: number[] = [];

    document.addEventListener('keydown', () => {
      keyPressTimings.push(Date.now());

      if (keyPressTimings.length > 20) {
        const biometricSignature =
          this.calculateTypingBiometric(keyPressTimings);
        InsuranceAgentEvents.biometricSignature('keyboard', biometricSignature);
        keyPressTimings = keyPressTimings.slice(-10);
      }
    });
  }

  private calculateMouseBiometric(movements: any[]): string {
    // 마우스 움직임의 고유한 생체인식 패턴 계산
    const avgVelocity =
      movements.reduce((sum, move, i) => {
        if (i === 0) return 0;
        const prev = movements[i - 1];
        const distance = Math.sqrt(
          Math.pow(move.x - prev.x, 2) + Math.pow(move.y - prev.y, 2)
        );
        const time = move.timestamp - prev.timestamp;
        return sum + (time > 0 ? distance / time : 0);
      }, 0) / movements.length;

    return `mouse_${avgVelocity.toFixed(2)}`;
  }

  private calculateTypingBiometric(timings: number[]): string {
    // 타이핑 리듬의 고유한 생체인식 패턴 계산
    const intervals = timings.slice(1).map((time, i) => time - timings[i]);
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

    return `keyboard_${avgInterval.toFixed(2)}`;
  }
}

// 글로벌 감시 시스템 초기화
let surveillanceSystem: SurveillanceCapitalism | null = null;

export function initSurveillanceCapitalism() {
  if (typeof window !== 'undefined' && !surveillanceSystem) {
    surveillanceSystem = new SurveillanceCapitalism();
    console.log('🕵️‍♂️ Surveillance Capitalism system activated');
  }
}

export function getSurveillanceData() {
  return surveillanceSystem?.userProfile || null;
}

// 추가 분석 이벤트들을 analytics.ts에 추가하기 위한 export
export const SurveillanceEvents = {
  userIntentAnalysis: (
    intent: string,
    hesitations: number,
    velocity: number
  ) => {
    InsuranceAgentEvents.featureUsage('user_intent_analysis', intent, false);
  },

  emotionalStateAnalysis: (
    frustration: number,
    engagement: number,
    confidence: number
  ) => {
    InsuranceAgentEvents.featureUsage(
      'emotional_state',
      `f${frustration}_e${engagement}_c${confidence}`,
      false
    );
  },

  typingSpeedAnalysis: (wpm: number, keyCount: number) => {
    InsuranceAgentEvents.featureUsage('typing_speed', `${wpm}wpm`, false);
  },

  pageLoadPerformance: (
    loadTime: number,
    domTime: number,
    responseTime: number
  ) => {
    InsuranceAgentEvents.pageLoadTime('performance_analysis', loadTime);
  },

  resourceLoadPerformance: (
    resource: string,
    duration: number,
    size: number
  ) => {
    InsuranceAgentEvents.featureUsage('resource_load', resource, false);
  },

  biometricSignature: (type: string, signature: string) => {
    InsuranceAgentEvents.featureUsage(
      'biometric_analysis',
      `${type}_${signature}`,
      false
    );
  },
};
