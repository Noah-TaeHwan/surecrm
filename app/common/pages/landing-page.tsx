import { Button } from '~/common/components/ui/button';
import { Link } from 'react-router';
import { LandingLayout } from '~/common/layouts/landing-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '~/common/components/ui/avatar';
import { Separator } from '~/common/components/ui/separator';
import { Badge } from '~/common/components/ui/badge';

export default function LandingPage() {
  return (
    <LandingLayout>
      {/* 히어로 섹션 */}
      <section className="py-24 px-8 bg-gradient-to-b from-background to-muted">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge className="px-3 py-1 text-sm" variant="secondary">
              초대 전용 베타
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              보험설계사를 위한
              <br />
              <span className="text-primary">소개 네트워크</span> 관리 솔루션
            </h1>
            <p className="text-xl text-muted-foreground max-w-md">
              누가 누구를 소개했는지 시각적으로 체계화하고 소개 네트워크의 힘을
              극대화하세요
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/invite-only">초대 코드가 있으신가요?</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">계정이 있다면 로그인</Link>
              </Button>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="absolute -left-4 -top-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
            <div className="relative border rounded-xl shadow-xl overflow-hidden">
              <img
                src="/images/dashboard-preview.png"
                alt="SureCRM 대시보드 미리보기"
                className="w-full h-auto rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 주요 기능 섹션 */}
      <section className="py-24 px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">주요 기능</h2>
            <p className="text-muted-foreground text-lg">
              SureCRM은 보험설계사가 소개 네트워크를 효과적으로 관리하고 영업
              성과를 높이는 데 필요한 모든 도구를 제공합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card border-border shadow-sm transition duration-300 hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">소개 네트워크 시각화</CardTitle>
                <CardDescription>소개 관계를 한눈에 파악</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  옵시디언 스타일 그래프 뷰로 고객 소개 관계를 시각적으로
                  파악하고 핵심 소개자를 쉽게 발견하세요.
                </p>
              </CardContent>
              <CardFooter>
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  네트워크 분석
                </Badge>
              </CardFooter>
            </Card>

            <Card className="bg-card border-border shadow-sm transition duration-300 hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">영업 파이프라인 관리</CardTitle>
                <CardDescription>단계별 고객 관리</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  칸반보드 방식으로 고객을 영업 단계별로 체계적으로 관리하고
                  계약 전환율을 높이세요.
                </p>
              </CardContent>
              <CardFooter>
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  영업 효율화
                </Badge>
              </CardFooter>
            </Card>

            <Card className="bg-card border-border shadow-sm transition duration-300 hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">핵심 소개자 분석</CardTitle>
                <CardDescription>소개 영향력 측정</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  가장 많은 소개를 제공한 고객을 발견하고 관계를 강화하여 소개
                  네트워크를 확장하세요.
                </p>
              </CardContent>
              <CardFooter>
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  관계 강화
                </Badge>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* 사용 사례 탭 섹션 */}
      <section className="py-24 px-8 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              어떻게 활용할 수 있나요?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              다양한 상황에서 SureCRM이 어떻게 도움이 되는지 확인해보세요.
            </p>
          </div>

          <Tabs defaultValue="network" className="max-w-4xl mx-auto">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="network">소개 관계 시각화</TabsTrigger>
              <TabsTrigger value="pipeline">영업 관리</TabsTrigger>
              <TabsTrigger value="data">데이터 분석</TabsTrigger>
            </TabsList>
            <TabsContent
              value="network"
              className="bg-card p-6 rounded-lg border shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-semibold mb-4">
                    소개 관계를 한눈에
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>마인드맵 스타일의 상호작용 가능한 그래프 뷰</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>핵심 소개자를 중심으로 한 영향력 분석</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>소개 경로 추적으로 관계 맥락 파악</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-muted p-4 rounded-lg aspect-video flex items-center justify-center">
                  <p className="text-muted-foreground italic text-center">
                    네트워크 그래프 시각화 미리보기
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent
              value="pipeline"
              className="bg-card p-6 rounded-lg border shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-semibold mb-4">
                    효율적인 영업 관리
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>보험설계사에 최적화된 영업 단계 관리</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>드래그 앤 드롭으로 쉽게 고객 상태 업데이트</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>단계별 통계 및 전환율 자동 계산</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-muted p-4 rounded-lg aspect-video flex items-center justify-center">
                  <p className="text-muted-foreground italic text-center">
                    칸반보드 파이프라인 미리보기
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent
              value="data"
              className="bg-card p-6 rounded-lg border shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-semibold mb-4">
                    데이터 기반 의사결정
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>소개 패턴 및 성공률 분석</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>잠재적 핵심 소개자 예측 및 발굴</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>맞춤형 보고서로 영업 전략 최적화</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-muted p-4 rounded-lg aspect-video flex items-center justify-center">
                  <p className="text-muted-foreground italic text-center">
                    데이터 분석 대시보드 미리보기
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* 테스티모니얼 섹션 */}
      <section className="py-24 px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">사용자 후기</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              SureCRM을 사용하는 보험설계사들의 실제 경험을 들어보세요.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>김</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">김보험 설계사</CardTitle>
                    <CardDescription>15년 경력</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="italic text-muted-foreground">
                  "소개 네트워크를 시각적으로 볼 수 있게 되어 누구에게 집중해야
                  할지 명확해졌어요. 덕분에 소개 건수가 30% 증가했습니다."
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>박</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">박영업 팀장</CardTitle>
                    <CardDescription>GA 소속</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="italic text-muted-foreground">
                  "팀원들과 함께 영업 파이프라인을 관리하면서 계약 전환율이 크게
                  개선되었습니다. 이제 어떤 단계에서 지연이 발생하는지 쉽게
                  파악할 수 있어요."
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>이</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">이신입 설계사</CardTitle>
                    <CardDescription>경력 1년</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="italic text-muted-foreground">
                  "초보 설계사도 쉽게 사용할 수 있어요. 특히 소개받은 고객을
                  체계적으로 관리할 수 있게 되어 업무 효율이 크게
                  향상되었습니다."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ 섹션 */}
      <section className="py-24 px-8 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">자주 묻는 질문</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              SureCRM에 대해 궁금한 점을 확인하세요.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  SureCRM은 무료로 사용할 수 있나요?
                </AccordionTrigger>
                <AccordionContent>
                  초대를 통해 가입한 사용자는 베타 기간 동안 모든 기능을 무료로
                  이용할 수 있습니다. 정식 출시 후에는 기본 기능은 계속 무료로
                  제공되며, 고급 기능은 유료 플랜으로 제공될 예정입니다.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>
                  어떻게 초대를 받을 수 있나요?
                </AccordionTrigger>
                <AccordionContent>
                  현재 SureCRM은 초대 전용 베타 서비스입니다. 이미 사용 중인
                  보험설계사로부터 초대를 받아 사용하실 수 있습니다.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>
                  기존 고객 데이터를 가져올 수 있나요?
                </AccordionTrigger>
                <AccordionContent>
                  네, CSV, 엑셀 파일에서 고객 데이터를 쉽게 가져올 수 있습니다.
                  또한 구글 연락처와의 연동도 지원합니다. 가져온 후에는 소개
                  관계를 설정하는 직관적인 인터페이스를 제공합니다.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>
                  데이터는 안전하게 보관되나요?
                </AccordionTrigger>
                <AccordionContent>
                  고객의 개인정보 보호는 최우선 과제입니다. 모든 데이터는
                  암호화되어 저장되며, 해당 사용자만 접근할 수 있습니다.
                  개인정보 취급방침에 따라 엄격하게 관리됩니다.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>
                  팀원들과 함께 사용할 수 있나요?
                </AccordionTrigger>
                <AccordionContent>
                  네, 팀 기능을 통해 여러 설계사가 함께 사용할 수 있습니다. 팀원
                  초대, 권한 관리, 팀 대시보드 등을 제공하여 협업을 지원합니다.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-24 px-8">
        <div className="container mx-auto">
          <div className="bg-primary/10 rounded-2xl p-10 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">지금 바로 시작하세요</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              소개 네트워크의 힘을 극대화하고 영업 성과를 높일 준비가 되셨나요?
              <br />
              SureCRM과 함께 더 체계적인 고객 관리를 시작하세요.
            </p>
            <Button size="lg" className="px-8" asChild>
              <Link to="/invite-only">초대 코드가 있으신가요?</Link>
            </Button>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
