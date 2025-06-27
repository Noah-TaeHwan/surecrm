import type { ActionFunction } from 'react-router';
import { lemonSqueezyService } from '~/lib/lemonsqueezy/service';
import { getCurrentUser } from '~/lib/auth/core.server';

interface CheckoutRequest {
  variantId: number;
  redirectUrl?: string;
  embed?: boolean;
}

/**
 * Lemon Squeezy 체크아웃 생성 엔드포인트
 * POST /api/billing/checkout
 */
export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // 사용자 인증 확인
    const user = await getCurrentUser(request);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 요청 바디 파싱
    const body: CheckoutRequest = await request.json();
    const { variantId, redirectUrl, embed } = body;

    if (!variantId) {
      return new Response(JSON.stringify({ error: 'variantId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 체크아웃 세션 생성
    const checkoutUrl = await lemonSqueezyService.createCheckoutSession({
      variantId,
      userId: user.id,
      userEmail: user.email || '',
      redirectUrl,
      embed,
    });

    return new Response(
      JSON.stringify({
        success: true,
        checkoutUrl,
        embed: embed || false,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('체크아웃 생성 실패:', error);

    return new Response(
      JSON.stringify({
        error: 'Checkout creation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
