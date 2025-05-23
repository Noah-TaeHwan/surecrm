import type { Route } from '.react-router/types/app/features/calendar/pages/+types/calendar-page';
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

// 미팅 유형별 색상
const meetingTypeColors = {
  '첫 상담': 'bg-blue-500',
  '니즈 분석': 'bg-purple-500',
  '상품 설명': 'bg-orange-500',
  '계약 검토': 'bg-yellow-500',
  '계약 체결': 'bg-green-500',
  '정기 점검': 'bg-gray-500',
};

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

  const meetings = [
    {
      id: '1',
      title: '김영희님 첫 상담',
      client: { id: '1', name: '김영희', phone: '010-1234-5678' },
      date: '2024-01-15',
      time: '14:00',
      duration: 60,
      type: '첫 상담',
      location: '고객 사무실',
      description: '보험 필요성 상담 및 니즈 파악',
      status: 'completed',
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
      date: '2024-01-20',
      time: '10:00',
      duration: 90,
      type: '상품 설명',
      location: '스타벅스 강남점',
      description: '종신보험 상품 설명',
      status: 'scheduled',
      checklist: [
        { id: '1', text: '상품 설명서 준비', completed: true },
        { id: '2', text: '계산기 준비', completed: false },
        { id: '3', text: '샘플 계약서 준비', completed: false },
      ],
    },
    {
      id: '3',
      title: '박지민님 계약 체결',
      client: { id: '3', name: '박지민', phone: '010-2345-6789' },
      date: '2024-01-22',
      time: '15:00',
      duration: 120,
      type: '계약 체결',
      location: '본사 상담실',
      description: '가족보험 계약 체결',
      status: 'scheduled',
      checklist: [
        { id: '1', text: '신분증 사본 받기', completed: false },
        { id: '2', text: '계약서 작성', completed: false },
        { id: '3', text: '초회 보험료 수납', completed: false },
      ],
    },
  ];

  const clients = [
    { id: '1', name: '김영희' },
    { id: '2', name: '이철수' },
    { id: '3', name: '박지민' },
    { id: '4', name: '최민수' },
    { id: '5', name: '정수연' },
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
  const { meetings, clients, currentMonth, currentYear } = loaderData;

  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);

  // 미팅 추가 폼
  const form = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: '',
      clientId: '',
      date: '',
      time: '',
      duration: 60,
      type: '첫 상담',
      location: '',
      description: '',
      reminder: '30',
      repeat: 'none',
    },
  });

  // 날짜 관련 유틸리티
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

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

  // 미팅 추가 제출
  const onSubmitMeeting = (data: MeetingFormData) => {
    console.log('새 미팅:', data);
    setIsAddMeetingOpen(false);
    form.reset();
  };

  // 체크리스트 토글
  const toggleChecklist = (meetingId: string, checklistId: string) => {
    console.log('체크리스트 토글:', meetingId, checklistId);
  };

  // 월별 캘린더 렌더링
  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(selectedDate);
    const firstDay = getFirstDayOfMonth(selectedDate);
    const days = [];

    // 빈 셀 추가
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 bg-gray-50" />);
    }

    // 날짜 셀 추가
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedDate.getFullYear()}-${String(
        selectedDate.getMonth() + 1
      ).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayMeetings = meetings.filter((m) => m.date === dateStr);

      days.push(
        <div
          key={day}
          className="h-32 border p-2 hover:bg-gray-50 cursor-pointer"
        >
          <div className="font-medium text-sm mb-1">{day}</div>
          <div className="space-y-1">
            {dayMeetings.slice(0, 3).map((meeting) => (
              <div
                key={meeting.id}
                className={cn(
                  'text-xs p-1 rounded text-white truncate cursor-pointer hover:opacity-80',
                  meetingTypeColors[
                    meeting.type as keyof typeof meetingTypeColors
                  ]
                )}
                onClick={() => setSelectedMeeting(meeting)}
              >
                {meeting.time} {meeting.client.name}
              </div>
            ))}
            {dayMeetings.length > 3 && (
              <div className="text-xs text-muted-foreground">
                +{dayMeetings.length - 3}개 더
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        <div className="bg-white p-2 text-center font-medium">일</div>
        <div className="bg-white p-2 text-center font-medium">월</div>
        <div className="bg-white p-2 text-center font-medium">화</div>
        <div className="bg-white p-2 text-center font-medium">수</div>
        <div className="bg-white p-2 text-center font-medium">목</div>
        <div className="bg-white p-2 text-center font-medium">금</div>
        <div className="bg-white p-2 text-center font-medium">토</div>
        {days}
      </div>
    );
  };

  return (
    <MainLayout title="일정 관리">
      <div className="container mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">
              {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월
            </h1>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateCalendar('prev')}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateCalendar('next')}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
              >
                오늘
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
              <TabsList>
                <TabsTrigger value="month">월</TabsTrigger>
                <TabsTrigger value="week">주</TabsTrigger>
                <TabsTrigger value="day">일</TabsTrigger>
              </TabsList>
            </Tabs>

            <Dialog open={isAddMeetingOpen} onOpenChange={setIsAddMeetingOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  미팅 추가
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>새 미팅 추가</DialogTitle>
                  <DialogDescription>
                    고객과의 미팅 일정을 추가하세요
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmitMeeting)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>미팅 제목</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="김영희님 상품 설명"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="clientId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>고객</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="고객 선택" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {clients.map((client) => (
                                  <SelectItem key={client.id} value={client.id}>
                                    {client.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>미팅 유형</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="유형 선택" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="첫 상담">첫 상담</SelectItem>
                                <SelectItem value="니즈 분석">
                                  니즈 분석
                                </SelectItem>
                                <SelectItem value="상품 설명">
                                  상품 설명
                                </SelectItem>
                                <SelectItem value="계약 검토">
                                  계약 검토
                                </SelectItem>
                                <SelectItem value="계약 체결">
                                  계약 체결
                                </SelectItem>
                                <SelectItem value="정기 점검">
                                  정기 점검
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>날짜</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>시간</FormLabel>
                            <FormControl>
                              <Input {...field} type="time" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>소요 시간 (분)</FormLabel>
                            <Select
                              onValueChange={(v) => field.onChange(parseInt(v))}
                              defaultValue={field.value.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="30">30분</SelectItem>
                                <SelectItem value="60">1시간</SelectItem>
                                <SelectItem value="90">1시간 30분</SelectItem>
                                <SelectItem value="120">2시간</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>장소</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="스타벅스 강남점" />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="reminder"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>알림</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">알림 없음</SelectItem>
                                <SelectItem value="10">10분 전</SelectItem>
                                <SelectItem value="30">30분 전</SelectItem>
                                <SelectItem value="60">1시간 전</SelectItem>
                                <SelectItem value="1440">1일 전</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="repeat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>반복</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">반복 없음</SelectItem>
                                <SelectItem value="daily">매일</SelectItem>
                                <SelectItem value="weekly">매주</SelectItem>
                                <SelectItem value="monthly">매월</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>설명</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={3}
                                placeholder="미팅 관련 메모나 준비사항을 입력하세요"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddMeetingOpen(false)}
                      >
                        취소
                      </Button>
                      <Button type="submit">미팅 추가</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* 캘린더 뷰 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-0">
                {viewMode === 'month' && renderMonthView()}
                {viewMode === 'week' && (
                  <div className="p-6 text-center text-muted-foreground">
                    주간 뷰 (구현 예정)
                  </div>
                )}
                {viewMode === 'day' && (
                  <div className="p-6 text-center text-muted-foreground">
                    일간 뷰 (구현 예정)
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 오늘의 일정 사이드바 */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">오늘의 일정</CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString('ko-KR', {
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {meetings
                  .filter((m) => m.date === formatDate(new Date()))
                  .map((meeting) => (
                    <div
                      key={meeting.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedMeeting(meeting)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium">{meeting.time}</div>
                          <div className="text-sm text-muted-foreground">
                            {meeting.duration}분
                          </div>
                        </div>
                        <Badge
                          className={cn(
                            'text-white',
                            meetingTypeColors[
                              meeting.type as keyof typeof meetingTypeColors
                            ]
                          )}
                        >
                          {meeting.type}
                        </Badge>
                      </div>
                      <div className="font-medium">{meeting.client.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {meeting.location}
                      </div>
                    </div>
                  ))}
                {meetings.filter((m) => m.date === formatDate(new Date()))
                  .length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    오늘 예정된 미팅이 없습니다
                  </p>
                )}
              </CardContent>
            </Card>

            {/* 미팅 유형별 범례 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">미팅 유형</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(meetingTypeColors).map(([type, color]) => (
                    <div key={type} className="flex items-center gap-2">
                      <div className={cn('w-4 h-4 rounded', color)} />
                      <span className="text-sm">{type}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 미팅 상세 모달 */}
        {selectedMeeting && (
          <Dialog
            open={!!selectedMeeting}
            onOpenChange={() => setSelectedMeeting(null)}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedMeeting.title}</DialogTitle>
                <DialogDescription>
                  미팅 상세 정보 및 체크리스트
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>고객</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {selectedMeeting.client.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link
                          to={`/clients/${selectedMeeting.client.id}`}
                          className="font-medium hover:underline"
                        >
                          {selectedMeeting.client.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {selectedMeeting.client.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>일시</Label>
                    <div className="mt-1">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedMeeting.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {selectedMeeting.time} ({selectedMeeting.duration}분)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>미팅 유형</Label>
                    <Badge
                      className={cn(
                        'mt-1 text-white',
                        meetingTypeColors[
                          selectedMeeting.type as keyof typeof meetingTypeColors
                        ]
                      )}
                    >
                      {selectedMeeting.type}
                    </Badge>
                  </div>

                  <div>
                    <Label>장소</Label>
                    <p className="mt-1">{selectedMeeting.location}</p>
                  </div>
                </div>

                {selectedMeeting.description && (
                  <div>
                    <Label>설명</Label>
                    <p className="mt-1 text-sm">
                      {selectedMeeting.description}
                    </p>
                  </div>
                )}

                <div>
                  <Label className="mb-2 block">체크리스트</Label>
                  <div className="space-y-2">
                    {selectedMeeting.checklist.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() =>
                            toggleChecklist(selectedMeeting.id, item.id)
                          }
                        />
                        <span
                          className={cn(
                            'text-sm',
                            item.completed &&
                              'line-through text-muted-foreground'
                          )}
                        >
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link to={`/clients/${selectedMeeting.client.id}`}>
                    <Button variant="outline">
                      <PersonIcon className="mr-2 h-4 w-4" />
                      고객 정보
                    </Button>
                  </Link>
                  <Button variant="outline">
                    <FileTextIcon className="mr-2 h-4 w-4" />
                    미팅 기록 작성
                  </Button>
                  {selectedMeeting.status === 'scheduled' && (
                    <Button>
                      <CheckIcon className="mr-2 h-4 w-4" />
                      미팅 완료
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
}
