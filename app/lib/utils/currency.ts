/**
 * 한국 원화 포맷팅 유틸리티
 *
 * 규칙:
 * - 원 단위는 소수점 없음 (예: 1,300원)
 * - 만원 이상 단위는 소수점 1자리까지 허용 (예: 13.4만원, 1.3억원)
 * - 콤마는 모든 곳에서 일관성 있게 사용
 */

/**
 * 기본 원화 포맷팅 (콤마 포함, 소수점 없음)
 * 예: 1300 → "1,300원", 1300.99 → "1,301원"
 */
export function formatWon(amount: number | string): string {
  if (!amount || amount === 0) return '0원';

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount) || numAmount === 0) return '0원';

  // 소수점을 반올림하여 정수로 변환
  const roundedAmount = Math.round(numAmount);
  return `${roundedAmount.toLocaleString('ko-KR')}원`;
}

/**
 * 단위별 원화 포맷팅 (만원, 백만원, 천만원, 억원)
 * 소수점 1자리까지 허용
 * 예: 13400000 → "1,340만원" 또는 "13.4백만원" (컨텍스트에 따라)
 */
export function formatCurrencyByUnit(
  amount: number | string,
  preferredUnit?: 'auto' | 'won' | 'man' | 'baek' | 'cheon' | 'eok'
): string {
  if (!amount || amount === 0) return '0원';

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount) || numAmount === 0) return '0원';

  const absAmount = Math.abs(numAmount);

  // 단위별 기준
  if (absAmount >= 100000000) {
    // 1억원 이상
    const eokValue = numAmount / 100000000;
    if (eokValue >= 10) {
      return `${Math.round(eokValue).toLocaleString('ko-KR')}억원`;
    } else {
      return `${(Math.round(eokValue * 10) / 10).toLocaleString('ko-KR')}억원`;
    }
  } else if (absAmount >= 10000000) {
    // 1천만원 이상
    const cheonValue = numAmount / 10000000;
    if (cheonValue >= 10) {
      return `${Math.round(cheonValue).toLocaleString('ko-KR')}천만원`;
    } else {
      return `${(Math.round(cheonValue * 10) / 10).toLocaleString(
        'ko-KR'
      )}천만원`;
    }
  } else if (absAmount >= 1000000) {
    // 1백만원 이상
    const baekValue = numAmount / 1000000;
    if (baekValue >= 10) {
      return `${Math.round(baekValue).toLocaleString('ko-KR')}백만원`;
    } else {
      return `${(Math.round(baekValue * 10) / 10).toLocaleString(
        'ko-KR'
      )}백만원`;
    }
  } else if (absAmount >= 10000) {
    // 1만원 이상
    const manValue = numAmount / 10000;
    if (manValue >= 100) {
      return `${Math.round(manValue).toLocaleString('ko-KR')}만원`;
    } else {
      return `${(Math.round(manValue * 10) / 10).toLocaleString('ko-KR')}만원`;
    }
  } else {
    // 1만원 미만은 원 단위 (콤마 포함, 소수점 없음)
    return formatWon(numAmount);
  }
}

/**
 * 간결한 원화 포맷팅 (대시보드, 카드 등에서 사용)
 * 가장 적절한 단위로 자동 변환
 */
export function formatCurrencyCompact(amount: number | string): string {
  return formatCurrencyByUnit(amount, 'auto');
}

/**
 * 상세한 원화 포맷팅 (전체 금액 표시 필요시)
 * 예: 13400000 → "13,400,000원"
 */
export function formatCurrencyFull(amount: number | string): string {
  return formatWon(amount);
}

/**
 * 테이블용 원화 포맷팅 (공간 절약하면서 원 단위 포함)
 * 예: 13400000 → "1,340만원"
 */
export function formatCurrencyTable(amount: number | string): string {
  if (!amount || amount === 0) return '0원';

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount) || numAmount === 0) return '0원';

  const absAmount = Math.abs(numAmount);

  if (absAmount >= 100000000) {
    const eokValue = numAmount / 100000000;
    return eokValue >= 10
      ? `${Math.round(eokValue).toLocaleString('ko-KR')}억원`
      : `${(Math.round(eokValue * 10) / 10).toLocaleString('ko-KR')}억원`;
  } else if (absAmount >= 10000000) {
    const cheonValue = numAmount / 10000000;
    return cheonValue >= 10
      ? `${Math.round(cheonValue).toLocaleString('ko-KR')}천만원`
      : `${(Math.round(cheonValue * 10) / 10).toLocaleString('ko-KR')}천만원`;
  } else if (absAmount >= 1000000) {
    const baekValue = numAmount / 1000000;
    return baekValue >= 10
      ? `${Math.round(baekValue).toLocaleString('ko-KR')}백만원`
      : `${(Math.round(baekValue * 10) / 10).toLocaleString('ko-KR')}백만원`;
  } else if (absAmount >= 10000) {
    const manValue = numAmount / 10000;
    return manValue >= 100
      ? `${Math.round(manValue).toLocaleString('ko-KR')}만원`
      : `${(Math.round(manValue * 10) / 10).toLocaleString('ko-KR')}만원`;
  } else {
    return `${Math.round(numAmount).toLocaleString('ko-KR')}원`;
  }
}

/**
 * 백분율 포맷팅
 */
export function formatPercentage(value: number, decimals = 1): string {
  if (isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * 레거시 지원용 - 기존 formatCurrency 함수 대체
 */
export const formatCurrency = formatCurrencyCompact;
