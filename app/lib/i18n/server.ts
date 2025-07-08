import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import FsBackend from 'i18next-fs-backend';
import path from 'path';

// 🌍 지원 언어 목록
export const SUPPORTED_LANGUAGES = ['ko', 'en', 'ja'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// URL에서 언어 코드 추출
export function getLangFromUrl(url: URL): SupportedLanguage {
  const pathname = url.pathname;
  const firstPart = pathname.split('/')[1];

  if (SUPPORTED_LANGUAGES.includes(firstPart as SupportedLanguage)) {
    return firstPart as SupportedLanguage;
  }

  return 'ko'; // Default language
}

// 🗂 네임스페이스 목록
export const NAMESPACES = [
  'common', // 공통 UI 요소 (버튼, 라벨 등)
  'navigation', // 메뉴, 네비게이션
  'landing', // 랜딩 페이지
  'forms', // 폼 라벨, 에러메시지
  'auth', // 인증 관련
  'dashboard', // 대시보드
  'clients', // 고객 관리
  'calendar', // 일정 관리
  'billing', // 결제, 구독
  'settings', // 설정
  'notifications', // 알림
  'network', // 소개 네트워크
  'pipeline', // 영업 파이프라인
  'invitations', // 초대장 관리
  'reports', // 보고서
  'errors', // 에러 메시지
] as const;

// 🌏 언어별 메타데이터
export const LANGUAGE_CONFIG = {
  ko: {
    name: '한국어',
    nativeName: '한국어',
    flag: '🇰🇷',
    dir: 'ltr' as const,
    dateFormat: 'yyyy년 MM월 dd일',
    timeFormat: 'HH:mm',
    currency: 'KRW',
    currencySymbol: '₩',
    locale: 'ko-KR',
  },
  en: {
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    dir: 'ltr' as const,
    dateFormat: 'MM/dd/yyyy',
    timeFormat: 'hh:mm a',
    currency: 'USD',
    currencySymbol: '$',
    locale: 'en-US',
  },
  ja: {
    name: '日本語',
    nativeName: '日本語',
    flag: '🇯🇵',
    dir: 'ltr' as const,
    dateFormat: 'yyyy年MM月dd일',
    timeFormat: 'HH:mm',
    currency: 'JPY',
    currencySymbol: '¥',
    locale: 'ja-JP',
  },
} as const;

// 서버용 i18n 인스턴스 생성
const serverI18n = i18n.createInstance();

serverI18n
  // 🗃️ 파일 시스템 백엔드 사용 (서버 전용)
  .use(FsBackend)

  // ⚛️ React와 연동
  .use(initReactI18next)

  // ⚙️ 초기화
  .init({
    // 기본 언어 설정 (서버에서는 한국어 고정)
    lng: 'ko',
    fallbackLng: 'ko',

    // 네임스페이스 설정
    ns: NAMESPACES,
    defaultNS: 'common',

    // 지원 언어
    supportedLngs: SUPPORTED_LANGUAGES,

    // 백엔드 설정 (파일 시스템)
    backend: {
      loadPath: path.join(process.cwd(), 'public/locales/{{lng}}/{{ns}}.json'),
    },

    // 디버그 모드 비활성화
    debug: false,

    // 인터폴레이션 설정
    interpolation: {
      escapeValue: false, // React는 XSS를 자동으로 방지
    },

    // 리액트 설정
    react: {
      useSuspense: false, // SSR에서는 서스펜스 비활성화
    },

    // 서버에서는 즉시 로드
    initImmediate: false,
  });

// 서버에서 번역 파일 미리 로드
async function preloadTranslations() {
  try {
    await serverI18n.loadResources();
    console.log('✅ Server i18n translations preloaded successfully');
  } catch (error) {
    console.error('❌ Failed to preload server i18n translations:', error);
  }
}

// 서버 시작 시 번역 파일 로드
preloadTranslations();

export default serverI18n;
