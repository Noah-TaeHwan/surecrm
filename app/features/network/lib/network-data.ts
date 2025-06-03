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

// 고급 네트워크 분석을 위한 인터페이스 추가
export interface NetworkMetrics {
  nodeCentrality: Map<string, number>;
  clusteringCoefficient: number;
  networkDensity: number;
  averagePathLength: number;
  influenceHubs: NetworkNode[];
  isolatedNodes: NetworkNode[];
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

    // 직접 고객들 조회 (🔥 활성 고객만)
    const directClients = await db
      .select({
        client: clients,
        referralCount: sql<number>`
          (SELECT COUNT(*) FROM ${referrals} WHERE ${referrals.referrerId} = ${clients.id})
        `,
      })
      .from(clients)
      .where(
        and(
          eq(clients.agentId, agentId),
          eq(clients.isActive, true) // 🔥 추가: 활성 고객만
        )
      );

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

    // 추천 관계 조회 (🔥 활성 고객만)
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
      .where(
        and(
          eq(clients.agentId, agentId),
          eq(clients.isActive, true) // 🔥 추가: 활성 고객만
        )
      );

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
        // 이 고객이 추천한 사람들 조회 (🔥 활성 고객만)
        const referredClients = await db
          .select()
          .from(clients)
          .innerJoin(referrals, eq(clients.id, referrals.referredId))
          .where(
            and(
              eq(referrals.referrerId, node.id),
              eq(clients.agentId, agentId),
              eq(clients.isActive, true) // 🔥 추가: 활성 고객만
            )
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
    // 상위 추천자들 (🔥 활성 고객만)
    const topReferrers = await db
      .select({
        id: clients.id,
        name: clients.fullName,
        referralCount: count(referrals.id),
      })
      .from(clients)
      .leftJoin(referrals, eq(clients.id, referrals.referrerId))
      .where(
        and(
          eq(clients.agentId, agentId),
          eq(clients.isActive, true) // 🔥 추가: 활성 고객만
        )
      )
      .groupBy(clients.id, clients.fullName)
      .orderBy(desc(count(referrals.id)))
      .limit(5);

    // 월별 성장 데이터 (최근 6개월) (🔥 활성 고객만)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyGrowth = await db
      .select({
        month: sql<string>`TO_CHAR(${clients.createdAt}, 'YYYY-MM')`,
        newNodes: count(clients.id),
      })
      .from(clients)
      .where(
        and(
          eq(clients.agentId, agentId),
          eq(clients.isActive, true), // 🔥 추가: 활성 고객만
          gte(clients.createdAt, sixMonthsAgo)
        )
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
      .where(
        and(
          eq(clients.id, nodeId),
          eq(clients.agentId, agentId),
          eq(clients.isActive, true) // 🔥 추가: 활성 고객만
        )
      )
      .limit(1);

    if (!client[0]) {
      return null;
    }

    // 추천 관계 조회 (🔥 활성 고객만)
    const clientReferrals = await db
      .select({
        referral: referrals,
        referred: clients,
      })
      .from(referrals)
      .innerJoin(clients, eq(referrals.referredId, clients.id))
      .where(
        and(
          eq(referrals.referrerId, nodeId),
          eq(clients.isActive, true) // 🔥 추가: 활성 고객만
        )
      );

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
          eq(clients.isActive, true), // 🔥 추가: 활성 고객만
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

/**
 * 고급 네트워크 메트릭 계산 (옵시디언 스타일 분석)
 */
export function calculateNetworkMetrics(
  nodes: NetworkNode[],
  edges: NetworkEdge[]
): NetworkMetrics {
  // 인접 리스트 생성
  const adjacencyList = new Map<string, Set<string>>();
  nodes.forEach((node) => {
    adjacencyList.set(node.id, new Set());
  });

  edges.forEach((edge) => {
    adjacencyList.get(edge.source)?.add(edge.target);
    adjacencyList.get(edge.target)?.add(edge.source);
  });

  // 노드 중심성 계산 (연결 중심성)
  const nodeCentrality = new Map<string, number>();
  nodes.forEach((node) => {
    const connections = adjacencyList.get(node.id)?.size || 0;
    const maxPossibleConnections = nodes.length - 1;
    const centrality =
      maxPossibleConnections > 0 ? connections / maxPossibleConnections : 0;
    nodeCentrality.set(node.id, centrality);
  });

  // 클러스터링 계수 계산
  let totalClusteringCoefficient = 0;
  let nodeCount = 0;

  nodes.forEach((node) => {
    const neighbors = adjacencyList.get(node.id);
    if (!neighbors || neighbors.size < 2) return;

    const neighborsArray = Array.from(neighbors);
    let edgesAmongNeighbors = 0;

    for (let i = 0; i < neighborsArray.length; i++) {
      for (let j = i + 1; j < neighborsArray.length; j++) {
        if (adjacencyList.get(neighborsArray[i])?.has(neighborsArray[j])) {
          edgesAmongNeighbors++;
        }
      }
    }

    const maxPossibleEdges = (neighbors.size * (neighbors.size - 1)) / 2;
    const clusteringCoeff =
      maxPossibleEdges > 0 ? edgesAmongNeighbors / maxPossibleEdges : 0;
    totalClusteringCoefficient += clusteringCoeff;
    nodeCount++;
  });

  const clusteringCoefficient =
    nodeCount > 0 ? totalClusteringCoefficient / nodeCount : 0;

  // 네트워크 밀도 계산
  const maxPossibleEdges = (nodes.length * (nodes.length - 1)) / 2;
  const networkDensity =
    maxPossibleEdges > 0 ? edges.length / maxPossibleEdges : 0;

  // 평균 경로 길이 계산 (BFS 사용)
  let totalPathLength = 0;
  let pathCount = 0;

  nodes.forEach((startNode) => {
    const distances = new Map<string, number>();
    const queue = [{ nodeId: startNode.id, distance: 0 }];
    distances.set(startNode.id, 0);

    while (queue.length > 0) {
      const { nodeId, distance } = queue.shift()!;
      const neighbors = adjacencyList.get(nodeId);

      neighbors?.forEach((neighborId) => {
        if (!distances.has(neighborId)) {
          distances.set(neighborId, distance + 1);
          queue.push({ nodeId: neighborId, distance: distance + 1 });
          totalPathLength += distance + 1;
          pathCount++;
        }
      });
    }
  });

  const averagePathLength = pathCount > 0 ? totalPathLength / pathCount : 0;

  // 영향력 허브 식별 (높은 중심성 + 높은 중요도)
  const influenceHubs = nodes
    .filter((node) => {
      const centrality = nodeCentrality.get(node.id) || 0;
      return centrality > 0.3 && node.importance === 'high';
    })
    .sort((a, b) => {
      const centralityA = nodeCentrality.get(a.id) || 0;
      const centralityB = nodeCentrality.get(b.id) || 0;
      return centralityB - centralityA;
    })
    .slice(0, 5);

  // 고립된 노드 식별
  const isolatedNodes = nodes.filter((node) => {
    const connections = adjacencyList.get(node.id)?.size || 0;
    return connections === 0;
  });

  return {
    nodeCentrality,
    clusteringCoefficient,
    networkDensity,
    averagePathLength,
    influenceHubs,
    isolatedNodes,
  };
}

/**
 * 실시간 네트워크 변화 감지
 */
export function detectNetworkChanges(
  oldNodes: NetworkNode[],
  newNodes: NetworkNode[],
  oldEdges: NetworkEdge[],
  newEdges: NetworkEdge[]
): {
  addedNodes: NetworkNode[];
  removedNodes: NetworkNode[];
  addedEdges: NetworkEdge[];
  removedEdges: NetworkEdge[];
  modifiedNodes: NetworkNode[];
} {
  const oldNodeIds = new Set(oldNodes.map((n) => n.id));
  const newNodeIds = new Set(newNodes.map((n) => n.id));
  const oldEdgeIds = new Set(oldEdges.map((e) => e.id));
  const newEdgeIds = new Set(newEdges.map((e) => e.id));

  const addedNodes = newNodes.filter((n) => !oldNodeIds.has(n.id));
  const removedNodes = oldNodes.filter((n) => !newNodeIds.has(n.id));
  const addedEdges = newEdges.filter((e) => !oldEdgeIds.has(e.id));
  const removedEdges = oldEdges.filter((e) => !newEdgeIds.has(e.id));

  // 수정된 노드 감지 (속성 변화)
  const modifiedNodes: NetworkNode[] = [];
  newNodes.forEach((newNode) => {
    const oldNode = oldNodes.find((n) => n.id === newNode.id);
    if (oldNode) {
      if (
        oldNode.importance !== newNode.importance ||
        oldNode.status !== newNode.status ||
        oldNode.contractValue !== newNode.contractValue ||
        oldNode.referralCount !== newNode.referralCount
      ) {
        modifiedNodes.push(newNode);
      }
    }
  });

  return {
    addedNodes,
    removedNodes,
    addedEdges,
    removedEdges,
    modifiedNodes,
  };
}

/**
 * 네트워크 추천 알고리즘 (옵시디언 스타일)
 */
export function generateNetworkRecommendations(
  nodes: NetworkNode[],
  edges: NetworkEdge[],
  targetNodeId: string
): Array<{
  type: 'introduction' | 'follow_up' | 'cluster_expansion';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  targetNodeIds: string[];
  potentialValue: number;
}> {
  const recommendations: Array<{
    type: 'introduction' | 'follow_up' | 'cluster_expansion';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    targetNodeIds: string[];
    potentialValue: number;
  }> = [];

  const targetNode = nodes.find((n) => n.id === targetNodeId);
  if (!targetNode) return recommendations;

  // 인접 리스트 생성
  const adjacencyList = new Map<string, Set<string>>();
  nodes.forEach((node) => {
    adjacencyList.set(node.id, new Set());
  });

  edges.forEach((edge) => {
    adjacencyList.get(edge.source)?.add(edge.target);
    adjacencyList.get(edge.target)?.add(edge.source);
  });

  // 1. 소개 기회 찾기 (2단계 연결)
  const directConnections = adjacencyList.get(targetNodeId) || new Set();
  const potentialIntroductions = new Set<string>();

  directConnections.forEach((directId) => {
    const secondLevelConnections = adjacencyList.get(directId) || new Set();
    secondLevelConnections.forEach((secondLevelId) => {
      if (
        secondLevelId !== targetNodeId &&
        !directConnections.has(secondLevelId)
      ) {
        potentialIntroductions.add(secondLevelId);
      }
    });
  });

  // 높은 가치 소개 추천
  const highValueIntroductions = Array.from(potentialIntroductions)
    .map((nodeId) => nodes.find((n) => n.id === nodeId))
    .filter((node) => node && node.importance === 'high')
    .slice(0, 3);

  highValueIntroductions.forEach((node) => {
    if (node) {
      recommendations.push({
        type: 'introduction',
        priority: 'high',
        title: `${node.name}님과의 소개 기회`,
        description: `공통 연결점을 통해 ${node.name}님과 연결될 수 있습니다.`,
        targetNodeIds: [node.id],
        potentialValue: node.contractValue,
      });
    }
  });

  // 2. 팔로우업 추천 (비활성 고가치 고객)
  const inactiveHighValue = nodes
    .filter(
      (node) =>
        node.status === 'inactive' &&
        node.contractValue > 500000 &&
        directConnections.has(node.id)
    )
    .slice(0, 2);

  inactiveHighValue.forEach((node) => {
    recommendations.push({
      type: 'follow_up',
      priority: 'medium',
      title: `${node.name}님 재연결 제안`,
      description: `고가치 고객이지만 현재 비활성 상태입니다. 재연결을 시도해보세요.`,
      targetNodeIds: [node.id],
      potentialValue: node.contractValue,
    });
  });

  // 3. 클러스터 확장 추천
  const metrics = calculateNetworkMetrics(nodes, edges);
  const highCentralityNodes = Array.from(metrics.nodeCentrality.entries())
    .filter(
      ([nodeId, centrality]) =>
        centrality > 0.4 && !directConnections.has(nodeId)
    )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2);

  highCentralityNodes.forEach(([nodeId, centrality]) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      recommendations.push({
        type: 'cluster_expansion',
        priority: 'low',
        title: `네트워크 허브 ${node.name}님`,
        description: `이 고객은 네트워크의 중심 역할을 하고 있어 추가 연결 기회가 많습니다.`,
        targetNodeIds: [nodeId],
        potentialValue: centrality * 1000000,
      });
    }
  });

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}
