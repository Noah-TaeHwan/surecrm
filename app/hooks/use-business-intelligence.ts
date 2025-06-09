/**
 * 🧠 비즈니스 인텔리전스 React 훅
 *
 * 사용자 경험 최적화를 위한 고급 분석 및 인사이트 제공
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getBusinessIntelligence,
  getCurrentUserProfile,
  getSessionIntelligence,
  initializeBusinessIntelligence,
} from '~/lib/utils/business-intelligence';

interface BusinessConfig {
  enableAdvancedAnalytics: boolean;
  enableBehavioralTracking: boolean;
  enablePerformanceMonitoring: boolean;
  enableUserJourneyMapping: boolean;
  dataRetentionDays: number;
  samplingRate: number;
}

interface UserInsights {
  engagementLevel: 'low' | 'medium' | 'high';
  intentPrediction: string;
  valueSegment: 'premium' | 'standard' | 'basic';
  churnRisk: number;
  conversionProbability: number;
  nextBestAction: string;
  recommendations: string[];
}

export function useBusinessIntelligence(config: Partial<BusinessConfig> = {}) {
  const [isActive, setIsActive] = useState(false);
  const [userInsights, setUserInsights] = useState<UserInsights | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);

  // 비즈니스 인텔리전스 시스템 초기화
  useEffect(() => {
    initializeBusinessIntelligence(config);
    setIsActive(true);
  }, []);

  // 실시간 사용자 인사이트 업데이트
  useEffect(() => {
    if (!isActive) return;

    const updateInsights = () => {
      const profile = getCurrentUserProfile();
      const intelligence = getSessionIntelligence();

      if (profile && intelligence) {
        setUserInsights({
          engagementLevel:
            intelligence.engagementDepth > 7
              ? 'high'
              : intelligence.engagementDepth > 4
              ? 'medium'
              : 'low',
          intentPrediction: intelligence.intentPrediction,
          valueSegment: profile.valueSegment,
          churnRisk: intelligence.churnRisk,
          conversionProbability: intelligence.conversionProbability,
          nextBestAction: intelligence.nextBestAction,
          recommendations: intelligence.personalizedRecommendations,
        });
      }
    };

    const interval = setInterval(updateInsights, 2000); // 2초마다 업데이트
    updateInsights(); // 즉시 실행

    return () => clearInterval(interval);
  }, [isActive]);

  // 고급 분석 모드 토글
  const toggleAdvancedMode = useCallback(() => {
    const system = getBusinessIntelligence();
    if (system) {
      if (isActive) {
        system.stopAdvancedTracking();
        setIsActive(false);
      } else {
        system.startAdvancedTracking();
        setIsActive(true);
      }
    }
  }, [isActive]);

  // 실시간 분석 데이터 스트림
  const getAnalyticsStream = useCallback(() => {
    const system = getBusinessIntelligence();
    if (system) {
      const metrics = system.getBehaviorMetrics();
      const profile = system.getCurrentProfile();
      const intelligence = system.getSessionIntelligence();

      return {
        mouseMovements: metrics.mouseMovements.slice(-10),
        clickHeatmap: metrics.clickHeatmap,
        scrollPattern: metrics.scrollPattern.slice(-5),
        keystrokes: metrics.keystrokes.slice(-10),
        userProfile: profile,
        sessionIntelligence: intelligence,
      };
    }
    return null;
  }, []);

  // 사용자 행동 예측
  const predictUserBehavior = useCallback(() => {
    const insights = getSessionIntelligence();
    if (!insights) return null;

    return {
      willConvert: insights.conversionProbability > 0.7,
      willChurn: insights.churnRisk > 0.6,
      needsSupport: insights.frustrationLevel > 6,
      isEngaged: insights.engagementDepth > 5,
      nextAction: insights.nextBestAction,
    };
  }, []);

  // 개인화 추천 생성
  const getPersonalizedRecommendations = useCallback(() => {
    const intelligence = getSessionIntelligence();
    const profile = getCurrentUserProfile();

    if (!intelligence || !profile) return [];

    return intelligence.personalizedRecommendations.map((rec) => ({
      type: rec,
      priority:
        profile.valueSegment === 'premium'
          ? 'high'
          : profile.valueSegment === 'standard'
          ? 'medium'
          : 'low',
      targeting: {
        segment: profile.valueSegment,
        engagement: intelligence.engagementDepth,
        frustration: intelligence.frustrationLevel,
      },
    }));
  }, []);

  return {
    // 상태
    isActive,
    userInsights,
    analyticsData,

    // 액션
    toggleAdvancedMode,
    getAnalyticsStream,
    predictUserBehavior,
    getPersonalizedRecommendations,

    // 유틸리티
    isTrackingEnabled: isActive,
    getCurrentProfile: getCurrentUserProfile,
    getSessionData: getSessionIntelligence,
  };
}
