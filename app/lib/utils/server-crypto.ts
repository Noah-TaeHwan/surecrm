/**
 * 🔒 서버 사이드 전용 암호화 유틸리티
 * Node.js crypto 모듈을 사용한 주민등록번호 암호화/복호화
 *
 * ⚠️ 이 파일은 서버 사이드에서만 import 해야 합니다.
 */

import crypto from 'crypto';

/**
 * 주민등록번호 암호화 (AES-256-GCM)
 * 환경변수 ENCRYPTION_KEY 필요
 */
export async function encryptKoreanIdServer(
  ssn: string
): Promise<string | null> {
  try {
    const encryptionKey = process.env.ENCRYPTION_KEY;

    if (!encryptionKey) {
      console.error('❌ ENCRYPTION_KEY 환경변수가 설정되지 않았습니다');
      return null;
    }

    // 32바이트 키 생성
    const key = crypto.createHash('sha256').update(encryptionKey).digest();

    // 16바이트 IV 생성
    const iv = crypto.randomBytes(16);

    // AES-256-GCM 암호화
    const cipher = crypto.createCipher('aes-256-gcm', key);

    let encrypted = cipher.update(ssn, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // IV + 암호화된 데이터 + AuthTag를 Base64로 인코딩
    const result = Buffer.concat([
      iv,
      Buffer.from(encrypted, 'hex'),
      authTag,
    ]).toString('base64');

    return result;
  } catch (error) {
    console.error('❌ 주민등록번호 암호화 실패:', error);
    return null;
  }
}

/**
 * 주민등록번호 복호화 (AES-256-GCM)
 */
export async function decryptKoreanIdServer(
  encryptedData: string
): Promise<string | null> {
  try {
    const encryptionKey = process.env.ENCRYPTION_KEY;

    if (!encryptionKey) {
      console.error('❌ ENCRYPTION_KEY 환경변수가 설정되지 않았습니다');
      return null;
    }

    // 32바이트 키 생성
    const key = crypto.createHash('sha256').update(encryptionKey).digest();

    // Base64 디코딩
    const buffer = Buffer.from(encryptedData, 'base64');

    // IV (16바이트), 암호화된 데이터, AuthTag (16바이트) 분리
    const iv = buffer.slice(0, 16);
    const authTag = buffer.slice(-16);
    const encrypted = buffer.slice(16, -16);

    // AES-256-GCM 복호화
    const decipher = crypto.createDecipher('aes-256-gcm', key);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('❌ 주민등록번호 복호화 실패:', error);
    return null;
  }
}

/**
 * 주민등록번호 해시 생성 (검색용)
 * 동일한 주민등록번호는 항상 같은 해시값을 생성
 */
export function hashKoreanIdServer(ssn: string): string | null {
  try {
    const hashSalt = process.env.HASH_SALT || 'default-salt';

    // HMAC-SHA256으로 해시 생성
    const hmac = crypto.createHmac('sha256', hashSalt);
    hmac.update(ssn);

    return hmac.digest('hex');
  } catch (error) {
    console.error('❌ 주민등록번호 해시 생성 실패:', error);
    return null;
  }
}
