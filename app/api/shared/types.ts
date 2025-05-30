/**
 * 🎯 API 공통 타입 정의
 * 모든 API 엔드포인트에서 사용할 표준 타입들
 */

// ===== 공통 요청/응답 타입 =====
export interface APIRequest {
  request: Request;
}

export interface APISuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

export interface APIErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

export type APIResponse<T = any> = APISuccessResponse<T> | APIErrorResponse;

// ===== HTTP 상태 코드 정의 =====
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ===== 에러 코드 정의 =====
export const ERROR_CODES = {
  // 인증 관련
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // 입력 검증
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // 리소스 관련
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_DELETED: 'RESOURCE_DELETED',

  // 서버 관련
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',

  // 비즈니스 로직
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',

  // 레이트 리미팅
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

// ===== 페이지네이션 타입 =====
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ===== 검색 및 필터링 =====
export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
}

// ===== API 메타데이터 =====
export interface APIMetadata {
  timestamp: string;
  requestId: string;
  version: string;
  userId?: string;
  userAgent?: string;
  ip?: string;
}

// ===== 공통 헬퍼 타입 =====
export type ID = string;
export type ISODateString = string;
export type EmailAddress = string;
export type PhoneNumber = string;
