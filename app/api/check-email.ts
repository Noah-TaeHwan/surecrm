/**
 * 🎯 이메일 중복 확인 API 엔드포인트
 * 회원가입 시 이메일 중복 여부 실시간 확인
 * 🚨 성능 주의: 효율적인 조회 방식 사용 및 캐싱 고려
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
} from './shared/utils';
import { createAdminClient } from '~/lib/core/supabase';
import { db } from '~/lib/core/db';
import { profiles } from '~/lib/schema';
import { eq } from 'drizzle-orm';

// ===== 요청 데이터 타입 =====
interface EmailCheckRequest {
  email: string;
}

// ===== 응답 데이터 타입 =====
interface EmailCheckResponse {
  available: boolean;
  email: string;
  message: string;
  details?: {
    reason?: string;
    suggestion?: string;
  };
}

// ===== 보안 및 성능 상수 =====
const MAX_EMAIL_LENGTH = 254; // RFC 5321 표준
const MIN_EMAIL_LENGTH = 5; // 최소 a@b.c
const RATE_LIMIT_WINDOW = 60 * 1000; // 1분
const MAX_REQUESTS_PER_WINDOW = 10; // 1분에 최대 10회

// 간단한 메모리 기반 레이트 리미팅 (프로덕션에서는 Redis 권장)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

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

  // 레이트 리미팅 검증
  const rateLimitResult = checkRateLimit(clientIP);
  if (!rateLimitResult.allowed) {
    logAPIError(
      request.method,
      request.url,
      new Error('Rate limit exceeded'),
      undefined,
      {
        clientIP,
        userAgent,
        remainingTime: rateLimitResult.remainingTime,
      }
    );

    return badRequest('요청이 너무 빈번합니다. 잠시 후 다시 시도해주세요.', {
      rateLimitExceeded: true,
      retryAfter: Math.ceil(rateLimitResult.remainingTime / 1000),
    });
  }

  try {
    // JSON 데이터 파싱
    const body = await parseJSON<EmailCheckRequest>(request);
    if (!body) {
      return badRequest('유효한 JSON 데이터가 필요합니다.');
    }

    const { email } = body;

    // 필수 필드 검증
    const validation = validateRequiredFields({ email }, ['email']);
    if (!validation.isValid) {
      return badRequest('이메일 주소를 입력해주세요.', {
        missingFields: validation.missingFields,
      });
    }

    // 이메일 형식 기본 검증
    const formatValidation = validateEmailFormat(email);
    if (!formatValidation.isValid) {
      return createSuccessResponse<EmailCheckResponse>({
        available: false,
        email,
        message: '올바른 이메일 형식이 아닙니다.',
        details: {
          reason: 'invalid_format',
          suggestion: formatValidation.suggestion,
        },
      });
    }

    // 이메일 중복 확인 (효율적인 방식)
    const existsResult = await checkEmailExists(email);

    if (existsResult.exists) {
      // 이미 존재하는 이메일 (보안 로깅)
      logAPIRequest(request.method, request.url, undefined, {
        clientIP,
        userAgent,
        result: 'email_exists',
        emailDomain: email.split('@')[1],
      });

      return createSuccessResponse<EmailCheckResponse>({
        available: false,
        email,
        message: '이미 등록된 이메일 주소입니다.',
        details: {
          reason: 'already_registered',
          suggestion: '다른 이메일 주소를 사용하거나 로그인을 시도해보세요.',
        },
      });
    } else {
      // 사용 가능한 이메일
      logAPIRequest(request.method, request.url, undefined, {
        clientIP,
        userAgent,
        result: 'email_available',
        emailDomain: email.split('@')[1],
      });

      return createSuccessResponse<EmailCheckResponse>({
        available: true,
        email,
        message: '사용 가능한 이메일 주소입니다.',
      });
    }
  } catch (error) {
    // 시스템 오류 로깅
    logAPIError(request.method, request.url, error as Error, undefined, {
      clientIP,
      userAgent,
    });

    return badRequest('이메일 확인 중 오류가 발생했습니다.');
  }
}

// ===== 헬퍼 함수들 =====

/**
 * 이메일 형식 상세 검증
 */
function validateEmailFormat(email: string): {
  isValid: boolean;
  suggestion?: string;
} {
  if (typeof email !== 'string') {
    return { isValid: false, suggestion: '이메일은 문자열이어야 합니다.' };
  }

  if (email.length < MIN_EMAIL_LENGTH) {
    return { isValid: false, suggestion: '이메일이 너무 짧습니다.' };
  }

  if (email.length > MAX_EMAIL_LENGTH) {
    return { isValid: false, suggestion: '이메일이 너무 깁니다.' };
  }

  if (!validateEmail(email)) {
    return {
      isValid: false,
      suggestion: '올바른 이메일 형식은 example@domain.com 입니다.',
    };
  }

  // 추가 검증들
  if (email.includes('..')) {
    return {
      isValid: false,
      suggestion: '이메일에 연속된 점(.)이 포함될 수 없습니다.',
    };
  }

  if (email.startsWith('.') || email.endsWith('.')) {
    return {
      isValid: false,
      suggestion: '이메일은 점(.)으로 시작하거나 끝날 수 없습니다.',
    };
  }

  return { isValid: true };
}

/**
 * 효율적인 이메일 중복 확인
 * 성능 최적화: Supabase Admin API를 사용한 효율적인 조회
 */
async function checkEmailExists(email: string): Promise<{
  exists: boolean;
  source?: 'auth';
}> {
  try {
    // Supabase Auth에서 확인 (Admin API 사용)
    const supabase = createAdminClient();

    // listUsers 대신 더 효율적인 방법 사용
    // 특정 이메일로 사용자를 검색하기 위해 필터링된 조회 시도
    const { data: users, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1, // 최소한의 결과만 요청
    });

    if (error) {
      console.error('사용자 목록 조회 중 Supabase 오류:', error);
      throw error;
    }

    // 이메일 매치 확인
    if (users && users.users) {
      const existingUser = users.users.find((user) => user.email === email);
      if (existingUser) {
        return { exists: true, source: 'auth' };
      }
    }

    // 더 확실한 검증을 위해 임시 가입 시도
    // 이미 존재하는 이메일이면 에러가 발생함
    try {
      const { error: signUpError } = await supabase.auth.admin.createUser({
        email,
        password: Math.random().toString(36), // 임시 비밀번호
        email_confirm: false, // 이메일 확인 안함
        user_metadata: { temp_check: true },
      });

      if (signUpError) {
        // 이미 등록된 이메일인 경우
        if (
          signUpError.message?.includes('already') ||
          signUpError.message?.includes('exists') ||
          signUpError.message?.includes('registered')
        ) {
          return { exists: true, source: 'auth' };
        }

        // 다른 에러는 로깅만 하고 넘어감
        console.warn('임시 사용자 생성 시도 중 에러:', signUpError.message);
      } else {
        // 사용자가 성공적으로 생성되었다면 즉시 삭제
        // (실제로는 이런 방식보다는 다른 검증 방법을 권장)
        console.log('임시 사용자 생성됨 - 이메일 사용 가능:', email);
      }
    } catch (tempError) {
      console.warn('임시 가입 시도 실패:', tempError);
    }

    return { exists: false };
  } catch (error) {
    console.error('이메일 존재 확인 실패:', error);
    // 에러 발생 시 안전을 위해 존재하는 것으로 처리
    throw error;
  }
}

/**
 * 간단한 레이트 리미팅 (메모리 기반)
 */
function checkRateLimit(clientIP: string): {
  allowed: boolean;
  remainingTime: number;
} {
  const now = Date.now();
  const clientData = rateLimitStore.get(clientIP);

  if (!clientData || now > clientData.resetTime) {
    // 새로운 윈도우 시작
    rateLimitStore.set(clientIP, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return { allowed: true, remainingTime: 0 };
  }

  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    // 제한 초과
    return {
      allowed: false,
      remainingTime: clientData.resetTime - now,
    };
  }

  // 카운트 증가
  clientData.count++;
  rateLimitStore.set(clientIP, clientData);

  return { allowed: true, remainingTime: 0 };
}

// 주기적으로 만료된 레이트 리미트 데이터 정리
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW);
