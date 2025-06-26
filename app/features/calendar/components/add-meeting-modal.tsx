/**
 * 🗓️ 미팅 추가 모달 컴포넌트
 * Dialog를 사용하여 미팅 추가 기능 구현
 */

import React from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Input } from '~/common/components/ui/input';
import { Button } from '~/common/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Textarea } from '~/common/components/ui/textarea';
import { CalendarIcon, ClockIcon, MapPin } from 'lucide-react';
import { toast } from 'sonner';

// 🎯 폼 스키마
const meetingSchema = z.object({
  title: z.string().min(1, '미팅 제목을 입력하세요'),
  clientId: z.string().min(1, '고객을 선택하세요'),
  date: z.string().min(1, '날짜를 선택하세요'),
  time: z.string().min(1, '시간을 선택하세요'),
  duration: z.number().min(15).max(480),
  type: z.string().min(1, '미팅 유형을 선택하세요'),
  location: z.string().optional(),
  description: z.string().optional(),
  priority: z.string(),
});

type MeetingFormData = z.infer<typeof meetingSchema>;

interface AddMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: any[];
}

const meetingTypes = [
  { value: 'first_consultation', label: '초회 상담', icon: '🤝' },
  { value: 'follow_up', label: '후속 상담', icon: '📞' },
  { value: 'product_explanation', label: '상품 설명', icon: '📋' },
  { value: 'contract_review', label: '계약 검토', icon: '📄' },
  { value: 'contract_signing', label: '계약 체결', icon: '✍️' },
  { value: 'claim_support', label: '보험금 청구 지원', icon: '🆘' },
  { value: 'other', label: '기타', icon: '📝' },
];

const priorityOptions = [
  { value: 'low', label: '낮음', icon: '⚪' },
  { value: 'medium', label: '보통', icon: '🔵' },
  { value: 'high', label: '높음', icon: '🟠' },
  { value: 'urgent', label: '긴급', icon: '🔴' },
];

export function AddMeetingModal({
  isOpen,
  onClose,
  clients,
}: AddMeetingModalProps) {
  const navigate = useNavigate();
  const form = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: '',
      clientId: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      duration: 60,
      type: '',
      location: '',
      description: '',
      priority: 'medium',
    },
  });

  const handleSubmit = async (data: MeetingFormData) => {
    try {
      // Form 제출을 위한 데이터 준비
      const formData = new FormData();
      formData.append('actionType', 'createMeeting');

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // POST 요청으로 제출
      const response = await fetch('/calendar', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success('미팅이 성공적으로 예약되었습니다.');
        form.reset();
        onClose();
        navigate('.', { replace: true }); // 페이지 새로고침
      } else {
        throw new Error('미팅 생성 실패');
      }
    } catch (error) {
      console.error('미팅 생성 중 오류:', error);
      toast.error('미팅 생성 중 오류가 발생했습니다.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 미팅 예약</DialogTitle>
          <DialogDescription>
            고객과의 미팅을 예약하고 구글 캘린더와 자동 동기화합니다.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* 고객 선택 */}
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>고객 선택 *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="고객을 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {(client as any).fullName ||
                            (client as any).name ||
                            '고객'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 미팅 유형 */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>미팅 유형 *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="유형을 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {meetingTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <span className="flex items-center gap-2">
                            <span>{type.icon}</span>
                            <span>{type.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 미팅 제목 */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>미팅 제목 *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="예: 김영희님 초회 상담" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 날짜와 시간 */}
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            {/* 소요 시간 */}
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>소요 시간 (분)</FormLabel>
                  <Select
                    onValueChange={value => field.onChange(Number(value))}
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
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 우선순위 */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>우선순위</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {priorityOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <span className="flex items-center gap-2">
                            <span>{option.icon}</span>
                            <span>{option.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 장소 */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>장소</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-10"
                        placeholder="미팅 장소"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 설명 */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>미팅 메모</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="준비사항, 논의 주제 등을 입력하세요"
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    구글 캘린더 일정 설명에 자동으로 동기화됩니다
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button type="submit">미팅 예약</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
