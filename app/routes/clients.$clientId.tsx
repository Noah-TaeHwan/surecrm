import type { Route } from './+types/clients.$clientId';

// React Router v7 동적 라우트: /clients/:clientId
export async function loader({ request, params }: Route.LoaderArgs) {
  const { clientId } = params;

  console.log('🚨🚨🚨 고객 상세 페이지 loader 함수 호출됨! 🚨🚨🚨');
  console.log('🔍 고객 상세 페이지 loader 시작:', {
    clientId,
    url: request.url,
    method: request.method,
  });

  if (!clientId) {
    console.error('❌ 클라이언트 ID가 없음');
    throw new Response('고객 ID가 필요합니다.', { status: 400 });
  }

  try {
    // 🔥 구독 상태 확인 (트라이얼 만료 시 billing 페이지로 리다이렉트)
    const { requireActiveSubscription } = await import(
      '~/lib/auth/subscription-middleware.server'
    );
    const { user } = await requireActiveSubscription(request);

    // 🎯 실제 로그인된 보험설계사 정보 가져오기
    const agentId = user.id;

    console.log('👤 로그인된 보험설계사:', {
      agentId,
      fullName: user.fullName,
    });

    // IP 주소 추출 (보안 로깅용)
    const clientIP =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    console.log('📞 통합 고객 데이터 조회 시작:', { clientId, agentId });

    // 🆕 새로운 API 함수를 사용하여 통합 고객 데이터 조회
    const { getClientOverview } = await import(
      '~/features/clients/lib/client-data'
    );

    // 통합 고객 개요 데이터 조회
    let clientOverview;
    try {
      clientOverview = await getClientOverview(
        clientId,
        agentId,
        clientIP,
        userAgent
      );
    } catch (overviewError) {
      console.error('❌ getClientOverview 오류:', overviewError);

      // 기본 고객 정보만이라도 조회 시도
      const { createAdminClient } = await import('~/lib/core/supabase');
      const supabase = createAdminClient();

      const { data: basicClient, error: basicError } = await supabase
        .from('app_client_profiles')
        .select('*')
        .eq('id', clientId)
        .eq('agent_id', agentId)
        .single();

      if (basicError || !basicClient) {
        console.error('❌ 기본 고객 정보도 조회 실패:', basicError);
        return {
          client: null,
          clientOverview: null,
          availableStages: [],
          insuranceContracts: [],
          availableReferrers: [],
          currentUserId: agentId,
          currentUser: {
            id: user.id,
            email: user.email,
            name: user.fullName || user.email.split('@')[0],
          },
          isEmpty: true,
          error:
            overviewError instanceof Error
              ? overviewError.message
              : '고객 정보를 불러올 수 없습니다.',
        };
      }

      // 기본 구조로 반환
      clientOverview = {
        client: basicClient,
        tags: [],
        preferences: null,
        analytics: null,
        familyMembers: [],
        recentContacts: [],
        milestones: [],
        stageHistory: [],
        medicalHistory: null,
        checkupPurposes: null,
        interestCategories: null,
        consultationCompanions: [],
        consultationNotes: [],
      };
    }

    if (!clientOverview || !clientOverview.client) {
      console.log('⚠️ 고객을 찾을 수 없음');
      return {
        client: null,
        clientOverview: null,
        availableStages: [],
        insuranceContracts: [],
        availableReferrers: [],
        currentUserId: agentId,
        currentUser: {
          id: user.id,
          email: user.email,
          name: user.fullName || user.email.split('@')[0],
        },
        isEmpty: true,
      };
    }

    console.log('✅ 통합 고객 데이터 조회 완료:', {
      clientName: (clientOverview.client as any)?.fullName || '알 수 없음',
      hasExtendedData: {
        medicalHistory: !!clientOverview.medicalHistory,
        checkupPurposes: !!clientOverview.checkupPurposes,
        interestCategories: !!clientOverview.interestCategories,
        companionsCount: clientOverview.consultationCompanions?.length || 0,
        notesCount: clientOverview.consultationNotes?.length || 0,
      },
    });

    // 🎯 파이프라인 단계들 조회 (새 영업 기회 생성용)
    const { createAdminClient } = await import('~/lib/core/supabase');
    const supabase = createAdminClient();

    let availableStages: any[] = [];
    try {
      const { data: stagesData, error: stagesError } = await supabase
        .from('app_pipeline_stages')
        .select('id, name, color, "order"')
        .eq('agent_id', agentId)
        .neq('name', '제외됨') // 제외됨 단계는 숨김
        .order('order');

      availableStages = stagesData || [];

      if (stagesError) {
        console.error('❌ 파이프라인 단계 조회 오류:', stagesError);
      }
    } catch (stageError) {
      console.error('❌ 파이프라인 단계 조회 실패:', stageError);
    }

    // 🏢 보험 계약 데이터 조회
    let insuranceContracts: any[] = [];
    try {
      const { getClientInsuranceContracts } = await import(
        '~/api/shared/insurance-contracts'
      );
      const contractsResult = await getClientInsuranceContracts(
        clientId,
        agentId
      );

      if (contractsResult.success) {
        insuranceContracts = contractsResult.data;
        console.log(`✅ 보험계약 ${insuranceContracts.length}개 로드 완료`);
      } else {
        console.error('❌ 보험계약 조회 실패:', contractsResult.error);
      }
    } catch (contractError) {
      console.error('❌ 보험계약 로딩 중 에러:', contractError);
    }

    // 🆕 소개자 변경을 위한 다른 고객 목록 조회
    let availableReferrers: Array<{ id: string; name: string }> = [];
    try {
      const { data: otherClients, error: referrerError } = await supabase
        .from('app_client_profiles')
        .select('id, full_name')
        .eq('agent_id', agentId)
        .eq('is_active', true)
        .neq('id', clientId) // 현재 고객 제외
        .order('full_name');

      if (referrerError) {
        console.error('❌ 소개자 목록 조회 실패:', referrerError);
      } else {
        availableReferrers = (otherClients || []).map(client => ({
          id: client.id,
          name: client.full_name,
        }));
        console.log(`✅ 소개자 후보 ${availableReferrers.length}명 로드 완료`);
      }
    } catch (referrerError) {
      console.error('❌ 소개자 목록 조회 실패:', referrerError);
    }

    return {
      client: clientOverview.client,
      clientOverview: clientOverview, // 🆕 통합 고객 데이터 추가
      availableStages: availableStages,
      insuranceContracts: insuranceContracts, // 🏢 보험 계약 데이터 추가
      availableReferrers: availableReferrers, // 🆕 소개자 후보 목록 추가
      currentUserId: agentId,
      currentUser: {
        id: user.id,
        email: user.email,
        name: user.fullName || user.email.split('@')[0],
      },
      isEmpty: false,
    };
  } catch (error) {
    console.error('❌ 고객 상세 정보 조회 실패:', error);

    // 🎯 에러 상태 반환 (서버 에러 대신)
    return {
      client: null,
      clientOverview: null,
      availableStages: [],
      insuranceContracts: [],
      availableReferrers: [],
      currentUserId: null,
      currentUser: {
        id: '',
        email: '',
        name: '',
      },
      isEmpty: true,
      error:
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

// ✅ action 함수를 라우트 파일에서 직접 정의
export async function action({ request, params }: Route.ActionArgs) {
  const { clientId } = params;

  if (!clientId) {
    throw new Response('고객 ID가 필요합니다.', { status: 400 });
  }

  try {
    // 🔥 구독 상태 확인
    const { requireActiveSubscription } = await import(
      '~/lib/auth/subscription-middleware.server'
    );
    const { user } = await requireActiveSubscription(request);
    const agentId = user.id;

    const formData = await request.formData();
    const intent = formData.get('intent') as string;

    console.log('🔍 고객 상세 페이지 action:', { intent, clientId, agentId });

    // 동적으로 action 처리 함수 import
    const { handleClientDetailActions } = await import(
      '~/features/clients/lib/client-actions'
    );

    const result = await handleClientDetailActions({
      intent,
      formData,
      clientId,
      agentId,
      request,
    });

    return result;
  } catch (error) {
    console.error('❌ 고객 상세 페이지 action 실패:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

// ✅ meta 함수를 라우트 파일에서 직접 정의
export function meta({ data }: Route.MetaArgs) {
  const clientName = data?.client?.fullName || '고객';
  return [
    { title: `${clientName} - 고객 상세 | SureCRM` },
    { name: 'description', content: `${clientName}의 상세 정보를 확인하세요.` },
  ];
}

// ✅ 컴포넌트만 import
export { default } from '~/features/clients/pages/client-detail-page';
