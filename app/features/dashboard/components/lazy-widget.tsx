import { 
  useState, 
  useEffect, 
  useRef, 
  useCallback, 
  type ReactNode, 
  lazy, 
  Suspense,
  type ComponentType
} from 'react';
import { cn } from '~/lib/utils';
import { Card, CardContent } from '~/common/components/ui/card';
import { Skeleton } from '~/common/components/ui/skeleton';
import { WidgetWrapper } from './dashboard-grid';
import { 
  EyeIcon, 
  ClockIcon,
  WifiOffIcon,
  AlertCircleIcon
} from 'lucide-react';

interface LazyWidgetProps {
  children: ReactNode;
  className?: string;
  threshold?: number; // Intersection threshold (0-1)
  rootMargin?: string; // Root margin for early loading
  fallback?: ReactNode;
  retryCount?: number;
  timeout?: number; // ms
  priority?: 'high' | 'medium' | 'low';
  title?: string;
  description?: string;
  enableOfflineSupport?: boolean;
  enableRetryOnError?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  onVisible?: () => void;
}

interface LazyComponentProps {
  component: () => Promise<{ default: ComponentType<any> }>;
  props?: Record<string, any>;
  fallback?: ReactNode;
  className?: string;
  title?: string;
  priority?: 'high' | 'medium' | 'low';
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Lazy Widget 래퍼 - Intersection Observer 기반 지연 로딩
 * - 뷰포트 진입 시 로딩
 * - 재시도 로직
 * - 오프라인 지원
 * - 성능 모니터링
 */
export function LazyWidget({
  children,
  className,
  threshold = 0.1,
  rootMargin = '50px',
  fallback,
  retryCount = 3,
  timeout = 5000,
  priority = 'medium',
  title,
  description,
  enableOfflineSupport = true,
  enableRetryOnError = true,
  onLoad,
  onError,
  onVisible
}: LazyWidgetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  const elementRef = useRef<HTMLDivElement>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 오프라인 상태 감지
  useEffect(() => {
    if (!enableOfflineSupport) return;

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enableOfflineSupport]);

  // Intersection Observer 설정
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          onVisible?.();
          
          // 우선순위에 따른 로딩 지연
          const delay = {
            high: 0,
            medium: 100,
            low: 300
          }[priority];

          setTimeout(() => {
            loadWidget();
          }, delay);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [threshold, rootMargin, priority, isVisible]);

  // 위젯 로딩 함수
  const loadWidget = useCallback(async () => {
    if (isLoaded || isLoading) return;

    setIsLoading(true);
    setError(null);

    // 오프라인 상태에서는 로딩 시도하지 않음
    if (isOffline && enableOfflineSupport) {
      setIsLoading(false);
      return;
    }

    try {
      // 타임아웃 설정
      if (timeout > 0) {
        loadTimeoutRef.current = setTimeout(() => {
          throw new Error('위젯 로딩 타임아웃');
        }, timeout);
      }

      // 성능 측정 시작
      const startTime = performance.now();

      // 실제 로딩 로직 (children을 비동기적으로 렌더링)
      await new Promise(resolve => {
        setTimeout(resolve, 100); // 시뮬레이션
      });

      // 성능 측정 종료
      const loadTime = performance.now() - startTime;
      
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }

      setIsLoaded(true);
      setIsLoading(false);
      onLoad?.();

      // 성능 로깅 (개발 모드)
      if (process.env.NODE_ENV === 'development') {
        console.log(`Widget "${title}" loaded in ${loadTime.toFixed(2)}ms`);
      }

    } catch (err) {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }

      const error = err instanceof Error ? err : new Error('위젯 로딩 실패');
      setError(error);
      setIsLoading(false);
      onError?.(error);

      // 재시도 로직
      if (enableRetryOnError && retryAttempts < retryCount) {
        const retryDelay = Math.pow(2, retryAttempts) * 1000; // 지수 백오프
        setTimeout(() => {
          setRetryAttempts(prev => prev + 1);
          loadWidget();
        }, retryDelay);
      }
    }
  }, [
    isLoaded, 
    isLoading, 
    isOffline, 
    enableOfflineSupport, 
    timeout, 
    title, 
    onLoad, 
    onError, 
    enableRetryOnError, 
    retryAttempts, 
    retryCount
  ]);

  // 재시도 핸들러
  const handleRetry = useCallback(() => {
    setRetryAttempts(0);
    setError(null);
    loadWidget();
  }, [loadWidget]);

  // 로딩 스켈레톤
  const renderSkeleton = () => {
    if (fallback) return fallback;

    return (
      <WidgetWrapper
        title={title}
        className={cn('animate-pulse', className)}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </div>
      </WidgetWrapper>
    );
  };

  // 오프라인 상태
  const renderOffline = () => (
    <WidgetWrapper
      title={title}
      className={cn('border-muted bg-muted/10', className)}
    >
      <div className="text-center py-8 space-y-3">
        <WifiOffIcon className="h-8 w-8 text-muted-foreground mx-auto" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            오프라인 상태
          </p>
          <p className="text-xs text-muted-foreground">
            인터넷 연결을 확인해주세요
          </p>
        </div>
      </div>
    </WidgetWrapper>
  );

  // 에러 상태
  const renderError = () => (
    <WidgetWrapper
      title={title}
      className={cn('border-destructive/20 bg-destructive/5', className)}
    >
      <div className="text-center py-8 space-y-3">
        <AlertCircleIcon className="h-8 w-8 text-destructive mx-auto" />
        <div className="space-y-2">
          <p className="text-sm font-medium text-destructive">
            위젯 로딩 실패
          </p>
          <p className="text-xs text-muted-foreground">
            {error?.message || '알 수 없는 오류'}
          </p>
          {retryAttempts > 0 && (
            <p className="text-xs text-muted-foreground">
              재시도 {retryAttempts}/{retryCount}
            </p>
          )}
        </div>
        {enableRetryOnError && retryAttempts < retryCount && (
          <button
            onClick={handleRetry}
            className="text-xs text-primary hover:underline"
          >
            다시 시도
          </button>
        )}
      </div>
    </WidgetWrapper>
  );

  // 대기 상태 (아직 뷰포트에 진입하지 않음)
  const renderPending = () => (
    <div 
      ref={elementRef}
      className={cn(
        'min-h-[200px] flex items-center justify-center',
        'border border-dashed border-muted rounded-lg',
        className
      )}
    >
      <div className="text-center space-y-2">
        <EyeIcon className="h-6 w-6 text-muted-foreground mx-auto" />
        <p className="text-sm text-muted-foreground">
          {title ? `${title} 대기 중` : '위젯 대기 중'}
        </p>
      </div>
    </div>
  );

  // 렌더링 로직
  if (!isVisible) return renderPending();
  if (isOffline && enableOfflineSupport) return renderOffline();
  if (error && (!enableRetryOnError || retryAttempts >= retryCount)) return renderError();
  if (isLoading || !isLoaded) return renderSkeleton();

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}

/**
 * 동적 컴포넌트 로더 - React.lazy 기반
 */
export function LazyComponent({
  component,
  props = {},
  fallback,
  className,
  title,
  priority = 'medium',
  onLoad,
  onError
}: LazyComponentProps) {
  const [LazyLoadedComponent, setLazyLoadedComponent] = useState<ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadComponent = async () => {
      if (LazyLoadedComponent) return;

      setLoading(true);
      setError(null);

      try {
        const module = await component();
        if (mounted) {
          setLazyLoadedComponent(() => module.default);
          onLoad?.();
        }
      } catch (err) {
        if (mounted) {
          const error = err instanceof Error ? err : new Error('컴포넌트 로딩 실패');
          setError(error);
          onError?.(error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadComponent();

    return () => {
      mounted = false;
    };
  }, [component, LazyLoadedComponent, onLoad, onError]);

  if (error) {
    return (
      <div className={cn('p-4 border border-destructive/20 bg-destructive/5 rounded-lg', className)}>
        <p className="text-sm text-destructive">{error.message}</p>
      </div>
    );
  }

  if (loading || !LazyLoadedComponent) {
    return fallback || (
      <div className={cn('p-4', className)}>
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <Suspense fallback={fallback || <Skeleton className="h-20 w-full" />}>
      <LazyLoadedComponent {...props} />
    </Suspense>
  );
}

/**
 * 위젯 로딩 훅
 */
export function useLazyWidget() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loadedWidgets, setLoadedWidgets] = useState<Set<string>>(new Set());
  const [failedWidgets, setFailedWidgets] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const markWidgetLoaded = useCallback((widgetId: string) => {
    setLoadedWidgets(prev => new Set([...prev, widgetId]));
    setFailedWidgets(prev => {
      const newSet = new Set(prev);
      newSet.delete(widgetId);
      return newSet;
    });
  }, []);

  const markWidgetFailed = useCallback((widgetId: string) => {
    setFailedWidgets(prev => new Set([...prev, widgetId]));
  }, []);

  const retryFailedWidgets = useCallback(() => {
    setFailedWidgets(new Set());
    // 실제 재시도 로직은 각 위젯에서 처리
  }, []);

  return {
    isOnline,
    loadedWidgets,
    failedWidgets,
    markWidgetLoaded,
    markWidgetFailed,
    retryFailedWidgets
  };
}
