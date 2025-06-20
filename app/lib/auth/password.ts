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
    const redirectTo = `${siteUrl}/auth/reset-password`;

    console.log('비밀번호 재설정 이메일 발송:', { email, redirectTo });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      console.error('비밀번호 재설정 이메일 발송 실패:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('✅ 비밀번호 재설정 이메일 발송 성공');
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
