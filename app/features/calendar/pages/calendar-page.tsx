import type { Route } from './+types/calendar-page';
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
import { Link } from 'react-router';
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
import { type Meeting, type Client, type ViewMode } from '../components/types';

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

export function loader({ request }: Route.LoaderArgs) {
  // TODO: 실제 API에서 데이터 가져오기
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const meetings: Meeting[] = [
    // 오늘 일정들
    {
      id: '1',
      title: '김영희님 첫 상담',
      client: { id: '1', name: '김영희', phone: '010-1234-5678' },
      date: today.toISOString().split('T')[0],
      time: '14:00',
      duration: 60,
      type: '첫 상담',
      location: '고객 사무실',
      description: '보험 필요성 상담 및 니즈 파악',
      status: 'scheduled',
      checklist: [
        { id: '1', text: '고객 정보 확인', completed: true },
        { id: '2', text: '상담 자료 준비', completed: true },
        { id: '3', text: '계약서 준비', completed: false },
      ],
    },
    {
      id: '2',
      title: '이철수님 상품 설명',
      client: { id: '2', name: '이철수', phone: '010-9876-5432' },
      date: today.toISOString().split('T')[0],
      time: '16:30',
      duration: 90,
      type: '상품 설명',
      location: '스타벅스 강남점',
      description: '종신보험 상품 설명 및 견적 제시',
      status: 'scheduled',
      checklist: [
        { id: '1', text: '상품 설명서 준비', completed: true },
        { id: '2', text: '계산기 준비', completed: false },
        { id: '3', text: '샘플 계약서 준비', completed: false },
      ],
    },
    // 이번 주 일정들
    {
      id: '3',
      title: '박지민님 계약 체결',
      client: { id: '3', name: '박지민', phone: '010-2345-6789' },
      date: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      time: '15:00',
      duration: 120,
      type: '계약 체결',
      location: '본사 상담실',
      description: '가족보험 계약 체결 및 서류 작성',
      status: 'scheduled',
      checklist: [
        { id: '1', text: '신분증 사본 받기', completed: false },
        { id: '2', text: '계약서 작성', completed: false },
        { id: '3', text: '초회 보험료 수납', completed: false },
      ],
    },
    {
      id: '4',
      title: '정수연님 니즈 분석',
      client: { id: '4', name: '정수연', phone: '010-3456-7890' },
      date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      time: '10:00',
      duration: 60,
      type: '니즈 분석',
      location: '고객 자택',
      description: '가족 구성원별 보험 니즈 분석',
      status: 'scheduled',
      checklist: [
        { id: '1', text: '가족 정보 조사', completed: true },
        { id: '2', text: '니즈 분석 자료 준비', completed: false },
      ],
    },
    {
      id: '5',
      title: '최민수님 정기 점검',
      client: { id: '5', name: '최민수', phone: '010-4567-8901' },
      date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      time: '14:30',
      duration: 45,
      type: '정기 점검',
      location: '카페 온더테이블',
      description: '기존 보험 상품 점검 및 변경사항 논의',
      status: 'scheduled',
      checklist: [
        { id: '1', text: '기존 계약서 검토', completed: true },
        { id: '2', text: '변경 가능 상품 조사', completed: false },
      ],
    },
    {
      id: '6',
      title: '김철호님 계약 검토',
      client: { id: '6', name: '김철호', phone: '010-5678-9012' },
      date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      time: '11:00',
      duration: 75,
      type: '계약 검토',
      location: '본사 회의실',
      description: '실손보험 약관 검토 및 최종 확인',
      status: 'scheduled',
      checklist: [
        { id: '1', text: '약관 설명 자료 준비', completed: false },
        { id: '2', text: '고객 질문 사항 정리', completed: false },
      ],
    },
    {
      id: '7',
      title: '홍길동님 첫 상담',
      client: { id: '7', name: '홍길동', phone: '010-6789-0123' },
      date: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      time: '09:30',
      duration: 90,
      type: '첫 상담',
      location: '고객 직장',
      description: '30대 직장인 보험 포트폴리오 상담',
      status: 'scheduled',
      checklist: [
        { id: '1', text: '직장인 보험 자료 준비', completed: true },
        { id: '2', text: '연령별 추천 상품 조사', completed: false },
      ],
    },
    {
      id: '8',
      title: '이미경님 상품 설명',
      client: { id: '8', name: '이미경', phone: '010-7890-1234' },
      date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      time: '16:00',
      duration: 60,
      type: '상품 설명',
      location: '롯데백화점 카페',
      description: '자녀 교육보험 상품 설명',
      status: 'scheduled',
      checklist: [
        { id: '1', text: '교육보험 상품 자료', completed: true },
        { id: '2', text: '학자금 계산 시뮬레이션', completed: false },
      ],
    },
    // 다음 주 일정들
    {
      id: '9',
      title: '강민수님 계약 체결',
      client: { id: '9', name: '강민수', phone: '010-8901-2345' },
      date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      time: '13:00',
      duration: 100,
      type: '계약 체결',
      location: '본사 상담실',
      description: '종신보험 + 암보험 패키지 계약',
      status: 'scheduled',
      checklist: [
        { id: '1', text: '패키지 계약서 준비', completed: false },
        { id: '2', text: '할인 혜택 확인', completed: false },
      ],
    },
    {
      id: '10',
      title: '윤서영님 정기 점검',
      client: { id: '10', name: '윤서영', phone: '010-9012-3456' },
      date: new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      time: '15:30',
      duration: 50,
      type: '정기 점검',
      location: '고객 사무실',
      description: '기업 단체보험 갱신 상담',
      status: 'scheduled',
      checklist: [
        { id: '1', text: '단체보험 갱신 자료', completed: true },
        { id: '2', text: '임직원 수 변동 확인', completed: false },
      ],
    },
  ];

  const clients: Client[] = [
    { id: '1', name: '김영희' },
    { id: '2', name: '이철수' },
    { id: '3', name: '박지민' },
    { id: '4', name: '정수연' },
    { id: '5', name: '최민수' },
    { id: '6', name: '김철호' },
    { id: '7', name: '홍길동' },
    { id: '8', name: '이미경' },
    { id: '9', name: '강민수' },
    { id: '10', name: '윤서영' },
  ];

  return { meetings, clients, currentMonth, currentYear };
}

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '일정 관리 - SureCRM' },
    { name: 'description', content: '고객 미팅과 일정을 관리합니다' },
  ];
}

export default function CalendarPage({ loaderData }: Route.ComponentProps) {
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
    setIsAddMeetingOpen(false);
  };

  // 체크리스트 토글
  const toggleChecklist = (meetingId: string, checklistId: string) => {
    console.log('체크리스트 토글:', meetingId, checklistId);
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
      return `${weekStart.getMonth() + 1}.${weekStart.getDate()} - ${
        weekEnd.getMonth() + 1
      }.${weekEnd.getDate()}`;
    } else {
      return selectedDate.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });
    }
  };

  return (
    <MainLayout title="일정 관리">
      <div className="flex-1 space-y-6 p-4 md:p-6 pt-6">
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

        {/* 캘린더 뷰 */}
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
