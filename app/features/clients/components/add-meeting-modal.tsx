import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Button } from '~/common/components/ui/button';
import { Label } from '~/common/components/ui/label';
import {
  CalendarIcon,
  ClockIcon,
  CheckIcon,
  Cross2Icon,
  BellIcon,
} from '@radix-ui/react-icons';

// 미팅 폼 스키마
const meetingSchema = z.object({
  title: z.string().min(1, '제목을 입력하세요'),
  clientId: z.string().min(1, '고객을 선택하세요'),
  date: z.string().min(1, '날짜를 선택하세요'),
  time: z.string().min(1, '시간을 선택하세요'),
  duration: z.number().min(15, '최소 15분').max(480, '최대 8시간'),
  type: z.string().min(1, '미팅 유형을 선택하세요'),
  location: z.string().min(1, '장소를 입력하세요'),
  description: z.string().optional(),
  reminder: z.string(),
  repeat: z.string(),
});

type MeetingFormData = z.infer<typeof meetingSchema>;

// 미팅 유형 옵션
const meetingTypes = [
  '첫 상담',
  '니즈 분석',
  '상품 설명',
  '계약 검토',
  '계약 체결',
  '정기 점검',
  '클레임 상담',
  '기타',
];

// 알림 옵션
const reminderOptions = [
  { value: '0', label: '알림 없음' },
  { value: '15', label: '15분 전' },
  { value: '30', label: '30분 전' },
  { value: '60', label: '1시간 전' },
  { value: '1440', label: '1일 전' },
];

// 반복 옵션
const repeatOptions = [
  { value: 'none', label: '반복 없음' },
  { value: 'daily', label: '매일' },
  { value: 'weekly', label: '매주' },
  { value: 'monthly', label: '매월' },
];

interface AddMeetingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId?: string;
  clientName?: string;
  onMeetingAdded?: (meeting: any) => void;
}

export function AddMeetingModal({
  open,
  onOpenChange,
  clientId,
  clientName,
  onMeetingAdded,
}: AddMeetingModalProps) {
  const form = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: '',
      clientId: clientId || '',
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

  // TODO: 실제 앱에서는 API에서 가져와야 함
  const availableClients = [
    { id: '1', name: '김영희' },
    { id: '2', name: '이철수' },
    { id: '3', name: '박지민' },
    { id: '4', name: '최민수' },
    { id: '5', name: '정수연' },
  ];

  const onSubmit = (data: MeetingFormData) => {
    const newMeeting = {
      id: Date.now().toString(),
      title: data.title,
      client: availableClients.find((c) => c.id === data.clientId) || {
        id: data.clientId,
        name: clientName || '알 수 없음',
      },
      date: data.date,
      time: data.time,
      duration: data.duration,
      type: data.type,
      location: data.location,
      description: data.description,
      status: 'scheduled' as const,
      reminder: data.reminder,
      repeat: data.repeat,
      checklist: [],
      createdAt: new Date().toISOString(),
    };

    console.log('새 미팅 추가:', newMeeting);
    onMeetingAdded?.(newMeeting);
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 미팅 예약</DialogTitle>
          <DialogDescription>
            고객과의 미팅 일정을 예약합니다.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>미팅 제목 *</FormLabel>
                    <FormControl>
                      <Input placeholder="김영희님 첫 상담" {...field} />
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
                    <FormLabel>고객 *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="고객 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableClients.map((client) => (
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
                    <FormLabel>미팅 유형 *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {meetingTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
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
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>날짜 *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input type="date" className="pl-10" {...field} />
                      </div>
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
                    <FormLabel>시간 *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <ClockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input type="time" className="pl-10" {...field} />
                      </div>
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
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
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
                        <SelectItem value="180">3시간</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 장소 및 설명 */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>장소 *</FormLabel>
                  <FormControl>
                    <Input placeholder="카페 스타벅스 강남점" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>미팅 설명</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="미팅 목적, 준비사항 등을 입력하세요..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    미팅의 목적이나 특별한 준비사항을 입력하세요.
                  </FormDescription>
                </FormItem>
              )}
            />

            {/* 알림 및 반복 설정 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reminder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>알림 설정</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <BellIcon className="mr-2 h-4 w-4" />
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {reminderOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
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
                    <FormLabel>반복 설정</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {repeatOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                <Cross2Icon className="mr-2 h-4 w-4" />
                취소
              </Button>
              <Button type="submit">
                <CheckIcon className="mr-2 h-4 w-4" />
                미팅 예약
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
