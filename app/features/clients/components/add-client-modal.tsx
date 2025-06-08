import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '~/common/components/ui/dialog';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import { Textarea } from '~/common/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Label } from '~/common/components/ui/label';
import { Badge } from '~/common/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/common/components/ui/form';
import { RadioGroup, RadioGroupItem } from '~/common/components/ui/radio-group';
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import {
  PlusIcon,
  PersonIcon,
  InfoCircledIcon,
  CheckCircledIcon,
  CrossCircledIcon,
} from '@radix-ui/react-icons';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// 📋 고객 생성 스키마 (Supabase 테이블 구조에 맞춤)
const clientSchema = z.object({
  fullName: z.string().min(1, '이름을 입력하세요'),
  phone: z.string().min(1, '전화번호를 입력하세요'),
  email: z
    .string()
    .email('올바른 이메일 형식이 아닙니다')
    .optional()
    .or(z.literal('')),
  telecomProvider: z.string().optional(),
  address: z.string().optional(),
  occupation: z.string().optional(),
  importance: z.enum(['high', 'medium', 'low']),
  referredById: z
    .string()
    .optional()
    .transform((val) => (val === 'none' ? undefined : val)),
  tags: z.string().optional(),
  notes: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface AddClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ClientFormData) => Promise<void>;
  isSubmitting?: boolean;
  error?: string | null;
  referrers?: Array<{ id: string; name: string }>; // 소개자 후보 목록
}

export function AddClientModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  error,
  referrers,
}: AddClientModalProps) {
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      telecomProvider: '',
      address: '',
      occupation: '',
      importance: 'medium',
      referredById: '',
      tags: '',
      notes: '',
    },
  });

  // 🔄 모달이 열릴 때마다 폼 상태 완전 초기화
  useEffect(() => {
    if (open) {
      form.reset({
        fullName: '',
        phone: '',
        email: '',
        telecomProvider: '',
        address: '',
        occupation: '',
        importance: 'medium',
        referredById: '',
        tags: '',
        notes: '',
      });
    }
  }, [open, form]);

  const handleSubmit = async (data: ClientFormData) => {
    try {
      // referredById 값 정리
      const cleanedData = {
        ...data,
        referredById:
          data.referredById === 'none' ? undefined : data.referredById,
      };
      await onSubmit(cleanedData);
      // 성공 시 redirect되므로 모달을 수동으로 닫지 않음
      // 에러 시에는 모달이 열려있어야 에러 메시지를 볼 수 있음
    } catch (error) {
      console.error('고객 추가 실패:', error);
    }
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const importanceOptions = [
    {
      id: 'high',
      name: '키맨',
      description: '우선 관리가 필요한 중요 고객',
      color:
        'bg-orange-50/50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800/30',
    },
    {
      id: 'medium',
      name: '일반',
      description: '정기적인 관심과 소통이 필요한 고객',
      color:
        'bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800/30',
    },
    {
      id: 'low',
      name: '관심',
      description: '기본 접촉으로 관계를 유지하는 고객',
      color:
        'bg-muted/30 border-muted-foreground/20 dark:bg-muted/10 dark:border-muted-foreground/20',
    },
  ];

  const telecomProviders = [
    'SKT',
    'KT',
    'LG U+',
    '알뜰폰 SKT',
    '알뜰폰 KT',
    '알뜰폰 LG U+',
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-bold">
            <PersonIcon className="h-5 w-5" />새 고객 추가
          </DialogTitle>
          <DialogDescription>
            새로운 고객 정보를 입력하여 관리를 시작하세요.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* 상태 메시지 표시 */}
            {error && (
              <Alert className="bg-red-50 border-red-200">
                <CrossCircledIcon className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {isSubmitting && (
              <Alert className="bg-blue-50 border-blue-200">
                <InfoCircledIcon className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  고객 정보를 저장하고 있습니다...
                </AlertDescription>
              </Alert>
            )}

            {/* 기본 정보 */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">기본 정보</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이름</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="고객 이름"
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>전화번호</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="010-1234-5678"
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이메일 (선택사항)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="example@email.com"
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telecomProvider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>통신사 (선택사항)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="통신사 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {telecomProviders.map((provider) => (
                            <SelectItem key={provider} value={provider}>
                              {provider}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 소개자 선택 */}
              {referrers && referrers.length > 0 && (
                <FormField
                  control={form.control}
                  name="referredById"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>소개자 (선택사항)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="소개자 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">
                            직접 개발 (소개자 없음)
                          </SelectItem>
                          {referrers.map((referrer) => (
                            <SelectItem key={referrer.id} value={referrer.id}>
                              {referrer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>주소 (선택사항)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="서울시 강남구 역삼동"
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="occupation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>직업 (선택사항)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="회사원, 자영업자 등"
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 고객 중요도 선택 */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">고객 중요도</h4>

              <FormField
                control={form.control}
                name="importance"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="space-y-2"
                      >
                        {importanceOptions.map((option) => (
                          <Label
                            key={option.id}
                            htmlFor={option.id}
                            className={`flex items-center space-x-3 rounded-lg border-2 p-3 cursor-pointer transition-all duration-200 ${
                              field.value === option.id
                                ? `${option.color} border-opacity-100`
                                : 'border-border hover:border-primary/20 hover:bg-primary/5'
                            }`}
                          >
                            <RadioGroupItem value={option.id} id={option.id} />
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {option.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {option.description}
                              </div>
                            </div>
                          </Label>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 태그 및 메모 */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>태그 (선택사항)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="키맨, 기업고객, 잠재고객 등 (쉼표로 구분)"
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>메모 (선택사항)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="고객에 대한 메모사항을 입력하세요"
                        rows={3}
                        className="resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 서비스 연계 안내 */}
            <Alert className="bg-muted/20">
              <InfoCircledIcon className="h-4 w-4" />
              <AlertDescription className="text-sm">
                등록된 고객은 일정 관리, 소개 네트워크, 대시보드 등 모든
                서비스에서 활용됩니다.
              </AlertDescription>
            </Alert>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>처리 중...</>
                ) : (
                  <>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    고객 추가하기
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
