import type { Route } from '.react-router/types/app/features/invitations/pages/+types/invitations-page';
import { useState } from 'react';
import { MainLayout } from '~/common/layouts/main-layout';
import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import {
  Copy,
  Share2,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Gift,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

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
    // 인증 실패 시 빈 데이터 반환
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
      hasData: false,
      error: '인증이 필요합니다.',
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

    const hasData = myInvitations.length > 0 || invitedColleagues.length > 0;

    return {
      myInvitations,
      invitationStats,
      invitedColleagues,
      hasData,
      error: null,
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
      hasData: false,
      error: '초대장 데이터를 불러오는데 실패했습니다.',
    };
  }
}

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '초대장 관리 - SureCRM' },
    { name: 'description', content: '초대장을 관리하고 동료들을 초대하세요' },
  ];
}

// 빈 상태 컴포넌트
function EmptyInvitationsState() {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
        <Users className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">아직 초대장이 없습니다</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        SureCRM에 가입하시면 자동으로 2장의 초대장이 발급됩니다. 동료들을
        초대하여 함께 성장하세요!
      </p>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <Card className="p-4">
            <div className="text-center">
              <Gift className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-medium mb-1">무료 초대장</h4>
              <p className="text-sm text-muted-foreground">
                가입 시 2장 무료 제공
              </p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-medium mb-1">네트워크 확장</h4>
              <p className="text-sm text-muted-foreground">
                동료들과 함께 성장
              </p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <h4 className="font-medium mb-1">추가 혜택</h4>
              <p className="text-sm text-muted-foreground">
                성공적인 초대 시 보너스
              </p>
            </div>
          </Card>
        </div>
        <Alert className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            초대장은 한정된 수량으로 제공되며, 성공적인 초대 시 추가 초대장을
            받을 수 있습니다.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

// 에러 상태 컴포넌트
function ErrorState({ error }: { error: string }) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <XCircle className="w-12 h-12 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        데이터를 불러올 수 없습니다
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">{error}</p>
      <Button onClick={() => window.location.reload()} variant="outline">
        다시 시도
      </Button>
    </div>
  );
}

export default function InvitationsPage({ loaderData }: Route.ComponentProps) {
  const { myInvitations, invitationStats, invitedColleagues, hasData, error } =
    loaderData;
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

  // 에러 상태 처리
  if (error) {
    return (
      <MainLayout title="초대장 관리">
        <ErrorState error={error} />
      </MainLayout>
    );
  }

  // 빈 데이터 상태 처리
  if (!hasData) {
    return (
      <MainLayout title="초대장 관리">
        <EmptyInvitationsState />
      </MainLayout>
    );
  }

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
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">내 초대장</h3>
            <Badge variant="outline">{myInvitations.length}장 보유</Badge>
          </div>

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
            <Card>
              <CardContent className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium mb-2">초대장이 없습니다</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  성공적인 초대를 통해 추가 초대장을 받을 수 있습니다.
                </p>
                <Button variant="outline" size="sm">
                  초대장 요청하기
                </Button>
              </CardContent>
            </Card>
          )}

          {/* 모든 초대장을 사용한 경우 */}
          {availableInvitations.length === 0 && usedInvitations.length > 0 && (
            <EmptyInvitations usedCount={usedInvitations.length} />
          )}
        </div>

        {/* 내가 초대한 사람들 */}
        {invitedColleagues.length > 0 ? (
          <InvitedColleagues usedInvitations={invitedColleagues} />
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">초대한 동료들</h3>
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium mb-2">
                  아직 초대한 동료가 없습니다
                </h4>
                <p className="text-sm text-muted-foreground">
                  초대장을 공유하여 동료들을 SureCRM에 초대해보세요.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 초대 가이드 */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">💡 초대 팁</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-blue-800">
            <p>• 초대장은 한정된 수량으로 제공됩니다</p>
            <p>• 성공적인 초대 시 추가 초대장을 받을 수 있습니다</p>
            <p>• 초대받은 사람이 활발히 활동할수록 더 많은 혜택을 받습니다</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
