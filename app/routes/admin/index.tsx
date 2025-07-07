import { useLoaderData } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { db } from '~/lib/core/db.server';
import schema from '~/lib/schema/all';
import { count, desc, eq, gte, and } from 'drizzle-orm';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import {
  Users,
  FileText,
  UserPlus,
  MessageSquare,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/common/components/ui/table';
import { Badge } from '~/common/components/ui/badge';

export async function loader({ request }: LoaderFunctionArgs) {
  console.log('📊 /admin/index loader: 대시보드 통계 데이터 로딩 시작');
  try {
    // 오늘 날짜 계산
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 7일 전 날짜 계산
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      usersResult,
      waitlistResult,
      contactsResult,
      activeSubsResult,
      todayWaitlistResult,
      pendingContactsResult,
      recentWaitlist,
      recentContacts,
    ] = await Promise.all([
      // 전체 사용자 수
      db.select({ value: count() }).from(schema.profiles),

      // 전체 대기자 수
      db.select({ value: count() }).from(schema.waitlist),

      // 전체 문의사항 수
      db.select({ value: count() }).from(schema.contacts),

      // 활성 구독자 수
      db
        .select({ value: count() })
        .from(schema.profiles)
        .where(eq(schema.profiles.subscriptionStatus, 'active')),

      // 오늘 가입한 대기자 수
      db
        .select({ value: count() })
        .from(schema.waitlist)
        .where(gte(schema.waitlist.createdAt, today)),

      // 미처리 문의사항 수
      db
        .select({ value: count() })
        .from(schema.contacts)
        .where(eq(schema.contacts.status, 'pending')),

      // 최근 대기자 5명
      db
        .select()
        .from(schema.waitlist)
        .orderBy(desc(schema.waitlist.createdAt))
        .limit(5),

      // 최근 문의사항 5개
      db
        .select()
        .from(schema.contacts)
        .orderBy(desc(schema.contacts.createdAt))
        .limit(5),
    ]);

    const totalUsers = usersResult[0]?.value ?? 0;
    const totalWaitlist = waitlistResult[0]?.value ?? 0;
    const totalContacts = contactsResult[0]?.value ?? 0;
    const activeSubscriptions = activeSubsResult[0]?.value ?? 0;
    const todayWaitlist = todayWaitlistResult[0]?.value ?? 0;
    const pendingContacts = pendingContactsResult[0]?.value ?? 0;

    console.log('✅ /admin/index loader: 데이터 로딩 완료', {
      totalUsers,
      totalWaitlist,
      totalContacts,
      activeSubscriptions,
      todayWaitlist,
      pendingContacts,
    });

    return {
      stats: {
        totalUsers,
        totalWaitlist,
        totalContacts,
        activeSubscriptions,
        todayWaitlist,
        pendingContacts,
      },
      recentWaitlist,
      recentContacts,
    };
  } catch (error) {
    console.error('❌ /admin/index loader: 데이터 로딩 실패', error);
    return {
      stats: {
        totalUsers: 0,
        totalWaitlist: 0,
        totalContacts: 0,
        activeSubscriptions: 0,
        todayWaitlist: 0,
        pendingContacts: 0,
      },
      recentWaitlist: [],
      recentContacts: [],
      error: '데이터를 불러오지 못했습니다.',
    };
  }
}

export default function AdminDashboardPage() {
  const { stats, recentWaitlist, recentContacts, error } =
    useLoaderData<typeof loader>();

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      'default' | 'secondary' | 'destructive' | 'outline'
    > = {
      pending: 'destructive',
      'in-progress': 'secondary',
      resolved: 'default',
    };
    const labels: Record<string, string> = {
      pending: '대기중',
      'in-progress': '처리중',
      resolved: '완료',
    };
    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          관리자 대시보드
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          SureCRM 서비스의 전체 현황을 한눈에 확인하세요
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="bg-white dark:bg-zinc-900 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              총 회원 수
            </CardTitle>
            <Users className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">
              {stats.totalUsers}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              가입 완료된 사용자
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              대기자 명단
            </CardTitle>
            <UserPlus className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">
              {stats.totalWaitlist}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              오늘 +{stats.todayWaitlist}명
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              문의사항
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">
              {stats.totalContacts}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              미처리 {stats.pendingContacts}건
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              활성 구독
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">
              {stats.activeSubscriptions}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              유료 사용자
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              전환율
            </CardTitle>
            <Activity className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">
              {stats.totalUsers > 0
                ? `${((stats.activeSubscriptions / stats.totalUsers) * 100).toFixed(1)}%`
                : '0%'}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              구독 전환율
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              응답률
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">
              {stats.totalContacts > 0
                ? `${(((stats.totalContacts - stats.pendingContacts) / stats.totalContacts) * 100).toFixed(1)}%`
                : '0%'}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              문의 처리율
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 최근 활동 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 최근 대기자 */}
        <Card className="bg-white dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              최근 대기자 명단
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>회사</TableHead>
                  <TableHead>가입일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentWaitlist.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.name || '-'}
                    </TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.company || '-'}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(item.createdAt.toString())}
                    </TableCell>
                  </TableRow>
                ))}
                {recentWaitlist.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-gray-500"
                    >
                      아직 대기자가 없습니다
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 최근 문의사항 */}
        <Card className="bg-white dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              최근 문의사항
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>제목</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>접수일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentContacts.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {item.subject}
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(item.createdAt.toString())}
                    </TableCell>
                  </TableRow>
                ))}
                {recentContacts.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-gray-500"
                    >
                      아직 문의사항이 없습니다
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
