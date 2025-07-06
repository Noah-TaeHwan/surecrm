import { Form, useNavigation, useActionData } from 'react-router';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import { Label } from '~/common/components/ui/label';
import { Loader2, Mail, Building } from 'lucide-react';
import type { ActionResponse } from '~/common/pages/landing-page';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';
import { useEffect, useRef, useState } from 'react';

export function InvitationRequestForm() {
  const actionData = useActionData<ActionResponse>();
  const { t } = useHydrationSafeTranslation('landing');
  const navigation = useNavigation();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const isSubmitting = navigation.state === 'submitting';

  useEffect(() => {
    if (actionData?.success) {
      setIsSuccess(true);
      formRef.current?.reset();
    } else {
      setIsSuccess(false);
    }
  }, [actionData]);

  if (isSuccess) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
        <h3 className="text-lg font-semibold text-green-800">
          {t('hero.invitation_form.success_title')}
        </h3>
        <p className="mt-2 text-sm text-green-700">
          {t('hero.invitation_form.success_message')}
        </p>
      </div>
    );
  }

  return (
    <Form method="post" ref={formRef} className="space-y-4">
      <div>
        <Label htmlFor="email" className="sr-only">
          {t('hero.invitation_form.email_label')}
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={t('hero.invitation_form.email_placeholder')}
            required
            className="pl-10 h-12 text-base"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="companyName" className="sr-only">
          {t('hero.invitation_form.company_label')}
        </Label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="companyName"
            name="companyName"
            type="text"
            placeholder={t('hero.invitation_form.company_placeholder')}
            className="pl-10 h-12 text-base"
          />
        </div>
      </div>
      {actionData?.error && (
        <p className="text-sm text-red-500">{actionData.error}</p>
      )}
      <Button
        type="submit"
        className="w-full h-12 text-base"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {t('hero.invitation_form.submit_button')}
      </Button>
    </Form>
  );
}
