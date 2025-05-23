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
import { CheckIcon, Cross2Icon, HeartIcon } from '@radix-ui/react-icons';
import type { Client } from './types';

// 감사 표현 폼 스키마
const gratitudeSchema = z.object({
  type: z.string().min(1, '감사 유형을 선택하세요'),
  message: z.string().min(1, '메시지를 입력하세요'),
  giftType: z.string().optional(),
  scheduledDate: z.string().optional(),
});

type GratitudeFormData = z.infer<typeof gratitudeSchema>;

interface ClientGratitudeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client;
  onGratitudeSent?: (gratitude: any) => void;
}

export function ClientGratitudeModal({
  open,
  onOpenChange,
  client,
  onGratitudeSent,
}: ClientGratitudeModalProps) {
  const form = useForm<GratitudeFormData>({
    resolver: zodResolver(gratitudeSchema),
    defaultValues: {
      type: 'message',
      message: '',
      giftType: '',
      scheduledDate: '',
    },
  });

  const handleSubmit = (data: GratitudeFormData) => {
    const newGratitude = {
      id: Date.now().toString(),
      clientId: client.id,
      clientName: client.name,
      type: data.type,
      message: data.message,
      giftType: data.giftType || null,
      sentDate: data.scheduledDate
        ? null
        : new Date().toLocaleDateString('ko-KR'),
      scheduledDate: data.scheduledDate || null,
      status: data.scheduledDate ? 'scheduled' : 'sent',
      createdAt: new Date().toISOString(),
    };

    console.log('고객에게 감사 표현:', newGratitude);
    onGratitudeSent?.(newGratitude);

    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HeartIcon className="h-5 w-5 text-red-500" />
            {client.name}님께 감사 표현
          </DialogTitle>
          <DialogDescription>
            소중한 고객님께 감사의 마음을 전하세요
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
