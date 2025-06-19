import { useState, useCallback, useEffect } from 'react';
import { cn } from '~/lib/utils';
import { Button } from '~/common/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/common/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '~/common/components/ui/dropdown-menu';
import {
  RefreshCwIcon,
  FilterIcon,
  DownloadIcon,
  SettingsIcon,
  PlusIcon,
  MoreHorizontalIcon,
  TrendingUpIcon,
  UserPlusIcon,
  CalendarIcon,
  BellIcon,
} from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  primary?: boolean; // 주요 액션 (항상 표시)
  mobileVisible?: boolean; // 모바일에서 표시 여부
  desktopVisible?: boolean; // 데스크톱에서 표시 여부
  disabled?: boolean;
  loading?: boolean;
  badge?: number; // 알림 배지
  tooltip?: string;
  category?: 'primary' | 'secondary' | 'utility';
}

interface QuickActionBarProps {
  actions: QuickAction[];
  position?: 'top-right' | 'bottom-right' | 'bottom-center' | 'top-center';
  className?: string;
  mobileBreakpoint?: number;
  maxPrimaryActions?: number; // 모바일에서 표시할 최대 주요 액션 수
  enableNotifications?: boolean;
}

/**
 * 퀵 액션바 - 대시보드용 빠른 액션 모음
 * - 데스크톱: 상단 바 형태
 * - 모바일: 플로팅 액션 버튼
 * - 햅틱 피드백 및 터치 최적화
 * - 알림 배지 지원
 */
export function QuickActionBar({
  actions,
  position = 'top-right',
  className,
  mobileBreakpoint = 768,
  maxPrimaryActions = 3,
  enableNotifications = true,
}: QuickActionBarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mobileBreakpoint]);

  // 햅틱 피드백
  const triggerHaptic = useCallback(
    (intensity: 'light' | 'medium' | 'heavy' = 'light') => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        const patterns = {
          light: 25,
          medium: 50,
          heavy: 100,
        };
        navigator.vibrate(patterns[intensity]);
      }
    },
    []
  );

  // 액션 실행 핸들러
  const handleAction = useCallback(
    (action: QuickAction) => {
      if (action.disabled || action.loading) return;

      triggerHaptic('light');
      action.onClick();

      // 모바일에서 확장된 상태면 닫기
      if (isMobile && isExpanded) {
        setIsExpanded(false);
      }
    },
    [triggerHaptic, isMobile, isExpanded]
  );

  // 액션 필터링
  const visibleActions = actions.filter(action =>
    isMobile ? action.mobileVisible !== false : action.desktopVisible !== false
  );

  const primaryActions = visibleActions.filter(action => action.primary);
  const secondaryActions = visibleActions.filter(action => !action.primary);

  // 모바일 주요 액션 제한
  const limitedPrimaryActions = isMobile
    ? primaryActions.slice(0, maxPrimaryActions)
    : primaryActions;

  // 숨겨진 액션들 (모바일에서 더보기 메뉴로)
  const overflowActions = isMobile
    ? [...primaryActions.slice(maxPrimaryActions), ...secondaryActions]
    : secondaryActions;

  // 위치 스타일 계산
  const getPositionClasses = () => {
    if (isMobile) {
      // 모바일: 플로팅 버튼 위치
      const positionMap = {
        'top-right': 'fixed top-4 right-4 z-50',
        'bottom-right': 'fixed bottom-4 right-4 z-50',
        'bottom-center':
          'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50',
        'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50',
      };
      return positionMap[position];
    } else {
      // 데스크톱: 인라인 바
      return 'flex items-center gap-2';
    }
  };

  if (isMobile) {
    return (
      <TooltipProvider>
        <div className={cn(getPositionClasses(), className)}>
          {/* 확장된 액션들 */}
          {isExpanded && (
            <div className="flex flex-col gap-2 mb-2">
              {overflowActions.map(action => (
                <MobileActionButton
                  key={action.id}
                  action={action}
                  onAction={handleAction}
                  size="sm"
                />
              ))}
            </div>
          )}

          {/* 주요 액션들 */}
          <div className="flex flex-col gap-2">
            {limitedPrimaryActions.map(action => (
              <MobileActionButton
                key={action.id}
                action={action}
                onAction={handleAction}
              />
            ))}

            {/* 더보기 버튼 */}
            {overflowActions.length > 0 && (
              <Button
                variant="default"
                size="lg"
                className={cn(
                  'h-12 w-12 rounded-full shadow-lg',
                  'bg-primary hover:bg-primary/90',
                  'border-2 border-background',
                  'transition-all duration-200',
                  isExpanded && 'rotate-45'
                )}
                onClick={() => {
                  triggerHaptic('medium');
                  setIsExpanded(!isExpanded);
                }}
              >
                <MoreHorizontalIcon className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </TooltipProvider>
    );
  }

  // 데스크톱 버전
  return (
    <TooltipProvider>
      <div className={cn(getPositionClasses(), className)}>
        {/* 주요 액션들 */}
        {limitedPrimaryActions.map(action => (
          <DesktopActionButton
            key={action.id}
            action={action}
            onAction={handleAction}
          />
        ))}

        {/* 더보기 드롭다운 */}
        {overflowActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>추가 액션</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {overflowActions.map(action => (
                <DropdownMenuItem
                  key={action.id}
                  onClick={() => handleAction(action)}
                  disabled={action.disabled || action.loading}
                  className="cursor-pointer"
                >
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.label}
                  {action.badge && action.badge > 0 && (
                    <span className="ml-auto bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                      {action.badge}
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </TooltipProvider>
  );
}

/**
 * 모바일 액션 버튼
 */
interface MobileActionButtonProps {
  action: QuickAction;
  onAction: (action: QuickAction) => void;
  size?: 'sm' | 'md' | 'lg';
}

function MobileActionButton({
  action,
  onAction,
  size = 'md',
}: MobileActionButtonProps) {
  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-12 w-12',
    lg: 'h-14 w-14',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={action.primary ? 'default' : 'secondary'}
          size="lg"
          className={cn(
            sizeClasses[size],
            'rounded-full shadow-lg relative',
            'border-2 border-background',
            'active:scale-90 transition-all duration-200',
            'touch-manipulation',
            action.disabled && 'opacity-50 cursor-not-allowed',
            action.loading && 'animate-pulse'
          )}
          onClick={() => onAction(action)}
          disabled={action.disabled || action.loading}
        >
          <action.icon
            className={cn(iconSizes[size], action.loading && 'animate-spin')}
          />

          {/* 알림 배지 */}
          {action.badge && action.badge > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {action.badge > 99 ? '99+' : action.badge}
            </span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p>{action.tooltip || action.label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * 데스크톱 액션 버튼
 */
interface DesktopActionButtonProps {
  action: QuickAction;
  onAction: (action: QuickAction) => void;
}

function DesktopActionButton({ action, onAction }: DesktopActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={action.primary ? 'default' : 'outline'}
          size="sm"
          className={cn(
            'relative',
            action.disabled && 'opacity-50 cursor-not-allowed',
            action.loading && 'animate-pulse'
          )}
          onClick={() => onAction(action)}
          disabled={action.disabled || action.loading}
        >
          <action.icon
            className={cn('h-4 w-4 mr-2', action.loading && 'animate-spin')}
          />
          {action.label}

          {/* 알림 배지 */}
          {action.badge && action.badge > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
              {action.badge > 9 ? '9+' : action.badge}
            </span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{action.tooltip || action.label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * 기본 대시보드 액션들
 */
export const defaultDashboardActions: QuickAction[] = [
  {
    id: 'refresh',
    label: '새로고침',
    icon: RefreshCwIcon,
    onClick: () => window.location.reload(),
    primary: true,
    tooltip: '대시보드 데이터 새로고침',
    category: 'utility',
  },
  {
    id: 'add-client',
    label: '고객 추가',
    icon: UserPlusIcon,
    onClick: () => {
      // 고객 추가 페이지로 이동
      window.location.href = '/clients/new';
    },
    primary: true,
    tooltip: '새 고객 추가',
    category: 'primary',
  },
  {
    id: 'schedule',
    label: '일정 관리',
    icon: CalendarIcon,
    onClick: () => {
      // 일정 관리 페이지로 이동
      window.location.href = '/schedule';
    },
    primary: true,
    tooltip: '일정 관리',
    category: 'primary',
  },
  {
    id: 'filter',
    label: '필터',
    icon: FilterIcon,
    onClick: () => {
      // 필터 모달 열기
      console.log('필터 모달 열기');
    },
    tooltip: '데이터 필터링',
    category: 'utility',
  },
  {
    id: 'export',
    label: '내보내기',
    icon: DownloadIcon,
    onClick: () => {
      // 데이터 내보내기
      console.log('데이터 내보내기');
    },
    tooltip: '데이터 내보내기',
    category: 'utility',
  },
  {
    id: 'analytics',
    label: '분석',
    icon: TrendingUpIcon,
    onClick: () => {
      // 분석 페이지로 이동
      window.location.href = '/analytics';
    },
    tooltip: '상세 분석 보기',
    category: 'secondary',
  },
  {
    id: 'settings',
    label: '설정',
    icon: SettingsIcon,
    onClick: () => {
      // 설정 페이지로 이동
      window.location.href = '/settings';
    },
    tooltip: '대시보드 설정',
    category: 'utility',
  },
];
