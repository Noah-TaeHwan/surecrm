/**
 * 🧪 데이터베이스에 직접 테스트 알림 생성 스크립트
 */

import { db } from '../app/lib/core/db';
import { profiles } from '../app/lib/schema/core';
import { appNotificationQueue } from '../app/features/notifications/lib/schema';
import { eq } from 'drizzle-orm';

async function createTestNotifications() {
  console.log('🧪 데이터베이스 직접 테스트 알림 생성 시작');

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

    // 2. 테스트 알림 데이터 생성
    const now = new Date();
    const testNotifications = [
      {
        userId: targetUser.id,
        type: 'meeting_reminder' as const,
        channel: 'in_app' as const,
        priority: 'high' as const,
        title: '📅 [테스트] 1시간 후 미팅 예정',
        message: '1시간 후 최민수님과 상담 미팅이 있습니다',
        recipient: targetUser.id,
        scheduledAt: now,
        status: 'delivered' as const,
        metadata: {
          test: true,
          meetingId: 'meeting-test-001',
          clientName: '최민수',
          meetingType: 'first_consultation',
        },
      },
      {
        userId: targetUser.id,
        type: 'system_alert' as const,
        channel: 'in_app' as const,
        priority: 'urgent' as const,
        title: '🔥 [테스트] 박지민님 계약 지연 중!',
        message:
          '계약 임박 고객이 5일째 정체 중입니다. 즉시 연락하여 계약을 완료하세요',
        recipient: targetUser.id,
        scheduledAt: now,
        status: 'delivered' as const,
        metadata: {
          test: true,
          clientName: '박지민',
          stageName: '계약 체결',
          daysSinceUpdate: 5,
        },
      },
      {
        userId: targetUser.id,
        type: 'new_referral' as const,
        channel: 'in_app' as const,
        priority: 'normal' as const,
        title: '🎉 [테스트] 새로운 고객 추천!',
        message: '홍길동님이 새로운 고객을 추천해주셨습니다.',
        recipient: targetUser.id,
        scheduledAt: new Date(now.getTime() - 10 * 60 * 1000), // 10분 전
        status: 'delivered' as const,
        metadata: {
          test: true,
          referrerName: '홍길동',
          newClientName: '김영희',
        },
      },
      {
        userId: targetUser.id,
        type: 'birthday_reminder' as const,
        channel: 'in_app' as const,
        priority: 'normal' as const,
        title: '🎂 [테스트] 김영희님의 생일입니다!',
        message: '오늘은 김영희님의 생일입니다. 축하 메시지를 보내보세요',
        recipient: targetUser.id,
        scheduledAt: new Date(now.getTime() - 30 * 60 * 1000), // 30분 전
        status: 'delivered' as const,
        metadata: {
          test: true,
          clientName: '김영희',
          eventType: 'birthday',
        },
      },
      {
        userId: targetUser.id,
        type: 'goal_achievement' as const,
        channel: 'in_app' as const,
        priority: 'normal' as const,
        title: '🎯 [테스트] 월간 목표 달성!',
        message: '축하합니다! 이번 달 계약 목표를 달성했습니다 (5건 완료)',
        recipient: targetUser.id,
        scheduledAt: new Date(now.getTime() - 60 * 60 * 1000), // 1시간 전
        status: 'read' as const, // 이 알림은 읽음 처리
        readAt: new Date(now.getTime() - 50 * 60 * 1000), // 50분 전에 읽음
        metadata: {
          test: true,
          goalType: 'monthly_contracts',
          targetAmount: 5,
          achievedAmount: 5,
        },
      },
    ];

    console.log(`📝 생성할 알림 수: ${testNotifications.length}개`);

    // 3. 데이터베이스에 직접 INSERT
    const insertedNotifications = await db
      .insert(appNotificationQueue)
      .values(testNotifications)
      .returning();

    console.log('✅ 테스트 알림 생성 완료!');
    console.log('📋 생성된 알림 목록:');

    insertedNotifications.forEach((notification, index) => {
      console.log(`  ${index + 1}. ${notification.title}`);
      console.log(`     ID: ${notification.id.slice(0, 8)}...`);
      console.log(`     상태: ${notification.status}`);
      console.log(`     읽음: ${notification.readAt ? '✓' : '✗'}`);
      console.log('');
    });

    // 4. 읽지 않은 알림 수 확인
    const unreadCount = insertedNotifications.filter(n => !n.readAt).length;
    console.log(`🔔 읽지 않은 알림: ${unreadCount}개`);
    console.log(
      `📖 읽은 알림: ${insertedNotifications.length - unreadCount}개`
    );

    console.log(
      '\n🎉 테스트 완료! 이제 헤더의 종 아이콘을 클릭해서 확인해보세요!'
    );

    return insertedNotifications;
  } catch (error) {
    console.error('❌ 테스트 알림 생성 실패:', error);
    throw error;
  }
}

// 스크립트 실행
createTestNotifications()
  .then(() => {
    console.log('🏁 스크립트 실행 완료');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 스크립트 실행 실패:', error);
    process.exit(1);
  });
