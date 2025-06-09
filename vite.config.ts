import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { execSync } from 'child_process';

export default defineConfig(({ mode }) => {
  // 환경 변수 로드
  const env = loadEnv(mode, process.cwd(), '');

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
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
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
        ],
        output: {
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
