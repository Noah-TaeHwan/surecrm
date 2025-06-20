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
      <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-card/80 border border-border/60 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative p-6 sm:p-8 lg:p-12">
          <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-12 sm:w-14 lg:w-16 h-12 sm:h-14 lg:h-16 bg-gradient-to-br from-primary/80 to-primary rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                {icon}
              </div>
              <div className="text-center sm:text-left">
                <Badge
                  variant="secondary"
                  className="mb-1 sm:mb-2 bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm"
                >
                  {title.split(' ')[0]}
                </Badge>
                <h3 className="text-xl sm:text-2xl font-bold leading-tight">{title}</h3>
              </div>
            </div>
            
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed max-w-lg sm:max-w-xl lg:max-w-2xl mx-auto px-2 sm:px-0">
              {description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-xs sm:max-w-lg lg:max-w-2xl mx-auto pt-4 sm:pt-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-left">
                  <div className="w-6 sm:w-7 lg:w-8 h-6 sm:h-7 lg:h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 sm:w-3.5 lg:w-4 h-3 sm:h-3.5 lg:h-4 text-primary" />
                  </div>
                  <span className="text-sm sm:text-base font-medium">{feature}</span>
                </div>
              ))}
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
    <section id="use-cases" className="py-16 sm:py-20 lg:py-24 relative bg-background">
      <DotPattern
        className="absolute inset-0 opacity-15 pointer-events-none"
        width={28}
        height={28}
        gap={12}
        radius={1.2}
        color="rgba(var(--primary-rgb), 0.25)"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12 sm:mb-16">
          <Badge
            variant="outline"
            className="mb-3 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium"
          >
            활용 사례
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
            <span className="text-primary">어떻게</span>{' '}
            <SparklesText
              sparklesCount={8}
              colors={{ first: '#F4731F', second: '#A73F03' }}
            >
              활용할 수 있나요?
            </SparklesText>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xs sm:max-w-lg lg:max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
            다양한 상황에서 SureCRM이 어떻게 도움이 되는지 확인해보세요.
          </p>
        </div>

        <Tabs defaultValue="network" className="max-w-5xl mx-auto">
          <TabsList className="grid grid-cols-3 mb-8 sm:mb-12 p-1 w-full max-w-sm sm:max-w-lg mx-auto rounded-xl sm:rounded-2xl bg-muted/20 backdrop-blur-sm">
            <TabsTrigger
              value="network"
              className="rounded-lg sm:rounded-xl py-2 sm:py-3 px-2 sm:px-6 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
            >
              <GlobeIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">관계 시각화</span>
              <span className="sm:hidden">관계</span>
            </TabsTrigger>
            <TabsTrigger
              value="pipeline"
              className="rounded-lg sm:rounded-xl py-2 sm:py-3 px-2 sm:px-6 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
            >
              <TrendingUp className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">영업 관리</span>
              <span className="sm:hidden">영업</span>
            </TabsTrigger>
            <TabsTrigger
              value="data"
              className="rounded-lg sm:rounded-xl py-2 sm:py-3 px-2 sm:px-6 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
            >
              <BarChart2 className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">분석</span>
              <span className="sm:hidden">분석</span>
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
