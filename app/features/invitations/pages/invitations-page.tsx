import type { Route } from './+types/invitations-page';
import { useState } from 'react';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';
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

// 통계, 초대장 목록 함수 import
import {
  getInvitationStats,
  getUserInvitations,
  getInvitedColleagues,
} from '../lib/invitations-data';
import { getInvitationLink } from '~/lib/utils/url';

// 초대장 페이지 로더 - 모든 데이터를 실제 데이터베이스에서 로딩
export async function loader({ request }: Route.LoaderArgs) {
  console.log('Loading invitations page');

  try {
    // 구독 상태 확인 (트라이얼 만료 시 billing 페이지로 리다이렉트)
    const { requireActiveSubscription } = await import(
      '~/lib/auth/subscription-middleware.server'
    );
    const { user } = await requireActiveSubscription(request);
    const userId = user.id;

    // 모든 필요한 데이터를 병렬로 로딩
    const [invitationStats, myInvitations, invitedColleagues] =
      await Promise.all([
        getInvitationStats(userId),
        getUserInvitations(userId),
        getInvitedColleagues(userId),
      ]);

    console.log('Invitations page data loaded successfully');

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
    console.error('Failed to load invitations page:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

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
      error: `Failed to load invitation data: ${errorMessage}`,
      userId: null,
    };
  }
}

export function meta({ data, params }: Route.MetaArgs) {
  // 다국어 지원을 위해 기본값 사용, 실제 다국어는 페이지 내에서 처리
  return [
    { title: 'Colleague Referrals - SureCRM' },
    {
      name: 'description',
      content: 'Manage colleague referral codes and recommend professionals',
    },
  ];
}

// 🎨 반응형 빈 상태 컴포넌트
function EmptyInvitationsState() {
  const { t } = useHydrationSafeTranslation('invitations');

  return (
    <div className="text-center py-8 px-4">
      <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-full flex items-center justify-center mb-4 sm:mb-6">
        <Users className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold mb-2">
        {t('emptyState.title')}
      </h3>
      <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
        {t('emptyState.description')}
      </p>
      <div className="space-y-4">
        {/* 🎯 모바일 최적화: 1열 → 2열 적응형 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-xl mx-auto">
          <Card className="p-3 sm:p-4 hover:shadow-md transition-shadow">
            <div className="text-center">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-medium mb-1 text-sm sm:text-base">
                {t('emptyState.features.network.title')}
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t('emptyState.features.network.description')}
              </p>
            </div>
          </Card>
          <Card className="p-3 sm:p-4 hover:shadow-md transition-shadow">
            <div className="text-center">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-medium mb-1 text-sm sm:text-base">
                {t('emptyState.features.growth.title')}
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t('emptyState.features.growth.description')}
              </p>
            </div>
          </Card>
        </div>
        {/* 🎯 모바일 최적화: Alert 너비 조정 */}
        <Alert className="max-w-lg mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {t('emptyState.contactAdmin')}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

// 🎨 반응형 에러 상태 컴포넌트
function ErrorState({ error }: { error: string }) {
  const { t } = useHydrationSafeTranslation('invitations');

  return (
    <div className="text-center py-8 px-4">
      <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-red-50 rounded-full flex items-center justify-center mb-4 sm:mb-6">
        <XCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold mb-2">
        {t('error.title')}
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
        {t('error.retry')}
      </Button>
    </div>
  );
}

export default function InvitationsPage({ loaderData }: Route.ComponentProps) {
  const { myInvitations, invitationStats, invitedColleagues, hasData, error } =
    loaderData;
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const { t } = useHydrationSafeTranslation('invitations');

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
      <MainLayout title={t('title')}>
        <ErrorState error={error} />
      </MainLayout>
    );
  }

  // 빈 데이터 상태 처리
  if (!hasData) {
    return (
      <MainLayout title={t('title')}>
        <EmptyInvitationsState />
      </MainLayout>
    );
  }

  return (
    <MainLayout title={t('title')}>
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
        {/* 🎯 모바일 최적화: 헤더 */}
        <div className="space-y-2">
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {t('description')}
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
            <h3 className="text-lg sm:text-xl font-medium">
              {t('myInvitations.title')}
            </h3>
            <Badge variant="outline" className="text-xs sm:text-sm px-2 py-1">
              {t('myInvitations.count', { count: myInvitations.length })}
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
                <h4 className="font-medium mb-2 text-sm sm:text-base">
                  {t('myInvitations.empty.title')}
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                  {t('myInvitations.empty.description')}
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
            <h3 className="text-lg sm:text-xl font-medium">
              {t('invitedColleagues.title')}
            </h3>
            <Card>
              <CardContent className="text-center py-6 sm:py-8 px-4">
                <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                <h4 className="font-medium mb-2 text-sm sm:text-base">
                  {t('invitedColleagues.empty.title')}
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t('invitedColleagues.empty.description')}
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
                    <span className="text-base sm:text-lg">
                      {t('guide.title')}
                    </span>
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
                    {t('guide.items.issuing')}
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/30">
                  <div className="w-2 h-2 rounded-full bg-primary/60 mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground leading-relaxed">
                    {t('guide.items.permanent')}
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/30">
                  <div className="w-2 h-2 rounded-full bg-primary/60 mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground leading-relaxed">
                    {t('guide.items.shareCarefully')}
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
