import pkg from '@supabase/supabase-js';
const { createClient: createSupabaseClient } = pkg;
type SupabaseClient = any; // 임시 타입 정의

// 환경변수 검증 및 로드
function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey) {
    throw new Error(
      '필수 Supabase 환경변수가 설정되지 않았습니다. SUPABASE_URL과 SUPABASE_ANON_KEY를 확인해주세요.'
    );
  }

  return { url, anonKey, serviceKey };
}

// 클라이언트 사이드용 환경변수 (VITE_ 접두사)
function getSupabaseClientConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      '클라이언트용 Supabase 환경변수가 설정되지 않았습니다. VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 확인해주세요.'
    );
  }

  return { url, anonKey };
}

/**
 * 서버사이드 Supabase 클라이언트 (일반 권한)
 */
export function createServerClient() {
  const { url, anonKey } = getSupabaseConfig();
  return createSupabaseClient(url, anonKey);
}

/**
 * 서버사이드 Supabase 클라이언트 (Admin 권한)
 */
export function createAdminClient() {
  const { url, serviceKey } = getSupabaseConfig();

  if (!serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다. Admin 권한이 필요한 작업에는 Service Role Key가 필요합니다.'
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * 클라이언트사이드 Supabase 클라이언트
 */
export function createClientSideClient() {
  const { url, anonKey } = getSupabaseClientConfig();
  return createSupabaseClient(url, anonKey);
}

// 기본 클라이언트 인스턴스들 (싱글톤)
let _clientSideInstance: SupabaseClient | null = null;

export function getClientSideClient(): SupabaseClient {
  if (!_clientSideInstance) {
    _clientSideInstance = createClientSideClient();
  }
  return _clientSideInstance;
}

// 하위 호환성을 위한 별칭들
export const createClient = createServerClient;
