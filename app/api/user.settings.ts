/**
 * 🎯 사용자 설정 API 엔드포인트
 * 테마, 언어, 알림 설정 등 사용자 개인 설정 관리
 */

import { requireAuth } from './shared/auth';
import {
  createSuccessResponse,
  methodNotAllowed,
  badRequest,
  parseJSON,
  logAPIRequest,
  logAPIError,
  validateRequiredFields,
} from './shared/utils';
import { db } from '~/lib/core/db';
import { profiles } from '~/lib/schema';
import { eq } from 'drizzle-orm';

// ===== 설정 업데이트 타입 정의 =====
interface ThemeUpdateData {
  action: 'update-theme';
  theme: 'light' | 'dark';
}

interface ProfileUpdateData {
  action: 'update-profile';
  language?: string;
  notifications?: boolean;
  autoSave?: boolean;
}

type SettingsUpdateData = ThemeUpdateData | ProfileUpdateData;

// ===== Action (POST 요청 처리) =====
export async function action({ request }: { request: Request }) {
  // 메소드 검증
  if (request.method !== 'POST') {
    return methodNotAllowed();
  }

  // 인증 확인
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) {
    return authResult;
  }

  // 🔧 수정: 인증된 사용자 ID를 포함하여 로깅
  logAPIRequest(request.method, request.url, authResult.id);

  try {
    // JSON 데이터 파싱
    const body = await parseJSON<SettingsUpdateData>(request);
    if (!body) {
      return badRequest('유효한 JSON 데이터가 필요합니다.');
    }

    const { action, ...data } = body;

    if (!action) {
      return badRequest('action 필드가 필요합니다.');
    }

    switch (action) {
      case 'update-theme': {
        const { theme } = data as ThemeUpdateData;

        // 테마 값 검증
        if (!theme || !['light', 'dark'].includes(theme)) {
          return badRequest(
            '유효하지 않은 테마 값입니다. light 또는 dark만 허용됩니다.',
            {
              allowedValues: ['light', 'dark'],
              receivedValue: theme,
            }
          );
        }

        // 데이터베이스 업데이트
        const updatedProfile = await db
          .update(profiles)
          .set({
            theme,
            updatedAt: new Date(),
          })
          .where(eq(profiles.id, authResult.id))
          .returning();

        if (updatedProfile.length === 0) {
          return badRequest('프로필 업데이트에 실패했습니다.');
        }

        return createSuccessResponse(
          { theme, profile: updatedProfile[0] },
          '테마 설정이 성공적으로 저장되었습니다.'
        );
      }

      case 'update-profile': {
        const { language, notifications, autoSave } = data as ProfileUpdateData;

        // 업데이트할 데이터 준비
        const updateData: Record<string, any> = {
          updatedAt: new Date(),
        };

        if (language !== undefined) {
          updateData.language = language;
        }
        if (notifications !== undefined) {
          updateData.notificationsEnabled = notifications;
        }
        if (autoSave !== undefined) {
          updateData.autoSave = autoSave;
        }

        // 실제 업데이트할 필드가 있는지 확인
        if (Object.keys(updateData).length === 1) {
          // updatedAt만 있는 경우
          return badRequest('업데이트할 설정이 없습니다.');
        }

        // 데이터베이스 업데이트
        const updatedProfile = await db
          .update(profiles)
          .set(updateData)
          .where(eq(profiles.id, authResult.id))
          .returning();

        if (updatedProfile.length === 0) {
          return badRequest('프로필 업데이트에 실패했습니다.');
        }

        return createSuccessResponse(
          {
            profile: updatedProfile[0],
            updatedFields: Object.keys(updateData).filter(
              (key) => key !== 'updatedAt'
            ),
          },
          '설정이 성공적으로 저장되었습니다.'
        );
      }

      default:
        return badRequest(`알 수 없는 action: ${action}`, {
          supportedActions: ['update-theme', 'update-profile'],
        });
    }
  } catch (error) {
    logAPIError(request.method, request.url, error as Error, authResult.id);

    if (error instanceof SyntaxError) {
      return badRequest('잘못된 JSON 형식입니다.');
    }

    return badRequest('설정 저장 중 오류가 발생했습니다.');
  }
}
