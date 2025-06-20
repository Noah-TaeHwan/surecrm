import { redirect, data } from 'react-router';
import { z } from 'zod';
import { createServerClient } from '~/lib/core/supabase';

interface Route {
  LoaderArgs: {
    request: Request;
  };
  ActionArgs: {
    request: Request;
  };
  ComponentProps: {
    loaderData?: any;
    actionData?: any;
  };
}

// 새 비밀번호 스키마
const newPasswordSchema = z.object({
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
});

export async function loader({ request }: Route['LoaderArgs']) {
  console.log('🔐 [NEW-PASSWORD LOADER] 시작');
  
  try {
    // 쿠키에서 직접 세션 정보 추출 (서버-클라이언트 동기화 문제 해결)
    const cookieHeader = request.headers.get('Cookie') || '';
    console.log('🍪 [COOKIE DEBUG] 전체 쿠키 헤더:', cookieHeader);
    
    const authCookieMatch = cookieHeader.match(/sb-mzmlolwducobuknsigvz-auth-token=([^;]+)/);
    console.log('🔍 [COOKIE DEBUG] Auth 쿠키 매치:', !!authCookieMatch);
    
    if (authCookieMatch) {
      try {
        const decodedValue = decodeURIComponent(authCookieMatch[1]);
        console.log('📋 [COOKIE DEBUG] 디코딩된 쿠키 값 길이:', decodedValue.length);
        
        const directSessionData = JSON.parse(decodedValue);
        console.log('✅ [COOKIE DEBUG] 직접 파싱된 세션 데이터:', {
          hasUser: !!directSessionData?.user,
          userId: directSessionData?.user?.id,
          userEmail: directSessionData?.user?.email,
          hasAccessToken: !!directSessionData?.access_token,
          hasRefreshToken: !!directSessionData?.refresh_token,
          expiresAt: directSessionData?.expires_at
        });
        
        // 직접 파싱된 세션 데이터가 유효한 경우
        if (directSessionData?.user?.id && directSessionData?.access_token) {
          console.log('✅ [COOKIE SUCCESS] 직접 쿠키에서 세션 확인됨');
          return { 
            hasSession: true, 
            user: {
              id: directSessionData.user.id,
              email: directSessionData.user.email
            }
          };
        } else {
          console.warn('⚠️ [COOKIE INCOMPLETE] 세션 데이터가 불완전함');
        }
      } catch (parseError) {
        console.error('❌ [COOKIE PARSE ERROR] 쿠키 파싱 실패:', parseError);
        // 쿠키 파싱 실패 시 Supabase 클라이언트로 fallback
      }
    } else {
      console.warn('⚠️ [COOKIE MISSING] Auth 쿠키가 없음');
    }
    
    console.log('🔄 [FALLBACK] Supabase 클라이언트로 세션 확인 시도');
    
    // Fallback: Supabase 클라이언트로 세션 확인
    const supabase = createServerClient(request);
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    console.log('📊 [SUPABASE DEBUG] 세션 확인 결과:', {
      hasSession: !!session,
      hasUser: !!user,
      sessionError: sessionError?.message,
      userError: userError?.message,
      userId: user?.id,
      userEmail: user?.email
    });
    
    // 세션이나 사용자가 없는 경우 토큰 검증 페이지로 리다이렉트
    if (!session || !user || sessionError || userError) {
      console.error('❌ [SESSION FAILED] 세션 확인 실패 - forgot-password로 리다이렉트');
      throw redirect('/auth/forgot-password?error=session_required');
    }
  
    console.log('✅ [SESSION SUCCESS] Supabase에서 세션 확인됨');
    return { 
      hasSession: true, 
      user: {
        id: user.id,
        email: user.email
      }
    };
    
  } catch (error) {
    // 리다이렉트가 아닌 일반 오류인 경우에만 로그
    if (!(error instanceof Response)) {
      console.error('💥 [LOADER ERROR] 새 비밀번호 페이지 로딩 오류:', error);
    }
    
    // 이미 리다이렉트인 경우 그대로 throw, 아니면 forgot-password로 리다이렉트
    if (error instanceof Response) {
      throw error;
    }
    
    console.error('❌ [UNEXPECTED ERROR] 예상치 못한 오류 - forgot-password로 리다이렉트');
    throw redirect('/auth/forgot-password?error=session_check_failed');
  }
}

export async function action({ request }: Route['ActionArgs']) {
  const formData = await request.formData();
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  // 유효성 검사
  const validation = newPasswordSchema.safeParse({ password, confirmPassword });
  if (!validation.success) {
    return data({
      success: false,
      error: validation.error.errors[0].message,
    }, { status: 400 });
  }

  try {
    const supabase = createServerClient(request);
    
    // 비밀번호 업데이트
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      return data({
        success: false,
        error: '비밀번호 변경에 실패했습니다. 다시 시도해 주세요.',
      }, { status: 400 });
    }

    // 성공적으로 비밀번호 변경 후 로그인 페이지로 리다이렉트
    throw redirect('/auth/login?message=password_updated');
  } catch (error) {
    // 리다이렉트가 아닌 일반 오류인 경우에만 로그
    if (!(error instanceof Response)) {
      console.error('비밀번호 변경 오류:', error);
    }
    
    if (error instanceof Response) {
      throw error;
    }
    
    return data({
      success: false,
      error: '비밀번호 변경 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

export function meta() {
  return [
    { title: '새 비밀번호 설정 | SureCRM' },
    { name: 'description', content: '새로운 비밀번호를 설정하세요' },
  ];
}

export { default } from '~/common/pages/auth/new-password-page'; 