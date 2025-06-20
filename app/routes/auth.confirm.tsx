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

  console.log('🔥🔥🔥 AUTH.CONFIRM LOADER 실행됨!');
  console.log('🔗 /auth/confirm 호출:', { 
    token_hash: token_hash ? 'present' : 'missing', 
    type, 
    next,
    url: url.toString()
  });

  // 🚨 임시 테스트: 일단 컴포넌트가 실행되도록 함
  if (!token_hash || !type) {
    console.log('❌ 토큰 또는 타입 누락 - 컴포넌트 표시');
    return { 
      error: 'invalid_link',
      message: '토큰 또는 타입이 누락되었습니다.',
      token_hash: token_hash || 'missing',
      type: type || 'missing'
    };
  }

  // 🚨 임시 테스트: 토큰 검증을 실행하되 redirect 하지 않고 결과를 반환
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
        
        return {
          success: true,
          message: '토큰 검증 성공! 곧 리다이렉트됩니다.',
          redirectTo: type === 'recovery' ? '/auth/new-password' : (next || '/dashboard'),
          user: data.user,
          type
        };
      } else {
        console.error('❌ 토큰 검증 실패:', { 
          errorMessage: error?.message,
          errorCode: error?.message,
          hasUser: !!data?.user 
        });
        
        return {
          success: false,
          error: 'verification_failed',
          message: `토큰 검증 실패: ${error?.message || '알 수 없는 오류'}`,
          type
        };
      }
    } catch (verifyError) {
      console.error('❌ 토큰 검증 중 예외 발생:', verifyError);
      
      return {
        success: false,
        error: 'exception',
        message: `토큰 검증 중 예외: ${verifyError}`,
        type
      };
    }
  }

  // 이 코드는 위에서 이미 처리됨
  return {
    error: 'fallback',
    message: '예상치 못한 경로로 도달했습니다.',
  };
}

export function meta() {
  return [
    { title: '계정 확인 | SureCRM' },
    { name: 'description', content: '계정을 확인하고 있습니다...' },
  ];
}

interface ComponentProps {
  loaderData: any;
}

export default function AuthConfirm({ loaderData }: ComponentProps) {
  // 🚨 긴급 테스트: 라우트가 실행되는지 확인
  console.log('🔥🔥🔥 AUTH.CONFIRM.TSX 컴포넌트가 실행되었습니다!');
  console.log('📊 Loader 데이터:', loaderData);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg border-4 border-red-500 max-w-2xl">
        <h1 className="text-2xl font-bold text-red-600 mb-4">🔥 AUTH CONFIRM 라우트 실행됨!</h1>
        
        {/* 📊 Loader 데이터 표시 */}
        <div className="bg-gray-100 p-4 rounded-lg mb-4 text-left">
          <h2 className="font-bold text-gray-800 mb-2">📊 Loader 데이터:</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(loaderData, null, 2)}
          </pre>
        </div>
        
        {loaderData?.success ? (
          <div className="text-green-600">
            <h2 className="text-xl font-bold mb-2">✅ 검증 성공!</h2>
            <p>{loaderData.message}</p>
            <p className="text-sm mt-2">리다이렉트 대상: {loaderData.redirectTo}</p>
          </div>
        ) : (
          <div className="text-red-600">
            <h2 className="text-xl font-bold mb-2">❌ 검증 실패</h2>
            <p>{loaderData?.message || '알 수 없는 오류'}</p>
            <p className="text-sm mt-2">에러: {loaderData?.error}</p>
          </div>
        )}
        
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4 mt-4"></div>
        <p className="text-gray-600">이 화면이 보이면 라우트가 정상 실행되고 있습니다.</p>
      </div>
    </div>
  );
} 