import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { WarpBackground } from '~/common/components/magicui/warp-background';
import { MagicCard } from '~/common/components/magicui/magic-card';
import { TextReveal } from '~/common/components/magicui/text-reveal';
import { AnimatedShinyText } from '~/common/components/magicui/animated-shiny-text';

export function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center py-16 sm:py-20 lg:py-32 overflow-hidden">
      <WarpBackground className="absolute inset-0 opacity-20" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 lg:space-y-10">
            <Badge
            className="px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium"
              variant="secondary"
            >
            초대 전용 MVP
            </Badge>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight">
            <div className="mb-2 sm:mb-3 lg:mb-4">
              <TextReveal text="보험설계사를 위한" />
            </div>
            <div className="mb-2 sm:mb-3 lg:mb-4">
              <span className="text-primary">
                <AnimatedShinyText shimmerWidth={200}>
                  소개 네트워크
                </AnimatedShinyText>
              </span>
            </div>
            <div>
              <TextReveal text="관리 솔루션" />
            </div>
            </h1>
          
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-xs sm:max-w-lg lg:max-w-2xl mx-auto leading-relaxed px-2 sm:px-4 lg:px-0">
            누가 누구를 소개했는지 시각적으로 체계화하고 소개 네트워크의 힘을 극대화하세요
            </p>
          
          {/* MVP 기능 목록 - 모바일 최적화 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 max-w-xs sm:max-w-2xl lg:max-w-3xl mx-auto pt-6 sm:pt-8">
            <div className="bg-card/40 rounded-lg p-2.5 sm:p-3 lg:p-4 border border-border/30 backdrop-blur-sm">
              <div className="text-xs sm:text-sm font-semibold text-primary">구글 캘린더</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">연동</div>
            </div>
            <div className="bg-card/40 rounded-lg p-2.5 sm:p-3 lg:p-4 border border-border/30 backdrop-blur-sm">
              <div className="text-xs sm:text-sm font-semibold text-primary">고객 관리</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">체계화</div>
            </div>
            <div className="bg-card/40 rounded-lg p-2.5 sm:p-3 lg:p-4 border border-border/30 backdrop-blur-sm">
              <div className="text-xs sm:text-sm font-semibold text-primary">영업 파이프라인</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">관리</div>
            </div>
            <div className="bg-card/40 rounded-lg p-2.5 sm:p-3 lg:p-4 border border-border/30 backdrop-blur-sm">
              <div className="text-xs sm:text-sm font-semibold text-primary">대시보드</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">분석</div>
            </div>
            <div className="bg-card/40 rounded-lg p-2.5 sm:p-3 lg:p-4 border border-border/30 backdrop-blur-sm">
              <div className="text-xs sm:text-sm font-semibold text-primary">소개 네트워크</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">시각화</div>
            </div>
            <div className="bg-card/40 rounded-lg p-2.5 sm:p-3 lg:p-4 border border-border/30 backdrop-blur-sm">
              <div className="text-xs sm:text-sm font-semibold text-primary">초대장</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">관리</div>
            </div>
            <div className="bg-card/40 rounded-lg p-2.5 sm:p-3 lg:p-4 border border-border/30 backdrop-blur-sm">
              <div className="text-xs sm:text-sm font-semibold text-primary">보고서</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">생성</div>
            </div>
            <div className="bg-card/40 rounded-lg p-2.5 sm:p-3 lg:p-4 border border-border/30 backdrop-blur-sm">
              <div className="text-xs sm:text-sm font-semibold text-primary">주간 업데이트</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">지속 개선</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-6 sm:pt-8 px-4 sm:px-0">
            <Button size="lg" className="rounded-full px-4 sm:px-6 h-11 sm:h-12 shadow-lg text-sm sm:text-base hover:shadow-xl transition-all duration-200">
                <Link to="/invite-only" className="flex items-center gap-2">
                  초대 코드로 시작하기
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
              className="rounded-full px-4 sm:px-6 h-11 sm:h-12 text-sm sm:text-base hover:bg-accent transition-colors duration-200"
              >
                <Link to="/auth/login">계정이 있다면 로그인</Link>
              </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
