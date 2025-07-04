import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { Progress } from '~/common/components/ui/progress';
import { Checkbox } from '~/common/components/ui/checkbox';
import { Separator } from '~/common/components/ui/separator';
import { Input } from '~/common/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '~/common/components/ui/tabs';
import {
  CalendarIcon,
  ClockIcon,
  PersonIcon,
  TargetIcon,
  CheckCircledIcon,
  UpdateIcon,
  MixerHorizontalIcon,
  MagnifyingGlassIcon,
  Cross2Icon,
  PlusIcon,
} from '@radix-ui/react-icons';
import { cn } from '~/lib/utils';
import {
  meetingTypeColors,
  meetingTypeKoreanMap,
  meetingTypeDetails,
  type Meeting,
} from '../types/types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useState, useEffect, useSyncExternalStore } from 'react';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';

// getEventColors 함수를 calendar-grid에서 가져옴
const getEventColors = (event: Meeting) => {
  const colorMap = {
    neutral: {
      bg: 'bg-gray-50 dark:bg-gray-900/20',
      border: 'border-gray-200 dark:border-gray-700/50',
      text: 'text-gray-700 dark:text-gray-300',
      dot: 'bg-gray-400 dark:bg-gray-500',
      badge: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    },
    sky: {
      bg: 'bg-sky-50 dark:bg-sky-950/20',
      border: 'border-sky-200 dark:border-sky-800/50',
      text: 'text-sky-700 dark:text-sky-300',
      dot: 'bg-sky-500',
      badge: 'bg-sky-100 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300',
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      border: 'border-emerald-200 dark:border-emerald-800/50',
      text: 'text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500',
      badge:
        'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      border: 'border-amber-200 dark:border-amber-800/50',
      text: 'text-amber-700 dark:text-amber-300',
      dot: 'bg-amber-500',
      badge:
        'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/20',
      border: 'border-rose-200 dark:border-rose-800/50',
      text: 'text-rose-700 dark:text-rose-300',
      dot: 'bg-rose-500',
      badge: 'bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300',
    },
    violet: {
      bg: 'bg-violet-50 dark:bg-violet-950/20',
      border: 'border-violet-200 dark:border-violet-800/50',
      text: 'text-violet-700 dark:text-violet-300',
      dot: 'bg-violet-500',
      badge:
        'bg-violet-100 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300',
    },
  };

  const typeColorMap: Record<string, keyof typeof colorMap> = {
    first_consultation: 'sky',
    needs_analysis: 'emerald',
    product_explanation: 'amber',
    contract_review: 'rose',
    contract_signing: 'emerald',
    follow_up: 'violet',
    claim_support: 'rose',
    other: 'neutral',
  };

  if (event.syncInfo?.externalSource === 'google') {
    return colorMap['neutral'];
  }

  const colorKey = typeColorMap[event.type] || 'neutral';
  return colorMap[colorKey];
};

interface CalendarSidebarProps {
  meetings: Meeting[];
  onMeetingClick: (meeting: Meeting) => void;
  filteredTypes: string[];
  onFilterChange: (types: string[]) => void;
  googleCalendarSettings?: {
    isConnected: boolean;
    lastSyncAt?: string;
    googleEventsCount?: number;
  };
  // 새로운 캘린더 컨트롤 props
  viewMode: 'month' | 'week' | 'day';
  onViewModeChange: (mode: 'month' | 'week' | 'day') => void;
  selectedDate: Date;
  onNavigateCalendar: (direction: 'prev' | 'next') => void;
  onGoToToday: () => void;
  onAddMeetingOpen: () => void;
  triggerHapticFeedback: () => void;
  getDisplayTitle: () => string;
}

export function CalendarSidebar({
  meetings,
  onMeetingClick,
  filteredTypes,
  onFilterChange,
  googleCalendarSettings,
  // 새로운 캘린더 컨트롤 props
  viewMode,
  onViewModeChange,
  selectedDate,
  onNavigateCalendar,
  onGoToToday,
  onAddMeetingOpen,
  triggerHapticFeedback,
  getDisplayTitle,
}: CalendarSidebarProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { t, formatDate } = useHydrationSafeTranslation('calendar');

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 이번 주 통계 계산 고도화
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  const thisWeekEnd = new Date(thisWeekStart);
  thisWeekEnd.setDate(thisWeekStart.getDate() + 6);

  // 🔍 고급 필터링 로직 (검색 + 타입 필터)
  const filterMeetings = (meetingList: Meeting[]) => {
    return meetingList.filter((m: Meeting) => {
      // 타입 필터
      const passesTypeFilter =
        filteredTypes.length === 0 || filteredTypes.includes(m.type);

      // 검색 필터 (고객명, 미팅 제목, 미팅 타입)
      const passesSearchFilter =
        !searchQuery ||
        m.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (
          meetingTypeKoreanMap[m.type as keyof typeof meetingTypeKoreanMap] ||
          m.type
        )
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return passesTypeFilter && passesSearchFilter;
    });
  };

  // 이번 주 미팅 (필터 적용)
  const thisWeekMeetings = filterMeetings(
    meetings.filter((m: Meeting) => {
      const meetingDate = new Date(m.date);
      return meetingDate >= thisWeekStart && meetingDate <= thisWeekEnd;
    })
  );

  // 미팅 타입별 분류
  const thisWeekByType = thisWeekMeetings.reduce(
    (acc, meeting) => {
      const type = meeting.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // 오늘 미팅 (필터 적용)
  const today = new Date();
  const todayMeetings = filterMeetings(
    meetings.filter((m: Meeting) => {
      const meetingDate = new Date(m.date);
      return meetingDate.toDateString() === today.toDateString();
    })
  );

  // 다음 미팅 (3개만, 필터 적용)
  const upcomingMeetings = filterMeetings(
    meetings.filter((m: Meeting) => {
      return new Date(m.date) > new Date();
    })
  )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // 사용 가능한 미팅 타입들 (meetings에서 추출)
  const availableTypes = Array.from(new Set(meetings.map(m => m.type)));

  // 필터 토글 핸들러
  const toggleFilter = (type: string) => {
    const newFilters = filteredTypes.includes(type)
      ? filteredTypes.filter(t => t !== type)
      : [...filteredTypes, type];
    onFilterChange(newFilters);
  };

  const formatLastSync = (dateStr?: string | Date) => {
    if (!dateStr) {
      return t('sync.noRecord', '동기화 기록 없음');
    }

    let date: Date;
    if (dateStr instanceof Date) {
      date = dateStr;
    } else if (typeof dateStr === 'string') {
      date = new Date(dateStr);
    } else {
      return t('sync.noRecord', '동기화 기록 없음');
    }

    const now = new Date();
    const diffInMilliseconds = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));

    if (diffInMinutes < 1) {
      return t('sync.justNow', '방금 전');
    } else if (diffInMinutes < 60) {
      return t('sync.minutesAgo', '{{minutes}}분 전', {
        minutes: diffInMinutes,
      });
    } else if (diffInMinutes < 24 * 60) {
      const hours = Math.floor(diffInMinutes / 60);
      return t('sync.hoursAgo', '{{hours}}시간 전', { hours });
    } else {
      // 하루 이상된 경우 날짜 형식으로 표시
      return formatDate(date, {
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      });
    }
  };

  // useSyncExternalStore용 빈 구독 함수
  const emptySubscribe = () => () => {};

  // Hydration-safe 시간 표시 컴포넌트 (완전한 분리 방식)
  function HydrationSafeTimeDisplay({ dateStr }: { dateStr?: string | Date }) {
    const formattedTime = useSyncExternalStore(
      emptySubscribe,
      () => formatLastSync(dateStr), // 클라이언트: 실제 시간 계산
      () => t('sync.syncInfo', '동기화 정보') // 서버: 고정된 텍스트 (hydration 안전)
    );

    return <span>{formattedTime}</span>;
  }

  // 수동 동기화 실행
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/google/calendar/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('✅ 구글 캘린더 동기화 완료');
        // 페이지 새로고침하여 최신 데이터 로드
        window.location.reload();
      } else {
        console.error('❌ 동기화 실패:', await response.text());
      }
    } catch (error) {
      console.error('❌ 동기화 오류:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredMeetings = filterMeetings(meetings);

  return (
    <div className="space-y-5 p-4 border-sidebar-border h-full">
      {/* 📅 캘린더 컨트롤 카드 (헤더에서 이동) */}
      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            {getDisplayTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 뷰 선택 탭 */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              {t('sidebar.viewMode', '보기 방식')}
            </label>
            <Tabs
              value={viewMode}
              onValueChange={v => {
                triggerHapticFeedback();
                onViewModeChange(v as 'month' | 'week' | 'day');
              }}
            >
              <TabsList className="grid grid-cols-3 w-full rounded-md p-0.5 bg-muted border border-border/30">
                {['month', 'week', 'day'].map((mode, index) => {
                  const labels = [
                    t('views.month', '월별'),
                    t('views.week', '주별'),
                    t('views.day', '일별'),
                  ];

                  return (
                    <TabsTrigger
                      key={mode}
                      value={mode}
                      className={cn(
                        'rounded-sm transition-all duration-150 text-xs font-medium',
                        'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground',
                        'data-[state=active]:shadow-sm',
                        'text-muted-foreground hover:text-foreground',
                        'px-3 h-8'
                      )}
                    >
                      {labels[index]}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>

          {/* 새 미팅 예약 버튼 */}
          <Button
            onClick={() => {
              triggerHapticFeedback();
              onAddMeetingOpen();
            }}
            className="w-full gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            {t('actions.scheduleMeeting', '새 미팅 예약')}
          </Button>

          {/* 이번 주 통계 */}
          <div className="pt-2 border-t border-border/30">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t('sidebar.thisWeek', '이번 주')}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="font-medium">
                  {
                    meetings.filter((m: Meeting) => {
                      const meetingDate = new Date(m.date);
                      const weekStart = new Date(selectedDate);
                      weekStart.setDate(
                        selectedDate.getDate() - selectedDate.getDay()
                      );
                      const weekEnd = new Date(weekStart);
                      weekEnd.setDate(weekStart.getDate() + 6);
                      return meetingDate >= weekStart && meetingDate <= weekEnd;
                    }).length
                  }
                  {t('sidebar.countUnit', '건')}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🔍 1. 고급 검색 (새로 추가) */}
      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MagnifyingGlassIcon className="h-4 w-4 text-primary" />
            {t('sidebar.search', '검색')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Input
              placeholder={t('sidebar.searchPlaceholder', '미팅 검색...')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pr-8"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchQuery('')}
              >
                <Cross2Icon className="h-3 w-3" />
                <span className="sr-only">
                  {t('sidebar.clearSearch', '검색 지우기')}
                </span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 🎯 2. 미팅 타입별 필터 */}
      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MixerHorizontalIcon className="h-4 w-4 text-primary" />
            {t('sidebar.filterByType', '타입별 필터')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {/* 필터 리스트 */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableTypes.map(type => {
                const isChecked = filteredTypes.includes(type);
                const typeInfo =
                  meetingTypeDetails[type as keyof typeof meetingTypeDetails];

                return (
                  <div
                    key={type}
                    className="flex items-center space-x-3 cursor-pointer hover:bg-muted/30 rounded-md p-2 transition-colors"
                    onClick={() => toggleFilter(type)}
                  >
                    <Checkbox
                      id={`filter-${type}`}
                      checked={isChecked}
                      onCheckedChange={() => {}} // 빈 함수 - 실제 토글은 부모 div에서 처리
                      className="pointer-events-none" // 체크박스 자체 클릭 비활성화
                    />
                    <div className="flex items-center gap-2 text-sm font-medium flex-1 cursor-pointer">
                      <span className="text-base">
                        {typeInfo?.icon || '📅'}
                      </span>
                      <span>
                        {t(
                          `meeting.types.${type}`,
                          meetingTypeKoreanMap[
                            type as keyof typeof meetingTypeKoreanMap
                          ] || type
                        )}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs pointer-events-none"
                    >
                      {meetings.filter(m => m.type === type).length}
                    </Badge>
                  </div>
                );
              })}
            </div>

            {/* 필터 제어 버튼들 */}
            <Separator className="my-3" />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFilterChange(availableTypes)}
                className="flex-1 text-xs"
              >
                <CheckCircledIcon className="h-3 w-3 mr-1" />
                {t('sidebar.selectAll', '전체 선택')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFilterChange([])}
                className="flex-1 text-xs"
              >
                <Cross2Icon className="h-3 w-3 mr-1" />
                {t('sidebar.clearAll', '전체 해제')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. 구글 캘린더 연동 상태 - 검색 중이 아닐 때만 표시 */}
      {!searchTerm && (
        <Card className="border border-sidebar-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-emerald-600" />
              {t('google.title', '구글 캘린더')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {googleCalendarSettings?.isConnected ? (
              <div className="space-y-3">
                {/* 연결 상태 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                      {t('google.connected', '연결됨')}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {t('google.syncCount', '{{count}}개 동기화', {
                      count: googleCalendarSettings.googleEventsCount || 0,
                    })}
                  </Badge>
                </div>

                {/* 마지막 동기화 */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t('google.lastSync', '마지막 동기화')}
                  </span>
                  <span className="font-medium">
                    <HydrationSafeTimeDisplay
                      dateStr={googleCalendarSettings.lastSyncAt}
                    />
                  </span>
                </div>

                {/* 수동 동기화 버튼 */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                >
                  <UpdateIcon
                    className={cn('h-4 w-4', isSyncing && 'animate-spin')}
                  />
                  {isSyncing
                    ? t('google.syncing', '동기화 중...')
                    : t('google.syncNow', '지금 동기화')}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="text-sm text-yellow-700 dark:text-yellow-400">
                    {t('google.needConnection', '연결 필요')}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  {t(
                    'google.connectionDescription',
                    '구글 캘린더와 연동하여 양방향 동기화를 활성화하세요.'
                  )}
                </p>

                <Button variant="default" size="sm" className="w-full gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {t('google.connectAccount', '구글 계정 연결')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 3. 고급 미팅 필터 - 검색 중이 아닐 때만 표시 */}
      {!searchTerm && availableTypes.length > 0 && (
        <Card className="border border-sidebar-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <MixerHorizontalIcon className="h-5 w-5 text-violet-600" />
              {t('filter.title', '미팅 필터')}
              {filteredTypes.length > 0 &&
                filteredTypes.length < availableTypes.length && (
                  <Badge variant="secondary" className="text-xs">
                    {t('filter.selected', '{{count}}개 선택', {
                      count: filteredTypes.length,
                    })}
                  </Badge>
                )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {availableTypes.map(type => {
                const isChecked = filteredTypes.includes(type);
                const typeInfo =
                  meetingTypeDetails[type as keyof typeof meetingTypeDetails];

                return (
                  <div
                    key={type}
                    className="flex items-center space-x-3 cursor-pointer hover:bg-muted/30 rounded-md p-2 transition-colors"
                    onClick={() => toggleFilter(type)}
                  >
                    <Checkbox
                      id={`filter-${type}`}
                      checked={isChecked}
                      onCheckedChange={() => {}} // 빈 함수 - 실제 토글은 부모 div에서 처리
                      className="pointer-events-none" // 체크박스 자체 클릭 비활성화
                    />
                    <div className="flex items-center gap-2 text-sm font-medium flex-1 cursor-pointer">
                      <span className="text-base">
                        {typeInfo?.icon || '📅'}
                      </span>
                      <span>
                        {t(
                          `meeting.types.${type}`,
                          meetingTypeKoreanMap[
                            type as keyof typeof meetingTypeKoreanMap
                          ] || type
                        )}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs pointer-events-none"
                    >
                      {meetings.filter(m => m.type === type).length}
                    </Badge>
                  </div>
                );
              })}
            </div>

            {/* 필터 제어 버튼들 */}
            <Separator className="my-3" />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => onFilterChange(availableTypes)}
                disabled={
                  isClient
                    ? filteredTypes.length === availableTypes.length
                    : false
                }
              >
                {t('sidebar.selectAll', '전체 선택')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => onFilterChange([])}
                disabled={isClient ? filteredTypes.length === 0 : false}
              >
                {t('sidebar.clearAll', '전체 해제')}
              </Button>
            </div>

            {/* 필터 상태 요약 */}
            {filteredTypes.length > 0 &&
              filteredTypes.length < availableTypes.length && (
                <div className="text-xs text-muted-foreground bg-muted/20 p-2 rounded-md">
                  {t('filter.typesSelected', '{{count}}개 타입이 선택됨', {
                    count: filteredTypes.length,
                  })}
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* 4. 이번 주 성과 요약 (고도화) - 검색 중이 아닐 때만 표시 */}
      {!searchTerm && (
        <Card className="border border-sidebar-border bg-gradient-to-br from-sky-500/5 to-sky-500/10 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-sky-600 dark:text-sky-400">
              <TargetIcon className="h-5 w-5" />
              {t('performance.title', '이번 주 성과')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 핵심 지표 그리드 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center space-y-1">
                <div className="text-3xl font-bold text-sky-600 dark:text-sky-400">
                  {thisWeekMeetings.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t('performance.totalMeetings', '총 미팅')}
                </div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-3xl font-bold text-emerald-600">
                  {todayMeetings.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t('performance.today', '오늘')}
                </div>
              </div>
            </div>

            {/* 미팅 타입별 분석 */}
            {Object.keys(thisWeekByType).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {t('sidebar.typeAnalysis', '타입별 분석')}
                </h4>
                <div className="space-y-1">
                  {Object.entries(thisWeekByType).map(([type, count]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {meetingTypeDetails[
                            type as keyof typeof meetingTypeDetails
                          ]?.icon || '📅'}
                        </span>
                        <span className="text-xs">
                          {t(
                            `meeting.types.${type}`,
                            meetingTypeKoreanMap[
                              type as keyof typeof meetingTypeKoreanMap
                            ] || type
                          )}
                        </span>
                      </div>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 목표 달성률 */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t('sidebar.weeklyGoal', '주간 목표')} (10
                  {t('sidebar.countUnit', '건')})
                </span>
                <span className="font-semibold">
                  {Math.min(
                    100,
                    Math.round((thisWeekMeetings.length / 10) * 100)
                  )}
                  %
                </span>
              </div>
              <Progress
                value={Math.min(100, (thisWeekMeetings.length / 10) * 100)}
                className="h-2 bg-muted/30"
              />
              {thisWeekMeetings.length >= 10 && (
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                  <CheckCircledIcon className="h-3 w-3" />
                  <span>{t('performance.goalAchieved', '목표 달성!')}</span>
                </div>
              )}
            </div>

            {/* 주간 성과 요약 */}
            {thisWeekMeetings.length > 0 && (
              <div className="pt-2 border-t border-border/50">
                <div className="text-xs text-muted-foreground">
                  {t(
                    'performance.summaryStart',
                    '이번 주 {{count}}건의 미팅으로',
                    {
                      count: thisWeekMeetings.length,
                    }
                  )}
                  {thisWeekMeetings.length >= 10
                    ? t(
                        'performance.summaryAchieved',
                        ' 목표를 달성했습니다! 🎉'
                      )
                    : ` ${t(
                        'performance.moreNeeded',
                        '{{count}}건 더 필요합니다',
                        {
                          count: 10 - thisWeekMeetings.length,
                        }
                      )}.`}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 5. 다음 예정 미팅 - 검색 중이 아닐 때만 표시 */}
      {!searchTerm && upcomingMeetings.length > 0 && (
        <Card className="border border-sidebar-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-amber-600" />
              {t('upcomingMeetings.title', '다음 미팅')}
              <Badge variant="secondary" className="text-xs">
                {t('upcomingMeetings.count', '{{count}}개', {
                  count: upcomingMeetings.length,
                })}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingMeetings.map((meeting, index) => (
              <div
                key={`${meeting.id}-${index}`}
                onClick={() => onMeetingClick(meeting)}
                className="p-3 rounded-lg border border-border/30 bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors duration-200"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm leading-tight">
                      {meeting.title}
                    </h4>
                    <Badge
                      variant="outline"
                      className="text-xs flex-shrink-0 ml-2"
                    >
                      {t(
                        `meeting.types.${meeting.type}`,
                        meetingTypeKoreanMap[
                          meeting.type as keyof typeof meetingTypeKoreanMap
                        ] || meeting.type
                      )}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      {format(new Date(meeting.date), 'MM/dd (E)', {
                        locale: ko,
                      })}
                    </div>
                    {meeting.time && (
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        {meeting.time}
                      </div>
                    )}
                  </div>

                  {meeting.client?.name && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <PersonIcon className="h-3 w-3" />
                      {meeting.client.name}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
