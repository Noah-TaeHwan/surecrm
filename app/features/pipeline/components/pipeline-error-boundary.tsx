import { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '~/common/components/ui/button';
import { cn } from '~/lib/utils';

interface PipelineErrorBoundaryProps {
  error?: Error | null;
  reset?: () => void;
  className?: string;
  'aria-label'?: string;
}

// 🎯 접근성을 고려한 에러 상태 컴포넌트
export function PipelineErrorBoundary({
  error,
  reset,
  className,
  'aria-label': ariaLabel = '영업 파이프라인 오류가 발생했습니다.',
}: PipelineErrorBoundaryProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (!reset) return;

    setIsRetrying(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 최소 1초 대기
      reset();
    } finally {
      setIsRetrying(false);
    }
  };

  const handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center min-h-96 p-8 text-center',
        className
      )}
      role="alert"
      aria-label={ariaLabel}
      aria-live="assertive"
    >
      {/* 🎯 에러 아이콘 */}
      <div className="mb-6">
        <AlertCircle
          className="w-16 h-16 text-red-500 mx-auto mb-4"
          aria-hidden="true"
        />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          문제가 발생했습니다
        </h2>
        <p className="text-gray-600 max-w-md">
          영업 파이프라인을 불러오는 중에 오류가 발생했습니다. 잠시 후 다시
          시도해 주세요.
        </p>
      </div>

      {/* 🎯 에러 세부 정보 (개발 환경에서만 표시) */}
      {error && process.env.NODE_ENV === 'development' && (
        <details className="mb-6 max-w-2xl w-full">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
            기술적 세부 정보 보기
          </summary>
          <div className="mt-2 p-4 bg-gray-100 rounded-lg text-left text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
              {error.message}
              {error.stack && (
                <>
                  <br />
                  <br />
                  {error.stack}
                </>
              )}
            </pre>
          </div>
        </details>
      )}

      {/* 🎯 액션 버튼들 */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        {reset && (
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="flex-1"
            aria-describedby="retry-description"
          >
            {isRetrying ? (
              <>
                <RefreshCw
                  className="w-4 h-4 mr-2 animate-spin"
                  aria-hidden="true"
                />
                다시 시도 중...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                다시 시도
              </>
            )}
          </Button>
        )}

        <Button
          variant="outline"
          onClick={handleGoBack}
          className="flex-1"
          aria-describedby="back-description"
        >
          <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
          이전 페이지
        </Button>

        <Button
          variant="outline"
          onClick={handleGoHome}
          className="flex-1"
          aria-describedby="home-description"
        >
          <Home className="w-4 h-4 mr-2" aria-hidden="true" />
          홈으로
        </Button>
      </div>

      {/* 🎯 스크린 리더용 설명 */}
      <div className="sr-only">
        <div id="retry-description">
          영업 파이프라인 데이터를 다시 불러옵니다.
        </div>
        <div id="back-description">이전 페이지로 돌아갑니다.</div>
        <div id="home-description">대시보드 홈 페이지로 이동합니다.</div>
      </div>
    </div>
  );
}

// 🎯 개별 컴포넌트 에러 상태 (부분 오류용)
interface ComponentErrorProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ComponentError({
  title = '데이터 로드 실패',
  description = '이 섹션의 데이터를 불러올 수 없습니다.',
  onRetry,
  className,
}: ComponentErrorProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-6 bg-red-50 border border-red-200 rounded-lg',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="w-8 h-8 text-red-500 mb-3" aria-hidden="true" />
      <h3 className="text-lg font-medium text-red-900 mb-2">{title}</h3>
      <p className="text-sm text-red-700 text-center mb-4">{description}</p>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="border-red-300 text-red-700 hover:bg-red-100"
        >
          <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
          다시 시도
        </Button>
      )}
    </div>
  );
}

// 🎯 네트워크 에러 전용 컴포넌트
export function NetworkError({
  onRetry,
  className,
}: {
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <ComponentError
      title="네트워크 연결 오류"
      description="인터넷 연결을 확인하고 다시 시도해 주세요."
      onRetry={onRetry}
      className={className}
    />
  );
}

// 🎯 권한 에러 전용 컴포넌트
export function PermissionError({ className }: { className?: string }) {
  return (
    <ComponentError
      title="접근 권한 없음"
      description="이 데이터에 접근할 권한이 없습니다. 관리자에게 문의하세요."
      className={className}
    />
  );
}
