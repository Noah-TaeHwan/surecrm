// 🌐 Network 기능 전용 스키마
// Prefix 네이밍 컨벤션: app_network_ 사용
// 공통 스키마에서 기본 테이블들을 import
export {
  profiles,
  teams,
  clients,
  referrals,
  // 타입들
  type Profile,
  type Team,
  type Client,
  type Referral,
  type UserRole,
  type Importance,
  type ReferralStatus,
} from '~/lib/schema';

import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  boolean,
  integer,
  date,
  jsonb,
  decimal,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { profiles, teams, clients, referrals } from '~/lib/schema';

// 📌 Network 특화 Enum (app_network_ prefix 적용)
export const appNetworkNodeTypeEnum = pgEnum('app_network_node_type_enum', [
  'client',
  'prospect',
  'influencer',
  'partner',
  'external',
]);

export const appNetworkConnectionTypeEnum = pgEnum(
  'app_network_connection_type_enum',
  [
    'direct_referral',
    'family_member',
    'colleague',
    'friend',
    'business_partner',
    'community_member',
  ]
);

export const appNetworkAnalysisTypeEnum = pgEnum(
  'app_network_analysis_type_enum',
  [
    'centrality',
    'clustering',
    'path_analysis',
    'influence_mapping',
    'growth_tracking',
  ]
);

// 🏷️ Network 특화 테이블들 (app_network_ prefix 적용)

// Network Nodes 테이블 (네트워크 노드 관리)
export const appNetworkNodes = pgTable('app_network_nodes', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  clientId: uuid('client_id').references(() => clients.id), // 고객인 경우
  nodeType: appNetworkNodeTypeEnum('node_type').notNull(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  company: text('company'),
  position: text('position'),
  location: text('location'),
  tags: text('tags').array(),
  centralityScore: decimal('centrality_score', {
    precision: 8,
    scale: 4,
  }).default('0'),
  influenceScore: decimal('influence_score', {
    precision: 8,
    scale: 4,
  }).default('0'),
  connectionsCount: integer('connections_count').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Network Edges/Connections 테이블 (네트워크 연결 관리)
export const appNetworkEdges = pgTable('app_network_edges', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  sourceNodeId: uuid('source_node_id')
    .notNull()
    .references(() => appNetworkNodes.id, { onDelete: 'cascade' }),
  targetNodeId: uuid('target_node_id')
    .notNull()
    .references(() => appNetworkNodes.id, { onDelete: 'cascade' }),
  connectionType: appNetworkConnectionTypeEnum('connection_type').notNull(),
  strength: decimal('strength', { precision: 3, scale: 2 })
    .default('1.0')
    .notNull(), // 0.0-10.0
  bidirectional: boolean('bidirectional').default(true).notNull(),
  description: text('description'),
  establishedDate: date('established_date'),
  lastInteraction: timestamp('last_interaction', { withTimezone: true }),
  interactionCount: integer('interaction_count').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Network Stats/Analysis Results 테이블 (네트워크 분석 결과)
export const appNetworkStats = pgTable('app_network_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  teamId: uuid('team_id').references(() => teams.id),
  analysisType: appNetworkAnalysisTypeEnum('analysis_type').notNull(),
  analysisDate: timestamp('analysis_date', { withTimezone: true })
    .defaultNow()
    .notNull(),
  totalNodes: integer('total_nodes').default(0).notNull(),
  totalConnections: integer('total_connections').default(0).notNull(),
  networkDensity: decimal('network_density', {
    precision: 5,
    scale: 4,
  }).default('0'),
  averagePathLength: decimal('average_path_length', {
    precision: 5,
    scale: 2,
  }).default('0'),
  clusteringCoefficient: decimal('clustering_coefficient', {
    precision: 5,
    scale: 4,
  }).default('0'),
  topInfluencers: jsonb('top_influencers'), // 상위 영향력자 목록
  communityStructure: jsonb('community_structure'), // 커뮤니티 구조 분석
  growthMetrics: jsonb('growth_metrics'), // 성장 지표
  recommendations: jsonb('recommendations'), // 네트워크 확장 추천
  rawData: jsonb('raw_data'), // 원시 분석 데이터
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Network Interactions 테이블 (네트워크 상호작용 추적)
export const appNetworkInteractions = pgTable('app_network_interactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  edgeId: uuid('edge_id')
    .notNull()
    .references(() => appNetworkEdges.id, { onDelete: 'cascade' }),
  interactionType: text('interaction_type').notNull(), // 'meeting', 'call', 'email', 'referral', 'event'
  interactionDate: timestamp('interaction_date', {
    withTimezone: true,
  }).notNull(),
  description: text('description'),
  outcome: text('outcome'), // 'positive', 'neutral', 'negative'
  strengthChange: decimal('strength_change', {
    precision: 3,
    scale: 2,
  }).default('0'), // -10.0 to +10.0
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Network Opportunities 테이블 (네트워크 기회 관리)
export const appNetworkOpportunities = pgTable('app_network_opportunities', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  sourceNodeId: uuid('source_node_id')
    .notNull()
    .references(() => appNetworkNodes.id),
  targetNodeId: uuid('target_node_id').references(() => appNetworkNodes.id), // 연결 대상 (있는 경우)
  opportunityType: text('opportunity_type').notNull(), // 'introduction', 'collaboration', 'referral', 'event'
  title: text('title').notNull(),
  description: text('description'),
  potentialValue: decimal('potential_value', { precision: 12, scale: 2 }),
  priority: text('priority').default('medium'), // 'low', 'medium', 'high'
  status: text('status').default('open'), // 'open', 'pursuing', 'closed', 'rejected'
  dueDate: date('due_date'),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  outcome: text('outcome'),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 🔗 Relations (관계 정의)
export const appNetworkNodesRelations = relations(
  appNetworkNodes,
  ({ one, many }) => ({
    agent: one(profiles, {
      fields: [appNetworkNodes.agentId],
      references: [profiles.id],
    }),
    client: one(clients, {
      fields: [appNetworkNodes.clientId],
      references: [clients.id],
    }),
    sourceEdges: many(appNetworkEdges, {
      relationName: 'sourceEdges',
    }),
    targetEdges: many(appNetworkEdges, {
      relationName: 'targetEdges',
    }),
    opportunities: many(appNetworkOpportunities),
  })
);

export const appNetworkEdgesRelations = relations(
  appNetworkEdges,
  ({ one, many }) => ({
    agent: one(profiles, {
      fields: [appNetworkEdges.agentId],
      references: [profiles.id],
    }),
    sourceNode: one(appNetworkNodes, {
      fields: [appNetworkEdges.sourceNodeId],
      references: [appNetworkNodes.id],
      relationName: 'sourceEdges',
    }),
    targetNode: one(appNetworkNodes, {
      fields: [appNetworkEdges.targetNodeId],
      references: [appNetworkNodes.id],
      relationName: 'targetEdges',
    }),
    interactions: many(appNetworkInteractions),
  })
);

export const appNetworkStatsRelations = relations(
  appNetworkStats,
  ({ one }) => ({
    agent: one(profiles, {
      fields: [appNetworkStats.agentId],
      references: [profiles.id],
    }),
    team: one(teams, {
      fields: [appNetworkStats.teamId],
      references: [teams.id],
    }),
  })
);

export const appNetworkInteractionsRelations = relations(
  appNetworkInteractions,
  ({ one }) => ({
    agent: one(profiles, {
      fields: [appNetworkInteractions.agentId],
      references: [profiles.id],
    }),
    edge: one(appNetworkEdges, {
      fields: [appNetworkInteractions.edgeId],
      references: [appNetworkEdges.id],
    }),
  })
);

export const appNetworkOpportunitiesRelations = relations(
  appNetworkOpportunities,
  ({ one }) => ({
    agent: one(profiles, {
      fields: [appNetworkOpportunities.agentId],
      references: [profiles.id],
    }),
    sourceNode: one(appNetworkNodes, {
      fields: [appNetworkOpportunities.sourceNodeId],
      references: [appNetworkNodes.id],
    }),
    targetNode: one(appNetworkNodes, {
      fields: [appNetworkOpportunities.targetNodeId],
      references: [appNetworkNodes.id],
    }),
  })
);

// 📝 Network 특화 타입들 (app_network_ 컨벤션 적용)
export type AppNetworkNode = typeof appNetworkNodes.$inferSelect;
export type NewAppNetworkNode = typeof appNetworkNodes.$inferInsert;
export type AppNetworkEdge = typeof appNetworkEdges.$inferSelect;
export type NewAppNetworkEdge = typeof appNetworkEdges.$inferInsert;
export type AppNetworkStats = typeof appNetworkStats.$inferSelect;
export type NewAppNetworkStats = typeof appNetworkStats.$inferInsert;
export type AppNetworkInteraction = typeof appNetworkInteractions.$inferSelect;
export type NewAppNetworkInteraction =
  typeof appNetworkInteractions.$inferInsert;
export type AppNetworkOpportunity = typeof appNetworkOpportunities.$inferSelect;
export type NewAppNetworkOpportunity =
  typeof appNetworkOpportunities.$inferInsert;

export type AppNetworkNodeType =
  (typeof appNetworkNodeTypeEnum.enumValues)[number];
export type AppNetworkConnectionType =
  (typeof appNetworkConnectionTypeEnum.enumValues)[number];
export type AppNetworkAnalysisType =
  (typeof appNetworkAnalysisTypeEnum.enumValues)[number];

// 🎯 Network 특화 인터페이스 (app_network_ 컨벤션 적용)
export interface AppNetworkOverview {
  nodes: AppNetworkNode[];
  edges: AppNetworkEdge[];
  stats: AppNetworkStats[];
  opportunities: AppNetworkOpportunity[];
  summary: {
    totalNodes: number;
    totalEdges: number;
    networkDensity: number;
    topInfluencers: AppNetworkNode[];
  };
}

export interface AppNetworkFilter {
  nodeTypes?: AppNetworkNodeType[];
  connectionTypes?: AppNetworkConnectionType[];
  strengthRange?: {
    min: number;
    max: number;
  };
  influenceRange?: {
    min: number;
    max: number;
  };
  isActive?: boolean;
  tags?: string[];
  location?: string;
}

export interface AppNetworkMetrics {
  totalNodes: number;
  totalEdges: number;
  averageConnections: number;
  networkDensity: number;
  averagePathLength: number;
  clusteringCoefficient: number;
  topInfluencers: Array<{
    nodeId: string;
    name: string;
    influenceScore: number;
    connectionsCount: number;
  }>;
}

// 🔄 호환성을 위한 별칭 (기존 코드와의 호환성 유지)
export const networkNodes = appNetworkNodes;
export const networkConnections = appNetworkEdges;
export const networkAnalysisResults = appNetworkStats;
export const networkInteractions = appNetworkInteractions;
export const networkOpportunities = appNetworkOpportunities;

export type NetworkNode = AppNetworkNode;
export type NetworkConnection = AppNetworkEdge;
export type NetworkAnalysisResult = AppNetworkStats;
export type NetworkInteraction = AppNetworkInteraction;
export type NetworkOpportunity = AppNetworkOpportunity;
export type NetworkNodeType = AppNetworkNodeType;
export type NetworkConnectionType = AppNetworkConnectionType;
export type NetworkAnalysisType = AppNetworkAnalysisType;
export type NetworkOverview = AppNetworkOverview;
export type NetworkFilter = AppNetworkFilter;
export type NetworkStats = AppNetworkMetrics;
