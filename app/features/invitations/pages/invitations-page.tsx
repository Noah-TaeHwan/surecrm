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
  console.log('Invitations loader 시작');

  // 인증 확인
  let userId: string;
  try {
    userId = await requireAuth(request);
  } catch (error) {
    console.error('인증 오류:', error);
    // 인증 실패 시 더미 데이터 반환 (테스트용)
    const dummyInvitations = [
      {
        id: '1',
        code: 'CLUB-2024-ABC1',
        status: 'available' as const,
        createdAt: '2024-01-15',
        usedAt: undefined,
        invitee: undefined,
      },
      {
        id: '2',
        code: 'CLUB-2024-ABC2',
        status: 'available' as const,
        createdAt: '2024-01-14',
        usedAt: undefined,
        invitee: undefined,
      },
      {
        id: '3',
        code: 'CLUB-2024-USED',
        status: 'used' as const,
        createdAt: '2024-01-10',
        usedAt: '2024-01-20',
        invitee: {
          id: 'user-2',
          name: '김철수',
          email: 'kim@example.com',
          joinedAt: '2024-01-20',
        },
      },
    ];

    return {
      myInvitations: dummyInvitations,
      invitationStats: {
        totalSent: 3,
        totalUsed: 1,
        totalExpired: 0,
        availableInvitations: 2,
        conversionRate: 33,
        successfulInvitations: 1,
      },
      invitedColleagues: [
        {
          id: '3',
          code: 'CLUB-2024-USED',
          status: 'used' as const,
          createdAt: '2024-01-10',
          usedAt: '2024-01-20',
          invitee: {
            id: 'user-2',
            name: '김철수',
            email: 'kim@example.com',
            joinedAt: '2024-01-20',
          },
        },
      ],
    };
  }

  try {
    // 실제 데이터베이스에서 데이터 조회
    const [myInvitations, invitationStats, invitedColleagues] =
      await Promise.all([
        getUserInvitations(userId),
        getInvitationStats(userId),
        getInvitedColleagues(userId),
      ]);

    console.log('Invitations loader 완료');

    return {
      myInvitations,
      invitationStats,
      invitedColleagues,
    };
  } catch (error) {
    console.error('초대장 데이터 조회 실패:', error);

    // 에러 시 빈 데이터 반환
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
