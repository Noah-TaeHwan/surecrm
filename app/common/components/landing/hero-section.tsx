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
    <section id="hero" className="relative py-20 md:py-32 overflow-hidden">
      <WarpBackground className="absolute inset-0 opacity-20" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <Badge
              className="px-4 py-1.5 text-sm font-medium"
              variant="secondary"
            >
              초대 전용 베타
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <TextReveal text="보험설계사를 위한" />
              <br />
              <span className="text-primary">
                <AnimatedShinyText shimmerWidth={200}>
                  소개 네트워크
                </AnimatedShinyText>
              </span>{' '}
              <TextReveal text="관리 솔루션" />
            </h1>
            <p className="text-xl text-muted-foreground max-w-md">
              누가 누구를 소개했는지 시각적으로 체계화하고
              <br />
              소개 네트워크의 힘을 극대화하세요
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button size="lg" className="rounded-full px-6 h-12 shadow-lg">
                <Link to="/invite-only" className="flex items-center gap-2">
                  초대 코드로 시작하기
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="rounded-full px-6 h-12"
              >
                <Link to="/auth/login">계정이 있다면 로그인</Link>
              </Button>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <MagicCard
              className="w-full aspect-square rounded-2xl overflow-hidden border-0"
              glareOpacity={0}
              rotate={true}
            >
              <div className="relative h-full flex items-center justify-center bg-card/80 backdrop-blur-sm">
                <div className="absolute top-4 left-4">
                  <h3 className="text-xl font-semibold text-primary">
                    SureCRM 네트워크
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    전국 소개 네트워크 시각화
                  </p>
                </div>
              </div>
            </MagicCard>

            <div className="absolute -bottom-6 -right-6 -z-10 w-full h-full rounded-2xl bg-gradient-to-br from-primary/30 to-purple-500/30 blur-xl opacity-50" />
          </div>
        </div>
      </div>
    </section>
  );
}
