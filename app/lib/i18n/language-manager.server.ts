import 'server-only';
import { cookies } from 'next/headers';
import type { SupportedLanguage } from './index';
import { SUPPORTED_LANGUAGES } from './index';

// 🍪 쿠키 설정
const LANGUAGE_COOKIE_NAME = 'preferred-language';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1년

/**
 * 🌍 서버에서 사용자 언어 감지 (쿠키 기반)
 */
export async function detectUserLanguage(
  acceptLanguageHeader?: string
): Promise<SupportedLanguage> {
  let detectedLanguage: SupportedLanguage = 'ko';

  try {
    // 1️⃣ 쿠키에서 언어 설정 조회
    const cookieStore = await cookies();
    const cookieLanguage = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value;

    if (
      cookieLanguage &&
      SUPPORTED_LANGUAGES.includes(cookieLanguage as SupportedLanguage)
    ) {
      detectedLanguage = cookieLanguage as SupportedLanguage;
      return detectedLanguage;
    }

    // 2️⃣ 브라우저 Accept-Language 헤더에서 감지
    if (acceptLanguageHeader) {
      const browserLanguage = detectFromAcceptLanguage(acceptLanguageHeader);
      if (browserLanguage) {
        detectedLanguage = browserLanguage;
        // 🍪 감지된 언어를 쿠키에 저장
        await setLanguageCookie(detectedLanguage);
        return detectedLanguage;
      }
    }

    // 3️⃣ 기본값 사용 및 쿠키 저장
    await setLanguageCookie(detectedLanguage);
    return detectedLanguage;
  } catch (error) {
    console.error('언어 감지 중 오류 발생:', error);
    await setLanguageCookie(detectedLanguage);
    return detectedLanguage;
  }
}

/**
 * 🍪 언어 설정을 쿠키에 저장
 */
export async function setLanguageCookie(language: SupportedLanguage) {
  try {
    const cookieStore = await cookies();
    cookieStore.set(LANGUAGE_COOKIE_NAME, language, {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: false, // 클라이언트에서도 접근 가능하도록
      secure:
        typeof process !== 'undefined' && process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  } catch (error) {
    console.error('쿠키 저장 중 오류 발생:', error);
  }
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
 * 🔍 현재 요청의 언어 설정 조회
 */
export async function getCurrentLanguage(): Promise<SupportedLanguage> {
  try {
    const cookieStore = await cookies();
    const language = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value;

    if (
      language &&
      SUPPORTED_LANGUAGES.includes(language as SupportedLanguage)
    ) {
      return language as SupportedLanguage;
    }

    return 'ko';
  } catch (error) {
    console.error('현재 언어 조회 실패:', error);
    return 'ko';
  }
}
