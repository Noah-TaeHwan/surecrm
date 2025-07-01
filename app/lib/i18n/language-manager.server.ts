import type { SupportedLanguage } from './index';
import { SUPPORTED_LANGUAGES } from './index';

// 🍪 쿠키 설정
const LANGUAGE_COOKIE_NAME = 'preferred-language';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1년

/**
 * 🌍 서버에서 사용자 언어 감지 (React Router 쿠키 기반)
 */
export function detectUserLanguageFromRequest(
  request: Request
): SupportedLanguage {
  let detectedLanguage: SupportedLanguage = 'ko';

  try {
    // 1️⃣ 쿠키에서 언어 설정 조회
    const cookieHeader = request.headers.get('Cookie');
    
    if (cookieHeader) {
      const cookieLanguage = getCookieValue(cookieHeader, LANGUAGE_COOKIE_NAME);
      
      if (
        cookieLanguage &&
        SUPPORTED_LANGUAGES.includes(cookieLanguage as SupportedLanguage)
      ) {
        return cookieLanguage as SupportedLanguage;
      }
    }

    // 2️⃣ 브라우저 Accept-Language 헤더에서 감지
    const acceptLanguageHeader = request.headers.get('Accept-Language');
    if (acceptLanguageHeader) {
              const browserLanguage = detectFromAcceptLanguage(acceptLanguageHeader);
        if (browserLanguage) {
          detectedLanguage = browserLanguage;
          return detectedLanguage;
        }
      }

      // 3️⃣ 기본값 사용
      return detectedLanguage;
  } catch (error) {
    console.error('언어 감지 중 오류 발생:', error);
    return detectedLanguage;
  }
}

/**
 * 🍪 쿠키에서 값 추출 (React Router용)
 */
function getCookieValue(cookieHeader: string, name: string): string | null {
  try {
    const cookies = cookieHeader.split(';');
    for (const cookie of cookies) {
      const trimmedCookie = cookie.trim();
      const equalIndex = trimmedCookie.indexOf('=');
      
      if (equalIndex > 0) {
        const key = trimmedCookie.substring(0, equalIndex);
        const value = trimmedCookie.substring(equalIndex + 1);
        
        if (key === name && value) {
          return decodeURIComponent(value);
        }
      }
    }
  } catch (error) {
    console.error(`쿠키 파싱 오류 (${name}):`, error);
  }
  return null;
}

/**
 * 🍪 언어 설정 쿠키 생성 (React Router Response용)
 */
export function createLanguageCookie(language: SupportedLanguage): string {
  const secure = process.env.NODE_ENV === 'production';
  return `${LANGUAGE_COOKIE_NAME}=${language}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax; HttpOnly=false${secure ? '; Secure' : ''}`;
}

/**
 * 🌐 Accept-Language 헤더에서 언어 감지
 */
function detectFromAcceptLanguage(
  acceptLanguage: string
): SupportedLanguage | null {
  // Accept-Language: ko-KR,ko;q=0.9,en;q=0.8,ja;q=0.7
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, qValue] = lang.trim().split(';q=');
      const langCode = code.split('-')[0]; // ko-KR -> ko
      const quality = qValue ? parseFloat(qValue) : 1.0;
      return { code: langCode, quality };
    })
    .sort((a, b) => b.quality - a.quality); // 우선순위 정렬

  for (const { code } of languages) {
    if (SUPPORTED_LANGUAGES.includes(code as SupportedLanguage)) {
      return code as SupportedLanguage;
    }
  }

  return null;
}

/**
 * 📚 서버에서 번역 사전 로드 (JSON 직접 import)
 */
export async function loadServerTranslations(
  language: SupportedLanguage,
  namespace = 'common'
): Promise<Record<string, any>> {
  try {
    // 동적 import로 번역 파일 로드
    const translations = await import(
      `../../../public/locales/${language}/${namespace}.json`
    );
    return translations.default || translations;
  } catch (error) {
    console.error(`번역 파일 로드 실패: ${language}/${namespace}`, error);

    // 📍 한국어 기본값으로 폴백
    if (language !== 'ko') {
      try {
        const fallback = await import(
          `../../../public/locales/ko/${namespace}.json`
        );
        return fallback.default || fallback;
      } catch (fallbackError) {
        console.error('기본 번역 파일도 로드 실패:', fallbackError);
      }
    }

    return {};
  }
}

/**
 * 🔍 서버에서 번역 키 조회
 */
export function getTranslation(
  translations: Record<string, any>,
  key: string,
  fallback?: string
): string {
  try {
    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fallback || key;
      }
    }

    return typeof value === 'string' ? value : fallback || key;
  } catch (error) {
    console.error(`번역 키 조회 실패: ${key}`, error);
    return fallback || key;
  }
}

/**
 * 🛡 서버 사이드 번역 함수 (meta용)
 */
export async function createServerTranslator(
  request: Request,
  namespace: string = 'common'
) {
  const language = detectUserLanguageFromRequest(request);
  const translations = await loadServerTranslations(language, namespace);

  return {
    t: (key: string, fallback?: string) =>
      getTranslation(translations, key, fallback),
    language,
    translations,
  };
}
