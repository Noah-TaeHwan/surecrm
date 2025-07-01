import crypto from 'crypto';
import { lemonSqueezyConfig } from './config';
import { db } from '~/lib/core/db.server';
import { profiles } from '~/lib/schema/core';
import { eq } from 'drizzle-orm';
import { createAdminClient } from '~/lib/core/supabase';

/**
 * 이메일로 사용자 ID 찾기 (서버사이드 버전)
 */
async function findUserByEmail(email: string): Promise<string | null> {
  try {
    // Supabase Admin API를 사용해서 사용자 찾기
    const supabase = createAdminClient();

    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('사용자 목록 조회 실패:', error);
      return null;
    }

    const user = users.users.find((u: any) => u.email === email);
    return user?.id || null;
  } catch (error) {
    console.error('이메일로 사용자 찾기 실패:', error);
    return null;
  }
}

/**
 * 사용자의 구독을 활성화합니다 (서버사이드 버전)
 */
async function activateUserSubscription(
  userId: string,
  subscriptionEndDate: Date,
  lemonSqueezySubscriptionId?: string
): Promise<void> {
  try {
    console.log('구독 활성화 시작:', {
      userId,
      subscriptionEndDate: subscriptionEndDate.toISOString(),
      lemonSqueezySubscriptionId,
    });

    // Drizzle ORM을 사용해서 직접 업데이트
    const updatedProfile = await db
      .update(profiles)
      .set({
        subscriptionStatus: 'active',
        subscriptionEndsAt: subscriptionEndDate,
        lemonSqueezySubscriptionId: lemonSqueezySubscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, userId))
      .returning();

    if (updatedProfile.length === 0) {
      throw new Error(`사용자 프로필을 찾을 수 없습니다: ${userId}`);
    }

    console.log('구독 활성화 완료:', {
      userId,
      subscriptionStatus: updatedProfile[0].subscriptionStatus,
      subscriptionEndsAt: updatedProfile[0].subscriptionEndsAt,
    });
  } catch (error) {
    console.error('구독 활성화 실패:', error);
    throw new Error('구독 활성화에 실패했습니다.');
  }
}

/**
 * 사용자의 구독을 취소합니다 (서버사이드 버전)
 */
async function cancelUserSubscription(userId: string): Promise<void> {
  try {
    console.log('구독 취소 시작:', { userId });

    // Drizzle ORM을 사용해서 직접 업데이트
    const updatedProfile = await db
      .update(profiles)
      .set({
        subscriptionStatus: 'cancelled',
        subscriptionEndsAt: null,
        lemonSqueezySubscriptionId: null,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, userId))
      .returning();

    if (updatedProfile.length === 0) {
      throw new Error(`사용자 프로필을 찾을 수 없습니다: ${userId}`);
    }

    console.log('구독 취소 완료:', {
      userId,
      subscriptionStatus: updatedProfile[0].subscriptionStatus,
    });
  } catch (error) {
    console.error('구독 취소 실패:', error);
    throw new Error('구독 취소에 실패했습니다.');
  }
}

// Lemon Squeezy 웹훅 이벤트 타입
export type LemonSqueezyWebhookEventType =
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_cancelled'
  | 'subscription_resumed'
  | 'subscription_expired'
  | 'subscription_paused'
  | 'subscription_unpaused'
  | 'subscription_payment_success'
  | 'subscription_payment_failed'
  | 'order_created';

export interface LemonSqueezyWebhookEvent {
  meta: {
    event_name: LemonSqueezyWebhookEventType;
    custom_data?: {
      user_id: string;
      [key: string]: any;
    };
  };
  data: {
    type: string;
    id: string;
    attributes: {
      store_id: number;
      customer_id: number;
      order_id: number;
      order_item_id: number;
      product_id: number;
      variant_id: number;
      product_name: string;
      variant_name: string;
      user_name: string;
      user_email: string;
      status: string;
      status_formatted: string;
      card_brand?: string;
      card_last_four?: string;
      pause?: any;
      cancelled: boolean;
      trial_ends_at?: string;
      billing_anchor?: number;
      urls: {
        update_payment_method?: string;
        customer_portal?: string;
      };
      renews_at?: string;
      ends_at?: string;
      created_at: string;
      updated_at: string;
      test_mode: boolean;
      [key: string]: any;
    };
  };
}

/**
 * Lemon Squeezy 웹훅 서명 검증
 */
export function verifyLemonSqueezyWebhook(
  payload: string,
  signature: string
): boolean {
  const secret = lemonSqueezyConfig.webhookSecret;

  if (!secret) {
    throw new Error('Webhook secret이 설정되지 않았습니다.');
  }

  const hmac = crypto.createHmac('sha256', secret);
  const digest = Buffer.from(hmac.update(payload).digest('hex'), 'utf8');
  const signatureBuffer = Buffer.from(signature || '', 'utf8');

  return crypto.timingSafeEqual(digest, signatureBuffer);
}

/**
 * 웹훅 이벤트 처리
 */
export async function processLemonSqueezyWebhook(
  event: LemonSqueezyWebhookEvent
): Promise<void> {
  const { meta, data } = event;
  const eventType = meta.event_name;
  const userId = meta.custom_data?.user_id;

  console.log(`Lemon Squeezy 웹훅 처리 중: ${eventType}`, {
    subscriptionId: data.id,
    userId,
    status: data.attributes.status,
  });

  try {
    switch (eventType) {
      case 'subscription_created':
        await handleSubscriptionCreated(event);
        break;

      case 'subscription_updated':
        await handleSubscriptionUpdated(event);
        break;

      case 'subscription_cancelled':
        await handleSubscriptionCancelled(event);
        break;

      case 'subscription_resumed':
        await handleSubscriptionResumed(event);
        break;

      case 'subscription_expired':
        await handleSubscriptionExpired(event);
        break;

      case 'subscription_paused':
        await handleSubscriptionPaused(event);
        break;

      case 'subscription_unpaused':
        await handleSubscriptionUnpaused(event);
        break;

      case 'subscription_payment_success':
        await handlePaymentSuccess(event);
        break;

      case 'subscription_payment_failed':
        await handlePaymentFailed(event);
        break;

      case 'order_created':
        await handleOrderCreated(event);
        break;

      default:
        console.log(`처리되지 않은 웹훅 이벤트: ${eventType}`);
    }
  } catch (error) {
    console.error(`웹훅 처리 실패 (${eventType}):`, error);
    throw error;
  }
}

/**
 * 구독 생성 처리
 */
async function handleSubscriptionCreated(
  event: LemonSqueezyWebhookEvent
): Promise<void> {
  const { data, meta } = event;
  let userId = meta.custom_data?.user_id;

  // custom_data에 userId가 없으면 이메일로 사용자 조회
  if (!userId) {
    const userEmail = data.attributes.user_email;
    if (userEmail) {
      const foundUserId = await findUserByEmail(userEmail);
      if (foundUserId) {
        userId = foundUserId;
      }
    }
  }

  if (!userId) {
    throw new Error('사용자 ID를 찾을 수 없습니다.');
  }

  console.log('새 구독 생성:', {
    lemonSqueezyId: data.id,
    userId,
    productName: data.attributes.product_name,
    variantName: data.attributes.variant_name,
    status: data.attributes.status,
    customerEmail: data.attributes.user_email,
  });

  try {
    // 구독 종료일 계산 (다음 갱신일 기준)
    const renewsAt = data.attributes.renews_at;
    const subscriptionEndDate = renewsAt
      ? new Date(renewsAt)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 기본 30일

    // 사용자 구독 활성화
    await activateUserSubscription(userId, subscriptionEndDate, data.id);

    console.log(`사용자 ${userId} 구독 활성화 완료`);
  } catch (error) {
    console.error('구독 생성 처리 중 오류:', error);
    throw error;
  }
}

/**
 * 구독 업데이트 처리
 */
async function handleSubscriptionUpdated(
  event: LemonSqueezyWebhookEvent
): Promise<void> {
  const { data } = event;

  console.log('구독 업데이트:', {
    lemonSqueezyId: data.id,
    status: data.attributes.status,
    renewsAt: data.attributes.renews_at,
    endsAt: data.attributes.ends_at,
  });

  // TODO: 데이터베이스에서 구독 정보 업데이트
}

/**
 * 구독 취소 처리
 */
async function handleSubscriptionCancelled(
  event: LemonSqueezyWebhookEvent
): Promise<void> {
  const { data, meta } = event;
  let userId = meta.custom_data?.user_id;

  // custom_data에 userId가 없으면 이메일로 사용자 조회
  if (!userId) {
    const userEmail = data.attributes.user_email;
    if (userEmail) {
      const foundUserId = await findUserByEmail(userEmail);
      if (foundUserId) {
        userId = foundUserId;
      }
    }
  }

  console.log('구독 취소:', {
    lemonSqueezyId: data.id,
    userId,
    endsAt: data.attributes.ends_at,
  });

  if (userId) {
    try {
      await cancelUserSubscription(userId);
      console.log(`사용자 ${userId} 구독 취소 완료`);
    } catch (error) {
      console.error('구독 취소 처리 중 오류:', error);
      throw error;
    }
  }
}

/**
 * 구독 재개 처리
 */
async function handleSubscriptionResumed(
  event: LemonSqueezyWebhookEvent
): Promise<void> {
  const { data } = event;

  console.log('구독 재개:', {
    lemonSqueezyId: data.id,
    status: data.attributes.status,
  });

  // TODO: 데이터베이스에서 구독 상태 업데이트
}

/**
 * 구독 만료 처리
 */
async function handleSubscriptionExpired(
  event: LemonSqueezyWebhookEvent
): Promise<void> {
  const { data } = event;

  console.log('구독 만료:', {
    lemonSqueezyId: data.id,
    endsAt: data.attributes.ends_at,
  });

  // TODO: 사용자 액세스 제한, 알림 발송 등
}

/**
 * 구독 일시정지 처리
 */
async function handleSubscriptionPaused(
  event: LemonSqueezyWebhookEvent
): Promise<void> {
  const { data } = event;

  console.log('구독 일시정지:', {
    lemonSqueezyId: data.id,
    pauseData: data.attributes.pause,
  });

  // TODO: 데이터베이스에서 구독 상태 업데이트
}

/**
 * 구독 일시정지 해제 처리
 */
async function handleSubscriptionUnpaused(
  event: LemonSqueezyWebhookEvent
): Promise<void> {
  const { data } = event;

  console.log('구독 일시정지 해제:', {
    lemonSqueezyId: data.id,
    status: data.attributes.status,
  });

  // TODO: 데이터베이스에서 구독 상태 업데이트
}

/**
 * 결제 성공 처리
 */
async function handlePaymentSuccess(
  event: LemonSqueezyWebhookEvent
): Promise<void> {
  const { data } = event;

  console.log('결제 성공:', {
    lemonSqueezyId: data.id,
    customerEmail: data.attributes.user_email,
  });

  // TODO: 결제 내역 저장, 영수증 발송 등
}

/**
 * 결제 실패 처리
 */
async function handlePaymentFailed(
  event: LemonSqueezyWebhookEvent
): Promise<void> {
  const { data } = event;

  console.log('결제 실패:', {
    lemonSqueezyId: data.id,
    customerEmail: data.attributes.user_email,
  });

  // TODO: 결제 실패 알림, 재시도 로직 등
}

/**
 * 주문 생성 처리
 */
async function handleOrderCreated(
  event: LemonSqueezyWebhookEvent
): Promise<void> {
  const { data } = event;

  console.log('주문 생성:', {
    orderId: data.id,
    customerEmail: data.attributes.user_email,
    productName: data.attributes.product_name,
  });

  // TODO: 주문 정보 저장
}
