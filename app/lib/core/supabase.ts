import { createClient as supabaseCreateClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase 설정 가져오기 (서버사이드용)
 */
function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
export function createServerClient(request?: Request) {
  const { url, anonKey } = getSupabaseConfig();
  
  // 쿠키 기반 세션 처리
  if (request) {
    const cookieHeader = request.headers.get('Cookie') || '';
    
    // Supabase 관련 쿠키들 추출 및 URL 디코딩
    const supabaseCookies = new Map<string, string>();
    cookieHeader
      .split(';')
      .map(cookie => cookie.trim())
      .filter(cookie => cookie.includes('supabase') || cookie.includes('sb-'))
      .forEach(cookie => {
        const equalIndex = cookie.indexOf('=');
        if (equalIndex > 0) {
          const name = cookie.substring(0, equalIndex).trim();
          const value = cookie.substring(equalIndex + 1).trim();
          // URL 디코딩 적용
          try {
            supabaseCookies.set(name, decodeURIComponent(value));
          } catch (error) {
            // 디코딩 실패 시 원본 값 사용
            supabaseCookies.set(name, value);
          }
        }
      });
    
    // 세션 상태 추적을 위한 Map
    const sessionState = new Map<string, string | null>();
    
    return supabaseCreateClient(url, anonKey, {
      auth: {
        autoRefreshToken: false, // 서버에서는 자동 갱신 비활성화
        persistSession: false,   // 서버에서는 세션 유지 비활성화
        detectSessionInUrl: true,
        storage: {
          getItem: (key: string): string | null => {
            // 1. 먼저 세션 상태에서 확인 (삭제된 경우 null 반환)
            if (sessionState.has(key)) {
              return sessionState.get(key) ?? null;
            }
            
            // 2. 쿠키에서 값 찾기
            const value = supabaseCookies.get(key) || null;
            
            // 세션 상태에 저장
            sessionState.set(key, value);
            return value;
          },
          setItem: (key: string, value: string) => {
            // 세션 상태 업데이트
            sessionState.set(key, value);
          },
          removeItem: (key: string) => {
            // 세션 상태에서 명시적으로 null로 설정
            sessionState.set(key, null);
          }
        }
      }
    });
  }
  
  // 요청이 없는 경우 기본 클라이언트
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

  return supabaseCreateClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    global: {
      // JWT 만료 감지 및 자동 갱신 기능
      fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
        try {
          const response = await fetch(input, init);
          
          // JWT 만료 에러 감지
          if (response.status === 401) {
            const errorText = await response.clone().text();
            if (errorText.includes('JWT') || errorText.includes('expired') || errorText.includes('invalid')) {
              // 클라이언트에서는 페이지 새로고침으로 자동 갱신 유도
              if (typeof window !== 'undefined') {
                window.location.href = '/auth/login?error=session_expired&message=세션이 만료되었습니다. 다시 로그인해주세요.';
              }
            }
          }
          
          return response;
        } catch (error) {
          console.error('Supabase fetch 오류:', error);
          throw error;
        }
      }
    }
  });
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
