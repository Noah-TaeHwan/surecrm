/**
 * 안전한 환경변수 헬퍼 - 서버 크래시 방지
 */

export function safeGetEnv(key: string, fallback: string = ''): string {
  try {
    return process.env[key] || fallback;
  } catch (error) {
    console.warn(`⚠️ 환경변수 ${key} 접근 실패:`, error);
    return fallback;
  }
}

export function safeGetClientEnv(key: string, fallback: string = ''): string {
  try {
    return (
      (typeof window !== 'undefined' && import.meta.env?.[key]) || fallback
    );
  } catch (error) {
    console.warn(`⚠️ 클라이언트 환경변수 ${key} 접근 실패:`, error);
    return fallback;
  }
}

/**
 * 필수 환경변수들의 존재 여부만 체크 (에러 없이)
 */
export function checkCriticalEnvs(): boolean {
  const criticalEnvs = ['DATABASE_URL', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'];

  let allPresent = true;

  for (const envKey of criticalEnvs) {
    if (!safeGetEnv(envKey)) {
      console.warn(`⚠️ 중요한 환경변수 누락: ${envKey}`);
      allPresent = false;
    }
  }

  return allPresent;
}
