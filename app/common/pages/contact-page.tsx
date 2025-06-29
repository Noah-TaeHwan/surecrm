import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, useActionData, useNavigation } from 'react-router';
import { LandingLayout } from '~/common/layouts/landing-layout';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import { Textarea } from '~/common/components/ui/textarea';
import { Label } from '~/common/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function ContactPage() {
  const { t } = useTranslation('contact');
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const actionData = useActionData();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === 'submitting';

  // 페이지 하이드레이션
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // 성공 처리 로직
  useEffect(() => {
    if (actionData?.success) {
      setShowSuccess(true);

      // 3초 후에 성공 메시지 숨기고 폼 리셋
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setSelectedType('');

        // 폼 요소들을 리셋
        const form = document.querySelector('form') as HTMLFormElement;
        if (form) {
          form.reset();
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [actionData]);

  // 성공 메시지가 표시되는 동안은 성공 화면만 보여줌
  if (showSuccess && actionData?.success) {
    return (
      <LandingLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-900 mb-2">
                {isHydrated
                  ? t('messages.success')
                  : '문의가 성공적으로 전송되었습니다!'}
              </h2>
              <p className="text-green-700">
                {isHydrated
                  ? t('messages.success_description')
                  : '빠른 시일 내에 답변 드리겠습니다.'}
              </p>
              <div className="mt-4 text-sm text-green-600">
                3초 후 문의하기 페이지로 돌아갑니다...
              </div>
            </div>
          </div>
        </div>
      </LandingLayout>
    );
  }

  return (
    <LandingLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">
            {isHydrated ? t('title') : '문의하기'}
          </h1>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            {isHydrated
              ? t('subtitle')
              : '궁금한 점이나 제안사항이 있으시면 언제든지 연락해주세요'}
          </p>

          <div className="grid md:grid-cols-2 gap-12">
            {/* 연락처 정보 */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">
                  {isHydrated ? t('contact_info.title') : '연락처 정보'}
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-primary">📧</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {isHydrated ? t('contact_info.email.title') : '이메일'}
                      </h3>
                      <p className="text-muted-foreground">
                        {isHydrated
                          ? t('contact_info.email.value')
                          : 'noah@surecrm.pro'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isHydrated
                          ? t('contact_info.email.note')
                          : '평일 9시-18시 내 답변'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-primary">🏢</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {isHydrated
                          ? t('contact_info.business.title')
                          : '사업자 정보'}
                      </h3>
                      <p className="text-muted-foreground">
                        {isHydrated
                          ? t('contact_info.business.name')
                          : 'SureCRM'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isHydrated
                          ? t('contact_info.business.description')
                          : '보험설계사 전용 CRM 솔루션'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-primary">⏰</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {isHydrated
                          ? t('contact_info.support_hours.title')
                          : '지원 시간'}
                      </h3>
                      <p className="text-muted-foreground">
                        {isHydrated
                          ? t('contact_info.support_hours.hours')
                          : '평일 09:00 - 18:00'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isHydrated
                          ? t('contact_info.support_hours.note')
                          : '주말 및 공휴일 제외'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 문의 양식 */}
            <div className="bg-card rounded-lg p-6 sm:p-8 border">
              <h2 className="text-2xl font-bold mb-6">
                {isHydrated ? t('form.title') : '문의 양식'}
              </h2>

              {/* 에러 메시지 표시 (성공 상태가 아닐 때만) */}
              {actionData?.error && !showSuccess && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {actionData.error}
                  </AlertDescription>
                </Alert>
              )}

              <Form
                method="post"
                action="/api/contact/send-email"
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">
                    {isHydrated ? t('form.fields.name.label') : '이름'} *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    disabled={isSubmitting}
                    placeholder={
                      isHydrated
                        ? t('form.fields.name.placeholder')
                        : '성함을 입력해주세요'
                    }
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    {isHydrated ? t('form.fields.email.label') : '이메일'} *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    disabled={isSubmitting}
                    placeholder={
                      isHydrated
                        ? t('form.fields.email.placeholder')
                        : '이메일 주소를 입력해주세요'
                    }
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">
                    {isHydrated ? t('form.fields.company.label') : '회사명'}
                  </Label>
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    disabled={isSubmitting}
                    placeholder={
                      isHydrated
                        ? t('form.fields.company.placeholder')
                        : '회사명을 입력해주세요'
                    }
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inquiryType">
                    {isHydrated
                      ? t('form.fields.inquiry_type.label')
                      : '문의 유형'}
                  </Label>
                  <Select
                    name="inquiryType"
                    value={selectedType}
                    onValueChange={setSelectedType}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="inquiryType" className="w-full">
                      <SelectValue
                        placeholder={
                          isHydrated
                            ? t('form.fields.inquiry_type.placeholder')
                            : '문의 유형을 선택해주세요'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="demo">
                        {isHydrated
                          ? t('form.fields.inquiry_type.options.demo')
                          : '데모 요청'}
                      </SelectItem>
                      <SelectItem value="pricing">
                        {isHydrated
                          ? t('form.fields.inquiry_type.options.pricing')
                          : '요금 문의'}
                      </SelectItem>
                      <SelectItem value="support">
                        {isHydrated
                          ? t('form.fields.inquiry_type.options.support')
                          : '기술 지원'}
                      </SelectItem>
                      <SelectItem value="partnership">
                        {isHydrated
                          ? t('form.fields.inquiry_type.options.partnership')
                          : '파트너십'}
                      </SelectItem>
                      <SelectItem value="other">
                        {isHydrated
                          ? t('form.fields.inquiry_type.options.other')
                          : '기타'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {/* Hidden input for form submission */}
                  <input
                    type="hidden"
                    name="inquiryType"
                    value={selectedType}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">
                    {isHydrated ? t('form.fields.message.label') : '메시지'} *
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    disabled={isSubmitting}
                    placeholder={
                      isHydrated
                        ? t('form.fields.message.placeholder')
                        : '문의 내용을 자세히 적어주세요'
                    }
                    className="w-full resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      전송 중...
                    </>
                  ) : isHydrated ? (
                    t('form.submit')
                  ) : (
                    '문의 보내기'
                  )}
                </Button>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
