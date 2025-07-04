/**
 * 국제적 신분증 ID 검증 유틸리티
 *
 * 🌍 지원 국가/언어:
 * - 한국어: 주민등록번호 (엄격한 검증)
 * - 영어: SSN 또는 일반 ID (기본 검증)
 * - 일본어: 마이넘버 또는 일반 ID (기본 검증)
 *
 * 🔧 검증 수준:
 * - Level 1: 형식만 검증 (길이, 숫자 등)
 * - Level 2: 기본 알고리즘 검증
 * - Level 3: 완전한 검증 (한국 주민등록번호)
 */

import {
  parseKoreanId,
  validateKoreanId,
  formatKoreanIdInput,
  maskKoreanId,
  type KoreanIdParseResult,
} from './korean-id-utils';

export type SupportedLanguage = 'ko' | 'en' | 'ja';

export interface InternationalIdConfig {
  label: string;
  placeholder: string;
  format: string;
  maxLength: number;
  pattern: RegExp;
  example: string;
  description: string;
}

export interface InternationalIdResult {
  isValid: boolean;
  formattedValue?: string;
  birthDate?: Date;
  gender?: 'male' | 'female';
  errorMessage?: string;
  extractedInfo?: {
    age?: number;
    region?: string;
    nationality?: string;
  };
}

/**
 * 언어별 ID 설정
 */
export const ID_CONFIGS: Record<SupportedLanguage, InternationalIdConfig> = {
  ko: {
    label: '주민등록번호',
    placeholder: '000000-0000000',
    format: 'YYMMDD-NNNNNNN',
    maxLength: 14,
    pattern: /^\d{6}-?\d{7}$/,
    example: '771111-1234567',
    description: '13자리 한국 주민등록번호를 입력하세요',
  },
  en: {
    label: 'Social Security Number',
    placeholder: '000-00-0000',
    format: 'NNN-NN-NNNN',
    maxLength: 11,
    pattern: /^\d{3}-?\d{2}-?\d{4}$/,
    example: '123-45-6789',
    description: 'Enter your 9-digit Social Security Number',
  },
  ja: {
    label: 'マイナンバー',
    placeholder: '0000-0000-0000',
    format: 'NNNN-NNNN-NNNN',
    maxLength: 14,
    pattern: /^\d{4}-?\d{4}-?\d{4}$/,
    example: '1234-5678-9012',
    description: '12桁のマイナンバーを入力してください',
  },
};

/**
 * 언어별 ID 포맷팅
 */
export function formatIdInput(
  value: string,
  language: SupportedLanguage
): string {
  // 한국어는 기존 함수 사용
  if (language === 'ko') {
    return formatKoreanIdInput(value);
  }

  // 숫자만 추출
  const numbers = value.replace(/[^\d]/g, '');

  if (language === 'en') {
    // SSN: XXX-XX-XXXX
    if (numbers.length > 5) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 9)}`;
    } else if (numbers.length > 3) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}`;
    }
    return numbers;
  }

  if (language === 'ja') {
    // 마이넘버: XXXX-XXXX-XXXX
    if (numbers.length > 8) {
      return `${numbers.slice(0, 4)}-${numbers.slice(4, 8)}-${numbers.slice(8, 12)}`;
    } else if (numbers.length > 4) {
      return `${numbers.slice(0, 4)}-${numbers.slice(4, 8)}`;
    }
    return numbers;
  }

  return numbers;
}

/**
 * 언어별 ID 마스킹
 */
export function maskIdInput(
  value: string,
  language: SupportedLanguage
): string {
  if (!value) return value;

  // 한국어는 기존 함수 사용
  if (language === 'ko') {
    return maskKoreanId(value);
  }

  const cleanValue = value.replace(/[^0-9-]/g, '');

  if (language === 'en') {
    // SSN: XXX-XX-XXXX -> XXX-XX-****
    if (cleanValue.includes('-')) {
      const parts = cleanValue.split('-');
      if (parts.length === 3 && parts[2].length >= 4) {
        return `${parts[0]}-${parts[1]}-****`;
      }
    }
  }

  if (language === 'ja') {
    // 마이넘버: XXXX-XXXX-XXXX -> XXXX-XXXX-****
    if (cleanValue.includes('-')) {
      const parts = cleanValue.split('-');
      if (parts.length === 3 && parts[2].length >= 4) {
        return `${parts[0]}-${parts[1]}-****`;
      }
    }
  }

  return value;
}

/**
 * SSN 체크디지트 검증 (간단한 버전)
 */
function validateSSN(ssn: string): boolean {
  const cleanSSN = ssn.replace(/[^0-9]/g, '');

  if (cleanSSN.length !== 9) return false;

  // 기본 형식 검증
  const area = cleanSSN.slice(0, 3);
  const group = cleanSSN.slice(3, 5);
  const serial = cleanSSN.slice(5, 9);

  // 000, 666, 900-999는 유효하지 않음
  const areaNum = parseInt(area);
  if (areaNum === 0 || areaNum === 666 || areaNum >= 900) return false;

  // 00 그룹은 유효하지 않음
  if (group === '00') return false;

  // 0000 시리얼은 유효하지 않음
  if (serial === '0000') return false;

  return true;
}

/**
 * 마이넘버 체크디지트 검증
 */
function validateMyNumber(myNumber: string): boolean {
  const cleanNumber = myNumber.replace(/[^0-9]/g, '');

  if (cleanNumber.length !== 12) return false;

  // 체크디지트 알고리즘 (간단한 버전)
  const digits = cleanNumber.split('').map(Number);
  const weights = [6, 5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 11; i++) {
    sum += digits[i] * weights[i];
  }

  const checkDigit = 11 - (sum % 11);
  const calculatedCheck = checkDigit >= 10 ? checkDigit - 10 : checkDigit;

  return calculatedCheck === digits[11];
}

/**
 * 언어별 ID 검증
 */
export function validateInternationalId(
  value: string,
  language: SupportedLanguage
): InternationalIdResult {
  if (!value || !value.trim()) {
    return {
      isValid: false,
      errorMessage: getErrorMessage('required', language),
    };
  }

  const config = ID_CONFIGS[language];

  // 한국어는 기존 엄격한 검증 사용
  if (language === 'ko') {
    const koreanResult = parseKoreanId(value);
    return {
      isValid: koreanResult.isValid,
      formattedValue: formatIdInput(value, language),
      birthDate: koreanResult.birthDate,
      gender: koreanResult.gender,
      errorMessage: koreanResult.errorMessage,
      extractedInfo: koreanResult.birthDate
        ? {
            age:
              new Date().getFullYear() - koreanResult.birthDate.getFullYear(),
          }
        : undefined,
    };
  }

  // 기본 형식 검증
  if (!config.pattern.test(value.replace(/[^0-9-]/g, ''))) {
    return {
      isValid: false,
      errorMessage: getErrorMessage('format', language, config.format),
    };
  }

  let isValid = true;
  let errorMessage: string | undefined;

  // 언어별 추가 검증
  if (language === 'en') {
    isValid = validateSSN(value);
    if (!isValid) {
      errorMessage = getErrorMessage('invalid_ssn', language);
    }
  } else if (language === 'ja') {
    isValid = validateMyNumber(value);
    if (!isValid) {
      errorMessage = getErrorMessage('invalid_mynumber', language);
    }
  }

  return {
    isValid,
    formattedValue: formatIdInput(value, language),
    errorMessage,
  };
}

/**
 * 에러 메시지 다국어 지원
 */
function getErrorMessage(
  type: string,
  language: SupportedLanguage,
  format?: string
): string {
  const messages = {
    ko: {
      required: '주민등록번호를 입력해주세요',
      format: `올바른 형식으로 입력해주세요 (${format})`,
      invalid_ssn: '유효하지 않은 주민등록번호입니다',
      invalid_mynumber: '유효하지 않은 주민등록번호입니다',
    },
    en: {
      required: 'Please enter your ID number',
      format: `Please enter in correct format (${format})`,
      invalid_ssn: 'Invalid Social Security Number',
      invalid_mynumber: 'Invalid ID number',
    },
    ja: {
      required: 'ID番号を入力してください',
      format: `正しい形式で入力してください (${format})`,
      invalid_ssn: '無効なID番号です',
      invalid_mynumber: '無効なマイナンバーです',
    },
  };

  const languageMessages = messages[language];
  const messageKey = type as keyof typeof languageMessages;

  return (
    languageMessages[messageKey] || languageMessages.format || 'Invalid input'
  );
}

/**
 * 현재 언어에 맞는 ID 설정 가져오기
 */
export function getIdConfigForLanguage(
  language: SupportedLanguage
): InternationalIdConfig {
  return ID_CONFIGS[language];
}

/**
 * 모든 언어의 ID 라벨 가져오기 (번역 파일용)
 */
export function getAllIdLabels(): Record<SupportedLanguage, string> {
  return {
    ko: ID_CONFIGS.ko.label,
    en: ID_CONFIGS.en.label,
    ja: ID_CONFIGS.ja.label,
  };
}
