import { db } from '~/lib/core/db';
import { eq, desc, and, or, count, sql } from 'drizzle-orm';
import {
  appNotificationQueue,
  appNotificationHistory,
  appNotificationSettings,
  appNotificationTemplates,
  appNotificationRules,
  appNotificationSubscriptions,
} from './schema';

// 타입들을 중앙 타입 파일에서 import
import type {
  NotificationQueue,
  NotificationHistory,
  NotificationSettings,
  NotificationStatus,
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  CreateNotificationData,
  NotificationQueryOptions,
} from '../types';

// 타입 재export
export type { NotificationQueue, NotificationHistory, NotificationSettings };

// 알림 목록 조회
export async function getNotifications(
  userId: string,
  options?: NotificationQueryOptions
) {
  const { limit = 50, offset = 0, status, type, unreadOnly } = options || {};

  try {
    // 필터 조건 추가
    const conditions = [eq(appNotificationQueue.userId, userId)];

    if (status) {
      conditions.push(eq(appNotificationQueue.status, status));
    }

    if (type) {
      conditions.push(eq(appNotificationQueue.type, type));
    }

    if (unreadOnly) {
      conditions.push(sql`${appNotificationQueue.readAt} IS NULL`);
    }

    const notifications = await db
      .select()
      .from(appNotificationQueue)
      .where(and(...conditions))
      .orderBy(
        // 🎯 읽지 않은 알림을 맨 위로 정렬 (readAt이 NULL인 것부터)
        sql`CASE WHEN ${appNotificationQueue.readAt} IS NULL THEN 0 ELSE 1 END`,
        desc(appNotificationQueue.createdAt)
      )
      .limit(limit)
      .offset(offset);

    return notifications;
  } catch (error) {
    console.error('알림 조회 실패:', error);
    // 에러 발생 시 빈 배열 반환
    return [];
  }
}

// 읽지 않은 알림 수 조회
export async function getUnreadNotificationCount(userId: string) {
  try {
    const result = await db
      .select({ count: count() })
      .from(appNotificationQueue)
      .where(
        and(
          eq(appNotificationQueue.userId, userId),
          sql`${appNotificationQueue.readAt} IS NULL`
        )
      );

    return result[0]?.count || 0;
  } catch (error) {
    console.error('읽지 않은 알림 수 조회 실패:', error);
    return 0;
  }
}

// 알림 읽음 처리
export async function markNotificationAsRead(
  notificationId: string,
  userId: string
) {
  try {
    const result = await db
      .update(appNotificationQueue)
      .set({
        readAt: new Date(),
        status: 'read',
      })
      .where(
        and(
          eq(appNotificationQueue.id, notificationId),
          eq(appNotificationQueue.userId, userId)
        )
      )
      .returning();

    return result[0];
  } catch (error) {
    console.error('알림 읽음 처리 실패:', error);
    return null;
  }
}

// 알림 읽지 않음 처리
export async function markNotificationAsUnread(
  notificationId: string,
  userId: string
) {
  try {
    const result = await db
      .update(appNotificationQueue)
      .set({
        readAt: null,
        status: 'delivered',
      })
      .where(
        and(
          eq(appNotificationQueue.id, notificationId),
          eq(appNotificationQueue.userId, userId)
        )
      )
      .returning();

    return result[0];
  } catch (error) {
    console.error('알림 읽지 않음 처리 실패:', error);
    return null;
  }
}

// 모든 알림 읽음 처리
export async function markAllNotificationsAsRead(userId: string) {
  try {
    const result = await db
      .update(appNotificationQueue)
      .set({
        readAt: new Date(),
        status: 'read',
      })
      .where(
        and(
          eq(appNotificationQueue.userId, userId),
          sql`${appNotificationQueue.readAt} IS NULL`
        )
      )
      .returning();

    return result;
  } catch (error) {
    console.error('모든 알림 읽음 처리 실패:', error);
    return [];
  }
}

// 알림 삭제
export async function deleteNotification(
  notificationId: string,
  userId: string
) {
  const result = await db
    .delete(appNotificationQueue)
    .where(
      and(
        eq(appNotificationQueue.id, notificationId),
        eq(appNotificationQueue.userId, userId)
      )
    )
    .returning();

  return result[0];
}

// 알림 설정 조회
export async function getNotificationSettings(userId: string) {
  const settings = await db
    .select()
    .from(appNotificationSettings)
    .where(eq(appNotificationSettings.userId, userId))
    .limit(1);

  return settings[0] || null;
}

// 알림 설정 생성/업데이트
export async function upsertNotificationSettings(
  userId: string,
  settings: Partial<NotificationSettings>
) {
  const existing = await getNotificationSettings(userId);

  if (existing) {
    const result = await db
      .update(appNotificationSettings)
      .set({
        ...settings,
        updatedAt: new Date(),
      })
      .where(eq(appNotificationSettings.userId, userId))
      .returning();

    return result[0];
  } else {
    const result = await db
      .insert(appNotificationSettings)
      .values({
        userId,
        ...settings,
      })
      .returning();

    return result[0];
  }
}

// 알림 생성
export async function createNotification(notification: CreateNotificationData) {
  try {
    console.log('🔄 데이터베이스에 알림 생성 시도:', {
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
    });

    const result = await db
      .insert(appNotificationQueue)
      .values({
        ...notification,
        scheduledAt: notification.scheduledAt || new Date(),
        priority: notification.priority || 'normal',
      })
      .returning();

    console.log('✅ 데이터베이스에 알림 생성 성공:', result[0]?.id);
    return result[0];
  } catch (error) {
    console.error('❌ 데이터베이스 알림 생성 실패:', error);
    console.error('실패한 알림 데이터:', notification);
    throw error;
  }
}

// 알림 통계 조회
export async function getNotificationStats(userId: string, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // 전체 통계
  const totalStats = await db
    .select({
      status: appNotificationQueue.status,
      count: count(),
    })
    .from(appNotificationQueue)
    .where(
      and(
        eq(appNotificationQueue.userId, userId),
        sql`${appNotificationQueue.createdAt} >= ${startDate}`
      )
    )
    .groupBy(appNotificationQueue.status);

  // 채널별 통계
  const channelStats = await db
    .select({
      channel: appNotificationQueue.channel,
      status: appNotificationQueue.status,
      count: count(),
    })
    .from(appNotificationQueue)
    .where(
      and(
        eq(appNotificationQueue.userId, userId),
        sql`${appNotificationQueue.createdAt} >= ${startDate}`
      )
    )
    .groupBy(appNotificationQueue.channel, appNotificationQueue.status);

  // 타입별 통계
  const typeStats = await db
    .select({
      type: appNotificationQueue.type,
      status: appNotificationQueue.status,
      count: count(),
    })
    .from(appNotificationQueue)
    .where(
      and(
        eq(appNotificationQueue.userId, userId),
        sql`${appNotificationQueue.createdAt} >= ${startDate}`
      )
    )
    .groupBy(appNotificationQueue.type, appNotificationQueue.status);

  return {
    totalStats,
    channelStats,
    typeStats,
  };
}

// 알림 템플릿 조회
export async function getNotificationTemplates(
  userId: string,
  teamId?: string
) {
  const conditions = [
    or(
      eq(appNotificationTemplates.userId, userId),
      sql`${appNotificationTemplates.userId} IS NULL`, // 시스템 템플릿
      teamId ? eq(appNotificationTemplates.teamId, teamId) : sql`false`
    ),
    eq(appNotificationTemplates.isActive, true),
  ];

  const templates = await db
    .select()
    .from(appNotificationTemplates)
    .where(and(...conditions))
    .orderBy(desc(appNotificationTemplates.createdAt));

  return templates;
}

// 알림 규칙 조회
export async function getNotificationRules(userId: string, teamId?: string) {
  const conditions = [
    eq(appNotificationRules.userId, userId),
    eq(appNotificationRules.isActive, true),
  ];

  if (teamId) {
    conditions.push(eq(appNotificationRules.teamId, teamId));
  }

  const rules = await db
    .select()
    .from(appNotificationRules)
    .where(and(...conditions))
    .orderBy(desc(appNotificationRules.createdAt));

  return rules;
}

// 알림 구독 조회
export async function getNotificationSubscriptions(userId: string) {
  const subscriptions = await db
    .select()
    .from(appNotificationSubscriptions)
    .where(
      and(
        eq(appNotificationSubscriptions.userId, userId),
        eq(appNotificationSubscriptions.isActive, true)
      )
    )
    .orderBy(desc(appNotificationSubscriptions.createdAt));

  return subscriptions;
}

// 시간 포맷팅 유틸리티
export function formatNotificationTime(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) {
    return '방금 전';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`;
  } else if (diffInMinutes < 1440) {
    // 24시간
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}시간 전`;
  } else if (diffInMinutes < 10080) {
    // 7일
    const days = Math.floor(diffInMinutes / 1440);
    return `${days}일 전`;
  } else {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}

// 알림 우선순위에 따른 스타일 클래스
export function getNotificationPriorityClass(
  priority: NotificationPriority
): string {
  switch (priority) {
    case 'urgent':
      return 'border-red-500 bg-red-50';
    case 'high':
      return 'border-orange-500 bg-orange-50';
    case 'normal':
      return 'border-blue-500 bg-blue-50';
    case 'low':
      return 'border-gray-500 bg-gray-50';
    default:
      return 'border-gray-500 bg-gray-50';
  }
}

// 알림 타입에 따른 아이콘
export function getNotificationTypeIcon(type: NotificationType): string {
  switch (type) {
    case 'meeting_reminder':
      return '📅';
    case 'goal_achievement':
      return '🎯';
    case 'goal_deadline':
      return '⏰';
    case 'new_referral':
      return '👥';
    case 'client_milestone':
      return '🏆';
    case 'team_update':
      return '📢';
    case 'system_alert':
      return '⚠️';
    case 'birthday_reminder':
      return '🎂';
    case 'follow_up_reminder':
      return '📞';
    case 'contract_expiry':
      return '📄';
    case 'payment_due':
      return '💰';
    default:
      return '🔔';
  }
}
