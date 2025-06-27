import { db } from '~/lib/core/db.server';
import { eq, and, gte, lte, sql, isNull } from 'drizzle-orm';
import { clients, pipelineStages } from '~/lib/schema/core';
import { clientDetails } from '~/features/clients/lib/schema';
import { createNotification } from './notifications-data';

// 🎯 보험 영업 특화 자동 알림 생성 시스템

// 1. 🎂 고객 생일 알림 (3일 전, 당일)
export async function createBirthdayNotifications(agentId: string) {
  try {
    console.log('🎂 생일 알림 생성 시작');

    // 오늘부터 3일 후까지의 생일 고객 조회
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);

    // 현재 년도의 생일 계산
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
    const todayDay = String(today.getDate()).padStart(2, '0');
    const threeDaysMonth = String(threeDaysLater.getMonth() + 1).padStart(
      2,
      '0'
    );
    const threeDaysDay = String(threeDaysLater.getDate()).padStart(2, '0');

    const birthdayClients = await db
      .select({
        client: clients,
        details: clientDetails,
      })
      .from(clients)
      .leftJoin(clientDetails, eq(clients.id, clientDetails.clientId))
      .where(
        and(
          eq(clients.agentId, agentId),
          eq(clients.isActive, true),
          sql`EXTRACT(MONTH FROM ${clientDetails.birthDate}) * 100 + EXTRACT(DAY FROM ${clientDetails.birthDate}) 
              BETWEEN ${todayMonth}${todayDay}::int AND ${threeDaysMonth}${threeDaysDay}::int`
        )
      );

    const notifications = [];

    for (const { client, details } of birthdayClients) {
      if (!details?.birthDate) continue;

      const birthDate = new Date(details.birthDate);
      const thisYearBirthday = new Date(
        today.getFullYear(),
        birthDate.getMonth(),
        birthDate.getDate()
      );

      // 생일이 지났으면 내년 생일로 계산
      if (thisYearBirthday < today) {
        thisYearBirthday.setFullYear(today.getFullYear() + 1);
      }

      const daysUntilBirthday = Math.ceil(
        (thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      let title = '';
      let message = '';
      let priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal';

      if (daysUntilBirthday === 0) {
        title = `🎉 ${client.fullName}님 생일입니다!`;
        message = `오늘은 ${client.fullName}님의 생일입니다. 축하 메시지를 보내세요!`;
        priority = 'high';
      } else if (daysUntilBirthday <= 3) {
        title = `🎂 ${client.fullName}님 생일 ${daysUntilBirthday}일 전`;
        message = `${daysUntilBirthday}일 후가 ${client.fullName}님의 생일입니다. 미리 준비해보세요!`;
        priority = 'normal';
      }

      if (title) {
        notifications.push({
          userId: agentId,
          type: 'birthday_reminder' as const,
          channel: 'in_app' as const,
          priority,
          title,
          message,
          recipient: agentId,
          scheduledAt: new Date(),
          metadata: {
            clientId: client.id,
            clientName: client.fullName,
            birthDate: details.birthDate,
            daysUntil: daysUntilBirthday,
          },
        });
      }
    }

    // 알림 생성
    for (const notification of notifications) {
      await createNotification(notification);
    }

    console.log(`✅ 생일 알림 ${notifications.length}개 생성 완료`);
    return notifications;
  } catch (error) {
    console.error('❌ 생일 알림 생성 실패:', error);
    return [];
  }
}

// 2. 📞 후속 조치 알림 (마지막 상담 후 일정 기간)
export async function createFollowUpNotifications(agentId: string) {
  try {
    console.log('📞 후속 조치 알림 생성 시작');

    // 마지막 상담 후 7일, 14일, 30일이 지난 고객들 조회
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 제외됨 단계가 아닌 활성 고객 조회
    const pipelineStagesResult = await db
      .select()
      .from(pipelineStages)
      .where(eq(pipelineStages.agentId, agentId));

    const excludedStage = pipelineStagesResult.find(s => s.name === '제외됨');

    const activeClientsConditions = [
      eq(clients.agentId, agentId),
      eq(clients.isActive, true),
    ];

    if (excludedStage) {
      activeClientsConditions.push(
        sql`${clients.currentStageId} != ${excludedStage.id}`
      );
    }

    const activeClients = await db
      .select()
      .from(clients)
      .where(and(...activeClientsConditions));

    const notifications = [];

    for (const client of activeClients) {
      // 마지막 업데이트 시간 확인
      const lastUpdate = client.updatedAt || client.createdAt;
      const daysSinceUpdate = Math.floor(
        (new Date().getTime() - new Date(lastUpdate).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      let title = '';
      let message = '';
      let priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal';

      if (daysSinceUpdate >= 30) {
        title = `⏰ ${client.fullName}님 장기 미연락`;
        message = `${client.fullName}님과 ${daysSinceUpdate}일간 연락이 없었습니다. 안부 확인이 필요합니다.`;
        priority = 'high';
      } else if (daysSinceUpdate >= 14) {
        title = `📞 ${client.fullName}님 후속 조치 필요`;
        message = `${client.fullName}님과 ${daysSinceUpdate}일간 연락이 없었습니다. 후속 조치를 검토해보세요.`;
        priority = 'normal';
      } else if (daysSinceUpdate >= 7) {
        title = `💭 ${client.fullName}님 근황 체크`;
        message = `${client.fullName}님과 ${daysSinceUpdate}일간 연락이 없었습니다. 간단한 안부 인사는 어떨까요?`;
        priority = 'low';
      }

      if (title) {
        notifications.push({
          userId: agentId,
          type: 'follow_up_reminder' as const,
          channel: 'in_app' as const,
          priority,
          title,
          message,
          recipient: agentId,
          scheduledAt: new Date(),
          metadata: {
            clientId: client.id,
            clientName: client.fullName,
            daysSinceUpdate,
            lastUpdateDate: lastUpdate,
          },
        });
      }
    }

    // 알림 생성
    for (const notification of notifications) {
      await createNotification(notification);
    }

    console.log(`✅ 후속 조치 알림 ${notifications.length}개 생성 완료`);
    return notifications;
  } catch (error) {
    console.error('❌ 후속 조치 알림 생성 실패:', error);
    return [];
  }
}

// 3. 🎯 영업 단계 정체 알림 (같은 단계에 오래 머물러 있는 경우)
export async function createPipelineStagnationNotifications(agentId: string) {
  try {
    console.log('🎯 영업 단계 정체 알림 생성 시작');

    // 같은 단계에 14일 이상 머물러 있는 고객들 조회
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const stagnantClients = await db
      .select({
        client: clients,
        stage: pipelineStages,
      })
      .from(clients)
      .leftJoin(pipelineStages, eq(clients.currentStageId, pipelineStages.id))
      .where(
        and(
          eq(clients.agentId, agentId),
          eq(clients.isActive, true),
          lte(clients.updatedAt, fourteenDaysAgo)
        )
      );

    const notifications = [];

    for (const { client, stage } of stagnantClients) {
      if (!stage || stage.name === '제외됨' || stage.name === '계약 완료')
        continue;

      const daysSinceUpdate = Math.floor(
        (new Date().getTime() -
          new Date(client.updatedAt || client.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      notifications.push({
        userId: agentId,
        type: 'client_milestone' as const,
        channel: 'in_app' as const,
        priority: 'normal' as const,
        title: `🔄 ${client.fullName}님 단계 진행 점검`,
        message: `${client.fullName}님이 "${stage.name}" 단계에 ${daysSinceUpdate}일째 머물러 있습니다. 다음 단계로 진행을 검토해보세요.`,
        recipient: agentId,
        scheduledAt: new Date(),
        metadata: {
          clientId: client.id,
          clientName: client.fullName,
          currentStage: stage.name,
          daysSinceUpdate,
        },
      });
    }

    // 알림 생성
    for (const notification of notifications) {
      await createNotification(notification);
    }

    console.log(`✅ 영업 단계 정체 알림 ${notifications.length}개 생성 완료`);
    return notifications;
  } catch (error) {
    console.error('❌ 영업 단계 정체 알림 생성 실패:', error);
    return [];
  }
}

// 4. 📈 월간 성과 리포트 알림
export async function createMonthlyPerformanceNotification(agentId: string) {
  try {
    console.log('📈 월간 성과 리포트 알림 생성 시작');

    // 이번 달 성과 계산
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );

    // 이번 달 신규 고객 수
    const newClientsThisMonth = await db
      .select()
      .from(clients)
      .where(
        and(
          eq(clients.agentId, agentId),
          gte(clients.createdAt, firstDayOfMonth),
          lte(clients.createdAt, lastDayOfMonth)
        )
      );

    // 계약 완료 고객 수
    const pipelineStagesResult = await db
      .select()
      .from(pipelineStages)
      .where(eq(pipelineStages.agentId, agentId));

    const completedStage = pipelineStagesResult.find(
      s => s.name === '계약 완료'
    );
    let contractedClientsThisMonth = 0;

    if (completedStage) {
      const contracted = await db
        .select()
        .from(clients)
        .where(
          and(
            eq(clients.agentId, agentId),
            eq(clients.currentStageId, completedStage.id),
            gte(clients.updatedAt, firstDayOfMonth),
            lte(clients.updatedAt, lastDayOfMonth)
          )
        );
      contractedClientsThisMonth = contracted.length;
    }

    const notification = {
      userId: agentId,
      type: 'goal_achievement' as const,
      channel: 'in_app' as const,
      priority: 'normal' as const,
      title: `📊 ${today.getMonth() + 1}월 성과 리포트`,
      message: `이번 달 성과: 신규 고객 ${newClientsThisMonth.length}명, 계약 완료 ${contractedClientsThisMonth}명. 자세한 내용은 보고서 페이지에서 확인하세요!`,
      recipient: agentId,
      scheduledAt: new Date(),
      metadata: {
        month: today.getMonth() + 1,
        year: today.getFullYear(),
        newClients: newClientsThisMonth.length,
        contractedClients: contractedClientsThisMonth,
      },
    };

    await createNotification(notification);

    console.log('✅ 월간 성과 리포트 알림 생성 완료');
    return [notification];
  } catch (error) {
    console.error('❌ 월간 성과 리포트 알림 생성 실패:', error);
    return [];
  }
}

// 5. 🔄 전체 자동 알림 시스템 실행
export async function runAutoNotificationSystem(agentId: string) {
  console.log('🚀 자동 알림 시스템 시작');

  try {
    const results = await Promise.allSettled([
      createBirthdayNotifications(agentId),
      createFollowUpNotifications(agentId),
      createPipelineStagnationNotifications(agentId),
    ]);

    const totalNotifications = results.reduce((total, result) => {
      if (result.status === 'fulfilled') {
        return total + result.value.length;
      }
      return total;
    }, 0);

    console.log(
      `✅ 자동 알림 시스템 완료: 총 ${totalNotifications}개 알림 생성`
    );
    return totalNotifications;
  } catch (error) {
    console.error('❌ 자동 알림 시스템 실패:', error);
    return 0;
  }
}

// 6. 📅 매일 실행할 알림 스케줄러 (cron job 용)
export async function dailyNotificationScheduler() {
  console.log('📅 일일 알림 스케줄러 시작');

  try {
    // 모든 활성 에이전트 조회
    const { profiles } = await import('~/lib/schema/core');

    const activeAgents = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.role, 'agent'));

    let totalNotifications = 0;

    for (const agent of activeAgents) {
      const count = await runAutoNotificationSystem(agent.id);
      totalNotifications += count;
    }

    console.log(
      `✅ 일일 알림 스케줄러 완료: 총 ${totalNotifications}개 알림 생성`
    );
    return totalNotifications;
  } catch (error) {
    console.error('❌ 일일 알림 스케줄러 실패:', error);
    return 0;
  }
}
