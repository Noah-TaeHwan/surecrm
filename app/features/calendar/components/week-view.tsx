import { cn } from '~/lib/utils';
import { type Meeting } from '../types/types';
import { Fragment } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Clock, MapPin, User } from 'lucide-react';
import { useDeviceType } from '~/common/hooks/use-viewport';

// 🍎 SureCRM 색상 시스템 통합 (iOS 네이티브 스타일)
const getEventColors = (meeting: Meeting) => {
  // 비즈니스 로직에 따른 색상 매핑
  const type = meeting.type;
  
  if (type === 'first_consultation') {
    return {
      bg: 'bg-sky-500/90 hover:bg-sky-600/90',
      border: 'border-sky-400/50',
      text: 'text-white',
      dot: 'bg-sky-500'
    };
  } else if (type === 'contract_signing') {
    return {
      bg: 'bg-emerald-500/90 hover:bg-emerald-600/90', 
      border: 'border-emerald-400/50',
      text: 'text-white',
      dot: 'bg-emerald-500'
    };
  } else if (type === 'follow_up') {
    return {
      bg: 'bg-amber-500/90 hover:bg-amber-600/90',
      border: 'border-amber-400/50', 
      text: 'text-white',
      dot: 'bg-amber-500'
    };
  } else if (type === 'urgent') {
    return {
      bg: 'bg-rose-500/90 hover:bg-rose-600/90',
      border: 'border-rose-400/50',
      text: 'text-white', 
      dot: 'bg-rose-500'
    };
  } else if (type === 'vip') {
    return {
      bg: 'bg-violet-500/90 hover:bg-violet-600/90',
      border: 'border-violet-400/50',
      text: 'text-white',
      dot: 'bg-violet-500'
    };
  }
  
  // 기본값 (구글 캘린더 이벤트 등)
  return {
    bg: 'bg-gray-500/90 hover:bg-gray-600/90',
    border: 'border-gray-400/50',
    text: 'text-white',
    dot: 'bg-gray-500'
  };
};

interface WeekViewProps {
  selectedDate: Date;
  meetings: Meeting[];
  onMeetingClick: (meeting: Meeting) => void;
}

export function WeekView({
  selectedDate,
  meetings,
  onMeetingClick,
}: WeekViewProps) {
  const { isMobile } = useDeviceType();
  // 주의 시작일 계산 (일요일)
  const weekStart = new Date(selectedDate);
  weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());

  // 일주일간의 날짜들 생성
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    return date;
  });

  // 시간 슬롯 생성 (6시부터 22시까지)
  const timeSlots = Array.from({ length: 17 }, (_, i) => i + 6);

  // 모든 미팅 표시 (필터링 제거)
  const filteredMeetings = meetings;

  // 날짜별로 미팅 그룹화
  const meetingsByDate = weekDates.map(date => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredMeetings.filter(meeting => meeting.date === dateStr);
  });

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  // 미팅의 시간 위치 계산
  const getMeetingPosition = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = 6 * 60; // 6AM start
    const position = ((totalMinutes - startMinutes) / 60) * 64; // 64px per hour
    return Math.max(0, position);
  };

  return (
    <div className="bg-card/30 rounded-2xl overflow-hidden border border-border/30 shadow-2xl backdrop-blur-md">
      {/* 헤더: 날짜들 */}
      <div className="grid grid-cols-8 border-b border-border/30 bg-gradient-to-r from-muted/40 to-muted/20 backdrop-blur-sm">
        {/* 시간 컬럼 헤더 */}
        <div className="p-4 border-r border-border/20 bg-gradient-to-b from-card/60 to-card/40">
          <div className="text-xs text-muted-foreground font-medium">시간</div>
        </div>

        {weekDates.map((date, index) => (
          <div
            key={date.toISOString()}
            className={cn(
              'p-4 text-center border-r border-border/20 last:border-r-0 bg-gradient-to-b from-card/40 to-card/20 transition-all duration-200',
              isToday(date) &&
                'bg-gradient-to-b from-sky-500/20 to-sky-500/10 border-sky-500/30',
              index === 0 && 'text-rose-500', // 일요일
              index === 6 && 'text-sky-500'   // 토요일
            )}
          >
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">
                {format(date, 'EEE', { locale: ko })}
              </div>
              <div
                className={cn(
                  'text-lg font-bold transition-colors duration-200',
                  isToday(date) ? 'text-sky-600 dark:text-sky-400' : 'text-foreground'
                )}
              >
                {date.getDate()}
              </div>
              {meetingsByDate[index].length > 0 && (
                <div className="flex justify-center">
                  <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse shadow-sm"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 시간 그리드 */}
      <div className="relative bg-gradient-to-br from-background/60 to-background/40 overflow-x-auto">
        <div className={cn(
          "grid grid-cols-8",
          isMobile ? "min-w-[600px]" : "min-w-[800px]"
        )}>
          {timeSlots.map(hour => (
            <Fragment key={hour}>
              {/* 시간 라벨 */}
              <div className={cn(
                "border-r border-b border-border/20 bg-card/20 sticky left-0 z-10",
                isMobile ? "p-2" : "p-3"
              )}>
                <div className={cn(
                  "font-medium text-muted-foreground",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  {hour.toString().padStart(2, '0')}:00
                </div>
              </div>

              {/* 각 날짜의 시간 슬롯 */}
              {weekDates.map((date, dayIndex) => {
                const dateStr = date.toISOString().split('T')[0];
                const dayMeetings = filteredMeetings.filter(
                  meeting => meeting.date === dateStr
                );

                // 현재 시간 슬롯에 해당하는 미팅들
                const hourMeetings = dayMeetings.filter(meeting => {
                  const meetingHour = parseInt(meeting.time.split(':')[0]);
                  return meetingHour === hour;
                });

                return (
                  <div
                    key={`${dateStr}-${hour}`}
                    className={cn(
                      'relative min-h-16 p-2 border-r border-b border-border/20 last:border-r-0 group hover:bg-accent/20 transition-all duration-200',
                      isToday(date) && 'bg-sky-500/5 hover:bg-sky-500/10',
                      isWeekend(date) && 'bg-muted/10',
                      'cursor-pointer'
                    )}
                  >
                    {/* 현재 시간 표시선 (오늘이고 현재 시간인 경우) */}
                    {isToday(date) && new Date().getHours() === hour && (
                      <div className="absolute left-0 right-0 top-0 h-0.5 bg-red-500 z-20">
                        <div className="absolute left-0 top-0 w-2 h-2 bg-red-500 rounded-full -translate-y-1"></div>
                      </div>
                    )}

                    {/* 미팅 카드들 */}
                    <div className="space-y-1">
                      {hourMeetings.map(meeting => (
                        <div
                          key={meeting.id}
                          className={cn(
                            'relative p-2 rounded-lg cursor-pointer transition-all duration-200 shadow-sm backdrop-blur-sm font-medium transform',
                            'hover:scale-105 hover:shadow-lg hover:z-10',
                            // 🍎 SureCRM 색상 시스템 적용
                            getEventColors(meeting).bg,
                            getEventColors(meeting).border,
                            getEventColors(meeting).text
                          )}
                          onClick={() => onMeetingClick(meeting)}
                          title={`${meeting.time} - ${meeting.client.name}`}
                        >
                          {/* 미팅 시간 */}
                          <div className="flex items-center gap-1 mb-1">
                            <Clock className="w-3 h-3 opacity-90" />
                            <span className="text-xs font-semibold">
                              {meeting.time}
                            </span>
                          </div>

                          {/* 고객 이름 */}
                          <div className="flex items-center gap-1 mb-1">
                            <User className="w-3 h-3 opacity-90" />
                            <span className="text-sm font-medium truncate">
                              {meeting.client.name}
                            </span>
                          </div>

                          {/* 미팅 타입 */}
                          <div className="text-xs opacity-90 truncate">
                            {meeting.type}
                          </div>

                          {/* 위치 정보 (있는 경우) */}
                          {meeting.location && (
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3 opacity-75" />
                              <span className="text-xs opacity-75 truncate">
                                {meeting.location}
                              </span>
                            </div>
                          )}

                          {/* 동기화 상태 표시 */}
                          {meeting.syncInfo?.syncStatus === 'conflict' && (
                            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-400 border border-white/70 animate-pulse"></div>
                          )}

                          {meeting.syncInfo?.syncStatus === 'synced' &&
                            meeting.syncInfo?.externalSource !== 'surecrm' && (
                              <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-400 border border-white/50"></div>
                            )}
                        </div>
                      ))}
                    </div>

                    {/* 호버 시 시간 표시 */}
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-50 transition-opacity duration-200">
                      <span className="text-xs text-muted-foreground font-mono">
                        {hour.toString().padStart(2, '0')}:00
                      </span>
                    </div>
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>

        {/* 현재 시간 전체 가로선 (오늘인 경우) */}
        {weekDates.some(date => isToday(date)) && (
          <div className="absolute left-0 right-0 pointer-events-none z-10">
            {(() => {
              const now = new Date();
              const currentHour = now.getHours();
              const currentMinute = now.getMinutes();

              if (currentHour >= 6 && currentHour <= 22) {
                const position =
                  (currentHour - 6) * 64 + (currentMinute * 64) / 60 + 64; // +64 for header
                return (
                  <div
                    className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-lg"
                    style={{ top: `${position}px` }}
                  >
                    <div className="absolute left-2 top-0 w-2 h-2 bg-red-500 rounded-full -translate-y-1 shadow-sm"></div>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
