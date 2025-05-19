import { Button } from '~/common/components/ui/button';
import { Link } from 'react-router';
import { LandingLayout } from '~/common/layouts/landing-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/common/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/common/components/ui/accordion';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import { Badge } from '~/common/components/ui/badge';
import {
  Terminal,
  TypingAnimation,
  AnimatedSpan,
} from '~/common/components/ui/terminal';
import { Marquee } from '~/common/components/ui/marquee';
import { SparklesText } from '~/common/components/ui/sparkles-text';
import { AnimatedShinyText } from '~/common/components/ui/animated-shiny-text';
import { AnimatedGradientText } from '~/common/components/ui/animated-gradient-text';
import { Lens } from '~/common/components/ui/lens';
import { DotPattern } from '~/common/components/ui/dot-pattern';
import { BlurFade } from '~/common/components/ui/blur-fade';
import { BorderBeam } from '~/common/components/ui/border-beam';
import {
  ArrowRight,
  Check,
  Shield,
  BarChart2,
  Users,
  FileText,
  Globe as GlobeIcon,
  MessageSquare,
} from 'lucide-react';
import { WarpBackground } from '~/common/components/ui/warp-background';
import { MagicCard } from '~/common/components/ui/magic-card';
import { TextReveal } from '~/common/components/ui/text-reveal';
import { ScrollProgress } from '~/common/components/ui/scroll-progress';
import { FloatingNavbar } from '~/common/components/ui/floating-navbar';
import { Globe } from '~/common/components/ui/globe';

export default function LandingPage() {
  const navItems = [
    { label: '홈', href: '#hero' },
    { label: '특징', href: '#features' },
    { label: '활용 사례', href: '#use-cases' },
    { label: '후기', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <LandingLayout>
      <ScrollProgress />
      <FloatingNavbar items={navItems} />

      {/* 히어로 섹션 */}
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
                  <Link to="/login">계정이 있다면 로그인</Link>
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

      {/* 주요 특징 섹션 */}
      <section id="features" className="relative py-20 overflow-hidden">
        <WarpBackground className="absolute inset-0 opacity-10" />
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
            <BlurFade delay={0.1} inView>
              <FeatureCard
                icon={<GlobeIcon className="h-8 w-8 text-primary" />}
                title="소개 네트워크 시각화"
                description="마인드맵 스타일의 그래프로 고객 소개 관계를 시각적으로 파악하고 핵심 소개자를 쉽게 발견하세요."
              />
            </BlurFade>
            <BlurFade delay={0.2} inView>
              <FeatureCard
                icon={<BarChart2 className="h-8 w-8 text-primary" />}
                title="영업 파이프라인 관리"
                description="칸반보드 방식으로 고객을 영업 단계별로 체계적으로 관리하고 계약 전환율을 높이세요."
              />
            </BlurFade>
            <BlurFade delay={0.3} inView>
              <FeatureCard
                icon={<Users className="h-8 w-8 text-primary" />}
                title="핵심 소개자 분석"
                description="가장 많은 소개를 제공한 고객을 발견하고 관계를 강화하여 소개 네트워크를 확장하세요."
              />
            </BlurFade>
            <BlurFade delay={0.4} inView>
              <FeatureCard
                icon={<FileText className="h-8 w-8 text-primary" />}
                title="맞춤형 보고서"
                description="소개 패턴과 성공률을 분석하고 맞춤형 보고서로 영업 전략을 최적화하세요."
              />
            </BlurFade>
            <BlurFade delay={0.5} inView>
              <FeatureCard
                icon={<MessageSquare className="h-8 w-8 text-primary" />}
                title="팀 협업 기능"
                description="팀원들과 함께 소개 네트워크를 관리하고 효과적으로 협업하세요."
              />
            </BlurFade>
            <BlurFade delay={0.6} inView>
              <FeatureCard
                icon={<Shield className="h-8 w-8 text-primary" />}
                title="데이터 보안"
                description="고객 데이터를 안전하게 암호화하여 저장하고 개인정보 보호 규정을 준수합니다."
              />
            </BlurFade>
          </div>
        </div>
      </section>

      {/* 활용 사례 탭 섹션 */}
      <section id="use-cases" className="py-20 relative">
        <DotPattern
          className="absolute inset-0 opacity-20 pointer-events-none"
          width={30}
          height={30}
          radius={1}
          color="rgba(var(--primary-rgb), 0.4)"
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
              <SparklesText
                sparklesCount={8}
                colors={{ first: '#4F46E5', second: '#9333EA' }}
              >
                어떻게 활용할 수 있나요?
              </SparklesText>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              다양한 상황에서 SureCRM이 어떻게 도움이 되는지 확인해보세요.
            </p>
          </div>

          <Tabs defaultValue="network" className="max-w-4xl mx-auto">
            <TabsList className="grid grid-cols-3 mb-8 p-0 w-full max-w-md mx-auto rounded-full">
              <TabsTrigger value="network" className="rounded-full">
                소개 관계 시각화
              </TabsTrigger>
              <TabsTrigger value="pipeline" className="rounded-full">
                영업 관리
              </TabsTrigger>
              <TabsTrigger value="data" className="rounded-full">
                데이터 분석
              </TabsTrigger>
            </TabsList>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-1">
              <TabsContent value="network" className="mt-0">
                <MagicCard className="w-full p-0 overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-semibold">
                        소개 관계를 한눈에
                      </h3>
                      <ul className="space-y-3">
                        <CheckItem>
                          마인드맵 스타일의 상호작용 가능한 그래프 뷰
                        </CheckItem>
                        <CheckItem>
                          핵심 소개자를 중심으로 한 영향력 분석
                        </CheckItem>
                        <CheckItem>소개 경로 추적으로 관계 맥락 파악</CheckItem>
                      </ul>
                    </div>
                    <div className="bg-muted rounded-lg flex items-center justify-center p-6 min-h-[360px]">
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <div className="text-center w-full">
                          <div className="text-primary font-medium text-lg mb-4">
                            네트워크 그래프 시각화
                          </div>
                          <div className="h-[240px] w-full mx-auto mb-4 rounded-lg bg-background/40 flex items-center justify-center border border-border/40 relative overflow-hidden">
                            <GlobeIcon className="w-16 h-16 text-primary/40" />
                            <div className="absolute text-xs text-muted-foreground">
                              서비스 스크린샷 영역
                            </div>
                          </div>
                          <div className="text-muted-foreground max-w-md mx-auto">
                            실제 서비스에서는 고객 간의 소개 관계를 시각화한
                            인터랙티브 네트워크 그래프를 확인할 수 있습니다.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </MagicCard>
              </TabsContent>

              <TabsContent value="pipeline" className="mt-0">
                <MagicCard className="w-full p-0 overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-semibold">
                        효율적인 영업 관리
                      </h3>
                      <ul className="space-y-3">
                        <CheckItem>
                          보험설계사에 최적화된 영업 단계 관리
                        </CheckItem>
                        <CheckItem>
                          드래그 앤 드롭으로 쉽게 고객 상태 업데이트
                        </CheckItem>
                        <CheckItem>단계별 통계 및 전환율 자동 계산</CheckItem>
                      </ul>
                    </div>
                    <div className="bg-muted rounded-lg flex items-center justify-center p-6 min-h-[360px]">
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <div className="text-center w-full">
                          <div className="text-primary font-medium text-lg mb-4">
                            칸반보드 파이프라인
                          </div>
                          <div className="h-[240px] w-full mx-auto mb-4 rounded-lg bg-background/40 flex items-center justify-center border border-border/40 relative overflow-hidden">
                            <BarChart2 className="w-16 h-16 text-primary/40" />
                            <div className="absolute text-xs text-muted-foreground">
                              서비스 스크린샷 영역
                            </div>
                          </div>
                          <div className="text-muted-foreground max-w-md mx-auto">
                            실제 서비스에서는 영업 단계별로 고객을 관리할 수
                            있는 직관적인 칸반보드 인터페이스를 제공합니다.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </MagicCard>
              </TabsContent>

              <TabsContent value="data" className="mt-0">
                <MagicCard className="w-full p-0 overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-semibold">
                        데이터 기반 의사결정
                      </h3>
                      <ul className="space-y-3">
                        <CheckItem>소개 패턴 및 성공률 분석</CheckItem>
                        <CheckItem>잠재적 핵심 소개자 예측 및 발굴</CheckItem>
                        <CheckItem>맞춤형 보고서로 영업 전략 최적화</CheckItem>
                      </ul>
                    </div>
                    <div className="bg-muted rounded-lg flex items-center justify-center p-6 min-h-[360px]">
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <div className="text-center w-full">
                          <div className="text-primary font-medium text-lg mb-4">
                            데이터 분석 대시보드
                          </div>
                          <div className="h-[240px] w-full mx-auto mb-4 rounded-lg bg-background/40 flex items-center justify-center border border-border/40 relative overflow-hidden">
                            <FileText className="w-16 h-16 text-primary/40" />
                            <div className="absolute text-xs text-muted-foreground">
                              서비스 스크린샷 영역
                            </div>
                          </div>
                          <div className="text-muted-foreground max-w-md mx-auto">
                            실제 서비스에서는 소개 패턴과 영업 성과를 분석하는
                            다양한 차트와 통계 정보를 확인할 수 있습니다.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </MagicCard>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>

      {/* 테스티모니얼 섹션 */}
      <section
        id="testimonials"
        className="py-32 bg-muted/30 overflow-visible min-h-[600px]"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge
              variant="outline"
              className="mb-3 px-4 py-1.5 text-sm font-medium"
            >
              신뢰할 수 있는 솔루션
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">사용자 후기</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              SureCRM을 사용하는 보험설계사들의 실제 경험을 들어보세요.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-8">
            <TestimonialCard
              name="김보험 설계사"
              role="15년 경력"
              quote="소개 네트워크를 시각적으로 볼 수 있게 되어 누구에게 집중해야 할지 명확해졌어요. 덕분에 소개 건수가 30% 증가했습니다."
              initial="김"
            />
            <TestimonialCard
              name="박영업 팀장"
              role="GA 소속"
              quote="팀원들과 함께 영업 파이프라인을 관리하면서 계약 전환율이 크게 개선되었습니다. 이제 어떤 단계에서 지연이 발생하는지 쉽게 파악할 수 있어요."
              initial="박"
            />
            <TestimonialCard
              name="이신입 설계사"
              role="경력 1년"
              quote="초보 설계사도 쉽게 사용할 수 있어요. 특히 소개받은 고객을 체계적으로 관리할 수 있게 되어 업무 효율이 크게 향상되었습니다."
              initial="이"
            />
            <TestimonialCard
              name="최지도 이사"
              role="FC 조직장"
              quote="조직원들의 활동을 한눈에 파악하고 효과적으로 지원할 수 있게 되었습니다. 팀 전체의 소개 네트워크를 관리하는 것이 훨씬 쉬워졌어요."
              initial="최"
            />
          </div>
        </div>
      </section>

      {/* FAQ 섹션 */}
      <section id="faq" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge
              variant="outline"
              className="mb-3 px-4 py-1.5 text-sm font-medium"
            >
              자주 묻는 질문
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              궁금한 점이 있으신가요?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              SureCRM에 대해 궁금한 점을 확인하세요.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <FaqItem
                value="item-1"
                question="SureCRM은 무료로 사용할 수 있나요?"
                answer="초대를 통해 가입한 사용자는 베타 기간 동안 모든 기능을 무료로 이용할 수 있습니다. 정식 출시 후에는 기본 기능은 계속 무료로 제공되며, 고급 기능은 유료 플랜으로 제공될 예정입니다."
              />
              <FaqItem
                value="item-2"
                question="어떻게 초대를 받을 수 있나요?"
                answer="현재 SureCRM은 초대 전용 베타 서비스입니다. 이미 사용 중인 보험설계사로부터 초대를 받아 사용하실 수 있습니다."
              />
              <FaqItem
                value="item-3"
                question="기존 고객 데이터를 가져올 수 있나요?"
                answer="네, CSV, 엑셀 파일에서 고객 데이터를 쉽게 가져올 수 있습니다. 또한 구글 연락처와의 연동도 지원합니다. 가져온 후에는 소개 관계를 설정하는 직관적인 인터페이스를 제공합니다."
              />
              <FaqItem
                value="item-4"
                question="데이터는 안전하게 보관되나요?"
                answer="고객의 개인정보 보호는 최우선 과제입니다. 모든 데이터는 암호화되어 저장되며, 해당 사용자만 접근할 수 있습니다. 개인정보 취급방침에 따라 엄격하게 관리됩니다."
              />
              <FaqItem
                value="item-5"
                question="팀원들과 함께 사용할 수 있나요?"
                answer="네, 팀 기능을 통해 여러 설계사가 함께 사용할 수 있습니다. 팀원 초대, 권한 관리, 팀 대시보드 등을 제공하여 협업을 지원합니다."
              />
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-purple-500/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center rounded-3xl bg-white/5 backdrop-blur-sm p-12 border border-white/10">
            <Badge
              variant="outline"
              className="mb-6 bg-primary/10 text-primary px-4 py-1.5 text-sm font-medium"
            >
              지금 시작하세요
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              성공적인 소개 네트워크 관리의 시작
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
    </LandingLayout>
  );
}

// 재사용 가능한 컴포넌트들

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="relative h-full p-6 bg-background/80 backdrop-blur-sm rounded-xl">
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

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
      <span>{children}</span>
    </li>
  );
}

function TestimonialCard({
  name,
  role,
  quote,
  initial,
}: {
  name: string;
  role: string;
  quote: string;
  initial: string;
}) {
  return (
    <Card className="max-w-md mx-4 border-0 bg-white/5 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{name}</CardTitle>
            <CardDescription>{role}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="italic text-muted-foreground">{quote}</p>
      </CardContent>
    </Card>
  );
}

function FaqItem({
  value,
  question,
  answer,
}: {
  value: string;
  question: string;
  answer: string;
}) {
  return (
    <AccordionItem
      value={value}
      className="bg-white/5 backdrop-blur-sm mb-4 overflow-hidden rounded-xl"
    >
      <AccordionTrigger className="px-6 py-5 hover:bg-primary/5 transition-colors duration-300 font-medium">
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 text-primary">
            <span className="text-xs">Q</span>
          </div>
          {question}
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6 border-t border-white/5">
        <div className="pt-4 text-muted-foreground flex">
          <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center mr-3 text-muted-foreground shrink-0 mt-0.5">
            <span className="text-xs">A</span>
          </div>
          <div>{answer}</div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
