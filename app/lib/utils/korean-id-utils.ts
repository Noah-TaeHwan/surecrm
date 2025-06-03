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
  birthDate: Date | null;
  gender: 'male' | 'female' | null;
  century: string | null; // '1900s' | '2000s' | '1800s'
  genderCode: number | null;
  maskedId: string;
  errors: string[];
}

/**
 * 주민등록번호 정규식 패턴
 */
const KOREAN_ID_PATTERN = /^(\d{2})(\d{2})(\d{2})-?(\d{1})(\d{6})$/;

/**
 * 주민등록번호 파싱 및 검증
 * @param idNumber 주민등록번호 (하이픈 있거나 없거나)
 * @returns 파싱 결과 객체
 */
export function parseKoreanId(idNumber: string): KoreanIdParseResult {
  const errors: string[] = [];

  // 기본값 설정
  const result: KoreanIdParseResult = {
    isValid: false,
    birthDate: null,
    gender: null,
    century: null,
    genderCode: null,
    maskedId: maskKoreanId(idNumber),
    errors: [],
  };

  // 1. 기본 형식 검증
  if (!idNumber || typeof idNumber !== 'string') {
    errors.push('주민등록번호가 입력되지 않았습니다.');
    return { ...result, errors };
  }

  // 공백 제거 및 정규화
  const cleanId = idNumber.replace(/\s/g, '');

  // 2. 정규식 매칭
  const match = cleanId.match(KOREAN_ID_PATTERN);
  if (!match) {
    errors.push('주민등록번호 형식이 올바르지 않습니다. (YYMMDD-NNNNNNN)');
    return { ...result, errors };
  }

  const [, yy, mm, dd, genderCode, restDigits] = match;
  const genderCodeNum = parseInt(genderCode);

  // 3. 날짜 유효성 검증
  const { isValidDate, birthDate, century } = validateAndParseBirthDate(
    yy,
    mm,
    dd,
    genderCodeNum
  );

  if (!isValidDate) {
    errors.push('생년월일이 유효하지 않습니다.');
    return { ...result, errors };
  }

  // 4. 성별 코드 검증 및 성별 추출
  const gender = extractGender(genderCodeNum);
  if (!gender) {
    errors.push('성별 코드가 유효하지 않습니다.');
    return { ...result, errors };
  }

  // 5. 체크섬 검증
  const isValidChecksum = validateChecksum(cleanId);
  if (!isValidChecksum) {
    errors.push('주민등록번호 체크섬이 일치하지 않습니다.');
    return { ...result, errors };
  }

  // 6. 모든 검증 통과
  return {
    isValid: true,
    birthDate,
    gender,
    century,
    genderCode: genderCodeNum,
    maskedId: maskKoreanId(cleanId),
    errors: [],
  };
}

/**
 * 생년월일 유효성 검증 및 파싱
 */
function validateAndParseBirthDate(
  yy: string,
  mm: string,
  dd: string,
  genderCode: number
) {
  const month = parseInt(mm);
  const day = parseInt(dd);
  const year2digit = parseInt(yy);

  // 월 유효성 (1-12)
  if (month < 1 || month > 12) {
    return { isValidDate: false, birthDate: null, century: null };
  }

  // 일 유효성 (1-31)
  if (day < 1 || day > 31) {
    return { isValidDate: false, birthDate: null, century: null };
  }

  // 성별 코드로 세기 판단
  let fullYear: number;
  let century: string;

  switch (genderCode) {
    case 1:
    case 2:
    case 5:
    case 6:
      // 1900년대생
      fullYear = 1900 + year2digit;
      century = '1900s';
      break;
    case 3:
    case 4:
    case 7:
    case 8:
      // 2000년대생
      fullYear = 2000 + year2digit;
      century = '2000s';
      break;
    case 9:
    case 0:
      // 1800년대생 (외국인 포함)
      fullYear = 1800 + year2digit;
      century = '1800s';
      break;
    default:
      return { isValidDate: false, birthDate: null, century: null };
  }

  // Date 객체 생성 및 유효성 검증
  const birthDate = new Date(fullYear, month - 1, day); // month는 0부터 시작

  // 실제 날짜와 입력한 날짜가 일치하는지 확인 (예: 2월 30일 같은 잘못된 날짜 방지)
  if (
    birthDate.getFullYear() !== fullYear ||
    birthDate.getMonth() !== month - 1 ||
    birthDate.getDate() !== day
  ) {
    return { isValidDate: false, birthDate: null, century: null };
  }

  // 미래 날짜 체크
  if (birthDate > new Date()) {
    return { isValidDate: false, birthDate: null, century: null };
  }

  return { isValidDate: true, birthDate, century };
}

/**
 * 성별 추출
 */
function extractGender(genderCode: number): 'male' | 'female' | null {
  switch (genderCode) {
    case 1:
    case 3:
    case 5:
    case 7:
    case 9:
      return 'male';
    case 2:
    case 4:
    case 6:
    case 8:
    case 0:
      return 'female';
    default:
      return null;
  }
}

/**
 * 체크섬 검증 (마지막 자리 체크)
 */
function validateChecksum(idNumber: string): boolean {
  // 하이픈 제거
  const digits = idNumber.replace('-', '');

  if (digits.length !== 13) {
    return false;
  }

  // 체크섬 계산
  const weights = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5];
  let sum = 0;

  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * weights[i];
  }

  const checkDigit = (11 - (sum % 11)) % 10;
  const lastDigit = parseInt(digits[12]);

  return checkDigit === lastDigit;
}

/**
 * 주민등록번호 마스킹
 * @param idNumber 원본 주민등록번호
 * @returns 마스킹된 주민등록번호 (예: 931119-1●●●●●●)
 */
export function maskKoreanId(idNumber: string): string {
  if (!idNumber) return '';

  const cleanId = idNumber.replace(/\s/g, '');
  const match = cleanId.match(KOREAN_ID_PATTERN);

  if (!match) {
    return '●●●●●●-●●●●●●●';
  }

  const [, yy, mm, dd, genderCode] = match;
  return `${yy}${mm}${dd}-${genderCode}●●●●●●`;
}

/**
 * 주민등록번호 형식 검증 (간단)
 */
export function isValidKoreanIdFormat(idNumber: string): boolean {
  if (!idNumber) return false;
  const cleanId = idNumber.replace(/\s/g, '');
  return KOREAN_ID_PATTERN.test(cleanId);
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
    maskedId: result.maskedId,
    isValid: result.isValid,
    birthDate: result.birthDate?.toLocaleDateString('ko-KR'),
    gender: result.gender ? formatGender(result.gender) : null,
    age: result.birthDate ? calculateAge(result.birthDate) : null,
    errors: result.errors,
  });
}
