import { db } from '~/lib/core/db';
import { eq, and, gte, lte, sql, isNull, desc } from 'drizzle-orm';
import { clients, pipelineStages, meetings } from '~/lib/schema/core';
import { clientDetails } from '~/features/clients/lib/schema';
import { createNotification } from './notifications-data';

// 🏆 보험설계사 실무 중심 스마트 알림 시스템
// 실제 보험 영업 프로세스와 고객 관리 패턴에 맞춤

/**
 * 🎯 1. 계약 임박 고객 알림 (가장 중요!)
 * - "계약 체결" 단계에 있지만 7일 이상 진전 없는 고객
 * - 월말 마감 압박 때 특히 중요
 */
export async function createContractClosingAlerts(agentId: string) {
  try {
    console.log('📝 계약 임박 고객 알림 생성 시작');

    const stages = await db
      .select()
      .from(pipelineStages)
      .where(eq(pipelineStages.agentId, agentId));

    const contractStage = stages.find(
      (s) =>
        s.name.includes('계약') ||
        s.name.includes('체결') ||
        s.name.includes('완료')
    );

    if (!contractStage) {
      console.log('계약 단계를 찾을 수 없음');
      return [];
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const contractClients = await db
      .select()
      .from(clients)
      .where(
        and(
          eq(clients.agentId, agentId),
          eq(clients.currentStageId, contractStage.id),
          lte(clients.updatedAt, sevenDaysAgo),
          eq(clients.isActive, true)
        )
      );

    const notifications = [];

    for (const client of contractClients) {
      const daysSinceUpdate = Math.floor(
        (new Date().getTime() - new Date(client.updatedAt).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      notifications.push({
        userId: agentId,
        type: 'system_alert' as const,
        channel: 'in_app' as const,
        priority: 'urgent' as const,
        title: `🔥 ${client.fullName}님 계약 마무리 필요!`,
        message: `계약 임박 고객이 ${daysSinceUpdate}일간 정체 중입니다. 즉시 연락하여 계약을 완료하세요.`,
        recipient: agentId,
        scheduledAt: new Date(),
        metadata: {
          clientId: client.id,
          clientName: client.fullName,
          stageName: contractStage.name,
          daysSinceUpdate,
          urgencyLevel: 'contract_closing',
        },
      });
    }

    for (const notification of notifications) {
      await createNotification(notification);
    }

    console.log(`✅ 계약 임박 알림 ${notifications.length}개 생성`);
    return notifications;
  } catch (error) {
    console.error('❌ 계약 임박 알림 생성 실패:', error);
    return [];
  }
}

/**
 * 🎯 2. 뜨거운 리드 놓치지 않기 알림
 * - "관심 높음" + 최근 3일 내 접촉한 고객
 * - 아직 계약하지 않았지만 가능성 높은 고객
 */
export async function createHotLeadAlerts(agentId: string) {
  try {
    console.log('🔥 핫 리드 알림 생성 시작');

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const hotClients = await db
      .select({
        client: clients,
        details: clientDetails,
      })
      .from(clients)
      .leftJoin(clientDetails, eq(clients.id, clientDetails.clientId))
      .where(
        and(
          eq(clients.agentId, agentId),
          eq(clients.importance, 'high'),
          gte(clients.updatedAt, threeDaysAgo),
          eq(clients.isActive, true)
        )
      );

    const stages = await db
      .select()
      .from(pipelineStages)
      .where(eq(pipelineStages.agentId, agentId));

    const contractStage = stages.find(
      (s) =>
        s.name.includes('계약') ||
        s.name.includes('체결') ||
        s.name.includes('완료')
    );

    // 아직 계약 단계가 아닌 고객들만 필터링
    const preContractClients = hotClients.filter(
      ({ client }) =>
        !contractStage || client.currentStageId !== contractStage.id
    );

    const notifications = [];

    for (const { client, details } of preContractClients) {
      const hourssSinceUpdate = Math.floor(
        (new Date().getTime() - new Date(client.updatedAt).getTime()) /
          (1000 * 60 * 60)
      );

      if (hourssSinceUpdate >= 24 && hourssSinceUpdate <= 72) {
        notifications.push({
          userId: agentId,
          type: 'follow_up_reminder' as const,
          channel: 'in_app' as const,
          priority: 'high' as const,
          title: `🔥 ${client.fullName}님 뜨거운 관심 유지하세요!`,
          message: `관심도 높은 고객이 ${Math.floor(
            hourssSinceUpdate / 24
          )}일 전 마지막 접촉했습니다. 지금이 계약 타이밍입니다!`,
          recipient: agentId,
          scheduledAt: new Date(),
          metadata: {
            clientId: client.id,
            clientName: client.fullName,
            importance: client.importance,
            hourssSinceUpdate,
            leadTemperature: 'hot',
          },
        });
      }
    }

    for (const notification of notifications) {
      await createNotification(notification);
    }

    console.log(`✅ 핫 리드 알림 ${notifications.length}개 생성`);
    return notifications;
  } catch (error) {
    console.error('❌ 핫 리드 알림 생성 실패:', error);
    return [];
  }
}

/**
 * 🎯 3. 월말 실적 압박 알림
 * - 월말 10일 전부터 진행 상황 체크
 * - 목표 달성을 위한 액션 아이템 제시
 */
export async function createMonthEndPressureAlerts(agentId: string) {
  try {
    console.log('📊 월말 실적 알림 생성 시작');

    const now = new Date();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysUntilMonthEnd = Math.ceil(
      (lastDayOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // 월말 10일 전부터만 알림
    if (daysUntilMonthEnd > 10) {
      return [];
    }

    // 이번 달 계약 완료 고객 수 계산
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stages = await db
      .select()
      .from(pipelineStages)
      .where(eq(pipelineStages.agentId, agentId));

    const contractStage = stages.find(
      (s) =>
        s.name.includes('계약') ||
        s.name.includes('체결') ||
        s.name.includes('완료')
    );

    let thisMonthContracts = 0;
    let nearContractClients = 0;

    if (contractStage) {
      const contractedClients = await db
        .select()
        .from(clients)
        .where(
          and(
            eq(clients.agentId, agentId),
            eq(clients.currentStageId, contractStage.id),
            gte(clients.updatedAt, startOfMonth),
            eq(clients.isActive, true)
          )
        );

      thisMonthContracts = contractedClients.length;

      // 계약 임박 고객 수 (계약 단계 직전 단계)
      const allActiveClients = await db
        .select()
        .from(clients)
        .where(
          and(
            eq(clients.agentId, agentId),
            eq(clients.importance, 'high'),
            eq(clients.isActive, true)
          )
        );

      nearContractClients = allActiveClients.filter(
        (c) => c.currentStageId !== contractStage.id
      ).length;
    }

    const notifications = [];

    let priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal';
    let urgencyEmoji = '📊';

    if (daysUntilMonthEnd <= 3) {
      priority = 'urgent';
      urgencyEmoji = '🚨';
    } else if (daysUntilMonthEnd <= 7) {
      priority = 'high';
      urgencyEmoji = '⏰';
    }

    notifications.push({
      userId: agentId,
      type: 'goal_deadline' as const,
      channel: 'in_app' as const,
      priority,
      title: `${urgencyEmoji} 월말 ${daysUntilMonthEnd}일 남음 - 실적 체크`,
      message: `이번 달 계약: ${thisMonthContracts}건 | 계약 가능성 고객: ${nearContractClients}명. ${
        daysUntilMonthEnd <= 5
          ? '집중 관리가 필요합니다!'
          : '월말 준비를 시작하세요.'
      }`,
      recipient: agentId,
      scheduledAt: new Date(),
      metadata: {
        daysUntilMonthEnd,
        thisMonthContracts,
        nearContractClients,
        monthEndPressure: priority,
        currentMonth: `${now.getFullYear()}-${String(
          now.getMonth() + 1
        ).padStart(2, '0')}`,
      },
    });

    for (const notification of notifications) {
      await createNotification(notification);
    }

    console.log(`✅ 월말 실적 알림 ${notifications.length}개 생성`);
    return notifications;
  } catch (error) {
    console.error('❌ 월말 실적 알림 생성 실패:', error);
    return [];
  }
}

/**
 * 🎯 4. 소중한 고객 관리 알림 (기존 고객 유지)
 * - 이미 계약 완료한 고객들의 갱신/추가상품 타이밍
 * - 생일, 기념일 등 관계 유지 포인트
 */
export async function createExistingClientCareAlerts(agentId: string) {
  try {
    console.log('💝 기존 고객 관리 알림 생성 시작');

    const stages = await db
      .select()
      .from(pipelineStages)
      .where(eq(pipelineStages.agentId, agentId));

    const contractStage = stages.find(
      (s) =>
        s.name.includes('계약') ||
        s.name.includes('체결') ||
        s.name.includes('완료')
    );

    if (!contractStage) {
      return [];
    }

    // 3개월 이상 된 계약 완료 고객들
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const existingClients = await db
      .select({
        client: clients,
        details: clientDetails,
      })
      .from(clients)
      .leftJoin(clientDetails, eq(clients.id, clientDetails.clientId))
      .where(
        and(
          eq(clients.agentId, agentId),
          eq(clients.currentStageId, contractStage.id),
          lte(clients.updatedAt, threeMonthsAgo),
          eq(clients.isActive, true)
        )
      );

    const notifications = [];

    for (const { client, details } of existingClients) {
      const monthsSinceContract = Math.floor(
        (new Date().getTime() - new Date(client.updatedAt).getTime()) /
          (1000 * 60 * 60 * 24 * 30)
      );

      let title = '';
      let message = '';
      let priority: 'low' | 'normal' | 'high' | 'urgent' = 'low';

      if (monthsSinceContract >= 12) {
        title = `🔄 ${client.fullName}님 갱신 검토 시기`;
        message = `계약 후 ${monthsSinceContract}개월이 지났습니다. 갱신 및 추가 상품을 제안해보세요.`;
        priority = 'normal';
      } else if (monthsSinceContract >= 6) {
        title = `📞 ${client.fullName}님 안부 인사`;
        message = `계약 후 ${monthsSinceContract}개월째입니다. 안부 인사로 관계를 유지해보세요.`;
        priority = 'low';
      }

      // 생일 체크 (기존 고객)
      if (details?.birthDate) {
        const today = new Date();
        const birthDate = new Date(details.birthDate);
        const thisYearBirthday = new Date(
          today.getFullYear(),
          birthDate.getMonth(),
          birthDate.getDate()
        );

        const daysUntilBirthday = Math.ceil(
          (thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilBirthday <= 7 && daysUntilBirthday >= 0) {
          title = `🎂 ${client.fullName}님 생일 ${
            daysUntilBirthday === 0 ? '당일' : `${daysUntilBirthday}일 전`
          }`;
          message = `소중한 고객님의 생일입니다. 특별한 안부 인사로 관계를 더욱 돈독히 하세요.`;
          priority = 'normal';
        }
      }

      if (title) {
        notifications.push({
          userId: agentId,
          type: 'client_milestone' as const,
          channel: 'in_app' as const,
          priority,
          title,
          message,
          recipient: agentId,
          scheduledAt: new Date(),
          metadata: {
            clientId: client.id,
            clientName: client.fullName,
            monthsSinceContract,
            isExistingClient: true,
            careType: title.includes('생일')
              ? 'birthday'
              : title.includes('갱신')
              ? 'renewal'
              : 'relationship',
          },
        });
      }
    }

    for (const notification of notifications) {
      await createNotification(notification);
    }

    console.log(`✅ 기존 고객 관리 알림 ${notifications.length}개 생성`);
    return notifications;
  } catch (error) {
    console.error('❌ 기존 고객 관리 알림 생성 실패:', error);
    return [];
  }
}

/**
 * 🎯 메인 실행 함수 - 우선순위 기반 실행
 */
export async function runInsuranceSalesNotificationSystem(agentId: string) {
  console.log('🏆 보험설계사 전용 알림 시스템 시작');

  const results = {
    contractClosing: await createContractClosingAlerts(agentId),
    hotLeads: await createHotLeadAlerts(agentId),
    monthEndPressure: await createMonthEndPressureAlerts(agentId),
    existingClientCare: await createExistingClientCareAlerts(agentId),
  };

  const totalNotifications = Object.values(results).reduce(
    (sum, notifications) => sum + notifications.length,
    0
  );

  console.log(
    `✅ 보험설계사 알림 시스템 완료: 총 ${totalNotifications}개 알림 생성`,
    {
      계약임박: results.contractClosing.length,
      핫리드: results.hotLeads.length,
      월말실적: results.monthEndPressure.length,
      기존고객관리: results.existingClientCare.length,
    }
  );

  return totalNotifications;
}
