// import type { Route } from './+types/calendar-page'; // 현재 라우트로 등록되지 않음
namespace Route {
  export type LoaderArgs = any;
  export type ActionArgs = any;
  export type MetaArgs = any;
  export type ComponentProps = any;
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/common/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/common/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Input } from '~/common/components/ui/input';
import { Textarea } from '~/common/components/ui/textarea';
import { Badge } from '~/common/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/common/components/ui/tabs';
import { Label } from '~/common/components/ui/label';
import { Checkbox } from '~/common/components/ui/checkbox';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import {
  CalendarIcon,
  ClockIcon,
  PersonIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  Cross2Icon,
  BellIcon,
  FileTextIcon,
} from '@radix-ui/react-icons';
import { Link, redirect } from 'react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MainLayout } from '~/common/layouts/main-layout';
import { cn } from '~/lib/utils';
import { CalendarGrid } from '../components/calendar-grid';
import { WeekView } from '../components/week-view';
import { DayView } from '../components/day-view';
import { CalendarSidebar } from '../components/calendar-sidebar';
import { AddMeetingModal } from '../components/add-meeting-modal';
import { MeetingDetailModal } from '../components/meeting-detail-modal';
import { type Meeting, type Client, type ViewMode } from '../types/types';

// 실제 데이터베이스 연결 함수들 import
import {
  getMeetingsByMonth,
  getClientsByAgent,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  toggleChecklistItem,
  type CalendarMeeting,
  type CalendarClient,
} from '../lib/calendar-data';
import { requireAuth } from '~/lib/auth/middleware';

// 미팅 폼 스키마
const meetingSchema = z.object({
  title: z.string().min(1, '제목을 입력하세요'),
  clientId: z.string().min(1, '고객을 선택하세요'),
  date: z.string(),
  time: z.string(),
  duration: z.number().min(15).max(480),
  type: z.string(),
  location: z.string(),
  description: z.string().optional(),
  reminder: z.string(),
  repeat: z.string(),
});

type MeetingFormData = z.infer<typeof meetingSchema>;

export async function loader({ request }: Route.LoaderArgs) {
  try {
    // 인증 확인
    const user = await requireAuth(request);
    const agentId = user.id;

    // 현재 날짜 정보
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentYear = today.getFullYear();

    // 실제 데이터베이스에서 데이터 조회
    const [meetings, clients] = await Promise.all([
      getMeetingsByMonth(agentId, currentYear, currentMonth),
      getClientsByAgent(agentId),
    ]);

    return {
      meetings: meetings,
      clients: clients,
      currentMonth,
      currentYear,
      agentId,
    };
  } catch (error) {
    console.error('Calendar 데이터 로딩 실패:', error);

    // 에러 시 빈 배열 반환
    const today = new Date();
    return {
      meetings: [],
      clients: [],
      currentMonth: today.getMonth() + 1,
      currentYear: today.getFullYear(),
      agentId: 'error-fallback',
    };
  }
}

export async function action({ request }: Route.ActionArgs) {
  try {
    // 인증 확인
    const user = await requireAuth(request);
    const agentId = user.id;

    const formData = await request.formData();
    const actionType = formData.get('actionType') as string;

    switch (actionType) {
      case 'createMeeting': {
        const title = formData.get('title') as string;
        const clientId = formData.get('clientId') as string;
        const date = formData.get('date') as string;
        const time = formData.get('time') as string;
        const duration = parseInt(formData.get('duration') as string);
        const meetingType = formData.get('type') as string;
        const location = formData.get('location') as string;
        const description = formData.get('description') as string;

        // 예약 시간 계산 (scheduledAt 필드 사용)
        const [year, month, day] = date.split('-').map(Number);
        const [hour, minute] = time.split(':').map(Number);

        const scheduledAt = new Date(year, month - 1, day, hour, minute);

        await createMeeting(agentId, {
          title,
          clientId,
          scheduledAt,
          duration, // 분 단위로 전달
          location,
          meetingType,
          description,
        });

        return { success: true, message: '미팅이 성공적으로 생성되었습니다.' };
      }

      case 'updateMeeting': {
        const meetingId = formData.get('meetingId') as string;
        const title = formData.get('title') as string;
        const date = formData.get('date') as string;
        const time = formData.get('time') as string;
        const duration = parseInt(formData.get('duration') as string);
        const location = formData.get('location') as string;
        const description = formData.get('description') as string;
        const status = formData.get('status') as string;

        // 예약 시간 계산 (scheduledAt 필드 사용)
        const [year, month, day] = date.split('-').map(Number);
        const [hour, minute] = time.split(':').map(Number);

        const scheduledAt = new Date(year, month - 1, day, hour, minute);

        await updateMeeting(meetingId, agentId, {
          title,
          scheduledAt,
          duration, // 분 단위로 전달
          location,
          description,
          status: status as any,
        });

        return { success: true, message: '미팅이 성공적으로 수정되었습니다.' };
      }

      case 'deleteMeeting': {
        const meetingId = formData.get('meetingId') as string;

        await deleteMeeting(meetingId, agentId);

        return { success: true, message: '미팅이 성공적으로 삭제되었습니다.' };
      }

      case 'toggleChecklist': {
        const meetingId = formData.get('meetingId') as string;
        const checklistId = formData.get('checklistId') as string;

        await toggleChecklistItem(checklistId, meetingId, agentId);

        return { success: true, message: '체크리스트가 업데이트되었습니다.' };
      }

      default:
        return { success: false, message: '알 수 없는 액션입니다.' };
    }
  } catch (error) {
    console.error('Calendar 액션 실행 실패:', error);
    return {
      success: false,
      message: '작업 중 오류가 발생했습니다. 다시 시도해주세요.',
    };
  }
}

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '일정 관리 - SureCRM' },
    { name: 'description', content: '고객 미팅과 일정을 관리합니다' },
  ];
}

export default function CalendarPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { meetings, clients } = loaderData;

  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [filteredTypes, setFilteredTypes] = useState<string[]>([]);

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
              onValueChange={(v) => setViewMode(v as ViewMode)}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="month">월</TabsTrigger>
                <TabsTrigger value="week">주</TabsTrigger>
                <TabsTrigger value="day">일</TabsTrigger>
              </TabsList>
            </Tabs>

            <Dialog open={isAddMeetingOpen} onOpenChange={setIsAddMeetingOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-sm">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  미팅 예약
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        {/* 데이터가 없는 경우 빈 상태 표시 */}
        {meetings.length === 0 && clients.length === 0 ? (
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
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/clients">고객 등록하기</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-16">
            <Card className="max-w-md mx-auto shadow-lg border border-border/50 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm">
              <CardContent className="pt-8 pb-8">
                <div className="p-6 bg-muted/20 rounded-full w-fit mx-auto mb-6">
                  <BellIcon className="w-16 h-16 text-muted-foreground/50" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  예정된 미팅이 없습니다
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  등록된 고객은 {clients.length}명이지만,
                  <br />
                  예정된 미팅이 없습니다. 새로운 미팅을 예약해보세요.
                </p>
                <Button
                  onClick={() => setIsAddMeetingOpen(true)}
                  className="w-full"
                  size="lg"
                >
                  <PlusIcon className="mr-2 h-5 w-5" />새 미팅 예약하기
                </Button>
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
            />
          </div>
        )}

        {/* 모달들 */}
        <AddMeetingModal
          isOpen={isAddMeetingOpen}
          onClose={() => setIsAddMeetingOpen(false)}
          clients={clients}
          onSubmit={onSubmitMeeting}
        />

        <MeetingDetailModal
          meeting={selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
          onToggleChecklist={toggleChecklist}
        />
      </div>
    </MainLayout>
  );
}
