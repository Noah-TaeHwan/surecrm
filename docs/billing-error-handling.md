# 🚨 SureCRM 결제 시스템 - 예외 처리 완전 가이드

## 📚 목차

1. [예외 상황 분류 및 우선순위](#1-예외-상황-분류-및-우선순위)
2. [결제 진행 중 예외 처리](#2-결제-진행-중-예외-처리)
3. [자동결제 예외 처리](#3-자동결제-예외-처리)
4. [네트워크 및 시스템 예외](#4-네트워크-및-시스템-예외)
5. [사용자 행동 예외](#5-사용자-행동-예외)
6. [복구 시스템](#6-복구-시스템)
7. [모니터링 및 알람](#7-모니터링-및-알람)

---

## 🎯 **1. 예외 상황 분류 및 우선순위**

### **1.1 심각도별 분류**

| 심각도          | 상황                 | 영향도    | 대응 시간 | 예시                       |
| --------------- | -------------------- | --------- | --------- | -------------------------- |
| 🔴 **Critical** | 매출 직접 손실       | 높음      | 즉시      | 결제 완료 후 구독 미활성화 |
| 🟡 **High**     | 사용자 경험 저해     | 중간      | 1시간 내  | 결제창 로딩 실패           |
| 🟢 **Medium**   | 불편하지만 우회 가능 | 낮음      | 24시간 내 | 이메일 알림 지연           |
| ⚪ **Low**      | 로그 및 통계 관련    | 매우 낮음 | 72시간 내 | 대시보드 수치 오차         |

### **1.2 예외 상황 매트릭스**

```typescript
const ExceptionMatrix = {
  payment_flow: {
    payment_window_closed: 'HIGH', // 결제창 강제 종료
    payment_confirmation_failed: 'CRITICAL', // 결제 승인 실패
    redirect_failed: 'CRITICAL', // 리다이렉트 실패
    duplicate_payment: 'CRITICAL', // 중복 결제
  },

  auto_billing: {
    billing_key_expired: 'HIGH', // 빌링키 만료
    insufficient_funds: 'MEDIUM', // 잔액 부족
    card_suspended: 'HIGH', // 카드 정지
    auto_payment_failed: 'HIGH', // 자동결제 실패
  },

  system: {
    webhook_failed: 'CRITICAL', // 웹훅 처리 실패
    database_error: 'CRITICAL', // DB 오류
    network_timeout: 'HIGH', // 네트워크 타임아웃
    service_unavailable: 'CRITICAL', // 서비스 다운
  },

  user_behavior: {
    browser_crashed: 'HIGH', // 브라우저 크래시
    network_disconnected: 'HIGH', // 네트워크 끊김
    page_refresh: 'MEDIUM', // 새로고침
    back_button: 'MEDIUM', // 뒤로가기
  },
};
```

---

## 💳 **2. 결제 진행 중 예외 처리**

### **2.1 결제창 관련 예외**

#### **상황 1: 결제창 강제 종료**

```typescript
// app/features/billing/hooks/usePaymentFlow.ts
export function usePaymentFlow() {
  const [paymentState, setPaymentState] = useState<PaymentState>('idle');

  useEffect(() => {
    // 페이지 이탈 감지
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (paymentState === 'processing') {
        e.preventDefault();
        e.returnValue = '결제가 진행 중입니다. 페이지를 벗어나시겠습니까?';

        // 결제 중단 로그 기록
        logPaymentAbandonment();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [paymentState]);

  const logPaymentAbandonment = async () => {
    await fetch('/api/billing/log/abandonment', {
      method: 'POST',
      body: JSON.stringify({
        orderId: currentOrderId,
        stage: 'payment_window',
        timestamp: new Date().toISOString(),
      }),
    });
  };
}
```

#### **상황 2: 결제 승인 실패**

```typescript
// app/routes/api.billing.payment.confirm.ts
export async function action({ request }: Route.ActionArgs) {
  const { paymentKey, orderId, amount } = await request.json();

  try {
    // 토스페이먼츠 결제 승인
    const payment = await tossAPI.confirmPayment(paymentKey, orderId, amount);

    return { success: true, payment };
  } catch (error) {
    // 에러 타입별 분기 처리
    if (error instanceof TossPaymentError) {
      return handleTossPaymentError(error, orderId);
    }

    // 알 수 없는 에러
    await logCriticalError('PAYMENT_CONFIRMATION_UNKNOWN', {
      orderId,
      error: error.message,
      paymentKey,
    });

    return {
      success: false,
      error: 'UNKNOWN_ERROR',
      message: '결제 처리 중 오류가 발생했습니다. 고객센터에 문의해주세요.',
    };
  }
}

function handleTossPaymentError(error: TossPaymentError, orderId: string) {
  switch (error.code) {
    case 'ALREADY_PROCESSED_PAYMENT':
      return {
        success: false,
        error: 'DUPLICATE_PAYMENT',
        message: '이미 처리된 결제입니다.',
        action: 'redirect_to_success',
      };

    case 'PROVIDER_ERROR':
      return {
        success: false,
        error: 'CARD_COMPANY_ERROR',
        message:
          '카드사 처리 중 오류가 발생했습니다. 다른 카드로 시도해보세요.',
        action: 'retry_with_different_card',
      };

    case 'INVALID_REQUEST':
      return {
        success: false,
        error: 'INVALID_PAYMENT_DATA',
        message: '결제 정보가 올바르지 않습니다.',
        action: 'restart_payment',
      };

    default:
      return {
        success: false,
        error: 'TOSS_ERROR',
        message: error.message,
        action: 'contact_support',
      };
  }
}
```

### **2.2 리다이렉트 실패 처리**

```typescript
// app/features/billing/components/PaymentRecovery.tsx
export function PaymentRecovery() {
  const [isChecking, setIsChecking] = useState(true);
  const [recoveryResult, setRecoveryResult] = useState<RecoveryResult | null>(
    null
  );

  useEffect(() => {
    checkPaymentStatus();
  }, []);

  const checkPaymentStatus = async () => {
    try {
      // URL에서 orderId 추출 (로컬스토리지에서도 확인)
      const orderId = getOrderIdFromUrl() || getOrderIdFromStorage();

      if (!orderId) {
        setRecoveryResult({ status: 'no_payment_found' });
        return;
      }

      // 서버에서 결제 상태 확인
      const response = await fetch(`/api/billing/payment/status/${orderId}`);
      const result = await response.json();

      setRecoveryResult(result);
    } catch (error) {
      setRecoveryResult({
        status: 'check_failed',
        message: '결제 상태 확인 중 오류가 발생했습니다.',
      });
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return <PaymentStatusCheckLoader />;
  }

  return (
    <div className="max-w-md mx-auto p-6">
      {recoveryResult?.status === 'completed' && (
        <PaymentSuccessRecovery result={recoveryResult} />
      )}

      {recoveryResult?.status === 'failed' && (
        <PaymentFailedRecovery result={recoveryResult} />
      )}

      {recoveryResult?.status === 'pending' && (
        <PaymentPendingRecovery result={recoveryResult} />
      )}

      {recoveryResult?.status === 'no_payment_found' && (
        <NoPaymentFoundRecovery />
      )}
    </div>
  );
}
```

### **2.3 중복 결제 방지 및 처리**

```typescript
// app/lib/payments/duplicate-prevention.ts
export class DuplicatePaymentPrevention {
  private static readonly LOCK_DURATION = 10 * 60 * 1000; // 10분

  static async acquirePaymentLock(
    userId: string,
    orderId: string
  ): Promise<boolean> {
    const lockKey = `payment_lock:${userId}:${orderId}`;

    // Redis 또는 메모리 캐시 사용
    const existingLock = await cache.get(lockKey);

    if (existingLock) {
      return false; // 이미 진행 중인 결제 있음
    }

    await cache.set(lockKey, Date.now(), this.LOCK_DURATION);
    return true;
  }

  static async releasePaymentLock(
    userId: string,
    orderId: string
  ): Promise<void> {
    const lockKey = `payment_lock:${userId}:${orderId}`;
    await cache.delete(lockKey);
  }

  static async handleDuplicatePayment(
    orderId: string
  ): Promise<DuplicateHandlingResult> {
    // 기존 결제 조회
    const existingPayment = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .limit(1);

    if (existingPayment.length === 0) {
      return { action: 'allow', reason: 'no_existing_payment' };
    }

    const payment = existingPayment[0];

    switch (payment.status) {
      case 'completed':
        return {
          action: 'reject',
          reason: 'already_completed',
          redirect: '/billing/success',
        };

      case 'failed':
        return {
          action: 'allow',
          reason: 'previous_failed',
          cleanup: () => this.cleanupFailedPayment(orderId),
        };

      case 'pending':
        return {
          action: 'reject',
          reason: 'still_processing',
          message: '결제가 이미 진행 중입니다. 잠시 후 다시 시도해주세요.',
        };

      default:
        return { action: 'allow', reason: 'unknown_status' };
    }
  }
}
```

---

## 🔄 **3. 자동결제 예외 처리**

### **3.1 자동결제 실패 분류 및 대응**

```typescript
// app/lib/payments/billing/auto-payment-error-handler.ts
export class AutoPaymentErrorHandler {
  async handleBillingError(
    error: BillingError,
    subscription: Subscription
  ): Promise<ErrorHandlingResult> {
    const errorCode = error.code;
    const retryCount = subscription.retryCount || 0;

    switch (errorCode) {
      case 'INSUFFICIENT_FUNDS':
        return this.handleInsufficientFunds(subscription, retryCount);

      case 'EXPIRED_CARD':
      case 'SUSPENDED_CARD':
        return this.handleCardIssue(subscription, errorCode);

      case 'BILLING_KEY_NOT_FOUND':
      case 'BILLING_KEY_EXPIRED':
        return this.handleBillingKeyIssue(subscription);

      case 'EXCEED_MAX_AMOUNT':
        return this.handleLimitExceeded(subscription);

      case 'NETWORK_ERROR':
      case 'PROVIDER_ERROR':
        return this.handleTemporaryError(subscription, retryCount);

      default:
        return this.handleUnknownError(subscription, error);
    }
  }

  private async handleInsufficientFunds(
    subscription: Subscription,
    retryCount: number
  ): Promise<ErrorHandlingResult> {
    if (retryCount < 3) {
      // 잔액 부족은 3일, 7일, 14일 후 재시도
      const nextRetryDate = this.calculateNextRetryDate(retryCount + 1);

      await this.updateSubscriptionStatus(subscription.id, {
        status: 'past_due',
        retryCount: retryCount + 1,
        nextRetryDate,
        lastError: 'INSUFFICIENT_FUNDS',
      });

      // 고객에게 잔액 부족 알림
      await this.sendNotification(subscription.userId, {
        type: 'PAYMENT_FAILED_INSUFFICIENT_FUNDS',
        retryDate: nextRetryDate,
        amount: subscription.plan.price,
      });

      return {
        action: 'retry_scheduled',
        nextRetryDate,
        notificationSent: true,
      };
    } else {
      // 3회 시도 후에도 실패 시 일시정지
      return this.suspendSubscription(
        subscription,
        'PAYMENT_FAILED_MAX_RETRIES'
      );
    }
  }

  private async handleCardIssue(
    subscription: Subscription,
    errorCode: string
  ): Promise<ErrorHandlingResult> {
    await this.updateSubscriptionStatus(subscription.id, {
      status: 'requires_payment_method',
      lastError: errorCode,
    });

    // 결제수단 변경 요청 알림
    await this.sendNotification(subscription.userId, {
      type: 'PAYMENT_METHOD_UPDATE_REQUIRED',
      reason: errorCode,
      updateUrl: `${env.service.url}/billing/payment-method`,
    });

    return {
      action: 'requires_user_action',
      userAction: 'update_payment_method',
      notificationSent: true,
    };
  }

  private calculateNextRetryDate(retryCount: number): Date {
    const daysToAdd = retryCount === 1 ? 3 : retryCount === 2 ? 7 : 14;
    return addDays(new Date(), daysToAdd);
  }
}
```

### **3.2 빌링키 만료 처리**

```typescript
// app/lib/payments/billing/billing-key-manager.ts
export class BillingKeyManager {
  async validateBillingKey(billingKey: string): Promise<BillingKeyValidation> {
    try {
      const response = await tossAPI.getBillingKey(billingKey);

      return {
        isValid: true,
        cardInfo: {
          issuer: response.card.issuerCode,
          last4: response.card.number.slice(-4),
          expiry: response.card.validThru,
        },
      };
    } catch (error) {
      if (error.code === 'BILLING_KEY_NOT_FOUND') {
        return { isValid: false, reason: 'not_found' };
      }

      if (error.code === 'BILLING_KEY_EXPIRED') {
        return { isValid: false, reason: 'expired' };
      }

      return { isValid: false, reason: 'unknown' };
    }
  }

  async handleExpiredBillingKey(subscription: Subscription): Promise<void> {
    // 1. 구독 상태를 "결제수단 필요"로 변경
    await this.updateSubscriptionStatus(subscription.id, {
      status: 'requires_payment_method',
      lastError: 'BILLING_KEY_EXPIRED',
    });

    // 2. 만료된 빌링키 비활성화
    await this.deactivateBillingKey(subscription.billingKeyId);

    // 3. 고객에게 결제수단 재등록 요청
    await this.sendPaymentMethodUpdateRequest(subscription);

    // 4. 7일 유예기간 설정
    await this.setGracePeriod(subscription.id, 7);
  }

  private async sendPaymentMethodUpdateRequest(
    subscription: Subscription
  ): Promise<void> {
    const updateUrl = `${env.service.url}/billing/payment-method/update?token=${subscription.updateToken}`;

    await emailService.send({
      to: subscription.user.email,
      template: 'billing_key_expired',
      data: {
        customerName: subscription.user.name,
        planName: subscription.plan.name,
        updateUrl,
        gracePeriodEnd: addDays(new Date(), 7),
      },
    });
  }
}
```

---

## 🌐 **4. 네트워크 및 시스템 예외**

### **4.1 웹훅 처리 실패**

```typescript
// app/lib/payments/webhooks/webhook-processor.ts
export class WebhookProcessor {
  private static readonly MAX_RETRIES = 5;
  private static readonly RETRY_DELAYS = [1000, 2000, 5000, 10000, 30000]; // ms

  async processWebhook(webhookData: WebhookData): Promise<ProcessingResult> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        const result = await this.executeWebhookProcessing(webhookData);

        // 성공 시 재시도 기록 삭제
        await this.clearRetryRecord(webhookData.id);

        return result;
      } catch (error) {
        lastError = error;

        // 재시도 기록 저장
        await this.saveRetryRecord(webhookData.id, attempt + 1, error);

        if (attempt < this.MAX_RETRIES - 1) {
          await this.delay(this.RETRY_DELAYS[attempt]);
          continue;
        }
      }
    }

    // 모든 재시도 실패
    await this.handleWebhookFailure(webhookData, lastError!);
    throw lastError;
  }

  private async handleWebhookFailure(
    webhookData: WebhookData,
    error: Error
  ): Promise<void> {
    // 1. 실패 로그 기록
    await db.insert(webhookFailures).values({
      id: crypto.randomUUID(),
      webhookId: webhookData.id,
      eventType: webhookData.eventType,
      payload: webhookData,
      error: error.message,
      retriesAttempted: this.MAX_RETRIES,
      failedAt: new Date(),
    });

    // 2. 관리자에게 긴급 알림
    await this.sendCriticalAlert({
      type: 'WEBHOOK_PROCESSING_FAILED',
      webhookId: webhookData.id,
      eventType: webhookData.eventType,
      error: error.message,
    });

    // 3. 수동 처리를 위한 대기열에 추가
    await this.queueForManualProcessing(webhookData);
  }

  private async queueForManualProcessing(
    webhookData: WebhookData
  ): Promise<void> {
    await db.insert(manualProcessingQueue).values({
      id: crypto.randomUUID(),
      type: 'webhook_failure',
      priority: 'high',
      data: webhookData,
      createdAt: new Date(),
      status: 'pending',
    });
  }
}
```

### **4.2 데이터베이스 연결 실패**

```typescript
// app/lib/database/connection-manager.ts
export class DatabaseConnectionManager {
  private static reconnectAttempts = 0;
  private static readonly MAX_RECONNECT_ATTEMPTS = 10;

  static async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    for (let attempt = 1; attempt <= this.MAX_RECONNECT_ATTEMPTS; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (this.isDatabaseConnectionError(error)) {
          console.error(
            `DB 연결 실패 (시도 ${attempt}/${this.MAX_RECONNECT_ATTEMPTS}):`,
            error
          );

          if (attempt === this.MAX_RECONNECT_ATTEMPTS) {
            // 최종 실패 시 알림 발송
            await this.sendDatabaseFailureAlert(error);
            throw new Error(
              '데이터베이스 연결에 실패했습니다. 잠시 후 다시 시도해주세요.'
            );
          }

          // 지수 백오프로 재시도
          await this.delay(Math.pow(2, attempt) * 1000);
          continue;
        }

        // DB 연결 오류가 아닌 경우 즉시 실패
        throw error;
      }
    }

    throw new Error('예상치 못한 오류가 발생했습니다.');
  }

  private static isDatabaseConnectionError(error: any): boolean {
    const connectionErrors = [
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
      'CONNECTION_LOST',
      'ER_CON_COUNT_ERROR',
    ];

    return connectionErrors.some(
      errorCode => error.code === errorCode || error.message.includes(errorCode)
    );
  }
}
```

---

## 👤 **5. 사용자 행동 예외**

### **5.1 브라우저 크래시 복구**

```typescript
// app/features/billing/hooks/usePaymentRecovery.ts
export function usePaymentRecovery() {
  const [recoveryState, setRecoveryState] = useState<RecoveryState>('checking');

  useEffect(() => {
    checkForIncompletePayment();
  }, []);

  const checkForIncompletePayment = async () => {
    try {
      // 로컬스토리지에서 진행 중이던 결제 정보 확인
      const incompletePayment = localStorage.getItem('incomplete_payment');

      if (!incompletePayment) {
        setRecoveryState('no_recovery_needed');
        return;
      }

      const paymentData = JSON.parse(incompletePayment);

      // 만료 시간 확인 (30분 이내만 복구 시도)
      const paymentTime = new Date(paymentData.timestamp);
      const now = new Date();
      const minutesDiff = (now.getTime() - paymentTime.getTime()) / (1000 * 60);

      if (minutesDiff > 30) {
        localStorage.removeItem('incomplete_payment');
        setRecoveryState('expired');
        return;
      }

      // 서버에서 결제 상태 확인
      const status = await checkPaymentStatus(paymentData.orderId);

      setRecoveryState('found');
      setRecoveryData({
        ...paymentData,
        currentStatus: status,
      });
    } catch (error) {
      console.error('결제 복구 확인 실패:', error);
      setRecoveryState('error');
    }
  };

  const resumePayment = async (recoveryData: RecoveryData) => {
    try {
      if (recoveryData.currentStatus === 'completed') {
        // 이미 완료된 결제
        router.push('/billing/success');
        return;
      }

      if (recoveryData.currentStatus === 'failed') {
        // 실패한 결제 재시도
        router.push('/billing/setup?retry=true');
        return;
      }

      // 진행 중인 결제 계속
      await continuePaymentFlow(recoveryData);
    } finally {
      localStorage.removeItem('incomplete_payment');
    }
  };
}
```

### **5.2 네트워크 연결 끊김 처리**

```typescript
// app/features/billing/hooks/useNetworkRecovery.ts
export function useNetworkRecovery() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasPaymentPending, setHasPaymentPending] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);

      if (hasPaymentPending) {
        // 네트워크 복구 시 결제 상태 재확인
        recheckPaymentStatus();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [hasPaymentPending]);

  const recheckPaymentStatus = async () => {
    try {
      const pendingPayments = JSON.parse(
        localStorage.getItem('pending_payments') || '[]'
      );

      for (const payment of pendingPayments) {
        const status = await fetch(
          `/api/billing/payment/status/${payment.orderId}`
        );
        const result = await status.json();

        if (result.status === 'completed') {
          // 결제 완료 확인
          showPaymentCompletedNotification(payment);
          removePendingPayment(payment.orderId);
        }
      }
    } catch (error) {
      console.error('결제 상태 재확인 실패:', error);
    }
  };
}
```

---

## 🔧 **6. 복구 시스템**

### **6.1 자동 복구 시스템**

```typescript
// app/lib/recovery/auto-recovery-service.ts
export class AutoRecoveryService {
  // 매시간 실행되는 복구 작업
  async runHourlyRecovery(): Promise<RecoveryReport> {
    const recoveryTasks = [
      this.recoverPendingPayments(),
      this.recoverFailedWebhooks(),
      this.recoverStuckSubscriptions(),
      this.recoverOrphanedBillingKeys(),
    ];

    const results = await Promise.allSettled(recoveryTasks);

    return this.generateRecoveryReport(results);
  }

  private async recoverPendingPayments(): Promise<RecoveryTaskResult> {
    // 30분 이상 pending 상태인 결제들 확인
    const pendingPayments = await db
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.status, 'pending'),
          lt(payments.createdAt, subMinutes(new Date(), 30))
        )
      );

    let recovered = 0;
    let failed = 0;

    for (const payment of pendingPayments) {
      try {
        // 토스페이먼츠에서 실제 상태 확인
        const tossPayment = await tossAPI.getPayment(payment.paymentKey);

        if (tossPayment.status === 'DONE') {
          // 결제 완료 상태로 업데이트
          await this.completePayment(payment.id, tossPayment);
          recovered++;
        } else if (tossPayment.status === 'CANCELED') {
          // 취소 상태로 업데이트
          await this.cancelPayment(payment.id);
          recovered++;
        }
      } catch (error) {
        console.error(`결제 복구 실패 (${payment.id}):`, error);
        failed++;
      }
    }

    return {
      taskName: 'recover_pending_payments',
      processed: pendingPayments.length,
      recovered,
      failed,
    };
  }

  private async recoverFailedWebhooks(): Promise<RecoveryTaskResult> {
    // 실패한 웹훅들을 재처리
    const failedWebhooks = await db
      .select()
      .from(webhookFailures)
      .where(eq(webhookFailures.status, 'failed'))
      .limit(50);

    let recovered = 0;

    for (const webhook of failedWebhooks) {
      try {
        await this.reprocessWebhook(webhook);
        recovered++;
      } catch (error) {
        console.error(`웹훅 재처리 실패 (${webhook.id}):`, error);
      }
    }

    return {
      taskName: 'recover_failed_webhooks',
      processed: failedWebhooks.length,
      recovered,
      failed: failedWebhooks.length - recovered,
    };
  }
}
```

### **6.2 수동 복구 도구**

```typescript
// app/features/admin/components/PaymentRecoveryTool.tsx
export function PaymentRecoveryTool() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recoveryResult, setRecoveryResult] = useState<RecoveryResult | null>(
    null
  );

  const searchPayment = async () => {
    try {
      const response = await fetch(
        `/api/admin/payments/search?q=${searchQuery}`
      );
      const payments = await response.json();

      setSearchResults(payments);
    } catch (error) {
      toast.error('결제 조회 실패');
    }
  };

  const recoverPayment = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/recover`, {
        method: 'POST',
      });

      const result = await response.json();
      setRecoveryResult(result);

      if (result.success) {
        toast.success('결제 복구 완료');
      } else {
        toast.error(`복구 실패: ${result.error}`);
      }
    } catch (error) {
      toast.error('복구 요청 실패');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input
          placeholder="주문번호, 이메일, 또는 결제키로 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button onClick={searchPayment}>검색</Button>
      </div>

      {searchResults?.map((payment) => (
        <PaymentRecoveryCard
          key={payment.id}
          payment={payment}
          onRecover={() => recoverPayment(payment.id)}
        />
      ))}

      {recoveryResult && <RecoveryResultDisplay result={recoveryResult} />}
    </div>
  );
}
```

---

## 📊 **7. 모니터링 및 알람**

### **7.1 실시간 모니터링**

```typescript
// app/lib/monitoring/payment-monitor.ts
export class PaymentMonitor {

  async checkSystemHealth(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkPaymentSuccessRate(),
      this.checkWebhookProcessingHealth(),
      this.checkDatabaseHealth(),
      this.checkTossPaymentsConnectivity()
    ]);

    return {
      overall: this.calculateOverallHealth(checks),
      details: {
        payment_success_rate: checks[0],
        webhook_processing: checks[1],
        database: checks[2],
        toss_connectivity: checks[3]
      },
      timestamp: new Date()
    };
  }

  private async checkPaymentSuccessRate(): Promise<HealthCheck> {
    const last24Hours = subHours(new Date(), 24);

    const stats = await db.select({
      total: count(),
      successful: count(case().when(eq(payments.status, 'completed'), 1))
    })
    .from(payments)
    .where(gte(payments.createdAt, last24Hours));

    const successRate = stats.successful / stats.total * 100;

    return {
      status: successRate >= 95 ? 'healthy' : successRate >= 90 ? 'warning' : 'critical',
      value: successRate,
      threshold: 95,
      message: `결제 성공률: ${successRate.toFixed(1)}%`
    };
  }

  async sendAlert(alert: Alert): Promise<void> {
    // Slack, 이메일, SMS 등으로 알림 발송
    const alertChannels = [
      this.sendSlackAlert(alert),
      this.sendEmailAlert(alert)
    ];

    if (alert.severity === 'critical') {
      alertChannels.push(this.sendSmsAlert(alert));
    }

    await Promise.allSettled(alertChannels);
  }
}
```

### **7.2 알람 규칙**

```typescript
const AlertRules = {
  critical: [
    {
      name: 'payment_success_rate_critical',
      condition: 'payment_success_rate < 90%',
      message: '결제 성공률이 90% 미만입니다',
      action: 'immediate_investigation',
    },
    {
      name: 'webhook_processing_failed',
      condition: 'webhook_failures > 5 in 10min',
      message: '웹훅 처리 실패가 10분간 5건 이상 발생',
      action: 'check_toss_status',
    },
    {
      name: 'database_connection_lost',
      condition: 'db_connection_errors > 3 in 5min',
      message: '데이터베이스 연결 오류 다발 발생',
      action: 'escalate_to_infrastructure',
    },
  ],

  warning: [
    {
      name: 'payment_success_rate_warning',
      condition: 'payment_success_rate < 95%',
      message: '결제 성공률이 95% 미만입니다',
      action: 'monitor_closely',
    },
    {
      name: 'auto_payment_failures',
      condition: 'auto_payment_failures > 10 in 1hour',
      message: '자동결제 실패가 1시간간 10건 이상 발생',
      action: 'review_customer_notifications',
    },
  ],

  info: [
    {
      name: 'high_churn_rate',
      condition: 'daily_churn_rate > 3%',
      message: '일간 이탈률이 3%를 초과했습니다',
      action: 'analyze_churn_reasons',
    },
  ],
};
```

---

## 📞 **8. 고객지원 플레이북**

### **8.1 고객 문의 대응 가이드**

```typescript
const CustomerSupportGuide = {
  '결제가 안돼요': {
    initial_questions: [
      '어떤 단계에서 문제가 발생했나요?',
      '사용하신 카드 종류는 무엇인가요?',
      '에러 메시지가 표시되었다면 정확한 내용을 알려주세요',
    ],

    troubleshooting_steps: [
      '1. 브라우저 캐시 및 쿠키 삭제',
      '2. 다른 브라우저로 시도',
      '3. 다른 카드로 시도',
      '4. 카드사 한도 확인',
      '5. 해외결제 차단 여부 확인',
    ],

    escalation_criteria: [
      '모든 해결 방법 시도 후에도 실패',
      '시스템 오류로 의심되는 경우',
      '결제는 됐는데 서비스 접근 불가',
    ],
  },

  '결제했는데 서비스를 못써요': {
    immediate_actions: [
      '1. 결제 내역 확인 (주문번호 수집)',
      '2. 구독 상태 조회',
      '3. 이메일 수신 여부 확인',
    ],

    resolution_steps: [
      '결제 완료 + 구독 미활성화 → 즉시 활성화',
      '결제 실패 + 오해 → 재결제 안내',
      '시스템 오류 → 기술팀 에스컬레이션',
    ],
  },
};
```

---

**📝 마지막 업데이트**: 2024-01-15  
**📋 문서 버전**: v1.0  
**👨‍💻 작성자**: AI Assistant + 개발팀
