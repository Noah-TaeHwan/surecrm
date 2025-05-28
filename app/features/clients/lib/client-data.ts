import { db } from '~/lib/db';
import { eq, desc, asc, like, and, or, count, sql } from 'drizzle-orm';
import {
  clients,
  clientDetails,
  clientTags,
  clientTagAssignments,
} from '../schema';
import { profiles, teams } from '~/lib/db-schema';

// 현재 인증된 사용자 정보 가져오기
export async function getCurrentAgent(userId: string) {
  try {
    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    return profile[0] || null;
  } catch (error) {
    console.error('getCurrentAgent 오류:', error);
    return null;
  }
}

// 에이전트의 팀 정보 가져오기
export async function getAgentTeam(agentId: string) {
  try {
    const profile = await db
      .select({
        teamId: profiles.teamId,
        team: teams,
      })
      .from(profiles)
      .leftJoin(teams, eq(profiles.teamId, teams.id))
      .where(eq(profiles.id, agentId))
      .limit(1);

    return profile[0] || null;
  } catch (error) {
    console.error('getAgentTeam 오류:', error);
    return null;
  }
}

// 고객 목록 조회 (필터링, 정렬, 페이징 지원)
export async function getClients(params: {
  agentId: string;
  page?: number;
  pageSize?: number;
  search?: string;
  stage?: string;
  importance?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  try {
    const {
      agentId,
      page = 1,
      pageSize = 10,
      search,
      stage,
      importance,
      sortBy = 'name',
      sortOrder = 'asc',
    } = params;

    // 기본 쿼리 조건
    const conditions = [eq(clients.agentId, agentId)];

    // 검색 조건 추가
    if (search) {
      conditions.push(
        or(
          like(clients.name, `%${search}%`),
          like(clients.phone, `%${search}%`),
          like(clients.email, `%${search}%`),
          like(clients.company, `%${search}%`)
        )!
      );
    }

    // 단계 필터
    if (stage && stage !== 'all') {
      conditions.push(eq(clients.stage, stage));
    }

    // 중요도 필터
    if (importance && importance !== 'all') {
      conditions.push(eq(clients.importance, importance));
    }

    // 정렬 조건
    const validSortFields = [
      'name',
      'createdAt',
      'updatedAt',
      'contractAmount',
      'stage',
      'importance',
    ] as const;
    const sortField = validSortFields.includes(sortBy as any)
      ? (sortBy as keyof typeof clients)
      : 'name';

    const orderBy =
      sortOrder === 'desc' ? desc(clients[sortField]) : asc(clients[sortField]);

    // 총 개수 조회
    const totalCountResult = await db
      .select({ count: count() })
      .from(clients)
      .where(and(...conditions));

    const totalCount = totalCountResult[0]?.count || 0;

    // 고객 목록 조회
    const clientList = await db
      .select({
        id: clients.id,
        name: clients.name,
        email: clients.email,
        phone: clients.phone,
        company: clients.company,
        position: clients.position,
        stage: clients.stage,
        importance: clients.importance,
        contractAmount: clients.contractAmount,
        lastContactDate: clients.lastContactDate,
        nextMeetingDate: clients.nextMeetingDate,
        referredBy: clients.referredBy,
        referralCount: clients.referralCount,
        referralDepth: clients.referralDepth,
        status: clients.status,
        createdAt: clients.createdAt,
        updatedAt: clients.updatedAt,
      })
      .from(clients)
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    // 각 고객의 태그 정보 조회
    const clientsWithTags = await Promise.all(
      clientList.map(async (client) => {
        const tags = await getClientTags(client.id);
        return {
          ...client,
          tags: tags.map((tag) => tag.name),
          insuranceTypes: [], // TODO: 보험 정보 연결 시 추가
        };
      })
    );

    return {
      clients: clientsWithTags,
      totalCount,
      pageSize,
      currentPage: page,
    };
  } catch (error) {
    console.error('getClients 오류:', error);
    return {
      clients: [],
      totalCount: 0,
      pageSize: params.pageSize || 10,
      currentPage: params.page || 1,
    };
  }
}

// 특정 고객 상세 정보 조회
export async function getClientById(clientId: string, agentId: string) {
  try {
    const client = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, clientId), eq(clients.agentId, agentId)))
      .limit(1);

    if (!client[0]) {
      return null;
    }

    // 고객 상세 정보 조회
    const clientDetail = await db
      .select()
      .from(clientDetails)
      .where(eq(clientDetails.clientId, clientId))
      .limit(1);

    // 고객 태그 조회
    const tags = await getClientTags(clientId);

    return {
      ...client[0],
      detail: clientDetail[0] || null,
      tags: tags.map((tag) => tag.name),
    };
  } catch (error) {
    console.error('getClientById 오류:', error);
    return null;
  }
}

// 고객 태그 조회
export async function getClientTags(clientId: string) {
  try {
    const tags = await db
      .select({
        id: clientTags.id,
        name: clientTags.name,
        color: clientTags.color,
      })
      .from(clientTags)
      .innerJoin(
        clientTagAssignments,
        eq(clientTags.id, clientTagAssignments.tagId)
      )
      .where(eq(clientTagAssignments.clientId, clientId));

    return tags;
  } catch (error) {
    console.error('getClientTags 오류:', error);
    return [];
  }
}

// 고객 통계 조회
export async function getClientStats(agentId: string) {
  try {
    // 총 소개 건수
    const totalReferralsResult = await db
      .select({ count: count() })
      .from(clients)
      .where(
        and(
          eq(clients.agentId, agentId),
          sql`${clients.referredBy} IS NOT NULL`
        )
      );

    const totalReferrals = totalReferralsResult[0]?.count || 0;

    // 평균 소개 깊이
    const avgDepthResult = await db
      .select({
        avgDepth: sql<number>`AVG(${clients.referralDepth})`,
      })
      .from(clients)
      .where(eq(clients.agentId, agentId));

    const averageDepth = Number(avgDepthResult[0]?.avgDepth || 0);

    // 상위 소개자들 (더미 데이터 - 실제로는 복잡한 쿼리 필요)
    const topReferrers = [
      { name: '김영희', count: 3 },
      { name: '이철수', count: 2 },
      { name: '박지민', count: 1 },
    ];

    return {
      totalReferrals,
      averageDepth: Math.round(averageDepth * 10) / 10,
      topReferrers,
    };
  } catch (error) {
    console.error('getClientStats 오류:', error);
    return {
      totalReferrals: 0,
      averageDepth: 0,
      topReferrers: [],
    };
  }
}

// 새 고객 생성
export async function createClient(data: {
  agentId: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  position?: string;
  address?: string;
  stage?: string;
  importance?: string;
  referredBy?: string;
  tags?: string[];
  notes?: string;
  contractAmount?: number;
}) {
  try {
    const newClient = await db
      .insert(clients)
      .values({
        agentId: data.agentId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        company: data.company,
        position: data.position,
        address: data.address,
        stage: data.stage || '첫 상담',
        importance: data.importance || 'medium',
        referredBy: data.referredBy,
        notes: data.notes,
        contractAmount: data.contractAmount || 0,
        status: 'active',
        referralCount: 0,
        referralDepth: 0,
      })
      .returning();

    const clientId = newClient[0].id;

    // 태그 추가
    if (data.tags && data.tags.length > 0) {
      await addClientTags(clientId, data.tags, data.agentId);
    }

    return newClient[0];
  } catch (error) {
    console.error('createClient 오류:', error);
    throw error;
  }
}

// 고객 정보 업데이트
export async function updateClient(
  clientId: string,
  agentId: string,
  data: Partial<{
    name: string;
    phone: string;
    email: string;
    company: string;
    position: string;
    address: string;
    stage: string;
    importance: string;
    notes: string;
    contractAmount: number;
  }>
) {
  try {
    const updatedClient = await db
      .update(clients)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(clients.id, clientId), eq(clients.agentId, agentId)))
      .returning();

    return updatedClient[0];
  } catch (error) {
    console.error('updateClient 오류:', error);
    throw error;
  }
}

// 고객 태그 추가
export async function addClientTags(
  clientId: string,
  tagNames: string[],
  agentId: string
) {
  try {
    for (const tagName of tagNames) {
      // 태그가 존재하는지 확인 (같은 에이전트의 태그만)
      let tag = await db
        .select()
        .from(clientTags)
        .where(
          and(eq(clientTags.name, tagName), eq(clientTags.agentId, agentId))
        )
        .limit(1);

      // 태그가 없으면 생성
      if (!tag[0]) {
        const newTag = await db
          .insert(clientTags)
          .values({
            name: tagName,
            color: '#3b82f6', // 기본 파란색
            agentId: agentId,
          })
          .returning();
        tag = newTag;
      }

      // 태그 할당 (중복 체크)
      const existingAssignment = await db
        .select()
        .from(clientTagAssignments)
        .where(
          and(
            eq(clientTagAssignments.clientId, clientId),
            eq(clientTagAssignments.tagId, tag[0].id)
          )
        )
        .limit(1);

      if (!existingAssignment[0]) {
        await db.insert(clientTagAssignments).values({
          clientId,
          tagId: tag[0].id,
        });
      }
    }
  } catch (error) {
    console.error('addClientTags 오류:', error);
    throw error;
  }
}

// 고객 삭제
export async function deleteClient(clientId: string, agentId: string) {
  try {
    // 태그 할당 먼저 삭제
    await db
      .delete(clientTagAssignments)
      .where(eq(clientTagAssignments.clientId, clientId));

    // 고객 상세 정보 삭제
    await db.delete(clientDetails).where(eq(clientDetails.clientId, clientId));

    // 고객 삭제
    const deletedClient = await db
      .delete(clients)
      .where(and(eq(clients.id, clientId), eq(clients.agentId, agentId)))
      .returning();

    return deletedClient[0];
  } catch (error) {
    console.error('deleteClient 오류:', error);
    throw error;
  }
}
