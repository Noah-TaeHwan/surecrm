import { Badge } from '~/common/components/ui/badge';
import { BlurFade } from '~/common/components/magicui/blur-fade';
import { DotPattern } from '~/common/components/magicui/dot-pattern';
import { SparklesText } from '~/common/components/magicui/sparkles-text';
import { FlickeringGrid } from '~/common/components/magicui/flickering-grid';
import { AnimatedGridPattern } from '~/common/components/magicui/animated-grid-pattern';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/common/components/ui/tabs';
import { Globe as GlobeIcon, TrendingUp, BarChart2, Check } from 'lucide-react';

interface UseCaseTabProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  backgroundComponent: React.ReactNode;
}

function UseCaseTab({
  icon,
  title,
  description,
  features,
  backgroundComponent,
}: UseCaseTabProps) {
  return (
    <BlurFade delay={0.2} inView>
      <div className="group relative overflow-hidden rounded-3xl bg-card/80 border border-border/60 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative p-12">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/80 to-primary rounded-2xl flex items-center justify-center shadow-lg">
                    {icon}
                  </div>
                  <div>
                    <Badge
                      variant="secondary"
                      className="mb-2 bg-primary/10 text-primary border-primary/20"
                    >
                      {title.split(' ')[0]}
                    </Badge>
                    <h3 className="text-2xl font-bold">{title}</h3>
                  </div>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <div className="relative">
                <div className="w-full h-80 bg-gradient-to-br from-muted/30 to-muted/50 rounded-2xl border border-border/40 flex items-center justify-center overflow-hidden">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="absolute inset-0">
                      {backgroundComponent}
                    </div>
                    <div className="relative z-10 text-center">
                      {icon}
                      <p className="text-primary font-medium mt-4">
                        {title} 프리뷰
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BlurFade>
  );
}

export function UseCasesSection() {
  const useCases = [
    {
      id: 'network',
      icon: <GlobeIcon className="w-8 h-8 text-white" />,
      title: '소개 관계 시각화',
      description:
        '고객 간의 복잡한 소개 관계를 직관적인 그래프로 표현하여 핵심 소개자를 한눈에 파악할 수 있습니다.',
      features: [
        '시각적 네트워크 표시',
        '핵심 소개자 발견',
        '소개 패턴 분석',
        '관계 깊이 파악',
      ],
      backgroundComponent: (
        <DotPattern
          className="opacity-30"
          width={16}
          height={16}
          gap={4}
          radius={1}
          color="var(--primary)"
        />
      ),
    },
    {
      id: 'pipeline',
      icon: <TrendingUp className="w-8 h-8 text-white" />,
      title: '영업 단계 관리',
      description:
        '고객을 영업 단계별로 체계적으로 분류하고 관리하여 효율적인 영업 프로세스를 구축할 수 있습니다.',
      features: [
        '단계별 고객 분류',
        '진행 상황 추적',
        '전환율 개선',
        '업무 효율 향상',
      ],
      backgroundComponent: (
        <FlickeringGrid
          className="opacity-20"
          squareSize={3}
          gridGap={8}
          color="var(--primary)"
          maxOpacity={0.3}
          flickerChance={0.1}
        />
      ),
    },
    {
      id: 'data',
      icon: <BarChart2 className="w-8 h-8 text-white" />,
      title: '데이터 인사이트',
      description:
        '소개 현황과 영업 성과를 직관적인 차트와 통계로 확인하여 데이터 기반 의사결정을 지원합니다.',
      features: [
        '월별 성과 추적',
        '핵심 지표 요약',
        '트렌드 분석',
        '성과 비교',
      ],
      backgroundComponent: (
        <AnimatedGridPattern
          className="opacity-20"
          numSquares={20}
          maxOpacity={0.2}
          duration={3}
          repeatDelay={1}
        />
      ),
    },
  ];

  return (
    <section id="use-cases" className="py-20 relative bg-background">
      <DotPattern
        className="absolute inset-0 opacity-15 pointer-events-none"
        width={28}
        height={28}
        gap={12}
        radius={1.2}
        color="rgba(var(--primary-rgb), 0.25)"
      />

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <Badge
            variant="outline"
            className="mb-3 px-4 py-1.5 text-sm font-medium"
          >
            활용 사례
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-primary">어떻게</span>{' '}
            <SparklesText
              sparklesCount={8}
              colors={{ first: '#F4731F', second: '#A73F03' }}
            >
              활용할 수 있나요?
            </SparklesText>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            다양한 상황에서 SureCRM이 어떻게 도움이 되는지 확인해보세요.
          </p>
        </div>

        <Tabs defaultValue="network" className="max-w-5xl mx-auto">
          <TabsList className="grid grid-cols-3 mb-12 p-1 w-full max-w-lg mx-auto rounded-2xl bg-muted/20 backdrop-blur-sm">
            <TabsTrigger
              value="network"
              className="rounded-xl py-3 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
            >
              <GlobeIcon className="w-4 h-4 mr-2" />
              관계 시각화
            </TabsTrigger>
            <TabsTrigger
              value="pipeline"
              className="rounded-xl py-3 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              영업 관리
            </TabsTrigger>
            <TabsTrigger
              value="data"
              className="rounded-xl py-3 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
            >
              <BarChart2 className="w-4 h-4 mr-2" />
              분석
            </TabsTrigger>
          </TabsList>

          <div className="relative">
            {useCases.map(useCase => (
              <TabsContent key={useCase.id} value={useCase.id} className="mt-0">
                <UseCaseTab
                  icon={useCase.icon}
                  title={useCase.title}
                  description={useCase.description}
                  features={useCase.features}
                  backgroundComponent={useCase.backgroundComponent}
                />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </section>
  );
}
