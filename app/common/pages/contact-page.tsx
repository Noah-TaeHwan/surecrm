import React, { useEffect, useState, useRef } from 'react';
import { useFetcher } from 'react-router';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';
import type { Route } from './+types/contact-page';
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
import { createServerTranslator } from '~/lib/i18n/language-manager.server';

// 직접 타입 정의
interface LoaderArgs {
  request: Request;
}

interface ActionArgs {
  request: Request;
}

interface MetaArgs {
  data?: {
    meta?: {
      title: string;
      description: string;
    };
    language?: string;
  };
}

// Response utility function
function json(object: any, init?: ResponseInit): Response {
  return new Response(JSON.stringify(object), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
}

// 🌍 Loader 함수 - 다국어 번역 로드
export async function loader({ request }: LoaderArgs) {
  try {
    const { t, language } = await createServerTranslator(request, 'contact');

    return {
      // 🌍 meta용 번역 데이터
      meta: {
        title: t('title', '문의하기') + ' - SureCRM',
        description: t(
          'subtitle',
          '궁금한 점이나 제안사항이 있으시면 언제든지 연락해주세요'
        ),
      },
      language,
    };
  } catch (error) {
    console.error('Contact page loader 에러:', error);

    // 에러 시 한국어 기본값
    return {
      meta: {
        title: '문의하기 - SureCRM',
        description: '궁금한 점이나 제안사항이 있으시면 언제든지 연락해주세요',
      },
      language: 'ko' as const,
    };
  }
}

// 🌍 전문 SEO 메타 정보 - 글로벌 CRM SaaS 최적화
export function meta({ data }: MetaArgs) {
  const meta = data?.meta || {
    title: '문의하기 - SureCRM',
    description:
      'SureCRM에 대한 문의사항을 남겨주세요. 빠른 시일 내에 답변드리겠습니다.',
  };

  const language = data?.language || 'ko';
  const baseUrl = 'https://surecrm.pro';
  const path = '/contact';
  const url =
    language === 'ko' ? `${baseUrl}${path}` : `${baseUrl}/${language}${path}`;

  // 언어별 최적화된 키워드
  const languageKeywords = {
    ko: 'SureCRM 문의, 보험설계사 CRM, 고객관리 솔루션, 데모 요청, 기술지원, 영업관리시스템',
    en: 'SureCRM contact, insurance agent CRM, customer management solution, demo request, technical support, sales management system',
    ja: 'SureCRM お問い合わせ, 保険設計士 CRM, 顧客管理ソリューション, デモ依頼, 技術サポート, 営業管理システム',
  };

  return [
    // 🎯 기본 SEO 태그들 - 보험업계 최적화
    { title: meta.title },
    { name: 'description', content: meta.description },
    {
      name: 'keywords',
      content: languageKeywords[language as keyof typeof languageKeywords],
    },
    { name: 'author', content: 'SureCRM Team' },
    { name: 'robots', content: 'index, follow' },

    // 🌐 Open Graph - 소셜 미디어 최적화
    { property: 'og:title', content: meta.title },
    { property: 'og:description', content: meta.description },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: url },
    { property: 'og:site_name', content: 'SureCRM' },
    {
      property: 'og:locale',
      content:
        language === 'ko' ? 'ko_KR' : language === 'ja' ? 'ja_JP' : 'en_US',
    },
    { property: 'og:image', content: 'https://surecrm.pro/og-contact.png' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },

    // 🐦 Twitter Cards
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: meta.title },
    { name: 'twitter:description', content: meta.description },
    { name: 'twitter:image', content: 'https://surecrm.pro/og-contact.png' },

    // 🔗 Canonical URL
    { tagName: 'link', rel: 'canonical', href: url },

    // 🌍 다국어 대체 링크들
    {
      tagName: 'link',
      rel: 'alternate',
      hrefLang: 'ko',
      href: 'https://surecrm.pro/contact',
    },
    {
      tagName: 'link',
      rel: 'alternate',
      hrefLang: 'en',
      href: 'https://surecrm.pro/en/contact',
    },
    {
      tagName: 'link',
      rel: 'alternate',
      hrefLang: 'ja',
      href: 'https://surecrm.pro/ja/contact',
    },
    {
      tagName: 'link',
      rel: 'alternate',
      hrefLang: 'x-default',
      href: 'https://surecrm.pro/contact',
    },

    // 🏢 LocalBusiness + ContactPoint 구조화된 데이터
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': ['Organization', 'LocalBusiness'],
        name: 'SureCRM',
        url: 'https://surecrm.pro',
        logo: 'https://surecrm.pro/logo-192.png',
        description:
          '보험설계사를 위한 전문 CRM 솔루션. 고객 관계 관리와 영업 효율성을 극대화하세요.',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web Browser',
        // 📞 연락처 정보
        contactPoint: [
          {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            email: 'noah@surecrm.pro',
            availableLanguage: ['Korean', 'English', 'Japanese'],
            areaServed: ['KR', 'US', 'JP'],
            hoursAvailable: {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
              ],
              opens: '09:00',
              closes: '18:00',
              timeZone: 'Asia/Seoul',
            },
          },
          {
            '@type': 'ContactPoint',
            contactType: 'technical support',
            email: 'noah@surecrm.pro',
            availableLanguage: ['Korean', 'English', 'Japanese'],
            areaServed: ['KR', 'US', 'JP'],
          },
          {
            '@type': 'ContactPoint',
            contactType: 'sales',
            email: 'noah@surecrm.pro',
            availableLanguage: ['Korean', 'English', 'Japanese'],
            areaServed: ['KR', 'US', 'JP'],
          },
        ],
        // 🎯 대상 업계
        audience: {
          '@type': 'BusinessAudience',
          audienceType: 'Insurance Agents',
          geographicArea: ['Korea', 'Japan', 'United States'],
        },
        // 💰 서비스 제공
        offers: {
          '@type': 'Offer',
          name: 'SureCRM Pro',
          description: '보험설계사 전용 CRM 솔루션',
          price: '20',
          priceCurrency: 'USD',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: '20',
            priceCurrency: 'USD',
            billingIncrement: 'P1M',
            eligibleQuantity: '1',
          },
          eligibleRegion: ['KR', 'JP', 'US'],
          category: 'SaaS',
        },
        // 🏆 업체 정보
        foundingDate: '2024',
        industry: 'Software',
        numberOfEmployees: '1-10',
        sameAs: [],
        keywords:
          language === 'ko'
            ? '보험설계사, CRM, 고객관리, 영업관리, SaaS, 보험업계'
            : language === 'ja'
              ? '保険設計士, CRM, 顧客管理, 営業管理, SaaS, 保険業界'
              : 'insurance agent, CRM, customer management, sales management, SaaS, insurance industry',
      },
    },

    // 📄 Contact Page 전용 구조화된 데이터
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: meta.title,
        description: meta.description,
        url: url,
        mainEntity: {
          '@type': 'Organization',
          name: 'SureCRM',
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            email: 'noah@surecrm.pro',
            availableLanguage: ['Korean', 'English', 'Japanese'],
          },
        },
      },
    },
  ];
}

export default function ContactPage() {
  const { t } = useHydrationSafeTranslation('contact');
  const fetcher = useFetcher<Route.ActionData>();
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedType, setSelectedType] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const isSubmitting = fetcher.state === 'submitting';
  const actionData = fetcher.data;

  // Cloudflare Turnstile 사이트 키 (개발용 - 실제 배포시 환경변수로 설정)
  const TURNSTILE_SITE_KEY =
    import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

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
    formRef.current?.reset();
  };

  return (
    <LandingLayout>
      <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              {t('title', '문의하기')}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              {t(
                'subtitle',
                '궁금한 점이나 제안사항이 있으시면 언제든지 연락해주세요'
              )}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* 연락처 정보 */}
            <div className="space-y-6 lg:space-y-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                  {t('contact_info.title', '연락처 정보')}
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
                        {t('contact_info.email.title', '이메일')}
                      </h3>
                      <p className="text-muted-foreground text-sm sm:text-base">
                        {t('contact_info.email.value', 'noah@surecrm.pro')}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {t('contact_info.email.note', '평일 9시-18시 내 답변')}
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
                        {t('contact_info.business.title', '사업자 정보')}
                      </h3>
                      <p className="text-muted-foreground text-sm sm:text-base">
                        {t('contact_info.business.name', 'SureCRM')}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {t(
                          'contact_info.business.description',
                          '보험설계사 전용 CRM 솔루션'
                        )}
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
                        {t('contact_info.support_hours.title', '지원 시간')}
                      </h3>
                      <p className="text-muted-foreground text-sm sm:text-base">
                        {t(
                          'contact_info.support_hours.hours',
                          '평일 09:00 - 18:00'
                        )}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {t(
                          'contact_info.support_hours.note',
                          '주말 및 공휴일 제외'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 문의 양식 */}
            <div className="bg-card rounded-lg p-4 sm:p-6 lg:p-8 border">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                {t('form.title', '문의 양식')}
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

              <fetcher.Form
                ref={formRef}
                method="post"
                action="/api/contact"
                className="space-y-4 sm:space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm sm:text-base">
                    {t('form.fields.name.label', '이름')} *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    disabled={isSubmitting}
                    placeholder={t(
                      'form.fields.name.placeholder',
                      '성함을 입력해주세요'
                    )}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm sm:text-base">
                    {t('form.fields.email.label', '이메일')} *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    disabled={isSubmitting}
                    placeholder={t(
                      'form.fields.email.placeholder',
                      '이메일 주소를 입력해주세요'
                    )}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm sm:text-base">
                    {t('form.fields.company.label', '회사명')}
                  </Label>
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    disabled={isSubmitting}
                    placeholder={t(
                      'form.fields.company.placeholder',
                      '회사명을 입력해주세요'
                    )}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inquiryType" className="text-sm sm:text-base">
                    {t('form.fields.inquiry_type.label', '문의 유형')}
                  </Label>
                  <Select
                    name="inquiryType"
                    value={selectedType}
                    onValueChange={setSelectedType}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="inquiryType" className="w-full">
                      <SelectValue
                        placeholder={t(
                          'form.fields.inquiry_type.placeholder',
                          '문의 유형을 선택해주세요'
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="demo">
                        {t(
                          'form.fields.inquiry_type.options.demo',
                          '데모 요청'
                        )}
                      </SelectItem>
                      <SelectItem value="pricing">
                        {t(
                          'form.fields.inquiry_type.options.pricing',
                          '요금 문의'
                        )}
                      </SelectItem>
                      <SelectItem value="support">
                        {t(
                          'form.fields.inquiry_type.options.support',
                          '기술 지원'
                        )}
                      </SelectItem>
                      <SelectItem value="partnership">
                        {t(
                          'form.fields.inquiry_type.options.partnership',
                          '파트너십'
                        )}
                      </SelectItem>
                      <SelectItem value="other">
                        {t('form.fields.inquiry_type.options.other', '기타')}
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
                    {t('form.fields.message.label', '메시지')} *
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    disabled={isSubmitting}
                    placeholder={t(
                      'form.fields.message.placeholder',
                      '문의 내용을 자세히 적어주세요'
                    )}
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
                      {t('form.submitting', '전송 중...')}
                    </>
                  ) : (
                    t('form.submit', '문의 보내기')
                  )}
                </Button>

                {!turnstileToken && (
                  <p className="text-xs sm:text-sm text-muted-foreground text-center">
                    {t('form.security_required', '보안 인증을 완료해주세요')}
                  </p>
                )}
              </fetcher.Form>
            </div>
          </div>
        </div>
      </div>

      {/* 성공 모달 */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <DialogTitle className="text-lg text-green-900 dark:text-green-100">
                  {t('messages.success', '문의가 성공적으로 전송되었습니다!')}
                </DialogTitle>
                <DialogDescription className="text-sm text-green-700 dark:text-green-300">
                  {t(
                    'messages.success_description',
                    '빠른 시일 내에 답변 드리겠습니다. 감사합니다!'
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={handleSuccessModalClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {t('common.confirm', '확인')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 에러 모달 */}
      <Dialog
        open={!!actionData?.error && !actionData.success}
        onOpenChange={
          isSubmitting
            ? undefined
            : () =>
                fetcher.submit(null, { method: 'post', action: '/api/contact' })
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <DialogTitle className="text-lg text-red-900 dark:text-red-100">
                  {t('messages.error', '문의 전송에 실패했습니다.')}
                </DialogTitle>
                <DialogDescription className="text-sm text-red-700 dark:text-red-300">
                  {actionData?.error ||
                    t(
                      'messages.error_description',
                      '잠시 후 다시 시도해주세요.'
                    )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() =>
                fetcher.submit(null, { method: 'post', action: '/api/contact' })
              }
              variant="outline"
              className="w-full border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
            >
              <XCircle className="h-4 w-4 mr-2" />
              {t('common.close', '닫기')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LandingLayout>
  );
}
