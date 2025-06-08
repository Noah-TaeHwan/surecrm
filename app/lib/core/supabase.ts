import { createClient as supabaseCreateClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase 설정 가져오기 (서버사이드용)
 */
function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('🔍 Supabase 설정 확인:', {
    hasUrl: !!url,
    hasAnonKey: !!anonKey,
    hasServiceKey: !!serviceKey,
    url: url || '❌ 없음',
  });

  if (!url) {
    throw new Error('SUPABASE_URL 환경변수가 설정되지 않았습니다.');
  }

  if (!anonKey) {
    throw new Error('SUPABASE_ANON_KEY 환경변수가 설정되지 않았습니다.');
  }

  return {
    url,
    anonKey,
    serviceKey,
  };
}

/**
 * 클라이언트사이드 Supabase 설정 가져오기
 */
function getSupabaseClientConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  console.log('🔍 클라이언트 Supabase 설정 확인:', {
    hasUrl: !!url,
    hasAnonKey: !!anonKey,
    url: url || '❌ 없음',
  });

  if (!url) {
    throw new Error('VITE_SUPABASE_URL 환경변수가 설정되지 않았습니다.');
  }

  if (!anonKey) {
    throw new Error('VITE_SUPABASE_ANON_KEY 환경변수가 설정되지 않았습니다.');
  }

  return {
    url,
    anonKey,
  };
}

/**
 * 서버사이드 Supabase 클라이언트 (일반 권한)
 */
export function createServerClient() {
  const { url, anonKey } = getSupabaseConfig();
  return supabaseCreateClient(url, anonKey);
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

  console.log('🔑 Admin 클라이언트 생성 중...');

  return supabaseCreateClient(url, serviceKey, {
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

  console.log('🌐 클라이언트 사이드 클라이언트 생성 중...');

  return supabaseCreateClient(url, anonKey);
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
