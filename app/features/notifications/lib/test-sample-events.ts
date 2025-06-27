import { db } from '~/lib/core/db.server';
import { eq } from 'drizzle-orm';
import { clients, pipelineStages } from '~/lib/schema/core';
import { clientDetails } from '~/features/clients/lib/schema';
import { triggerBirthdayNotifications } from './event-triggered-notifications';

// 🧪 이벤트 기반 알림 시스템 테스트용 샘플 데이터

/**
 * 생일 알림 테스트용 - 오늘/3일 후 생일인 고객 생성
 */
export async function createBirthdayTestClients(agentId: string) {
  console.log('🧪 생일 알림 테스트 데이터 생성');

  try {
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);

    // 오늘 생일 고객
    const todayBirthdayClient = await db
      .insert(clients)
      .values({
        agentId,
        fullName: '김생일',
        email: 'birthday-today@test.com',
        phone: '010-1234-5678',
        importance: 'normal',
        isActive: true,
      })
      .returning();

    await db.insert(clientDetails).values({
      clientId: todayBirthdayClient[0].id,
      birthDate: `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
    });

    // 3일 후 생일 고객
    const threeDaysBirthdayClient = await db
      .insert(clients)
      .values({
        agentId,
        fullName: '이미리',
        email: 'birthday-3days@test.com',
        phone: '010-9876-5432',
        importance: 'high',
        isActive: true,
      })
      .returning();

    await db.insert(clientDetails).values({
      clientId: threeDaysBirthdayClient[0].id,
      birthDate: `${threeDaysLater.getFullYear()}-${String(
        threeDaysLater.getMonth() + 1
      ).padStart(2, '0')}-${String(threeDaysLater.getDate()).padStart(2, '0')}`,
    });

    console.log('✅ 생일 테스트 고객 생성 완료');
    return [todayBirthdayClient[0], threeDaysBirthdayClient[0]];
  } catch (error) {
    console.error('❌ 생일 테스트 데이터 생성 실패:', error);
    return [];
  }
}

/**
 * 파이프라인 지연 알림 테스트용 - 오래된 고객 생성
 */
export async function createPipelineStagnationTestClients(agentId: string) {
  console.log('🧪 파이프라인 지연 테스트 데이터 생성');

  try {
    // 에이전트의 첫 번째 파이프라인 단계 가져오기
    const stages = await db
      .select()
      .from(pipelineStages)
      .where(eq(pipelineStages.agentId, agentId))
      .limit(1);

    if (stages.length === 0) {
      console.log('파이프라인 단계가 없어서 테스트 데이터 생성 불가');
      return [];
    }

    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    // 10일 전에 등록되고 업데이트 안된 고객
    const stagnantClient = await db
      .insert(clients)
      .values({
        agentId,
        fullName: '정체중',
        email: 'stagnant@test.com',
        phone: '010-1111-2222',
        importance: 'high',
        currentStageId: stages[0].id,
        isActive: true,
        createdAt: tenDaysAgo,
        updatedAt: tenDaysAgo,
      })
      .returning();

    console.log('✅ 파이프라인 지연 테스트 고객 생성 완료');
    return [stagnantClient[0]];
  } catch (error) {
    console.error('❌ 파이프라인 지연 테스트 데이터 생성 실패:', error);
    return [];
  }
}

/**
 * 종합 테스트 실행
 */
export async function runNotificationTestSuite(agentId: string) {
  console.log('🚀 알림 시스템 종합 테스트 시작');

  try {
    // 1. 테스트 데이터 생성
    const birthdayClients = await createBirthdayTestClients(agentId);
    const stagnantClients = await createPipelineStagnationTestClients(agentId);

    console.log(`📊 테스트 데이터 생성 완료:
      - 생일 고객: ${birthdayClients.length}명
      - 지연 고객: ${stagnantClients.length}명`);

    // 2. 알림 트리거 실행
    await triggerBirthdayNotifications();

    console.log('✅ 알림 시스템 테스트 완료');

    return {
      birthdayClients: birthdayClients.length,
      stagnantClients: stagnantClients.length,
      testStatus: 'completed',
    };
  } catch (error) {
    console.error('❌ 알림 시스템 테스트 실패:', error);
    return {
      birthdayClients: 0,
      stagnantClients: 0,
      testStatus: 'failed',
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}
