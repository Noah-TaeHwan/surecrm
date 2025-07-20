/**
 * 🌐 API 클라이언트 유틸리티
 * 
 * 통합된 API 호출, 에러 처리, 로딩 상태 관리를 제공합니다.
 */

interface ApiClientOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  toast?: {
    error: (options: { title: string; message?: string }) => void;
    success: (options: { title: string; message?: string }) => void;
  };
  successMessage?: string;
  errorMessage?: string;
  throwOnError?: boolean;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * 통합 API 클라이언트 함수
 * 
 * @example
 * ```ts
 * // 기본 사용법
 * const result = await apiClient('/api/users');
 * 
 * // POST 요청
 * const result = await apiClient('/api/users', {
 *   method: 'POST',
 *   body: { name: 'John Doe' },
 *   successMessage: '사용자가 생성되었습니다',
 *   toast
 * });
 * ```
 */
export async function apiClient<T = any>(
  url: string,
  options: ApiClientOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body,
    toast,
    successMessage,
    errorMessage,
    throwOnError = false,
  } = options;

  try {
    // Request body 처리
    let requestBody: string | FormData | undefined;
    let requestHeaders = { ...headers };

    if (body) {
      if (body instanceof FormData) {
        requestBody = body;
        // FormData인 경우 Content-Type을 설정하지 않음 (브라우저가 자동 설정)
      } else {
        requestBody = JSON.stringify(body);
        requestHeaders['Content-Type'] = 'application/json';
      }
    }

    // API 호출
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: requestBody,
      credentials: 'include', // 쿠키 포함
    });

    // 응답 처리
    const responseText = await response.text();
    let responseData: any;

    try {
      responseData = JSON.parse(responseText);
    } catch {
      // JSON 파싱 실패 시 텍스트 그대로 사용
      responseData = { message: responseText };
    }

    // 에러 응답 처리
    if (!response.ok) {
      const errorMsg = responseData?.error || 
                      responseData?.message || 
                      errorMessage || 
                      `요청 실패 (${response.status})`;

      if (toast?.error) {
        toast.error({ title: '오류 발생', message: errorMsg });
      }

      if (throwOnError) {
        throw new ApiError(errorMsg, response.status, responseData);
      }

      return {
        success: false,
        error: errorMsg,
        data: responseData,
      };
    }

    // 성공 응답 처리
    if (successMessage && toast?.success) {
      toast.success({ title: '성공', message: successMessage });
    }

    return {
      success: true,
      data: responseData,
    };
  } catch (error) {
    // 네트워크 오류 등 예외 처리
    const errorMsg = error instanceof Error 
      ? error.message 
      : '알 수 없는 오류가 발생했습니다';

    if (toast?.error) {
      toast.error({ title: '오류 발생', message: errorMsg });
    }

    if (throwOnError) {
      throw error instanceof ApiError ? error : new Error(errorMsg);
    }

    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * GET 요청 헬퍼 함수
 */
export function apiGet<T = any>(url: string, options?: Omit<ApiClientOptions, 'method' | 'body'>) {
  return apiClient<T>(url, { ...options, method: 'GET' });
}

/**
 * POST 요청 헬퍼 함수
 */
export function apiPost<T = any>(url: string, body?: any, options?: Omit<ApiClientOptions, 'method' | 'body'>) {
  return apiClient<T>(url, { ...options, method: 'POST', body });
}

/**
 * PUT 요청 헬퍼 함수
 */
export function apiPut<T = any>(url: string, body?: any, options?: Omit<ApiClientOptions, 'method' | 'body'>) {
  return apiClient<T>(url, { ...options, method: 'PUT', body });
}

/**
 * DELETE 요청 헬퍼 함수
 */
export function apiDelete<T = any>(url: string, options?: Omit<ApiClientOptions, 'method'>) {
  return apiClient<T>(url, { ...options, method: 'DELETE' });
}

/**
 * 파일 다운로드 헬퍼 함수
 */
export async function downloadFile(url: string, filename?: string) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`다운로드 실패: ${response.status}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename || 'download';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
  } catch (error) {
    throw new Error(
      error instanceof Error 
        ? error.message 
        : '파일 다운로드에 실패했습니다'
    );
  }
}