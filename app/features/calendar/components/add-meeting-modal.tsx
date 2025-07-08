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
import { CalendarIcon, ClockIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';
import { UserIcon } from 'lucide-react';
import { Badge } from '~/common/components/ui/badge';
import { MapPinIcon } from 'lucide-react';
import { Checkbox } from '~/common/components/ui/checkbox';
import { meetingTypeDetails } from '../types/types';

// 🎯 폼 스키마 - 날짜와 미팅 제목만 필수
const meetingSchema = z
  .object({
    title: z.string().min(1, '미팅 제목을 입력하세요'),
    clientId: z.string().optional(), // 선택 사항으로 변경
    date: z.string().min(1, '날짜를 선택하세요'),
    time: z.string().optional(), // 선택 사항으로 변경
    duration: z.string().optional(), // 선택 사항으로 변경
    type: z.string().optional(), // 선택 사항으로 변경
    location: z.string().optional(),
    description: z.string().optional(),
    priority: z.string().optional(), // 선택 사항으로 변경
    isAllDay: z.boolean().optional(), // 하루 종일 이벤트 필드 추가
  })
  .refine(
    data => {
      // 하루 종일이 아닌 경우에만 시간 필드 검증
      if (!data.isAllDay) {
        return true; // 시간 필드는 선택 사항이므로 항상 통과
      }
      return true;
    },
    {
      message: '하루 종일이 아닌 경우 시간을 설정해주세요',
      path: ['time'],
    }
  );

type MeetingFormData = z.infer<typeof meetingSchema>;

interface Client {
  id: string;
  name: string;
  importance?: 'high' | 'medium' | 'low';
}

interface AddMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  defaultDate?: Date;
  editMode?: boolean;
  editMeetingData?: any; // 수정할 미팅 데이터
}

// 🎯 사이드바 필터와 동일한 미팅 타입 목록 사용 (단순화)
const meetingTypes = Object.entries(meetingTypeDetails)
  .filter(([key]) => !key.startsWith('google')) // 구글 관련 타입 제외
  .map(([key, details]) => ({
    value: key,
    key: `meeting.types.${key}`,
    icon: details.icon,
    label: details.label,
  }));

export function AddMeetingModal({
  isOpen,
  onClose,
  clients,
  defaultDate,
  editMode = false,
  editMeetingData,
}: AddMeetingModalProps) {
  const navigate = useNavigate();
  const { t } = useHydrationSafeTranslation('calendar');

  // 기본 날짜를 설정하여 선택된 날짜로 초기화
  const formatDateForInput = (date: Date) => {
    // 로컬 시간대를 사용하여 YYYY-MM-DD 형식으로 포맷
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 수정 모드일 때 기본값 설정
  const getDefaultValues = () => {
    if (editMode && editMeetingData) {
      return {
        title: editMeetingData.title || '',
        clientId: editMeetingData.client?.id || '',
        date: editMeetingData.date
          ? formatDateForInput(new Date(editMeetingData.date))
          : formatDateForInput(new Date()),
        time: editMeetingData.time || '09:00',
        duration: String(editMeetingData.duration || 60),
        type: editMeetingData.type || '',
        location: editMeetingData.location || '',
        description: editMeetingData.description || '',
        priority: editMeetingData.priority || 'medium',
        isAllDay: !editMeetingData.time, // 시간이 없으면 하루 종일
      };
    }

    return {
      title: '',
      clientId: '',
      date: defaultDate
        ? formatDateForInput(defaultDate)
        : formatDateForInput(new Date()),
      time: '09:00',
      duration: '60',
      type: '',
      location: '',
      description: '',
      priority: 'medium',
      isAllDay: false,
    };
  };

  const form = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: getDefaultValues(),
  });

  // 하루 종일 상태 감시하여 시간 필드 초기화
  const isAllDay = form.watch('isAllDay');
  React.useEffect(() => {
    if (isAllDay) {
      form.setValue('time', '');
      form.setValue('duration', '');
    } else {
      // 하루 종일 해제 시 기본값 설정
      if (!form.getValues('time')) {
        form.setValue('time', '09:00');
      }
      if (!form.getValues('duration')) {
        form.setValue('duration', '60');
      }
    }
  }, [isAllDay, form]);

  // defaultDate가 변경될 때 폼의 날짜 필드를 업데이트
  React.useEffect(() => {
    if (defaultDate) {
      form.setValue('date', formatDateForInput(defaultDate));
    }
  }, [defaultDate, form]);

  const handleSubmit = async (data: MeetingFormData) => {
    try {
      // Form 제출을 위한 데이터 준비
      const formData = new FormData();

      // 수정 모드인지 생성 모드인지에 따라 actionType 결정
      formData.append(
        'actionType',
        editMode ? 'updateMeeting' : 'createMeeting'
      );

      // 수정 모드일 때는 meetingId 추가
      if (editMode && editMeetingData?.id) {
        formData.append('meetingId', editMeetingData.id);
      }

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // 하루 종일 이벤트인 경우 시간 관련 필드 제외
          if (data.isAllDay && (key === 'time' || key === 'duration')) {
            return;
          }
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
          editMode
            ? '미팅이 성공적으로 수정되었습니다.'
            : t(
                'modals.addMeeting.successMessage',
                '미팅이 성공적으로 예약되었습니다.'
              )
        );
        form.reset();
        onClose();
        navigate('.', { replace: true }); // 페이지 새로고침
      } else {
        throw new Error(
          editMode
            ? '미팅 수정 실패'
            : t('modals.addMeeting.errorMessage', '미팅 생성 실패')
        );
      }
    } catch (error) {
      console.error(
        editMode ? '미팅 수정 중 오류:' : '미팅 생성 중 오류:',
        error
      );
      toast.error(
        editMode
          ? '미팅 수정 중 오류가 발생했습니다.'
          : t(
              'modals.addMeeting.errorMessage',
              '미팅 생성 중 오류가 발생했습니다.'
            )
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent
        className="sm:max-w-xl w-[95vw] p-0 overflow-hidden flex flex-col sm:max-h-[85vh] gap-0"
        style={{
          maxHeight: '75vh',
          height: 'auto',
          minHeight: '0',
        }}
      >
        {/* 헤더 - 고정 */}
        <DialogHeader className="flex-shrink-0 px-4 sm:px-6 py-4 sm:py-4 border-b border-border/30">
          <DialogTitle className="flex items-center gap-2 text-sm sm:text-lg">
            <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            <span className="truncate">
              {editMode
                ? '미팅 수정'
                : t('modals.addMeeting.title', '새 미팅 예약')}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            {editMode
              ? '미팅 정보를 수정합니다.'
              : t(
                  'modals.addMeeting.description',
                  '새로운 미팅을 예약하고 고객과 일정을 관리하세요.'
                )}
          </DialogDescription>
        </DialogHeader>

        {/* 콘텐츠 - 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto scrollbar-none modal-scroll-area px-4 sm:px-6 py-2 sm:py-6 space-y-2 sm:space-y-6 min-h-0">
          <Form {...form}>
            <form
              id="meeting-form"
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-3 sm:space-y-6"
            >
              {/* 🏷️ 기본 정보 */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-sm sm:text-base font-medium text-foreground flex items-center gap-2">
                  👤 {t('modals.addMeeting.sections.basicInfo', '기본 정보')}
                </h4>

                {/* 고객 선택 */}
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm font-medium">
                        {t('modals.addMeeting.fields.client', '고객 선택')} *
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full h-9 sm:h-10 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]">
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
                        <SelectContent
                          position="popper"
                          className="max-h-60 overflow-y-auto"
                        >
                          {clients.map(client => (
                            <SelectItem key={client.id} value={client.id}>
                              <div className="flex items-center gap-2">
                                <span>{client.name}</span>
                                {client.importance === 'high' && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    VIP
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* 미팅 제목 */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm font-medium">
                        {t('modals.addMeeting.fields.title', '미팅 제목')} *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t(
                            'modals.addMeeting.placeholders.title',
                            '예: 보험 상담'
                          )}
                          className="h-9 sm:h-10 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* 📅 일정 정보 */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-sm sm:text-base font-medium text-foreground flex items-center gap-2">
                  📅 {t('modals.addMeeting.sections.scheduleInfo', '일정 정보')}
                </h4>

                {/* 날짜와 하루 종일 옵션 */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm font-medium">
                        {t('modals.addMeeting.fields.date', '날짜')} *
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="date"
                            className="pl-10 h-9 sm:h-10 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* 하루 종일 옵션 */}
                <FormField
                  control={form.control}
                  name="isAllDay"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-xs sm:text-sm font-medium">
                          {t('modals.addMeeting.fields.allDay', '하루 종일')}
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {/* 시간 및 소요 시간 (하루 종일이 아닐 때만 표시) */}
                {!form.watch('isAllDay') && (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm font-medium">
                            {t('modals.addMeeting.fields.time', '시간')}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <ClockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="time"
                                className="pl-10 h-9 sm:h-10 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm font-medium">
                            {t(
                              'modals.addMeeting.fields.duration',
                              '소요 시간'
                            )}
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full h-9 sm:h-10 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]">
                                <SelectValue
                                  placeholder={t(
                                    'modals.addMeeting.placeholders.duration',
                                    '소요 시간을 선택하세요'
                                  )}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="15">
                                15{t('modals.addMeeting.durationUnit', '분')}
                              </SelectItem>
                              <SelectItem value="30">
                                30{t('modals.addMeeting.durationUnit', '분')}
                              </SelectItem>
                              <SelectItem value="45">
                                45{t('modals.addMeeting.durationUnit', '분')}
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
                              <SelectItem value="150">
                                2{t('modals.addMeeting.hourUnit', '시간')} 30
                                {t('modals.addMeeting.durationUnit', '분')}
                              </SelectItem>
                              <SelectItem value="180">
                                3{t('modals.addMeeting.hourUnit', '시간')}
                              </SelectItem>
                              <SelectItem value="240">
                                4{t('modals.addMeeting.hourUnit', '시간')}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* 📋 상세 정보 */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-sm sm:text-base font-medium text-foreground flex items-center gap-2">
                  📋 {t('modals.addMeeting.sections.detailInfo', '상세 정보')}
                </h4>

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm font-medium">
                        {t('modals.addMeeting.fields.type', '미팅 타입')}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full h-9 sm:h-10 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]">
                            <SelectValue
                              placeholder={t(
                                'modals.addMeeting.placeholders.type',
                                '미팅 타입을 선택하세요'
                              )}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px]">
                          {meetingTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{type.icon}</span>
                                <span className="font-medium">
                                  {t(type.key, type.label)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* 중요도 */}
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm font-medium">
                        {t('modals.addMeeting.fields.priority', '중요도')}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full h-9 sm:h-10 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]">
                            <SelectValue
                              placeholder={t(
                                'modals.addMeeting.placeholders.priority',
                                '중요도를 선택하세요'
                              )}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">
                            <span className="flex items-center gap-2">
                              <span>⚪</span>
                              <span>{t('priority.low', '낮음')}</span>
                            </span>
                          </SelectItem>
                          <SelectItem value="medium">
                            <span className="flex items-center gap-2">
                              <span>🔵</span>
                              <span>{t('priority.medium', '보통')}</span>
                            </span>
                          </SelectItem>
                          <SelectItem value="high">
                            <span className="flex items-center gap-2">
                              <span>🟠</span>
                              <span>{t('priority.high', '높음')}</span>
                            </span>
                          </SelectItem>
                          <SelectItem value="urgent">
                            <span className="flex items-center gap-2">
                              <span>🔴</span>
                              <span>{t('priority.urgent', '긴급')}</span>
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* 장소 */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm font-medium">
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
                            className="pl-10 h-9 sm:h-10 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* 미팅 설명 */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm font-medium">
                        {t('modals.addMeeting.fields.description', '미팅 설명')}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t(
                            'modals.addMeeting.placeholders.description',
                            '미팅 목적이나 안건을 입력하세요'
                          )}
                          className="resize-none text-xs sm:text-sm min-h-[80px]"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>

        {/* 푸터 - 고정 */}
        <DialogFooter className="flex-shrink-0 gap-2 sm:gap-3 p-2 sm:p-6 border-t border-border/30">
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 px-4 w-full sm:w-auto text-xs sm:text-sm"
            >
              {t('actions.cancel', '취소')}
            </Button>
            <Button
              type="submit"
              form="meeting-form"
              className="gap-2 h-10 px-4 w-full sm:w-auto text-xs sm:text-sm bg-primary text-primary-foreground"
            >
              <CalendarIcon className="h-3 w-3" />
              {t('modals.addMeeting.submit', '미팅 예약하기')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
