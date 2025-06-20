import type { Route } from "./+types/landing-page";
import { LandingLayout } from '~/common/layouts/landing-layout';
import { ScrollProgress } from '~/common/components/magicui/scroll-progress';
import { FloatingNavbar } from '~/common/components/ui/floating-navbar';
import {
  HeroSection,
  FeaturesSection,
  UseCasesSection,
  TestimonialsSection,
  FAQSection,
  CTASection,
} from '~/common/components/landing';
import {
  getPublicStats,
  getPublicTestimonials,
  getFAQs,
  type PublicStats,
  type Testimonial,
} from '~/lib/data/public';

// Loader 함수 - 실제 데이터베이스에서 데이터 가져오기
export async function loader({ request }: Route.LoaderArgs) {
  try {
    const [stats, testimonials, faqs] = await Promise.all([
      getPublicStats(),
      getPublicTestimonials(),
      getFAQs(),
    ]);

    return {
      stats,
      testimonials,
      faqs,
    };
  } catch (error) {
    console.error('랜딩 페이지 데이터 로드 실패:', error);

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
      faqs: [],
    };
  }
}

// 메타 정보
export function meta({ data }: Route.MetaArgs) {
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
};

export default function LandingPage({ loaderData }: Route.ComponentProps) {
  const { stats, testimonials, faqs } = loaderData;

  const navItems = [
    { label: '홈', href: '#hero' },
    { label: '특징', href: '#features' },
    { label: '활용 사례', href: '#use-cases' },
    // { label: '후기', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' },
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
      <FAQSection faqs={faqs} />

      {/* CTA 섹션 */}
      <CTASection />
    </LandingLayout>
  );
}
