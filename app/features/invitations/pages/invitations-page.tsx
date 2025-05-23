import type { Route } from '.react-router/types/app/features/invitations/pages/+types/invitations-page';
import { useState } from 'react';
import { MainLayout } from '~/common/layouts/main-layout';

// 컴포넌트 imports
import { InvitationStatsCards } from '../components/invitation-stats-cards';
import { InvitationCard } from '../components/invitation-card';
import { EmptyInvitations } from '../components/empty-invitations';
import { InvitedColleagues } from '../components/invited-colleagues';

// 타입 imports
import type { Invitation } from '../components/types';

export function loader({ request }: Route.LoaderArgs) {
  // 클럽하우스 스타일: 각 사용자는 2장의 초대장만 보유
  const myInvitations: Invitation[] = [
    {
      id: '1',
      code: 'CLUB-2024-A7X9',
      status: 'available',
      createdAt: '2024-01-10',
    },
    {
      id: '2',
      code: 'CLUB-2024-B2M5',
      status: 'used',
      createdAt: '2024-01-10',
      usedAt: '2024-01-15',
      invitee: {
        id: '1',
        name: '김영희',
        email: 'kim@example.com',
        joinedAt: '2024-01-15',
      },
    },
  ];

  return { myInvitations };
}

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '초대장 관리 - SureCRM' },
    { name: 'description', content: '초대장을 관리하고 동료들을 초대하세요' },
  ];
}

export default function InvitationsPage({ loaderData }: Route.ComponentProps) {
  const { myInvitations } = loaderData;
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const availableInvitations = myInvitations.filter(
    (inv) => inv.status === 'available'
  );
  const usedInvitations = myInvitations.filter((inv) => inv.status === 'used');

  // 초대 링크 복사
  const copyInviteLink = (code: string) => {
    const link = `https://surecrm.com/invite/${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <MainLayout title="초대장 관리">
      <div className="space-y-6">
        {/* 헤더 */}
        <div>
          <p className="text-muted-foreground">
            동료들을 SureCRM에 초대하고 함께 성장하세요. 각 사용자는 2장의
            초대장을 보유합니다.
          </p>
        </div>

        {/* 초대장 현황 요약 */}
        <InvitationStatsCards
          availableCount={availableInvitations.length}
          usedInvitations={usedInvitations}
        />

        {/* 내 초대장들 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">내 초대장</h3>

          <div className="grid gap-4">
            {myInvitations.map((invitation) => (
              <InvitationCard
                key={invitation.id}
                invitation={invitation}
                onCopyLink={copyInviteLink}
                copiedCode={copiedCode}
              />
            ))}
          </div>

          {/* 모든 초대장을 사용한 경우 */}
          {availableInvitations.length === 0 && (
            <EmptyInvitations usedCount={usedInvitations.length} />
          )}
        </div>

        {/* 내가 초대한 사람들 */}
        <InvitedColleagues usedInvitations={usedInvitations} />
      </div>
    </MainLayout>
  );
}
