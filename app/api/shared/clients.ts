// 🏥 SureCRM - 고객 관리 API (실제 데이터베이스 연동)
import { db } from '~/lib/core/db';
import {
  clients,
  clientDetails,
  insuranceInfo,
  pipelineStages,
  profiles,
  type Client,
  type NewClient,
} from '~/lib/schema';
import {
  appClientTags,
  appClientTagAssignments,
  appClientContactHistory,
  appClientFamilyMembers,
  appClientPreferences,
  appClientAnalytics,
  appClientMilestones,
  appClientStageHistory,
  type AppClientTag,
  type AppClientContactHistory,
  type AppClientFamilyMember,
  type AppClientPreferences,
  type AppClientAnalytics,
  type AppClientMilestone,
} from '~/features/clients/lib/schema';
import { eq, and, or, desc, count, sum, avg, sql } from 'drizzle-orm';

// 🎯 고객 프로필 확장 인터페이스
interface ClientProfile extends Client {
  // 계산 필드들 (런타임에서 계산됨)
  referralCount: number;
  insuranceTypes: string[];
  totalPremium: number;
  currentStage: {
    id: string;
    name: string;
    color: string;
  };
  engagementScore: number;
  conversionProbability: number;
  lifetimeValue: number;
  lastContactDate?: string;
  nextActionDate?: string;
  upcomingMeeting?: {
    date: string;
    type: string;
  };
  referredBy?: {
    id: string;
    name: string;
    relationship: string;
  };
}

// 🎯 고객 상세 프로필 (상세 페이지용)
interface ClientDetailProfile extends Client {
  referralCount: number;
  insuranceTypes: string[];
  totalPremium: number;
  currentStage: {
    id: string;
    name: string;
    color: string;
  };
  engagementScore: number;
  conversionProbability: number;
  lifetimeValue: number;
  lastContactDate?: string;
  nextActionDate?: string;
  upcomingMeeting?: {
    date: string;
    type: string;
  };
  referredBy?: {
    id: string;
    name: string;
    relationship: string;
  };
  // 상세 데이터
  recentContacts: AppClientContactHistory[];
  analytics: AppClientAnalytics | null;
  familyMembers: AppClientFamilyMember[];
  milestones: AppClientMilestone[];
}

// 🎯 API 응답 타입들
interface ClientsAPIResponse {
  success: boolean;
  data?: {
    totalClients: number;
    activeClients: number;
    inactiveClients: number;
    recentGrowth: number;
    conversionRate: number;
  };
  message?: string;
  error?: string;
}

// 🎯 고객 목록 조회 (Phase 3에서 실제 구현)
export async function getClients(params: {
  agentId: string;
  page?: number;
  limit?: number;
  search?: string;
  stageId?: string;
  importance?: string;
}): Promise<{
  success: boolean;
  data: ClientProfile[];
  total: number;
  page: number;
  totalPages: number;
}> {
  try {
    console.log('🔍 API: getClients 호출됨', params);

    const {
      agentId,
      page = 1,
      limit = 20,
      search,
      stageId,
      importance,
    } = params;
    const offset = (page - 1) * limit;

    // WHERE 조건 생성
    const whereConditions = [
      eq(clients.agentId, agentId),
      eq(clients.isActive, true),
    ];

    if (search) {
      whereConditions.push(
        or(
          sql`${clients.fullName} ILIKE ${'%' + search + '%'}`,
          sql`${clients.email} ILIKE ${'%' + search + '%'}`,
          sql`${clients.phone} ILIKE ${'%' + search + '%'}`
        )!
      );
    }

    if (stageId) {
      whereConditions.push(eq(clients.currentStageId, stageId));
    }

    if (importance) {
      whereConditions.push(eq(clients.importance, importance as any));
    }

    // 메인 쿼리 (JOIN으로 관련 데이터 포함)
    const clientsData = await db
      .select({
        // 기본 클라이언트 데이터
        id: clients.id,
        agentId: clients.agentId,
        teamId: clients.teamId,
        fullName: clients.fullName,
        email: clients.email,
        phone: clients.phone,
        telecomProvider: clients.telecomProvider,
        address: clients.address,
        occupation: clients.occupation,
        hasDrivingLicense: clients.hasDrivingLicense,
        height: clients.height,
        weight: clients.weight,
        tags: clients.tags,
        importance: clients.importance,
        currentStageId: clients.currentStageId,
        referredById: clients.referredById,
        notes: clients.notes,
        customFields: clients.customFields,
        isActive: clients.isActive,
        createdAt: clients.createdAt,
        updatedAt: clients.updatedAt,
        // 현재 단계 정보
        stageName: pipelineStages.name,
        stageColor: pipelineStages.color,
        // 소개자 정보
        referrerName: sql<string>`ref_client.full_name`,
      })
      .from(clients)
      .leftJoin(pipelineStages, eq(clients.currentStageId, pipelineStages.id))
      .leftJoin(
        sql`${clients} AS ref_client`,
        eq(clients.referredById, sql`ref_client.id`)
      )
      .where(and(...whereConditions))
      .orderBy(desc(clients.createdAt))
      .limit(limit)
      .offset(offset);

    // 총 개수 조회
    const [totalResult] = await db
      .select({ count: count() })
      .from(clients)
      .where(and(...whereConditions));

    // 각 고객에 대한 추가 계산 데이터 조회
    const enrichedClients: ClientProfile[] = await Promise.all(
      clientsData.map(async (client) => {
        // 소개 횟수 계산
        const [referralCountResult] = await db
          .select({ count: count() })
          .from(clients)
          .where(eq(clients.referredById, client.id));

        // 보험 정보 조회
        const insurances = await db
          .select()
          .from(insuranceInfo)
          .where(
            and(
              eq(insuranceInfo.clientId, client.id),
              eq(insuranceInfo.isActive, true)
            )
          );

        // 최근 연락 이력 조회
        const [latestContact] = await db
          .select()
          .from(appClientContactHistory)
          .where(eq(appClientContactHistory.clientId, client.id))
          .orderBy(desc(appClientContactHistory.createdAt))
          .limit(1);

        // 분석 데이터 조회
        const [analytics] = await db
          .select()
          .from(appClientAnalytics)
          .where(eq(appClientAnalytics.clientId, client.id))
          .limit(1);

        return {
          ...client,
          referralCount: referralCountResult.count,
          insuranceTypes: insurances.map((ins) => ins.insuranceType),
          totalPremium: insurances.reduce(
            (sum, ins) => sum + parseFloat(ins.premium || '0'),
            0
          ),
          currentStage: {
            id: client.currentStageId,
            name: client.stageName || '미설정',
            color: client.stageColor || '#666666',
          },
          engagementScore: analytics?.engagementScore
            ? parseFloat(analytics.engagementScore.toString())
            : 0,
          conversionProbability: analytics?.conversionProbability
            ? parseFloat(analytics.conversionProbability.toString())
            : 0,
          lifetimeValue: analytics?.lifetimeValue
            ? parseFloat(analytics.lifetimeValue.toString())
            : 0,
          lastContactDate: latestContact?.createdAt.toISOString(),
          nextActionDate: analytics?.updatedAt?.toISOString(),
          upcomingMeeting: undefined, // TODO: 미팅 스케줄링 시스템 연동 시 구현
          referredBy: client.referrerName
            ? {
                id: client.referredById!,
                name: client.referrerName,
                relationship: '고객 소개',
              }
            : undefined,
        };
      })
    );

    console.log(`✅ API: ${enrichedClients.length}명의 고객 조회 완료`);

    return {
      success: true,
      data: enrichedClients,
      total: totalResult.count,
      page,
      totalPages: Math.ceil(totalResult.count / limit),
    };
  } catch (error) {
    console.error('❌ API: getClients 오류:', error);
    return {
      success: false,
      data: [],
      total: 0,
      page: 1,
      totalPages: 0,
    };
  }
}

// 🎯 고객 상세 정보 조회 (Phase 3에서 실제 구현)
export async function getClientById(
  clientId: string,
  agentId: string
): Promise<ClientDetailProfile | null> {
  try {
    console.log('🔍 API: getClientById 호출됨', { clientId, agentId });

    // 기본 고객 정보 조회 (stages, referrer 정보 포함)
    const [baseClient] = await db
      .select({
        // 기본 클라이언트 데이터
        id: clients.id,
        agentId: clients.agentId,
        teamId: clients.teamId,
        fullName: clients.fullName,
        email: clients.email,
        phone: clients.phone,
        telecomProvider: clients.telecomProvider,
        address: clients.address,
        occupation: clients.occupation,
        hasDrivingLicense: clients.hasDrivingLicense,
        height: clients.height,
        weight: clients.weight,
        tags: clients.tags,
        importance: clients.importance,
        currentStageId: clients.currentStageId,
        referredById: clients.referredById,
        notes: clients.notes,
        customFields: clients.customFields,
        isActive: clients.isActive,
        createdAt: clients.createdAt,
        updatedAt: clients.updatedAt,
        // 현재 단계 정보
        stageName: pipelineStages.name,
        stageColor: pipelineStages.color,
        // 소개자 정보
        referrerName: sql<string>`ref_client.full_name`,
      })
      .from(clients)
      .leftJoin(pipelineStages, eq(clients.currentStageId, pipelineStages.id))
      .leftJoin(
        sql`${clients} AS ref_client`,
        eq(clients.referredById, sql`ref_client.id`)
      )
      .where(
        and(
          eq(clients.id, clientId),
          eq(clients.agentId, agentId),
          eq(clients.isActive, true)
        )
      );

    if (!baseClient) {
      console.log('❌ API: 고객을 찾을 수 없음', clientId);
      return null;
    }

    // 소개 횟수 계산
    const [referralCountResult] = await db
      .select({ count: count() })
      .from(clients)
      .where(eq(clients.referredById, clientId));

    // 보험 정보 조회
    const insurances = await db
      .select()
      .from(insuranceInfo)
      .where(eq(insuranceInfo.clientId, clientId));

    // 최근 연락 이력 조회 (최대 10개)
    const recentContacts = await db
      .select()
      .from(appClientContactHistory)
      .where(eq(appClientContactHistory.clientId, clientId))
      .orderBy(desc(appClientContactHistory.createdAt))
      .limit(10);

    // 가족 구성원 조회
    const familyMembers = await db
      .select()
      .from(appClientFamilyMembers)
      .where(eq(appClientFamilyMembers.clientId, clientId))
      .orderBy(desc(appClientFamilyMembers.createdAt));

    // 마일스톤 조회
    const milestones = await db
      .select()
      .from(appClientMilestones)
      .where(eq(appClientMilestones.clientId, clientId))
      .orderBy(desc(appClientMilestones.achievedAt));

    // 분석 데이터 조회 (최신 1개)
    const [analytics] = await db
      .select()
      .from(appClientAnalytics)
      .where(eq(appClientAnalytics.clientId, clientId))
      .orderBy(desc(appClientAnalytics.updatedAt))
      .limit(1);

    // 계산된 데이터
    const totalPremium = insurances.reduce(
      (sum, ins) => sum + (ins.premium ? parseInt(ins.premium) : 0),
      0
    );
    const insuranceTypes = insurances.map(
      (ins) => ins.insuranceType || '알 수 없음'
    );

    // 참여도 점수 계산 (연락 빈도 기반)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentContactsCount = recentContacts.filter(
      (contact) =>
        contact.createdAt && new Date(contact.createdAt) > thirtyDaysAgo
    ).length;

    const engagementScore = Math.min(10, recentContactsCount * 2); // 최대 10점

    // 마지막 연락일 계산
    const lastContact = recentContacts[0];
    const lastContactDate = lastContact?.createdAt?.toISOString().split('T')[0];

    // 다음 액션 계산 (마지막 연락으로부터 7일 후)
    let nextActionDate;
    if (lastContact?.createdAt) {
      const nextAction = new Date(lastContact.createdAt);
      nextAction.setDate(nextAction.getDate() + 7);
      nextActionDate = nextAction.toISOString().split('T')[0];
    }

    // 전환 확률 계산 (단계별 기본값 + 참여도 보정)
    const stageBaseProbability = {
      stage1: 20, // 첫 상담
      stage2: 40, // 니즈 분석
      stage3: 60, // 상품 설명
      stage4: 80, // 제안서 발송
      stage5: 95, // 계약 체결
    };

    const baseProbability =
      stageBaseProbability[
        baseClient.currentStageId as keyof typeof stageBaseProbability
      ] || 50;
    const conversionProbability = Math.min(
      95,
      baseProbability + engagementScore * 2
    );

    // 생애가치 계산 (월 보험료 * 24개월)
    const lifetimeValue = totalPremium * 24;

    const enrichedClient: ClientDetailProfile = {
      // 기본 데이터
      id: baseClient.id,
      agentId: baseClient.agentId,
      teamId: baseClient.teamId,
      fullName: baseClient.fullName,
      email: baseClient.email,
      phone: baseClient.phone,
      telecomProvider: baseClient.telecomProvider,
      address: baseClient.address,
      occupation: baseClient.occupation,
      hasDrivingLicense: baseClient.hasDrivingLicense,
      height: baseClient.height,
      weight: baseClient.weight,
      tags: baseClient.tags,
      importance: baseClient.importance,
      currentStageId: baseClient.currentStageId,
      referredById: baseClient.referredById,
      notes: baseClient.notes,
      customFields: baseClient.customFields,
      isActive: baseClient.isActive,
      createdAt: baseClient.createdAt,
      updatedAt: baseClient.updatedAt,

      // 계산된 필드들
      referralCount: referralCountResult.count,
      insuranceTypes,
      totalPremium,
      currentStage: {
        id: baseClient.currentStageId,
        name: baseClient.stageName || '알 수 없음',
        color: baseClient.stageColor || '#6b7280',
      },
      engagementScore,
      conversionProbability,
      lifetimeValue,
      lastContactDate,
      nextActionDate,
      upcomingMeeting: undefined, // TODO: 캘린더 연동 시 구현
      referredBy: baseClient.referrerName
        ? {
            id: baseClient.referredById || '',
            name: baseClient.referrerName,
            relationship: '알 수 없음', // TODO: 관계 정보 추가 시 구현
          }
        : undefined,

      // 상세 데이터
      recentContacts,
      analytics,
      familyMembers,
      milestones,
    };

    console.log('✅ API: 고객 상세 정보 조회 완료', baseClient.fullName);
    return enrichedClient;
  } catch (error) {
    console.error('❌ API: getClientById 오류:', error);
    return null;
  }
}

// 🎯 새 고객 생성 (Phase 3에서 실제 구현)
export async function createClient(
  clientData: Partial<NewClient> & { fullName: string; phone: string },
  agentId: string
): Promise<{
  success: boolean;
  data: Client | null;
  message?: string;
}> {
  try {
    console.log('➕ API: createClient 호출됨', { clientData, agentId });

    // 기본값 설정
    const newClientData: NewClient = {
      agentId,
      fullName: clientData.fullName,
      phone: clientData.phone,
      email: clientData.email || null,
      telecomProvider: clientData.telecomProvider || null,
      address: clientData.address || null,
      occupation: clientData.occupation || null,
      hasDrivingLicense: clientData.hasDrivingLicense || null,
      height: clientData.height || null,
      weight: clientData.weight || null,
      tags: clientData.tags || [],
      importance: clientData.importance || 'medium',
      currentStageId: clientData.currentStageId!,
      referredById: clientData.referredById || null,
      notes: clientData.notes || null,
      customFields: clientData.customFields || {},
      isActive: true,
    };

    const [createdClient] = await db
      .insert(clients)
      .values(newClientData)
      .returning();

    console.log('✅ API: 새 고객 생성 완료', createdClient.fullName);

    return {
      success: true,
      data: createdClient,
      message: `${createdClient.fullName} 고객이 성공적으로 등록되었습니다.`,
    };
  } catch (error) {
    console.error('❌ API: createClient 오류:', error);
    return {
      success: false,
      data: null,
      message: '고객 등록 중 오류가 발생했습니다.',
    };
  }
}

// 🎯 고객 정보 수정 (Phase 3에서 실제 구현)
export async function updateClient(
  clientId: string,
  clientData: Partial<NewClient>,
  agentId: string
): Promise<{
  success: boolean;
  data: Client | null;
  message?: string;
}> {
  try {
    console.log('✏️ API: updateClient 호출됨', {
      clientId,
      clientData,
      agentId,
    });

    // 권한 체크
    const [existingClient] = await db
      .select()
      .from(clients)
      .where(
        and(
          eq(clients.id, clientId),
          eq(clients.agentId, agentId),
          eq(clients.isActive, true)
        )
      );

    if (!existingClient) {
      return {
        success: false,
        data: null,
        message: '고객을 찾을 수 없거나 수정 권한이 없습니다.',
      };
    }

    // 업데이트 데이터에 updatedAt 추가
    const updateData = {
      ...clientData,
      updatedAt: new Date(),
    };

    const [updatedClient] = await db
      .update(clients)
      .set(updateData)
      .where(eq(clients.id, clientId))
      .returning();

    console.log('✅ API: 고객 정보 수정 완료', updatedClient.fullName);

    return {
      success: true,
      data: updatedClient,
      message: `${updatedClient.fullName} 고객 정보가 성공적으로 수정되었습니다.`,
    };
  } catch (error) {
    console.error('❌ API: updateClient 오류:', error);
    return {
      success: false,
      data: null,
      message: '고객 정보 수정 중 오류가 발생했습니다.',
    };
  }
}

// 🎯 고객 삭제 (Phase 3에서 실제 구현)
export async function deleteClient(
  clientId: string,
  agentId: string
): Promise<{
  success: boolean;
  data: any;
  warnings?: string[];
  message?: string;
}> {
  try {
    console.log('🗑️ API: deleteClient 호출됨', { clientId, agentId });

    // 권한 체크 및 관련 데이터 확인
    const [existingClient] = await db
      .select()
      .from(clients)
      .where(
        and(
          eq(clients.id, clientId),
          eq(clients.agentId, agentId),
          eq(clients.isActive, true)
        )
      );

    if (!existingClient) {
      return {
        success: false,
        data: null,
        message: '고객을 찾을 수 없거나 삭제 권한이 없습니다.',
      };
    }

    // 관련 데이터 체크 (경고 메시지용)
    const warnings: string[] = [];

    // 보험 정보 체크
    const [insuranceCount] = await db
      .select({ count: count() })
      .from(insuranceInfo)
      .where(eq(insuranceInfo.clientId, clientId));

    if (insuranceCount.count > 0) {
      warnings.push(`${insuranceCount.count}개의 보험 정보가 함께 삭제됩니다.`);
    }

    // 연락 이력 체크
    const [contactCount] = await db
      .select({ count: count() })
      .from(appClientContactHistory)
      .where(eq(appClientContactHistory.clientId, clientId));

    if (contactCount.count > 0) {
      warnings.push(`${contactCount.count}개의 연락 이력이 함께 삭제됩니다.`);
    }

    // 소프트 삭제 실행
    const [deletedClient] = await db
      .update(clients)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, clientId))
      .returning();

    console.log('✅ API: 고객 삭제 완료', deletedClient.fullName);

    return {
      success: true,
      data: deletedClient,
      warnings,
      message: `${deletedClient.fullName} 고객이 성공적으로 삭제되었습니다.`,
    };
  } catch (error) {
    console.error('❌ API: deleteClient 오류:', error);
    return {
      success: false,
      data: null,
      message: '고객 삭제 중 오류가 발생했습니다.',
    };
  }
}

// 🎯 고객 통계 조회 (Phase 3에서 실제 구현)
export async function getClientStats(
  agentId: string
): Promise<ClientsAPIResponse> {
  try {
    console.log('API: getClientStats called with:', { agentId });

    // TODO: Phase 3에서 실제 구현
    // 1. 기본 통계 (총 고객 수, 활성 고객 수 등)
    // 2. 네트워크 통계 (소개 관계, 네트워크 가치 등)
    // 3. 영업 성과 통계 (계약 수, 보험료 등)
    // 4. 활동 통계 (미팅, 연락 빈도 등)

    return {
      success: true,
      data: {
        totalClients: 0,
        activeClients: 0,
        inactiveClients: 0,
        recentGrowth: 0,
        conversionRate: 0,
      },
    };
  } catch (error) {
    console.error('고객 통계 조회 실패:', error);
    return {
      success: false,
      error: '통계 정보를 불러오는데 실패했습니다.',
    };
  }
}

// 🎯 고객 일괄 가져오기 (Excel/CSV)
export async function importClients(
  fileData: any[],
  agentId: string
): Promise<{
  success: boolean;
  data: {
    imported: number;
    failed: number;
    errors: string[];
  };
}> {
  try {
    console.log('📁 API: importClients 호출됨', {
      count: fileData.length,
      agentId,
    });

    const results = {
      imported: 0,
      failed: 0,
      errors: [] as string[],
    };

    // 기본 단계 ID 조회 (첫 번째 단계를 기본으로 사용)
    const [defaultStage] = await db
      .select()
      .from(pipelineStages)
      .where(eq(pipelineStages.isDefault, true))
      .limit(1);

    if (!defaultStage) {
      return {
        success: false,
        data: {
          imported: 0,
          failed: fileData.length,
          errors: ['기본 파이프라인 단계가 설정되지 않았습니다.'],
        },
      };
    }

    // 각 행을 처리
    for (let i = 0; i < fileData.length; i++) {
      const row = fileData[i];

      try {
        // 필수 필드 검증
        if (!row.fullName || !row.phone) {
          results.failed++;
          results.errors.push(`행 ${i + 1}: 이름과 전화번호는 필수입니다.`);
          continue;
        }

        // 중복 전화번호 체크
        const [existingClient] = await db
          .select()
          .from(clients)
          .where(
            and(
              eq(clients.phone, row.phone),
              eq(clients.agentId, agentId),
              eq(clients.isActive, true)
            )
          );

        if (existingClient) {
          results.failed++;
          results.errors.push(
            `행 ${i + 1}: 전화번호 ${row.phone}는 이미 등록된 고객입니다.`
          );
          continue;
        }

        // 새 고객 생성
        const newClientData: NewClient = {
          agentId,
          fullName: row.fullName,
          phone: row.phone,
          email: row.email || null,
          address: row.address || null,
          occupation: row.occupation || null,
          importance: row.importance || 'medium',
          currentStageId: defaultStage.id,
          notes: row.notes || null,
          isActive: true,
        };

        await db.insert(clients).values(newClientData);
        results.imported++;
      } catch (error) {
        results.failed++;
        results.errors.push(
          `행 ${i + 1}: ${
            error instanceof Error ? error.message : '알 수 없는 오류'
          }`
        );
      }
    }

    console.log('✅ API: 고객 일괄 가져오기 완료', results);

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    console.error('❌ API: importClients 오류:', error);
    return {
      success: false,
      data: {
        imported: 0,
        failed: fileData.length,
        errors: ['파일 처리 중 오류가 발생했습니다.'],
      },
    };
  }
}

// 🎯 고객 파이프라인 단계 이동
export async function updateClientStage(
  clientId: string,
  targetStageId: string,
  agentId: string
): Promise<{
  success: boolean;
  data: Client | null;
  message?: string;
}> {
  try {
    // 권한 체크 및 현재 클라이언트 정보 조회
    const [existingClient] = await db
      .select()
      .from(clients)
      .where(
        and(
          eq(clients.id, clientId),
          eq(clients.agentId, agentId),
          eq(clients.isActive, true)
        )
      );

    if (!existingClient) {
      return {
        success: false,
        data: null,
        message: '고객을 찾을 수 없거나 수정 권한이 없습니다.',
      };
    }

    // 대상 단계가 존재하는지 확인
    const [targetStage] = await db
      .select()
      .from(pipelineStages)
      .where(
        and(
          eq(pipelineStages.id, targetStageId),
          eq(pipelineStages.agentId, agentId)
        )
      );

    if (!targetStage) {
      return {
        success: false,
        data: null,
        message: '대상 단계를 찾을 수 없습니다.',
      };
    }

    // 단계 업데이트
    const [updatedClient] = await db
      .update(clients)
      .set({
        currentStageId: targetStageId,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, clientId))
      .returning();

    return {
      success: true,
      data: updatedClient,
      message: `${updatedClient.fullName} 고객이 "${targetStage.name}" 단계로 이동되었습니다.`,
    };
  } catch (error) {
    console.error('❌ updateClientStage 오류:', error);
    return {
      success: false,
      data: null,
      message: '고객 단계 이동 중 오류가 발생했습니다.',
    };
  }
}
