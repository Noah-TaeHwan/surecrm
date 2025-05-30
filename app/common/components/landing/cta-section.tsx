import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { WarpBackground } from '~/common/components/magicui/warp-background';
import { AnimatedGridPattern } from '~/common/components/magicui/animated-grid-pattern';

export function CTASection() {
  return (
    <section className="relative py-20 overflow-hidden">
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

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center rounded-3xl bg-white/5 backdrop-blur-sm p-12 border border-white/10">
          <Badge
            variant="outline"
            className="mb-6 bg-primary/10 text-primary px-4 py-1.5 text-sm font-medium"
          >
            지금 시작하세요
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">
              성공적인 소개 네트워크 관리
            </span>
            의 시작
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            소개 네트워크의 힘을 극대화하고 영업 성과를 높일 준비가 되셨나요?
            <br />
            SureCRM과 함께 더 체계적인 고객 관리를 시작하세요.
          </p>
          <Button size="lg" className="rounded-full px-6 h-12 shadow-lg">
            <Link to="/invite-only" className="flex items-center gap-2">
              초대 코드로 시작하기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
