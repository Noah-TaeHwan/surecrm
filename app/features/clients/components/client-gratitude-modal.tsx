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
import {
  CheckIcon,
  Cross2Icon,
  HeartIcon,
  LockClosedIcon,
  PersonIcon,
} from '@radix-ui/react-icons';
import type { ClientDisplay, ClientPrivacyLevel } from '../types';
import { logDataAccess } from '../lib/client-data';

// 🔒 **보안 강화된 감사 표현 스키마**
const gratitudeSchema = z.object({
  type: z.string().min(1, '감사 유형을 선택하세요'),
  message: z.string().min(1, '메시지를 입력하세요'),
  giftType: z.string().optional(),
  scheduledDate: z.string().optional(),
  confidentialityLevel: z.enum([
    'public',
    'restricted',
    'private',
    'confidential',
  ]),
});

type GratitudeFormData = z.infer<typeof gratitudeSchema>;

interface GratitudeRecord {
  id: string;
  clientId: string;
  clientName: string;
  type: string;
  message: string;
  giftType?: string | null;
  sentDate?: string | null;
  scheduledDate?: string | null;
  status: 'scheduled' | 'sent' | 'delivered' | 'failed';
  confidentialityLevel: 'public' | 'restricted' | 'private' | 'confidential';
  createdAt: string;
  createdBy: string;
  deliveryTracking?: {
    carrier?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
  };
  feedback?: {
    received: boolean;
    rating?: number;
    comment?: string;
  };
}

interface ClientGratitudeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: ClientDisplay;
  agentId: string; // 🔒 보안 로깅용
  onGratitudeSent?: (gratitude: GratitudeRecord) => void;
  onDataAccess?: (accessType: string, data: string[]) => void;
}

export function ClientGratitudeModal({
  open,
  onOpenChange,
  client,
  agentId,
  onGratitudeSent,
  onDataAccess,
}: ClientGratitudeModalProps) {
  const [privacyLevel] = useState<ClientPrivacyLevel>(
    client.privacyLevel || 'restricted'
  );

  const form = useForm<GratitudeFormData>({
    resolver: zodResolver(gratitudeSchema),
    defaultValues: {
      type: 'message',
      message: '',
      giftType: '',
      scheduledDate: '',
      confidentialityLevel: 'restricted' as const,
    },
  });

  // 🔒 **데이터 접근 로깅**
  const handleDataAccess = async (accessType: string, dataFields: string[]) => {
    try {
      await logDataAccess(
        client.id,
        agentId,
        'edit' as const,
        dataFields,
        'gratitude_expression'
      );
      onDataAccess?.(accessType, dataFields);
    } catch (error) {
      console.error('Failed to log data access:', error);
    }
  };

  // 🔒 **데이터 마스킹**
  const maskData = (data: string, level: ClientPrivacyLevel = privacyLevel) => {
    if (level === 'confidential' || level === 'private') return '***';
    return data;
  };

  const handleSubmit = async (data: GratitudeFormData) => {
    // 🔒 **보안 로깅**
    await handleDataAccess('gratitude_sent', [
      'type',
      'message',
      'giftType',
      'scheduledDate',
    ]);

    const newGratitude: GratitudeRecord = {
      id: Date.now().toString(),
      clientId: client.id,
      clientName: maskData(client.fullName),
      type: data.type,
      message: data.message,
      giftType: data.giftType || null,
      sentDate: data.scheduledDate
        ? null
        : new Date().toLocaleDateString('ko-KR'),
      scheduledDate: data.scheduledDate || null,
      status: data.scheduledDate ? 'scheduled' : 'sent',
      confidentialityLevel: data.confidentialityLevel,
      createdAt: new Date().toISOString(),
      createdBy: agentId,
      // 배송 추적 (선물인 경우)
      deliveryTracking:
        data.type === 'gift'
          ? {
              carrier: '',
              trackingNumber: '',
              estimatedDelivery: '',
            }
          : undefined,
      // 피드백 수집 준비
      feedback: {
        received: false,
        rating: undefined,
        comment: undefined,
      },
    };

    console.log('🎁 고객에게 감사 표현:', newGratitude);
    onGratitudeSent?.(newGratitude);

    onOpenChange(false);
    form.reset();
  };

  // 🔒 **기밀성 레벨 배지**
  const getConfidentialityBadge = (level?: string) => {
    const badges = {
      public: (
        <Badge variant="outline" className="text-green-600 border-green-600">
          공개
        </Badge>
      ),
      restricted: (
        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
          제한
        </Badge>
      ),
      private: (
        <Badge variant="outline" className="text-orange-600 border-orange-600">
          비공개
        </Badge>
      ),
      confidential: (
        <Badge variant="outline" className="text-red-600 border-red-600">
          기밀
        </Badge>
      ),
    };
    return badges[level as keyof typeof badges] || badges.restricted;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HeartIcon className="h-5 w-5 text-red-500" />
            {maskData(client.fullName)}님께 감사 표현
            {(privacyLevel === 'confidential' ||
              privacyLevel === 'private') && (
              <LockClosedIcon className="h-4 w-4 text-amber-500" />
            )}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            소중한 고객님께 감사의 마음을 전하세요
            {getConfidentialityBadge(privacyLevel)}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>감사 유형 *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="유형 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="message">메시지만</SelectItem>
                      <SelectItem value="gift">선물 + 메시지</SelectItem>
                      <SelectItem value="card">감사 카드</SelectItem>
                      <SelectItem value="digital">디지털 감사장</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('type') === 'gift' && (
              <FormField
                control={form.control}
                name="giftType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>선물 종류</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="선물 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="flower">꽃다발</SelectItem>
                        <SelectItem value="gift_card">상품권</SelectItem>
                        <SelectItem value="fruit">과일바구니</SelectItem>
                        <SelectItem value="coffee">커피 쿠폰</SelectItem>
                        <SelectItem value="cake">케이크</SelectItem>
                        <SelectItem value="wine">와인</SelectItem>
                        <SelectItem value="tea">차 선물세트</SelectItem>
                        <SelectItem value="custom">기타</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>감사 메시지 *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder="진심어린 감사의 마음을 전해주세요..."
                    />
                  </FormControl>
                  <FormDescription>
                    고객님께 보낼 감사 메시지를 작성하세요
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confidentialityLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <PersonIcon className="h-4 w-4" />
                    기밀성 레벨 *
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="public">
                        공개 - 모든 직원이 볼 수 있음
                      </SelectItem>
                      <SelectItem value="restricted">
                        제한 - 팀 내에서만 공유
                      </SelectItem>
                      <SelectItem value="private">
                        비공개 - 관리자와 담당자만
                      </SelectItem>
                      <SelectItem value="confidential">
                        기밀 - 담당자만 접근
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    감사 표현 기록의 공개 범위를 설정하세요
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduledDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>발송 예정일 (선택사항)</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormDescription>비워두면 즉시 발송됩니다</FormDescription>
                </FormItem>
              )}
            />

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
                <HeartIcon className="mr-2 h-4 w-4" />
                감사 표현 하기
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
