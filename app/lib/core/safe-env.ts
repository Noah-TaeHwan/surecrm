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

  console.log('🔍 환경변수 체크 시작...');

  if (process.env.VERCEL) {
    console.log('📦 Vercel 환경에서 실행 중');
  }

  for (const envKey of criticalEnvs) {
    const value = safeGetEnv(envKey);
    if (!value) {
      console.error(`🚨 중요한 환경변수 누락: ${envKey}`);
      if (process.env.VERCEL) {
        console.error(
          `📦 Vercel 대시보드에서 ${envKey} 환경변수를 설정하세요.`
        );
      }
      allPresent = false;
    } else {
      console.log(`✅ ${envKey}: 설정됨 (${value.substring(0, 10)}...)`);
    }
  }

  if (!allPresent) {
    console.error('💥 필수 환경변수가 누락되어 서버가 불안정할 수 있습니다.');
  }

  return allPresent;
}
