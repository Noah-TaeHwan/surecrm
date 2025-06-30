import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// 🌍 지원 언어 목록
export const SUPPORTED_LANGUAGES = ['ko', 'en', 'ja'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

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

i18n
  // 🌐 백엔드에서 번역 파일 로드
  .use(Backend)

  // 🕵️ 언어 자동 감지
  .use(LanguageDetector)

  // ⚛️ React와 연동
  .use(initReactI18next)

  // ⚙️ 초기화
  .init({
    // 기본 언어 설정
    lng: 'ko',
    fallbackLng: 'ko',

    // 네임스페이스 설정
    ns: NAMESPACES,
    defaultNS: 'common',

    // 지원 언어
    supportedLngs: SUPPORTED_LANGUAGES,

    // 백엔드 설정
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    // 디버그 모드 (필요시에만 활성화)
    debug: false, // 대량 로그 방지

    // 인터폴레이션 설정
    interpolation: {
      escapeValue: false, // React는 XSS를 자동으로 방지
    },

    // 리액트 설정
    react: {
      useSuspense: false, // SSR 호환성을 위해 비활성화
    },
  });

// 🔄 언어 변경 유틸리티
export const changeLanguage = async (language: SupportedLanguage) => {
  await i18n.changeLanguage(language);

  // HTML lang 속성 업데이트
  if (typeof document !== 'undefined') {
    document.documentElement.lang = language;
    document.documentElement.dir = LANGUAGE_CONFIG[language].dir;
  }

  // 로컬스토리지에 저장
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('i18nextLng', language);
  }
};

// 🌍 현재 언어 정보 가져오기
export const getCurrentLanguageConfig = () => {
  const currentLang = i18n.language as SupportedLanguage;
  return LANGUAGE_CONFIG[currentLang] || LANGUAGE_CONFIG.ko;
};

// 🔍 브라우저 언어 감지
export const detectBrowserLanguage = (): SupportedLanguage => {
  if (typeof navigator === 'undefined') return 'ko';

  const browserLang = navigator.language.split('-')[0];
  return SUPPORTED_LANGUAGES.includes(browserLang as SupportedLanguage)
    ? (browserLang as SupportedLanguage)
    : 'ko';
};

// 📱 모바일 환경 감지
export const isMobileDevice = () => {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export default i18n;
