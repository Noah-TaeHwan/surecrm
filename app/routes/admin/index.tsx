import { useLoaderData } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { db } from '~/lib/core/db.server';
import schema from '~/lib/schema/all';
import { count } from 'drizzle-orm';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Users, FileText } from 'lucide-react';

export async function loader({ request }: LoaderFunctionArgs) {
  console.log('📊 /admin/index loader: 대시보드 통계 데이터 로딩 시작');
  try {
    const [usersResult] = await Promise.all([
      db.select({ value: count() }).from(schema.profiles),
      // db.select({ value: count() }).from(schema.posts), // posts 테이블 제거
    ]);

    const totalUsers = usersResult[0]?.value ?? 0;
    // const totalPosts = postsResult[0]?.value ?? 0; // posts 테이블 제거

    console.log('✅ /admin/index loader: 데이터 로딩 완료', {
      totalUsers,
      // totalPosts,
    });
    return { totalUsers, totalPosts: 0 }; // totalPosts는 임시로 0으로 반환
  } catch (error) {
    console.error('❌ /admin/index loader: 데이터 로딩 실패', error);
    return {
      totalUsers: 0,
      totalPosts: 0,
      error: '데이터를 불러오지 못했습니다.',
    };
  }
}

export default function AdminDashboardPage() {
  const { totalUsers, error } = useLoaderData<typeof loader>();

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        관리자 대시보드
      </h1>
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Card className="bg-white dark:bg-zinc-900 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              총 회원 수
            </CardTitle>
            <Users className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-900 dark:text-white">
              {totalUsers}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              시스템에 등록된 전체 사용자
            </p>
          </CardContent>
        </Card>
        {/* '총 게시물 수' 카드는 나중에 추가 예정 */}
      </div>
    </div>
  );
}
