import { redirect } from 'react-router';
import { createServerClient } from '~/lib/core/supabase';
import type { EmailOtpType } from '@supabase/supabase-js';
import type { Route } from './+types/auth.confirm';

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const token_hash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;
  const next = url.searchParams.get('next') || '/dashboard';
  const debug = url.searchParams.get('debug') === 'true';

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
    const verifyStartTime = Date.now();
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as EmailOtpType,
    });
    const verifyEndTime = Date.now();

    // 프로덕션 디버깅용 로그
    const debugInfo = {
      token_preview: `${token_hash.substring(0, 8)}...${token_hash.substring(token_hash.length - 8)}`,
      type,
      hasData: !!data,
      hasUser: !!data?.user,
      hasSession: !!data?.session,
      errorMessage: error?.message,
      errorCode: error?.code,
      responseTime: verifyEndTime - verifyStartTime,
      serverTime: new Date().toISOString(),
      url: url.toString(),
    };

    // 검증 실패 처리
    if (error) {
      console.error('🚨 [PRODUCTION] 토큰 검증 실패:', {
        ...debugInfo,
        fullError: error,
      });

      // 디버그 모드나 특정 에러에서 상세 정보 반환 (에러가 있을 때만!)
      if (debug || error.message.includes('expired')) {
        const debugParams = new URLSearchParams({
          error: error.message || 'unknown_error',
          code: error.code || 'unknown_code',
          time: debugInfo.serverTime,
          token_preview: debugInfo.token_preview,
          has_data: String(!!data),
          has_user: String(!!data?.user),
          has_session: String(!!data?.session),
          response_time: String(debugInfo.responseTime),
        });

        throw redirect(
          `/auth/forgot-password?debug_info=true&${debugParams.toString()}`
        );
      }

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
      console.log('✅ [PRODUCTION] 토큰 검증 성공:', {
        userId: data.user.id,
        email: data.user.email,
        sessionExists: !!data.session,
        debugMode: debug,
      });

      // 서버사이드에서 직접 쿠키 설정 (Response 헤더로)
      const cookieName = 'sb-mzmlolwducobuknsigvz-auth-token';
      const sessionData = {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        token_type: 'bearer',
        user: data.user,
      };

      console.log('🍪 [COOKIE SET] 세션 데이터 준비:', {
        hasAccessToken: !!sessionData.access_token,
        hasRefreshToken: !!sessionData.refresh_token,
        expiresAt: sessionData.expires_at,
        userId: sessionData.user?.id,
        userEmail: sessionData.user?.email,
      });

      const cookieValue = encodeURIComponent(JSON.stringify(sessionData));
      console.log('🔒 [COOKIE SET] 인코딩된 쿠키 값 길이:', cookieValue.length);

      const expires = new Date(
        (data.session.expires_at || Math.floor(Date.now() / 1000) + 3600) * 1000
      );
      console.log('⏰ [COOKIE SET] 쿠키 만료 시간:', expires.toISOString());

      const cookieOptions = [
        `${cookieName}=${cookieValue}`,
        'Path=/',
        'HttpOnly=false', // 클라이언트에서도 접근 가능하도록
        'SameSite=Lax',
        `Expires=${expires.toUTCString()}`,
        // 프로덕션에서는 Secure 추가
        process.env.NODE_ENV === 'production' ? 'Secure' : '',
      ]
        .filter(Boolean)
        .join('; ');

      console.log(
        '🎯 [COOKIE SET] 최종 쿠키 옵션:',
        cookieOptions.substring(0, 200) + '...'
      );

      // 토큰 타입별 리다이렉트 처리 (쿠키와 함께)
      if (type === 'recovery') {
        console.log(
          '✅ [PRODUCTION] 비밀번호 재설정 페이지로 리다이렉트 (쿠키 설정됨)'
        );

        // Response 객체로 리다이렉트와 쿠키를 함께 설정
        throw new Response(null, {
          status: 302,
          headers: {
            Location: '/auth/new-password',
            'Set-Cookie': cookieOptions,
          },
        });
      } else if (type === 'signup' || type === 'email_change') {
        console.log(
          '✅ [PRODUCTION] 다음 페이지로 리다이렉트 (쿠키 설정됨):',
          next
        );
        throw new Response(null, {
          status: 302,
          headers: {
            Location: next,
            'Set-Cookie': cookieOptions,
          },
        });
      } else {
        console.log(
          '✅ [PRODUCTION] 기본 다음 페이지로 리다이렉트 (쿠키 설정됨):',
          next
        );
        throw new Response(null, {
          status: 302,
          headers: {
            Location: next,
            'Set-Cookie': cookieOptions,
          },
        });
      }
    }

    // 예상치 못한 상황 - 에러도 없고 세션도 없는 경우
    console.error('🤔 [PRODUCTION] 예상치 못한 상황:', debugInfo);
    throw redirect('/auth/login?error=unexpected_verification_state');
  } catch (error) {
    // 리다이렉트가 아닌 일반 오류인 경우에만 로그
    if (!(error instanceof Response)) {
      console.error('💥 [PRODUCTION] 토큰 확인 처리 오류:', error);
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
            <svg
              className="animate-spin h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
            >
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
