import type { Config } from '@react-router/dev/config';
import { vercelPreset } from '@vercel/react-router/vite';

export default {
  // Config options...
  // SPA 모드로 변경 (Vercel 배포 안정성을 위해)
  ssr: false,
  presets: [vercelPreset],
  // 🔄 파일 기반 라우팅 활성화
  // routes.ts 파일 없이 app/routes/ 폴더의 파일들로 라우팅
  // routes: "./app/routes", // 이 옵션은 실제로는 기본값이므로 명시적으로 설정할 필요 없음
} satisfies Config;
