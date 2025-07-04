import { Form } from 'react-router';
import { Button } from '~/common/components/ui/button';
import { Card, CardContent } from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Check, Trash2, Clock, AlertCircle, Info } from 'lucide-react';
import { cn } from '~/lib/utils';
import {
  formatNotificationTime,
  getNotificationTypeIcon,
} from '../lib/notifications-utils';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';
import type { NotificationCardProps, NotificationPriority } from '../types';

export function NotificationCard({
  notification,
  showActions = true,
  className,
}: NotificationCardProps) {
  const { t } = useHydrationSafeTranslation('notifications');

  // 알림 우선순위별 아이콘
  const getPriorityIcon = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'normal':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'low':
        return <Info className="h-4 w-4 text-gray-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card
      className={cn(
        'border-border bg-card hover:bg-accent/50 transition-colors',
        !notification.readAt && 'border-l-4 border-l-primary bg-primary/5',
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* 아이콘 */}
          <div className="flex-shrink-0 mt-1">
            <div className="text-2xl">
              {getNotificationTypeIcon(notification.type)}
            </div>
          </div>

          {/* 내용 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3
                  className={cn(
                    'font-medium text-foreground',
                    !notification.readAt && 'font-semibold'
                  )}
                >
                  {notification.title}
                </h3>
                {getPriorityIcon(notification.priority)}
                {!notification.readAt && (
                  <div className="w-2 h-2 bg-primary rounded-full" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    notification.status === 'read' ? 'secondary' : 'default'
                  }
                  className="text-xs"
                >
                  {notification.status === 'read' ? '읽음' : '읽지 않음'}
                </Badge>
              </div>
            </div>

            <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
              {notification.message}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatNotificationTime(new Date(notification.createdAt), t)}
                </span>
                <span>
                  {notification.channel === 'in_app'
                    ? '앱 내'
                    : notification.channel}
                </span>
              </div>

              {showActions && (
                <div className="flex items-center gap-2">
                  {!notification.readAt && (
                    <Form method="post" className="inline">
                      <input type="hidden" name="intent" value="markAsRead" />
                      <input
                        type="hidden"
                        name="notificationId"
                        value={notification.id}
                      />
                      <Button type="submit" variant="ghost" size="sm">
                        <Check className="h-4 w-4" />
                      </Button>
                    </Form>
                  )}
                  <Form method="post" className="inline">
                    <input type="hidden" name="intent" value="delete" />
                    <input
                      type="hidden"
                      name="notificationId"
                      value={notification.id}
                    />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Form>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
