import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  // 환경 변수 로드
  const env = loadEnv(mode, process.cwd(), '');

  // Git 명령어 완전 비활성화 - 개발 속도 향상
  let gitTag = '';
  let gitCommit = '';

  try {
    const packageJson = require('./package.json');
    gitTag = `v${packageJson.version}`;
    gitCommit = 'dev';
  } catch (e) {
    gitTag = 'v0.1.0';
    gitCommit = 'dev';
  }

  return {
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    define: {
      // 필수 환경 변수만 정의
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV || 'development'),
      'process.env.VITE_GIT_TAG': JSON.stringify(gitTag),
      'process.env.VITE_GIT_COMMIT': JSON.stringify(gitCommit),
      // 기본 전역 변수
      global: 'globalThis',
    },
    // 최소한의 optimizeDeps 설정
    optimizeDeps: {
      exclude: ['pg-native'],
      include: ['buffer'],
    },
    resolve: {
      alias: {
        buffer: 'buffer',
      },
    },
    // 간단한 서버 설정
    server: {
      port: 5173,
      host: true,
    },
    // 빌드 성능 향상
    esbuild: {
      target: 'esnext',
    },
  };
});
