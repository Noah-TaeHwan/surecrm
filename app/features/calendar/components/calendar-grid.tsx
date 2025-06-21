import { cn } from '~/lib/utils';
import {
  meetingTypeColors,
  meetingTypeKoreanMap,
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
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '~/common/components/ui/badge';
import { useViewport } from '~/common/hooks/useViewport';
import { Button } from '~/common/components/ui/button';
import { useState, useRef, useEffect } from 'react';

interface CalendarGridProps {
  selectedDate: Date;
  meetings: Meeting[];
  onMeetingClick: (meeting: Meeting) => void;
  onDateClick?: (date: Date) => void;
  onMonthChange?: (date: Date) => void;
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

// 🚀 iOS 스타일의 이벤트 카드 (모바일 최적화)
function EventCard({
  meeting,
  compact = false,
  onClick,
}: {
  meeting: Meeting;
  compact?: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  const { isMobile } = useViewport();
  const source = (meeting.syncInfo?.externalSource || 'surecrm') as EventSource;
  const syncStatus = meeting.syncInfo?.syncStatus;

  return (
    <div
      className={cn(
        'group relative rounded-lg cursor-pointer transition-all duration-200 ease-out',
        'transform hover:scale-[1.02] active:scale-[0.98]',
        // 모바일: 더 큰 터치 타겟과 패딩
        isMobile ? (compact ? 'p-3 min-h-[44px]' : 'p-3.5 min-h-[48px]') : (compact ? 'p-2.5' : 'p-3'),
        'bg-white dark:bg-gray-800 border-l-4 shadow-sm',
        'hover:shadow-md transition-shadow duration-200',
        // iOS 스타일 타입별 색상
        meeting.type === 'initial'
          ? 'border-l-blue-500 bg-blue-50/30 dark:bg-blue-900/10'
          : meeting.type === 'consultation'
            ? 'border-l-green-500 bg-green-50/30 dark:bg-green-900/10'
            : meeting.type === 'contract'
              ? 'border-l-red-500 bg-red-50/30 dark:bg-red-900/10'
              : 'border-l-gray-500 bg-gray-50/30 dark:bg-gray-900/10'
      )}
      onClick={onClick}
      title={`${meeting.time} - ${meeting.title}`}
    >
      <div className="relative z-10 space-y-1">
        {/* 시간 & 소스 아이콘 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className={cn('opacity-70', isMobile ? 'h-3.5 w-3.5' : 'h-3 w-3')} />
            <span className={cn('font-semibold tracking-wide text-gray-700 dark:text-gray-300', 
              isMobile ? 'text-sm' : 'text-xs')}>
              {meeting.time}
            </span>
          </div>
          <span className={cn('transition-transform duration-200 group-hover:scale-110', 
            isMobile ? 'text-lg' : 'text-sm')}>
            {source === 'google' ? '📅' : '💼'}
          </span>
        </div>

        {/* 이벤트 제목 */}
        <div className="flex items-center">
          <span
            className={cn(
              'font-medium truncate text-gray-900 dark:text-gray-100',
              isMobile ? (compact ? 'text-sm' : 'text-base') : (compact ? 'text-xs' : 'text-sm')
            )}
          >
            {meeting.title}
          </span>
        </div>
      </div>

      {/* 동기화 상태 표시점 - iOS 스타일 */}
      {syncStatus === 'conflict' && (
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-white animate-pulse shadow-lg z-20"></div>
      )}

      {syncStatus === 'synced' && source !== 'surecrm' && (
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-lg z-20"></div>
      )}
    </div>
  );
}

// 🎯 iOS 스타일 더보기 버튼
function MoreEventsButton({
  count,
  meetings,
  onClick,
}: {
  count: number;
  meetings: Meeting[];
  onClick: (e: React.MouseEvent) => void;
}) {
  const { isMobile } = useViewport();
  const previewTimes = meetings
    .slice(0, 2)
    .map(m => m.time)
    .join(', ');

  return (
    <div
      className={cn(
        'group relative rounded-lg cursor-pointer transition-all duration-200',
        'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700',
        'border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
        'shadow-sm hover:shadow-md transform hover:scale-[1.01] active:scale-[0.99]',
        isMobile ? 'p-3 min-h-[44px]' : 'p-2.5',
        'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
      )}
      onClick={onClick}
      title={`추가 일정: ${previewTimes}${meetings.length > 2 ? '...' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <MoreHorizontal className={cn(isMobile ? 'h-4 w-4' : 'h-3 w-3')} />
          <span className={cn('font-medium', isMobile ? 'text-sm' : 'text-xs')}>
            +{count}개 더
          </span>
        </div>
        <div className="w-2 h-2 bg-blue-500 rounded-full group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-200" />
      </div>

      {/* 미리보기 힌트 */}
      <div className={cn('mt-1 opacity-70 truncate', isMobile ? 'text-xs' : 'text-[10px]')}>
        {previewTimes}
      </div>
    </div>
  );
}

// 📅 iOS 스타일 날짜 셀 헤더
function DateCellHeader({
  day,
  isToday,
  dayMeetings,
  sourceCount,
}: {
  day: number;
  isToday: boolean;
  dayMeetings: Meeting[];
  sourceCount: Record<string, number>;
}) {
  const { isMobile } = useViewport();
  
  return (
    <div className="flex items-center justify-between mb-2">
      {/* iOS 스타일 날짜 번호 */}
      <div
        className={cn(
          'flex items-center justify-center rounded-full font-semibold transition-all duration-200',
          isMobile ? 'w-8 h-8 text-base' : 'w-7 h-7 text-sm',
          isToday
            ? 'bg-blue-500 text-white shadow-lg ring-2 ring-blue-500/30 scale-110'
            : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
        )}
      >
        {day}
      </div>

      {/* 소스별 카운터 제거 - 구글 캘린더 완전 통합 */}
    </div>
  );
}

// 🎨 iOS 스타일 월 헤더 컴포넌트
function MonthHeader({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onTitleClick,
}: {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onTitleClick?: () => void;
}) {
  const { isMobile } = useViewport();
  const monthName = currentDate.toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long' 
  });

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <Button
        variant="ghost"
        size={isMobile ? "default" : "sm"}
        onClick={onPrevMonth}
        className={cn(
          "p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
          isMobile && "min-w-[44px] min-h-[44px]"
        )}
      >
        <ChevronLeft className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
      </Button>

      <button
        onClick={onTitleClick}
        className={cn(
          "font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
          isMobile ? "text-xl" : "text-lg"
        )}
      >
        {monthName}
      </button>

      <Button
        variant="ghost"
        size={isMobile ? "default" : "sm"}
        onClick={onNextMonth}
        className={cn(
          "p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
          isMobile && "min-w-[44px] min-h-[44px]"
        )}
      >
        <ChevronRight className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
      </Button>
    </div>
  );
}

// 📱 요일 헤더 (iOS 스타일)
function WeekdayHeader() {
  const { isMobile } = useViewport();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  
  return (
    <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
      {weekdays.map((day, index) => (
        <div
          key={day}
          className={cn(
            "text-center font-medium transition-colors",
            isMobile ? "py-3 text-sm" : "py-2 text-xs",
            index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : "text-gray-600 dark:text-gray-400"
          )}
        >
          {day}
        </div>
      ))}
    </div>
  );
}

export function CalendarGrid({
  selectedDate,
  meetings,
  onMeetingClick,
  onDateClick,
  onMonthChange,
}: CalendarGridProps) {
  const { isMobile } = useViewport();
  const [currentDate, setCurrentDate] = useState(selectedDate);
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 햅틱 피드백 함수
  const triggerHapticFeedback = () => {
    if ('vibrate' in navigator && isMobile) {
      navigator.vibrate(10);
    }
  };

  // 터치 시작 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
    });
  };

  // 터치 끝 핸들러 (스와이프 감지)
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !isMobile) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = Math.abs(touch.clientY - touchStart.y);

    // 수평 스와이프 감지 (최소 50px, 수직 이동은 30px 미만)
    if (Math.abs(deltaX) > 50 && deltaY < 30) {
      setIsTransitioning(true);
      triggerHapticFeedback();
      
      if (deltaX > 0) {
        // 오른쪽 스와이프 = 이전 달
        handlePrevMonth();
      } else {
        // 왼쪽 스와이프 = 다음 달
        handleNextMonth();
      }

      setTimeout(() => setIsTransitioning(false), 300);
    }

    setTouchStart(null);
  };

  // 월 변경 함수들
  const handlePrevMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(newDate);
    onMonthChange?.(newDate);
    triggerHapticFeedback();
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(newDate);
    onMonthChange?.(newDate);
    triggerHapticFeedback();
  };

  // 날짜 클릭 핸들러 (햅틱 피드백 추가)
  const handleDateClick = (date: Date) => {
    triggerHapticFeedback();
    onDateClick?.(date);
  };

  // 미팅 클릭 핸들러 (햅틱 피드백 추가)
  const handleMeetingClick = (meeting: Meeting, event: React.MouseEvent) => {
    event.stopPropagation();
    triggerHapticFeedback();
    onMeetingClick(meeting);
  };

  // 날짜 유틸리티 함수들
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const today = new Date();

    const days = [];

    // 이전 달 날짜들 (회색 처리)
    const prevMonthDays = firstDay;
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthLastDay = prevMonth.getDate();

    for (let i = prevMonthDays - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const cellDate = new Date(year, month - 1, day);
      
      days.push(
        <div
          key={`prev-${day}`}
          className={cn(
            'cursor-pointer transition-all duration-200 relative overflow-hidden',
            'bg-gray-50/30 dark:bg-gray-800/30 text-gray-400 dark:text-gray-600',
            // 모바일: 더 큰 터치 타겟
            isMobile ? 'p-4 min-h-[80px]' : 'p-3 min-h-[120px]',
            'hover:bg-gray-100 dark:hover:bg-gray-700/30 rounded-lg'
          )}
          onClick={() => handleDateClick(cellDate)}
        >
          <div className={cn(
            'flex items-center justify-center rounded-full font-medium',
            isMobile ? 'w-7 h-7 text-sm' : 'w-6 h-6 text-xs'
          )}>
            {day}
          </div>
        </div>
      );
    }

    // 현재 달 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      const isToday = 
        cellDate.getDate() === today.getDate() &&
        cellDate.getMonth() === today.getMonth() &&
        cellDate.getFullYear() === today.getFullYear();
      const isWeekend = cellDate.getDay() === 0 || cellDate.getDay() === 6;

      // 해당 날짜의 미팅들
      const dayMeetings = meetings.filter(meeting => {
        const meetingDate = new Date(meeting.date);
        return (
          meetingDate.getDate() === cellDate.getDate() &&
          meetingDate.getMonth() === cellDate.getMonth() &&
          meetingDate.getFullYear() === cellDate.getFullYear()
        );
      });

      // 소스별 미팅 수 계산
      const sourceCount = dayMeetings.reduce((acc, meeting) => {
        const source = meeting.syncInfo?.externalSource || 'surecrm';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      days.push(
        <div
          key={day}
          className={cn(
            'cursor-pointer transition-all duration-200 relative overflow-hidden rounded-lg',
            'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800',
            'border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600',
            isToday && 'ring-2 ring-blue-500/30 bg-blue-50/50 dark:bg-blue-900/20 shadow-lg',
            isWeekend && !isToday && 'bg-gray-50/50 dark:bg-gray-800/30',
            // 모바일 최적화된 높이
            isMobile 
              ? (dayMeetings.length === 0 ? 'p-3 min-h-[80px]' : 'p-3 min-h-[100px]')
              : (dayMeetings.length === 0 ? 'p-3 min-h-[120px]' : 'p-3 min-h-[140px]'),
            // iOS 스타일 그림자
            'shadow-sm hover:shadow-md transition-shadow duration-200'
          )}
          onClick={() => handleDateClick(cellDate)}
        >
          {/* 날짜 헤더 */}
          <DateCellHeader
            day={day}
            isToday={isToday}
            dayMeetings={dayMeetings}
            sourceCount={sourceCount}
          />

          {/* 이벤트 표시 영역 */}
          <div className="space-y-1">
            {dayMeetings.length > 0 && (
              <>
                {/* 첫 번째 이벤트 */}
                <EventCard
                  meeting={dayMeetings[0]}
                  compact={isMobile}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMeetingClick(dayMeetings[0], e);
                  }}
                />

                {/* 두 번째 이벤트 (데스크톱에서만) */}
                {!isMobile && dayMeetings.length > 1 && (
                  <EventCard
                    meeting={dayMeetings[1]}
                    compact={true}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMeetingClick(dayMeetings[1], e);
                    }}
                  />
                )}

                {/* 더보기 버튼 */}
                {((isMobile && dayMeetings.length > 1) || (!isMobile && dayMeetings.length > 2)) && (
                  <MoreEventsButton
                    count={isMobile ? dayMeetings.length - 1 : dayMeetings.length - 2}
                    meetings={dayMeetings.slice(isMobile ? 1 : 2)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDateClick(cellDate);
                    }}
                  />
                )}
              </>
            )}

            {/* 빈 날짜 표시 */}
            {dayMeetings.length === 0 && (
              <div className={cn(
                'flex items-center justify-center text-gray-400 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity',
                isMobile ? 'h-8' : 'h-12'
              )}>
                <Plus className={cn('transition-transform group-hover:scale-110', isMobile ? 'h-4 w-4' : 'h-5 w-5')} />
              </div>
            )}
          </div>
        </div>
      );
    }

    // 다음 달 날짜들 (회색 처리)
    const remainingCells = 42 - days.length; // 6주 * 7일
    for (let day = 1; day <= remainingCells; day++) {
      const cellDate = new Date(year, month + 1, day);
      
      days.push(
        <div
          key={`next-${day}`}
          className={cn(
            'cursor-pointer transition-all duration-200 relative overflow-hidden',
            'bg-gray-50/30 dark:bg-gray-800/30 text-gray-400 dark:text-gray-600',
            isMobile ? 'p-4 min-h-[80px]' : 'p-3 min-h-[120px]',
            'hover:bg-gray-100 dark:hover:bg-gray-700/30 rounded-lg'
          )}
          onClick={() => handleDateClick(cellDate)}
        >
          <div className={cn(
            'flex items-center justify-center rounded-full font-medium',
            isMobile ? 'w-7 h-7 text-sm' : 'w-6 h-6 text-xs'
          )}>
            {day}
          </div>
        </div>
      );
    }

    return (
      <div 
        className={cn(
          'grid grid-cols-7 gap-1 bg-gray-50 dark:bg-gray-900',
          isMobile ? 'p-2' : 'p-3',
          isTransitioning && 'transition-transform duration-300 ease-out'
        )}
      >
        {days}
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className="w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* iOS 스타일 월 헤더 */}
      <MonthHeader
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onTitleClick={() => triggerHapticFeedback()}
      />

      {/* 요일 헤더 */}
      <WeekdayHeader />

      {/* 캘린더 그리드 */}
      {renderMonthView()}

      {/* 스와이프 인디케이터 (모바일만) */}
      {isMobile && (
        <div className="flex justify-center py-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-600">
            <ChevronLeft className="h-3 w-3" />
            <span>스와이프하여 월 이동</span>
            <ChevronRight className="h-3 w-3" />
          </div>
        </div>
      )}
    </div>
  );
}
