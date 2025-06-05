/**
 * 🎯 이메일 인증 코드 재전송 API 엔드포인트
 * OTP/매직링크 재전송 기능
 * 🚨 보안 주의: 강력한 스로틀링 필수 - 스팸 방지 및 서비스 남용 방지
 */

import {
  createSuccessResponse,
  methodNotAllowed,
  badRequest,
  parseJSON,
  logAPIRequest,
  logAPIError,
  validateRequiredFields,
  validateEmail,
  getClientIP,
  getUserAgent,
} from '~/api/shared/utils';
import { createServerClient } from '~/lib/core/supabase';

// ===== 요청 데이터 타입 =====
interface ResendVerificationRequest {
  email: string;
  type?: 'otp' | 'magiclink'; // 재전송 타입
}

// ===== 응답 데이터 타입 =====
interface ResendVerificationResponse {
  success: boolean;
  message: string;
  details?: {
    type: string;
    waitTime?: number;
    maxAttempts?: number;
    remainingAttempts?: number;
  };
}

// ===== 스로틀링 상수 =====
const RESEND_COOLDOWN = 60 * 1000; // 1분 대기
const MAX_ATTEMPTS_PER_HOUR = 3; // 1시간에 최대 3회
const MAX_ATTEMPTS_PER_IP_PER_HOUR = 10; // IP당 1시간에 최대 10회
const HOUR_IN_MS = 60 * 60 * 1000;

// 메모리 기반 스로틀링 저장소 (프로덕션에서는 Redis 권장)
interface ThrottleData {
  attempts: { timestamp: number; email: string }[];
  lastAttempt: number;
}

const emailThrottleStore = new Map<string, ThrottleData>();
const ipThrottleStore = new Map<string, ThrottleData>();

// ===== Action (POST 요청 처리) =====
export async function action({ request }: { request: Request }) {
  const clientIP = getClientIP(request);
  const userAgent = getUserAgent(request);

  logAPIRequest(request.method, request.url, undefined, {
    clientIP,
    userAgent,
  });

  // 메소드 검증
  if (request.method !== 'POST') {
    return methodNotAllowed();
  }

  try {
    // JSON 데이터 파싱
    const body = await parseJSON<ResendVerificationRequest>(request);
    if (!body) {
      return badRequest('유효한 JSON 데이터가 필요합니다.');
    }

    const { email, type = 'otp' } = body;

    // 필수 필드 검증
    const validation = validateRequiredFields({ email }, ['email']);
    if (!validation.isValid) {
      return badRequest('이메일 주소가 필요합니다.', {
        missingFields: validation.missingFields,
      });
    }

    // 이메일 형식 검증
    if (!validateEmail(email)) {
      return badRequest('올바른 이메일 형식이 아닙니다.');
    }

    // 타입 검증
    if (!['otp', 'magiclink'].includes(type)) {
      return badRequest('유효하지 않은 인증 타입입니다.', {
        allowedTypes: ['otp', 'magiclink'],
      });
    }

    // 스로틀링 검증
    const throttleResult = checkResendThrottling(email, clientIP);
    if (!throttleResult.allowed) {
      // 스로틀링 위반 로깅
      logAPIError(
        request.method,
        request.url,
        new Error('Resend throttling exceeded'),
        undefined,
        {
          clientIP,
          userAgent,
          email: email.split('@')[0] + '@***',
          reason: throttleResult.reason,
          waitTime: throttleResult.waitTime,
        }
      );

      return createSuccessResponse<ResendVerificationResponse>({
        success: false,
        message: throttleResult.message,
        details: {
          type: 'throttle_exceeded',
          waitTime: throttleResult.waitTime,
          maxAttempts: throttleResult.maxAttempts,
          remainingAttempts: throttleResult.remainingAttempts,
        },
      });
    }

    // Supabase를 통한 인증 코드 재전송
    const supabase = createServerClient();
    let authResult;

    if (type === 'otp') {
      authResult = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false, // 이미 생성된 사용자만
          data: {
            resend_verification: true,
            timestamp: new Date().toISOString(),
          },
        },
      });
    } else {
      // Magic link
      authResult = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${process.env.PUBLIC_URL}/auth/email-confirmed`,
          data: {
            resend_verification: true,
            timestamp: new Date().toISOString(),
          },
        },
      });
    }

    if (authResult.error) {
      // Supabase 에러 처리
      const errorMessage = getSupabaseErrorMessage(authResult.error);

      logAPIError(
        request.method,
        request.url,
        new Error(`Supabase auth error: ${authResult.error.message}`),
        undefined,
        {
          clientIP,
          userAgent,
          email: email.split('@')[0] + '@***',
          supabaseError: authResult.error.message,
          type,
        }
      );

      return createSuccessResponse<ResendVerificationResponse>({
        success: false,
        message: errorMessage,
        details: {
          type: 'auth_error',
        },
      });
    }

    // 성공 시 스로틀링 카운트 업데이트
    updateThrottlingCounters(email, clientIP);

    // 성공 로깅
    logAPIRequest(request.method, request.url, undefined, {
      clientIP,
      userAgent,
      email: email.split('@')[0] + '@***',
      type,
      result: 'success',
    });

    return createSuccessResponse<ResendVerificationResponse>({
      success: true,
      message: `${
        type === 'otp' ? '인증 코드' : '매직링크'
      }가 재전송되었습니다.`,
      details: {
        type,
        waitTime: RESEND_COOLDOWN,
      },
    });
  } catch (error) {
    // 시스템 오류 로깅
    logAPIError(request.method, request.url, error as Error, undefined, {
      clientIP,
      userAgent,
    });

    return createSuccessResponse<ResendVerificationResponse>({
      success: false,
      message: '인증 코드 재전송 중 오류가 발생했습니다.',
      details: {
        type: 'system_error',
      },
    });
  }
}

// ===== 헬퍼 함수들 =====

/**
 * 재전송 스로틀링 검증
 */
function checkResendThrottling(
  email: string,
  clientIP: string
): {
  allowed: boolean;
  reason?: string;
  message: string;
  waitTime?: number;
  maxAttempts?: number;
  remainingAttempts?: number;
} {
  const now = Date.now();

  // 1. 이메일별 쿨다운 검증
  const emailData = emailThrottleStore.get(email);
  if (emailData && now - emailData.lastAttempt < RESEND_COOLDOWN) {
    const waitTime = RESEND_COOLDOWN - (now - emailData.lastAttempt);
    return {
      allowed: false,
      reason: 'email_cooldown',
      message: `동일한 이메일로는 ${Math.ceil(
        waitTime / 1000
      )}초 후에 재시도할 수 있습니다.`,
      waitTime,
    };
  }

  // 2. 이메일별 시간당 최대 시도 횟수 검증
  if (emailData) {
    const recentAttempts = emailData.attempts.filter(
      (attempt) => now - attempt.timestamp < HOUR_IN_MS
    );

    if (recentAttempts.length >= MAX_ATTEMPTS_PER_HOUR) {
      return {
        allowed: false,
        reason: 'email_hour_limit',
        message: '이 이메일로는 1시간에 최대 3회까지만 재전송할 수 있습니다.',
        maxAttempts: MAX_ATTEMPTS_PER_HOUR,
        remainingAttempts: 0,
      };
    }
  }

  // 3. IP별 시간당 최대 시도 횟수 검증
  const ipData = ipThrottleStore.get(clientIP);
  if (ipData) {
    const recentAttempts = ipData.attempts.filter(
      (attempt) => now - attempt.timestamp < HOUR_IN_MS
    );

    if (recentAttempts.length >= MAX_ATTEMPTS_PER_IP_PER_HOUR) {
      return {
        allowed: false,
        reason: 'ip_hour_limit',
        message: '이 IP에서는 1시간에 최대 10회까지만 재전송할 수 있습니다.',
        maxAttempts: MAX_ATTEMPTS_PER_IP_PER_HOUR,
        remainingAttempts: 0,
      };
    }
  }

  return {
    allowed: true,
    message: '재전송이 허용됩니다.',
  };
}

/**
 * 스로틀링 카운터 업데이트
 */
function updateThrottlingCounters(email: string, clientIP: string): void {
  const now = Date.now();

  // 이메일 카운터 업데이트
  const emailData = emailThrottleStore.get(email) || {
    attempts: [],
    lastAttempt: 0,
  };
  emailData.attempts = [
    ...emailData.attempts.filter(
      (attempt) => now - attempt.timestamp < HOUR_IN_MS
    ),
    { timestamp: now, email },
  ];
  emailData.lastAttempt = now;
  emailThrottleStore.set(email, emailData);

  // IP 카운터 업데이트
  const ipData = ipThrottleStore.get(clientIP) || {
    attempts: [],
    lastAttempt: 0,
  };
  ipData.attempts = [
    ...ipData.attempts.filter(
      (attempt) => now - attempt.timestamp < HOUR_IN_MS
    ),
    { timestamp: now, email },
  ];
  ipData.lastAttempt = now;
  ipThrottleStore.set(clientIP, ipData);
}

/**
 * Supabase 에러 메시지 변환
 */
function getSupabaseErrorMessage(error: any): string {
  const message = error.message?.toLowerCase() || '';

  if (message.includes('rate limit')) {
    return '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.';
  }

  if (message.includes('user not found')) {
    return '등록되지 않은 이메일 주소입니다.';
  }

  if (message.includes('signup disabled')) {
    return '현재 회원가입이 비활성화되어 있습니다.';
  }

  if (message.includes('email')) {
    return '이메일 전송에 실패했습니다. 이메일 주소를 확인해주세요.';
  }

  return 'OTP 재전송에 실패했습니다. 잠시 후 다시 시도해주세요.';
}

// 주기적으로 만료된 데이터 정리
setInterval(() => {
  const now = Date.now();

  for (const [email, data] of emailThrottleStore.entries()) {
    data.attempts = data.attempts.filter(
      (attempt) => now - attempt.timestamp < HOUR_IN_MS
    );

    if (data.attempts.length === 0 && now - data.lastAttempt > HOUR_IN_MS) {
      emailThrottleStore.delete(email);
    } else {
      emailThrottleStore.set(email, data);
    }
  }

  for (const [ip, data] of ipThrottleStore.entries()) {
    data.attempts = data.attempts.filter(
      (attempt) => now - attempt.timestamp < HOUR_IN_MS
    );

    if (data.attempts.length === 0 && now - data.lastAttempt > HOUR_IN_MS) {
      ipThrottleStore.delete(ip);
    } else {
      ipThrottleStore.set(ip, data);
    }
  }
}, 15 * 60 * 1000); // 15분마다 정리
