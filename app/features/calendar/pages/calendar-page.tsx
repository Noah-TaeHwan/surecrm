// 라우트 타입 - calendar.tsx에서 사용
interface CalendarPageProps {
  loaderData: any;
  actionData?: any;
}

import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/common/components/ui/tabs';
import {
  CalendarIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@radix-ui/react-icons';
import { useState, useEffect, useSyncExternalStore } from 'react';
import { MainLayout } from '~/common/layouts/main-layout';
import { cn } from '~/lib/utils';
import { useToast } from '~/common/components/ui/toast';
import { CalendarGrid } from '../components/calendar-grid';
import { WeekView } from '../components/week-view';
import { DayView } from '../components/day-view';
import { CalendarSidebar } from '../components/calendar-sidebar';
import { AddMeetingModal } from '../components/add-meeting-modal';
import { MeetingDetailModal } from '../components/meeting-detail-modal';
import {
  ConflictResolutionModal,
  type ConflictData,
} from '../components/conflict-resolution-modal';
import { GoogleConnectRequired } from '../components/google-connect-required';
import { MobileFAB } from '../components/mobile-fab';
import { MobileBottomSheet } from '../components/mobile-bottom-sheet';
import {
  type Meeting,
  type Client,
  type ViewMode,
  meetingTypeColors,
  meetingTypeKoreanMap,
} from '../types/types';
import { Badge } from '~/common/components/ui/badge';
import { useViewport } from '~/common/hooks/useViewport';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';

// useSyncExternalStore용 빈 구독 함수
const emptySubscribe = () => () => {};

// Hydration-safe 요일 표시 컴포넌트
function HydrationSafeWeekday({ date }: { date: Date }) {
  const { formatDate } = useHydrationSafeTranslation('calendar');

  const weekday = useSyncExternalStore(
    emptySubscribe,
    () => date.toLocaleDateString('ko-KR', { weekday: 'long' }),
    () => '' // 서버에서는 빈 문자열
  );

  return <span>{weekday}</span>;
}

// Hydration-safe 월/일 표시 컴포넌트
function HydrationSafeMonthDay({ date }: { date: Date }) {
  const { formatDate } = useHydrationSafeTranslation('calendar');

  const monthDay = useSyncExternalStore(
    emptySubscribe,
    () => date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }),
    () => `${date.getMonth() + 1}월 ${date.getDate()}일` // 서버에서는 기본 형식
  );

  return <span>{monthDay}</span>;
}

export default function CalendarPage({
  loaderData,
  actionData,
}: CalendarPageProps) {
  const {
    meetings,
    clients,
    googleCalendarSettings,
    requiresGoogleConnection,
  } = loaderData;

  const { isMobile, isTablet } = useViewport();
  const { success, error } = useToast();
  const { t } = useHydrationSafeTranslation('calendar');

  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [selectedDateForModal, setSelectedDateForModal] = useState<Date | null>(
    null
  ); // 모달용 선택된 날짜

  // 필터 상태 (기본값: 모든 타입 선택)
  const [filteredTypes, setFilteredTypes] = useState<string[]>([]);

  // 필터링된 미팅 목록
  const filteredMeetings =
    filteredTypes.length === 0
      ? meetings
      : meetings.filter((meeting: Meeting) =>
          filteredTypes.includes(meeting.type)
        );

  // 초기 필터 설정 (모든 타입 선택)
  useEffect(() => {
    if (meetings && meetings.length > 0 && filteredTypes.length === 0) {
      const allTypes = Array.from(
        new Set((meetings as Meeting[]).map((m: Meeting) => m.type))
      );
      setFilteredTypes(allTypes);
    }
  }, [meetings, filteredTypes.length]);

  // actionData 메시지를 토스트로 표시
  useEffect(() => {
    if (actionData?.message) {
      if (actionData.success) {
        success(actionData.message);
      } else {
        error(actionData.message);
      }
    }
  }, [actionData, success, error]);

  // 충돌 관리 상태
  const [conflicts, setConflicts] = useState<ConflictData[]>([]);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);

  // 모바일 필터 상태
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [bottomSheetType, setBottomSheetType] = useState<
    'filter' | 'view-selector' | null
  >(null);

  // ⭐️ 미팅 클릭 핸들러 (상세 모달 열기)
  const handleMeetingClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setIsAddMeetingOpen(false); // 버그 방지: 상세 모달 열 때 추가 모달은 항상 닫도록 명시
  };

  // 날짜 클릭 핸들러 (새 미팅 예약 모달 띄우기)
  const handleDateClick = (date: Date) => {
    setSelectedDateForModal(date);
    setIsAddMeetingOpen(true);
  };

  // 더보기 버튼 클릭 핸들러 (일 뷰로 전환)
  const handleMoreEventsClick = (date: Date) => {
    setSelectedDate(date);
    setViewMode('day');
  };

  // 미팅 추가 제출 후 모달 닫기
  const handleMeetingModalClose = () => {
    setIsAddMeetingOpen(false);
    setSelectedDateForModal(null);
  };

  // 충돌 해결 핸들러 - Form 제출로 처리
  const handleResolveConflict = (
    eventId: string,
    resolution: 'local' | 'google'
  ) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.style.display = 'none';

    const actionInput = document.createElement('input');
    actionInput.name = 'actionType';
    actionInput.value = 'resolveConflict';
    form.appendChild(actionInput);

    const eventIdInput = document.createElement('input');
    eventIdInput.name = 'eventId';
    eventIdInput.value = eventId;
    form.appendChild(eventIdInput);

    const resolutionInput = document.createElement('input');
    resolutionInput.name = 'resolution';
    resolutionInput.value = resolution;
    form.appendChild(resolutionInput);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  // 모든 충돌 일괄 해결 핸들러 - Form 제출로 처리
  const handleResolveAllConflicts = (resolution: 'local' | 'google') => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.style.display = 'none';

    const actionInput = document.createElement('input');
    actionInput.name = 'actionType';
    actionInput.value = 'resolveAllConflicts';
    form.appendChild(actionInput);

    const resolutionInput = document.createElement('input');
    resolutionInput.name = 'resolution';
    resolutionInput.value = resolution;
    form.appendChild(resolutionInput);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  // 체크리스트 토글
  const toggleChecklist = (meetingId: string, checklistId: string) => {
    console.log('체크리스트 토글:', meetingId, checklistId);
    // Form 제출로 처리
    const form = document.createElement('form');
    form.method = 'POST';
    form.style.display = 'none';

    const actionInput = document.createElement('input');
    actionInput.name = 'actionType';
    actionInput.value = 'toggleChecklist';
    form.appendChild(actionInput);

    const meetingInput = document.createElement('input');
    meetingInput.name = 'meetingId';
    meetingInput.value = meetingId;
    form.appendChild(meetingInput);

    const checklistInput = document.createElement('input');
    checklistInput.name = 'checklistId';
    checklistInput.value = checklistId;
    form.appendChild(checklistInput);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  // 현재 표시 날짜 포맷 (다국어 지원)
  const { formatDate } = useHydrationSafeTranslation('calendar');

  const getDisplayTitle = () => {
    if (viewMode === 'month') {
      return formatDate(selectedDate, {
        year: 'numeric',
        month: 'long',
      });
    } else if (viewMode === 'week') {
      const weekStart = new Date(selectedDate);
      weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      if (isMobile) {
        return `${formatDate(weekStart, { month: 'long', day: 'numeric' })} - ${formatDate(weekEnd, { month: 'long', day: 'numeric' })}`;
      } else {
        return weekStart.getMonth() === weekEnd.getMonth()
          ? `${formatDate(weekStart, { year: 'numeric', month: 'long', day: 'numeric' })} - ${formatDate(weekEnd, { day: 'numeric' })}`
          : `${formatDate(weekStart, { year: 'numeric', month: 'long', day: 'numeric' })} - ${formatDate(weekEnd, { year: 'numeric', month: 'long', day: 'numeric' })}`;
      }
    } else {
      return isMobile
        ? formatDate(selectedDate, { month: 'long', day: 'numeric' })
        : formatDate(selectedDate, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
    }
  };

  // 햅틱 피드백 함수
  const triggerHapticFeedback = () => {
    if ('vibrate' in navigator && isMobile) {
      navigator.vibrate(10);
    }
  };

  // 네비게이션 핸들러 (햅틱 피드백 추가)
  const navigateCalendar = (direction: 'prev' | 'next') => {
    triggerHapticFeedback();

    const newDate = new Date(selectedDate);
    if (viewMode === 'month') {
      newDate.setMonth(
        selectedDate.getMonth() + (direction === 'next' ? 1 : -1)
      );
    } else if (viewMode === 'week') {
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  // 오늘로 이동 (햅틱 피드백 추가)
  const goToToday = () => {
    triggerHapticFeedback();
    setSelectedDate(new Date());
  };

  // 🔒 구글 캘린더 연동이 필수인 경우 연동 화면 표시
  if (requiresGoogleConnection) {
    const handleConnect = () => {
      // Form 제출로 구글 연동 시작
      const form = document.createElement('form');
      form.method = 'POST';
      form.style.display = 'none';

      const actionInput = document.createElement('input');
      actionInput.name = 'actionType';
      actionInput.value = 'connectGoogleCalendar';
      form.appendChild(actionInput);

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    };

    return (
      <MainLayout>
        <GoogleConnectRequired onConnect={handleConnect} />
      </MainLayout>
    );
  }

  return (
    <MainLayout title={t('title', '일정 관리')}>
      <div className="flex-1 space-y-4 md:space-y-6">
        {/* 🔒 구글 캘린더 연동이 필요한 경우 */}
        {loaderData.requiresGoogleConnection ? (
          <div className="text-center py-16">
            <Card className="max-w-lg mx-auto shadow-lg border ">
              <CardContent className="pt-8 pb-8">
                <div className="p-6  rounded-full w-fit mx-auto mb-6">
                  <CalendarIcon className="w-16 h-16" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {t(
                    'google.connectionRequired',
                    '구글 캘린더 연동이 필요합니다'
                  )}
                </h3>
                <p className="700 mb-6 leading-relaxed">
                  {t(
                    'google.connectionDescription',
                    'SureCRM의 일정 관리 기능을 사용하려면 구글 캘린더와의 연동이 필요합니다. 연동 후 모든 일정이 자동으로 동기화됩니다.'
                  )}
                </p>
                <div className="space-y-3">
                  <form method="POST">
                    <input
                      type="hidden"
                      name="actionType"
                      value="connectGoogleCalendar"
                    />
                    <Button type="submit" className="w-full " size="lg">
                      <CalendarIcon className="mr-2 h-5 w-5" />
                      {t('google.connect', '구글 캘린더 연결')}
                    </Button>
                  </form>
                  <p className="text-xs text-amber-600">
                    {t(
                      'google.refreshNote',
                      '연동 후 새로고침하면 일정 관리 기능을 사용할 수 있습니다.'
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : !meetings || meetings.length === 0 ? (
          <div className="text-center py-16">
            <Card className="max-w-md mx-auto shadow-lg border border-border/50 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm">
              <CardContent className="pt-8 pb-8">
                <div className="p-6 bg-muted/20 rounded-full w-fit mx-auto mb-6">
                  <CalendarIcon className="w-16 h-16 text-muted-foreground/50" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {t('emptyState.title', '일정 관리를 시작해보세요')}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {t(
                    'emptyState.description',
                    '아직 등록된 고객이나 미팅이 없습니다. 첫 번째 미팅을 예약하여 시작해보세요.'
                  )}
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={() => setIsAddMeetingOpen(true)}
                    className="w-full"
                    size="lg"
                  >
                    <PlusIcon className="mr-2 h-5 w-5" />
                    {t('actions.scheduleFirstMeeting', '첫 미팅 예약하기')}
                  </Button>
                  <Button variant="outline" className="w-full">
                    {t('actions.registerClient', '고객 등록하기')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* 📱 iOS 스타일 캘린더 뷰 */
          <div
            className={cn(
              'grid gap-4 md:gap-6',
              isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-5'
            )}
          >
            <div className={cn(isMobile ? 'col-span-1' : 'lg:col-span-4')}>
              {/* 캘린더 컨테이너 - iOS 스타일 */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
                {viewMode === 'month' && (
                  <CalendarGrid
                    selectedDate={selectedDate}
                    meetings={filteredMeetings}
                    onMeetingClick={handleMeetingClick}
                    onDateClick={handleDateClick}
                    onMoreEventsClick={handleMoreEventsClick}
                    onMonthChange={date => setSelectedDate(date)}
                  />
                )}
                {viewMode === 'week' && (
                  <WeekView
                    selectedDate={selectedDate}
                    meetings={filteredMeetings}
                    onMeetingClick={handleMeetingClick}
                    onDateClick={handleDateClick}
                    onWeekChange={date => setSelectedDate(date)}
                  />
                )}
                {viewMode === 'day' && (
                  <DayView
                    selectedDate={selectedDate}
                    meetings={filteredMeetings}
                    onMeetingClick={handleMeetingClick}
                    onDateClick={handleDateClick}
                    onDayChange={date => setSelectedDate(date)}
                  />
                )}
              </div>
            </div>

            {/* 📱 모바일에서는 접을 수 있는 사이드바 */}
            {!isMobile && (
              <CalendarSidebar
                meetings={meetings}
                onMeetingClick={handleMeetingClick}
                filteredTypes={filteredTypes}
                onFilterChange={setFilteredTypes}
                googleCalendarSettings={googleCalendarSettings}
                // 새로운 캘린더 컨트롤 props
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                selectedDate={selectedDate}
                onNavigateCalendar={navigateCalendar}
                onGoToToday={goToToday}
                onAddMeetingOpen={() => setIsAddMeetingOpen(true)}
                triggerHapticFeedback={triggerHapticFeedback}
                getDisplayTitle={getDisplayTitle}
              />
            )}
          </div>
        )}

        {/* 📱 모바일 전용: 선택된 날짜의 미팅 리스트 */}
        {isMobile && meetings && meetings.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              <HydrationSafeMonthDay date={selectedDate} />{' '}
              {t('views.agenda', '일정표')}
            </h3>

            {filteredMeetings
              .filter((meeting: Meeting) => {
                const meetingDate = new Date(meeting.date);
                return (
                  meetingDate.toDateString() === selectedDate.toDateString()
                );
              })
              .map((meeting: Meeting) => (
                <div
                  key={meeting.id}
                  onClick={() => {
                    triggerHapticFeedback();
                    handleMeetingClick(meeting);
                  }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 mb-2 active:bg-gray-100 dark:active:bg-gray-700 transition-colors cursor-pointer"
                >
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {meeting.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {meeting.time} · {meeting.client.name}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* 📱 모바일 FAB */}
        {isMobile && (
          <MobileFAB
            onAddMeeting={() => setIsAddMeetingOpen(true)}
            onFilterToggle={() => {
              setBottomSheetType('filter');
              setIsMobileFilterOpen(true);
            }}
            onViewSelectorOpen={() => {
              setBottomSheetType('view-selector');
              setIsMobileFilterOpen(true);
            }}
            onSettingsOpen={() => {
              // 설정 처리 - 추후 구현
            }}
            triggerHapticFeedback={triggerHapticFeedback}
          />
        )}

        {/* 📱 모바일 바텀시트 */}
        {isMobile && (
          <MobileBottomSheet
            isOpen={isMobileFilterOpen}
            onClose={() => {
              setIsMobileFilterOpen(false);
              setBottomSheetType(null);
            }}
            type={bottomSheetType || 'filter'}
            filteredTypes={filteredTypes}
            onFilterChange={setFilteredTypes}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            triggerHapticFeedback={triggerHapticFeedback}
          />
        )}

        {/* 모달들 */}
        <AddMeetingModal
          isOpen={isAddMeetingOpen}
          onClose={handleMeetingModalClose}
          clients={clients}
          defaultDate={selectedDateForModal || undefined}
        />

        <MeetingDetailModal
          meeting={selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
          onToggleChecklist={toggleChecklist}
          clients={clients}
        />

        <ConflictResolutionModal
          isOpen={isConflictModalOpen}
          onClose={() => setIsConflictModalOpen(false)}
          conflicts={conflicts}
          onResolveConflict={handleResolveConflict}
          onResolveAll={handleResolveAllConflicts}
        />
      </div>
    </MainLayout>
  );
}
