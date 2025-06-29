import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t, ready } = useTranslation('features');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // 안전한 번역 함수 - 네임스페이스 로딩과 Hydration 체크
  const safeT = (key: string, options?: any): string => {
    if (!isHydrated || !ready) return '';
    const result = t(key, options);
    return typeof result === 'string' ? result : '';
  };

  // 안전한 배열 번역 함수
  const safeArrayT = (key: string, fallback: any[] = []) => {
    if (!isHydrated || !ready) return fallback;
    const result = t(key, { returnObjects: true });
    return Array.isArray(result) ? result : fallback;
  };

  // 안전한 객체 번역 함수
  const safeObjectT = (key: string, fallback: any = {}) => {
    if (!isHydrated || !ready) return fallback;
    const result = t(key, { returnObjects: true });
    return typeof result === 'object' && result !== null ? result : fallback;
  };

  if (!isHydrated || !ready) {
    return (
      <LandingLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <div className="h-12 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded-lg mb-8 animate-pulse"></div>
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
