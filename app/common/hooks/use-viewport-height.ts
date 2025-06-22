import { useEffect, useState, useCallback } from 'react';
import {
  initDynamicViewportHeight,
  getActualViewportHeight,
  getSafeAreaInsetBottom,
  isIOSSafari,
} from '~/lib/utils/viewport-height';

/**
 * 🚀 iPhone Safari 하단 주소창 대응 React Hook
 *
 * 동적으로 변하는 viewport height를 추적하고 UI가 잘리지 않도록 보장합니다.
 */
export function useViewportHeight() {
  const [heights, setHeights] = useState(() => ({
    actual: getActualViewportHeight(),
    safe: getActualViewportHeight() - getSafeAreaInsetBottom(),
    safeAreaBottom: getSafeAreaInsetBottom(),
    isIOSSafari: isIOSSafari(),
  }));

  const [isInitialized, setIsInitialized] = useState(false);

  const updateHeights = useCallback(() => {
    const actualHeight = getActualViewportHeight();
    const safeAreaBottom = getSafeAreaInsetBottom();

    setHeights({
      actual: actualHeight,
      safe: actualHeight - safeAreaBottom,
      safeAreaBottom,
      isIOSSafari: isIOSSafari(),
    });
  }, []);

  useEffect(() => {
    // 동적 viewport height 시스템 초기화
    const cleanup = initDynamicViewportHeight();
    setIsInitialized(true);

    // 초기 높이 업데이트
    updateHeights();

    // iPhone Safari에서는 추가 모니터링
    if (isIOSSafari()) {
      // 스크롤 이벤트로 주소창 변화 감지
      let scrollTimeout: NodeJS.Timeout;

      const handleScroll = () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateHeights, 100);
      };

      // 화면 방향 변경 감지
      const handleOrientationChange = () => {
        setTimeout(updateHeights, 300); // 방향 변경 후 약간의 딜레이
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('orientationchange', handleOrientationChange);

      // Visual Viewport API 지원 시
      if ('visualViewport' in window && window.visualViewport) {
        window.visualViewport.addEventListener('resize', updateHeights);
      }

      return () => {
        cleanup?.();
        clearTimeout(scrollTimeout);
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener(
          'orientationchange',
          handleOrientationChange
        );

        if ('visualViewport' in window && window.visualViewport) {
          window.visualViewport.removeEventListener('resize', updateHeights);
        }
      };
    }

    return cleanup;
  }, [updateHeights]);

  // 디버깅용 정보 (개발 환경에서만)
  const debug =
    process.env.NODE_ENV === 'development'
      ? {
          windowInnerHeight:
            typeof window !== 'undefined' ? window.innerHeight : 0,
          documentHeight:
            typeof document !== 'undefined'
              ? document.documentElement.clientHeight
              : 0,
          visualViewportHeight:
            typeof window !== 'undefined' && 'visualViewport' in window
              ? window.visualViewport?.height || 0
              : 0,
        }
      : {};

  return {
    // 높이 정보
    actual: heights.actual,
    safe: heights.safe,
    safeAreaBottom: heights.safeAreaBottom,

    // 디바이스 정보
    isIOSSafari: heights.isIOSSafari,
    isInitialized,

    // 유틸리티 함수
    updateHeights,

    // CSS 변수에 사용할 값들
    cssVars: {
      '--actual-vh': `${heights.actual}px`,
      '--safe-vh': `${heights.safe}px`,
      '--safe-area-bottom': `${heights.safeAreaBottom}px`,
      '--ios-vh': heights.isIOSSafari ? `${heights.actual}px` : '100vh',
    },

    // 개발 환경에서만 제공되는 디버그 정보
    debug,
  };
}

/**
 * 🎯 간단한 안전한 높이 훅
 *
 * 대부분의 경우에 사용할 수 있는 간단한 버전
 */
export function useSafeHeight() {
  const { safe, isIOSSafari, cssVars } = useViewportHeight();

  return {
    height: safe,
    isIOSSafari,
    style: cssVars,
  };
}

/**
 * 📱 모바일 모달/시트 전용 훅
 *
 * 모바일 환경에서 전체 화면 모달이나 시트를 위한 최적화된 높이
 */
export function useMobileModalHeight() {
  const { actual, safeAreaBottom, isIOSSafari } = useViewportHeight();

  // 모달의 경우 상하 여백을 고려
  const topMargin = isIOSSafari ? 48 : 32; // iOS에서는 더 많은 상단 여백
  const bottomMargin = safeAreaBottom + 16; // safe area + 기본 여백

  const modalHeight = actual - topMargin - bottomMargin;

  return {
    height: modalHeight,
    maxHeight: modalHeight,
    top: topMargin,
    bottom: bottomMargin,
    style: {
      height: `${modalHeight}px`,
      maxHeight: `${modalHeight}px`,
      top: `${topMargin}px`,
      paddingBottom: `${bottomMargin}px`,
    },
  };
}
