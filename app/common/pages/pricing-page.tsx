import { LandingLayout } from '~/common/layouts/landing-layout';

export default function PricingPage() {
  return (
    <LandingLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">요금제</h1>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            비즈니스 규모에 맞는 최적의 플랜을 선택하세요
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* 스타터 플랜 */}
            <div className="bg-card rounded-lg p-8 border relative">
              <h3 className="text-2xl font-bold mb-4">스타터</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold">₩29,000</span>
                <span className="text-muted-foreground">/월</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  고객 관리 (최대 100명)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  기본 파이프라인
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  이메일 지원
                </li>
              </ul>
              <button className="w-full bg-primary text-primary-foreground py-2 rounded-lg">
                시작하기
              </button>
            </div>

            {/* 프로 플랜 */}
            <div className="bg-card rounded-lg p-8 border relative border-primary">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
                  인기
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4">프로</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold">₩59,000</span>
                <span className="text-muted-foreground">/월</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  고객 관리 (최대 500명)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  고급 파이프라인
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  분석 대시보드
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  우선 지원
                </li>
              </ul>
              <button className="w-full bg-primary text-primary-foreground py-2 rounded-lg">
                시작하기
              </button>
            </div>

            {/* 엔터프라이즈 플랜 */}
            <div className="bg-card rounded-lg p-8 border relative">
              <h3 className="text-2xl font-bold mb-4">엔터프라이즈</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold">₩99,000</span>
                <span className="text-muted-foreground">/월</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  무제한 고객 관리
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  모든 기능 포함
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  전담 지원팀
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  커스텀 연동
                </li>
              </ul>
              <button className="w-full bg-primary text-primary-foreground py-2 rounded-lg">
                문의하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
