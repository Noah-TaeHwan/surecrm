import { redirect } from 'react-router';

interface LoaderArgs {
  request: Request;
}

export async function loader({ request }: LoaderArgs) {
  // 메인 페이지 접근 시 초대 전용 페이지로 리다이렉트
  throw redirect('/invite-only');
}

export default function Index() {
  return null;
}
