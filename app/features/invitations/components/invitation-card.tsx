import { useTranslation } from 'react-i18next';
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
import type { InvitationCardProps } from '../types';
import { getInvitationLink } from '~/lib/utils/url';

export function InvitationCard({
  invitation,
  onCopyLink,
  copiedCode,
}: InvitationCardProps) {
  const { t } = useTranslation('invitations');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              {t('invitationCard.code')} #{invitation.id}
            </CardTitle>
            <CardDescription>
              {t('invitationCard.createdAt')}: {invitation.createdAt}
              {invitation.usedAt &&
                ` · ${t('invitationCard.usedAt')}: ${invitation.usedAt}`}
            </CardDescription>
          </div>
          <Badge
            variant={invitation.status === 'available' ? 'outline' : 'default'}
            className="gap-1"
          >
            {invitation.status === 'available' ? (
              <>
                <TimerIcon className="h-3 w-3" />
                {t('invitationCard.status.available')}
              </>
            ) : (
              <>
                <CheckCircledIcon className="h-3 w-3" />
                {t('invitationCard.status.used')}
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {invitation.status === 'used' && invitation.invitee ? (
          <div className="flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-lg">
            <Avatar>
              <AvatarFallback className="bg-muted">
                {invitation.invitee.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium">
                {t('invitationCard.joinedMessage', {
                  name: invitation.invitee.name,
                })}
              </div>
              <div className="text-sm text-muted-foreground">
                {t('invitationCard.joinedComplete', {
                  date: invitation.invitee.joinedAt,
                })}
              </div>
            </div>
            <Badge variant="secondary">{t('invitationCard.success')}</Badge>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('invitationCard.actions.copyLink')}
              </label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={getInvitationLink(invitation.code)}
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
            <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border">
              💡 <strong>{t('guide.title')}:</strong>{' '}
              {t('invitationCard.guideText')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
