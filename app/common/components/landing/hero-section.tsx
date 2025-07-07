import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { WarpBackground } from '~/common/components/magicui/warp-background';
import { MagicCard } from '~/common/components/magicui/magic-card';
import { TextReveal } from '~/common/components/magicui/text-reveal';
import { AnimatedShinyText } from '~/common/components/magicui/animated-shiny-text';
import { InvitationRequestForm } from '~/features/invitations/components/invitation-request-form';

interface HeroSectionProps {
  actionData?: any; // 임시로 any 타입 사용
}

export function HeroSection({ actionData }: HeroSectionProps) {
  const { t } = useHydrationSafeTranslation('landing');

  return (
    <section
      id="hero"
      className="relative min-h-[100vh] sm:min-h-[95vh] lg:min-h-screen flex items-center justify-center py-16 sm:py-20 lg:py-24 overflow-hidden"
    >
      <WarpBackground className="absolute inset-0 opacity-20" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 lg:space-y-10">
          <Badge
            className="px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium"
            variant="secondary"
          >
            {t('hero.badge', '초대 전용 MVP')}
          </Badge>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight">
            <div className="mb-2 sm:mb-3 lg:mb-4">
              <TextReveal text={t('hero.title_part1', '보험설계사를 위한')} />
            </div>
            <div className="mb-2 sm:mb-3 lg:mb-4">
              <span className="text-primary">
                <AnimatedShinyText shimmerWidth={200}>
                  {t('hero.title_part2', '소개 네트워크')}
                </AnimatedShinyText>
              </span>
            </div>
            <div>
              <TextReveal text={t('hero.title_part3', '관리 솔루션')} />
            </div>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-xs sm:max-w-lg lg:max-w-2xl mx-auto leading-relaxed px-2 sm:px-4 lg:px-0">
            {t(
              'hero.subtitle_short',
              '누가 누구를 소개했는지 시각적으로 체계화하고 소개 네트워크의 힘을 극대화하세요'
            )}
          </p>

          <div className="pt-6 sm:pt-8">
            <MagicCard
              className="w-full max-w-lg mx-auto"
              glareSize={1}
              glareOpacity={0.1}
              glareColor="hsl(var(--primary))"
            >
              <div className="p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-semibold text-center mb-4">
                  {t('hero.invitation_form.title', '초대장을 먼저 받아보세요')}
                </h3>
                <InvitationRequestForm />
              </div>
            </MagicCard>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-6 sm:pt-8 px-4 sm:px-0">
            <Button
              size="lg"
              variant="outline"
              asChild
              className="rounded-full px-4 sm:px-6 h-11 sm:h-12 text-sm sm:text-base hover:bg-accent transition-colors duration-200"
            >
              <Link to="/auth/login">
                {t('hero.cta_login', '계정이 있다면 로그인')}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
