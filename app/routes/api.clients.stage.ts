import { updateClientStage } from '~/api/shared/clients';
import { requireAuth } from '~/lib/auth/middleware';

export async function action({ request }: { request: Request }) {
  try {
    console.log('🔄 [API Route] 고객 단계 변경 요청 수신');

    // 인증 확인
    const user = await requireAuth(request);

    // URL에서 clientId 파라미터 추출
    const url = new URL(request.url);
    const clientId = url.searchParams.get('clientId');

    // 요청 데이터 파싱
    const formData = await request.formData();
    const targetStageId = formData.get('targetStageId') as string;

    console.log('📋 [API Route] 단계 변경 요청 데이터:', {
      clientId,
      targetStageId,
      userId: user.id,
    });

    if (!clientId || !targetStageId) {
      return Response.json(
        {
          success: false,
          message: '필수 매개변수가 누락되었습니다.',
        },
        { status: 400 }
      );
    }

    console.log('🚀 [API Route] 고객 단계 변경 실행 시작');

    // 고객 단계 변경
    const result = await updateClientStage(clientId, targetStageId, user.id);

    console.log('✅ [API Route] 고객 단계 변경 완료:', result);

    return Response.json(result);
  } catch (error) {
    console.error('❌ [API Route] 고객 단계 변경 오류:', error);

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : '고객 단계 변경 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
