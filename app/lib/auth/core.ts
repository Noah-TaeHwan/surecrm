import { createClientSideClient } from '../core/supabase';

/**
 * 클라이언트 사이드 로그아웃
 */
export async function logoutUser(): Promise<void> {
  const supabase = createClientSideClient();
  await supabase.auth.signOut();
}

/**
 * 클라이언트 사이드 인증 상태 확인
 */
export async function isAuthenticated(): Promise<boolean> {
  const supabase = createClientSideClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session !== null;
}

/**
 * 현재 세션 가져오기
 */
export async function getCurrentSession() {
  const supabase = createClientSideClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

// 서버 전용 함수들은 core.server.ts에서 export
export type {
  User,
  LoginAttempt,
  LoginResult,
  MagicLinkRequest,
  MagicLinkResult,
  MagicLinkVerification,
} from './types';
