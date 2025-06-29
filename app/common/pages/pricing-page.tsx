import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LandingLayout } from '~/common/layouts/landing-layout';
import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import {
  Crown,
  Star,
  Calendar,
  Check,
  ArrowRight,
  Users,
  BarChart3,
  Zap,
  Shield,
  PhoneCall,
  FileText,
  Bell,
  Settings2,
} from 'lucide-react';

export default function PricingPage() {
  const { t, ready } = useTranslation('pricing');
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
  const safeArrayT = (key: string, fallback: Array<any>) => {
    if (!isHydrated || !ready) return fallback;
    const result = t(key, { returnObjects: true });
    return Array.isArray(result) ? result : fallback;
  };

  // 아이콘 매핑
  const iconMap = {
    users: Users,
    chart: BarChart3,
    zap: Zap,
    shield: Shield,
    phone: PhoneCall,
    file: FileText,
    bell: Bell,
    settings: Settings2,
  };

  // 핵심 기능 아이콘
  const coreFeatures = safeArrayT('features.list', []).map(
    (feature: any, index: number) => {
      const IconComponent =
        iconMap[feature.icon as keyof typeof iconMap] || Users;
      return {
        ...feature,
        icon: IconComponent,
        id: index,
      };
    }
  );

  // 예정 기능들
  const upcomingFeatures = safeArrayT('upcoming.list', []);

  // 혜택 목록
  const benefits = safeArrayT('benefits.list', []);

  return (
    <LandingLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* 헤더 섹션 */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">
              {safeT('title') || '요금제'}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              {safeT('subtitle') ||
                'SureCRM Pro로 비즈니스를 한 단계 업그레이드하세요'}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* 메인 요금제 카드 */}
            <div className="lg:col-span-2">
              <Card className="border-2 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                        <Crown className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          {safeT('plan.name') || 'SureCRM Pro'}
                        </CardTitle>
                        <CardDescription className="text-base mt-1">
                          {safeT('plan.description') ||
                            '모든 기능이 포함된 프리미엄 CRM 솔루션'}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="default" className="px-3 py-1">
                      {safeT('plan.badge') || '프리미엄'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold mb-2">
                      {safeT('plan.price') || '$20'}
                      <span className="text-lg font-normal text-muted-foreground ml-1">
                        {safeT('plan.currency') || 'USD'}{' '}
                        {safeT('plan.period') || '/월'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {safeT('plan.note') || '언제든지 취소 가능'}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <Button
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      size="lg"
                    >
                      {safeT('plan.button') || '무료 체험 시작'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Star className="mr-1 h-4 w-4" />
                      14일 무료 체험 · 신용카드 필요 없음
                    </div>
                  </div>

                  {/* 혜택 목록 */}
                  <div className="space-y-2">
                    {benefits.map((benefit: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 사이드바 정보 */}
            <div className="space-y-6">
              {/* 혜택 카드 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {safeT('benefits.title') || 'Pro 요금제 혜택'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {benefits.map((benefit: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 예정 기능 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {safeT('upcoming.title') || '곧 출시될 기능'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingFeatures.map((feature: any, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <Badge variant="outline" className="text-xs">
                          출시 예정
                        </Badge>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">
                            {feature.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 핵심 기능 섹션 */}
          <div className="mt-16">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  {safeT('features.title') || '핵심 기능'}
                </CardTitle>
                <CardDescription>
                  {safeT('features.subtitle') ||
                    'SureCRM Pro의 강력한 기능들을 만나보세요'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {coreFeatures.map((feature: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <feature.icon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{feature.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
