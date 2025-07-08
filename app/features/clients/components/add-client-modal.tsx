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
  CrossCircledIcon,
} from '@radix-ui/react-icons';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';

// 📋 고객 생성 스키마 (Supabase 테이블 구조에 맞춤)
const clientSchema = z.object({
  fullName: z.string().min(1, '이름을 입력하세요'),
  phone: z.string().optional(),
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
    .transform(val => (val === 'none' ? undefined : val)),
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
  const { t } = useHydrationSafeTranslation('pipeline');

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      fullName: '',
      phone: '', // 🔧 빈 문자열로 변경하여 controlled input 유지
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

  const [isCustomTelecom, setIsCustomTelecom] = useState(false);
  const [customTelecomProvider, setCustomTelecomProvider] = useState('');

  // 🔄 모달이 열릴 때마다 폼 상태 완전 초기화
  useEffect(() => {
    if (open) {
      setIsCustomTelecom(false);
      setCustomTelecomProvider('');
      form.reset({
        fullName: '',
        phone: '', // 🔧 빈 문자열로 변경하여 controlled input 유지
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
      // 🌍 직접 입력된 통신사 값 처리
      const finalTelecomProvider = isCustomTelecom
        ? customTelecomProvider.trim()
        : data.telecomProvider;

      // referredById 값 정리
      const cleanedData = {
        ...data,
        telecomProvider: finalTelecomProvider || undefined,
        referredById:
          data.referredById === 'none' ? undefined : data.referredById,
      };

      // 제출 중 상태에서 중복 제출 방지
      if (isSubmitting) {
        return;
      }

      await onSubmit(cleanedData);

      // 성공 시 폼 리셋 및 모달 닫기
      form.reset();
      setIsCustomTelecom(false);
      setCustomTelecomProvider('');
      onOpenChange(false);
    } catch (error) {
      console.error('고객 추가 실패:', error);
      // 에러는 부모 컴포넌트에서 error prop으로 전달되어 표시됨
    }
  };

  const handleClose = () => {
    form.reset();
    setIsCustomTelecom(false);
    setCustomTelecomProvider('');
    onOpenChange(false);
  };

  const importanceOptions = [
    {
      id: 'high',
      name: t('forms.addClient.importanceValues.high', '키맨'),
      description: t(
        'importance.descriptions.high',
        '우선 관리가 필요한 중요 고객'
      ),
      color:
        'bg-orange-50/50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800/30',
    },
    {
      id: 'medium',
      name: t('forms.addClient.importanceValues.medium', '일반'),
      description: t(
        'importance.descriptions.medium',
        '정기적인 관심과 소통이 필요한 고객'
      ),
      color:
        'bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800/30',
    },
    {
      id: 'low',
      name: t('forms.addClient.importanceValues.low', '관심'),
      description: t(
        'importance.descriptions.low',
        '기본 접촉으로 관계를 유지하는 고객'
      ),
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
            <PersonIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            <span className="truncate">
              {t('forms.addClient.title', '신규 고객 추가')}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            {t(
              'forms.addClient.subtitle',
              '새로운 고객 정보를 입력하고 영업 파이프라인에 추가하세요.'
            )}
          </DialogDescription>
        </DialogHeader>

        {/* 콘텐츠 - 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto scrollbar-none modal-scroll-area px-4 sm:px-6 py-2 sm:py-6 space-y-2 sm:space-y-6 min-h-0">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-3 sm:space-y-6"
            >
              {/* 상태 메시지 표시 */}
              {error && (
                <Alert className="bg-destructive/10 border-destructive/20 p-4 sm:p-4 rounded-lg">
                  <CrossCircledIcon className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-xs sm:text-sm text-destructive ml-2">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {isSubmitting && (
                <div className="p-4 sm:p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <InfoCircledIcon className="h-4 w-4 text-primary" />
                    <span className="text-xs sm:text-sm text-primary">
                      {t('actions.saving', '고객 정보를 저장하고 있습니다...')}
                    </span>
                  </div>
                </div>
              )}

              {/* 🏷️ 기본 정보 */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-sm sm:text-base font-medium text-foreground flex items-center gap-2">
                  👤 {t('forms.addClient.sections.basicInfo', '기본 정보')}
                </h4>

                {/* 첫 번째 줄: 고객명 / 소개자 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm font-medium">
                          {t('forms.addClient.fields.fullName', '고객명')} *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t(
                              'forms.addClient.placeholders.fullName',
                              '고객명을 입력하세요'
                            )}
                            className="h-9 sm:h-10 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {referrers && referrers.length > 0 && (
                    <FormField
                      control={form.control}
                      name="referredById"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm font-medium">
                            {t('forms.addClient.fields.referrer', '소개자')}
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]">
                                <SelectValue
                                  placeholder={t(
                                    'forms.addClient.placeholders.referrer',
                                    '소개자를 선택하세요'
                                  )}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent
                              position="popper"
                              className="max-h-60 overflow-y-auto"
                            >
                              <SelectItem
                                value="none"
                                className="text-xs sm:text-sm py-2"
                              >
                                {t(
                                  'forms.addClient.options.noReferrer',
                                  '소개자 없음'
                                )}
                              </SelectItem>
                              {referrers.map(referrer => (
                                <SelectItem
                                  key={referrer.id}
                                  value={referrer.id}
                                  className="text-xs sm:text-sm py-2"
                                >
                                  {referrer.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* 두 번째 줄: 전화번호 / 통신사 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm font-medium">
                          {t('forms.addClient.fields.phone', '전화번호')}{' '}
                          <span className="text-muted-foreground">
                            {t(
                              'forms.addClient.options.optional',
                              '(선택사항)'
                            )}
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder={t(
                              'forms.addClient.placeholders.phone',
                              '010-1234-5678 (선택사항)'
                            )}
                            className="h-9 sm:h-10 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="telecomProvider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm font-medium">
                            {t(
                              'forms.addClient.fields.telecomProvider',
                              '통신사'
                            )}
                          </FormLabel>
                          <Select
                            onValueChange={value => {
                              if (value === 'custom') {
                                setIsCustomTelecom(true);
                                field.onChange(''); // 폼 필드는 비움
                              } else {
                                setIsCustomTelecom(false);
                                setCustomTelecomProvider('');
                                field.onChange(value);
                              }
                            }}
                            value={isCustomTelecom ? 'custom' : field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]">
                                <SelectValue
                                  placeholder={t(
                                    'forms.addClient.placeholders.telecomProvider',
                                    '통신사를 선택하세요'
                                  )}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {telecomProviders.map(provider => (
                                <SelectItem
                                  key={provider}
                                  value={provider}
                                  className="text-xs sm:text-sm py-2"
                                >
                                  {provider}
                                </SelectItem>
                              ))}
                              <SelectItem
                                value="custom"
                                className="text-xs sm:text-sm py-2 font-medium"
                              >
                                🌍{' '}
                                {t(
                                  'forms.addClient.telecom.customInputOption',
                                  '기타 (직접 입력)'
                                )}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* 🌍 직접 입력 필드 (조건부 표시) */}
                    {isCustomTelecom && (
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium text-muted-foreground">
                          {t(
                            'forms.addClient.telecom.customInput',
                            '직접 입력'
                          )}
                        </Label>
                        <Input
                          type="text"
                          placeholder={t(
                            'forms.addClient.telecom.customInputPlaceholder',
                            '통신사명을 직접 입력하세요'
                          )}
                          value={customTelecomProvider}
                          onChange={e =>
                            setCustomTelecomProvider(e.target.value)
                          }
                          className="h-9 sm:h-10 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]"
                        />
                        <p className="text-xs text-muted-foreground">
                          {t(
                            'forms.addClient.telecom.exampleText',
                            '💡 예: Verizon, AT&T, T-Mobile, Vodafone 등'
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 세 번째 줄: 이메일 (전체 너비) */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm font-medium">
                        {t('forms.addClient.fields.email', '이메일')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t(
                            'forms.addClient.placeholders.email',
                            'example@email.com'
                          )}
                          className="h-9 sm:h-10 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* 네 번째 줄: 주소 (전체 너비) */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm font-medium">
                        {t('forms.addClient.fields.address', '주소')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t(
                            'forms.addClient.placeholders.address',
                            '주소를 입력하세요'
                          )}
                          className="h-9 sm:h-10 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* 다섯 번째 줄: 직업 (전체 너비) */}
                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm font-medium">
                        {t('forms.addClient.fields.occupation', '직업')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t(
                            'forms.addClient.placeholders.occupation',
                            '직업을 입력하세요'
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

              {/* 🎯 영업 정보 */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-sm sm:text-base font-medium text-foreground flex items-center gap-2">
                  🎯 {t('forms.addClient.sections.salesInfo', '영업 정보')}
                </h4>

                <FormField
                  control={form.control}
                  name="importance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm font-medium">
                        {t('forms.addClient.fields.importance', '중요도')}
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="space-y-2"
                        >
                          {importanceOptions.map(option => (
                            <Label
                              key={option.id}
                              htmlFor={option.id}
                              className={`p-3 rounded-lg border ${option.color} cursor-pointer hover:bg-muted/20 transition-colors block w-full`}
                            >
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem
                                  value={option.id}
                                  id={option.id}
                                />
                                <div className="flex-1">
                                  <div className="text-xs sm:text-sm font-medium">
                                    {option.name}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {option.description}
                                  </p>
                                </div>
                              </div>
                            </Label>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm font-medium">
                        {t('forms.addClient.fields.tags', '태그')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t(
                            'forms.addClient.placeholders.tags',
                            '태그를 쉼표로 구분하여 입력하세요'
                          )}
                          className="h-9 sm:h-10 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm font-medium">
                        {t('forms.addClient.fields.notes', '메모')}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t(
                            'forms.addClient.placeholders.notes',
                            '고객에 대한 메모를 입력하세요'
                          )}
                          className="text-xs sm:text-sm min-h-[80px] resize-none"
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
              onClick={handleClose}
              className="h-10 px-4 w-full sm:w-auto text-xs sm:text-sm"
            >
              {t('actions.cancel', '취소')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              onClick={form.handleSubmit(handleSubmit)}
              className="gap-2 h-10 px-4 w-full sm:w-auto text-xs sm:text-sm bg-primary text-primary-foreground"
            >
              <PlusIcon className="h-3 w-3" />
              {isSubmitting
                ? t('actions.saving', '추가 중...')
                : t('actions.addClient', '고객 추가')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
