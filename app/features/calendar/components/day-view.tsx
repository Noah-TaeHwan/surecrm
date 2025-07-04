import { cn } from '~/lib/utils';
import { type Meeting } from '../types/types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Clock,
  MapPin,
  User,
  Phone,
  Video,
  Coffee,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { Badge } from '~/common/components/ui/badge';
import { Button } from '~/common/components/ui/button';
import { useViewport } from '~/common/hooks/useViewport';
import { useSyncExternalStore, useRef } from 'react';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';

// 🍎 SureCRM 색상 시스템 통합 (월 뷰와 일치)
const getEventColors = (meeting: Meeting) => {
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

interface DayViewProps {
  selectedDate: Date;
  meetings: Meeting[];
  onMeetingClick: (meeting: Meeting) => void;
  onDateClick?: (date: Date) => void;
  onDayChange?: (date: Date) => void;
}

// 🎨 월 뷰와 일치하는 헤더 컴포넌트
function DayHeader({
  selectedDate,
  onPrevDay,
  onNextDay,
  onTitleClick,
}: {
  selectedDate: Date;
  onPrevDay: () => void;
  onNextDay: () => void;
  onTitleClick?: () => void;
}) {
  const { isMobile } = useViewport();
  const { t, formatDate } = useHydrationSafeTranslation('calendar');

  const titleText = useSyncExternalStore(
    () => () => {},
    () =>
      formatDate(selectedDate, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    () =>
      `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`
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
        onClick={onPrevDay}
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
        onClick={onNextDay}
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

  // 미팅 타입에 따른 아이콘
  const getMeetingIcon = (type: string) => {
    switch (type) {
      case 'first_consultation':
      case 'follow_up':
        return <Coffee className={cn(isMobile ? 'w-3 h-3' : 'w-4 h-4')} />;
      case 'contract_signing':
      case 'contract_review':
        return <User className={cn(isMobile ? 'w-3 h-3' : 'w-4 h-4')} />;
      default:
        return <Clock className={cn(isMobile ? 'w-3 h-3' : 'w-4 h-4')} />;
    }
  };

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
        isMobile ? 'p-2' : 'p-4'
      )}
      onClick={onClick}
      style={style}
    >
      {/* 미팅 헤더 */}
      <div
        className={cn(
          'flex items-start justify-between',
          isMobile ? 'mb-1' : 'mb-2'
        )}
      >
        <div className="flex items-center gap-2">
          {getMeetingIcon(meeting.type)}
          <span
            className={cn('font-semibold', isMobile ? 'text-xs' : 'text-sm')}
          >
            {meeting.time}
          </span>
        </div>
        <div className="flex items-center gap-1">
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
      </div>

      {/* 고객 정보 */}
      <div className={cn(isMobile ? 'space-y-1' : 'space-y-2')}>
        <div className="flex items-center gap-2">
          <User
            className={cn('opacity-90', isMobile ? 'w-3 h-3' : 'w-4 h-4')}
          />
          <span
            className={cn(
              'font-semibold truncate',
              isMobile ? 'text-xs' : 'text-base'
            )}
          >
            {meeting.client.name}
          </span>
        </div>

        {/* 미팅 상세 정보 */}
        <div
          className={cn(
            'space-y-1 opacity-90',
            isMobile ? 'text-xs' : 'text-sm'
          )}
        >
          <div className="flex items-center gap-2">
            <Clock className={cn(isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3')} />
            <span>
              {meeting.duration}
              {t('modals.addMeeting.durationUnit', '분')}
            </span>
          </div>

          {meeting.location && !isMobile && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{meeting.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* 미팅 타입 배지 - 데스크탑에서만 표시 */}
      {!isMobile && (
        <div className="absolute bottom-2 right-2">
          <Badge
            variant="secondary"
            className={cn(
              'text-xs border',
              colors.text,
              'bg-background/20 border-current/30'
            )}
          >
            {t(`meeting.types.${meeting.type}`, meeting.type)}
          </Badge>
        </div>
      )}
    </div>
  );
}

export function DayView({
  selectedDate,
  meetings,
  onMeetingClick,
  onDateClick,
  onDayChange,
}: DayViewProps) {
  const { isMobile } = useViewport();
  const { t, formatDate } = useHydrationSafeTranslation('calendar');

  // 캐시용 ref들
  const currentTimeCache = useRef<{
    hour: number;
    minute: number;
    isVisible: boolean;
  } | null>(null);

  // 해당 날짜의 미팅들만 필터링
  const dayMeetings = meetings.filter((meeting: Meeting) => {
    const meetingDate = new Date(meeting.date);
    return (
      meetingDate.getDate() === selectedDate.getDate() &&
      meetingDate.getMonth() === selectedDate.getMonth() &&
      meetingDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  // 시간대별로 정렬
  const sortedMeetings = dayMeetings.sort((a, b) => {
    const timeA = a.time || '00:00';
    const timeB = b.time || '00:00';
    return timeA.localeCompare(timeB);
  });

  // 시간 슬롯 생성 (8시부터 20시까지 - 일반적인 업무 시간)
  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8);

  // 페이지네이션 핸들러
  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    onDayChange?.(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    onDayChange?.(newDate);
  };

  // 미팅의 시간 위치 계산 (분 단위까지 정확히)
  const getMeetingPosition = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = 8 * 60; // 8AM start
    return Math.max(0, ((totalMinutes - startMinutes) / 60) * 80); // 80px per hour
  };

  // 미팅 지속시간에 따른 높이 계산
  const getMeetingHeight = (duration: number) => {
    return Math.max(60, (duration / 60) * 80); // 최소 60px, 시간당 80px
  };

  // 겹치는 미팅들의 위치 계산 (개선된 알고리즘)
  const calculateMeetingLayouts = (meetings: Meeting[]) => {
    if (meetings.length === 0) return [];

    const sortedMeetings = [...meetings].sort((a, b) => {
      const timeA = a.time || '00:00';
      const timeB = b.time || '00:00';
      if (timeA !== timeB) return timeA.localeCompare(timeB);
      return b.duration - a.duration; // 긴 미팅을 먼저 배치
    });

    const layouts: Array<{
      meeting: Meeting;
      top: number;
      height: number;
      left: number;
      width: number;
      zIndex: number;
    }> = [];

    const groups: Meeting[][] = [];

    // 1. 겹치는 미팅 그룹화
    sortedMeetings.forEach(meeting => {
      let placed = false;
      const start = getMeetingPosition(meeting.time);
      const end = start + getMeetingHeight(meeting.duration);

      for (const group of groups) {
        const lastMeetingInGroup = group[group.length - 1];
        const lastEnd =
          getMeetingPosition(lastMeetingInGroup.time) +
          getMeetingHeight(lastMeetingInGroup.duration);

        if (start < lastEnd) {
          group.push(meeting);
          placed = true;
          break;
        }
      }

      if (!placed) {
        groups.push([meeting]);
      }
    });

    // 2. 각 그룹에 대해 레이아웃 계산
    groups.forEach(group => {
      const columns: Meeting[][] = [];
      group.forEach(meeting => {
        let placed = false;
        const start = getMeetingPosition(meeting.time);
        for (let i = 0; i < columns.length; i++) {
          const column = columns[i];
          const lastMeetingInColumn = column[column.length - 1];
          const lastEnd =
            getMeetingPosition(lastMeetingInColumn.time) +
            getMeetingHeight(lastMeetingInColumn.duration);

          if (start >= lastEnd) {
            column.push(meeting);
            placed = true;
            break;
          }
        }
        if (!placed) {
          columns.push([meeting]);
        }
      });

      const groupWidth = 100 / columns.length;

      columns.forEach((column, colIndex) => {
        column.forEach(meeting => {
          layouts.push({
            meeting,
            top: getMeetingPosition(meeting.time),
            height: getMeetingHeight(meeting.duration),
            left: colIndex * groupWidth,
            width: groupWidth,
            zIndex: 10 + colIndex,
          });
        });
      });
    });

    return layouts;
  };

  // useSyncExternalStore용 빈 구독 함수
  const emptySubscribe = () => () => {};

  // 오늘인지 확인 (hydration-safe)
  const isToday = useSyncExternalStore(
    emptySubscribe,
    () => selectedDate.toDateString() === new Date().toDateString(),
    () => false
  );

  // 현재 시간 (hydration-safe)
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
    () => ({ hour: 0, minute: 0, isVisible: false })
  );

  // 미팅 위치 계산
  const meetingLayouts = calculateMeetingLayouts(sortedMeetings);

  return (
    <div className="bg-card/30 rounded-2xl overflow-hidden border border-border/30 shadow-2xl backdrop-blur-md">
      {/* 헤더 */}
      <DayHeader
        selectedDate={selectedDate}
        onPrevDay={handlePrevDay}
        onNextDay={handleNextDay}
        onTitleClick={() => {}}
      />

      {/* 일정 요약 */}
      <div className="p-4 bg-muted/10 border-b border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              {sortedMeetings.length > 0
                ? t('dayView.eventsCount', {
                    count: sortedMeetings.length,
                  })
                : t('dayView.noEvents', '일정이 없습니다')}
            </span>
          </div>
          {isToday && (
            <Badge variant="outline" className="text-xs">
              {t('actions.today', '오늘')}
            </Badge>
          )}
        </div>
      </div>

      {/* 시간 타임라인 */}
      <div className="relative bg-gradient-to-br from-background/60 to-background/40 overflow-y-auto max-h-[600px]">
        {/* 시간 그리드 */}
        <div className="relative">
          {timeSlots.map(hour => (
            <div key={hour} className="relative">
              {/* 시간 슬롯 */}
              <div className="flex border-b border-border/10">
                <div
                  className={cn(
                    'border-r border-border/20 bg-card/20 sticky left-0 z-10',
                    isMobile ? 'w-16 p-2' : 'w-20 p-3'
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

                {/* 시간 슬롯 영역 */}
                <div
                  className={cn(
                    'flex-1 relative transition-colors duration-200',
                    'cursor-pointer hover:bg-accent/10',
                    isToday && hour === currentTime.hour && 'bg-primary/5',
                    hour % 2 === 0 ? 'bg-card/10' : 'bg-transparent',
                    isMobile ? 'min-h-16 p-2' : 'min-h-20 p-2'
                  )}
                  onClick={() => onDateClick?.(selectedDate)}
                >
                  {/* 현재 시간 표시선 */}
                  {isToday &&
                    hour === currentTime.hour &&
                    currentTime.isVisible && (
                      <div
                        className="absolute left-0 right-0 h-0.5 bg-red-500 z-20 shadow-lg"
                        style={{
                          top: `${(currentTime.minute / 60) * (isMobile ? 64 : 80)}px`,
                        }}
                      >
                        <div className="absolute left-2 top-0 w-3 h-3 bg-red-500 rounded-full -translate-y-1 shadow-sm border-2 border-white flex items-center justify-center">
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                        <div
                          className={cn(
                            'absolute left-7 top-0 text-red-600 font-mono font-semibold -translate-y-2 bg-white rounded shadow-sm border',
                            isMobile
                              ? 'text-xs px-1 py-0.5'
                              : 'text-xs px-1.5 py-0.5'
                          )}
                        >
                          <span>
                            {currentTime.hour.toString().padStart(2, '0')}:
                            {currentTime.minute.toString().padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    )}

                  {/* 30분 구분선 */}
                  <div className="absolute left-0 right-0 top-10 h-px bg-border/20"></div>
                </div>
              </div>
            </div>
          ))}

          {/* 미팅 카드들 */}
          <div className="absolute top-0 left-0 right-0 bottom-0">
            {meetingLayouts.map(
              ({ meeting, top, height, left, width, zIndex }) => (
                <div
                  key={meeting.id}
                  className="absolute overflow-hidden"
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    left: `calc(8.333% + ${left}% * 0.91667)`, // 시간 컬럼(12.5%) 제외 후 계산
                    width: `calc(${width}% * 0.91667)`,
                    zIndex,
                    padding: '0.25rem', // 카드 간 간격
                  }}
                >
                  <MeetingCard
                    meeting={meeting}
                    onClick={() => onMeetingClick(meeting)}
                    style={{ height: '100%', width: '100%' }}
                  />
                </div>
              )
            )}
          </div>
        </div>

        {/* 빈 상태 */}
        {sortedMeetings.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="p-6 bg-muted/20 rounded-full w-fit mx-auto">
                <Clock
                  className={cn(
                    'text-muted-foreground/50',
                    isMobile ? 'w-8 h-8' : 'w-12 h-12'
                  )}
                />
              </div>
              <div className="space-y-2">
                <h3
                  className={cn(
                    'font-semibold text-foreground',
                    isMobile ? 'text-base' : 'text-lg'
                  )}
                >
                  {isToday
                    ? t('dayView.todayNoMeetings', '오늘')
                    : formatDate(selectedDate, {
                        month: 'long',
                        day: 'numeric',
                      })}{' '}
                  {t('dayView.noMeetingsScheduled', '예정된 미팅이 없습니다')}
                </h3>
                <p
                  className={cn(
                    'text-muted-foreground',
                    isMobile ? 'text-sm' : 'text-sm'
                  )}
                >
                  {t(
                    'dayView.scheduleNewMeeting',
                    '새로운 미팅을 예약하여 일정을 관리해보세요.'
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
