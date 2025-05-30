import type { Route } from '.react-router/types/app/features/team/pages/+types/team-page';
import { useState } from 'react';
import { MainLayout } from '~/common/layouts/main-layout';

// 컴포넌트 imports
import { TeamStatsCards } from '../components/team-stats-cards';
import { InviteMember } from '../components/invite-member';
import { TeamMemberList } from '../components/team-member-list';
import { TeamMemberProfile } from '../components/team-member-profile';

// 타입 imports
import type { TeamMember, TeamStats } from '../components/types';

// 실제 데이터베이스 함수들 import
import {
  getTeamMembers,
  getTeamStats,
  inviteTeamMember,
  removeTeamMember,
  resendInvitation,
} from '../lib/supabase-team-data';
import { requireAuth } from '~/lib/auth/middleware';

export async function loader({ request }: Route.LoaderArgs) {
  try {
    // 인증 확인
    const user = await requireAuth(request);

    // 실제 팀 데이터 조회
    const [teamMembersData, teamStats] = await Promise.all([
      getTeamMembers(user.id),
      getTeamStats(user.id),
    ]);

    // TeamMember 타입에 맞게 변환
    const teamMembers: TeamMember[] = teamMembersData.map((member) => ({
      id: member.id,
      name: member.name || '이름 없음',
      email: member.email || '',
      role: member.role as 'admin' | 'manager' | 'member',
      status: member.status,
      joinedAt: member.joinedAt,
      invitedAt: member.invitedAt,
      lastSeen: member.lastSeen,
      clients: member.clients,
      conversions: member.conversions,
      phone: member.phone,
      company: member.company,
      position: member.position,
    }));

    return { teamMembers, teamStats };
  } catch (error) {
    console.error('팀 데이터 로딩 실패:', error);

    // 에러 시 기본값 반환
    return {
      teamMembers: [],
      teamStats: {
        totalMembers: 0,
        activeMembers: 0,
        pendingInvites: 0,
        totalClients: 0,
      },
    };
  }
}

export async function action({ request }: Route.ActionArgs) {
  try {
    const user = await requireAuth(request);
    const formData = await request.formData();
    const intent = formData.get('intent');

    switch (intent) {
      case 'invite': {
        const email = formData.get('email') as string;
        const message = formData.get('message') as string;

        const result = await inviteTeamMember(user.id, email, message);
        if (result.success) {
          return { success: true, message: '팀원 초대가 발송되었습니다.' };
        } else {
          return {
            success: false,
            message: result.error || '초대 발송에 실패했습니다.',
          };
        }
      }

      case 'remove': {
        const memberId = formData.get('memberId') as string;
        const success = await removeTeamMember(memberId);
        if (success) {
          return { success: true, message: '팀원이 제거되었습니다.' };
        } else {
          return { success: false, message: '팀원 제거에 실패했습니다.' };
        }
      }

      case 'resend': {
        const invitationId = formData.get('invitationId') as string;
        const success = await resendInvitation(invitationId);
        if (success) {
          return { success: true, message: '초대장이 재발송되었습니다.' };
        } else {
          return { success: false, message: '초대장 재발송에 실패했습니다.' };
        }
      }

      default:
        return { success: false, message: '알 수 없는 요청입니다.' };
    }
  } catch (error) {
    console.error('팀 액션 오류:', error);
    return { success: false, message: '요청 처리에 실패했습니다.' };
  }
}

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '팀 관리 - SureCRM' },
    { name: 'description', content: '팀원을 관리하고 팀 설정을 변경합니다' },
  ];
}

export default function TeamPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { teamMembers, teamStats } = loaderData;
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // 팀원 초대
  const handleInvite = (email: string, role: string, message?: string) => {
    console.log('팀원 초대:', { email, role, message });
    // TODO: API 호출
  };

  // 팀원 제거
  const handleRemoveMember = (memberId: string) => {
    console.log('팀원 제거:', memberId);
    // TODO: API 호출
  };

  // 초대 재발송
  const handleResendInvite = (memberId: string) => {
    console.log('초대 재발송:', memberId);
    // TODO: API 호출
  };

  // 팀원 정보 보기
  const handleViewMember = (member: TeamMember) => {
    setSelectedMember(member);
  };

  return (
    <MainLayout title="팀 관리">
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">팀원을 초대하고 관리하세요</p>
          </div>
          <InviteMember onInvite={handleInvite} />
        </div>

        {/* 팀 통계 */}
        <TeamStatsCards stats={teamStats} />

        {/* 팀원 목록 */}
        <TeamMemberList
          members={teamMembers}
          onRemoveMember={handleRemoveMember}
          onResendInvite={handleResendInvite}
          onViewMember={handleViewMember}
        />

        {/* 팀원 프로필 다이얼로그 */}
        {selectedMember && (
          <TeamMemberProfile
            member={selectedMember}
            isOpen={!!selectedMember}
            onClose={() => setSelectedMember(null)}
          />
        )}
      </div>
    </MainLayout>
  );
}
