import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { execSync } from 'child_process';

export default defineConfig(({ mode }) => {
  // 환경 변수 로드
  const env = loadEnv(mode, process.cwd(), '');

  // Git 정보 자동 수집 - 개발 환경에서만 최적화
  let gitTag = '';
  let gitCommit = '';

  if (mode === 'production') {
    try {
      // 프로덕션에서는 Git 명령어 실행 (Vercel에서 필요)
      gitTag = execSync('git describe --tags --abbrev=0', {
        encoding: 'utf8',
        timeout: 5000,
      }).trim();
    } catch (error) {
      try {
        const packageJson = require('./package.json');
        gitTag = `v${packageJson.version}`;
      } catch (e) {
        gitTag = 'v0.1.0';
      }
    }

    try {
      gitCommit = execSync('git rev-parse HEAD', {
        encoding: 'utf8',
        timeout: 5000,
      }).trim();
    } catch (error) {
      gitCommit = 'unknown';
    }
  } else {
    // 개발 환경에서만 Git 명령어 생략
    try {
      const packageJson = require('./package.json');
      gitTag = `v${packageJson.version}`;
      gitCommit = 'dev';
    } catch (e) {
      gitTag = 'v0.1.0';
      gitCommit = 'dev';
    }
  }

  return {
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    define: {
      // 서버사이드에서 환경 변수 사용 가능하도록 설정 (Vercel에서 필요)
      'process.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL || ''),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(
        env.SUPABASE_ANON_KEY || ''
      ),
      'process.env.SUPABASE_SERVICE_ROLE_KEY': JSON.stringify(
        env.SUPABASE_SERVICE_ROLE_KEY || ''
      ),
      'process.env.DATABASE_URL': JSON.stringify(env.DATABASE_URL || ''),
      'process.env.SESSION_SECRET': JSON.stringify(
        env.SESSION_SECRET || 'fallback-secret'
      ),
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV || mode),
      // Git 버전 정보 주입
      'process.env.VITE_GIT_TAG': JSON.stringify(gitTag),
      'process.env.VITE_GIT_COMMIT': JSON.stringify(gitCommit),
      // Vercel 환경변수 주입
      'process.env.VERCEL_ENV': JSON.stringify(env.VERCEL_ENV || ''),
      'process.env.VERCEL_GIT_COMMIT_SHA': JSON.stringify(
        env.VERCEL_GIT_COMMIT_SHA || ''
      ),
      // 전역 변수
      global: 'globalThis',
    },
    // optimizeDeps 설정
    optimizeDeps: {
      exclude: [
        'pg-native',
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
        // 프로덕션에서 필요한 polyfill들 복원
        ...(mode === 'production' && {
          net: 'data:text/javascript,export default {}',
          tls: 'data:text/javascript,export default {}',
          fs: 'data:text/javascript,export default {}',
          os: 'data:text/javascript,export default {}',
          dotenv:
            'data:text/javascript,export default {}; export const config = () => {}',
          postgres: 'data:text/javascript,export default () => {}',
          'drizzle-orm/postgres-js':
            'data:text/javascript,export const drizzle = () => {}',
        }),
      },
    },
    // 빌드 설정
    build: {
      sourcemap: false, // sourcemap 비활성화로 에러 방지
      minify: 'esbuild',
      target: 'esnext',
      rollupOptions: {
        external: [
          'pg-native',
          'googleapis',
          'gcp-metadata',
          'google-auth-library',
          'gtoken',
          'jws',
          'google-p12-pem',
        ],
        onwarn: (warning, warn) => {
          // sourcemap 관련 경고 무시
          if (warning.code === 'SOURCEMAP_ERROR') return;
          warn(warning);
        },
      },
    },
    // 서버 설정
    server: {
      port: 5173,
      host: true,
      fs: {
        allow: ['..'],
      },
    },
    // 개발 환경에서 빌드 성능 향상
    esbuild: {
      target: 'esnext',
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
    },
  };
});
