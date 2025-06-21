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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/common/components/ui/collapsible';

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
import { getInvitationLink } from '~/lib/utils/url';

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

// 🎨 반응형 빈 상태 컴포넌트
function EmptyInvitationsState() {
  return (
    <div className="text-center py-8 px-4">
      <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-full flex items-center justify-center mb-4 sm:mb-6">
        <Users className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold mb-2">추천 코드가 없습니다</h3>
      <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
        동료 추천 코드를 통해 소중한 동료들을 추천하여 함께 성장하세요!
      </p>
      <div className="space-y-4">
        {/* 🎯 모바일 최적화: 1열 → 2열 적응형 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-xl mx-auto">
          <Card className="p-3 sm:p-4 hover:shadow-md transition-shadow">
            <div className="text-center">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-medium mb-1 text-sm sm:text-base">전문가 네트워크</h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                동료들과 함께 성장
              </p>
            </div>
          </Card>
          <Card className="p-3 sm:p-4 hover:shadow-md transition-shadow">
            <div className="text-center">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-medium mb-1 text-sm sm:text-base">비즈니스 성장</h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                함께 발전하는 기회
              </p>
            </div>
          </Card>
        </div>
        {/* 🎯 모바일 최적화: Alert 너비 조정 */}
        <Alert className="max-w-lg mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            관리자에게 문의하여 추천 코드를 요청하실 수 있습니다.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

// 🎨 반응형 에러 상태 컴포넌트
function ErrorState({ error }: { error: string }) {
  return (
    <div className="text-center py-8 px-4">
      <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-red-50 rounded-full flex items-center justify-center mb-4 sm:mb-6">
        <XCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold mb-2">
        데이터를 불러올 수 없습니다
      </h3>
      <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto">
        {error}
      </p>
      {/* 🎯 터치 최적화: 버튼 크기 증가 */}
      <Button 
        onClick={() => window.location.reload()} 
        variant="outline"
        size="lg"
        className="min-h-[44px]"
      >
        다시 시도
      </Button>
    </div>
  );
}

export default function InvitationsPage({ loaderData }: Route.ComponentProps) {
  const { myInvitations, invitationStats, invitedColleagues, hasData, error } =
    loaderData;
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const availableInvitations = myInvitations.filter(
    (inv: Invitation) => inv.status === 'available'
  );
  const usedInvitations = myInvitations.filter(
    (inv: Invitation) => inv.status === 'used'
  );

  // 추천 링크 복사
  const copyInviteLink = (code: string) => {
    const link = getInvitationLink(code);
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
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
        {/* 🎯 모바일 최적화: 헤더 */}
        <div className="space-y-2">
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            소중한 동료들을 SureCRM에 추천하고 함께 성장하세요. 추천 코드를 통해
            전문가 네트워크를 확장하세요.
          </p>
        </div>

        {/* 🎯 모바일 최적화: 추천 코드 현황 요약 (기존 컴포넌트 사용) */}
        <InvitationStatsCards
          availableCount={invitationStats.availableInvitations}
          usedInvitations={usedInvitations}
        />

        {/* 🎯 모바일 최적화: 내 추천 코드들 */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-medium">내 추천 코드</h3>
            <Badge variant="outline" className="text-xs sm:text-sm px-2 py-1">
              {myInvitations.length}개 보유
            </Badge>
          </div>

          {myInvitations.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {myInvitations.map((invitation: Invitation) => (
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
              <CardContent className="text-center py-6 sm:py-8 px-4">
                <Users className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                <h4 className="font-medium mb-2 text-sm sm:text-base">추천 코드가 없습니다</h4>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4">
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

        {/* 🎯 모바일 최적화: 내가 추천한 사람들 */}
        {invitedColleagues.length > 0 ? (
          <InvitedColleagues usedInvitations={invitedColleagues} />
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-medium">추천한 동료들</h3>
            <Card>
              <CardContent className="text-center py-6 sm:py-8 px-4">
                <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                <h4 className="font-medium mb-2 text-sm sm:text-base">
                  아직 추천한 동료가 없습니다
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  추천 코드를 공유하여 동료들을 SureCRM에 추천해보세요.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 🎯 모바일 최적화: 접기/펼치기 가능한 추천 가이드 */}
        <Collapsible open={isGuideOpen} onOpenChange={setIsGuideOpen}>
          <Card className="border-border/40 bg-muted/20 backdrop-blur-sm">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
                <CardTitle className="text-foreground flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      💡
                    </div>
                    <span className="text-base sm:text-lg">추천 가이드</span>
                  </div>
                  {isGuideOpen ? (
                    <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-3 text-sm pt-0">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/30">
                  <div className="w-2 h-2 rounded-full bg-primary/60 mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground leading-relaxed">
                    추천 코드는 관리자를 통해 발급받을 수 있습니다
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/30">
                  <div className="w-2 h-2 rounded-full bg-primary/60 mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground leading-relaxed">
                    추천 코드는 영구적으로 유효하며 만료되지 않습니다
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/30">
                  <div className="w-2 h-2 rounded-full bg-primary/60 mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground leading-relaxed">
                    소중한 동료들에게만 추천 코드를 공유하시기 바랍니다
                  </p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    </MainLayout>
  );
}
