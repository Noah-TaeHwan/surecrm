import { LandingLayout } from '~/common/layouts/landing-layout';

export default function DemoPage() {
  return (
    <LandingLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-8">데모 체험</h1>
          <p className="text-lg text-muted-foreground mb-12">
            SureCRM의 강력한 기능을 직접 체험해보세요
          </p>

          <div className="bg-card rounded-lg p-8 border mb-8">
            <h2 className="text-2xl font-semibold mb-4">무료 체험 신청</h2>
            <p className="text-muted-foreground mb-6">
              14일 무료 체험으로 모든 기능을 제한 없이 사용해보세요
            </p>

            <div className="max-w-md mx-auto space-y-4">
              <input
                type="text"
                placeholder="회사명"
                className="w-full px-4 py-3 border rounded-lg"
              />
              <input
                type="email"
                placeholder="이메일 주소"
                className="w-full px-4 py-3 border rounded-lg"
              />
              <input
                type="tel"
                placeholder="연락처"
                className="w-full px-4 py-3 border rounded-lg"
              />
              <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold">
                무료 체험 시작하기
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="text-xl font-semibold mb-4">🎯 맞춤형 데모</h3>
              <p className="text-muted-foreground">
                귀하의 비즈니스에 특화된 1:1 맞춤형 데모를 제공합니다
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 border">
              <h3 className="text-xl font-semibold mb-4">📞 전문가 상담</h3>
              <p className="text-muted-foreground">
                CRM 전문가와의 상담을 통해 최적의 솔루션을 찾아보세요
              </p>
            </div>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
