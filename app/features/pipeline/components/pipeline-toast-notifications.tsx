import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';
import { cn } from '~/lib/utils';
import { Button } from '~/common/components/ui/button';

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps extends ToastNotification {
  onClose: (id: string) => void;
}

// 🎯 개별 토스트 컴포넌트 (접근성 최적화)
function Toast({
  id,
  type,
  title,
  message,
  duration = 5000,
  action,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // 🎯 진입 애니메이션
    const showTimer = setTimeout(() => setIsVisible(true), 50);

    // 🎯 자동 닫기 타이머
    const hideTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onClose(id), 300); // 애니메이션 완료 후 제거
  };

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600',
      titleColor: 'text-green-900',
      messageColor: 'text-green-700',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50 border-red-200',
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      messageColor: 'text-red-700',
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-50 border-yellow-200',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-900',
      messageColor: 'text-yellow-700',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      messageColor: 'text-blue-700',
    },
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-md w-full',
        'transition-all duration-300 ease-out transform',
        config.bgColor,
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      )}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      {/* 🎯 상태 아이콘 */}
      <div className="flex-shrink-0">
        <IconComponent
          className={cn('h-5 w-5', config.iconColor)}
          aria-hidden="true"
        />
      </div>

      {/* 🎯 콘텐츠 */}
      <div className="flex-1 min-w-0">
        <h4 className={cn('text-sm font-medium', config.titleColor)}>
          {title}
        </h4>
        {message && (
          <p className={cn('text-sm mt-1', config.messageColor)}>{message}</p>
        )}

        {/* 🎯 액션 버튼 */}
        {action && (
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={action.onClick}
              className="text-xs"
            >
              {action.label}
            </Button>
          </div>
        )}
      </div>

      {/* 🎯 닫기 버튼 */}
      <div className="flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="h-5 w-5 p-0 hover:bg-transparent"
          aria-label="알림 닫기"
        >
          <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
        </Button>
      </div>
    </div>
  );
}

// 🎯 토스트 컨테이너 컴포넌트
interface ToastContainerProps {
  notifications: ToastNotification[];
  onRemove: (id: string) => void;
}

export function ToastContainer({
  notifications,
  onRemove,
}: ToastContainerProps) {
  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
      aria-label="알림 영역"
      role="region"
    >
      {notifications.map(notification => (
        <Toast key={notification.id} {...notification} onClose={onRemove} />
      ))}
    </div>
  );
}

// 🎯 토스트 훅 (상태 관리)
export function useToast() {
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  const addToast = (toast: Omit<ToastNotification, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastNotification = { ...toast, id };

    setNotifications(prev => [...prev, newToast]);

    return id;
  };

  const removeToast = (id: string) => {
    setNotifications(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // 🎯 미리 정의된 토스트 헬퍼들
  const toast = {
    success: (
      title: string,
      message?: string,
      action?: ToastNotification['action']
    ) => addToast({ type: 'success', title, message, action }),

    error: (
      title: string,
      message?: string,
      action?: ToastNotification['action']
    ) => addToast({ type: 'error', title, message, action, duration: 7000 }),

    warning: (
      title: string,
      message?: string,
      action?: ToastNotification['action']
    ) => addToast({ type: 'warning', title, message, action }),

    info: (
      title: string,
      message?: string,
      action?: ToastNotification['action']
    ) => addToast({ type: 'info', title, message, action }),
  };

  return {
    notifications,
    addToast,
    removeToast,
    clearAll,
    toast,
  };
}

// 🎯 파이프라인 전용 토스트 메시지들
export const pipelineToasts = {
  clientMoved: (clientName: string, fromStage: string, toStage: string) => ({
    type: 'success' as const,
    title: '고객 이동 완료',
    message: `${clientName}님이 ${fromStage}에서 ${toStage}로 이동했습니다.`,
  }),

  clientAdded: (clientName: string, stage: string) => ({
    type: 'success' as const,
    title: '고객 추가 완료',
    message: `${clientName}님이 ${stage} 단계에 추가되었습니다.`,
  }),

  clientRemoved: (clientName: string) => ({
    type: 'success' as const,
    title: '고객 제거 완료',
    message: `${clientName}님이 파이프라인에서 제거되었습니다.`,
  }),

  opportunityAdded: (clientName: string) => ({
    type: 'success' as const,
    title: '영업 기회 추가',
    message: `${clientName}님의 새로운 영업 기회가 추가되었습니다.`,
  }),

  moveError: (clientName: string) => ({
    type: 'error' as const,
    title: '이동 실패',
    message: `${clientName}님을 이동하는 중 오류가 발생했습니다.`,
    action: {
      label: '다시 시도',
      onClick: () => window.location.reload(),
    },
  }),

  networkError: () => ({
    type: 'error' as const,
    title: '네트워크 오류',
    message: '인터넷 연결을 확인하고 다시 시도해 주세요.',
    action: {
      label: '새로고침',
      onClick: () => window.location.reload(),
    },
  }),

  dataLoadError: () => ({
    type: 'warning' as const,
    title: '데이터 로드 실패',
    message: '일부 데이터를 불러오지 못했습니다.',
    action: {
      label: '다시 시도',
      onClick: () => window.location.reload(),
    },
  }),
};
