import { createServerClient } from '~/lib/core/supabase';
import { db } from '~/lib/core/db.server';
import schema from '~/lib/schema/all';
import { eq } from 'drizzle-orm';
import { createInvitationsForUser } from '../data/business/invitations';
import { validateInvitationCode } from './validation';
import type {
  SignUpData,
  SignUpResult,
  InvitationValidationResult,
} from './types';
import { triggerWelcomeEmailOnSignup } from '~/features/notifications/lib/email-service';

/**
 * 회원가입 처리 - OTP 인증 플로우 (미완료 가입 재시도 지원)
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

    // 2. 스마트한 이메일 중복 확인
    console.log('스마트한 이메일 중복 확인 중:', signUpData.email);

    try {
      const baseUrl =
        typeof window !== 'undefined'
          ? window.location.origin
          : 'http://localhost:5173';

      const emailCheckResponse = await fetch(`${baseUrl}/api/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: signUpData.email }),
      });

      const emailCheckResult = await emailCheckResponse.json();

      // API 응답 구조: { success: true, data: { available: boolean, details: {...} } }
      if (!emailCheckResult.success || !emailCheckResult.data.available) {
        const reason = emailCheckResult.data?.details?.reason;

        // 완전한 가입 완료인 경우만 차단
        if (reason === 'completed_registration') {
          console.log('완전한 가입 완료된 이메일:', signUpData.email);
          return {
            success: false,
            error: '이미 등록된 이메일 주소입니다. 로그인을 시도해주세요.',
          };
        }

        // 미완료 가입인 경우 재시도 허용
        console.log('미완료 가입 발견 - 재시도 진행:', {
          email: signUpData.email,
          reason: reason,
          available: emailCheckResult.data?.available,
        });
      }

      console.log('이메일 중복 확인 완료 - 가입 진행 가능');
    } catch (emailCheckError) {
      console.warn('이메일 중복 확인 API 오류:', emailCheckError);
      // API 호출 실패 시에도 회원가입 진행 (OTP 단계에서 검증됨)
    }

    // 3. OTP 전송 (스마트한 사용자 생성)
    const supabase = createServerClient();

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: signUpData.email,
        options: {
          shouldCreateUser: true, // 새 사용자 생성 허용
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

        // 이미 등록된 이메일인 경우 → 기존 사용자에게 OTP 재발송
        if (
          error.message.includes('already registered') ||
          error.message.includes('User already registered')
        ) {
          console.log('기존 사용자에게 OTP 재발송 시도');

          // shouldCreateUser: false로 기존 사용자에게 OTP 발송
          const { error: resendError } = await supabase.auth.signInWithOtp({
            email: signUpData.email,
            options: {
              shouldCreateUser: false, // 기존 사용자 사용
              data: {
                full_name: signUpData.fullName,
                phone: signUpData.phone,
                company: signUpData.company,
                invitation_code: signUpData.invitationCode,
              },
            },
          });

          if (resendError) {
            console.error('OTP 재발송 오류:', resendError);
            return {
              success: false,
              error: 'OTP 발송에 실패했습니다. 잠시 후 다시 시도해주세요.',
            };
          }

          console.log('기존 사용자에게 OTP 재발송 완료');
        } else {
          return {
            success: false,
            error: error.message || 'OTP 전송에 실패했습니다.',
          };
        }
      } else {
        console.log('새 사용자 OTP 전송 완료');
      }
    } catch (otpError) {
      console.error('OTP 처리 중 예외:', otpError);
      return {
        success: false,
        error: 'OTP 처리 중 오류가 발생했습니다.',
      };
    }

    console.log('OTP 전송 완료 - 인증 대기 중');

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

      // 회원가입 완료 후 환영 이메일 발송 (비동기, 실패해도 등록은 완료)
      triggerWelcomeEmailOnSignup(signUpData.email, signUpData.fullName).catch(
        error => {
          console.error('웰컴 이메일 발송 실패 (무시):', error);
        }
      );

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
      .from(schema.profiles)
      .where(eq(schema.profiles.id, userId))
      .limit(1);

    let profile;
    if (existingProfile.length > 0) {
      // 기존 프로필 업데이트 - 체험 기간도 설정
      const now = new Date();
      const trialEndDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14일 후

      const updatedProfile = await db
        .update(schema.profiles)
        .set({
          fullName: signUpData.fullName,
          phone: signUpData.phone,
          company: signUpData.company,
          invitedById: invitation.inviterId,
          isActive: true, // 이메일 인증 완료로 활성화
          subscriptionStatus: 'trial',
          trialEndsAt: trialEndDate,
        })
        .where(eq(schema.profiles.id, userId))
        .returning();

      if (updatedProfile.length === 0) {
        throw new Error('프로필 업데이트에 실패했습니다.');
      }
      profile = updatedProfile[0];
    } else {
      // 새 프로필 생성 - 14일 무료 체험 자동 설정
      const now = new Date();
      const trialEndDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14일 후

      const newProfile = await db
        .insert(schema.profiles)
        .values({
          id: userId,
          fullName: signUpData.fullName,
          phone: signUpData.phone,
          company: signUpData.company,
          invitedById: invitation.inviterId,
          role: 'agent',
          isActive: true,
          subscriptionStatus: 'trial',
          trialEndsAt: trialEndDate,
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
      .update(schema.invitations)
      .set({
        status: 'used',
        usedById: userId,
        usedAt: new Date(),
      })
      .where(eq(schema.invitations.id, invitation.id));

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
