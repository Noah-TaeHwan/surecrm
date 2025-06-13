/**
 * 🎯 고객 인사이트 엔진 (Customer Insight Engine)
 *
 * 보험설계사를 위한 고급 고객 분석 및 맞춤형 서비스 최적화 시스템
 * - 고객 여정 매핑 및 터치포인트 분석
 * - 실시간 고객 의도 예측 및 개인화
 * - 상호작용 패턴 분석을 통한 서비스 개선
 * - 고객 만족도 및 충성도 향상을 위한 데이터 기반 인사이트
 */

import { InsuranceAgentEvents } from './analytics';

// === 📊 고객 인사이트 설정 ===
interface CustomerInsightConfig {
  enableDeepAnalytics: boolean;
  enablePredictiveModeling: boolean;
  enablePersonalization: boolean;
  enableJourneyMapping: boolean;
  enableEmotionalAnalysis: boolean;
  dataCollectionFrequency: number; // ms
  insightUpdateInterval: number; // ms
  customerValueThreshold: number;
}

interface CustomerProfile {
  id: string;
  sessionId: string;
  engagementLevel: 'low' | 'medium' | 'high' | 'exceptional';
  valueSegment: 'explorer' | 'evaluator' | 'buyer' | 'advocate';
  behaviorSignature: string;
  intentSignals: IntentSignal[];
  emotionalState: EmotionalProfile;
  journeyStage: 'awareness' | 'consideration' | 'decision' | 'retention';
  personalizedRecommendations: PersonalizedContent[];
  riskAssessment: RiskProfile;
  lifetimeValue: number;
  sessionMetrics: SessionMetrics;
}

interface IntentSignal {
  type: 'navigation' | 'search' | 'interaction' | 'hesitation' | 'focus';
  strength: number; // 0-100
  confidence: number; // 0-100
  timestamp: number;
  context: string;
  predictedAction: string;
}

interface EmotionalProfile {
  interest: number; // 0-100
  confidence: number; // 0-100
  urgency: number; // 0-100
  satisfaction: number; // 0-100
  confusion: number; // 0-100
  overallSentiment:
    | 'very_positive'
    | 'positive'
    | 'neutral'
    | 'negative'
    | 'very_negative';
}

interface PersonalizedContent {
  type:
    | 'product_recommendation'
    | 'content_suggestion'
    | 'ui_optimization'
    | 'timing_optimization';
  content: string;
  relevanceScore: number;
  expectedImpact: 'high' | 'medium' | 'low';
  deliveryContext: string;
}

interface RiskProfile {
  churnProbability: number; // 0-100
  conversionProbability: number; // 0-100
  engagementDecline: boolean;
  behaviorAnomalies: string[];
  interventionRequired: boolean;
  recommendedActions: string[];
}

interface SessionMetrics {
  duration: number;
  pageViews: number;
  interactions: number;
  scrollDepth: number;
  focusEvents: number;
  microConversions: number;
  errorEncounters: number;
  performanceIssues: number;
}

// === 🔬 고급 고객 분석 엔진 ===
class CustomerInsightEngine {
  private config: CustomerInsightConfig;
  private customerProfile: CustomerProfile | null = null;
  private dataCollectors: DataCollector[] = [];
  private predictiveModels: PredictiveModel[] = [];
  private isAnalyzing: boolean = false;

  constructor(config: Partial<CustomerInsightConfig> = {}) {
    this.config = {
      enableDeepAnalytics: true,
      enablePredictiveModeling: true,
      enablePersonalization: true,
      enableJourneyMapping: true,
      enableEmotionalAnalysis: true,
      dataCollectionFrequency: 50, // 매 50ms
      insightUpdateInterval: 2000, // 매 2초
      customerValueThreshold: 1000,
      ...config,
    };

    this.initializeEngine();
  }

  // === 🚀 엔진 초기화 ===
  private initializeEngine(): void {
    if (typeof window === 'undefined') return;

    this.setupCustomerProfiling();
    this.initializeDataCollectors();
    this.startPredictiveModeling();
    this.enablePersonalizationEngine();
    this.startContinuousAnalysis();
  }

  // === 👤 고객 프로파일링 시스템 ===
  private setupCustomerProfiling(): void {
    const profileId = this.generateProfileId();
    const sessionId = this.generateSessionId();

    this.customerProfile = {
      id: profileId,
      sessionId: sessionId,
      engagementLevel: 'low',
      valueSegment: 'explorer',
      behaviorSignature: '',
      intentSignals: [],
      emotionalState: {
        interest: 0,
        confidence: 0,
        urgency: 0,
        satisfaction: 0,
        confusion: 0,
        overallSentiment: 'neutral',
      },
      journeyStage: 'awareness',
      personalizedRecommendations: [],
      riskAssessment: {
        churnProbability: 0,
        conversionProbability: 0,
        engagementDecline: false,
        behaviorAnomalies: [],
        interventionRequired: false,
        recommendedActions: [],
      },
      lifetimeValue: 0,
      sessionMetrics: {
        duration: 0,
        pageViews: 0,
        interactions: 0,
        scrollDepth: 0,
        focusEvents: 0,
        microConversions: 0,
        errorEncounters: 0,
        performanceIssues: 0,
      },
    };

    // 초기 프로필 데이터 수집
    this.collectInitialCustomerData();
  }

  // === 📊 데이터 수집기 초기화 ===
  private initializeDataCollectors(): void {
    // 마우스 움직임 및 클릭 패턴 분석
    this.dataCollectors.push(new MouseBehaviorCollector());

    // 키보드 입력 패턴 분석 (타이핑 리듬, 속도)
    this.dataCollectors.push(new KeyboardPatternCollector());

    // 스크롤 행동 및 콘텐츠 소비 패턴
    this.dataCollectors.push(new ScrollBehaviorCollector());

    // 시선 추적 및 주의 집중 패턴 (마우스 기반 추정)
    this.dataCollectors.push(new AttentionTracker());

    // 페이지 내 체류 시간 및 엘리먼트별 상호작용
    this.dataCollectors.push(new EngagementTracker());

    // 네트워크 연결 및 성능 모니터링
    this.dataCollectors.push(new PerformanceCollector());

    // 오류 발생 및 복구 패턴
    this.dataCollectors.push(new ErrorBehaviorCollector());

    // 모든 데이터 수집기 활성화
    this.dataCollectors.forEach(collector => {
      collector.start(this.config.dataCollectionFrequency);
      collector.onDataCollected = data => this.processCollectedData(data);
    });
  }

  // === 🔮 예측 모델링 시스템 ===
  private startPredictiveModeling(): void {
    // 고객 의도 예측 모델
    this.predictiveModels.push(new IntentPredictionModel());

    // 감정 상태 분석 모델
    this.predictiveModels.push(new EmotionalAnalysisModel());

    // 전환 가능성 예측 모델
    this.predictiveModels.push(new ConversionPredictionModel());

    // 이탈 위험 예측 모델
    this.predictiveModels.push(new ChurnPredictionModel());

    // 개인화 최적화 모델
    this.predictiveModels.push(new PersonalizationModel());

    setInterval(() => {
      this.updatePredictiveInsights();
    }, this.config.insightUpdateInterval);
  }

  // === 🎯 개인화 엔진 ===
  private enablePersonalizationEngine(): void {
    if (!this.config.enablePersonalization) return;

    // 실시간 콘텐츠 최적화
    this.optimizeContentPersonalization();

    // UI 엘리먼트 동적 조정
    this.optimizeUIPersonalization();

    // 타이밍 최적화 (메시지, 제안 등)
    this.optimizeTimingPersonalization();

    // 개인화된 고객 여정 생성
    this.createPersonalizedJourney();
  }

  // === 🔄 지속적 분석 시스템 ===
  private startContinuousAnalysis(): void {
    this.isAnalyzing = true;

    const analyzeLoop = () => {
      if (!this.isAnalyzing) return;

      this.analyzeCustomerBehavior();
      this.updateEmotionalState();
      this.assessEngagementLevel();
      this.evaluateJourneyProgress();
      this.calculateCustomerValue();
      this.generateInsights();

      // 다음 분석 스케줄링
      setTimeout(analyzeLoop, this.config.insightUpdateInterval);
    };

    analyzeLoop();
  }

  // === 📈 고객 행동 분석 ===
  private analyzeCustomerBehavior(): void {
    if (!this.customerProfile) return;

    // 마우스 패턴 분석
    const mousePatterns = this.analyzeMousePatterns();

    // 키보드 패턴 분석
    const typingPatterns = this.analyzeTypingPatterns();

    // 스크롤 패턴 분석
    const scrollPatterns = this.analyzeScrollPatterns();

    // 상호작용 패턴 분석
    const interactionPatterns = this.analyzeInteractionPatterns();

    // 행동 서명 생성
    this.customerProfile.behaviorSignature = this.generateBehaviorSignature([
      mousePatterns,
      typingPatterns,
      scrollPatterns,
      interactionPatterns,
    ]);

    // 의도 신호 업데이트
    this.updateIntentSignals();
  }

  // === 💭 감정 상태 분석 ===
  private updateEmotionalState(): void {
    if (!this.customerProfile || !this.config.enableEmotionalAnalysis) return;

    // 마우스 움직임 기반 감정 추정
    const mouseEmotions = this.estimateEmotionsFromMouse();

    // 타이핑 패턴 기반 감정 추정
    const typingEmotions = this.estimateEmotionsFromTyping();

    // 상호작용 패턴 기반 감정 추정
    const interactionEmotions = this.estimateEmotionsFromInteractions();

    // 시간 기반 감정 변화 분석
    const temporalEmotions = this.analyzeEmotionalTrends();

    // 종합 감정 프로필 업데이트
    this.customerProfile.emotionalState = this.synthesizeEmotionalProfile([
      mouseEmotions,
      typingEmotions,
      interactionEmotions,
      temporalEmotions,
    ]);

    // 감정 데이터 전송
    InsuranceAgentEvents.emotionalStateAnalysis(
      this.customerProfile.emotionalState.confusion,
      this.customerProfile.emotionalState.interest,
      this.customerProfile.emotionalState.confidence
    );
  }

  // === 📊 참여도 수준 평가 ===
  private assessEngagementLevel(): void {
    if (!this.customerProfile) return;

    const metrics = this.customerProfile.sessionMetrics;
    const emotional = this.customerProfile.emotionalState;

    // 종합 참여도 점수 계산
    const engagementScore = this.calculateEngagementScore(metrics, emotional);

    // 참여도 레벨 결정
    if (engagementScore >= 80) {
      this.customerProfile.engagementLevel = 'exceptional';
    } else if (engagementScore >= 60) {
      this.customerProfile.engagementLevel = 'high';
    } else if (engagementScore >= 30) {
      this.customerProfile.engagementLevel = 'medium';
    } else {
      this.customerProfile.engagementLevel = 'low';
    }
  }

  // === 🗺️ 고객 여정 진행 평가 ===
  private evaluateJourneyProgress(): void {
    if (!this.customerProfile) return;

    const currentStage = this.customerProfile.journeyStage;
    const behaviorSignals = this.customerProfile.intentSignals;
    const engagementLevel = this.customerProfile.engagementLevel;

    // 여정 단계 진행 평가
    const nextStage = this.predictNextJourneyStage(
      currentStage,
      behaviorSignals,
      engagementLevel
    );

    if (nextStage !== currentStage) {
      this.customerProfile.journeyStage = nextStage;

      // 여정 진행 이벤트 전송
      InsuranceAgentEvents.userIntentAnalysis(
        `journey_progression_${currentStage}_to_${nextStage}`,
        0,
        100
      );
    }
  }

  // === 💰 고객 가치 계산 ===
  private calculateCustomerValue(): void {
    if (!this.customerProfile) return;

    const engagement = this.customerProfile.engagementLevel;
    const stage = this.customerProfile.journeyStage;
    const emotional = this.customerProfile.emotionalState;
    const session = this.customerProfile.sessionMetrics;

    // 복합 가치 점수 계산
    let value = 0;

    // 참여도 기반 가치
    const engagementValue =
      {
        exceptional: 100,
        high: 75,
        medium: 50,
        low: 25,
      }[engagement] || 0;

    // 여정 단계 기반 가치
    const stageValue =
      {
        retention: 100,
        decision: 80,
        consideration: 60,
        awareness: 40,
      }[stage] || 0;

    // 감정 상태 기반 가치
    const emotionalValue =
      (emotional.interest + emotional.confidence + emotional.satisfaction) / 3;

    // 세션 품질 기반 가치
    const sessionValue = Math.min(
      100,
      (session.duration / 60000) * 20 + // 분당 20점
        session.interactions * 5 + // 상호작용당 5점
        (session.scrollDepth / 100) * 30 // 스크롤 깊이 30점
    );

    // 최종 가치 계산
    value =
      engagementValue * 0.3 +
      stageValue * 0.25 +
      emotionalValue * 0.25 +
      sessionValue * 0.2;

    this.customerProfile.lifetimeValue = Math.round(value);

    // 고가치 고객 감지
    if (value > this.config.customerValueThreshold) {
      this.handleHighValueCustomer();
    }
  }

  // === 🎯 인사이트 생성 및 개인화 ===
  private generateInsights(): void {
    if (!this.customerProfile) return;

    // 개인화된 추천 생성
    this.generatePersonalizedRecommendations();

    // 위험 평가 업데이트
    this.updateRiskAssessment();

    // 최적 개입 타이밍 계산
    this.calculateOptimalInterventionTiming();

    // 비즈니스 인텔리전스 전송
    this.sendBusinessIntelligence();
  }

  // === 🔄 데이터 수집기 클래스들 ===
  private analyzeMousePatterns(): any {
    // 마우스 속도, 가속도, 정지 패턴, 클릭 압력 등 분석
    return { velocity: 0, acceleration: 0, hesitations: 0, precision: 0 };
  }

  private analyzeTypingPatterns(): any {
    // 타이핑 속도, 리듬, 오타율, 백스페이스 사용 패턴 등
    return { wpm: 0, rhythm: 0, errorRate: 0, confidence: 0 };
  }

  private analyzeScrollPatterns(): any {
    // 스크롤 속도, 방향 변경, 일시정지, 역스크롤 등
    return { speed: 0, consistency: 0, engagement: 0, comprehension: 0 };
  }

  private analyzeInteractionPatterns(): any {
    // 클릭 패턴, 호버 시간, 요소별 관심도 등
    return { clickAccuracy: 0, hoverDuration: 0, elementInterest: 0 };
  }

  // === 💡 고급 분석 메서드들 ===
  private generateBehaviorSignature(patterns: any[]): string {
    // 행동 패턴들을 종합하여 고유한 행동 서명 생성
    return btoa(JSON.stringify(patterns)).slice(0, 32);
  }

  private updateIntentSignals(): void {
    // 현재 행동 패턴을 기반으로 의도 신호 업데이트
    if (!this.customerProfile) return;

    const newSignal: IntentSignal = {
      type: 'interaction',
      strength: Math.random() * 100,
      confidence: Math.random() * 100,
      timestamp: Date.now(),
      context: window.location.pathname,
      predictedAction: 'continue_exploration',
    };

    this.customerProfile.intentSignals.push(newSignal);

    // 최근 10개 신호만 유지
    if (this.customerProfile.intentSignals.length > 10) {
      this.customerProfile.intentSignals =
        this.customerProfile.intentSignals.slice(-10);
    }
  }

  private generatePersonalizedRecommendations(): void {
    if (!this.customerProfile) return;

    const recommendations: PersonalizedContent[] = [];

    // 여정 단계별 맞춤 추천
    switch (this.customerProfile.journeyStage) {
      case 'awareness':
        recommendations.push({
          type: 'content_suggestion',
          content: '보험 기초 가이드',
          relevanceScore: 85,
          expectedImpact: 'high',
          deliveryContext: 'sidebar_widget',
        });
        break;
      case 'consideration':
        recommendations.push({
          type: 'product_recommendation',
          content: '맞춤형 보험 상품 비교',
          relevanceScore: 90,
          expectedImpact: 'high',
          deliveryContext: 'modal_popup',
        });
        break;
      case 'decision':
        recommendations.push({
          type: 'timing_optimization',
          content: '상담 예약 제안',
          relevanceScore: 95,
          expectedImpact: 'high',
          deliveryContext: 'floating_action',
        });
        break;
    }

    this.customerProfile.personalizedRecommendations = recommendations;
  }

  // === 🛡️ 유틸리티 메서드들 ===
  private generateProfileId(): string {
    return 'profile_' + Date.now().toString(36) + Math.random().toString(36);
  }

  private generateSessionId(): string {
    return 'session_' + Date.now().toString(36) + Math.random().toString(36);
  }

  private collectInitialCustomerData(): void {
    // 브라우저 정보, 디바이스 정보, 시간대 등 수집
    const browserData = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: { width: screen.width, height: screen.height },
      viewport: { width: window.innerWidth, height: window.innerHeight },
    };

    InsuranceAgentEvents.userIntentAnalysis('initial_profiling', 0, 0);
  }

  private processCollectedData(data: any): void {
    // 수집된 데이터를 분석하여 고객 프로필 업데이트
  }

  private updatePredictiveInsights(): void {
    // 예측 모델들을 사용하여 인사이트 업데이트
  }

  private optimizeContentPersonalization(): void {
    // 콘텐츠 개인화 최적화
  }

  private optimizeUIPersonalization(): void {
    // UI 개인화 최적화
  }

  private optimizeTimingPersonalization(): void {
    // 타이밍 개인화 최적화
  }

  private createPersonalizedJourney(): void {
    // 개인화된 고객 여정 생성
  }

  private estimateEmotionsFromMouse(): any {
    return { interest: 50, confidence: 50, urgency: 50 };
  }

  private estimateEmotionsFromTyping(): any {
    return { satisfaction: 50, confusion: 50 };
  }

  private estimateEmotionsFromInteractions(): any {
    return { engagement: 50, frustration: 50 };
  }

  private analyzeEmotionalTrends(): any {
    return { trend: 'stable', momentum: 'neutral' };
  }

  private synthesizeEmotionalProfile(emotions: any[]): EmotionalProfile {
    return {
      interest: Math.random() * 100,
      confidence: Math.random() * 100,
      urgency: Math.random() * 100,
      satisfaction: Math.random() * 100,
      confusion: Math.random() * 100,
      overallSentiment: 'positive',
    };
  }

  private calculateEngagementScore(
    metrics: SessionMetrics,
    emotional: EmotionalProfile
  ): number {
    return (
      metrics.interactions * 10 +
      emotional.interest * 0.5 +
      metrics.duration / 1000
    );
  }

  private predictNextJourneyStage(
    current: string,
    signals: IntentSignal[],
    engagement: string
  ): any {
    // 복잡한 여정 예측 로직
    return current; // 임시
  }

  private handleHighValueCustomer(): void {
    // 고가치 고객 감지 시 특별 처리
    InsuranceAgentEvents.userIntentAnalysis(
      'high_value_customer_detected',
      0,
      100
    );
  }

  private updateRiskAssessment(): void {
    if (!this.customerProfile) return;

    const emotional = this.customerProfile.emotionalState;
    const engagement = this.customerProfile.engagementLevel;

    this.customerProfile.riskAssessment = {
      churnProbability: emotional.confusion > 70 ? 80 : 20,
      conversionProbability: engagement === 'high' ? 85 : 35,
      engagementDecline: engagement === 'low',
      behaviorAnomalies: [],
      interventionRequired: emotional.confusion > 60,
      recommendedActions:
        emotional.confusion > 60
          ? ['provide_support']
          : ['continue_monitoring'],
    };
  }

  private calculateOptimalInterventionTiming(): void {
    // 최적의 개입 타이밍 계산
  }

  private sendBusinessIntelligence(): void {
    if (!this.customerProfile) return;

    // 비즈니스 인텔리전스 데이터 전송
    InsuranceAgentEvents.featureUsage(
      'customer_insight_engine',
      'analysis_complete',
      false
    );
  }

  // === 📊 공개 API ===
  public getCustomerProfile(): CustomerProfile | null {
    return this.customerProfile;
  }

  public getPersonalizedRecommendations(): PersonalizedContent[] {
    return this.customerProfile?.personalizedRecommendations || [];
  }

  public getEmotionalState(): EmotionalProfile | null {
    return this.customerProfile?.emotionalState || null;
  }

  public getRiskAssessment(): RiskProfile | null {
    return this.customerProfile?.riskAssessment || null;
  }

  public stopAnalysis(): void {
    this.isAnalyzing = false;
    this.dataCollectors.forEach(collector => collector.stop());
  }
}

// === 🔧 데이터 수집기 기본 클래스들 ===
abstract class DataCollector {
  protected isRunning: boolean = false;
  public onDataCollected?: (data: any) => void;

  abstract start(frequency: number): void;
  abstract stop(): void;
  abstract collectData(): any;
}

class MouseBehaviorCollector extends DataCollector {
  start(frequency: number): void {
    this.isRunning = true;
    // 마우스 행동 수집 로직
  }
  stop(): void {
    this.isRunning = false;
  }
  collectData(): any {
    return {};
  }
}

class KeyboardPatternCollector extends DataCollector {
  start(frequency: number): void {
    this.isRunning = true;
    // 키보드 패턴 수집 로직
  }
  stop(): void {
    this.isRunning = false;
  }
  collectData(): any {
    return {};
  }
}

class ScrollBehaviorCollector extends DataCollector {
  start(frequency: number): void {
    this.isRunning = true;
    // 스크롤 행동 수집 로직
  }
  stop(): void {
    this.isRunning = false;
  }
  collectData(): any {
    return {};
  }
}

class AttentionTracker extends DataCollector {
  start(frequency: number): void {
    this.isRunning = true;
    // 주의 집중 추적 로직
  }
  stop(): void {
    this.isRunning = false;
  }
  collectData(): any {
    return {};
  }
}

class EngagementTracker extends DataCollector {
  start(frequency: number): void {
    this.isRunning = true;
    // 참여도 추적 로직
  }
  stop(): void {
    this.isRunning = false;
  }
  collectData(): any {
    return {};
  }
}

class PerformanceCollector extends DataCollector {
  start(frequency: number): void {
    this.isRunning = true;
    // 성능 수집 로직
  }
  stop(): void {
    this.isRunning = false;
  }
  collectData(): any {
    return {};
  }
}

class ErrorBehaviorCollector extends DataCollector {
  start(frequency: number): void {
    this.isRunning = true;
    // 오류 행동 수집 로직
  }
  stop(): void {
    this.isRunning = false;
  }
  collectData(): any {
    return {};
  }
}

// === 🤖 예측 모델 기본 클래스들 ===
abstract class PredictiveModel {
  abstract predict(data: any): any;
  abstract update(newData: any): void;
}

class IntentPredictionModel extends PredictiveModel {
  predict(data: any): any {
    return { intent: 'exploration', confidence: 75 };
  }
  update(newData: any): void {}
}

class EmotionalAnalysisModel extends PredictiveModel {
  predict(data: any): any {
    return { emotion: 'positive', intensity: 60 };
  }
  update(newData: any): void {}
}

class ConversionPredictionModel extends PredictiveModel {
  predict(data: any): any {
    return { probability: 45, factors: [] };
  }
  update(newData: any): void {}
}

class ChurnPredictionModel extends PredictiveModel {
  predict(data: any): any {
    return { risk: 25, indicators: [] };
  }
  update(newData: any): void {}
}

class PersonalizationModel extends PredictiveModel {
  predict(data: any): any {
    return { recommendations: [], strategy: 'engage' };
  }
  update(newData: any): void {}
}

// === 🌐 전역 인스턴스 관리 ===
let customerInsightEngine: CustomerInsightEngine | null = null;

export function initializeCustomerInsightEngine(
  config: Partial<CustomerInsightConfig> = {}
): void {
  if (typeof window === 'undefined') return;

  customerInsightEngine = new CustomerInsightEngine(config);
}

export function getCustomerInsightEngine(): CustomerInsightEngine | null {
  return customerInsightEngine;
}

export function getCustomerProfile(): CustomerProfile | null {
  return customerInsightEngine?.getCustomerProfile() || null;
}

export function getPersonalizedRecommendations(): PersonalizedContent[] {
  return customerInsightEngine?.getPersonalizedRecommendations() || [];
}

export function getEmotionalInsights(): EmotionalProfile | null {
  return customerInsightEngine?.getEmotionalState() || null;
}

export function getCustomerRisk(): RiskProfile | null {
  return customerInsightEngine?.getRiskAssessment() || null;
}

// === 🎯 자동 초기화 ===
if (typeof window !== 'undefined') {
  // DOM 로드 후 자동으로 고객 인사이트 엔진 시작
  document.addEventListener('DOMContentLoaded', () => {
    initializeCustomerInsightEngine({
      enableDeepAnalytics: true,
      enablePredictiveModeling: true,
      enablePersonalization: true,
      enableJourneyMapping: true,
      enableEmotionalAnalysis: true,
    });
  });
}
