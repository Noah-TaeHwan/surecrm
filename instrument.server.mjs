import * as Sentry from '@sentry/react-router';

// 🔧 프로덕션 환경 감지 (서버사이드)
function isProductionEnvironment() {
  // Vercel 환경변수 기반 판단
  if (process.env.VERCEL_ENV === 'production') {
    return true;
  }

  // NODE_ENV 기반 판단
  if (process.env.NODE_ENV === 'production') {
    return true;
  }

  return false;
}

// 🔒 프로덕션에서만 Sentry 초기화
if (isProductionEnvironment()) {
  Sentry.init({
    dsn: 'https://8193c277a9cc1a3fe000ad5550db6412@o4509563207876608.ingest.us.sentry.io/4509563214364672',
    environment: 'production',

    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/react-router/configuration/options/#sendDefaultPii
    sendDefaultPii: true,
  });

  console.log('🔒 Sentry 서버 instrument 초기화됨 (프로덕션)');
} else {
  console.log('🔧 개발환경: Sentry 서버 instrument 비활성화됨');
}
