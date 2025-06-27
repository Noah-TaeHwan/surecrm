import * as Sentry from '@sentry/react-router';
import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';

Sentry.init({
  dsn: 'https://8193c277a9cc1a3fe000ad5550db6412@o4509563207876608.ingest.us.sentry.io/4509563214364672',

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
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>
  );
});
