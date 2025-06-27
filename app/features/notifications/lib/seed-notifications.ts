import { db } from '~/lib/core/db.server';
import {
  appNotificationSettings,
  appNotificationTemplates,
  appNotificationQueue,
  appNotificationRules,
  appNotificationSubscriptions,
  type NotificationType,
  type NotificationChannel,
  type NotificationPriority,
  type NotificationStatus,
} from './schema';

// 알림 시드 데이터 생성
export async function seedNotifications(userId: string) {
  console.log('🔔 Notifications 시드 데이터 생성 시작...');

  try {
    // 1. 알림 설정 생성
    await db
      .insert(appNotificationSettings)
      .values({
        userId,
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        kakaoNotifications: false,
        meetingReminders: true,
        goalDeadlines: true,
        newReferrals: true,
        clientMilestones: true,
        teamUpdates: true,
        systemAlerts: true,
        birthdayReminders: true,
        followUpReminders: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        weekendNotifications: false,
      })
      .onConflictDoNothing();

    // 2. 기본 알림 템플릿 생성
    const templates = [
      {
        userId: null, // 시스템 템플릿
        teamId: null,
        type: 'meeting_reminder' as NotificationType,
        channel: 'in_app' as NotificationChannel,
        name: '미팅 알림 기본 템플릿',
        subject: '미팅 알림',
        bodyTemplate:
          '{{clientName}}님과의 미팅이 {{timeUntil}} 후 시작됩니다.',
        variables: { clientName: 'string', timeUntil: 'string' },
        isDefault: true,
        isActive: true,
      },
      {
        userId: null,
        teamId: null,
        type: 'new_referral' as NotificationType,
        channel: 'in_app' as NotificationChannel,
        name: '신규 소개 알림 템플릿',
        subject: '새로운 고객 소개',
        bodyTemplate:
          '{{referrerName}}님이 {{newClientName}}님을 소개해주셨습니다.',
        variables: { referrerName: 'string', newClientName: 'string' },
        isDefault: true,
        isActive: true,
      },
      {
        userId: null,
        teamId: null,
        type: 'client_milestone' as NotificationType,
        channel: 'in_app' as NotificationChannel,
        name: '고객 마일스톤 알림 템플릿',
        subject: '고객 마일스톤 달성',
        bodyTemplate: '{{clientName}}님이 {{milestone}}을 달성했습니다.',
        variables: { clientName: 'string', milestone: 'string' },
        isDefault: true,
        isActive: true,
      },
    ];

    await db
      .insert(appNotificationTemplates)
      .values(templates)
      .onConflictDoNothing();

    // 3. 샘플 알림 생성
    const now = new Date();
    const sampleNotifications = [
      {
        userId,
        type: 'new_referral' as NotificationType,
        channel: 'in_app' as NotificationChannel,
        priority: 'normal' as NotificationPriority,
        title: '새로운 고객 등록',
        message: '이영희님이 김철수님의 소개로 등록되었습니다.',
        recipient: userId,
        scheduledAt: new Date(now.getTime() - 5 * 60 * 1000), // 5분 전
        status: 'delivered' as NotificationStatus,
      },
      {
        userId,
        type: 'meeting_reminder' as NotificationType,
        channel: 'in_app' as NotificationChannel,
        priority: 'high' as NotificationPriority,
        title: '미팅 예정',
        message: '박지성님과의 미팅이 30분 후 시작됩니다.',
        recipient: userId,
        scheduledAt: new Date(now.getTime() - 25 * 60 * 1000), // 25분 전
        status: 'delivered' as NotificationStatus,
      },
      {
        userId,
        type: 'client_milestone' as NotificationType,
        channel: 'in_app' as NotificationChannel,
        priority: 'normal' as NotificationPriority,
        title: '계약 체결 완료',
        message: '최민수님의 보험 계약이 체결되었습니다.',
        recipient: userId,
        scheduledAt: new Date(now.getTime() - 60 * 60 * 1000), // 1시간 전
        status: 'read' as NotificationStatus,
        readAt: new Date(now.getTime() - 50 * 60 * 1000), // 50분 전에 읽음
      },
      {
        userId,
        type: 'new_referral' as NotificationType,
        channel: 'in_app' as NotificationChannel,
        priority: 'normal' as NotificationPriority,
        title: '소개 네트워크 업데이트',
        message: '김철수님이 새로운 고객을 소개해주셨습니다.',
        recipient: userId,
        scheduledAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2시간 전
        status: 'read' as NotificationStatus,
        readAt: new Date(now.getTime() - 90 * 60 * 1000), // 90분 전에 읽음
      },
      {
        userId,
        type: 'meeting_reminder' as NotificationType,
        channel: 'in_app' as NotificationChannel,
        priority: 'urgent' as NotificationPriority,
        title: '일정 변경 알림',
        message: '내일 오후 2시 미팅이 3시로 변경되었습니다.',
        recipient: userId,
        scheduledAt: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3시간 전
        status: 'delivered' as NotificationStatus,
      },
      {
        userId,
        type: 'system_alert' as NotificationType,
        channel: 'in_app' as NotificationChannel,
        priority: 'low' as NotificationPriority,
        title: '월간 보고서 준비',
        message: '이번 달 성과 보고서가 준비되었습니다.',
        recipient: userId,
        scheduledAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1일 전
        status: 'read' as NotificationStatus,
        readAt: new Date(now.getTime() - 20 * 60 * 60 * 1000), // 20시간 전에 읽음
      },
      {
        userId,
        type: 'birthday_reminder' as NotificationType,
        channel: 'in_app' as NotificationChannel,
        priority: 'normal' as NotificationPriority,
        title: '고객 생일 알림',
        message: '홍길동님의 생일이 내일입니다. 축하 메시지를 보내보세요!',
        recipient: userId,
        scheduledAt: new Date(now.getTime() - 10 * 60 * 1000), // 10분 전
        status: 'delivered' as NotificationStatus,
      },
      {
        userId,
        type: 'follow_up_reminder' as NotificationType,
        channel: 'in_app' as NotificationChannel,
        priority: 'normal' as NotificationPriority,
        title: '팔로업 알림',
        message: '정수진님과의 팔로업 미팅 일정을 잡아주세요.',
        recipient: userId,
        scheduledAt: new Date(now.getTime() - 45 * 60 * 1000), // 45분 전
        status: 'delivered' as NotificationStatus,
      },
    ];

    await db
      .insert(appNotificationQueue)
      .values(sampleNotifications)
      .onConflictDoNothing();

    // 4. 기본 알림 규칙 생성
    const rules = [
      {
        userId,
        name: '미팅 30분 전 알림',
        description: '모든 미팅 30분 전에 알림을 보냅니다.',
        triggerEvent: 'meeting_scheduled',
        conditions: { timeBeforeMeeting: 30 },
        actions: [
          {
            type: 'send_notification',
            channel: 'in_app',
            template: 'meeting_reminder',
          },
        ],
        isActive: true,
      },
      {
        userId,
        name: '신규 고객 등록 알림',
        description: '새로운 고객이 등록될 때 알림을 보냅니다.',
        triggerEvent: 'client_created',
        conditions: {},
        actions: [
          {
            type: 'send_notification',
            channel: 'in_app',
            template: 'new_client',
          },
        ],
        isActive: true,
      },
    ];

    await db.insert(appNotificationRules).values(rules).onConflictDoNothing();

    // 5. 알림 구독 설정
    const subscriptions = [
      {
        userId,
        resourceType: 'client',
        resourceId: userId,
        subscriptionType: 'client_updates',
        channels: ['in_app' as NotificationChannel],
        isActive: true,
      },
      {
        userId,
        resourceType: 'meeting',
        resourceId: userId,
        subscriptionType: 'meeting_reminders',
        channels: ['in_app' as NotificationChannel],
        isActive: true,
      },
    ];

    await db
      .insert(appNotificationSubscriptions)
      .values(subscriptions)
      .onConflictDoNothing();

    console.log('✅ Notifications 시드 데이터 생성 완료');
    return {
      notificationSettings: 1,
      notificationTemplates: templates.length,
      notificationQueue: sampleNotifications.length,
      notificationRules: rules.length,
      notificationSubscriptions: subscriptions.length,
    };
  } catch (error) {
    console.error('❌ Notifications 시드 데이터 생성 실패:', error);
    throw error;
  }
}

// 알림 데이터 정리
export async function cleanNotifications() {
  console.log('🧹 Notifications 데이터 정리 중...');

  try {
    await db.delete(appNotificationSubscriptions);
    await db.delete(appNotificationRules);
    await db.delete(appNotificationQueue);
    await db.delete(appNotificationTemplates);
    await db.delete(appNotificationSettings);

    console.log('✅ Notifications 데이터 정리 완료');
  } catch (error) {
    console.error('❌ Notifications 데이터 정리 실패:', error);
    throw error;
  }
}
