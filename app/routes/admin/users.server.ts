import { db } from '~/lib/core/db.server';
import schema from '~/lib/schema/all';
import { desc, eq, ilike, or, count } from 'drizzle-orm';
import type { LoaderFunctionArgs } from 'react-router';

export async function loader({ request }: LoaderFunctionArgs) {
  console.log('🚀 [Vercel Log] /admin/users loader: 함수 실행 시작');

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const search = url.searchParams.get('search') || '';
  const status = url.searchParams.get('status') || 'all';
  const role = url.searchParams.get('role') || 'all';

  const offset = (page - 1) * limit;

  try {
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
