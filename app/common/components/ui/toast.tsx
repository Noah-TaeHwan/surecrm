import { useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { Button } from './button';

// 토스트 타입 정의
export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: () => void;
}

// 개별 토스트 컴포넌트
export function Toast({ id, type, title, message, onClose }: ToastProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-300 dark:bg-green-800/80 dark:border-green-700';
      case 'error':
        return 'bg-red-100 border-red-300 dark:bg-red-800/80 dark:border-red-700';
      default:
        return 'bg-blue-100 border-blue-300 dark:bg-blue-800/80 dark:border-blue-700';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800 dark:text-green-200';
      case 'error':
        return 'text-red-800 dark:text-red-200';
      default:
        return 'text-blue-800 dark:text-blue-200';
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border shadow-lg ${getBgColor()} animate-in slide-in-from-right duration-300`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {getIcon()}
          <div>
            <h4 className={`font-medium ${getTextColor()}`}>{title}</h4>
            {message && (
              <p className={`text-sm mt-1 ${getTextColor()} opacity-80`}>
                {message}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// 토스트 컨테이너 컴포넌트
export function ToastContainer({ toasts }: { toasts: ToastProps[] }) {
  return (
    <div className="fixed top-6 right-6 z-50 space-y-3 max-w-sm w-full">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
}

// 토스트 훅
export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Date.now().toString();
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: () => removeToast(id),
    };

    setToasts(prev => [...prev, newToast]);

    // 자동 닫기 (기본 5초)
    const duration = toast.duration || 5000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (title: string, message?: string, duration?: number) => {
    addToast({ type: 'success', title, message, duration });
  };

  const error = (title: string, message?: string, duration?: number) => {
    addToast({ type: 'error', title, message, duration });
  };

  const info = (title: string, message?: string, duration?: number) => {
    addToast({ type: 'info', title, message, duration });
  };

  return {
    toasts,
    success,
    error,
    info,
    removeToast,
  };
}
