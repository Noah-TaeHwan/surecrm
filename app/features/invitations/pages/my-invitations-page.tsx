import { useState, useEffect } from 'react';
import { type MetaFunction } from 'react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import { Copy, Share2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { getUserInvitations } from '~/lib/invitation-utils';
import { requireAuth } from '~/lib/auth-middleware';

interface LoaderArgs {
  request: Request;
}

interface ComponentProps {
  loaderData: {
    user: any;
    invitations: any[];
  };
}

// 로더 함수 - 인증 필요
export async function loader({ request }: LoaderArgs) {
  const user = await requireAuth(request);

  // 사용자의 초대장 목록 조회 (클라이언트 사이드에서 처리)
  return {
    user,
    invitations: [], // 클라이언트 사이드에서 로드
  };
}

// 메타 정보
export const meta: MetaFunction = () => {
  return [
    { title: '내 초대장 | SureCRM' },
    { name: 'description', content: '내가 보유한 초대장을 관리하세요' },
  ];
};

export default function MyInvitationsPage({ loaderData }: ComponentProps) {
  const { user } = loaderData;
  const [invitations, setInvitations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 초대장 목록 로드
  useEffect(() => {
    async function loadInvitations() {
      try {
        const result = await getUserInvitations(user.id);
        if (result.success) {
          setInvitations(result.invitations || []);
        } else {
          setError(result.error || '초대장을 불러오는데 실패했습니다.');
        }
      } catch (err) {
        setError('초대장을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }

    loadInvitations();
  }, [user.id]);

  // 초대 코드 복사
  const copyInviteCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      // TODO: 토스트 알림 추가
      alert('초대 코드가 복사되었습니다!');
    } catch (err) {
      alert('복사에 실패했습니다.');
    }
  };

  // 초대 링크 공유
  const shareInviteLink = async (code: string) => {
    const inviteUrl = `${window.location.origin}/auth/signup?code=${code}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      alert('초대 링크가 복사되었습니다!');
    } catch (err) {
      alert('링크 복사에 실패했습니다.');
    }
  };

  // 상태별 배지 색상
  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();

    if (status === 'used') {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          사용됨
        </Badge>
      );
    } else if (status === 'expired' || isExpired) {
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          만료됨
        </Badge>
      );
    } else {
      return (
        <Badge variant="default">
          <Clock className="w-3 h-3 mr-1" />
          대기 중
        </Badge>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">내 초대장</h1>
        <p className="text-muted-foreground mt-2">
          보유한 초대장을 관리하고 친구들을 초대하세요
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 초대장 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">전체 초대장</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invitations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">사용 가능</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {
                invitations.filter(
                  (inv) =>
                    inv.status === 'pending' &&
                    new Date(inv.expires_at) > new Date()
                ).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">사용됨</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {invitations.filter((inv) => inv.status === 'used').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 초대장 목록 */}
      <div className="space-y-4">
        {invitations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">아직 초대장이 없습니다.</p>
              <p className="text-sm text-muted-foreground mt-2">
                회원가입 시 자동으로 2장의 초대장이 발급됩니다.
              </p>
            </CardContent>
          </Card>
        ) : (
          invitations.map((invitation) => (
            <Card key={invitation.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <code className="text-lg font-mono bg-muted px-3 py-1 rounded">
                        {invitation.code}
                      </code>
                      {getStatusBadge(invitation.status, invitation.expires_at)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      생성일:{' '}
                      {new Date(invitation.created_at).toLocaleDateString()}
                      {' • '}
                      만료일:{' '}
                      {new Date(invitation.expires_at).toLocaleDateString()}
                    </div>
                    {invitation.used_at && (
                      <div className="text-sm text-green-600">
                        사용일:{' '}
                        {new Date(invitation.used_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {invitation.status === 'pending' &&
                    new Date(invitation.expires_at) > new Date() && (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyInviteCode(invitation.code)}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          코드 복사
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => shareInviteLink(invitation.code)}
                        >
                          <Share2 className="w-4 h-4 mr-1" />
                          링크 공유
                        </Button>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
