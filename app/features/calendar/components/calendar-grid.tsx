import { cn } from '~/lib/utils';
import {
  meetingTypeColors,
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

// 🎯 개선된 이벤트 카드 컴포넌트
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
  const sourceStyle = eventSourceStyles[source];
  const syncStatus = meeting.syncInfo?.syncStatus;

  return (
    <div
      className={cn(
        'rounded cursor-pointer transition-all duration-200 relative overflow-hidden group',
        'hover:scale-105 hover:shadow-sm backdrop-blur-sm text-white font-medium',
        compact ? 'text-xs p-1.5' : 'text-xs p-2',
        `bg-gradient-to-r ${sourceStyle.gradient}`,
        `border ${sourceStyle.border}`,
        sourceStyle.textColor,
        // 호버 효과 강화
        'hover:brightness-110 hover:shadow-lg transition-all duration-300'
      )}
      onClick={onClick}
      title={`${meeting.time} - ${meeting.client.name} (${meeting.type}) - ${source}`}
    >
      {/* 상단: 시간 & 상태 */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{sourceStyle.icon}</span>
          <span
            className={cn('font-semibold', compact ? 'text-xs' : 'text-xs')}
          >
            {meeting.time}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <SyncStatusIndicator status={syncStatus} />
          {!compact && (
            <div className="w-1.5 h-1.5 bg-white/80 rounded-full"></div>
          )}
        </div>
      </div>

      {/* 중앙: 고객명 */}
      <div
        className={cn(
          'truncate font-medium',
          compact ? 'text-xs' : 'text-xs mb-1'
        )}
      >
        {meeting.client.name}
      </div>

      {/* 하단: 미팅 타입 (compact가 아닐 때만) */}
      {!compact && (
        <div className="text-xs opacity-90 truncate">{meeting.type}</div>
      )}

      {/* 충돌 상태 특별 표시 */}
      {syncStatus === 'conflict' && (
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-400 border border-white/70 animate-pulse"></div>
      )}

      {/* 동기화됨 상태 표시 */}
      {syncStatus === 'synced' && source !== 'surecrm' && (
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-400 border border-white/50"></div>
      )}

      {/* 호버 시 추가 정보 표시 */}
      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded flex items-center justify-center">
        <div className="text-xs text-white/90 text-center">
          <div>{source === 'surecrm' ? 'SureCRM' : '구글 캘린더'}</div>
        </div>
      </div>
    </div>
  );
}

// 🚀 더보기 버튼 컴포넌트
function MoreButton({
  count,
  onClick,
}: {
  count: number;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      className="text-xs text-foreground bg-gradient-to-r from-primary/20 to-primary/30 p-2 rounded cursor-pointer hover:from-primary/30 hover:to-primary/40 transition-all duration-200 border border-primary/30 backdrop-blur-sm font-semibold"
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
        <span>+{count}개 더 보기</span>
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
      ? meetings.filter((meeting) => filteredTypes.includes(meeting.type))
      : meetings;

  // 필터링된 결과가 없는 경우 빈 상태 표시
  if (filteredMeetings.length === 0 && meetings.length > 0) {
    return (
      <div className="bg-card/30 rounded-2xl overflow-hidden border border-border/30 shadow-2xl backdrop-blur-md">
        <div className="p-12 text-center">
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
          <h3 className="text-xl font-semibold text-foreground mb-3">
            선택한 필터에 해당하는 미팅이 없습니다
          </h3>
          <p className="text-muted-foreground mb-6">
            다른 미팅 유형을 선택하거나 필터를 초기화해보세요.
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

            {/* 🎯 개선된 이벤트 카운터 */}
            {dayMeetings.length > 0 && (
              <div className="flex items-center gap-1">
                {Object.entries(sourceCount).map(([source, count]) => {
                  const sourceStyle =
                    eventSourceStyles[source as EventSource] ||
                    eventSourceStyles.surecrm;
                  return (
                    <div
                      key={source}
                      className={cn(
                        'text-xs px-2 py-1 rounded-full border backdrop-blur-sm font-medium',
                        `bg-gradient-to-r ${sourceStyle.gradient}`,
                        `${sourceStyle.border}`,
                        sourceStyle.textColor
                      )}
                      title={`${
                        source === 'surecrm' ? 'SureCRM' : '구글 캘린더'
                      }: ${count}개`}
                    >
                      <span className="mr-1">{sourceStyle.icon}</span>
                      {count}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 🎨 미팅 리스트 - 완전히 새로운 레이아웃 */}
          <div className="space-y-1.5">
            {dayMeetings.length <= 3 ? (
              // 3개 이하일 때: 풀 디스플레이
              dayMeetings.map((meeting) => (
                <EventCard
                  key={meeting.id}
                  meeting={meeting}
                  compact={false}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMeetingClick(meeting);
                  }}
                />
              ))
            ) : dayMeetings.length === 4 ? (
              // 4개일 때: 3개 표시 + 1개 더보기
              <>
                {dayMeetings.slice(0, 3).map((meeting) => (
                  <EventCard
                    key={meeting.id}
                    meeting={meeting}
                    compact={true}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMeetingClick(meeting);
                    }}
                  />
                ))}
                <MoreButton
                  count={1}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDateClick?.(cellDate);
                  }}
                />
              </>
            ) : (
              // 5개 이상일 때: 2개 표시 + n개 더보기
              <>
                {dayMeetings.slice(0, 2).map((meeting) => (
                  <EventCard
                    key={meeting.id}
                    meeting={meeting}
                    compact={true}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMeetingClick(meeting);
                    }}
                  />
                ))}
                <MoreButton
                  count={dayMeetings.length - 2}
                  onClick={(e) => {
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
          {dayMeetings.some((m) => m.syncInfo?.syncStatus === 'conflict') && (
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
