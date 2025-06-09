/**
 * 🚀 SureCRM 고도화된 구글 태그매니저 시스템
 *
 * 사용자 경험 최적화를 위한 극한의 데이터 수집 및 분석 시스템
 */

// === 🏷️ GTM 이벤트 타입 정의 ===
interface GTMEvent {
  event: string;
  eventCategory?: string;
  eventAction?: string;
  eventLabel?: string;
  eventValue?: number;
  customParameters?: Record<string, any>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

interface GTMDataLayer {
  [key: string]: any;
  event?: string;
  gtm?: {
    uniqueEventId?: number;
    start?: number;
  };
}

interface UserJourneyStep {
  step: number;
  action: string;
  timestamp: number;
  duration?: number;
  context: Record<string, any>;
}

interface BehaviorProfile {
  interactionStyle: 'careful' | 'confident' | 'explorative' | 'goal_oriented';
  engagementLevel: 'low' | 'medium' | 'high' | 'exceptional';
  decisionMakingSpeed: 'deliberate' | 'moderate' | 'quick' | 'impulsive';
  frustrationLevel: number; // 0-100
  satisfactionScore: number; // 0-100
  learningPattern: 'visual' | 'interactive' | 'sequential' | 'experimental';
}

// === 🎯 고도화된 GTM 관리 클래스 ===
class EnhancedGTMSystem {
  private containerId: string;
  private dataLayer: GTMDataLayer[];
  private userJourney: UserJourneyStep[];
  private behaviorProfile: BehaviorProfile;
  private sessionStartTime: number;
  private eventQueue: GTMEvent[];
  private isInitialized: boolean = false;
  private customVariables: Map<string, any> = new Map();

  constructor(containerId: string = '') {
    this.containerId =
      containerId || import.meta.env.VITE_GTM_CONTAINER_ID || '';
    this.dataLayer = [];
    this.userJourney = [];
    this.eventQueue = [];
    this.sessionStartTime = Date.now();

    this.behaviorProfile = {
      interactionStyle: 'careful',
      engagementLevel: 'medium',
      decisionMakingSpeed: 'moderate',
      frustrationLevel: 0,
      satisfactionScore: 75,
      learningPattern: 'interactive',
    };

    this.initializeGTM();
  }

  // === 🚀 GTM 초기화 ===
  private initializeGTM(): void {
    if (typeof window === 'undefined') return;

    // DataLayer 초기화
    window.dataLayer = window.dataLayer || [];
    this.dataLayer = window.dataLayer;

    // GTM 스크립트 동적 로딩
    if (this.containerId && !document.getElementById('gtm-script')) {
      this.loadGTMScript();
    }

    // 초기 사용자 데이터 설정
    this.pushInitialData();

    // 고급 이벤트 리스너 설정
    this.setupAdvancedEventListeners();

    // 실시간 데이터 업데이트 시작
    this.startRealTimeUpdates();

    this.isInitialized = true;
  }

  // === 📜 GTM 스크립트 로딩 ===
  private loadGTMScript(): void {
    // GTM 스크립트 태그 생성
    const script = document.createElement('script');
    script.id = 'gtm-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${this.containerId}`;

    // GTM 초기화 함수
    const gtmInit = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${this.containerId}');
    `;

    const inlineScript = document.createElement('script');
    inlineScript.innerHTML = gtmInit;

    document.head.appendChild(inlineScript);
    document.head.appendChild(script);

    // noscript 태그도 추가 (완전성을 위해)
    const noscript = document.createElement('noscript');
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${this.containerId}`;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    noscript.appendChild(iframe);
    document.body.appendChild(noscript);
  }

  // === 📊 초기 데이터 설정 ===
  private pushInitialData(): void {
    const initialData = {
      // 기본 정보
      page_title: document.title,
      page_url: window.location.href,
      page_path: window.location.pathname,
      page_search: window.location.search,
      page_hash: window.location.hash,
      referrer: document.referrer,

      // 기술 정보
      user_agent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      color_depth: screen.colorDepth,
      pixel_ratio: window.devicePixelRatio,

      // 연결 정보
      connection_type:
        (navigator as any).connection?.effectiveType || 'unknown',
      connection_speed: (navigator as any).connection?.downlink || 'unknown',
      online_status: navigator.onLine,

      // 하드웨어 정보
      device_memory: (navigator as any).deviceMemory || 'unknown',
      hardware_concurrency: navigator.hardwareConcurrency,
      max_touch_points: navigator.maxTouchPoints,

      // 브라우저 기능
      cookies_enabled: navigator.cookieEnabled,
      do_not_track: navigator.doNotTrack,
      java_enabled: navigator.javaEnabled?.() || false,
      local_storage_available: typeof Storage !== 'undefined',
      session_storage_available: typeof sessionStorage !== 'undefined',

      // 세션 정보
      session_start_time: this.sessionStartTime,
      session_id: this.generateSessionId(),
      user_id: this.generateUserId(),
      visit_count: this.getVisitCount(),
      is_new_visitor: this.isNewVisitor(),
      is_returning_visitor: !this.isNewVisitor(),

      // 시간 정보
      local_time: new Date().toISOString(),
      day_of_week: new Date().getDay(),
      hour_of_day: new Date().getHours(),
      is_weekend: [0, 6].includes(new Date().getDay()),
      is_business_hours: this.isBusinessHours(),

      // 초기 행동 프로필
      behavior_profile: this.behaviorProfile,
      user_segment: this.calculateUserSegment(),
      traffic_source: this.identifyTrafficSource(),
      campaign_data: this.extractCampaignData(),
    };

    this.pushToDataLayer({
      event: 'surecrm_session_start',
      ...initialData,
    });
  }

  // === 🎧 고급 이벤트 리스너 ===
  private setupAdvancedEventListeners(): void {
    // 페이지 가시성 변경
    document.addEventListener('visibilitychange', () => {
      this.pushToDataLayer({
        event: 'page_visibility_change',
        visibility_state: document.visibilityState,
        hidden: document.hidden,
        timestamp: Date.now(),
      });
    });

    // 윈도우 포커스/블러
    window.addEventListener('focus', () => {
      this.pushToDataLayer({
        event: 'window_focus',
        timestamp: Date.now(),
        session_duration: Date.now() - this.sessionStartTime,
      });
    });

    window.addEventListener('blur', () => {
      this.pushToDataLayer({
        event: 'window_blur',
        timestamp: Date.now(),
        session_duration: Date.now() - this.sessionStartTime,
      });
    });

    // 온라인/오프라인 상태
    window.addEventListener('online', () => {
      this.pushToDataLayer({
        event: 'connection_online',
        timestamp: Date.now(),
      });
    });

    window.addEventListener('offline', () => {
      this.pushToDataLayer({
        event: 'connection_offline',
        timestamp: Date.now(),
      });
    });

    // 윈도우 크기 변경
    const resizeHandler = this.debounce(() => {
      this.pushToDataLayer({
        event: 'window_resize',
        new_viewport_size: `${window.innerWidth}x${window.innerHeight}`,
        timestamp: Date.now(),
      });
    }, 300);
    window.addEventListener('resize', resizeHandler as EventListener);

    // 페이지 언로드 전
    window.addEventListener('beforeunload', () => {
      this.pushToDataLayer({
        event: 'page_unload',
        session_duration: Date.now() - this.sessionStartTime,
        user_journey_steps: this.userJourney.length,
        final_behavior_profile: this.behaviorProfile,
        timestamp: Date.now(),
      });
    });

    // 에러 추적
    window.addEventListener('error', (e) => {
      this.pushToDataLayer({
        event: 'javascript_error',
        error_message: e.message,
        error_filename: e.filename,
        error_line: e.lineno,
        error_column: e.colno,
        error_stack: e.error?.stack,
        timestamp: Date.now(),
      });
    });

    // Promise 에러 추적
    window.addEventListener('unhandledrejection', (e) => {
      this.pushToDataLayer({
        event: 'promise_rejection',
        rejection_reason: e.reason,
        timestamp: Date.now(),
      });
    });

    // 복사/붙여넣기 추적
    document.addEventListener('copy', () => {
      this.pushToDataLayer({
        event: 'content_copy',
        timestamp: Date.now(),
      });
    });

    document.addEventListener('paste', () => {
      this.pushToDataLayer({
        event: 'content_paste',
        timestamp: Date.now(),
      });
    });

    // 인쇄 추적
    window.addEventListener('beforeprint', () => {
      this.pushToDataLayer({
        event: 'page_print_start',
        timestamp: Date.now(),
      });
    });

    window.addEventListener('afterprint', () => {
      this.pushToDataLayer({
        event: 'page_print_end',
        timestamp: Date.now(),
      });
    });
  }

  // === ⏰ 실시간 업데이트 ===
  private startRealTimeUpdates(): void {
    // 1초마다 기본 메트릭 업데이트
    setInterval(() => {
      this.updateBehaviorProfile();
      this.pushToDataLayer({
        event: 'real_time_metrics',
        session_duration: Date.now() - this.sessionStartTime,
        behavior_profile: this.behaviorProfile,
        scroll_position: window.scrollY,
        page_focus: document.hasFocus(),
        timestamp: Date.now(),
      });
    }, 1000);

    // 5초마다 상세 분석
    setInterval(() => {
      this.analyzeUserBehavior();
      this.updateUserSegment();
    }, 5000);

    // 10초마다 사용자 여정 업데이트
    setInterval(() => {
      this.updateUserJourney();
      this.pushToDataLayer({
        event: 'user_journey_update',
        journey_steps: this.userJourney,
        current_step: this.userJourney.length,
        journey_duration: Date.now() - this.sessionStartTime,
        timestamp: Date.now(),
      });
    }, 10000);
  }

  // === 📈 행동 분석 ===
  private updateBehaviorProfile(): void {
    // 마우스 활동 기반 참여도 계산
    const mouseActivity = this.calculateMouseActivity();
    const scrollActivity = this.calculateScrollActivity();
    const keyboardActivity = this.calculateKeyboardActivity();

    // 참여도 레벨 업데이트
    const totalActivity = mouseActivity + scrollActivity + keyboardActivity;
    if (totalActivity > 0.8) {
      this.behaviorProfile.engagementLevel = 'exceptional';
    } else if (totalActivity > 0.6) {
      this.behaviorProfile.engagementLevel = 'high';
    } else if (totalActivity > 0.3) {
      this.behaviorProfile.engagementLevel = 'medium';
    } else {
      this.behaviorProfile.engagementLevel = 'low';
    }

    // 좌절 수준 계산
    this.behaviorProfile.frustrationLevel = this.calculateFrustrationLevel();

    // 만족도 점수 계산
    this.behaviorProfile.satisfactionScore = this.calculateSatisfactionScore();
  }

  private analyzeUserBehavior(): void {
    const behaviorAnalysis = {
      mouse_movement_pattern: this.analyzeMouseMovement(),
      click_pattern: this.analyzeClickPattern(),
      scroll_behavior: this.analyzeScrollBehavior(),
      keyboard_rhythm: this.analyzeKeyboardRhythm(),
      attention_span: this.calculateAttentionSpan(),
      task_completion_rate: this.calculateTaskCompletionRate(),
      error_recovery_ability: this.calculateErrorRecovery(),
      learning_curve: this.assessLearningCurve(),
      feature_exploration: this.trackFeatureExploration(),
      decision_making_speed: this.measureDecisionSpeed(),
    };

    this.pushToDataLayer({
      event: 'behavior_analysis',
      analysis: behaviorAnalysis,
      timestamp: Date.now(),
    });
  }

  private updateUserSegment(): void {
    const segment = this.calculateAdvancedUserSegment();
    this.setCustomVariable('user_segment', segment);

    this.pushToDataLayer({
      event: 'user_segment_update',
      new_segment: segment,
      segment_factors: this.getSegmentFactors(),
      timestamp: Date.now(),
    });
  }

  private updateUserJourney(): void {
    const currentStep: UserJourneyStep = {
      step: this.userJourney.length + 1,
      action: this.getCurrentAction(),
      timestamp: Date.now(),
      duration: this.getStepDuration(),
      context: this.getCurrentContext(),
    };

    this.userJourney.push(currentStep);

    // 여정이 너무 길어지면 정리
    if (this.userJourney.length > 100) {
      this.userJourney = this.userJourney.slice(-50);
    }
  }

  // === 🎯 공개 메서드 ===
  public pushToDataLayer(data: GTMDataLayer): void {
    if (typeof window === 'undefined') return;

    const enrichedData = {
      ...data,
      timestamp: data.timestamp || Date.now(),
      session_id: this.generateSessionId(),
      user_id: this.generateUserId(),
      gtm_container_id: this.containerId,
    };

    window.dataLayer.push(enrichedData);
    this.dataLayer.push(enrichedData);
  }

  public trackEvent(event: GTMEvent): void {
    this.pushToDataLayer({
      event: event.event,
      event_category: event.eventCategory,
      event_action: event.eventAction,
      event_label: event.eventLabel,
      event_value: event.eventValue,
      ...event.customParameters,
      timestamp: Date.now(),
    });
  }

  public setCustomVariable(name: string, value: any): void {
    this.customVariables.set(name, value);
    this.pushToDataLayer({
      [`custom_${name}`]: value,
      timestamp: Date.now(),
    });
  }

  public getCustomVariable(name: string): any {
    return this.customVariables.get(name);
  }

  public trackConversion(
    conversionName: string,
    value?: number,
    currency: string = 'KRW'
  ): void {
    this.pushToDataLayer({
      event: 'conversion',
      conversion_name: conversionName,
      conversion_value: value,
      conversion_currency: currency,
      timestamp: Date.now(),
    });
  }

  public trackEcommerce(
    action: string,
    items: any[],
    transactionId?: string
  ): void {
    this.pushToDataLayer({
      event: 'ecommerce_action',
      ecommerce: {
        [action]: {
          transaction_id: transactionId,
          items: items,
        },
      },
      timestamp: Date.now(),
    });
  }

  public getUserJourney(): UserJourneyStep[] {
    return [...this.userJourney];
  }

  public getBehaviorProfile(): BehaviorProfile {
    return { ...this.behaviorProfile };
  }

  public getDataLayer(): GTMDataLayer[] {
    return [...this.dataLayer];
  }

  public isReady(): boolean {
    return (
      this.isInitialized && typeof window !== 'undefined' && !!window.dataLayer
    );
  }

  // === 🔧 유틸리티 함수들 ===
  private generateSessionId(): string {
    return `gtm_session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }

  private generateUserId(): string {
    let userId = localStorage.getItem('surecrm_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('surecrm_user_id', userId);
    }
    return userId;
  }

  private getVisitCount(): number {
    const count =
      parseInt(localStorage.getItem('surecrm_visit_count') || '0') + 1;
    localStorage.setItem('surecrm_visit_count', count.toString());
    return count;
  }

  private isNewVisitor(): boolean {
    return !localStorage.getItem('surecrm_user_id');
  }

  private isBusinessHours(): boolean {
    const hour = new Date().getHours();
    const day = new Date().getDay();
    return hour >= 9 && hour <= 17 && day >= 1 && day <= 5;
  }

  private calculateUserSegment(): string {
    if (this.isNewVisitor()) return 'new_visitor';
    if (this.getVisitCount() > 10) return 'loyal_user';
    if (this.getVisitCount() > 3) return 'engaged_user';
    return 'casual_user';
  }

  private identifyTrafficSource(): string {
    const referrer = document.referrer;
    if (!referrer) return 'direct';
    if (referrer.includes('google')) return 'google';
    if (referrer.includes('facebook')) return 'facebook';
    if (referrer.includes('linkedin')) return 'linkedin';
    return 'other';
  }

  private extractCampaignData(): any {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      utm_term: params.get('utm_term'),
      utm_content: params.get('utm_content'),
    };
  }

  private calculateMouseActivity(): number {
    return Math.random(); // 실제 구현에서는 마우스 이벤트 데이터 사용
  }

  private calculateScrollActivity(): number {
    return Math.random(); // 실제 구현에서는 스크롤 데이터 사용
  }

  private calculateKeyboardActivity(): number {
    return Math.random(); // 실제 구현에서는 키보드 이벤트 데이터 사용
  }

  private calculateFrustrationLevel(): number {
    return Math.random() * 100; // 실제 구현에서는 복잡한 계산
  }

  private calculateSatisfactionScore(): number {
    return 50 + Math.random() * 50; // 실제 구현에서는 복잡한 계산
  }

  private analyzeMouseMovement(): string {
    return 'smooth'; // 실제 구현에서는 마우스 패턴 분석
  }

  private analyzeClickPattern(): string {
    return 'deliberate'; // 실제 구현에서는 클릭 패턴 분석
  }

  private analyzeScrollBehavior(): string {
    return 'exploratory'; // 실제 구현에서는 스크롤 패턴 분석
  }

  private analyzeKeyboardRhythm(): string {
    return 'steady'; // 실제 구현에서는 타이핑 리듬 분석
  }

  private calculateAttentionSpan(): number {
    return Math.random() * 300; // 초 단위
  }

  private calculateTaskCompletionRate(): number {
    return Math.random() * 100;
  }

  private calculateErrorRecovery(): number {
    return Math.random() * 100;
  }

  private assessLearningCurve(): string {
    return 'progressive';
  }

  private trackFeatureExploration(): number {
    return Math.random() * 100;
  }

  private measureDecisionSpeed(): number {
    return Math.random() * 10; // 초 단위
  }

  private calculateAdvancedUserSegment(): string {
    const factors = this.getSegmentFactors();
    if (factors.engagement > 0.8 && factors.activity > 0.7) return 'power_user';
    if (factors.engagement > 0.6 && factors.retention > 0.5)
      return 'engaged_user';
    if (factors.activity > 0.4) return 'active_user';
    return 'casual_user';
  }

  private getSegmentFactors(): any {
    return {
      engagement: Math.random(),
      activity: Math.random(),
      retention: Math.random(),
      conversion: Math.random(),
    };
  }

  private getCurrentAction(): string {
    return 'page_interaction'; // 실제 구현에서는 현재 액션 파악
  }

  private getStepDuration(): number {
    return Math.random() * 30000; // 밀리초 단위
  }

  private getCurrentContext(): Record<string, any> {
    return {
      page: window.location.pathname,
      section: 'main',
      feature: 'dashboard',
    };
  }

  private debounce(func: Function, wait: number): Function {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// === 🌟 글로벌 인스턴스 관리 ===
let gtmSystem: EnhancedGTMSystem | null = null;

export function initializeEnhancedGTM(containerId?: string): EnhancedGTMSystem {
  if (!gtmSystem) {
    gtmSystem = new EnhancedGTMSystem(containerId);

    // 전역 객체에 등록
    if (typeof window !== 'undefined') {
      (window as any).sureCrmGTM = gtmSystem;
    }
  }

  return gtmSystem;
}

export function getGTMSystem(): EnhancedGTMSystem | null {
  return gtmSystem;
}

export { EnhancedGTMSystem };

// === 📊 SureCRM 전용 GTM 이벤트 헬퍼 ===
export const SureCRMGTMEvents = {
  // 사용자 인증
  userLogin: (userId: string, method: string) => {
    gtmSystem?.trackEvent({
      event: 'user_login',
      eventCategory: 'authentication',
      eventAction: 'login',
      eventLabel: method,
      customParameters: { user_id: userId, login_method: method },
    });
  },

  // 대시보드 조회
  dashboardView: (kpis: any) => {
    gtmSystem?.trackEvent({
      event: 'dashboard_view',
      eventCategory: 'dashboard',
      eventAction: 'view',
      customParameters: { kpi_data: kpis },
    });
  },

  // 고객 관리
  clientAction: (action: string, clientData: any) => {
    gtmSystem?.trackEvent({
      event: 'client_action',
      eventCategory: 'client_management',
      eventAction: action,
      customParameters: { client_data: clientData },
    });
  },

  // 영업 파이프라인
  pipelineAction: (action: string, stageData: any) => {
    gtmSystem?.trackEvent({
      event: 'pipeline_action',
      eventCategory: 'sales_pipeline',
      eventAction: action,
      customParameters: { stage_data: stageData },
    });
  },

  // 목표 설정
  goalAction: (action: string, goalData: any) => {
    gtmSystem?.trackEvent({
      event: 'goal_action',
      eventCategory: 'goal_management',
      eventAction: action,
      customParameters: { goal_data: goalData },
    });
  },
};
