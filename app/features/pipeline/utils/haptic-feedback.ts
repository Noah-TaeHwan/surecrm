/**
 * 햅틱 피드백 유틸리티 함수들
 * 다양한 인터랙션에 적합한 진동 패턴을 제공합니다.
 */

export interface HapticPattern {
  pattern: number[];
  description: string;
}

/**
 * 미리 정의된 햅틱 패턴들
 */
export const HAPTIC_PATTERNS: Record<string, HapticPattern> = {
  // 🎯 드래그 & 드롭
  DRAG_START: {
    pattern: [50],
    description: '드래그 시작 - 짧은 진동'
  },
  DRAG_HOVER: {
    pattern: [25],
    description: '드롭 존 호버 - 매우 짧은 진동'
  },
  DRAG_DROP_SUCCESS: {
    pattern: [50, 50, 100],
    description: '드롭 성공 - 성공 패턴'
  },
  DRAG_DROP_FAILED: {
    pattern: [100, 100, 100],
    description: '드롭 실패 - 오류 패턴'
  },

  // 🎯 스와이프 액션
  SWIPE_REVEAL: {
    pattern: [30],
    description: '스와이프 액션 노출 - 부드러운 진동'
  },
  SWIPE_ACTION: {
    pattern: [50, 30, 50],
    description: '스와이프 액션 실행 - 확인 패턴'
  },

  // 🎯 터치 & 탭
  LIGHT_TAP: {
    pattern: [25],
    description: '가벼운 탭 - 최소 진동'
  },
  MEDIUM_TAP: {
    pattern: [50],
    description: '보통 탭 - 표준 진동'
  },
  STRONG_TAP: {
    pattern: [100],
    description: '강한 탭 - 강력한 진동'
  },

  // 🎯 UI 변경사항
  FILTER_CHANGE: {
    pattern: [30, 20, 30],
    description: '필터 변경 - 변경 확인'
  },
  STAGE_CHANGE: {
    pattern: [40, 30, 60],
    description: '스테이지 변경 - 중요한 변경'
  },

  // 🎯 성공/오류 피드백
  SUCCESS: {
    pattern: [50, 50, 100],
    description: '성공 - 긍정적 패턴'
  },
  WARNING: {
    pattern: [75, 75, 75],
    description: '경고 - 주의 패턴'
  },
  ERROR: {
    pattern: [100, 100, 100],
    description: '오류 - 오류 패턴'
  },

  // 🎯 장시간 인터랙션
  LONG_PRESS_START: {
    pattern: [80],
    description: '롱프레스 시작 - 강한 진동'
  },
  SCROLL_BOUNDARY: {
    pattern: [60],
    description: '스크롤 경계 - 경계 알림'
  }
};

/**
 * 햅틱 피드백 실행 함수
 */
export const triggerHapticFeedback = (patternKey: keyof typeof HAPTIC_PATTERNS) => {
  try {
    // 브라우저 햅틱 지원 체크
    if (!navigator.vibrate) {
      console.log(`햅틱 피드백 미지원: ${HAPTIC_PATTERNS[patternKey].description}`);
      return false;
    }

    const pattern = HAPTIC_PATTERNS[patternKey];
    if (!pattern) {
      console.warn(`알 수 없는 햅틱 패턴: ${patternKey}`);
      return false;
    }

    // 햅틱 피드백 실행
    navigator.vibrate(pattern.pattern);
    console.log(`햅틱 피드백 실행: ${pattern.description}`);
    return true;
  } catch (error) {
    console.error('햅틱 피드백 오류:', error);
    return false;
  }
};

/**
 * 커스텀 햅틱 패턴 실행
 */
export const triggerCustomHaptic = (pattern: number[], description?: string) => {
  try {
    if (!navigator.vibrate) {
      console.log(`햅틱 피드백 미지원: ${description || '커스텀 패턴'}`);
      return false;
    }

    navigator.vibrate(pattern);
    console.log(`커스텀 햅틱 피드백 실행: ${description || '커스텀 패턴'}`);
    return true;
  } catch (error) {
    console.error('커스텀 햅틱 피드백 오류:', error);
    return false;
  }
};

/**
 * 조건부 햅틱 피드백 (사용자 설정 기반)
 */
export const triggerConditionalHaptic = (
  patternKey: keyof typeof HAPTIC_PATTERNS,
  condition: boolean = true
) => {
  if (!condition) {
    return false;
  }
  return triggerHapticFeedback(patternKey);
};

/**
 * 햅틱 피드백 지원 여부 체크
 */
export const isHapticSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
};

/**
 * 햅틱 피드백 강도 조절 (미래 확장용)
 */
export const createScaledPattern = (basePattern: number[], intensity: number = 1): number[] => {
  return basePattern.map(duration => Math.round(duration * Math.max(0.1, Math.min(2.0, intensity))));
};
