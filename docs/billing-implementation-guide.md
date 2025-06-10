# 🔧 SureCRM 구독 결제 시스템 - 기술 구현 가이드

## 📚 목차

1. [프로젝트 설정](#1-프로젝트-설정)
2. [폴더 구조 생성](#2-폴더-구조-생성)
3. [핵심 서비스 구현](#3-핵심-서비스-구현)
4. [API 엔드포인트 구현](#4-api-엔드포인트-구현)
5. [UI 컴포넌트 구현](#5-ui-컴포넌트-구현)
6. [테스트 코드](#6-테스트-코드)

---

## 🚀 **1. 프로젝트 설정**

### **1.1 환경 변수 설정**

```bash
# .env.local
# 토스페이먼츠 설정
TOSS_CLIENT_KEY=test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq
TOSS_SECRET_KEY=test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R
TOSS_WEBHOOK_SECRET=your_webhook_secret_key

# 결제 환경
PAYMENT_MODE=test
TOSS_BASE_URL=https://api.tosspayments.com

# 서비스 URL
NEXT_PUBLIC_SERVICE_URL=http://localhost:3000
SERVICE_URL=http://localhost:3000

# 암호화 키
BILLING_ENCRYPTION_KEY=your_32_character_encryption_key
```

### **1.2 패키지 설치**

```bash
# 토스페이먼츠 SDK
npm install @tosspayments/payment-sdk

# 추가 유틸리티
npm install crypto-js date-fns uuid
npm install -D @types/crypto-js @types/uuid
```

---

## 📁 **2. 폴더 구조 생성**

```bash
# billing 모듈 폴더 생성
mkdir -p app/features/billing/{components,hooks,lib,pages,types}
mkdir -p app/features/billing/components/{plan-selection,payment,subscription,shared}
mkdir -p app/features/billing/lib/{api,services,utils}
mkdir -p app/lib/payments/{toss,billing,webhooks}
```

### **2.1 타입 정의**

```typescript
// app/features/billing/types/billing.types.ts
export interface BillingPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billingInterval: 'month' | 'year';
  features: string[];
  maxClients: number;
  isActive: boolean;
  isPopular: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  nextBillingDate?: Date;
  paymentMethodId?: string;
  retryCount: number;
  lastError?: string;
  plan: BillingPlan;
  paymentMethod?: PaymentMethod;
}

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete';

export interface PaymentMethod {
  id: string;
  tossBillingKey: string;
  cardCompany: string;
  cardType: string;
  cardLast4: string;
  isActive: boolean;
  isDefault: boolean;
}

export interface Payment {
  id: string;
  subscriptionId: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  tossPaymentKey?: string;
  paidAt?: Date;
  failureReason?: string;
}

export type PaymentStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'canceled'
  | 'refunded';
```

---

## ⚙️ **3. 핵심 서비스 구현**

### **3.1 토스페이먼츠 클라이언트**

```typescript
// app/lib/payments/toss/toss-client.ts
import { TossPayments } from '@tosspayments/payment-sdk';
import { env } from '~/lib/env';

export class TossPaymentsClient {
  private client: TossPayments;

  constructor() {
    this.client = TossPayments(env.toss.clientKey);
  }

  async requestPayment(params: {
    amount: number;
    orderId: string;
    orderName: string;
    customerName: string;
    customerEmail: string;
  }) {
    return await this.client.requestPayment('카드', {
      amount: params.amount,
      orderId: params.orderId,
      orderName: params.orderName,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      successUrl: `${env.service.publicUrl}/billing/success`,
      failUrl: `${env.service.publicUrl}/billing/failed`,
    });
  }

  async requestBillingAuth(params: {
    customerKey: string;
    customerName: string;
    customerEmail: string;
  }) {
    return await this.client.requestBillingAuth('카드', {
      customerKey: params.customerKey,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      successUrl: `${env.service.publicUrl}/billing/auth/success`,
      failUrl: `${env.service.publicUrl}/billing/auth/failed`,
    });
  }
}
```

### **3.2 서버사이드 API 클라이언트**

```typescript
// app/lib/payments/toss/toss-api.ts
export class TossPaymentsAPI {
  private baseUrl = 'https://api.tosspayments.com';
  private secretKey = process.env.TOSS_SECRET_KEY!;

  private getHeaders() {
    const auth = Buffer.from(`${this.secretKey}:`).toString('base64');
    return {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    };
  }

  async confirmPayment(paymentKey: string, orderId: string, amount: number) {
    const response = await fetch(`${this.baseUrl}/v1/payments/confirm`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new TossPaymentError(error.code, error.message);
    }

    return response.json();
  }

  async payWithBillingKey(params: {
    billingKey: string;
    customerKey: string;
    amount: number;
    orderId: string;
    orderName: string;
  }) {
    const response = await fetch(
      `${this.baseUrl}/v1/billing/${params.billingKey}`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          customerKey: params.customerKey,
          amount: params.amount,
          orderId: params.orderId,
          orderName: params.orderName,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new TossPaymentError(error.code, error.message);
    }

    return response.json();
  }
}

export class TossPaymentError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'TossPaymentError';
  }
}
```

### **3.3 구독 관리 서비스**

```typescript
// app/features/billing/lib/services/subscription-service.ts
export class SubscriptionService {
  async createSubscription(userId: string, planId: string) {
    // 1. 기존 활성 구독 확인
    const existingSubscription = await this.getUserActiveSubscription(userId);
    if (existingSubscription) {
      throw new Error('이미 활성 구독이 있습니다.');
    }

    // 2. 플랜 조회
    const plan = await this.getPlan(planId);
    if (!plan || !plan.isActive) {
      throw new Error('유효하지 않은 플랜입니다.');
    }

    // 3. 구독 생성
    const subscriptionId = crypto.randomUUID();
    const orderId = `sub_${subscriptionId}_${Date.now()}`;

    await db.insert(billingSubscriptions).values({
      id: subscriptionId,
      userId,
      planId,
      status: 'incomplete',
      currentPeriodStart: new Date(),
      currentPeriodEnd: addMonths(new Date(), 1),
      nextBillingDate: addMonths(new Date(), 1),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 4. 결제 정보 생성
    const customerKey = `customer_${userId}`;

    return {
      subscriptionId,
      orderId,
      customerKey,
      amount: plan.price,
      planName: plan.name,
    };
  }

  async confirmSubscription(orderId: string, tossPayment: any) {
    // 1. 주문 정보로 구독 찾기
    const payment = await this.getPaymentByOrderId(orderId);
    if (!payment) {
      throw new Error('결제 정보를 찾을 수 없습니다.');
    }

    // 2. 결제 완료 처리
    await db
      .update(billingPayments)
      .set({
        status: 'completed',
        tossPaymentKey: tossPayment.paymentKey,
        paidAt: new Date(tossPayment.approvedAt),
        updatedAt: new Date(),
      })
      .where(eq(billingPayments.orderId, orderId));

    // 3. 빌링키 저장
    if (tossPayment.billingKey) {
      await this.saveBillingKey(payment.subscriptionId, tossPayment);
    }

    // 4. 구독 활성화
    await db
      .update(billingSubscriptions)
      .set({
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(billingSubscriptions.id, payment.subscriptionId));

    // 5. 환영 이메일 발송
    await this.sendWelcomeEmail(payment.subscriptionId);
  }

  private async saveBillingKey(subscriptionId: string, tossPayment: any) {
    const subscription = await this.getSubscription(subscriptionId);

    // 고객키 생성/조회
    let customerKey = await db.query.billingCustomerKeys.findFirst({
      where: eq(billingCustomerKeys.userId, subscription.userId),
    });

    if (!customerKey) {
      const customerKeyId = crypto.randomUUID();
      await db.insert(billingCustomerKeys).values({
        id: customerKeyId,
        userId: subscription.userId,
        tossCustomerKey: `customer_${subscription.userId}`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      customerKey = { id: customerKeyId };
    }

    // 결제수단 저장
    const paymentMethodId = crypto.randomUUID();
    await db.insert(billingPaymentMethods).values({
      id: paymentMethodId,
      customerKeyId: customerKey.id,
      tossBillingKey: tossPayment.billingKey,
      cardCompany: tossPayment.card?.issuerCode,
      cardType: tossPayment.card?.acquirerCode,
      cardLast4: tossPayment.card?.number?.slice(-4),
      isActive: true,
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 구독에 결제수단 연결
    await db
      .update(billingSubscriptions)
      .set({
        paymentMethodId,
        updatedAt: new Date(),
      })
      .where(eq(billingSubscriptions.id, subscriptionId));
  }
}
```

### **3.4 자동결제 서비스**

```typescript
// app/lib/payments/billing/auto-billing-service.ts
export class AutoBillingService {
  async processDueSubscriptions() {
    const today = new Date();

    // 오늘 결제 예정인 구독들 조회
    const dueSubscriptions = await db.query.billingSubscriptions.findMany({
      where: and(
        eq(billingSubscriptions.status, 'active'),
        lte(billingSubscriptions.nextBillingDate, today),
        isNotNull(billingSubscriptions.paymentMethodId)
      ),
      with: {
        plan: true,
        paymentMethod: true,
        user: true,
      },
      limit: 100,
    });

    console.log(`${dueSubscriptions.length}개 구독 자동결제 처리 시작`);

    for (const subscription of dueSubscriptions) {
      try {
        await this.processSingleSubscription(subscription);
      } catch (error) {
        console.error(`구독 ${subscription.id} 자동결제 실패:`, error);
        await this.handleAutoPaymentFailure(subscription, error);
      }
    }
  }

  private async processSingleSubscription(
    subscription: SubscriptionWithRelations
  ) {
    const orderId = `auto_${subscription.id}_${Date.now()}`;

    try {
      // 1. 자동결제 실행
      const tossAPI = new TossPaymentsAPI();
      const payment = await tossAPI.payWithBillingKey({
        billingKey: subscription.paymentMethod.tossBillingKey,
        customerKey: `customer_${subscription.userId}`,
        amount: subscription.plan.price,
        orderId,
        orderName: `${subscription.plan.name} - ${format(
          new Date(),
          'yyyy년 MM월'
        )}`,
      });

      // 2. 결제 내역 저장
      await db.insert(billingPayments).values({
        id: crypto.randomUUID(),
        subscriptionId: subscription.id,
        paymentMethodId: subscription.paymentMethodId,
        orderId,
        orderName: `${subscription.plan.name} - ${format(
          new Date(),
          'yyyy년 MM월'
        )}`,
        amount: subscription.plan.price,
        finalAmount: subscription.plan.price,
        status: 'completed',
        tossPaymentKey: payment.paymentKey,
        paymentMethod: 'card',
        paymentProvider: 'toss',
        paidAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 3. 구독 갱신
      await db
        .update(billingSubscriptions)
        .set({
          currentPeriodStart: subscription.currentPeriodEnd,
          currentPeriodEnd: addMonths(subscription.currentPeriodEnd, 1),
          nextBillingDate: addMonths(subscription.currentPeriodEnd, 1),
          retryCount: 0,
          lastError: null,
          updatedAt: new Date(),
        })
        .where(eq(billingSubscriptions.id, subscription.id));

      // 4. 결제 완료 알림
      await this.sendPaymentSuccessNotification(subscription, payment);

      console.log(`✅ 구독 ${subscription.id} 자동결제 성공`);
    } catch (error) {
      throw error;
    }
  }

  private async handleAutoPaymentFailure(
    subscription: SubscriptionWithRelations,
    error: any
  ) {
    const retryCount = subscription.retryCount + 1;

    if (retryCount <= 3) {
      // 재시도 스케줄링
      const nextRetryDate = this.calculateNextRetryDate(retryCount);

      await db
        .update(billingSubscriptions)
        .set({
          status: 'past_due',
          retryCount,
          nextRetryDate,
          lastError: error.message,
          updatedAt: new Date(),
        })
        .where(eq(billingSubscriptions.id, subscription.id));

      await this.sendPaymentFailureNotification(subscription, retryCount);
    } else {
      // 최대 재시도 초과 - 구독 일시정지
      await db
        .update(billingSubscriptions)
        .set({
          status: 'unpaid',
          lastError: 'MAX_RETRIES_EXCEEDED',
          updatedAt: new Date(),
        })
        .where(eq(billingSubscriptions.id, subscription.id));

      await this.sendSubscriptionSuspendedNotification(subscription);
    }
  }

  private calculateNextRetryDate(retryCount: number): Date {
    const days = retryCount === 1 ? 3 : retryCount === 2 ? 7 : 14;
    return addDays(new Date(), days);
  }
}
```

---

## 🔌 **4. API 엔드포인트 구현**

### **4.1 구독 생성 API**

```typescript
// app/routes/api.billing.subscription.create.ts
import type { Route } from './+types/api.billing.subscription.create';
import { SubscriptionService } from '~/features/billing/lib/services/subscription-service';

export async function action({ request }: Route.ActionArgs) {
  try {
    const { userId, planId } = await request.json();

    const subscriptionService = new SubscriptionService();
    const result = await subscriptionService.createSubscription(userId, planId);

    return { success: true, data: result };
  } catch (error) {
    console.error('구독 생성 실패:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : '구독 생성 중 오류가 발생했습니다.',
    };
  }
}
```

### **4.2 결제 성공 콜백 API**

```typescript
// app/routes/api.billing.payment.success.ts
import type { Route } from './+types/api.billing.payment.success';
import { TossPaymentsAPI } from '~/lib/payments/toss/toss-api';
import { SubscriptionService } from '~/features/billing/lib/services/subscription-service';

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const paymentKey = url.searchParams.get('paymentKey');
  const orderId = url.searchParams.get('orderId');
  const amount = url.searchParams.get('amount');

  if (!paymentKey || !orderId || !amount) {
    return redirect('/billing/failed?error=missing_params');
  }

  try {
    // 1. 토스페이먼츠 결제 승인
    const tossAPI = new TossPaymentsAPI();
    const payment = await tossAPI.confirmPayment(
      paymentKey,
      orderId,
      Number(amount)
    );

    // 2. 구독 활성화
    const subscriptionService = new SubscriptionService();
    await subscriptionService.confirmSubscription(orderId, payment);

    // 3. 성공 페이지로 리다이렉트
    return redirect(`/billing/success?orderId=${orderId}`);
  } catch (error) {
    console.error('결제 승인 실패:', error);
    return redirect(
      `/billing/failed?error=confirmation_failed&orderId=${orderId}`
    );
  }
}
```

### **4.3 토스페이먼츠 웹훅 API**

```typescript
// app/routes/api.webhooks.toss.ts
import type { Route } from './+types/api.webhooks.toss';
import crypto from 'crypto';

export async function action({ request }: Route.ActionArgs) {
  // 1. 웹훅 서명 검증
  const signature = request.headers.get('x-toss-signature');
  const rawBody = await request.text();

  if (!verifyWebhookSignature(rawBody, signature)) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 2. 웹훅 데이터 처리
  try {
    const webhookData = JSON.parse(rawBody);
    await processWebhook(webhookData);

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('웹훅 처리 실패:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

function verifyWebhookSignature(
  body: string,
  signature: string | null
): boolean {
  if (!signature) return false;

  const hash = crypto
    .createHmac('sha256', process.env.TOSS_WEBHOOK_SECRET!)
    .update(body)
    .digest('base64');

  return hash === signature;
}

async function processWebhook(data: any) {
  // 웹훅 로그 저장
  await db.insert(billingWebhookLogs).values({
    id: crypto.randomUUID(),
    eventType: data.eventType,
    provider: 'toss',
    webhookId: data.data?.orderId,
    requestBody: data,
    status: 'received',
    receivedAt: new Date(),
  });

  // 이벤트 타입별 처리
  switch (data.eventType) {
    case 'PAYMENT_STATUS_CHANGED':
      await handlePaymentStatusChanged(data.data);
      break;
    case 'BILLING_KEY_STATUS_CHANGED':
      await handleBillingKeyStatusChanged(data.data);
      break;
    default:
      console.log('처리되지 않은 웹훅:', data.eventType);
  }
}
```

### **4.4 자동결제 크론잡 API**

```typescript
// app/routes/api.cron.auto-billing.ts
import type { Route } from './+types/api.cron.auto-billing';
import { AutoBillingService } from '~/lib/payments/billing/auto-billing-service';

export async function action({ request }: Route.ActionArgs) {
  // Vercel Cron 인증 (운영 환경에서만)
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production') {
    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  try {
    const autoBillingService = new AutoBillingService();
    await autoBillingService.processDueSubscriptions();

    return new Response('Auto billing processed successfully', { status: 200 });
  } catch (error) {
    console.error('자동결제 처리 실패:', error);
    return new Response('Auto billing failed', { status: 500 });
  }
}
```

---

## 🎨 **5. UI 컴포넌트 구현**

### **5.1 구독 플랜 선택 컴포넌트**

```tsx
// app/features/billing/components/plan-selection/PlanCard.tsx
interface PlanCardProps {
  plan: BillingPlan;
  isSelected?: boolean;
  onSelect: (planId: string) => void;
}

export function PlanCard({ plan, isSelected, onSelect }: PlanCardProps) {
  return (
    <div
      className={cn(
        'relative border rounded-lg p-6 cursor-pointer transition-all',
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-200'
          : 'border-gray-200 hover:border-gray-300',
        plan.isPopular && 'ring-2 ring-orange-200 border-orange-500'
      )}
      onClick={() => onSelect(plan.id)}
    >
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full">
            인기
          </span>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
        <p className="text-gray-600 mt-2">{plan.description}</p>

        <div className="mt-4">
          <span className="text-3xl font-bold text-gray-900">
            {plan.price.toLocaleString()}원
          </span>
          <span className="text-gray-600">/월</span>
        </div>

        <ul className="mt-6 space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm text-gray-600">
              <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
              {feature}
            </li>
          ))}
        </ul>

        <Button
          className={cn(
            'w-full mt-6',
            isSelected
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
          )}
        >
          {isSelected ? '선택됨' : '선택하기'}
        </Button>
      </div>
    </div>
  );
}
```

### **5.2 결제 진행 컴포넌트**

```tsx
// app/features/billing/components/payment/PaymentFlow.tsx
export function PaymentFlow({ plan, user }: PaymentFlowProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // 1. 구독 생성
      const subscriptionResponse = await fetch(
        '/api/billing/subscription/create',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            planId: plan.id,
          }),
        }
      );

      const subscriptionResult = await subscriptionResponse.json();

      if (!subscriptionResult.success) {
        throw new Error(subscriptionResult.error);
      }

      // 2. 토스페이먼츠 결제 요청
      const tossClient = new TossPaymentsClient();
      await tossClient.requestPayment({
        amount: plan.price,
        orderId: subscriptionResult.data.orderId,
        orderName: `${plan.name} 구독`,
        customerName: user.name,
        customerEmail: user.email,
      });
    } catch (error) {
      console.error('결제 실패:', error);
      setError(
        error instanceof Error ? error.message : '결제 중 오류가 발생했습니다.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">{plan.name}</h2>
        <p className="text-3xl font-bold text-blue-600 mt-2">
          {plan.price.toLocaleString()}원/월
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">결제 정보</h3>
          <div className="flex justify-between text-sm">
            <span>플랜</span>
            <span>{plan.name}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span>금액</span>
            <span>{plan.price.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
            <span>총 결제금액</span>
            <span>{plan.price.toLocaleString()}원</span>
          </div>
        </div>

        <Button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              결제 진행 중...
            </>
          ) : (
            '결제하기'
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          결제 시 서비스 이용약관 및 개인정보처리방침에 동의한 것으로
          간주됩니다.
        </p>
      </div>
    </div>
  );
}
```

### **5.3 구독 관리 대시보드**

```tsx
// app/features/billing/components/subscription/SubscriptionDashboard.tsx
export function SubscriptionDashboard({
  subscription,
}: SubscriptionDashboardProps) {
  const nextBillingDate = new Date(subscription.nextBillingDate!);
  const daysUntilBilling = differenceInDays(nextBillingDate, new Date());

  return (
    <div className="space-y-6">
      {/* 구독 상태 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{subscription.plan.name}</h2>
            <p className="text-gray-600">현재 구독 중인 플랜</p>
          </div>
          <SubscriptionStatusBadge status={subscription.status} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">월 요금</p>
            <p className="text-lg font-semibold">
              {subscription.plan.price.toLocaleString()}원
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">다음 결제일</p>
            <p className="text-lg font-semibold">
              {format(nextBillingDate, 'yyyy년 MM월 dd일')}
            </p>
            <p className="text-xs text-gray-500">{daysUntilBilling}일 후</p>
          </div>
        </div>
      </div>

      {/* 결제수단 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">결제수단</h3>
        {subscription.paymentMethod ? (
          <PaymentMethodCard paymentMethod={subscription.paymentMethod} />
        ) : (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-4">등록된 결제수단이 없습니다</p>
            <Button variant="outline">결제수단 등록</Button>
          </div>
        )}
      </div>

      {/* 구독 관리 액션 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">구독 관리</h3>
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            결제수단 변경
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Pause className="mr-2 h-4 w-4" />
            구독 일시정지
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-red-600"
          >
            <X className="mr-2 h-4 w-4" />
            구독 취소
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

## 🧪 **6. 테스트 코드**

### **6.1 서비스 단위 테스트**

```typescript
// app/features/billing/lib/services/__tests__/subscription-service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SubscriptionService } from '../subscription-service';

describe('SubscriptionService', () => {
  let subscriptionService: SubscriptionService;

  beforeEach(() => {
    subscriptionService = new SubscriptionService();
  });

  describe('createSubscription', () => {
    it('should create a new subscription successfully', async () => {
      const userId = 'user-123';
      const planId = 'surecrm-pro';

      const result = await subscriptionService.createSubscription(
        userId,
        planId
      );

      expect(result).toHaveProperty('subscriptionId');
      expect(result).toHaveProperty('orderId');
      expect(result).toHaveProperty('customerKey');
      expect(result.amount).toBe(39000);
    });

    it('should throw error if user already has active subscription', async () => {
      const userId = 'user-with-subscription';
      const planId = 'surecrm-pro';

      await expect(
        subscriptionService.createSubscription(userId, planId)
      ).rejects.toThrow('이미 활성 구독이 있습니다.');
    });
  });
});
```

### **6.2 API 통합 테스트**

```typescript
// app/routes/__tests__/api.billing.subscription.create.test.ts
import { describe, it, expect } from 'vitest';

describe('/api/billing/subscription/create', () => {
  it('should create subscription successfully', async () => {
    const response = await fetch('/api/billing/subscription/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test-user',
        planId: 'surecrm-pro',
      }),
    });

    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('subscriptionId');
  });
});
```

### **6.3 E2E 테스트 (Playwright)**

```typescript
// tests/billing/subscription-flow.e2e.test.ts
import { test, expect } from '@playwright/test';

test.describe('구독 결제 플로우', () => {
  test('사용자가 구독을 성공적으로 생성할 수 있다', async ({ page }) => {
    // 1. 로그인
    await page.goto('/login');
    await page.fill('[data-testid=email]', 'test@example.com');
    await page.fill('[data-testid=password]', 'password123');
    await page.click('[data-testid=login-button]');

    // 2. 구독 페이지 이동
    await page.goto('/billing/plans');

    // 3. 플랜 선택
    await page.click('[data-testid=plan-surecrm-pro]');

    // 4. 결제 진행
    await page.click('[data-testid=proceed-payment]');

    // 5. 토스페이먼츠 테스트 카드로 결제
    // (실제 토스페이먼츠 테스트 환경 연동)

    // 6. 결제 완료 확인
    await expect(page).toHaveURL('/billing/success');
    await expect(page.locator('[data-testid=success-message]')).toBeVisible();
  });
});
```

---

**📝 마지막 업데이트**: 2024-01-15  
**📋 문서 버전**: v1.0  
**👨‍💻 작성자**: AI Assistant + 개발팀
