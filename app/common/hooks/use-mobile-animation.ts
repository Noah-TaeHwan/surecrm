import { useEffect, useRef, useState, useMemo } from 'react';
import {
  isMobile,
  isIOS,
  getOptimizedAnimationConfig,
  getMobileMotionConfig,
  enableGPUAcceleration,
  disableGPUAcceleration,
  optimizeAnimationElement,
  createPerformanceMonitor,
  isLowPowerMode,
} from '~/lib/utils/mobile-animation';

/**
 * 🚀 모바일 최적화 애니메이션 훅
 *
 * 실제 모바일 기기에서 부드러운 애니메이션을 위한 최적화된 설정을 제공합니다.
 */
export function useMobileAnimation() {
  const [animationConfig, setAnimationConfig] = useState(
    getOptimizedAnimationConfig()
  );
  const [motionConfig, setMotionConfig] = useState(getMobileMotionConfig());
  const [isLowPower, setIsLowPower] = useState(false);
  const performanceMonitor = useRef(createPerformanceMonitor());

  useEffect(() => {
    // 저전력 모드 확인
    isLowPowerMode().then(setIsLowPower);

    // 성능 모니터링 시작
    if (isMobile()) {
      performanceMonitor.current.start();
    }
  }, []);

  useEffect(() => {
    // 저전력 모드에 따라 설정 업데이트
    if (isLowPower) {
      setAnimationConfig({
        duration: 0.15,
        ease: 'linear',
        reduce: true,
        useTransform: true,
        enableGPU: false,
      });

      setMotionConfig({
        initial: { opacity: 0, y: 0 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 0 },
        transition: {
          duration: 0.15,
          ease: 'linear',
          type: 'tween',
        },
      });
    } else {
      setAnimationConfig(getOptimizedAnimationConfig());
      setMotionConfig(getMobileMotionConfig());
    }
  }, [isLowPower]);

  return {
    // 기본 설정
    animationConfig,
    motionConfig,

    // 디바이스 정보
    isMobile: isMobile(),
    isIOS: isIOS(),
    isLowPower,

    // 성능 모니터링
    getCurrentFPS: () => performanceMonitor.current.getCurrentFPS(),

    // GPU 가속 제어
    enableGPU: enableGPUAcceleration,
    disableGPU: disableGPUAcceleration,

    // 자동 최적화
    optimize: optimizeAnimationElement,
  };
}

/**
 * 🎭 애니메이션 요소 최적화 훅
 *
 * ref를 전달받아 자동으로 GPU 가속 및 최적화를 적용합니다.
 */
export function useAnimationOptimization<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // 모바일에서만 최적화 적용
    if (isMobile()) {
      cleanupRef.current = optimizeAnimationElement(element) || null;
    }

    return () => {
      cleanupRef.current?.();
    };
  }, []);

  return ref;
}

/**
 * 🎨 적응형 모션 프리셋 훅
 *
 * 다양한 애니메이션 유형에 대한 최적화된 Framer Motion 설정을 제공합니다.
 */
export function useMotionPresets() {
  const {
    motionConfig,
    isMobile: mobile,
    isIOS: ios,
    isLowPower,
  } = useMobileAnimation();

  const presets = {
    // 기본 페이드인
    fadeIn: {
      ...motionConfig,
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },

    // 슬라이드 업
    slideUp: {
      ...motionConfig,
      initial: { opacity: 0, y: mobile ? 20 : 40 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: mobile ? -20 : -40 },
    },

    // 모달 애니메이션 (iOS 최적화)
    modal: {
      initial: { opacity: 0, scale: ios ? 0.95 : 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: ios ? 0.95 : 0.9 },
      transition: {
        duration: ios ? 0.25 : motionConfig.transition.duration,
        ease: ios ? 'easeOut' : motionConfig.transition.ease,
        type: 'tween',
      },
    },

    // 사이드바 슬라이드
    sidebar: {
      initial: { x: mobile ? '-100%' : -300, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: mobile ? '-100%' : -300, opacity: 0 },
      transition: {
        duration: mobile ? 0.25 : 0.3,
        ease: mobile ? 'easeOut' : 'easeInOut',
        type: 'tween',
      },
    },

    // 카드 호버 (모바일에서는 탭)
    cardHover: mobile
      ? {
          // 모바일에서는 탭 피드백만
          whileTap: { scale: 0.98, opacity: 0.8 },
          transition: { duration: 0.1 },
        }
      : {
          // 데스크톱에서는 호버 효과
          whileHover: { scale: 1.02, y: -2 },
          whileTap: { scale: 0.98 },
          transition: { duration: 0.2 },
        },

    // 리스트 아이템 스태거
    listItem: {
      ...motionConfig,
      initial: { opacity: 0, x: mobile ? -10 : -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: mobile ? 10 : 20 },
    },

    // 저전력 모드 (minimal)
    minimal: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.15, ease: 'linear' },
    },
  };

  // 저전력 모드에서는 minimal 프리셋 사용
  if (isLowPower) {
    return Object.fromEntries(
      Object.keys(presets).map(key => [key, presets.minimal])
    );
  }

  return presets;
}

/**
 * 📱 모바일 네비게이션 애니메이션 훅
 *
 * 모바일 네비게이션에 특화된 애니메이션 설정을 제공합니다.
 */
export function useMobileNavAnimation() {
  const { isIOS: ios, isMobile: mobile } = useMobileAnimation();

  return {
    // 햄버거 메뉴 애니메이션
    hamburger: {
      transition: {
        duration: mobile ? 0.2 : 0.25,
        ease: ios ? 'easeOut' : 'easeInOut',
      },
    },

    // 모바일 메뉴 오버레이
    overlay: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: {
        duration: mobile ? 0.2 : 0.25,
        ease: 'easeInOut',
      },
    },

    // 모바일 메뉴 콘텐츠
    content: {
      initial: { x: '-100%', opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: '-100%', opacity: 0 },
      transition: {
        duration: mobile ? 0.25 : 0.3,
        ease: ios ? 'easeOut' : 'easeInOut',
        type: 'tween',
      },
    },

    // 바텀 네비게이션
    bottomNav: {
      initial: { y: 100, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: 100, opacity: 0 },
      transition: {
        duration: mobile ? 0.2 : 0.25,
        ease: 'easeOut',
        type: 'tween',
      },
    },
  };
}

/**
 * 🚀 사이드바 시트 전용 애니메이션 최적화 훅
 *
 * iPhone Safari에서 부드러운 사이드바 애니메이션을 위한 특별 최적화
 */
export function useSidebarAnimation() {
  const mobile = isMobile();
  const ios = isIOS();

  return useMemo(() => {
    // 기본 데스크톱 설정
    if (!mobile) {
      return {
        duration: { open: 500, close: 300 },
        easing: 'ease-in-out',
        optimized: false,
      };
    }

    // 모바일 최적화 설정
    const config = {
      duration: ios
        ? { open: 250, close: 200 } // iOS는 더 빠르게
        : { open: 350, close: 250 }, // 안드로이드
      easing: ios
        ? 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' // iOS 최적화 곡선
        : 'cubic-bezier(0.4, 0.0, 0.2, 1)', // Material Design 곡선
      optimized: true,
      transform: 'translate3d(0, 0, 0)',
      willChange: 'transform, opacity',
      backfaceVisibility: 'hidden',
    };

    // iOS Safari 특별 최적화
    if (ios) {
      return {
        ...config,
        webkitTransform: 'translate3d(0, 0, 0)',
        webkitBackfaceVisibility: 'hidden',
        webkitPerspective: '1000px',
        webkitFontSmoothing: 'antialiased',
      };
    }

    return config;
  }, [mobile, ios]);
}
