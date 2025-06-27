import type { Config } from '@react-router/dev/config';
import { vercelPreset } from '@vercel/react-router/vite';
import { sentryOnBuildEnd } from '@sentry/react-router';

export default {
  // Config options...
  // SSR 모드로 복원 (기존 로직 유지)
  ssr: true,
  presets: [vercelPreset],
  // 🔄 파일 기반 라우팅 활성화
  // routes.ts 파일 없이 app/routes/ 폴더의 파일들로 라우팅
  // routes: "./app/routes", // 이 옵션은 실제로는 기본값이므로 명시적으로 설정할 필요 없음
  buildEnd: async ({ viteConfig, reactRouterConfig, buildManifest }) => {
    // Sentry 빌드 완료 후 처리
    await sentryOnBuildEnd({ viteConfig, reactRouterConfig, buildManifest });
  },
  // 빌드 디렉토리 설정 (Vercel 호환)
  buildDirectory: 'build',
  // 앱 디렉토리 설정
  appDirectory: 'app',
  // 서버 빌드 설정
  serverBuildFile: 'index.js',
} satisfies Config;
