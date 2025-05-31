import { Tabs, TabsList, TabsTrigger } from '~/common/components/ui/tabs';
import type { NotificationTabsProps } from '../types';

export function NotificationTabs({
  activeTab,
  onTabChange,
  totalCount,
  unreadCount,
}: NotificationTabsProps) {
  const readCount = totalCount - unreadCount;

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-muted">
        <TabsTrigger value="all" className="data-[state=active]:bg-background">
          전체 ({totalCount})
        </TabsTrigger>
        <TabsTrigger
          value="unread"
          className="data-[state=active]:bg-background"
        >
          읽지 않음 ({unreadCount})
          {unreadCount > 0 && (
            <div className="ml-1 w-2 h-2 bg-primary rounded-full" />
          )}
        </TabsTrigger>
        <TabsTrigger value="read" className="data-[state=active]:bg-background">
          읽음 ({readCount})
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
