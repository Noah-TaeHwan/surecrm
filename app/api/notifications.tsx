import { getCurrentUser } from '~/lib/auth/core';
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '~/features/notifications/lib/notifications-data';

export async function loader({ request }: { request: Request }) {
  const user = await getCurrentUser(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '5');
  const unreadOnly = url.searchParams.get('unreadOnly') === 'true';

  try {
    const notifications = await getNotifications(user.id, {
      limit,
      unreadOnly,
    });

    const unreadCount = await getUnreadNotificationCount(user.id);

    return Response.json({
      notifications: notifications || [],
      unreadCount: unreadCount || 0,
    });
  } catch (error) {
    console.error('알림 API 에러:', error);
    return Response.json({
      notifications: [],
      unreadCount: 0,
      error: 'Failed to fetch notifications',
    });
  }
}

export async function action({ request }: { request: Request }) {
  const user = await getCurrentUser(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  try {
    if (intent === 'markAsRead') {
      const notificationId = formData.get('notificationId') as string;
      const result = await markNotificationAsRead(notificationId, user.id);
      return Response.json({ success: true, result });
    }

    if (intent === 'markAllAsRead') {
      const result = await markAllNotificationsAsRead(user.id);
      return Response.json({ success: true, result });
    }

    return Response.json({ error: 'Invalid intent' }, { status: 400 });
  } catch (error) {
    console.error('알림 액션 에러:', error);
    return Response.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}
