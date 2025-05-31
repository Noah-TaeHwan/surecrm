import { db } from '~/lib/core/db';
import {
  eq,
  desc,
  asc,
  count,
  sql,
  and,
  gte,
  lte,
  isNull,
  isNotNull,
} from 'drizzle-orm';
import { invitations, profiles, clients } from '~/lib/schema';

// 사용자의 초대장 목록 조회
export async function getUserInvitations(userId: string) {
  try {
    const userInvitations = await db
      .select({
        id: invitations.id,
        code: invitations.code,
        status: invitations.status,
        createdAt: invitations.createdAt,
        usedAt: invitations.usedAt,
        expiresAt: invitations.expiresAt,
        inviteeEmail: invitations.inviteeEmail,
        // 초대받은 사용자 정보
        inviteeId: invitations.usedById,
        inviteeName: profiles.fullName,
        inviteeJoinedAt: profiles.createdAt,
      })
      .from(invitations)
      .leftJoin(profiles, eq(invitations.usedById, profiles.id))
      .where(eq(invitations.inviterId, userId))
      .orderBy(desc(invitations.createdAt));

    return userInvitations.map((invitation) => ({
      id: invitation.id,
      code: invitation.code,
      status: (invitation.status === 'used' ? 'used' : 'available') as
        | 'used'
        | 'available',
      createdAt: invitation.createdAt.toISOString().split('T')[0],
      usedAt: invitation.usedAt?.toISOString().split('T')[0],
      invitee: invitation.inviteeId
        ? {
            id: invitation.inviteeId,
            name: invitation.inviteeName || '알 수 없음',
            email: invitation.inviteeEmail || '',
            joinedAt:
              invitation.inviteeJoinedAt?.toISOString().split('T')[0] || '',
          }
        : undefined,
    }));
  } catch (error) {
    console.error('getUserInvitations 오류:', error);
    return [];
  }
}

// 초대장 통계 조회
export async function getInvitationStats(userId: string) {
  try {
    // 총 초대장 수
    const totalInvitationsResult = await db
      .select({ count: count() })
      .from(invitations)
      .where(eq(invitations.inviterId, userId));

    const totalInvitations = totalInvitationsResult[0]?.count || 0;

    // 사용된 초대장 수
    const usedInvitationsResult = await db
      .select({ count: count() })
      .from(invitations)
      .where(
        and(eq(invitations.inviterId, userId), eq(invitations.status, 'used'))
      );

    const usedInvitations = usedInvitationsResult[0]?.count || 0;

    // 사용 가능한 초대장 수 (만료 개념 제거)
    const availableInvitationsResult = await db
      .select({ count: count() })
      .from(invitations)
      .where(
        and(
          eq(invitations.inviterId, userId),
          eq(invitations.status, 'pending')
        )
      );

    const availableInvitations = availableInvitationsResult[0]?.count || 0;

    // 전환율 계산
    const conversionRate =
      totalInvitations > 0
        ? Math.round((usedInvitations / totalInvitations) * 100)
        : 0;

    return {
      totalSent: totalInvitations,
      totalUsed: usedInvitations,
      totalExpired: 0, // 만료 개념 제거
      availableInvitations,
      conversionRate,
      successfulInvitations: usedInvitations,
    };
  } catch (error) {
    console.error('getInvitationStats 오류:', error);
    return {
      totalSent: 0,
      totalUsed: 0,
      totalExpired: 0,
      availableInvitations: 0,
      conversionRate: 0,
      successfulInvitations: 0,
    };
  }
}

// 새 초대장 생성
export async function createInvitation(data: {
  inviterId: string;
  inviteeEmail?: string;
  message?: string;
}) {
  try {
    // 초대 코드 생성
    const code = generateInvitationCode();

    // 만료일 제거 - 영구적으로 사용 가능
    const expiresAt = new Date('2099-12-31');

    const newInvitation = await db
      .insert(invitations)
      .values({
        code,
        inviterId: data.inviterId,
        inviteeEmail: data.inviteeEmail,
        message: data.message,
        expiresAt,
        status: 'pending',
      })
      .returning();

    return newInvitation[0];
  } catch (error) {
    console.error('createInvitation 오류:', error);
    throw error;
  }
}

// 초대 코드 검증
export async function validateInvitationCode(code: string) {
  try {
    const invitation = await db
      .select({
        id: invitations.id,
        code: invitations.code,
        status: invitations.status,
        expiresAt: invitations.expiresAt,
        inviterId: invitations.inviterId,
        inviterName: profiles.fullName,
      })
      .from(invitations)
      .leftJoin(profiles, eq(invitations.inviterId, profiles.id))
      .where(eq(invitations.code, code))
      .limit(1);

    if (!invitation[0]) {
      return { valid: false, error: '유효하지 않은 초대 코드입니다.' };
    }

    const inv = invitation[0];

    // 이미 사용된 초대장 확인
    if (inv.status === 'used') {
      return { valid: false, error: '이미 사용된 초대장입니다.' };
    }

    // 취소된 초대장 확인
    if (inv.status === 'cancelled') {
      return { valid: false, error: '취소된 초대장입니다.' };
    }

    return {
      valid: true,
      invitation: {
        id: inv.id,
        code: inv.code,
        inviterName: inv.inviterName || '알 수 없음',
      },
    };
  } catch (error) {
    console.error('validateInvitationCode 오류:', error);
    return { valid: false, error: '초대 코드 검증 중 오류가 발생했습니다.' };
  }
}

// 초대장 사용 처리
export async function useInvitation(code: string, userId: string) {
  try {
    const updatedInvitation = await db
      .update(invitations)
      .set({
        status: 'used',
        usedById: userId,
        usedAt: new Date(),
      })
      .where(eq(invitations.code, code))
      .returning();

    return updatedInvitation[0];
  } catch (error) {
    console.error('useInvitation 오류:', error);
    throw error;
  }
}

// 초대 코드 생성 함수 (SureCRM 프리미엄 멤버십 스타일)
function generateInvitationCode(): string {
  // 더 안전하고 고급스러운 코드 생성
  const timestamp = Date.now().toString(36).toUpperCase(); // 시간 기반
  const randomPart = generateSecureRandomString(6); // 6자리 보안 랜덤
  const checksum = generateChecksum(timestamp + randomPart); // 체크섬

  // SURE-{timestamp}-{random}-{checksum} 형식
  return `SURE-${timestamp}-${randomPart}-${checksum}`;
}

// 보안 랜덤 문자열 생성 (숫자와 대문자만 사용, 혼동 가능한 문자 제외)
function generateSecureRandomString(length: number): string {
  // 혼동 가능한 문자 제외: 0(영), O(오), 1(일), I(아이), L(엘)
  const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  let result = '';

  // crypto.getRandomValues 사용 (Node.js 환경에서는 crypto 모듈 사용)
  const array = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Node.js 환경 폴백
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }

  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }

  return result;
}

// 체크섬 생성 (간단한 해시)
function generateChecksum(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 32비트 정수로 변환
  }

  // 양수로 변환하고 36진법으로 변환 후 대문자로
  return Math.abs(hash).toString(36).toUpperCase().slice(0, 3);
}

// 초대받은 동료들 목록 조회
export async function getInvitedColleagues(userId: string) {
  try {
    const colleagues = await db
      .select({
        invitationId: invitations.id,
        invitationCode: invitations.code,
        usedAt: invitations.usedAt,
        inviteeEmail: invitations.inviteeEmail,
        colleagueId: profiles.id,
        colleagueName: profiles.fullName,
        colleagueJoinedAt: profiles.createdAt,
      })
      .from(invitations)
      .innerJoin(profiles, eq(invitations.usedById, profiles.id))
      .where(
        and(eq(invitations.inviterId, userId), eq(invitations.status, 'used'))
      )
      .orderBy(desc(invitations.usedAt));

    return colleagues.map((colleague) => ({
      id: colleague.invitationId,
      code: colleague.invitationCode,
      status: 'used' as const,
      createdAt: colleague.usedAt?.toISOString().split('T')[0] || '',
      usedAt: colleague.usedAt?.toISOString().split('T')[0],
      invitee: {
        id: colleague.colleagueId,
        name: colleague.colleagueName,
        email: colleague.inviteeEmail || '',
        joinedAt: colleague.colleagueJoinedAt.toISOString().split('T')[0],
      },
    }));
  } catch (error) {
    console.error('getInvitedColleagues 오류:', error);
    return [];
  }
}

/**
 * SureCRM MVP 모델: 새 사용자에게 자동으로 초대 코드 생성
 * 가입 시 기본 2장의 초대 코드를 제공 (만료 없음)
 * 추가 지급 불가 - MVP 단순함 유지
 */
export async function createInitialInvitations(
  userId: string,
  count: number = 2
) {
  try {
    // MVP: 정확히 2장만 지급, 추가 불가
    const finalCount = Math.min(count, 2);

    const invitationsToCreate = [];

    for (let i = 0; i < finalCount; i++) {
      const code = generateInvitationCode();
      // 만료일 제거 - 영구적으로 사용 가능
      const expiresAt = new Date('2099-12-31'); // 실질적으로 만료되지 않음

      invitationsToCreate.push({
        code,
        inviterId: userId,
        expiresAt,
        status: 'pending' as const,
        message: `${
          i === 0 ? '첫 번째' : '두 번째'
        } 동료 추천 코드입니다. 소중한 동료를 SureCRM에 초대해보세요!`,
      });
    }

    const newInvitations = await db
      .insert(invitations)
      .values(invitationsToCreate)
      .returning();

    console.log(
      `✨ 사용자 ${userId}에게 ${finalCount}장의 초기 추천 코드 생성 완료 (만료 없음)`
    );
    return newInvitations;
  } catch (error) {
    console.error('초기 추천 코드 생성 실패:', error);
    throw error;
  }
}

/**
 * MVP: 보상 시스템 비활성화
 * 단순한 2장 제한 시스템으로 운영
 * 추가 초대 코드 지급 없음
 */
export async function grantBonusInvitations(
  inviterId: string,
  bonusCount: number = 1
) {
  try {
    // MVP: 보상 시스템 비활성화 - 추가 초대 코드 지급 안함
    console.log(
      `🚫 MVP 모드: 사용자 ${inviterId}에게 추가 초대 코드 지급하지 않음 (2장 제한)`
    );
    return [];
  } catch (error) {
    console.error('보너스 초대 코드 처리 실패:', error);
    throw error;
  }
}

/**
 * 초대 코드 사용 처리 (MVP 단순화 버전)
 * SureCRM 프리미엄 멤버십: 초대 성공 시 추가 지급 없음
 */
export async function useInvitationWithBonus(code: string, userId: string) {
  try {
    // 1. 초대 코드 사용 처리
    const updatedInvitation = await db
      .update(invitations)
      .set({
        status: 'used',
        usedById: userId,
        usedAt: new Date(),
      })
      .where(eq(invitations.code, code))
      .returning();

    if (!updatedInvitation[0]) {
      throw new Error('초대 코드 업데이트 실패');
    }

    const invitation = updatedInvitation[0];

    // 2. MVP: 보상 시스템 비활성화 - 추가 초대 코드 지급 안함
    // await grantBonusInvitations(invitation.inviterId, 1); // 비활성화

    // 3. 새 사용자에게 기본 초대 코드 지급 (정확히 2장만)
    await createInitialInvitations(userId, 2);

    // 4. MVP: 통계 업데이트 단순화
    console.log(`🎯 초대 코드 ${code} 사용 완료 (MVP 모드)`);
    console.log(`   - 초대자: ${invitation.inviterId} (추가 지급 없음)`);
    console.log(`   - 신규 사용자: ${userId} (기본 2장 지급)`);

    return invitation;
  } catch (error) {
    console.error('초대 코드 사용 처리 실패:', error);
    throw error;
  }
}

/**
 * 사용자의 사용 가능한 초대장 수 확인
 */
export async function getAvailableInvitationCount(
  userId: string
): Promise<number> {
  try {
    const result = await db
      .select({ count: count() })
      .from(invitations)
      .where(
        and(
          eq(invitations.inviterId, userId),
          eq(invitations.status, 'pending')
        )
      );

    return result[0]?.count || 0;
  } catch (error) {
    console.error('사용 가능한 초대장 수 조회 실패:', error);
    return 0;
  }
}

/**
 * 사용자의 초대장 통계 및 레벨 정보
 */
export async function getUserInvitationLevel(userId: string) {
  try {
    const stats = await db
      .select({
        totalSent: count(),
        used: count(sql`CASE WHEN ${invitations.status} = 'used' THEN 1 END`),
      })
      .from(invitations)
      .where(eq(invitations.inviterId, userId));

    const totalUsed = stats[0]?.used || 0;
    const level = Math.floor(totalUsed / 5) + 1; // 5명당 레벨업
    const nextLevelProgress = totalUsed % 5;

    return {
      level,
      totalInvited: totalUsed,
      nextLevelProgress,
      nextLevelTarget: 5,
      bonusMultiplier: Math.min(level, 3), // 최대 3배
    };
  } catch (error) {
    console.error('사용자 초대장 레벨 조회 실패:', error);
    return {
      level: 1,
      totalInvited: 0,
      nextLevelProgress: 0,
      nextLevelTarget: 5,
      bonusMultiplier: 1,
    };
  }
}
