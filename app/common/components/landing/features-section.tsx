import { Badge } from '~/common/components/ui/badge';
import { BlurFade } from '~/common/components/ui/blur-fade';
import { BorderBeam } from '~/common/components/ui/border-beam';
import { AnimatedGradientText } from '~/common/components/ui/animated-gradient-text';
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
    <div className="relative h-full p-6 bg-background/90 backdrop-blur-sm rounded-xl border border-border/40 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
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
  const features = [
    {
      icon: <GlobeIcon className="h-8 w-8 text-primary" />,
      title: '소개 네트워크 시각화',
      description:
        '마인드맵 스타일의 그래프로 고객 소개 관계를 시각적으로 파악하고 핵심 소개자를 쉽게 발견하세요.',
    },
    {
      icon: <BarChart2 className="h-8 w-8 text-primary" />,
      title: '영업 파이프라인 관리',
      description:
        '칸반보드 방식으로 고객을 영업 단계별로 체계적으로 관리하고 계약 전환율을 높이세요.',
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: '핵심 소개자 분석',
      description:
        '가장 많은 소개를 제공한 고객을 발견하고 관계를 강화하여 소개 네트워크를 확장하세요.',
    },
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: '맞춤형 보고서',
      description:
        '소개 패턴과 성공률을 분석하고 맞춤형 보고서로 영업 전략을 최적화하세요.',
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      title: '팀 협업 기능',
      description:
        '팀원들과 함께 소개 네트워크를 관리하고 효과적으로 협업하세요.',
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: '데이터 보안',
      description:
        '고객 데이터를 안전하게 암호화하여 저장하고 개인정보 보호 규정을 준수합니다.',
    },
  ];

  return (
    <section
      id="features"
      className="relative py-20 overflow-hidden bg-muted/30"
    >
      <FlickeringGrid
        className="absolute inset-0 opacity-10"
        squareSize={4}
        gridGap={6}
        color="#6B7280"
        maxOpacity={0.3}
        flickerChance={0.1}
      />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <Badge
            variant="outline"
            className="mb-3 px-4 py-1.5 text-sm font-medium"
          >
            주요 특징
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            효율적인{' '}
            <AnimatedGradientText>소개 네트워크 관리</AnimatedGradientText>를
            위한 모든 것
          </h2>
          <p className="text-muted-foreground">
            SureCRM은 보험설계사가 소개 네트워크를 효과적으로 관리하고
            <br />
            영업 성과를 높이는 데 필요한 모든 도구를 제공합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <BlurFade key={index} delay={0.1 * (index + 1)} inView>
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
