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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/common/components/ui/dialog';
import { CheckCircle2, XCircle, Loader2, Shield } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';

export default function ContactPage() {
  const { t } = useTranslation('contact');
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const actionData = useActionData();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === 'submitting';

  // Cloudflare Turnstile 사이트 키 (개발용 - 실제 배포시 환경변수로 설정)
  const TURNSTILE_SITE_KEY =
    import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

  // 페이지 하이드레이션
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // 성공 처리 로직
  useEffect(() => {
    if (actionData?.success) {
      setShowSuccessModal(true);
    }
  }, [actionData]);

  // 성공 모달 닫기 및 폼 리셋
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setSelectedType('');
    setTurnstileToken(null);

    // 폼 요소들을 리셋
    const form = document.querySelector('form') as HTMLFormElement;
    if (form) {
      form.reset();
    }
  };

  return (
    <LandingLayout>
      <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              {isHydrated ? t('title') : '문의하기'}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              {isHydrated
                ? t('subtitle')
                : '궁금한 점이나 제안사항이 있으시면 언제든지 연락해주세요'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* 연락처 정보 */}
            <div className="space-y-6 lg:space-y-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                  {isHydrated ? t('contact_info.title') : '연락처 정보'}
                </h2>

                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-primary text-sm sm:text-base">
                        📧
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">
                        {isHydrated ? t('contact_info.email.title') : '이메일'}
                      </h3>
                      <p className="text-muted-foreground text-sm sm:text-base">
                        {isHydrated
                          ? t('contact_info.email.value')
                          : 'noah@surecrm.pro'}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {isHydrated
                          ? t('contact_info.email.note')
                          : '평일 9시-18시 내 답변'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-primary text-sm sm:text-base">
                        🏢
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">
                        {isHydrated
                          ? t('contact_info.business.title')
                          : '사업자 정보'}
                      </h3>
                      <p className="text-muted-foreground text-sm sm:text-base">
                        {isHydrated
                          ? t('contact_info.business.name')
                          : 'SureCRM'}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {isHydrated
                          ? t('contact_info.business.description')
                          : '보험설계사 전용 CRM 솔루션'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-primary text-sm sm:text-base">
                        ⏰
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">
                        {isHydrated
                          ? t('contact_info.support_hours.title')
                          : '지원 시간'}
                      </h3>
                      <p className="text-muted-foreground text-sm sm:text-base">
                        {isHydrated
                          ? t('contact_info.support_hours.hours')
                          : '평일 09:00 - 18:00'}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
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
            <div className="bg-card rounded-lg p-4 sm:p-6 lg:p-8 border">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                {isHydrated ? t('form.title') : '문의 양식'}
              </h2>

              {/* 에러 메시지 표시 */}
              {actionData?.error && (
                <Alert className="mb-4 sm:mb-6 border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 text-sm">
                    {actionData.error}
                  </AlertDescription>
                </Alert>
              )}

              <Form
                method="post"
                action="/api/contact/send-email"
                className="space-y-4 sm:space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm sm:text-base">
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
                  <Label htmlFor="email" className="text-sm sm:text-base">
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
                  <Label htmlFor="company" className="text-sm sm:text-base">
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
                  <Label htmlFor="inquiryType" className="text-sm sm:text-base">
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
                  <input
                    type="hidden"
                    name="inquiryType"
                    value={selectedType}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm sm:text-base">
                    {isHydrated ? t('form.fields.message.label') : '메시지'} *
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    disabled={isSubmitting}
                    placeholder={
                      isHydrated
                        ? t('form.fields.message.placeholder')
                        : '문의 내용을 자세히 적어주세요'
                    }
                    className="w-full resize-none"
                  />
                </div>

                {/* Cloudflare Turnstile 캡챠 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-primary" />
                    <Label className="text-sm sm:text-base font-medium">
                      보안 인증
                    </Label>
                  </div>
                  <div className="flex justify-center sm:justify-start">
                    <Turnstile
                      siteKey={TURNSTILE_SITE_KEY}
                      onSuccess={setTurnstileToken}
                      onError={() => setTurnstileToken(null)}
                      onExpire={() => setTurnstileToken(null)}
                      options={{
                        theme: 'light',
                        size: 'normal',
                        language: 'ko',
                      }}
                    />
                  </div>
                  <input
                    type="hidden"
                    name="turnstileToken"
                    value={turnstileToken || ''}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !turnstileToken}
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

                {!turnstileToken && (
                  <p className="text-xs sm:text-sm text-muted-foreground text-center">
                    보안 인증을 완료해주세요
                  </p>
                )}
              </Form>
            </div>
          </div>
        </div>
      </div>

      {/* 성공 모달 */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-green-900">
              {isHydrated
                ? t('messages.success')
                : '문의가 성공적으로 전송되었습니다!'}
            </DialogTitle>
            <DialogDescription className="text-green-700 text-sm sm:text-base">
              {isHydrated
                ? t('messages.success_description')
                : '빠른 시일 내에 답변 드리겠습니다. 감사합니다!'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={handleSuccessModalClose}
              className="w-full sm:w-auto"
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LandingLayout>
  );
}
