// MVP: 구독 관리 기능 - 추후 결제 시스템 연동 후 활성화 예정
// 현재는 개발 중이며 사이드바에서 비활성화 상태

import { useState } from 'react';
import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Separator } from '~/common/components/ui/separator';
import {
  Check,
  ArrowRight,
  Sparkles,
  Clock,
  CreditCard,
  Shield,
  Star,
} from 'lucide-react';

interface SimpleSubscriptionPageProps {
  onUpgrade: (planId: string) => void;
  isLoading?: boolean;
}

export function SimpleSubscriptionPage({
  onUpgrade,
  isLoading = false,
}: SimpleSubscriptionPageProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>(
    'monthly'
  );

  const plan = {
    id: 'surecrm-pro',
    name: 'SureCRM Pro',
    description: '보험설계사를 위한 완전한 CRM 솔루션',
    monthlyPrice: 39000,
    yearlyPrice: 390000, // 10개월 가격 (2개월 무료)
    currency: 'KRW',
  };

  const currentPrice =
    billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  const currentPeriod = billingPeriod === 'monthly' ? '월' : '년';
  const savings = billingPeriod === 'yearly' ? 2 : 0;

  const features = [
    '무제한 고객 관리',
    '영업 파이프라인 자동화',
    '실시간 대시보드',
    '추천인 네트워크 시각화',
    '일정 및 미팅 관리',
    '문서 저장소',
    '모바일 앱',
    '24/7 고객 지원',
  ];

  const comingSoonFeatures = [
    'AI 영업 인사이트',
    '고급 보고서',
    '팀 협업 도구',
    'API 연동',
  ];

  const handleUpgrade = () => {
    onUpgrade(plan.id);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <Badge variant="secondary" className="mb-4">
          <Sparkles className="w-3 h-3 mr-1" />
          MVP 출시 기념
        </Badge>
        <h1 className="text-2xl font-bold mb-2">SureCRM Pro로 업그레이드</h1>
        <p className="text-muted-foreground">
          보험설계사 전용 CRM으로 영업 효율을 극대화하세요
        </p>
      </div>

      {/* 빌링 주기 토글 */}
      <div className="flex justify-center mb-8">
        <div className="bg-muted p-1 rounded-lg">
          <Button
            variant={billingPeriod === 'monthly' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setBillingPeriod('monthly')}
            className="rounded-md"
          >
            월간
          </Button>
          <Button
            variant={billingPeriod === 'yearly' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setBillingPeriod('yearly')}
            className="rounded-md relative"
          >
            연간
            {savings > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 text-xs"
              >
                {savings}개월 무료
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* 메인 프라이싱 카드 */}
      <Card className="relative overflow-hidden border-2 border-primary/20">
        {/* 인기 배지 */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Badge className="bg-primary text-primary-foreground">
            <Star className="w-3 h-3 mr-1" />
            현재 MVP
          </Badge>
        </div>

        <CardHeader className="text-center pt-8">
          <CardTitle className="text-xl">{plan.name}</CardTitle>
          <CardDescription className="text-sm">
            {plan.description}
          </CardDescription>
          <div className="mt-4">
            <div className="flex items-baseline justify-center">
              <span className="text-3xl font-bold">
                ₩{currentPrice.toLocaleString()}
              </span>
              <span className="text-muted-foreground ml-1">
                / {currentPeriod}
              </span>
            </div>
            {billingPeriod === 'yearly' && savings > 0 && (
              <p className="text-sm text-green-600 mt-1">
                연간 결제 시 {savings}개월 무료 (17% 할인)
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 30일 무료 체험 강조 */}
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300">
              <Clock className="w-4 h-4" />
              <span className="font-medium">30일 무료 체험</span>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              언제든 취소 가능, 신용카드 불필요
            </p>
          </div>

          {/* CTA 버튼 */}
          <Button
            onClick={handleUpgrade}
            disabled={isLoading}
            size="lg"
            className="w-full"
          >
            {isLoading ? (
              '처리 중...'
            ) : (
              <>
                30일 무료로 시작하기
                <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </Button>

          <Separator />

          {/* 포함된 기능 */}
          <div>
            <h3 className="font-semibold mb-3">포함된 기능</h3>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* 곧 출시 기능 */}
          <div>
            <h3 className="font-semibold mb-3 text-muted-foreground">
              🚀 곧 출시 예정 (MVP 이후)
            </h3>
            <div className="space-y-2">
              {comingSoonFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              * 기존 구독자에게 무료로 제공됩니다
            </p>
          </div>

          <Separator />

          {/* 보안 및 지원 */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <Shield className="w-5 h-5 text-green-600 mx-auto" />
              <p className="text-xs font-medium">뱅킹급 보안</p>
              <p className="text-xs text-muted-foreground">SSL 암호화</p>
            </div>
            <div className="space-y-1">
              <CreditCard className="w-5 h-5 text-blue-600 mx-auto" />
              <p className="text-xs font-medium">간편 결제</p>
              <p className="text-xs text-muted-foreground">카드/계좌이체</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 하단 FAQ 간소화 */}
      <div className="mt-8 text-center space-y-3">
        <p className="text-sm text-muted-foreground">궁금한 점이 있으신가요?</p>
        <div className="flex items-center justify-center gap-4 text-sm">
          <a
            href="mailto:support@surecrm.com"
            className="text-primary hover:underline"
          >
            support@surecrm.com
          </a>
          <span className="text-muted-foreground">•</span>
          <a href="tel:1588-1234" className="text-primary hover:underline">
            1588-1234
          </a>
        </div>
      </div>
    </div>
  );
}
