import type { Route } from './+types/team-page';
import { useState, useEffect } from 'react';
import { Form, useFetcher } from 'react-router';
import { MainLayout } from '~/common/layouts/main-layout';
import { toast } from 'sonner';

// 컴포넌트 imports
import { TeamStatsCards } from '../components/team-stats-cards';
import { InviteMember } from '../components/invite-member';
import { TeamMemberList } from '../components/team-member-list';
import { TeamMemberProfile } from '../components/team-member-profile';

// 타입 imports
import type { TeamMember, TeamStats } from '../types';

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
        const role = formData.get('role') as string;
        const message = formData.get('message') as string;

        const result = await inviteTeamMember(user.id, email, role, message);
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
  const fetcher = useFetcher();

  // actionData로부터 피드백 처리
  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.message);
    } else if (actionData?.success === false) {
      toast.error(actionData.message);
    }
  }, [actionData]);

  // 팀원 초대 - Form action 활용
  const handleInvite = (email: string, role: string, message?: string) => {
    const formData = new FormData();
    formData.append('intent', 'invite');
    formData.append('email', email);
    formData.append('role', role);
    if (message) formData.append('message', message);

    fetcher.submit(formData, { method: 'post' });
  };

  // 팀원 제거 - Form action 활용
  const handleRemoveMember = (memberId: string) => {
    if (confirm('정말로 이 팀원을 제거하시겠습니까?')) {
      const formData = new FormData();
      formData.append('intent', 'remove');
      formData.append('memberId', memberId);

      fetcher.submit(formData, { method: 'post' });
    }
  };

  // 초대 재발송 - Form action 활용
  const handleResendInvite = (memberId: string) => {
    const formData = new FormData();
    formData.append('intent', 'resend');
    formData.append('invitationId', memberId);

    fetcher.submit(formData, { method: 'post' });
  };

  // 팀원 정보 보기
  const handleViewMember = (member: TeamMember) => {
    setSelectedMember(member);
  };

  // 로딩 상태 표시
  const isLoading =
    fetcher.state === 'submitting' || fetcher.state === 'loading';

  return (
    <MainLayout title="팀 관리">
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">팀 관리</h1>
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

        {/* 로딩 오버레이 */}
        {isLoading && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">처리 중...</p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
