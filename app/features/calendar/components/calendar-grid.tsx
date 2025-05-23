import { cn } from '~/lib/utils';
import { meetingTypeColors, type Meeting } from './types';

interface CalendarGridProps {
  selectedDate: Date;
  meetings: Meeting[];
  onMeetingClick: (meeting: Meeting) => void;
  filteredTypes?: string[];
  onDateClick?: (date: Date) => void;
}

export function CalendarGrid({
  selectedDate,
  meetings,
  onMeetingClick,
  filteredTypes = [],
  onDateClick,
}: CalendarGridProps) {
  // 필터링된 미팅
  const filteredMeetings =
    filteredTypes.length > 0
      ? meetings.filter((meeting) => filteredTypes.includes(meeting.type))
      : meetings;

  // 날짜 관련 유틸리티
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // 월별 캘린더 렌더링
  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(selectedDate);
    const firstDay = getFirstDayOfMonth(selectedDate);
    const days = [];
    const today = new Date();
    const isCurrentMonth =
      today.getMonth() === selectedDate.getMonth() &&
      today.getFullYear() === selectedDate.getFullYear();

    // 빈 셀 추가 (이전 달 마지막 날들)
    const prevMonth = new Date(selectedDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const daysInPrevMonth = getDaysInMonth(prevMonth);

    for (let i = firstDay - 1; i >= 0; i--) {
      const prevDate = daysInPrevMonth - i;
      days.push(
        <div
          key={`prev-${prevDate}`}
          className="h-40 bg-muted/10 border border-border/10 p-3 opacity-30"
        >
          <div className="text-sm text-muted-foreground/40 font-medium">
            {prevDate}
          </div>
        </div>
      );
    }

    // 현재 달 날짜 셀 추가
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedDate.getFullYear()}-${String(
        selectedDate.getMonth() + 1
      ).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayMeetings = filteredMeetings.filter((m) => m.date === dateStr);
      const isToday = isCurrentMonth && today.getDate() === day;
      const isWeekend =
        new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          day
        ).getDay() === 0 ||
        new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          day
        ).getDay() === 6;

      const cellDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        day
      );

      days.push(
        <div
          key={day}
          className={cn(
            'h-40 border border-border/20 p-3 cursor-pointer transition-all duration-200 group relative overflow-hidden bg-card/30',
            'hover:bg-card/60 hover:shadow-lg hover:border-accent/40 hover:backdrop-blur-md',
            isToday &&
              'bg-primary/8 border-primary/30 ring-1 ring-primary/20 shadow-md',
            isWeekend && 'bg-muted/20',
            dayMeetings.length > 0 && 'hover:scale-[1.02] hover:-translate-y-1'
          )}
          onClick={() => onDateClick?.(cellDate)}
        >
          {/* 날짜 헤더 */}
          <div className="flex items-center justify-between mb-3">
            <span
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-200',
                isToday
                  ? 'bg-primary text-primary-foreground shadow-sm scale-110'
                  : 'text-foreground/80 hover:bg-accent/20'
              )}
            >
              {day}
            </span>
            {dayMeetings.length > 0 && (
              <div className="text-xs text-muted-foreground bg-accent/40 px-2 py-1 rounded-full border border-border/30 backdrop-blur-sm">
                {dayMeetings.length}
              </div>
            )}
          </div>

          {/* 미팅 리스트 - 새로운 레이아웃 */}
          <div className="space-y-1.5">
            {dayMeetings.length <= 3 ? (
              // 3개 이하일 때: 풀 디스플레이
              dayMeetings.map((meeting, index) => (
                <div
                  key={meeting.id}
                  className={cn(
                    'text-xs p-2 rounded border border-white/20 cursor-pointer transition-all duration-200',
                    'hover:scale-105 hover:shadow-sm backdrop-blur-sm text-white font-medium',
                    meetingTypeColors[
                      meeting.type as keyof typeof meetingTypeColors
                    ]
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMeetingClick(meeting);
                  }}
                  title={`${meeting.time} - ${meeting.client.name} (${meeting.type})`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold">
                      {meeting.time}
                    </span>
                    <div className="w-1.5 h-1.5 bg-white/80 rounded-full"></div>
                  </div>
                  <div className="text-xs truncate font-medium">
                    {meeting.client.name}
                  </div>
                </div>
              ))
            ) : dayMeetings.length === 4 ? (
              // 4개일 때: 3개 표시 + 1개 더보기
              <>
                {dayMeetings.slice(0, 3).map((meeting, index) => (
                  <div
                    key={meeting.id}
                    className={cn(
                      'text-xs p-1.5 rounded border border-white/20 cursor-pointer transition-all duration-200',
                      'hover:scale-105 backdrop-blur-sm text-white font-medium',
                      meetingTypeColors[
                        meeting.type as keyof typeof meetingTypeColors
                      ]
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMeetingClick(meeting);
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold">
                        {meeting.time}
                      </span>
                      <span className="text-xs truncate">
                        {meeting.client.name}
                      </span>
                    </div>
                  </div>
                ))}
                <div
                  className="text-xs text-muted-foreground bg-accent/60 p-1.5 rounded cursor-pointer hover:bg-accent/80 transition-colors border border-border/30 backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDateClick?.(cellDate);
                  }}
                >
                  <span className="font-medium">+1개 더</span>
                </div>
              </>
            ) : (
              // 5개 이상일 때: 2개 표시 + n개 더보기
              <>
                {dayMeetings.slice(0, 2).map((meeting, index) => (
                  <div
                    key={meeting.id}
                    className={cn(
                      'text-xs p-1.5 rounded border border-white/20 cursor-pointer transition-all duration-200',
                      'hover:scale-105 backdrop-blur-sm text-white font-medium',
                      meetingTypeColors[
                        meeting.type as keyof typeof meetingTypeColors
                      ]
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMeetingClick(meeting);
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold">
                        {meeting.time}
                      </span>
                      <span className="text-xs truncate">
                        {meeting.client.name}
                      </span>
                    </div>
                  </div>
                ))}
                <div
                  className="text-xs text-foreground bg-gradient-to-r from-primary/20 to-primary/30 p-2 rounded cursor-pointer hover:from-primary/30 hover:to-primary/40 transition-all duration-200 border border-primary/30 backdrop-blur-sm font-semibold"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDateClick?.(cellDate);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                    <span>+{dayMeetings.length - 2}개 더 보기</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 오늘 표시 효과 */}
          {isToday && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse shadow-sm" />
          )}
        </div>
      );
    }

    // 다음 달 첫 날들로 빈 공간 채우기
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    const remainingCells = totalCells - (firstDay + daysInMonth);

    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <div
          key={`next-${day}`}
          className="h-40 bg-muted/10 border border-border/10 p-3 opacity-30"
        >
          <div className="text-sm text-muted-foreground/40 font-medium">
            {day}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-card/30 rounded-2xl overflow-hidden border border-border/30 shadow-2xl backdrop-blur-md">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 border-b border-border/30 bg-gradient-to-r from-muted/40 to-muted/20 backdrop-blur-sm">
          {[
            '일요일',
            '월요일',
            '화요일',
            '수요일',
            '목요일',
            '금요일',
            '토요일',
          ].map((day, index) => (
            <div
              key={day}
              className={cn(
                'p-4 text-center font-bold text-sm border-r border-border/20 last:border-r-0 bg-gradient-to-b from-card/40 to-card/20',
                index === 0
                  ? 'text-red-500'
                  : index === 6
                  ? 'text-blue-500'
                  : 'text-foreground/80'
              )}
            >
              <div className="hidden lg:block">{day}</div>
              <div className="lg:hidden font-extrabold">{day.slice(0, 1)}</div>
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 bg-gradient-to-br from-background/60 to-background/40">
          {days}
        </div>
      </div>
    );
  };

  return renderMonthView();
}
