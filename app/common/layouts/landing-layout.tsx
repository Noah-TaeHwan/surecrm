import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/common/components/ui/button';
import { Link } from 'react-router';
import { LanguageSelector } from '~/common/components/i18n/language-selector';

interface LandingLayoutProps {
  children: React.ReactNode;
}

export function LandingLayout({ children }: LandingLayoutProps) {
  const { t } = useTranslation('landing');
  const [isHydrated, setIsHydrated] = useState(false);

  // 🎯 Hydration 완료 감지 (SSR/CSR mismatch 방지)
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // 모바일에서 랜딩페이지 스크롤을 허용하기 위한 body 클래스 관리
  useEffect(() => {
    const body = document.body;
    body.classList.add('landing-page-scroll-enabled');

    return () => {
      body.classList.remove('landing-page-scroll-enabled');
    };
  }, []);

  return (
    <div className="landing-page-container fixed inset-0 bg-background flex flex-col overflow-hidden">
      {/* 헤더 - 대시보드와 동일한 고정 방식 */}
      <header className="h-16 border-b border-border flex-shrink-0 fixed top-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 safe-area-top">
        <div className="h-full px-4 lg:px-6 flex items-center justify-between">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">
            <Link to="/" className="hover:text-primary transition-colors">
              SureCRM
            </Link>
          </h1>

          {/* 언어 선택기 & 로그인/회원가입 버튼 */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 언어 선택기 */}
            <LanguageSelector variant="dropdown" size="sm" className="w-auto" />

            <Button
              variant="outline"
              size="sm"
              asChild
              className="text-sm border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
            >
              <Link to="/auth/login">
                {isHydrated ? t('nav.login') : '로그인'}
              </Link>
            </Button>
            <Button
              size="sm"
              asChild
              className="text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            >
              <Link to="/auth/signup">
                {isHydrated ? t('nav.signup') : '회원가입'}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 - 스크롤 가능 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pt-16 safe-area-padding">
        <main className="w-full min-h-full">{children}</main>

        {/* 🚀 고도화된 푸터 영역 */}
        <footer className="relative overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background border-t footer-enhanced safe-area-bottom">
          {/* 배경 그리드 패턴 */}
          <div className="absolute inset-0 opacity-20">
            <div className="footer-grid-pattern absolute inset-0" />
          </div>

          {/* 메인 푸터 콘텐츠 */}
          <div className="relative z-10">
            {/* 상단 섹션 - 브랜드 & 링크 */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                {/* 브랜드 섹션 */}
                <div className="lg:col-span-2 footer-section-animate">
                  <div className="space-y-4">
                    <Link to="/" className="inline-block group">
                      <h2 className="landing-brand-logo text-2xl lg:text-3xl font-bold">
                        SureCRM
                      </h2>
                    </Link>
                    <p className="text-muted-foreground text-sm lg:text-base max-w-md leading-relaxed">
                      {isHydrated
                        ? t('footer.description')
                        : '보험설계사를 위한 전문 CRM 솔루션'}
                    </p>

                    {/* 소셜 링크 */}
                    <div className="flex items-center gap-3 pt-2">
                      <div className="service-badge flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-2 h-2 bg-green-500 rounded-full status-indicator" />
                        <span>
                          {isHydrated ? t('footer.status') : '서비스 상태'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 제품 링크 */}
                <div className="space-y-4 footer-section-animate">
                  <h3 className="font-semibold text-foreground text-sm lg:text-base">
                    {isHydrated ? t('footer.product') : '제품'}
                  </h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li>
                      <Link
                        to="/features"
                        className="footer-link-hover hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block"
                      >
                        {isHydrated ? t('nav.features') : '특징'}
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/pricing"
                        className="footer-link-hover hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block"
                      >
                        {isHydrated ? t('nav.pricing') : '요금제'}
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* 지원 링크 */}
                <div className="space-y-4 footer-section-animate">
                  <h3 className="font-semibold text-foreground text-sm lg:text-base">
                    {isHydrated ? t('footer.support') : '지원'}
                  </h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li>
                      <Link
                        to="/help"
                        className="footer-link-hover hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block"
                      >
                        {isHydrated ? t('footer.help') : '도움말'}
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/contact"
                        className="footer-link-hover hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block"
                      >
                        {isHydrated ? t('footer.contact') : '문의하기'}
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/terms"
                        className="footer-link-hover hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block"
                      >
                        {isHydrated ? t('footer.terms') : '이용약관'}
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/privacy"
                        className="footer-link-hover hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block"
                      >
                        {isHydrated ? t('footer.privacy') : '개인정보처리방침'}
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
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                {/* 저작권 정보 */}
                <div className="text-xs lg:text-sm text-muted-foreground text-center md:text-left">
                  <p>
                    {isHydrated
                      ? `© ${new Date().getFullYear()} ${t('footer.copyright').replace('© ', '')}`
                      : `© ${new Date().getFullYear()} SureCRM. All rights reserved.`}
                  </p>
                  <p className="mt-1 opacity-80">
                    {isHydrated
                      ? t('footer.description')
                      : '보험설계사를 위한 전문 CRM 솔루션'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 장식적 요소 - 오른쪽 하단 그라데이션 */}
          <div className="footer-gradient-orb absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-primary/5 via-transparent to-transparent rounded-full blur-3xl" />

          {/* 장식적 요소 - 왼쪽 상단 그라데이션 */}
          <div className="footer-gradient-orb absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-muted/10 via-transparent to-transparent rounded-full blur-3xl" />
        </footer>
      </div>
    </div>
  );
}
