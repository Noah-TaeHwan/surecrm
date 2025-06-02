import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  // 환경 변수 로드
  const env = loadEnv(mode, process.cwd(), '');

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
      // Node.js 전역 변수 polyfill
      global: 'globalThis',
    },
    resolve: {
      alias: {
        // Node.js 모듈 polyfill - 정확한 패키지 이름 사용
        buffer: 'buffer',
        crypto: 'crypto-browserify',
        stream: 'stream-browserify',
        util: 'util',
        process: 'process/browser',
        events: 'events',
      },
    },
    optimizeDeps: {
      include: [
        'buffer',
        'crypto-browserify',
        'stream-browserify',
        'util',
        'process',
        'events',
      ],
      exclude: ['pg-native'],
    },
    build: {
      rollupOptions: {
        external: ['pg-native'],
        output: {
          globals: {
            buffer: 'Buffer',
            process: 'process',
          },
        },
      },
    },
    // Node.js polyfill을 위한 설정
    server: {
      fs: {
        allow: ['..'],
      },
    },
  };
});
