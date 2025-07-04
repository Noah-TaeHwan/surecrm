import { cn } from '~/lib/utils';
import { type Meeting } from '../types/types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Clock, MapPin, User, Phone, Video, Coffee } from 'lucide-react';
import { Badge } from '~/common/components/ui/badge';
import { useDeviceType } from '~/common/hooks/use-viewport';
import { useSyncExternalStore } from 'react';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';

// 🍎 SureCRM 색상 시스템 통합 (iOS 네이티브 스타일)
const getEventColors = (meeting: Meeting) => {
  // 비즈니스 로직에 따른 색상 매핑
  const type = meeting.type;

  if (type === 'first_consultation') {
    return {
      bg: 'bg-sky-500/90 hover:bg-sky-600/90',
      border: 'border-sky-400/50',
      text: 'text-white',
      dot: 'bg-sky-500',
    };
  } else if (type === 'contract_signing') {
    return {
      bg: 'bg-emerald-500/90 hover:bg-emerald-600/90',
      border: 'border-emerald-400/50',
      text: 'text-white',
      dot: 'bg-emerald-500',
    };
  } else if (type === 'follow_up') {
    return {
      bg: 'bg-amber-500/90 hover:bg-amber-600/90',
      border: 'border-amber-400/50',
      text: 'text-white',
      dot: 'bg-amber-500',
    };
  } else if (type === 'urgent') {
    return {
      bg: 'bg-rose-500/90 hover:bg-rose-600/90',
      border: 'border-rose-400/50',
      text: 'text-white',
      dot: 'bg-rose-500',
    };
  } else if (type === 'vip') {
    return {
      bg: 'bg-violet-500/90 hover:bg-violet-600/90',
      border: 'border-violet-400/50',
      text: 'text-white',
      dot: 'bg-violet-500',
    };
  }

  // 기본값 (구글 캘린더 이벤트 등)
  return {
    bg: 'bg-gray-500/90 hover:bg-gray-600/90',
    border: 'border-gray-400/50',
    text: 'text-white',
    dot: 'bg-gray-500',
  };
};

interface DayViewProps {
  selectedDate: Date;
  meetings: Meeting[];
  onMeetingClick: (meeting: Meeting) => void;
}

export function DayView({
  selectedDate,
  meetings,
  onMeetingClick,
}: DayViewProps) {
  const deviceType = useDeviceType();
  const { t, formatDate } = useHydrationSafeTranslation('calendar');

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

  // 시간 슬롯 생성 (5시부터 23시까지 - 더 넓은 범위)
  const timeSlots = Array.from({ length: 19 }, (_, i) => i + 5);

  // 미팅 타입에 따른 아이콘
  const getMeetingIcon = (type: string) => {
    switch (type) {
      case 'first_consultation':
      case 'follow_up':
        return <Coffee className="w-4 h-4" />;
      case 'contract_signing':
      case 'contract_review':
        return <User className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // 미팅의 시간 위치 계산 (분 단위까지 정확히)
  const getMeetingPosition = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = 5 * 60; // 5AM start
    return Math.max(0, ((totalMinutes - startMinutes) / 60) * 80); // 80px per hour
  };

  // 미팅 지속시간에 따른 높이 계산
  const getMeetingHeight = (duration: number) => {
    return Math.max(60, (duration / 60) * 80); // 최소 60px, 시간당 80px
  };

  // 겹치는 미팅들의 위치 계산
  const calculateMeetingPositions = (meetings: Meeting[]) => {
    const positions: Array<{
      meeting: Meeting;
      left: number;
      width: number;
      zIndex: number;
    }> = [];

    // 시간순으로 정렬
    const sortedMeetings = [...meetings].sort((a, b) => {
      const timeA = a.time || '00:00';
      const timeB = b.time || '00:00';
      return timeA.localeCompare(timeB);
    });

    sortedMeetings.forEach((meeting, index) => {
      // 기본 위치와 너비
      let left = 8; // 기본 left margin
      let width = 90; // 기본 width %
      let zIndex = 10 + index;

      // 현재 미팅과 겹치는 이전 미팅들 찾기
      const overlapping = positions.filter(pos => {
        const currentStart = getMeetingPosition(meeting.time);
        const currentEnd = currentStart + getMeetingHeight(meeting.duration);
        const existingStart = getMeetingPosition(pos.meeting.time);
        const existingEnd =
          existingStart + getMeetingHeight(pos.meeting.duration);

        return !(currentEnd <= existingStart || currentStart >= existingEnd);
      });

      // 겹치는 미팅이 있으면 위치 조정
      if (overlapping.length > 0) {
        const columns = overlapping.length + 1;
        width = 90 / columns;
        left = 8 + overlapping.length * width;
        zIndex += overlapping.length;
      }

      positions.push({ meeting, left, width, zIndex });
    });

    return positions;
  };

  // useSyncExternalStore용 빈 구독 함수
  const emptySubscribe = () => () => {};

  // Hydration-safe 날짜 표시
  const formatDateSafe = useSyncExternalStore(
    emptySubscribe,
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

  // 오늘인지 확인 (hydration-safe)
  const isToday = useSyncExternalStore(
    emptySubscribe,
    () => selectedDate.toDateString() === new Date().toDateString(),
    () => false // 서버에서는 항상 false
  );

  // 현재 시간 (hydration-safe)
  const currentTime = useSyncExternalStore(
    emptySubscribe,
    () => {
      const now = new Date();
      return {
        hour: now.getHours(),
        minute: now.getMinutes(),
        isVisible: now.getHours() >= 5 && now.getHours() <= 23,
      };
    },
    () => ({ hour: 0, minute: 0, isVisible: false })
  );

  // Hydration-safe 현재 시간 표시 컴포넌트
  function HydrationSafeCurrentTime() {
    const currentTimeStr = useSyncExternalStore(
      emptySubscribe,
      () =>
        new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        }), // 클라이언트 스냅샷
      () => format(new Date(), 'HH:mm', { locale: ko }) // 서버 스냅샷 (고정된 형식)
    );

    return <span>{currentTimeStr}</span>;
  }

  // 미팅 위치 계산
  const meetingPositions = calculateMeetingPositions(sortedMeetings);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* 📅 날짜 헤더 */}
      <div className="flex-shrink-0 p-4 bg-card border-b border-border">
        <h2 className="text-xl font-bold text-foreground mb-1">
          {formatDateSafe}
        </h2>
        <p className="text-sm text-muted-foreground">
          {sortedMeetings.length > 0
            ? t('dayView.eventsCount', '{{count}}개의 일정', {
                count: sortedMeetings.length,
              })
            : t('dayView.noEvents', '일정이 없습니다')}
        </p>
      </div>

      {/* 시간 타임라인 */}
      <div className="relative bg-gradient-to-br from-background/60 to-background/40 overflow-y-auto max-h-[600px]">
        {/* 시간 그리드 */}
        <div className="relative">
          {timeSlots.map(hour => (
            <div key={hour} className="relative">
              {/* 시간 라벨 */}
              <div className="flex border-b border-border/10">
                <div className="w-20 p-3 border-r border-border/20 bg-card/20 sticky left-0 z-10">
                  <div className="text-sm font-medium text-muted-foreground">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                </div>

                {/* 시간 슬롯 영역 */}
                <div
                  className={cn(
                    'flex-1 min-h-20 relative p-2 hover:bg-accent/10 transition-colors duration-200',
                    isToday && hour === currentTime.hour && 'bg-sky-500/5',
                    hour % 2 === 0 ? 'bg-card/10' : 'bg-transparent'
                  )}
                >
                  {/* 현재 시간 표시선 (개선된 버전) */}
                  {isToday &&
                    hour === currentTime.hour &&
                    currentTime.isVisible && (
                      <div
                        className="absolute left-0 right-0 h-0.5 bg-red-500 z-20 shadow-lg"
                        style={{
                          top: `${(currentTime.minute / 60) * 80}px`,
                        }}
                      >
                        <div className="absolute left-2 top-0 w-3 h-3 bg-red-500 rounded-full -translate-y-1 shadow-sm border-2 border-white flex items-center justify-center">
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                        <div className="absolute left-7 top-0 text-xs text-red-600 font-mono font-semibold -translate-y-2 bg-white px-1.5 py-0.5 rounded shadow-sm border">
                          <HydrationSafeCurrentTime />
                        </div>
                      </div>
                    )}

                  {/* 30분 구분선 */}
                  <div className="absolute left-0 right-0 top-10 h-px bg-border/20"></div>
                </div>
              </div>
            </div>
          ))}

          {/* 미팅들을 절대 위치로 배치 */}
          <div className="absolute top-0 left-20 right-0 bottom-0 pointer-events-none">
            {meetingPositions.map(({ meeting, left, width, zIndex }) => {
              const top = getMeetingPosition(meeting.time);
              const height = getMeetingHeight(meeting.duration);

              return (
                <div
                  key={meeting.id}
                  className={cn(
                    'absolute p-4 rounded-xl cursor-pointer transition-all duration-200 shadow-lg backdrop-blur-sm font-medium transform group pointer-events-auto',
                    'hover:scale-105 hover:shadow-xl hover:z-50',
                    // 🍎 SureCRM 색상 시스템 적용
                    getEventColors(meeting).bg,
                    getEventColors(meeting).border,
                    getEventColors(meeting).text
                  )}
                  style={{
                    top: `${top}px`,
                    left: `${left}%`,
                    width: `${width}%`,
                    height: `${height}px`,
                    zIndex: zIndex,
                  }}
                  onClick={() => onMeetingClick(meeting)}
                >
                  {/* 미팅 헤더 */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getMeetingIcon(meeting.type)}
                      <span className="text-sm font-semibold">
                        {meeting.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {meeting.syncInfo?.syncStatus === 'conflict' && (
                        <div className="w-2 h-2 rounded-full bg-red-400 border border-white/70 animate-pulse"></div>
                      )}
                      {meeting.syncInfo?.syncStatus === 'synced' &&
                        meeting.syncInfo?.externalSource !== 'surecrm' && (
                          <div className="w-2 h-2 rounded-full bg-green-400 border border-white/50"></div>
                        )}
                    </div>
                  </div>

                  {/* 고객 정보 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 opacity-90" />
                      <span className="font-semibold text-base truncate">
                        {meeting.client.name}
                      </span>
                    </div>

                    {/* 미팅 상세 정보 */}
                    <div className="space-y-1 text-sm opacity-90">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>{meeting.duration}분</span>
                      </div>

                      {meeting.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{meeting.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 미팅 타입 배지 */}
                  <div className="absolute bottom-2 right-2">
                    <Badge
                      variant="secondary"
                      className="text-xs bg-white/20 text-white border-white/30"
                    >
                      {t(`meeting.types.${meeting.type}`, meeting.type)}
                    </Badge>
                  </div>

                  {/* 호버 효과 */}
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl pointer-events-none"></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 빈 상태 */}
        {sortedMeetings.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="p-6 bg-muted/20 rounded-full w-fit mx-auto">
                <Clock className="w-12 h-12 text-muted-foreground/50" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {isToday
                    ? t('dayView.todayNoMeetings', '오늘')
                    : formatDate(selectedDate, {
                        month: 'long',
                        day: 'numeric',
                      })}{' '}
                  {t('dayView.noMeetingsScheduled', '예정된 미팅이 없습니다')}
                </h3>
                <p className="text-sm text-muted-foreground">
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
