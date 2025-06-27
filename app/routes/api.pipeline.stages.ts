import { requireAuth } from '~/lib/auth/middleware.server';

export async function loader({ request }: { request: Request }) {
  try {
    console.log('📋 [API Route] 파이프라인 단계 조회 요청 수신');

    // 인증 확인
    const user = await requireAuth(request);

    console.log('📋 [API Route] 요청 데이터:', {
      userId: user.id,
    });

    console.log('🚀 [API Route] 파이프라인 단계 조회 실행 시작');

    // 파이프라인 단계 조회
    const { getPipelineStages } = await import(
      '~/features/pipeline/lib/supabase-pipeline-data'
    );
    const stages = await getPipelineStages(user.id);

    console.log('✅ [API Route] 파이프라인 단계 조회 완료:', {
      stageCount: stages?.length || 0,
    });

    return Response.json({
      success: true,
      data: stages || [],
    });
  } catch (error) {
    console.error('❌ [API Route] 파이프라인 단계 조회 오류:', error);

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : '파이프라인 단계 조회 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
