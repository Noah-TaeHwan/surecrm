import {
  changeLanguage,
  type SupportedLanguage,
  SUPPORTED_LANGUAGES,
} from './index';

// 🍪 쿠키 관리 함수들
const LANGUAGE_COOKIE_NAME = 'preferred-language';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1년

// 🔄 전역 업데이트 함수들 추가
let updateCallbacks: (() => void)[] = [];

/**
 * 🍪 쿠키에서 언어 설정 조회
 */
export function getLanguageFromCookie(): SupportedLanguage | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  const languageCookie = cookies.find(cookie =>
    cookie.trim().startsWith(`${LANGUAGE_COOKIE_NAME}=`)
  );

  if (languageCookie) {
    const language = languageCookie.split('=')[1];
    if (SUPPORTED_LANGUAGES.includes(language as SupportedLanguage)) {
      return language as SupportedLanguage;
    }
  }

  return null;
}

/**
 * 🍪 쿠키에 언어 설정 저장
 */
export function setLanguageCookie(language: SupportedLanguage) {
  if (typeof document === 'undefined') return;

  const expires = new Date();
  expires.setTime(expires.getTime() + COOKIE_MAX_AGE * 1000);

  // HttpOnly=false로 설정하여 클라이언트에서 읽을 수 있도록 하고
  // 서버와의 동기화를 위해 즉시 적용되도록 설정
  document.cookie = `${LANGUAGE_COOKIE_NAME}=${language}; expires=${expires.toUTCString()}; path=/; SameSite=Lax; HttpOnly=false`;
}

/**
 * 📱 localStorage에서 언어 설정 조회
 */
export function getLanguageFromLocalStorage(): SupportedLanguage | null {
  if (typeof localStorage === 'undefined') return null;

  try {
    const language = localStorage.getItem('i18nextLng');
    if (
      language &&
      SUPPORTED_LANGUAGES.includes(language as SupportedLanguage)
    ) {
      return language as SupportedLanguage;
    }
  } catch (error) {
    console.error('localStorage 접근 실패:', error);
  }

  return null;
}

/**
 * 📱 localStorage에 언어 설정 저장
 */
export function setLanguageToLocalStorage(language: SupportedLanguage) {
  if (typeof localStorage === 'undefined') return;

  try {
    localStorage.setItem('i18nextLng', language);
  } catch (error) {
    console.error('localStorage 저장 실패:', error);
  }
}

/**
 * 🌍 클라이언트에서 언어 변경 (통합 함수)
 * 쿠키 + localStorage + i18next 모두 업데이트
 */
export async function changeLanguageClient(
  language: SupportedLanguage
): Promise<boolean> {
  try {
    // 1️⃣ 쿠키에 저장 (서버와 동기화)
    setLanguageCookie(language);

    // 2️⃣ localStorage에 저장 (브라우저 캐시)
    setLanguageToLocalStorage(language);

    // 3️⃣ i18next 언어 변경 (이것이 자동으로 모든 컴포넌트를 업데이트함)
    await changeLanguage(language);

    // 4️⃣ HTML 언어 속성 업데이트
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = 'ltr'; // 모든 지원 언어가 ltr이므로
    }

    // 5️⃣ 커스텀 이벤트 발생 (추가 컴포넌트 업데이트 트리거)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('languageChanged', {
          detail: { language },
        })
      );
    }

    // 6️⃣ 모든 등록된 컴포넌트 강제 업데이트
    forceUpdateI18nComponents();

    return true;
  } catch (error) {
    console.error('클라이언트 언어 변경 실패:', error);
    return false;
  }
}

/**
 * 🔍 클라이언트에서 언어 감지 (계층적 접근)
 * 쿠키 > localStorage > 브라우저 언어 > 기본값
 */
export function detectClientLanguage(): SupportedLanguage {
  // 1️⃣ 쿠키에서 조회
  const cookieLanguage = getLanguageFromCookie();
  if (cookieLanguage) {
    return cookieLanguage;
  }

  // 2️⃣ localStorage에서 조회
  const localStorageLanguage = getLanguageFromLocalStorage();
  if (localStorageLanguage) {
    // 쿠키에 동기화
    setLanguageCookie(localStorageLanguage);
    return localStorageLanguage;
  }

  // 3️⃣ 브라우저 언어 감지
  if (typeof navigator !== 'undefined') {
    const browserLanguage = navigator.language.split('-')[0];
    if (SUPPORTED_LANGUAGES.includes(browserLanguage as SupportedLanguage)) {
      const detectedLanguage = browserLanguage as SupportedLanguage;
      // 감지된 언어 저장
      setLanguageCookie(detectedLanguage);
      setLanguageToLocalStorage(detectedLanguage);
      return detectedLanguage;
    }
  }

  // 4️⃣ 기본값 사용
  const defaultLanguage: SupportedLanguage = 'ko';
  setLanguageCookie(defaultLanguage);
  setLanguageToLocalStorage(defaultLanguage);
  return defaultLanguage;
}

/**
 * 🚀 클라이언트 초기화 함수
 * 페이지 로드 시 언어 설정 동기화
 */
export function initializeClientLanguage() {
  const detectedLanguage = detectClientLanguage();

  // i18next 언어 설정 (비동기이지만 await하지 않음)
  changeLanguage(detectedLanguage).catch(error => {
    console.error('초기 언어 설정 실패:', error);
  });

  return detectedLanguage;
}

/**
 * 🔄 서버-클라이언트 언어 동기화
 * 서버에서 감지된 언어를 클라이언트에 적용
 */
export function syncServerLanguage(serverLanguage: SupportedLanguage) {
  const clientLanguage = detectClientLanguage();

  // 서버와 클라이언트 언어가 다르면 서버 언어로 동기화
  if (clientLanguage !== serverLanguage) {
    changeLanguageClient(serverLanguage).catch(error => {
      console.error('서버-클라이언트 언어 동기화 실패:', error);
    });
  }
}

/**
 * 🔄 i18n 업데이트 콜백 등록
 */
export function registerI18nUpdateCallback(callback: () => void) {
  updateCallbacks.push(callback);

  // cleanup 함수 반환
  return () => {
    updateCallbacks = updateCallbacks.filter(cb => cb !== callback);
  };
}

/**
 * 🚀 모든 i18n 컴포넌트 강제 업데이트
 */
export function forceUpdateI18nComponents() {
  updateCallbacks.forEach(callback => {
    try {
      callback();
    } catch (error) {
      console.error('i18n 업데이트 콜백 실행 실패:', error);
    }
  });
}
