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
  // 🍋 Webhook 수신: ${request.method} ${request.url}

  if (request.method !== 'POST') {
    // ❌ 잘못된 HTTP 메서드: request.method
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // 요청 바디와 서명 헤더 추출
    const body = await request.text();
    const signature = request.headers.get('X-Signature') || '';

    // 🔍 Webhook 데이터 수신 확인

    if (!body) {
      console.error('❌ 빈 요청 바디');
      return new Response(JSON.stringify({ error: 'Empty body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 웹훅 서명 검증
    let isValid = true;
    try {
      isValid = verifyLemonSqueezyWebhook(body, signature);
    } catch (verifyError) {
      console.error('❌ 서명 검증 중 오류:', verifyError);
      // 개발 환경에서는 서명 검증을 건너뛸 수 있음
      if (process.env.NODE_ENV === 'development') {
        // ⚠️ 개발 환경: 서명 검증 건너뛰기
        isValid = true;
      } else {
        isValid = false;
      }
    }

    if (!isValid) {
      console.error('❌ Lemon Squeezy 웹훅 서명 검증 실패');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // JSON 파싱
    let event: LemonSqueezyWebhookEvent;
    try {
      event = JSON.parse(body);
      // 📦 이벤트 파싱 성공
    } catch (parseError) {
      console.error('❌ JSON 파싱 실패:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 웹훅 이벤트 처리
    try {
      await processLemonSqueezyWebhook(event);
      // ✅ Lemon Squeezy 웹훅 처리 완료: event.meta.event_name
    } catch (processError) {
      console.error('❌ 웹훅 처리 실패:', processError);
      // 처리 실패해도 200을 반환해서 Lemon Squeezy가 재시도하지 않도록 함
      // (로그는 남김)
    }

    return new Response(
      JSON.stringify({
        received: true,
        eventType: event.meta?.event_name,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ Lemon Squeezy 웹훅 전체 처리 중 오류:', error);

    return new Response(
      JSON.stringify({
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
