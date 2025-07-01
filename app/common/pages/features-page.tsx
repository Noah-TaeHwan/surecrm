import React, { useEffect, useState, Suspense } from 'react';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';
import { Link } from 'react-router';
import { LandingLayout } from '~/common/layouts/landing-layout';
import { Button } from '~/common/components/ui/button';
import { ShineBorder } from '~/common/components/magicui/shine-border';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import {
  Users,
  Calendar,
  Phone,
  TrendingUp,
  Target,
  Bell,
  BarChart3,
  PieChart,
  Activity,
  Smartphone,
  FileText,
  Users2,
  Shield,
  Lock,
  Server,
  ArrowRight,
  CheckCircle2,
  Zap,
  Star,
} from 'lucide-react';
import { createServerTranslator } from '~/lib/i18n/language-manager.server';
import type { Route } from './+types/features-page';
import { FeaturesSection, CTASection } from '~/common/components/landing';

// 직접 타입 정의
interface LoaderArgs {
  request: Request;
}

interface MetaArgs {
  data?: {
    meta?: {
      title: string;
      description: string;
    };
  };
}

// Loader function
export async function loader({ request }: LoaderArgs) {
  // 🌍 서버에서 다국어 번역 로드
  try {
    const { t, language } = await createServerTranslator(request, 'features');

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
      // 🌍 SEO 메타 데이터
      seoData: {
        baseUrl,
        detectedLang,
        currentUrl: url.href,
      },
      // 🌍 meta용 번역 데이터
      meta: {
        title: t('meta.title', '기능 소개') + ' | SureCRM',
        description: t(
          'meta.description',
          'SureCRM의 강력한 기능들을 확인해보세요. 보험설계사를 위한 완벽한 CRM 솔루션을 제공합니다.'
        ),
      },
      language,
    };
  } catch (error) {
    console.error('Features page loader 에러:', error);

    // 에러 시 한국어 기본값
    return {
      seoData: {
        baseUrl: 'https://surecrm.pro',
        detectedLang: 'ko',
        currentUrl: 'https://surecrm.pro/features',
      },
      meta: {
        title: '기능 소개 | SureCRM',
        description:
          'SureCRM의 강력한 기능들을 확인해보세요. 보험설계사를 위한 완벽한 CRM 솔루션을 제공합니다.',
      },
      language: 'ko' as const,
    };
  }
}

// 🌍 다국어 메타 정보 - 표준화된 SEO 시스템 사용
export function meta({ data }: MetaArgs) {
  const meta = (data as any)?.meta || {
    title: '기능 소개 | SureCRM',
    description:
      'SureCRM의 강력한 기능들을 확인해보세요. 보험설계사를 위한 완벽한 CRM 솔루션을 제공합니다.',
  };

  return [
    { title: meta.title },
    { name: 'description', content: meta.description },
    { property: 'og:title', content: meta.title },
    { property: 'og:description', content: meta.description },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: meta.title },
    { name: 'twitter:description', content: meta.description },
  ];
}

const iconMap = {
  users: Users,
  calendar: Calendar,
  phone: Phone,
  'trending-up': TrendingUp,
  target: Target,
  bell: Bell,
  'bar-chart': BarChart3,
  'pie-chart': PieChart,
  activity: Activity,
  smartphone: Smartphone,
  'file-text': FileText,
  'users-2': Users2,
  shield: Shield,
  lock: Lock,
  server: Server,
};

export default function FeaturesPage() {
  const { t, isHydrated: ready } = useHydrationSafeTranslation('features');
  const [isHydrated, setIsHydrated] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsHydrated(true);

    // 🔧 타임아웃으로 무한 로딩 방지 (3초 후 강제 렌더링)
    const timeoutId = setTimeout(() => {
      console.warn(
        'Features page: Translation loading timeout, forcing render'
      );
      setIsReady(true);
    }, 3000);

    // ready가 되면 즉시 렌더링
    if (ready) {
      clearTimeout(timeoutId);
      setIsReady(true);
    }

    return () => clearTimeout(timeoutId);
  }, [ready]);

  // 안전한 번역 함수 - 네임스페이스 로딩과 Hydration 체크
  const safeT = (key: string, options?: any): string => {
    if (!isHydrated) return '';
    const result = t(key, options);
    return typeof result === 'string' ? result : '';
  };

  // 안전한 배열 번역 함수
  const safeArrayT = (key: string, fallback: any[] = []) => {
    if (!isHydrated) return fallback;
    const result = t(key, { returnObjects: true });
    return Array.isArray(result) ? result : fallback;
  };

  // 안전한 객체 번역 함수
  const safeObjectT = (key: string, fallback: any = {}) => {
    if (!isHydrated) return fallback;
    const result = t(key, { returnObjects: true });
    return typeof result === 'object' && result !== null ? result : fallback;
  };

  // 🔧 수정된 로딩 조건 - isReady 사용으로 무한 로딩 방지
  if (!isHydrated || !isReady) {
    return (
      <LandingLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <div className="h-12 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded-lg mb-8 animate-pulse"></div>
              {/* 로딩 타임아웃 표시 */}
              <div className="mt-4 text-sm text-muted-foreground">
                기능 소개 페이지를 로드하고 있습니다...
              </div>
            </div>
          </div>
        </div>
      </LandingLayout>
    );
  }

  const categories = safeObjectT('categories', {});
  const security = safeObjectT('security', {});
  const hero = safeObjectT('hero', {});
  const cta = safeObjectT('cta', {});

  return (
    <LandingLayout>
      <div className="min-h-screen">
        {/* Hero Section - 차분한 색상으로 변경 */}
        <section className="relative py-20 bg-gradient-to-br from-background via-muted/20 to-accent/10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge
                variant="outline"
                className="mb-6 text-foreground border-border"
              >
                <Star className="w-4 h-4 mr-2" />
                {safeT('subtitle')}
              </Badge>
              <h1 className="text-5xl font-bold text-foreground mb-6 leading-tight">
                {hero.title?.split('\n').map((line: string, index: number) => (
                  <React.Fragment key={index}>
                    {line}
                    {index === 0 && <br />}
                  </React.Fragment>
                ))}
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                {hero.description}
              </p>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90"
                asChild
              >
                <Link to="/auth/signup">
                  {hero.cta}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Categories - 일관된 색상으로 변경 */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {Object.entries(categories).map(
                ([categoryKey, category]: [string, any], categoryIndex) => (
                  <div
                    key={categoryKey}
                    className={`mb-20 ${categoryIndex !== 0 ? 'pt-20 border-t border-border' : ''}`}
                  >
                    <div className="text-center mb-16">
                      <h2 className="text-3xl font-bold text-foreground mb-4">
                        {category.title}
                      </h2>
                      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        {category.description}
                      </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                      {category.features?.map((feature: any, index: number) => {
                        const IconComponent =
                          iconMap[feature.icon as keyof typeof iconMap] ||
                          Users;
                        return (
                          <Card
                            key={index}
                            className="relative group hover:shadow-lg transition-all duration-300 border bg-card"
                          >
                            <CardHeader className="pb-4">
                              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <IconComponent className="h-6 w-6 text-primary" />
                              </div>
                              <CardTitle className="text-xl font-semibold text-foreground">
                                {feature.title}
                              </CardTitle>
                              <CardDescription className="text-muted-foreground text-base leading-relaxed">
                                {feature.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {feature.highlights?.map(
                                  (
                                    highlight: string,
                                    highlightIndex: number
                                  ) => (
                                    <li
                                      key={highlightIndex}
                                      className="flex items-center text-sm text-muted-foreground"
                                    >
                                      <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                                      {highlight}
                                    </li>
                                  )
                                )}
                              </ul>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* Security Section - 차분한 색상으로 변경 */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  {security.title}
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  {security.description}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {security.features?.map((feature: any, index: number) => {
                  const IconComponent =
                    iconMap[feature.icon as keyof typeof iconMap] || Shield;
                  return (
                    <div key={index} className="text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <IconComponent className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - ShineBorder로 개선 */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="relative overflow-hidden rounded-2xl border border-border p-8 md:p-12 text-center">
                <ShineBorder
                  shineColor={['#A07CFE', '#FE8FB5', '#FFBE7B']}
                  borderWidth={2}
                  duration={8}
                />
                <div className="relative z-10">
                  <h2 className="text-4xl font-bold mb-6 text-foreground">
                    {cta.title}
                  </h2>
                  <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                    {cta.description}
                  </p>
                  <div className="space-y-4">
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
                      asChild
                    >
                      <Link to="/auth/signup">
                        {cta.button}
                        <Zap className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <p className="text-muted-foreground text-sm">{cta.note}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </LandingLayout>
  );
}
