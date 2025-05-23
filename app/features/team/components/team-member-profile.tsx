import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/common/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import { Badge } from '~/common/components/ui/badge';
import { Separator } from '~/common/components/ui/separator';
import {
  PersonIcon,
  CalendarIcon,
  EnvelopeClosedIcon,
  MobileIcon,
} from '@radix-ui/react-icons';
import type { TeamMemberProfileProps } from './types';

export function TeamMemberProfile({
  member,
  isOpen,
  onClose,
}: TeamMemberProfileProps) {
  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: '관리자', variant: 'destructive' as const },
      manager: { label: '매니저', variant: 'default' as const },
      member: { label: '멤버', variant: 'secondary' as const },
    };

    const config =
      roleConfig[role as keyof typeof roleConfig] || roleConfig.member;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: '활성', variant: 'default' as const },
      pending: { label: '대기 중', variant: 'outline' as const },
      inactive: { label: '비활성', variant: 'secondary' as const },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.inactive;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>팀원 정보</DialogTitle>
          <DialogDescription>
            팀원의 기본 정보와 활동 현황을 확인하세요
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardContent className="pt-6">
            {/* 프로필 사진 및 기본 정보 */}
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">
                  {member.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <div className="flex items-center gap-2">
                  {getRoleBadge(member.role)}
                  {getStatusBadge(member.status)}
                </div>
              </div>
            </div>

            <Separator className="mb-6" />

            {/* 연락처 정보 */}
            <div className="space-y-4 mb-6">
              <h4 className="font-medium text-sm text-muted-foreground">
                연락처 정보
              </h4>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <EnvelopeClosedIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{member.email}</span>
                </div>

                {member.phone && (
                  <div className="flex items-center gap-3">
                    <MobileIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{member.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 소속 정보 */}
            {(member.company || member.position) && (
              <>
                <Separator className="mb-6" />
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    소속 정보
                  </h4>

                  <div className="space-y-3">
                    {member.company && (
                      <div className="flex items-center gap-3">
                        <PersonIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm">회사</div>
                          <div className="text-sm font-medium">
                            {member.company}
                          </div>
                        </div>
                      </div>
                    )}

                    {member.position && (
                      <div className="flex items-center gap-3">
                        <PersonIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm">직책</div>
                          <div className="text-sm font-medium">
                            {member.position}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* 활동 정보 */}
            <Separator className="mb-6" />
            <div className="space-y-4 mb-6">
              <h4 className="font-medium text-sm text-muted-foreground">
                활동 현황
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{member.clients}</div>
                  <div className="text-xs text-muted-foreground">고객 수</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{member.conversions}</div>
                  <div className="text-xs text-muted-foreground">계약 수</div>
                </div>
              </div>
            </div>

            {/* 가입/마지막 접속 정보 */}
            <Separator className="mb-6" />
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                가입 정보
              </h4>

              {member.joinedAt && (
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm">가입일</div>
                    <div className="text-sm font-medium">{member.joinedAt}</div>
                  </div>
                </div>
              )}

              {member.invitedAt && member.status === 'pending' && (
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm">초대일</div>
                    <div className="text-sm font-medium">
                      {member.invitedAt}
                    </div>
                  </div>
                </div>
              )}

              {member.lastSeen && member.status === 'active' && (
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm">마지막 접속</div>
                    <div className="text-sm font-medium">{member.lastSeen}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
