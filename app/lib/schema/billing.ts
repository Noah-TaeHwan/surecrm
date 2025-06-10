// ========================================
// SureCRM 구독 결제 시스템 - 데이터베이스 스키마
// ========================================
import {
  pgTable,
  text,
  boolean,
  timestamp,
  integer,
  decimal,
  json,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations, eq, and, inArray } from 'drizzle-orm';
import { authUsers } from './core';

// ========================================
// 1. 구독 플랜 테이블
// ========================================
export const appBillingPlans = pgTable(
  'app_billing_plans',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),

    // 가격 정보
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    currency: text('currency').default('KRW').notNull(),
    billingInterval: text('billing_interval').default('month').notNull(), // month, year

    // 기능 및 제한사항
    features: json('features').$type<string[]>(),
    maxClients: integer('max_clients').default(-1), // -1 = 무제한
    maxUsers: integer('max_users').default(-1),
    maxStorageGb: integer('max_storage_gb').default(-1),
    apiRateLimit: integer('api_rate_limit').default(-1),

    // 플랜 설정
    isActive: boolean('is_active').default(true).notNull(),
    isPopular: boolean('is_popular').default(false).notNull(),
    trialDays: integer('trial_days').default(0).notNull(),

    // 메타데이터
    metadata: json('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    activeIdx: index('billing_plans_active_idx').on(table.isActive),
    popularIdx: index('billing_plans_popular_idx').on(table.isPopular),
  })
);

// ========================================
// 2. 고객 키 테이블 (토스페이먼츠 연동)
// ========================================
export const appBillingCustomerKeys = pgTable(
  'app_billing_customer_keys',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .references(() => authUsers.id, { onDelete: 'cascade' })
      .notNull(),

    // 토스페이먼츠 고객 키
    tossCustomerKey: text('toss_customer_key').unique().notNull(),

    // 상태 관리
    isActive: boolean('is_active').default(true).notNull(),

    // 메타데이터
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('billing_customer_keys_user_id_idx').on(table.userId),
    activeIdx: index('billing_customer_keys_active_idx').on(table.isActive),
  })
);

// ========================================
// 3. 결제수단 테이블
// ========================================
export const appBillingPaymentMethods = pgTable(
  'app_billing_payment_methods',
  {
    id: text('id').primaryKey(),
    customerKeyId: text('customer_key_id')
      .references(() => appBillingCustomerKeys.id, { onDelete: 'cascade' })
      .notNull(),

    // 토스페이먼츠 빌링키
    tossBillingKey: text('toss_billing_key').unique().notNull(),

    // 카드 정보 (마스킹된 정보만 저장)
    cardCompany: text('card_company'), // 신한, 삼성, 현대 등
    cardType: text('card_type'), // 신용카드, 체크카드
    cardLast4: text('card_last4'), // 마지막 4자리
    cardExpiry: text('card_expiry'), // MM/YY 형식

    // 상태 관리
    isActive: boolean('is_active').default(true).notNull(),
    isDefault: boolean('is_default').default(false).notNull(),

    // 실패 추적
    consecutiveFailures: integer('consecutive_failures').default(0).notNull(),
    lastFailedAt: timestamp('last_failed_at'),
    failureReason: text('failure_reason'),

    // 메타데이터
    metadata: json('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    customerKeyIdIdx: index('billing_payment_methods_customer_key_id_idx').on(
      table.customerKeyId
    ),
    activeIdx: index('billing_payment_methods_active_idx').on(table.isActive),
    defaultIdx: index('billing_payment_methods_default_idx').on(
      table.isDefault
    ),
  })
);

// ========================================
// 4. 구독 테이블
// ========================================
export const appBillingSubscriptions = pgTable(
  'app_billing_subscriptions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .references(() => authUsers.id, { onDelete: 'cascade' })
      .notNull(),
    planId: text('plan_id')
      .references(() => appBillingPlans.id)
      .notNull(),
    paymentMethodId: text('payment_method_id').references(
      () => appBillingPaymentMethods.id
    ),

    // 구독 상태
    status: text('status').notNull(), // active, trialing, past_due, canceled, unpaid, incomplete, requires_payment_method

    // 결제 주기
    currentPeriodStart: timestamp('current_period_start').notNull(),
    currentPeriodEnd: timestamp('current_period_end').notNull(),
    nextBillingDate: timestamp('next_billing_date'),

    // 취소 관련
    cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),
    canceledAt: timestamp('canceled_at'),
    cancellationReason: text('cancellation_reason'),

    // 체험 기간
    trialStart: timestamp('trial_start'),
    trialEnd: timestamp('trial_end'),

    // 실패 추적
    retryCount: integer('retry_count').default(0).notNull(),
    maxRetries: integer('max_retries').default(3).notNull(),
    nextRetryDate: timestamp('next_retry_date'),
    lastError: text('last_error'),

    // 할인 (향후 확장용)
    discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }),
    discountPercent: integer('discount_percent'),
    discountEndDate: timestamp('discount_end_date'),

    // 메타데이터
    metadata: json('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('billing_subscriptions_user_id_idx').on(table.userId),
    statusIdx: index('billing_subscriptions_status_idx').on(table.status),
    billingDateIdx: index('billing_subscriptions_billing_date_idx').on(
      table.nextBillingDate
    ),
    retryDateIdx: index('billing_subscriptions_retry_date_idx').on(
      table.nextRetryDate
    ),
    periodIdx: index('billing_subscriptions_period_idx').on(
      table.currentPeriodStart,
      table.currentPeriodEnd
    ),
  })
);

// ========================================
// 5. 결제 내역 테이블
// ========================================
export const appBillingPayments = pgTable(
  'app_billing_payments',
  {
    id: text('id').primaryKey(),
    subscriptionId: text('subscription_id')
      .references(() => appBillingSubscriptions.id, { onDelete: 'cascade' })
      .notNull(),
    paymentMethodId: text('payment_method_id').references(
      () => appBillingPaymentMethods.id
    ),

    // 주문 정보
    orderId: text('order_id').unique().notNull(),
    orderName: text('order_name').notNull(),

    // 결제 금액
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    currency: text('currency').default('KRW').notNull(),

    // 할인 정보
    discountAmount: decimal('discount_amount', { precision: 10, scale: 2 })
      .default('0')
      .notNull(),
    finalAmount: decimal('final_amount', { precision: 10, scale: 2 }).notNull(),

    // 결제 상태
    status: text('status').notNull(), // pending, completed, failed, canceled, refunded

    // 토스페이먼츠 정보
    tossPaymentKey: text('toss_payment_key').unique(),
    tossOrderId: text('toss_order_id'),
    tossTransactionKey: text('toss_transaction_key'),

    // 결제 방식
    paymentMethod: text('payment_method'), // 카드, 계좌이체 등
    paymentProvider: text('payment_provider').default('toss').notNull(),

    // 실패 정보
    failureCode: text('failure_code'),
    failureReason: text('failure_reason'),

    // 환불 정보
    refundedAmount: decimal('refunded_amount', { precision: 10, scale: 2 })
      .default('0')
      .notNull(),
    refundReason: text('refund_reason'),
    refundedAt: timestamp('refunded_at'),

    // 영수증 정보
    receiptUrl: text('receipt_url'),
    receiptNumber: text('receipt_number'),

    // 결제 완료 시각
    paidAt: timestamp('paid_at'),
    confirmedAt: timestamp('confirmed_at'),

    // 메타데이터
    metadata: json('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    subscriptionIdIdx: index('billing_payments_subscription_id_idx').on(
      table.subscriptionId
    ),
    statusIdx: index('billing_payments_status_idx').on(table.status),
    orderIdIdx: index('billing_payments_order_id_idx').on(table.orderId),
    tossPaymentKeyIdx: index('billing_payments_toss_payment_key_idx').on(
      table.tossPaymentKey
    ),
    paidAtIdx: index('billing_payments_paid_at_idx').on(table.paidAt),
    amountIdx: index('billing_payments_amount_idx').on(table.amount),
  })
);

// ========================================
// 6. 사용량 추적 테이블 (향후 확장용)
// ========================================
export const appBillingUsageRecords = pgTable(
  'app_billing_usage_records',
  {
    id: text('id').primaryKey(),
    subscriptionId: text('subscription_id')
      .references(() => appBillingSubscriptions.id, { onDelete: 'cascade' })
      .notNull(),

    // 사용량 타입
    usageType: text('usage_type').notNull(), // clients, api_calls, storage
    quantity: integer('quantity').notNull(),
    unit: text('unit').notNull(), // count, mb, gb

    // 기간
    periodStart: timestamp('period_start').notNull(),
    periodEnd: timestamp('period_end').notNull(),

    // 제한 확인
    limitValue: integer('limit_value'), // 해당 기간의 제한값
    isOverLimit: boolean('is_over_limit').default(false).notNull(),

    // 메타데이터
    metadata: json('metadata'),
    recordedAt: timestamp('recorded_at').defaultNow().notNull(),
  },
  (table) => ({
    subscriptionIdIdx: index('billing_usage_records_subscription_id_idx').on(
      table.subscriptionId
    ),
    usageTypeIdx: index('billing_usage_records_usage_type_idx').on(
      table.usageType
    ),
    periodIdx: index('billing_usage_records_period_idx').on(
      table.periodStart,
      table.periodEnd
    ),
    recordedAtIdx: index('billing_usage_records_recorded_at_idx').on(
      table.recordedAt
    ),
  })
);

// ========================================
// 7. 웹훅 로그 테이블
// ========================================
export const appBillingWebhookLogs = pgTable(
  'app_billing_webhook_logs',
  {
    id: text('id').primaryKey(),

    // 웹훅 기본 정보
    eventType: text('event_type').notNull(),
    provider: text('provider').default('toss').notNull(),

    // 요청 정보
    webhookId: text('webhook_id'),
    requestHeaders: json('request_headers'),
    requestBody: json('request_body'),

    // 처리 결과
    status: text('status').notNull(), // received, processing, completed, failed
    processingDurationMs: integer('processing_duration_ms'),

    // 에러 정보
    errorMessage: text('error_message'),
    retryCount: integer('retry_count').default(0).notNull(),

    // 관련 엔티티
    relatedPaymentId: text('related_payment_id'),
    relatedSubscriptionId: text('related_subscription_id'),

    // 메타데이터
    metadata: json('metadata'),
    receivedAt: timestamp('received_at').defaultNow().notNull(),
    processedAt: timestamp('processed_at'),
  },
  (table) => ({
    eventTypeIdx: index('billing_webhook_logs_event_type_idx').on(
      table.eventType
    ),
    statusIdx: index('billing_webhook_logs_status_idx').on(table.status),
    receivedAtIdx: index('billing_webhook_logs_received_at_idx').on(
      table.receivedAt
    ),
    relatedPaymentIdx: index('billing_webhook_logs_related_payment_idx').on(
      table.relatedPaymentId
    ),
  })
);

// ========================================
// 8. 감사 로그 테이블
// ========================================
export const appBillingAuditLogs = pgTable(
  'app_billing_audit_logs',
  {
    id: text('id').primaryKey(),

    // 대상 정보
    entityType: text('entity_type').notNull(), // subscription, payment, payment_method
    entityId: text('entity_id').notNull(),

    // 액션 정보
    action: text('action').notNull(), // created, updated, deleted, status_changed
    actorType: text('actor_type').notNull(), // user, system, webhook
    actorId: text('actor_id'),

    // 변경 내용
    oldValues: json('old_values'),
    newValues: json('new_values'),
    changes: json('changes'), // 변경된 필드만

    // 컨텍스트
    reason: text('reason'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),

    // 메타데이터
    metadata: json('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    entityIdx: index('billing_audit_logs_entity_idx').on(
      table.entityType,
      table.entityId
    ),
    actionIdx: index('billing_audit_logs_action_idx').on(table.action),
    actorIdx: index('billing_audit_logs_actor_idx').on(
      table.actorType,
      table.actorId
    ),
    createdAtIdx: index('billing_audit_logs_created_at_idx').on(
      table.createdAt
    ),
  })
);

// ========================================
// 관계 정의 (Relations)
// ========================================

// 고객키 관계
export const appBillingCustomerKeysRelations = relations(
  appBillingCustomerKeys,
  ({ one, many }) => ({
    user: one(authUsers, {
      fields: [appBillingCustomerKeys.userId],
      references: [authUsers.id],
    }),
    paymentMethods: many(appBillingPaymentMethods),
  })
);

// 결제수단 관계
export const appBillingPaymentMethodsRelations = relations(
  appBillingPaymentMethods,
  ({ one, many }) => ({
    customerKey: one(appBillingCustomerKeys, {
      fields: [appBillingPaymentMethods.customerKeyId],
      references: [appBillingCustomerKeys.id],
    }),
    subscriptions: many(appBillingSubscriptions),
    payments: many(appBillingPayments),
  })
);

// 구독 관계
export const appBillingSubscriptionsRelations = relations(
  appBillingSubscriptions,
  ({ one, many }) => ({
    user: one(authUsers, {
      fields: [appBillingSubscriptions.userId],
      references: [authUsers.id],
    }),
    plan: one(appBillingPlans, {
      fields: [appBillingSubscriptions.planId],
      references: [appBillingPlans.id],
    }),
    paymentMethod: one(appBillingPaymentMethods, {
      fields: [appBillingSubscriptions.paymentMethodId],
      references: [appBillingPaymentMethods.id],
    }),
    payments: many(appBillingPayments),
    usageRecords: many(appBillingUsageRecords),
  })
);

// 결제 관계
export const appBillingPaymentsRelations = relations(
  appBillingPayments,
  ({ one }) => ({
    subscription: one(appBillingSubscriptions, {
      fields: [appBillingPayments.subscriptionId],
      references: [appBillingSubscriptions.id],
    }),
    paymentMethod: one(appBillingPaymentMethods, {
      fields: [appBillingPayments.paymentMethodId],
      references: [appBillingPaymentMethods.id],
    }),
  })
);

// 사용량 기록 관계
export const appBillingUsageRecordsRelations = relations(
  appBillingUsageRecords,
  ({ one }) => ({
    subscription: one(appBillingSubscriptions, {
      fields: [appBillingUsageRecords.subscriptionId],
      references: [appBillingSubscriptions.id],
    }),
  })
);

// 플랜 관계
export const appBillingPlansRelations = relations(
  appBillingPlans,
  ({ many }) => ({
    subscriptions: many(appBillingSubscriptions),
  })
);

// ========================================
// 타입 정의 (Inferred Types)
// ========================================

// 테이블 타입들
export type BillingPlan = typeof appBillingPlans.$inferSelect;
export type NewBillingPlan = typeof appBillingPlans.$inferInsert;

export type BillingCustomerKey = typeof appBillingCustomerKeys.$inferSelect;
export type NewBillingCustomerKey = typeof appBillingCustomerKeys.$inferInsert;

export type BillingPaymentMethod = typeof appBillingPaymentMethods.$inferSelect;
export type NewBillingPaymentMethod =
  typeof appBillingPaymentMethods.$inferInsert;

export type BillingSubscription = typeof appBillingSubscriptions.$inferSelect;
export type NewBillingSubscription =
  typeof appBillingSubscriptions.$inferInsert;

export type BillingPayment = typeof appBillingPayments.$inferSelect;
export type NewBillingPayment = typeof appBillingPayments.$inferInsert;

export type BillingUsageRecord = typeof appBillingUsageRecords.$inferSelect;
export type NewBillingUsageRecord = typeof appBillingUsageRecords.$inferInsert;

export type BillingWebhookLog = typeof appBillingWebhookLogs.$inferSelect;
export type NewBillingWebhookLog = typeof appBillingWebhookLogs.$inferInsert;

export type BillingAuditLog = typeof appBillingAuditLogs.$inferSelect;
export type NewBillingAuditLog = typeof appBillingAuditLogs.$inferInsert;
