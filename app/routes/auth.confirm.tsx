import { redirect } from 'react-router';
import { createServerClient } from '~/lib/core/supabase';
import type { EmailOtpType } from '@supabase/supabase-js';

interface Route {
  LoaderArgs: {
    request: Request;
  };
}

// Supabase 표준 토큰 확인 엔드포인트
export async function loader({ request }: Route['LoaderArgs']) {
  const url = new URL(request.url);
  const token_hash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;
  const next = url.searchParams.get('next') || '/';

  console.log('🔗 /auth/confirm 호출:', { 
    token_hash: token_hash ? 'present' : 'missing', 
    type, 
    next,
    url: url.toString()
  });

  // 토큰과 타입이 모두 있는 경우에만 처리
  if (token_hash && type) {
    const supabase = createServerClient();
    
    try {
      console.log('🔄 토큰 검증 시도:', { type });
      
      // Context7에서 확인한 Supabase 표준 방식
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as EmailOtpType,
      });

      console.log('🔍 토큰 검증 결과:', { 
        hasData: !!data, 
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        error: error?.message 
      });

      if (!error && data?.user) {
        console.log('✅ 토큰 검증 성공 - 사용자 인증됨');
        
        // 토큰 타입에 따라 적절한 페이지로 리다이렉트
        if (type === 'recovery') {
          // 비밀번호 재설정 토큰인 경우
          console.log('🔄 비밀번호 재설정 페이지로 리다이렉트');
          throw redirect('/auth/new-password');
        } else if (type === 'email') {
          // 이메일 확인 토큰인 경우
          console.log('🔄 대시보드로 리다이렉트');
          throw redirect(next || '/dashboard');
        } else {
          // 기타 경우
          console.log('🔄 기본 대시보드로 리다이렉트');
          throw redirect(next || '/dashboard');
        }
      } else {
        console.error('❌ 토큰 검증 실패:', { 
          errorMessage: error?.message,
          errorCode: error?.message,
          hasUser: !!data?.user 
        });
        
        // 에러 타입에 따라 적절한 에러 메시지와 함께 리다이렉트
        if (type === 'recovery') {
          throw redirect('/auth/forgot-password?error=invalid_token');
        } else {
          throw redirect('/auth/login?error=invalid_token');
        }
      }
    } catch (verifyError) {
      console.error('❌ 토큰 검증 중 예외 발생:', verifyError);
      
      // 예외 발생 시 적절한 페이지로 리다이렉트
      if (type === 'recovery') {
        throw redirect('/auth/forgot-password?error=verification_failed');
      } else {
        throw redirect('/auth/login?error=verification_failed');
      }
    }
  }

  // 토큰이나 타입이 없는 경우
  console.log('❌ 토큰 또는 타입 누락');
  throw redirect('/auth/login?error=invalid_link');
}

export function meta() {
  return [
    { title: '계정 확인 | SureCRM' },
    { name: 'description', content: '계정을 확인하고 있습니다...' },
  ];
}

export default function AuthConfirm() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">계정을 확인하고 있습니다...</p>
      </div>
    </div>
  );
} 