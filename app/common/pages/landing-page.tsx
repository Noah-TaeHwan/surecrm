import { Button } from '~/common/components/ui/button';
import { Link } from 'react-router';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-6 px-8 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">SureCRM</h1>
          <div className="space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/login">로그인</Link>
            </Button>
            <Button asChild>
              <Link to="/invite-only">시작하기</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 px-8">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              보험설계사를 위한 소개 네트워크 관리 솔루션
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
              누가 누구를 소개했는지 시각적으로 체계화하고 소개 네트워크의 힘을
              극대화하세요
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/invite-only">초대 받기</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">계정이 있다면 로그인</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-20 px-8">
          <div className="container mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12">주요 기능</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="text-xl font-semibold mb-4">
                  소개 네트워크 시각화
                </h4>
                <p>
                  옵시디언 스타일 그래프 뷰로 고객 소개 관계를 한눈에 파악하세요
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="text-xl font-semibold mb-4">
                  영업 파이프라인 관리
                </h4>
                <p>
                  칸반보드 방식으로 고객을 영업 단계별로 체계적으로 관리하세요
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="text-xl font-semibold mb-4">핵심 소개자 분석</h4>
                <p>가장 많은 소개를 제공한 고객을 발견하고 관계를 강화하세요</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 px-8 border-t">
        <div className="container mx-auto text-center text-gray-500">
          <p>© 2023 SureCRM. 초대 전용 서비스입니다.</p>
        </div>
      </footer>
    </div>
  );
}
