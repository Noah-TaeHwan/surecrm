import { Plus, Calendar, Filter, Settings } from 'lucide-react';
import { useState } from 'react';
import { Button } from '~/common/components/ui/button';
import { cn } from '~/lib/utils';
import { useViewport } from '~/common/hooks/useViewport';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';

interface MobileFABProps {
  onAddMeeting: () => void;
  onFilterToggle: () => void;
  onViewSelectorOpen?: () => void;
  onSettingsOpen?: () => void;
  triggerHapticFeedback: () => void;
}

export function MobileFAB({
  onAddMeeting,
  onFilterToggle,
  onViewSelectorOpen,
  onSettingsOpen,
  triggerHapticFeedback,
}: MobileFABProps) {
  const { isMobile } = useViewport();
  const { t } = useHydrationSafeTranslation('calendar');
  const [isExpanded, setIsExpanded] = useState(false);

  // 모바일이 아닌 경우 렌더링하지 않음
  if (!isMobile) return null;

  const handleMainButtonClick = () => {
    triggerHapticFeedback();

    if (isExpanded) {
      // 확장된 상태에서 클릭하면 새 미팅 추가
      onAddMeeting();
      setIsExpanded(false);
    } else {
      // 축소된 상태에서 클릭하면 확장
      setIsExpanded(true);
    }
  };

  const handleActionClick = (action: () => void) => {
    triggerHapticFeedback();
    action();
    setIsExpanded(false);
  };

  const fabActions = [
    {
      icon: Calendar,
      label: t('actions.scheduleMeeting', '새 미팅 예약'),
      onClick: onAddMeeting,
      variant: 'default' as const,
    },
    {
      icon: Filter,
      label: t('filter.title', '미팅 필터'),
      onClick: onFilterToggle,
      variant: 'secondary' as const,
    },
    ...(onViewSelectorOpen
      ? [
          {
            icon: Calendar,
            label: t('sidebar.viewMode', '보기 방식'),
            onClick: onViewSelectorOpen,
            variant: 'outline' as const,
          },
        ]
      : []),
    ...(onSettingsOpen
      ? [
          {
            icon: Settings,
            label: '설정',
            onClick: onSettingsOpen,
            variant: 'outline' as const,
          },
        ]
      : []),
  ];

  return (
    <>
      {/* 배경 오버레이 (확장 시) */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => {
            triggerHapticFeedback();
            setIsExpanded(false);
          }}
        />
      )}

      {/* FAB 컨테이너 */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse gap-3">
        {/* 확장된 액션 버튼들 */}
        {isExpanded && (
          <div className="flex flex-col-reverse gap-3 animate-in slide-in-from-bottom-2 duration-200">
            {fabActions.map((action, index) => (
              <Button
                key={index}
                size="sm"
                variant={action.variant}
                onClick={() => handleActionClick(action.onClick)}
                className={cn(
                  'h-12 px-4 shadow-lg border-2',
                  'transform transition-all duration-200',
                  'hover:scale-105 active:scale-95',
                  'flex items-center gap-2 min-w-[140px]'
                )}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <action.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{action.label}</span>
              </Button>
            ))}
          </div>
        )}

        {/* 메인 FAB 버튼 */}
        <Button
          size="lg"
          onClick={handleMainButtonClick}
          className={cn(
            'h-14 w-14 rounded-full shadow-2xl border-2 border-white/20',
            'bg-primary hover:bg-primary/90 text-primary-foreground',
            'transform transition-all duration-300 hover:scale-110 active:scale-95',
            'flex items-center justify-center',
            // iOS 스타일 그림자
            'shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
            isExpanded && 'rotate-45'
          )}
        >
          <Plus
            className={cn(
              'h-6 w-6 transition-transform duration-300',
              isExpanded && 'rotate-45'
            )}
          />
        </Button>
      </div>
    </>
  );
}
