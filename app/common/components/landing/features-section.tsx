import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '~/common/components/ui/badge';
import { BlurFade } from '~/common/components/magicui/blur-fade';
import { BorderBeam } from '~/common/components/magicui/border-beam';
import { AnimatedGradientText } from '~/common/components/magicui/animated-gradient-text';
import { FlickeringGrid } from '~/common/components/magicui/flickering-grid';
import {
  Shield,
  BarChart2,
  Users,
  FileText,
  Globe as GlobeIcon,
  MessageSquare,
} from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="relative h-full p-4 sm:p-5 lg:p-6 bg-background/90 backdrop-blur-sm rounded-xl border border-border/40 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="rounded-full bg-primary/10 w-10 sm:w-11 lg:w-12 h-10 sm:h-11 lg:h-12 flex items-center justify-center mb-3 sm:mb-4">
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-semibold mb-2 leading-tight">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
        {description}
      </p>
      <BorderBeam
        size={100}
        colorFrom="#9E7AFF"
        colorTo="#FE8BBB"
        duration={6}
      />
    </div>
  );
}

export function FeaturesSection() {
  const { t } = useTranslation('landing');
  const [isHydrated, setIsHydrated] = useState(false);

  // 🎯 Hydration 완료 감지 (SSR/CSR mismatch 방지)
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const features = [
    {
      icon: <GlobeIcon className="h-8 w-8 text-primary" />,
      title: isHydrated
        ? t('features.network_visualization.title')
        : '소개 네트워크 시각화',
      description: isHydrated
        ? t('features.network_visualization.description')
        : '마인드맵 스타일의 그래프로 고객 소개 관계를 시각적으로 파악하고 핵심 소개자를 쉽게 발견하세요.',
    },
    {
      icon: <BarChart2 className="h-8 w-8 text-primary" />,
      title: isHydrated
        ? t('features.sales_pipeline.title')
        : '영업 파이프라인 관리',
      description: isHydrated
        ? t('features.sales_pipeline.description')
        : '칸반보드 방식으로 고객을 영업 단계별로 체계적으로 관리하고 계약 전환율을 높이세요.',
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: isHydrated
        ? t('features.key_referrer_analysis.title')
        : '핵심 소개자 분석',
      description: isHydrated
        ? t('features.key_referrer_analysis.description')
        : '가장 많은 소개를 제공한 고객을 발견하고 관계를 강화하여 소개 네트워크를 확장하세요.',
    },
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: isHydrated ? t('features.custom_reports.title') : '맞춤형 보고서',
      description: isHydrated
        ? t('features.custom_reports.description')
        : '소개 패턴과 성공률을 분석하고 맞춤형 보고서로 영업 전략을 최적화하세요.',
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      title: isHydrated
        ? t('features.team_collaboration.title')
        : '팀 협업 기능',
      description: isHydrated
        ? t('features.team_collaboration.description')
        : '팀원들과 함께 소개 네트워크를 관리하고 효과적으로 협업하세요.',
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: isHydrated ? t('features.data_security.title') : '데이터 보안',
      description: isHydrated
        ? t('features.data_security.description')
        : '고객 데이터를 안전하게 암호화하여 저장하고 개인정보 보호 규정을 준수합니다.',
    },
  ];

  return (
    <section
      id="features"
      className="relative py-16 sm:py-20 lg:py-24 overflow-hidden bg-muted/30"
    >
      <FlickeringGrid
        className="absolute inset-0 opacity-10"
        squareSize={4}
        gridGap={6}
        color="#6B7280"
        maxOpacity={0.3}
        flickerChance={0.1}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 sm:mb-16 max-w-sm sm:max-w-lg lg:max-w-2xl mx-auto">
          <Badge
            variant="outline"
            className="mb-3 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium"
          >
            {isHydrated ? t('features.badge') : '주요 특징'}
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
            {isHydrated ? (
              t('features.headline')
            ) : (
              <>
                효율적인{' '}
                <AnimatedGradientText>소개 네트워크 관리</AnimatedGradientText>
                를 위한 모든 것
              </>
            )}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed px-2 sm:px-0">
            {isHydrated ? (
              t('features.description')
            ) : (
              <>
                SureCRM은 보험설계사가 소개 네트워크를 효과적으로 관리하고
                <span className="hidden sm:inline">
                  <br />
                </span>
                <span className="sm:hidden"> </span>
                영업 성과를 높이는 데 필요한 모든 도구를 제공합니다.
              </>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <BlurFade
              key={index}
              delay={0.05 * (index + 1)}
              duration={0.6}
              inView
              inViewMargin="-20px"
            >
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
