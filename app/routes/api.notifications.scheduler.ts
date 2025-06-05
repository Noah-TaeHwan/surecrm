// import type { Route } from './+types/api.notifications.scheduler';
import {
  runDailyNotificationTriggers,
  triggerBirthdayNotifications,
  triggerPipelineStagnationNotifications,
  triggerContractUrgentNotifications,
  triggerMeetingReminders,
} from '~/features/notifications/lib/event-triggered-notifications';

// 🕒 매일 실행되는 알림 스케줄러 API
// 실제 프로덕션에서는 cron job이나 서버리스 함수에서 호출

export async function action({ request }: { request: Request }) {
  // 헤더에서 인증 토큰 확인 (보안)
  const authHeader = request.headers.get('Authorization');
  const schedulerSecret = process.env.SCHEDULER_SECRET || 'dev-secret-key';

  if (authHeader !== `Bearer ${schedulerSecret}`) {
    return new Response(
      JSON.stringify({
        success: false,
        error: '인증되지 않은 스케줄러 요청입니다.',
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    console.log('🕒 데일리 알림 스케줄러 실행 시작');
    const startTime = Date.now();

    // 모든 일일 트리거 실행
    const results = await runDailyNotificationTriggers();

    const executionTime = Date.now() - startTime;
    console.log(`⏱️ 스케줄러 실행 완료: ${executionTime}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        message: '데일리 알림 스케줄러 실행 완료',
        results,
        executionTime,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ 스케줄러 실행 실패:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: '스케줄러 실행 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// GET 요청으로 스케줄러 상태 확인
export async function loader({ request }: { request: Request }) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    if (action === 'status') {
      return {
        status: 'active',
        message: '스케줄러가 정상 작동 중입니다.',
        nextRun: '매일 오전 9시 (KST)',
        supportedTriggers: [
          'birthday_notifications',
          'pipeline_stagnation',
          'contract_urgent',
          'meeting_reminders',
          'monthly_goals',
        ],
        timestamp: new Date().toISOString(),
      };
    }

    if (action === 'test-birthday') {
      console.log('🧪 생일 알림 테스트 실행');
      const result = await triggerBirthdayNotifications();
      return {
        test: 'birthday_notifications',
        result,
        timestamp: new Date().toISOString(),
      };
    }

    if (action === 'test-pipeline') {
      console.log('🧪 파이프라인 지연 알림 테스트 실행');
      const result = await triggerPipelineStagnationNotifications();
      return {
        test: 'pipeline_stagnation',
        result,
        timestamp: new Date().toISOString(),
      };
    }

    if (action === 'test-contract') {
      console.log('🧪 계약 임박 알림 테스트 실행');
      const result = await triggerContractUrgentNotifications();
      return {
        test: 'contract_urgent',
        result,
        timestamp: new Date().toISOString(),
      };
    }

    if (action === 'test-meeting') {
      console.log('🧪 미팅 리마인더 테스트 실행');
      const result = await triggerMeetingReminders();
      return {
        test: 'meeting_reminders',
        result,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      message: '알림 스케줄러 API',
      version: '1.0.0',
      description: '매일 자동으로 실행되어 필요한 알림들을 생성합니다.',
      endpoints: {
        POST: '스케줄러 실행 (인증 필요)',
        'GET?action=status': '스케줄러 상태 확인',
        'GET?action=test-birthday': '생일 알림 테스트',
        'GET?action=test-pipeline': '파이프라인 지연 알림 테스트',
        'GET?action=test-contract': '계약 임박 알림 테스트',
        'GET?action=test-meeting': '미팅 리마인더 테스트',
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ 스케줄러 상태 확인 실패:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      timestamp: new Date().toISOString(),
    };
  }
}

// 메타 정보
export function meta() {
  return [
    { title: '알림 스케줄러 API' },
    {
      name: 'description',
      content: '매일 자동으로 실행되어 필요한 알림들을 생성하는 스케줄러',
    },
  ];
}
