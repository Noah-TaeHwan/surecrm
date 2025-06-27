import { LandingLayout } from '~/common/layouts/landing-layout';

export default function FeaturesPage() {
  return (
    <LandingLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">주요 기능</h1>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="text-xl font-semibold mb-4">스마트 고객 관리</h3>
              <p className="text-muted-foreground">
                AI 기반 고객 분석과 개인화된 관리 시스템으로 효율적인 고객 관계
                구축
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 border">
              <h3 className="text-xl font-semibold mb-4">영업 파이프라인</h3>
              <p className="text-muted-foreground">
                직관적인 칸반 보드와 자동화된 워크플로우로 영업 프로세스 최적화
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 border">
              <h3 className="text-xl font-semibold mb-4">실시간 분석</h3>
              <p className="text-muted-foreground">
                고급 대시보드와 리포트를 통한 데이터 기반 의사결정 지원
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 border">
              <h3 className="text-xl font-semibold mb-4">모바일 최적화</h3>
              <p className="text-muted-foreground">
                언제 어디서나 접근 가능한 반응형 디자인과 모바일 앱
              </p>
            </div>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
