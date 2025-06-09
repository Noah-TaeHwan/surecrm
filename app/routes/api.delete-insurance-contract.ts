import { createClient } from '~/lib/core/supabase';

export async function action({ request }: { request: Request }) {
  try {
    console.log('🗑️ [API Route] 보험계약 삭제 요청 수신');

    // 🔐 인증 확인
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: '인증이 필요합니다.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 📥 FormData에서 데이터 추출
    const formData = await request.formData();
    const contractId = formData.get('contractId') as string;

    if (!contractId) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '계약 ID가 필요합니다.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { deleteInsuranceContract } = await import(
      '~/api/shared/insurance-contracts'
    );

    const result = await deleteInsuranceContract(contractId, user.id);

    console.log('🎯 [API Route] 보험계약 삭제 결과:', result);

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ [API Route] 보험계약 삭제 실패:', error);

    return new Response(
      JSON.stringify({
        success: false,
        message: '보험계약 삭제에 실패했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
