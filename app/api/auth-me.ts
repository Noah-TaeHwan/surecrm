import type { Route } from './+types/auth-me';
import { requireAuth } from '~/lib/auth/middleware.server';
import { createServerClient } from '~/lib/core/supabase';

// 🎯 현재 로그인한 사용자 정보 반환 API
export async function loader({ request }: { request: Request }) {
  try {
    // 인증 확인 및 사용자 정보 가져오기
    const user = await requireAuth(request);

    // Supabase에서 상세 사용자 정보 조회
    const supabase = createServerClient();

    const { data: userProfile, error } = await supabase
      .from('app_user_profiles')
      .select('id, full_name, phone, company, role, created_at')
      .eq('id', user.id)
      .single();

    if (error) {
      console.warn('프로필 조회 실패:', error);
      // 기본 정보만 반환
      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName || user.email.split('@')[0],
        name: user.fullName || user.email.split('@')[0],
      };
    }

    return {
      id: userProfile.id,
      email: user.email, // auth.users에서 가져온 이메일 사용
      fullName: userProfile.full_name || user.email.split('@')[0],
      name: userProfile.full_name || user.email.split('@')[0],
      company: userProfile.company,
      role: userProfile.role,
      createdAt: userProfile.created_at,
    };
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error);

    // 인증 실패 시 401 반환
    return new Response(JSON.stringify({ error: '인증이 필요합니다.' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// POST 요청도 동일하게 처리 (일부 클라이언트에서 GET 대신 POST 사용)
export async function action({ request }: { request: Request }) {
  return loader({ request });
}
