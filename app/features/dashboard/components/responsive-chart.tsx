import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { cn } from '~/lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import {
  ExpandIcon,
  ShrinkIcon,
  DownloadIcon,
  RefreshCwIcon,
  TrendingUpIcon,
  BarChartIcon,
} from 'lucide-react';

interface ChartDimensions {
  width: number;
  height: number;
}

interface ResponsiveChartProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  aspectRatio?: number; // 기본 16:9 = 1.78
  minHeight?: number;
  maxHeight?: number;
  enableFullscreen?: boolean;
  enableDownload?: boolean;
  enableRefresh?: boolean;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onDownload?: () => void;
  mobileOptimizations?: {
    enablePanZoom?: boolean;
    reducedAnimations?: boolean;
    simplifiedTooltips?: boolean;
    touchOptimized?: boolean;
  };
  breakpoints?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

/**
 * 반응형 차트 래퍼 컴포넌트
 * - 모바일 터치 최적화
 * - 자동 크기 조정
 * - 전체화면 모드
 * - 로딩/에러 상태 처리
 * - 다운로드/새로고침 기능
 */
export function ResponsiveChart({
  children,
  title,
  description,
  className,
  aspectRatio = 1.78, // 16:9
  minHeight = 200,
  maxHeight = 600,
  enableFullscreen = true,
  enableDownload = false,
  enableRefresh = false,
  loading = false,
  error = null,
  onRefresh,
  onDownload,
  mobileOptimizations = {
    enablePanZoom: true,
    reducedAnimations: true,
    simplifiedTooltips: true,
    touchOptimized: true,
  },
  breakpoints = {
    mobile: 640,
    tablet: 768,
    desktop: 1024,
  },
}: ResponsiveChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<ChartDimensions>({
    width: 0,
    height: 0,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>(
    'desktop'
  );

  // 디바이스 타입 감지
  useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      if (width < breakpoints.mobile) {
        setDeviceType('mobile');
      } else if (width < breakpoints.tablet) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    return () => window.removeEventListener('resize', updateDeviceType);
  }, [breakpoints]);

  // 반응형 크기 계산
  const updateDimensions = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.offsetWidth;

    let calculatedHeight: number;

    if (isFullscreen) {
      // 전체화면 모드
      calculatedHeight = window.innerHeight - 120; // 여백 고려
    } else {
      // 일반 모드: 종횡비 기반 계산
      calculatedHeight = containerWidth / aspectRatio;

      // 모바일에서는 높이 제한
      if (deviceType === 'mobile') {
        calculatedHeight = Math.min(calculatedHeight, 300);
      }
    }

    // 최소/최대 높이 제한
    calculatedHeight = Math.max(
      minHeight,
      Math.min(maxHeight, calculatedHeight)
    );

    setDimensions({
      width: containerWidth,
      height: calculatedHeight,
    });
  }, [aspectRatio, minHeight, maxHeight, isFullscreen, deviceType]);

  // ResizeObserver로 크기 변화 감지
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    resizeObserver.observe(containerRef.current);
    updateDimensions(); // 초기 크기 설정

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateDimensions]);

  // 햅틱 피드백
  const triggerHaptic = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }
  }, []);

  // 전체화면 토글
  const toggleFullscreen = useCallback(() => {
    triggerHaptic();
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen, triggerHaptic]);

  // 새로고침 핸들러
  const handleRefresh = useCallback(() => {
    triggerHaptic();
    onRefresh?.();
  }, [onRefresh, triggerHaptic]);

  // 다운로드 핸들러
  const handleDownload = useCallback(() => {
    triggerHaptic();
    onDownload?.();
  }, [onDownload, triggerHaptic]);

  // 모바일 최적화 스타일
  const getMobileOptimizedStyles = (): CSSProperties => {
    if (deviceType !== 'mobile') return {};

    return {
      touchAction: mobileOptimizations.enablePanZoom ? 'pan-x pan-y' : 'none',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      WebkitTouchCallout: 'none',
    };
  };

  // 액션 버튼들
  const renderActionButtons = () => {
    const buttons = [];

    if (enableRefresh && onRefresh) {
      buttons.push(
        <Button
          key="refresh"
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="h-8 w-8 p-0"
        >
          <RefreshCwIcon className={cn('h-4 w-4', loading && 'animate-spin')} />
        </Button>
      );
    }

    if (enableDownload && onDownload) {
      buttons.push(
        <Button
          key="download"
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          disabled={loading}
          className="h-8 w-8 p-0"
        >
          <DownloadIcon className="h-4 w-4" />
        </Button>
      );
    }

    if (enableFullscreen) {
      buttons.push(
        <Button
          key="fullscreen"
          variant="ghost"
          size="sm"
          onClick={toggleFullscreen}
          className="h-8 w-8 p-0"
        >
          {isFullscreen ? (
            <ShrinkIcon className="h-4 w-4" />
          ) : (
            <ExpandIcon className="h-4 w-4" />
          )}
        </Button>
      );
    }

    return buttons.length > 0 ? (
      <div className="flex items-center gap-1">{buttons}</div>
    ) : null;
  };

  // 로딩 상태
  if (loading) {
    return (
      <Card className={cn('w-full', className)}>
        {(title || description) && (
          <CardHeader>
            {title && (
              <CardTitle className="flex items-center gap-2">
                <BarChartIcon className="h-5 w-5" />
                {title}
              </CardTitle>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </CardHeader>
        )}
        <CardContent>
          <div
            className="flex items-center justify-center bg-muted/20 rounded-lg animate-pulse"
            style={{ height: minHeight }}
          >
            <div className="text-center space-y-2">
              <RefreshCwIcon className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">차트 로딩 중...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Card
        className={cn(
          'w-full border-destructive/20 bg-destructive/5',
          className
        )}
      >
        {(title || description) && (
          <CardHeader>
            {title && (
              <CardTitle className="text-destructive">{title}</CardTitle>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </CardHeader>
        )}
        <CardContent>
          <div
            className="flex items-center justify-center border-destructive/20 bg-destructive/5 rounded-lg"
            style={{ height: minHeight }}
          >
            <div className="text-center space-y-2">
              <TrendingUpIcon className="h-8 w-8 text-destructive mx-auto" />
              <p className="text-sm font-medium text-destructive">
                차트 로딩 실패
              </p>
              <p className="text-xs text-muted-foreground">{error}</p>
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="mt-2"
                >
                  다시 시도
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 전체화면 모드
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto h-full flex flex-col p-4">
          {/* 전체화면 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <div>
              {title && <h2 className="text-xl font-semibold">{title}</h2>}
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            {renderActionButtons()}
          </div>

          {/* 전체화면 차트 */}
          <div
            ref={containerRef}
            className="flex-1 w-full"
            style={getMobileOptimizedStyles()}
          >
            <div
              className="w-full h-full"
              style={{
                width: dimensions.width,
                height: dimensions.height,
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 일반 모드
  return (
    <Card className={cn('w-full', className)}>
      {/* 헤더 */}
      {(title || description || renderActionButtons()) && (
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              {title && (
                <CardTitle className="flex items-center gap-2">
                  <BarChartIcon className="h-5 w-5" />
                  {title}
                </CardTitle>
              )}
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            {renderActionButtons()}
          </div>
        </CardHeader>
      )}

      {/* 차트 컨텐츠 */}
      <CardContent>
        <div
          ref={containerRef}
          className={cn(
            'w-full overflow-hidden rounded-lg',
            'transition-all duration-200 ease-in-out',
            // 모바일 터치 최적화
            deviceType === 'mobile' && [
              'touch-manipulation',
              mobileOptimizations.touchOptimized && 'select-none',
            ]
          )}
          style={getMobileOptimizedStyles()}
        >
          <div
            className="w-full"
            style={{
              width: dimensions.width,
              height: dimensions.height,
            }}
          >
            {children}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 차트 컨테이너 훅 - 차트 상태 관리
 */
export function useResponsiveChart() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const refresh = useCallback(async (dataLoader: () => Promise<any>) => {
    setLoading(true);
    setError(null);

    try {
      const newData = await dataLoader();
      setData(newData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터 로딩 실패');
    } finally {
      setLoading(false);
    }
  }, []);

  const download = useCallback(
    (filename: string = 'chart-data.json') => {
      if (!data) return;

      try {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('차트 데이터 다운로드 실패:', err);
      }
    },
    [data]
  );

  return {
    loading,
    error,
    data,
    setData,
    setLoading,
    setError,
    refresh,
    download,
  };
}
