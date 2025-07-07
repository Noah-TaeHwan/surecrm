import { useLoaderData } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { db } from '~/lib/core/db.server';
import schema from '~/lib/schema/all';
import { desc, eq, ilike, or, count } from 'drizzle-orm';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/common/components/ui/table';
import { Badge } from '~/common/components/ui/badge';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/common/components/ui/dropdown-menu';
import {
  Users,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  User,
  Crown,
  Clock,
  AlertTriangle,
  Ban,
  Check,
  Shield,
} from 'lucide-react';
import { useState } from 'react';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const search = url.searchParams.get('search') || '';
  const status = url.searchParams.get('status') || 'all';
  const role = url.searchParams.get('role') || 'all';

  const offset = (page - 1) * limit;

  try {
    // 검색 조건 구성
    const searchConditions = search
      ? or(
          ilike(schema.profiles.fullName, `%${search}%`),
          ilike(schema.profiles.company, `%${search}%`),
          ilike(schema.authUsers.email, `%${search}%`)
        )
      : undefined;

    const statusCondition =
      status !== 'all'
        ? eq(schema.profiles.subscriptionStatus, status as any)
        : undefined;

    const roleCondition =
      role !== 'all' ? eq(schema.profiles.role, role as any) : undefined;

    const conditions = [
      searchConditions,
      statusCondition,
      roleCondition,
    ].filter(Boolean);

    // 사용자 목록 조회
    const usersQuery = db
      .select({
        id: schema.profiles.id,
        fullName: schema.profiles.fullName,
        email: schema.authUsers.email,
        phone: schema.profiles.phone,
        company: schema.profiles.company,
        role: schema.profiles.role,
        subscriptionStatus: schema.profiles.subscriptionStatus,
        trialEndsAt: schema.profiles.trialEndsAt,
        subscriptionEndsAt: schema.profiles.subscriptionEndsAt,
        isActive: schema.profiles.isActive,
        createdAt: schema.profiles.createdAt,
        lastLoginAt: schema.profiles.lastLoginAt,
        lemonSqueezySubscriptionId: schema.profiles.lemonSqueezySubscriptionId,
        profileImageUrl: schema.profiles.profileImageUrl,
      })
      .from(schema.profiles)
      .leftJoin(schema.authUsers, eq(schema.profiles.id, schema.authUsers.id))
      .orderBy(desc(schema.profiles.createdAt))
      .limit(limit)
      .offset(offset);

    // 전체 카운트 조회
    const totalCountQuery = db
      .select({ count: count() })
      .from(schema.profiles)
      .leftJoin(schema.authUsers, eq(schema.profiles.id, schema.authUsers.id));

    if (conditions.length > 0) {
      // @ts-ignore
      usersQuery.where(...conditions);
      // @ts-ignore
      totalCountQuery.where(...conditions);
    }

    const [users, totalCountResult] = await Promise.all([
      usersQuery,
      totalCountQuery,
    ]);

    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // 구독 상태별 통계
    const statsResults = await Promise.all([
      db.select({ count: count() }).from(schema.profiles),
      db
        .select({ count: count() })
        .from(schema.profiles)
        .where(eq(schema.profiles.subscriptionStatus, 'active')),
      db
        .select({ count: count() })
        .from(schema.profiles)
        .where(eq(schema.profiles.subscriptionStatus, 'trial')),
      db
        .select({ count: count() })
        .from(schema.profiles)
        .where(eq(schema.profiles.subscriptionStatus, 'cancelled')),
      db
        .select({ count: count() })
        .from(schema.profiles)
        .where(eq(schema.profiles.isActive, false)),
    ]);

    const stats = {
      total: statsResults[0][0]?.count || 0,
      active: statsResults[1][0]?.count || 0,
      trial: statsResults[2][0]?.count || 0,
      cancelled: statsResults[3][0]?.count || 0,
      inactive: statsResults[4][0]?.count || 0,
    };

    const usersWithISOStrings = users.map(user => ({
      ...user,
      trialEndsAt: user.trialEndsAt
        ? new Date(user.trialEndsAt).toISOString()
        : null,
      subscriptionEndsAt: user.subscriptionEndsAt
        ? new Date(user.subscriptionEndsAt).toISOString()
        : null,
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
      lastLoginAt: user.lastLoginAt
        ? new Date(user.lastLoginAt).toISOString()
        : null,
    }));

    return {
      users: usersWithISOStrings,
      totalCount,
      totalPages,
      currentPage: page,
      stats,
      search,
      status,
      role,
    };
  } catch (error) {
    console.error('❌ 회원 관리 데이터 로딩 실패:', error);
    return {
      users: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      stats: { total: 0, active: 0, trial: 0, cancelled: 0, inactive: 0 },
      search: '',
      status: 'all',
      role: 'all',
      error: '데이터를 불러오지 못했습니다.',
    };
  }
}

export default function AdminUsersPage() {
  const {
    users,
    totalCount,
    totalPages,
    currentPage,
    stats,
    search,
    status,
    role,
    error,
  } = useLoaderData<typeof loader>();
  const [searchTerm, setSearchTerm] = useState(search);

  const formatDate = (date: string | Date | null): string => {
    if (!date) return '-';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  };

  const formatDateOnly = (date: string | Date | null): string => {
    if (!date) return '-';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(dateObj);
  };

  const getSubscriptionBadge = (
    status: string,
    trialEndsAt?: string | Date | null,
    subscriptionEndsAt?: string | Date | null
  ) => {
    const now = new Date();
    const trialEnd = trialEndsAt ? new Date(trialEndsAt) : null;
    const subscriptionEnd = subscriptionEndsAt
      ? new Date(subscriptionEndsAt)
      : null;

    switch (status) {
      case 'active': {
        const isExpiringSoon =
          subscriptionEnd &&
          subscriptionEnd.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000;
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          >
            <Crown className="h-3 w-3 mr-1" />
            유료 {isExpiringSoon && '(곧 만료)'}
          </Badge>
        );
      }
      case 'trial': {
        const isTrialExpiringSoon =
          trialEnd &&
          trialEnd.getTime() - now.getTime() < 3 * 24 * 60 * 60 * 1000;
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
          >
            <Clock className="h-3 w-3 mr-1" />
            무료체험 {isTrialExpiringSoon && '(곧 만료)'}
          </Badge>
        );
      }
      case 'past_due':
        return (
          <Badge
            variant="destructive"
            className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            결제연체
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="text-gray-600 dark:text-gray-400">
            <Ban className="h-3 w-3 mr-1" />
            취소됨
          </Badge>
        );
      case 'expired':
        return (
          <Badge
            variant="destructive"
            className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          >
            <Ban className="h-3 w-3 mr-1" />
            만료됨
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'system_admin': {
        const systemAdminIcon = <Shield className="h-3 w-3" />;
        const systemAdminColor =
          'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
        return (
          <Badge variant="secondary" className={systemAdminColor}>
            {systemAdminIcon}
            <span className="ml-1">시스템 어드민</span>
          </Badge>
        );
      }
      case 'team_admin': {
        const teamAdminIcon = <Crown className="h-3 w-3" />;
        const teamAdminColor =
          'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
        return (
          <Badge variant="secondary" className={teamAdminColor}>
            {teamAdminIcon}
            <span className="ml-1">팀 어드민</span>
          </Badge>
        );
      }
      case 'agent':
        return (
          <Badge variant="outline" className="text-gray-600 dark:text-gray-400">
            에이전트
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <Check className="h-4 w-4 text-green-500" />
    ) : (
      <Ban className="h-4 w-4 text-red-500" />
    );
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            회원 관리
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            총 {totalCount}명의 회원 관리
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            내보내기
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              전체 회원
            </CardTitle>
            <Users className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">
              {stats.total}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              유료 회원
            </CardTitle>
            <Crown className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.active}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              무료체험
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.trial}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              취소된 구독
            </CardTitle>
            <Ban className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {stats.cancelled}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              비활성화
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.inactive}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 검색 */}
      <Card className="bg-white dark:bg-zinc-900">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-1 items-center space-x-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="이름, 이메일, 회사명으로 검색..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <form method="GET" className="flex space-x-2">
                <input type="hidden" name="search" value={searchTerm} />
                <Select name="status" defaultValue={status}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="구독 상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 상태</SelectItem>
                    <SelectItem value="active">유료 회원</SelectItem>
                    <SelectItem value="trial">무료체험</SelectItem>
                    <SelectItem value="past_due">결제연체</SelectItem>
                    <SelectItem value="cancelled">취소됨</SelectItem>
                    <SelectItem value="expired">만료됨</SelectItem>
                  </SelectContent>
                </Select>
                <Select name="role" defaultValue={role}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="역할" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 역할</SelectItem>
                    <SelectItem value="agent">에이전트</SelectItem>
                    <SelectItem value="team_admin">팀 관리자</SelectItem>
                    <SelectItem value="system_admin">시스템 관리자</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  필터 적용
                </Button>
              </form>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border border-gray-200 dark:border-zinc-700">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-zinc-800/50">
                  <TableHead className="w-12">상태</TableHead>
                  <TableHead>회원 정보</TableHead>
                  <TableHead>연락처</TableHead>
                  <TableHead>역할</TableHead>
                  <TableHead>구독 상태</TableHead>
                  <TableHead>구독 종료일</TableHead>
                  <TableHead>가입일</TableHead>
                  <TableHead>최근 로그인</TableHead>
                  <TableHead className="w-12">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-zinc-800/30"
                  >
                    <TableCell>{getStatusIcon(user.isActive)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {user.profileImageUrl ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.profileImageUrl}
                              alt=""
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-zinc-600 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-500 dark:text-zinc-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.fullName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.company || '회사 정보 없음'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="text-gray-900 dark:text-white">
                          {user.email}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {user.phone || '전화번호 없음'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {getSubscriptionBadge(
                        user.subscriptionStatus,
                        user.trialEndsAt,
                        user.subscriptionEndsAt
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                      {user.subscriptionStatus === 'trial'
                        ? formatDate(user.trialEndsAt)
                        : formatDate(user.subscriptionEndsAt)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(user.lastLoginAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>작업</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>상세 보기</DropdownMenuItem>
                          <DropdownMenuItem>구독 관리</DropdownMenuItem>
                          <DropdownMenuItem>로그인 기록</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            계정 비활성화
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <Users className="h-12 w-12 text-gray-400" />
                        <p className="text-gray-500 dark:text-gray-400">
                          검색 조건에 맞는 회원이 없습니다.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {totalCount}명 중 {(currentPage - 1) * 20 + 1}-
            {Math.min(currentPage * 20, totalCount)}명 표시
          </p>
          <div className="flex space-x-2">
            {currentPage > 1 && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`?page=${currentPage - 1}&search=${search}&status=${status}&role=${role}`}
                >
                  이전
                </a>
              </Button>
            )}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, currentPage - 2) + i;
              if (pageNum > totalPages) return null;
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? 'default' : 'outline'}
                  size="sm"
                  asChild
                >
                  <a
                    href={`?page=${pageNum}&search=${search}&status=${status}&role=${role}`}
                  >
                    {pageNum}
                  </a>
                </Button>
              );
            })}
            {currentPage < totalPages && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`?page=${currentPage + 1}&search=${search}&status=${status}&role=${role}`}
                >
                  다음
                </a>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
