import { createServerClient } from '../core/supabase';
import type { OTPResult } from './types';

// Supabase 클라이언트
const supabase = createServerClient();

/**
 * OTP 전송 (이메일 인증 코드)
 */
export async function sendEmailOTP(email: string): Promise<OTPResult> {
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
): Promise<OTPResult> {
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
