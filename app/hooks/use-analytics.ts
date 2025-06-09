import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { trackPageView, isGAEnabled } from '~/lib/utils/analytics';

// 페이지 뷰 자동 추적 Hook
export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    if (!isGAEnabled()) return;

    // 페이지 변경 시 추적
    trackPageView({
      path: location.pathname + location.search,
      title: document.title,
    });
  }, [location]);
}

// 특정 이벤트를 추적하는 Hook
export function useEventTracking() {
  return {
    trackEvent: (eventData: {
      action: string;
      category: string;
      label?: string;
      value?: number;
    }) => {
      if (!isGAEnabled()) return;

      import('~/lib/utils/analytics').then(({ trackEvent }) => {
        trackEvent(eventData);
      });
    },
  };
}
