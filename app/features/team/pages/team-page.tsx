import type { Route } from '.react-router/types/app/features/team/pages/+types/team-page';
import { MainLayout } from '~/common/layouts/main-layout';

// 컴포넌트 imports
import { TeamStatsCards } from '../components/team-stats-cards';
import { InviteMember } from '../components/invite-member';
import { TeamMemberList } from '../components/team-member-list';

// 타입 imports
import type { TeamMember, TeamStats } from '../components/types';

export function loader({ request }: Route.LoaderArgs) {
  // TODO: 실제 API에서 데이터 가져오기
  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: '김영희',
      email: 'kim@surecrm.com',
      role: 'admin',
      status: 'active',
      joinedAt: '2023-01-15',
      lastSeen: '2024-01-20 14:30',
      clients: 45,
      conversions: 32,
    },
    {
      id: '2',
      name: '박철수',
      email: 'park@surecrm.com',
      role: 'manager',
      status: 'active',
      joinedAt: '2023-03-20',
      lastSeen: '2024-01-20 16:45',
      clients: 38,
      conversions: 28,
    },
    {
      id: '3',
      name: '이민수',
      email: 'lee@surecrm.com',
      role: 'member',
      status: 'active',
      joinedAt: '2023-06-10',
      lastSeen: '2024-01-19 18:20',
      clients: 25,
      conversions: 18,
    },
    {
      id: '4',
      name: '정수연',
      email: 'jung@example.com',
      role: 'member',
      status: 'pending',
      invitedAt: '2024-01-18',
      clients: 0,
      conversions: 0,
    },
  ];

  const teamStats: TeamStats = {
    totalMembers: 4,
    activeMembers: 3,
    pendingInvites: 1,
    totalClients: 108,
  };

  return { teamMembers, teamStats };
}

export function action({ request }: Route.ActionArgs) {
  // TODO: 실제 팀원 초대/관리 로직
  return { success: true };
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
        />
      </div>
    </MainLayout>
  );
}
