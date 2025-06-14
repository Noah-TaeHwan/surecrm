import { cn } from '~/lib/utils';
import {
  meetingTypeColors,
  meetingTypeKoreanMap,
  eventSourceIcons,
  eventSourceStyles,
  syncStatusStyles,
  type Meeting,
  type EventSource,
  type SyncStatus,
} from '../types/types';
import {
  CheckCircle,
  Loader2,
  AlertTriangle,
  XCircle,
  Circle,
  CalendarIcon,
} from 'lucide-react';

interface CalendarGridProps {
  selectedDate: Date;
  meetings: Meeting[];
  onMeetingClick: (meeting: Meeting) => void;
  filteredTypes?: string[];
  onDateClick?: (date: Date) => void;
}

// 🎨 동기화 상태 표시기 컴포넌트
function SyncStatusIndicator({ status }: { status?: SyncStatus }) {
  if (!status || status === 'not_synced') return null;

  const style = syncStatusStyles[status];
  const IconComponent = {
    CheckCircle,
    Loader2,
    AlertTriangle,
    XCircle,
    Circle,
  }[style.icon];

  return (
    <div
      className={cn(
        'flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full backdrop-blur-sm border border-white/20',
        style.bgColor,
        style.color
      )}
      title={style.label}
    >
      <IconComponent
        className={cn('h-3 w-3', 'animate' in style ? style.animate : '')}
      />
    </div>
  );
}

// 🎯 개선된 이벤트 카드 컴포넌트 - 호버 텍스트 겹침 문제 해결
function EventCard({
  meeting,
  compact = false,
  onClick,
}: {
  meeting: Meeting;
  compact?: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  const source = (meeting.syncInfo?.externalSource || 'surecrm') as EventSource;
  const sourceStyle = eventSourceStyles[source] || eventSourceStyles.surecrm;
  const syncStatus = meeting.syncInfo?.syncStatus;

  const koreanName =
    meetingTypeKoreanMap[meeting.type as keyof typeof meetingTypeKoreanMap] ||
    meeting.type;

  return (
    <div
      className={cn(
        'rounded cursor-pointer transition-all duration-200 relative overflow-hidden',
        'hover:scale-[1.02] hover:shadow-md text-white font-medium',
        compact ? 'text-xs p-1.5' : 'text-xs p-2',
        `bg-gradient-to-r ${sourceStyle.gradient}`,
        `border ${sourceStyle.border}`,
        sourceStyle.textColor,
        'hover:brightness-105'
      )}
      onClick={onClick}
      title={`${meeting.time} - ${meeting.client.name} (${koreanName}) - ${
        source === 'surecrm' ? 'SureCRM' : '구글 캘린더'
      }`}
    >
      {/* 메인 콘텐츠 */}
      <div className="relative z-10">
        {/* 상단: 시간 & 아이콘 */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <span className="text-xs">{sourceStyle.icon}</span>
            <span className="font-semibold text-xs">{meeting.time}</span>
          </div>
          <SyncStatusIndicator status={syncStatus} />
        </div>

        {/* 중앙: 고객명 */}
        <div className="truncate font-medium text-xs mb-1">
          {meeting.client.name}
        </div>

        {/* 하단: 미팅 타입 (compact가 아닐 때만) */}
        {!compact && (
          <div className="text-xs opacity-80 truncate">{koreanName}</div>
        )}
      </div>

      {/* 상태 표시 점들 */}
      {syncStatus === 'conflict' && (
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-400 border border-white/70 animate-pulse z-20"></div>
      )}

      {syncStatus === 'synced' && source !== 'surecrm' && (
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-400 border border-white/50 z-20"></div>
      )}
    </div>
  );
}

// 🚀 더보기 버튼 컴포넌트 - 개선된 디자인
function MoreButton({
  count,
  meetings,
  onClick,
}: {
  count: number;
  meetings: Meeting[];
  onClick: (e: React.MouseEvent) => void;
}) {
  // 남은 미팅들의 시간 미리보기
  const previewTimes = meetings
    .slice(0, 3)
    .map(m => m.time)
    .join(', ');

  return (
    <div
      className="text-xs text-muted-foreground bg-muted/50 hover:bg-muted/70 p-1.5 sm:p-2 rounded cursor-pointer transition-all duration-200 border border-border/50 hover:border-border group min-touch-target"
      onClick={onClick}
      title={`남은 일정: ${previewTimes}${meetings.length > 3 ? '...' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">+{count}개 더보기</span>
        <div className="w-1 h-1 bg-primary rounded-full group-hover:scale-125 transition-transform"></div>
      </div>
    </div>
  );
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
      ? meetings.filter(meeting => filteredTypes.includes(meeting.type))
      : meetings;

  // 필터링된 결과가 없는 경우 빈 상태 표시
  if (filteredMeetings.length === 0 && meetings.length > 0) {
    return (
      <div className="bg-card/30 rounded-2xl overflow-hidden border border-border/30 shadow-2xl backdrop-blur-md">
        <div className="p-8 sm:p-12 text-center">
          <div className="p-4 sm:p-6 bg-muted/20 rounded-full w-fit mx-auto mb-4 sm:mb-6">
            <CalendarIcon className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
            일정이 없습니다
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
            새로운 미팅을 예약해보세요.
          </p>
          <div className="text-sm text-muted-foreground bg-muted/20 px-4 py-2 rounded-lg inline-block">
            전체 미팅: {meetings.length}개 | 필터링된 미팅: 0개
          </div>
        </div>
      </div>
    );
  }

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
          className="h-32 bg-muted/10 border border-border/10 p-2 opacity-30"
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
      const dayMeetings = filteredMeetings.filter(m => m.date === dateStr);
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

      // 📊 이벤트 소스별 카운트
      const sourceCount = dayMeetings.reduce((acc, meeting) => {
        const source = meeting.syncInfo?.externalSource || 'surecrm';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      days.push(
        <div
          key={day}
          className={cn(
            'border border-border/20 p-2 cursor-pointer transition-all duration-200 relative overflow-hidden bg-card/30',
            'hover:bg-card/60 hover:shadow-lg hover:border-accent/40',
            isToday &&
              'bg-primary/8 border-primary/30 ring-1 ring-primary/20 shadow-md',
            isWeekend && 'bg-muted/20',
            // 이벤트 수에 따른 동적 높이
            dayMeetings.length === 0
              ? 'h-32'
              : dayMeetings.length === 1
              ? 'h-36'
              : dayMeetings.length <= 3
              ? 'h-40'
              : 'h-44',
            dayMeetings.length > 0 && 'hover:scale-[1.01]'
          )}
          onClick={() => onDateClick?.(cellDate)}
        >
          {/* 날짜 헤더 - 간소화된 버전 */}
          <div className="flex items-center justify-between mb-2">
            <span
              className={cn(
                'flex items-center justify-center w-6 h-6 rounded-full text-sm font-semibold',
                isToday
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground/80'
              )}
            >
              {day}
            </span>

            {/* 간소화된 이벤트 카운터 */}
            {dayMeetings.length > 0 && (
              <div className="flex items-center gap-0.5">
                {Object.entries(sourceCount).map(([source, count]) => {
                  const sourceStyle =
                    eventSourceStyles[source as EventSource] ||
                    eventSourceStyles.surecrm;
                  return (
                    <div
                      key={source}
                      className={cn(
                        'text-xs px-1.5 py-0.5 rounded-full font-medium',
                        `bg-gradient-to-r ${sourceStyle.gradient}`,
                        sourceStyle.textColor
                      )}
                      title={`${
                        source === 'surecrm' ? 'SureCRM' : '구글 캘린더'
                      }: ${count}개`}
                    >
                      {count}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 🎨 스마트 이벤트 표시 시스템 */}
          <div className="space-y-1">
            {dayMeetings.length === 0 ? null : dayMeetings.length === 1 ? ( // 이벤트 없음
              // 1개: 풀 사이즈로 표시
              <EventCard
                key={dayMeetings[0].id}
                meeting={dayMeetings[0]}
                compact={false}
                onClick={e => {
                  e.stopPropagation();
                  onMeetingClick(dayMeetings[0]);
                }}
              />
            ) : dayMeetings.length === 2 ? (
              // 2개: 둘 다 컴팩트로 표시
              dayMeetings.map(meeting => (
                <EventCard
                  key={meeting.id}
                  meeting={meeting}
                  compact={true}
                  onClick={e => {
                    e.stopPropagation();
                    onMeetingClick(meeting);
                  }}
                />
              ))
            ) : dayMeetings.length === 3 ? (
              // 3개: 시간순 정렬 후 모두 컴팩트로 표시
              dayMeetings
                .sort((a, b) => a.time.localeCompare(b.time))
                .map(meeting => (
                  <EventCard
                    key={meeting.id}
                    meeting={meeting}
                    compact={true}
                    onClick={e => {
                      e.stopPropagation();
                      onMeetingClick(meeting);
                    }}
                  />
                ))
            ) : (
              // 4개 이상: 첫 2개 표시 + 스마트 더보기
              <>
                {dayMeetings
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .slice(0, 2)
                  .map(meeting => (
                    <EventCard
                      key={meeting.id}
                      meeting={meeting}
                      compact={true}
                      onClick={e => {
                        e.stopPropagation();
                        onMeetingClick(meeting);
                      }}
                    />
                  ))}
                <MoreButton
                  count={dayMeetings.length - 2}
                  meetings={dayMeetings.slice(2)}
                  onClick={e => {
                    e.stopPropagation();
                    onDateClick?.(cellDate);
                  }}
                />
              </>
            )}
          </div>

          {/* 오늘 표시 효과 */}
          {isToday && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse shadow-sm" />
          )}

          {/* 🔄 동기화 충돌 전체 표시 */}
          {dayMeetings.some(m => m.syncInfo?.syncStatus === 'conflict') && (
            <div
              className="absolute bottom-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white shadow-lg"
              title="동기화 충돌이 있는 이벤트가 있습니다"
            />
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
          className="h-32 bg-muted/10 border border-border/10 p-2 opacity-30"
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
