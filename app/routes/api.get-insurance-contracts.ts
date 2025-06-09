import { createClient } from '~/lib/core/supabase';

export async function loader({ request }: { request: Request }) {
  try {
    console.log('📋 [API Route] 보험계약 목록 조회 요청 수신');

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

    const url = new URL(request.url);
    const clientId = url.searchParams.get('clientId');

    if (!clientId) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '고객 ID가 필요합니다.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { getClientInsuranceContracts } = await import(
      '~/api/shared/insurance-contracts'
    );

    const result = await getClientInsuranceContracts(clientId, user.id);

    console.log('🎯 [API Route] 보험계약 목록 조회 결과:', {
      success: result.success,
      contractCount: result.data?.length || 0,
    });

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ [API Route] 보험계약 목록 조회 실패:', error);

    return new Response(
      JSON.stringify({
        success: false,
        message: '보험계약 목록 조회에 실패했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
