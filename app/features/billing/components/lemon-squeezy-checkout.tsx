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
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

interface LemonSqueezyCheckoutProps {
  variantId?: number;
  isLoading?: boolean;
  subscription?: {
    price: number;
    currency: string;
    trialDays: number;
  };
}

export function LemonSqueezyCheckout({
  variantId,
  isLoading = false,
  subscription = {
    price: 20,
    currency: 'USD',
    trialDays: 14,
  },
}: LemonSqueezyCheckoutProps) {
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // 구독 정보에서 Pro Plan 정보 가져오기
  const plan = {
    id: 'surecrm-pro',
    name: 'Pro Plan',
    description: '보험설계사를 위한 완전한 CRM 솔루션',
    monthlyPrice: subscription.price,
    currency: subscription.currency,
    trialDays: subscription.trialDays,
  };

  // 통화 포맷터
  const formatPrice = (price: number, currency: string) => {
    if (currency === 'USD') {
      return `$${price}`;
    } else if (currency === 'KRW') {
      return `₩${price.toLocaleString()}`;
    }
    return `${price} ${currency}`;
  };

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

  const handleCheckout = async () => {
    if (!variantId) {
      toast.error('상품 정보를 불러오는 중입니다. 잠시만 기다려주세요.');
      return;
    }

    setCheckoutLoading(true);

    try {
      // Lemon Squeezy 체크아웃 생성 API 호출
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variantId,
          redirectUrl: `${window.location.origin}/billing/success`,
          embed: false, // 새 창에서 열기
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '체크아웃 생성에 실패했습니다.');
      }

      // 체크아웃 URL로 리다이렉트
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank');
      } else {
        throw new Error('체크아웃 URL을 받을 수 없습니다.');
      }
    } catch (error) {
      console.error('체크아웃 오류:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : '체크아웃 생성 중 오류가 발생했습니다.'
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <Badge variant="secondary" className="mb-4">
          <Sparkles className="w-3 h-3 mr-1" />
          Pro Plan 출시
        </Badge>
        <h1 className="text-2xl font-bold mb-2">Pro Plan으로 업그레이드</h1>
        <p className="text-muted-foreground">
          보험설계사 전용 CRM으로 영업 효율을 극대화하세요
        </p>
      </div>

      {/* 메인 프라이싱 카드 */}
      <Card className="relative overflow-hidden border-2 border-primary/20">
        {/* 인기 배지 */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Badge className="bg-primary text-primary-foreground">
            <Star className="w-3 h-3 mr-1" />
            추천 플랜
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
                {formatPrice(plan.monthlyPrice, plan.currency)}
              </span>
              <span className="text-muted-foreground ml-1">/ 월</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 14일 무료 체험 강조 */}
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300">
              <Clock className="w-4 h-4" />
              <span className="font-medium">{plan.trialDays}일 무료 체험</span>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              언제든 취소 가능, 신용카드 불필요
            </p>
          </div>

          {/* CTA 버튼 */}
          <Button
            onClick={handleCheckout}
            disabled={isLoading || checkoutLoading || !variantId}
            size="lg"
            className="w-full"
          >
            {checkoutLoading ? (
              '결제 페이지 로딩 중...'
            ) : !variantId ? (
              '상품 정보 로딩 중...'
            ) : (
              <>
                {plan.trialDays}일 무료로 시작하기
                <ExternalLink className="ml-2 w-4 h-4" />
              </>
            )}
          </Button>

          {/* 보안 정보 */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Lemon Squeezy로 안전한 결제</span>
          </div>

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
              곧 출시 예정
            </h3>
            <div className="space-y-2">
              {comingSoonFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-3 h-3 text-gray-400" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 추가 정보 */}
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>• 언제든 취소 가능</p>
            <p>• 월간 구독으로 자동 갱신</p>
            <p>
              •{' '}
              {plan.currency === 'USD'
                ? 'USD 결제 (카드 결제)'
                : 'VAT 포함 가격'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
