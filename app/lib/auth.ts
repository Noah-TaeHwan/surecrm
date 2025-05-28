import { db } from './db';
import { profiles } from './supabase-schema';
import { eq } from 'drizzle-orm';

// 로그인 시도 인터페이스
export interface LoginAttempt {
  email: string;
  password: string;
}

// 로그인 결과 인터페이스
export interface LoginResult {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
}

/**
 * 사용자 로그인 처리
 * 실제로는 Supabase Auth를 사용하지만, 여기서는 기본 구조만 제공
 */
export async function authenticateUser(
  credentials: LoginAttempt
): Promise<LoginResult> {
  try {
    // 실제로는 Supabase Auth의 signInWithPassword를 사용
    // const { data, error } = await supabase.auth.signInWithPassword({
    //   email: credentials.email,
    //   password: credentials.password,
    // });

    // 현재는 더미 로직으로 이메일 형식만 확인
    if (!credentials.email.includes('@')) {
      return {
        success: false,
        error: '유효한 이메일 주소를 입력해주세요.',
      };
    }

    if (credentials.password.length < 6) {
      return {
        success: false,
        error: '비밀번호는 최소 6자 이상이어야 합니다.',
      };
    }

    // 사용자 프로필 조회 (실제로는 Auth 성공 후 실행)
    const userProfile = await db
      .select({
        id: profiles.id,
        fullName: profiles.fullName,
        role: profiles.role,
        isActive: profiles.isActive,
      })
      .from(profiles)
      .where(eq(profiles.id, 'dummy-user-id')) // 실제로는 Auth에서 받은 user.id 사용
      .limit(1);

    // 더미 성공 응답
    return {
      success: true,
      user: {
        id: 'dummy-user-id',
        email: credentials.email,
        fullName: '테스트 사용자',
        role: 'agent',
      },
    };
  } catch (error) {
    console.error('로그인 처리 중 오류:', error);
    return {
      success: false,
      error: '로그인 처리 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 사용자 인증 상태 확인
 */
export async function checkAuthStatus(request: Request): Promise<boolean> {
  try {
    // 실제로는 쿠키나 세션에서 인증 토큰을 확인
    // const token = getCookie(request, 'auth-token');
    // const { data, error } = await supabase.auth.getUser(token);

    // 현재는 더미로 false 반환
    return false;
  } catch (error) {
    console.error('인증 상태 확인 중 오류:', error);
    return false;
  }
}

/**
 * 사용자 로그아웃 처리
 */
export async function logoutUser(): Promise<void> {
  try {
    // 실제로는 Supabase Auth의 signOut을 사용
    // await supabase.auth.signOut();

    console.log('로그아웃 처리됨');
  } catch (error) {
    console.error('로그아웃 처리 중 오류:', error);
  }
}

/**
 * 비밀번호 재설정 이메일 발송
 */
export async function sendPasswordResetEmail(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 실제로는 Supabase Auth의 resetPasswordForEmail을 사용
    // const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (!email.includes('@')) {
      return {
        success: false,
        error: '유효한 이메일 주소를 입력해주세요.',
      };
    }

    // 더미 성공 응답
    return {
      success: true,
    };
  } catch (error) {
    console.error('비밀번호 재설정 이메일 발송 중 오류:', error);
    return {
      success: false,
      error: '이메일 발송 중 오류가 발생했습니다.',
    };
  }
}
