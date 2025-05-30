import { db } from '~/lib/core/db';
import { eq, desc, asc, count, sql, and, or, gte, lte } from 'drizzle-orm';
import { clients, referrals, profiles } from '~/lib/schema';

// 네트워크 노드 인터페이스
export interface NetworkNode {
  id: string;
  name: string;
  type: 'agent' | 'client' | 'referrer';
  level: number;
  referralCount: number;
  contractValue: number;
  importance: 'high' | 'medium' | 'low';
  status: 'active' | 'inactive' | 'prospect';
  avatar?: string;
  position?: { x: number; y: number };
  metadata?: Record<string, any>;
}

// 네트워크 엣지 인터페이스
export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  type: 'referral' | 'direct' | 'indirect';
  strength: number;
  date: string;
  metadata?: Record<string, any>;
}

// 네트워크 통계 인터페이스
export interface NetworkStats {
  totalNodes: number;
  totalEdges: number;
  maxDepth: number;
  avgReferralsPerNode: number;
  topReferrers: Array<{
    id: string;
    name: string;
    referralCount: number;
  }>;
  networkGrowth: Array<{
    month: string;
    newNodes: number;
    newConnections: number;
  }>;
}

/**
 * 사용자의 네트워크 데이터 조회
 */
export async function getNetworkData(agentId: string): Promise<{
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  stats: NetworkStats;
}> {
  try {
    // 에이전트 노드 생성
    const agentProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, agentId))
      .limit(1);

    const agent = agentProfile[0];
    if (!agent) {
      throw new Error('에이전트를 찾을 수 없습니다.');
    }

    const nodes: NetworkNode[] = [
      {
        id: agent.id,
        name: agent.fullName || '에이전트',
        type: 'agent',
        level: 0,
        referralCount: 0,
        contractValue: 0,
        importance: 'high',
        status: 'active',
        position: { x: 0, y: 0 },
      },
    ];

    const edges: NetworkEdge[] = [];

    // 직접 고객들 조회
    const directClients = await db
      .select({
        client: clients,
        referralCount: sql<number>`
          (SELECT COUNT(*) FROM ${referrals} WHERE ${referrals.referrerId} = ${clients.id})
        `,
      })
      .from(clients)
      .where(eq(clients.agentId, agentId));

    // 직접 고객 노드 추가
    for (const { client, referralCount } of directClients) {
      nodes.push({
        id: client.id,
        name: client.fullName,
        type: client.referredById ? 'client' : 'client',
        level: 1,
        referralCount: Number(referralCount),
        contractValue: Number(client.contractAmount || 0),
        importance: client.importance as 'high' | 'medium' | 'low',
        status: client.status === 'active' ? 'active' : 'inactive',
      });

      // 에이전트와 직접 고객 간의 엣지
      edges.push({
        id: `${agentId}-${client.id}`,
        source: agentId,
        target: client.id,
        type: 'direct',
        strength: calculateConnectionStrength(client),
        date: client.createdAt.toISOString().split('T')[0],
      });
    }

    // 추천 관계 조회
    const referralRelations = await db
      .select({
        referral: referrals,
        referrer: {
          id: sql<string>`referrer.id`,
          name: sql<string>`referrer.full_name`,
        },
        referred: {
          id: sql<string>`referred.id`,
          name: sql<string>`referred.full_name`,
        },
      })
      .from(referrals)
      .innerJoin(clients, eq(referrals.referredId, clients.id))
      .leftJoin(
        sql`${clients} as referrer`,
        sql`${referrals.referrerId} = referrer.id`
      )
      .leftJoin(
        sql`${clients} as referred`,
        sql`${referrals.referredId} = referred.id`
      )
      .where(eq(clients.agentId, agentId));

    // 추천 관계 엣지 추가
    for (const relation of referralRelations) {
      const edgeId = `${relation.referral.referrerId}-${relation.referral.referredId}`;

      if (!edges.find((e) => e.id === edgeId)) {
        edges.push({
          id: edgeId,
          source: relation.referral.referrerId,
          target: relation.referral.referredId,
          type: 'referral',
          strength: 0.8,
          date: relation.referral.createdAt.toISOString().split('T')[0],
        });
      }
    }

    // 2차, 3차 추천 관계 조회 (네트워크 확장)
    await expandNetworkDepth(agentId, nodes, edges, 2);

    // 네트워크 통계 계산
    const stats = await calculateNetworkStats(agentId, nodes, edges);

    return { nodes, edges, stats };
  } catch (error) {
    console.error('네트워크 데이터 조회 오류:', error);
    return {
      nodes: [],
      edges: [],
      stats: {
        totalNodes: 0,
        totalEdges: 0,
        maxDepth: 0,
        avgReferralsPerNode: 0,
        topReferrers: [],
        networkGrowth: [],
      },
    };
  }
}

/**
 * 네트워크 깊이 확장
 */
async function expandNetworkDepth(
  agentId: string,
  nodes: NetworkNode[],
  edges: NetworkEdge[],
  maxDepth: number
): Promise<void> {
  for (let depth = 2; depth <= maxDepth; depth++) {
    const currentLevelNodes = nodes.filter((n) => n.level === depth - 1);

    for (const node of currentLevelNodes) {
      if (node.type === 'client') {
        // 이 고객이 추천한 사람들 조회
        const referredClients = await db
          .select()
          .from(clients)
          .innerJoin(referrals, eq(clients.id, referrals.referredId))
          .where(
            and(eq(referrals.referrerId, node.id), eq(clients.agentId, agentId))
          );

        for (const referred of referredClients) {
          const client = referred.clients;

          // 이미 노드에 있는지 확인
          if (!nodes.find((n) => n.id === client.id)) {
            nodes.push({
              id: client.id,
              name: client.fullName,
              type: 'client',
              level: depth,
              referralCount: 0, // 추후 계산
              contractValue: Number(client.contractAmount || 0),
              importance: client.importance as 'high' | 'medium' | 'low',
              status: client.status === 'active' ? 'active' : 'inactive',
            });

            // 추천 엣지 추가
            edges.push({
              id: `${node.id}-${client.id}`,
              source: node.id,
              target: client.id,
              type: 'referral',
              strength: 0.6 / depth, // 깊이에 따라 강도 감소
              date: client.createdAt.toISOString().split('T')[0],
            });
          }
        }
      }
    }
  }
}

/**
 * 연결 강도 계산
 */
function calculateConnectionStrength(client: any): number {
  let strength = 0.5; // 기본 강도

  // 계약 금액에 따른 가중치
  if (client.contractAmount) {
    strength += Math.min(0.3, Number(client.contractAmount) / 1000000);
  }

  // 중요도에 따른 가중치
  switch (client.importance) {
    case 'high':
      strength += 0.2;
      break;
    case 'medium':
      strength += 0.1;
      break;
  }

  // 상태에 따른 가중치
  if (client.status === 'active') {
    strength += 0.1;
  }

  return Math.min(1.0, strength);
}

/**
 * 네트워크 통계 계산
 */
async function calculateNetworkStats(
  agentId: string,
  nodes: NetworkNode[],
  edges: NetworkEdge[]
): Promise<NetworkStats> {
  try {
    // 상위 추천자들
    const topReferrers = await db
      .select({
        id: clients.id,
        name: clients.fullName,
        referralCount: count(referrals.id),
      })
      .from(clients)
      .leftJoin(referrals, eq(clients.id, referrals.referrerId))
      .where(eq(clients.agentId, agentId))
      .groupBy(clients.id, clients.fullName)
      .orderBy(desc(count(referrals.id)))
      .limit(5);

    // 월별 성장 데이터 (최근 6개월)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyGrowth = await db
      .select({
        month: sql<string>`TO_CHAR(${clients.createdAt}, 'YYYY-MM')`,
        newNodes: count(clients.id),
      })
      .from(clients)
      .where(
        and(eq(clients.agentId, agentId), gte(clients.createdAt, sixMonthsAgo))
      )
      .groupBy(sql`TO_CHAR(${clients.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${clients.createdAt}, 'YYYY-MM')`);

    const maxDepth = Math.max(...nodes.map((n) => n.level), 0);
    const totalReferrals = nodes.reduce((sum, n) => sum + n.referralCount, 0);
    const avgReferralsPerNode =
      nodes.length > 0 ? totalReferrals / nodes.length : 0;

    return {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      maxDepth,
      avgReferralsPerNode: Math.round(avgReferralsPerNode * 10) / 10,
      topReferrers: topReferrers.map((r) => ({
        id: r.id,
        name: r.name,
        referralCount: r.referralCount,
      })),
      networkGrowth: monthlyGrowth.map((g) => ({
        month: g.month,
        newNodes: g.newNodes,
        newConnections: 0, // 추후 계산
      })),
    };
  } catch (error) {
    console.error('네트워크 통계 계산 오류:', error);
    return {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      maxDepth: 0,
      avgReferralsPerNode: 0,
      topReferrers: [],
      networkGrowth: [],
    };
  }
}

/**
 * 특정 노드의 상세 정보 조회
 */
export async function getNodeDetails(
  nodeId: string,
  agentId: string
): Promise<any> {
  try {
    const client = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, nodeId), eq(clients.agentId, agentId)))
      .limit(1);

    if (!client[0]) {
      return null;
    }

    // 추천 관계 조회
    const clientReferrals = await db
      .select({
        referral: referrals,
        referred: clients,
      })
      .from(referrals)
      .innerJoin(clients, eq(referrals.referredId, clients.id))
      .where(eq(referrals.referrerId, nodeId));

    return {
      ...client[0],
      referrals: clientReferrals.map((r: any) => r.referred),
    };
  } catch (error) {
    console.error('노드 상세 정보 조회 오류:', error);
    return null;
  }
}

/**
 * 네트워크 검색
 */
export async function searchNetwork(
  agentId: string,
  query: string
): Promise<NetworkNode[]> {
  try {
    const searchResults = await db
      .select()
      .from(clients)
      .where(
        and(
          eq(clients.agentId, agentId),
          or(
            sql`${clients.fullName} ILIKE ${`%${query}%`}`,
            sql`${clients.phone} ILIKE ${`%${query}%`}`,
            sql`${clients.email} ILIKE ${`%${query}%`}`
          )
        )
      )
      .limit(10);

    return searchResults.map((client) => ({
      id: client.id,
      name: client.fullName,
      type: 'client' as const,
      level: 1,
      referralCount: 0,
      contractValue: Number(client.contractAmount || 0),
      importance: client.importance as 'high' | 'medium' | 'low',
      status: client.status === 'active' ? 'active' : 'inactive',
    }));
  } catch (error) {
    console.error('네트워크 검색 오류:', error);
    return [];
  }
}
