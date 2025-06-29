import ForgotPasswordPage from '~/common/pages/auth/forgot-password-page';
import { sendPasswordResetEmail } from '~/lib/auth/password';
import { createServerTranslator } from '~/lib/i18n/language-manager.server';

// 직접 타입 정의
interface LoaderArgs {
  request: Request;
}

interface ActionArgs {
  request: Request;
}

interface MetaArgs {
  data?: {
    meta?: {
      title: string;
      description: string;
    };
  };
}

// Loader function
export async function loader({ request }: LoaderArgs) {
  // 🌍 서버에서 다국어 번역 로드
  try {
    const { t } = await createServerTranslator(request, 'auth');

    return {
      // 🌍 meta용 번역 데이터
      meta: {
        title: t('forgot.title', '비밀번호 찾기') + ' | SureCRM',
        description: t(
          'forgot.subtitle',
          'SureCRM 계정의 비밀번호를 재설정하세요'
        ),
      },
    };
  } catch (error) {
    console.error('Auth forgot-password loader 에러:', error);

    // 에러 시 한국어 기본값
    return {
      meta: {
        title: '비밀번호 찾기 | SureCRM',
        description: 'SureCRM 계정의 비밀번호를 재설정하세요',
      },
    };
  }
}

// Action function - handle password reset email sending
export async function action({ request }: ActionArgs) {
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

// 🌍 다국어 메타 정보
export function meta({ data }: MetaArgs) {
  const meta = data?.meta;

  if (!meta) {
    // 기본값 fallback
    return [
      { title: '비밀번호 찾기 | SureCRM' },
      {
        name: 'description',
        content: 'SureCRM 계정의 비밀번호를 재설정하세요',
      },
    ];
  }

  return [
    { title: meta.title },
    { name: 'description', content: meta.description },
  ];
}

// Export the forgot password page component
export default ForgotPasswordPage;
