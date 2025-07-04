import { useState, useEffect, useRef } from 'react';
import { useFetcher } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import { Send, XCircle, Info, CheckCircle, Upload } from 'lucide-react';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';
import { cn } from '~/lib/utils';

const getFeedbackSchema = (t: (key: string) => string) =>
  z.object({
    title: z.string().min(1, t('feedback.validation.title_required')),
    category: z.enum(['bug', 'feature', 'general', 'other']),
    message: z.string().min(10, t('feedback.validation.message_min_length')),
    attachmentName: z.string().optional(),
    attachmentData: z.string().optional(),
    attachmentType: z.string().optional(),
  });

type FeedbackFormData = z.infer<ReturnType<typeof getFeedbackSchema>>;

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const { t } = useHydrationSafeTranslation('common');
  const fetcher = useFetcher();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const isSubmitting = fetcher.state === 'submitting';
  const actionData = fetcher.data as
    | { success: boolean; error?: string; message?: string }
    | undefined;

  const feedbackSchema = getFeedbackSchema(t);

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      title: '',
      category: 'general',
      message: '',
    },
  });

  useEffect(() => {
    if (actionData?.success && !isSubmitting) {
      onOpenChange(false);
    }
  }, [actionData, isSubmitting, onOpenChange]);

  useEffect(() => {
    if (!open) {
      form.reset();
      setFileName(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [open, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        form.setValue('attachmentData', result);
        form.setValue('attachmentName', file.name);
        form.setValue('attachmentType', file.type);
      };
      reader.onerror = error => {
        console.error('File reading error:', error);
        setFileName(null);
        form.resetField('attachmentData');
        form.resetField('attachmentName');
        form.resetField('attachmentType');
      };
    } else {
      setFileName(null);
      form.resetField('attachmentData');
      form.resetField('attachmentName');
      form.resetField('attachmentType');
    }
  };

  const categories = [
    { value: 'bug', label: t('feedback.categories.bug') },
    { value: 'feature', label: t('feedback.categories.feature') },
    {
      value: 'general',
      label: t('feedback.categories.general'),
    },
    { value: 'other', label: t('feedback.categories.other') },
  ];

  const onSubmit = (values: FeedbackFormData) => {
    fetcher.submit(values, {
      method: 'post',
      action: '/api/feedback/send',
      encType: 'application/x-www-form-urlencoded', // Base64 is text
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send />
            {t('feedback.title')}
          </DialogTitle>
          <DialogDescription>{t('feedback.description')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              {actionData && !actionData.success && (
                <Alert variant="destructive" className="mb-4">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{actionData.error}</AlertDescription>
                </Alert>
              )}
              {actionData?.success && (
                <Alert
                  variant="default"
                  className="mb-4 bg-green-100 dark:bg-green-900"
                >
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{actionData.message}</AlertDescription>
                </Alert>
              )}
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('feedback.fields.title')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('feedback.placeholders.title')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('feedback.fields.category')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t('feedback.placeholders.category')}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
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
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('feedback.fields.message')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('feedback.placeholders.message')}
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="attachmentData"
                  render={() => (
                    <FormItem>
                      <FormLabel>{t('feedback.fields.attachment')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start text-muted-foreground"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            {fileName || t('feedback.placeholders.attachment')}
                          </Button>
                          <Input
                            ref={fileInputRef}
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept="image/png, image/jpeg, image/gif"
                            onChange={handleFileChange}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t('actions.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Info className="mr-2 h-4 w-4 animate-spin" />
                    {t('actions.submitting')}
                  </>
                ) : (
                  t('actions.submit')
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
