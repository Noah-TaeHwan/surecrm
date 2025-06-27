import type { LoaderFunctionArgs } from 'react-router';
import { getCurrentUser } from '~/lib/auth/core.server';
import { getUserSubscriptionStatus } from '~/lib/auth/subscription';

export async function loader({ request }: LoaderFunctionArgs) {
  console.log('🔍 [API] 구독 상태 확인 요청');

  try {
    const user = await getCurrentUser(request);

    if (!user) {
      console.log('❌ [API] 인증되지 않은 사용자');
      return new Response(
        JSON.stringify({
          error: '인증되지 않은 사용자입니다.',
          needsPayment: false,
          isTrialActive: false,
          daysRemaining: 0,
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('👤 [API] 사용자 확인:', user.id);
    const subscriptionStatus = await getUserSubscriptionStatus(user.id);

    console.log('📊 [API] 구독 상태:', {
      needsPayment: subscriptionStatus.needsPayment,
      isTrialActive: subscriptionStatus.isTrialActive,
      daysRemaining: subscriptionStatus.daysRemaining,
    });

    return new Response(
      JSON.stringify({
        needsPayment: subscriptionStatus.needsPayment,
        isTrialActive: subscriptionStatus.isTrialActive,
        daysRemaining: subscriptionStatus.daysRemaining,
        trialEndsAt: subscriptionStatus.trialEndsAt,
        subscriptionEndsAt: subscriptionStatus.subscriptionEndsAt,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ [API] 구독 상태 확인 오류:', error);

    return new Response(
      JSON.stringify({
        error: '구독 상태를 확인할 수 없습니다.',
        needsPayment: false,
        isTrialActive: false,
        daysRemaining: 0,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
