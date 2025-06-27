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
  Crown,
  Clock,
  Shield,
  Star,
  ExternalLink,
  Zap,
  Users,
  BarChart3,
  Calendar,
  FileText,
  Smartphone,
  HeadphonesIcon,
  Sparkles,
  Timer,
} from 'lucide-react';
import { toast } from 'sonner';

interface PremiumBillingPageProps {
  variantId?: number;
  isLoading?: boolean;
  subscriptionStatus?: {
    isTrialActive: boolean;
    daysRemaining: number;
    needsPayment: boolean;
  };
}

export function PremiumBillingPage({
  variantId,
  isLoading = false,
  subscriptionStatus,
}: PremiumBillingPageProps) {
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const plan = {
    id: 'surecrm-pro',
    name: 'Pro Plan',
    description: '보험설계사를 위한 완전한 CRM 솔루션',
    monthlyPrice: 39000,
    currency: 'KRW',
  };

  const coreFeatures = [
    {
      icon: Users,
      title: '무제한 고객 관리',
      description: '고객 수 제한 없이 자유롭게 관리',
    },
    {
      icon: BarChart3,
      title: '영업 파이프라인 자동화',
      description: '단계별 영업 프로세스 추적',
    },
    {
      icon: Clock,
      title: '실시간 대시보드',
      description: '한 눈에 보는 영업 현황',
    },
    {
      icon: Users,
      title: '추천인 네트워크 시각화',
      description: '고객 관계망을 한 눈에',
    },
    {
      icon: Calendar,
      title: '일정 및 미팅 관리',
      description: '구글 캘린더 연동 포함',
    },
    {
      icon: FileText,
      title: '문서 저장소',
      description: '계약서, 제안서 등 안전 보관',
    },
    {
      icon: Smartphone,
      title: '모바일 앱',
      description: '언제 어디서나 업무 처리',
    },
    {
      icon: HeadphonesIcon,
      title: '24/7 고객 지원',
      description: '언제든지 도움을 받으세요',
    },
  ];

  const premiumFeatures = [
    { icon: Zap, title: 'AI 영업 인사이트', description: '곧 출시 예정' },
    { icon: BarChart3, title: '고급 보고서', description: '곧 출시 예정' },
    { icon: Users, title: '팀 협업 도구', description: '곧 출시 예정' },
    { icon: FileText, title: 'API 연동', description: '곧 출시 예정' },
  ];

  const handleCheckout = async () => {
    // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
    if (!subscriptionStatus) {
      window.location.href = '/auth/login?redirect=/billing';
      return;
    }

    if (!variantId) {
      toast.error('상품 정보를 불러오는 중입니다. 잠시만 기다려주세요.');
      return;
    }

    setCheckoutLoading(true);

    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variantId,
          redirectUrl: `${window.location.origin}/billing/success`,
          embed: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '체크아웃 생성에 실패했습니다.');
      }

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

  const getTrialStatusMessage = () => {
    if (!subscriptionStatus) {
      // 로그인하지 않은 사용자를 위한 메시지
      return (
        <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">14일 무료 체험</span>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400">
            회원가입하고 바로 14일 무료로 모든 기능을 사용해보세요!
          </p>
        </div>
      );
    }

    if (subscriptionStatus.isTrialActive) {
      return (
        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
            <Timer className="w-4 h-4" />
            <span className="font-medium">무료 체험 중</span>
          </div>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            {subscriptionStatus.daysRemaining}일 남았습니다. 체험 종료 전에
            구독하세요!
          </p>
        </div>
      );
    }

    if (subscriptionStatus.needsPayment) {
      return (
        <div className="bg-red-50 dark:bg-red-950 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-300 mb-2">
            <Crown className="w-4 h-4" />
            <span className="font-medium">구독이 필요합니다</span>
          </div>
          <p className="text-sm text-red-600 dark:text-red-400">
            무료 체험이 종료되었습니다. 계속 사용하려면 구독하세요.
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto py-12 px-4">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <Badge
            variant="secondary"
            className="mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            MVP 출시 기념 할인
          </Badge>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Pro Plan으로 업그레이드
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            보험설계사 전용 CRM으로 영업 효율을 극대화하고
            <br />더 많은 고객을 성공적으로 관리하세요
          </p>
        </div>

        {/* 구독 상태 메시지 */}
        {getTrialStatusMessage()}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 메인 프라이싱 카드 */}
          <div className="lg:col-span-2">
            <Card className="relative overflow-hidden border-2 border-primary/20 shadow-2xl">
              {/* 인기 배지 */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  가장 인기
                </Badge>
              </div>

              <CardHeader className="text-center pt-8 pb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>
                <div className="mt-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ₩{plan.monthlyPrice.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground ml-2 text-lg">
                      / 월
                    </span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                    14일 무료 체험 + 언제든 취소 가능
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* CTA 버튼 */}
                <Button
                  onClick={handleCheckout}
                  disabled={
                    isLoading ||
                    checkoutLoading ||
                    (!subscriptionStatus && !variantId)
                  }
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-lg py-6"
                >
                  {checkoutLoading ? (
                    '로그인 페이지로 이동 중...'
                  ) : !subscriptionStatus ? (
                    <>
                      로그인하고 무료 체험 시작
                      <ExternalLink className="ml-2 w-5 h-5" />
                    </>
                  ) : !variantId ? (
                    '상품 정보 로딩 중...'
                  ) : subscriptionStatus?.needsPayment ? (
                    <>
                      지금 구독하기
                      <ExternalLink className="ml-2 w-5 h-5" />
                    </>
                  ) : (
                    <>
                      14일 무료 체험 시작
                      <ExternalLink className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>

                {/* 보안 정보 */}
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>Lemon Squeezy로 안전한 결제</span>
                </div>

                <Separator />

                {/* 핵심 기능들 */}
                <div>
                  <h3 className="font-semibold mb-4 text-lg">
                    포함된 핵심 기능
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {coreFeatures.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/50"
                      >
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                          <feature.icon className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <span className="text-sm font-medium">
                            {feature.title}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사이드 정보 */}
          <div className="space-y-6">
            {/* 곧 출시 기능 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />곧 출시 예정
                </CardTitle>
                <CardDescription>
                  더 강력한 기능들이 준비 중입니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {premiumFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">
                          {feature.title}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 고객 혜택 */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
              <CardHeader>
                <CardTitle className="text-lg">고객님만의 특별 혜택</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>14일 무료 체험</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>언제든 취소 가능</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>월간 구독으로 부담 없이</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>무료 데이터 마이그레이션</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>전담 고객 성공 매니저</span>
                </div>
              </CardContent>
            </Card>

            {/* 연락처 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">도움이 필요하신가요?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  궁금한 점이 있으시면 언제든 연락주세요.
                </p>
                <div className="text-sm">
                  <p className="font-medium">이메일: support@surecrm.co.kr</p>
                  <p className="text-muted-foreground">평일 9:00 - 18:00</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="text-center mt-12 text-sm text-muted-foreground space-y-2">
          <p>• 모든 가격은 VAT 포함입니다</p>
          <p>• 구독은 월 단위로 자동 갱신됩니다</p>
          <p>• 언제든지 구독을 취소할 수 있습니다</p>
        </div>
      </div>
    </div>
  );
}
