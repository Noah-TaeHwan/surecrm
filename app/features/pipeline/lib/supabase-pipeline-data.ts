import { db } from '~/lib/core/db';
import { eq, desc, asc, and, count } from 'drizzle-orm';
import {
  pipelineStages,
  clients,
  clientDetails,
  insuranceInfo,
  meetings,
  referrals,
} from '~/lib/schema';
import { profiles } from '~/lib/schema';

// Pipeline Stages 관련 함수들
export async function getPipelineStages(agentId: string) {
  try {
    const stages = await db
      .select()
      .from(pipelineStages)
      .where(eq(pipelineStages.agentId, agentId))
      .orderBy(asc(pipelineStages.order));

    return stages;
  } catch (error) {
    console.error('Error fetching pipeline stages:', error);
    throw new Error('파이프라인 단계를 가져오는데 실패했습니다.');
  }
}

export async function createPipelineStage(stageData: {
  agentId: string;
  teamId?: string;
  name: string;
  order: number;
  color: string;
  isDefault?: boolean;
}) {
  try {
    const newStage = await db
      .insert(pipelineStages)
      .values(stageData)
      .returning();

    return newStage[0];
  } catch (error) {
    console.error('Error creating pipeline stage:', error);
    throw new Error('파이프라인 단계 생성에 실패했습니다.');
  }
}

export async function updatePipelineStage(
  id: string,
  updates: {
    name?: string;
    order?: number;
    color?: string;
    isDefault?: boolean;
  }
) {
  try {
    const updatedStage = await db
      .update(pipelineStages)
      .set(updates)
      .where(eq(pipelineStages.id, id))
      .returning();

    return updatedStage[0];
  } catch (error) {
    console.error('Error updating pipeline stage:', error);
    throw new Error('파이프라인 단계 수정에 실패했습니다.');
  }
}

export async function deletePipelineStage(id: string) {
  try {
    await db.delete(pipelineStages).where(eq(pipelineStages.id, id));
  } catch (error) {
    console.error('Error deleting pipeline stage:', error);
    throw new Error('파이프라인 단계 삭제에 실패했습니다.');
  }
}

// Clients 관련 함수들
export async function getClientsByStage(agentId: string) {
  try {
    const clientsData = await db
      .select({
        client: clients,
        stage: pipelineStages,
        details: clientDetails,
      })
      .from(clients)
      .leftJoin(pipelineStages, eq(clients.currentStageId, pipelineStages.id))
      .leftJoin(clientDetails, eq(clients.id, clientDetails.clientId))
      .where(and(eq(clients.agentId, agentId), eq(clients.isActive, true)))
      .orderBy(desc(clients.createdAt));

    // 각 고객의 추가 정보 조회
    const enrichedClients = await Promise.all(
      clientsData.map(async (item) => {
        // 추천인 정보
        let referredBy = null;
        if (item.client.referredById) {
          const referrer = await db
            .select({ id: clients.id, fullName: clients.fullName })
            .from(clients)
            .where(eq(clients.id, item.client.referredById))
            .limit(1);
          if (referrer[0]) {
            referredBy = {
              id: referrer[0].id,
              name: referrer[0].fullName,
            };
          }
        }

        // 보험 정보
        const insurance = await db
          .select()
          .from(insuranceInfo)
          .where(eq(insuranceInfo.clientId, item.client.id));

        // 미팅 정보
        const clientMeetings = await db
          .select()
          .from(meetings)
          .where(eq(meetings.clientId, item.client.id))
          .orderBy(desc(meetings.scheduledAt))
          .limit(5);

        // 🎯 파이프라인 타입에 맞게 필드명 변환
        return {
          id: item.client.id,
          name: item.client.fullName,
          phone: item.client.phone,
          email: item.client.email,
          address: item.client.address,
          occupation: item.client.occupation,
          telecomProvider: item.client.telecomProvider,
          height: item.client.height,
          weight: item.client.weight,
          hasDrivingLicense: item.client.hasDrivingLicense,
          importance: item.client.importance,
          note: item.client.notes,
          tags: item.client.tags,
          stageId: item.client.currentStageId,
          referredBy,
          currentStage: item.stage,
          clientDetails: item.details,
          insuranceInfo: insurance,
          meetings: clientMeetings,
          // 추가 필드들
          lastContactDate: item.client.updatedAt?.toISOString().split('T')[0],
        };
      })
    );

    return enrichedClients;
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw new Error('고객 정보를 가져오는데 실패했습니다.');
  }
}

export async function getClientById(id: string) {
  try {
    const clientData = await db
      .select({
        client: clients,
        stage: pipelineStages,
        details: clientDetails,
      })
      .from(clients)
      .leftJoin(pipelineStages, eq(clients.currentStageId, pipelineStages.id))
      .leftJoin(clientDetails, eq(clients.id, clientDetails.clientId))
      .where(eq(clients.id, id))
      .limit(1);

    if (!clientData[0]) {
      throw new Error('고객을 찾을 수 없습니다.');
    }

    const item = clientData[0];

    // 추천인 정보
    let referredBy = null;
    if (item.client.referredById) {
      const referrer = await db
        .select({ id: clients.id, fullName: clients.fullName })
        .from(clients)
        .where(eq(clients.id, item.client.referredById))
        .limit(1);
      referredBy = referrer[0] || null;
    }

    // 보험 정보
    const insurance = await db
      .select()
      .from(insuranceInfo)
      .where(eq(insuranceInfo.clientId, item.client.id));

    // 미팅 정보
    const clientMeetings = await db
      .select()
      .from(meetings)
      .where(eq(meetings.clientId, item.client.id))
      .orderBy(desc(meetings.scheduledAt));

    // 추천 정보
    const clientReferrals = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, item.client.id));

    return {
      ...item.client,
      currentStage: item.stage,
      clientDetails: item.details,
      referredBy,
      insuranceInfo: insurance,
      meetings: clientMeetings,
      referrals: clientReferrals,
    };
  } catch (error) {
    console.error('Error fetching client:', error);
    throw new Error('고객 정보를 가져오는데 실패했습니다.');
  }
}

export async function createClient(clientData: {
  agentId: string;
  teamId?: string;
  fullName: string;
  email?: string;
  phone: string;
  telecomProvider?: string;
  address?: string;
  occupation?: string;
  hasDrivingLicense?: boolean;
  height?: number;
  weight?: number;
  tags?: string[];
  importance?: 'high' | 'medium' | 'low';
  currentStageId: string;
  referredById?: string;
  notes?: string;
  customFields?: any;
}) {
  try {
    const newClient = await db.insert(clients).values(clientData).returning();

    // 생성된 고객의 상세 정보 조회
    return await getClientById(newClient[0].id);
  } catch (error) {
    console.error('Error creating client:', error);
    throw new Error('고객 생성에 실패했습니다.');
  }
}

export async function updateClient(
  id: string,
  updates: Partial<{
    fullName: string;
    email: string;
    phone: string;
    telecomProvider: string;
    address: string;
    occupation: string;
    hasDrivingLicense: boolean;
    height: number;
    weight: number;
    tags: string[];
    importance: 'high' | 'medium' | 'low';
    currentStageId: string;
    referredById: string;
    notes: string;
    customFields: any;
  }>
) {
  try {
    const updatedClient = await db
      .update(clients)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, id))
      .returning();

    return await getClientById(updatedClient[0].id);
  } catch (error) {
    console.error('Error updating client:', error);
    throw new Error('고객 정보 수정에 실패했습니다.');
  }
}

export async function moveClientToStage(clientId: string, stageId: string) {
  try {
    const updatedClient = await db
      .update(clients)
      .set({
        currentStageId: stageId,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, clientId))
      .returning();

    return await getClientById(updatedClient[0].id);
  } catch (error) {
    console.error('Error moving client to stage:', error);
    throw new Error('고객 단계 이동에 실패했습니다.');
  }
}

export async function deleteClient(id: string) {
  try {
    await db.update(clients).set({ isActive: false }).where(eq(clients.id, id));
  } catch (error) {
    console.error('Error deleting client:', error);
    throw new Error('고객 삭제에 실패했습니다.');
  }
}

// Pipeline 통계 관련 함수들
export async function getPipelineStats(agentId: string) {
  try {
    // 각 단계별 고객 수 조회
    const stageStats = await db
      .select({
        stageId: clients.currentStageId,
        stageName: pipelineStages.name,
        stageColor: pipelineStages.color,
        count: count(clients.id),
      })
      .from(clients)
      .leftJoin(pipelineStages, eq(clients.currentStageId, pipelineStages.id))
      .where(and(eq(clients.agentId, agentId), eq(clients.isActive, true)))
      .groupBy(
        clients.currentStageId,
        pipelineStages.name,
        pipelineStages.color
      );

    return stageStats;
  } catch (error) {
    console.error('Error fetching pipeline stats:', error);
    throw new Error('파이프라인 통계를 가져오는데 실패했습니다.');
  }
}

// 기본 파이프라인 단계 생성 함수
export async function createDefaultPipelineStages(agentId: string) {
  const defaultStages = [
    { name: '첫 상담', order: 0, color: '#8884d8' },
    { name: '니즈 분석', order: 1, color: '#82ca9d' },
    { name: '상품 설명', order: 2, color: '#ffc658' },
    { name: '계약 검토', order: 3, color: '#ff8042' },
    { name: '계약 완료', order: 4, color: '#0088fe' },
  ];

  try {
    const createdStages = [];

    for (const stage of defaultStages) {
      const newStage = await db
        .insert(pipelineStages)
        .values({
          agentId,
          name: stage.name,
          order: stage.order,
          color: stage.color,
          isDefault: true,
        })
        .returning();

      createdStages.push(newStage[0]);
    }

    return createdStages;
  } catch (error) {
    console.error('Error creating default stages:', error);
    throw new Error('기본 파이프라인 단계 생성에 실패했습니다.');
  }
}
