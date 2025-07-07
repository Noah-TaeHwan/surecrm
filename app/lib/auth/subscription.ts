import { getClientSideClient } from '~/lib/core/supabase';
import { db } from '~/lib/core/db.server';
import schema from '~/lib/schema/all';
import { eq } from 'drizzle-orm';

export interface SubscriptionStatus {
  isActive: boolean;
  isTrialActive: boolean;
  trialEndsAt: Date | null;
  subscriptionEndsAt: Date | null;
  daysRemaining: number;
  needsPayment: boolean;
}

/**
 * 사용자의 구독 상태를 확인합니다
 */
export async function getUserSubscriptionStatus(
  userId: string
): Promise<SubscriptionStatus> {
  console.log('🔍 getUserSubscriptionStatus 호출됨:', userId);

  // Drizzle ORM을 사용하여 프로필 조회 (로그인과 동일한 방식)
  let profile;
  let error = null;

  try {
    const userProfile = await db
      .select({
        createdAt: schema.profiles.createdAt,
        subscriptionStatus: schema.profiles.subscriptionStatus,
        trialEndsAt: schema.profiles.trialEndsAt,
        subscriptionEndsAt: schema.profiles.subscriptionEndsAt,
        role: schema.profiles.role,
      })
      .from(schema.profiles)
      .where(eq(schema.profiles.id, userId))
      .limit(1);

    if (userProfile.length === 0) {
      profile = null;
      error = { code: 'PGRST116', message: '0 rows returned' };
    } else {
      profile = {
        created_at: userProfile[0].createdAt,
        subscription_status: userProfile[0].subscriptionStatus,
        trial_ends_at: userProfile[0].trialEndsAt,
        subscription_ends_at: userProfile[0].subscriptionEndsAt,
        role: userProfile[0].role,
      };
    }
  } catch (dbError) {
    console.error('Drizzle ORM 조회 오류:', dbError);
    profile = null;
    error = { code: 'DB_ERROR', message: String(dbError) };
  }

  if (error || !profile) {
    console.error('🚨 사용자 프로필 조회 실패!', {
      userId,
      error: error?.message || error,
      profile,
      errorCode: error?.code,
      errorDetails: null,
    });

    // RLS 무한 재귀 에러인 경우 특별 처리
    if (
      error?.code === '42P17' ||
      error?.message?.includes('infinite recursion')
    ) {
      console.error(
        '🔄 RLS 무한 재귀 에러 감지 - 직접 auth.users에서 생성일 조회'
      );

      // 기본적으로 체험 기간 만료로 처리 (안전한 방향으로)
      return {
        isActive: false,
        isTrialActive: false,
        trialEndsAt: new Date(), // 이미 만료된 것으로 처리
        subscriptionEndsAt: null,
        daysRemaining: 0,
        needsPayment: true,
      };
    }

    // 프로필이 존재하지 않는 경우 (0 rows returned)
    if (error?.code === 'PGRST116' || error?.message?.includes('0 rows')) {
      console.error('👻 사용자 프로필이 존재하지 않음 - 새 프로필 생성 필요');

      // 해당 사용자는 프로필이 없으므로 만료된 것으로 처리
      // (실제로는 관리자가 프로필을 수동 생성해야 함)
      return {
        isActive: false,
        isTrialActive: false,
        trialEndsAt: new Date(),
        subscriptionEndsAt: null,
        daysRemaining: 0,
        needsPayment: true,
      };
    }

    // 기타 에러인 경우에만 기본값 반환
    const now = new Date();
    const trialEndsAt = addDays(now, 14);

    console.error('🚨 기본값 반환: daysRemaining = 14');

    return {
      isActive: true,
      isTrialActive: true,
      trialEndsAt,
      subscriptionEndsAt: null,
      daysRemaining: 14,
      needsPayment: false,
    };
  }

  // system_admin 역할인 경우 무조건 Pro 계정으로 처리
  if (profile.role === 'system_admin') {
    return {
      isActive: true,
      isTrialActive: false,
      trialEndsAt: null,
      subscriptionEndsAt: null, // 무제한
      daysRemaining: 0,
      needsPayment: false,
    };
  }

  const now = new Date();

  // DB에서 가져온 실제 날짜 사용 (Supabase는 snake_case로 반환)
  const trialEndsAt = profile.trial_ends_at
    ? new Date(profile.trial_ends_at)
    : null;
  const subscriptionEndsAt = profile.subscription_ends_at
    ? new Date(profile.subscription_ends_at)
    : null;

  // 트라이얼이 설정되지 않은 경우, 생성일로부터 14일 계산
  let effectiveTrialEndsAt = trialEndsAt;

  if (!effectiveTrialEndsAt) {
    // trial_ends_at이 null인 경우, 생성일로부터 14일 후로 설정
    effectiveTrialEndsAt = addDays(new Date(profile.created_at), 14);

    // 🔧 이 사용자의 trial_ends_at을 업데이트 (다음번에는 정확한 값 사용)
    try {
      const supabase = getClientSideClient();
      await supabase
        .from('app_user_profiles')
        .update({ trial_ends_at: effectiveTrialEndsAt.toISOString() })
        .eq('id', userId);
      console.log(
        '🔧 trial_ends_at 업데이트 완료:',
        effectiveTrialEndsAt.toISOString()
      );
    } catch (updateError) {
      console.warn('trial_ends_at 업데이트 실패 (무시):', updateError);
    }
  }

  // 🔍 디버깅: 날짜 계산 과정 상세 로그
  console.log('🔍 구독 상태 계산 디버깅:', {
    userId,
    rawTrialEndsAt: profile.trial_ends_at,
    parsedTrialEndsAt: trialEndsAt?.toISOString(),
    effectiveTrialEndsAt: effectiveTrialEndsAt.toISOString(),
    now: now.toISOString(),
    nowKST: now.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
    effectiveTrialEndsAtKST: effectiveTrialEndsAt.toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
    }),
  });

  // 14일 무료 체험 기간 계산
  const isTrialActive = now < effectiveTrialEndsAt;

  // 더 정확한 일수 계산 (시차 고려)
  const timeDiff = effectiveTrialEndsAt.getTime() - now.getTime();
  const daysRemaining = Math.max(
    0,
    Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
  );

  console.log('🧮 계산 결과:', {
    timeDiffMs: timeDiff,
    timeDiffHours: Math.round(timeDiff / (1000 * 60 * 60)),
    daysRemaining,
    isTrialActive,
  });

  // 구독 상태 확인 (DB의 subscription_status 사용)
  const hasActiveSubscription =
    profile.subscription_status === 'active' &&
    (subscriptionEndsAt ? now < subscriptionEndsAt : true);

  const isActive = isTrialActive || hasActiveSubscription;

  // 결제가 필요한 상태인지 확인
  const needsPayment = !isTrialActive && !hasActiveSubscription;

  return {
    isActive,
    isTrialActive,
    trialEndsAt: effectiveTrialEndsAt,
    subscriptionEndsAt,
    daysRemaining,
    needsPayment,
  };
}

/**
 * 사용자의 무료 체험 종료일을 설정합니다
 */
export async function setUserTrialEndDate(
  userId: string,
  trialEndDate?: Date
): Promise<void> {
  const supabase = getClientSideClient();

  const endDate = trialEndDate || addDays(new Date(), 14);

  const { error } = await supabase
    .from('app_user_profiles')
    .update({
      trial_ends_at: endDate.toISOString(),
      subscription_status: 'trial',
    })
    .eq('id', userId);

  if (error) {
    console.error('체험 종료일 설정 실패:', error);
    throw new Error('체험 종료일 설정에 실패했습니다.');
  }
}

/**
 * 사용자의 구독을 활성화합니다
 */
export async function activateUserSubscription(
  userId: string,
  subscriptionEndDate: Date,
  lemonSqueezySubscriptionId?: string
): Promise<void> {
  const supabase = getClientSideClient();

  const { error } = await supabase
    .from('app_user_profiles')
    .update({
      subscription_status: 'active',
      subscription_ends_at: subscriptionEndDate.toISOString(),
      lemonsqueezy_subscription_id: lemonSqueezySubscriptionId,
    })
    .eq('id', userId);

  if (error) {
    console.error('구독 활성화 실패:', error);
    throw new Error('구독 활성화에 실패했습니다.');
  }
}

/**
 * 사용자의 구독을 취소합니다
 */
export async function cancelUserSubscription(userId: string): Promise<void> {
  const supabase = getClientSideClient();

  const { error } = await supabase
    .from('app_user_profiles')
    .update({
      subscription_status: 'cancelled',
      subscription_ends_at: null,
      lemonsqueezy_subscription_id: null,
    })
    .eq('id', userId);

  if (error) {
    console.error('구독 취소 실패:', error);
    throw new Error('구독 취소에 실패했습니다.');
  }
}

/**
 * 날짜에 일수를 더합니다
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
