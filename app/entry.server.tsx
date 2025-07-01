/* eslint-env node */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { createReadableStreamFromReadable } from '@react-router/node';
import {
  ServerRouter,
  type HandleErrorFunction,
  type EntryContext,
} from 'react-router';
import { renderToPipeableStream } from 'react-dom/server';
import * as Sentry from '@sentry/react-router';
import { checkCriticalEnvs } from './lib/core/safe-env';
import { PassThrough } from 'stream';
import './lib/i18n/server';

export const streamTimeout = 5_000;

// 서버 시작 시 환경변수 체크
console.log('🚀 SureCRM 서버 시작...');
checkCriticalEnvs();

// 🔧 프로덕션 환경 감지 (서버사이드)
function isProductionEnvironment(): boolean {
  // Vercel 환경변수 기반 판단
  if (process?.env?.VERCEL_ENV === 'production') {
    return true;
  }

  // NODE_ENV 기반 판단
  if (process?.env?.NODE_ENV === 'production') {
    return true;
  }

  return false;
}

// React 19 호환성을 위한 기본 핸들러 사용
let handleRequest: (
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext
) => Promise<Response>;

// 🔒 프로덕션에서만 Sentry 핸들러 사용
if (isProductionEnvironment()) {
  try {
    // Sentry 핸들러 시도
    handleRequest = Sentry.createSentryHandleRequest({
      ServerRouter,
      renderToPipeableStream,
      createReadableStreamFromReadable,
    }) as typeof handleRequest;
    console.log('🔒 Sentry 서버 핸들러 활성화됨 (프로덕션)');
  } catch (error) {
    console.warn('⚠️ Sentry 핸들러 생성 실패, 기본 핸들러 사용:', error);
    handleRequest = createFallbackHandler();
  }
} else {
  console.log('🔧 개발환경: Sentry 서버 핸들러 비활성화됨');
  handleRequest = createFallbackHandler();
}

// 기본 핸들러 생성 함수
function createFallbackHandler() {
  return function (
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    routerContext: EntryContext
  ): Promise<Response> {
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
    // 🔒 프로덕션에서만 Sentry로 오류 전송
    if (isProductionEnvironment()) {
      try {
        // Sentry가 사용 가능할 때만 캡처
        if (typeof Sentry.captureException === 'function') {
          Sentry.captureException(error);
        }
      } catch (sentryError) {
        console.warn('⚠️ Sentry 오류 캡처 실패:', sentryError);
      }
    }

    // 항상 콘솔에 로그 (개발환경에서는 더 자세히)
    if (isProductionEnvironment()) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error('🚨 Server Error:', errorMessage);
    } else {
      console.error('🔧 개발환경 Server Error:', error);
    }
  }
};
