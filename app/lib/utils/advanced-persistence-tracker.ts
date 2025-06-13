/**
 * 🍪 SureCRM 고급 데이터 지속성 시스템
 *
 * 사용자 경험 개선을 위한 다층 데이터 보관 및 분석 시스템
 */

interface UserFingerprint {
  deviceId: string;
  browserFingerprint: string;
  screenFingerprint: string;
  timezoneFingerprint: string;
  languageFingerprint: string;
  pluginFingerprint: string;
  canvasFingerprint?: string;
  audioFingerprint?: string;
  fontFingerprint?: string;
}

interface PersistentTrackingData {
  userId?: string;
  sessionIds: string[];
  visitHistory: Array<{
    timestamp: number;
    page: string;
    duration: number;
    actions: number;
  }>;
  deviceFingerprint: UserFingerprint;
  behaviorProfile: {
    clickPatterns: Array<{ x: number; y: number; timestamp: number }>;
    scrollPatterns: Array<{
      position: number;
      speed: number;
      timestamp: number;
    }>;
    keyboardPatterns: Array<{
      key: string;
      interval: number;
      timestamp: number;
    }>;
    navigationPatterns: Array<{
      from: string;
      to: string;
      method: string;
      timestamp: number;
    }>;
    attentionPatterns: Array<{
      focused: boolean;
      duration: number;
      timestamp: number;
    }>;
  };
  preferences: {
    colorScheme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    notifications: boolean;
  };
  performanceMetrics: {
    pageLoadTimes: number[];
    interactionResponseTimes: number[];
    networkQuality: Array<{
      timestamp: number;
      quality: 'fast' | 'slow' | 'offline';
    }>;
  };
  businessIntelligence: {
    featureUsage: Record<string, number>;
    workflowCompletions: Array<{
      workflow: string;
      completionTime: number;
      timestamp: number;
    }>;
    errorEncounters: Array<{
      error: string;
      context: string;
      timestamp: number;
    }>;
    supportInteractions: Array<{
      type: string;
      outcome: string;
      timestamp: number;
    }>;
  };
}

class AdvancedPersistenceTracker {
  private readonly COOKIE_PREFIX = 'surecrm_analytics_';
  private readonly STORAGE_PREFIX = 'surecrm_intelligence_';
  private readonly FINGERPRINT_KEY = 'device_intelligence_profile';
  private readonly TRACKING_DATA_KEY = 'user_experience_data';

  private trackingData: PersistentTrackingData;
  private deviceFingerprint: UserFingerprint;
  private isInitialized = false;

  constructor() {
    this.trackingData = this.getDefaultTrackingData();
    this.deviceFingerprint = this.getDefaultFingerprint();
  }

  // === 🚀 시스템 초기화 ===
  public async initialize(): Promise<void> {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      // 1. 디바이스 지문 생성
      this.deviceFingerprint = await this.generateDeviceFingerprint();

      // 2. 기존 데이터 복원
      await this.restoreTrackingData();

      // 3. 세션 시작
      this.startNewSession();

      // 4. 실시간 추적 시작
      this.setupRealTimeTracking();

      // 5. 주기적 저장 설정
      this.setupPeriodicSave();

      this.isInitialized = true;

      // 초기화 완료 이벤트
      this.sendEvent('persistence_system_initialized', {
        device_fingerprint_created: true,
        data_restored: true,
        session_count: this.trackingData.sessionIds.length,
      });
    } catch (error) {
      console.warn('사용자 경험 최적화 시스템 일부 기능 제한:', error);
    }
  }

  // === 🔍 디바이스 지문 생성 ===
  private async generateDeviceFingerprint(): Promise<UserFingerprint> {
    const fingerprint: UserFingerprint = {
      deviceId: this.generateDeviceId(),
      browserFingerprint: this.getBrowserFingerprint(),
      screenFingerprint: this.getScreenFingerprint(),
      timezoneFingerprint: this.getTimezoneFingerprint(),
      languageFingerprint: this.getLanguageFingerprint(),
      pluginFingerprint: this.getPluginFingerprint(),
    };

    // 고급 지문 생성 (가능한 경우)
    try {
      fingerprint.canvasFingerprint = await this.getCanvasFingerprint();
      fingerprint.audioFingerprint = await this.getAudioFingerprint();
      fingerprint.fontFingerprint = this.getFontFingerprint();
    } catch (error) {
      // 고급 지문 실패는 무시
    }

    return fingerprint;
  }

  private generateDeviceId(): string {
    // 브라우저별 고유 ID 생성
    const stored = this.getCookie(`${this.COOKIE_PREFIX}device_id`);
    if (stored) return stored;

    const deviceId = `device_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 12)}`;
    this.setCookie(`${this.COOKIE_PREFIX}device_id`, deviceId, 365 * 10); // 10년 보관
    return deviceId;
  }

  private getBrowserFingerprint(): string {
    const navigator = window.navigator;
    return btoa(
      JSON.stringify({
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: navigator.languages,
        platform: navigator.platform,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: (navigator as any).deviceMemory,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack,
        maxTouchPoints: navigator.maxTouchPoints,
      })
    );
  }

  private getScreenFingerprint(): string {
    const screen = window.screen;
    return btoa(
      JSON.stringify({
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth,
        orientation: screen.orientation?.type,
        devicePixelRatio: window.devicePixelRatio,
      })
    );
  }

  private getTimezoneFingerprint(): string {
    return btoa(
      JSON.stringify({
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: new Date().getTimezoneOffset(),
        locale: Intl.DateTimeFormat().resolvedOptions().locale,
      })
    );
  }

  private getLanguageFingerprint(): string {
    return btoa(
      JSON.stringify({
        language: navigator.language,
        languages: navigator.languages,
      })
    );
  }

  private getPluginFingerprint(): string {
    const plugins = Array.from(navigator.plugins).map(plugin => ({
      name: plugin.name,
      description: plugin.description,
      filename: plugin.filename,
    }));
    return btoa(JSON.stringify(plugins));
  }

  private async getCanvasFingerprint(): Promise<string> {
    return new Promise(resolve => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve('canvas_not_supported');
        return;
      }

      canvas.width = 200;
      canvas.height = 50;

      // 복잡한 캔버스 그리기
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('SureCRM 🔍', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Analytics System', 4, 25);

      const fingerprint = canvas.toDataURL();
      resolve(btoa(fingerprint));
    });
  }

  private async getAudioFingerprint(): Promise<string> {
    return new Promise(resolve => {
      try {
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const analyser = audioContext.createAnalyser();
        const gainNode = audioContext.createGain();

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(10000, audioContext.currentTime);

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        oscillator.connect(analyser);
        analyser.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start(0);
        oscillator.stop(audioContext.currentTime + 0.1);

        const frequencyData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(frequencyData);

        const fingerprint = Array.from(frequencyData).join(',');
        resolve(btoa(fingerprint));
      } catch (error) {
        resolve('audio_not_supported');
      }
    });
  }

  private getFontFingerprint(): string {
    const testFonts = [
      'Arial',
      'Times New Roman',
      'Courier New',
      'Helvetica',
      'Georgia',
      'Verdana',
      'Impact',
      'Comic Sans MS',
      'Trebuchet MS',
      'Arial Black',
    ];

    const testString = 'mmmmmmmmmmlli';
    const defaultWidth: Record<string, number> = {};
    const defaultHeight: Record<string, number> = {};

    // 기본 폰트로 크기 측정
    const span = document.createElement('span');
    span.style.fontSize = '72px';
    span.style.fontFamily = 'monospace';
    span.innerHTML = testString;
    document.body.appendChild(span);
    defaultWidth['monospace'] = span.offsetWidth;
    defaultHeight['monospace'] = span.offsetHeight;
    document.body.removeChild(span);

    // 각 폰트 확인
    const availableFonts: string[] = [];
    testFonts.forEach(font => {
      const span = document.createElement('span');
      span.style.fontSize = '72px';
      span.style.fontFamily = `${font}, monospace`;
      span.innerHTML = testString;
      document.body.appendChild(span);

      if (
        span.offsetWidth !== defaultWidth['monospace'] ||
        span.offsetHeight !== defaultHeight['monospace']
      ) {
        availableFonts.push(font);
      }

      document.body.removeChild(span);
    });

    return btoa(JSON.stringify(availableFonts));
  }

  // === 💾 데이터 저장/복원 ===
  private async restoreTrackingData(): Promise<void> {
    try {
      // 쿠키에서 기본 정보 복원
      const deviceId = this.getCookie(`${this.COOKIE_PREFIX}device_id`);
      const lastSession = this.getCookie(`${this.COOKIE_PREFIX}last_session`);

      // 로컬스토리지에서 상세 정보 복원
      const storedData = localStorage.getItem(
        `${this.STORAGE_PREFIX}${this.TRACKING_DATA_KEY}`
      );
      if (storedData) {
        const parsed = JSON.parse(storedData);
        this.trackingData = { ...this.getDefaultTrackingData(), ...parsed };
      }

      // 세션스토리지에서 현재 세션 정보 복원
      const sessionData = sessionStorage.getItem(
        `${this.STORAGE_PREFIX}current_session`
      );
      if (sessionData) {
        // 현재 세션 데이터 처리
      }

      // 디바이스 지문 복원
      const storedFingerprint = localStorage.getItem(
        `${this.STORAGE_PREFIX}${this.FINGERPRINT_KEY}`
      );
      if (storedFingerprint) {
        this.deviceFingerprint = {
          ...this.deviceFingerprint,
          ...JSON.parse(storedFingerprint),
        };
      }
    } catch (error) {
      console.warn('사용자 설정 복원 중 일부 오류:', error);
    }
  }

  private saveTrackingData(): void {
    try {
      // 로컬스토리지에 상세 정보 저장
      localStorage.setItem(
        `${this.STORAGE_PREFIX}${this.TRACKING_DATA_KEY}`,
        JSON.stringify(this.trackingData)
      );

      // 디바이스 지문 저장
      localStorage.setItem(
        `${this.STORAGE_PREFIX}${this.FINGERPRINT_KEY}`,
        JSON.stringify(this.deviceFingerprint)
      );

      // 쿠키에 기본 정보 저장
      this.setCookie(
        `${this.COOKIE_PREFIX}last_save`,
        Date.now().toString(),
        365
      );
    } catch (error) {
      console.warn('사용자 설정 저장 중 일부 오류:', error);
    }
  }

  // === 🎯 실시간 추적 ===
  private setupRealTimeTracking(): void {
    // 클릭 패턴 추적
    document.addEventListener('click', e => {
      this.trackingData.behaviorProfile.clickPatterns.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now(),
      });
      this.limitArraySize(this.trackingData.behaviorProfile.clickPatterns, 100);
    });

    // 스크롤 패턴 추적
    let lastScrollTime = Date.now();
    let lastScrollPosition = window.pageYOffset;

    document.addEventListener('scroll', () => {
      const now = Date.now();
      const currentPosition = window.pageYOffset;
      const speed =
        Math.abs(currentPosition - lastScrollPosition) / (now - lastScrollTime);

      this.trackingData.behaviorProfile.scrollPatterns.push({
        position: currentPosition,
        speed: speed,
        timestamp: now,
      });

      lastScrollTime = now;
      lastScrollPosition = currentPosition;
      this.limitArraySize(
        this.trackingData.behaviorProfile.scrollPatterns,
        100
      );
    });

    // 키보드 패턴 추적
    let lastKeyTime = 0;
    document.addEventListener('keydown', e => {
      const now = Date.now();
      const interval = lastKeyTime ? now - lastKeyTime : 0;

      this.trackingData.behaviorProfile.keyboardPatterns.push({
        key: e.key.length === 1 ? 'char' : e.key, // 개인정보 보호
        interval: interval,
        timestamp: now,
      });

      lastKeyTime = now;
      this.limitArraySize(
        this.trackingData.behaviorProfile.keyboardPatterns,
        100
      );
    });

    // 페이지 포커스 추적
    let focusStartTime = Date.now();
    document.addEventListener('visibilitychange', () => {
      const now = Date.now();
      const duration = now - focusStartTime;

      this.trackingData.behaviorProfile.attentionPatterns.push({
        focused: !document.hidden,
        duration: duration,
        timestamp: now,
      });

      focusStartTime = now;
      this.limitArraySize(
        this.trackingData.behaviorProfile.attentionPatterns,
        100
      );
    });

    // 네트워크 품질 감지
    this.trackNetworkQuality();

    // 성능 메트릭 수집
    this.collectPerformanceMetrics();
  }

  private trackNetworkQuality(): void {
    // Connection API 사용 (지원되는 경우)
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (connection) {
      const updateNetworkQuality = () => {
        let quality: 'fast' | 'slow' | 'offline' = 'fast';

        if (connection.effectiveType) {
          switch (connection.effectiveType) {
            case 'slow-2g':
            case '2g':
              quality = 'slow';
              break;
            case '3g':
              quality = 'slow';
              break;
            case '4g':
              quality = 'fast';
              break;
          }
        }

        if (!navigator.onLine) {
          quality = 'offline';
        }

        this.trackingData.performanceMetrics.networkQuality.push({
          timestamp: Date.now(),
          quality: quality,
        });

        this.limitArraySize(
          this.trackingData.performanceMetrics.networkQuality,
          50
        );
      };

      connection.addEventListener('change', updateNetworkQuality);
      updateNetworkQuality(); // 초기 상태 기록
    }
  }

  private collectPerformanceMetrics(): void {
    // 페이지 로드 시간
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.trackingData.performanceMetrics.pageLoadTimes.push(loadTime);
      this.limitArraySize(
        this.trackingData.performanceMetrics.pageLoadTimes,
        20
      );
    });

    // 상호작용 응답 시간 추적
    let interactionStart = 0;
    document.addEventListener('click', () => {
      interactionStart = performance.now();
    });

    // DOM 변경 감지로 응답 시간 측정
    const observer = new MutationObserver(() => {
      if (interactionStart > 0) {
        const responseTime = performance.now() - interactionStart;
        this.trackingData.performanceMetrics.interactionResponseTimes.push(
          responseTime
        );
        this.limitArraySize(
          this.trackingData.performanceMetrics.interactionResponseTimes,
          50
        );
        interactionStart = 0;
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });
  }

  // === 📊 비즈니스 인텔리전스 추적 ===
  public trackFeatureUsage(feature: string): void {
    if (!this.trackingData.businessIntelligence.featureUsage[feature]) {
      this.trackingData.businessIntelligence.featureUsage[feature] = 0;
    }
    this.trackingData.businessIntelligence.featureUsage[feature]++;

    this.sendEvent('feature_usage_tracked', {
      feature: feature,
      usage_count: this.trackingData.businessIntelligence.featureUsage[feature],
      session_id: this.getCurrentSessionId(),
    });
  }

  public trackWorkflowCompletion(workflow: string, startTime: number): void {
    const completionTime = Date.now() - startTime;
    this.trackingData.businessIntelligence.workflowCompletions.push({
      workflow: workflow,
      completionTime: completionTime,
      timestamp: Date.now(),
    });

    this.limitArraySize(
      this.trackingData.businessIntelligence.workflowCompletions,
      100
    );

    this.sendEvent('workflow_completed', {
      workflow: workflow,
      completion_time: completionTime,
      efficiency_score: this.calculateWorkflowEfficiency(
        workflow,
        completionTime
      ),
    });
  }

  public trackError(error: string, context: string): void {
    this.trackingData.businessIntelligence.errorEncounters.push({
      error: error,
      context: context,
      timestamp: Date.now(),
    });

    this.limitArraySize(
      this.trackingData.businessIntelligence.errorEncounters,
      50
    );

    this.sendEvent('error_encountered', {
      error_type: error,
      context: context,
      user_experience_impact: this.calculateExperienceImpact(error),
    });
  }

  // === 🔧 유틸리티 메서드 ===
  private startNewSession(): void {
    const sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 8)}`;
    this.trackingData.sessionIds.push(sessionId);
    this.limitArraySize(this.trackingData.sessionIds, 50);

    this.setCookie(`${this.COOKIE_PREFIX}current_session`, sessionId, 1);
    sessionStorage.setItem(`${this.STORAGE_PREFIX}current_session`, sessionId);
  }

  private getCurrentSessionId(): string {
    return (
      this.trackingData.sessionIds[this.trackingData.sessionIds.length - 1] ||
      'unknown'
    );
  }

  private setupPeriodicSave(): void {
    // 5분마다 자동 저장
    setInterval(
      () => {
        this.saveTrackingData();
      },
      5 * 60 * 1000
    );

    // 페이지 언로드 시 저장
    window.addEventListener('beforeunload', () => {
      this.saveTrackingData();
    });
  }

  private limitArraySize<T>(array: T[], maxSize: number): void {
    if (array.length > maxSize) {
      array.splice(0, array.length - maxSize);
    }
  }

  private calculateWorkflowEfficiency(
    workflow: string,
    completionTime: number
  ): number {
    const previousCompletions =
      this.trackingData.businessIntelligence.workflowCompletions.filter(
        w => w.workflow === workflow
      );

    if (previousCompletions.length === 0) return 50; // 기본값

    const averageTime =
      previousCompletions.reduce((sum, w) => sum + w.completionTime, 0) /
      previousCompletions.length;
    return Math.max(
      0,
      Math.min(100, 100 - ((completionTime - averageTime) / averageTime) * 100)
    );
  }

  private calculateExperienceImpact(error: string): 'low' | 'medium' | 'high' {
    const criticalErrors = ['crash', 'failure', 'timeout', 'network_error'];
    if (criticalErrors.some(ce => error.toLowerCase().includes(ce))) {
      return 'high';
    }
    return 'medium';
  }

  private sendEvent(eventName: string, eventData: any): void {
    // GA4 이벤트 전송
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        event_category: 'advanced_persistence',
        ...eventData,
        device_fingerprint: this.deviceFingerprint.deviceId,
        session_id: this.getCurrentSessionId(),
      });
    }

    // GTM DataLayer 전송
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: `persistence_${eventName}`,
        persistence_data: {
          ...eventData,
          device_fingerprint: this.deviceFingerprint,
          tracking_data_summary: {
            total_sessions: this.trackingData.sessionIds.length,
            total_visits: this.trackingData.visitHistory.length,
            feature_usage_count: Object.keys(
              this.trackingData.businessIntelligence.featureUsage
            ).length,
            workflow_completions:
              this.trackingData.businessIntelligence.workflowCompletions.length,
          },
        },
        timestamp: Date.now(),
      });
    }
  }

  // === 🏗️ 기본값 생성 ===
  private getDefaultTrackingData(): PersistentTrackingData {
    return {
      sessionIds: [],
      visitHistory: [],
      deviceFingerprint: this.getDefaultFingerprint(),
      behaviorProfile: {
        clickPatterns: [],
        scrollPatterns: [],
        keyboardPatterns: [],
        navigationPatterns: [],
        attentionPatterns: [],
      },
      preferences: {
        colorScheme: 'auto',
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        notifications: true,
      },
      performanceMetrics: {
        pageLoadTimes: [],
        interactionResponseTimes: [],
        networkQuality: [],
      },
      businessIntelligence: {
        featureUsage: {},
        workflowCompletions: [],
        errorEncounters: [],
        supportInteractions: [],
      },
    };
  }

  private getDefaultFingerprint(): UserFingerprint {
    return {
      deviceId: '',
      browserFingerprint: '',
      screenFingerprint: '',
      timezoneFingerprint: '',
      languageFingerprint: '',
      pluginFingerprint: '',
    };
  }

  // === 🍪 쿠키 관리 ===
  private setCookie(name: string, value: string, days: number): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax;Secure`;
  }

  private getCookie(name: string): string | null {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  // === 🎛️ 공개 API ===
  public getTrackingData(): PersistentTrackingData {
    return { ...this.trackingData };
  }

  public getDeviceFingerprint(): UserFingerprint {
    return { ...this.deviceFingerprint };
  }

  public updatePreferences(
    preferences: Partial<PersistentTrackingData['preferences']>
  ): void {
    this.trackingData.preferences = {
      ...this.trackingData.preferences,
      ...preferences,
    };
    this.saveTrackingData();
  }

  public clearAllData(): void {
    // 모든 저장된 데이터 삭제
    localStorage.removeItem(`${this.STORAGE_PREFIX}${this.TRACKING_DATA_KEY}`);
    localStorage.removeItem(`${this.STORAGE_PREFIX}${this.FINGERPRINT_KEY}`);
    sessionStorage.clear();

    // 쿠키 삭제
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      if (name.trim().startsWith(this.COOKIE_PREFIX)) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
    });

    this.trackingData = this.getDefaultTrackingData();
    this.deviceFingerprint = this.getDefaultFingerprint();
  }
}

// === 🌟 글로벌 인스턴스 ===
let persistenceTracker: AdvancedPersistenceTracker | null = null;

export async function initializeAdvancedPersistence(): Promise<AdvancedPersistenceTracker> {
  if (!persistenceTracker) {
    persistenceTracker = new AdvancedPersistenceTracker();
    await persistenceTracker.initialize();

    // 전역 객체에 등록 (디버깅용)
    if (typeof window !== 'undefined' && import.meta.env.DEV) {
      (window as any).persistenceTracker = persistenceTracker;
    }
  }

  return persistenceTracker;
}

export function getPersistenceTracker(): AdvancedPersistenceTracker | null {
  return persistenceTracker;
}

export { AdvancedPersistenceTracker };
