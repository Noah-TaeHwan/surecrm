import { Tabs, TabsList, TabsTrigger } from '~/common/components/ui/tabs';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';
import type { NotificationTabsProps } from '../types';

export function NotificationTabs({
  activeTab,
  onTabChange,
  totalCount,
  unreadCount,
}: NotificationTabsProps) {
  const { t } = useHydrationSafeTranslation('notifications');
  const readCount = totalCount - unreadCount;

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-muted">
        <TabsTrigger value="all" className="data-[state=active]:bg-background">
          {t('notifications:tabs.all', { count: totalCount })}
        </TabsTrigger>
        <TabsTrigger
          value="unread"
          className="data-[state=active]:bg-background"
        >
          {t('notifications:tabs.unread', { count: unreadCount })}
          {unreadCount > 0 && (
            <div className="ml-1 w-2 h-2 bg-primary rounded-full" />
          )}
        </TabsTrigger>
        <TabsTrigger value="read" className="data-[state=active]:bg-background">
          {t('notifications:tabs.read', { count: readCount })}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
