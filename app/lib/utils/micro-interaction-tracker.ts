/**
 * 🎯 SureCRM 미세 상호작용 분석 시스템
 *
 * 사용자 경험 향상을 위한 정밀한 상호작용 패턴 분석
 */

// === 🔍 미세 상호작용 타입 정의 ===
interface MicroInteraction {
  type:
    | 'hover'
    | 'focus'
    | 'blur'
    | 'resize'
    | 'selection'
    | 'copy'
    | 'paste'
    | 'contextmenu'
    | 'drag'
    | 'drop';
  element: string;
  timestamp: number;
  duration?: number;
  coordinates?: { x: number; y: number };
  value?: string;
  metadata?: Record<string, any>;
}

interface UserBehaviorPattern {
  sessionId: string;
  userId?: string;
  interactions: MicroInteraction[];
  patterns: {
    hesitationPoints: Array<{ element: string; hesitationTime: number }>;
    rapidActions: Array<{ sequence: string[]; totalTime: number }>;
    abandonmentPoints: Array<{ element: string; timeSpent: number }>;
    expertiseLevel: 'beginner' | 'intermediate' | 'expert';
    taskCompletionStyle: 'deliberate' | 'efficient' | 'exploratory';
  };
  predictions: {
    nextAction: string;
    confidenceScore: number;
    timeToAction: number;
  };
}

interface EngagementMetrics {
  attentionSpan: number;
  taskSwitchingFrequency: number;
  errorRecoverySpeed: number;
  featureDiscoveryRate: number;
  workflowEfficiency: number;
}

// === 🎪 극한 미세 추적 클래스 ===
class MicroInteractionTracker {
  private interactions: MicroInteraction[] = [];
  private sessionStart: number = Date.now();
  private isTracking: boolean = false;
  private lastActivityTime: number = Date.now();
  private behaviorPatterns: UserBehaviorPattern;
  private engagementMetrics: EngagementMetrics;

  private mouseIdleTimer?: NodeJS.Timeout;
  private keyboardIdleTimer?: NodeJS.Timeout;
  private attentionTimer?: NodeJS.Timeout;

  constructor() {
    this.behaviorPatterns = {
      sessionId: this.generateSessionId(),
      interactions: [],
      patterns: {
        hesitationPoints: [],
        rapidActions: [],
        abandonmentPoints: [],
        expertiseLevel: 'intermediate',
        taskCompletionStyle: 'deliberate',
      },
      predictions: {
        nextAction: 'unknown',
        confidenceScore: 0,
        timeToAction: 0,
      },
    };

    this.engagementMetrics = {
      attentionSpan: 0,
      taskSwitchingFrequency: 0,
      errorRecoverySpeed: 0,
      featureDiscoveryRate: 0,
      workflowEfficiency: 0,
    };
  }

  // === 🚀 추적 시작 ===
  public startTracking(): void {
    if (this.isTracking || typeof window === 'undefined') return;

    this.isTracking = true;
    this.setupMicroInteractionListeners();
    this.startBehaviorAnalysis();
    this.setupAdvancedTracking();
  }

  // === 🎯 미세 상호작용 리스너 설정 ===
  private setupMicroInteractionListeners(): void {
    // 호버 추적 (극한 정밀도)
    document.addEventListener('mouseover', (e) => {
      const startTime = Date.now();
      const element = e.target as HTMLElement;

      const hoverEnd = () => {
        this.recordInteraction({
          type: 'hover',
          element: this.getElementSelector(element),
          timestamp: startTime,
          duration: Date.now() - startTime,
          coordinates: { x: e.clientX, y: e.clientY },
          metadata: {
            elementType: element.tagName,
            hasText: !!element.textContent,
            isInteractive: this.isInteractiveElement(element),
            zIndex: window.getComputedStyle(element).zIndex,
          },
        });
        element.removeEventListener('mouseleave', hoverEnd);
      };

      element.addEventListener('mouseleave', hoverEnd);
    });

    // 포커스/블러 추적
    document.addEventListener('focusin', (e) => {
      const element = e.target as HTMLElement;
      this.recordInteraction({
        type: 'focus',
        element: this.getElementSelector(element),
        timestamp: Date.now(),
        metadata: {
          inputType: element.getAttribute('type'),
          placeholder: element.getAttribute('placeholder'),
          required: element.hasAttribute('required'),
          autoFocus: element.hasAttribute('autofocus'),
        },
      });
    });

    document.addEventListener('focusout', (e) => {
      const element = e.target as HTMLElement;
      this.recordInteraction({
        type: 'blur',
        element: this.getElementSelector(element),
        timestamp: Date.now(),
        value: (element as HTMLInputElement).value || element.textContent || '',
        metadata: {
          wasEmpty:
            !(element as HTMLInputElement).value && !element.textContent,
          interactionTime: Date.now() - this.lastActivityTime,
        },
      });
    });

    // 텍스트 선택 추적
    document.addEventListener('selectionchange', () => {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 2) {
        this.recordInteraction({
          type: 'selection',
          element: 'document',
          timestamp: Date.now(),
          value: selection.toString(),
          metadata: {
            selectionLength: selection.toString().length,
            rangeCount: selection.rangeCount,
            isPartialWord: this.isPartialWordSelection(selection.toString()),
          },
        });
      }
    });

    // 복사/붙여넣기 추적
    document.addEventListener('copy', (e) => {
      const selection = window.getSelection();
      this.recordInteraction({
        type: 'copy',
        element: this.getElementSelector(e.target as HTMLElement),
        timestamp: Date.now(),
        value: selection?.toString() || '',
        metadata: {
          clipboardLength: selection?.toString().length || 0,
          hasFormatting: this.hasRichFormatting(selection),
        },
      });
    });

    document.addEventListener('paste', (e) => {
      this.recordInteraction({
        type: 'paste',
        element: this.getElementSelector(e.target as HTMLElement),
        timestamp: Date.now(),
        metadata: {
          pasteType: e.clipboardData?.types || [],
          hasFiles: e.clipboardData?.files.length || 0,
        },
      });
    });

    // 우클릭 컨텍스트 메뉴 추적
    document.addEventListener('contextmenu', (e) => {
      this.recordInteraction({
        type: 'contextmenu',
        element: this.getElementSelector(e.target as HTMLElement),
        timestamp: Date.now(),
        coordinates: { x: e.clientX, y: e.clientY },
        metadata: {
          altKey: e.altKey,
          ctrlKey: e.ctrlKey,
          shiftKey: e.shiftKey,
        },
      });
    });

    // 드래그 앤 드롭 추적
    document.addEventListener('dragstart', (e) => {
      this.recordInteraction({
        type: 'drag',
        element: this.getElementSelector(e.target as HTMLElement),
        timestamp: Date.now(),
        coordinates: { x: e.clientX, y: e.clientY },
        metadata: {
          effectAllowed: e.dataTransfer?.effectAllowed,
          dragImage: !!e.dataTransfer?.getData('text/html'),
        },
      });
    });

    document.addEventListener('drop', (e) => {
      this.recordInteraction({
        type: 'drop',
        element: this.getElementSelector(e.target as HTMLElement),
        timestamp: Date.now(),
        coordinates: { x: e.clientX, y: e.clientY },
        metadata: {
          files: e.dataTransfer?.files.length || 0,
          types: Array.from(e.dataTransfer?.types || []),
        },
      });
    });

    // 윈도우 크기 변경 추적
    window.addEventListener('resize', () => {
      this.recordInteraction({
        type: 'resize',
        element: 'window',
        timestamp: Date.now(),
        metadata: {
          windowSize: `${window.innerWidth}x${window.innerHeight}`,
          screenSize: `${screen.width}x${screen.height}`,
          devicePixelRatio: window.devicePixelRatio,
        },
      });
    });
  }

  // === 🧠 고급 행동 분석 ===
  private setupAdvancedTracking(): void {
    // 비활성 상태 감지
    let idleTime = 0;
    const idleInterval = setInterval(() => {
      idleTime += 1000;
      if (idleTime > 30000) {
        // 30초 이상 비활성
        this.analyzeIdleBehavior(idleTime);
        idleTime = 0;
      }
    }, 1000);

    // 활동 감지 시 타이머 리셋
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(
      (event) => {
        document.addEventListener(
          event,
          () => {
            idleTime = 0;
            this.lastActivityTime = Date.now();
          },
          true
        );
      }
    );

    // 페이지 가시성 변경 추적
    document.addEventListener('visibilitychange', () => {
      this.trackAttentionSpan();
    });

    // 작업 완료 패턴 분석
    this.startTaskCompletionAnalysis();
  }

  // === 📊 상호작용 기록 ===
  private recordInteraction(interaction: MicroInteraction): void {
    this.interactions.push(interaction);
    this.behaviorPatterns.interactions.push(interaction);

    // GA4로 전송
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'micro_interaction', {
        event_category: 'user_behavior_micro',
        interaction_type: interaction.type,
        element_selector: interaction.element,
        duration: interaction.duration || 0,
        has_coordinates: !!interaction.coordinates,
        has_value: !!interaction.value,
        session_duration: Date.now() - this.sessionStart,
        custom_dimension_expertise_level:
          this.behaviorPatterns.patterns.expertiseLevel,
        custom_dimension_interaction_efficiency:
          this.calculateInteractionEfficiency(),
      });
    }

    // GTM DataLayer로 전송
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'micro_interaction_detailed',
        interaction_data: {
          type: interaction.type,
          element: interaction.element,
          timestamp: interaction.timestamp,
          metadata: interaction.metadata,
          session_context: {
            total_interactions: this.interactions.length,
            session_duration: Date.now() - this.sessionStart,
            last_activity_gap: Date.now() - this.lastActivityTime,
          },
        },
      });
    }

    // 실시간 패턴 분석
    this.analyzeInteractionPatterns();

    // 상호작용 데이터가 많아지면 정리
    if (this.interactions.length > 1000) {
      this.interactions = this.interactions.slice(-500);
    }
  }

  // === 🔍 패턴 분석 ===
  private analyzeInteractionPatterns(): void {
    const recentInteractions = this.interactions.slice(-10);

    // 망설임 지점 감지
    this.detectHesitationPoints(recentInteractions);

    // 빠른 액션 시퀀스 감지
    this.detectRapidActions(recentInteractions);

    // 포기 지점 감지
    this.detectAbandonmentPoints(recentInteractions);

    // 전문성 수준 평가
    this.assessExpertiseLevel();

    // 다음 행동 예측
    this.predictNextAction();
  }

  private detectHesitationPoints(interactions: MicroInteraction[]): void {
    for (let i = 1; i < interactions.length; i++) {
      const timeDiff =
        interactions[i].timestamp - interactions[i - 1].timestamp;
      if (timeDiff > 3000 && interactions[i].type === 'hover') {
        // 3초 이상 망설임
        this.behaviorPatterns.patterns.hesitationPoints.push({
          element: interactions[i].element,
          hesitationTime: timeDiff,
        });
      }
    }
  }

  private detectRapidActions(interactions: MicroInteraction[]): void {
    const rapidSequence: string[] = [];
    let sequenceStart = 0;

    for (let i = 1; i < interactions.length; i++) {
      const timeDiff =
        interactions[i].timestamp - interactions[i - 1].timestamp;
      if (timeDiff < 500) {
        // 0.5초 이내 빠른 액션
        if (rapidSequence.length === 0)
          sequenceStart = interactions[i - 1].timestamp;
        rapidSequence.push(interactions[i].type);
      } else if (rapidSequence.length > 2) {
        this.behaviorPatterns.patterns.rapidActions.push({
          sequence: [...rapidSequence],
          totalTime: interactions[i - 1].timestamp - sequenceStart,
        });
        rapidSequence.length = 0;
      }
    }
  }

  private detectAbandonmentPoints(interactions: MicroInteraction[]): void {
    const focusInteractions = interactions.filter((i) => i.type === 'focus');
    focusInteractions.forEach((focus) => {
      const correspondingBlur = interactions.find(
        (i) =>
          i.type === 'blur' &&
          i.element === focus.element &&
          i.timestamp > focus.timestamp
      );

      if (correspondingBlur) {
        const timeSpent = correspondingBlur.timestamp - focus.timestamp;
        if (
          timeSpent > 5000 &&
          (!correspondingBlur.value || correspondingBlur.metadata?.wasEmpty)
        ) {
          // 5초 이상 머물렀지만 값 입력 없이 떠남
          this.behaviorPatterns.patterns.abandonmentPoints.push({
            element: focus.element,
            timeSpent,
          });
        }
      }
    });
  }

  private assessExpertiseLevel(): void {
    const rapidActionsCount =
      this.behaviorPatterns.patterns.rapidActions.length;
    const hesitationCount =
      this.behaviorPatterns.patterns.hesitationPoints.length;
    const totalInteractions = this.interactions.length;

    if (totalInteractions < 10) return;

    const efficiencyRatio = rapidActionsCount / totalInteractions;
    const hesitationRatio = hesitationCount / totalInteractions;

    if (efficiencyRatio > 0.3 && hesitationRatio < 0.1) {
      this.behaviorPatterns.patterns.expertiseLevel = 'expert';
    } else if (efficiencyRatio > 0.15 && hesitationRatio < 0.2) {
      this.behaviorPatterns.patterns.expertiseLevel = 'intermediate';
    } else {
      this.behaviorPatterns.patterns.expertiseLevel = 'beginner';
    }
  }

  private predictNextAction(): void {
    const recentTypes = this.interactions.slice(-5).map((i) => i.type);

    // 간단한 패턴 매칭 예측 (MicroInteraction 타입에 맞게 수정)
    if (recentTypes.includes('hover') && !recentTypes.includes('focus')) {
      this.behaviorPatterns.predictions = {
        nextAction: 'potential_focus',
        confidenceScore: 0.7,
        timeToAction: 2000,
      };
    } else if (recentTypes.includes('focus') && !recentTypes.includes('blur')) {
      this.behaviorPatterns.predictions = {
        nextAction: 'input_expected',
        confidenceScore: 0.8,
        timeToAction: 1000,
      };
    }
  }

  // === 🎯 유틸리티 메서드 ===
  private generateSessionId(): string {
    return `micro_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getElementSelector(element: HTMLElement): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  private isInteractiveElement(element: HTMLElement): boolean {
    const interactiveTags = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
    return (
      interactiveTags.includes(element.tagName) ||
      element.hasAttribute('onclick') ||
      element.hasAttribute('role')
    );
  }

  private isPartialWordSelection(text: string): boolean {
    return !/^\s*\w+(\s+\w+)*\s*$/.test(text);
  }

  private hasRichFormatting(selection: Selection | null): boolean {
    if (!selection || selection.rangeCount === 0) return false;
    const range = selection.getRangeAt(0);
    return range.toString() !== range.cloneContents().textContent;
  }

  private calculateInteractionEfficiency(): number {
    const totalTime = Date.now() - this.sessionStart;
    const meaningfulInteractions = this.interactions.filter((i) =>
      ['click', 'focus', 'selection'].includes(i.type)
    ).length;

    return meaningfulInteractions / (totalTime / 1000); // 초당 의미있는 상호작용
  }

  private analyzeIdleBehavior(idleTime: number): void {
    if (window.gtag) {
      window.gtag('event', 'user_idle_detected', {
        event_category: 'engagement_analysis',
        idle_duration: idleTime,
        total_session_time: Date.now() - this.sessionStart,
        interactions_before_idle: this.interactions.length,
      });
    }
  }

  private trackAttentionSpan(): void {
    const isVisible = !document.hidden;
    if (window.gtag) {
      window.gtag('event', 'attention_change', {
        event_category: 'attention_tracking',
        is_focused: isVisible,
        session_duration: Date.now() - this.sessionStart,
      });
    }
  }

  private startTaskCompletionAnalysis(): void {
    // 페이지 내 폼 제출, 버튼 클릭 등 작업 완료 분석
    document.addEventListener('submit', (e) => {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const completionTime = Date.now() - this.sessionStart;

      if (window.gtag) {
        window.gtag('event', 'task_completion', {
          event_category: 'workflow_analysis',
          task_type: 'form_submission',
          completion_time: completionTime,
          form_fields_count: formData.keys.length || 0,
          expertise_level: this.behaviorPatterns.patterns.expertiseLevel,
        });
      }
    });
  }

  private startBehaviorAnalysis(): void {
    // 주기적으로 행동 패턴 분석 및 전송
    setInterval(() => {
      this.updateEngagementMetrics();
      this.sendBehaviorSummary();
    }, 30000); // 30초마다
  }

  private updateEngagementMetrics(): void {
    const sessionDuration = Date.now() - this.sessionStart;
    this.engagementMetrics = {
      attentionSpan: sessionDuration,
      taskSwitchingFrequency:
        this.behaviorPatterns.patterns.rapidActions.length,
      errorRecoverySpeed: this.calculateErrorRecoverySpeed(),
      featureDiscoveryRate: this.calculateFeatureDiscoveryRate(),
      workflowEfficiency: this.calculateInteractionEfficiency(),
    };
  }

  private calculateErrorRecoverySpeed(): number {
    // 실제 구현에서는 에러 상황에서의 복구 속도 측정
    return Math.random() * 100;
  }

  private calculateFeatureDiscoveryRate(): number {
    // 새로운 UI 요소 발견 비율
    const uniqueElements = new Set(this.interactions.map((i) => i.element));
    return (uniqueElements.size / this.interactions.length) * 100;
  }

  private sendBehaviorSummary(): void {
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'behavior_pattern_summary',
        behavior_analysis: {
          session_id: this.behaviorPatterns.sessionId,
          total_interactions: this.interactions.length,
          hesitation_points:
            this.behaviorPatterns.patterns.hesitationPoints.length,
          rapid_actions: this.behaviorPatterns.patterns.rapidActions.length,
          abandonment_points:
            this.behaviorPatterns.patterns.abandonmentPoints.length,
          expertise_level: this.behaviorPatterns.patterns.expertiseLevel,
          engagement_metrics: this.engagementMetrics,
          predictions: this.behaviorPatterns.predictions,
        },
        timestamp: Date.now(),
      });
    }
  }

  // === 🎛️ 공개 메서드 ===
  public getInteractionHistory(): MicroInteraction[] {
    return [...this.interactions];
  }

  public getBehaviorPatterns(): UserBehaviorPattern {
    return { ...this.behaviorPatterns };
  }

  public getEngagementMetrics(): EngagementMetrics {
    return { ...this.engagementMetrics };
  }

  public stopTracking(): void {
    this.isTracking = false;
    // 리스너들 정리는 실제 구현에서 필요
  }
}

// === 🌟 글로벌 인스턴스 관리 ===
let microTracker: MicroInteractionTracker | null = null;

export function initializeMicroInteractionTracking(): MicroInteractionTracker {
  if (!microTracker) {
    microTracker = new MicroInteractionTracker();
    microTracker.startTracking();

    // 전역 객체에 등록 (디버깅용)
    if (typeof window !== 'undefined' && import.meta.env.DEV) {
      (window as any).microTracker = microTracker;
    }
  }

  return microTracker;
}

export function getMicroTracker(): MicroInteractionTracker | null {
  return microTracker;
}

export { MicroInteractionTracker };
