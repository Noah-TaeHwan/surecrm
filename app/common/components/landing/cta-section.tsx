import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { WarpBackground } from '~/common/components/magicui/warp-background';
import { AnimatedGridPattern } from '~/common/components/magicui/animated-grid-pattern';

export function CTASection() {
  const { t } = useTranslation('landing');
  const [isHydrated, setIsHydrated] = useState(false);

  // 🎯 Hydration 완료 감지 (SSR/CSR mismatch 방지)
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
      {/* 배경 애니메이션 추가 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10" />
      <AnimatedGridPattern
        className="absolute inset-0 opacity-5 pointer-events-none"
        numSquares={30}
        maxOpacity={0.1}
        duration={4}
        repeatDelay={2}
      />
      <WarpBackground className="absolute inset-0 opacity-5" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-xs sm:max-w-lg lg:max-w-3xl mx-auto text-center rounded-2xl sm:rounded-3xl bg-white/5 backdrop-blur-sm p-6 sm:p-8 lg:p-12 border border-white/10">
          <Badge
            variant="outline"
            className="mb-4 sm:mb-6 bg-primary/10 text-primary px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium"
          >
            {isHydrated ? t('cta.badge') : '지금 시작하세요'}
          </Badge>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 leading-tight">
            {isHydrated ? (
              t('cta.headline')
            ) : (
              <>
                <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">
                  성공적인 소개 네트워크 관리
                </span>
                의 시작
              </>
            )}
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-xs sm:max-w-md lg:max-w-xl mx-auto leading-relaxed">
            {isHydrated ? (
              t('cta.cta_description')
            ) : (
              <>
                소개 네트워크의 힘을 극대화하고 영업 성과를 높일 준비가
                되셨나요?
                <span className="hidden sm:inline">
                  <br />
                </span>
                <span className="sm:hidden"> </span>
                SureCRM과 함께 더 체계적인 고객 관리를 시작하세요.
              </>
            )}
          </p>
          <Button
            size="lg"
            className="rounded-full px-4 sm:px-6 h-11 sm:h-12 shadow-lg text-sm sm:text-base hover:shadow-xl transition-all duration-200"
          >
            <Link to="/invite-only" className="flex items-center gap-2">
              {isHydrated ? t('cta.cta_button') : '초대 코드로 시작하기'}
              <ArrowRight className="h-3 sm:h-4 w-3 sm:w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
