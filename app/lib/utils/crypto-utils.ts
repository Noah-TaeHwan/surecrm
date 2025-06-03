/**
 * 암호화/복호화 유틸리티
 *
 * 🔒 보안 기능:
 * - AES-256-GCM 암호화
 * - 주민등록번호 전용 암호화
 * - 환경변수 기반 키 관리
 * - 솔트 및 초기화 벡터 사용
 *
 * ⚠️ 중요:
 * - ENCRYPTION_KEY 환경변수 필수 설정
 * - 원본 민감 데이터는 절대 로그에 기록 금지
 * - 복호화는 권한 있는 사용자만 가능
 */

import crypto from 'crypto';

// 암호화 알고리즘 설정
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32; // 256 bits

/**
 * 암호화 결과 인터페이스
 */
export interface EncryptionResult {
  encryptedData: string;
  iv: string;
  tag: string;
  salt: string;
}

/**
 * 복호화 결과 인터페이스
 */
export interface DecryptionResult {
  success: boolean;
  data: string | null;
  error?: string;
}

/**
 * 환경변수에서 마스터 키 가져오기
 */
function getMasterKey(): string {
  const masterKey =
    process.env.ENCRYPTION_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!masterKey) {
    throw new Error(
      '암호화 키가 설정되지 않았습니다. ENCRYPTION_KEY 환경변수를 설정하세요.'
    );
  }

  if (masterKey.length < 32) {
    throw new Error('암호화 키가 너무 짧습니다. 최소 32자 이상이어야 합니다.');
  }

  return masterKey;
}

/**
 * 솔트를 사용하여 키 파생
 */
function deriveKey(masterKey: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(masterKey, salt, 100000, KEY_LENGTH, 'sha512');
}

/**
 * 주민등록번호 암호화
 * @param koreanId 주민등록번호 원본
 * @returns 암호화 결과 객체
 */
export function encryptKoreanId(koreanId: string): EncryptionResult {
  try {
    // 마스터 키 가져오기
    const masterKey = getMasterKey();

    // 솔트 생성
    const salt = crypto.randomBytes(SALT_LENGTH);

    // 키 파생
    const derivedKey = deriveKey(masterKey, salt);

    // 초기화 벡터 생성
    const iv = crypto.randomBytes(IV_LENGTH);

    // 암호화 객체 생성
    const cipher = crypto.createCipher(ALGORITHM, derivedKey);
    cipher.setAutoPadding(true);

    // 데이터 암호화
    let encrypted = cipher.update(koreanId, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // 인증 태그 가져오기
    const tag = cipher.getAuthTag();

    return {
      encryptedData: encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      salt: salt.toString('hex'),
    };
  } catch (error) {
    console.error('❌ 주민등록번호 암호화 실패:', error);
    throw new Error('암호화 처리 중 오류가 발생했습니다.');
  }
}

/**
 * 주민등록번호 복호화
 * @param encryptionResult 암호화된 데이터
 * @returns 복호화 결과
 */
export function decryptKoreanId(
  encryptionResult: EncryptionResult
): DecryptionResult {
  try {
    // 마스터 키 가져오기
    const masterKey = getMasterKey();

    // 버퍼 변환
    const salt = Buffer.from(encryptionResult.salt, 'hex');
    const iv = Buffer.from(encryptionResult.iv, 'hex');
    const tag = Buffer.from(encryptionResult.tag, 'hex');

    // 키 파생
    const derivedKey = deriveKey(masterKey, salt);

    // 복호화 객체 생성
    const decipher = crypto.createDecipher(ALGORITHM, derivedKey);
    decipher.setAuthTag(tag);

    // 데이터 복호화
    let decrypted = decipher.update(
      encryptionResult.encryptedData,
      'hex',
      'utf8'
    );
    decrypted += decipher.final('utf8');

    return {
      success: true,
      data: decrypted,
    };
  } catch (error) {
    console.error('❌ 주민등록번호 복호화 실패:', error);

    return {
      success: false,
      data: null,
      error: '복호화 처리 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 간단한 문자열 암호화 (비민감 데이터용)
 */
export function encryptString(data: string): string {
  try {
    const masterKey = getMasterKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipher('aes-256-cbc', masterKey);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('❌ 문자열 암호화 실패:', error);
    throw new Error('암호화 처리 중 오류가 발생했습니다.');
  }
}

/**
 * 간단한 문자열 복호화 (비민감 데이터용)
 */
export function decryptString(encryptedData: string): string | null {
  try {
    const masterKey = getMasterKey();
    const [ivHex, encrypted] = encryptedData.split(':');

    if (!ivHex || !encrypted) {
      return null;
    }

    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipher('aes-256-cbc', masterKey);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('❌ 문자열 복호화 실패:', error);
    return null;
  }
}

/**
 * 암호화된 데이터를 데이터베이스 저장용 문자열로 변환
 */
export function encryptionResultToString(result: EncryptionResult): string {
  return JSON.stringify({
    e: result.encryptedData,
    i: result.iv,
    t: result.tag,
    s: result.salt,
  });
}

/**
 * 데이터베이스 문자열을 암호화 결과 객체로 변환
 */
export function stringToEncryptionResult(
  encryptedString: string
): EncryptionResult | null {
  try {
    const parsed = JSON.parse(encryptedString);

    if (!parsed.e || !parsed.i || !parsed.t || !parsed.s) {
      return null;
    }

    return {
      encryptedData: parsed.e,
      iv: parsed.i,
      tag: parsed.t,
      salt: parsed.s,
    };
  } catch (error) {
    console.error('❌ 암호화 문자열 파싱 실패:', error);
    return null;
  }
}

/**
 * 해시 생성 (검색용)
 * 주민등록번호의 해시를 생성하여 중복 검사에 사용
 */
export function createHash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * 주민등록번호 해시 생성 (중복 검사용)
 */
export function createKoreanIdHash(koreanId: string): string {
  // 정규화 (하이픈 제거, 공백 제거)
  const normalized = koreanId.replace(/[-\s]/g, '');

  // 솔트와 함께 해시 생성
  const saltedData = normalized + getMasterKey().slice(0, 16);

  return crypto.createHash('sha256').update(saltedData).digest('hex');
}

/**
 * 암호화 상태 검증
 */
export function validateEncryptionSetup(): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  try {
    // 마스터 키 확인
    const masterKey = getMasterKey();

    if (masterKey.length < 32) {
      errors.push('암호화 키가 너무 짧습니다.');
    }

    // 암호화/복호화 테스트
    const testData = 'test-data-' + Date.now();
    const encrypted = encryptString(testData);
    const decrypted = decryptString(encrypted);

    if (decrypted !== testData) {
      errors.push('암호화/복호화 테스트 실패');
    }
  } catch (error) {
    errors.push(
      `암호화 설정 오류: ${
        error instanceof Error ? error.message : '알 수 없는 오류'
      }`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 개발 환경에서 암호화 테스트
 */
export function testKoreanIdEncryption(koreanId: string): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  console.log('🔐 주민등록번호 암호화 테스트');

  try {
    // 암호화
    const encrypted = encryptKoreanId(koreanId);
    console.log('✅ 암호화 성공');

    // 복호화
    const decrypted = decryptKoreanId(encrypted);

    if (decrypted.success && decrypted.data === koreanId) {
      console.log('✅ 복호화 성공');
    } else {
      console.error('❌ 복호화 실패:', decrypted.error);
    }

    // 해시 생성 테스트
    const hash = createKoreanIdHash(koreanId);
    console.log('✅ 해시 생성 성공:', hash.slice(0, 8) + '...');
  } catch (error) {
    console.error('❌ 암호화 테스트 실패:', error);
  }
}
