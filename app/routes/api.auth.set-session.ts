import { createServerClient } from '~/lib/core/supabase';

interface Route {
  ActionArgs: {
    request: Request;
  };
}

export async function action({ request }: Route['ActionArgs']) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { access_token, refresh_token, expires_at } = body;

    if (!access_token || !refresh_token) {
      return new Response(JSON.stringify({ error: 'Missing tokens' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Supabase 클라이언트 생성 및 세션 설정
    const supabase = createServerClient();
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token
    });

    if (error) {
      console.error('세션 설정 실패:', error.message);
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 성공 시 쿠키 설정
    const cookieName = 'sb-mzmlolwducobuknsigvz-auth-token';
    const sessionData = {
      access_token,
      refresh_token,
      expires_at,
      token_type: 'bearer',
      user: data.user
    };

    const cookieValue = encodeURIComponent(JSON.stringify(sessionData));
    
    return new Response(JSON.stringify({ 
      success: true,
      userId: data.user?.id,
      email: data.user?.email
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `${cookieName}=${cookieValue}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}` // 7일
      }
    });

  } catch (error) {
    console.error('세션 설정 API 오류:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(JSON.stringify({ 
      error: '세션 설정 중 오류가 발생했습니다.' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 