import { cn } from '~/lib/utils';
import { type Meeting } from '../types/types';
import { Fragment, useSyncExternalStore, useRef } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Clock,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
} from 'lucide-react';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { useViewport } from '~/common/hooks/useViewport';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';

// 🍎 SureCRM 색상 시스템 통합 (iOS 네이티브 스타일)
const getEventColors = (meeting: Meeting) => {
  // 비즈니스 로직에 따른 색상 매핑
  const colorMap = {
    // 기본: 중성 회색
    neutral: {
      bg: 'bg-gray-50 dark:bg-gray-900/20',
      border: 'border-gray-200 dark:border-gray-700/50',
      text: 'text-gray-700 dark:text-gray-300',
      dot: 'bg-gray-400 dark:bg-gray-500',
    },
    // 첫 상담: 스카이
    sky: {
      bg: 'bg-sky-50 dark:bg-sky-950/20',
      border: 'border-sky-200 dark:border-sky-800/50',
      text: 'text-sky-700 dark:text-sky-300',
      dot: 'bg-sky-500',
    },
    // 성공/완료: 에메랄드
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      border: 'border-emerald-200 dark:border-emerald-800/50',
      text: 'text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    },
    // 진행중/검토: 앰버
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      border: 'border-amber-200 dark:border-amber-800/50',
      text: 'text-amber-700 dark:text-amber-300',
      dot: 'bg-amber-500',
    },
    // 중요/긴급: 로즈
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/20',
      border: 'border-rose-200 dark:border-rose-800/50',
      text: 'text-rose-700 dark:text-rose-300',
      dot: 'bg-rose-500',
    },
    // 특별/VIP: 바이올렛
    violet: {
      bg: 'bg-violet-50 dark:bg-violet-950/20',
      border: 'border-violet-200 dark:border-violet-800/50',
      text: 'text-violet-700 dark:text-violet-300',
      dot: 'bg-violet-500',
    },
  };

  const typeColorMap: Record<string, keyof typeof colorMap> = {
    first_consultation: 'sky',
    needs_analysis: 'emerald',
    product_explanation: 'amber',
    contract_review: 'rose',
    contract_signing: 'emerald',
    follow_up: 'violet',
    claim_support: 'rose',
    other: 'neutral',
  };

  // 구글 캘린더 이벤트는 중성 색상
  if (meeting.syncInfo?.externalSource === 'google') {
    return colorMap['neutral'];
  }

  const colorKey = typeColorMap[meeting.type] || 'neutral';
  return colorMap[colorKey];
};

interface WeekViewProps {
  selectedDate: Date;
  meetings: Meeting[];
  onMeetingClick: (meeting: Meeting) => void;
  onDateClick?: (date: Date) => void;
  onWeekChange?: (date: Date) => void;
}

// useSyncExternalStore용 빈 구독 함수
const emptySubscribe = () => () => {};

// 🎨 월 뷰와 일치하는 헤더 컴포넌트
function WeekHeader({
  selectedDate,
  onPrevWeek,
  onNextWeek,
  onTitleClick,
}: {
  selectedDate: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onTitleClick?: () => void;
}) {
  const { isMobile } = useViewport();
  const { t, formatDate, getCurrentLanguage } =
    useHydrationSafeTranslation('calendar');

  // 주의 시작일과 종료일 계산
  const weekStart = new Date(selectedDate);
  weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const titleText = useSyncExternalStore(
    emptySubscribe,
    () => {
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${formatDate(weekStart, { year: 'numeric', month: 'long' })} ${weekStart.getDate()} - ${weekEnd.getDate()}일`;
      } else {
        return `${formatDate(weekStart, { month: 'long', day: 'numeric' })} - ${formatDate(weekEnd, { month: 'long', day: 'numeric' })}`;
      }
    },
    () =>
      `${weekStart.getMonth() + 1}월 ${weekStart.getDate()} - ${weekEnd.getDate()}일`
  );

  return (
    <div
      className={cn(
        'flex items-center justify-between p-4',
        'bg-card/80 backdrop-blur-sm',
        'border-b border-border/50',
        'sticky top-0 z-10'
      )}
    >
      <Button
        variant="ghost"
        size={isMobile ? 'default' : 'sm'}
        onClick={onPrevWeek}
        className={cn(
          'p-2 rounded-lg text-muted-foreground',
          'hover:bg-muted/50 hover:text-foreground',
          'transition-all duration-200',
          isMobile && 'min-w-[44px] min-h-[44px]'
        )}
      >
        <ChevronLeft className={cn(isMobile ? 'h-5 w-5' : 'h-4 w-4')} />
      </Button>

      <button
        onClick={onTitleClick}
        className={cn(
          'font-bold text-foreground',
          'hover:text-primary transition-colors',
          isMobile ? 'text-xl' : 'text-lg'
        )}
      >
        {titleText}
      </button>

      <Button
        variant="ghost"
        size={isMobile ? 'default' : 'sm'}
        onClick={onNextWeek}
        className={cn(
          'p-2 rounded-lg text-muted-foreground',
          'hover:bg-muted/50 hover:text-foreground',
          'transition-all duration-200',
          isMobile && 'min-w-[44px] min-h-[44px]'
        )}
      >
        <ChevronRight className={cn(isMobile ? 'h-5 w-5' : 'h-4 w-4')} />
      </Button>
    </div>
  );
}

// 🧱 요일 헤더 컴포넌트 (월 뷰와 일치)
function WeekdayHeader({ weekDates }: { weekDates: Date[] }) {
  const { isMobile } = useViewport();
  const { t, getCurrentLanguage } = useHydrationSafeTranslation('calendar');

  const getWeekdays = () => {
    const lang = getCurrentLanguage();
    switch (lang) {
      case 'en':
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      case 'ja':
        return ['日', '月', '火', '水', '木', '金', '土'];
      default: // ko
        return ['일', '월', '화', '수', '목', '금', '토'];
    }
  };

  const weekdays = getWeekdays();
  const isToday = (date: Date) =>
    date.toDateString() === new Date().toDateString();

  return (
    <div
      className={cn(
        'grid grid-cols-8 gap-1 bg-muted/20 border-b border-border/30',
        isMobile ? 'py-2 px-2' : 'py-3 px-3'
      )}
    >
      {/* 시간 컬럼 헤더 */}
      <div
        className={cn(
          'text-center font-medium text-muted-foreground',
          isMobile ? 'text-xs py-2' : 'text-sm py-2'
        )}
      >
        {t('weekView.time', '시간')}
      </div>

      {/* 요일 헤더들 */}
      {weekDates.map((date, index) => (
        <div
          key={date.toISOString()}
          className={cn(
            'text-center transition-colors duration-200',
            isToday(date) && 'bg-primary/10 rounded-lg',
            index === 0 && 'text-red-500', // 일요일
            index === 6 && 'text-blue-500' // 토요일
          )}
        >
          <div
            className={cn(
              'font-medium text-muted-foreground',
              isMobile ? 'text-xs' : 'text-sm'
            )}
          >
            {weekdays[index]}
          </div>
          <div
            className={cn(
              'font-bold transition-colors duration-200',
              isMobile ? 'text-lg' : 'text-base',
              isToday(date)
                ? 'text-primary bg-primary/20 rounded-full w-8 h-8 flex items-center justify-center mx-auto'
                : 'text-foreground'
            )}
          >
            {date.getDate()}
          </div>
        </div>
      ))}
    </div>
  );
}

// 📦 개선된 미팅 카드 컴포넌트
function MeetingCard({
  meeting,
  onClick,
  style,
}: {
  meeting: Meeting;
  onClick: () => void;
  style?: React.CSSProperties;
}) {
  const { isMobile } = useViewport();
  const { t } = useHydrationSafeTranslation('calendar');
  const colors = getEventColors(meeting);

  return (
    <div
      className={cn(
        'relative rounded-lg cursor-pointer transition-all duration-200',
        'transform hover:scale-105 hover:shadow-lg',
        'border shadow-sm backdrop-blur-sm',
        'overflow-hidden',
        // 월 뷰와 일치하는 색상 시스템
        colors.bg,
        colors.border,
        colors.text,
        isMobile ? 'p-1.5 min-h-[40px]' : 'p-3 min-h-[80px]'
      )}
      onClick={onClick}
      style={{
        ...style,
        minHeight: isMobile ? '40px' : '80px',
        maxHeight: isMobile ? '80px' : '160px',
      }}
    >
      {/* 미팅 시간 및 상태 */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <div className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />
          <Clock
            className={cn(
              'opacity-70',
              isMobile ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'
            )}
          />
          <span
            className={cn('font-semibold', isMobile ? 'text-xs' : 'text-sm')}
          >
            {meeting.time}
          </span>
        </div>

        {/* 동기화 상태 표시 */}
        {meeting.syncInfo?.syncStatus === 'conflict' && (
          <div
            className={cn(
              'rounded-full bg-red-500 animate-pulse',
              isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'
            )}
          />
        )}
        {meeting.syncInfo?.syncStatus === 'synced' &&
          meeting.syncInfo?.externalSource !== 'surecrm' && (
            <div
              className={cn(
                'rounded-full bg-green-500',
                isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'
              )}
            />
          )}
      </div>

      {/* 고객 이름 */}
      <div className="flex items-center gap-1 mb-1">
        <User
          className={cn('opacity-70', isMobile ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5')}
        />
        <span
          className={cn(
            'font-medium truncate',
            isMobile ? 'text-xs' : 'text-sm'
          )}
        >
          {meeting.client.name}
        </span>
      </div>

      {/* 미팅 타입 - 모바일에서는 생략 가능 */}
      {!isMobile && (
        <div className={cn('opacity-90 truncate text-sm')}>
          {t(`meeting.types.${meeting.type}`, meeting.type)}
        </div>
      )}

      {/* 위치 정보 - 데스크탑에서만 표시 */}
      {meeting.location && !isMobile && (
        <div className="flex items-center gap-1 mt-1">
          <MapPin className="h-3 w-3 opacity-70" />
          <span className="text-xs opacity-70 truncate">
            {meeting.location}
          </span>
        </div>
      )}
    </div>
  );
}

export function WeekView({
  selectedDate,
  meetings,
  onMeetingClick,
  onDateClick,
  onWeekChange,
}: WeekViewProps) {
  const { isMobile } = useViewport();
  const { t } = useHydrationSafeTranslation('calendar');

  // 현재 시간 캐시용 ref
  const currentTimeCache = useRef<{
    hour: number;
    minute: number;
    isVisible: boolean;
  } | null>(null);

  // 주의 시작일 계산 (일요일)
  const weekStart = new Date(selectedDate);
  weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());

  // 일주일간의 날짜들 생성
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    return date;
  });

  // 시간 슬롯 생성 (8시부터 20시까지 - 일반적인 업무 시간)
  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8);

  // 날짜별로 미팅 그룹화
  const meetingsByDate = weekDates.map(date => {
    const dateStr = date.toISOString().split('T')[0];
    return meetings.filter(meeting => meeting.date === dateStr);
  });

  // 페이지네이션 핸들러
  const handlePrevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 7);
    onWeekChange?.(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 7);
    onWeekChange?.(newDate);
  };

  // 현재 시간 정보 (hydration-safe)
  const currentTime = useSyncExternalStore(
    emptySubscribe,
    () => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const isVisible = hour >= 8 && hour <= 20;

      if (currentTimeCache.current) {
        const cached = currentTimeCache.current;
        if (
          cached.hour === hour &&
          cached.minute === minute &&
          cached.isVisible === isVisible
        ) {
          return cached;
        }
      }

      const newValue = { hour, minute, isVisible };
      currentTimeCache.current = newValue;
      return newValue;
    },
    () => ({ hour: -1, minute: 0, isVisible: false })
  );

  const isToday = (date: Date) =>
    date.toDateString() === new Date().toDateString();
  const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

  return (
    <div className="bg-card/30 rounded-2xl overflow-hidden border border-border/30 shadow-2xl backdrop-blur-md">
      {/* 헤더 */}
      <WeekHeader
        selectedDate={selectedDate}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onTitleClick={() => {}}
      />

      {/* 요일 헤더 */}
      <WeekdayHeader weekDates={weekDates} />

      {/* 시간 그리드 */}
      <div className="relative bg-gradient-to-br from-background/60 to-background/40 overflow-x-auto">
        <div
          className={cn(
            'grid grid-cols-8 relative',
            // 월 뷰와 일치하는 최소 너비 설정 + 모바일 최적화
            isMobile ? 'min-w-[600px]' : 'min-w-[800px]'
          )}
        >
          {timeSlots.map(hour => (
            <Fragment key={hour}>
              {/* 시간 라벨 */}
              <div
                className={cn(
                  'border-r border-b border-border/20 bg-card/20 sticky left-0 z-10',
                  'flex items-center justify-center',
                  isMobile ? 'min-h-[60px]' : 'min-h-[80px]' // 모바일에서 더 조밀한 높이
                )}
              >
                <div
                  className={cn(
                    'font-medium text-muted-foreground',
                    isMobile ? 'text-xs' : 'text-sm'
                  )}
                >
                  {hour.toString().padStart(2, '0')}:00
                </div>
              </div>

              {/* 각 날짜의 시간 슬롯 */}
              {weekDates.map((date, dayIndex) => {
                const dateStr = date.toISOString().split('T')[0];
                const dayMeetings = meetings.filter(
                  meeting => meeting.date === dateStr
                );

                // 현재 시간 슬롯에 해당하는 미팅들
                const hourMeetings = dayMeetings.filter(meeting => {
                  const meetingHour = parseInt(meeting.time.split(':')[0]);
                  return meetingHour === hour;
                });

                const isTodayCell = isToday(date);
                const isCurrentHour = isTodayCell && currentTime.hour === hour;

                return (
                  <div
                    key={`${dateStr}-${hour}`}
                    className={cn(
                      'relative border-r border-b border-border/20 last:border-r-0',
                      'group hover:bg-accent/20 transition-all duration-200',
                      isTodayCell && 'bg-primary/5 hover:bg-primary/10',
                      isWeekend(date) && 'bg-muted/10',
                      isCurrentHour && 'bg-primary/10',
                      'cursor-pointer',
                      isMobile ? 'min-h-[60px] p-1' : 'min-h-[80px] p-2'
                    )}
                    onClick={() => onDateClick?.(date)}
                  >
                    {/* 미팅 카드들 */}
                    <div
                      className={cn(
                        'relative z-10',
                        isMobile ? 'space-y-0.5' : 'space-y-1'
                      )}
                    >
                      {hourMeetings.map((meeting, meetingIndex) => (
                        <MeetingCard
                          key={meeting.id}
                          meeting={meeting}
                          onClick={() => onMeetingClick(meeting)}
                          style={{
                            zIndex: 10 + meetingIndex,
                          }}
                        />
                      ))}
                    </div>

                    {/* 호버 시 시간 표시 */}
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-50 transition-opacity duration-200 z-0">
                      <span
                        className={cn(
                          'text-muted-foreground font-mono',
                          isMobile ? 'text-xs' : 'text-xs'
                        )}
                      >
                        {hour.toString().padStart(2, '0')}:00
                      </span>
                    </div>
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>

        {/* 현재 시간 표시선 */}
        {weekDates.some(date => isToday(date)) && currentTime.isVisible && (
          <div className="absolute left-0 right-0 pointer-events-none z-30">
            {(() => {
              const hoursSinceStart = currentTime.hour - 8;
              const minuteOffset =
                (currentTime.minute / 60) * (isMobile ? 60 : 80);
              const headerHeight = isMobile ? 120 : 160; // 모바일 헤더 높이 조정
              const position =
                headerHeight +
                hoursSinceStart * (isMobile ? 60 : 80) +
                minuteOffset;

              return (
                <div
                  className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-lg"
                  style={{ top: `${position}px` }}
                >
                  <div className="absolute left-2 top-0 w-3 h-3 bg-red-500 rounded-full -translate-y-1 shadow-sm border-2 border-white">
                    <div className="absolute inset-1 bg-white rounded-full"></div>
                  </div>
                  <div
                    className={cn(
                      'absolute left-6 top-0 text-red-600 font-mono font-semibold -translate-y-2 bg-white px-1 rounded shadow-sm',
                      isMobile ? 'text-xs' : 'text-xs'
                    )}
                  >
                    {currentTime.hour.toString().padStart(2, '0')}:
                    {currentTime.minute.toString().padStart(2, '0')}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
