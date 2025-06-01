import { createAdminClient, createServerClient } from '../core/supabase';
import { db } from '../core/db';
import { profiles } from '../schema';
import { eq } from 'drizzle-orm';
import { getUserId } from './session';
import type {
  User,
  LoginAttempt,
  LoginResult,
  MagicLinkRequest,
  MagicLinkResult,
  MagicLinkVerification,
} from './types';

/**
 * 현재 사용자 조회
 */
export async function getCurrentUser(request: Request): Promise<User | null> {
  try {
    // 세션에서 사용자 ID 가져오기
    const userId = await getUserId(request);
    if (!userId) {
      return null;
    }

    console.log('현재 사용자 ID 조회:', userId);

    // 프로필 정보 조회
    const userProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    if (userProfile.length === 0) {
      console.error('프로필을 찾을 수 없음:', userId);
      return null;
    }

    const profile = userProfile[0];

    // Supabase Auth에서 이메일 정보 가져오기
    const supabaseAdmin = createAdminClient();
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(
      userId
    );

    return {
      id: profile.id,
      email: authUser.user?.email || '',
      fullName: profile.fullName,
      role: profile.role,
      teamId: profile.teamId || undefined,
      isActive: profile.isActive,
      invitationsLeft: profile.invitationsLeft,
    };
  } catch (error) {
    console.error('현재 사용자 조회 중 오류:', error);
    return null;
  }
}

/**
 * 인증 상태 확인
 */
export async function checkAuthStatus(request: Request): Promise<boolean> {
  const user = await getCurrentUser(request);
  return user !== null && user.isActive;
}

/**
 * 로그아웃
 */
export async function logoutUser(): Promise<void> {
  // 클라이언트에서는 Supabase 세션 정리
  const supabase = createServerClient();
  await supabase.auth.signOut();
}

/**
 * 매직링크 발송 (새로운 로그인 방식)
 */
export async function sendMagicLink(
  request: MagicLinkRequest
): Promise<MagicLinkResult> {
  try {
    console.log('매직링크 발송 시도:', request.email);

    // 1. Supabase Admin API로 이메일 사용자 조회
    const supabaseAdmin = createAdminClient();
    const { data: users, error: listError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error('사용자 목록 조회 오류:', listError);
      return {
        success: false,
        error: '사용자 확인 중 오류가 발생했습니다.',
      };
    }

    // 이메일로 사용자 찾기
    const existingUser = users.users.find(
      (user) => user.email === request.email
    );

    if (!existingUser) {
      return {
        success: false,
        error: '등록되지 않은 이메일 주소입니다. 회원가입을 먼저 진행해주세요.',
      };
    }

    // 2. 프로필 상태 확인
    const userProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, existingUser.id))
      .limit(1);

    if (userProfile.length === 0) {
      return {
        success: false,
        error: '사용자 프로필을 찾을 수 없습니다.',
      };
    }

    const profile = userProfile[0];

    // 3. 계정 활성화 상태 확인
    if (!profile.isActive) {
      return {
        success: false,
        error: '비활성화된 계정입니다. 관리자에게 문의하세요.',
      };
    }

    // 4. 매직링크 발송
    const supabase = createServerClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: request.email,
      options: {
        shouldCreateUser: false, // 기존 사용자만 로그인 허용
      },
    });

    if (error) {
      console.error('매직링크 발송 오류:', error);
      return {
        success: false,
        error: '매직링크 발송에 실패했습니다. 잠시 후 다시 시도해주세요.',
      };
    }

    console.log('매직링크 발송 완료:', request.email);

    return {
      success: true,
      message: '로그인 링크가 이메일로 전송되었습니다. 이메일을 확인해주세요.',
    };
  } catch (error) {
    console.error('매직링크 발송 처리 중 오류:', error);
    return {
      success: false,
      error: '매직링크 발송 처리 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 매직링크 검증 및 로그인 처리
 */
export async function verifyMagicLink(
  token: string,
  type: string,
  email: string
): Promise<LoginResult> {
  try {
    console.log('매직링크 검증 시작:', email);

    // 1. Supabase를 통한 매직링크 검증
    const supabase = createServerClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: token,
      type: type as any,
    });

    if (error) {
      console.error('매직링크 검증 오류:', error);
      return {
        success: false,
        error: '로그인 링크가 올바르지 않거나 만료되었습니다.',
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: '매직링크 검증에 실패했습니다.',
      };
    }

    console.log('매직링크 검증 성공:', data.user.id);

    // 2. 프로필 정보 조회
    const userProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, data.user.id))
      .limit(1);

    if (userProfile.length === 0) {
      console.error('프로필을 찾을 수 없음:', data.user.id);
      return {
        success: false,
        error: '사용자 프로필을 찾을 수 없습니다.',
      };
    }

    const profile = userProfile[0];

    // 3. 계정 활성화 상태 재확인
    if (!profile.isActive) {
      return {
        success: false,
        error: '비활성화된 계정입니다. 관리자에게 문의하세요.',
      };
    }

    console.log('매직링크 로그인 성공:', profile.fullName);

    return {
      success: true,
      user: {
        id: profile.id,
        email: data.user.email!,
        fullName: profile.fullName,
        role: profile.role,
        teamId: profile.teamId || undefined,
        isActive: profile.isActive,
        invitationsLeft: profile.invitationsLeft,
      },
    };
  } catch (error) {
    console.error('매직링크 검증 처리 중 오류:', error);
    return {
      success: false,
      error: '매직링크 검증 처리 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 로그인 처리 (클래식 이메일/비밀번호 방식)
 */
export async function authenticateUser(
  credentials: LoginAttempt
): Promise<LoginResult> {
  try {
    console.log('로그인 시도:', credentials.email);

    // 1. 서버 클라이언트를 사용하여 브라우저 세션 설정
    const supabase = createServerClient();
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

    if (authError) {
      console.error('Supabase Auth 로그인 오류:', authError);
      return {
        success: false,
        error: '이메일 또는 비밀번호가 올바르지 않습니다.',
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: '로그인에 실패했습니다.',
      };
    }

    console.log('Supabase Auth 로그인 성공:', authData.user.id);

    // 2. 프로필 정보 조회
    const userProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, authData.user.id))
      .limit(1);

    if (userProfile.length === 0) {
      console.error('프로필을 찾을 수 없음:', authData.user.id);
      return {
        success: false,
        error: '사용자 프로필을 찾을 수 없습니다.',
      };
    }

    const profile = userProfile[0];

    // 3. 계정 활성화 상태 확인
    if (!profile.isActive) {
      return {
        success: false,
        error: '비활성화된 계정입니다. 관리자에게 문의하세요.',
      };
    }

    console.log('로그인 성공:', profile.fullName);

    return {
      success: true,
      user: {
        id: profile.id,
        email: authData.user.email!,
        fullName: profile.fullName,
        role: profile.role,
        teamId: profile.teamId || undefined,
        isActive: profile.isActive,
        invitationsLeft: profile.invitationsLeft,
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
