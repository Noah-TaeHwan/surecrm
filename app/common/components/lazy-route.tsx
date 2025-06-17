import { Suspense, lazy, type ComponentType } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { cn } from '~/lib/utils';
import { Skeleton } from '~/common/components/ui/skeleton';
import { AlertCircleIcon, RefreshCwIcon } from 'lucide-react';
import { Button } from '~/common/components/ui/button';

interface LazyRouteProps {
  component: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  errorFallback?: ComponentType<FallbackProps>;
  className?: string;
  enableRetry?: boolean;
}

/**
 * 지연 로딩 라우트 래퍼
 * - React.lazy 기반 코드 스플리팅
 * - 로딩 상태 및 에러 핸들링
 * - 모바일 최적화된 스켈레톤
 * - 재시도 기능
 */
export function LazyRoute({
  component,
  fallback,
  errorFallback,
  className,
  enableRetry = true
}: LazyRouteProps) {
  const LazyComponent = lazy(component);

  const defaultFallback = (
    <div className={cn('min-h-screen flex flex-col', className)}>
      {/* 헤더 스켈레톤 */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 스켈레톤 */}
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* 페이지 타이틀 */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>

          {/* 컨텐츠 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-32 w-full rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 로딩 인디케이터 */}
      <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-3 py-2 rounded-full shadow-lg flex items-center gap-2">
        <RefreshCwIcon className="h-4 w-4 animate-spin" />
        <span className="text-sm font-medium">로딩중...</span>
      </div>
    </div>
  );

  const defaultErrorFallback: ComponentType<FallbackProps> = ({ error, resetErrorBoundary }) => (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <AlertCircleIcon className="h-12 w-12 text-destructive mx-auto" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            페이지 로드 실패
          </h2>
          <p className="text-sm text-muted-foreground">
            페이지를 불러오는 중 오류가 발생했습니다.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="text-xs text-muted-foreground bg-muted p-2 rounded mt-2">
              <summary className="cursor-pointer">오류 상세정보</summary>
              <pre className="mt-2 whitespace-pre-wrap">{error?.message}</pre>
            </details>
          )}
        </div>
        {enableRetry && (
          <div className="flex gap-2 justify-center">
            <Button onClick={resetErrorBoundary} variant="outline">
              다시 시도
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              variant="default"
            >
              페이지 새로고침
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <ErrorBoundary
      FallbackComponent={errorFallback || defaultErrorFallback}
      onReset={() => {
        // 에러 리셋 시 추가 로직
        console.log('Route error boundary reset');
      }}
    >
      <Suspense fallback={fallback || defaultFallback}>
        <LazyComponent />
      </Suspense>
    </ErrorBoundary>
  );
}

/**
 * 라우트 코드 스플리팅 유틸리티
 */
export const createLazyRoute = (
  importFn: () => Promise<{ default: ComponentType<any> }>,
  options?: Omit<LazyRouteProps, 'component'>
) => {
  return () => (
    <LazyRoute 
      component={importFn} 
      {...options} 
    />
  );
};

/**
 * 미리 정의된 스켈레톤 타입들
 */
export const SkeletonTypes = {
  dashboard: (
    <div className="min-h-screen">
      {/* 대시보드 스켈레톤 */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* 환영 섹션 */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>

        {/* KPI 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          ))}
        </div>

        {/* 차트 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    </div>
  ),

  table: (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* 테이블 헤더 */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* 필터 및 검색 */}
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>

        {/* 테이블 스켈레톤 */}
        <div className="rounded-lg border">
          <div className="border-b p-4">
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-20" />
              ))}
            </div>
          </div>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="border-b p-4 last:border-b-0">
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),

  form: (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* 폼 헤더 */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>

          {/* 폼 필드들 */}
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>

          {/* 액션 버튼들 */}
          <div className="flex gap-4 pt-6">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </div>
    </div>
  )
};

/**
 * 타입별 스켈레톤을 사용하는 지연 라우트 생성자
 */
export const createTypedLazyRoute = (
  importFn: () => Promise<{ default: ComponentType<any> }>,
  skeletonType: keyof typeof SkeletonTypes
) => {
  return createLazyRoute(importFn, {
    fallback: SkeletonTypes[skeletonType]
  });
};
