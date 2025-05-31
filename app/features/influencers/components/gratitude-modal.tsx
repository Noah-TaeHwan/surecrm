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
import { Badge } from '~/common/components/ui/badge';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/common/components/ui/tooltip';
import {
  CheckIcon,
  HeartIcon,
  CalendarIcon,
  StarIcon,
  PersonIcon,
} from '@radix-ui/react-icons';

// 새로운 타입 시스템 import
import type { InfluencerDisplayData, GratitudeType, GiftType } from '../types';

// 확장된 감사 표현 폼 스키마
const gratitudeSchema = z.object({
  type: z.enum([
    'thank_you_call',
    'thank_you_message',
    'gift_delivery',
    'meal_invitation',
    'event_invitation',
    'holiday_greetings',
    'birthday_wishes',
    'custom',
  ]),
  personalizedMessage: z.string().min(10, '최소 10자 이상 입력해주세요'),
  giftType: z
    .enum([
      'flowers',
      'food_voucher',
      'coffee_voucher',
      'traditional_gift',
      'cash_gift',
      'experience_voucher',
      'custom_gift',
    ])
    .optional(),
  cost: z.string().optional(),
  vendor: z.string().optional(),
  scheduledDate: z.string().optional(),
  isRecurring: z.boolean().optional(),
  specialNotes: z.string().optional(),
});

type GratitudeFormData = z.infer<typeof gratitudeSchema>;

interface GratitudeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedInfluencer: InfluencerDisplayData | null;
  onSubmit: (data: GratitudeFormData & { influencerId: string }) => void;
  isSubmitting?: boolean;
}

// 감사 유형별 정보
const gratitudeTypeOptions = [
  {
    value: 'thank_you_call' as const,
    label: '감사 전화',
    icon: '📞',
    description: '직접 전화로 감사 인사',
  },
  {
    value: 'thank_you_message' as const,
    label: '감사 메시지',
    icon: '💌',
    description: '문자나 메신저로 감사 메시지',
  },
  {
    value: 'gift_delivery' as const,
    label: '선물 배송',
    icon: '🎁',
    description: '감사 선물 직접 전달 또는 배송',
  },
  {
    value: 'meal_invitation' as const,
    label: '식사 초대',
    icon: '🍽️',
    description: '감사 식사 초대',
  },
  {
    value: 'event_invitation' as const,
    label: '행사 초대',
    icon: '🎉',
    description: '특별 행사나 이벤트 초대',
  },
  {
    value: 'holiday_greetings' as const,
    label: '명절 인사',
    icon: '🎊',
    description: '명절이나 특별한 날 인사',
  },
  {
    value: 'birthday_wishes' as const,
    label: '생일 축하',
    icon: '🎂',
    description: '생일 축하 메시지나 선물',
  },
  {
    value: 'custom' as const,
    label: '기타',
    icon: '✨',
    description: '기타 맞춤형 감사 표현',
  },
];

// 선물 유형별 정보
const giftTypeOptions = [
  { value: 'flowers' as const, label: '꽃다발', defaultCost: '50000' },
  { value: 'food_voucher' as const, label: '식사권', defaultCost: '100000' },
  {
    value: 'coffee_voucher' as const,
    label: '커피 상품권',
    defaultCost: '30000',
  },
  {
    value: 'traditional_gift' as const,
    label: '전통 선물',
    defaultCost: '80000',
  },
  { value: 'cash_gift' as const, label: '현금 선물', defaultCost: '100000' },
  {
    value: 'experience_voucher' as const,
    label: '체험 상품권',
    defaultCost: '150000',
  },
  { value: 'custom_gift' as const, label: '기타 선물', defaultCost: '50000' },
];

// 미리 정의된 메시지 템플릿
const messageTemplates = {
  thank_you_call: [
    '{name}님, 소중한 소개 정말 감사드립니다. 덕분에 좋은 인연을 만날 수 있었습니다.',
    '{name}님의 추천으로 새로운 고객분과 좋은 관계를 시작할 수 있었습니다. 진심으로 감사합니다.',
  ],
  thank_you_message: [
    '안녕하세요 {name}님! 지난번 소개해 주신 분과 계약이 성사되었습니다. 정말 감사드려요!',
    '{name}님 덕분에 또 다른 좋은 인연을 만들 수 있었습니다. 항상 감사한 마음으로 기억하겠습니다.',
  ],
  gift_delivery: [
    '평소 감사한 마음을 담아 작은 선물을 보내드립니다. {name}님의 따뜻한 관심에 감사드려요.',
    '소중한 소개에 대한 감사의 마음을 담은 선물입니다. 건강하시고 좋은 일만 가득하세요!',
  ],
  meal_invitation: [
    '{name}님, 평소 감사한 마음을 담아 맛있는 식사 한번 대접하고 싶습니다. 시간 내주시면 감사하겠어요!',
    '소개해 주신 덕분에 좋은 성과가 있었습니다. 감사 인사 겸 식사 한번 대접하고 싶어요.',
  ],
};

export function GratitudeModal({
  isOpen,
  onOpenChange,
  selectedInfluencer,
  onSubmit,
  isSubmitting = false,
}: GratitudeModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const form = useForm<GratitudeFormData>({
    resolver: zodResolver(gratitudeSchema),
    defaultValues: {
      type: 'thank_you_message',
      personalizedMessage: '',
      giftType: undefined,
      cost: '',
      vendor: '',
      scheduledDate: '',
      isRecurring: false,
      specialNotes: '',
    },
  });

  const watchedType = form.watch('type');
  const watchedGiftType = form.watch('giftType');
  const isGiftType = watchedType === 'gift_delivery';

  // 선물 유형 변경 시 기본 비용 설정
  const handleGiftTypeChange = (giftType: GiftType) => {
    const option = giftTypeOptions.find((opt) => opt.value === giftType);
    if (option) {
      form.setValue('cost', option.defaultCost);
    }
  };

  // 템플릿 적용
  const applyTemplate = (template: string) => {
    if (selectedInfluencer) {
      const personalizedTemplate = template.replace(
        /{name}/g,
        selectedInfluencer.name
      );
      form.setValue('personalizedMessage', personalizedTemplate);
      setSelectedTemplate(template);
    }
  };

  const handleSubmit = (data: GratitudeFormData) => {
    if (selectedInfluencer) {
      onSubmit({
        ...data,
        influencerId: selectedInfluencer.id,
      });
      onOpenChange(false);
      form.reset();
      setSelectedTemplate('');
    }
  };

  if (!selectedInfluencer) return null;

  const currentTemplates =
    messageTemplates[watchedType as keyof typeof messageTemplates] || [];

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                {selectedInfluencer.avatar ? (
                  <img
                    src={selectedInfluencer.avatar}
                    alt={selectedInfluencer.name}
                  />
                ) : (
                  <AvatarFallback className="text-lg font-semibold">
                    {selectedInfluencer.name[0]}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <HeartIcon className="h-5 w-5 text-red-500" />
                  {selectedInfluencer.name}님께 감사 표현
                </DialogTitle>
                <DialogDescription>
                  소중한 소개에 대한 감사의 마음을 전하세요
                </DialogDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {selectedInfluencer.tier} 등급
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    관계강도{' '}
                    {selectedInfluencer.relationshipStrength.toFixed(1)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    총 {selectedInfluencer.totalReferrals}건 소개
                  </Badge>
                </div>
              </div>
            </div>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* 감사 유형 선택 */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      감사 표현 유형
                    </FormLabel>
                    <div className="grid grid-cols-2 gap-3">
                      {gratitudeTypeOptions.map((option) => (
                        <div
                          key={option.value}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            field.value === option.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:bg-muted/50'
                          }`}
                          onClick={() => field.onChange(option.value)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{option.icon}</span>
                            <span className="font-medium text-sm">
                              {option.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </FormItem>
                )}
              />

              {/* 선물 정보 (선물 배송 선택 시) */}
              {isGiftType && (
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium flex items-center gap-2">
                    🎁 선물 정보
                  </h4>

                  <FormField
                    control={form.control}
                    name="giftType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>선물 종류</FormLabel>
                        <Select
                          onValueChange={(value: GiftType) => {
                            field.onChange(value);
                            handleGiftTypeChange(value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="선물 종류 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {giftTypeOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label} (예상:{' '}
                                {Number(option.defaultCost).toLocaleString()}원)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>예상 비용</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" placeholder="원" />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vendor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>구매처/업체</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="예: 꽃집, 백화점 등"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* 메시지 템플릿 */}
              {currentTemplates.length > 0 && (
                <div className="space-y-3">
                  <FormLabel className="text-base font-semibold">
                    메시지 템플릿 (선택사항)
                  </FormLabel>
                  <div className="grid gap-2">
                    {currentTemplates.map((template, index) => (
                      <div
                        key={index}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors text-sm ${
                          selectedTemplate === template
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-muted/50'
                        }`}
                        onClick={() => applyTemplate(template)}
                      >
                        {template.replace(/{name}/g, selectedInfluencer.name)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 개인화된 메시지 */}
              <FormField
                control={form.control}
                name="personalizedMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      개인화된 메시지
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="진심어린 감사의 마음을 개인적이고 구체적으로 전해주세요..."
                      />
                    </FormControl>
                    <FormDescription>
                      구체적인 소개 내용이나 개인적인 감사 이유를 포함하면 더욱
                      의미있는 메시지가 됩니다.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 발송 일정 및 옵션 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="scheduledDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        발송 예정일 (선택사항)
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormDescription>
                        비워두면 즉시 발송됩니다
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>특별 메모</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="배송 요청사항, 특이사항 등"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* 미리보기 */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  👀 미리보기
                </h4>
                <div className="text-sm space-y-2">
                  <div>
                    <strong>유형:</strong>{' '}
                    {
                      gratitudeTypeOptions.find(
                        (opt) => opt.value === watchedType
                      )?.label
                    }
                  </div>
                  {isGiftType && watchedGiftType && (
                    <div>
                      <strong>선물:</strong>{' '}
                      {
                        giftTypeOptions.find(
                          (opt) => opt.value === watchedGiftType
                        )?.label
                      }
                    </div>
                  )}
                  <div>
                    <strong>메시지:</strong>{' '}
                    {form.watch('personalizedMessage') ||
                      '메시지를 입력해주세요'}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  취소
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>처리 중...</>
                  ) : (
                    <>
                      <CheckIcon className="mr-2 h-4 w-4" />
                      감사 표현 하기
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
