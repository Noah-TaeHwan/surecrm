import { useState } from 'react';
import { PlanCard } from './plan-card';
import {
  Shield,
  Users,
  Database,
  HeadphonesIcon,
  TrendingUp,
  Network,
  PieChart,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';

interface EnhancedPlanSelectionProps {
  onPlanSelect: (planId: string) => void;
  selectedPlanId?: string;
  isLoading?: boolean;
}

export function EnhancedPlanSelection({
  onPlanSelect,
  selectedPlanId,
  isLoading = false,
}: EnhancedPlanSelectionProps) {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  // 🎯 MVP: 단일 플랜 (SureCRM Pro)
  const plan = {
    id: 'surecrm-pro',
    name: 'SureCRM Pro',
    description: '보험설계사를 위한 완전한 CRM 솔루션',
    price: 20,
    currency: 'USD',
    billingInterval: 'month',
    isPopular: true,
    isSelected: selectedPlanId === 'surecrm-pro',
    features: [
      '무제한 고객 관리',
      '영업 파이프라인 자동화',
      '실시간 대시보드 및 분석',
      '일정 관리 및 미팅 스케줄링',
      '문서 관리 및 계약서 보관',
      '추천인 네트워크 관리',
      '모바일 앱 지원',
      '24/7 고객 지원',
      '데이터 백업 및 보안',
      '팀 협업 기능',
      '맞춤형 보고서 생성',
      '외부 시스템 연동 (API)',
    ],
  };

  const keyFeatures = [
    {
      id: 'network',
      icon: Network,
      title: '소개 네트워크 시각화',
      description:
        '고객 간의 소개 관계를 3D 네트워크로 시각화하고 키맨을 자동으로 식별합니다.',
      highlight: '평균 소개 성공률 240% 증가',
      color: 'blue',
    },
    {
      id: 'pipeline',
      icon: PieChart,
      title: '스마트 영업 파이프라인',
      description:
        'AI 기반 단계 추천과 자동화된 워크플로우로 영업 효율을 극대화합니다.',
      highlight: '계약 성사율 평균 65% 향상',
      color: 'green',
    },
    {
      id: 'analytics',
      icon: TrendingUp,
      title: '실시간 성과 분석',
      description:
        '매출, 고객, 소개 현황을 실시간으로 모니터링하고 인사이트를 제공합니다.',
      highlight: '데이터 기반 의사결정 지원',
      color: 'purple',
    },
  ];

  const benefits = [
    {
      icon: Sparkles,
      title: '업무 시간 절약',
      description: '반복 업무 자동화로 하루 평균 2시간 절약',
    },
    {
      icon: TrendingUp,
      title: '매출 증대',
      description: '체계적인 관리로 월 평균 매출 30% 증가',
    },
    {
      icon: Users,
      title: '고객 만족도 향상',
      description: '개인화된 서비스로 고객 만족도 95% 달성',
    },
  ];

  return (
    <div className="space-y-12">
      {/* 헤더 섹션 */}
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <Badge variant="secondary" className="mx-auto">
            <Sparkles className="w-3 h-3 mr-1" />
            보험설계사 전용 CRM
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            SureCRM Pro로 업그레이드하세요
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            10,000+ 보험설계사가 선택한 CRM 솔루션으로
            <br />
            고객 관리부터 영업 성과까지 모든 것을 체계적으로 관리하세요.
          </p>
        </div>

        {/* 핵심 성과 지표 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 핵심 기능 섹션 */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">핵심 기능</h2>
          <p className="text-muted-foreground">
            보험설계사의 업무 효율을 극대화하는 혁신적인 기능들
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {keyFeatures.map(feature => (
            <Card
              key={feature.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                hoveredFeature === feature.id ? 'ring-2 ring-primary' : ''
              }`}
              onMouseEnter={() => setHoveredFeature(feature.id)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <CardHeader className="text-center pb-4">
                <div
                  className={`w-16 h-16 bg-${feature.color}-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3`}
                >
                  <feature.icon
                    className={`w-8 h-8 text-${feature.color}-600`}
                  />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <Badge
                  variant="outline"
                  className={`text-${feature.color}-600 border-${feature.color}-200`}
                >
                  {feature.highlight}
                </Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 플랜 카드 - 중앙 강조 */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-primary/5 rounded-3xl" />
        <div className="relative p-8">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">지금 시작하세요</h2>
              <p className="text-muted-foreground">
                14일 무료 체험으로 SureCRM Pro의 모든 기능을 경험해보세요
              </p>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <PlanCard
                  plan={plan}
                  onSelect={onPlanSelect}
                  isLoading={isLoading}
                />
              </div>
            </div>

            {/* 추가 혜택 강조 */}
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>14일 무료 체험</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>언제든 취소 가능</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>무료 데이터 마이그레이션</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>24/7 고객 지원</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 보안 및 신뢰성 섹션 */}
      <Card className="border-none shadow-lg bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">
                안전하고 신뢰할 수 있는 서비스
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                금융권 수준의 보안으로 고객의 소중한 데이터를 안전하게
                보호합니다
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center space-y-2">
                <Database className="w-6 h-6 text-blue-600 mx-auto" />
                <h4 className="font-medium">데이터 암호화</h4>
                <p className="text-xs text-muted-foreground">
                  AES-256 암호화 및<br />
                  정기 백업
                </p>
              </div>
              <div className="text-center space-y-2">
                <Shield className="w-6 h-6 text-green-600 mx-auto" />
                <h4 className="font-medium">ISO 27001</h4>
                <p className="text-xs text-muted-foreground">
                  국제 보안 표준
                  <br />
                  인증 취득
                </p>
              </div>
              <div className="text-center space-y-2">
                <HeadphonesIcon className="w-6 h-6 text-purple-600 mx-auto" />
                <h4 className="font-medium">전담 지원</h4>
                <p className="text-xs text-muted-foreground">
                  24시간 전문
                  <br />
                  지원팀 운영
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ 섹션 - 간소화 */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold">자주 묻는 질문</h3>
          <p className="text-muted-foreground">
            궁금한 점이 있으시면 언제든 문의하세요
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-3">
          {[
            {
              q: '무료 체험 기간 동안 모든 기능을 사용할 수 있나요?',
              a: '네, 14일 동안 SureCRM Pro의 모든 기능을 제한 없이 사용하실 수 있습니다.',
            },
            {
              q: '기존 데이터를 쉽게 옮길 수 있나요?',
              a: 'Excel, CSV 파일 업로드 및 전담팀의 무료 데이터 마이그레이션 서비스를 제공합니다.',
            },
            {
              q: '구독을 언제든 취소할 수 있나요?',
              a: '네, 언제든 취소 가능하며 현재 결제 주기 종료까지 서비스를 이용하실 수 있습니다.',
            },
          ].map((faq, index) => (
            <details
              key={index}
              className="group border border-border rounded-lg"
            >
              <summary className="flex items-center justify-between p-4 font-medium cursor-pointer group-open:border-b hover:bg-muted/50">
                {faq.q}
                <ArrowRight className="w-4 h-4 transform group-open:rotate-90 transition-transform text-muted-foreground" />
              </summary>
              <div className="p-4 pt-0">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
