import { createServerClient } from '../core/supabase';
import { db } from '../core/db';
import { profiles, invitations } from '../schema';
import { eq } from 'drizzle-orm';
import { createInvitationsForUser } from '../data/business/invitations';
import { validateInvitationCode } from './validation';
import type {
  SignUpData,
  SignUpResult,
  InvitationValidationResult,
} from './types';

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
    const supabase = createServerClient();
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
    const supabase = createServerClient();
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
 * 사용자 등록 완료 처리
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
