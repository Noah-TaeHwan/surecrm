import { redirect } from 'react-router';
import { createServerClient } from '~/lib/core/supabase';

// Handle password reset callback from Supabase
export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const token_hash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');
  const next = url.searchParams.get('next') || '/auth/login';

  console.log('비밀번호 재설정 콜백:', { token_hash, type, next });

  if (token_hash && type === 'recovery') {
    const supabase = createServerClient();
    
    try {
      // 최신 Supabase API 사용: verifyOtp로 token_hash 확인
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: 'recovery'
      });

      if (!error) {
        console.log('✅ 토큰 검증 성공, 새 비밀번호 페이지로 이동');
        // 검증 성공 시 새 비밀번호 설정 페이지로 리다이렉트
        throw redirect('/auth/new-password');
      } else {
        console.error('❌ 토큰 검증 실패:', error);
        throw redirect('/auth/forgot-password?error=invalid_token');
      }
    } catch (error) {
      console.error('❌ 토큰 검증 중 예외:', error);
      throw redirect('/auth/forgot-password?error=verification_failed');
    }
  }

  // 토큰이 없거나 타입이 잘못된 경우
  console.log('❌ 유효하지 않은 재설정 링크');
  throw redirect('/auth/forgot-password?error=invalid_link');
}

export function meta() {
  return [
    { title: '비밀번호 재설정 | SureCRM' },
    { name: 'description', content: '비밀번호를 재설정하세요' },
  ];
}

export default function ResetPassword() {
  return <div>Redirecting...</div>;
}
