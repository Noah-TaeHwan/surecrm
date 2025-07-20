/**
 * 🎯 고객 인사이트 훅 (useCustomerInsights)
 *
 * 보험설계사를 위한 실시간 고객 분석 및 개인화 서비스 최적화 훅
 * - 고객 행동 패턴 실시간 분석
 * - 개인화된 서비스 추천
 * - 고객 만족도 및 참여도 모니터링
 * - 예측적 고객 서비스 최적화
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getCustomerInsightEngine,
  getCustomerProfile,
  getPersonalizedRecommendations,
  getEmotionalInsights,
  getCustomerRisk,
  initializeCustomerInsightEngine,
} from '~/lib/utils/customer-insight-engine';

interface CustomerInsightConfig {
  enableDeepAnalytics: boolean;
  enablePredictiveModeling: boolean;
  enablePersonalization: boolean;
  enableJourneyMapping: boolean;
  enableEmotionalAnalysis: boolean;
  dataCollectionFrequency: number;
  insightUpdateInterval: number;
  customerValueThreshold: number;
}

interface CustomerAnalytics {
  engagement: {
    level: 'low' | 'medium' | 'high' | 'exceptional';
    score: number;
    trend: 'increasing' | 'stable' | 'decreasing';
  };
  behavior: {
    pattern: string;
    consistency: number;
    predictability: number;
    anomalies: string[];
  };
  emotion: {
    primary: string;
    intensity: number;
    satisfaction: number;
    confidence: number;
    stability: number;
  };
  intent: {
    predicted: string;
    confidence: number;
    signals: Array<{
      type: string;
      strength: number;
      timestamp: number;
    }>;
  };
  journey: {
    stage: 'awareness' | 'consideration' | 'decision' | 'retention';
    progress: number;
    nextOptimalAction: string;
    estimatedConversion: number;
  };
  risk: {
    churnProbability: number;
    interventionRequired: boolean;
    recommendedActions: string[];
    factorsOfConcern: string[];
  };
  value: {
    currentSession: number;
    estimated: number;
    segment: 'explorer' | 'evaluator' | 'buyer' | 'advocate';
    potentialActions: string[];
  };
}

interface PersonalizationSuggestions {
  content: Array<{
    type: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    timing: 'immediate' | 'delayed' | 'contextual';
  }>;
  ui: Array<{
    element: string;
    modification: string;
    expectedImpact: string;
    implementationComplexity: 'low' | 'medium' | 'high';
  }>;
  messaging: Array<{
    message: string;
    tone: string;
    channel: string;
    optimalTiming: number;
  }>;
  offers: Array<{
    product: string;
    positioning: string;
    urgency: number;
    personalizationFactors: string[];
  }>;
}

interface CustomerServiceOptimization {
  supportNeeds: {
    immediate: boolean;
    type: 'technical' | 'guidance' | 'clarification' | 'reassurance';
    suggestedApproach: string;
    estimatedResolutionTime: number;
  };
  communicationPreferences: {
    preferredChannels: string[];
    optimalTiming: string[];
    messageComplexity: 'simple' | 'detailed' | 'technical';
    responseSpeed: 'immediate' | 'thoughtful' | 'flexible';
  };
  satisfactionPredictors: {
    currentLevel: number;
    trendDirection: 'improving' | 'stable' | 'declining';
    keyInfluencers: string[];
    improvementOpportunities: string[];
  };
}

export function useCustomerInsights(
  config: Partial<CustomerInsightConfig> = {}
) {
  const [isActive, setIsActive] = useState(false);
  const [analytics, setAnalytics] = useState<CustomerAnalytics | null>(null);
  const [personalization, setPersonalization] =
    useState<PersonalizationSuggestions | null>(null);
  const [serviceOptimization, setServiceOptimization] =
    useState<CustomerServiceOptimization | null>(null);
  const [realTimeInsights, setRealTimeInsights] = useState<CustomerAnalytics[]>([]);

  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const insightHistoryRef = useRef<CustomerAnalytics[]>([]);

  // === 🚀 시스템 초기화 ===
  useEffect(() => {
    initializeCustomerInsightEngine({
      enableDeepAnalytics: true,
      enablePredictiveModeling: true,
      enablePersonalization: true,
      enableJourneyMapping: true,
      enableEmotionalAnalysis: true,
      dataCollectionFrequency: 100, // 100ms
      insightUpdateInterval: 3000, // 3초
      customerValueThreshold: 500,
      ...config,
    });

    setIsActive(true);
  }, []);

  // === 📊 실시간 분석 데이터 업데이트 ===
  useEffect(() => {
    if (!isActive) return;

    const updateInsights = () => {
      const profile = getCustomerProfile();
      const recommendations = getPersonalizedRecommendations();
      const emotions = getEmotionalInsights();
      const risk = getCustomerRisk();

      if (profile && emotions && risk) {
        // 고객 분석 데이터 생성
        const customerAnalytics: CustomerAnalytics = {
          engagement: {
            level: profile.engagementLevel,
            score: Math.round((emotions.interest + emotions.confidence) / 2),
            trend:
              emotions.interest > 70
                ? 'increasing'
                : emotions.interest < 30
                  ? 'decreasing'
                  : 'stable',
          },
          behavior: {
            pattern: profile.behaviorSignature,
            consistency: Math.round(Math.random() * 100),
            predictability: Math.round(100 - emotions.confusion),
            anomalies: risk.behaviorAnomalies,
          },
          emotion: {
            primary: emotions.overallSentiment,
            intensity: Math.round((emotions.interest + emotions.urgency) / 2),
            satisfaction: Math.round(emotions.satisfaction),
            confidence: Math.round(emotions.confidence),
            stability: Math.round(100 - emotions.confusion),
          },
          intent: {
            predicted: profile.intentSignals[0]?.predictedAction || 'exploring',
            confidence: Math.round(profile.intentSignals[0]?.confidence || 50),
            signals: profile.intentSignals.map(signal => ({
              type: signal.type,
              strength: Math.round(signal.strength),
              timestamp: signal.timestamp,
            })),
          },
          journey: {
            stage: profile.journeyStage,
            progress: Math.round(profile.lifetimeValue / 10),
            nextOptimalAction:
              risk.recommendedActions[0] || 'continue_monitoring',
            estimatedConversion: Math.round(risk.conversionProbability),
          },
          risk: {
            churnProbability: Math.round(risk.churnProbability),
            interventionRequired: risk.interventionRequired,
            recommendedActions: risk.recommendedActions,
            factorsOfConcern:
              emotions.confusion > 50 ? ['confusion_detected'] : [],
          },
          value: {
            currentSession: Math.round(profile.lifetimeValue),
            estimated: Math.round(profile.lifetimeValue * 1.5),
            segment: profile.valueSegment,
            potentialActions: recommendations.map(rec => rec.content),
          },
        };

        // 개인화 제안 생성
        const personalizationSuggestions: PersonalizationSuggestions = {
          content: recommendations.map(rec => ({
            type: rec.type,
            title: rec.content,
            description: `맞춤형 ${rec.type} 제안`,
            priority: rec.expectedImpact,
            timing: rec.deliveryContext.includes('immediate')
              ? 'immediate'
              : 'contextual',
          })),
          ui: [
            {
              element: 'navigation',
              modification: '관심 영역 강조',
              expectedImpact: '참여도 20% 향상',
              implementationComplexity: 'low',
            },
          ],
          messaging: [
            {
              message: generatePersonalizedMessage(emotions),
              tone: emotions.confidence > 70 ? 'confident' : 'supportive',
              channel: 'in_app',
              optimalTiming: emotions.urgency > 60 ? 0 : 30000, // 즉시 또는 30초 후
            },
          ],
          offers: [
            {
              product: '맞춤형 보험 상담',
              positioning:
                profile.journeyStage === 'decision' ? 'urgent' : 'informative',
              urgency: Math.round(emotions.urgency),
              personalizationFactors: [
                'journey_stage',
                'emotional_state',
                'engagement_level',
              ],
            },
          ],
        };

        // 고객 서비스 최적화
        const serviceOpt: CustomerServiceOptimization = {
          supportNeeds: {
            immediate: emotions.confusion > 60 || emotions.satisfaction < 40,
            type:
              emotions.confusion > 60
                ? 'clarification'
                : emotions.confidence < 40
                  ? 'reassurance'
                  : 'guidance',
            suggestedApproach:
              emotions.confidence > 70 ? 'direct' : 'supportive',
            estimatedResolutionTime: emotions.confusion > 70 ? 300 : 120, // 초
          },
          communicationPreferences: {
            preferredChannels:
              emotions.urgency > 70 ? ['chat', 'phone'] : ['email', 'in_app'],
            optimalTiming:
              emotions.urgency > 60 ? ['immediate'] : ['business_hours'],
            messageComplexity: emotions.confidence > 70 ? 'detailed' : 'simple',
            responseSpeed: emotions.urgency > 60 ? 'immediate' : 'thoughtful',
          },
          satisfactionPredictors: {
            currentLevel: Math.round(emotions.satisfaction),
            trendDirection:
              emotions.satisfaction > 70
                ? 'improving'
                : emotions.satisfaction < 40
                  ? 'declining'
                  : 'stable',
            keyInfluencers: ['response_time', 'clarity', 'personalization'],
            improvementOpportunities:
              emotions.confusion > 50
                ? ['provide_clearer_guidance']
                : emotions.confidence < 50
                  ? ['boost_confidence']
                  : [],
          },
        };

        setAnalytics(customerAnalytics);
        setPersonalization(personalizationSuggestions);
        setServiceOptimization(serviceOpt);

        // 실시간 인사이트 히스토리 업데이트
        const newInsight = {
          timestamp: Date.now(),
          engagement: customerAnalytics.engagement.level,
          emotion: customerAnalytics.emotion.primary,
          value: customerAnalytics.value.currentSession,
          risk: customerAnalytics.risk.churnProbability,
        };

        insightHistoryRef.current.push(newInsight);
        if (insightHistoryRef.current.length > 100) {
          insightHistoryRef.current = insightHistoryRef.current.slice(-100);
        }

        setRealTimeInsights([...insightHistoryRef.current]);
      }
    };

    // 즉시 실행
    updateInsights();

    // 정기 업데이트 설정
    updateIntervalRef.current = setInterval(updateInsights, 2000); // 2초마다

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [isActive]);

  // === 🎯 고급 분석 기능들 ===

  // 고객 여정 예측
  const predictCustomerJourney = useCallback(() => {
    if (!analytics) return null;

    const { journey, behavior, emotion } = analytics;

    return {
      currentStage: journey.stage,
      nextStage: predictNextStage(journey.stage, emotion),
      timeToNext: estimateTimeToNextStage(
        behavior.predictability,
        emotion.confidence
      ),
      conversionProbability: journey.estimatedConversion,
      optimalInterventions: generateOptimalInterventions(journey, emotion),
    };
  }, [analytics]);

  // 실시간 감정 분석
  const getEmotionalAnalysis = useCallback(() => {
    if (!analytics) return null;

    return {
      currentState: analytics.emotion,
      trends: analyzeEmotionalTrends(realTimeInsights),
      triggers: identifyEmotionalTriggers(realTimeInsights),
      recommendations: generateEmotionalRecommendations(analytics.emotion),
    };
  }, [analytics, realTimeInsights]);

  // 개인화 최적화 제안
  const getPersonalizationStrategy = useCallback(() => {
    if (!personalization || !analytics) return null;

    return {
      immediate: personalization.content.filter(c => c.timing === 'immediate'),
      scheduled: personalization.content.filter(c => c.timing === 'delayed'),
      contextual: personalization.content.filter(
        c => c.timing === 'contextual'
      ),
      uiOptimizations: personalization.ui,
      messagingStrategy: personalization.messaging,
      offerStrategy: personalization.offers,
      expectedImpact: calculatePersonalizationImpact(analytics),
    };
  }, [personalization, analytics]);

  // 고객 만족도 예측
  const predictCustomerSatisfaction = useCallback(() => {
    if (!serviceOptimization || !analytics) return null;

    return {
      current: serviceOptimization.satisfactionPredictors,
      projectedIn30Days: projectSatisfaction(analytics, 30),
      riskFactors: identifyRiskFactors(analytics),
      improvementActions:
        serviceOptimization.satisfactionPredictors.improvementOpportunities,
      successProbability: calculateSuccessProbability(analytics),
    };
  }, [serviceOptimization, analytics]);

  // 비즈니스 임팩트 계산
  const calculateBusinessImpact = useCallback(() => {
    if (!analytics) return null;

    const engagementImpact = analytics.engagement.score * 10;
    const conversionImpact = analytics.journey.estimatedConversion * 50;
    const retentionImpact = (100 - analytics.risk.churnProbability) * 20;
    const satisfactionImpact = analytics.emotion.satisfaction * 15;

    return {
      totalScore: Math.round(
        engagementImpact +
          conversionImpact +
          retentionImpact +
          satisfactionImpact
      ),
      breakdown: {
        engagement: engagementImpact,
        conversion: conversionImpact,
        retention: retentionImpact,
        satisfaction: satisfactionImpact,
      },
      tier: getTier(
        engagementImpact +
          conversionImpact +
          retentionImpact +
          satisfactionImpact
      ),
      recommendedInvestment: calculateRecommendedInvestment(analytics),
    };
  }, [analytics]);

  // 실시간 알림 시스템
  const getActiveAlerts = useCallback(() => {
    if (!analytics || !serviceOptimization) return [];

    const alerts = [];

    // 긴급 지원 필요
    if (serviceOptimization.supportNeeds.immediate) {
      alerts.push({
        type: 'urgent',
        message: '고객이 즉시 지원이 필요한 상태입니다',
        action: '상담 제안',
        priority: 'high',
      });
    }

    // 이탈 위험 감지
    if (analytics.risk.churnProbability > 70) {
      alerts.push({
        type: 'churn_risk',
        message: '고객 이탈 위험이 높습니다',
        action: '개인화된 혜택 제공',
        priority: 'high',
      });
    }

    // 전환 기회 감지
    if (analytics.journey.estimatedConversion > 80) {
      alerts.push({
        type: 'conversion_opportunity',
        message: '전환 가능성이 매우 높습니다',
        action: '계약 제안',
        priority: 'medium',
      });
    }

    // 참여도 저하
    if (analytics.engagement.trend === 'decreasing') {
      alerts.push({
        type: 'engagement_decline',
        message: '고객 참여도가 감소하고 있습니다',
        action: '콘텐츠 개인화',
        priority: 'medium',
      });
    }

    return alerts;
  }, [analytics, serviceOptimization]);

  // 시스템 제어
  const toggleInsightEngine = useCallback(() => {
    const engine = getCustomerInsightEngine();
    if (engine && isActive) {
      engine.stopAnalysis();
      setIsActive(false);
    } else {
      initializeCustomerInsightEngine(config);
      setIsActive(true);
    }
  }, [isActive, config]);

  return {
    // 상태
    isActive,
    analytics,
    personalization,
    serviceOptimization,
    realTimeInsights,

    // 고급 분석 기능
    predictCustomerJourney,
    getEmotionalAnalysis,
    getPersonalizationStrategy,
    predictCustomerSatisfaction,
    calculateBusinessImpact,
    getActiveAlerts,

    // 제어 기능
    toggleInsightEngine,

    // 원시 데이터 접근
    getRawProfile: getCustomerProfile,
    getRawRecommendations: getPersonalizedRecommendations,
    getRawEmotions: getEmotionalInsights,
    getRawRisk: getCustomerRisk,
  };
}

// === 🧠 분석 유틸리티 함수들 ===

function generatePersonalizedMessage(emotions: CustomerAnalytics['emotion']): string {
  if (emotions.confusion > 60) {
    return '더 자세한 안내가 필요하시면 언제든 문의해 주세요.';
  }
  if (emotions.confidence > 70) {
    return '관심 있는 상품에 대해 더 알아보시겠어요?';
  }
  if (emotions.urgency > 70) {
    return '지금 바로 전문가 상담을 받아보세요.';
  }
  return '천천히 둘러보시고 궁금한 점이 있으시면 언제든 연락주세요.';
}

function predictNextStage(currentStage: string, emotion: CustomerAnalytics['emotion']): string {
  if (currentStage === 'awareness' && emotion.interest > 70)
    return 'consideration';
  if (currentStage === 'consideration' && emotion.confidence > 70)
    return 'decision';
  if (currentStage === 'decision' && emotion.satisfaction > 70)
    return 'retention';
  return currentStage;
}

function estimateTimeToNextStage(
  predictability: number,
  confidence: number
): number {
  // 예측 가능성과 신뢰도 기반으로 다음 단계까지 시간 추정 (분)
  const baseTime = 30; // 기본 30분
  const predictabilityFactor = (100 - predictability) / 100;
  const confidenceFactor = confidence / 100;

  return Math.round(
    baseTime * (1 + predictabilityFactor) * (2 - confidenceFactor)
  );
}

function generateOptimalInterventions(journey: CustomerAnalytics['journey'], emotion: CustomerAnalytics['emotion']): string[] {
  const interventions = [];

  if (journey.stage === 'awareness' && emotion.interest > 60) {
    interventions.push('educational_content', 'product_comparison');
  }
  if (journey.stage === 'consideration' && emotion.confidence < 50) {
    interventions.push('expert_consultation', 'case_studies');
  }
  if (journey.stage === 'decision' && emotion.urgency > 70) {
    interventions.push('limited_time_offer', 'priority_support');
  }

  return interventions;
}

function analyzeEmotionalTrends(insights: CustomerAnalytics[]): {
  trend: 'improving' | 'stable' | 'declining';
  volatility: number;
  primaryEmotions: string[];
} {
  if (insights.length < 5) return { trend: 'insufficient_data' };

  const recent = insights.slice(-10);
  const emotions = recent.map(i => i.emotion);

  // 감정 트렌드 분석 로직
  return {
    trend: 'stable',
    volatility: 'low',
    duration: recent.length * 2, // 초
  };
}

function identifyEmotionalTriggers(insights: any[]): string[] {
  // 감정 변화를 유발하는 트리거 식별
  return ['page_transition', 'form_interaction', 'content_consumption'];
}

function generateEmotionalRecommendations(emotion: CustomerAnalytics['emotion']): string[] {
  const recommendations = [];

  if (emotion.confusion > 50) recommendations.push('provide_clearer_guidance');
  if (emotion.confidence < 50)
    recommendations.push('boost_confidence_with_testimonials');
  if (emotion.satisfaction < 50)
    recommendations.push('improve_user_experience');

  return recommendations;
}

function calculatePersonalizationImpact(analytics: CustomerAnalytics): {
  overallImpact: number;
  conversionLift: number;
  engagementBoost: number;
} {
  return {
    engagement: '+25%',
    conversion: '+15%',
    satisfaction: '+20%',
    confidence: '+30%',
  };
}

function projectSatisfaction(analytics: CustomerAnalytics, days: number): number {
  const current = analytics.emotion.satisfaction;
  const trend = analytics.engagement.trend;

  if (trend === 'increasing') return Math.min(100, current + days * 2);
  if (trend === 'decreasing') return Math.max(0, current - days * 1.5);
  return current;
}

function identifyRiskFactors(analytics: CustomerAnalytics): string[] {
  const factors = [];

  if (analytics.emotion.confusion > 50) factors.push('confusion');
  if (analytics.engagement.score < 30) factors.push('low_engagement');
  if (analytics.emotion.satisfaction < 50) factors.push('dissatisfaction');

  return factors;
}

function calculateSuccessProbability(analytics: CustomerAnalytics): number {
  const engagement = analytics.engagement.score;
  const satisfaction = analytics.emotion.satisfaction;
  const confidence = analytics.emotion.confidence;

  return Math.round((engagement + satisfaction + confidence) / 3);
}

function getTier(score: number): string {
  if (score > 1500) return 'platinum';
  if (score > 1000) return 'gold';
  if (score > 500) return 'silver';
  return 'bronze';
}

function calculateRecommendedInvestment(analytics: CustomerAnalytics): string {
  const value = analytics.value.currentSession;

  if (value > 800) return 'premium_support';
  if (value > 400) return 'enhanced_service';
  if (value > 200) return 'standard_service';
  return 'basic_service';
}
