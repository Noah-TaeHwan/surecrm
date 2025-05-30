/**
 * 🎯 API 공통 유틸리티 함수
 * 모든 API 엔드포인트에서 사용할 표준 헬퍼 함수들
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  APIResponse,
  APISuccessResponse,
  APIErrorResponse,
  ErrorCode,
} from './types';
import { HTTP_STATUS, ERROR_CODES } from './types';

// ===== 응답 생성 함수들 =====

/**
 * 성공 응답 생성
 */
export function createSuccessResponse<T>(
  data?: T,
  message?: string,
  status: number = 200
): Response {
  const response: APISuccessResponse<T> = {
    success: true,
    data,
    message,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
      version: '1.0.0',
    },
  };

  return Response.json(response, { status });
}

/**
 * 에러 응답 생성
 */
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  status: number,
  details?: any
): Response {
  const response: APIErrorResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
      version: '1.0.0',
    },
  };

  return Response.json(response, { status });
}

// ===== 일반적인 에러 응답 단축 함수들 =====

export function unauthorized(message = '인증이 필요합니다.'): Response {
  return createErrorResponse(
    ERROR_CODES.AUTH_REQUIRED,
    message,
    HTTP_STATUS.UNAUTHORIZED
  );
}

export function forbidden(message = '접근 권한이 없습니다.'): Response {
  return createErrorResponse(
    ERROR_CODES.INSUFFICIENT_PERMISSIONS,
    message,
    HTTP_STATUS.FORBIDDEN
  );
}

export function badRequest(
  message = '잘못된 요청입니다.',
  details?: any
): Response {
  return createErrorResponse(
    ERROR_CODES.INVALID_INPUT,
    message,
    HTTP_STATUS.BAD_REQUEST,
    details
  );
}

export function notFound(message = '리소스를 찾을 수 없습니다.'): Response {
  return createErrorResponse(
    ERROR_CODES.RESOURCE_NOT_FOUND,
    message,
    HTTP_STATUS.NOT_FOUND
  );
}

export function methodNotAllowed(
  message = '허용되지 않는 HTTP 메소드입니다.'
): Response {
  return createErrorResponse(
    ERROR_CODES.OPERATION_NOT_ALLOWED,
    message,
    HTTP_STATUS.METHOD_NOT_ALLOWED
  );
}

export function conflict(message = '리소스가 이미 존재합니다.'): Response {
  return createErrorResponse(
    ERROR_CODES.RESOURCE_ALREADY_EXISTS,
    message,
    HTTP_STATUS.CONFLICT
  );
}

export function internalServerError(
  message = '서버 내부 오류가 발생했습니다.',
  details?: any
): Response {
  return createErrorResponse(
    ERROR_CODES.INTERNAL_ERROR,
    message,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    details
  );
}

export function validationError(
  message = '입력 데이터가 유효하지 않습니다.',
  details?: any
): Response {
  return createErrorResponse(
    ERROR_CODES.VALIDATION_ERROR,
    message,
    HTTP_STATUS.UNPROCESSABLE_ENTITY,
    details
  );
}

// ===== 요청 검증 함수들 =====

/**
 * HTTP 메소드 검증
 */
export function validateMethod(
  request: Request,
  allowedMethods: string[]
): boolean {
  return allowedMethods.includes(request.method);
}

/**
 * 필수 필드 검증
 */
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter((field) => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * 이메일 형식 검증
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * UUID 형식 검증
 */
export function validateUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// ===== 로깅 함수들 =====

/**
 * API 요청 로깅
 */
export function logAPIRequest(
  method: string,
  url: string,
  userId?: string,
  additionalData?: any
): void {
  console.log(`[API] ${method} ${url}`, {
    timestamp: new Date().toISOString(),
    userId,
    ...additionalData,
  });
}

/**
 * API 에러 로깅
 */
export function logAPIError(
  method: string,
  url: string,
  error: Error,
  userId?: string,
  additionalData?: any
): void {
  console.error(`[API ERROR] ${method} ${url}`, {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    userId,
    ...additionalData,
  });
}

// ===== JSON 파싱 함수 =====

/**
 * 안전한 JSON 파싱
 */
export async function parseJSON<T = any>(request: Request): Promise<T | null> {
  try {
    return await request.json();
  } catch (error) {
    logAPIError(request.method, request.url, error as Error);
    return null;
  }
}

/**
 * FormData 파싱
 */
export async function parseFormData(
  request: Request
): Promise<FormData | null> {
  try {
    return await request.formData();
  } catch (error) {
    logAPIError(request.method, request.url, error as Error);
    return null;
  }
}

// ===== 헬퍼 함수들 =====

/**
 * URL에서 쿼리 파라미터 추출
 */
export function getQueryParams(url: string): URLSearchParams {
  return new URL(url).searchParams;
}

/**
 * 요청에서 사용자 IP 추출
 */
export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('remote-addr');

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  return realIP || remoteAddr || 'unknown';
}

/**
 * 요청에서 User-Agent 추출
 */
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown';
}
