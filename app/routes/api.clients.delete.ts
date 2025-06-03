import { deleteClient } from '~/api/shared/clients';
import { requireAuth } from '~/lib/auth/middleware';

export async function action({ request }: { request: Request }) {
  try {
    console.log('🗑️ [API Route] 고객 삭제 요청 수신');

    // 인증 확인
    const user = await requireAuth(request);

    // 요청 데이터 파싱
    const formData = await request.formData();
    const clientId = formData.get('clientId') as string;
    const agentId = formData.get('agentId') as string;

    console.log('📋 [API Route] 요청 데이터:', {
      clientId,
      agentId,
      userId: user.id,
    });

    if (!clientId || !agentId) {
      return Response.json(
        {
          success: false,
          message: '필수 매개변수가 누락되었습니다.',
        },
        { status: 400 }
      );
    }

    // 권한 확인 (본인의 고객만 삭제 가능)
    if (user.id !== agentId) {
      return Response.json(
        {
          success: false,
          message: '권한이 없습니다.',
        },
        { status: 403 }
      );
    }

    console.log('🚀 [API Route] 고객 삭제 실행 시작');

    // 클라이언트 삭제 실행
    const result = await deleteClient(clientId, agentId);

    console.log('✅ [API Route] 고객 삭제 완료:', result);

    return Response.json(result);
  } catch (error) {
    console.error('❌ [API Route] 고객 삭제 오류:', error);

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : '고객 삭제 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
