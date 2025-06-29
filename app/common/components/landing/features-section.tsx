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
        y: shouldReduceMotion ? 0 : 60,
        scale: shouldReduceMotion ? 1 : 0.95,
      }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: shouldReduceMotion ? 0.2 : 0.8,
        delay: shouldReduceMotion ? 0 : index * 0.1,
        ease: [0.16, 1, 0.3, 1],
        type: 'spring',
        damping: 20,
        stiffness: 300,
      }}
      whileHover={{
        y: shouldReduceMotion ? 0 : -8,
        scale: shouldReduceMotion ? 1 : 1.02,
        transition: { duration: 0.3, ease: 'easeOut' },
      }}
      className="h-full group"
    >
      <Card className="h-full p-6 relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:border-border transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/5">
        {/* 배경 파티클 효과 - 더 subtle하게 */}
        <Particles
          className="absolute inset-0 opacity-20"
          quantity={8}
          ease={50}
          color="#6366f1"
          size={0.3}
        />

        <motion.div
          initial={{
            scale: shouldReduceMotion ? 1 : 0,
            rotate: shouldReduceMotion ? 0 : -45,
          }}
          whileInView={{ scale: 1, rotate: 0 }}
          transition={{
            delay: shouldReduceMotion ? 0 : index * 0.1 + 0.3,
            duration: shouldReduceMotion ? 0.2 : 0.6,
            type: 'spring',
            damping: 15,
            stiffness: 400,
          }}
          className="relative z-10 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent w-16 h-16 flex items-center justify-center mb-6 group-hover:from-primary/15 group-hover:via-primary/8 transition-all duration-300"
        >
          <motion.div
            whileHover={{ rotate: 12, scale: 1.1 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="text-primary"
          >
            {icon}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{
            delay: shouldReduceMotion ? 0 : index * 0.1 + 0.4,
            duration: shouldReduceMotion ? 0.2 : 0.5,
            ease: 'easeOut',
          }}
          className="relative z-10"
        >
          <h3 className="text-xl font-bold mb-4 leading-tight text-foreground group-hover:text-primary transition-colors duration-300 flex items-center gap-2">
            {title}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.6, duration: 0.3 }}
            >
              <Sparkles className="h-4 w-4 text-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          </h3>
          <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
            {description}
          </p>
        </motion.div>

        {/* Subtle hover glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/2 via-transparent to-primary/2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          initial={false}
        />
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
      icon: <GlobeIcon className="h-8 w-8" />,
      title: isHydrated
        ? t('features.network_visualization.title')
        : '소개 네트워크 시각화',
      description: isHydrated
        ? t('features.network_visualization.description')
        : '마인드맵 스타일의 그래프로 고객 소개 관계를 시각적으로 파악하고 핵심 소개자를 쉽게 발견하세요.',
    },
    {
      icon: <BarChart2 className="h-8 w-8" />,
      title: isHydrated
        ? t('features.sales_pipeline.title')
        : '영업 파이프라인 관리',
      description: isHydrated
        ? t('features.sales_pipeline.description')
        : '칸반보드 방식으로 고객을 영업 단계별로 체계적으로 관리하고 계약 전환율을 높이세요.',
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: isHydrated
        ? t('features.key_referrer_analysis.title')
        : '핵심 소개자 분석',
      description: isHydrated
        ? t('features.key_referrer_analysis.description')
        : '가장 많은 소개를 제공한 고객을 발견하고 관계를 강화하여 소개 네트워크를 확장하세요.',
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: isHydrated ? t('features.custom_reports.title') : '맞춤형 보고서',
      description: isHydrated
        ? t('features.custom_reports.description')
        : '소개 패턴과 성공률을 분석하고 맞춤형 보고서로 영업 전략을 최적화하세요.',
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: isHydrated
        ? t('features.team_collaboration.title')
        : '팀 협업 기능',
      description: isHydrated
        ? t('features.team_collaboration.description')
        : '팀원들과 함께 소개 네트워크를 관리하고 효과적으로 협업하세요.',
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: isHydrated ? t('features.data_security.title') : '데이터 보안',
      description: isHydrated
        ? t('features.data_security.description')
        : '고객 데이터를 안전하게 암호화하여 저장하고 개인정보 보호 규정을 준수합니다.',
    },
  ];

  return (
    <section
      id="features"
      className="relative py-24 overflow-hidden bg-background/95"
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

      <div className="container mx-auto px-4 relative z-10">
        {/* 헤더 섹션 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{
            duration: shouldReduceMotion ? 0.3 : 1,
            staggerChildren: shouldReduceMotion ? 0 : 0.2,
            delayChildren: shouldReduceMotion ? 0 : 0.3,
          }}
          className="text-center mb-20 max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0.3 : 1,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <Badge
              variant="outline"
              className="mb-6 px-6 py-2 text-base font-medium border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors duration-300"
            >
              <Star className="h-4 w-4 mr-2" />
              {isHydrated ? t('features.badge') : '주요 특징'}
            </Badge>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0.3 : 1.2,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="text-5xl md:text-6xl font-bold mb-8 leading-tight bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent"
          >
            {isHydrated ? (
              <>
                효율적인{' '}
                <AnimatedGradientText className="bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
                  소개 네트워크 관리
                </AnimatedGradientText>
                <br />를 위한 모든 것
              </>
            ) : (
              <>
                효율적인{' '}
                <AnimatedGradientText>소개 네트워크 관리</AnimatedGradientText>
                를 위한 모든 것
              </>
            )}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0.3 : 1,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto"
          >
            {isHydrated
              ? t('features.description')
              : 'SureCRM은 보험설계사가 소개 네트워크를 효과적으로 관리하고 영업 성과를 높이는 데 필요한 모든 도구를 제공합니다.'}
          </motion.p>
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

        {/* 특징 카드 그리드 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{
            duration: shouldReduceMotion ? 0.3 : 0.8,
            staggerChildren: shouldReduceMotion ? 0 : 0.15,
            delayChildren: shouldReduceMotion ? 0 : 0.4,
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
