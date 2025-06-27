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
          // 수동 청크 분할로 번들 크기 최적화 (더 세밀한 분리)
          manualChunks: id => {
            // node_modules의 패키지들을 더 세밀하게 분리
            if (id.includes('node_modules')) {
              // React 관련 라이브러리들
              if (
                id.includes('react') ||
                id.includes('react-dom') ||
                id.includes('react-router')
              ) {
                return 'react-vendor';
              }

              // Radix UI 컴포넌트들
              if (id.includes('@radix-ui')) return 'radix-vendor';

              // 애니메이션 라이브러리
              if (id.includes('framer-motion')) return 'animation-vendor';

              // 차트 라이브러리
              if (id.includes('recharts') || id.includes('d3'))
                return 'charts-vendor';

              // 아이콘 라이브러리
              if (
                id.includes('lucide-react') ||
                id.includes('@radix-ui/react-icons')
              ) {
                return 'icons-vendor';
              }

              // 유틸리티 라이브러리들
              if (
                id.includes('date-fns') ||
                id.includes('clsx') ||
                id.includes('tailwind-merge') ||
                id.includes('class-variance-authority') ||
                id.includes('react-hook-form') ||
                id.includes('@hookform/resolvers') ||
                id.includes('zod')
              ) {
                return 'utils-vendor';
              }

              // 데이터 관련 라이브러리
              if (id.includes('@supabase') || id.includes('drizzle-orm')) {
                return 'data-vendor';
              }

              // 분석 및 모니터링 도구들
              if (
                id.includes('@sentry') ||
                id.includes('@vercel/analytics') ||
                id.includes('@vercel/speed-insights')
              ) {
                return 'analytics-vendor';
              }

              // 기타 큰 라이브러리들
              if (
                id.includes('googleapis') ||
                id.includes('google-auth-library')
              ) {
                return 'google-vendor';
              }

              // 나머지는 기본 vendor
              return 'vendor';
            }
          },
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
