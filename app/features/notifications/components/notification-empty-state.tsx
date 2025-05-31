import { Card, CardContent } from '~/common/components/ui/card';
import { Bell, Search, Filter } from 'lucide-react';
import type { NotificationEmptyStateProps } from '../types';

export function NotificationEmptyState({
  type,
  searchQuery,
  hasFilters,
}: NotificationEmptyStateProps) {
  const getEmptyStateContent = () => {
    switch (type) {
      case 'no-notifications':
        return {
          icon: (
            <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          ),
          title: '알림이 없습니다',
          description: '새로운 알림이 도착하면 여기에 표시됩니다',
        };

      case 'no-unread':
        return {
          icon: (
            <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          ),
          title: '읽지 않은 알림이 없습니다',
          description: '모든 알림을 확인하셨습니다! 👍',
        };

      case 'no-read':
        return {
          icon: (
            <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          ),
          title: '읽은 알림이 없습니다',
          description: '아직 읽은 알림이 없습니다',
        };

      case 'no-search-results':
        return {
          icon: hasFilters ? (
            <Filter className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          ) : (
            <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          ),
          title: '검색 결과가 없습니다',
          description: hasFilters
            ? '다른 필터 조건을 시도해보세요'
            : `"${searchQuery}"와 일치하는 알림이 없습니다`,
        };

      default:
        return {
          icon: (
            <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          ),
          title: '알림이 없습니다',
          description: '새로운 알림이 도착하면 여기에 표시됩니다',
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
