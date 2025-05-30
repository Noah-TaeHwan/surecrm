import { getCurrentUser } from '~/lib/auth/core';
import { createServerClient } from '../lib/core/supabase';
import { db } from '../lib/core/db';
import { profiles } from '../lib/schema';
import { eq } from 'drizzle-orm';

interface ActionArgs {
  request: Request;
}

export async function action({ request }: ActionArgs) {
  try {
    // 현재 사용자 확인
    const user = await getCurrentUser(request);
    if (!user) {
      return Response.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action: actionType, ...data } = body;

    switch (actionType) {
      case 'update-theme': {
        const { theme } = data;

        if (!theme || !['light', 'dark'].includes(theme)) {
          return Response.json(
            { success: false, error: '유효하지 않은 테마 값입니다.' },
            { status: 400 }
          );
        }

        // 데이터베이스에 테마 설정 저장
        await db
          .update(profiles)
          .set({
            theme,
            updatedAt: new Date(),
          })
          .where(eq(profiles.id, user.id));

        return Response.json({
          success: true,
          message: '테마 설정이 저장되었습니다.',
          theme,
        });
      }

      case 'update-profile': {
        const { language, notifications, autoSave } = data;

        const updateData: any = {
          updatedAt: new Date(),
        };

        if (language !== undefined) updateData.language = language;
        if (notifications !== undefined)
          updateData.notificationsEnabled = notifications;
        if (autoSave !== undefined) updateData.autoSave = autoSave;

        await db
          .update(profiles)
          .set(updateData)
          .where(eq(profiles.id, user.id));

        return Response.json({
          success: true,
          message: '설정이 저장되었습니다.',
        });
      }

      default:
        return Response.json(
          { success: false, error: '알 수 없는 액션입니다.' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('설정 업데이트 중 오류:', error);
    return Response.json(
      { success: false, error: '설정 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
