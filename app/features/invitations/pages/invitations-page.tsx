import type { Route } from './+types/invitations-page';
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
import type { Invitation } from '../types';

// 인증, 통계, 초대장 목록 함수 import (단계적 복구)
import { requireAuth } from '~/lib/auth/middleware';
import {
  getInvitationStats,
  getUserInvitations,
  getInvitedColleagues,
} from '../lib/invitations-data';

// 초대장 페이지 로더 - 모든 데이터를 실제 데이터베이스에서 로딩
export async function loader({ request }: Route.LoaderArgs) {
  console.log('초대장 페이지 로드 시작');

  try {
    // 인증 확인
    const user = await requireAuth(request);
    const userId = user.id;

    // 모든 필요한 데이터를 병렬로 로딩
    const [invitationStats, myInvitations, invitedColleagues] =
      await Promise.all([
        getInvitationStats(userId),
        getUserInvitations(userId),
        getInvitedColleagues(userId),
      ]);

    console.log('초대장 페이지 데이터 로딩 완료');

    const hasData = myInvitations.length > 0 || invitedColleagues.length > 0;

    return {
      myInvitations,
      invitationStats,
      invitedColleagues,
      hasData,
      error: null,
      userId,
    };
  } catch (error) {
    console.error('초대장 페이지 로드 실패:', error);

    const errorMessage =
      error instanceof Error ? error.message : '알 수 없는 오류';

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
      error: `초대장 데이터 로딩 실패: ${errorMessage}`,
      userId: null,
    };
  }
}

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '동료 추천 - SureCRM' },
    {
      name: 'description',
      content: '동료 추천 코드를 관리하고 전문가들을 추천하세요',
    },
  ];
}

// 빈 상태 컴포넌트
function EmptyInvitationsState() {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
        <Users className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">추천 코드가 없습니다</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        동료 추천 코드를 통해 소중한 동료들을 추천하여 함께 성장하세요!
      </p>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
          <Card className="p-4">
            <div className="text-center">
              <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-medium mb-1">전문가 네트워크</h4>
              <p className="text-sm text-muted-foreground">
                동료들과 함께 성장
              </p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-medium mb-1">비즈니스 성장</h4>
              <p className="text-sm text-muted-foreground">
                함께 발전하는 기회
              </p>
            </div>
          </Card>
        </div>
        <Alert className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            관리자에게 문의하여 추천 코드를 요청하실 수 있습니다.
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

  // 추천 링크 복사
  const copyInviteLink = (code: string) => {
    const link = `https://surecrm.com/invite/${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // 에러 상태 처리
  if (error) {
    return (
      <MainLayout title="동료 추천">
        <ErrorState error={error} />
      </MainLayout>
    );
  }

  // 빈 데이터 상태 처리
  if (!hasData) {
    return (
      <MainLayout title="동료 추천">
        <EmptyInvitationsState />
      </MainLayout>
    );
  }

  return (
    <MainLayout title="동료 추천">
      <div className="space-y-6">
        {/* 헤더 */}
        <div>
          <p className="text-muted-foreground">
            소중한 동료들을 SureCRM에 추천하고 함께 성장하세요. 추천 코드를 통해
            전문가 네트워크를 확장하세요.
          </p>
        </div>

        {/* 추천 코드 현황 요약 */}
        <InvitationStatsCards
          availableCount={invitationStats.availableInvitations}
          usedInvitations={usedInvitations}
        />

        {/* 내 추천 코드들 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">내 추천 코드</h3>
            <Badge variant="outline">{myInvitations.length}개 보유</Badge>
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
                <h4 className="font-medium mb-2">추천 코드가 없습니다</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  관리자에게 문의하여 추천 코드를 요청하실 수 있습니다.
                </p>
              </CardContent>
            </Card>
          )}

          {/* 모든 추천 코드를 사용한 경우 */}
          {availableInvitations.length === 0 && usedInvitations.length > 0 && (
            <EmptyInvitations usedCount={usedInvitations.length} />
          )}
        </div>

        {/* 내가 추천한 사람들 */}
        {invitedColleagues.length > 0 ? (
          <InvitedColleagues usedInvitations={invitedColleagues} />
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">추천한 동료들</h3>
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium mb-2">
                  아직 추천한 동료가 없습니다
                </h4>
                <p className="text-sm text-muted-foreground">
                  추천 코드를 공유하여 동료들을 SureCRM에 추천해보세요.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 추천 가이드 */}
        <Card className="border-border/40 bg-muted/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                💡
              </div>
              추천 가이드
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/30">
              <div className="w-2 h-2 rounded-full bg-primary/60 mt-2 flex-shrink-0" />
              <p className="text-muted-foreground">
                추천 코드는 관리자를 통해 발급받을 수 있습니다
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/30">
              <div className="w-2 h-2 rounded-full bg-primary/60 mt-2 flex-shrink-0" />
              <p className="text-muted-foreground">
                추천 코드는 영구적으로 유효하며 만료되지 않습니다
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/30">
              <div className="w-2 h-2 rounded-full bg-primary/60 mt-2 flex-shrink-0" />
              <p className="text-muted-foreground">
                소중한 동료들에게만 추천 코드를 공유하시기 바랍니다
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
