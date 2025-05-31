/**
 * 🎯 알림 API 엔드포인트
 * features/notifications/lib/notifications-api.ts의 로직을 사용
 */

import {
  handleNotificationsLoader,
  handleNotificationsAction,
} from '~/features/notifications/lib/notifications-api';

// ===== Loader (GET 요청 처리) =====
export async function loader({ request }: { request: Request }) {
  return handleNotificationsLoader({ request });
}

// ===== Action (POST/PUT/DELETE 요청 처리) =====
export async function action({ request }: { request: Request }) {
  return handleNotificationsAction({ request });
}
