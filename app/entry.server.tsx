import { createReadableStreamFromReadable } from '@react-router/node';
import { ServerRouter, type HandleErrorFunction } from 'react-router';
import { renderToPipeableStream } from 'react-dom/server';
import * as Sentry from '@sentry/react-router';
import { checkCriticalEnvs } from './lib/core/safe-env';
import { PassThrough } from 'stream';

export const streamTimeout = 5_000;

// 서버 시작 시 환경변수 체크
console.log('🚀 SureCRM 서버 시작...');
checkCriticalEnvs();

// React 19 호환성을 위한 기본 핸들러 사용
let handleRequest: any;

try {
  // Sentry 핸들러 시도
  handleRequest = Sentry.createSentryHandleRequest({
    ServerRouter,
    renderToPipeableStream,
    createReadableStreamFromReadable,
  });
} catch (error) {
  console.warn('⚠️ Sentry 핸들러 생성 실패, 기본 핸들러 사용:', error);

  // 기본 핸들러 fallback
  handleRequest = function (
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    routerContext: any
  ) {
    return new Promise((resolve, reject) => {
      const body = new PassThrough();

      const { pipe, abort } = renderToPipeableStream(
        <ServerRouter context={routerContext} url={request.url} />,
        {
          onShellReady() {
            const stream = createReadableStreamFromReadable(body);
            responseHeaders.set('Content-Type', 'text/html');
            resolve(
              new Response(stream, {
                headers: responseHeaders,
                status: responseStatusCode,
              })
            );
            pipe(body);
          },
          onShellError(error) {
            reject(error);
          },
          onError(error) {
            console.error('React render error:', error);
          },
        }
      );

      setTimeout(abort, streamTimeout);
    });
  };
}

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
