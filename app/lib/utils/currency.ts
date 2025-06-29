/**
 * 다국어 통화 포맷팅 유틸리티
 *
 * 지원 언어:
 * - 한국어: 원, 만원, 억원 (예: 1,300원, 13.4만원, 1.3억원)
 * - 영어: USD 기반, K, M 단위 (예: $1,300, $13.4K, $1.3M)
 * - 일본어: 엔, 만엔 (예: 1,300円, 13.4万円)
 */

export type SupportedLocale = 'ko' | 'en' | 'ja';

/**
 * 언어별 기본 통화 포맷팅
 */
export function formatCurrency(
  amount: number | string,
  locale: SupportedLocale = 'ko'
): string {
  if (!amount || amount === 0) {
    switch (locale) {
      case 'ko':
        return '0원';
      case 'ja':
        return '0円';
      case 'en':
      default:
        return '$0';
    }
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount) || numAmount === 0) {
    switch (locale) {
      case 'ko':
        return '0원';
      case 'ja':
        return '0円';
      case 'en':
      default:
        return '$0';
    }
  }

  const absAmount = Math.abs(numAmount);

  switch (locale) {
    case 'ko':
      return formatKoreanCurrency(numAmount);
    case 'ja':
      return formatJapaneseCurrency(numAmount);
    case 'en':
    default:
      return formatEnglishCurrency(numAmount);
  }
}

/**
 * 한국어 통화 포맷팅
 */
function formatKoreanCurrency(amount: number): string {
  const absAmount = Math.abs(amount);

  if (absAmount >= 100000000) {
    // 1억원 이상
    const eokValue = amount / 100000000;
    return eokValue >= 10
      ? `${Math.round(eokValue).toLocaleString('ko-KR')}억원`
      : `${(Math.round(eokValue * 10) / 10).toLocaleString('ko-KR')}억원`;
  } else if (absAmount >= 10000000) {
    // 1천만원 이상
    const cheonValue = amount / 10000000;
    return cheonValue >= 10
      ? `${Math.round(cheonValue).toLocaleString('ko-KR')}천만원`
      : `${(Math.round(cheonValue * 10) / 10).toLocaleString('ko-KR')}천만원`;
  } else if (absAmount >= 1000000) {
    // 1백만원 이상
    const baekValue = amount / 1000000;
    return baekValue >= 10
      ? `${Math.round(baekValue).toLocaleString('ko-KR')}백만원`
      : `${(Math.round(baekValue * 10) / 10).toLocaleString('ko-KR')}백만원`;
  } else if (absAmount >= 10000) {
    // 1만원 이상
    const manValue = amount / 10000;
    return manValue >= 100
      ? `${Math.round(manValue).toLocaleString('ko-KR')}만원`
      : `${(Math.round(manValue * 10) / 10).toLocaleString('ko-KR')}만원`;
  } else {
    // 1만원 미만
    return `${Math.round(amount).toLocaleString('ko-KR')}원`;
  }
}

/**
 * 영어 통화 포맷팅 (USD 기준)
 */
function formatEnglishCurrency(amount: number): string {
  const absAmount = Math.abs(amount);

  if (absAmount >= 1000000000) {
    // 1B 이상
    const bValue = amount / 1000000000;
    return bValue >= 10
      ? `$${Math.round(bValue).toLocaleString('en-US')}B`
      : `$${(Math.round(bValue * 10) / 10).toLocaleString('en-US')}B`;
  } else if (absAmount >= 1000000) {
    // 1M 이상
    const mValue = amount / 1000000;
    return mValue >= 10
      ? `$${Math.round(mValue).toLocaleString('en-US')}M`
      : `$${(Math.round(mValue * 10) / 10).toLocaleString('en-US')}M`;
  } else if (absAmount >= 1000) {
    // 1K 이상
    const kValue = amount / 1000;
    return kValue >= 100
      ? `$${Math.round(kValue).toLocaleString('en-US')}K`
      : `$${(Math.round(kValue * 10) / 10).toLocaleString('en-US')}K`;
  } else {
    // 1K 미만
    return `$${Math.round(amount).toLocaleString('en-US')}`;
  }
}

/**
 * 일본어 통화 포맷팅
 */
function formatJapaneseCurrency(amount: number): string {
  const absAmount = Math.abs(amount);

  if (absAmount >= 100000000) {
    // 1億円 이상
    const okuValue = amount / 100000000;
    return okuValue >= 10
      ? `${Math.round(okuValue).toLocaleString('ja-JP')}億円`
      : `${(Math.round(okuValue * 10) / 10).toLocaleString('ja-JP')}億円`;
  } else if (absAmount >= 10000) {
    // 1万円 이상
    const manValue = amount / 10000;
    return manValue >= 100
      ? `${Math.round(manValue).toLocaleString('ja-JP')}万円`
      : `${(Math.round(manValue * 10) / 10).toLocaleString('ja-JP')}万円`;
  } else {
    // 1万円 미만
    return `${Math.round(amount).toLocaleString('ja-JP')}円`;
  }
}

/**
 * 테이블용 통화 포맷팅 (기존 호환성 유지)
 */
export function formatCurrencyTable(
  amount: number | string,
  locale: SupportedLocale = 'ko'
): string {
  return formatCurrency(amount, locale);
}

/**
 * 간결한 통화 포맷팅 (대시보드, 카드 등에서 사용)
 */
export function formatCurrencyCompact(
  amount: number | string,
  locale: SupportedLocale = 'ko'
): string {
  return formatCurrency(amount, locale);
}

/**
 * 상세한 통화 포맷팅 (전체 금액 표시 필요시)
 */
export function formatCurrencyFull(
  amount: number | string,
  locale: SupportedLocale = 'ko'
): string {
  if (!amount || amount === 0) {
    switch (locale) {
      case 'ko':
        return '0원';
      case 'ja':
        return '0円';
      case 'en':
      default:
        return '$0';
    }
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount) || numAmount === 0) {
    switch (locale) {
      case 'ko':
        return '0원';
      case 'ja':
        return '0円';
      case 'en':
      default:
        return '$0';
    }
  }

  // 전체 금액 표시 (축약 없음)
  switch (locale) {
    case 'ko':
      return `${Math.round(numAmount).toLocaleString('ko-KR')}원`;
    case 'ja':
      return `${Math.round(numAmount).toLocaleString('ja-JP')}円`;
    case 'en':
    default:
      return `$${Math.round(numAmount).toLocaleString('en-US')}`;
  }
}

/**
 * 기존 한국어 전용 함수들 (하위 호환성 유지)
 */
export function formatWon(amount: number | string): string {
  return formatCurrency(amount, 'ko');
}

export function formatCurrencyByUnit(
  amount: number | string,
  preferredUnit?: 'auto' | 'won' | 'man' | 'baek' | 'cheon' | 'eok'
): string {
  return formatCurrency(amount, 'ko');
}

/**
 * 백분율 포맷팅
 */
export function formatPercentage(value: number, decimals = 1): string {
  if (isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}
