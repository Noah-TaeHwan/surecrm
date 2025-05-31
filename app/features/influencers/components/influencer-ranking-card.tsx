import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import { Badge } from '~/common/components/ui/badge';
import { Progress } from '~/common/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/common/components/ui/tooltip';
import {
  Heart,
  User,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Star,
  Award,
  Phone,
  MessageCircle,
  Gift,
  Users,
  Target,
  Activity,
  DollarSign,
} from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '~/lib/utils';

// 새로운 타입 시스템 import
import type { InfluencerDisplayData } from '../types';

interface InfluencerRankingCardProps {
  influencers: InfluencerDisplayData[];
  onGratitudeClick: (influencer: InfluencerDisplayData) => void;
  isLoading?: boolean;
  hasMoreData?: boolean;
  period?: string;
}

// 🎨 Tier별 색상과 아이콘 (app.css 색상 체계 적용)
function getTierInfo(tier: string) {
  const tierConfig = {
    diamond: {
      color: 'from-purple-500 to-purple-600 text-white',
      bgColor:
        'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200',
      textColor: 'text-purple-700',
      label: '다이아몬드',
      icon: '💎',
      priority: 5,
    },
    platinum: {
      color: 'from-blue-500 to-blue-600 text-white',
      bgColor: 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200',
      textColor: 'text-blue-700',
      label: '플래티넘',
      icon: '⭐',
      priority: 4,
    },
    gold: {
      color: 'from-yellow-500 to-yellow-600 text-white',
      bgColor:
        'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200',
      textColor: 'text-yellow-700',
      label: '골드',
      icon: '🥇',
      priority: 3,
    },
    silver: {
      color: 'from-gray-400 to-gray-500 text-white',
      bgColor: 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200',
      textColor: 'text-gray-700',
      label: '실버',
      icon: '🥈',
      priority: 2,
    },
    bronze: {
      color: 'from-orange-500 to-orange-600 text-white',
      bgColor:
        'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200',
      textColor: 'text-orange-700',
      label: '브론즈',
      icon: '🥉',
      priority: 1,
    },
  };
  return tierConfig[tier as keyof typeof tierConfig] || tierConfig.bronze;
}

// 🎯 관계 강도 색상 (app.css 기반)
function getRelationshipColor(strength: number) {
  if (strength >= 9) return 'text-green-600 bg-green-50 border-green-200';
  if (strength >= 7) return 'text-blue-600 bg-blue-50 border-blue-200';
  if (strength >= 5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-red-600 bg-red-50 border-red-200';
}

// 🏆 순위별 특별 표시
function getRankBadge(rank: number) {
  if (rank === 1)
    return {
      emoji: '👑',
      label: '1위',
      bgColor: 'bg-gradient-to-r from-yellow-400 to-yellow-500',
      textColor: 'text-white',
    };
  if (rank === 2)
    return {
      emoji: '🥈',
      label: '2위',
      bgColor: 'bg-gradient-to-r from-gray-300 to-gray-400',
      textColor: 'text-white',
    };
  if (rank === 3)
    return {
      emoji: '🥉',
      label: '3위',
      bgColor: 'bg-gradient-to-r from-orange-400 to-orange-500',
      textColor: 'text-white',
    };
  return {
    emoji: '',
    label: `${rank}위`,
    bgColor: 'bg-muted',
    textColor: 'text-muted-foreground',
  };
}

// 📊 데이터 품질 표시
function getDataQualityColor(score: number) {
  if (score >= 8) return 'bg-green-500';
  if (score >= 6) return 'bg-yellow-500';
  return 'bg-red-500';
}

// 🗓️ 감사 표현 필요성 판단
function getGratitudeStatus(lastGratitudeDate: string | null) {
  if (!lastGratitudeDate) {
    return {
      status: 'urgent',
      label: '감사 필요',
      color: 'text-red-600 bg-red-50 border-red-200',
    };
  }

  const daysSince = Math.floor(
    (Date.now() - new Date(lastGratitudeDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSince > 60) {
    return {
      status: 'urgent',
      label: '긴급',
      color: 'text-red-600 bg-red-50 border-red-200',
    };
  } else if (daysSince > 30) {
    return {
      status: 'needed',
      label: '필요',
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    };
  } else if (daysSince > 14) {
    return {
      status: 'soon',
      label: '예정',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    };
  }

  return {
    status: 'done',
    label: '완료',
    color: 'text-green-600 bg-green-50 border-green-200',
  };
}

export function InfluencerRankingCard({
  influencers,
  onGratitudeClick,
  isLoading = false,
  hasMoreData = false,
  period = 'all',
}: InfluencerRankingCardProps) {
  const periodLabels: Record<string, string> = {
    all: '전체 기간',
    last7days: '최근 7일',
    last30days: '최근 30일',
    last3months: '최근 3개월',
    month: '이번 달',
    quarter: '이번 분기',
    year: '올해',
  };

  if (isLoading) {
    return <RankingCardLoading />;
  }

  if (influencers.length === 0) {
    return <EmptyRankingState />;
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* 헤더 정보 */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                핵심 소개자 랭킹
              </h3>
              <Badge variant="secondary" className="text-xs">
                {influencers.length}명
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {periodLabels[period] || '전체 기간'} 기준, 소개 건수·전환율·관계
              강도를 종합한 순위입니다
            </p>
          </div>
          {hasMoreData && (
            <Badge variant="outline" className="text-xs">
              더 많은 데이터 있음
            </Badge>
          )}
        </div>

        {/* 순위 목록 */}
        <div className="space-y-3">
          {influencers.map((influencer, index) => {
            const tierInfo = getTierInfo(influencer.tier);
            const rankBadge = getRankBadge(influencer.rank);
            const relationshipColor = getRelationshipColor(
              influencer.relationshipStrength
            );
            const gratitudeStatus = getGratitudeStatus(
              influencer.lastGratitude
            );

            return (
              <Card
                key={influencer.id}
                className={cn(
                  'group transition-all duration-200 hover:shadow-md border-border/60',
                  influencer.rank <= 3 && 'ring-1 ring-primary/20'
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* 순위 표시 */}
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={cn(
                          'flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg relative',
                          rankBadge.bgColor,
                          rankBadge.textColor
                        )}
                      >
                        <span>{influencer.rank}</span>
                        {rankBadge.emoji && (
                          <span className="absolute -top-1 -right-1 text-sm">
                            {rankBadge.emoji}
                          </span>
                        )}
                      </div>
                      <div
                        className={cn(
                          'text-xs px-2 py-1 rounded-full border',
                          tierInfo.bgColor,
                          tierInfo.textColor
                        )}
                      >
                        {tierInfo.icon} {tierInfo.label}
                      </div>
                    </div>

                    {/* 프로필 정보 */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative">
                        <Avatar className="h-14 w-14 ring-2 ring-background shadow-sm">
                          {influencer.avatar ? (
                            <img
                              src={influencer.avatar}
                              alt={influencer.name}
                              className="object-cover"
                            />
                          ) : (
                            <AvatarFallback
                              className={cn(
                                'text-lg font-semibold bg-gradient-to-br',
                                tierInfo.color
                              )}
                            >
                              {influencer.name[0]}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        {/* 데이터 품질 인디케이터 */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                'absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-sm',
                                getDataQualityColor(
                                  influencer.dataQuality.score
                                )
                              )}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              데이터 품질: {influencer.dataQuality.score}/10
                            </p>
                            <p className="text-xs text-muted-foreground">
                              마지막 업데이트:{' '}
                              {new Date(
                                influencer.dataQuality.lastUpdated
                              ).toLocaleDateString()}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/clients/${influencer.id}`}
                                className="font-semibold text-foreground hover:text-primary truncate group-hover:underline transition-colors"
                              >
                                {influencer.name}
                              </Link>
                              {influencer.isActive && (
                                <Badge variant="outline" className="text-xs">
                                  활성
                                </Badge>
                              )}
                            </div>

                            {/* 핵심 지표들 */}
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3 text-blue-500" />
                                <span className="font-medium">
                                  {influencer.totalReferrals}
                                </span>
                                <span className="text-muted-foreground">
                                  건
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="h-3 w-3 text-green-500" />
                                <span className="font-medium">
                                  {influencer.conversionRate.toFixed(1)}
                                </span>
                                <span className="text-muted-foreground">%</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3 text-purple-500" />
                                <span className="font-medium">
                                  {influencer.totalContractValue >= 100000000
                                    ? `${(
                                        influencer.totalContractValue /
                                        100000000
                                      ).toFixed(1)}억`
                                    : `${(
                                        influencer.totalContractValue / 10000
                                      ).toFixed(0)}만`}
                                </span>
                                <span className="text-muted-foreground">
                                  원
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 관계 강도 */}
                          <div className="text-right">
                            <div
                              className={cn(
                                'text-sm font-medium px-2 py-1 rounded-md border',
                                relationshipColor
                              )}
                            >
                              <Heart className="h-3 w-3 inline mr-1" />
                              {influencer.relationshipStrength.toFixed(1)}/10
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar - 전환율 */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>전환율</span>
                            <span>{influencer.conversionRate.toFixed(1)}%</span>
                          </div>
                          <Progress
                            value={Math.min(influencer.conversionRate, 100)}
                            className="h-2"
                          />
                        </div>

                        {/* 감사 현황 및 액션 */}
                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                'text-xs px-2 py-1 rounded-md border font-medium',
                                gratitudeStatus.color
                              )}
                            >
                              {gratitudeStatus.label}
                            </div>
                            {influencer.lastGratitude && (
                              <span className="text-xs text-muted-foreground">
                                {Math.floor(
                                  (Date.now() -
                                    new Date(
                                      influencer.lastGratitude
                                    ).getTime()) /
                                    (1000 * 60 * 60 * 24)
                                )}
                                일 전
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-primary/10"
                                  asChild
                                >
                                  <Link to={`/clients/${influencer.id}`}>
                                    <User className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>프로필 보기</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-3 gap-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                                  onClick={() => onGratitudeClick(influencer)}
                                >
                                  <Heart className="h-3 w-3" />
                                  <span className="text-xs">감사</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>감사 표현하기</TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 더보기 버튼 */}
        {hasMoreData && (
          <div className="text-center pt-4">
            <Button variant="outline" className="gap-2">
              <Activity className="h-4 w-4" />더 많은 소개자 보기
            </Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

// 🎭 Loading State - 향상된 스켈레톤
function RankingCardLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-6 w-16 bg-muted rounded animate-pulse" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 bg-muted rounded-full" />
                  <div className="w-16 h-6 bg-muted rounded-full" />
                </div>
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-14 h-14 bg-muted rounded-full" />
                  <div className="flex-1 space-y-3">
                    <div className="space-y-1">
                      <div className="h-5 w-24 bg-muted rounded" />
                      <div className="h-4 w-32 bg-muted rounded" />
                    </div>
                    <div className="h-2 w-full bg-muted rounded" />
                    <div className="flex justify-between">
                      <div className="h-6 w-16 bg-muted rounded" />
                      <div className="h-8 w-20 bg-muted rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// 🚫 Empty State
function EmptyRankingState() {
  return (
    <div className="text-center py-12">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Award className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            소개자 데이터가 없습니다
          </h3>
          <p className="text-muted-foreground max-w-sm">
            아직 소개 활동을 한 고객이 없습니다. 고객과의 관계를 구축하고 소개를
            받아보세요.
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Users className="h-4 w-4" />
          고객 관리하기
        </Button>
      </div>
    </div>
  );
}
