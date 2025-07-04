import React from 'react';
import { X, Filter, Calendar, Check } from 'lucide-react';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { Separator } from '~/common/components/ui/separator';
import { cn } from '~/lib/utils';
import { useViewport } from '~/common/hooks/useViewport';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';
import { meetingTypeDetails } from '../types/types';
import type { ViewMode } from '../types/types';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'filter' | 'view-selector' | 'meeting-details';

  // 필터 관련 props
  filteredTypes?: string[];
  onFilterChange?: (types: string[]) => void;

  // 뷰 선택 관련 props
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;

  // 기타
  triggerHapticFeedback: () => void;
}

export function MobileBottomSheet({
  isOpen,
  onClose,
  type,
  filteredTypes,
  onFilterChange,
  viewMode,
  onViewModeChange,
  triggerHapticFeedback,
}: MobileBottomSheetProps) {
  const { isMobile } = useViewport();
  const { t } = useHydrationSafeTranslation('calendar');

  // 모바일이 아닌 경우 렌더링하지 않음
  if (!isMobile || !isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      triggerHapticFeedback();
      onClose();
    }
  };

  const handleFilterToggle = (typeKey: string) => {
    if (!filteredTypes || !onFilterChange) return;

    triggerHapticFeedback();

    const newTypes = filteredTypes.includes(typeKey)
      ? filteredTypes.filter(t => t !== typeKey)
      : [...filteredTypes, typeKey];

    onFilterChange(newTypes);
  };

  const handleSelectAll = () => {
    if (!onFilterChange) return;

    triggerHapticFeedback();
    const allTypes = Object.keys(meetingTypeDetails);
    onFilterChange(allTypes);
  };

  const handleClearAll = () => {
    if (!onFilterChange) return;

    triggerHapticFeedback();
    onFilterChange([]);
  };

  const renderFilterContent = () => (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          {t('filter.title', '미팅 필터')}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            triggerHapticFeedback();
            onClose();
          }}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* 전체 선택/해제 버튼 */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSelectAll}
          className="flex-1"
        >
          <Check className="h-4 w-4 mr-1" />
          {t('sidebar.selectAll', '전체 선택')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearAll}
          className="flex-1"
        >
          <X className="h-4 w-4 mr-1" />
          {t('sidebar.clearAll', '전체 해제')}
        </Button>
      </div>

      <Separator />

      {/* 미팅 타입 필터 */}
      <div className="space-y-3">
        <h4 className="font-medium text-muted-foreground">
          {t('sidebar.filterByType', '타입별 필터')}
        </h4>
        <div className="space-y-2">
          {Object.entries(meetingTypeDetails).map(([typeKey, details]) => {
            const isSelected = filteredTypes?.includes(typeKey) ?? false;

            return (
              <button
                key={typeKey}
                onClick={() => handleFilterToggle(typeKey)}
                className={cn(
                  'w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200',
                  'active:scale-[0.98] active:bg-muted/50',
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-muted-foreground/30'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="text-xl">{details.icon}</div>
                  <div className="text-left">
                    <div className="font-medium">
                      {t(`meeting.types.${typeKey}`, details.label)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {details.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      details.priority === 'high' ? 'destructive' : 'secondary'
                    }
                    className="text-xs"
                  >
                    {details.priority === 'high'
                      ? '높음'
                      : details.priority === 'medium'
                        ? '보통'
                        : '낮음'}
                  </Badge>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 선택 상태 요약 */}
      <div className="bg-muted/30 rounded-lg p-3">
        <div className="text-sm text-muted-foreground">
          {t('filter.selected', '{{count}}개 선택', {
            count: filteredTypes?.length || 0,
          })}
        </div>
      </div>
    </div>
  );

  const renderViewSelectorContent = () => (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          {t('sidebar.viewMode', '보기 방식')}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            triggerHapticFeedback();
            onClose();
          }}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Separator />

      {/* 뷰 모드 선택 */}
      <div className="space-y-2">
        {[
          {
            mode: 'month' as ViewMode,
            label: t('views.month', '월간'),
            icon: '📅',
          },
          {
            mode: 'week' as ViewMode,
            label: t('views.week', '주간'),
            icon: '📊',
          },
          {
            mode: 'day' as ViewMode,
            label: t('views.day', '일간'),
            icon: '📋',
          },
        ].map(({ mode: modeOption, label, icon }) => (
          <button
            key={modeOption}
            onClick={() => {
              triggerHapticFeedback();
              onViewModeChange?.(modeOption);
              onClose();
            }}
            className={cn(
              'w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200',
              'active:scale-[0.98] active:bg-muted/50',
              viewMode === modeOption
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border hover:border-muted-foreground/30'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">{icon}</div>
              <div className="font-medium">{label}</div>
            </div>
            {viewMode === modeOption && (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end"
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          'w-full bg-background rounded-t-3xl shadow-2xl border-t border-border',
          'max-h-[80vh] overflow-y-auto',
          'animate-in slide-in-from-bottom-full duration-300 ease-out'
        )}
        onClick={e => e.stopPropagation()}
      >
        {/* 드래그 핸들 */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* 컨텐츠 */}
        <div className="px-6 pb-6">
          {type === 'filter' && renderFilterContent()}
          {type === 'view-selector' && renderViewSelectorContent()}
        </div>
      </div>
    </div>
  );
}
