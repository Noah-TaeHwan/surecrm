import { redirect } from 'react-router';
import { checkAuthStatus } from '~/lib/auth/core';

interface LoaderArgs {
  request: Request;
}

export async function loader({ request }: LoaderArgs) {
  // 인증 상태 확인
  const isAuthenticated = await checkAuthStatus(request);

  if (isAuthenticated) {
    // 로그인된 사용자는 대시보드로 리다이렉트
    throw redirect('/dashboard');
  }

  // 로그인하지 않은 사용자는 초대 전용 페이지로 리다이렉트
  throw redirect('/invite-only');
}

export default function Index() {
  return null;
}
