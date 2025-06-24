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
  BellIcon,
  StarIcon,
  CheckCircledIcon,
  GearIcon,
  UpdateIcon,
  MixerHorizontalIcon,
  MagnifyingGlassIcon,
  Cross2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
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
import { useState, useEffect } from 'react';

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

  const formatLastSync = (dateStr?: string) => {
    if (!dateStr) return '동기화된 적 없음';

    const date = new Date(dateStr);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 24 * 60)
      return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return format(date, 'MM/dd HH:mm', { locale: ko });
  };

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
              보기 방식
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
                  const labels = ['월별', '주별', '일별'];

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
            <PlusIcon className="h-4 w-4" />새 미팅 예약
          </Button>

          {/* 이번 주 통계 */}
          <div className="pt-2 border-t border-border/30">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">이번 주</span>
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
                  건
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🔍 1. 고급 검색 (새로 추가) */}
      <Card className="border border-sidebar-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <MagnifyingGlassIcon className="h-5 w-5 text-sky-600" />
            미팅 검색
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="고객명, 미팅 제목, 타입으로 검색..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setSearchTerm(e.target.value);
              }}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSearchTerm('');
                }}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/50"
              >
                <Cross2Icon className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* 검색 결과 요약 */}
          {searchQuery && (
            <div className="mt-3 text-xs text-muted-foreground">
              <span className="font-medium">{filteredMeetings.length}개</span>의
              미팅이 검색됨
            </div>
          )}

          {/* 검색 결과 표시 */}
          {searchTerm && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  검색 결과
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                  {filteredMeetings.length}개 발견
                </span>
              </div>

              {filteredMeetings.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredMeetings.map(meeting => {
                    const colors = getEventColors(meeting);
                    return (
                      <div
                        key={meeting.id}
                        className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-sm transition-shadow cursor-pointer"
                        onClick={() => onMeetingClick?.(meeting)}
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className={`w-3 h-3 rounded-full mt-1 ${colors.dot} ring-1 ring-white/50 shadow-sm`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {meeting.title}
                              </h4>
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                {meeting.time}
                              </span>
                            </div>
                            {meeting.client?.name && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {meeting.client.name}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${colors.badge}`}
                              >
                                {meetingTypeKoreanMap[
                                  meeting.type as keyof typeof meetingTypeKoreanMap
                                ] || meeting.type}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {format(new Date(meeting.date), 'M월 d일')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    "{searchTerm}"에 대한 검색 결과가 없습니다
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. 구글 캘린더 연동 상태 - 검색 중이 아닐 때만 표시 */}
      {!searchTerm && (
        <Card className="border border-sidebar-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-emerald-600" />
              구글 캘린더
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
                      연결됨
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {googleCalendarSettings.googleEventsCount || 0}개 동기화
                  </Badge>
                </div>

                {/* 마지막 동기화 */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">마지막 동기화</span>
                  <span className="font-medium">
                    {formatLastSync(googleCalendarSettings.lastSyncAt)}
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
                  {isSyncing ? '동기화 중...' : '지금 동기화'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="text-sm text-yellow-700 dark:text-yellow-400">
                    연결 필요
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  구글 캘린더와 연동하여 양방향 동기화를 활성화하세요.
                </p>

                <Button variant="default" size="sm" className="w-full gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  구글 계정 연결
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
              미팅 필터
              {filteredTypes.length > 0 &&
                filteredTypes.length < availableTypes.length && (
                  <Badge variant="secondary" className="text-xs">
                    {filteredTypes.length}개 선택
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
                        {meetingTypeKoreanMap[
                          type as keyof typeof meetingTypeKoreanMap
                        ] || type}
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
                전체 선택
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => onFilterChange([])}
                disabled={isClient ? filteredTypes.length === 0 : false}
              >
                전체 해제
              </Button>
            </div>

            {/* 필터 상태 요약 */}
            {filteredTypes.length > 0 &&
              filteredTypes.length < availableTypes.length && (
                <div className="text-xs text-muted-foreground bg-muted/20 p-2 rounded-md">
                  <span className="font-medium">{filteredTypes.length}개</span>{' '}
                  타입이 선택됨
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
              이번 주 성과
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 핵심 지표 그리드 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center space-y-1">
                <div className="text-3xl font-bold text-sky-600 dark:text-sky-400">
                  {thisWeekMeetings.length}
                </div>
                <div className="text-xs text-muted-foreground">총 미팅</div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-3xl font-bold text-emerald-600">
                  {todayMeetings.length}
                </div>
                <div className="text-xs text-muted-foreground">오늘</div>
              </div>
            </div>

            {/* 미팅 타입별 분석 */}
            {Object.keys(thisWeekByType).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  타입별 분석
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
                          {meetingTypeKoreanMap[
                            type as keyof typeof meetingTypeKoreanMap
                          ] || type}
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
                <span className="text-muted-foreground">주간 목표 (10건)</span>
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
                  <span>목표 달성!</span>
                </div>
              )}
            </div>

            {/* 주간 성과 요약 */}
            {thisWeekMeetings.length > 0 && (
              <div className="pt-2 border-t border-border/50">
                <div className="text-xs text-muted-foreground">
                  이번 주 {thisWeekMeetings.length}건의 미팅으로
                  {thisWeekMeetings.length >= 10
                    ? ' 목표를 달성했습니다! 🎉'
                    : ` ${10 - thisWeekMeetings.length}건 더 필요합니다.`}
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
              다음 미팅
              <Badge variant="secondary" className="text-xs">
                {upcomingMeetings.length}개
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
                      {meetingTypeKoreanMap[
                        meeting.type as keyof typeof meetingTypeKoreanMap
                      ] || meeting.type}
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
