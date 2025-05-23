import type { Route } from '.react-router/types/app/features/influencers/pages/+types/influencers-page';
import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/common/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/common/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Input } from '~/common/components/ui/input';
import { Textarea } from '~/common/components/ui/textarea';
import { Badge } from '~/common/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/common/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/common/components/ui/table';
import { Progress } from '~/common/components/ui/progress';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import {
  PersonIcon,
  StarIcon,
  StarFilledIcon,
  BadgeIcon,
  CalendarIcon,
  EnvelopeClosedIcon,
  ArchiveIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  Link2Icon,
  HeartIcon,
  BellIcon,
  CheckIcon,
} from '@radix-ui/react-icons';
import { Link } from 'react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MainLayout } from '~/common/layouts/main-layout';
import { cn } from '~/lib/utils';

// 감사 표현 폼 스키마
const gratitudeSchema = z.object({
  type: z.string(),
  message: z.string().min(1, '메시지를 입력하세요'),
  giftType: z.string().optional(),
  scheduledDate: z.string().optional(),
});

type GratitudeFormData = z.infer<typeof gratitudeSchema>;

export function loader({ request }: Route.LoaderArgs) {
  // TODO: 실제 API에서 데이터 가져오기

  // 핵심 소개자 랭킹 데이터
  const topInfluencers = [
    {
      id: '1',
      name: '김영희',
      avatar: '',
      rank: 1,
      totalReferrals: 12,
      successfulContracts: 8,
      conversionRate: 67,
      totalContractValue: 240000000,
      networkDepth: 3,
      networkWidth: 15,
      lastGratitude: '2024-01-10',
      monthlyReferrals: [2, 3, 4, 3], // 최근 4개월
      referralPattern: {
        family: 6,
        health: 3,
        car: 2,
        life: 1,
      },
      relationshipStrength: 95,
    },
    {
      id: '2',
      name: '박철수',
      avatar: '',
      rank: 2,
      totalReferrals: 10,
      successfulContracts: 7,
      conversionRate: 70,
      totalContractValue: 180000000,
      networkDepth: 2,
      networkWidth: 12,
      lastGratitude: '2024-01-05',
      monthlyReferrals: [3, 2, 3, 2],
      referralPattern: {
        car: 4,
        health: 3,
        family: 2,
        life: 1,
      },
      relationshipStrength: 88,
    },
    {
      id: '3',
      name: '이민수',
      avatar: '',
      rank: 3,
      totalReferrals: 8,
      successfulContracts: 6,
      conversionRate: 75,
      totalContractValue: 150000000,
      networkDepth: 2,
      networkWidth: 10,
      lastGratitude: '2023-12-20',
      monthlyReferrals: [2, 2, 2, 2],
      referralPattern: {
        health: 4,
        family: 3,
        life: 1,
      },
      relationshipStrength: 82,
    },
    {
      id: '4',
      name: '정수연',
      avatar: '',
      rank: 4,
      totalReferrals: 6,
      successfulContracts: 5,
      conversionRate: 83,
      totalContractValue: 120000000,
      networkDepth: 1,
      networkWidth: 6,
      lastGratitude: '2024-01-15',
      monthlyReferrals: [1, 2, 2, 1],
      referralPattern: {
        family: 4,
        health: 2,
      },
      relationshipStrength: 90,
    },
  ];

  // 감사 관리 데이터
  const gratitudeHistory = [
    {
      id: '1',
      influencerId: '1',
      influencerName: '김영희',
      type: 'message',
      message: '항상 좋은 분들을 소개해주셔서 감사합니다.',
      giftType: null,
      sentDate: '2024-01-10',
      scheduledDate: null,
      status: 'sent',
    },
    {
      id: '2',
      influencerId: '2',
      influencerName: '박철수',
      type: 'gift',
      message: '새해 복 많이 받으시고, 올해도 잘 부탁드립니다.',
      giftType: 'flower',
      sentDate: null,
      scheduledDate: '2024-02-01',
      status: 'scheduled',
    },
  ];

  // 네트워크 효과 분석
  const networkAnalysis = {
    totalInfluencers: topInfluencers.length,
    averageConversionRate: 71,
    totalNetworkValue: 690000000,
    avgNetworkDepth: 2.0,
    avgNetworkWidth: 10.8,
    monthlyGrowth: 12, // percentage
  };

  return {
    topInfluencers,
    gratitudeHistory,
    networkAnalysis,
  };
}

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '핵심 소개자 - SureCRM' },
    {
      name: 'description',
      content: '가장 많은 소개를 제공한 고객을 관리합니다',
    },
  ];
}

export default function InfluencersPage({ loaderData }: Route.ComponentProps) {
  const { topInfluencers, gratitudeHistory, networkAnalysis } = loaderData;

  const [activeTab, setActiveTab] = useState('ranking');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [isGratitudeOpen, setIsGratitudeOpen] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<any>(null);

  // 감사 표현 폼
  const form = useForm<GratitudeFormData>({
    resolver: zodResolver(gratitudeSchema),
    defaultValues: {
      type: 'message',
      message: '',
      giftType: '',
      scheduledDate: '',
    },
  });

  // 감사 표현 제출
  const onSubmitGratitude = (data: GratitudeFormData) => {
    console.log('감사 표현:', {
      ...data,
      influencerId: selectedInfluencer?.id,
    });
    setIsGratitudeOpen(false);
    form.reset();
  };

  // 관계 강도별 색상
  const getRelationshipColor = (strength: number) => {
    if (strength >= 90) return 'text-green-600';
    if (strength >= 80) return 'text-blue-600';
    if (strength >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 소개 패턴 차트 렌더링
  const renderReferralPattern = (
    pattern: Record<string, number | undefined>
  ) => {
    const entries = Object.entries(pattern).filter(
      ([_, count]) => count && count > 0
    );
    const total = entries.reduce((sum, [_, count]) => sum + (count || 0), 0);
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
    ];

    return (
      <div className="space-y-2">
        {entries.map(([type, count], index) => (
          <div key={type} className="flex items-center gap-2">
            <div
              className={cn('w-3 h-3 rounded', colors[index % colors.length])}
            />
            <span className="text-sm">{type}</span>
            <span className="text-sm text-muted-foreground">
              {count}건 ({Math.round(((count || 0) / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <MainLayout title="핵심 소개자">
      <div className="container mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">핵심 소개자</h1>
            <p className="text-muted-foreground">
              소개 네트워크의 핵심 인물들을 분석하고 관리하세요
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 기간</SelectItem>
                <SelectItem value="year">올해</SelectItem>
                <SelectItem value="quarter">이번 분기</SelectItem>
                <SelectItem value="month">이번 달</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 요약 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>총 핵심 소개자</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                {networkAnalysis.totalInfluencers}명
                <BadgeIcon className="h-5 w-5 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>평균 계약 전환율</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {networkAnalysis.averageConversionRate}%
              </div>
              <Progress
                value={networkAnalysis.averageConversionRate}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>총 네트워크 가치</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(networkAnalysis.totalNetworkValue / 100000000).toFixed(1)}억원
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                월 성장률 +{networkAnalysis.monthlyGrowth}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>평균 네트워크 규모</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-lg font-bold">
                  깊이 {networkAnalysis.avgNetworkDepth}단계
                </div>
                <div className="text-lg font-bold">
                  폭 {networkAnalysis.avgNetworkWidth}명
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 탭 컨텐츠 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="ranking">소개자 랭킹</TabsTrigger>
            <TabsTrigger value="analysis">영향력 분석</TabsTrigger>
            <TabsTrigger value="gratitude">감사 관리</TabsTrigger>
          </TabsList>

          {/* 소개자 랭킹 탭 */}
          <TabsContent value="ranking" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>핵심 소개자 순위</CardTitle>
                <CardDescription>
                  소개 건수, 계약 전환율, 네트워크 영향력을 종합한 순위입니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topInfluencers.map((influencer, index) => (
                    <div
                      key={influencer.id}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50"
                      data-clickable="true"
                    >
                      {/* 순위 */}
                      <div className="flex items-center justify-center w-12 h-12">
                        {index < 3 ? (
                          <div
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold',
                              index === 0
                                ? 'bg-yellow-500'
                                : index === 1
                                ? 'bg-gray-400'
                                : 'bg-orange-500'
                            )}
                          >
                            {index + 1}
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                        )}
                      </div>

                      {/* 프로필 */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="text-lg">
                            {influencer.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <Link
                            to={`/clients/${influencer.id}`}
                            className="font-medium hover:underline"
                          >
                            {influencer.name}
                          </Link>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>총 소개: {influencer.totalReferrals}건</span>
                            <span>
                              성공: {influencer.successfulContracts}건
                            </span>
                            <span>전환율: {influencer.conversionRate}%</span>
                          </div>
                        </div>
                      </div>

                      {/* 네트워크 정보 */}
                      <div className="hidden md:block text-center">
                        <div className="font-medium">네트워크</div>
                        <div className="text-sm text-muted-foreground">
                          {influencer.networkDepth}단계 •{' '}
                          {influencer.networkWidth}명
                        </div>
                      </div>

                      {/* 계약 가치 */}
                      <div className="hidden lg:block text-center">
                        <div className="font-medium">총 계약가치</div>
                        <div className="text-sm">
                          {(influencer.totalContractValue / 100000000).toFixed(
                            1
                          )}
                          억원
                        </div>
                      </div>

                      {/* 관계 강도 */}
                      <div className="text-center">
                        <div className="font-medium">관계 강도</div>
                        <div
                          className={cn(
                            'text-sm font-bold',
                            getRelationshipColor(
                              influencer.relationshipStrength
                            )
                          )}
                        >
                          {influencer.relationshipStrength}%
                        </div>
                      </div>

                      {/* 액션 */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedInfluencer(influencer);
                            setIsGratitudeOpen(true);
                          }}
                        >
                          <HeartIcon className="h-4 w-4 mr-1" />
                          감사
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 영향력 분석 탭 */}
          <TabsContent value="analysis" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {topInfluencers.slice(0, 4).map((influencer) => (
                <Card key={influencer.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{influencer.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {influencer.name}
                        </CardTitle>
                        <CardDescription>
                          #{influencer.rank} 순위
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* 월별 소개 트렌드 */}
                      <div>
                        <div className="text-sm font-medium mb-2">
                          월별 소개 건수
                        </div>
                        <div className="flex items-end gap-1 h-20">
                          {influencer.monthlyReferrals.map((count, index) => (
                            <div
                              key={index}
                              className="flex-1 flex flex-col items-center"
                            >
                              <div
                                className="bg-primary w-full rounded-t"
                                style={{ height: `${(count / 4) * 100}%` }}
                              />
                              <div className="text-xs text-muted-foreground mt-1">
                                {count}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 소개 패턴 */}
                      <div>
                        <div className="text-sm font-medium mb-2">
                          소개 패턴
                        </div>
                        {renderReferralPattern(influencer.referralPattern)}
                      </div>

                      {/* 네트워크 효과 */}
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                        <div className="text-center">
                          <div className="text-lg font-bold">
                            {influencer.networkDepth}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            소개 깊이
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">
                            {influencer.networkWidth}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            네트워크 폭
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 감사 관리 탭 */}
          <TabsContent value="gratitude" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 감사 표현 필요 */}
              <Card>
                <CardHeader>
                  <CardTitle>감사 표현 필요</CardTitle>
                  <CardDescription>
                    마지막 감사 표현 후 30일이 지난 소개자들
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topInfluencers
                      .filter((i) => {
                        const lastDate = new Date(i.lastGratitude);
                        const now = new Date();
                        const diffDays =
                          (now.getTime() - lastDate.getTime()) /
                          (1000 * 60 * 60 * 24);
                        return diffDays > 30;
                      })
                      .map((influencer) => (
                        <div
                          key={influencer.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                          data-clickable="true"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {influencer.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {influencer.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                마지막 감사: {influencer.lastGratitude}
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedInfluencer(influencer);
                              setIsGratitudeOpen(true);
                            }}
                          >
                            <HeartIcon className="h-4 w-4 mr-1" />
                            감사 표현
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* 감사 히스토리 */}
              <Card>
                <CardHeader>
                  <CardTitle>최근 감사 활동</CardTitle>
                  <CardDescription>
                    감사 메시지와 선물 발송 기록
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {gratitudeHistory.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-3 border rounded-lg"
                      >
                        <div
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center',
                            item.status === 'sent'
                              ? 'bg-green-100'
                              : 'bg-blue-100'
                          )}
                        >
                          {item.type === 'gift' ? (
                            <ArchiveIcon className="h-4 w-4" />
                          ) : (
                            <EnvelopeClosedIcon className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">
                            {item.influencerName}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.message}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>
                              {item.status === 'sent' ? '발송일' : '예정일'}:
                              {item.sentDate || item.scheduledDate}
                            </span>
                            {item.giftType && (
                              <Badge variant="outline" className="text-xs">
                                {item.giftType}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* 감사 표현 모달 */}
        {selectedInfluencer && (
          <Dialog open={isGratitudeOpen} onOpenChange={setIsGratitudeOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedInfluencer.name}님께 감사 표현
                </DialogTitle>
                <DialogDescription>
                  소중한 소개에 대한 감사의 마음을 전하세요
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmitGratitude)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>감사 유형</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="유형 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="message">메시지만</SelectItem>
                            <SelectItem value="gift">선물 + 메시지</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  {form.watch('type') === 'gift' && (
                    <FormField
                      control={form.control}
                      name="giftType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>선물 종류</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="선물 선택" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="flower">꽃다발</SelectItem>
                              <SelectItem value="gift_card">상품권</SelectItem>
                              <SelectItem value="fruit">과일바구니</SelectItem>
                              <SelectItem value="custom">기타</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>감사 메시지</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={4}
                            placeholder="진심어린 감사의 마음을 전해주세요..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="scheduledDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>발송 예정일 (선택사항)</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormDescription>
                          비워두면 즉시 발송됩니다
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsGratitudeOpen(false)}
                    >
                      취소
                    </Button>
                    <Button type="submit">
                      <CheckIcon className="mr-2 h-4 w-4" />
                      감사 표현 하기
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
}
