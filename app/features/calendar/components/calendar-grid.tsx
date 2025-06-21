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
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { subMonths, addMonths } from 'date-fns';

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

// 🚀 iOS 스타일의 이벤트 카드 (SureCRM 색상 시스템 적용)
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
  const colors = getEventColors(meeting);

  return (
    <div
      className={cn(
        'group relative rounded-lg cursor-pointer transition-all duration-200 ease-out',
        'transform hover:scale-[1.02] active:scale-[0.98]',
        // 모바일: 더 큰 터치 타겟과 패딩
        isMobile ? (compact ? 'p-3 min-h-[44px]' : 'p-3.5 min-h-[48px]') : (compact ? 'p-2.5' : 'p-3'),
        'border shadow-sm hover:shadow-md transition-shadow duration-200',
        // SureCRM 색상 시스템 적용
        colors.bg,
        colors.border,
        colors.text
      )}
      onClick={onClick}
      title={`${meeting.time} - ${meeting.title}`}
    >
      <div className="relative z-10 space-y-1">
        {/* 시간 & 소스 아이콘 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", colors.dot)} />
            <Clock className={cn('opacity-70', isMobile ? 'h-3.5 w-3.5' : 'h-3 w-3')} />
            <span className={cn('font-semibold tracking-wide', 
              isMobile ? 'text-sm' : 'text-xs')}>
              {meeting.time}
            </span>
          </div>

        </div>

        {/* 이벤트 제목 */}
        <div className="flex items-center">
          <span
            className={cn(
              'font-medium truncate',
              isMobile ? (compact ? 'text-sm' : 'text-base') : (compact ? 'text-xs' : 'text-sm')
            )}
          >
            {meeting.title}
          </span>
        </div>
      </div>

      {/* 동기화 상태 표시점 - SureCRM 절제된 색상 */}
      {syncStatus === 'conflict' && (
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-white animate-pulse shadow-lg z-20"></div>
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
        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full group-hover:bg-gray-500 dark:group-hover:bg-gray-400 group-hover:scale-110 transition-all duration-200" />
      </div>

      {/* 미리보기 힌트 */}
      <div className={cn('mt-1 opacity-70 truncate', isMobile ? 'text-xs' : 'text-[10px]')}>
        {previewTimes}
      </div>
    </div>
  );
}

// 📅 iOS 스타일 날짜 셀 헤더 (SureCRM 색상 시스템 적용)
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
      {/* iOS 스타일 날짜 번호 (SureCRM 톤 적용) */}
      <div
        className={cn(
          'flex items-center justify-center rounded-full font-semibold transition-all duration-200',
          isMobile ? 'w-8 h-8 text-base' : 'w-7 h-7 text-sm',
          isToday
            ? 'bg-sky-500 text-white shadow-lg ring-2 ring-sky-500/30 scale-110' // SureCRM 스카이-500
            : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
        )}
      >
        {day}
      </div>

      {/* 🍎 모바일: iOS 네이티브 스타일 이벤트 점 표시 */}
      {isMobile && dayMeetings.length > 0 && (
        <div className="flex items-center gap-0.5 max-w-[50px] overflow-hidden">
          {dayMeetings.slice(0, 4).map((meeting, index) => (
            <EventDot 
              key={`${meeting.id}-${index}`} 
              event={meeting}
              className="animate-in fade-in duration-300"
            />
          ))}
          {dayMeetings.length > 4 && (
            <div 
              className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500 flex-shrink-0 ml-0.5"
              title={`+${dayMeetings.length - 4}개 더`}
            />
          )}
        </div>
      )}
    </div>
  );
}

// 🎨 iOS 스타일 월 헤더 컴포넌트 (SureCRM 색상 시스템 적용)
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
    <div className={cn(
      "flex items-center justify-between p-4",
      "bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm", // 글래스모피즘
      "border-b border-gray-200 dark:border-gray-800/50", // SureCRM 테두리
      "sticky top-0 z-10"
    )}>
      <Button
        variant="ghost"
        size={isMobile ? "default" : "sm"}
        onClick={onPrevMonth}
        className={cn(
          "p-2 rounded-lg text-gray-600 dark:text-gray-400",
          "hover:bg-gray-100 dark:hover:bg-gray-800/50",
          "hover:text-gray-900 dark:hover:text-gray-100",
          "transition-all duration-200",
          isMobile && "min-w-[44px] min-h-[44px] touch-target"
        )}
      >
        <ChevronLeft className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
      </Button>

      <div className="flex items-center gap-4">
        <button
          onClick={onTitleClick}
          className={cn(
            "font-bold text-gray-900 dark:text-gray-100",
            "hover:text-sky-600 dark:hover:text-sky-400 transition-colors",
            isMobile ? "text-xl" : "text-lg"
          )}
        >
          {monthName}
        </button>
        
        {/* 오늘로 이동 버튼 */}
        <button
          onClick={() => onTitleClick?.()}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-lg",
            "bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300",
            "hover:bg-gray-200 dark:hover:bg-gray-700/50",
            "transition-colors duration-200",
            "touch-target"
          )}
        >
          오늘
        </button>
      </div>

      <Button
        variant="ghost"
        size={isMobile ? "default" : "sm"}
        onClick={onNextMonth}
        className={cn(
          "p-2 rounded-lg text-gray-600 dark:text-gray-400",
          "hover:bg-gray-100 dark:hover:bg-gray-800/50",
          "hover:text-gray-900 dark:hover:text-gray-100",
          "transition-all duration-200",
          isMobile && "min-w-[44px] min-h-[44px] touch-target"
        )}
      >
        <ChevronRight className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
      </Button>
    </div>
  );
}

// 📱 요일 헤더 (iOS 스타일, SureCRM 색상 시스템 적용)
function WeekdayHeader() {
  const { isMobile } = useViewport();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  
  return (
    <div className={cn(
      "grid grid-cols-7",
      "bg-gray-50/80 dark:bg-gray-800/30 backdrop-blur-sm", // 글래스모피즘
      "border-b border-gray-200 dark:border-gray-800/50" // SureCRM 테두리
    )}>
      {weekdays.map((day, index) => (
        <div
          key={day}
          className={cn(
            "text-center font-semibold transition-colors",
            isMobile ? "py-3 text-sm" : "py-2.5 text-xs",
            index === 0 
              ? "text-rose-500 dark:text-rose-400" // 일요일 (SureCRM 로즈-500)
              : index === 6 
              ? "text-sky-500 dark:text-sky-400" // 토요일 (SureCRM 스카이-500)
              : "text-gray-700 dark:text-gray-300" // 평일 (절제된 색상)
          )}
        >
          {day}
        </div>
      ))}
    </div>
  );
}

// 🎨 SureCRM 진짜 색상 시스템 (중성적이고 프로페셔널)
const getEventColors = (event: Meeting) => {
  // SureCRM 실제 사용 색상 (매우 절제된 팔레트)
  const colorMap = {
    // 기본: 중성 회색 (가장 많이 사용)
    neutral: {
      bg: 'bg-gray-50 dark:bg-gray-900/20',
      border: 'border-gray-200 dark:border-gray-700/50',
      text: 'text-gray-700 dark:text-gray-300',
      dot: 'bg-gray-400 dark:bg-gray-500',
    },
    // 첫 상담: 스카이 (절제된 파랑)
    sky: {
      bg: 'bg-sky-50 dark:bg-sky-950/20',
      border: 'border-sky-200 dark:border-sky-800/50',
      text: 'text-sky-700 dark:text-sky-300',
      dot: 'bg-sky-500',
    },
    // 성공/완료: 에메랄드
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/20', 
      border: 'border-emerald-200 dark:border-emerald-800/50',
      text: 'text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    },
    // 진행중/검토: 앰버
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      border: 'border-amber-200 dark:border-amber-800/50', 
      text: 'text-amber-700 dark:text-amber-300',
      dot: 'bg-amber-500',
    },
    // 중요/긴급: 로즈
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/20',
      border: 'border-rose-200 dark:border-rose-800/50',
      text: 'text-rose-700 dark:text-rose-300',
      dot: 'bg-rose-500',
    },
    // 특별/VIP: 바이올렛
    violet: {
      bg: 'bg-violet-50 dark:bg-violet-950/20',
      border: 'border-violet-200 dark:border-violet-800/50',
      text: 'text-violet-700 dark:text-violet-300',
      dot: 'bg-violet-500',
    },
  };
  
  // SureCRM 이벤트 타입별 색상 매핑 (실제 비즈니스 로직 반영)
  const typeColorMap: Record<string, keyof typeof colorMap> = {
    'first_consultation': 'sky',        // 첫 상담 - 스카이
    'needs_analysis': 'emerald',        // 니즈 분석 - 에메랄드  
    'product_explanation': 'amber',     // 상품 설명 - 앰버
    'contract_review': 'rose',          // 계약 검토 - 로즈
    'contract_signing': 'emerald',      // 계약 완료 - 에메랄드
    'follow_up': 'violet',              // 후속 관리 - 바이올렛
    'claim_support': 'rose',            // 클레임 지원 - 로즈
    'other': 'neutral',                 // 기타 - 중성
  };
  
  // 구글 캘린더 이벤트는 중성 색상 (절제됨)
  if (event.syncInfo?.externalSource === 'google') {
    return colorMap['neutral'];
  }
  
  // SureCRM 이벤트는 타입에 따라 색상 결정
  const colorKey = typeColorMap[event.type] || 'neutral';
  return colorMap[colorKey];
};

// 📱 모바일 iOS 스타일 점 표시 컴포넌트
// 🍎 iOS 네이티브 스타일 이벤트 점 (더 정교한 디자인)
const EventDot = ({ event, className = '' }: { event: Meeting; className?: string }) => {
  const colors = getEventColors(event);
  
  return (
    <div 
      className={cn(
        "w-1.5 h-1.5 rounded-full flex-shrink-0 shadow-sm",
        "ring-1 ring-white/50 dark:ring-gray-900/50", // iOS 스타일 링
        colors.dot,
        // 미묘한 애니메이션
        "transition-all duration-200 hover:scale-110",
        className
      )}
      title={event.title}
    />
  );
};

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
            isToday && 'ring-2 ring-sky-500/30 bg-sky-50/50 dark:bg-sky-900/20 shadow-lg',
            isWeekend && !isToday && 'bg-gray-50/50 dark:bg-gray-800/30',
            // 💻📱 최적화된 높이 (더 많은 이벤트 표시 가능)
            isMobile 
              ? (dayMeetings.length === 0 ? 'p-3 min-h-[80px]' : 'p-3 min-h-[100px]')
              : (dayMeetings.length === 0 ? 'p-3 min-h-[140px]' : dayMeetings.length <= 2 ? 'p-3 min-h-[160px]' : 'p-3 min-h-[180px]'),
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

          {/* 💻🍎 이벤트 표시 영역 (데스크톱/모바일 최적화) */}
          <div className="space-y-1 flex-1">
            {dayMeetings.length > 0 && (
              <>
                {/* 📱 모바일: 첫 번째 이벤트만 + 점 표시 */}
                {isMobile ? (
                  <EventCard
                    meeting={dayMeetings[0]}
                    compact={true}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMeetingClick(dayMeetings[0], e);
                    }}
                  />
                ) : (
                  /* 💻 데스크톱: 더 풍부한 이벤트 표시 */
                  <>
                    {/* 첫 번째 이벤트 (풀 사이즈) */}
                    <EventCard
                      meeting={dayMeetings[0]}
                      compact={false}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMeetingClick(dayMeetings[0], e);
                      }}
                    />

                    {/* 두 번째 이벤트 (컴팩트) */}
                    {dayMeetings.length > 1 && (
                      <EventCard
                        meeting={dayMeetings[1]}
                        compact={true}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMeetingClick(dayMeetings[1], e);
                        }}
                      />
                    )}

                    {/* 세 번째 이벤트 (컴팩트) */}
                    {dayMeetings.length > 2 && (
                      <EventCard
                        meeting={dayMeetings[2]}
                        compact={true}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMeetingClick(dayMeetings[2], e);
                        }}
                      />
                    )}
                  </>
                )}

                {/* 더보기 버튼 */}
                {((isMobile && dayMeetings.length > 1) || (!isMobile && dayMeetings.length > 3)) && (
                  <MoreEventsButton
                    count={isMobile ? dayMeetings.length - 1 : dayMeetings.length - 3}
                    meetings={dayMeetings.slice(isMobile ? 1 : 3)}
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
