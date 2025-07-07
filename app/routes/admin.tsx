import { Outlet } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { redirect } from 'react-router';
import { requireAdmin } from '../lib/auth/guards.server';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    console.log('🔑 /admin loader: 어드민 권한 확인 시작');
    const { user } = await requireAdmin(request);
    console.log('✅ /admin loader: 어드민 권한 확인 완료', { userId: user.id });
    return { user };
  } catch (error) {
    console.error('🚫 /admin loader: 어드민 권한 확인 실패', error);
    // requireAdmin에서 던진 Response를 그대로 반환합니다.
    // 보통 로그인 페이지로의 리디렉션입니다.
    throw error;
  }
}

// 여기서부터 실제 레이아웃 컴포넌트를 만듭니다.
// 예: import Header from '~/common/components/Header';
// 예: import AdminSidebar from '~/features/admin/components/AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* <AdminSidebar /> */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* <Header /> */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 dark:bg-gray-800">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
