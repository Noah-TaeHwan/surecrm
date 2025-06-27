import type { ActionFunction } from 'react-router';
import {
  verifyLemonSqueezyWebhook,
  processLemonSqueezyWebhook,
  type LemonSqueezyWebhookEvent,
} from '~/lib/lemonsqueezy/webhook';

/**
 * Lemon Squeezy 웹훅 엔드포인트
 * POST /api/billing/webhook
 */
export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // 요청 바디와 서명 헤더 추출
    const body = await request.text();
    const signature = request.headers.get('X-Signature') || '';

    // 웹훅 서명 검증
    const isValid = verifyLemonSqueezyWebhook(body, signature);

    if (!isValid) {
      console.error('Lemon Squeezy 웹훅 서명 검증 실패');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // JSON 파싱
    const event: LemonSqueezyWebhookEvent = JSON.parse(body);

    // 웹훅 이벤트 처리
    await processLemonSqueezyWebhook(event);

    console.log(`Lemon Squeezy 웹훅 처리 완료: ${event.meta.event_name}`);

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Lemon Squeezy 웹훅 처리 중 오류:', error);

    return new Response(
      JSON.stringify({
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
