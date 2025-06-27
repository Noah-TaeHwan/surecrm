import { createReadableStreamFromReadable } from '@react-router/node';
import { ServerRouter, type HandleErrorFunction } from 'react-router';
import { renderToPipeableStream } from 'react-dom/server';
import * as Sentry from '@sentry/react-router';

export const streamTimeout = 5_000;

// 안전한 Sentry 핸들러 생성
const handleRequest = Sentry.createSentryHandleRequest({
  ServerRouter,
  renderToPipeableStream,
  createReadableStreamFromReadable,
});

export default handleRequest;

export const handleError: HandleErrorFunction = (error, { request }) => {
  // React Router may abort some interrupted requests, don't log those
  if (!request.signal.aborted) {
    try {
      // Sentry가 사용 가능할 때만 캡처
      if (typeof Sentry.captureException === 'function') {
        Sentry.captureException(error);
      }
    } catch (sentryError) {
      console.warn('⚠️ Sentry 오류 캡처 실패:', sentryError);
    }

    // 항상 콘솔에 로그
    console.error('🚨 Server Error:', error);
  }
};
