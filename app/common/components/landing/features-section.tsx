import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '~/common/components/ui/badge';
import { Card } from '~/common/components/ui/card';
import { AnimatedGradientText } from '~/common/components/magicui/animated-gradient-text';
import { Meteors } from '~/common/components/magicui/meteors';
import { Particles } from '~/common/components/magicui/particles';
import { motion, useReducedMotion, useInView } from 'motion/react';
import {
  Shield,
  BarChart2,
  Users,
  FileText,
  Globe as GlobeIcon,
  MessageSquare,
  Zap,
  Star,
  Sparkles,
} from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

function FeatureCard({ icon, title, description, index }: FeatureCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const inViewRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(inViewRef, { once: true, margin: '-20px' });

  return (
    <motion.div
      ref={inViewRef}
      initial={{
        opacity: 0,
        y: shouldReduceMotion ? 0 : 40,
        scale: shouldReduceMotion ? 1 : 0.95,
      }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{
        duration: shouldReduceMotion ? 0.2 : 0.6,
        delay: shouldReduceMotion ? 0 : index * 0.1,
        ease: [0.16, 1, 0.3, 1],
        type: 'spring',
        damping: 20,
        stiffness: 300,
      }}
      whileHover={{
        y: shouldReduceMotion ? 0 : -4,
        scale: shouldReduceMotion ? 1 : 1.02,
        transition: { duration: 0.2, ease: 'easeOut' },
      }}
      className="h-full group"
    >
      <Card className="relative h-full p-4 sm:p-6 lg:p-8 bg-card/60 backdrop-blur-sm border-border/50 hover:bg-card/80 hover:border-border/80 hover:shadow-lg transition-all duration-300">
        <div className="relative z-10">
          <div className="mb-4 sm:mb-5 lg:mb-6">
            <div className="relative rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
              <motion.div
                whileHover={shouldReduceMotion ? {} : { rotate: 360 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="text-primary"
              >
                {icon}
              </motion.div>
            </div>
          </div>

          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 text-foreground leading-tight">
            {title}
          </h3>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}

export function FeaturesSection() {
  const { t } = useTranslation('landing');
  const [isHydrated, setIsHydrated] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // 중앙 허브 ref
  const containerRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const features = [
    {
      icon: <GlobeIcon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />,
      title: isHydrated
        ? t('features.network_visualization.title')
        : '소개 네트워크 시각화',
      description: isHydrated
        ? t('features.network_visualization.description')
        : '마인드맵 스타일의 그래프로 고객 소개 관계를 시각적으로 파악하고 핵심 소개자를 쉽게 발견하세요.',
    },
    {
      icon: <BarChart2 className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />,
      title: isHydrated
        ? t('features.sales_pipeline.title')
        : '영업 파이프라인 관리',
      description: isHydrated
        ? t('features.sales_pipeline.description')
        : '칸반보드 방식으로 고객을 영업 단계별로 체계적으로 관리하고 계약 전환율을 높이세요.',
    },
    {
      icon: <Users className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />,
      title: isHydrated
        ? t('features.key_referrer_analysis.title')
        : '핵심 소개자 분석',
      description: isHydrated
        ? t('features.key_referrer_analysis.description')
        : '가장 많은 소개를 제공한 고객을 발견하고 관계를 강화하여 소개 네트워크를 확장하세요.',
    },
    {
      icon: <FileText className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />,
      title: isHydrated ? t('features.custom_reports.title') : '맞춤형 보고서',
      description: isHydrated
        ? t('features.custom_reports.description')
        : '소개 패턴과 성공률을 분석하고 맞춤형 보고서로 영업 전략을 최적화하세요.',
    },
    {
      icon: <MessageSquare className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />,
      title: isHydrated
        ? t('features.team_collaboration.title')
        : '팀 협업 기능',
      description: isHydrated
        ? t('features.team_collaboration.description')
        : '팀원들과 함께 소개 네트워크를 관리하고 효과적으로 협업하세요.',
    },
    {
      icon: <Shield className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />,
      title: isHydrated ? t('features.data_security.title') : '데이터 보안',
      description: isHydrated
        ? t('features.data_security.description')
        : '고객 데이터를 안전하게 암호화하여 저장하고 개인정보 보호 규정을 준수합니다.',
    },
  ];

  return (
    <section
      id="features"
      className="relative py-16 sm:py-20 lg:py-24 overflow-hidden bg-background/95"
      ref={containerRef}
    >
      {/* 배경 효과들 - 더 subtle하게 */}
      <div className="absolute inset-0">
        <Particles
          className="absolute inset-0"
          quantity={30}
          ease={60}
          color="#6366f1"
          size={0.2}
        />
      </div>

      {/* 메인 그라데이션 배경 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 헤더 섹션 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{
            duration: shouldReduceMotion ? 0.2 : 0.8,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="text-center mb-12 sm:mb-16 lg:mb-20 max-w-4xl mx-auto"
        >
          <Badge
            className="px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium mb-4 sm:mb-6"
            variant="secondary"
          >
            {isHydrated ? t('features.badge') : '주요 특징'}
          </Badge>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6">
            {isHydrated
              ? t('features.headline')
              : '효율적인 소개 네트워크 관리를 위한 모든 것'}
          </h2>

          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-xs sm:max-w-lg lg:max-w-2xl mx-auto leading-relaxed px-2 sm:px-4 lg:px-0">
            {isHydrated
              ? t('features.description')
              : 'SureCRM은 보험설계사가 소개 네트워크를 효과적으로 관리하고 영업 성과를 높이는 데 필요한 모든 도구를 제공합니다.'}
          </p>
        </motion.div>

        {/* 중앙 허브 - 더 깔끔하게 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex justify-center mb-16"
        >
          <div
            ref={centerRef}
            className="relative p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm border border-primary/10 shadow-lg"
          >
            <Zap className="h-10 w-10 text-primary" />
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5"
              animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>

        {/* 카드 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
