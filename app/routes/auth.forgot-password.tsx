import ForgotPasswordPage from '~/common/pages/auth/forgot-password-page';
import { sendPasswordResetEmail } from '~/lib/auth/password';

// Loader function
export async function loader() {
  // Forgot password page doesn't need special loader data
  return {};
}

// Action function - handle password reset email sending
export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const email = formData.get('email') as string;

  if (!email) {
    return {
      success: false,
      error: '이메일을 입력해주세요.',
    };
  }

  try {
    // Send password reset email
    const result = await sendPasswordResetEmail(email);

    if (result.success) {
      return {
        success: true,
        message: '비밀번호 재설정 링크가 이메일로 발송되었습니다.',
      };
    } else {
      return {
        success: false,
        error: result.error || '이메일 발송에 실패했습니다.',
      };
    }
  } catch (error) {
    console.error('비밀번호 재설정 이메일 발송 실패:', error);
    return {
      success: false,
      error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    };
  }
}

// Meta information
export function meta() {
  return [
    { title: '비밀번호 찾기 | SureCRM' },
    { name: 'description', content: 'SureCRM 계정의 비밀번호를 재설정하세요' },
  ];
}

// Export the forgot password page component
export default ForgotPasswordPage;
