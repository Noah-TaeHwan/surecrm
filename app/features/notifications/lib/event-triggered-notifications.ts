import { db } from '~/lib/core/db';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import { clients, pipelineStages, meetings } from '~/lib/schema/core';
import { clientDetails } from '~/features/clients/lib/schema';
import { createNotification } from './notifications-data';

// 🎯 실제 CRM 이벤트 발생 시 자동 알림 시스템
// 프로덕트헌트처럼 "이벤트 발생 → 자동 알림" 방식

/**
 * 🎂 1. 고객 생일 알림 (매일 자동 실행)
 * 조건: 생일 3일 전 + 당일
 */
export async function triggerBirthdayNotifications() {
  console.log('🎂 생일 알림 자동 트리거 실행');

  try {
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);

    // 오늘부터 3일 후까지 생일인 고객들 조회
    const birthdayClients = await db
      .select({
        client: clients,
        details: clientDetails,
      })
      .from(clients)
      .leftJoin(clientDetails, eq(clients.id, clientDetails.clientId))
      .where(
        and(
          eq(clients.isActive, true),
          sql`EXTRACT(MONTH FROM ${clientDetails.birthDate}) = ${
            today.getMonth() + 1
          }`,
          sql`EXTRACT(DAY FROM ${
            clientDetails.birthDate
          }) >= ${today.getDate()}`,
          sql`EXTRACT(DAY FROM ${
            clientDetails.birthDate
          }) <= ${threeDaysLater.getDate()}`
        )
      );

    for (const { client, details } of birthdayClients) {
      if (!details?.birthDate || !client.agentId) continue;

      const birthDate = new Date(details.birthDate);
      const thisYearBirthday = new Date(
        today.getFullYear(),
        birthDate.getMonth(),
        birthDate.getDate()
      );

      const daysUntilBirthday = Math.ceil(
        (thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      let title = '';
      let message = '';

      if (daysUntilBirthday === 0) {
        title = `🎂 ${client.fullName}님의 생일입니다!`;
        message = `오늘은 ${client.fullName}님의 생일입니다. 축하 메시지를 보내보세요`;
      } else if (daysUntilBirthday === 3) {
        title = `📅 ${client.fullName}님의 생일 3일 전`;
        message = `${
          client.fullName
        }님의 생일이 3일 후입니다 (${thisYearBirthday.toLocaleDateString(
          'ko-KR'
        )})`;
      }

      if (title) {
        await createNotification({
          userId: client.agentId,
          type: 'birthday_reminder',
          channel: 'in_app',
          priority: 'normal',
          title,
          message,
          recipient: client.agentId,
          scheduledAt: new Date(),
          metadata: {
            clientId: client.id,
            clientName: client.fullName,
            birthDate: details.birthDate,
            daysUntil: daysUntilBirthday,
            eventType: 'birthday',
          },
        });

        console.log(
          `✅ 생일 알림 생성: ${client.fullName} (${daysUntilBirthday}일 전)`
        );
      }
    }
  } catch (error) {
    console.error('❌ 생일 알림 트리거 실패:', error);
  }
}

/**
 * ⏰ 2. 파이프라인 단계 지연 알림 (매일 자동 실행)
 * 조건: 같은 단계 7일/14일 이상 정체
 */
export async function triggerPipelineStagnationNotifications() {
  console.log('📈 파이프라인 지연 알림 자동 트리거 실행');

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    // 7일 이상 같은 단계에 있는 고객들
    const stagnantClients = await db
      .select({
        client: clients,
        stage: pipelineStages,
      })
      .from(clients)
      .leftJoin(pipelineStages, eq(clients.currentStageId, pipelineStages.id))
      .where(
        and(eq(clients.isActive, true), lte(clients.updatedAt, sevenDaysAgo))
      );

    for (const { client, stage } of stagnantClients) {
      if (!client.agentId || !stage || stage.name === '제외됨') continue;

      const daysSinceUpdate = Math.floor(
        (new Date().getTime() - new Date(client.updatedAt).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      let title = '';
      let message = '';
      let priority: 'normal' | 'high' | 'urgent' = 'normal';

      if (daysSinceUpdate >= 14) {
        title = `🚨 ${client.fullName}님 장기 정체 중!`;
        message = `${client.fullName}님이 '${stage.name}' 단계에 ${daysSinceUpdate}일째 머물러 있습니다. 즉시 조치가 필요합니다`;
        priority = 'urgent';
      } else if (daysSinceUpdate >= 7) {
        title = `📈 ${client.fullName}님 파이프라인 지연`;
        message = `${client.fullName}님이 '${stage.name}' 단계에 ${daysSinceUpdate}일째 머물러 있습니다`;
        priority = 'normal';
      }

      if (title) {
        await createNotification({
          userId: client.agentId,
          type: 'system_alert',
          channel: 'in_app',
          priority,
          title,
          message,
          recipient: client.agentId,
          scheduledAt: new Date(),
          metadata: {
            clientId: client.id,
            clientName: client.fullName,
            stageName: stage.name,
            daysSinceUpdate,
            eventType: 'pipeline_stagnation',
          },
        });

        console.log(
          `✅ 파이프라인 지연 알림 생성: ${client.fullName} (${daysSinceUpdate}일)`
        );
      }
    }
  } catch (error) {
    console.error('❌ 파이프라인 지연 알림 트리거 실패:', error);
  }
}

/**
 * 🔥 3. 계약 임박 고객 알림 (실시간 트리거)
 * 조건: 계약 단계 진입시 + 3일 이상 지연시
 */
export async function triggerContractUrgentNotifications() {
  console.log('🔥 계약 임박 알림 자동 트리거 실행');

  try {
    // 모든 에이전트의 계약 단계 찾기
    const allStages = await db.select().from(pipelineStages);
    const contractStages = allStages.filter(
      (stage) =>
        stage.name.includes('계약') ||
        stage.name.includes('체결') ||
        stage.name.includes('완료')
    );

    for (const stage of contractStages) {
      const contractClients = await db
        .select()
        .from(clients)
        .where(
          and(eq(clients.currentStageId, stage.id), eq(clients.isActive, true))
        );

      for (const client of contractClients) {
        const daysSinceUpdate = Math.floor(
          (new Date().getTime() - new Date(client.updatedAt).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        let title = '';
        let message = '';
        let priority: 'high' | 'urgent' = 'high';

        if (daysSinceUpdate >= 3) {
          title = `🔥 ${client.fullName}님 계약 지연 중!`;
          message = `계약 임박 고객이 ${daysSinceUpdate}일째 정체 중입니다. 즉시 연락하여 계약을 완료하세요`;
          priority = 'urgent';
        } else if (daysSinceUpdate === 0) {
          // 오늘 계약 단계에 진입한 경우
          title = `✨ ${client.fullName}님 계약 단계 진입!`;
          message = `${client.fullName}님이 계약 체결 단계에 진입했습니다! 지금이 계약 완료 골든타임입니다`;
          priority = 'high';
        }

        if (title && client.agentId) {
          await createNotification({
            userId: client.agentId,
            type: 'system_alert',
            channel: 'in_app',
            priority,
            title,
            message,
            recipient: client.agentId,
            scheduledAt: new Date(),
            metadata: {
              clientId: client.id,
              clientName: client.fullName,
              stageName: stage.name,
              daysSinceUpdate,
              eventType: 'contract_urgent',
            },
          });

          console.log(
            `✅ 계약 임박 알림 생성: ${client.fullName} (${daysSinceUpdate}일)`
          );
        }
      }
    }
  } catch (error) {
    console.error('❌ 계약 임박 알림 트리거 실패:', error);
  }
}

/**
 * 📅 4. 미팅 리마인더 (실시간 트리거)
 * 조건: 미팅 1시간 전 + 10분 전
 */
export async function triggerMeetingReminders() {
  console.log('📅 미팅 리마인더 자동 트리거 실행');

  try {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);

    // 1시간 후 미팅
    const upcomingMeetings1h = await db
      .select({
        meeting: meetings,
        client: clients,
      })
      .from(meetings)
      .leftJoin(clients, eq(meetings.clientId, clients.id))
      .where(
        and(
          gte(meetings.scheduledAt, now),
          lte(meetings.scheduledAt, oneHourLater),
          eq(meetings.status, 'scheduled')
        )
      );

    // 10분 후 미팅
    const upcomingMeetings10m = await db
      .select({
        meeting: meetings,
        client: clients,
      })
      .from(meetings)
      .leftJoin(clients, eq(meetings.clientId, clients.id))
      .where(
        and(
          gte(meetings.scheduledAt, now),
          lte(meetings.scheduledAt, tenMinutesLater),
          eq(meetings.status, 'scheduled')
        )
      );

    // 1시간 전 알림
    for (const { meeting, client } of upcomingMeetings1h) {
      if (!meeting.agentId || !client) continue;

      await createNotification({
        userId: meeting.agentId,
        type: 'meeting_reminder',
        channel: 'in_app',
        priority: 'high',
        title: `📅 1시간 후 미팅 예정`,
        message: `1시간 후 ${client.fullName}님과 ${meeting.meetingType} 미팅이 있습니다`,
        recipient: meeting.agentId,
        scheduledAt: new Date(),
        metadata: {
          meetingId: meeting.id,
          clientId: client.id,
          clientName: client.fullName,
          meetingType: meeting.meetingType,
          scheduledAt: meeting.scheduledAt,
          reminderType: '1hour',
          eventType: 'meeting_reminder',
        },
      });

      console.log(`✅ 1시간 전 미팅 알림: ${client.fullName}`);
    }

    // 10분 전 알림
    for (const { meeting, client } of upcomingMeetings10m) {
      if (!meeting.agentId || !client) continue;

      await createNotification({
        userId: meeting.agentId,
        type: 'meeting_reminder',
        channel: 'in_app',
        priority: 'urgent',
        title: `⏰ 10분 후 미팅 시작!`,
        message: `10분 후 ${client.fullName}님과 ${meeting.meetingType} 미팅이 시작됩니다`,
        recipient: meeting.agentId,
        scheduledAt: new Date(),
        metadata: {
          meetingId: meeting.id,
          clientId: client.id,
          clientName: client.fullName,
          meetingType: meeting.meetingType,
          scheduledAt: meeting.scheduledAt,
          reminderType: '10minutes',
          eventType: 'meeting_reminder',
        },
      });

      console.log(`✅ 10분 전 미팅 알림: ${client.fullName}`);
    }
  } catch (error) {
    console.error('❌ 미팅 리마인더 트리거 실패:', error);
  }
}

/**
 * 🎉 5. 초대장 사용 알림 (실시간 트리거)
 * 조건: 초대장으로 회원가입 완료시
 */
export async function triggerInvitationUsedNotification(
  invitationId: string,
  newUserId: string,
  inviterEmail: string
) {
  console.log('🎉 초대장 사용 알림 자동 트리거 실행');

  try {
    // 초대한 사람에게 알림
    await createNotification({
      userId: inviterEmail, // 임시로 이메일 사용
      type: 'new_referral',
      channel: 'in_app',
      priority: 'normal',
      title: `🎉 초대장이 사용되었습니다!`,
      message: `새로운 사용자가 회원가입을 완료했습니다. (추천인: ${inviterEmail})`,
      recipient: inviterEmail,
      scheduledAt: new Date(),
      metadata: {
        invitationId,
        newUserId,
        inviterEmail,
        eventType: 'invitation_used',
      },
    });

    console.log(`✅ 초대장 사용 알림 생성: ${inviterEmail}`);
  } catch (error) {
    console.error('❌ 초대장 사용 알림 트리거 실패:', error);
  }
}

/**
 * 📊 메인 스케줄러 - 매일 실행되는 자동 알림들
 */
export async function runDailyNotificationTriggers() {
  console.log('🚀 일일 자동 알림 트리거 시작');

  try {
    await Promise.all([
      triggerBirthdayNotifications(),
      triggerPipelineStagnationNotifications(),
      triggerContractUrgentNotifications(),
    ]);

    console.log('✅ 일일 자동 알림 트리거 완료');
  } catch (error) {
    console.error('❌ 일일 자동 알림 트리거 실패:', error);
  }
}

/**
 * ⚡ 실시간 트리거들 - 특정 이벤트 발생시 즉시 실행
 * (이는 각 기능에서 직접 호출됨)
 */
export const realtimeTriggers = {
  onClientStageChanged: triggerContractUrgentNotifications,
  onMeetingScheduled: triggerMeetingReminders,
  onInvitationUsed: triggerInvitationUsedNotification,
};
