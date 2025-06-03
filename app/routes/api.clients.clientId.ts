import { getClientById } from '~/api/shared/clients';
import { requireAuth } from '~/lib/auth/middleware';

export async function loader({
  request,
  params,
}: {
  request: Request;
  params: { clientId: string };
}) {
  try {
    console.log('🔍 [API Route] 고객 상세 조회 요청 수신');

    // 인증 확인
    const user = await requireAuth(request);
    const { clientId } = params;

    console.log('📋 [API Route] 요청 데이터:', {
      clientId,
      userId: user.id,
    });

    if (!clientId) {
      return Response.json(
        {
          success: false,
          message: '고객 ID가 누락되었습니다.',
        },
        { status: 400 }
      );
    }

    console.log('🚀 [API Route] 고객 조회 실행 시작');

    // 고객 정보 조회
    const client = await getClientById(clientId, user.id);

    if (!client) {
      return Response.json(
        {
          success: false,
          message: '고객을 찾을 수 없습니다.',
        },
        { status: 404 }
      );
    }

    console.log('✅ [API Route] 고객 조회 완료:', {
      clientName: client.fullName,
    });

    return Response.json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error('❌ [API Route] 고객 조회 오류:', error);

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : '고객 조회 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
