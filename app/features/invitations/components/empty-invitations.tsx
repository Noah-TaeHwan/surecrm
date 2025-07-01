import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';
import { Card, CardContent } from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { CheckCircledIcon, PersonIcon } from '@radix-ui/react-icons';

interface EmptyInvitationsProps {
  usedCount: number;
}

export function EmptyInvitations({ usedCount }: EmptyInvitationsProps) {
  const { t } = useHydrationSafeTranslation('invitations');

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <CheckCircledIcon className="h-12 w-12 text-green-500 mb-4" />
        <div className="text-center">
          <h3 className="font-medium mb-2">
            {t('myInvitations.allUsed.title')} 🎉
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('myInvitations.allUsed.description')}
          </p>
          <Badge variant="outline" className="gap-1">
            <PersonIcon className="h-3 w-3" />
            {t('myInvitations.allUsed.usedCount', { count: usedCount })}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
