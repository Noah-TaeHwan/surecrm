import { createServerClient } from '../core/supabase';

/**
 * 비밀번호 재설정 이메일 발송
 */
export async function sendPasswordResetEmail(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerClient();

    // 환경변수에서 사이트 URL 가져오기 (개발/운영 환경 고려)
    const siteUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5173' 
      : process.env.SITE_URL || 'https://surecrm-sigma.vercel.app';
    const redirectTo = `${siteUrl}/auth/confirm`;

    console.log('📧 비밀번호 재설정 이메일 발송 시작:', { 
      email, 
      redirectTo,
      NODE_ENV: process.env.NODE_ENV,
      SITE_URL: process.env.SITE_URL 
    });

    // ✅ Context7에서 확인한 Supabase 표준 방식 사용
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    console.log('📧 비밀번호 재설정 이메일 API 응답:', {
      hasData: !!data,
      hasError: !!error,
      errorMessage: error?.message,
      errorCode: error?.message,
    });

    if (error) {
      console.error('❌ 비밀번호 재설정 이메일 발송 실패:', {
        email,
        error: error.message,
        errorCode: error.message,
        redirectTo,
      });
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('✅ 비밀번호 재설정 이메일 발송 성공:', {
      email,
      redirectTo,
      data: data ? 'present' : 'null'
    });
    return {
      success: true,
    };
  } catch (error) {
    console.error('❌ 비밀번호 재설정 이메일 발송 예외:', {
      email,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      success: false,
      error: '이메일 발송 중 오류가 발생했습니다.',
    };
  }
}
