import { redirect } from 'react-router';
import { createServerClient } from '~/lib/core/supabase';
import type { EmailOtpType } from '@supabase/supabase-js';
import type { Route } from "./+types/auth.confirm";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const token_hash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;
  const next = url.searchParams.get('next') || '/dashboard';

  // 기본 유효성 검사
  if (!token_hash) {
    throw redirect('/auth/login?error=missing_token');
  }

  if (!type) {
    throw redirect('/auth/login?error=missing_type');
  }

  // 토큰 해시 검증
  if (token_hash.length < 10) {
    throw redirect('/auth/login?error=invalid_token_format');
  }

  try {
    // Supabase 클라이언트 생성
    const supabase = createServerClient(request);
    
    // 토큰 검증
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as EmailOtpType,
    });

    // 검증 실패 처리
    if (error) {
      console.error('토큰 검증 실패:', error.message);
      
      // 일반적인 에러 메시지로 변환
      if (error.message.includes('expired')) {
        throw redirect('/auth/forgot-password?error=token_expired');
      } else if (error.message.includes('invalid')) {
        throw redirect('/auth/forgot-password?error=invalid_token');
      } else {
        throw redirect('/auth/forgot-password?error=verification_failed');
      }
    }

    // 성공 케이스 처리
    if (data?.user && data?.session) {
      // 클라이언트사이드 세션 설정을 위한 API 호출
      try {
        const sessionSetResponse = await fetch('/api/auth/set-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
          }),
        });

        if (!sessionSetResponse.ok) {
          console.warn('세션 설정 API 호출 실패, 계속 진행');
        }
      } catch (apiError) {
        console.warn('세션 설정 API 오류:', apiError);
        // API 실패해도 계속 진행
      }
      
      // 토큰 타입별 리다이렉트 처리
      if (type === 'recovery') {
        // 비밀번호 재설정 플로우
        throw redirect('/auth/new-password');
      } else if (type === 'signup' || type === 'email_change') {
        // 이메일 확인 플로우
        throw redirect(next);
      } else {
        // 기본 대시보드로 이동
        throw redirect(next);
      }
    }

    // 예상치 못한 상황 - 에러도 없고 세션도 없는 경우
    throw redirect('/auth/login?error=unexpected_verification_state');

  } catch (error) {
    // 리다이렉트가 아닌 일반 오류인 경우에만 로그
    if (!(error instanceof Response)) {
      console.error('토큰 확인 처리 오류:', error);
    }
    
    // 이미 리다이렉트인 경우 그대로 throw, 아니면 로그인으로 리다이렉트
    if (error instanceof Response) {
      throw error;
    }
    
    throw redirect('/auth/login?error=token_verification_failed');
  }
}

export function meta() {
  return [
    { title: '이메일 확인 중... | SureCRM' },
    { name: 'description', content: '이메일 확인을 처리하고 있습니다' },
  ];
}

// 확인 진행 중 페이지 표시
export default function AuthConfirm() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            이메일 확인 중...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            잠시만 기다려 주세요. 이메일 확인을 처리하고 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
} 