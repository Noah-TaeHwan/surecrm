import { Button } from '~/common/components/ui/button';
import { Link } from 'react-router';

interface LandingLayoutProps {
  children: React.ReactNode;
  showCTA?: boolean;
}

export function LandingLayout({
  children,
  showCTA = true,
}: LandingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-3 sm:py-4 lg:py-6 px-4 sm:px-6 lg:px-8 fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b transition-all duration-200">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">
            <Link to="/" className="hover:text-primary transition-colors">
              SureCRM
            </Link>
          </h1>

          {/* 로그인/회원가입 버튼 */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-sm hover:text-primary transition-colors"
            >
              <Link to="/auth/login">로그인</Link>
            </Button>
            <Button size="sm" asChild className="text-sm">
              <Link to="/auth/signup">회원가입</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">{children}</main>

      {/* 🚀 고도화된 푸터 영역 */}
      <footer className="relative overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background border-t footer-enhanced">
        {/* 배경 그리드 패턴 */}
        <div className="absolute inset-0 opacity-20">
          <div className="footer-grid-pattern absolute inset-0" />
        </div>

        {/* 메인 푸터 콘텐츠 */}
        <div className="relative z-10">
          {/* 상단 섹션 - 브랜드 & 링크 */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {/* 브랜드 섹션 */}
              <div className="lg:col-span-2 footer-section-animate">
                <div className="space-y-4">
                  <Link to="/" className="inline-block group">
                    <h2 className="brand-logo-hover text-2xl lg:text-3xl font-bold">
                      SureCRM
                    </h2>
                  </Link>
                  <p className="text-muted-foreground text-sm lg:text-base max-w-md leading-relaxed">
                    보험 영업의 새로운 기준을 제시하는 스마트 CRM 솔루션. 고객
                    관리부터 영업 기회 창출까지, 모든 것을 하나로.
                  </p>

                  {/* 소셜 링크 */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="service-badge flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-2 h-2 bg-green-500 rounded-full status-indicator" />
                      <span>서비스 운영중</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 제품 링크 */}
              <div className="space-y-4 footer-section-animate">
                <h3 className="font-semibold text-foreground text-sm lg:text-base">
                  제품
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li>
                    <Link
                      to="/features"
                      className="footer-link-hover hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      주요 기능
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/pricing"
                      className="footer-link-hover hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      요금제
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/demo"
                      className="footer-link-hover hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      데모 체험
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/integrations"
                      className="footer-link-hover hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      연동 서비스
                    </Link>
                  </li>
                </ul>
              </div>

              {/* 지원 링크 */}
              <div className="space-y-4 footer-section-animate">
                <h3 className="font-semibold text-foreground text-sm lg:text-base">
                  지원
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li>
                    <Link
                      to="/help"
                      className="footer-link-hover hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      도움말
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contact"
                      className="footer-link-hover hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      문의하기
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/terms"
                      className="footer-link-hover hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      이용약관
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/terms"
                      className="footer-link-hover hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      개인정보처리방침
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="border-t border-border/50" />
          </div>

          {/* 하단 섹션 - 저작권 & 추가 정보 */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              {/* 저작권 정보 */}
              <div className="text-xs lg:text-sm text-muted-foreground text-center md:text-left">
                <p>© 2024 SureCRM. All rights reserved.</p>
                <p className="mt-1 opacity-80">
                  보험 영업을 위한 스마트 CRM 솔루션
                </p>
              </div>

              {/* 추가 정보 */}
              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                <div className="feature-badge">
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full" />
                  <span>Made in Korea</span>
                </div>
                <div className="feature-badge">
                  <span className="w-1.5 h-1.5 bg-blue-500/60 rounded-full" />
                  <span>Enterprise Ready</span>
                </div>
                <div className="feature-badge">
                  <span className="w-1.5 h-1.5 bg-green-500/60 rounded-full" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 장식적 요소 - 오른쪽 하단 그라데이션 */}
        <div className="footer-gradient-orb absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-primary/5 via-transparent to-transparent rounded-full blur-3xl" />

        {/* 장식적 요소 - 왼쪽 상단 그라데이션 */}
        <div className="footer-gradient-orb absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-muted/10 via-transparent to-transparent rounded-full blur-2xl" />
      </footer>
    </div>
  );
}
