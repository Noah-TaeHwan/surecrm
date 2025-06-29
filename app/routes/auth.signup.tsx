import { redirect } from 'react-router';
import SignupPage from '~/common/pages/auth/signup-page';
import { checkAuthStatus } from '~/lib/auth/core.server';
import { signUpUser } from '~/lib/auth/registration';
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
    isAuthenticated?: boolean;
    invitationCode?: string;
  };
}

// Loader function - redirect if already authenticated
export async function loader({ request }: LoaderArgs) {
  const isAuthenticated = await checkAuthStatus(request);

  // If already logged in, redirect to dashboard
  if (isAuthenticated) {
    throw redirect('/dashboard');
  }

  // Extract invitation code from URL
  const url = new URL(request.url);
  const invitationCode = url.searchParams.get('code') || '';

  // 🌍 서버에서 다국어 번역 로드
  try {
    const { t } = await createServerTranslator(request, 'auth');

    return {
      isAuthenticated: false,
      invitationCode,
      // 🌍 meta용 번역 데이터
      meta: {
        title: t('signup.title', '회원가입') + ' | SureCRM',
        description: t('signup.subtitle', '초대 코드로 SureCRM에 가입하세요'),
      },
    };
  } catch (error) {
    console.error('Auth signup loader 에러:', error);

    // 에러 시 한국어 기본값
    return {
      isAuthenticated: false,
      invitationCode,
      meta: {
        title: '회원가입 | SureCRM',
        description: '초대 코드로 SureCRM에 가입하세요',
      },
    };
  }
}

// Action function - handle signup form submission
export async function action({ request }: ActionArgs) {
  const formData = await request.formData();

  const signUpData = {
    invitationCode: formData.get('invitationCode') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
    fullName: formData.get('fullName') as string,
    phone: (formData.get('phone') as string) || undefined,
    company: (formData.get('company') as string) || undefined,
  };

  // Basic validation
  if (
    !signUpData.invitationCode ||
    !signUpData.email ||
    !signUpData.password ||
    !signUpData.confirmPassword ||
    !signUpData.fullName
  ) {
    return {
      success: false,
      error: '필수 정보를 모두 입력해주세요.',
    };
  }

  // Password confirmation check
  if (signUpData.password !== signUpData.confirmPassword) {
    return {
      success: false,
      error: '비밀번호가 일치하지 않습니다.',
    };
  }

  const result = await signUpUser({
    invitationCode: signUpData.invitationCode,
    email: signUpData.email,
    password: signUpData.password,
    fullName: signUpData.fullName,
    phone: signUpData.phone,
    company: signUpData.company,
  });

  if (result.success && result.user) {
    // If OTP verification is needed
    if (!result.user.isActive) {
      throw redirect(
        `/auth/otp-verification?email=${encodeURIComponent(
          signUpData.email
        )}&invitation_code=${encodeURIComponent(
          signUpData.invitationCode
        )}&full_name=${encodeURIComponent(
          signUpData.fullName
        )}&phone=${encodeURIComponent(
          signUpData.phone || ''
        )}&company=${encodeURIComponent(
          signUpData.company || ''
        )}&message=${encodeURIComponent(
          '회원가입 요청이 완료되었습니다. 이메일로 받은 인증 코드를 입력해주세요.'
        )}`
      );
    }

    // If OTP verification is complete
    throw redirect('/auth/login?message=signup-success');
  }

  return {
    success: false,
    error: result.error || '회원가입에 실패했습니다.',
  };
}

// 🌍 다국어 메타 정보
export function meta({ data }: MetaArgs) {
  const meta = data?.meta;

  if (!meta) {
    // 기본값 fallback
    return [
      { title: '회원가입 | SureCRM' },
      { name: 'description', content: '초대 코드로 SureCRM에 가입하세요' },
    ];
  }

  return [
    { title: meta.title },
    { name: 'description', content: meta.description },
  ];
}

// Export the signup page component
export default SignupPage;
