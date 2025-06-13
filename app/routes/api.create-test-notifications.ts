/**
 * 🧪 현재 로그인한 사용자에게 테스트 알림 생성 API
 */

import { requireAuth } from '~/api/shared/auth';
import { createNotification } from '~/features/notifications/lib/notifications-data';

export async function action({ request }: { request: Request }) {
  try {
    console.log('🧪 테스트 알림 생성 API 시작');

    // 인증 확인
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    const userId = authResult.id;
    console.log('📝 현재 사용자 ID:', userId);

    // 다양한 테스트 알림 생성
    const testNotifications = [
      {
        userId,
        type: 'meeting_reminder' as const,
        channel: 'in_app' as const,
        priority: 'high' as const,
        title: '📅 1시간 후 미팅 예정',
        message: '1시간 후 최민수님과 상담 미팅이 있습니다',
        recipient: userId,
        scheduledAt: new Date(),
        metadata: {
          meetingId: 'meeting-001',
          clientId: 'client-004',
          clientName: '최민수',
          meetingType: 'first_consultation',
          reminderType: '1hour',
          eventType: 'meeting_reminder',
        },
      },
      {
        userId,
        type: 'system_alert' as const,
        channel: 'in_app' as const,
        priority: 'urgent' as const,
        title: '🔥 박지민님 계약 지연 중!',
        message:
          '계약 임박 고객이 5일째 정체 중입니다. 즉시 연락하여 계약을 완료하세요',
        recipient: userId,
        scheduledAt: new Date(),
        metadata: {
          clientId: 'client-003',
          clientName: '박지민',
          stageName: '계약 체결',
          daysSinceUpdate: 5,
          eventType: 'contract_urgent',
        },
      },
      {
        userId,
        type: 'new_referral' as const,
        channel: 'in_app' as const,
        priority: 'normal' as const,
        title: '🎉 새로운 고객 추천!',
        message: '홍길동님이 새로운 고객을 추천해주셨습니다.',
        recipient: userId,
        scheduledAt: new Date(),
        metadata: {
          referrerName: '홍길동',
          newClientName: '김영희',
          eventType: 'new_referral',
        },
      },
      {
        userId,
        type: 'birthday_reminder' as const,
        channel: 'in_app' as const,
        priority: 'normal' as const,
        title: '🎂 김영희님의 생일입니다!',
        message: '오늘은 김영희님의 생일입니다. 축하 메시지를 보내보세요',
        recipient: userId,
        scheduledAt: new Date(),
        metadata: {
          clientId: 'client-001',
          clientName: '김영희',
          eventType: 'birthday',
          daysUntil: 0,
        },
      },
      {
        userId,
        type: 'goal_achievement' as const,
        channel: 'in_app' as const,
        priority: 'normal' as const,
        title: '🎯 월간 목표 달성!',
        message: '축하합니다! 이번 달 계약 목표를 달성했습니다 (5건 완료)',
        recipient: userId,
        scheduledAt: new Date(),
        metadata: {
          goalType: 'monthly_contracts',
          targetAmount: 5,
          achievedAmount: 5,
          eventType: 'goal_achievement',
        },
      },
    ];

    // 알림들을 순차적으로 생성
    const createdNotifications = [];
    for (const notificationData of testNotifications) {
      try {
        console.log(`🔄 알림 생성 시도: ${notificationData.title}`);
        const created = await createNotification(notificationData);
        if (created) {
          createdNotifications.push(created);
          console.log(
            `✅ 알림 생성 성공: ${notificationData.title} (ID: ${created.id})`
          );
        }
      } catch (error) {
        console.error(`❌ 알림 생성 중 오류: ${notificationData.title}`, error);
      }
    }

    console.log(
      `🎉 총 ${createdNotifications.length}개의 테스트 알림 생성 완료`
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: `${createdNotifications.length}개의 테스트 알림이 생성되었습니다`,
        notifications: createdNotifications.map(n => ({
          id: n.id,
          title: n.title,
          readAt: n.readAt,
          createdAt: n.createdAt,
        })),
        userId,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ 테스트 알림 생성 실패:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        stack: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
