import { LandingLayout } from '~/common/layouts/landing-layout';

export default function HelpPage() {
  return (
    <LandingLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">도움말</h1>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            SureCRM 사용에 관한 모든 궁금증을 해결해드립니다
          </p>

          {/* 검색 바 */}
          <div className="mb-12">
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                placeholder="궁금한 내용을 검색해보세요"
                className="w-full px-4 py-3 pl-10 border rounded-lg"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <span className="text-muted-foreground">🔍</span>
              </div>
            </div>
          </div>

          {/* 자주 묻는 질문 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">자주 묻는 질문</h2>
            <div className="space-y-4">
              <div className="bg-card rounded-lg p-6 border">
                <h3 className="font-semibold mb-2">
                  Q. 무료 체험 기간은 얼마나 되나요?
                </h3>
                <p className="text-muted-foreground">
                  14일간 모든 기능을 제한 없이 사용하실 수 있습니다. 신용카드
                  등록 없이도 체험 가능합니다.
                </p>
              </div>

              <div className="bg-card rounded-lg p-6 border">
                <h3 className="font-semibold mb-2">
                  Q. 데이터 보안은 어떻게 관리되나요?
                </h3>
                <p className="text-muted-foreground">
                  모든 데이터는 암호화되어 저장되며, ISO 27001 인증을 받은
                  데이터센터에서 관리됩니다.
                </p>
              </div>

              <div className="bg-card rounded-lg p-6 border">
                <h3 className="font-semibold mb-2">
                  Q. 모바일에서도 사용할 수 있나요?
                </h3>
                <p className="text-muted-foreground">
                  네, 웹 브라우저를 통해 모바일에서도 모든 기능을 사용하실 수
                  있습니다.
                </p>
              </div>
            </div>
          </div>

          {/* 도움말 카테고리 */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="text-xl font-semibold mb-4">📚 사용 가이드</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• 시작하기 가이드</li>
                <li>• 고객 관리 방법</li>
                <li>• 파이프라인 설정</li>
                <li>• 리포트 활용법</li>
              </ul>
            </div>

            <div className="bg-card rounded-lg p-6 border">
              <h3 className="text-xl font-semibold mb-4">🎥 동영상 튜토리얼</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• 기본 설정 방법</li>
                <li>• 고급 기능 활용</li>
                <li>• 연동 서비스 설정</li>
                <li>• 문제 해결 방법</li>
              </ul>
            </div>

            <div className="bg-card rounded-lg p-6 border">
              <h3 className="text-xl font-semibold mb-4">💬 커뮤니티</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• 사용자 포럼</li>
                <li>• 팁과 노하우</li>
                <li>• 기능 요청</li>
                <li>• 베스트 프랙티스</li>
              </ul>
            </div>

            <div className="bg-card rounded-lg p-6 border">
              <h3 className="text-xl font-semibold mb-4">📞 고객 지원</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• 이메일 지원</li>
                <li>• 실시간 채팅</li>
                <li>• 전화 상담</li>
                <li>• 원격 지원</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
