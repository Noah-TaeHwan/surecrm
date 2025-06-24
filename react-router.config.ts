import type { Config } from '@react-router/dev/config';
import { vercelPreset } from '@vercel/react-router/vite';

export default {
  // Config options...
  // SSR 모드로 복원 (기존 로직 유지)
  ssr: true,
  presets: [vercelPreset],
  // 🔄 파일 기반 라우팅 활성화
  // routes.ts 파일 없이 app/routes/ 폴더의 파일들로 라우팅
  // routes: "./app/routes", // 이 옵션은 실제로는 기본값이므로 명시적으로 설정할 필요 없음

  // 개발 서버 안정성 향상
  dev: {
    port: 5173,
    host: true,
  },
} satisfies Config;
