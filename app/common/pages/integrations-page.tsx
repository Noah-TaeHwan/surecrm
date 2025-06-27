import { LandingLayout } from '~/common/layouts/landing-layout';

export default function IntegrationsPage() {
  return (
    <LandingLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">연동 서비스</h1>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            이미 사용 중인 도구들과 완벽하게 연동하여 업무 효율성을 극대화하세요
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Google Workspace */}
            <div className="bg-card rounded-lg p-6 border hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">G</span>
                </div>
                <h3 className="text-lg font-semibold">Google Workspace</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Gmail, 캘린더, 드라이브와 완벽 연동
              </p>
              <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                연동 가능
              </span>
            </div>

            {/* Slack */}
            <div className="bg-card rounded-lg p-6 border hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <h3 className="text-lg font-semibold">Slack</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                팀 커뮤니케이션과 알림 자동화
              </p>
              <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                연동 가능
              </span>
            </div>

            {/* Zoom */}
            <div className="bg-card rounded-lg p-6 border hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">Z</span>
                </div>
                <h3 className="text-lg font-semibold">Zoom</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                화상 미팅 일정 관리 및 자동 링크 생성
              </p>
              <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                연동 가능
              </span>
            </div>

            {/* KakaoTalk */}
            <div className="bg-card rounded-lg p-6 border hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold">K</span>
                </div>
                <h3 className="text-lg font-semibold">카카오톡</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                고객과의 메시지 연동 및 자동 응답
              </p>
              <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                개발 중
              </span>
            </div>

            {/* Microsoft 365 */}
            <div className="bg-card rounded-lg p-6 border hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">M</span>
                </div>
                <h3 className="text-lg font-semibold">Microsoft 365</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Outlook, Teams, OneDrive 연동
              </p>
              <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                연동 가능
              </span>
            </div>

            {/* Notion */}
            <div className="bg-card rounded-lg p-6 border hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">N</span>
                </div>
                <h3 className="text-lg font-semibold">Notion</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                문서 및 프로젝트 관리 연동
              </p>
              <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                개발 중
              </span>
            </div>
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4">
              더 많은 연동이 필요하신가요?
            </h2>
            <p className="text-muted-foreground mb-6">
              API를 통해 기존 시스템과 쉽게 연동할 수 있습니다
            </p>
            <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold">
              API 문서 보기
            </button>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
