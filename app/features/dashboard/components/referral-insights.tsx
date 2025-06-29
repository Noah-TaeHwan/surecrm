import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import { Progress } from '~/common/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/common/components/ui/tooltip';
import {
  Share1Icon,
  Link2Icon,
  ChevronRightIcon,
  StarFilledIcon,
  StarIcon,
  BarChartIcon,
  QuestionMarkCircledIcon,
} from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useState, useEffect } from 'react';

interface TopReferrer {
  id: string;
  name: string;
  totalReferrals: number;
  successfulConversions: number;
  conversionRate: number;
  lastReferralDate: string;
  rank: number;
  recentActivity: string;
}

interface NetworkStats {
  totalConnections: number;
  networkDepth: number;
  activeReferrers: number;
  monthlyGrowth: number;
}

interface ReferralInsightsProps {
  topReferrers: TopReferrer[];
  networkStats: NetworkStats;
  onViewNetwork?: () => void;
}

export function ReferralInsights({
  topReferrers,
  networkStats,
}: ReferralInsightsProps) {
  const { t } = useTranslation('dashboard');
  const [isHydrated, setIsHydrated] = useState(false);

  // hydration 완료 후에만 번역된 텍스트 렌더링
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <StarFilledIcon className="h-3.5 w-3.5 text-primary" />;
      case 2:
      case 3:
        return <StarIcon className="h-3.5 w-3.5 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-primary/10 text-primary border-primary/20';
      case 2:
      case 3:
        return 'bg-muted/20 text-muted-foreground border-border/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-border/30';
    }
  };

  const getConversionRateColor = (rate: number) => {
    if (rate >= 80) return 'text-primary';
    if (rate >= 60) return 'text-foreground';
    return 'text-muted-foreground';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    // <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="w-full">
      {/* 핵심 소개자 TOP 5 - 주석처리 */}
      {/* <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Share1Icon className="h-4 w-4 text-primary" />
              </div>
              핵심 소개자 TOP 5
            </CardTitle>
            {/* MVP: 핵심 소개자 기능 비활성화 */}
      {/* <Link to="/influencers">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-primary"
              >
                전체 보기
                <ChevronRightIcon className="h-3 w-3 ml-1" />
              </Button>
            </Link> */}
      {/* </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {topReferrers.length > 0 ? (
            <>
              {topReferrers.slice(0, 5).map((referrer) => (
                <div
                  key={referrer.id}
                  className="flex items-center gap-3 p-3 border border-border/30 rounded-lg hover:bg-accent/20 transition-all duration-200"
                >
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Avatar className="w-9 h-9 border border-primary/20">
                        <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                          {referrer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {referrer.rank <= 3 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-background border border-border/30 rounded-full flex items-center justify-center">
                          {getRankIcon(referrer.rank)}
                        </div>
                      )}
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getRankBadgeColor(referrer.rank)}`}
                    >
                      #{referrer.rank}
                    </Badge>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="font-medium text-sm text-foreground">
                        {referrer.name}
                      </p>
                      <Badge
                        variant="secondary"
                        className="text-xs bg-muted/20 text-muted-foreground border-border/30"
                      >
                        {referrer.totalReferrals}건
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">
                        전환률{' '}
                        <span
                          className={`font-medium ${getConversionRateColor(
                            referrer.conversionRate
                          )}`}
                        >
                          {referrer.conversionRate.toFixed(0)}%
                        </span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(referrer.lastReferralDate)}
                      </span>
                    </div>

                    <div className="mb-2">
                      <Progress
                        value={referrer.conversionRate}
                        className="h-1.5"
                      />
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {referrer.recentActivity}
                    </p>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="p-3 bg-muted/20 rounded-full w-fit mx-auto mb-3">
                <Share1Icon className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                소개 데이터가 없습니다
              </p>
            </div>
          )}
        </CardContent>
      </Card> */}

      {/* 소개 네트워크 현황 */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Link2Icon className="h-4 w-4 text-primary" />
              </div>
              {isHydrated
                ? t('referralInsights.networkStatus')
                : '네트워크 현황'}
            </CardTitle>
            <Link to="/network">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-primary"
              >
                {isHydrated ? t('referralInsights.viewDetails') : '자세히 보기'}
                <ChevronRightIcon className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 네트워크 통계 */}
          <TooltipProvider>
            <div className="grid grid-cols-2 gap-3">
              {/* 총 연결 */}
              <div className="text-center p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="text-xl font-bold text-primary mb-1">
                  {networkStats.totalConnections}
                </div>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xs text-muted-foreground">
                    {isHydrated
                      ? t('referralInsights.stats.totalConnections')
                      : '총 연결'}
                  </span>
                  <Tooltip>
                    <TooltipTrigger>
                      <QuestionMarkCircledIcon className="h-3 w-3 text-muted-foreground hover:text-foreground transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p>
                        {isHydrated
                          ? t('referralInsights.tooltips.totalConnections')
                          : '네트워크에 연결된 총 인원 수'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* 최대 깊이 */}
              <div className="text-center p-3 bg-muted/20 border border-border/30 rounded-lg">
                <div className="text-xl font-bold text-foreground mb-1">
                  {networkStats.networkDepth}
                </div>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xs text-muted-foreground">
                    {isHydrated
                      ? t('referralInsights.stats.maxDepth')
                      : '최대 깊이'}
                  </span>
                  <Tooltip>
                    <TooltipTrigger>
                      <QuestionMarkCircledIcon className="h-3 w-3 text-muted-foreground hover:text-foreground transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p>
                        {isHydrated
                          ? t('referralInsights.tooltips.maxDepth')
                          : '소개 네트워크의 최대 단계 수'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* 활성 소개자 */}
              <div className="text-center p-3 bg-muted/20 border border-border/30 rounded-lg">
                <div className="text-xl font-bold text-foreground mb-1">
                  {networkStats.activeReferrers}
                </div>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xs text-muted-foreground">
                    {isHydrated
                      ? t('referralInsights.stats.activeReferrers')
                      : '활성 소개자'}
                  </span>
                  <Tooltip>
                    <TooltipTrigger>
                      <QuestionMarkCircledIcon className="h-3 w-3 text-muted-foreground hover:text-foreground transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p>
                        {isHydrated
                          ? t('referralInsights.tooltips.activeReferrers')
                          : '최근 30일간 활동한 소개자 수'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* 월간 성장 */}
              <div className="text-center p-3 bg-muted/20 border border-border/30 rounded-lg">
                <div className="text-xl font-bold text-foreground mb-1">
                  +{networkStats.monthlyGrowth}%
                </div>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xs text-muted-foreground">
                    {isHydrated
                      ? t('referralInsights.stats.monthlyGrowth')
                      : '월간 성장률'}
                  </span>
                  <Tooltip>
                    <TooltipTrigger>
                      <QuestionMarkCircledIcon className="h-3 w-3 text-muted-foreground hover:text-foreground transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p>
                        {isHydrated
                          ? t('referralInsights.tooltips.monthlyGrowth')
                          : '지난 달 대비 네트워크 성장률'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </TooltipProvider>

          {/* 인사이트 */}
          <div className="p-3 bg-muted/20 border border-border/30 rounded-lg">
            <div className="flex items-start gap-2">
              <BarChartIcon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  {isHydrated
                    ? t('referralInsights.insights.title')
                    : '인사이트'}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isHydrated
                    ? t('referralInsights.insights.growthMessage', {
                        growth: networkStats.monthlyGrowth,
                      })
                    : `이번 달 네트워크가 ${networkStats.monthlyGrowth}% 성장했습니다.`}
                  {topReferrers[0] && (
                    <>
                      {isHydrated
                        ? t('referralInsights.insights.topPerformerMessage', {
                            name: topReferrers[0].name,
                          })
                        : ` ${topReferrers[0].name}님이 가장 활발하게 활동하고 있습니다.`}
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
