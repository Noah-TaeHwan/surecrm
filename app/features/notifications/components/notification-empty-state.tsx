import { Card, CardContent } from '~/common/components/ui/card';
import { Bell, Search, Filter } from 'lucide-react';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';
import type { NotificationEmptyStateProps } from '../types';

export function NotificationEmptyState({
  type,
  searchQuery,
  hasFilters,
}: NotificationEmptyStateProps) {
  const { t } = useHydrationSafeTranslation('notifications');

  const getEmptyStateContent = () => {
    switch (type) {
      case 'no-notifications':
        return {
          icon: (
            <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          ),
          title: t('notifications:empty.noNotifications.title'),
          description: t('notifications:empty.noNotifications.description'),
        };

      case 'no-unread':
        return {
          icon: (
            <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          ),
          title: t('notifications:empty.noUnread.title'),
          description: t('notifications:empty.noUnread.description'),
        };

      case 'no-read':
        return {
          icon: (
            <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          ),
          title: t('notifications:empty.noRead.title'),
          description: t('notifications:empty.noRead.description'),
        };

      case 'no-search-results':
        return {
          icon: hasFilters ? (
            <Filter className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          ) : (
            <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          ),
          title: t('notifications:empty.noSearchResults.title'),
          description: hasFilters
            ? t('notifications:empty.noSearchResults.descriptionWithFilters')
            : t('notifications:empty.noSearchResults.descriptionWithQuery', {
                query: searchQuery || '',
              }),
        };

      default:
        return {
          icon: (
            <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          ),
          title: t('notifications:empty.noNotifications.title'),
          description: t('notifications:empty.noNotifications.description'),
        };
    }
  };

  const { icon, title, description } = getEmptyStateContent();

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-12 text-center">
        {icon}
        <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
