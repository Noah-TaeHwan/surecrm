import { LanguageSelectorDemo } from '~/common/components/i18n/language-selector';

export function meta() {
  return [
    { title: 'i18n Test - SureCRM' },
    { name: 'description', content: '다국어 지원 테스트 페이지' },
  ];
}

export default function TestI18nPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* 헤더 */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              🌍 SureCRM 다국어 지원 테스트
            </h1>
            <p className="text-xl text-muted-foreground">
              한국어, 영어, 일본어 번역 시스템 테스트
            </p>
          </div>

          {/* 언어 선택기 데모 */}
          <LanguageSelectorDemo />

          {/* 글로벌 SaaS 고려사항 */}
          <div className="space-y-6 p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold">
              🚀 글로벌 SaaS 개발 고려사항
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">✅ 구현 완료</h3>
                <ul className="space-y-2 text-sm">
                  <li>• react-i18next 기반 다국어 시스템</li>
                  <li>• 한국어, 영어, 일본어 지원</li>
                  <li>• 네임스페이스 기반 번역 파일 구조</li>
                  <li>• 실시간 언어 변경</li>
                  <li>• 로컬스토리지 언어 설정 저장</li>
                  <li>• 폴백 시스템 (ko → en)</li>
                  <li>• 언어별 메타데이터 (통화, 날짜형식 등)</li>
                  <li>• TypeScript 타입 안전성</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">🔄 향후 구현 예정</h3>
                <ul className="space-y-2 text-sm">
                  <li>• URL 기반 언어 라우팅 (/ko, /en, /ja)</li>
                  <li>• 브라우저 언어 자동 감지</li>
                  <li>• 번역 누락 키 자동 추출</li>
                  <li>• 동적 번역 파일 로딩</li>
                  <li>• 지역별 날짜/시간 포맷팅</li>
                  <li>• 숫자/통화 포맷팅</li>
                  <li>• 다국어 이메일 템플릿</li>
                  <li>• SEO 메타태그 다국어화</li>
                  <li>• 번역 관리 대시보드</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 기술 스택 정보 */}
          <div className="space-y-4 p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold">⚙️ 기술 스택</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">핵심 라이브러리</h4>
                <ul className="text-sm space-y-1">
                  <li>• react-i18next</li>
                  <li>• i18next</li>
                  <li>• i18next-browser-languagedetector</li>
                  <li>• i18next-http-backend</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">지원 언어</h4>
                <ul className="text-sm space-y-1">
                  <li>🇰🇷 한국어 (ko)</li>
                  <li>🇺🇸 영어 (en)</li>
                  <li>🇯🇵 일본어 (ja)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">파일 구조</h4>
                <ul className="text-sm space-y-1">
                  <li>• /public/locales/ko/</li>
                  <li>• /public/locales/en/</li>
                  <li>• /public/locales/ja/</li>
                  <li>• 네임스페이스별 분리</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 다음 단계 */}
          <div className="space-y-4 p-6 border rounded-lg bg-blue-50/50">
            <h2 className="text-2xl font-semibold">🎯 다음 단계 계획</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="font-mono bg-blue-100 px-2 py-1 rounded text-sm">
                  v0.5.1
                </span>
                <div>
                  <h4 className="font-medium">네비게이션 다국어화</h4>
                  <p className="text-sm text-muted-foreground">
                    헤더, 사이드바, 메뉴 등 기본 UI 번역 적용
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="font-mono bg-blue-100 px-2 py-1 rounded text-sm">
                  v0.5.2
                </span>
                <div>
                  <h4 className="font-medium">폼 및 에러 메시지 다국어화</h4>
                  <p className="text-sm text-muted-foreground">
                    입력 폼, validation 에러, 알림 메시지 번역
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="font-mono bg-blue-100 px-2 py-1 rounded text-sm">
                  v0.5.3
                </span>
                <div>
                  <h4 className="font-medium">URL 라우팅 다국어화</h4>
                  <p className="text-sm text-muted-foreground">
                    /ko/dashboard, /en/dashboard 등 언어별 URL 구조
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 버전 정보 */}
          <div className="text-center text-sm text-muted-foreground">
            <p>SureCRM v0.5.0 - 다국어 지원 시작 🚀</p>
          </div>
        </div>
      </div>
    </div>
  );
}
