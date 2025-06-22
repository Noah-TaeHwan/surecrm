/**
 * 🚀 iPhone Safari 하단 주소창 대응 Viewport Height 유틸리티
 *
 * iPhone Safari의 동적 주소창으로 인한 viewport height 변화를
 * 감지하고 적절히 대응하는 유틸리티 함수들을 제공합니다.
 */

import { useState, useEffect } from 'react';

// 디바이스 감지
export const isIOS = () => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isSafari = () => {
  if (typeof window === 'undefined') return false;
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

export const isIOSSafari = () => isIOS() && isSafari();

// 실제 viewport height 계산
export const getActualViewportHeight = (): number => {
  if (typeof window === 'undefined') return 0;

  // iOS Safari에서는 window.innerHeight가 더 정확
  if (isIOSSafari()) {
    return window.innerHeight;
  }

  // 기타 브라우저는 documentElement.clientHeight 사용
  return document.documentElement.clientHeight || window.innerHeight;
};

// 🚀 iPhone Safari 전체 화면 높이 (주소창 포함)
export const getFullScreenHeight = (): number => {
  if (typeof window === 'undefined') return 0;

  if (isIOSSafari()) {
    // iOS Safari에서 주소창이 보일 때의 전체 화면 높이
    // screen.height는 기기의 실제 화면 높이
    return Math.max(
      window.screen.height,
      window.outerHeight,
      window.innerHeight + 100 // 주소창 영역 추가 (대략 100px)
    );
  }

  return window.innerHeight;
};

// 주소창 높이 계산
export const getAddressBarHeight = (): number => {
  if (typeof window === 'undefined') return 0;

  if (isIOSSafari()) {
    // iOS Safari 주소창 높이 (동적으로 변함)
    const fullHeight = window.screen.height;
    const currentHeight = window.innerHeight;
    return Math.max(0, fullHeight - currentHeight);
  }

  return 0;
};

// 전체 화면 모드 활성화 (주소창 영역까지 사용)
export const enableFullScreenMode = () => {
  if (typeof window === 'undefined') return;

  const fullHeight = getFullScreenHeight();
  const actualHeight = getActualViewportHeight();
  const addressBarHeight = getAddressBarHeight();

  // CSS 변수로 전체 화면 높이 설정
  document.documentElement.style.setProperty(
    '--full-screen-vh',
    `${fullHeight}px`
  );
  document.documentElement.style.setProperty(
    '--address-bar-height',
    `${addressBarHeight}px`
  );

  // iOS Safari에서 전체 화면 모드 클래스 추가
  if (isIOSSafari()) {
    document.documentElement.classList.add('ios-full-screen-mode');
  }
};

// Safe area inset bottom 값 계산
export const getSafeAreaInsetBottom = (): number => {
  if (typeof window === 'undefined') return 0;

  const styles = getComputedStyle(document.documentElement);
  const safeAreaBottom =
    styles.getPropertyValue('--safe-area-inset-bottom') ||
    styles.getPropertyValue('env(safe-area-inset-bottom)') ||
    '0px';

  return parseInt(safeAreaBottom.replace('px', '')) || 0;
};

// 동적 viewport height CSS 변수 설정
export const setDynamicViewportHeight = () => {
  if (typeof window === 'undefined') return;

  const actualHeight = getActualViewportHeight();
  const safeAreaBottom = getSafeAreaInsetBottom();

  // CSS 변수로 실제 높이 설정
  document.documentElement.style.setProperty(
    '--actual-vh',
    `${actualHeight}px`
  );
  document.documentElement.style.setProperty(
    '--safe-vh',
    `${actualHeight - safeAreaBottom}px`
  );
  document.documentElement.style.setProperty(
    '--safe-area-bottom',
    `${safeAreaBottom}px`
  );

  // iPhone Safari 감지 시 특별 처리
  if (isIOSSafari()) {
    document.documentElement.style.setProperty('--ios-vh', `${actualHeight}px`);
    document.documentElement.classList.add('ios-safari');
  }
};

// Resize 이벤트 리스너
let resizeTimeoutId: NodeJS.Timeout | null = null;

export const initDynamicViewportHeight = () => {
  if (typeof window === 'undefined') return;

  // 초기 설정
  setDynamicViewportHeight();

  // 리사이즈 이벤트 리스너 (디바운스 적용)
  const handleResize = () => {
    if (resizeTimeoutId) {
      clearTimeout(resizeTimeoutId);
    }

    resizeTimeoutId = setTimeout(() => {
      setDynamicViewportHeight();
    }, 100); // 100ms 디바운스
  };

  // 이벤트 리스너 등록
  window.addEventListener('resize', handleResize, { passive: true });
  window.addEventListener('orientationchange', handleResize, { passive: true });

  // iOS Safari 특별 이벤트
  if (isIOSSafari()) {
    // 스크롤 이벤트로 주소창 변화 감지
    let scrollTimeout: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      scrollTimeout = setTimeout(() => {
        setDynamicViewportHeight();
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Visual Viewport API 지원 시 사용
    if ('visualViewport' in window && window.visualViewport) {
      window.visualViewport.addEventListener(
        'resize',
        setDynamicViewportHeight
      );
    }
  }

  // 정리 함수 반환
  return () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleResize);

    if (resizeTimeoutId) {
      clearTimeout(resizeTimeoutId);
    }

    if (isIOSSafari() && 'visualViewport' in window && window.visualViewport) {
      window.visualViewport.removeEventListener(
        'resize',
        setDynamicViewportHeight
      );
    }
  };
};

// React Hook으로 사용할 수 있도록
export const useDynamicViewportHeight = () => {
  if (typeof window === 'undefined') return { actualHeight: 0, safeHeight: 0 };

  const [heights, setHeights] = useState({
    actualHeight: getActualViewportHeight(),
    safeHeight: getActualViewportHeight() - getSafeAreaInsetBottom(),
  });

  useEffect(() => {
    const cleanup = initDynamicViewportHeight();

    const updateHeights = () => {
      setHeights({
        actualHeight: getActualViewportHeight(),
        safeHeight: getActualViewportHeight() - getSafeAreaInsetBottom(),
      });
    };

    // 초기 업데이트
    updateHeights();

    // 주기적 업데이트 (iOS Safari 대응)
    const interval = setInterval(updateHeights, 1000);

    return () => {
      cleanup?.();
      clearInterval(interval);
    };
  }, []);

  return heights;
};
