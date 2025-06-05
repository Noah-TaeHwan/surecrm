import { db } from '~/lib/core/db';
import { eq, desc, asc, and, count } from 'drizzle-orm';
import {
  pipelineStages,
  clients,
  clientDetails,
  insuranceInfo,
  meetings,
  referrals,
} from '~/lib/schema/core';
import { profiles } from '~/lib/schema/core';
import { appClientConsultationNotes } from '~/features/clients/lib/schema';

// Pipeline Stages 관련 함수들
export async function getPipelineStages(agentId: string) {
  try {
    const stages = await db
      .select()
      .from(pipelineStages)
      .where(eq(pipelineStages.agentId, agentId))
      .orderBy(pipelineStages.order);

    // 🎯 "제외됨" 단계는 파이프라인 보드에서 숨김
    return stages.filter((stage) => stage.name !== '제외됨');
  } catch (error) {
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
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(pipelineStages.id, id))
      .returning();

    return updatedStage[0];
  } catch (error) {
    throw new Error('파이프라인 단계 수정에 실패했습니다.');
  }
}

export async function deletePipelineStage(id: string) {
  try {
    await db.delete(pipelineStages).where(eq(pipelineStages.id, id));
  } catch (error) {
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
        try {
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

          // 마지막 상담 날짜 조회
          let lastConsultationDate = null;
          try {
            const lastConsultation = await db
              .select({
                consultationDate: appClientConsultationNotes.consultationDate,
              })
              .from(appClientConsultationNotes)
              .where(eq(appClientConsultationNotes.clientId, item.client.id))
              .orderBy(desc(appClientConsultationNotes.consultationDate))
              .limit(1);

            if (lastConsultation[0]) {
              lastConsultationDate = lastConsultation[0].consultationDate;
            }
          } catch (error) {
            // 상담 기록이 없는 경우 null 유지
            lastConsultationDate = null;
          }

          // 🎯 파이프라인 타입에 정확히 맞게 필드명 변환
          return {
            id: item.client.id,
            name: item.client.fullName,
            phone: item.client.phone,
            email: item.client.email || undefined,
            address: item.client.address || undefined,
            occupation: item.client.occupation || undefined,
            telecomProvider: item.client.telecomProvider || undefined,
            height: item.client.height || undefined,
            weight: item.client.weight || undefined,
            hasDrivingLicense: item.client.hasDrivingLicense || undefined,
            importance: item.client.importance,
            note: item.client.notes || undefined,
            tags: item.client.tags || [],
            stageId: item.client.currentStageId,
            referredBy,
            currentStage: item.stage,
            clientDetails: item.details,
            insuranceInfo: insurance,
            meetings: clientMeetings,
            // 추가 필드들
            lastContactDate: lastConsultationDate,
            createdAt: item.client.createdAt?.toISOString(),
          };
        } catch (error) {
          // ✅ 에러가 발생해도 기본 정보는 반환
          return {
            id: item.client.id,
            name: item.client.fullName,
            phone: item.client.phone,
            email: item.client.email || undefined,
            importance: item.client.importance,
            note: item.client.notes || undefined,
            tags: item.client.tags || [],
            stageId: item.client.currentStageId,
            referredBy: null,
            lastContactDate: null, // 에러 시에는 null로 설정
            createdAt: item.client.createdAt?.toISOString(),
          };
        }
      })
    );

    return enrichedClients;
  } catch (error) {
    throw new Error(
      `고객 정보를 가져오는데 실패했습니다: ${
        error instanceof Error ? error.message : '알 수 없는 오류'
      }`
    );
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
    throw new Error('고객 단계 이동에 실패했습니다.');
  }
}

export async function deleteClient(id: string) {
  try {
    await db.update(clients).set({ isActive: false }).where(eq(clients.id, id));
  } catch (error) {
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
