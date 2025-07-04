import { cn } from '~/lib/utils';
import {
  meetingTypeColors,
  meetingTypeKoreanMap,
  meetingTypeDetails,
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
  X,
} from 'lucide-react';
import { Badge } from '~/common/components/ui/badge';
import { useViewport } from '~/common/hooks/useViewport';
import { Button } from '~/common/components/ui/button';
import {
  useState,
  useRef,
  useEffect,
  useSyncExternalStore,
  memo,
  useMemo,
  useCallback,
} from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { subMonths, addMonths } from 'date-fns';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';

interface CalendarGridProps {
  selectedDate: Date;
  meetings: Meeting[];
  onMeetingClick: (meeting: Meeting) => void;
  onDateClick?: (date: Date) => void;
  onMoreEventsClick?: (date: Date) => void;
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
    first_consultation: 'sky', // 첫 상담 - 스카이
    needs_analysis: 'emerald', // 니즈 분석 - 에메랄드
    product_explanation: 'amber', // 상품 설명 - 앰버
    contract_review: 'rose', // 계약 검토 - 로즈
    contract_signing: 'emerald', // 계약 완료 - 에메랄드
    follow_up: 'violet', // 후속 관리 - 바이올렛
    claim_support: 'rose', // 클레임 지원 - 로즈
    other: 'neutral', // 기타 - 중성
  };

  // 구글 캘린더 이벤트는 중성 색상 (절제됨)
  if (event.syncInfo?.externalSource === 'google') {
    return colorMap['neutral'];
  }

  // SureCRM 이벤트는 타입에 따라 색상 결정
  const colorKey = typeColorMap[event.type] || 'neutral';
  return colorMap[colorKey];
};

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
        isMobile
          ? compact
            ? 'p-3 min-h-[44px]'
            : 'p-3.5 min-h-[48px]'
          : compact
            ? 'p-2.5'
            : 'p-3',
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
            <div
              className={cn(
                'w-1.5 h-1.5 rounded-full flex-shrink-0',
                colors.dot
              )}
            />
            <Clock
              className={cn('opacity-70', isMobile ? 'h-3.5 w-3.5' : 'h-3 w-3')}
            />
            <span
              className={cn(
                'font-semibold tracking-wide',
                isMobile ? 'text-sm' : 'text-xs'
              )}
            >
              {meeting.time}
            </span>
          </div>
        </div>

        {/* 이벤트 제목 */}
        <div className="flex items-center">
          <span
            className={cn(
              'font-medium truncate',
              isMobile
                ? compact
                  ? 'text-sm'
                  : 'text-base'
                : compact
                  ? 'text-xs'
                  : 'text-sm'
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
  const { t } = useHydrationSafeTranslation('calendar');
  const previewTimes = meetings
    .slice(0, 2)
    .map(m => m.time)
    .join(', ');

  return (
    <div
      className={cn(
        'group relative rounded-lg cursor-pointer transition-all duration-200',
        'bg-muted hover:bg-muted/80',
        'border border-border hover:border-border/80',
        'shadow-sm hover:shadow-md transform hover:scale-[1.01] active:scale-[0.99]',
        isMobile ? 'p-3 min-h-[44px]' : 'p-2.5',
        'text-muted-foreground hover:text-foreground'
      )}
      onClick={onClick}
      title={`추가 일정: ${previewTimes}${meetings.length > 2 ? '...' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <MoreHorizontal className={cn(isMobile ? 'h-4 w-4' : 'h-3 w-3')} />
          <span className={cn('font-medium', isMobile ? 'text-sm' : 'text-xs')}>
            {t('calendarGrid.moreEvents', `+${count}개 더`, { count })}
          </span>
        </div>
        <div className="w-2 h-2 bg-muted-foreground rounded-full group-hover:bg-foreground group-hover:scale-110 transition-all duration-200" />
      </div>

      {/* 미리보기 힌트 */}
      <div
        className={cn(
          'mt-1 opacity-70 truncate',
          isMobile ? 'text-xs' : 'text-[10px]'
        )}
      >
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
            ? 'bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/30 scale-110'
            : 'text-foreground hover:bg-muted/50'
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
  const { t, formatDate, getCurrentLanguage } =
    useHydrationSafeTranslation('calendar');

  const monthName = useSyncExternalStore(
    () => () => {},
    () => {
      const lang = getCurrentLanguage();
      switch (lang) {
        case 'en':
          return currentDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
          });
        case 'ja':
          return currentDate.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
          });
        default: // ko
          return currentDate.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
          });
      }
    },
    () => `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월` // 서버에서는 기본 형식
  );

  return (
    <div
      className={cn(
        'flex items-center justify-between p-4',
        'bg-card/80 backdrop-blur-sm',
        'border-b border-border/50',
        'sticky top-0 z-10'
      )}
    >
      <Button
        variant="ghost"
        size={isMobile ? 'default' : 'sm'}
        onClick={onPrevMonth}
        className={cn(
          'p-2 rounded-lg text-muted-foreground',
          'hover:bg-muted/50',
          'hover:text-foreground',
          'transition-all duration-200',
          isMobile && 'min-w-[44px] min-h-[44px] touch-target'
        )}
      >
        <ChevronLeft className={cn(isMobile ? 'h-5 w-5' : 'h-4 w-4')} />
      </Button>

      <div className="flex items-center gap-4">
        <button
          onClick={onTitleClick}
          className={cn(
            'font-bold text-foreground',
            'hover:text-primary transition-colors',
            isMobile ? 'text-xl' : 'text-lg'
          )}
        >
          {monthName}
        </button>
      </div>

      <Button
        variant="ghost"
        size={isMobile ? 'default' : 'sm'}
        onClick={onNextMonth}
        className={cn(
          'p-2 rounded-lg text-muted-foreground',
          'hover:bg-muted/50',
          'hover:text-foreground',
          'transition-all duration-200',
          isMobile && 'min-w-[44px] min-h-[44px] touch-target'
        )}
      >
        <ChevronRight className={cn(isMobile ? 'h-5 w-5' : 'h-4 w-4')} />
      </Button>
    </div>
  );
}

// 🧱 요일 헤더 컴포넌트 (SureCRM 색상 시스템 적용)
function WeekdayHeader() {
  const { isMobile } = useViewport();
  const { t, getCurrentLanguage } = useHydrationSafeTranslation('calendar');

  // 언어별 요일 배열
  const getWeekdays = () => {
    const lang = getCurrentLanguage();
    switch (lang) {
      case 'en':
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      case 'ja':
        return ['日', '月', '火', '水', '木', '金', '土'];
      default: // ko
        return ['일', '월', '화', '수', '목', '금', '토'];
    }
  };

  const weekdays = getWeekdays();

  return (
    <div
      className={cn(
        'grid grid-cols-7 gap-1 bg-muted/20 border-b border-border/30',
        isMobile ? 'py-2 px-2' : 'py-3 px-3'
      )}
    >
      {weekdays.map((day, index) => (
        <div
          key={index}
          className={cn(
            'text-center font-medium text-muted-foreground',
            isMobile ? 'text-xs py-2' : 'text-sm py-2',
            index === 0 && 'text-red-500', // 일요일
            index === 6 && 'text-blue-500' // 토요일
          )}
        >
          {day}
        </div>
      ))}
    </div>
  );
}

// 📱 모바일 iOS 스타일 점 표시 컴포넌트
const EventDot = ({
  event,
  className = '',
}: {
  event: Meeting;
  className?: string;
}) => {
  const colors = getEventColors(event);

  return (
    <div
      className={cn(
        'w-1.5 h-1.5 rounded-full flex-shrink-0 shadow-sm',
        colors.dot,
        className
      )}
      title={`${event.time} - ${event.title}`}
    />
  );
};

// 📱 모바일 전용: 일정 미리보기 카드
function MobileEventPreview({
  events,
  date,
  onEventClick,
  onClose,
}: {
  events: Meeting[];
  date: Date;
  onEventClick: (event: Meeting) => void;
  onClose: () => void;
}) {
  const { isMobile } = useViewport();
  const { t, formatDate } = useHydrationSafeTranslation('calendar');

  if (!isMobile || events.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div
        className="w-full bg-background rounded-t-3xl shadow-2xl border-t border-border max-h-[60vh] overflow-y-auto animate-in slide-in-from-bottom-full duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* 드래그 핸들 */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* 날짜 헤더 */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {formatDate(date, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* 일정 목록 */}
          <div className="space-y-3">
            {events.map((event, index) => {
              const colors = getEventColors(event);

              return (
                <div
                  key={event.id}
                  className={cn(
                    'p-4 rounded-xl border transition-all duration-200',
                    'active:scale-[0.98] cursor-pointer',
                    colors.bg,
                    colors.border,
                    colors.text
                  )}
                  onClick={() => {
                    onEventClick(event);
                    onClose();
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn('w-3 h-3 rounded-full mt-1', colors.dot)}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 opacity-70" />
                        <span className="font-semibold text-sm">
                          {event.time}
                        </span>
                        <span className="text-xs opacity-70">
                          ({event.duration}분)
                        </span>
                      </div>

                      <div className="font-medium mb-1 truncate">
                        {event.client.name}
                      </div>

                      <div className="text-sm opacity-90">
                        {t(`meeting.types.${event.type}`, event.type)}
                      </div>

                      {event.location && (
                        <div className="flex items-center gap-1 mt-2">
                          <MapPin className="h-3 w-3 opacity-70" />
                          <span className="text-xs opacity-70 truncate">
                            {event.location}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 동기화 상태 */}
                    {event.syncInfo?.syncStatus === 'conflict' && (
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mt-2" />
                    )}
                    {event.syncInfo?.syncStatus === 'synced' &&
                      event.syncInfo?.externalSource !== 'surecrm' && (
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// 📱 모바일 최적화된 날짜 셀
function MobileDateCell({
  day,
  dayMeetings,
  isToday,
  isOtherMonth,
  onClick,
  onEventClick,
}: {
  day: number;
  dayMeetings: Meeting[];
  isToday: boolean;
  isOtherMonth: boolean;
  onClick: () => void;
  onEventClick: (event: Meeting) => void;
}) {
  const { isMobile } = useViewport();
  const [showPreview, setShowPreview] = useState(false);

  const handleCellClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (dayMeetings.length > 0) {
      // 일정이 있으면 미리보기 표시
      setShowPreview(true);
    } else {
      // 일정이 없으면 새 일정 추가
      onClick();
    }
  };

  const sourceCount = dayMeetings.reduce(
    (acc, meeting) => {
      const source = meeting.syncInfo?.externalSource || 'surecrm';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <>
      <div
        className={cn(
          'relative p-2 min-h-[60px] cursor-pointer transition-all duration-200',
          'border-r border-b border-border/20 last:border-r-0',
          'hover:bg-accent/20 active:bg-accent/30',
          isOtherMonth && 'text-muted-foreground/50 bg-muted/10',
          isToday && 'bg-primary/5'
        )}
        onClick={handleCellClick}
      >
        {/* 날짜 번호 */}
        <div className="flex items-center justify-between mb-2">
          <div
            className={cn(
              'flex items-center justify-center rounded-full font-semibold transition-all duration-200',
              'w-7 h-7 text-sm',
              isToday
                ? 'bg-primary text-primary-foreground shadow-lg scale-110'
                : 'text-foreground'
            )}
          >
            {day}
          </div>

          {/* 모바일: 일정 개수 표시 */}
          {dayMeetings.length > 0 && (
            <div className="flex items-center gap-1">
              <div className="text-xs font-medium text-muted-foreground">
                {dayMeetings.length}
              </div>
            </div>
          )}
        </div>

        {/* 모바일: iOS 스타일 점들 */}
        {dayMeetings.length > 0 && (
          <div className="flex flex-wrap gap-1 max-h-[24px] overflow-hidden">
            {dayMeetings.slice(0, 6).map((meeting, index) => (
              <EventDot
                key={`${meeting.id}-${index}`}
                event={meeting}
                className="animate-in fade-in duration-300"
              />
            ))}
            {dayMeetings.length > 6 && (
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 flex-shrink-0" />
            )}
          </div>
        )}

        {/* 터치 피드백 */}
        <div className="absolute inset-0 bg-primary/0 hover:bg-primary/5 active:bg-primary/10 transition-colors duration-200 rounded-lg" />
      </div>

      {/* 모바일 미리보기 모달 */}
      {showPreview && (
        <MobileEventPreview
          events={dayMeetings}
          date={new Date(2024, 0, day)} // 임시 날짜
          onEventClick={onEventClick}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}

// 💻 데스크탑 최적화된 날짜 셀
function DateCell({
  day,
  date,
  dayMeetings,
  isToday,
  isOtherMonth,
  onClick,
  onEventClick,
  onMoreEventsClick,
}: {
  day: number;
  date: Date;
  dayMeetings: Meeting[];
  isToday: boolean;
  isOtherMonth: boolean;
  onClick: () => void;
  onEventClick: (event: Meeting) => void;
  onMoreEventsClick?: (date: Date) => void;
}) {
  const { isMobile } = useViewport();
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  // 소스별 미팅 수 계산
  const sourceCount = dayMeetings.reduce(
    (acc: Record<string, number>, meeting: Meeting) => {
      const source = meeting.syncInfo?.externalSource || 'surecrm';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // 이벤트를 스마트하게 정렬
  const sortedDayMeetings = dayMeetings.sort((a: Meeting, b: Meeting) => {
    const getTypePriority = (type: string): number => {
      switch (type) {
        case 'contract_signing':
          return 5;
        case 'first_consultation':
          return 4;
        case 'contract_review':
          return 3;
        case 'claim_support':
          return 3;
        case 'product_explanation':
          return 2;
        case 'follow_up':
          return 1;
        case 'other':
          return 0;
        default:
          return 0;
      }
    };

    const aPriority = getTypePriority(a.type);
    const bPriority = getTypePriority(b.type);

    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }

    const aTime = a.time || '00:00';
    const bTime = b.time || '00:00';
    return aTime.localeCompare(bTime);
  });

  return (
    <div
      className={cn(
        'cursor-pointer transition-all duration-200 relative overflow-hidden rounded-lg group',
        'bg-card hover:bg-muted/50 border border-border hover:border-border/60',
        isToday && 'ring-2 ring-primary/30 bg-primary/5 shadow-lg',
        isWeekend && !isToday && 'bg-muted/30',
        isOtherMonth && 'bg-muted/30 text-muted-foreground',
        // 높이 최적화
        dayMeetings.length === 0
          ? 'p-3 min-h-[140px]'
          : dayMeetings.length <= 2
            ? 'p-3 min-h-[160px]'
            : 'p-3 min-h-[180px]',
        'shadow-sm hover:shadow-md transition-shadow duration-200'
      )}
      onClick={onClick}
    >
      {/* 날짜 헤더 */}
      <DateCellHeader
        day={day}
        isToday={isToday}
        dayMeetings={dayMeetings}
        sourceCount={sourceCount}
      />

      {/* 이벤트 표시 영역 */}
      <div className="space-y-1 flex-1">
        {dayMeetings.length > 0 ? (
          <>
            {/* 첫 번째 이벤트 (풀 사이즈) */}
            <EventCard
              meeting={sortedDayMeetings[0]}
              compact={false}
              onClick={e => {
                e.stopPropagation();
                onEventClick(sortedDayMeetings[0]);
              }}
            />

            {/* 두 번째 이벤트 (컴팩트) */}
            {sortedDayMeetings.length > 1 && (
              <EventCard
                meeting={sortedDayMeetings[1]}
                compact={true}
                onClick={e => {
                  e.stopPropagation();
                  onEventClick(sortedDayMeetings[1]);
                }}
              />
            )}

            {/* 세 번째 이벤트 (컴팩트) */}
            {sortedDayMeetings.length > 2 && (
              <EventCard
                meeting={sortedDayMeetings[2]}
                compact={true}
                onClick={e => {
                  e.stopPropagation();
                  onEventClick(sortedDayMeetings[2]);
                }}
              />
            )}

            {/* 더보기 버튼 */}
            {dayMeetings.length > 3 && (
              <MoreEventsButton
                count={dayMeetings.length - 3}
                meetings={dayMeetings.slice(3)}
                onClick={e => {
                  e.stopPropagation();
                  if (onMoreEventsClick) {
                    onMoreEventsClick(date);
                  } else {
                    onClick();
                  }
                }}
              />
            )}
          </>
        ) : (
          /* 빈 날짜 표시 */
          <div className="flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity h-12">
            <Plus className="h-5 w-5 transition-transform group-hover:scale-110" />
          </div>
        )}
      </div>
    </div>
  );
}

export function CalendarGrid({
  selectedDate,
  meetings,
  onMeetingClick,
  onDateClick,
  onMoreEventsClick,
  onMonthChange,
}: CalendarGridProps) {
  const { isMobile } = useViewport();
  const [currentDate, setCurrentDate] = useState(selectedDate);
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { t } = useHydrationSafeTranslation('calendar');

  // 햅틱 피드백 함수
  const triggerHapticFeedback = () => {
    if ('vibrate' in navigator && isMobile) {
      navigator.vibrate(10);
    }
  };

  // 터치 상태 관리
  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const [isSwipeGesture, setIsSwipeGesture] = useState(false);
  const [swipeDistance, setSwipeDistance] = useState(0);

  // 터치 시작 핸들러 (네이티브 스타일 개선)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;

    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
    });
    setTouchStartTime(Date.now());
    setIsSwipeGesture(false);
    setSwipeDistance(0);
  };

  // 터치 이동 핸들러 (실시간 스와이프 피드백)
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || !isMobile) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = Math.abs(touch.clientY - touchStart.y);

    // 수평 스와이프 감지 (실시간)
    if (Math.abs(deltaX) > 20 && deltaY < 50) {
      setIsSwipeGesture(true);
      setSwipeDistance(deltaX);

      // 스와이프 중 부드러운 시각적 피드백
      if (containerRef.current) {
        const opacity = Math.min(Math.abs(deltaX) / 150, 0.3);
        containerRef.current.style.transform = `translateX(${deltaX * 0.3}px)`;
        containerRef.current.style.opacity = `${1 - opacity}`;
      }
    }
  };

  // 터치 끝 핸들러 (개선된 스와이프 감지)
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !isMobile) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = Math.abs(touch.clientY - touchStart.y);
    const touchDuration = Date.now() - touchStartTime;
    const swipeVelocity = Math.abs(deltaX) / touchDuration;

    // 컨테이너 스타일 초기화
    if (containerRef.current) {
      containerRef.current.style.transform = '';
      containerRef.current.style.opacity = '';
    }

    // 개선된 스와이프 감지 (속도 고려)
    const isValidSwipe =
      (Math.abs(deltaX) > 80 || swipeVelocity > 0.5) && // 거리 또는 속도 조건
      deltaY < 50 && // 수직 이동 제한
      touchDuration < 500; // 시간 제한

    if (isValidSwipe) {
      setIsTransitioning(true);
      triggerHapticFeedback();

      if (deltaX > 0) {
        // 오른쪽 스와이프 = 이전 달
        handlePrevMonth();
      } else {
        // 왼쪽 스와이프 = 다음 달
        handleNextMonth();
      }

      setTimeout(() => setIsTransitioning(false), 350);
    }

    setTouchStart(null);
    setIsSwipeGesture(false);
    setSwipeDistance(0);
  };

  // 🎯 성능 최적화된 이벤트 정렬 (useMemo)
  const sortedMeetings = useMemo(() => {
    return meetings.sort((a, b) => {
      // 1. 날짜순 정렬
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }

      // 2. 시간순 정렬
      const timeA = a.time || '00:00';
      const timeB = b.time || '00:00';
      return timeA.localeCompare(timeB);
    });
  }, [meetings]);

  // 🎯 성능 최적화된 미팅 그룹화 (useMemo)
  const meetingsByDate = useMemo(() => {
    const grouped: Record<string, Meeting[]> = {};

    sortedMeetings.forEach(meeting => {
      const dateKey = meeting.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(meeting);
    });

    return grouped;
  }, [sortedMeetings]);

  // 월 변경 함수들
  const handlePrevMonth = useCallback(() => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    setCurrentDate(newDate);
    onMonthChange?.(newDate);
    triggerHapticFeedback();
  }, [currentDate, onMonthChange]);

  const handleNextMonth = useCallback(() => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1
    );
    setCurrentDate(newDate);
    onMonthChange?.(newDate);
    triggerHapticFeedback();
  }, [currentDate, onMonthChange]);

  // 날짜 클릭 핸들러 (햅틱 피드백 추가)
  const handleDateClick = useCallback(
    (date: Date) => {
      triggerHapticFeedback();
      onDateClick?.(date);
    },
    [onDateClick]
  );

  // 미팅 클릭 핸들러 (햅틱 피드백 추가)
  const handleMeetingClick = useCallback(
    (meeting: Meeting, event: React.MouseEvent) => {
      event.stopPropagation();
      triggerHapticFeedback();
      onMeetingClick(meeting);
    },
    [onMeetingClick]
  );

  // 날짜 유틸리티 함수들
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderMonthView = () => {
    const today = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // 달력 그리드 생성
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfWeek = getFirstDayOfMonth(currentDate);

    // 이전 달의 마지막 날들
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthDays = Array.from(
      { length: firstDayOfWeek },
      (_, i) => prevMonth.getDate() - firstDayOfWeek + i + 1
    );

    // 현재 달의 날들
    const currentMonthDays = Array.from(
      { length: daysInMonth },
      (_, i) => i + 1
    );

    // 다음 달의 첫 날들 (총 42개 셀을 채우기 위해)
    const totalCells = 42;
    const remainingCells =
      totalCells - prevMonthDays.length - currentMonthDays.length;
    const nextMonthDays = Array.from(
      { length: remainingCells },
      (_, i) => i + 1
    );

    return (
      <div
        className={cn(
          'grid grid-cols-7 bg-background',
          // 모바일에서 더 조밀한 레이아웃
          isMobile ? 'gap-0' : 'gap-1'
        )}
      >
        {/* 이전 달 날짜들 */}
        {prevMonthDays.map(day => {
          const date = new Date(year, month - 1, day);
          const dayMeetings = meetings.filter((meeting: Meeting) => {
            const meetingDate = new Date(meeting.date);
            return (
              meetingDate.getDate() === day &&
              meetingDate.getMonth() === month - 1 &&
              meetingDate.getFullYear() === year
            );
          });

          return isMobile ? (
            <MobileDateCell
              key={`prev-${day}`}
              day={day}
              dayMeetings={dayMeetings}
              isToday={false}
              isOtherMonth={true}
              onClick={() => onDateClick?.(date)}
              onEventClick={onMeetingClick}
            />
          ) : (
            <DateCell
              key={`prev-${day}`}
              day={day}
              date={date}
              dayMeetings={dayMeetings}
              isToday={false}
              isOtherMonth={true}
              onClick={() => onDateClick?.(date)}
              onEventClick={onMeetingClick}
              onMoreEventsClick={onMoreEventsClick}
            />
          );
        })}

        {/* 현재 달 날짜들 */}
        {currentMonthDays.map(day => {
          const date = new Date(year, month, day);
          const isToday =
            today.getDate() === day &&
            today.getMonth() === month &&
            today.getFullYear() === year;

          const dayMeetings = meetings.filter((meeting: Meeting) => {
            const meetingDate = new Date(meeting.date);
            return (
              meetingDate.getDate() === day &&
              meetingDate.getMonth() === month &&
              meetingDate.getFullYear() === year
            );
          });

          return isMobile ? (
            <MobileDateCell
              key={`current-${day}`}
              day={day}
              dayMeetings={dayMeetings}
              isToday={isToday}
              isOtherMonth={false}
              onClick={() => onDateClick?.(date)}
              onEventClick={onMeetingClick}
            />
          ) : (
            <DateCell
              key={`current-${day}`}
              day={day}
              date={date}
              dayMeetings={dayMeetings}
              isToday={isToday}
              isOtherMonth={false}
              onClick={() => onDateClick?.(date)}
              onEventClick={onMeetingClick}
              onMoreEventsClick={onMoreEventsClick}
            />
          );
        })}

        {/* 다음 달 날짜들 */}
        {nextMonthDays.map(day => {
          const date = new Date(year, month + 1, day);
          const dayMeetings = meetings.filter((meeting: Meeting) => {
            const meetingDate = new Date(meeting.date);
            return (
              meetingDate.getDate() === day &&
              meetingDate.getMonth() === month + 1 &&
              meetingDate.getFullYear() === year
            );
          });

          return isMobile ? (
            <MobileDateCell
              key={`next-${day}`}
              day={day}
              dayMeetings={dayMeetings}
              isToday={false}
              isOtherMonth={true}
              onClick={() => onDateClick?.(date)}
              onEventClick={onMeetingClick}
            />
          ) : (
            <DateCell
              key={`next-${day}`}
              day={day}
              date={date}
              dayMeetings={dayMeetings}
              isToday={false}
              isOtherMonth={true}
              onClick={() => onDateClick?.(date)}
              onEventClick={onMeetingClick}
              onMoreEventsClick={onMoreEventsClick}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden transition-transform duration-200',
        isTransitioning && 'transform ease-out'
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
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
            <span>{t('actions.swipeToNavigate', '스와이프하여 월 이동')}</span>
            <ChevronRight className="h-3 w-3" />
          </div>
        </div>
      )}
    </div>
  );
}
