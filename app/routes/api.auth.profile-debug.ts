import { requireAuth } from '~/lib/auth/middleware';
import { createServerClient } from '~/lib/core/supabase';

export async function loader({ request }: { request: Request }) {
  try {
    console.log('🔍 [프로필 디버그] 디버깅 시작');

    // 인증 확인
    const user = await requireAuth(request);
    console.log('✅ [프로필 디버그] 인증된 사용자:', {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    });

    // Supabase 클라이언트 생성
    const supabase = createServerClient();

    // 먼저 RLS 없이 직접 확인 (어드민 클라이언트 사용)
    console.log(
      '🔍 [프로필 디버그] app_user_profiles 테이블에서 사용자 조회 시도...'
    );

    const { data: userProfile, error } = await supabase
      .from('app_user_profiles')
      .select('*')
      .eq('id', user.id);

    console.log('📊 [프로필 디버그] 조회 결과:', {
      data: userProfile,
      error: error,
      dataLength: userProfile?.length || 0,
    });

    // 전체 프로필 개수도 확인
    const { count, error: countError } = await supabase
      .from('app_user_profiles')
      .select('*', { count: 'exact', head: true });

    console.log('📈 [프로필 디버그] 전체 프로필 개수:', {
      count,
      countError,
    });

    return {
      debug: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      profileQuery: {
        data: userProfile,
        error: error,
        dataLength: userProfile?.length || 0,
      },
      totalProfiles: {
        count,
        countError,
      },
    };
  } catch (error) {
    console.error('❌ [프로필 디버그] 에러:', error);

    return {
      debug: true,
      error: error instanceof Error ? error.message : '알 수 없는 에러',
      stack: error instanceof Error ? error.stack : null,
    };
  }
}
