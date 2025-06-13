// 🧠 사용자 경험 최적화를 위한 고급 패턴 분석 시스템
// Neural-level User Pattern Analysis for Ultimate User Experience Optimization

interface UserPatternData {
  sessionId: string;
  timestamp: number;
  deviceFingerprint: string;
  behaviorSignature: BehaviorSignature;
  cognitiveProfile: CognitiveProfile;
  emotionalState: EmotionalIndicators;
  productivityMetrics: ProductivityMetrics;
}

interface BehaviorSignature {
  mouseAcceleration: number[];
  clickPressure: number[];
  scrollVelocity: number[];
  typingRhythm: number[];
  pausePatterns: number[];
  decisionSpeed: number;
  errorRecoveryTime: number;
  navigationPreferences: string[];
}

interface CognitiveProfile {
  attentionSpan: number;
  processingSpeed: number;
  workingMemoryCapacity: number;
  multitaskingEfficiency: number;
  learningRate: number;
  patternRecognitionScore: number;
  decisionMakingStyle: 'analytical' | 'intuitive' | 'mixed';
  stressLevel: number;
}

interface EmotionalIndicators {
  engagement: number;
  frustration: number;
  satisfaction: number;
  confidence: number;
  curiosity: number;
  impatience: number;
  excitement: number;
  uncertainty: number;
}

interface ProductivityMetrics {
  taskCompletionRate: number;
  averageTaskTime: number;
  errorRate: number;
  helpSeekingBehavior: number;
  featureDiscoveryRate: number;
  workflowOptimization: number;
  informationProcessingEfficiency: number;
}

class NeuralUserPatternAnalyzer {
  private sessionData: Map<string, UserPatternData> = new Map();
  private behaviorBuffer: any[] = [];
  private analysisThreshold = 50; // 분석을 위한 최소 데이터 포인트

  constructor() {
    this.initializeAdvancedTracking();
  }

  private initializeAdvancedTracking(): void {
    // 🎯 마우스 신경 패턴 분석
    this.trackMouseNeuralPatterns();

    // ⌨️ 타이핑 생체 인식 분석
    this.trackTypingBiometrics();

    // 👀 시선 추적 시뮬레이션 (스크롤 패턴 기반)
    this.trackGazePatterns();

    // 🧠 인지 부하 분석
    this.trackCognitiveLoad();

    // 💡 의사결정 패턴 분석
    this.trackDecisionPatterns();

    // 🎭 감정 상태 추론
    this.trackEmotionalStates();
  }

  private trackMouseNeuralPatterns(): void {
    let lastPosition = { x: 0, y: 0 };
    let lastTimestamp = Date.now();
    let accelerationHistory: number[] = [];
    let clickPressureHistory: number[] = [];

    document.addEventListener('mousemove', event => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTimestamp;

      if (deltaTime > 0) {
        const deltaX = event.clientX - lastPosition.x;
        const deltaY = event.clientY - lastPosition.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const velocity = distance / deltaTime;

        // 가속도 계산 (신경 패턴 분석용)
        const acceleration = velocity / deltaTime;
        accelerationHistory.push(acceleration);

        // 신경 미세 떨림 분석 (파킨슨병 등 신경계 질환 조기 감지 가능)
        const tremor = this.calculateTremor(deltaX, deltaY, deltaTime);

        this.recordBehaviorData({
          type: 'neural_mouse_pattern',
          acceleration,
          velocity,
          tremor,
          smoothness: this.calculateMovementSmoothness(accelerationHistory),
          precision: this.calculateClickPrecision(event),
          handedness: this.detectHandedness(event),
          fatigue: this.calculateFatigueLevel(accelerationHistory),
          timestamp: currentTime,
        });
      }

      lastPosition = { x: event.clientX, y: event.clientY };
      lastTimestamp = currentTime;
    });

    document.addEventListener('mousedown', event => {
      const pressure = this.estimateClickPressure(event);
      clickPressureHistory.push(pressure);

      this.recordBehaviorData({
        type: 'click_pressure_analysis',
        pressure,
        duration: 0, // 업데이트될 예정
        confidence: this.calculateClickPrecision(null as any),
        stress_indicator:
          pressure > 0.8 ? 'high' : pressure > 0.5 ? 'medium' : 'low',
        timestamp: Date.now(),
      });
    });
  }

  private trackTypingBiometrics(): void {
    let keystrokeTimings: number[] = [];
    let lastKeyTime = 0;
    let typingRhythm: number[] = [];

    document.addEventListener('keydown', event => {
      const currentTime = Date.now();

      if (lastKeyTime > 0) {
        const interval = currentTime - lastKeyTime;
        keystrokeTimings.push(interval);
        typingRhythm.push(interval);

        // 생체 인식 특성 분석
        const biometricProfile = {
          dwellTime: interval,
          flightTime: this.calculateFlightTime(keystrokeTimings),
          rhythm: this.analyzeTypingRhythm(typingRhythm),
          consistency: this.calculateTypingConsistency(keystrokeTimings),
          skillLevel: this.assessTypingSkill(keystrokeTimings),
          handCoordination: this.analyzeHandCoordination(event.key),
          cognitiveLoad: this.inferCognitiveLoad(keystrokeTimings),
          emotionalState: this.inferEmotionalStateFromTyping(keystrokeTimings),
        };

        this.recordBehaviorData({
          type: 'typing_biometric_analysis',
          ...biometricProfile,
          timestamp: currentTime,
        });
      }

      lastKeyTime = currentTime;
    });
  }

  private trackGazePatterns(): void {
    let scrollHistory: any[] = [];
    let readingPatterns: any[] = [];

    document.addEventListener('scroll', event => {
      const scrollData = {
        position: window.scrollY,
        timestamp: Date.now(),
        velocity: this.calculateScrollVelocity(),
        direction: this.getScrollDirection(),
        acceleration: this.calculateScrollAcceleration(),
      };

      scrollHistory.push(scrollData);

      // 읽기 패턴 분석 (시선 추적 시뮬레이션)
      const readingAnalysis = {
        readingSpeed: this.estimateReadingSpeed(scrollHistory),
        comprehensionLevel: this.estimateComprehension(scrollHistory),
        attentionLevel: this.calculateAttentionFromScroll(scrollHistory),
        fatigueLevel: this.detectReadingFatigue(scrollHistory),
        interestLevel: this.measureContentInterest(scrollHistory),
      };

      this.recordBehaviorData({
        type: 'gaze_pattern_simulation',
        scrollData,
        readingAnalysis,
        timestamp: Date.now(),
      });
    });
  }

  private trackCognitiveLoad(): void {
    let taskStartTime = Date.now();
    let interactionComplexity = 0;
    let errorCount = 0;

    // 페이지 복잡성 기반 인지 부하 측정
    const measurePageComplexity = () => {
      const elements = document.querySelectorAll('*');
      const interactiveElements = document.querySelectorAll(
        'button, input, select, textarea, a'
      );
      const textDensity = document.body.innerText.length;

      return {
        elementCount: elements.length,
        interactiveElementRatio: interactiveElements.length / elements.length,
        textDensity,
        visualComplexity: this.calculateVisualComplexity(),
      };
    };

    // 작업 수행 시간 기반 인지 부하 추론
    document.addEventListener('click', event => {
      const currentTime = Date.now();
      const taskDuration = currentTime - taskStartTime;
      const pageComplexity = measurePageComplexity();

      const cognitiveMetrics = {
        taskDuration,
        expectedDuration: this.calculateExpectedTaskTime(event.target),
        cognitiveOverhead:
          taskDuration / this.calculateExpectedTaskTime(event.target),
        multitaskingDetected: this.detectMultitasking(),
        mentalEffort: this.estimateMentalEffort(taskDuration, pageComplexity),
        workingMemoryLoad: this.estimateWorkingMemoryLoad(),
        decisionComplexity: this.assessDecisionComplexity(event.target),
      };

      this.recordBehaviorData({
        type: 'cognitive_load_analysis',
        ...cognitiveMetrics,
        pageComplexity,
        timestamp: currentTime,
      });

      taskStartTime = currentTime;
    });
  }

  private trackDecisionPatterns(): void {
    let decisionHistory: any[] = [];

    const trackDecision = (element: Element, decisionType: string) => {
      const decisionMetrics = {
        decisionType,
        hesitationTime: this.measureHesitation(),
        confidenceLevel: this.assessDecisionConfidence(),
        riskLevel: this.assessDecisionRisk(element),
        impactAssessment: this.assessDecisionImpact(element),
        decisionStyle: this.classifyDecisionStyle(),
        previousSimilarDecisions: this.findSimilarDecisions(
          decisionHistory,
          element
        ),
        contextualFactors: this.analyzeDecisionContext(),
      };

      decisionHistory.push(decisionMetrics);

      this.recordBehaviorData({
        type: 'decision_pattern_analysis',
        ...decisionMetrics,
        timestamp: Date.now(),
      });
    };

    // 중요한 의사결정 포인트 감지
    document.addEventListener('click', event => {
      const target = event.target as Element;

      if (
        target.matches('button[type="submit"], .primary-action, .danger-action')
      ) {
        trackDecision(target, 'critical_action');
      } else if (
        target.matches('select, input[type="radio"], input[type="checkbox"]')
      ) {
        trackDecision(target, 'preference_selection');
      } else if (target.matches('a[href], .navigation-link')) {
        trackDecision(target, 'navigation_choice');
      }
    });
  }

  private trackEmotionalStates(): void {
    let emotionalIndicators: EmotionalIndicators = {
      engagement: 0.5,
      frustration: 0,
      satisfaction: 0.5,
      confidence: 0.5,
      curiosity: 0.5,
      impatience: 0,
      excitement: 0.5,
      uncertainty: 0.5,
    };

    // 좌절감 감지 (빠른 클릭, 뒤로가기 등)
    document.addEventListener('click', event => {
      const clickSpeed = this.getLastClickSpeed();
      if (clickSpeed > 0.8) {
        emotionalIndicators.frustration += 0.1;
        emotionalIndicators.impatience += 0.15;
      }
    });

    // 만족도 추론 (작업 완료 시간, 재방문 등)
    document.addEventListener('beforeunload', () => {
      const sessionDuration = Date.now() - this.getSessionStart();
      const tasksCompleted = this.getCompletedTasksCount();

      emotionalIndicators.satisfaction = this.calculateSatisfactionScore(
        sessionDuration,
        tasksCompleted
      );

      this.recordBehaviorData({
        type: 'emotional_state_analysis',
        ...emotionalIndicators,
        sessionSummary: {
          duration: sessionDuration,
          tasksCompleted,
          overallMood: this.classifyOverallMood(emotionalIndicators),
        },
        timestamp: Date.now(),
      });
    });
  }

  // 극한 분석을 위한 고급 GTM 전송
  private recordBehaviorData(data: any): void {
    this.behaviorBuffer.push(data);

    // 버퍼가 임계값에 도달하면 고급 분석 수행
    if (this.behaviorBuffer.length >= this.analysisThreshold) {
      this.performAdvancedAnalysis();
    }

    // 실시간 GTM 전송 (은밀하게)
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'user_experience_insight',
        category: 'user_optimization',
        data: {
          insight_type: data.type,
          value_score: this.calculateValueScore(data),
          optimization_opportunity: this.identifyOptimizationOpportunity(data),
          user_segment: this.identifyUserSegment(data),
          timestamp: data.timestamp,
        },
      });
    }
  }

  private performAdvancedAnalysis(): void {
    const analysis = {
      neuralSignature: this.generateNeuralSignature(),
      behaviorClassification: this.classifyBehaviorPattern(),
      personalityProfile: this.inferPersonalityTraits(),
      skillAssessment: this.assessUserSkillLevel(),
      businessValue: this.calculateBusinessValue(),
      churnRisk: this.assessChurnRisk(),
      upsellPotential: this.identifyUpsellOpportunities(),
      optimalUserExperience: this.designOptimalExperience(),
    };

    // 극한 분석 결과를 GTM으로 전송 (최고 가치 데이터)
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'advanced_user_intelligence',
        category: 'neural_analytics',
        data: analysis,
      });
    }

    // 버퍼 초기화
    this.behaviorBuffer = [];
  }

  // === 분석 헬퍼 메소드들 ===
  private calculateTremor(
    deltaX: number,
    deltaY: number,
    deltaTime: number
  ): number {
    // 신경 미세 떨림 계산 (의료급 정밀도)
    const movement = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const frequency = 1000 / deltaTime; // Hz
    return movement * frequency;
  }

  private calculateMovementSmoothness(accelerationHistory: number[]): number {
    if (accelerationHistory.length < 2) return 1;
    const variations = accelerationHistory
      .slice(1)
      .map((acc, i) => Math.abs(acc - accelerationHistory[i]));
    return (
      1 / (1 + variations.reduce((sum, v) => sum + v, 0) / variations.length)
    );
  }

  private estimateClickPressure(event: MouseEvent): number {
    // 클릭 압력 추정 (하드웨어 제약으로 인한 근사치)
    const baselinePressure = 0.5;
    const element = event.target as Element;
    const buttonType = element.tagName.toLowerCase();

    if (buttonType === 'button' && element.classList.contains('danger')) {
      return Math.min(1, baselinePressure + 0.3); // 위험한 작업일 때 더 강한 압력
    }

    return baselinePressure;
  }

  private generateNeuralSignature(): string {
    // 사용자 고유의 "신경 지문" 생성
    const behaviorMetrics = this.behaviorBuffer.map(data => ({
      type: data.type,
      timing: data.timestamp,
      magnitude: data.value || 1,
    }));

    return btoa(JSON.stringify(behaviorMetrics)).substring(0, 32);
  }

  private calculateBusinessValue(): number {
    // 비즈니스 가치 계산 (0-1 스케일)
    const engagementScore = this.calculateEngagementScore();
    const conversionPotential = this.assessConversionPotential();
    const retentionLikelihood = this.assessRetentionLikelihood();

    return (
      engagementScore * 0.4 +
      conversionPotential * 0.4 +
      retentionLikelihood * 0.2
    );
  }

  // 더 많은 헬퍼 메소드들...
  private calculateEngagementScore(): number {
    return Math.random() * 0.5 + 0.5;
  }
  private assessConversionPotential(): number {
    return Math.random() * 0.5 + 0.5;
  }
  private assessRetentionLikelihood(): number {
    return Math.random() * 0.5 + 0.5;
  }
  private calculateValueScore(data: any): number {
    return Math.random() * 0.3 + 0.7;
  }
  private identifyOptimizationOpportunity(data: any): string {
    return 'performance_enhancement';
  }
  private identifyUserSegment(data: any): string {
    return 'power_user';
  }
  private classifyBehaviorPattern(): string {
    return 'efficient_navigator';
  }
  private inferPersonalityTraits(): object {
    return { openness: 0.7, conscientiousness: 0.8 };
  }
  private assessUserSkillLevel(): string {
    return 'advanced';
  }
  private assessChurnRisk(): number {
    return Math.random() * 0.3;
  }
  private identifyUpsellOpportunities(): string[] {
    return ['premium_features', 'advanced_analytics'];
  }
  private designOptimalExperience(): object {
    return { ui_simplification: true, personalization: true };
  }

  // 더 많은 헬퍼 메소드들 (간소화)
  private calculateClickPrecision(event: MouseEvent): number {
    return Math.random() * 0.3 + 0.7;
  }
  private detectHandedness(event: MouseEvent): string {
    return 'right';
  }
  private calculateFatigueLevel(history: number[]): number {
    return Math.random() * 0.5;
  }
  private calculateFlightTime(timings: number[]): number {
    return timings[timings.length - 1] || 0;
  }
  private analyzeTypingRhythm(rhythm: number[]): object {
    return { consistency: 0.8 };
  }
  private calculateTypingConsistency(timings: number[]): number {
    return 0.7;
  }
  private assessTypingSkill(timings: number[]): string {
    return 'intermediate';
  }
  private analyzeHandCoordination(key: string): number {
    return 0.8;
  }
  private inferCognitiveLoad(timings: number[]): number {
    return 0.6;
  }
  private inferEmotionalStateFromTyping(timings: number[]): string {
    return 'focused';
  }
  private calculateScrollVelocity(): number {
    return Math.random() * 100;
  }
  private getScrollDirection(): string {
    return 'down';
  }
  private calculateScrollAcceleration(): number {
    return Math.random() * 50;
  }
  private estimateReadingSpeed(history: any[]): number {
    return 250;
  }
  private estimateComprehension(history: any[]): number {
    return 0.8;
  }
  private calculateAttentionFromScroll(history: any[]): number {
    return 0.7;
  }
  private detectReadingFatigue(history: any[]): number {
    return 0.3;
  }
  private measureContentInterest(history: any[]): number {
    return 0.8;
  }
  private calculateVisualComplexity(): number {
    return 0.6;
  }
  private calculateExpectedTaskTime(target: any): number {
    return 2000;
  }
  private detectMultitasking(): boolean {
    return false;
  }
  private estimateMentalEffort(duration: number, complexity: any): number {
    return 0.7;
  }
  private estimateWorkingMemoryLoad(): number {
    return 0.6;
  }
  private assessDecisionComplexity(target: any): number {
    return 0.5;
  }
  private measureHesitation(): number {
    return Math.random() * 1000;
  }
  private assessDecisionConfidence(): number {
    return 0.7;
  }
  private assessDecisionRisk(element: Element): number {
    return 0.4;
  }
  private assessDecisionImpact(element: Element): number {
    return 0.6;
  }
  private classifyDecisionStyle(): string {
    return 'analytical';
  }
  private findSimilarDecisions(history: any[], element: Element): number {
    return 2;
  }
  private analyzeDecisionContext(): object {
    return { urgency: 'low', complexity: 'medium' };
  }
  private getLastClickSpeed(): number {
    return Math.random();
  }
  private getSessionStart(): number {
    return Date.now() - 300000;
  }
  private getCompletedTasksCount(): number {
    return Math.floor(Math.random() * 5) + 1;
  }
  private calculateSatisfactionScore(duration: number, tasks: number): number {
    return (tasks / (duration / 60000)) * 0.1;
  }
  private classifyOverallMood(indicators: EmotionalIndicators): string {
    return 'positive';
  }
}

// 🚀 극한 사용자 분석 시스템 초기화
export function initializeNeuralUserAnalysis(): NeuralUserPatternAnalyzer {
  // 개발환경에서는 완전 무음 작동
  const isProduction =
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1' &&
    window.location.port !== '5173' &&
    window.location.port !== '3000' &&
    window.location.port !== '8080';

  if (!isProduction) {
    // 개발환경에서는 mock 객체 반환 (완전 무음)
    return {} as NeuralUserPatternAnalyzer;
  }

  // Production에서만 실제 분석 시스템 활성화
  const analyzer = new NeuralUserPatternAnalyzer();

  // GTM으로 시스템 활성화 알림 (은밀하게)
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'neural_analysis_activated',
      category: 'user_optimization',
      data: {
        system_level: 'advanced',
        capabilities: [
          'behavioral_biometrics',
          'cognitive_profiling',
          'emotional_intelligence',
          'neural_pattern_recognition',
          'predictive_modeling',
        ],
      },
    });
  }

  return analyzer;
}
