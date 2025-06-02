import { cn } from '~/lib/utils';
import { meetingTypeColors, type Meeting } from '../types/types';

interface DayViewProps {
  selectedDate: Date;
  meetings: Meeting[];
  onMeetingClick: (meeting: Meeting) => void;
  filteredTypes?: string[];
}

export function DayView({
  selectedDate,
  meetings,
  onMeetingClick,
  filteredTypes = [],
}: DayViewProps) {
  // 필터링된 미팅
  const filteredMeetings =
    filteredTypes.length > 0
      ? meetings.filter((meeting) => filteredTypes.includes(meeting.type))
      : meetings;

  const today = new Date();
  const isToday = selectedDate.toDateString() === today.toDateString();
  const dateStr = selectedDate.toISOString().split('T')[0];

  // 해당 날짜의 미팅들
  const dayMeetings = filteredMeetings.filter(
    (meeting) => meeting.date === dateStr
  );

  // 해당 날짜의 전체 미팅들 (필터링 전)
  const allDayMeetings = meetings.filter((meeting) => meeting.date === dateStr);

  // 시간대 생성 (6시부터 23시까지)
  const timeSlots = [];
  for (let hour = 6; hour <= 23; hour++) {
    timeSlots.push(hour);
  }

  const formatTime = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  return (
    <div className="bg-card/30 rounded-2xl overflow-hidden border border-border/30 shadow-2xl backdrop-blur-md">
      {/* 날짜 헤더 */}
      <div
        className={cn(
          'p-6 border-b border-border/30 bg-gradient-to-r from-muted/40 to-muted/20 backdrop-blur-sm',
          isToday && 'from-primary/20 to-primary/10'
        )}
      >
        <div className="text-center">
          <h2
            className={cn(
              'text-2xl font-bold mb-2',
              isToday ? 'text-primary' : 'text-foreground'
            )}
          >
            {formatDate(selectedDate)}
          </h2>
          {isToday && (
            <div className="text-primary/80 text-sm font-medium">오늘</div>
          )}
          <div className="text-muted-foreground text-sm mt-2">
            총 {dayMeetings.length}개의 일정
          </div>
        </div>
      </div>

      {/* 시간대별 일정 */}
      <div className="max-h-[600px] overflow-y-auto">
        {dayMeetings.length > 0 ? (
          <div className="bg-gradient-to-br from-background/60 to-background/40">
            {timeSlots.map((hour) => {
              const hourMeetings = dayMeetings.filter((meeting) => {
                const meetingHour = parseInt(meeting.time.split(':')[0]);
                return meetingHour === hour;
              });

              return (
                <div
                  key={hour}
                  className={cn(
                    'flex border-b border-border/10 min-h-20',
                    hourMeetings.length > 0 && 'bg-accent/5'
                  )}
                >
                  {/* 시간 라벨 */}
                  <div className="w-20 flex-shrink-0 p-4 text-center border-r border-border/20 bg-muted/20">
                    <div className="text-sm font-semibold text-muted-foreground">
                      {formatTime(hour)}
                    </div>
                  </div>

                  {/* 일정 영역 */}
                  <div className="flex-1 p-4">
                    {hourMeetings.length > 0 ? (
                      <div className="space-y-3">
                        {hourMeetings.map((meeting) => (
                          <div
                            key={meeting.id}
                            className={cn(
                              'p-4 rounded-lg border border-white/20 cursor-pointer transition-all duration-200',
                              'hover:scale-105 hover:shadow-lg backdrop-blur-sm text-white',
                              meetingTypeColors[
                                meeting.type as keyof typeof meetingTypeColors
                              ]
                            )}
                            onClick={() => onMeetingClick(meeting)}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="text-lg font-bold">
                                  {meeting.time}
                                </div>
                                <div className="w-2 h-2 bg-white/80 rounded-full"></div>
                                <div className="text-sm font-medium opacity-90">
                                  {meeting.duration}분
                                </div>
                              </div>
                              <div className="bg-white/20 px-2 py-1 rounded text-xs font-medium">
                                {meeting.type}
                              </div>
                            </div>

                            <div className="mb-2">
                              <div className="text-lg font-bold mb-1">
                                {meeting.title}
                              </div>
                              <div className="text-white/90 text-sm">
                                고객: {meeting.client.name}
                              </div>
                            </div>

                            <div className="text-white/80 text-sm mb-3">
                              📍 {meeting.location}
                            </div>

                            {meeting.description && (
                              <div className="text-white/70 text-sm bg-white/10 p-2 rounded">
                                {meeting.description}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-muted-foreground/50 text-sm italic">
                        이 시간에 일정이 없습니다
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // 일정이 없는 경우
          <div className="p-12 text-center">
            {allDayMeetings.length > 0 ? (
              // 필터링으로 인해 빈 경우
              <>
                <div className="p-6 bg-muted/20 rounded-full w-fit mx-auto mb-6">
                  <svg
                    className="w-16 h-16 text-muted-foreground/50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  선택한 필터에 해당하는 일정이 없습니다
                </h3>
                <p className="text-muted-foreground mb-6">
                  이 날에는 전체 {allDayMeetings.length}개의 일정이 있지만,
                  선택한 필터 조건에 맞는 일정은 없습니다.
                </p>
                <div className="text-sm text-muted-foreground bg-muted/20 px-4 py-2 rounded-lg inline-block">
                  전체 일정: {allDayMeetings.length}개 | 필터링된 일정: 0개
                </div>
              </>
            ) : (
              // 전체적으로 빈 경우
              <>
                <div className="p-6 bg-muted/20 rounded-full w-fit mx-auto mb-6">
                  <svg
                    className="w-16 h-16 text-muted-foreground/50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  일정이 없는 하루입니다
                </h3>
                <p className="text-muted-foreground mb-6">
                  이 날에는 예정된 미팅이 없습니다. 새로운 일정을 추가해보세요.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
