// 🌐 Network 기능 전용 스키마
// Prefix 네이밍 컨벤션: network_ 사용
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

// 📌 Network 특화 Enum (prefix 네이밍 적용)
export const networkNodeTypeEnum = pgEnum('network_node_type_enum', [
  'client',
  'prospect',
  'influencer',
  'partner',
  'external',
]);

export const networkConnectionTypeEnum = pgEnum(
  'network_connection_type_enum',
  [
    'direct_referral',
    'family_member',
    'colleague',
    'friend',
    'business_partner',
    'community_member',
  ]
);

export const networkAnalysisTypeEnum = pgEnum('network_analysis_type_enum', [
  'centrality',
  'clustering',
  'path_analysis',
  'influence_mapping',
  'growth_tracking',
]);

// 🏷️ Network 특화 테이블들 (prefix 네이밍 적용)

// Network Nodes 테이블 (네트워크 노드 관리)
export const networkNodes = pgTable('network_nodes', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  clientId: uuid('client_id').references(() => clients.id), // 고객인 경우
  nodeType: networkNodeTypeEnum('node_type').notNull(),
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

// Network Connections 테이블 (네트워크 연결 관리)
export const networkConnections = pgTable('network_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  sourceNodeId: uuid('source_node_id')
    .notNull()
    .references(() => networkNodes.id, { onDelete: 'cascade' }),
  targetNodeId: uuid('target_node_id')
    .notNull()
    .references(() => networkNodes.id, { onDelete: 'cascade' }),
  connectionType: networkConnectionTypeEnum('connection_type').notNull(),
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

// Network Analysis Results 테이블 (네트워크 분석 결과)
export const networkAnalysisResults = pgTable('network_analysis_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  teamId: uuid('team_id').references(() => teams.id),
  analysisType: networkAnalysisTypeEnum('analysis_type').notNull(),
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
export const networkInteractions = pgTable('network_interactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  connectionId: uuid('connection_id')
    .notNull()
    .references(() => networkConnections.id, { onDelete: 'cascade' }),
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
export const networkOpportunities = pgTable('network_opportunities', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  sourceNodeId: uuid('source_node_id')
    .notNull()
    .references(() => networkNodes.id),
  targetNodeId: uuid('target_node_id').references(() => networkNodes.id), // 연결 대상 (있는 경우)
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
export const networkNodesRelations = relations(
  networkNodes,
  ({ one, many }) => ({
    agent: one(profiles, {
      fields: [networkNodes.agentId],
      references: [profiles.id],
    }),
    client: one(clients, {
      fields: [networkNodes.clientId],
      references: [clients.id],
    }),
    sourceConnections: many(networkConnections, {
      relationName: 'sourceConnections',
    }),
    targetConnections: many(networkConnections, {
      relationName: 'targetConnections',
    }),
    opportunities: many(networkOpportunities),
  })
);

export const networkConnectionsRelations = relations(
  networkConnections,
  ({ one, many }) => ({
    agent: one(profiles, {
      fields: [networkConnections.agentId],
      references: [profiles.id],
    }),
    sourceNode: one(networkNodes, {
      fields: [networkConnections.sourceNodeId],
      references: [networkNodes.id],
      relationName: 'sourceConnections',
    }),
    targetNode: one(networkNodes, {
      fields: [networkConnections.targetNodeId],
      references: [networkNodes.id],
      relationName: 'targetConnections',
    }),
    interactions: many(networkInteractions),
  })
);

export const networkAnalysisResultsRelations = relations(
  networkAnalysisResults,
  ({ one }) => ({
    agent: one(profiles, {
      fields: [networkAnalysisResults.agentId],
      references: [profiles.id],
    }),
    team: one(teams, {
      fields: [networkAnalysisResults.teamId],
      references: [teams.id],
    }),
  })
);

export const networkInteractionsRelations = relations(
  networkInteractions,
  ({ one }) => ({
    agent: one(profiles, {
      fields: [networkInteractions.agentId],
      references: [profiles.id],
    }),
    connection: one(networkConnections, {
      fields: [networkInteractions.connectionId],
      references: [networkConnections.id],
    }),
  })
);

export const networkOpportunitiesRelations = relations(
  networkOpportunities,
  ({ one }) => ({
    agent: one(profiles, {
      fields: [networkOpportunities.agentId],
      references: [profiles.id],
    }),
    sourceNode: one(networkNodes, {
      fields: [networkOpportunities.sourceNodeId],
      references: [networkNodes.id],
    }),
    targetNode: one(networkNodes, {
      fields: [networkOpportunities.targetNodeId],
      references: [networkNodes.id],
    }),
  })
);

// 📝 Network 특화 타입들 (실제 코드와 일치)
export type NetworkNode = typeof networkNodes.$inferSelect;
export type NewNetworkNode = typeof networkNodes.$inferInsert;
export type NetworkConnection = typeof networkConnections.$inferSelect;
export type NewNetworkConnection = typeof networkConnections.$inferInsert;
export type NetworkAnalysisResult = typeof networkAnalysisResults.$inferSelect;
export type NewNetworkAnalysisResult =
  typeof networkAnalysisResults.$inferInsert;
export type NetworkInteraction = typeof networkInteractions.$inferSelect;
export type NewNetworkInteraction = typeof networkInteractions.$inferInsert;
export type NetworkOpportunity = typeof networkOpportunities.$inferSelect;
export type NewNetworkOpportunity = typeof networkOpportunities.$inferInsert;

export type NetworkNodeType = (typeof networkNodeTypeEnum.enumValues)[number];
export type NetworkConnectionType =
  (typeof networkConnectionTypeEnum.enumValues)[number];
export type NetworkAnalysisType =
  (typeof networkAnalysisTypeEnum.enumValues)[number];

// 🎯 Network 특화 인터페이스
export interface NetworkOverview {
  nodes: NetworkNode[];
  connections: NetworkConnection[];
  analysisResults: NetworkAnalysisResult[];
  opportunities: NetworkOpportunity[];
  stats: {
    totalNodes: number;
    totalConnections: number;
    networkDensity: number;
    topInfluencers: NetworkNode[];
  };
}

export interface NetworkFilter {
  nodeTypes?: NetworkNodeType[];
  connectionTypes?: NetworkConnectionType[];
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

export interface NetworkStats {
  totalNodes: number;
  totalConnections: number;
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
