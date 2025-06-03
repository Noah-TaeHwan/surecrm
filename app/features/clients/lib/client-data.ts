import { db } from '~/lib/core/db';
import {
  eq,
  desc,
  asc,
  like,
  and,
  or,
  count,
  sql,
  inArray,
  gte,
  lte,
} from 'drizzle-orm';
import {
  clients,
  clientDetails,
  insuranceInfo,
  teams,
  profiles,
  pipelineStages,
  meetings,
  referrals,
  documents,
} from '~/lib/schema';

// 🔄 업데이트된 테이블 imports (app_client_ prefix)
import {
  appClientTags,
  appClientTagAssignments,
  appClientContactHistory,
  appClientFamilyMembers,
  appClientPreferences,
  appClientAnalytics,
  appClientMilestones,
  appClientStageHistory,
  appClientDataAccessLogs,
  appClientDataBackups,
  type AppClientTag,
  type AppClientContactHistory,
  type AppClientFamilyMember,
  type AppClientPreferences,
  type AppClientAnalytics,
  type ClientPrivacyLevel,
  type ClientContactMethod,
  type ClientStatus,
} from './schema';

import type { Client } from '~/lib/schema';

// 🔒 데이터 접근 로깅 함수 (보안 강화) - 오버로드 지원
export async function logDataAccess(
  clientId: string,
  accessedBy: string,
  accessType: 'view' | 'edit' | 'export' | 'share' | 'delete',
  accessedData: string[],
  ipAddress?: string,
  userAgent?: string,
  purpose?: string
): Promise<void>;

export async function logDataAccess(params: {
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}): Promise<void>;

export async function logDataAccess(
  clientIdOrParams:
    | string
    | {
        userId: string;
        action: string;
        resourceType: string;
        resourceId: string;
        details: string;
        ipAddress?: string;
        metadata?: Record<string, any>;
      },
  accessedBy?: string,
  accessType?: 'view' | 'edit' | 'export' | 'share' | 'delete',
  accessedData?: string[],
  ipAddress?: string,
  userAgent?: string,
  purpose?: string
) {
  try {
    if (typeof clientIdOrParams === 'object') {
      // 새로운 형태의 로깅
      const {
        userId,
        action,
        resourceType,
        resourceId,
        details,
        ipAddress: ip,
        metadata,
      } = clientIdOrParams;

      await db.insert(appClientDataAccessLogs).values({
        clientId: resourceId,
        accessedBy: userId,
        accessType: 'view', // 기본값
        accessedData: [resourceType],
        ipAddress: ip,
        userAgent: metadata?.userAgent,
        purpose: details,
        accessResult: 'success',
      });
    } else {
      // 기존 형태의 로깅
      await db.insert(appClientDataAccessLogs).values({
        clientId: clientIdOrParams,
        accessedBy: accessedBy!,
        accessType: accessType!,
        accessedData: accessedData || [],
        ipAddress,
        userAgent,
        purpose,
        accessResult: 'success',
      });
    }
  } catch (error) {
    console.error('데이터 접근 로그 기록 실패:', error);
  }
}

// 🔄 데이터 백업 함수 (데이터 보호) - 서버 전용
async function createDataBackup(
  clientId: string,
  triggeredBy: string,
  backupType: 'full' | 'incremental' | 'emergency',
  triggerReason: string,
  retentionDays: number = 30
) {
  // 브라우저 환경에서는 실행하지 않음
  if (typeof window !== 'undefined') {
    console.log('데이터 백업은 서버에서만 실행됩니다.');
    return;
  }

  try {
    // 고객 데이터 수집
    const clientData = await getClientOverview(clientId, triggeredBy);

    // 데이터 해시 생성 (무결성 검증용) - 단순화
    const dataString = JSON.stringify(clientData);
    let backupHash: string;

    // 브라우저 호환 인코딩 사용 (Buffer 완전 제거)
    try {
      backupHash = btoa(dataString);
    } catch (error) {
      // btoa 실패 시 간단한 해시
      backupHash = dataString.length.toString(36) + Date.now().toString(36);
    }

    // 백업 생성
    const retentionUntil = new Date();
    retentionUntil.setDate(retentionUntil.getDate() + retentionDays);

    await db.insert(appClientDataBackups).values({
      clientId,
      backupType,
      backupData: clientData,
      backupHash,
      triggeredBy,
      triggerReason,
      retentionUntil,
      isEncrypted: true,
      encryptionKey: `enc_${Date.now()}`, // 실제로는 보안 키 관리 시스템 사용
    });

    console.log(`고객 ${clientId} 데이터 백업 완료 (${backupType})`);
  } catch (error: any) {
    console.error('데이터 백업 실패:', error);
    throw error;
  }
}

// 📋 고객 목록 조회 (보안 강화)
export async function getClients(params: {
  agentId: string;
  page?: number;
  pageSize?: number;
  search?: string;
  stageIds?: string[];
  tagIds?: string[];
  importance?: string[];
  sources?: string[];
  privacyLevels?: ClientPrivacyLevel[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  ipAddress?: string;
  userAgent?: string;
}) {
  const {
    agentId,
    page = 1,
    pageSize = 10,
    search,
    stageIds,
    tagIds,
    importance,
    sources,
    privacyLevels,
    sortBy = 'fullName',
    sortOrder = 'asc',
    ipAddress,
    userAgent,
  } = params;

  try {
    // 기본 쿼리 조건
    const baseConditions = [
      eq(clients.agentId, agentId),
      eq(clients.isActive, true),
    ];

    // 검색 조건
    if (search) {
      baseConditions.push(
        sql`(
          ${clients.fullName} ILIKE ${`%${search}%`} OR
          ${clients.phone} ILIKE ${`%${search}%`} OR
          ${clients.email} ILIKE ${`%${search}%`} OR
          ${clients.occupation} ILIKE ${`%${search}%`}
        )`
      );
    }

    // 단계 필터
    if (stageIds && stageIds.length > 0) {
      baseConditions.push(inArray(clients.currentStageId, stageIds));
    }

    // 중요도 필터
    if (importance && importance.length > 0) {
      baseConditions.push(inArray(clients.importance, importance));
    }

    // 정렬 설정
    const orderDirection = sortOrder === 'desc' ? desc : asc;
    let orderByClause;

    switch (sortBy) {
      case 'fullName':
        orderByClause = orderDirection(clients.fullName);
        break;
      case 'createdAt':
        orderByClause = orderDirection(clients.createdAt);
        break;
      case 'updatedAt':
        orderByClause = orderDirection(clients.updatedAt);
        break;
      case 'importance':
        orderByClause = orderDirection(clients.importance);
        break;
      default:
        orderByClause = orderDirection(clients.fullName);
    }

    // 페이지네이션 계산
    const offset = (page - 1) * pageSize;

    // 고객 목록 조회
    const clientsQuery = db
      .select({
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
        // 조인된 필드들 - 수정된 부분
        stageName: pipelineStages.name,
        stageColor: pipelineStages.color,
        stageOrder: pipelineStages.order,
      })
      .from(clients)
      .leftJoin(pipelineStages, eq(clients.currentStageId, pipelineStages.id))
      .where(and(...baseConditions))
      .orderBy(orderByClause)
      .limit(pageSize)
      .offset(offset);

    const clientsList = await clientsQuery;

    // 총 개수 조회
    const [{ totalCount }] = await db
      .select({ totalCount: count() })
      .from(clients)
      .where(and(...baseConditions));

    // 🔒 데이터 접근 로그 기록
    if (clientsList.length > 0) {
      await logDataAccess(
        'bulk_query',
        agentId,
        'view',
        ['client_list'],
        ipAddress,
        userAgent,
        '고객 목록 조회'
      );
    }

    return {
      clients: clientsList,
      totalCount,
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  } catch (error) {
    console.error('고객 목록 조회 오류:', error);
    throw new Error('고객 목록을 불러오는데 실패했습니다.');
  }
}

// 📋 고객 상세 정보 조회 (보안 강화)
export async function getClientOverview(
  clientId: string,
  agentId: string,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    // 🔒 접근 권한 확인
    const clientAccess = await db
      .select({ agentId: clients.agentId })
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);

    if (clientAccess.length === 0) {
      throw new Error('고객을 찾을 수 없습니다.');
    }

    if (clientAccess[0].agentId !== agentId) {
      // 🔒 무단 접근 시도 로그
      await logDataAccess(
        clientId,
        agentId,
        'view',
        ['unauthorized_access'],
        ipAddress,
        userAgent,
        '무단 접근 시도'
      );
      throw new Error('해당 고객 정보에 접근할 권한이 없습니다.');
    }

    // 고객 기본 정보 조회
    const [client] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, clientId), eq(clients.agentId, agentId)))
      .limit(1);

    if (!client) {
      throw new Error('고객 정보를 찾을 수 없습니다.');
    }

    // 관련 데이터 병렬 조회
    const [
      tags,
      preferences,
      analytics,
      familyMembers,
      recentContacts,
      milestones,
      stageHistory,
    ] = await Promise.all([
      // 태그 조회
      db
        .select({
          id: appClientTags.id,
          name: appClientTags.name,
          color: appClientTags.color,
          description: appClientTags.description,
        })
        .from(appClientTagAssignments)
        .leftJoin(
          appClientTags,
          eq(appClientTagAssignments.tagId, appClientTags.id)
        )
        .where(eq(appClientTagAssignments.clientId, clientId)),

      // 선호도 조회
      db
        .select()
        .from(appClientPreferences)
        .where(eq(appClientPreferences.clientId, clientId))
        .limit(1),

      // 분석 데이터 조회
      db
        .select()
        .from(appClientAnalytics)
        .where(eq(appClientAnalytics.clientId, clientId))
        .limit(1),

      // 가족 구성원 조회 (개인정보 보호 레벨 확인)
      db
        .select()
        .from(appClientFamilyMembers)
        .where(eq(appClientFamilyMembers.clientId, clientId))
        .orderBy(desc(appClientFamilyMembers.createdAt)),

      // 최근 연락 이력 조회
      db
        .select()
        .from(appClientContactHistory)
        .where(eq(appClientContactHistory.clientId, clientId))
        .orderBy(desc(appClientContactHistory.createdAt))
        .limit(5),

      // 마일스톤 조회
      db
        .select()
        .from(appClientMilestones)
        .where(eq(appClientMilestones.clientId, clientId))
        .orderBy(desc(appClientMilestones.achievedAt)),

      // 단계 변경 이력 조회
      db
        .select({
          id: appClientStageHistory.id,
          fromStageId: appClientStageHistory.fromStageId,
          toStageId: appClientStageHistory.toStageId,
          reason: appClientStageHistory.reason,
          notes: appClientStageHistory.notes,
          changedAt: appClientStageHistory.changedAt,
          fromStage: {
            name: sql<string>`from_stage.name`.as('from_stage_name'),
          },
          toStage: {
            name: sql<string>`to_stage.name`.as('to_stage_name'),
          },
        })
        .from(appClientStageHistory)
        .leftJoin(
          sql`${pipelineStages} as from_stage`,
          eq(appClientStageHistory.fromStageId, sql`from_stage.id`)
        )
        .leftJoin(
          sql`${pipelineStages} as to_stage`,
          eq(appClientStageHistory.toStageId, sql`to_stage.id`)
        )
        .where(eq(appClientStageHistory.clientId, clientId))
        .orderBy(desc(appClientStageHistory.changedAt)),
    ]);

    // 🔒 데이터 접근 로그 기록
    await logDataAccess(
      clientId,
      agentId,
      'view',
      [
        'client_overview',
        'tags',
        'preferences',
        'analytics',
        'family',
        'contacts',
        'milestones',
      ],
      ipAddress,
      userAgent,
      '고객 상세 정보 조회'
    );

    // 🔒 개인정보 보호 레벨에 따른 데이터 필터링
    const accessLevel: ClientPrivacyLevel =
      preferences[0]?.privacyLevel || 'private';

    return {
      client,
      tags: tags.filter((tag) => tag.id), // null 제거
      preferences: preferences[0] || null,
      analytics: analytics[0] || null,
      familyMembers: familyMembers.filter((member) => {
        // 개인정보 보호 레벨에 따른 접근 제한
        if (member.privacyLevel === 'confidential') {
          return (
            member.consentDate &&
            new Date(member.consentDate) <= new Date() &&
            (!member.consentExpiry ||
              new Date(member.consentExpiry) > new Date())
          );
        }
        return true;
      }),
      recentContacts: recentContacts.filter((contact) => {
        // 기밀 연락 이력 필터링
        return !contact.isConfidential || contact.agentId === agentId;
      }),
      milestones,
      stageHistory,
      // 🔒 보안 정보
      accessLevel,
      dataConsents: {
        marketing: preferences[0]?.marketingConsent || false,
        dataProcessing: preferences[0]?.dataProcessingConsent || true,
        thirdPartyShare: preferences[0]?.thirdPartyShareConsent || false,
      },
    };
  } catch (error: any) {
    console.error('고객 상세 정보 조회 오류:', error);

    // 🔒 에러 로그 기록
    if (clientId && agentId) {
      await logDataAccess(
        clientId,
        agentId,
        'view',
        ['error'],
        ipAddress,
        userAgent,
        `오류 발생: ${error.message}`
      );
    }

    throw error;
  }
}

// 📋 고객 생성 (보안 강화)
export async function createClient(
  clientData: Omit<
    typeof clients.$inferInsert,
    'id' | 'createdAt' | 'updatedAt' | 'agentId'
  >,
  agentId: string,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    // 🔒 필수 보안 검증 - agentId를 clientData에 추가
    const finalClientData: typeof clients.$inferInsert = {
      ...clientData,
      agentId, // agentId를 명시적으로 설정
    };

    // 중복 고객 확인 (전화번호 기준)
    const existingClient = await db
      .select({ id: clients.id, fullName: clients.fullName })
      .from(clients)
      .where(
        and(
          eq(clients.phone, clientData.phone),
          eq(clients.agentId, agentId),
          eq(clients.isActive, true)
        )
      )
      .limit(1);

    if (existingClient.length > 0) {
      throw new Error(
        `동일한 전화번호의 고객이 이미 존재합니다: ${existingClient[0].fullName}`
      );
    }

    // 🔄 트랜잭션으로 고객 생성
    const result = await db.transaction(async (tx) => {
      // 고객 기본 정보 생성
      const [newClient] = await tx
        .insert(clients)
        .values(finalClientData)
        .returning();

      // 🔗 소개자 정보가 있는 경우 referrals 테이블에도 관계 생성
      if (clientData.referredById) {
        try {
          await tx.insert(referrals).values({
            referrerId: clientData.referredById,
            referredId: newClient.id,
            agentId: agentId,
            referralDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD 형식
            status: 'active',
            notes: `${newClient.fullName} 고객 등록 시 소개 관계 자동 생성`,
          });
          console.log(
            `✅ 소개 관계 생성 완료: ${clientData.referredById} → ${newClient.id}`
          );
        } catch (referralError) {
          console.warn('⚠️ 소개 관계 생성 실패 (계속 진행):', referralError);
          // 소개 관계 생성 실패해도 고객 생성은 계속 진행
        }
      }

      // 🔒 데이터 백업 생성 - 임시 비활성화 (Buffer 에러 해결까지)
      // await createDataBackup(
      //   newClient.id,
      //   agentId,
      //   'full',
      //   'client_creation',
      //   90 // 신규 고객은 90일 보관
      // );

      // 🔒 생성 로그 기록
      await logDataAccess(
        newClient.id,
        agentId,
        'edit',
        ['client_create'],
        ipAddress,
        userAgent,
        '새 고객 생성'
      );

      // 기본 선호도 설정 생성
      await tx.insert(appClientPreferences).values({
        clientId: newClient.id,
        preferredContactMethod: 'phone',
        privacyLevel: 'private',
        marketingConsent: false,
        dataProcessingConsent: true,
        thirdPartyShareConsent: false,
      });

      // 기본 분석 데이터 생성
      const analyticsData: Omit<
        typeof appClientAnalytics.$inferInsert,
        'id' | 'createdAt' | 'updatedAt'
      > = {
        clientId: newClient.id,
        totalContacts: 0,
        engagementScore: '50.00', // decimal 타입이므로 문자열
        conversionProbability: '25.00', // decimal 타입이므로 문자열
        referralCount: 0,
      };

      await tx.insert(appClientAnalytics).values(analyticsData);

      return newClient;
    });

    console.log(`새 고객 생성 완료: ${result.fullName} (${result.id})`);
    return result;
  } catch (error) {
    console.error('고객 생성 오류:', error);
    throw error;
  }
}

// 📋 고객 정보 수정 (보안 강화)
export async function updateClient(
  clientId: string,
  updates: Partial<
    Omit<typeof clients.$inferInsert, 'id' | 'agentId' | 'createdAt'>
  >,
  agentId: string,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    // 🔒 접근 권한 확인
    const [existingClient] = await db
      .select({ agentId: clients.agentId })
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);

    if (!existingClient) {
      throw new Error('고객을 찾을 수 없습니다.');
    }

    if (existingClient.agentId !== agentId) {
      throw new Error('해당 고객 정보를 수정할 권한이 없습니다.');
    }

    // 🔒 수정 전 백업 생성 - 임시 비활성화 (Buffer 에러 해결까지)
    // await createDataBackup(
    //   clientId,
    //   agentId,
    //   'incremental',
    //   'before_update',
    //   30
    // );

    // 🔄 트랜잭션으로 업데이트
    const result = await db.transaction(async (tx) => {
      const [updatedClient] = await tx
        .update(clients)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(clients.id, clientId))
        .returning();

      // 🔒 수정 로그 기록
      await logDataAccess(
        clientId,
        agentId,
        'edit',
        Object.keys(updates),
        ipAddress,
        userAgent,
        '고객 정보 수정'
      );

      return updatedClient;
    });

    console.log(`고객 정보 수정 완료: ${clientId}`);
    return result;
  } catch (error) {
    console.error('고객 정보 수정 오류:', error);
    throw error;
  }
}

// 📋 고객 삭제 (보안 강화 - 논리적 삭제)
export async function deleteClient(
  clientId: string,
  agentId: string,
  reason: string,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    // 🔒 접근 권한 확인
    const [existingClient] = await db
      .select({ agentId: clients.agentId, fullName: clients.fullName })
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);

    if (!existingClient) {
      throw new Error('고객을 찾을 수 없습니다.');
    }

    if (existingClient.agentId !== agentId) {
      throw new Error('해당 고객 정보를 삭제할 권한이 없습니다.');
    }

    // 🔒 삭제 전 긴급 백업 생성 - 임시 비활성화 (Buffer 에러 해결까지)
    // await createDataBackup(
    //   clientId,
    //   agentId,
    //   'emergency',
    //   `client_deletion: ${reason}`,
    //   365 // 1년 보관
    // );

    // 🔄 논리적 삭제 (실제 데이터는 보관)
    const result = await db.transaction(async (tx) => {
      const [deletedClient] = await tx
        .update(clients)
        .set({
          isActive: false,
          updatedAt: new Date(),
          notes: sql`COALESCE(${
            clients.notes
          }, '') || ${`\n\n[삭제됨 - ${new Date().toISOString()}] 사유: ${reason}`}`,
        })
        .where(eq(clients.id, clientId))
        .returning();

      // 🔒 삭제 로그 기록
      await logDataAccess(
        clientId,
        agentId,
        'delete',
        ['client_soft_delete'],
        ipAddress,
        userAgent,
        `고객 삭제 - 사유: ${reason}`
      );

      return deletedClient;
    });

    console.log(`고객 삭제 완료: ${existingClient.fullName} (${clientId})`);
    return result;
  } catch (error) {
    console.error('고객 삭제 오류:', error);
    throw error;
  }
}

// 📊 고객 통계 조회
export async function getClientStats(agentId: string) {
  try {
    const [stats] = await db
      .select({
        totalClients: count(),
        activeClients: sql<number>`COUNT(CASE WHEN ${clients.isActive} = true THEN 1 END)`,
        highImportanceClients: sql<number>`COUNT(CASE WHEN ${clients.importance} = 'high' THEN 1 END)`,
        mediumImportanceClients: sql<number>`COUNT(CASE WHEN ${clients.importance} = 'medium' THEN 1 END)`,
        lowImportanceClients: sql<number>`COUNT(CASE WHEN ${clients.importance} = 'low' THEN 1 END)`,
      })
      .from(clients)
      .where(eq(clients.agentId, agentId));

    return {
      totalClients: stats.totalClients,
      activeClients: stats.activeClients,
      inactiveClients: stats.totalClients - stats.activeClients,
      importanceDistribution: {
        high: stats.highImportanceClients,
        medium: stats.mediumImportanceClients,
        low: stats.lowImportanceClients,
      },
    };
  } catch (error) {
    console.error('고객 통계 조회 오류:', error);
    throw new Error('고객 통계를 불러오는데 실패했습니다.');
  }
}

// 🏷️ 태그 관련 함수들 (새 테이블명 적용)
export async function getClientTags(agentId: string) {
  return await db
    .select()
    .from(appClientTags)
    .where(
      and(eq(appClientTags.agentId, agentId), eq(appClientTags.isActive, true))
    )
    .orderBy(asc(appClientTags.name));
}

export async function createClientTag(
  tagData: Omit<
    typeof appClientTags.$inferInsert,
    'id' | 'createdAt' | 'updatedAt'
  >,
  agentId: string
) {
  if (tagData.agentId !== agentId) {
    throw new Error('권한이 없습니다.');
  }

  const [newTag] = await db.insert(appClientTags).values(tagData).returning();

  return newTag;
}

export async function assignTagToClient(
  clientId: string,
  tagId: string,
  agentId: string
) {
  // 이미 할당된 태그인지 확인
  const existing = await db
    .select()
    .from(appClientTagAssignments)
    .where(
      and(
        eq(appClientTagAssignments.clientId, clientId),
        eq(appClientTagAssignments.tagId, tagId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    throw new Error('이미 할당된 태그입니다.');
  }

  const [assignment] = await db
    .insert(appClientTagAssignments)
    .values({
      clientId,
      tagId,
      assignedBy: agentId,
    })
    .returning();

  return assignment;
}

// 📞 연락 이력 관련 함수들
export async function addContactHistory(
  contactData: Omit<
    typeof appClientContactHistory.$inferInsert,
    'id' | 'createdAt'
  >,
  agentId: string
) {
  if (contactData.agentId !== agentId) {
    throw new Error('권한이 없습니다.');
  }

  const [newContact] = await db
    .insert(appClientContactHistory)
    .values(contactData)
    .returning();

  // 분석 데이터 업데이트
  await db
    .update(appClientAnalytics)
    .set({
      totalContacts: sql`${appClientAnalytics.totalContacts} + 1`,
      lastContactDate: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(appClientAnalytics.clientId, contactData.clientId));

  return newContact;
}

// 👨‍👩‍👧‍👦 가족 구성원 관련 함수들
export async function addFamilyMember(
  familyData: Omit<
    typeof appClientFamilyMembers.$inferInsert,
    'id' | 'createdAt' | 'updatedAt'
  >,
  agentId: string
) {
  // 권한 확인
  const [client] = await db
    .select({ agentId: clients.agentId })
    .from(clients)
    .where(eq(clients.id, familyData.clientId))
    .limit(1);

  if (!client || client.agentId !== agentId) {
    throw new Error('권한이 없습니다.');
  }

  const [newMember] = await db
    .insert(appClientFamilyMembers)
    .values(familyData)
    .returning();

  return newMember;
}

// 🎯 마일스톤 관련 함수들
export async function addMilestone(
  milestoneData: Omit<
    typeof appClientMilestones.$inferInsert,
    'id' | 'createdAt'
  >,
  agentId: string
) {
  if (milestoneData.agentId !== agentId) {
    throw new Error('권한이 없습니다.');
  }

  const [newMilestone] = await db
    .insert(appClientMilestones)
    .values(milestoneData)
    .returning();

  return newMilestone;
}

// 🔍 고급 검색 함수
export async function searchClients(
  agentId: string,
  searchParams: {
    query?: string;
    stageIds?: string[];
    tagIds?: string[];
    importance?: string[];
    dateRange?: { start: Date; end: Date };
    hasRecentContact?: boolean;
    privacyLevels?: ClientPrivacyLevel[];
  }
) {
  const conditions = [eq(clients.agentId, agentId), eq(clients.isActive, true)];

  // 검색어 조건
  if (searchParams.query) {
    conditions.push(
      sql`(
        ${clients.fullName} ILIKE ${`%${searchParams.query}%`} OR
        ${clients.phone} ILIKE ${`%${searchParams.query}%`} OR
        ${clients.email} ILIKE ${`%${searchParams.query}%`} OR
        ${clients.occupation} ILIKE ${`%${searchParams.query}%`}
      )`
    );
  }

  // 추가 필터들
  if (searchParams.stageIds?.length) {
    conditions.push(inArray(clients.currentStageId, searchParams.stageIds));
  }

  if (searchParams.importance?.length) {
    conditions.push(inArray(clients.importance, searchParams.importance));
  }

  if (searchParams.dateRange) {
    conditions.push(
      gte(clients.createdAt, searchParams.dateRange.start),
      lte(clients.createdAt, searchParams.dateRange.end)
    );
  }

  const results = await db
    .select()
    .from(clients)
    .where(and(...conditions))
    .orderBy(asc(clients.fullName));

  return results;
}

// 🔍 단일 고객 조회 (보안 강화)
export async function getClientById(
  clientId: string,
  agentId: string,
  includeDetails: boolean = true
) {
  try {
    // 🔒 보안 감사 로깅
    await logDataAccess(
      clientId,
      agentId,
      'view',
      ['client_basic_info'],
      undefined,
      undefined,
      'Client detail page access'
    );

    // 기본 고객 정보 조회
    const clientResult = await db
      .select()
      .from(clients)
      .where(
        and(
          eq(clients.id, clientId),
          eq(clients.agentId, agentId),
          eq(clients.isActive, true)
        )
      )
      .limit(1);

    if (clientResult.length === 0) {
      return null;
    }

    const client = clientResult[0];

    if (!includeDetails) {
      return client;
    }

    // 🔒 상세 정보 조회 (개인정보 보호 고려)
    const [
      clientDetailResult,
      tagsResult,
      referredByResult,
      preferencesResult,
      analyticsResult,
    ] = await Promise.all([
      // 클라이언트 상세 정보
      db
        .select()
        .from(clientDetails)
        .where(eq(clientDetails.clientId, clientId))
        .limit(1),

      // 태그 정보
      db
        .select({
          tag: appClientTags,
        })
        .from(appClientTagAssignments)
        .innerJoin(
          appClientTags,
          eq(appClientTagAssignments.tagId, appClientTags.id)
        )
        .where(eq(appClientTagAssignments.clientId, clientId)),

      // 소개자 정보
      client.referredById
        ? db
            .select({
              id: clients.id,
              fullName: clients.fullName,
              phone: clients.phone,
            })
            .from(clients)
            .where(eq(clients.id, client.referredById))
            .limit(1)
        : Promise.resolve([]),

      // 고객 선호도
      db
        .select()
        .from(appClientPreferences)
        .where(eq(appClientPreferences.clientId, clientId))
        .limit(1),

      // 고객 분석 데이터
      db
        .select()
        .from(appClientAnalytics)
        .where(eq(appClientAnalytics.clientId, clientId))
        .limit(1),
    ]);

    // 결과 조합
    const extendedClient = {
      ...client,
      // 상세 정보 병합
      ...(clientDetailResult[0] || {}),

      // 태그 정보
      tags: tagsResult.map((t) => t.tag.name),

      // 소개자 정보
      referredBy: referredByResult[0] || null,

      // 선호도 및 분석 데이터
      preferences: preferencesResult[0] || null,
      analytics: analyticsResult[0] || null,
    };

    return extendedClient;
  } catch (error) {
    console.error('고객 조회 실패:', error);
    throw error;
  }
}
