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
  Clock,
  MapPin,
  User,
  Plus,
  MoreHorizontal,
} from 'lucide-react';
import { Badge } from '~/common/components/ui/badge';

interface CalendarGridProps {
  selectedDate: Date;
  meetings: Meeting[];
  onMeetingClick: (meeting: Meeting) => void;
  filteredTypes?: string[];
  onDateClick?: (date: Date) => void;
}

// 🎨 현대적인 동기화 상태 표시기
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
        'flex items-center gap-1 text-xs px-2 py-1 rounded-full backdrop-blur-sm border',
        'shadow-sm transition-all duration-200',
        style.bgColor,
        style.color,
        'border-white/30'
      )}
      title={style.label}
    >
      <IconComponent
        className={cn('h-3 w-3', 'animate' in style ? style.animate : '')}
      />
      <span className="font-medium text-xs">{style.label}</span>
    </div>
  );
}

// 🚀 Google Calendar 스타일의 이벤트 카드 
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
        'group relative rounded-lg cursor-pointer transition-transform duration-200 ease-out',
        'hover:scale-[1.05] font-medium',
        'active:scale-[0.98]',
        compact ? 'text-xs p-2.5' : 'text-sm p-3',
        'bg-card border-2 text-foreground',
        // 타입별 보더 색상만 (배경 그라데이션 제거)
        meeting.type === 'initial'
          ? 'border-blue-500 hover:border-blue-600'
          : meeting.type === 'consultation'
            ? 'border-green-500 hover:border-green-600'
            : meeting.type === 'contract'
              ? 'border-red-500 hover:border-red-600'
              : 'border-gray-500 hover:border-gray-600',
        'shadow-sm'
      )}
      onClick={onClick}
      title={`${meeting.time} - ${meeting.client.name} (${koreanName})`}
    >
      <div className="relative z-10 space-y-1.5">
        {/* 상단: 시간 & 소스 아이콘 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 opacity-90 group-hover:h-3.5 group-hover:w-3.5 transition-all duration-200" />
            <span className="font-semibold text-xs tracking-wide">{meeting.time}</span>
          </div>
          <span className="text-sm opacity-80 group-hover:text-base transition-all duration-200">
            {source === 'google' ? '📅' : '💼'}
          </span>
        </div>

        {/* 중앙: 이벤트 제목 */}
        <div className="flex items-center gap-1.5">
          <User className="h-3 w-3 opacity-75 flex-shrink-0 group-hover:h-3.5 group-hover:w-3.5 transition-all duration-200" />
          <span className={cn(
            "font-medium truncate",
            compact ? "text-xs" : "text-sm"
          )}>
            {meeting.title}
          </span>
        </div>

        {/* 하단: 미팅 타입 & 위치 */}
        {!compact && (
          <div className="space-y-1">
            <div className="text-xs opacity-85 truncate">{koreanName}</div>
            {meeting.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-2.5 w-2.5 opacity-70 group-hover:h-3 group-hover:w-3 transition-all duration-200" />
                <span className="text-xs opacity-75 truncate">{meeting.location}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 동기화 상태 표시점 */}
      {syncStatus === 'conflict' && (
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-white animate-pulse shadow-lg z-20"></div>
      )}

      {syncStatus === 'synced' && source !== 'surecrm' && (
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-lg z-20"></div>
      )}


    </div>
  );
}

// 🎯 세련된 더보기 버튼 
function MoreEventsButton({
  count,
  meetings,
  onClick,
}: {
  count: number;
  meetings: Meeting[];
  onClick: (e: React.MouseEvent) => void;
}) {
  const previewTimes = meetings
    .slice(0, 2)
    .map(m => m.time)
    .join(', ');

  return (
    <div
      className={cn(
        "group relative rounded-lg cursor-pointer transition-all duration-300",
        "bg-gradient-to-br from-muted/40 to-muted/60 hover:from-muted/60 hover:to-muted/80",
        "border border-border/50 hover:border-border shadow-sm hover:shadow-md",
        "p-2.5 text-xs text-muted-foreground hover:text-foreground",
        "transform hover:scale-[1.02] active:scale-[0.98]"
      )}
      onClick={onClick}
      title={`추가 일정: ${previewTimes}${meetings.length > 2 ? '...' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <MoreHorizontal className="h-3 w-3" />
          <span className="font-medium">+{count}개 더</span>
        </div>
        <div className="w-1.5 h-1.5 bg-primary/60 rounded-full group-hover:bg-primary group-hover:scale-125 transition-all duration-200" />
      </div>
      
      {/* 미리보기 힌트 */}
      <div className="mt-1 text-xs opacity-70 truncate">
        {previewTimes}
      </div>
    </div>
  );
}

// 📅 개선된 날짜 셀 헤더
function DateCellHeader({ 
  day, 
  isToday, 
  dayMeetings, 
  sourceCount 
}: { 
  day: number;
  isToday: boolean;
  dayMeetings: Meeting[];
  sourceCount: Record<string, number>;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      {/* 날짜 */}
      <div className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-200",
        isToday
          ? "bg-primary text-primary-foreground shadow-lg scale-110"
          : "text-foreground/70"
      )}>
        {day}
      </div>

      {/* 이벤트 소스별 카운터 */}
      {dayMeetings.length > 0 && (
        <div className="flex items-center gap-1">
          {Object.entries(sourceCount).map(([source, count]) => {
            const sourceStyle =
              eventSourceStyles[source as EventSource] ||
              eventSourceStyles.surecrm;
            return (
              <Badge
                key={source}
                variant="secondary"
                className={cn(
                  'text-xs px-2 py-0.5 font-semibold border',
                  `bg-gradient-to-r ${sourceStyle.gradient}`,
                  sourceStyle.textColor,
                  sourceStyle.border,
                  'shadow-sm hover:shadow-md transition-shadow duration-200'
                )}
                title={`${source === 'surecrm' ? 'SureCRM' : '구글 캘린더'}: ${count}개`}
              >
                {sourceStyle.icon} {count}
              </Badge>
            );
          })}
        </div>
      )}
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
      <div className="bg-gradient-to-br from-card/50 to-card/30 rounded-3xl overflow-hidden border border-border/30 shadow-2xl backdrop-blur-xl">
        <div className="p-16 text-center">
          <div className="relative">
            <div className="p-8 bg-gradient-to-br from-muted/30 to-muted/10 rounded-full w-fit mx-auto mb-8 shadow-lg">
              <svg
                className="w-20 h-20 text-muted-foreground/40"
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
            <h3 className="text-2xl font-bold text-foreground mb-4 tracking-tight">
              선택한 필터에 해당하는 미팅이 없습니다
            </h3>
            <p className="text-muted-foreground mb-8 text-lg leading-relaxed max-w-md mx-auto">
              다른 미팅 유형을 선택하거나 필터를 초기화해보세요.
            </p>
            <div className="inline-flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 px-6 py-3 rounded-xl border border-border/50">
              <Badge variant="outline">전체 {meetings.length}개</Badge>
              <span>|</span>
              <Badge variant="outline">필터링됨 0개</Badge>
            </div>
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

  // 🎨 현대적인 월별 캘린더 렌더링
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
          className="min-h-[140px] bg-gradient-to-br from-muted/5 to-muted/10 border border-border/5 p-3 opacity-40 transition-all duration-200 hover:opacity-60"
        >
          <div className="text-sm text-muted-foreground/50 font-medium">
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
      const sourceCount = dayMeetings.reduce(
        (acc, meeting) => {
          const source = meeting.syncInfo?.externalSource || 'surecrm';
          acc[source] = (acc[source] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      days.push(
        <div
          key={day}
          className={cn(
            'border border-border/20 p-3 cursor-pointer transition-colors duration-200 relative overflow-hidden',
            'bg-gradient-to-br from-card/40 to-card/20 backdrop-blur-sm',
            isToday &&
              'bg-gradient-to-br from-primary/15 to-primary/5 border-primary/40 ring-2 ring-primary/20 shadow-xl',
            isWeekend && 'bg-gradient-to-br from-muted/30 to-muted/10',
            // 동적 높이 - 더 자연스럽게
            dayMeetings.length === 0
              ? 'min-h-[140px]'
              : dayMeetings.length === 1
                ? 'min-h-[160px]'
                : dayMeetings.length <= 3
                  ? 'min-h-[180px]'
                  : 'min-h-[200px]'
          )}
          onClick={() => onDateClick?.(cellDate)}
        >
          {/* 날짜 헤더 */}
          <DateCellHeader 
            day={day}
            isToday={isToday}
            dayMeetings={dayMeetings}
            sourceCount={sourceCount}
          />

          {/* 🎨 스마트 이벤트 표시 시스템 - 개선된 버전 */}
          <div className="space-y-2">
            {dayMeetings.length === 0 ? (
              // 빈 상태 - 미묘한 플러스 아이콘
              <div className="flex items-center justify-center h-16 opacity-0 hover:opacity-30 transition-opacity duration-300">
                <Plus className="h-5 w-5 text-muted-foreground/50" />
              </div>
            ) : dayMeetings.length === 1 ? (
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
                <MoreEventsButton
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

          {/* 🔄 동기화 충돌 표시 - 더 눈에 띄게 */}
          {dayMeetings.some(m => m.syncInfo?.syncStatus === 'conflict') && (
            <div
              className="absolute bottom-3 right-3 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white shadow-lg ring-2 ring-red-500/30"
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
          className="min-h-[140px] bg-gradient-to-br from-muted/5 to-muted/10 border border-border/5 p-3 opacity-40 transition-all duration-200 hover:opacity-60"
        >
          <div className="text-sm text-muted-foreground/50 font-medium">
            {day}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-br from-card/50 to-card/30 rounded-3xl overflow-hidden border border-border/30 shadow-2xl backdrop-blur-xl">
        {/* 🎨 현대적인 요일 헤더 */}
        <div className="grid grid-cols-7 border-b border-border/30 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 backdrop-blur-sm">
          {[
            { full: '일요일', short: '일' },
            { full: '월요일', short: '월' },
            { full: '화요일', short: '화' },
            { full: '수요일', short: '수' },
            { full: '목요일', short: '목' },
            { full: '금요일', short: '금' },
            { full: '토요일', short: '토' },
          ].map((day, index) => (
            <div
              key={day.full}
              className={cn(
                'p-5 text-center font-bold text-sm border-r border-border/20 last:border-r-0',
                'bg-gradient-to-b from-card/50 to-card/30 backdrop-blur-sm',
                'transition-colors duration-200 hover:bg-card/40',
                index === 0
                  ? 'text-red-500'
                  : index === 6
                    ? 'text-blue-500'
                    : 'text-foreground/80'
              )}
            >
              <div className="hidden lg:block tracking-wide">{day.full}</div>
              <div className="lg:hidden font-black text-lg">{day.short}</div>
            </div>
          ))}
        </div>

        {/* 🎯 현대적인 날짜 그리드 */}
        <div className="grid grid-cols-7 bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm">
          {days}
        </div>
      </div>
    );
  };

  return renderMonthView();
}
