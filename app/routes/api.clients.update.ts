import { updateClient } from '~/api/shared/clients';
import { requireAuth } from '~/lib/auth/middleware';

export async function action({ request }: { request: Request }) {
  try {
    console.log('✏️ [API Route] 고객 수정 요청 수신');

    // 인증 확인
    const user = await requireAuth(request);

    // URL에서 clientId 파라미터 추출
    const url = new URL(request.url);
    const clientId = url.searchParams.get('clientId');

    // 요청 데이터 파싱
    const formData = await request.formData();
    const updateData = Object.fromEntries(formData);

    console.log('📋 [API Route] 수정 요청 데이터:', {
      clientId,
      userId: user.id,
      updateFields: Object.keys(updateData),
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

    console.log('🚀 [API Route] 고객 수정 실행 시작');

    // 고객 정보 수정
    const result = await updateClient(clientId, updateData, user.id);

    console.log('✅ [API Route] 고객 수정 완료:', result);

    return Response.json(result);
  } catch (error) {
    console.error('❌ [API Route] 고객 수정 오류:', error);

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : '고객 수정 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
