import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { SupportedLanguage } from './index';
import { registerI18nUpdateCallback } from './language-manager.client';

/**
 * 🛡 Hydration-Safe 번역 Hook
 * 서버-클라이언트 번역 불일치로 인한 hydration 에러를 방지
 */
export function useHydrationSafeTranslation(namespace?: string) {
  const { t, i18n } = useTranslation(namespace);
  const [isHydrated, setIsHydrated] = useState(false);
  const [, forceUpdate] = useState({});

  useEffect(() => {
    setIsHydrated(true);

    // 언어 변경 이벤트 리스너 추가
    const handleLanguageChange = () => {
      forceUpdate({}); // 강제 리렌더링
    };

    let cleanup: (() => void) | undefined;

    if (typeof window !== 'undefined') {
      // 전역 이벤트 리스너
      window.addEventListener('languageChanged', handleLanguageChange);

      // 업데이트 콜백 등록
      cleanup = registerI18nUpdateCallback(handleLanguageChange);

      return () => {
        window.removeEventListener('languageChanged', handleLanguageChange);
        cleanup?.();
      };
    }
  }, []);

  /**
   * 🌐 Hydration-Safe 번역 함수
   * @param key 번역 키
   * @param fallbackOrOptions 한국어 기본값 또는 i18next 옵션
   * @param options i18next 옵션 (interpolation 등)
   */
  const safeT = (
    key: string,
    fallbackOrOptions?: string | Record<string, unknown>,
    options?: Record<string, unknown>
  ): string => {
    // 매개변수 파싱
    let fallback: string;
    let translationOptions: Record<string, unknown> | undefined;

    if (typeof fallbackOrOptions === 'string') {
      fallback = fallbackOrOptions;
      translationOptions = options;
    } else if (typeof fallbackOrOptions === 'object') {
      fallback = key; // 키를 기본값으로 사용
      translationOptions = fallbackOrOptions;
    } else {
      fallback = key; // 키를 기본값으로 사용
      translationOptions = options;
    }

    if (!isHydrated) {
      // Hydration 전에는 기본값 사용
      return fallback;
    }

    try {
      return t(key, translationOptions) as string;
    } catch {
      console.error(`번역 실패: ${key}`);
      return fallback;
    }
  };

  /**
   * 🏷 현재 언어 조회 (hydration-safe)
   */
  const getCurrentLanguage = (): SupportedLanguage => {
    if (!isHydrated) return 'ko';
    return (i18n.language as SupportedLanguage) || 'ko';
  };

  /**
   * 🗓 날짜 포맷 함수 (hydration-safe)
   */
  const formatDate = (
    date: Date | string | number,
    options?: Intl.DateTimeFormatOptions
  ): string => {
    const fallback = new Date(date).toLocaleDateString('ko-KR');

    if (!isHydrated) return fallback;

    try {
      const lang = getCurrentLanguage();
      const locale =
        lang === 'ko' ? 'ko-KR' : lang === 'ja' ? 'ja-JP' : 'en-US';
      return new Date(date).toLocaleDateString(locale, options);
    } catch {
      return fallback;
    }
  };

  /**
   * 🔢 숫자 포맷 함수 (hydration-safe)
   */
  const formatNumber = (
    number: number,
    options?: Intl.NumberFormatOptions
  ): string => {
    const fallback = number.toLocaleString('ko-KR');

    if (!isHydrated) return fallback;

    try {
      const lang = getCurrentLanguage();
      const locale =
        lang === 'ko' ? 'ko-KR' : lang === 'ja' ? 'ja-JP' : 'en-US';
      return number.toLocaleString(locale, options);
    } catch {
      return fallback;
    }
  };

  /**
   * 💰 통화 포맷 함수 (hydration-safe)
   */
  const formatCurrency = (amount: number, currency?: string): string => {
    const fallback = `₩${amount.toLocaleString('ko-KR')}`;

    if (!isHydrated) return fallback;

    try {
      const lang = getCurrentLanguage();
      const defaultCurrency =
        lang === 'ko' ? 'KRW' : lang === 'ja' ? 'JPY' : 'USD';
      const targetCurrency = currency || defaultCurrency;
      const locale =
        lang === 'ko' ? 'ko-KR' : lang === 'ja' ? 'ja-JP' : 'en-US';

      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: targetCurrency,
      }).format(amount);
    } catch {
      return fallback;
    }
  };

  return {
    t: safeT,
    isHydrated,
    i18n,
    getCurrentLanguage,
    formatDate,
    formatNumber,
    formatCurrency,
  };
}

// TODO: 향후 공통 번역 키 매핑 추가 예정
