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

  // 🚀 정적 페이지 미리 렌더링 (SEO 최적화)
  async prerender() {
    // 검색 엔진에 노출할 주요 공개 페이지들
    const publicPages = [
      '/', // 랜딩페이지
      '/features', // 기능 소개
      '/pricing', // 요금제
      '/contact', // 문의하기
      '/help', // 도움말
      '/terms', // 이용약관
      '/privacy', // 개인정보처리방침
    ];

    // 다국어 지원 - 각 페이지의 언어별 버전 추가
    const languages = ['ko', 'en', 'ja'];
    const allPages: string[] = [];

    // 기본 언어 (한국어) 페이지들
    allPages.push(...publicPages);

    // 다국어 버전 페이지들
    languages.forEach(lang => {
      if (lang !== 'ko') {
        // 기본 언어가 아닌 경우
        publicPages.forEach(page => {
          const localizedPage = page === '/' ? `/${lang}` : `/${lang}${page}`;
          allPages.push(localizedPage);
        });
      }
    });

    console.log('🔍 Prerendering pages:', allPages);
    return allPages;
  },
} satisfies Config;
