/**
 * 🎯 알림 API 로직
 * 사용자 알림 조회, 읽음 처리, 관리 기능
 */

import { requireAuth } from '~/api/shared/auth';
import {
  createSuccessResponse,
  methodNotAllowed,
  badRequest,
  parseFormData,
  getQueryParams,
  logAPIRequest,
  logAPIError,
  validateRequiredFields,
} from '~/api/shared/utils';
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from './notifications-data';
import type { NotificationAPIResponse } from '../types';

interface PaginationParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// ===== Loader (GET 요청 처리) =====
export async function handleNotificationsLoader({
  request,
}: {
  request: Request;
}) {
  // 인증 확인
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) {
    return authResult;
  }

  // 🔧 수정: 인증된 사용자 ID를 포함하여 로깅
  logAPIRequest('GET', request.url, authResult.id);

  try {
    // 쿼리 파라미터 파싱
    const queryParams = getQueryParams(request.url);
    const limit = Math.min(parseInt(queryParams.get('limit') || '10'), 50); // 최대 50개
    const page = Math.max(parseInt(queryParams.get('page') || '1'), 1);
    const unreadOnly = queryParams.get('unreadOnly') === 'true';
    const sortBy = queryParams.get('sortBy') || 'createdAt';
    const sortOrder =
      (queryParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    const paginationParams: PaginationParams = {
      page,
      limit,
      sortBy,
      sortOrder,
    };

    // 알림 조회
    const offset = (page - 1) * limit;
    const [notifications, unreadCount] = await Promise.all([
      getNotifications(authResult.id, {
        limit,
        offset,
        unreadOnly,
      }),
      getUnreadNotificationCount(authResult.id),
    ]);

    // 페이지네이션 정보 계산
    const totalPages = Math.ceil((notifications?.length || 0) / limit);

    const response: NotificationAPIResponse = {
      notifications: notifications || [],
      unreadCount: unreadCount || 0,
      pagination: {
        page,
        limit,
        total: notifications?.length || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    return createSuccessResponse(response, '알림을 성공적으로 조회했습니다.');
  } catch (error) {
    logAPIError('GET', request.url, error as Error, authResult.id);

    const fallbackResponse: NotificationAPIResponse = {
      notifications: [],
      unreadCount: 0,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };

    return createSuccessResponse(
      fallbackResponse,
      '알림 조회 중 오류가 발생했지만 빈 결과를 반환합니다.'
    );
  }
}

// ===== Action (POST/PUT/DELETE 요청 처리) =====
export async function handleNotificationsAction({
  request,
}: {
  request: Request;
}) {
  // 인증 확인
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) {
    return authResult;
  }

  // 🔧 수정: 인증된 사용자 ID를 포함하여 로깅
  logAPIRequest(request.method, request.url, authResult.id);

  // 메소드 검증
  if (request.method !== 'POST') {
    return methodNotAllowed();
  }

  try {
    // FormData 파싱
    const formData = await parseFormData(request);
    if (!formData) {
      return badRequest('잘못된 요청 형식입니다.');
    }

    const intent = formData.get('intent') as string;

    if (!intent) {
      return badRequest('intent 파라미터가 필요합니다.');
    }

    switch (intent) {
      case 'markAsRead': {
        const notificationId = formData.get('notificationId') as string;

        // 필수 필드 검증
        const validation = validateRequiredFields({ notificationId }, [
          'notificationId',
        ]);

        if (!validation.isValid) {
          return badRequest('알림 ID가 필요합니다.', {
            missingFields: validation.missingFields,
          });
        }

        const result = await markNotificationAsRead(
          notificationId,
          authResult.id
        );

        return createSuccessResponse(
          { notificationId, result },
          '알림을 읽음으로 표시했습니다.'
        );
      }

      case 'markAllAsRead': {
        const result = await markAllNotificationsAsRead(authResult.id);

        return createSuccessResponse(
          { result },
          '모든 알림을 읽음으로 표시했습니다.'
        );
      }

      default:
        return badRequest(`알 수 없는 intent: ${intent}`);
    }
  } catch (error) {
    logAPIError(request.method, request.url, error as Error, authResult.id);
    return badRequest('알림 처리 중 오류가 발생했습니다.');
  }
}
