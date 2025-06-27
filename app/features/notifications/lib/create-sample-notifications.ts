import { db } from '~/lib/core/db.server';
import { createNotification } from './notifications-data';

// 🧪 실제 알림 데이터를 생성해서 시스템을 테스트하는 함수들

/**
 * 테스트용 샘플 알림들을 직접 생성
 */
export async function createSampleNotifications(
  userId: string = 'test-user-id'
) {
  console.log('🧪 샘플 알림 데이터 생성 시작');
  console.log('📝 사용자 ID:', userId);

  try {
    const notifications = [
      // 🎂 생일 알림
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

      // 📈 파이프라인 지연 알림
      {
        userId,
        type: 'system_alert' as const,
        channel: 'in_app' as const,
        priority: 'high' as const,
        title: '📈 이철수님 파이프라인 지연',
        message: "이철수님이 '상담 중' 단계에 10일째 머물러 있습니다",
        recipient: userId,
        scheduledAt: new Date(),
        metadata: {
          clientId: 'client-002',
          clientName: '이철수',
          stageName: '상담 중',
          daysSinceUpdate: 10,
          eventType: 'pipeline_stagnation',
        },
      },

      // 🔥 계약 임박 알림
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

      // 📅 미팅 리마인더
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

      // 🎉 초대장 사용 알림
      {
        userId,
        type: 'new_referral' as const,
        channel: 'in_app' as const,
        priority: 'normal' as const,
        title: '🎉 초대장이 사용되었습니다!',
        message: '새로운 사용자가 회원가입을 완료했습니다. (추천인: 홍길동)',
        recipient: userId,
        scheduledAt: new Date(),
        metadata: {
          invitationId: 'inv-001',
          newUserId: 'new-user-001',
          inviterEmail: 'hong@example.com',
          eventType: 'invitation_used',
        },
      },

      // 🎯 목표 달성 알림
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
    for (const notificationData of notifications) {
      try {
        console.log(`🔄 알림 생성 시도: ${notificationData.title}`);
        const created = await createNotification(notificationData);
        if (created) {
          createdNotifications.push(created);
          console.log(
            `✅ 알림 생성 성공: ${notificationData.title} (ID: ${created.id})`
          );
        } else {
          console.error(
            `❌ 알림 생성 실패 (null 반환): ${notificationData.title}`
          );
        }
      } catch (error) {
        console.error(`❌ 알림 생성 중 오류: ${notificationData.title}`, error);
      }
    }

    console.log(`🎉 총 ${createdNotifications.length}개의 샘플 알림 생성 완료`);
    return createdNotifications;
  } catch (error) {
    console.error('❌ 샘플 알림 생성 실패:', error);
    throw error;
  }
}

/**
 * 다양한 시나리오의 알림들을 생성
 */
export async function createVariedNotificationScenarios(
  userId: string = 'test-user-id'
) {
  console.log('🎭 다양한 알림 시나리오 생성 시작');

  try {
    const scenarios = [
      // 긴급 시나리오들
      {
        userId,
        type: 'system_alert' as const,
        channel: 'in_app' as const,
        priority: 'urgent' as const,
        title: '🚨 월말 3일 남음!',
        message: '월말 3일 남음! 계약 임박 고객 3명을 집중 관리하세요',
        recipient: userId,
        scheduledAt: new Date(),
        metadata: {
          daysUntilMonthEnd: 3,
          nearContractClients: 3,
          eventType: 'month_end_pressure',
        },
      },

      // 일반 업무 알림들
      {
        userId,
        type: 'client_milestone' as const,
        channel: 'in_app' as const,
        priority: 'normal' as const,
        title: '💰 정수진님 보험료 납입 확인',
        message: '정수진님의 보험료 납입일이 지났습니다. 확인이 필요합니다',
        recipient: userId,
        scheduledAt: new Date(),
        metadata: {
          clientId: 'client-005',
          clientName: '정수진',
          eventType: 'payment_reminder',
        },
      },

      // 팀 관련 알림들
      {
        userId,
        type: 'team_update' as const,
        channel: 'in_app' as const,
        priority: 'low' as const,
        title: '👥 팀원 김대리님이 새 고객을 등록했습니다',
        message: '팀원 김대리님이 새로운 고객을 등록했습니다',
        recipient: userId,
        scheduledAt: new Date(),
        metadata: {
          teamMemberName: '김대리',
          actionType: 'new_client',
          eventType: 'team_activity',
        },
      },

      // 과거 알림들 (읽지 않음)
      {
        userId,
        type: 'follow_up_reminder' as const,
        channel: 'in_app' as const,
        priority: 'normal' as const,
        title: '📞 장철민님 후속 조치 필요',
        message: '장철민님과 7일간 연락이 없습니다. 안부 확인이 필요합니다',
        recipient: userId,
        scheduledAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2시간 전
        metadata: {
          clientId: 'client-006',
          clientName: '장철민',
          daysSinceContact: 7,
          eventType: 'follow_up_reminder',
        },
      },
    ];

    const createdScenarios = [];
    for (const scenario of scenarios) {
      try {
        console.log(`🔄 시나리오 알림 생성 시도: ${scenario.title}`);
        const created = await createNotification(scenario);
        if (created) {
          createdScenarios.push(created);
          console.log(
            `✅ 시나리오 알림 생성 성공: ${scenario.title} (ID: ${created.id})`
          );
        } else {
          console.error(
            `❌ 시나리오 알림 생성 실패 (null 반환): ${scenario.title}`
          );
        }
      } catch (error) {
        console.error(
          `❌ 시나리오 알림 생성 중 오류: ${scenario.title}`,
          error
        );
      }
    }

    console.log(`🎭 총 ${createdScenarios.length}개의 시나리오 알림 생성 완료`);
    return createdScenarios;
  } catch (error) {
    console.error('❌ 시나리오 알림 생성 실패:', error);
    throw error;
  }
}

/**
 * 종합 테스트: 모든 샘플 알림 생성
 */
export async function createAllSampleNotifications(
  userId: string = 'test-user-id'
) {
  console.log('🚀 종합 알림 테스트 시작');

  try {
    console.log(`📝 사용자 ID: ${userId}`);

    const [basicNotifications, scenarioNotifications] = await Promise.all([
      createSampleNotifications(userId),
      createVariedNotificationScenarios(userId),
    ]);

    const totalCount = basicNotifications.length + scenarioNotifications.length;

    console.log(`🎉 알림 테스트 완료:
      - 기본 알림: ${basicNotifications.length}개
      - 시나리오 알림: ${scenarioNotifications.length}개
      - 총합: ${totalCount}개`);

    return {
      basic: basicNotifications,
      scenarios: scenarioNotifications,
      total: totalCount,
      success: true,
    };
  } catch (error) {
    console.error('❌ 종합 알림 테스트 실패:', error);
    return {
      basic: [],
      scenarios: [],
      total: 0,
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}
