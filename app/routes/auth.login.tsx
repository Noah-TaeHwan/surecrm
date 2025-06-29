import { redirect } from 'react-router';
import LoginPage from '~/common/pages/auth/login-page';
import { checkAuthStatus, authenticateUser } from '~/lib/auth/core.server';
import { createUserSession } from '~/lib/auth/session';
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
    message?: string;
    isAuthenticated?: boolean;
  };
}

// Loader function - redirect if already authenticated
export async function loader({ request }: LoaderArgs) {
  const isAuthenticated = await checkAuthStatus(request);

  // If already logged in, redirect to dashboard
  if (isAuthenticated) {
    throw redirect('/dashboard');
  }

  // Extract message parameters from URL
  const url = new URL(request.url);
  const message = url.searchParams.get('message') || '';

  // 🌍 서버에서 다국어 번역 로드
  try {
    const { t } = await createServerTranslator(request, 'auth');

    return {
      isAuthenticated: false,
      message,
      // 🌍 meta용 번역 데이터
      meta: {
        title: t('login.title', '로그인') + ' | SureCRM',
        description: t('login.subtitle', 'SureCRM에 로그인하세요'),
      },
    };
  } catch (error) {
    console.error('Auth login loader 에러:', error);

    // 에러 시 한국어 기본값
    return {
      isAuthenticated: false,
      message,
      meta: {
        title: '로그인 | SureCRM',
        description: 'SureCRM에 로그인하세요',
      },
    };
  }
}

// Action function - handle login form submission
export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return {
      success: false,
      error: '이메일과 비밀번호를 입력해주세요.',
    };
  }

  // Attempt classic email/password login
  const result = await authenticateUser({ email, password });

  if (result.success && result.user) {
    // Set React Router session and redirect to dashboard
    return await createUserSession(result.user.id, '/dashboard');
  }

  return {
    success: false,
    error: result.error || '로그인에 실패했습니다.',
  };
}

// 🌍 다국어 메타 정보
export function meta({ data }: MetaArgs) {
  const meta = data?.meta;

  if (!meta) {
    // 기본값 fallback
    return [
      { title: '로그인 | SureCRM' },
      { name: 'description', content: 'SureCRM에 로그인하세요' },
    ];
  }

  return [
    { title: meta.title },
    { name: 'description', content: meta.description },
  ];
}

// Export the login page component
export default LoginPage;
