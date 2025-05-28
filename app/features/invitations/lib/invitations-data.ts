import { db } from '~/lib/db';
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
import { invitations, profiles, clients } from '~/lib/db-schema';

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

    // 만료된 초대장 수
    const expiredInvitationsResult = await db
      .select({ count: count() })
      .from(invitations)
      .where(
        and(
          eq(invitations.inviterId, userId),
          sql`${invitations.expiresAt} < NOW()`
        )
      );

    const expiredInvitations = expiredInvitationsResult[0]?.count || 0;

    // 사용 가능한 초대장 수
    const availableInvitations =
      totalInvitations - usedInvitations - expiredInvitations;

    // 전환율 계산
    const conversionRate =
      totalInvitations > 0
        ? Math.round((usedInvitations / totalInvitations) * 100)
        : 0;

    return {
      totalSent: totalInvitations,
      totalUsed: usedInvitations,
      totalExpired: expiredInvitations,
      availableInvitations: Math.max(0, availableInvitations),
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
  expiresInDays?: number;
}) {
  try {
    // 초대 코드 생성
    const code = generateInvitationCode();

    // 만료일 계산 (기본 30일)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (data.expiresInDays || 30));

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

    // 만료 확인
    if (inv.expiresAt && inv.expiresAt < new Date()) {
      return { valid: false, error: '만료된 초대장입니다.' };
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

// 초대 코드 생성 함수
function generateInvitationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = [];

  // CLUB-2024-XXXX 형식으로 생성
  segments.push('CLUB');
  segments.push(new Date().getFullYear().toString());

  // 4자리 랜덤 코드
  let randomCode = '';
  for (let i = 0; i < 4; i++) {
    randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  segments.push(randomCode);

  return segments.join('-');
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
