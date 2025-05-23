import { Card, CardContent } from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import type { InvitedColleaguesProps } from './types';

export function InvitedColleagues({ usedInvitations }: InvitedColleaguesProps) {
  if (usedInvitations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">내가 초대한 동료들</h3>
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            {usedInvitations.map((invitation) =>
              invitation.invitee ? (
                <div
                  key={invitation.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <Avatar>
                    <AvatarFallback>
                      {invitation.invitee.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{invitation.invitee.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {invitation.invitee.joinedAt} 가입
                    </div>
                  </div>
                  <Badge variant="secondary">활성 사용자</Badge>
                </div>
              ) : null
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
