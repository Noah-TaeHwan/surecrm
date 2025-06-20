import { data } from 'react-router';
import { z } from 'zod';
import { createServerClient } from '~/lib/core/supabase';

interface Route {
  ActionArgs: {
    request: Request;
  };
}

// 새 비밀번호 스키마 (페이지와 동일)
const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, '비밀번호는 최소 6자 이상이어야 합니다')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다',
      }),
    confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

export async function action({ request }: Route['ActionArgs']) {
  console.log('🔄 [API] 비밀번호 변경 API 요청 시작');
  
  // CORS 헤더 추가
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  
  try {
    const formData = await request.formData();
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    console.log('📝 [API] 폼 데이터 확인:', {
      hasPassword: !!password,
      hasConfirmPassword: !!confirmPassword,
      passwordLength: password?.length || 0
    });

    // 유효성 검사
    const validation = newPasswordSchema.safeParse({ password, confirmPassword });
    if (!validation.success) {
      console.error('❌ [API] 유효성 검사 실패:', validation.error.errors[0].message);
      return data({
        success: false,
        error: validation.error.errors[0].message,
      }, { 
        status: 400,
        headers 
      });
    }

    // 세션 확인 및 추출
    const cookieHeader = request.headers.get('Cookie') || '';
    console.log('🍪 [API] 쿠키 헤더 확인:', cookieHeader.includes('sb-mzmlolwducobuknsigvz-auth-token'));
    
    let sessionData: any = null;
    
    // 쿠키에서 세션 데이터 추출
    if (cookieHeader.includes('sb-mzmlolwducobuknsigvz-auth-token')) {
      const startIndex = cookieHeader.indexOf('sb-mzmlolwducobuknsigvz-auth-token=') + 'sb-mzmlolwducobuknsigvz-auth-token='.length;
      const endIndex = cookieHeader.indexOf(';', startIndex);
      const cookieValue = cookieHeader.substring(startIndex, endIndex === -1 ? undefined : endIndex);
      
      try {
        const decodedValue = decodeURIComponent(cookieValue);
        sessionData = JSON.parse(decodedValue);
        
        console.log('✅ [API] 쿠키에서 세션 데이터 추출됨:', {
          hasUser: !!sessionData?.user,
          hasAccessToken: !!sessionData?.access_token,
          userEmail: sessionData?.user?.email
        });
      } catch (cookieParseError) {
        console.error('❌ [API] 쿠키 파싱 실패:', cookieParseError);
      }
    }
    
    if (!sessionData?.user?.id || !sessionData?.access_token) {
      console.error('❌ [API] 유효한 세션 데이터가 없음 - 비밀번호 변경 불가');
      return data({
        success: false,
        error: '세션이 만료되었습니다. 비밀번호 재설정을 다시 시도해주세요.',
        redirectUrl: '/auth/forgot-password?error=session_expired'
      }, { 
        status: 401,
        headers 
      });
    }
    
    console.log('🔐 [API] Supabase 클라이언트 생성 및 세션 수동 설정');
    const supabase = createServerClient(request);
    
    // 추출한 세션 데이터를 Supabase 클라이언트에 수동으로 설정
    await supabase.auth.setSession({
      access_token: sessionData.access_token,
      refresh_token: sessionData.refresh_token
    });
    
    console.log('💡 [API] 세션 설정 완료, 비밀번호 업데이트 시도');
    
    // 비밀번호 업데이트
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      console.error('❌ [API] 비밀번호 업데이트 실패:', error);
      
      // 특정 에러 코드에 따른 메시지 처리
      let errorMessage = `비밀번호 변경 실패: ${error.message}`;
      
      if (error.message.includes('same password') || error.message.includes('New password should be different')) {
        errorMessage = '새 비밀번호는 기존 비밀번호와 달라야 합니다. 다른 비밀번호를 입력해주세요.';
      }
      
      return data({
        success: false,
        error: errorMessage,
      }, { 
        status: 400,
        headers 
      });
    }

    console.log('✅ [API] 비밀번호 변경 성공 - 성공 응답 반환');
    return data({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.',
    }, { 
      status: 200,
      headers 
    });
    
  } catch (error) {
    console.error('💥 [API] 비밀번호 변경 중 예외:', error);
    
    return data({
      success: false,
      error: '비밀번호 변경 중 오류가 발생했습니다.',
    }, { 
      status: 500,
      headers 
    });
  }
} 