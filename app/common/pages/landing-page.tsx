import { useState, useEffect } from 'react';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';
import type { Route } from './+types/landing-page';
import { LandingLayout } from '~/common/layouts/landing-layout';
import { ScrollProgress } from '~/common/components/magicui/scroll-progress';
import { FloatingNavbar } from '~/common/components/ui/floating-navbar';
import {
  HeroSection,
  FeaturesSection,
  UseCasesSection,
  FAQSection,
  CTASection,
} from '~/common/components/landing';
import {
  getPublicStats,
  getPublicTestimonials,
  type PublicStats,
  type Testimonial,
} from '~/lib/data/public';
import { createServerTranslator } from '~/lib/i18n/language-manager.server';
import { z } from 'zod';
import { createServerClient } from '~/lib/core/supabase';

// Zod 스키마: 오류 메시지 대신 오류 키를 반환하도록 수정
const WaitlistSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'error_required' })
    .email({ message: 'error_invalid' }),
  companyName: z.string().optional(),
});

export type ActionResponse = {
  success: boolean;
  error?: string;
};

function json(data: ActionResponse, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      ...init?.headers,
      'Content-Type': 'application/json',
    },
  });
}

// Action 함수 - 초대장 신청 처리
export async function action({ request }: Route.ActionArgs) {
  const { t } = await createServerTranslator(request, 'landing');
  const formData = await request.formData();
  const submission = WaitlistSchema.safeParse({
    email: formData.get('email'),
    companyName: formData.get('companyName'),
  });

  // 유효성 검사 실패
  if (!submission.success) {
    const errorKey =
      submission.error.flatten().fieldErrors.email?.[0] || 'error_generic';
    const errorMessage = t(`hero.invitation_form.${errorKey}`);
    return json({ success: false, error: errorMessage }, { status: 400 });
  }

  const { email, companyName } = submission.data;
  const supabase = createServerClient(request);

  // 바로 INSERT 시도하고, 에러 코드로 중복 처리
  const { error: insertError } = await supabase
    .from('public_site_waitlist')
    .insert({ email, company_name: companyName });

  if (insertError) {
    // 23505: unique_violation (중복 키)
    if (insertError.code === '23505') {
      const errorMessage = t('hero.invitation_form.error_duplicate');
      return json({ success: false, error: errorMessage }, { status: 409 });
    }

    // 그 외 서버 오류
    console.error('Error inserting into waitlist:', insertError);
    const errorMessage = t('hero.invitation_form.error_server');
    return json({ success: false, error: errorMessage }, { status: 500 });
  }

  return json({ success: true });
}

// Loader 함수 - 실제 데이터베이스에서 데이터 가져오기
export async function loader({ request }: Route.LoaderArgs) {
  try {
    // 🌍 서버에서 다국어 번역 로드
    const { t, language } = await createServerTranslator(request, 'landing');

    const [stats, testimonials] = await Promise.all([
      getPublicStats(),
      getPublicTestimonials(),
    ]);

    // SEO 데이터 준비
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    // 언어 감지 (Accept-Language 헤더 또는 기본값)
    const acceptLanguage = request.headers.get('Accept-Language') || 'ko';
    const detectedLang = acceptLanguage.includes('ja')
      ? 'ja'
      : acceptLanguage.includes('en')
        ? 'en'
        : 'ko';

    return {
      stats,
      testimonials,
      // 🌍 SEO 메타 데이터
      seoData: {
        baseUrl,
        detectedLang,
        currentUrl: url.href,
      },
      // 🌍 meta용 번역 데이터 (호환성을 위해 유지)
      meta: {
        title: t(
          'meta.title',
          'SureCRM - 보험설계사를 위한 소개 네트워크 관리 솔루션'
        ),
        description: t(
          'meta.description',
          '누가 누구를 소개했는지 시각적으로 체계화하고 소개 네트워크의 힘을 극대화하세요. 보험설계사 전용 CRM 솔루션.'
        ),
        keywords: t(
          'meta.keywords',
          '보험설계사, CRM, 소개 네트워크, 고객 관리, 영업 관리'
        ),
        ogTitle: t(
          'meta.og_title',
          'SureCRM - 보험설계사를 위한 소개 네트워크 관리 솔루션'
        ),
        ogDescription: t(
          'meta.og_description',
          '누가 누구를 소개했는지 시각적으로 체계화하고 소개 네트워크의 힘을 극대화하세요.'
        ),
      },
      language,
    };
  } catch (error) {
    console.error('landing:errors.loading_failed', error);

    // 에러 시 기본값 반환
    return {
      stats: {
        totalUsers: 1250,
        totalTeams: 85,
        totalClients: 3200,
        totalInvitations: 450,
        avgEfficiencyIncrease: 32,
        successRate: 89,
      } as PublicStats,
      testimonials: [] as Testimonial[],
      // 🌍 SEO 메타 데이터 (에러 시 기본값)
      seoData: {
        baseUrl: 'https://surecrm.pro',
        detectedLang: 'ko',
        currentUrl: 'https://surecrm.pro',
      },
      // 🌍 에러 시 한국어 기본값
      meta: {
        title: 'SureCRM - 보험설계사를 위한 소개 네트워크 관리 솔루션',
        description:
          '누가 누구를 소개했는지 시각적으로 체계화하고 소개 네트워크의 힘을 극대화하세요. 보험설계사 전용 CRM 솔루션.',
        keywords: '보험설계사, CRM, 소개 네트워크, 고객 관리, 영업 관리',
        ogTitle: 'SureCRM - 보험설계사를 위한 소개 네트워크 관리 솔루션',
        ogDescription:
          '누가 누구를 소개했는지 시각적으로 체계화하고 소개 네트워크의 힘을 극대화하세요.',
      },
      language: 'ko' as const,
    };
  }
}

// 🌍 다국어 메타 정보 - 표준화된 SEO 시스템 사용
export function meta({ data }: Route.MetaArgs) {
  // 동적 import 대신 직접 구현으로 우선 처리
  const fallbackMeta = data?.meta || {
    title: 'SureCRM - 보험설계사를 위한 소개 네트워크 관리 솔루션',
    description:
      '누가 누구를 소개했는지 시각적으로 체계화하고 소개 네트워크의 힘을 극대화하세요. 보험설계사 전용 CRM 솔루션.',
    keywords: '보험설계사, CRM, 소개 네트워크, 고객 관리, 영업 관리',
  };

  // 기본 SEO 태그들 (빌드 에러 수정을 위한 단순화)
  return [
    { title: fallbackMeta.title },
    { name: 'description', content: fallbackMeta.description },
    { name: 'keywords', content: fallbackMeta.keywords },
    { property: 'og:title', content: fallbackMeta.title },
    { property: 'og:description', content: fallbackMeta.description },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'SureCRM' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: fallbackMeta.title },
    { name: 'twitter:description', content: fallbackMeta.description },
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'SureCRM',
        description: fallbackMeta.description,
        url: 'https://surecrm.pro',
      },
    },
  ];
}

export default function LandingPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { t } = useHydrationSafeTranslation('landing');
  // loaderData, actionData는 현재 사용하지 않지만 Route.ComponentProps 타입을 위해 유지
  loaderData;
  actionData;
  const [isHydrated, setIsHydrated] = useState(false);

  // 🎯 Hydration 완료 감지 (SSR/CSR mismatch 방지)
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const navItems = [
    { label: isHydrated ? t('nav.home') : '홈', href: '#hero' },
    { label: isHydrated ? t('nav.features') : '특징', href: '#features' },
    {
      label: isHydrated ? t('nav.use_cases') : '활용 사례',
      href: '#use-cases',
    },
    // { label: isHydrated ? t('nav.testimonials') : '후기', href: '#testimonials' },
    { label: isHydrated ? t('nav.faq') : 'FAQ', href: '#faq' },
  ];

  return (
    <LandingLayout>
      <ScrollProgress />
      <FloatingNavbar items={navItems} />

      {/* 히어로 섹션 */}
      <HeroSection />

      {/* 주요 특징 섹션 */}
      <FeaturesSection />

      {/* 활용 사례 탭 섹션 */}
      <UseCasesSection />

      {/* 테스티모니얼 섹션 */}
      {/* <TestimonialsSection stats={stats} testimonials={testimonials} /> */}

      {/* FAQ 섹션 */}
      <FAQSection />

      {/* CTA 섹션 */}
      <CTASection />
    </LandingLayout>
  );
}
