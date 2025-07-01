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

// Loader 함수 - 실제 데이터베이스에서 데이터 가져오기
export async function loader({ request }: Route.LoaderArgs) {
  try {
    // 🌍 서버에서 다국어 번역 로드
    const { t, language } = await createServerTranslator(request, 'landing');

    const [stats, testimonials] = await Promise.all([
      getPublicStats(),
      getPublicTestimonials(),
    ]);

    return {
      stats,
      testimonials,
      // 🌍 meta용 번역 데이터
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

// 🌍 다국어 메타 정보
export function meta({ data }: Route.MetaArgs) {
  const meta = data?.meta;

  if (!meta) {
    // 기본값 fallback
    return [
      { title: 'SureCRM - 보험설계사를 위한 소개 네트워크 관리 솔루션' },
      {
        name: 'description',
        content:
          '누가 누구를 소개했는지 시각적으로 체계화하고 소개 네트워크의 힘을 극대화하세요. 보험설계사 전용 CRM 솔루션.',
      },
      { property: 'og:type', content: 'website' },
    ];
  }

  return [
    { title: meta.title },
    {
      name: 'description',
      content: meta.description,
    },
    {
      name: 'keywords',
      content: meta.keywords,
    },
    {
      property: 'og:title',
      content: meta.ogTitle,
    },
    {
      property: 'og:description',
      content: meta.ogDescription,
    },
    { property: 'og:type', content: 'website' },
  ];
}

export default function LandingPage({ loaderData }: Route.ComponentProps) {
  const { t } = useHydrationSafeTranslation('landing');
  // loaderData는 현재 사용하지 않지만 Route.ComponentProps 타입을 위해 유지
  loaderData;
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
