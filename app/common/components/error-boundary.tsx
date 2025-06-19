import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircleIcon, RefreshCwIcon } from 'lucide-react';
import { Button } from '~/common/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * React Error Boundary 컴포넌트
 * react-error-boundary 패키지의 기본 기능을 구현
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-background border border-border rounded-lg">
          <AlertCircleIcon className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            문제가 발생했습니다
          </h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 잠시 후
            다시 시도해 주세요.
          </p>
          <Button
            onClick={() => {
              this.setState({ hasError: false, error: undefined });
              window.location.reload();
            }}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCwIcon className="w-4 h-4" />
            다시 시도
          </Button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-muted-foreground">
                개발자 정보
              </summary>
              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-w-md">
                {this.state.error.toString()}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-style Error Reset 함수
 */
export const useErrorHandler = () => {
  return (error: Error) => {
    console.error('Manual error thrown:', error);
    throw error;
  };
};
