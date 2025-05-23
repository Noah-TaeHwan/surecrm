import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import { CopyIcon, CheckCircledIcon, TimerIcon } from '@radix-ui/react-icons';
import type { InvitationCardProps } from './types';

export function InvitationCard({
  invitation,
  onCopyLink,
  copiedCode,
}: InvitationCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">초대장 #{invitation.id}</CardTitle>
            <CardDescription>
              생성일: {invitation.createdAt}
              {invitation.usedAt && ` · 사용일: ${invitation.usedAt}`}
            </CardDescription>
          </div>
          <Badge
            variant={invitation.status === 'available' ? 'outline' : 'default'}
            className="gap-1"
          >
            {invitation.status === 'available' ? (
              <>
                <TimerIcon className="h-3 w-3" />
                사용 가능
              </>
            ) : (
              <>
                <CheckCircledIcon className="h-3 w-3" />
                사용됨
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {invitation.status === 'used' && invitation.invitee ? (
          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <Avatar>
              <AvatarFallback className="bg-green-100">
                {invitation.invitee.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium text-green-900">
                {invitation.invitee.name}님이 가입했습니다
              </div>
              <div className="text-sm text-green-700">
                {invitation.invitee.joinedAt} 가입
              </div>
            </div>
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 border-green-200"
            >
              성공
            </Badge>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                초대 링크
              </label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={`https://surecrm.com/invite/${invitation.code}`}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCopyLink(invitation.code)}
                >
                  {copiedCode === invitation.code ? (
                    <CheckCircledIcon className="h-4 w-4" />
                  ) : (
                    <CopyIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-200">
              💡 <strong>팁:</strong> 링크를 복사해서 카카오톡, 이메일, 문자로
              동료에게 전송하세요. 보험설계사 동료들에게 SureCRM의 소개 네트워크
              기능을 소개해보세요!
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
