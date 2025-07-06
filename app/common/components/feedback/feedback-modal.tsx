import { useState, useEffect, useRef } from 'react';
import { useFetcher } from 'react-router';
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
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import { Send, XCircle, Info, CheckCircle, Upload } from 'lucide-react';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const { t } = useHydrationSafeTranslation('common');
  const fetcher = useFetcher();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');

  const isSubmitting = fetcher.state === 'submitting';
  const actionData = fetcher.data as
    | { success: boolean; error?: string; message?: string }
    | undefined;

  useEffect(() => {
    if (actionData?.success && !isSubmitting) {
      onOpenChange(false);
      // 폼 리셋
      setTitle('');
      setCategory('general');
      setMessage('');
      setFileName(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [actionData, isSubmitting, onOpenChange]);

  useEffect(() => {
    if (!open) {
      setTitle('');
      setCategory('general');
      setMessage('');
      setFileName(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [open]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert(t('feedback.errors.fileSize'));
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      // Check file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert(t('feedback.errors.fileType'));
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      setFileName(file.name);
    } else {
      setFileName(null);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    // 기본 검증
    if (!title || !category || !message) {
      return;
    }

    fetcher.submit(formData, {
      method: 'post',
      action: '/api/feedback/send',
      encType: 'multipart/form-data',
    });
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

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="space-y-2">
              <Label htmlFor="title">{t('feedback.fields.title')}</Label>
              <Input
                id="title"
                name="title"
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={t('feedback.placeholders.title')}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">{t('feedback.fields.category')}</Label>
              <Select
                name="category"
                value={category}
                onValueChange={setCategory}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('feedback.placeholders.category')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="category" value={category} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">{t('feedback.fields.message')}</Label>
              <Textarea
                id="message"
                name="message"
                required
                rows={6}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={t('feedback.placeholders.message')}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachment">
                {t('feedback.fields.attachment')}
              </Label>
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-muted-foreground"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {fileName || t('feedback.placeholders.attachment')}
                </Button>
                <Input
                  ref={fileInputRef}
                  type="file"
                  name="attachment"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/png, image/jpeg, image/gif"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                />
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
              {t('feedback.buttons.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Info className="mr-2 h-4 w-4 animate-spin" />
                  {t('feedback.buttons.sending')}
                </>
              ) : (
                t('feedback.buttons.send')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
