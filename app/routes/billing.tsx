// React Router v7 타입 import 제거 - 직접 타입 정의 사용
import React from 'react';

// 타입 정의
interface LoaderArgs {
  request: Request;
}

interface ActionArgs {
  request: Request;
}

interface ComponentProps {
  loaderData: any;
  actionData?: any;
}
import { MainLayout } from '~/common/layouts/main-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Button } from '~/common/components/ui/button';
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
import { Form } from 'react-router';
import { data } from 'react-router';

export function meta() {
  return [
    { title: '구독 관리 - SureCRM' },
    {
      name: 'description',
      content: 'SureCRM Pro 구독을 관리하고 프리미엄 기능을 이용하세요.',
    },
  ];
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const action = formData.get('action');

  if (action === 'start_subscription') {
    try {
      const { env } = await import('~/lib/env');
      // Lemon Squeezy 체크아웃 URL 생성 API 호출
      const checkoutResponse = await fetch(
        `${new URL(request.url).origin}/api/billing/checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: request.headers.get('Cookie') || '', // 사용자 인증 정보 전달
          },
          body: JSON.stringify({
            variantId: Number(env.lemonSqueezy.variantId), // 환경변수에서 가져온 Variant ID
            redirectUrl: `${new URL(request.url).origin}/billing/success`,
          }),
        }
      );

      if (!checkoutResponse.ok) {
        const errorData = await checkoutResponse.json();
        throw new Error(errorData.message || '체크아웃 생성 실패');
      }

      const { checkoutUrl } = await checkoutResponse.json();

      // Lemon Squeezy 체크아웃 페이지로 리다이렉트
      return data(null, {
        status: 302,
        headers: {
          Location: checkoutUrl,
        },
      });
    } catch (error) {
      console.error('구독 시작 오류:', error);
      return data(
        { error: '구독 처리 중 오류가 발생했습니다. 다시 시도해 주세요.' },
        { status: 400 }
      );
    }
  }

  return data({ error: '잘못된 요청입니다.' }, { status: 400 });
}

export async function loader({ request }: LoaderArgs) {
  try {
    const { getSubscriptionStatusForUser } = await import(
      '~/lib/auth/subscription-middleware.server'
    );
    const { env } = await import('~/lib/env');
    const userStatus = await getSubscriptionStatusForUser(request);

    console.log('💰 Billing Loader - 환경변수에서 가져온 가격:', {
      price: env.subscription.price,
      currency: env.subscription.currency,
      variantId: env.lemonSqueezy.variantId,
    });

    return {
      user: userStatus?.user || null,
      subscriptionStatus: userStatus?.subscriptionStatus || null,
      env: {
        lemonSqueezy: {
          variantId: env.lemonSqueezy.variantId,
        },
        subscription: {
          price: env.subscription.price,
          currency: env.subscription.currency,
        },
      },
    };
  } catch (error) {
    console.error('구독 정보 조회 오류:', error);

    console.log('💰 Billing Loader - Fallback 가격 사용:', {
      price: 20,
      currency: 'USD',
      reason: 'env 로드 실패',
    });

    // 로그인하지 않은 사용자도 페이지는 볼 수 있음
    return {
      user: null,
      subscriptionStatus: null,
      env: {
        lemonSqueezy: {
          variantId: '876185',
        },
        subscription: {
          price: 20,
          currency: 'USD',
        },
      },
    };
  }
}

export default function BillingPage({
  loaderData,
  actionData,
}: ComponentProps) {
  const { user, subscriptionStatus, env } = loaderData;

  // URL 파라미터에서 리다이렉트 이유 확인
  const [reason, setReason] = React.useState<string | null>(null);

  React.useEffect(() => {
    // 클라이언트에서만 URL 파라미터 읽기
    const searchParams = new URLSearchParams(window.location.search);
    setReason(searchParams.get('reason'));
  }, []);

  // 클라이언트에서 받은 환경변수 정보 로깅
  React.useEffect(() => {
    console.log('🖥️ Billing Client - 받은 환경변수:', {
      price: env?.subscription?.price,
      currency: env?.subscription?.currency,
      variantId: env?.lemonSqueezy?.variantId,
    });
  }, [env]);

  // 상태에 따른 메시지와 스타일링
  const getStatusInfo = () => {
    if (!subscriptionStatus) {
      return {
        title: 'SureCRM Pro로 업그레이드',
        subtitle: '로그인하여 프리미엄 기능을 이용하세요',
        badgeText: '미로그인',
        badgeVariant: 'secondary' as const,
        showUpgrade: true,
      };
    }

    // system_admin 계정인지 확인 (user 정보에서 role 확인)
    const isSystemAdmin = user?.role === 'system_admin';

    if (isSystemAdmin) {
      return {
        title: 'SureCRM Pro 관리자 계정',
        subtitle: '모든 프리미엄 기능을 무제한으로 이용할 수 있습니다',
        badgeText: 'Admin',
        badgeVariant: 'default' as const,
        showUpgrade: false,
      };
    }

    if (subscriptionStatus.isTrialActive) {
      const daysText =
        subscriptionStatus.daysRemaining === 1
          ? '1일'
          : `${subscriptionStatus.daysRemaining}일`;
      const trialEndDate = subscriptionStatus.trialEndsAt
        ? new Date(subscriptionStatus.trialEndsAt).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : '';

      return {
        title: '14일 무료 체험 중',
        subtitle: `${daysText} 남음 (${trialEndDate}까지) · 언제든지 업그레이드 가능`,
        badgeText: '체험 중',
        badgeVariant:
          subscriptionStatus.daysRemaining <= 3
            ? ('destructive' as const)
            : ('default' as const),
        showUpgrade: true,
      };
    }

    if (!subscriptionStatus.needsPayment) {
      const subscriptionEndDate = subscriptionStatus.subscriptionEndsAt
        ? new Date(subscriptionStatus.subscriptionEndsAt).toLocaleDateString(
            'ko-KR',
            {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }
          )
        : '무제한';

      return {
        title: 'SureCRM Pro 구독 중',
        subtitle: `모든 프리미엄 기능을 이용하고 계십니다 (${subscriptionEndDate}까지)`,
        badgeText: 'Pro',
        badgeVariant: 'default' as const,
        showUpgrade: false,
      };
    }

    return {
      title: '체험 기간 종료',
      subtitle: '계속 사용하려면 Pro 구독이 필요합니다',
      badgeText: '구독 필요',
      badgeVariant: 'destructive' as const,
      showUpgrade: true,
    };
  };

  const statusInfo = getStatusInfo();

  // 핵심 기능들
  const coreFeatures = [
    {
      icon: Users,
      title: '무제한 고객 관리',
      description: '고객 정보와 관계를 체계적으로 관리',
    },
    {
      icon: BarChart3,
      title: '고급 분석 및 보고서',
      description: '실시간 성과 분석과 상세 보고서',
    },
    {
      icon: Zap,
      title: '자동화 도구',
      description: '반복 업무를 자동화하여 효율성 향상',
    },
    {
      icon: Shield,
      title: '고급 보안',
      description: '엔터프라이즈급 보안과 데이터 보호',
    },
    {
      icon: PhoneCall,
      title: '고급 일정 관리',
      description: 'Google Calendar 동기화 및 스마트 스케줄링',
    },
    {
      icon: FileText,
      title: '문서 관리',
      description: '계약서, 정책서 등 모든 문서를 안전하게 보관',
    },
    {
      icon: Bell,
      title: '스마트 알림',
      description: '중요한 일정과 작업을 놓치지 않도록 알림',
    },
    {
      icon: Settings2,
      title: '고급 설정',
      description: '워크플로우를 맞춤 설정하여 생산성 극대화',
    },
  ];

  // 예정 기능들
  const upcomingFeatures = [
    { title: 'AI 고객 분석', description: '머신러닝 기반 고객 행동 예측' },
    { title: '모바일 앱', description: '언제 어디서나 CRM 접근' },
    { title: '팀 협업 도구', description: '팀원과의 실시간 협업' },
    { title: 'API 통합', description: '다른 도구들과의 연동' },
  ];

  return (
    <MainLayout
      title="구독 관리"
      initialSubscriptionStatus={
        subscriptionStatus
          ? {
              needsPayment: subscriptionStatus.needsPayment,
              isTrialActive: subscriptionStatus.isTrialActive,
              daysRemaining: subscriptionStatus.daysRemaining,
            }
          : {
              needsPayment: true,
              isTrialActive: false,
              daysRemaining: 0,
            }
      }
    >
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 체험 기간 종료로 리다이렉트된 경우 알림 표시 */}
        {reason === 'trial_expired' && subscriptionStatus?.needsPayment && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100">
                  체험 기간이 종료되었습니다
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  계속 사용하시려면 Pro 구독을 시작해주세요. 모든 기능에 대한
                  접근이 제한되었습니다.
                </p>
              </div>
            </div>
          </div>
        )}
        {/* 현재 상태 카드 */}
        <Card className="mb-8 border-2 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">{statusInfo.title}</CardTitle>
                  <CardDescription className="text-base mt-1">
                    {statusInfo.subtitle}
                  </CardDescription>
                </div>
              </div>
              <Badge variant={statusInfo.badgeVariant} className="px-3 py-1">
                {statusInfo.badgeText}
              </Badge>
            </div>
          </CardHeader>

          {statusInfo.showUpgrade && (
            <CardContent className="pt-0">
              <div className="flex flex-col sm:flex-row gap-3">
                <Form method="post">
                  <input
                    type="hidden"
                    name="action"
                    value="start_subscription"
                  />
                  <Button
                    type="submit"
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={!user} // 로그인하지 않은 경우 비활성화
                  >
                    {!user ? '로그인 필요' : 'Pro 구독 시작하기'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Form>
                <div className="text-sm text-muted-foreground flex items-center">
                  <Star className="mr-1 h-4 w-4" />월 ${env.subscription.price}{' '}
                  {env.subscription.currency} · 언제든지 취소 가능
                </div>
              </div>
              {actionData?.error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{actionData.error}</p>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 핵심 기능 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  핵심 기능
                </CardTitle>
                <CardDescription>
                  SureCRM Pro의 강력한 기능들을 만나보세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {coreFeatures.map((feature, index) => (
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

          {/* 사이드바 정보 */}
          <div className="space-y-6">
            {/* 가격 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pro 요금제</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold">
                    ${env.subscription.price}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    월간 구독 ({env.subscription.currency})
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>무제한 고객 관리</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>고급 분석 도구</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>우선 고객 지원</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>엔터프라이즈 보안</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 예정 기능 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />곧 출시될 기능
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Badge variant="outline" className="text-xs">
                        출시 예정
                      </Badge>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{feature.title}</h4>
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
      </div>
    </MainLayout>
  );
}
