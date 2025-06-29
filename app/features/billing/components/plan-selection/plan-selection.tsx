import { PlanCard } from './plan-card';
import {
  Shield,
  Database,
  HeadphonesIcon,
  Network,
  PieChart,
  FileText,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';

interface PlanSelectionProps {
  onPlanSelect: (planId: string) => void;
  selectedPlanId?: string;
  isLoading?: boolean;
}

export function PlanSelection({
  onPlanSelect,
  selectedPlanId,
  isLoading = false,
}: PlanSelectionProps) {
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

  return (
    <div className="space-y-8">
      {/* 헤더 섹션 */}
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">
          SureCRM Pro로 업그레이드
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          보험설계사를 위해 특별히 설계된 CRM 솔루션으로 고객 관리부터 영업
          성과까지 모든 것을 한 곳에서 관리하세요.
        </p>
      </div>

      {/* 주요 기능 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Network className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-lg">소개 네트워크</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              고객 간의 소개 관계를 시각화하고 네트워크 효과를 극대화하세요.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <PieChart className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-lg">영업 파이프라인</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              체계적인 영업 단계 관리로 계약 성사율을 높이고 매출을 증대하세요.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-lg">성과 보고서</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              실시간 대시보드와 상세 보고서로 비즈니스 성과를 분석하세요.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* 플랜 카드 */}
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <PlanCard plan={plan} onSelect={onPlanSelect} isLoading={isLoading} />
        </div>
      </div>

      {/* 보안 및 신뢰성 섹션 */}
      <Card>
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-xl">
            안전하고 신뢰할 수 있는 서비스
          </CardTitle>
          <CardDescription>
            고객의 소중한 데이터를 최고 수준의 보안으로 보호합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Database className="w-4 h-4 text-blue-600" />
              </div>
              <div className="space-y-1">
                <h4 className="font-medium">데이터 암호화</h4>
                <p className="text-sm text-muted-foreground">
                  모든 데이터는 최신 암호화 기술로 보호되며, 정기적인 백업으로
                  데이터 손실을 방지합니다.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <HeadphonesIcon className="w-4 h-4 text-green-600" />
              </div>
              <div className="space-y-1">
                <h4 className="font-medium">24/7 고객 지원</h4>
                <p className="text-sm text-muted-foreground">
                  언제든지 도움이 필요할 때 전문 지원팀이 신속하고 정확한 도움을
                  제공합니다.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">자주 묻는 질문</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <details className="group border border-border rounded-lg">
            <summary className="flex items-center justify-between p-4 font-medium cursor-pointer group-open:border-b">
              언제든지 취소할 수 있나요?
              <span className="ml-2 transform group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <div className="p-4 pt-0">
              <p className="text-sm text-muted-foreground">
                네, 언제든지 취소하실 수 있습니다. 취소 후에도 현재 결제 주기가
                끝날 때까지 서비스를 이용하실 수 있습니다.
              </p>
            </div>
          </details>

          <details className="group border border-border rounded-lg">
            <summary className="flex items-center justify-between p-4 font-medium cursor-pointer group-open:border-b">
              데이터 이전은 어떻게 하나요?
              <span className="ml-2 transform group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <div className="p-4 pt-0">
              <p className="text-sm text-muted-foreground">
                기존 시스템의 데이터를 쉽게 가져올 수 있도록 Excel, CSV 파일
                업로드 기능을 제공합니다. 필요시 전담 지원팀이 데이터 이전을
                도와드립니다.
              </p>
            </div>
          </details>

          <details className="group border border-border rounded-lg">
            <summary className="flex items-center justify-between p-4 font-medium cursor-pointer group-open:border-b">
              모바일에서도 사용할 수 있나요?
              <span className="ml-2 transform group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <div className="p-4 pt-0">
              <p className="text-sm text-muted-foreground">
                네, 반응형 웹 디자인으로 스마트폰과 태블릿에서도 완벽하게
                작동합니다. 별도의 앱 설치 없이 브라우저에서 바로 이용하실 수
                있습니다.
              </p>
            </div>
          </details>
        </CardContent>
      </Card>
    </div>
  );
}
