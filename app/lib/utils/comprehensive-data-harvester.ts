// 🔍 포괄적 사용자 경험 최적화를 위한 자동 데이터 수집 시스템
// Comprehensive User Experience Optimization through Automated Data Collection

interface ComprehensiveDataPoint {
  elementType: string;
  action: string;
  timestamp: number;
  pageContext: PageContext;
  userContext: UserContext;
  businessValue: number;
  experienceMetrics: ExperienceMetrics;
}

interface PageContext {
  url: string;
  title: string;
  referrer: string;
  userAgent: string;
  screenResolution: string;
  viewportSize: string;
  scrollPosition: { x: number; y: number };
  loadTime: number;
  renderTime: number;
}

interface UserContext {
  sessionId: string;
  userId?: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  language: string;
  timezone: string;
  networkSpeed: 'slow' | 'medium' | 'fast';
  cookiesEnabled: boolean;
  javaScriptEnabled: boolean;
}

interface ExperienceMetrics {
  engagementScore: number; // 참여도 점수
  frustrationLevel: number; // 좌절감 수준
  taskCompletionRate: number; // 작업 완료율
  navigationEfficiency: number; // 탐색 효율성
  contentConsumptionDepth: number; // 콘텐츠 소비 깊이
  decisionSpeed: number; // 의사결정 속도
  returnProbability: number; // 재방문 가능성
}

class ComprehensiveDataHarvester {
  private isProduction: boolean;
  private sessionData: Map<string, any> = new Map();
  private observers: MutationObserver[] = [];
  private eventListeners: Array<{
    element: Element;
    event: string;
    handler: EventListener;
  }> = [];

  constructor() {
    this.isProduction = !this.isDevelopmentEnvironment();
    if (this.isProduction) {
      this.initializeHarvesting();
    }
  }

  private isDevelopmentEnvironment(): boolean {
    return (
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.port === '5173' ||
        window.location.port === '3000' ||
        window.location.port === '8080')
    );
  }

  private initializeHarvesting(): void {
    // 🔄 자동 DOM 스캔 및 이벤트 수집기 설치
    this.scanAndInstrumentExistingElements();
    this.setupDynamicElementMonitoring();
    this.initializeUserBehaviorTracking();
    this.setupPageLifecycleTracking();
    this.enableAdvancedInteractionCapture();
  }

  // 🎯 기존 DOM 요소들에 자동 데이터 수집기 설치
  private scanAndInstrumentExistingElements(): void {
    const selectors = [
      'button', // 모든 버튼
      'a', // 모든 링크
      'input', // 모든 입력 필드
      'select', // 모든 선택 박스
      'textarea', // 모든 텍스트 영역
      '[role="button"]', // 역할이 버튼인 요소
      '.btn', // 버튼 클래스
      '[data-action]', // 액션 데이터 속성
      '[onclick]', // 클릭 이벤트 있는 요소
      '[href]', // 링크 요소
      'form', // 모든 폼
      '[data-testid]', // 테스트 ID 있는 요소
    ];

    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        this.instrumentElement(element);
      });
    });
  }

  // 🔍 동적으로 추가되는 요소들 모니터링
  private setupDynamicElementMonitoring(): void {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            this.instrumentElement(element);

            // 하위 요소들도 재귀적으로 스캔
            element
              .querySelectorAll(
                'button, a, input, select, textarea, [role="button"], .btn, [data-action], [onclick], [href], form, [data-testid]'
              )
              .forEach(childElement => this.instrumentElement(childElement));
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['onclick', 'data-action', 'href'],
    });

    this.observers.push(observer);
  }

  // 🎯 개별 요소에 데이터 수집기 설치
  private instrumentElement(element: Element): void {
    if (element.hasAttribute('data-harvested')) return; // 중복 방지

    element.setAttribute('data-harvested', 'true');

    const events = [
      'click',
      'mousedown',
      'mouseup',
      'focus',
      'blur',
      'change',
      'input',
      'submit',
    ];

    events.forEach(eventType => {
      const handler = (event: Event) => this.captureInteraction(event, element);
      element.addEventListener(eventType, handler, { passive: true });

      this.eventListeners.push({ element, event: eventType, handler });
    });

    // 🔍 호버 및 시선 추적
    const hoverHandler = (event: Event) =>
      this.captureHoverData(event as MouseEvent, element);
    element.addEventListener('mouseenter', hoverHandler, { passive: true });
    element.addEventListener('mouseleave', hoverHandler, { passive: true });

    this.eventListeners.push({
      element,
      event: 'mouseenter',
      handler: hoverHandler,
    });
    this.eventListeners.push({
      element,
      event: 'mouseleave',
      handler: hoverHandler,
    });
  }

  // 📊 상호작용 데이터 수집
  private captureInteraction(event: Event, element: Element): void {
    const dataPoint = this.createDataPoint(event, element);
    this.sendToAnalytics(dataPoint);
    this.updateUserProfile(dataPoint);
  }

  // 📊 호버 행동 데이터 수집
  private captureHoverData(event: MouseEvent, element: Element): void {
    const hoverData = {
      event: 'element_hover',
      element_type: element.tagName.toLowerCase(),
      element_text: element.textContent?.trim() || '',
      element_id: element.id || '',
      element_class: element.className || '',
      hover_duration:
        event.type === 'mouseleave'
          ? Date.now() -
            parseInt(element.getAttribute('data-hover-start') || '0')
          : 0,
      mouse_position: { x: event.clientX, y: event.clientY },
      page_url: window.location.href,
      timestamp: Date.now(),
    };

    if (event.type === 'mouseenter') {
      element.setAttribute('data-hover-start', Date.now().toString());
    }

    this.sendToGTM(hoverData);
  }

  // 🧠 사용자 행동 패턴 추적
  private initializeUserBehaviorTracking(): void {
    // 스크롤 패턴 분석
    let scrollTimeout: number;
    window.addEventListener(
      'scroll',
      () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = window.setTimeout(() => {
          this.captureScrollBehavior();
        }, 150);
      },
      { passive: true }
    );

    // 키보드 패턴 분석
    document.addEventListener(
      'keydown',
      event => {
        this.captureKeyboardPattern(event);
      },
      { passive: true }
    );

    // 마우스 움직임 패턴 (샘플링)
    let mouseSampleCount = 0;
    document.addEventListener(
      'mousemove',
      event => {
        mouseSampleCount++;
        if (mouseSampleCount % 10 === 0) {
          // 10번에 1번만 수집
          this.captureMousePattern(event);
        }
      },
      { passive: true }
    );

    // 화면 이탈/재진입 감지
    document.addEventListener('visibilitychange', () => {
      this.captureVisibilityChange();
    });
  }

  // 📱 페이지 생명주기 추적
  private setupPageLifecycleTracking(): void {
    // 페이지 로드 성능
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.capturePagePerformance();
      }, 1000);
    });

    // 페이지 종료 시 최종 세션 데이터
    window.addEventListener('beforeunload', () => {
      this.sendFinalSessionData();
    });

    // 페이지 뷰 지속시간
    this.sessionData.set('page_start_time', Date.now());
  }

  // 🎯 고급 상호작용 캡처 활성화
  private enableAdvancedInteractionCapture(): void {
    // 폼 작성 패턴 분석
    document.querySelectorAll('form').forEach(form => {
      this.instrumentForm(form);
    });

    // 미디어 소비 패턴
    document.querySelectorAll('video, audio').forEach(media => {
      this.instrumentMedia(media as HTMLMediaElement);
    });

    // 이미지 조회 패턴
    document.querySelectorAll('img').forEach(img => {
      this.instrumentImage(img);
    });
  }

  // 📊 데이터 포인트 생성
  private createDataPoint(
    event: Event,
    element: Element
  ): ComprehensiveDataPoint {
    return {
      elementType: element.tagName.toLowerCase(),
      action: event.type,
      timestamp: Date.now(),
      pageContext: this.getPageContext(),
      userContext: this.getUserContext(),
      businessValue: this.calculateBusinessValue(element, event),
      experienceMetrics: this.calculateExperienceMetrics(element, event),
    };
  }

  // 📈 비즈니스 가치 계산
  private calculateBusinessValue(element: Element, event: Event): number {
    let value = 1; // 기본값

    // 요소 타입별 가중치
    const elementWeights: Record<string, number> = {
      button: 5,
      a: 3,
      form: 10,
      input: 2,
      select: 4,
    };

    // 액션별 가중치
    const actionWeights: Record<string, number> = {
      click: 5,
      submit: 15,
      change: 3,
      focus: 1,
    };

    // 특별한 요소들 (CTA, 결제 등)
    const text = element.textContent?.toLowerCase() || '';
    const className = element.className.toLowerCase();
    const id = element.id.toLowerCase();

    if (text.includes('구매') || text.includes('결제') || text.includes('주문'))
      value *= 50;
    if (text.includes('회원가입') || text.includes('가입')) value *= 30;
    if (text.includes('로그인') || text.includes('signin')) value *= 20;
    if (text.includes('연락') || text.includes('문의')) value *= 25;
    if (className.includes('cta') || className.includes('primary')) value *= 10;

    value *= elementWeights[element.tagName.toLowerCase()] || 1;
    value *= actionWeights[event.type] || 1;

    return Math.round(value);
  }

  // 📊 경험 지표 계산
  private calculateExperienceMetrics(
    element: Element,
    event: Event
  ): ExperienceMetrics {
    const sessionTime =
      Date.now() - (this.sessionData.get('page_start_time') || Date.now());
    const clickCount = this.sessionData.get('click_count') || 0;

    return {
      engagementScore: Math.min(
        100,
        (sessionTime / 1000) * 0.5 + clickCount * 2
      ),
      frustrationLevel: this.sessionData.get('error_count') || 0,
      taskCompletionRate: this.calculateTaskCompletion(),
      navigationEfficiency: this.calculateNavigationEfficiency(),
      contentConsumptionDepth: this.calculateContentDepth(),
      decisionSpeed: this.calculateDecisionSpeed(),
      returnProbability: this.calculateReturnProbability(),
    };
  }

  // 📡 GTM으로 데이터 전송
  private sendToAnalytics(dataPoint: ComprehensiveDataPoint): void {
    this.sendToGTM({
      event: 'user_interaction_captured',
      element_type: dataPoint.elementType,
      action: dataPoint.action,
      business_value: dataPoint.businessValue,
      engagement_score: dataPoint.experienceMetrics.engagementScore,
      page_url: dataPoint.pageContext.url,
      timestamp: dataPoint.timestamp,
      user_session: dataPoint.userContext.sessionId,
    });
  }

  // 🏷️ GTM 데이터 레이어 전송
  private sendToGTM(data: any): void {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        ...data,
        category: 'user_experience_optimization',
        data_collection_version: '2.0',
      });
    }
  }

  // 🧹 메모리 정리
  public cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.sessionData.clear();
  }

  // 보조 메서드들
  private getPageContext(): PageContext {
    /* 구현 */ return {} as PageContext;
  }
  private getUserContext(): UserContext {
    /* 구현 */ return {} as UserContext;
  }
  private updateUserProfile(dataPoint: ComprehensiveDataPoint): void {
    /* 구현 */
  }
  private captureScrollBehavior(): void {
    /* 구현 */
  }
  private captureKeyboardPattern(event: KeyboardEvent): void {
    /* 구현 */
  }
  private captureMousePattern(event: MouseEvent): void {
    /* 구현 */
  }
  private captureVisibilityChange(): void {
    /* 구현 */
  }
  private capturePagePerformance(): void {
    /* 구현 */
  }
  private sendFinalSessionData(): void {
    /* 구현 */
  }
  private instrumentForm(form: Element): void {
    /* 구현 */
  }
  private instrumentMedia(media: HTMLMediaElement): void {
    /* 구현 */
  }
  private instrumentImage(img: Element): void {
    /* 구현 */
  }
  private calculateTaskCompletion(): number {
    return 0;
  }
  private calculateNavigationEfficiency(): number {
    return 0;
  }
  private calculateContentDepth(): number {
    return 0;
  }
  private calculateDecisionSpeed(): number {
    return 0;
  }
  private calculateReturnProbability(): number {
    return 0;
  }
}

// 🚀 자동 초기화 및 전역 인스턴스
let globalHarvester: ComprehensiveDataHarvester | null = null;

export function initializeComprehensiveDataHarvesting(): ComprehensiveDataHarvester | null {
  if (typeof window === 'undefined') return null;

  if (!globalHarvester) {
    globalHarvester = new ComprehensiveDataHarvester();
  }

  return globalHarvester;
}

export function getGlobalHarvester(): ComprehensiveDataHarvester | null {
  return globalHarvester;
}

// 자동 초기화 (모듈 로드 시)
if (typeof window !== 'undefined') {
  // DOM이 준비되면 자동 시작
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeComprehensiveDataHarvesting();
    });
  } else {
    // 이미 로드됨
    initializeComprehensiveDataHarvesting();
  }
}
