import type { ActionFunctionArgs } from 'react-router';
import { data } from 'react-router';
import { GoogleCalendarService } from '~/features/calendar/lib/google-calendar-service';
import { db } from '~/lib/core/db';
import { appCalendarSyncLogs } from '~/features/calendar/lib/schema';

// 🔔 구글 캘린더 웹훅 처리
export async function action({ request }: ActionFunctionArgs) {
  try {
    // 구글 Push Notification 헤더 검증
    const resourceId = request.headers.get('x-goog-resource-id');
    const resourceState = request.headers.get('x-goog-resource-state');
    const channelId = request.headers.get('x-goog-channel-id');
    const channelToken = request.headers.get('x-goog-channel-token');

    console.log('📫 구글 캘린더 웹훅 수신:', {
      resourceId,
      resourceState,
      channelId,
      channelToken,
    });

    // 웹훅 검증
    if (!resourceId || !resourceState || !channelId) {
      console.warn('⚠️ 잘못된 웹훅 요청: 필수 헤더 누락');
      return data({ error: 'Invalid webhook request' }, { status: 400 });
    }

    // 동기화 상태별 처리
    switch (resourceState) {
      case 'sync':
        // 초기 동기화 완료
        console.log('✅ 구글 캘린더 웹훅 동기화 완료');
        break;

      case 'exists':
        // 캘린더 변경사항 발생
        await handleCalendarChanges(channelId, resourceId);
        break;

      case 'not_exists':
        // 리소스 삭제됨
        console.log('🗑️ 구글 캘린더 리소스 삭제됨:', resourceId);
        break;

      default:
        console.log('🔄 기타 웹훅 상태:', resourceState);
    }

    return data({ success: true });
  } catch (error) {
    console.error('❌ 웹훅 처리 중 오류:', error);

    // 에러 로깅
    try {
      await db.insert(appCalendarSyncLogs).values({
        agentId: 'webhook_error',
        syncDirection: 'from_google',
        syncStatus: 'sync_failed',
        externalSource: 'google_calendar',
        syncResult: {
          error: error instanceof Error ? error.message : '알 수 없는 오류',
          webhookProcessing: true,
          timestamp: new Date(),
        },
      });
    } catch (logError) {
      console.error('📝 웹훅 에러 로깅 실패:', logError);
    }

    return data({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// 🔄 캘린더 변경사항 처리
async function handleCalendarChanges(channelId: string, resourceId: string) {
  try {
    console.log('🔄 캘린더 변경사항 처리 시작:', { channelId, resourceId });

    // 채널 ID에서 agentId 추출 (채널 생성 시 agentId를 포함하도록 설정)
    const agentId = extractAgentIdFromChannelId(channelId);

    if (!agentId) {
      console.warn('⚠️ 채널에서 agentId를 찾을 수 없음:', channelId);
      return;
    }

    // 구글 캘린더 서비스로 변경사항 동기화
    const googleService = new GoogleCalendarService();
    await googleService.performFullSync(agentId);

    console.log('✅ 웹훅 트리거 동기화 완료:', agentId);

    // 성공 로그
    await db.insert(appCalendarSyncLogs).values({
      agentId,
      syncDirection: 'from_google',
      syncStatus: 'synced',
      externalSource: 'google_calendar',
      syncResult: {
        webhookTriggered: true,
        channelId,
        resourceId,
        processedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('❌ 캘린더 변경사항 처리 실패:', error);
  }
}

// 🔍 채널 ID에서 에이전트 ID 추출
function extractAgentIdFromChannelId(channelId: string): string | null {
  try {
    // 채널 ID 형식: "surecrm_calendar_{agentId}_{timestamp}"
    const match = channelId.match(/^surecrm_calendar_([^_]+)_\d+$/);
    return match ? match[1] : null;
  } catch (error) {
    console.error('❌ 채널 ID 파싱 실패:', error);
    return null;
  }
}

// GET 요청 처리 (구글 웹훅 검증용)
export async function loader({ request }: { request: Request }) {
  // 구글 캘린더 웹훅 검증 토큰 처리
  const url = new URL(request.url);
  const challenge = url.searchParams.get('hub.challenge');
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');

  // 웹훅 구독 검증
  if (mode === 'subscribe' && challenge && token) {
    console.log('🔐 구글 웹훅 검증 요청 수신');

    // 토큰 검증 (실제 환경에서는 저장된 토큰과 비교)
    const expectedToken =
      process.env.GOOGLE_WEBHOOK_VERIFY_TOKEN || 'surecrm_calendar_webhook';

    if (token === expectedToken) {
      console.log('✅ 웹훅 검증 성공');
      return new Response(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    } else {
      console.warn('⚠️ 웹훅 토큰 검증 실패');
      return data({ error: 'Invalid verification token' }, { status: 403 });
    }
  }

  return data({ message: 'Google Calendar Webhook Endpoint' });
}
