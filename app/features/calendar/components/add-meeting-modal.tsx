/**
 * 🗓️ 미팅 추가 모달 컴포넌트
 * Dialog를 사용하여 미팅 추가 기능 구현
 */

import React, { useState } from 'react';
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
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';
import { UserIcon } from 'lucide-react';
import { Badge } from '~/common/components/ui/badge';
import { MapPinIcon } from 'lucide-react';

// 🎯 폼 스키마
const meetingSchema = z.object({
  title: z.string().min(1, '미팅 제목을 입력하세요'),
  clientId: z.string().min(1, '고객을 선택하세요'),
  date: z.string().min(1, '날짜를 선택하세요'),
  time: z.string().min(1, '시간을 선택하세요'),
  duration: z.string().min(1, '소요 시간을 선택하세요'),
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
  const { t } = useHydrationSafeTranslation('calendar');

  const form = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: '',
      clientId: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      duration: '60',
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
        toast.success(
          t(
            'modals.addMeeting.successMessage',
            '미팅이 성공적으로 예약되었습니다.'
          )
        );
        form.reset();
        onClose();
        navigate('.', { replace: true }); // 페이지 새로고침
      } else {
        throw new Error(t('modals.addMeeting.errorMessage', '미팅 생성 실패'));
      }
    } catch (error) {
      console.error('미팅 생성 중 오류:', error);
      toast.error(
        t('modals.addMeeting.errorMessage', '미팅 생성 중 오류가 발생했습니다.')
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t('modals.addMeeting.title', '새 미팅 예약')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'modals.addMeeting.description',
              '고객과의 미팅을 예약하고 구글 캘린더와 자동 동기화합니다.'
            )}
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
                  <FormLabel>
                    {t('modals.addMeeting.fields.client', '고객 선택')} *
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                          <SelectValue
                            placeholder={t(
                              'modals.addMeeting.placeholders.selectClient',
                              '고객을 선택하세요'
                            )}
                          />
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          <div className="flex items-center gap-2">
                            <span>{client.name}</span>
                            {client.importance === 'high' && (
                              <Badge variant="secondary" className="text-xs">
                                VIP
                              </Badge>
                            )}
                          </div>
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
                  <FormLabel>
                    {t('modals.addMeeting.fields.title', '미팅 제목')} *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        'modals.addMeeting.placeholders.title',
                        '예: 보험 상담'
                      )}
                      {...field}
                    />
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
                    <FormLabel>
                      {t('modals.addMeeting.fields.date', '날짜')} *
                    </FormLabel>
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
                    <FormLabel>
                      {t('modals.addMeeting.fields.time', '시간')} *
                    </FormLabel>
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

            {/* 소요 시간과 미팅 타입 */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('modals.addMeeting.fields.duration', '소요 시간')} *
                    </FormLabel>
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
                        <SelectItem value="30">
                          30{t('modals.addMeeting.durationUnit', '분')}
                        </SelectItem>
                        <SelectItem value="60">
                          1{t('modals.addMeeting.hourUnit', '시간')}
                        </SelectItem>
                        <SelectItem value="90">
                          1{t('modals.addMeeting.hourUnit', '시간')} 30
                          {t('modals.addMeeting.durationUnit', '분')}
                        </SelectItem>
                        <SelectItem value="120">
                          2{t('modals.addMeeting.hourUnit', '시간')}
                        </SelectItem>
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
                    <FormLabel>
                      {t('modals.addMeeting.fields.type', '미팅 타입')}
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
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
            </div>

            {/* 장소 */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('modals.addMeeting.fields.location', '장소')}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t(
                          'modals.addMeeting.placeholders.location',
                          '예: 카페, 사무실, 온라인'
                        )}
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 미팅 설명 */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('modals.addMeeting.fields.description', '미팅 설명')}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        'modals.addMeeting.placeholders.description',
                        '미팅 목적이나 안건을 입력하세요'
                      )}
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 버튼 */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                {t('actions.cancel', '취소')}
              </Button>
              <Button type="submit" className="flex-1">
                {t('modals.addMeeting.submit', '미팅 예약하기')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
