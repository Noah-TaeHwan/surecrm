import { createClient } from '@supabase/supabase-js';
import { db } from './db';
import { profiles, invitations } from './schema';
import { eq } from 'drizzle-orm';
import { createInvitationsForUser } from './invitation-utils';
import { getUserId } from './session';

// 환경 변수 확인 및 로드
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error('필수 환경 변수가 설정되지 않았습니다:');
  console.error('SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  console.error('SUPABASE_ANON_KEY:', !!supabaseAnonKey);
  throw new Error(
    'Supabase 환경 변수가 설정되지 않았습니다. .env 파일을 확인해주세요.'
  );
}

console.log('Supabase URL:', supabaseUrl);
console.log(
  'Service Key (first 20 chars):',
  supabaseServiceKey.substring(0, 20)
);

// Supabase 클라이언트 초기화 - 서버용
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// 클라이언트용 Supabase 클라이언트
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

    // 만료되거나 취소된 초대장인지 확인
    if (inv.status === 'expired' || inv.status === 'cancelled') {
      return {
        valid: false,
        error: '만료되거나 취소된 초대 코드입니다.',
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
 * 이메일 중복 체크 (일반 Auth API 사용)
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    // 임시 비밀번호로 회원가입 시도하여 중복 체크
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: 'temp-check-password-12345', // 임시 비밀번호
      options: {
        data: { temp_check: true },
      },
    });

    if (error) {
      // 이미 등록된 이메일인 경우
      if (
        error.message.includes('already registered') ||
        error.message.includes('User already registered')
      ) {
        return true;
      }
      // 다른 오류인 경우 중복이 아닌 것으로 처리
      return false;
    }

    // 임시로 생성된 사용자 삭제 (가능한 경우)
    if (data.user && data.user.id) {
      try {
        // 클라이언트에서는 삭제할 수 없으므로 로그만 남김
        console.log('임시 사용자 생성됨:', data.user.id, '(자동 삭제 필요)');
      } catch (deleteError) {
        console.log('임시 사용자 삭제 불가:', deleteError);
      }
    }

    // 사용자가 생성되었다면 이메일이 사용 가능하다는 의미
    return false;
  } catch (error) {
    console.error('이메일 중복 체크 중 오류:', error);
    return false;
  }
}

/**
 * OTP 전송 (이메일 인증 코드)
 */
export async function sendEmailOTP(email: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: false, // 회원가입 시에는 사용자 생성하지 않음
      },
    });

    if (error) {
      console.error('OTP 전송 오류:', error);
      return {
        success: false,
        error: 'OTP 전송에 실패했습니다.',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('OTP 전송 중 오류:', error);
    return {
      success: false,
      error: 'OTP 전송 중 오류가 발생했습니다.',
    };
  }
}

/**
 * OTP 검증
 */
export async function verifyEmailOTP(
  email: string,
  token: string
): Promise<{
  success: boolean;
  error?: string;
  user?: any;
}> {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: token,
      type: 'email',
    });

    if (error) {
      console.error('OTP 검증 오류:', error);
      return {
        success: false,
        error: '인증 코드가 올바르지 않거나 만료되었습니다.',
      };
    }

    return {
      success: true,
      user: data.user,
    };
  } catch (error) {
    console.error('OTP 검증 중 오류:', error);
    return {
      success: false,
      error: 'OTP 검증 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 회원가입 처리 - OTP 인증 플로우
 */
export async function signUpUser(
  signUpData: SignUpData
): Promise<SignUpResult> {
  try {
    console.log('회원가입 시작:', signUpData.email);

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

    console.log('초대장 검증 완료');

    // 2. 이메일 중복 확인 (API 호출)
    console.log('이메일 중복 확인 중:', signUpData.email);

    try {
      // 브라우저에서만 실행되는 경우 현재 origin 사용
      const baseUrl =
        typeof window !== 'undefined'
          ? window.location.origin
          : 'http://localhost:5173'; // 서버 사이드 기본값

      const emailCheckResponse = await fetch(`${baseUrl}/api/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: signUpData.email }),
      });

      const emailCheckResult = await emailCheckResponse.json();

      if (!emailCheckResult.available) {
        console.log('이미 존재하는 이메일:', signUpData.email);
        return {
          success: false,
          error: '이미 등록된 이메일 주소입니다. 로그인을 시도해주세요.',
        };
      }

      console.log('이메일 중복 확인 완료 - 사용 가능');
    } catch (emailCheckError) {
      console.warn('이메일 중복 확인 API 오류:', emailCheckError);
      // API 호출 실패 시에도 회원가입 진행 (OTP 단계에서 검증됨)
    }

    // 3. OTP 전송 (새 사용자 생성)
    const { error } = await supabase.auth.signInWithOtp({
      email: signUpData.email,
      options: {
        shouldCreateUser: true, // 사용자가 없으면 생성
        data: {
          full_name: signUpData.fullName,
          phone: signUpData.phone,
          company: signUpData.company,
          invitation_code: signUpData.invitationCode,
        },
      },
    });

    if (error) {
      console.error('OTP 전송 오류:', error);

      // 이미 등록된 이메일 오류 처리
      if (
        error.message.includes('already registered') ||
        error.message.includes('User already registered')
      ) {
        return {
          success: false,
          error: '이미 등록된 이메일 주소입니다. 로그인을 시도해주세요.',
        };
      }

      return {
        success: false,
        error: error.message || 'OTP 전송에 실패했습니다.',
      };
    }

    console.log('OTP 전송 완료');

    return {
      success: true,
      user: {
        id: 'temp-id', // 임시 ID (OTP 검증 후 실제 ID 받음)
        email: signUpData.email,
        fullName: signUpData.fullName,
        role: 'agent',
        isActive: false, // OTP 인증 전까지는 비활성
        invitationsLeft: 0,
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
 * OTP 인증 완료 및 사용자 활성화
 */
export async function completeOTPVerification(
  email: string,
  otp: string,
  signUpData: SignUpData
): Promise<SignUpResult> {
  try {
    console.log('OTP 인증 시작:', email);

    // 1. OTP 검증
    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: otp,
      type: 'email',
    });

    if (error) {
      console.error('OTP 검증 오류:', error);
      return {
        success: false,
        error: '인증 코드가 올바르지 않거나 만료되었습니다.',
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'OTP 인증에 실패했습니다.',
      };
    }

    console.log('OTP 인증 성공:', data.user.id);

    // 2. 초대장 정보 다시 조회
    const invitationValidation = await validateInvitationCode(
      signUpData.invitationCode
    );
    if (!invitationValidation.valid) {
      return {
        success: false,
        error: invitationValidation.error,
      };
    }

    // 3. 프로필 생성 및 초대장 처리
    const registrationResult = await completeUserRegistration(
      data.user.id,
      signUpData,
      invitationValidation.invitation!
    );

    if (registrationResult.success) {
      console.log('사용자 등록 완료:', data.user.id);

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email!,
          fullName: signUpData.fullName,
          role: 'agent',
          isActive: true,
          invitationsLeft: 2,
        },
      };
    }

    return registrationResult;
  } catch (error) {
    console.error('OTP 인증 완료 처리 중 오류:', error);
    return {
      success: false,
      error: 'OTP 인증 완료 처리 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 사용자 등록 완료 처리 (이메일 인증 후)
 */
export async function completeUserRegistration(
  userId: string,
  signUpData: SignUpData,
  invitation: any
): Promise<SignUpResult> {
  try {
    console.log('사용자 등록 완료 처리 시작:', userId);

    // 1. 프로필 업데이트 또는 생성
    const existingProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    let profile;
    if (existingProfile.length > 0) {
      // 기존 프로필 업데이트
      const updatedProfile = await db
        .update(profiles)
        .set({
          fullName: signUpData.fullName,
          phone: signUpData.phone,
          company: signUpData.company,
          invitedById: invitation.inviterId,
          isActive: true, // 이메일 인증 완료로 활성화
        })
        .where(eq(profiles.id, userId))
        .returning();

      if (updatedProfile.length === 0) {
        throw new Error('프로필 업데이트에 실패했습니다.');
      }
      profile = updatedProfile[0];
    } else {
      // 새 프로필 생성
      const newProfile = await db
        .insert(profiles)
        .values({
          id: userId,
          fullName: signUpData.fullName,
          phone: signUpData.phone,
          company: signUpData.company,
          invitedById: invitation.inviterId,
          role: 'agent',
          isActive: true,
        })
        .returning();

      if (newProfile.length === 0) {
        throw new Error('프로필 생성에 실패했습니다.');
      }
      profile = newProfile[0];
    }

    console.log('프로필 처리 완료:', profile.id);

    // 2. 초대장 상태 업데이트
    await db
      .update(invitations)
      .set({
        status: 'used',
        usedById: userId,
        usedAt: new Date(),
      })
      .where(eq(invitations.id, invitation.id));

    console.log('초대장 사용 처리 완료');

    // 3. 새 사용자에게 초대장 2장 자동 생성
    const invitationResult = await createInvitationsForUser(userId, 2);

    if (invitationResult.success) {
      console.log('새 사용자 초대장 생성 완료:', invitationResult.invitations);
    }

    return {
      success: true,
      user: {
        id: profile.id,
        email: signUpData.email,
        fullName: profile.fullName,
        role: profile.role,
        isActive: profile.isActive,
        invitationsLeft: 2,
      },
    };
  } catch (error) {
    console.error('사용자 등록 완료 처리 중 오류:', error);
    return {
      success: false,
      error: '사용자 등록 완료 처리 중 오류가 발생했습니다.',
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
    console.log('로그인 시도:', credentials.email);

    // 1. Supabase Auth로 로그인
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.signInWithPassword({
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

/**
 * 현재 로그인된 사용자 정보 가져오기 (실제 세션 기반)
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
 * 사용자 로그아웃 처리
 */
export async function logoutUser(): Promise<void> {
  // 클라이언트에서는 Supabase 세션 정리
  await supabase.auth.signOut();
}

/**
 * 비밀번호 재설정 이메일 발송
 */
export async function sendPasswordResetEmail(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.SITE_URL}/auth/reset-password`,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('비밀번호 재설정 이메일 발송 실패:', error);
    return {
      success: false,
      error: '이메일 발송 중 오류가 발생했습니다.',
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
      .select()
      .from(profiles)
      .where(eq(profiles.id, inviterId))
      .limit(1);

    if (inviterProfile.length === 0) {
      return {
        success: false,
        error: '초대자를 찾을 수 없습니다.',
      };
    }

    if (inviterProfile[0].invitationsLeft <= 0) {
      return {
        success: false,
        error: '남은 초대장이 없습니다.',
      };
    }

    // 초대 코드 생성
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30일 후 만료

    // 초대장 생성
    await db.insert(invitations).values({
      code,
      inviterId,
      inviteeEmail,
      message,
      status: 'pending',
      expiresAt,
    });

    // 초대자의 남은 초대장 수 감소
    await db
      .update(profiles)
      .set({
        invitationsLeft: inviterProfile[0].invitationsLeft - 1,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, inviterId));

    return {
      success: true,
      code,
    };
  } catch (error) {
    console.error('초대장 생성 실패:', error);
    return {
      success: false,
      error: '초대장 생성 중 오류가 발생했습니다.',
    };
  }
}
