import { redirect } from 'react-router';
import LoginPage from '~/common/pages/auth/login-page';
import { checkAuthStatus, authenticateUser } from '~/lib/auth/core';
import { createUserSession } from '~/lib/auth/session';
import type { Route } from './+types/auth.login';

// Loader function - redirect if already authenticated
export async function loader({ request }: Route.LoaderArgs) {
  const isAuthenticated = await checkAuthStatus(request);

  // If already logged in, redirect to dashboard
  if (isAuthenticated) {
    throw redirect('/dashboard');
  }

  // Extract message parameters from URL
  const url = new URL(request.url);
  const message = url.searchParams.get('message') || '';

  return {
    isAuthenticated: false,
    message,
  };
}

// Action function - handle login form submission
export async function action({ request }: Route.ActionArgs) {
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

// Meta information
export function meta() {
  return [
    { title: '로그인 | SureCRM' },
    { name: 'description', content: 'SureCRM에 로그인하세요' },
  ];
}

// Export the login page component
export default LoginPage;
