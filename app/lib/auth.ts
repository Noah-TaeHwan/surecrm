import { createClient } from '@supabase/supabase-js';
import { db } from './db';
import { profiles, invitations } from './supabase-schema';
import { eq } from 'drizzle-orm';
import { createInvitationsForUser } from './invitation-utils';
import { getUserId } from './session';

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 사용자 인터페이스
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  teamId?: string;
  isActive: boolean;
  invitationsLeft: number;
}

// 회원가입 인터페이스
export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  company?: string;
  invitationCode: string;
}

// 로그인 시도 인터페이스
export interface LoginAttempt {
  email: string;
  password: string;
}

// 로그인 결과 인터페이스
export interface LoginResult {
  success: boolean;
  error?: string;
  user?: User;
}

// 회원가입 결과 인터페이스
export interface SignUpResult {
  success: boolean;
  error?: string;
  user?: User;
}

/**
 * 초대장 코드 검증
 */
export async function validateInvitationCode(code: string): Promise<{
  valid: boolean;
  invitation?: any;
  error?: string;
}> {
  try {
    const invitation = await db
      .select()
      .from(invitations)
      .where(eq(invitations.code, code))
      .limit(1);

    if (invitation.length === 0) {
      return {
        valid: false,
        error: '유효하지 않은 초대 코드입니다.',
      };
    }

    const inv = invitation[0];

    // 이미 사용된 초대장인지 확인
    if (inv.status === 'used') {
      return {
        valid: false,
        error: '이미 사용된 초대 코드입니다.',
      };
    }

    // 만료된 초대장인지 확인
    if (inv.expiresAt && new Date(inv.expiresAt) < new Date()) {
      return {
        valid: false,
        error: '만료된 초대 코드입니다.',
      };
    }

    return {
      valid: true,
      invitation: inv,
    };
  } catch (error) {
    console.error('초대장 코드 검증 중 오류:', error);
    return {
      valid: false,
      error: '초대장 코드 검증 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 사용자 회원가입 처리 (초대장 시스템 포함)
 */
export async function signUpUser(
  signUpData: SignUpData
): Promise<SignUpResult> {
  try {
    // 1. 초대장 코드 검증
    const invitationValidation = await validateInvitationCode(
      signUpData.invitationCode
    );
    if (!invitationValidation.valid) {
      return {
        success: false,
        error: invitationValidation.error,
      };
    }

    // 2. Supabase Auth로 사용자 생성
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: signUpData.email,
      password: signUpData.password,
    });

    if (authError) {
      return {
        success: false,
        error: authError.message,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: '사용자 생성에 실패했습니다.',
      };
    }

    // 3. 프로필 생성
    const newProfile = await db
      .insert(profiles)
      .values({
        id: authData.user.id,
        fullName: signUpData.fullName,
        phone: signUpData.phone,
        company: signUpData.company,
        role: 'agent',
        invitedById: invitationValidation.invitation!.inviterId,
        invitationsLeft: 2, // 새 사용자에게 2장의 초대장 제공
        isActive: true,
      })
      .returning();

    // 4. 초대장 상태 업데이트
    await db
      .update(invitations)
      .set({
        status: 'used',
        usedById: authData.user.id,
        usedAt: new Date(),
      })
      .where(eq(invitations.id, invitationValidation.invitation!.id));

    // 5. 새 사용자에게 초대장 2장 자동 생성
    const invitationResult = await createInvitationsForUser(
      authData.user.id,
      2
    );
    if (!invitationResult.success) {
      console.error('새 사용자 초대장 생성 실패:', invitationResult.error);
      // 초대장 생성 실패해도 회원가입은 성공으로 처리
    }

    return {
      success: true,
      user: {
        id: newProfile[0].id,
        email: signUpData.email,
        fullName: newProfile[0].fullName,
        role: newProfile[0].role,
        teamId: newProfile[0].teamId || undefined,
        isActive: newProfile[0].isActive,
        invitationsLeft: newProfile[0].invitationsLeft,
      },
    };
  } catch (error) {
    console.error('회원가입 처리 중 오류:', error);
    return {
      success: false,
      error: '회원가입 처리 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 사용자 로그인 처리
 */
export async function authenticateUser(
  credentials: LoginAttempt
): Promise<LoginResult> {
  try {
    // Supabase Auth로 로그인
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

    if (authError) {
      return {
        success: false,
        error: authError.message,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: '로그인에 실패했습니다.',
      };
    }

    // 프로필 정보 조회
    const userProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, authData.user.id))
      .limit(1);

    if (userProfile.length === 0) {
      return {
        success: false,
        error: '사용자 프로필을 찾을 수 없습니다.',
      };
    }

    const profile = userProfile[0];

    // 마지막 로그인 시간 업데이트
    await db
      .update(profiles)
      .set({ lastLoginAt: new Date() })
      .where(eq(profiles.id, authData.user.id));

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

/**
 * 현재 사용자 정보 조회 (세션 기반)
 */
export async function getCurrentUser(request: Request): Promise<User | null> {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return null;
    }

    // 프로필 정보 조회
    const userProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    if (userProfile.length === 0) {
      return null;
    }

    const profile = userProfile[0];

    // Supabase Auth에서 이메일 정보 가져오기
    const { data: authUser } = await supabase.auth.admin.getUserById(userId);

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
 * 사용자 인증 상태 확인
 */
export async function checkAuthStatus(request: Request): Promise<boolean> {
  try {
    const user = await getCurrentUser(request);
    return user !== null && user.isActive;
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
    await supabase.auth.signOut();
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
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('비밀번호 재설정 이메일 발송 중 오류:', error);
    return {
      success: false,
      error: '비밀번호 재설정 이메일 발송 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 초대장 생성
 */
export async function createInvitation(
  inviterId: string,
  inviteeEmail?: string,
  message?: string
): Promise<{ success: boolean; code?: string; error?: string }> {
  try {
    // 초대자의 남은 초대장 수 확인
    const inviterProfile = await db
      .select({ invitationsLeft: profiles.invitationsLeft })
      .from(profiles)
      .where(eq(profiles.id, inviterId))
      .limit(1);

    if (inviterProfile.length === 0 || inviterProfile[0].invitationsLeft <= 0) {
      return {
        success: false,
        error: '사용 가능한 초대장이 없습니다.',
      };
    }

    // 고유한 초대 코드 생성
    const code = `INV-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;

    // 초대장 생성
    const newInvitation = await db
      .insert(invitations)
      .values({
        code,
        inviterId,
        inviteeEmail,
        message: message || '보험설계사를 위한 SureCRM에 초대합니다!',
        status: 'pending',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후 만료
      })
      .returning();

    // 초대자의 남은 초대장 수 감소
    await db
      .update(profiles)
      .set({ invitationsLeft: inviterProfile[0].invitationsLeft - 1 })
      .where(eq(profiles.id, inviterId));

    return {
      success: true,
      code: newInvitation[0].code,
    };
  } catch (error) {
    console.error('초대장 생성 중 오류:', error);
    return {
      success: false,
      error: '초대장 생성 중 오류가 발생했습니다.',
    };
  }
}
