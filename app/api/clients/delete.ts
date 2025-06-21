import { data } from 'react-router';
import type { Route } from './+types/delete';
import { createClient } from '~/lib/core/supabase';
import { db } from '~/lib/core/db';
import { clients } from '~/lib/schema/core';
import { appClientContactHistory } from '~/features/clients/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function action({ request }: Route['ActionArgs']) {
  try {
    // 🔐 인증 확인
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return data(
        { success: false, message: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 📥 FormData에서 데이터 추출
    const formData = await request.formData();
    const clientId = formData.get('clientId') as string;
    const agentId = formData.get('agentId') as string;

    if (!clientId || !agentId) {
      return data(
        {
          success: false,
          message: '필수 정보가 누락되었습니다.',
        },
        { status: 400 }
      );
    }

    // 🔍 권한 확인 - 해당 고객이 현재 사용자의 고객인지 확인
    const clientExists = await db
      .select()
      .from(clients)
      .where(
        and(
          eq(clients.id, clientId),
          eq(clients.agentId, agentId),
          eq(clients.agentId, user.id) // 현재 사용자의 고객인지 확인
        )
      )
      .limit(1);

    if (clientExists.length === 0) {
      return data(
        {
          success: false,
          message: '해당 고객을 찾을 수 없거나 삭제 권한이 없습니다.',
        },
        { status: 404 }
      );
    }

    // 🗑️ 관련 데이터 삭제 (트랜잭션으로 처리)
    await db.transaction(async (tx) => {
      // 1. 고객의 연락 기록 삭제
      await tx
        .delete(appClientContactHistory)
        .where(eq(appClientContactHistory.clientId, clientId));

      // 2. 고객 삭제 (soft delete - isActive를 false로 설정)
      await tx
        .update(clients)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(clients.id, clientId));
    });

    console.log('✅ 고객 삭제 완료:', { clientId, agentId });

    return data({
      success: true,
      message: '고객이 성공적으로 삭제되었습니다.',
      data: { clientId },
    });
  } catch (error) {
    console.error('❌ 고객 삭제 API 에러:', error);

    return data(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : '알 수 없는 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
