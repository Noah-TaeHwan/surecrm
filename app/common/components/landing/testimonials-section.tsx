import { Badge } from '~/common/components/ui/badge';
import { BlurFade } from '~/common/components/ui/blur-fade';
import { DotPattern } from '~/common/components/ui/dot-pattern';
import { AnimatedGradientText } from '~/common/components/ui/animated-gradient-text';
import { MagicCard } from '~/common/components/ui/magic-card';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import type { PublicStats, Testimonial } from '~/lib/public-data';

interface TestimonialCardProps {
  name: string;
  role: string;
  quote: string;
  initial: string;
}

function TestimonialCard({ name, role, quote, initial }: TestimonialCardProps) {
  return (
    <MagicCard className="w-full h-full p-6 border-0 bg-white/5 backdrop-blur-sm">
      <div className="flex items-center gap-4 mb-4">
        <Avatar className="border-2 border-primary/20">
          <AvatarFallback className="bg-primary/10 text-primary">
            {initial}
          </AvatarFallback>
        </Avatar>
        <div>
          <h4 className="text-base font-semibold">{name}</h4>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>
      <p className="italic text-muted-foreground leading-relaxed">{quote}</p>
    </MagicCard>
  );
}

interface TestimonialsSectionProps {
  stats: PublicStats;
  testimonials: Testimonial[];
}

export function TestimonialsSection({
  stats,
  testimonials,
}: TestimonialsSectionProps) {
  return (
    <section
      id="testimonials"
      className="py-32 bg-muted/30 overflow-visible min-h-[600px] relative"
    >
      <DotPattern
        className="absolute inset-0 opacity-30 pointer-events-none"
        width={32}
        height={32}
        gap={8}
        radius={1.5}
        color="rgba(var(--primary-rgb), 0.3)"
      />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <Badge
            variant="outline"
            className="mb-3 px-4 py-1.5 text-sm font-medium"
          >
            신뢰할 수 있는 솔루션
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <AnimatedGradientText>사용자 후기</AnimatedGradientText>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            SureCRM을 사용하는 보험설계사들의 실제 경험을 들어보세요.
          </p>
        </div>

        {/* 실제 통계 데이터 표시 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <BlurFade delay={0.1} inView>
            <div className="text-center p-6 rounded-2xl bg-card/50 border border-border/40 backdrop-blur-sm">
              <div className="text-3xl font-bold text-primary mb-2">
                {stats.totalUsers.toLocaleString()}+
              </div>
              <div className="text-sm text-muted-foreground">활성 사용자</div>
            </div>
          </BlurFade>
          <BlurFade delay={0.2} inView>
            <div className="text-center p-6 rounded-2xl bg-card/50 border border-border/40 backdrop-blur-sm">
              <div className="text-3xl font-bold text-primary mb-2">
                {stats.totalTeams.toLocaleString()}+
              </div>
              <div className="text-sm text-muted-foreground">활성 팀</div>
            </div>
          </BlurFade>
          <BlurFade delay={0.3} inView>
            <div className="text-center p-6 rounded-2xl bg-card/50 border border-border/40 backdrop-blur-sm">
              <div className="text-3xl font-bold text-primary mb-2">
                {stats.totalClients.toLocaleString()}+
              </div>
              <div className="text-sm text-muted-foreground">
                관리 중인 고객
              </div>
            </div>
          </BlurFade>
          <BlurFade delay={0.4} inView>
            <div className="text-center p-6 rounded-2xl bg-card/50 border border-border/40 backdrop-blur-sm">
              <div className="text-3xl font-bold text-primary mb-2">
                {stats.avgEfficiencyIncrease}%
              </div>
              <div className="text-sm text-muted-foreground">
                평균 효율 증대
              </div>
            </div>
          </BlurFade>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-8">
          {testimonials.map((testimonial, index) => (
            <BlurFade key={testimonial.id} delay={0.1 * (index + 1)} inView>
              <TestimonialCard
                name={testimonial.name}
                role={`${testimonial.role} | ${testimonial.company}`}
                quote={testimonial.quote}
                initial={testimonial.initial}
              />
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
