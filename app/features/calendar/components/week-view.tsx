import { cn } from '~/lib/utils';
import { meetingTypeColors, type Meeting } from './types';
import { Fragment } from 'react';

interface WeekViewProps {
  selectedDate: Date;
  meetings: Meeting[];
  onMeetingClick: (meeting: Meeting) => void;
  filteredTypes?: string[];
}

export function WeekView({
  selectedDate,
  meetings,
  onMeetingClick,
  filteredTypes = [],
}: WeekViewProps) {
  // 필터링된 미팅
  const filteredMeetings =
    filteredTypes.length > 0
      ? meetings.filter((meeting) => filteredTypes.includes(meeting.type))
      : meetings;

  // 주의 시작일과 끝일 계산
  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      weekDates.push(day);
    }
    return weekDates;
  };

  const weekDates = getWeekDates(selectedDate);
  const today = new Date();

  // 시간대 생성 (6시부터 23시까지)
  const timeSlots = [];
  for (let hour = 6; hour <= 23; hour++) {
    timeSlots.push(hour);
  }

  const formatTime = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (date: Date) => {
    return formatDate(date) === formatDate(today);
  };

  return (
    <div className="bg-card/30 rounded-2xl overflow-hidden border border-border/30 shadow-2xl backdrop-blur-md">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-8 border-b border-border/30 bg-gradient-to-r from-muted/40 to-muted/20 backdrop-blur-sm">
        <div className="p-4 text-center font-bold text-sm border-r border-border/20">
          시간
        </div>
        {weekDates.map((date, index) => (
          <div
            key={date.toISOString()}
            className={cn(
              'p-4 text-center border-r border-border/20 last:border-r-0',
              index === 0
                ? 'text-red-500'
                : index === 6
                ? 'text-blue-500'
                : 'text-foreground/80',
              isToday(date) && 'bg-primary/10 text-primary font-bold'
            )}
          >
            <div className="text-sm font-bold">
              {date.toLocaleDateString('ko-KR', { weekday: 'short' })}
            </div>
            <div
              className={cn(
                'text-lg mt-1',
                isToday(date) ? 'text-primary font-bold' : 'text-foreground/60'
              )}
            >
              {date.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* 시간대별 그리드 */}
      <div className="grid grid-cols-8 bg-gradient-to-br from-background/60 to-background/40">
        {timeSlots.map((hour) => (
          <Fragment key={hour}>
            {/* 시간 라벨 */}
            <div className="p-3 text-sm font-semibold text-muted-foreground border-r border-b border-border/20 bg-muted/20 text-center">
              {formatTime(hour)}
            </div>

            {/* 각 요일별 시간 슬롯 */}
            {weekDates.map((date, dayIndex) => {
              const dateStr = formatDate(date);
              const dayMeetings = filteredMeetings.filter((meeting) => {
                if (meeting.date !== dateStr) return false;

                const meetingHour = parseInt(meeting.time.split(':')[0]);
                return meetingHour === hour;
              });

              return (
                <div
                  key={`${dateStr}-${hour}`}
                  className={cn(
                    'min-h-16 p-2 border-r border-b border-border/20 last:border-r-0 relative group hover:bg-accent/20 transition-colors',
                    isToday(date) && 'bg-primary/5',
                    dayIndex === 0 && 'bg-red-50/30 dark:bg-red-950/20',
                    dayIndex === 6 && 'bg-blue-50/30 dark:bg-blue-950/20'
                  )}
                >
                  {dayMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className={cn(
                        'text-xs p-2 rounded border border-white/20 cursor-pointer transition-all duration-200 mb-1',
                        'hover:scale-105 hover:shadow-md backdrop-blur-sm text-white font-medium',
                        meetingTypeColors[
                          meeting.type as keyof typeof meetingTypeColors
                        ]
                      )}
                      onClick={() => onMeetingClick(meeting)}
                      title={`${meeting.time} - ${meeting.client.name} (${meeting.type})`}
                    >
                      <div className="font-semibold">{meeting.time}</div>
                      <div className="truncate">{meeting.client.name}</div>
                      <div className="text-white/80 text-xs">
                        {meeting.type}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
