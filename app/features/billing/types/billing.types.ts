// ========================================
// 구독 플랜 관련 타입
// ========================================

export interface BillingPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billingInterval: 'month' | 'year';
  features: string[];
  maxClients: number;
  maxUsers: number;
  maxStorageGb: number;
  apiRateLimit: number;
  isActive: boolean;
  isPopular: boolean;
  trialDays: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// 구독 관련 타입
// ========================================

export type SubscriptionStatus =
  | 'active' // 활성 구독
  | 'trialing' // 체험 중
  | 'past_due' // 결제 연체
  | 'canceled' // 취소됨
  | 'unpaid' // 미납 (서비스 정지)
  | 'incomplete' // 불완전 (결제 진행 중)
  | 'requires_payment_method'; // 결제수단 업데이트 필요

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  nextBillingDate?: Date;
  paymentMethodId?: string;

  // 취소 관련
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  cancellationReason?: string;

  // 체험 기간
  trialStart?: Date;
  trialEnd?: Date;

  // 실패 추적
  retryCount: number;
  maxRetries: number;
  nextRetryDate?: Date;
  lastError?: string;

  // 할인 (향후 확장용)
  discountAmount?: number;
  discountPercent?: number;
  discountEndDate?: Date;

  // 관계
  plan?: BillingPlan;
  paymentMethod?: PaymentMethod;
  user?: any; // 기존 User 타입 사용

  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// 결제수단 관련 타입
// ========================================

export interface CustomerKey {
  id: string;
  userId: string;
  tossCustomerKey: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethod {
  id: string;
  customerKeyId: string;
  tossBillingKey: string;

  // 카드 정보 (마스킹된 정보만)
  cardCompany?: string; // 신한, 삼성, 현대 등
  cardType?: string; // 신용카드, 체크카드
  cardLast4?: string; // 마지막 4자리
  cardExpiry?: string; // MM/YY

  // 상태
  isActive: boolean;
  isDefault: boolean;

  // 실패 추적
  consecutiveFailures: number;
  lastFailedAt?: Date;
  failureReason?: string;

  // 관계
  customerKey?: CustomerKey;

  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// 결제 관련 타입
// ========================================

export type PaymentStatus =
  | 'pending' // 진행 중
  | 'completed' // 완료
  | 'failed' // 실패
  | 'canceled' // 취소
  | 'refunded'; // 환불

export interface Payment {
  id: string;
  subscriptionId: string;
  paymentMethodId?: string;

  // 주문 정보
  orderId: string;
  orderName: string;

  // 금액
  amount: number;
  currency: string;
  discountAmount: number;
  finalAmount: number;

  // 상태
  status: PaymentStatus;

  // 토스페이먼츠 정보
  tossPaymentKey?: string;
  tossOrderId?: string;
  tossTransactionKey?: string;

  // 결제 방식
  paymentMethod?: string; // 카드, 계좌이체 등
  paymentProvider: string; // toss

  // 실패 정보
  failureCode?: string;
  failureReason?: string;

  // 환불 정보
  refundedAmount: number;
  refundReason?: string;
  refundedAt?: Date;

  // 영수증
  receiptUrl?: string;
  receiptNumber?: string;

  // 완료 시각
  paidAt?: Date;
  confirmedAt?: Date;

  // 관계
  subscription?: Subscription;

  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// 사용량 추적 타입 (향후 확장용)
// ========================================

export interface UsageRecord {
  id: string;
  subscriptionId: string;
  usageType: string; // clients, api_calls, storage
  quantity: number;
  unit: string; // count, mb, gb
  periodStart: Date;
  periodEnd: Date;
  limitValue?: number;
  isOverLimit: boolean;
  metadata?: Record<string, any>;
  recordedAt: Date;
}

// ========================================
// 웹훅 및 로그 타입
// ========================================

export interface WebhookLog {
  id: string;
  eventType: string;
  provider: string;
  webhookId?: string;
  requestHeaders?: Record<string, any>;
  requestBody?: Record<string, any>;
  status: 'received' | 'processing' | 'completed' | 'failed';
  processingDurationMs?: number;
  errorMessage?: string;
  retryCount: number;
  relatedPaymentId?: string;
  relatedSubscriptionId?: string;
  metadata?: Record<string, any>;
  receivedAt: Date;
  processedAt?: Date;
}

export interface AuditLog {
  id: string;
  entityType: string; // subscription, payment, payment_method
  entityId: string;
  action: string; // created, updated, deleted, status_changed
  actorType: string; // user, system, webhook
  actorId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changes?: Record<string, any>;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// ========================================
// API 응답 타입
// ========================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ========================================
// 토스페이먼츠 관련 타입
// ========================================

export interface TossPaymentData {
  paymentKey: string;
  orderId: string;
  amount: number;
  status: string;
  approvedAt?: string;
  billingKey?: string;
  card?: {
    issuerCode: string;
    acquirerCode: string;
    number: string;
    validThru: string;
  };
}

export interface TossBillingKeyData {
  billingKey: string;
  customerKey: string;
  card: {
    issuerCode: string;
    acquirerCode: string;
    number: string;
    validThru: string;
  };
}

// ========================================
// 에러 타입
// ========================================

export class BillingError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'BillingError';
  }
}

export class TossPaymentError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'TossPaymentError';
  }
}

// ========================================
// 유틸리티 타입
// ========================================

export type SubscriptionWithRelations = Subscription & {
  plan: BillingPlan;
  paymentMethod?: PaymentMethod;
  user: any;
};

export type PaymentWithRelations = Payment & {
  subscription: Subscription;
  paymentMethod?: PaymentMethod;
};

// UI 관련 타입
export interface PaymentFlowState {
  step: 'plan' | 'payment' | 'processing' | 'success' | 'failed';
  isLoading: boolean;
  error: string | null;
  orderId?: string;
  subscriptionId?: string;
}

export interface RecoveryState {
  isChecking: boolean;
  hasIncompletePayment: boolean;
  paymentData?: any;
  error?: string;
}
