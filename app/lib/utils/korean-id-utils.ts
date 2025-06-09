/**
 * 한국 주민등록번호 처리 유틸리티
 *
 * 📋 기능:
 * - 주민등록번호 파싱 (생년월일, 성별 추출)
 * - 유효성 검증 (형식, 날짜, 체크섬)
 * - 보안 처리 (마스킹, 암호화)
 *
 * 🔒 보안 원칙:
 * - 원본 주민등록번호는 절대 평문 저장 금지
 * - 모든 로그에서 주민등록번호 제외
 * - 접근 권한 엄격 제어
 */

export interface KoreanIdParseResult {
  isValid: boolean;
  birthDate?: Date;
  gender?: 'male' | 'female';
  errorMessage?: string;
  errors?: string[];
}

/**
 * 주민등록번호 정규식 패턴
 */
const KOREAN_ID_PATTERN = /^(\d{2})(\d{2})(\d{2})-?(\d{1})(\d{6})$/;

/**
 * 한국 주민등록번호를 파싱하여 생년월일과 성별을 추출
 * @param ssn - 주민등록번호 (YYMMDD-1234567 형식)
 */
export function parseKoreanId(ssn: string): KoreanIdParseResult {
  try {
    // 하이픈 제거하고 숫자만 추출
    const cleanSsn = ssn.replace(/[^0-9]/g, '');

    if (cleanSsn.length !== 13) {
      return {
        isValid: false,
        errorMessage: '주민등록번호는 13자리여야 합니다.',
      };
    }

    // 생년월일 추출 (앞 6자리)
    const birthYY = parseInt(cleanSsn.substring(0, 2));
    const birthMM = parseInt(cleanSsn.substring(2, 4));
    const birthDD = parseInt(cleanSsn.substring(4, 6));

    // 성별 코드 (7번째 자리)
    const genderCode = parseInt(cleanSsn.substring(6, 7));

    // 🔍 성별 코드 유효성 먼저 검사
    if (![1, 2, 3, 4, 5, 6, 7, 8, 9, 0].includes(genderCode)) {
      return {
        isValid: false,
        errorMessage: '유효하지 않은 성별 코드입니다.',
      };
    }

    // 연도 계산 (성별 코드로 세기 판단)
    let birthYear: number;
    let expectedGenderCodes: number[];

    if (genderCode === 9 || genderCode === 0) {
      // 1800년대 출생 (현재 생존자 없음)
      birthYear = 1800 + birthYY;
      expectedGenderCodes = [9, 0];
    } else if (genderCode === 1 || genderCode === 2) {
      // 1900년대 출생
      birthYear = 1900 + birthYY;
      expectedGenderCodes = [1, 2];
    } else if (genderCode === 3 || genderCode === 4) {
      // 2000년대 출생
      birthYear = 2000 + birthYY;
      expectedGenderCodes = [3, 4];
    } else if (genderCode === 5 || genderCode === 6) {
      // 1900년대 출생 외국인
      birthYear = 1900 + birthYY;
      expectedGenderCodes = [5, 6];
    } else if (genderCode === 7 || genderCode === 8) {
      // 2000년대 출생 외국인
      birthYear = 2000 + birthYY;
      expectedGenderCodes = [7, 8];
    } else {
      return {
        isValid: false,
        errorMessage: '유효하지 않은 성별 코드입니다.',
      };
    }

    // 🎯 연도별 성별코드 검증: 입력된 생년월일에 맞는 구체적이고 동적인 안내
    if (birthYear < 1900 && ![9, 0].includes(genderCode)) {
      const inputGender = genderCode % 2 === 1 ? '남성' : '여성';
      const correctCodes = '9(남성) 또는 0(여성)';
      return {
        isValid: false,
        errorMessage: `입력하신 ${birthYear}년 ${birthMM}월 ${birthDD}일생 ${inputGender}은 주민등록번호 뒷자리의 성별코드가 ${correctCodes}이어야 합니다. 입력하신 번호를 다시 확인해주세요.`,
      };
    } else if (
      birthYear >= 1900 &&
      birthYear < 2000 &&
      ![1, 2, 5, 6].includes(genderCode)
    ) {
      const inputGender = genderCode % 2 === 1 ? '남성' : '여성';
      const correctCodes =
        inputGender === '남성'
          ? '1(내국인) 또는 5(외국인)'
          : '2(내국인) 또는 6(외국인)';
      return {
        isValid: false,
        errorMessage: `입력하신 ${birthYear}년 ${birthMM}월 ${birthDD}일생 ${inputGender}은 주민등록번호 뒷자리의 성별코드가 ${correctCodes}이어야 합니다. 입력하신 번호를 다시 확인해주세요.`,
      };
    } else if (birthYear >= 2000 && ![3, 4, 7, 8].includes(genderCode)) {
      const inputGender = genderCode % 2 === 1 ? '남성' : '여성';
      const correctCodes =
        inputGender === '남성'
          ? '3(내국인) 또는 7(외국인)'
          : '4(내국인) 또는 8(외국인)';
      return {
        isValid: false,
        errorMessage: `입력하신 ${birthYear}년 ${birthMM}월 ${birthDD}일생 ${inputGender}은 주민등록번호 뒷자리의 성별코드가 ${correctCodes}이어야 합니다. 입력하신 번호를 다시 확인해주세요.`,
      };
    }

    // 성별 판단
    const gender: 'male' | 'female' = genderCode % 2 === 1 ? 'male' : 'female';

    // 날짜 유효성 검사
    const birthDate = new Date(birthYear, birthMM - 1, birthDD);

    if (
      birthDate.getFullYear() !== birthYear ||
      birthDate.getMonth() !== birthMM - 1 ||
      birthDate.getDate() !== birthDD
    ) {
      return {
        isValid: false,
        errorMessage: `${birthYear}년 ${birthMM}월 ${birthDD}일은 유효하지 않은 날짜입니다.`,
      };
    }

    // 현재 날짜보다 미래인지 검사
    if (birthDate > new Date()) {
      return {
        isValid: false,
        errorMessage: `${birthYear}년 ${birthMM}월 ${birthDD}일은 미래 날짜입니다. 주민등록번호를 다시 확인해주세요.`,
      };
    }

    // 🎯 너무 과거 날짜 검사 (1800년대 초 등)
    const minDate = new Date(1900, 0, 1); // 1900년 1월 1일
    if (birthDate < minDate) {
      return {
        isValid: false,
        errorMessage: `${birthYear}년은 너무 과거 날짜입니다. 주민등록번호를 다시 확인해주세요.`,
      };
    }

    return {
      isValid: true,
      birthDate,
      gender,
    };
  } catch (error) {
    return {
      isValid: false,
      errorMessage:
        '주민등록번호 파싱 중 오류가 발생했습니다. 형식을 확인해주세요.',
    };
  }
}

/**
 * 주민등록번호 앞자리 마스킹
 * @param ssn - 주민등록번호
 */
export function maskKoreanId(ssn: string): string {
  if (!ssn || ssn.length < 8) return ssn;

  const cleanSsn = ssn.replace(/[^0-9-]/g, '');

  if (cleanSsn.includes('-')) {
    // YYMMDD-1234567 형식
    const parts = cleanSsn.split('-');
    if (parts.length === 2 && parts[0].length === 6 && parts[1].length === 7) {
      return `${parts[0]}-${'*'.repeat(7)}`;
    }
  }

  return ssn;
}

/**
 * 주민등록번호 유효성 검사 (체크섬 포함)
 * @param ssn - 주민등록번호
 */
export function validateKoreanId(ssn: string): boolean {
  try {
    const cleanSsn = ssn.replace(/[^0-9]/g, '');

    if (cleanSsn.length !== 13) return false;

    // 기본 파싱 검사
    const parseResult = parseKoreanId(ssn);
    if (!parseResult.isValid) return false;

    // 체크섬 검사
    const digits = cleanSsn.split('').map(Number);
    const weights = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5];

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += digits[i] * weights[i];
    }

    const checkDigit = (11 - (sum % 11)) % 10;

    return checkDigit === digits[12];
  } catch (error) {
    return false;
  }
}

/**
 * 나이 계산
 */
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

/**
 * 주민등록번호에서 나이 계산
 */
export function calculateAgeFromKoreanId(idNumber: string): number | null {
  const parseResult = parseKoreanId(idNumber);

  if (!parseResult.isValid || !parseResult.birthDate) {
    return null;
  }

  return calculateAge(parseResult.birthDate);
}

/**
 * 생년월일 포맷팅
 */
export function formatBirthDate(birthDate: Date): string {
  return `${birthDate.getFullYear()}년 ${(birthDate.getMonth() + 1)
    .toString()
    .padStart(2, '0')}월 ${birthDate.getDate().toString().padStart(2, '0')}일`;
}

/**
 * 성별 한국어 변환
 */
export function formatGender(gender: 'male' | 'female'): string {
  return gender === 'male' ? '남성' : '여성';
}

/**
 * 주민등록번호 입력 시 자동 하이픈 추가
 */
export function formatKoreanIdInput(value: string): string {
  // 숫자만 추출
  const numbers = value.replace(/[^\d]/g, '');

  // 6자리 이상이면 하이픈 추가
  if (numbers.length > 6) {
    return `${numbers.slice(0, 6)}-${numbers.slice(6, 13)}`;
  }

  return numbers;
}

/**
 * 디버깅용 - 주민등록번호 파싱 결과 출력 (개발 환경에서만)
 */
export function debugKoreanIdParse(idNumber: string): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const result = parseKoreanId(idNumber);
  console.log('🆔 주민등록번호 파싱 결과:', {
    errorMessage: result.errorMessage,
  });
}

/**
 * 주민등록번호 암호화 (AES-256-GCM)
 * 환경변수 ENCRYPTION_KEY 필요
 *
 * ⚠️ 서버 사이드 전용 함수입니다. 클라이언트에서는 사용하지 마세요.
 */
export async function encryptKoreanId(ssn: string): Promise<string | null> {
  // 🔧 클라이언트 사이드에서는 암호화 처리하지 않음
  if (typeof window !== 'undefined') {
    console.warn('⚠️ 암호화는 서버에서만 처리됩니다.');
    return null;
  }

  // 서버 사이드에서만 실행
  return null; // 임시로 null 반환, 실제 구현은 서버 API에서 처리
}

/**
 * 주민등록번호 복호화
 *
 * ⚠️ 서버 사이드 전용 함수입니다.
 */
export async function decryptKoreanId(
  encryptedSsn: string
): Promise<string | null> {
  // 🔧 클라이언트 사이드에서는 복호화 처리하지 않음
  if (typeof window !== 'undefined') {
    console.warn('⚠️ 복호화는 서버에서만 처리됩니다.');
    return null;
  }

  // 서버 사이드에서만 실행
  return null; // 임시로 null 반환, 실제 구현은 서버 API에서 처리
}

/**
 * 주민등록번호 해시 생성 (검색용)
 * 실제 주민등록번호는 복구할 수 없지만, 같은 번호인지 비교 가능
 */
export function hashKoreanId(ssn: string): string {
  try {
    if (typeof window !== 'undefined') {
      // 클라이언트에서는 해싱하지 않음
      return '';
    }

    const crypto = require('crypto');
    const salt = process.env.HASH_SALT || 'default-salt-korean-id';

    return crypto
      .createHash('sha256')
      .update(ssn + salt)
      .digest('hex');
  } catch (error) {
    console.error('❌ 주민등록번호 해싱 실패:', error);
    return '';
  }
}
