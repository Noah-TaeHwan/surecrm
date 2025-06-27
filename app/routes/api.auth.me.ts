import { requireAuth } from '~/lib/auth/middleware.server';
import { db } from '~/lib/core/db.server';
import { profiles } from '~/lib/schema/core';
import { eq } from 'drizzle-orm';

// 🎯 현재 로그인한 사용자 정보 반환 API
export async function loader({ request }: { request: Request }) {
  try {
    console.log('📊 [API/ME] 사용자 정보 조회 시작');

    // 인증 확인 및 사용자 정보 가져오기 (이미 로그인 로직과 동일한 방식)
    const user = await requireAuth(request);
    console.log('✅ [API/ME] 인증 성공:', {
      userId: user.id,
      email: user.email,
    });

    // Drizzle을 사용해서 프로필 조회 (로그인과 동일한 방식)
    const userProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    console.log('📊 [API/ME] DB 조회 결과:', {
      profilesFound: userProfile.length,
      userId: user.id,
    });

    if (userProfile.length === 0) {
      console.warn('⚠️ [API/ME] 프로필 없음 - 기본 정보 반환');
      // 기본 정보만 반환
      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName || user.email.split('@')[0],
        name: user.fullName || user.email.split('@')[0],
      };
    }

    const profile = userProfile[0];
    console.log('✅ [API/ME] 프로필 조회 성공:', {
      id: profile.id,
      fullName: profile.fullName,
    });

    return {
      id: profile.id,
      email: user.email, // auth.users에서 가져온 이메일 사용
      fullName: profile.fullName || user.email.split('@')[0],
      name: profile.fullName || user.email.split('@')[0],
      company: profile.company,
      role: profile.role,
      createdAt: profile.createdAt,
    };
  } catch (error) {
    console.error('❌ [API/ME] 사용자 정보 조회 실패:', error);

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
