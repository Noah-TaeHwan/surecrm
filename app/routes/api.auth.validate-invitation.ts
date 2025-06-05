/**
 * 🎯 초대 코드 검증 API 엔드포인트
 * 회원가입 플로우의 핵심 - 초대 코드 유효성 검증
 * 🚨 보안 주의: 무차별 대입 공격 방지 및 상세한 로깅 필요
 */

import {
  createSuccessResponse,
  methodNotAllowed,
  badRequest,
  parseJSON,
  logAPIRequest,
  logAPIError,
  validateRequiredFields,
  getClientIP,
  getUserAgent,
} from '~/api/shared/utils';
import { validateInvitationCode } from '~/lib/auth/validation';
import type { InvitationValidationResult } from '~/lib/auth/types';

// ===== 요청 데이터 타입 =====
interface InvitationValidationRequest {
  code: string;
}

// ===== 응답 데이터 타입 =====
interface InvitationValidationResponse {
  valid: boolean;
  invitation?: {
    id: string;
    code: string;
    inviterName?: string;
    message?: string;
    expiresAt?: string;
  };
  error?: string;
  details?: {
    reason?: string;
    suggestion?: string;
  };
}

// ===== 보안 관련 상수 =====
const MAX_CODE_LENGTH = 30;
const MIN_CODE_LENGTH = 3; // 'asdf' 같은 기존 코드 허용
const ALLOWED_CODE_PATTERN = /^[A-Za-z0-9\-_]+$/; // 대소문자, 숫자, 하이픈, 언더스코어 허용

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
    const body = await parseJSON<InvitationValidationRequest>(request);
    if (!body) {
      return badRequest('유효한 JSON 데이터가 필요합니다.');
    }

    const { code } = body;

    // 필수 필드 검증
    const validation = validateRequiredFields({ code }, ['code']);
    if (!validation.isValid) {
      return badRequest('초대 코드를 입력해주세요.', {
        missingFields: validation.missingFields,
      });
    }

    // 초대 코드 형식 검증
    const codeValidationResult = validateCodeFormat(code);
    if (!codeValidationResult.isValid) {
      // 보안 이벤트 로깅 (잘못된 형식의 코드)
      logAPIError(
        request.method,
        request.url,
        new Error('Invalid invitation code format'),
        undefined,
        {
          clientIP,
          userAgent,
          invalidCode: code.substring(0, 3) + '***', // 일부만 로깅
          reason: codeValidationResult.reason,
        }
      );

      return createSuccessResponse<InvitationValidationResponse>({
        valid: false,
        error: '올바른 초대 코드 형식이 아닙니다.',
        details: {
          reason: 'invalid_format',
          suggestion:
            '초대 코드는 3-30자의 대소문자, 숫자, 하이픈, 언더스코어 조합이어야 합니다.',
        },
      });
    }

    // 초대 코드 검증 실행
    const validationResult = await validateInvitationCode(code);

    // 성공적인 검증 로깅
    if (validationResult.valid) {
      logAPIRequest(request.method, request.url, undefined, {
        clientIP,
        userAgent,
        result: 'valid_invitation',
        invitationId: validationResult.invitation?.id,
      });

      return createSuccessResponse<InvitationValidationResponse>(
        {
          valid: true,
          invitation: validationResult.invitation
            ? {
                id: validationResult.invitation.id,
                code: validationResult.invitation.code,
                inviterName: validationResult.invitation.inviterName,
                message: validationResult.invitation.message,
                expiresAt: validationResult.invitation.expiresAt?.toISOString(),
              }
            : undefined,
        },
        '유효한 초대 코드입니다.'
      );
    } else {
      // 실패한 검증 로깅 (보안 이벤트)
      logAPIError(
        request.method,
        request.url,
        new Error('Invalid invitation code'),
        undefined,
        {
          clientIP,
          userAgent,
          reason: validationResult.error,
          codePrefix: code.substring(0, 3) + '***',
        }
      );

      return createSuccessResponse<InvitationValidationResponse>({
        valid: false,
        error: validationResult.error || '유효하지 않은 초대 코드입니다.',
        details: {
          reason: getErrorReason(validationResult.error),
          suggestion: getErrorSuggestion(validationResult.error),
        },
      });
    }
  } catch (error) {
    // 시스템 오류 로깅
    logAPIError(request.method, request.url, error as Error, undefined, {
      clientIP,
      userAgent,
    });

    return createSuccessResponse<InvitationValidationResponse>({
      valid: false,
      error: '초대 코드 검증 중 오류가 발생했습니다.',
      details: {
        reason: 'system_error',
        suggestion: '잠시 후 다시 시도해주세요.',
      },
    });
  }
}

// ===== 헬퍼 함수들 =====

/**
 * 초대 코드 형식 검증
 */
function validateCodeFormat(code: string): {
  isValid: boolean;
  reason?: string;
} {
  if (typeof code !== 'string') {
    return { isValid: false, reason: 'not_string' };
  }

  const trimmedCode = code.trim();

  if (trimmedCode.length < MIN_CODE_LENGTH) {
    return { isValid: false, reason: 'too_short' };
  }

  if (trimmedCode.length > MAX_CODE_LENGTH) {
    return { isValid: false, reason: 'too_long' };
  }

  if (!ALLOWED_CODE_PATTERN.test(trimmedCode)) {
    return { isValid: false, reason: 'invalid_characters' };
  }

  return { isValid: true };
}

/**
 * 에러 원인 분류
 */
function getErrorReason(error?: string): string {
  if (!error) return 'unknown';

  if (error.includes('유효하지 않은')) return 'not_found';
  if (error.includes('이미 사용된')) return 'already_used';
  if (error.includes('만료된')) return 'expired';
  if (error.includes('취소된')) return 'cancelled';

  return 'unknown';
}

/**
 * 에러별 제안 메시지
 */
function getErrorSuggestion(error?: string): string {
  if (!error) return '관리자에게 문의해주세요.';

  if (error.includes('유효하지 않은')) {
    return '초대 코드를 다시 확인해주세요.';
  }
  if (error.includes('이미 사용된')) {
    return '이미 사용된 초대 코드입니다. 새로운 초대 코드를 요청해주세요.';
  }
  if (error.includes('만료된')) {
    return '초대 코드가 만료되었습니다. 새로운 초대 코드를 요청해주세요.';
  }
  if (error.includes('취소된')) {
    return '취소된 초대 코드입니다. 새로운 초대 코드를 요청해주세요.';
  }

  return '문제가 지속되면 관리자에게 문의해주세요.';
}
