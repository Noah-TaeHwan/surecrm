import { logoutUser } from '~/lib/auth';
import { logout } from '~/lib/session';

interface ActionArgs {
  request: Request;
}

interface LoaderArgs {
  request: Request;
}

export async function action({ request }: ActionArgs) {
  if (request.method !== 'POST') {
    throw new Response('Method not allowed', { status: 405 });
  }

  // Supabase 로그아웃 처리
  await logoutUser();

  // 세션 삭제하고 로그인 페이지로 리다이렉트
  return logout(request);
}

// GET 요청 시에도 로그아웃 처리
export async function loader({ request }: LoaderArgs) {
  // Supabase 로그아웃 처리
  await logoutUser();

  // 세션 삭제하고 로그인 페이지로 리다이렉트
  return logout(request);
}
