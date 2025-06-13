import { db } from '~/lib/core/db';
import {
  profiles,
  teams,
  invitations,
  type Profile,
  type Team,
  type Invitation,
} from './schema';
import { authUsers } from '~/lib/schema';
import { clients } from '~/lib/schema';
import { eq, and, count, sql } from 'drizzle-orm';

// 팀 멤버 인터페이스
export interface TeamMember {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  position: string;
  role: string;
  status: 'active' | 'pending';
  joinedAt?: string;
  invitedAt?: string;
  lastSeen?: string;
  clients: number;
  conversions: number;
}

// 팀 통계 인터페이스
export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  pendingInvites: number;
  totalClients: number;
}

// 팀 멤버 목록 가져오기
export async function getTeamMembers(userId: string): Promise<TeamMember[]> {
  try {
    // 현재 사용자의 팀 ID 가져오기
    const userProfile = await db
      .select({ teamId: profiles.teamId })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    const teamId = userProfile[0]?.teamId;
    if (!teamId) {
      return [];
    }

    // 팀 멤버들 가져오기 (활성 멤버)
    const activeMembers = await db
      .select({
        id: profiles.id,
        fullName: profiles.fullName,
        phone: profiles.phone,
        company: profiles.company,
        role: profiles.role,
        isActive: profiles.isActive,
        createdAt: profiles.createdAt,
        lastLoginAt: profiles.lastLoginAt,
        clientCount: sql<number>`COUNT(${clients.id})`,
        conversions: sql<number>`COUNT(CASE WHEN ${clients.status} = 'active' THEN 1 END)`,
      })
      .from(profiles)
      .leftJoin(clients, eq(clients.agentId, profiles.id))
      .where(and(eq(profiles.teamId, teamId), eq(profiles.isActive, true)))
      .groupBy(
        profiles.id,
        profiles.fullName,
        profiles.phone,
        profiles.company,
        profiles.role,
        profiles.isActive,
        profiles.createdAt,
        profiles.lastLoginAt
      );

    // 대기 중인 초대들 가져오기
    const pendingInvitations = await db
      .select({
        id: invitations.id,
        inviteeEmail: invitations.inviteeEmail,
        status: invitations.status,
        createdAt: invitations.createdAt,
      })
      .from(invitations)
      .innerJoin(profiles, eq(profiles.id, invitations.inviterId))
      .where(
        and(eq(profiles.teamId, teamId), eq(invitations.status, 'pending'))
      );

    // 활성 멤버들을 TeamMember 형식으로 변환
    const teamMembers: TeamMember[] = activeMembers.map(member => ({
      id: member.id,
      name: member.fullName || '이름 없음',
      email: '', // 이메일은 auth.users에서 가져와야 함
      phone: member.phone || '',
      company: member.company || '',
      position: getRoleDisplayName(member.role),
      role: member.role,
      status: 'active' as const,
      joinedAt: member.createdAt?.toISOString().split('T')[0] || '',
      lastSeen: member.lastLoginAt?.toLocaleString('ko-KR') || '',
      clients: member.clientCount || 0,
      conversions: member.conversions || 0,
    }));

    // 대기 중인 초대들을 TeamMember 형식으로 변환
    const pendingMembers: TeamMember[] = pendingInvitations.map(invitation => ({
      id: invitation.id,
      email: invitation.inviteeEmail || '',
      position: '설계사',
      role: 'member',
      status: 'pending' as const,
      invitedAt: invitation.createdAt?.toISOString().split('T')[0] || '',
      clients: 0,
      conversions: 0,
    }));

    return [...teamMembers, ...pendingMembers];
  } catch (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
}

// 팀 통계 가져오기
export async function getTeamStats(userId: string): Promise<TeamStats> {
  try {
    // 현재 사용자의 팀 ID 가져오기
    const userProfile = await db
      .select({ teamId: profiles.teamId })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    const teamId = userProfile[0]?.teamId;
    if (!teamId) {
      return {
        totalMembers: 0,
        activeMembers: 0,
        pendingInvites: 0,
        totalClients: 0,
      };
    }

    const [activeMembersResult, pendingInvitesResult, totalClientsResult] =
      await Promise.all([
        // 활성 멤버 수
        db
          .select({ count: count() })
          .from(profiles)
          .where(and(eq(profiles.teamId, teamId), eq(profiles.isActive, true))),

        // 대기 중인 초대 수
        db
          .select({ count: count() })
          .from(invitations)
          .innerJoin(profiles, eq(profiles.id, invitations.inviterId))
          .where(
            and(eq(profiles.teamId, teamId), eq(invitations.status, 'pending'))
          ),

        // 팀 전체 클라이언트 수
        db
          .select({ count: count() })
          .from(clients)
          .innerJoin(profiles, eq(profiles.id, clients.agentId))
          .where(eq(profiles.teamId, teamId)),
      ]);

    const activeMembers = activeMembersResult[0]?.count || 0;
    const pendingInvites = pendingInvitesResult[0]?.count || 0;
    const totalClients = totalClientsResult[0]?.count || 0;

    return {
      totalMembers: activeMembers + pendingInvites,
      activeMembers,
      pendingInvites,
      totalClients,
    };
  } catch (error) {
    console.error('Error fetching team stats:', error);
    return {
      totalMembers: 0,
      activeMembers: 0,
      pendingInvites: 0,
      totalClients: 0,
    };
  }
}

// 팀원 초대
export async function inviteTeamMember(
  inviterId: string,
  email: string,
  role: string = 'member',
  message?: string
): Promise<{ success: boolean; invitationCode?: string; error?: string }> {
  try {
    // 이메일 중복 확인 (authUsers 테이블에서)
    const existingUser = await db
      .select({ id: authUsers.id })
      .from(authUsers)
      .where(eq(authUsers.email, email))
      .limit(1);

    if (existingUser[0]) {
      return {
        success: false,
        error: '이미 가입된 이메일입니다.',
      };
    }

    // 기존 초대 확인
    const existingInvitation = await db
      .select({ id: invitations.id })
      .from(invitations)
      .where(
        and(
          eq(invitations.inviteeEmail, email),
          eq(invitations.status, 'pending')
        )
      )
      .limit(1);

    if (existingInvitation[0]) {
      return {
        success: false,
        error: '이미 초대가 발송된 이메일입니다.',
      };
    }

    // 초대 코드 생성 (8자리 랜덤 문자열)
    const invitationCode = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();

    // 만료일 설정 (7일 후)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await db
      .insert(invitations)
      .values({
        code: invitationCode,
        inviterId,
        inviteeEmail: email,
        message: message || `${role} 역할로 팀에 초대합니다.`,
        expiresAt,
      })
      .returning({ id: invitations.id, code: invitations.code });

    return {
      success: true,
      invitationCode: invitation[0]?.code,
    };
  } catch (error) {
    console.error('Error inviting team member:', error);
    return {
      success: false,
      error: '초대 생성에 실패했습니다.',
    };
  }
}

// 초대 재발송
export async function resendInvitation(invitationId: string): Promise<boolean> {
  try {
    // 새로운 만료일 설정 (7일 후)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db
      .update(invitations)
      .set({
        expiresAt,
        status: 'pending',
      })
      .where(eq(invitations.id, invitationId));

    return true;
  } catch (error) {
    console.error('Error resending invitation:', error);
    return false;
  }
}

// 팀원 제거 (초대 취소)
export async function removeTeamMember(memberId: string): Promise<boolean> {
  try {
    // 초대인 경우 초대 취소
    await db
      .update(invitations)
      .set({ status: 'cancelled' })
      .where(eq(invitations.id, memberId));

    // 실제 멤버인 경우 비활성화
    await db
      .update(profiles)
      .set({
        isActive: false,
        teamId: null,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, memberId));

    return true;
  } catch (error) {
    console.error('Error removing team member:', error);
    return false;
  }
}

// 초대 코드로 팀 정보 가져오기
export async function getTeamByInvitationCode(code: string): Promise<{
  team: Team | null;
  invitation: Invitation | null;
  isValid: boolean;
}> {
  try {
    const invitation = await db
      .select()
      .from(invitations)
      .where(and(eq(invitations.code, code), eq(invitations.status, 'pending')))
      .limit(1);

    if (!invitation[0]) {
      return { team: null, invitation: null, isValid: false };
    }

    // 만료 확인
    const now = new Date();
    if (invitation[0].expiresAt && invitation[0].expiresAt < now) {
      return { team: null, invitation: invitation[0], isValid: false };
    }

    // 초대자의 팀 정보 가져오기
    const inviterProfile = await db
      .select({ teamId: profiles.teamId })
      .from(profiles)
      .where(eq(profiles.id, invitation[0].inviterId))
      .limit(1);

    if (!inviterProfile[0]?.teamId) {
      return { team: null, invitation: invitation[0], isValid: false };
    }

    const team = await db
      .select()
      .from(teams)
      .where(eq(teams.id, inviterProfile[0].teamId))
      .limit(1);

    return {
      team: team[0] || null,
      invitation: invitation[0],
      isValid: true,
    };
  } catch (error) {
    console.error('Error getting team by invitation code:', error);
    return { team: null, invitation: null, isValid: false };
  }
}

// 역할 표시명 변환
function getRoleDisplayName(role: string): string {
  switch (role) {
    case 'agent':
      return '설계사';
    case 'team_admin':
      return '팀장';
    case 'system_admin':
      return '관리자';
    default:
      return '설계사';
  }
}
