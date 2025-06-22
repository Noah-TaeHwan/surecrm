/**
 * 🚀 모바일 애니메이션 성능 최적화 유틸리티
 *
 * 개발 환경과 실제 모바일 기기 간의 애니메이션 성능 차이를 해결하기 위한
 * 최적화 함수들을 제공합니다.
 */

// 디바이스 감지
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768
  );
};

export const isIOS = () => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isSafari = () => {
  if (typeof window === 'undefined') return false;
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

// 성능 감지
export const getDevicePerformance = (): 'high' | 'medium' | 'low' => {
  if (typeof window === 'undefined') return 'medium';

  const memory = (navigator as any).deviceMemory;
  const cores = navigator.hardwareConcurrency;

  if (memory >= 8 && cores >= 8) return 'high';
  if (memory >= 4 && cores >= 4) return 'medium';
  return 'low';
};

// 애니메이션 설정 최적화
export const getOptimizedAnimationConfig = () => {
  const performance = getDevicePerformance();
  const mobile = isMobile();
  const ios = isIOS();

  if (mobile && performance === 'low') {
    return {
      duration: 0.2,
      ease: 'linear',
      reduce: true,
      useTransform: true,
      enableGPU: true,
    };
  }

  if (mobile && performance === 'medium') {
    return {
      duration: 0.3,
      ease: 'easeOut',
      reduce: false,
      useTransform: true,
      enableGPU: true,
    };
  }

  return {
    duration: ios ? 0.4 : 0.3,
    ease: 'easeInOut',
    reduce: false,
    useTransform: true,
    enableGPU: true,
  };
};

// GPU 가속 활성화 함수
export const enableGPUAcceleration = (element: HTMLElement) => {
  if (!element) return;

  element.style.willChange = 'transform, opacity';
  element.style.transform = 'translate3d(0, 0, 0)';
  element.style.backfaceVisibility = 'hidden';

  if (isIOS()) {
    element.style.webkitTransform = 'translate3d(0, 0, 0)';
    element.style.webkitBackfaceVisibility = 'hidden';
    element.style.webkitPerspective = '1000px';
  }
};

// GPU 가속 비활성화 함수 (애니메이션 완료 후)
export const disableGPUAcceleration = (element: HTMLElement) => {
  if (!element) return;

  element.style.willChange = 'auto';
  element.style.transform = '';
  element.style.backfaceVisibility = '';

  if (isIOS()) {
    element.style.webkitTransform = '';
    element.style.webkitBackfaceVisibility = '';
    element.style.webkitPerspective = '';
  }
};

// 모바일 최적화된 Framer Motion 설정
export const getMobileMotionConfig = () => {
  const config = getOptimizedAnimationConfig();
  const mobile = isMobile();
  const ios = isIOS();

  const baseConfig = {
    initial: { opacity: 0, y: mobile ? 10 : 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: mobile ? -10 : -20 },
    transition: {
      duration: config.duration,
      ease: config.ease,
      ...(mobile && {
        type: 'tween',
        // Spring 애니메이션은 모바일에서 성능이 떨어질 수 있음
      }),
    },
  };

  // iOS Safari 특별 최적화
  if (ios && isSafari()) {
    return {
      ...baseConfig,
      transition: {
        ...baseConfig.transition,
        duration: Math.min(config.duration, 0.25), // iOS에서는 더 빠르게
        ease: 'linear', // iOS에서 가장 부드러운 easing
      },
    };
  }

  return baseConfig;
};

// 성능 모니터링
export const createPerformanceMonitor = () => {
  let frameCount = 0;
  let lastTime = Date.now();
  let fps = 60;

  const measureFPS = () => {
    frameCount++;
    const currentTime = Date.now();

    if (currentTime - lastTime >= 1000) {
      fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
      frameCount = 0;
      lastTime = currentTime;

      // FPS가 30 이하면 성능 저하 감지
      if (fps < 30) {
        console.warn('🐌 애니메이션 성능 저하 감지:', fps + 'fps');
        return false;
      }
    }

    requestAnimationFrame(measureFPS);
    return true;
  };

  return {
    start: () => requestAnimationFrame(measureFPS),
    getCurrentFPS: () => fps,
  };
};

// 배터리 상태 확인 (지원하는 브라우저에서)
export const getBatteryLevel = async (): Promise<number | null> => {
  if (typeof navigator === 'undefined' || !('getBattery' in navigator)) {
    return null;
  }

  try {
    const battery = await (navigator as any).getBattery();
    return battery.level;
  } catch {
    return null;
  }
};

// 저전력 모드 감지
export const isLowPowerMode = async (): Promise<boolean> => {
  const batteryLevel = await getBatteryLevel();

  // 배터리가 20% 이하이거나 사용자가 motion을 줄이도록 설정한 경우
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  const lowBattery = batteryLevel !== null && batteryLevel < 0.2;

  return prefersReducedMotion || lowBattery;
};

// 적응형 애니메이션 설정
export const getAdaptiveAnimationConfig = async () => {
  const lowPower = await isLowPowerMode();
  const performance = getDevicePerformance();
  const mobile = isMobile();

  if (lowPower || (mobile && performance === 'low')) {
    return {
      duration: 0.15,
      ease: 'linear',
      enableGPU: false,
      skipComplex: true,
    };
  }

  return getOptimizedAnimationConfig();
};

// 애니메이션 요소에 자동으로 최적화 적용
export const optimizeAnimationElement = (
  element: HTMLElement,
  onComplete?: () => void
) => {
  if (!element) return;

  // 애니메이션 시작 시 GPU 가속 활성화
  enableGPUAcceleration(element);

  // 애니메이션 완료 감지
  const handleTransitionEnd = () => {
    disableGPUAcceleration(element);
    element.classList.add('animation-finished');
    onComplete?.();
    element.removeEventListener('transitionend', handleTransitionEnd);
    element.removeEventListener('animationend', handleTransitionEnd);
  };

  element.addEventListener('transitionend', handleTransitionEnd);
  element.addEventListener('animationend', handleTransitionEnd);

  return () => {
    element.removeEventListener('transitionend', handleTransitionEnd);
    element.removeEventListener('animationend', handleTransitionEnd);
  };
};

// 커스텀 훅을 위한 유틸리티
export const useMobileOptimizedAnimation = () => {
  const config = getMobileMotionConfig();
  const mobile = isMobile();
  const ios = isIOS();

  return {
    config,
    mobile,
    ios,
    enableGPU: enableGPUAcceleration,
    disableGPU: disableGPUAcceleration,
    optimize: optimizeAnimationElement,
  };
};
