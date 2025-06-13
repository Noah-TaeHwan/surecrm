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
import { useState } from 'react';
import { MainLayout } from '~/common/layouts/main-layout';
import { cn } from '~/lib/utils';
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
import { type Meeting, type Client, type ViewMode } from '../types/types';

export default function CalendarPage({
  loaderData,
  actionData,
}: CalendarPageProps) {
  const { meetings, clients, googleCalendarSettings } = loaderData;

  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [filteredTypes, setFilteredTypes] = useState<string[]>([]);

  // 충돌 관리 상태
  const [conflicts, setConflicts] = useState<ConflictData[]>([]);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);

  // 캘린더 네비게이션
  const navigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  // 날짜 클릭 핸들러 (월 뷰에서 일 뷰로 전환)
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setViewMode('day');
  };

  // 미팅 추가 제출
  const onSubmitMeeting = (data: any) => {
    console.log('새 미팅:', data);
    // Form 제출은 AddMeetingModal에서 처리
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

  // 현재 표시 날짜 포맷
  const getDisplayTitle = () => {
    if (viewMode === 'month') {
      return `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월`;
    } else if (viewMode === 'week') {
      const weekStart = new Date(selectedDate);
      weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      // 같은 달인 경우와 다른 달인 경우 처리
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${weekStart.getFullYear()}년 ${
          weekStart.getMonth() + 1
        }월 ${weekStart.getDate()}일 - ${weekEnd.getDate()}일`;
      } else {
        return `${weekStart.getFullYear()}년 ${
          weekStart.getMonth() + 1
        }월 ${weekStart.getDate()}일 - ${
          weekEnd.getMonth() + 1
        }월 ${weekEnd.getDate()}일`;
      }
    } else {
      return `${selectedDate.getFullYear()}년 ${
        selectedDate.getMonth() + 1
      }월 ${selectedDate.getDate()}일 ${selectedDate.toLocaleDateString(
        'ko-KR',
        { weekday: 'long' }
      )}`;
    }
  };

  return (
    <MainLayout title="일정 관리">
      <div className="flex-1 space-y-6 p-4 md:p-6 pt-6">
        {/* 액션 결과 메시지 */}
        {actionData && (
          <div
            className={cn(
              'p-4 rounded-md',
              actionData.success
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            )}
          >
            {actionData.message}
          </div>
        )}

        {/* 헤더 */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {getDisplayTitle()}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateCalendar('prev')}
                className="hover:bg-muted"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateCalendar('next')}
                className="hover:bg-muted"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
                className="ml-2 hover:bg-muted"
              >
                오늘
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Tabs
              value={viewMode}
              onValueChange={v => setViewMode(v as ViewMode)}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="month">월</TabsTrigger>
                <TabsTrigger value="week">주</TabsTrigger>
                <TabsTrigger value="day">일</TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              className="shadow-sm"
              onClick={() => setIsAddMeetingOpen(true)}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              미팅 예약
            </Button>
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
          /* 캘린더 뷰 */
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-4">
              <Card className="shadow-lg border border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-0">
                  {viewMode === 'month' && (
                    <CalendarGrid
                      selectedDate={selectedDate}
                      meetings={meetings}
                      onMeetingClick={setSelectedMeeting}
                      filteredTypes={filteredTypes}
                      onDateClick={handleDateClick}
                    />
                  )}
                  {viewMode === 'week' && (
                    <WeekView
                      selectedDate={selectedDate}
                      meetings={meetings}
                      onMeetingClick={setSelectedMeeting}
                      filteredTypes={filteredTypes}
                    />
                  )}
                  {viewMode === 'day' && (
                    <DayView
                      selectedDate={selectedDate}
                      meetings={meetings}
                      onMeetingClick={setSelectedMeeting}
                      filteredTypes={filteredTypes}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 사이드바 */}
            <CalendarSidebar
              meetings={meetings}
              onMeetingClick={setSelectedMeeting}
              filteredTypes={filteredTypes}
              onFilterChange={setFilteredTypes}
              googleCalendarSettings={googleCalendarSettings}
            />
          </div>
        )}

        {/* 모달들 */}
        <AddMeetingModal
          isOpen={isAddMeetingOpen}
          onClose={() => setIsAddMeetingOpen(false)}
          clients={clients}
          onSubmit={onSubmitMeeting}
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
