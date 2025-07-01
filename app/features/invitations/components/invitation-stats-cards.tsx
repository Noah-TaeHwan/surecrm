import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { TimerIcon, PersonIcon } from '@radix-ui/react-icons';
import type { InvitationStatsProps } from '../types';

export function InvitationStatsCards({
  availableCount,
  usedInvitations,
}: InvitationStatsProps) {
  const { t } = useHydrationSafeTranslation('invitations');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('stats.availableTitle')}
          </CardTitle>
          <TimerIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">
            {t('stats.availableCount', { count: availableCount })}
          </div>
          <p className="text-xs text-muted-foreground">
            {availableCount > 0
              ? t('stats.availableDescription')
              : t('stats.allUsedDescription')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('stats.successTitle')}
          </CardTitle>
          <PersonIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">
            {t('stats.successCount', { count: usedInvitations.length })}
          </div>
          <p className="text-xs text-muted-foreground">
            {usedInvitations.length > 0
              ? t('stats.recentJoined', {
                  name: usedInvitations[usedInvitations.length - 1]?.invitee
                    ?.name,
                })
              : t('stats.noColleaguesDescription')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
