import { reactRouter } from '@react-router/dev/vite';
import {
  sentryReactRouter,
  type SentryReactRouterBuildOptions,
} from '@sentry/react-router';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { execSync } from 'child_process';
// import { vercelPreset } from '@vercel/react-router/vite';

export default defineConfig(config => {
  const { mode } = config;
  // 환경 변수 로드
  const env = loadEnv(mode, process.cwd(), '');

  const sentryConfig: SentryReactRouterBuildOptions = {
    org: 'oh-taehwan',
    project: 'surecrm',
    authToken: env.SENTRY_AUTH_TOKEN,
  };

  // Sentry 인증 토큰이 없으면 경고 메시지 출력
  if (mode === 'production' && !sentryConfig.authToken) {
    console.warn(
      '🚨 SENTRY_AUTH_TOKEN이 설정되지 않았습니다. 소스맵 업로드를 건너뜁니다.'
    );
  }

  // Git 정보 자동 수집
  let gitTag = '';
  let gitCommit = '';

  try {
    // 현재 Git tag 가져오기 (가장 최근 tag)
    gitTag = execSync('git describe --tags --abbrev=0', {
      encoding: 'utf8',
    }).trim();
  } catch (error) {
    // Git tag가 없으면 package.json version 사용
    try {
      const packageJson = require('./package.json');
      gitTag = `v${packageJson.version}`;
    } catch (e) {
      gitTag = 'v0.1.0';
    }
  }

  try {
    // 현재 커밋 해시 가져오기
    gitCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    gitCommit = 'unknown';
  }

  return {
    plugins: [
      tailwindcss(),
      reactRouter(),
      sentryReactRouter(sentryConfig, config),
      tsconfigPaths(),
    ],
    define: {
      // 서버사이드에서 환경 변수 사용 가능하도록 설정
      'process.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY),
      'process.env.SUPABASE_SERVICE_ROLE_KEY': JSON.stringify(
        env.SUPABASE_SERVICE_ROLE_KEY
      ),
      'process.env.DATABASE_URL': JSON.stringify(env.DATABASE_URL),
      'process.env.SESSION_SECRET': JSON.stringify(env.SESSION_SECRET),
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
      // 🏷️ Git 버전 정보 주입
      'process.env.VITE_GIT_TAG': JSON.stringify(gitTag),
      'process.env.VITE_GIT_COMMIT': JSON.stringify(gitCommit),
      // 🏷️ Vercel 환경변수 주입
      'process.env.VERCEL_ENV': JSON.stringify(env.VERCEL_ENV),
      'process.env.VERCEL_GIT_COMMIT_SHA': JSON.stringify(
        env.VERCEL_GIT_COMMIT_SHA
      ),
      // 최소한의 전역 변수만 설정
      global: 'globalThis',
      // Node.js 모듈 비활성화
      'process.browser': 'true',
      'process.env.NODE_DEBUG': 'undefined',
    },
    // Buffer 및 Node.js 모듈 polyfill 강화
    optimizeDeps: {
      exclude: [
        'pg-native',
        'net',
        'tls',
        'fs',
        'os',
        'crypto',
        'stream',
        'util',
        'events',
        'child_process',
        'dgram',
        'http',
        'https',
        'path',
        'url',
        'querystring',
        'zlib',
        'dotenv',
        'postgres',
        'drizzle-orm/postgres-js',
        'drizzle-orm',
        // 🔌 구글 API 관련 패키지 제외
        'googleapis',
        'gcp-metadata',
        'google-auth-library',
        'gtoken',
        'jws',
        'google-p12-pem',
      ],
      include: ['buffer'],
    },
    resolve: {
      alias: {
        buffer: 'buffer',
        // Node.js 모듈들을 빈 모듈로 대체
        net: 'data:text/javascript,export default {}',
        tls: 'data:text/javascript,export default {}',
        fs: 'data:text/javascript,export default {}',
        os: 'data:text/javascript,export default {}',
        stream: 'data:text/javascript,export default {}',
        util: 'data:text/javascript,export default {}',
        events: 'data:text/javascript,export default {}',
        crypto: 'data:text/javascript,export default {}',
        http: 'data:text/javascript,export default {}',
        https: 'data:text/javascript,export default {}',
        url: 'data:text/javascript,export default {}',
        path: 'data:text/javascript,export default {}',
        querystring: 'data:text/javascript,export default {}',
        zlib: 'data:text/javascript,export default {}',
        dotenv:
          'data:text/javascript,export default {}; export const config = () => {}',
        postgres: 'data:text/javascript,export default () => {}',
        'drizzle-orm/postgres-js':
          'data:text/javascript,export const drizzle = () => {}',
      },
    },
    // Rollup 옵션에서 외부 모듈과 polyfill 설정
    build: {
      // Source map 활성화 (프로덕션에서는 숨김)
      sourcemap: mode === 'production' ? 'hidden' : true,
      // Chunk 크기 경고 제한 증가
      chunkSizeWarningLimit: 1000,
      // React Router v7을 위한 최적화된 빌드 설정
      target: 'esnext',
      minify: 'esbuild',
      rollupOptions: {
        external: [
          'pg-native',
          'net',
          'tls',
          'fs',
          'os',
          'crypto',
          'stream',
          'util',
          'events',
          'child_process',
          'dgram',
          'http',
          'https',
          'path',
          'url',
          'querystring',
          'zlib',
          'dotenv',
          'postgres',
          'drizzle-orm/postgres-js',
          'drizzle-orm',
          // 🔌 구글 API 관련 패키지를 외부 의존성으로 처리
          'googleapis',
          'gcp-metadata',
          'google-auth-library',
          'gtoken',
          'jws',
          'google-p12-pem',
        ],
        output: {
          // ES modules 호환성 강화
          format: 'es',
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          // React Router v7은 자체 코드 분할을 사용
          globals: {
            buffer: 'Buffer',
            net: '{}',
            tls: '{}',
            fs: '{}',
            os: '{}',
            crypto: '{}',
            stream: '{}',
            util: '{}',
            events: '{}',
            http: '{}',
            https: '{}',
            path: '{}',
            url: '{}',
            querystring: '{}',
            zlib: '{}',
            dotenv: '{}',
            postgres: '{}',
            'drizzle-orm/postgres-js': '{}',
            'drizzle-orm': '{}',
          },
        },
      },
    },
    // 서버 설정 단순화
    server: {
      fs: {
        allow: ['..'],
      },
    },
  };
});
