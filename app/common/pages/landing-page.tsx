import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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

// Loader 함수 - 실제 데이터베이스에서 데이터 가져오기
export async function loader() {
  try {
    const [stats, testimonials] = await Promise.all([
      getPublicStats(),
      getPublicTestimonials(),
    ]);

    return {
      stats,
      testimonials,
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
    };
  }
}

// 메타 정보
export function meta() {
  return [
    { title: 'SureCRM - 보험설계사를 위한 소개 네트워크 관리 솔루션' },
    {
      name: 'description',
      content:
        '누가 누구를 소개했는지 시각적으로 체계화하고 소개 네트워크의 힘을 극대화하세요. 보험설계사 전용 CRM 솔루션.',
    },
    {
      name: 'keywords',
      content: '보험설계사, CRM, 소개 네트워크, 고객 관리, 영업 관리',
    },
    {
      property: 'og:title',
      content: 'SureCRM - 보험설계사를 위한 소개 네트워크 관리 솔루션',
    },
    {
      property: 'og:description',
      content:
        '누가 누구를 소개했는지 시각적으로 체계화하고 소개 네트워크의 힘을 극대화하세요.',
    },
    { property: 'og:type', content: 'website' },
  ];
}

export default function LandingPage({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation('landing');
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
