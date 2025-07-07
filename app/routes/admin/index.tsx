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
  const { totalUsers, totalPosts, error } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-700 mb-6">
        관리자 대시보드
      </h1>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 회원 수</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                전체 가입한 회원 수
              </p>
            </CardContent>
          </Card>
          {/* posts 테이블이 확인될 때까지 주석 처리
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                총 게시물 수
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPosts}</div>
              <p className="text-xs text-muted-foreground">
                작성된 전체 블로그 게시물
              </p>
            </CardContent>
          </Card>
          */}
        </div>
      )}
    </div>
  );
}
