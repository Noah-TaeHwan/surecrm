import { cn } from '~/lib/utils';
import { meetingTypeColors, type Meeting } from '../types/types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Clock, MapPin, User, Phone, Video, Coffee } from 'lucide-react';
import { Badge } from '~/common/components/ui/badge';

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
  // 모든 미팅 표시 (필터링 제거)
  const filteredMeetings = meetings;

  // 선택된 날짜의 미팅들만 필터링
  const dateStr = selectedDate.toISOString().split('T')[0];
  const dayMeetings = filteredMeetings.filter(
    meeting => meeting.date === dateStr
  );

  // 시간별로 정렬
  const sortedMeetings = dayMeetings.sort((a, b) =>
    a.time.localeCompare(b.time)
  );

  // 시간 슬롯 생성 (0시부터 23시까지)
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();

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
    return (totalMinutes / 60) * 80; // 80px per hour
  };

  // 미팅 지속시간에 따른 높이 계산
  const getMeetingHeight = (duration: number) => {
    return Math.max(60, (duration / 60) * 80); // 최소 60px, 시간당 80px
  };

  return (
    <div className="bg-card/30 rounded-2xl overflow-hidden border border-border/30 shadow-2xl backdrop-blur-md">
      {/* 헤더 */}
      <div className="border-b border-border/30 bg-gradient-to-r from-muted/40 to-muted/20 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground">
              {format(selectedDate, 'MM월 dd일', { locale: ko })}
            </h2>
            <p className="text-sm text-muted-foreground">
              {format(selectedDate, 'EEEE', { locale: ko })}
              {isToday && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  오늘
                </Badge>
              )}
            </p>
          </div>

          <div className="text-right space-y-1">
            <div className="text-2xl font-bold text-primary">
              {sortedMeetings.length}
            </div>
            <div className="text-xs text-muted-foreground">개의 미팅</div>
          </div>
        </div>

        {/* 미팅 요약 */}
        {sortedMeetings.length > 0 && (
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {sortedMeetings[0].time} -{' '}
                {sortedMeetings[sortedMeetings.length - 1].time}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {Array.from(new Set(sortedMeetings.map(m => m.type))).map(
                type => (
                  <div
                    key={type}
                    className={cn(
                      'w-3 h-3 rounded-full',
                      meetingTypeColors[
                        type as keyof typeof meetingTypeColors
                      ] || 'bg-gray-500'
                    )}
                  />
                )
              )}
            </div>
          </div>
        )}
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
                    isToday && hour === currentHour && 'bg-primary/5',
                    hour % 2 === 0 ? 'bg-card/10' : 'bg-transparent'
                  )}
                >
                  {/* 현재 시간 표시선 */}
                  {isToday && hour === currentHour && (
                    <div
                      className="absolute left-0 right-0 h-0.5 bg-red-500 z-20 shadow-lg"
                      style={{
                        top: `${(currentMinute / 60) * 80}px`,
                      }}
                    >
                      <div className="absolute left-2 top-0 w-3 h-3 bg-red-500 rounded-full -translate-y-1 shadow-sm flex items-center justify-center">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                      <div className="absolute left-6 top-0 text-xs text-red-600 font-mono -translate-y-2">
                        {new Date().toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  )}

                  {/* 해당 시간의 미팅들 */}
                  {sortedMeetings
                    .filter(meeting => {
                      const meetingHour = parseInt(meeting.time.split(':')[0]);
                      return meetingHour === hour;
                    })
                    .map((meeting, index) => (
                      <div
                        key={meeting.id}
                        className={cn(
                          'absolute left-2 right-2 p-4 rounded-xl border border-white/20 cursor-pointer transition-all duration-200 shadow-lg',
                          'hover:scale-105 hover:shadow-xl backdrop-blur-sm text-white font-medium transform hover:z-10',
                          meetingTypeColors[
                            meeting.type as keyof typeof meetingTypeColors
                          ] || 'bg-gray-500',
                          'group'
                        )}
                        style={{
                          top: `${getMeetingPosition(meeting.time) - hour * 80}px`,
                          height: `${getMeetingHeight(meeting.duration)}px`,
                          left: `${8 + index * 4}px`, // 겹치는 미팅들을 살짝 오프셋
                          right: `${8 + index * 4}px`,
                          zIndex: 10 + index,
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
                              meeting.syncInfo?.externalSource !==
                                'surecrm' && (
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
                                <span className="truncate">
                                  {meeting.location}
                                </span>
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
                            {meeting.type}
                          </Badge>
                        </div>

                        {/* 호버 효과 */}
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl pointer-events-none"></div>
                      </div>
                    ))}

                  {/* 30분 구분선 */}
                  <div className="absolute left-0 right-0 top-10 h-px bg-border/20"></div>
                </div>
              </div>
            </div>
          ))}
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
                    ? '오늘'
                    : format(selectedDate, 'MM월 dd일', { locale: ko })}{' '}
                  예정된 미팅이 없습니다
                </h3>
                <p className="text-sm text-muted-foreground">
                  새로운 미팅을 예약하여 일정을 관리해보세요.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
