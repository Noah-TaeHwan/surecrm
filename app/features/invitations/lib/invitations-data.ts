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

// 초대 코드 생성 함수 (클럽하우스 스타일)
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
 * 클럽하우스 모델: 새 사용자에게 자동으로 초대장 생성
 * 가입 시 기본 2장의 초대장을 제공 (만료 없음)
 */
export async function createInitialInvitations(
  userId: string,
  count: number = 2
) {
  try {
    const invitationsToCreate = [];

    for (let i = 0; i < count; i++) {
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
        } 초대장입니다. 소중한 동료를 초대해보세요!`,
      });
    }

    const newInvitations = await db
      .insert(invitations)
      .values(invitationsToCreate)
      .returning();

    console.log(
      `✨ 사용자 ${userId}에게 ${count}장의 초기 초대장 생성 완료 (만료 없음)`
    );
    return newInvitations;
  } catch (error) {
    console.error('초기 초대장 생성 실패:', error);
    throw error;
  }
}

/**
 * 초대장 사용 시 새로운 초대장 생성 (보상 시스템)
 * 성공적인 초대 시 추가 초대장 제공 (클럽하우스 모델의 핵심)
 */
export async function grantBonusInvitations(
  inviterId: string,
  bonusCount: number = 1
) {
  try {
    // 현재 사용자의 성공적인 초대 수 확인 (레벨 시스템)
    const successfulInvites = await db
      .select({ count: count() })
      .from(invitations)
      .where(
        and(
          eq(invitations.inviterId, inviterId),
          eq(invitations.status, 'used')
        )
      );

    const inviteLevel = Math.floor((successfulInvites[0]?.count || 0) / 5); // 5명당 레벨업
    const actualBonusCount = Math.min(bonusCount + inviteLevel, 3); // 최대 3장까지

    const bonusInvitations = [];

    for (let i = 0; i < actualBonusCount; i++) {
      const code = generateInvitationCode();
      // 보너스 초대장도 만료 없음
      const expiresAt = new Date('2099-12-31');

      bonusInvitations.push({
        code,
        inviterId,
        expiresAt,
        status: 'pending' as const,
        message: `🎉 성공적인 초대에 대한 보상 초대장입니다! (레벨 ${
          inviteLevel + 1
        })`,
      });
    }

    const newBonusInvitations = await db
      .insert(invitations)
      .values(bonusInvitations)
      .returning();

    console.log(
      `🎁 사용자 ${inviterId}에게 보너스 초대장 ${actualBonusCount}장 지급 (레벨 ${
        inviteLevel + 1
      }, 만료 없음)`
    );
    return newBonusInvitations;
  } catch (error) {
    console.error('보너스 초대장 생성 실패:', error);
    throw error;
  }
}

/**
 * 초대장 사용 처리 + 보너스 초대장 자동 생성
 * 클럽하우스 모델의 핵심: 초대 성공 시 초대자에게 보상
 */
export async function useInvitationWithBonus(code: string, userId: string) {
  try {
    // 1. 초대장 사용 처리
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
      throw new Error('초대장 업데이트 실패');
    }

    const invitation = updatedInvitation[0];

    // 2. 초대자에게 보너스 초대장 지급 (성공적인 초대에 대한 보상)
    await grantBonusInvitations(invitation.inviterId, 1);

    // 3. 새 사용자에게 기본 초대장 지급 (2장)
    await createInitialInvitations(userId, 2);

    // 4. 초대자의 profiles 테이블 업데이트 (통계용)
    await db.execute(sql`
      UPDATE profiles 
      SET invitations_left = invitations_left + 1,
          updated_at = NOW()
      WHERE id = ${invitation.inviterId}
    `);

    console.log(`🎯 초대장 ${code} 사용 완료 및 보상 지급 완료`);
    console.log(`   - 초대자: ${invitation.inviterId} (보너스 +1장)`);
    console.log(`   - 신규 사용자: ${userId} (기본 +2장)`);

    return invitation;
  } catch (error) {
    console.error('초대장 사용 및 보상 처리 실패:', error);
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
