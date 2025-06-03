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

interface KoreanIdParseResult {
  isValid: boolean;
  birthDate?: Date;
  gender?: 'male' | 'female';
  errorMessage?: string;
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

    // 연도 계산 (성별 코드로 세기 판단)
    let birthYear: number;
    if (genderCode === 1 || genderCode === 2) {
      // 1900년대 출생
      birthYear = 1900 + birthYY;
    } else if (genderCode === 3 || genderCode === 4) {
      // 2000년대 출생
      birthYear = 2000 + birthYY;
    } else {
      return {
        isValid: false,
        errorMessage: '유효하지 않은 성별 코드입니다.',
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
        errorMessage: '유효하지 않은 생년월일입니다.',
      };
    }

    // 현재 날짜보다 미래인지 검사
    if (birthDate > new Date()) {
      return {
        isValid: false,
        errorMessage: '생년월일이 미래 날짜입니다.',
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
      errorMessage: '주민등록번호 파싱 중 오류가 발생했습니다.',
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
