import type { Route } from './+types/team-join-page';
import { useState, useEffect } from 'react';
import { Link, Form, useFetcher } from 'react-router';
import { AuthLayout } from '~/common/layouts/auth-layout';
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
import { Separator } from '~/common/components/ui/separator';
import {
  CheckCircledIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  PersonIcon,
  EnvelopeClosedIcon,
} from '@radix-ui/react-icons';
import { getCurrentUser } from '~/lib/auth/core';
import { getTeamByInvitationCode } from '../lib/supabase-team-data';
import { db } from '~/lib/core/db';
import { profiles, invitations } from '../lib/schema';
import { eq, and } from 'drizzle-orm';
import { createUserSession } from '~/lib/auth/session';
import { toast } from 'sonner';

// 팀 합류 상태 타입
type JoinStatus =
  | 'loading'
  | 'valid'
  | 'invalid'
  | 'expired'
  | 'used'
  | 'error';

export async function loader({ request, params }: Route.LoaderArgs) {
  try {
    const code = params.code;
    if (!code) {
      return {
        status: 'error' as JoinStatus,
        error: '초대 코드가 없습니다.',
      };
    }

    // 초대 코드 검증 및 팀 정보 조회
    const invitationData = await getTeamByInvitationCode(code);

    if (
      !invitationData.isValid ||
      !invitationData.team ||
      !invitationData.invitation
    ) {
      // 초대가 무효한 경우의 세부 분석
      if (invitationData.invitation) {
        const now = new Date();
        if (
          invitationData.invitation.expiresAt &&
          invitationData.invitation.expiresAt < now
        ) {
          return {
            status: 'expired' as JoinStatus,
            error: '만료된 초대 코드입니다.',
            invitation: invitationData.invitation,
          };
        }
        if (invitationData.invitation.status === 'used') {
          return {
            status: 'used' as JoinStatus,
            error: '이미 사용된 초대 코드입니다.',
            invitation: invitationData.invitation,
          };
        }
      }

      return {
        status: 'invalid' as JoinStatus,
        error: '유효하지 않은 초대 코드입니다.',
      };
    }

    // 현재 사용자 정보 조회 (로그인 상태 확인)
    const currentUser = await getCurrentUser(request);

    // 초대자 정보 조회
    const inviterProfile = await db
      .select({
        id: profiles.id,
        fullName: profiles.fullName,
      })
      .from(profiles)
      .where(eq(profiles.id, invitationData.invitation.inviterId))
      .limit(1);

    return {
      status: 'valid' as JoinStatus,
      team: invitationData.team,
      invitation: invitationData.invitation,
      inviter: inviterProfile[0] || null,
      currentUser,
      code,
    };
  } catch (error) {
    console.error('팀 합류 페이지 로더 오류:', error);
    return {
      status: 'error' as JoinStatus,
      error: '초대 정보를 불러오는 중 오류가 발생했습니다.',
    };
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  try {
    const code = params.code;
    if (!code) {
      return { success: false, error: '초대 코드가 없습니다.' };
    }

    const formData = await request.formData();
    const intent = formData.get('intent');

    if (intent === 'join') {
      // 현재 사용자 확인
      const currentUser = await getCurrentUser(request);
      if (!currentUser) {
        return { success: false, error: '로그인이 필요합니다.' };
      }

      // 초대 정보 재검증
      const invitationData = await getTeamByInvitationCode(code);
      if (
        !invitationData.isValid ||
        !invitationData.team ||
        !invitationData.invitation
      ) {
        return { success: false, error: '유효하지 않은 초대입니다.' };
      }

      // 사용자 프로필 업데이트 (팀 합류)
      await db
        .update(profiles)
        .set({
          teamId: invitationData.team.id,
        })
        .where(eq(profiles.id, currentUser.id));

      // 초대 상태를 '사용됨'으로 업데이트
      await db
        .update(invitations)
        .set({
          status: 'used',
        })
        .where(eq(invitations.id, invitationData.invitation.id));

      return {
        success: true,
        message: `${invitationData.team.name} 팀에 성공적으로 합류했습니다!`,
        redirectTo: '/team',
      };
    }

    return { success: false, error: '잘못된 요청입니다.' };
  } catch (error) {
    console.error('팀 합류 액션 오류:', error);
    return { success: false, error: '팀 합류 처리 중 오류가 발생했습니다.' };
  }
}

export function meta({ data, params }: Route.MetaArgs) {
  const teamName = data?.team?.name || '팀';
  return [
    { title: `${teamName} 팀 합류 - SureCRM` },
    {
      name: 'description',
      content: `${teamName} 팀 초대를 수락하고 합류하세요`,
    },
  ];
}

export default function TeamJoinPage({
  loaderData,
  actionData,
  params,
}: Route.ComponentProps) {
  const fetcher = useFetcher();
  const [isJoining, setIsJoining] = useState(false);

  // actionData 피드백 처리
  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.message);
      if (actionData.redirectTo) {
        // 성공 시 팀 페이지로 리다이렉트
        window.location.href = actionData.redirectTo;
      }
    } else if (actionData?.success === false) {
      toast.error(actionData.error);
      setIsJoining(false);
    }
  }, [actionData]);

  // 팀 합류 처리
  const handleJoinTeam = () => {
    if (!loaderData.currentUser) {
      // 비로그인 사용자는 로그인 페이지로
      window.location.href = `/auth/login?redirect=${encodeURIComponent(
        window.location.pathname
      )}`;
      return;
    }

    setIsJoining(true);
    const formData = new FormData();
    formData.append('intent', 'join');

    fetcher.submit(formData, { method: 'post' });
  };

  // 로딩 상태
  if (loaderData.status === 'loading') {
    return (
      <AuthLayout title="팀 합류" showLogo={false}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">초대 정보를 확인하는 중...</p>
        </div>
      </AuthLayout>
    );
  }

  // 에러 상태들
  if (loaderData.status !== 'valid') {
    const getErrorIcon = () => {
      switch (loaderData.status) {
        case 'expired':
          return <ClockIcon className="h-12 w-12 text-orange-500" />;
        case 'used':
          return <CheckCircledIcon className="h-12 w-12 text-green-500" />;
        default:
          return <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />;
      }
    };

    const getErrorTitle = () => {
      switch (loaderData.status) {
        case 'expired':
          return '만료된 초대';
        case 'used':
          return '이미 사용된 초대';
        case 'invalid':
          return '유효하지 않은 초대';
        default:
          return '초대 오류';
      }
    };

    const getErrorMessage = () => {
      switch (loaderData.status) {
        case 'expired':
          return '이 초대는 만료되었습니다. 팀 관리자에게 새로운 초대를 요청하세요.';
        case 'used':
          return '이 초대는 이미 사용되었습니다. 이미 팀에 가입되어 있거나 다른 사용자가 사용했습니다.';
        case 'invalid':
          return '유효하지 않은 초대 코드입니다. URL을 다시 확인해주세요.';
        default:
          return loaderData.error || '알 수 없는 오류가 발생했습니다.';
      }
    };

    return (
      <AuthLayout title="팀 합류" showLogo={false}>
        <div className="text-center py-8">
          <div className="flex justify-center mb-6">{getErrorIcon()}</div>

          <h2 className="text-xl font-semibold mb-3">{getErrorTitle()}</h2>
          <p className="text-muted-foreground mb-6">{getErrorMessage()}</p>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/dashboard">대시보드로 돌아가기</Link>
            </Button>
            {loaderData.status === 'expired' && (
              <Button variant="outline" asChild className="w-full">
                <Link to="/team">팀 관리 페이지</Link>
              </Button>
            )}
          </div>
        </div>
      </AuthLayout>
    );
  }

  // 유효한 초대 - 팀 정보 표시
  const { team, invitation, inviter, currentUser } = loaderData;

  // 안전성 체크
  if (!team || !invitation) {
    return (
      <AuthLayout title="팀 합류" showLogo={false}>
        <div className="text-center py-8">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-3">오류</h2>
          <p className="text-muted-foreground mb-6">
            팀 정보를 불러올 수 없습니다.
          </p>
          <Button asChild className="w-full">
            <Link to="/dashboard">대시보드로 돌아가기</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="팀 합류" showLogo={false}>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="text-center">
          <PersonIcon className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">팀 초대를 받았습니다</h2>
          <p className="text-sm text-muted-foreground">
            아래 팀에 초대되었습니다. 합류하시겠습니까?
          </p>
        </div>

        {/* 팀 정보 카드 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PersonIcon className="h-5 w-5" />
              {team.name}
            </CardTitle>
            {team.description && (
              <CardDescription>{team.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 초대자 정보 */}
            <div>
              <div className="text-sm font-medium mb-1">초대자</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <PersonIcon className="h-4 w-4" />
                {inviter?.fullName || '알 수 없음'}
              </div>
            </div>

            {/* 초대 메시지 */}
            {invitation.message && (
              <div>
                <div className="text-sm font-medium mb-1">메시지</div>
                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  {invitation.message}
                </div>
              </div>
            )}

            {/* 초대 정보 */}
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">초대일</div>
                <div className="font-medium">
                  {invitation.createdAt
                    ? new Date(invitation.createdAt).toLocaleDateString('ko-KR')
                    : '-'}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">만료일</div>
                <div className="font-medium">
                  {invitation.expiresAt
                    ? new Date(invitation.expiresAt).toLocaleDateString('ko-KR')
                    : '-'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 현재 사용자 상태에 따른 액션 */}
        {currentUser ? (
          // 로그인된 사용자
          <div className="space-y-4">
            {currentUser.teamId && currentUser.teamId !== team.id && (
              <Alert>
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertDescription>
                  현재 다른 팀에 소속되어 있습니다. 새 팀에 합류하면 기존 팀에서
                  자동으로 탈퇴됩니다.
                </AlertDescription>
              </Alert>
            )}

            {currentUser.teamId === team.id ? (
              <Alert>
                <CheckCircledIcon className="h-4 w-4" />
                <AlertDescription>이미 이 팀의 멤버입니다.</AlertDescription>
              </Alert>
            ) : (
              <Button
                onClick={handleJoinTeam}
                disabled={isJoining}
                className="w-full"
              >
                {isJoining ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    팀에 합류하는 중...
                  </>
                ) : (
                  `${team.name} 팀에 합류하기`
                )}
              </Button>
            )}

            <Button variant="outline" asChild className="w-full">
              <Link to="/dashboard">대시보드로 돌아가기</Link>
            </Button>
          </div>
        ) : (
          // 비로그인 사용자
          <div className="space-y-4">
            <Alert>
              <EnvelopeClosedIcon className="h-4 w-4" />
              <AlertDescription>
                팀에 합류하려면 먼저 로그인해야 합니다.
              </AlertDescription>
            </Alert>

            <Button asChild className="w-full">
              <Link
                to={`/auth/login?redirect=${encodeURIComponent(
                  window.location.pathname
                )}`}
              >
                로그인하고 팀 합류하기
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full">
              <Link to={`/auth/signup?invitation=${params.code}`}>
                회원가입하고 팀 합류하기
              </Link>
            </Button>
          </div>
        )}

        {/* 초대 코드 정보 */}
        <div className="text-center">
          <div className="text-xs text-muted-foreground">
            초대 코드:{' '}
            <code className="font-mono bg-muted px-1 py-0.5 rounded">
              {params.code}
            </code>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
