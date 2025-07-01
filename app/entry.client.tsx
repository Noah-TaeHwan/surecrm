import * as Sentry from '@sentry/react-router';
import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';
import '~/lib/i18n/client';
// 클라이언트 언어 초기화
import { initializeClientLanguage } from '~/lib/i18n/language-manager.client';

// 🔧 환경 감지 함수
function isProductionEnvironment(): boolean {
  if (typeof window === 'undefined') return false;

  // 🚀 프로덕션 환경 조건
  const isProduction =
    window.location.hostname.includes('.vercel.app') ||
    window.location.hostname.includes('surecrm.pro');

  // 🔧 개발 환경 조건
  const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('.local');

  const isDevPort = [
    '5173',
    '5174',
    '5175',
    '5176',
    '5177',
    '5178',
    '5179',
    '5180',
    '5181',
    '5182',
    '5183',
    '5184',
    '5185',
    '5186',
    '5187',
    '3000',
    '8080',
  ].includes(window.location.port);

  const isDevelopment = !isProduction && isLocalhost && isDevPort;

  return isProduction && !isDevelopment;
}

// 🔒 프로덕션에서만 Sentry 초기화
if (isProductionEnvironment()) {
  Sentry.init({
    dsn: 'https://8193c277a9cc1a3fe000ad5550db6412@o4509563207876608.ingest.us.sentry.io/4509563214364672',
    environment: 'production',

    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/react-router/configuration/options/#sendDefaultPii
    sendDefaultPii: true,

    // 🔇 ResizeObserver 관련 오류 무시 설정
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'ResizeObserver maximum depth exceeded',
      'Non-Error promise rejection captured',
      'Script error',
      // 브라우저 확장 프로그램 관련 오류들도 무시
      'extension/',
      'extensions/',
      'chrome-extension',
      'moz-extension',
      // 네트워크 관련 무시할 오류들
      'NetworkError',
      'Failed to fetch',
    ],

    // beforeSend로 추가 필터링
    beforeSend(event, hint) {
      const error = hint.originalException;

      // ResizeObserver 관련 오류 필터링
      if (error && typeof error === 'object' && 'message' in error) {
        const message = String(error.message);
        if (
          message.includes('ResizeObserver') ||
          message.includes('loop limit exceeded') ||
          message.includes('undelivered notifications')
        ) {
          console.warn('🔧 Sentry: ResizeObserver 오류 무시됨', message);
          return null; // 이벤트 전송하지 않음
        }
      }

      return event;
    },

    integrations: [
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Session Replay (프로덕션에서만)
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0, // 오류 발생 시에만 100% 캡처
  });

  console.log('🔒 Sentry 프로덕션 모드로 초기화됨');
} else {
  // console.log('🔧 개발환경: Sentry 비활성화됨');
}

// 🌍 언어 설정 초기화
initializeClientLanguage();

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>
  );
});
