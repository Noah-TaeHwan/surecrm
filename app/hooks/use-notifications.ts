import { useState, useEffect, useCallback } from 'react';
import {
  formatNotificationTime,
  getNotificationTypeIcon,
  type NotificationQueue,
} from '~/features/notifications/lib/notifications-data';

interface UseNotificationsOptions {
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { limit = 5, autoRefresh = true, refreshInterval = 30000 } = options;

  const [notifications, setNotifications] = useState<NotificationQueue[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await fetch(
        `/api/notifications?limit=${limit}&unreadOnly=false`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setError(null);
    } catch (err) {
      console.error('알림 데이터 로드 실패:', err);
      // 에러 발생 시 빈 상태로 설정 (에러 메시지 표시하지 않음)
      setNotifications([]);
      setUnreadCount(0);
      setError(null); // 에러 메시지를 null로 설정하여 "알림이 없습니다" 메시지가 표시되도록 함
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  const markAsRead = async (notificationId: string) => {
    try {
      const formData = new FormData();
      formData.append('intent', 'markAsRead');
      formData.append('notificationId', notificationId);

      const response = await fetch('/api/notifications', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        // 로컬 상태 업데이트
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? {
                  ...notification,
                  readAt: new Date(),
                  status: 'read' as const,
                }
              : notification
          )
        );

        // 읽지 않은 알림 수 감소
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('알림 읽음 처리 실패:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const formData = new FormData();
      formData.append('intent', 'markAllAsRead');

      const response = await fetch('/api/notifications', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        // 로컬 상태 업데이트
        setNotifications((prev) =>
          prev.map((notification) => ({
            ...notification,
            readAt: new Date(),
            status: 'read' as const,
          }))
        );

        setUnreadCount(0);
      }
    } catch (err) {
      console.error('모든 알림 읽음 처리 실패:', err);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // 자동 새로고침
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchNotifications, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
    formatTime: formatNotificationTime,
    getIcon: getNotificationTypeIcon,
  };
}
