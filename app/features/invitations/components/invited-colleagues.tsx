import { Card, CardContent } from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import type { InvitedColleaguesProps } from '../types';

export function InvitedColleagues({ usedInvitations }: InvitedColleaguesProps) {
  if (usedInvitations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">내가 추천한 동료들</h3>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {usedInvitations.map((invitation, index) =>
              invitation.invitee ? (
                <div key={invitation.id}>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {invitation.invitee.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold truncate">
                          {invitation.invitee.name}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          프리미엄
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {invitation.invitee.joinedAt} 가입 · 추천 코드 #
                        {invitation.id}
                      </p>
                    </div>
                  </div>
                  {index < usedInvitations.length - 1 && (
                    <div className="mt-4 border-b border-border"></div>
                  )}
                </div>
              ) : null
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
