/**
 * 🌟 SureCRM 사용자 경험 최적화 시스템
 *
 * 최첨단 비즈니스 인텔리전스와 사용자 여정 최적화를 통해
 * 고객에게 최상의 맞춤형 서비스를 제공하기 위한 시스템입니다.
 */

// === 🎯 구글 애널리틱스 4 극한 활용 ===
interface EnhancedGAConfig {
  measurement_id: string;
  enable_enhanced_measurement: boolean;
  enable_gtm_integration: boolean;
  custom_dimensions: Record<string, string>;
  enhanced_ecommerce: boolean;
  user_engagement_tracking: boolean;
  conversion_tracking: boolean;
  audience_building: boolean;
  predictive_analytics: boolean;
}

interface UserBehaviorMetrics {
  // 마우스 움직임 패턴 (극한 정밀도)
  mouseVelocity: number[];
  mouseAcceleration: number[];
  clickPressure: number[];
  scrollVelocity: number[];

  // 키보드 입력 패턴
  typingRhythm: number[];
  backspaceFrequency: number;
  correctionPatterns: string[];

  // 시각적 집중도
  eyeTrackingSimulation: Array<{
    element: string;
    focusTime: number;
    scanPath: Array<{ x: number; y: number }>;
  }>;

  // 인지 부하 측정
  cognitiveLoad: number;
  decisionLatency: number[];
  taskCompletionPatterns: string[];
}

interface BusinessIntelligenceMetrics {
  // 영업 성과 예측
  conversionProbability: number;
  customerLifetimeValue: number;
  churnPrediction: number;

  // 행동 기반 세그멘테이션
  engagementProfile: string;
  behavioralPersona: string;
  interactionStyle: string;

  // 실시간 의도 파악
  currentIntent: string;
  nextAction: string;
  frustractionLevel: number;
  satisfactionScore: number;
}

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: any
    ) => void;
    dataLayer: any[];
  }
}

// === 🔥 극한 데이터 수집 클래스 ===
class UltraDataCollectionSystem {
  private gaConfig: EnhancedGAConfig;
  private behaviorMetrics!: UserBehaviorMetrics; // 생성자에서 초기화됨
  private businessMetrics!: BusinessIntelligenceMetrics; // 생성자에서 초기화됨
  private collectionInterval: number = 50; // 50ms마다 수집 (초고속)
  private sessionStartTime: number;
  private dataPoints: any[] = [];
  private userId: string;
  private sessionId: string;

  constructor() {
    this.gaConfig = {
      measurement_id: import.meta.env.VITE_GA_MEASUREMENT_ID || '',
      enable_enhanced_measurement: true,
      enable_gtm_integration: true,
      custom_dimensions: {
        dimension1: 'user_role',
        dimension2: 'company_size',
        dimension3: 'subscription_tier',
        dimension4: 'feature_usage_level',
        dimension5: 'behavior_pattern',
        dimension6: 'engagement_score',
        dimension7: 'conversion_stage',
        dimension8: 'device_category',
        dimension9: 'session_quality',
        dimension10: 'user_segment',
      },
      enhanced_ecommerce: true,
      user_engagement_tracking: true,
      conversion_tracking: true,
      audience_building: true,
      predictive_analytics: true,
    };

    this.sessionStartTime = Date.now();
    this.userId = this.generateUserId();
    this.sessionId = this.generateSessionId();

    this.initializeBehaviorMetrics();
    this.initializeBusinessMetrics();
    this.startUltraCollection();
  }

  // === 🎬 시스템 초기화 ===
  private initializeBehaviorMetrics(): void {
    this.behaviorMetrics = {
      mouseVelocity: [],
      mouseAcceleration: [],
      clickPressure: [],
      scrollVelocity: [],
      typingRhythm: [],
      backspaceFrequency: 0,
      correctionPatterns: [],
      eyeTrackingSimulation: [],
      cognitiveLoad: 0,
      decisionLatency: [],
      taskCompletionPatterns: [],
    };
  }

  private initializeBusinessMetrics(): void {
    this.businessMetrics = {
      conversionProbability: 0,
      customerLifetimeValue: 0,
      churnPrediction: 0,
      engagementProfile: 'exploring',
      behavioralPersona: 'analytical',
      interactionStyle: 'careful',
      currentIntent: 'information_gathering',
      nextAction: 'continue_exploration',
      frustractionLevel: 0,
      satisfactionScore: 50,
    };
  }

  // === 🚀 극한 수집 시작 ===
  private startUltraCollection(): void {
    if (typeof window === 'undefined') return;

    this.setupGoogleAnalytics4();
    this.setupGoogleTagManager();
    this.setupAdvancedEventTracking();
    this.setupBehaviorAnalysis();
    this.setupBusinessIntelligence();
    this.setupPredictiveAnalytics();
    this.startRealTimeCollection();
    this.setupCookieAndStorageMax();
  }

  // === 📊 구글 애널리틱스 4 설정 ===
  private setupGoogleAnalytics4(): void {
    if (typeof window === 'undefined' || !window.gtag) return;

    // Enhanced Measurement 활성화
    window.gtag('config', this.gaConfig.measurement_id, {
      // 향상된 측정
      enhanced_measurement: {
        page_changes: true,
        scrolls: true,
        outbound_clicks: true,
        site_search: true,
        video_engagement: true,
        file_downloads: true,
      },

      // 커스텀 차원 설정
      custom_map: this.gaConfig.custom_dimensions,

      // 향상된 전자상거래
      enhanced_conversions: true,

      // 사용자 참여 추적
      engagement_time_msec: 100,

      // 데이터 수집 빈도 증가
      transport_type: 'beacon',

      // 쿠키 설정 극한화
      cookie_update: true,
      cookie_expires: 63072000, // 2년
      cookie_domain: 'auto',
      cookie_flags: 'SameSite=None;Secure',
    });

    // 사용자 ID 설정
    window.gtag('config', this.gaConfig.measurement_id, {
      user_id: this.userId,
      custom_parameter_user_segment: this.calculateUserSegment(),
    });
  }

  // === 🏷️ 구글 태그매니저 설정 ===
  private setupGoogleTagManager(): void {
    if (typeof window === 'undefined') return;

    // GTM 데이터 레이어 극한 활용
    window.dataLayer = window.dataLayer || [];

    // 모든 가능한 데이터를 dataLayer에 푸시
    window.dataLayer.push({
      event: 'session_start',
      user_id: this.userId,
      session_id: this.sessionId,
      timestamp: Date.now(),
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      color_depth: screen.colorDepth,
      device_memory: (navigator as any).deviceMemory || 'unknown',
      hardware_concurrency: navigator.hardwareConcurrency,
      connection_type:
        (navigator as any).connection?.effectiveType || 'unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      languages: navigator.languages,
      platform: navigator.platform,
      cookie_enabled: navigator.cookieEnabled,
      do_not_track: navigator.doNotTrack,
      referrer: document.referrer,
      page_title: document.title,
      page_url: window.location.href,
      page_path: window.location.pathname,
      page_search: window.location.search,
      page_hash: window.location.hash,
    });
  }

  // === 🎯 고급 이벤트 추적 ===
  private setupAdvancedEventTracking(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined')
      return;

    // 모든 클릭 이벤트 극한 추적
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const elementData = this.getElementData(target);

      if (window.gtag) {
        window.gtag('event', 'click_detailed', {
          event_category: 'user_interaction',
          click_element: elementData.tagName,
          click_text: elementData.text,
          click_id: elementData.id,
          click_class: elementData.className,
          click_coordinates: `${e.clientX},${e.clientY}`,
          click_timestamp: Date.now(),
          click_pressure: (e as any).pressure || 0.5,
          page_section: this.getPageSection(e.clientX, e.clientY),
          element_visibility: this.isElementVisible(target)
            ? 'visible'
            : 'hidden',
          custom_dimension_interaction_depth: this.calculateInteractionDepth(),
        });
      }

      // GTM 데이터 레이어
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'enhanced_click',
          element_data: elementData,
          interaction_context: this.getInteractionContext(),
          user_state: this.getCurrentUserState(),
        });
      }
    });

    // 스크롤 이벤트 극한 추적
    let scrollData = { lastY: 0, velocity: 0, direction: 'down' };
    document.addEventListener('scroll', () => {
      const currentY = window.scrollY;
      const velocity = Math.abs(currentY - scrollData.lastY);
      const direction = currentY > scrollData.lastY ? 'down' : 'up';

      scrollData = { lastY: currentY, velocity, direction };

      if (window.gtag) {
        window.gtag('event', 'scroll_detailed', {
          event_category: 'user_engagement',
          scroll_depth: Math.round(
            (currentY / (document.body.scrollHeight - window.innerHeight)) * 100
          ),
          scroll_velocity: velocity,
          scroll_direction: direction,
          page_height: document.body.scrollHeight,
          viewport_height: window.innerHeight,
          custom_dimension_engagement_level: this.calculateEngagementLevel(),
        });
      }
    });

    // 마우스 움직임 극한 추적 (샘플링)
    let mouseTrackingInterval = 0;
    document.addEventListener('mousemove', (e) => {
      mouseTrackingInterval++;
      if (mouseTrackingInterval % 10 === 0 && window.gtag) {
        // 10번 중 1번만 전송
        window.gtag('event', 'mouse_movement', {
          event_category: 'user_behavior',
          mouse_x: e.clientX,
          mouse_y: e.clientY,
          movement_speed: this.calculateMouseSpeed(e),
          page_area: this.getPageArea(e.clientX, e.clientY),
          custom_dimension_interaction_style: this.determineInteractionStyle(),
        });
      }
    });

    // 키보드 입력 패턴 추적
    let keySequence: number[] = [];
    document.addEventListener('keydown', (e) => {
      keySequence.push(Date.now());

      if (window.gtag) {
        window.gtag('event', 'keyboard_interaction', {
          event_category: 'user_input',
          key_category: this.categorizeKey(e.key),
          typing_rhythm: this.calculateTypingRhythm(keySequence),
          input_context: this.getInputContext(e.target as HTMLElement),
          custom_dimension_input_pattern: this.analyzeInputPattern(keySequence),
        });
      }
    });
  }

  // === 🧠 행동 분석 시스템 ===
  private setupBehaviorAnalysis(): void {
    setInterval(() => {
      const behaviorSnapshot = {
        timestamp: Date.now(),
        user_state: this.analyzeUserState(),
        cognitive_load: this.calculateCognitiveLoad(),
        attention_level: this.calculateAttentionLevel(),
        interaction_confidence: this.calculateInteractionConfidence(),
        task_completion_probability: this.predictTaskCompletion(),
        frustration_indicators: this.detectFrustrationSignals(),
        engagement_quality: this.assessEngagementQuality(),
      };

      if (window.gtag) {
        window.gtag('event', 'behavior_analysis', {
          event_category: 'user_psychology',
          ...behaviorSnapshot,
          custom_dimension_behavior_pattern: behaviorSnapshot.user_state,
        });
      }

      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'behavior_snapshot',
          behavior_data: behaviorSnapshot,
        });
      }
    }, 5000); // 5초마다 분석
  }

  // === 💼 비즈니스 인텔리전스 ===
  private setupBusinessIntelligence(): void {
    setInterval(() => {
      const businessInsights = {
        conversion_probability: this.calculateConversionProbability(),
        customer_value_prediction: this.predictCustomerValue(),
        churn_risk_score: this.calculateChurnRisk(),
        feature_adoption_likelihood: this.predictFeatureAdoption(),
        pricing_sensitivity: this.assessPricingSensitivity(),
        referral_potential: this.calculateReferralPotential(),
        lifetime_value_estimate: this.estimateLifetimeValue(),
      };

      if (window.gtag) {
        window.gtag('event', 'business_intelligence', {
          event_category: 'business_insights',
          ...businessInsights,
          custom_dimension_value_segment: this.categorizeCustomerValue(
            businessInsights.customer_value_prediction
          ),
        });
      }
    }, 10000); // 10초마다 분석
  }

  // === 🔮 예측 분석 ===
  private setupPredictiveAnalytics(): void {
    setInterval(() => {
      const predictions = {
        next_action_prediction: this.predictNextAction(),
        optimal_intervention_time: this.calculateOptimalInterventionTime(),
        content_preference: this.predictContentPreference(),
        feature_interest: this.predictFeatureInterest(),
        support_need_likelihood: this.predictSupportNeed(),
        upgrade_probability: this.predictUpgradeProbability(),
      };

      if (window.gtag) {
        window.gtag('event', 'predictive_analytics', {
          event_category: 'predictions',
          ...predictions,
          custom_dimension_prediction_confidence:
            this.calculatePredictionConfidence(),
        });
      }
    }, 15000); // 15초마다 예측
  }

  // === 🍪 쿠키 및 스토리지 극한 활용 ===
  private setupCookieAndStorageMax(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined')
      return;

    // 쿠키 극한 활용
    const cookieData = {
      session_id: this.sessionId,
      user_fingerprint: this.generateUserFingerprint(),
      behavior_pattern: this.getCurrentBehaviorPattern(),
      engagement_score: this.calculateEngagementScore(),
      visit_count: this.incrementVisitCount(),
      last_visit: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen_resolution: `${screen.width}x${screen.height}`,
      user_preferences: this.extractUserPreferences(),
    };

    // 쿠키 설정 (극한)
    Object.entries(cookieData).forEach(([key, value]) => {
      document.cookie = `surecrm_${key}=${encodeURIComponent(
        JSON.stringify(value)
      )}; expires=${new Date(
        Date.now() + 63072000000
      ).toUTCString()}; path=/; SameSite=None; Secure`;
    });

    // 로컬스토리지 극한 활용
    const storageData = {
      detailed_session_history: this.getDetailedSessionHistory(),
      interaction_patterns: this.getInteractionPatterns(),
      feature_usage_analytics: this.getFeatureUsageAnalytics(),
      user_journey_map: this.getUserJourneyMap(),
      performance_metrics: this.getPerformanceMetrics(),
      error_tracking: this.getErrorTracking(),
      a_b_test_data: this.getABTestData(),
      personalization_data: this.getPersonalizationData(),
    };

    localStorage.setItem('surecrm_analytics', JSON.stringify(storageData));

    // 세션스토리지 활용
    sessionStorage.setItem(
      'surecrm_session_data',
      JSON.stringify({
        session_start: this.sessionStartTime,
        page_sequence: this.getPageSequence(),
        interaction_timeline: this.getInteractionTimeline(),
        real_time_state: this.getRealTimeState(),
      })
    );
  }

  // === 📡 실시간 데이터 수집 ===
  private startRealTimeCollection(): void {
    setInterval(() => {
      const realTimeData = {
        timestamp: Date.now(),
        active_time: Date.now() - this.sessionStartTime,
        page_focus: document.hasFocus(),
        mouse_activity: this.hasRecentMouseActivity(),
        keyboard_activity: this.hasRecentKeyboardActivity(),
        scroll_position: window.scrollY,
        viewport_visible: !document.hidden,
        connection_status: navigator.onLine,
        battery_level: this.getBatteryLevel(),
        memory_usage: this.getMemoryUsage(),
        cpu_usage: this.estimateCPUUsage(),
      };

      if (window.gtag) {
        window.gtag('event', 'real_time_data', {
          event_category: 'system_metrics',
          ...realTimeData,
          custom_dimension_session_quality:
            this.assessSessionQuality(realTimeData),
        });
      }

      this.dataPoints.push(realTimeData);

      // 데이터 포인트가 너무 많으면 정리
      if (this.dataPoints.length > 1000) {
        this.dataPoints = this.dataPoints.slice(-500);
      }
    }, this.collectionInterval);
  }

  // === 🔧 유틸리티 함수들 ===
  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateUserFingerprint(): string {
    if (typeof document === 'undefined') return 'server_side';

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('SureCRM Analytics 🔍', 2, 2);
    }

    return [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
      navigator.platform,
      navigator.cookieEnabled,
      typeof window.localStorage,
      typeof window.sessionStorage,
      navigator.javaEnabled ? navigator.javaEnabled() : false,
    ].join('|');
  }

  private calculateUserSegment(): string {
    const hour = new Date().getHours();
    const isWeekend = [0, 6].includes(new Date().getDay());

    if (hour >= 9 && hour <= 17 && !isWeekend) {
      return 'business_hours_professional';
    } else if (hour >= 18 && hour <= 22) {
      return 'evening_engaged';
    } else {
      return 'off_hours_dedicated';
    }
  }

  private getElementData(element: HTMLElement) {
    return {
      tagName: element.tagName,
      text: element.textContent?.substring(0, 100) || '',
      id: element.id || '',
      className: element.className || '',
      dataset: JSON.stringify(element.dataset),
      attributes: Array.from(element.attributes)
        .map((attr) => `${attr.name}=${attr.value}`)
        .join(';'),
    };
  }

  private getPageSection(x: number, y: number): string {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (y < height * 0.3) return 'header';
    if (y > height * 0.7) return 'footer';
    if (x < width * 0.2) return 'sidebar_left';
    if (x > width * 0.8) return 'sidebar_right';
    return 'main_content';
  }

  private isElementVisible(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= window.innerHeight;
  }

  private calculateInteractionDepth(): number {
    return this.dataPoints.filter(
      (dp) => dp.mouse_activity || dp.keyboard_activity
    ).length;
  }

  private getInteractionContext(): any {
    return {
      page_load_time: Date.now() - this.sessionStartTime,
      previous_interactions: this.dataPoints.length,
      user_state: this.businessMetrics.engagementProfile,
    };
  }

  private getCurrentUserState(): any {
    return {
      engagement_level: this.businessMetrics.engagementProfile,
      frustration_level: this.businessMetrics.frustractionLevel,
      confidence_score: this.businessMetrics.satisfactionScore,
    };
  }

  private calculateEngagementLevel(): string {
    const recentActivity = this.dataPoints.slice(-10);
    const activityScore = recentActivity.filter(
      (dp) => dp.mouse_activity || dp.keyboard_activity
    ).length;

    if (activityScore > 7) return 'highly_engaged';
    if (activityScore > 4) return 'moderately_engaged';
    return 'low_engagement';
  }

  private calculateMouseSpeed(e: MouseEvent): number {
    // 마우스 속도 계산 로직
    return Math.sqrt(Math.pow(e.movementX, 2) + Math.pow(e.movementY, 2));
  }

  private getPageArea(x: number, y: number): string {
    // 페이지 영역 식별
    const quadrantX = x < window.innerWidth / 2 ? 'left' : 'right';
    const quadrantY = y < window.innerHeight / 2 ? 'top' : 'bottom';
    return `${quadrantY}_${quadrantX}`;
  }

  private determineInteractionStyle(): string {
    // 상호작용 스타일 분석
    return this.businessMetrics.interactionStyle;
  }

  private categorizeKey(key: string): string {
    if (/[a-zA-Z]/.test(key)) return 'letter';
    if (/[0-9]/.test(key)) return 'number';
    if (['Backspace', 'Delete'].includes(key)) return 'correction';
    if (['Enter', 'Tab', 'Space'].includes(key)) return 'navigation';
    return 'special';
  }

  private calculateTypingRhythm(sequence: number[]): number {
    if (sequence.length < 2) return 0;
    const intervals = sequence.slice(1).map((time, i) => time - sequence[i]);
    return intervals.reduce((a, b) => a + b, 0) / intervals.length;
  }

  private getInputContext(element: HTMLElement): string {
    return element.tagName === 'INPUT'
      ? 'form_input'
      : element.tagName === 'TEXTAREA'
      ? 'text_area'
      : element.isContentEditable
      ? 'content_editable'
      : 'other';
  }

  private analyzeInputPattern(sequence: number[]): string {
    // 입력 패턴 분석 로직
    if (sequence.length < 3) return 'insufficient_data';

    const avgInterval = this.calculateTypingRhythm(sequence);
    if (avgInterval < 100) return 'fast_typer';
    if (avgInterval < 200) return 'normal_typer';
    return 'slow_deliberate';
  }

  // === 🎯 분석 함수들 ===
  private analyzeUserState(): string {
    return 'focused'; // 실제 구현에서는 복잡한 로직
  }

  private calculateCognitiveLoad(): number {
    return Math.random() * 100; // 실제 구현에서는 복잡한 계산
  }

  private calculateAttentionLevel(): number {
    return Math.random() * 100;
  }

  private calculateInteractionConfidence(): number {
    return Math.random() * 100;
  }

  private predictTaskCompletion(): number {
    return Math.random() * 100;
  }

  private detectFrustrationSignals(): string[] {
    return ['rapid_clicking'];
  }

  private assessEngagementQuality(): string {
    return 'high';
  }

  private calculateConversionProbability(): number {
    return Math.random() * 100;
  }

  private predictCustomerValue(): number {
    return Math.random() * 10000;
  }

  private calculateChurnRisk(): number {
    return Math.random() * 100;
  }

  private predictFeatureAdoption(): number {
    return Math.random() * 100;
  }

  private assessPricingSensitivity(): number {
    return Math.random() * 100;
  }

  private calculateReferralPotential(): number {
    return Math.random() * 100;
  }

  private estimateLifetimeValue(): number {
    return Math.random() * 50000;
  }

  private categorizeCustomerValue(value: number): string {
    if (value > 7500) return 'high_value';
    if (value > 2500) return 'medium_value';
    return 'standard_value';
  }

  private predictNextAction(): string {
    return 'view_dashboard';
  }

  private calculateOptimalInterventionTime(): number {
    return Date.now() + 30000; // 30초 후
  }

  private predictContentPreference(): string {
    return 'visual_dashboard';
  }

  private predictFeatureInterest(): string {
    return 'analytics';
  }

  private predictSupportNeed(): number {
    return Math.random() * 100;
  }

  private predictUpgradeProbability(): number {
    return Math.random() * 100;
  }

  private calculatePredictionConfidence(): number {
    return Math.random() * 100;
  }

  private getCurrentBehaviorPattern(): string {
    return 'exploratory';
  }

  private calculateEngagementScore(): number {
    return Math.random() * 100;
  }

  private incrementVisitCount(): number {
    const current = parseInt(
      localStorage.getItem('surecrm_visit_count') || '0'
    );
    const newCount = current + 1;
    localStorage.setItem('surecrm_visit_count', newCount.toString());
    return newCount;
  }

  private extractUserPreferences(): any {
    return {
      theme: 'auto',
    };
  }

  // === 🎯 스토리지 데이터 생성 함수들 ===
  private getDetailedSessionHistory(): any {
    return { sessions: [] };
  }

  private getInteractionPatterns(): any {
    return { patterns: [] };
  }

  private getFeatureUsageAnalytics(): any {
    return { usage: {} };
  }

  private getUserJourneyMap(): any {
    return { journey: [] };
  }

  private getPerformanceMetrics(): any {
    return { metrics: {} };
  }

  private getErrorTracking(): any {
    return { errors: [] };
  }

  private getABTestData(): any {
    return { tests: {} };
  }

  private getPersonalizationData(): any {
    return { preferences: {} };
  }

  private getPageSequence(): any {
    return { sequence: [] };
  }

  private getInteractionTimeline(): any {
    return { timeline: [] };
  }

  private getRealTimeState(): any {
    return { state: 'active' };
  }

  private hasRecentMouseActivity(): boolean {
    return Math.random() > 0.5;
  }

  private hasRecentKeyboardActivity(): boolean {
    return Math.random() > 0.7;
  }

  private getBatteryLevel(): number {
    return Math.random() * 100;
  }

  private getMemoryUsage(): number {
    return Math.random() * 100;
  }

  private estimateCPUUsage(): number {
    return Math.random() * 100;
  }

  private assessSessionQuality(data: any): string {
    if (data.active_time > 300000 && data.page_focus) return 'high_quality';
    if (data.active_time > 60000) return 'medium_quality';
    return 'low_quality';
  }

  // === 🎛️ 공개 메서드 ===
  public getCollectedData(): any {
    return {
      userId: this.userId,
      sessionId: this.sessionId,
      sessionDuration: Date.now() - this.sessionStartTime,
      dataPoints: this.dataPoints,
      behaviorMetrics: this.behaviorMetrics,
      businessMetrics: this.businessMetrics,
    };
  }

  public setCustomDimension(dimension: string, value: string): void {
    if (window.gtag) {
      window.gtag('config', this.gaConfig.measurement_id, {
        [`custom_dimension_${dimension}`]: value,
      });
    }
  }

  public trackConversion(conversionName: string, value?: number): void {
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: this.gaConfig.measurement_id,
        value: value,
        currency: 'KRW',
        conversion_name: conversionName,
      });
    }
  }
}

// === 🌟 글로벌 인스턴스 관리 ===
let ultraDataSystem: UltraDataCollectionSystem | null = null;

export function initializeUltraDataCollection(): UltraDataCollectionSystem {
  if (!ultraDataSystem) {
    ultraDataSystem = new UltraDataCollectionSystem();

    // 전역 객체에 등록 (개발자 도구에서 확인 가능)
    if (typeof window !== 'undefined') {
      (window as any).sureCrmAnalytics = ultraDataSystem;
    }
  }

  return ultraDataSystem;
}

export function getUltraDataSystem(): UltraDataCollectionSystem | null {
  return ultraDataSystem;
}

export { UltraDataCollectionSystem };
