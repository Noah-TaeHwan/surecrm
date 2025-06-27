/**
 * 🧪 추가 다양한 테스트 알림 생성 스크립트
 */

import { db } from '../app/lib/core/db.server';
import { profiles } from '../app/lib/schema/core';
import { appNotificationQueue } from '../app/features/notifications/lib/schema';
import { eq } from 'drizzle-orm';

async function createMoreTestNotifications() {
  console.log('🧪 다양한 추가 테스트 알림 생성 시작');

  try {
    // 1. 현재 활성 사용자 조회
    const users = await db
      .select()
      .from(profiles)
      .where(eq(profiles.isActive, true))
      .limit(5);

    console.log(
      '👥 활성 사용자 목록:',
      users.map(u => ({
        id: u.id.slice(0, 8) + '...',
        name: u.fullName,
        email: u.id,
      }))
    );

    if (users.length === 0) {
      console.log('❌ 활성 사용자가 없습니다');
      return;
    }

    // 첫 번째 사용자를 대상으로 테스트 알림 생성
    const targetUser = users[0];
    console.log(
      `🎯 대상 사용자: ${targetUser.fullName} (${targetUser.id.slice(0, 8)}...)`
    );

    // 2. 다양한 추가 테스트 알림 데이터 생성
    const now = new Date();
    const additionalTestNotifications = [
      // 팀 관련 알림
      {
        userId: targetUser.id,
        type: 'team_update' as const,
        channel: 'in_app' as const,
        priority: 'normal' as const,
        title: '👥 [테스트] 팀원 합류',
        message: '신입 팀원 "이지현"님이 팀에 합류했습니다. 환영해주세요!',
        recipient: targetUser.id,
        scheduledAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2시간 전
        status: 'delivered' as const,
        metadata: {
          test: true,
          teamMemberName: '이지현',
          actionType: 'new_member',
        },
      },

      // 고객 마일스톤 알림
      {
        userId: targetUser.id,
        type: 'client_milestone' as const,
        channel: 'in_app' as const,
        priority: 'high' as const,
        title: '🎊 [테스트] 고객 계약 완료!',
        message: '축하합니다! 정민수님과의 2억원 계약이 완료되었습니다.',
        recipient: targetUser.id,
        scheduledAt: new Date(now.getTime() - 15 * 60 * 1000), // 15분 전
        status: 'delivered' as const,
        metadata: {
          test: true,
          clientName: '정민수',
          contractAmount: 200000000,
          contractType: 'life_insurance',
        },
      },

      // 팔로우업 리마인더
      {
        userId: targetUser.id,
        type: 'follow_up_reminder' as const,
        channel: 'in_app' as const,
        priority: 'high' as const,
        title: '🔔 [테스트] 팔로우업 필요',
        message:
          '조민아님과의 마지막 연락 후 7일이 지났습니다. 안부 연락을 드려보세요.',
        recipient: targetUser.id,
        scheduledAt: new Date(now.getTime() - 45 * 60 * 1000), // 45분 전
        status: 'delivered' as const,
        metadata: {
          test: true,
          clientName: '조민아',
          daysSinceContact: 7,
          lastContactType: 'phone_call',
        },
      },

      // 목표 마감 경고
      {
        userId: targetUser.id,
        type: 'goal_deadline' as const,
        channel: 'in_app' as const,
        priority: 'urgent' as const,
        title: '⚠️ [테스트] 월간 목표 마감 임박',
        message:
          '이번 달 마감까지 5일 남았습니다. 현재 목표의 60% 달성했습니다.',
        recipient: targetUser.id,
        scheduledAt: new Date(now.getTime() - 25 * 60 * 1000), // 25분 전
        status: 'delivered' as const,
        metadata: {
          test: true,
          goalType: 'monthly_revenue',
          targetAmount: 50000000,
          achievedAmount: 30000000,
          achievementRate: 60,
          daysRemaining: 5,
        },
      },

      // 시스템 알림 (앱 업데이트)
      {
        userId: targetUser.id,
        type: 'system_alert' as const,
        channel: 'in_app' as const,
        priority: 'low' as const,
        title: '📱 [테스트] 앱 업데이트 안내',
        message:
          'SureCRM v2.1.0이 출시되었습니다. 새로운 기능들을 확인해보세요!',
        recipient: targetUser.id,
        scheduledAt: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3시간 전
        status: 'delivered' as const,
        metadata: {
          test: true,
          updateVersion: '2.1.0',
          updateType: 'minor',
          features: ['새 대시보드', '향상된 알림', '모바일 최적화'],
        },
      },

      // 미팅 완료 알림 (읽음 처리)
      {
        userId: targetUser.id,
        type: 'meeting_reminder' as const,
        channel: 'in_app' as const,
        priority: 'normal' as const,
        title: '✅ [테스트] 미팅 완료',
        message:
          '김태희님과의 상담 미팅이 완료되었습니다. 후속 조치를 입력해주세요.',
        recipient: targetUser.id,
        scheduledAt: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4시간 전
        status: 'read' as const,
        readAt: new Date(now.getTime() - 3.5 * 60 * 60 * 1000), // 3.5시간 전에 읽음
        metadata: {
          test: true,
          clientName: '김태희',
          meetingType: 'follow_up',
          meetingDuration: 60,
          actionRequired: 'follow_up_notes',
        },
      },

      // 추천 고객 진행 상황
      {
        userId: targetUser.id,
        type: 'new_referral' as const,
        channel: 'in_app' as const,
        priority: 'normal' as const,
        title: '📞 [테스트] 추천 고객 연락 성공',
        message: '박서준님이 추천한 이예은님과 첫 연락에 성공했습니다!',
        recipient: targetUser.id,
        scheduledAt: new Date(now.getTime() - 20 * 60 * 1000), // 20분 전
        status: 'delivered' as const,
        metadata: {
          test: true,
          referrerName: '박서준',
          newClientName: '이예은',
          contactResult: 'successful',
          nextStep: 'schedule_meeting',
        },
      },

      // 생일 이벤트 (VIP 고객)
      {
        userId: targetUser.id,
        type: 'birthday_reminder' as const,
        channel: 'in_app' as const,
        priority: 'high' as const,
        title: '🎂 [테스트] 키맨 고객 생일',
        message:
          '키맨 고객 강동원님의 생일입니다. 특별한 축하 메시지를 준비해보세요!',
        recipient: targetUser.id,
        scheduledAt: new Date(now.getTime() - 5 * 60 * 1000), // 5분 전
        status: 'delivered' as const,
        metadata: {
          test: true,
          clientName: '강동원',
          eventType: 'birthday',
          clientTier: '키맨',
          suggestedAction: 'send_gift',
        },
      },

      // 계약 갱신 리마인더
      {
        userId: targetUser.id,
        type: 'follow_up_reminder' as const,
        channel: 'in_app' as const,
        priority: 'high' as const,
        title: '🔄 [테스트] 계약 갱신 알림',
        message:
          '손예진님의 보험 계약이 30일 후 만료됩니다. 갱신 상담을 예약하세요.',
        recipient: targetUser.id,
        scheduledAt: new Date(now.getTime() - 35 * 60 * 1000), // 35분 전
        status: 'delivered' as const,
        metadata: {
          test: true,
          clientName: '손예진',
          contractType: 'health_insurance',
          expiryDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30일 후
          renewalType: 'auto_renewal_available',
        },
      },

      // 주간 성과 요약 (읽음 처리)
      {
        userId: targetUser.id,
        type: 'goal_achievement' as const,
        channel: 'in_app' as const,
        priority: 'low' as const,
        title: '📊 [테스트] 주간 성과 요약',
        message: '이번 주 성과: 신규 고객 3명, 계약 완료 2건, 목표 달성률 85%',
        recipient: targetUser.id,
        scheduledAt: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6시간 전
        status: 'read' as const,
        readAt: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5시간 전에 읽음
        metadata: {
          test: true,
          reportType: 'weekly_summary',
          period: 'week',
          newClients: 3,
          completedContracts: 2,
          achievementRate: 85,
        },
      },
    ];

    console.log(
      `📝 생성할 추가 알림 수: ${additionalTestNotifications.length}개`
    );

    // 3. 데이터베이스에 직접 INSERT
    const insertedNotifications = await db
      .insert(appNotificationQueue)
      .values(additionalTestNotifications)
      .returning();

    console.log('✅ 추가 테스트 알림 생성 완료!');
    console.log('📋 생성된 추가 알림 목록:');

    insertedNotifications.forEach((notification, index) => {
      console.log(`  ${index + 1}. ${notification.title}`);
      console.log(`     ID: ${notification.id.slice(0, 8)}...`);
      console.log(`     상태: ${notification.status}`);
      console.log(`     우선순위: ${notification.priority}`);
      console.log(`     읽음: ${notification.readAt ? '✓' : '✗'}`);
      console.log('');
    });

    // 4. 읽지 않은 알림 수 확인
    const unreadCount = insertedNotifications.filter(n => !n.readAt).length;
    console.log(`🔔 읽지 않은 알림: ${unreadCount}개`);
    console.log(
      `📖 읽은 알림: ${insertedNotifications.length - unreadCount}개`
    );

    // 5. 우선순위별 분포
    const priorityCount = insertedNotifications.reduce(
      (acc, n) => {
        acc[n.priority] = (acc[n.priority] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    console.log('📊 우선순위별 분포:');
    Object.entries(priorityCount).forEach(([priority, count]) => {
      const emoji =
        priority === 'urgent'
          ? '🔴'
          : priority === 'high'
            ? '🟠'
            : priority === 'normal'
              ? '🔵'
              : '⚪';
      console.log(`     ${emoji} ${priority}: ${count}개`);
    });

    console.log(
      '\n🎉 다양한 테스트 알림 생성 완료! 이제 알림 페이지에서 카드를 클릭해서 읽음/안읽음을 전환해보세요!'
    );

    return insertedNotifications;
  } catch (error) {
    console.error('❌ 추가 테스트 알림 생성 실패:', error);
    throw error;
  }
}

// 스크립트 실행
createMoreTestNotifications()
  .then(() => {
    console.log('🏁 추가 알림 생성 스크립트 실행 완료');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 스크립트 실행 실패:', error);
    process.exit(1);
  });
