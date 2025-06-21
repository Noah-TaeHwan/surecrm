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
import { useState, useEffect } from 'react';
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
import { 
  type Meeting, 
  type Client, 
  type ViewMode,
  meetingTypeColors,
  meetingTypeKoreanMap
} from '../types/types';
import { Badge } from '~/common/components/ui/badge';
import { useViewport } from '~/common/hooks/useViewport';

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

  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

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



  // 날짜 클릭 핸들러 (월 뷰에서 일 뷰로 전환)
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setViewMode('day');
  };

  // 미팅 추가 제출
  const onSubmitMeeting = (data: any) => {
    // 미팅 저장은 AddMeetingModal에서 직접 form 제출로 처리됨
    setIsAddMeetingOpen(false);
  };

  // 충돌 해결 핸들러
  const handleResolveConflict = async (
    eventId: string,
    resolution: 'local' | 'google'
  ) => {
    try {
      // GoogleCalendarService를 사용하여 충돌 해결
      const { GoogleCalendarService } = await import(
        '../lib/google-calendar-service'
      );
      const googleService = new GoogleCalendarService();

      const success = await googleService.resolveConflict(
        loaderData.agentId || 'unknown',
        eventId,
        resolution
      );

      if (success) {
        // 해결된 충돌을 목록에서 제거
        setConflicts(prev => prev.filter(c => c.eventId !== eventId));
        console.log(`✅ 충돌 해결 완료: ${eventId} -> ${resolution}`);
      } else {
        console.error('충돌 해결 실패');
      }
    } catch (error) {
      console.error('충돌 해결 중 오류:', error);
    }
  };

  // 모든 충돌 일괄 해결 핸들러
  const handleResolveAllConflicts = async (resolution: 'local' | 'google') => {
    try {
      const { GoogleCalendarService } = await import(
        '../lib/google-calendar-service'
      );
      const googleService = new GoogleCalendarService();

      const success = await googleService.resolveAllConflicts(
        loaderData.agentId || 'unknown',
        resolution
      );

      if (success) {
        // 모든 충돌 해결 완료
        setConflicts([]);
        setIsConflictModalOpen(false);
        console.log(`✅ 모든 충돌 일괄 해결 완료 -> ${resolution}`);
      } else {
        console.error('일괄 충돌 해결 실패');
      }
    } catch (error) {
      console.error('일괄 충돌 해결 중 오류:', error);
    }
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

  // 현재 표시 날짜 포맷 (iOS 스타일)
  const getDisplayTitle = () => {
    if (viewMode === 'month') {
      return isMobile 
        ? `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월`
        : `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월`;
    } else if (viewMode === 'week') {
      const weekStart = new Date(selectedDate);
      weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      if (isMobile) {
        return `${weekStart.getMonth() + 1}월 ${weekStart.getDate()}일 - ${weekEnd.getMonth() + 1}월 ${weekEnd.getDate()}일`;
      } else {
        return weekStart.getMonth() === weekEnd.getMonth()
          ? `${weekStart.getFullYear()}년 ${weekStart.getMonth() + 1}월 ${weekStart.getDate()}일 - ${weekEnd.getDate()}일`
          : `${weekStart.getFullYear()}년 ${weekStart.getMonth() + 1}월 ${weekStart.getDate()}일 - ${weekEnd.getMonth() + 1}월 ${weekEnd.getDate()}일`;
      }
    } else {
      return isMobile
        ? `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`
        : `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 ${selectedDate.toLocaleDateString('ko-KR', { weekday: 'long' })}`;
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
      newDate.setMonth(selectedDate.getMonth() + (direction === 'next' ? 1 : -1));
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
    <MainLayout title="일정 관리">
      <div className="flex-1 space-y-4 md:space-y-6">
        {/* 📱 모바일 최적화 헤더 */}
        <div className={cn(
          "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg",
          isMobile ? "p-4" : "p-6"
        )}>
          {/* 상단: 제목과 뷰 모드 */}
          <div className="flex flex-col space-y-4 mb-4">
            <div className="flex items-center justify-between">
              <h1 className={cn(
                "font-bold tracking-tight text-gray-900 dark:text-gray-100",
                isMobile ? "text-xl" : "text-2xl lg:text-3xl"
              )}>
                {getDisplayTitle()}
              </h1>
              
              {!isMobile && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1.5 px-3 py-1"
                >
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {viewMode === 'month' ? '월별' : viewMode === 'week' ? '주별' : '일별'} 보기
                </Badge>
              )}
            </div>

            {/* 🍎 iOS 네이티브 세그먼트 컨트롤 */}
            <Tabs
              value={viewMode}
              onValueChange={v => {
                triggerHapticFeedback();
                setViewMode(v as ViewMode);
              }}
              className="w-full"
            >
              <TabsList className={cn(
                "grid w-full grid-cols-3 rounded-xl p-1 shadow-inner",
                // iOS 네이티브 색상과 질감
                "bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-md",
                "border border-gray-200/50 dark:border-gray-700/50",
                isMobile ? "h-12" : "h-10"
              )}>
                <TabsTrigger
                  value="month"
                  className={cn(
                    // iOS 네이티브 선택 효과
                    "data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600",
                    "data-[state=active]:shadow-lg data-[state=active]:shadow-black/10",
                    "data-[state=active]:border data-[state=active]:border-gray-200/30",
                    "rounded-lg transition-all duration-300 ease-out",
                    // 텍스트 스타일
                    "data-[state=active]:text-gray-900 dark:data-[state=active]:text-white",
                    "data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400",
                    "font-medium tracking-tight",
                    // 크기 조정
                    isMobile ? "text-base h-10" : "text-sm h-8",
                    // 호버 효과
                    "hover:bg-gray-50 dark:hover:bg-gray-700/50 data-[state=active]:hover:bg-white"
                  )}
                >
                  월별
                </TabsTrigger>
                <TabsTrigger
                  value="week"
                  className={cn(
                    "data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600",
                    "data-[state=active]:shadow-lg data-[state=active]:shadow-black/10",
                    "data-[state=active]:border data-[state=active]:border-gray-200/30",
                    "rounded-lg transition-all duration-300 ease-out",
                    "data-[state=active]:text-gray-900 dark:data-[state=active]:text-white",
                    "data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400",
                    "font-medium tracking-tight",
                    isMobile ? "text-base h-10" : "text-sm h-8",
                    "hover:bg-gray-50 dark:hover:bg-gray-700/50 data-[state=active]:hover:bg-white"
                  )}
                >
                  주별
                </TabsTrigger>
                <TabsTrigger
                  value="day"
                  className={cn(
                    "data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600",
                    "data-[state=active]:shadow-lg data-[state=active]:shadow-black/10",
                    "data-[state=active]:border data-[state=active]:border-gray-200/30",
                    "rounded-lg transition-all duration-300 ease-out",
                    "data-[state=active]:text-gray-900 dark:data-[state=active]:text-white",
                    "data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400",
                    "font-medium tracking-tight",
                    isMobile ? "text-base h-10" : "text-sm h-8",
                    "hover:bg-gray-50 dark:hover:bg-gray-700/50 data-[state=active]:hover:bg-white"
                  )}
                >
                  일별
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* 하단: 네비게이션과 액션 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* iOS 스타일 네비게이션 */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size={isMobile ? "default" : "sm"}
                  onClick={() => navigateCalendar('prev')}
                  className={cn(
                    "rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors",
                    isMobile ? "h-10 w-10 p-0" : "h-8 w-8 p-0"
                  )}
                >
                  <ChevronLeftIcon className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
                </Button>
                <Button
                  variant="ghost"
                  size={isMobile ? "default" : "sm"}
                  onClick={goToToday}
                  className={cn(
                    "rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium",
                    isMobile ? "h-10 px-4 text-base" : "h-8 px-3 text-sm"
                  )}
                >
                  오늘
                </Button>
                <Button
                  variant="ghost"
                  size={isMobile ? "default" : "sm"}
                  onClick={() => navigateCalendar('next')}
                  className={cn(
                    "rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors",
                    isMobile ? "h-10 w-10 p-0" : "h-8 w-8 p-0"
                  )}
                >
                  <ChevronRightIcon className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
                </Button>
              </div>

              {/* 미니 날짜 표시 (데스크톱만) */}
              {!isMobile && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ml-3">
                  <CalendarIcon className="h-4 w-4" />
                  <span>
                    {selectedDate.toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short',
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* 액션 버튼들 */}
            <div className="flex items-center gap-3">
              {/* 미팅 통계 (데스크톱만) */}
              {!isMobile && !isTablet && (
                <div className="flex items-center gap-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-gray-600 dark:text-gray-400">이번 주</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {meetings.filter((m: Meeting) => {
                        const meetingDate = new Date(m.date);
                        const weekStart = new Date(selectedDate);
                        weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
                        const weekEnd = new Date(weekStart);
                        weekEnd.setDate(weekStart.getDate() + 6);
                        return meetingDate >= weekStart && meetingDate <= weekEnd;
                      }).length}건
                    </span>
                  </div>
                </div>
              )}

              <Button
                onClick={() => {
                  triggerHapticFeedback();
                  setIsAddMeetingOpen(true);
                }}
                className={cn(
                  "bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200",
                  isMobile ? "h-12 px-6 text-base" : "h-10 px-4 text-sm"
                )}
              >
                <PlusIcon className={cn("mr-2", isMobile ? "h-5 w-5" : "h-4 w-4")} />
                {isMobile ? "미팅 추가" : "미팅 예약"}
              </Button>
            </div>
          </div>
        </div>

        {/* 🔒 구글 캘린더 연동이 필요한 경우 */}
        {loaderData.requiresGoogleConnection ? (
          <div className="text-center py-16">
            <Card className="max-w-lg mx-auto shadow-lg border ">
              <CardContent className="pt-8 pb-8">
                <div className="p-6  rounded-full w-fit mx-auto mb-6">
                  <CalendarIcon className="w-16 h-16" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  구글 캘린더 연동이 필요합니다
                </h3>
                <p className="700 mb-6 leading-relaxed">
                  SureCRM의 일정 관리 기능을 사용하려면
                  <br />
                  구글 캘린더와의 연동이 필요합니다.
                  <br />
                  연동 후 모든 일정이 자동으로 동기화됩니다.
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
                      구글 캘린더 연동하기
                    </Button>
                  </form>
                  <p className="text-xs text-amber-600">
                    연동 후 새로고침하면 일정 관리 기능을 사용할 수 있습니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : meetings.length === 0 && clients.length === 0 ? (
          <div className="text-center py-16">
            <Card className="max-w-md mx-auto shadow-lg border border-border/50 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm">
              <CardContent className="pt-8 pb-8">
                <div className="p-6 bg-muted/20 rounded-full w-fit mx-auto mb-6">
                  <CalendarIcon className="w-16 h-16 text-muted-foreground/50" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  일정 관리를 시작해보세요
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  아직 등록된 고객이나 미팅이 없습니다.
                  <br />첫 번째 미팅을 예약하여 시작해보세요.
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={() => setIsAddMeetingOpen(true)}
                    className="w-full"
                    size="lg"
                  >
                    <PlusIcon className="mr-2 h-5 w-5" />첫 미팅 예약하기
                  </Button>
                  <Button variant="outline" className="w-full">
                    고객 등록하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* 📱 iOS 스타일 캘린더 뷰 */
          <div className={cn(
            "grid gap-4 md:gap-6",
            isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-5"
          )}>
            <div className={cn(isMobile ? "col-span-1" : "lg:col-span-4")}>
              {/* 캘린더 컨테이너 - iOS 스타일 */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
                {viewMode === 'month' && (
                  <CalendarGrid
                    selectedDate={selectedDate}
                    meetings={filteredMeetings}
                    onMeetingClick={setSelectedMeeting}
                    onDateClick={handleDateClick}
                    onMonthChange={(date) => setSelectedDate(date)}
                  />
                )}
                {viewMode === 'week' && (
                  <WeekView
                    selectedDate={selectedDate}
                    meetings={filteredMeetings}
                    onMeetingClick={setSelectedMeeting}
                  />
                )}
                {viewMode === 'day' && (
                  <DayView
                    selectedDate={selectedDate}
                    meetings={filteredMeetings}
                    onMeetingClick={setSelectedMeeting}
                  />
                )}
              </div>
            </div>

            {/* 📱 모바일에서는 접을 수 있는 사이드바 */}
            {!isMobile && (
              <CalendarSidebar
                meetings={meetings}
                onMeetingClick={setSelectedMeeting}
                filteredTypes={filteredTypes}
                onFilterChange={setFilteredTypes}
                googleCalendarSettings={googleCalendarSettings}
              />
            )}
          </div>
        )}

        {/* 📱 모바일 전용: 선택된 날짜의 미팅 리스트 */}
        {isMobile && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              {selectedDate.toLocaleDateString('ko-KR', { 
                month: 'long', 
                day: 'numeric' 
              })} 일정
            </h3>
            
            {filteredMeetings
              .filter((meeting: Meeting) => {
                const meetingDate = new Date(meeting.date);
                return meetingDate.toDateString() === selectedDate.toDateString();
              })
              .map((meeting: Meeting) => (
                <div
                  key={meeting.id}
                  onClick={() => {
                    triggerHapticFeedback();
                    setSelectedMeeting(meeting);
                  }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 mb-2 active:bg-gray-100 dark:active:bg-gray-700 transition-colors cursor-pointer"
                >
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {meeting.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {meeting.time} · {meetingTypeKoreanMap[meeting.type as keyof typeof meetingTypeKoreanMap] || meeting.type}
                    </div>
                  </div>
                </div>
              ))
            }
            
            {filteredMeetings.filter((meeting: Meeting) => {
              const meetingDate = new Date(meeting.date);
              return meetingDate.toDateString() === selectedDate.toDateString();
            }).length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>이 날에는 예정된 일정이 없습니다.</p>
              </div>
            )}
          </div>
        )}

        {/* 모달들 */}
        <AddMeetingModal
          isOpen={isAddMeetingOpen}
          onClose={() => setIsAddMeetingOpen(false)}
          clients={clients}
          googleCalendarConnected={googleCalendarSettings?.isConnected}
        />

        <MeetingDetailModal
          meeting={selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
          onToggleChecklist={toggleChecklist}
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
