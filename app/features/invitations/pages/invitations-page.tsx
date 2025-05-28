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

// 데이터 함수 imports
import {
  getUserInvitations,
  getInvitationStats,
  getInvitedColleagues,
  createInvitation,
} from '../lib/invitations-data';
import { requireAuth } from '../lib/auth-utils';

export async function loader({ request }: Route.LoaderArgs) {
  // 인증 확인
  const userId = await requireAuth(request);

  try {
    // 모든 데이터를 병렬로 조회
    const [myInvitations, invitationStats, invitedColleagues] =
      await Promise.all([
        getUserInvitations(userId),
        getInvitationStats(userId),
        getInvitedColleagues(userId),
      ]);

    return {
      myInvitations,
      invitationStats,
      invitedColleagues,
    };
  } catch (error) {
    console.error('Invitations 페이지 로더 오류:', error);

    // 에러 시 기본값 반환
    return {
      myInvitations: [],
      invitationStats: {
        totalSent: 0,
        totalUsed: 0,
        totalExpired: 0,
        availableInvitations: 0,
        conversionRate: 0,
        successfulInvitations: 0,
      },
      invitedColleagues: [],
    };
  }
}

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '초대장 관리 - SureCRM' },
    { name: 'description', content: '초대장을 관리하고 동료들을 초대하세요' },
  ];
}

export default function InvitationsPage({ loaderData }: Route.ComponentProps) {
  const { myInvitations, invitationStats, invitedColleagues } = loaderData;
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
            동료들을 SureCRM에 초대하고 함께 성장하세요. 초대장을 통해
            네트워크를 확장하세요.
          </p>
        </div>

        {/* 초대장 현황 요약 */}
        <InvitationStatsCards
          availableCount={invitationStats.availableInvitations}
          usedInvitations={usedInvitations}
        />

        {/* 내 초대장들 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">내 초대장</h3>

          {myInvitations.length > 0 ? (
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              아직 초대장이 없습니다.
            </div>
          )}

          {/* 모든 초대장을 사용한 경우 */}
          {availableInvitations.length === 0 && usedInvitations.length > 0 && (
            <EmptyInvitations usedCount={usedInvitations.length} />
          )}
        </div>

        {/* 내가 초대한 사람들 */}
        {invitedColleagues.length > 0 && (
          <InvitedColleagues usedInvitations={invitedColleagues} />
        )}
      </div>
    </MainLayout>
  );
}
