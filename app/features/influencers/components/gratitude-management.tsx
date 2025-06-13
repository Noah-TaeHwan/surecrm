import { useState } from 'react';
import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import { Progress } from '~/common/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/common/components/ui/tooltip';
import { Input } from '~/common/components/ui/input';
import {
  BellIcon,
  CheckIcon,
  HeartIcon,
  ArchiveIcon,
  EnvelopeClosedIcon,
  PersonIcon,
  CalendarIcon,
  ClockIcon,
  MixerHorizontalIcon,
  MagnifyingGlassIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ClockIcon as ScheduledIcon,
} from '@radix-ui/react-icons';
import { cn } from '~/lib/utils';

// 새로운 타입 시스템 import
import type {
  InfluencerDisplayData,
  GratitudeHistoryDisplayItem,
  GratitudeType,
  GratitudeStatus,
} from '../types';

interface GratitudeManagementProps {
  influencers: InfluencerDisplayData[];
  gratitudeHistory: GratitudeHistoryDisplayItem[];
  onGratitudeClick: (influencer: InfluencerDisplayData) => void;
  isLoading?: boolean;
}

// 감사 유형별 정보
function getGratitudeTypeInfo(type: GratitudeType) {
  const typeConfig = {
    thank_you_call: {
      icon: '📞',
      label: '감사전화',
      color: 'bg-blue-50 text-blue-600',
    },
    thank_you_message: {
      icon: '💌',
      label: '감사메시지',
      color: 'bg-green-50 text-green-600',
    },
    gift_delivery: {
      icon: '🎁',
      label: '선물배송',
      color: 'bg-purple-50 text-purple-600',
    },
    meal_invitation: {
      icon: '🍽️',
      label: '식사초대',
      color: 'bg-orange-50 text-orange-600',
    },
    event_invitation: {
      icon: '🎉',
      label: '행사초대',
      color: 'bg-pink-50 text-pink-600',
    },
    holiday_greetings: {
      icon: '🎊',
      label: '명절인사',
      color: 'bg-yellow-50 text-yellow-600',
    },
    birthday_wishes: {
      icon: '🎂',
      label: '생일축하',
      color: 'bg-red-50 text-red-600',
    },
    custom: { icon: '✨', label: '기타', color: 'bg-gray-50 text-gray-600' },
  };
  return typeConfig[type] || typeConfig.custom;
}

// 상태별 정보
function getStatusInfo(status: GratitudeStatus) {
  const statusConfig = {
    sent: {
      icon: <CheckCircledIcon />,
      label: '발송완료',
      color: 'bg-green-50 text-green-600 border-green-200',
    },
    scheduled: {
      icon: <ScheduledIcon />,
      label: '예약됨',
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    failed: {
      icon: <CrossCircledIcon />,
      label: '실패',
      color: 'bg-red-50 text-red-600 border-red-200',
    },
    cancelled: {
      icon: <ExclamationTriangleIcon />,
      label: '취소됨',
      color: 'bg-orange-50 text-orange-600 border-orange-200',
    },
    completed: {
      icon: <CheckCircledIcon />,
      label: '완료됨',
      color: 'bg-green-50 text-green-600 border-green-200',
    },
    delivered: {
      icon: <CheckCircledIcon />,
      label: '배송완료',
      color: 'bg-green-50 text-green-600 border-green-200',
    },
    planned: {
      icon: <ScheduledIcon />,
      label: '계획됨',
      color: 'bg-gray-50 text-gray-600 border-gray-200',
    },
  };
  return statusConfig[status] || statusConfig.scheduled;
}

// 우선순위 계산 (마지막 감사 후 일수 + 소개 가치)
function calculateGratitudePriority(influencer: InfluencerDisplayData): number {
  const daysSinceLastGratitude = influencer.lastGratitude
    ? Math.floor(
        (Date.now() - new Date(influencer.lastGratitude).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 365;

  const valueScore = Math.min(influencer.totalContractValue / 10000000, 10); // 1억원당 1점, 최대 10점
  const referralScore = Math.min(influencer.totalReferrals / 5, 10); // 5건당 1점, 최대 10점

  return daysSinceLastGratitude + valueScore + referralScore;
}

export function GratitudeManagement({
  influencers,
  gratitudeHistory,
  onGratitudeClick,
  isLoading = false,
}: GratitudeManagementProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'priority' | 'date' | 'name'>(
    'priority'
  );

  // 감사 표현이 필요한 소개자들 필터링 (우선순위 기준)
  const needsGratitude = influencers
    .filter(influencer => {
      const daysSinceLastGratitude = influencer.lastGratitude
        ? Math.floor(
            (Date.now() - new Date(influencer.lastGratitude).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 365;
      return daysSinceLastGratitude > 30; // 30일 이상 지난 경우
    })
    .map(influencer => ({
      ...influencer,
      priority: calculateGratitudePriority(influencer),
      daysSinceLastGratitude: influencer.lastGratitude
        ? Math.floor(
            (Date.now() - new Date(influencer.lastGratitude).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 365,
    }))
    .sort((a, b) => {
      if (sortBy === 'priority') return b.priority - a.priority;
      if (sortBy === 'date')
        return b.daysSinceLastGratitude - a.daysSinceLastGratitude;
      return a.name.localeCompare(b.name);
    });

  // 감사 히스토리 필터링
  const filteredHistory = gratitudeHistory
    .filter(item => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (
        searchQuery &&
        !item.influencerName.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  // 통계 계산
  const stats = {
    totalSent: gratitudeHistory.filter(item => item.status === 'sent').length,
    totalScheduled: gratitudeHistory.filter(item => item.status === 'scheduled')
      .length,
    totalNeedsGratitude: needsGratitude.length,
    totalInfluencers: influencers.length,
  };

  if (isLoading) {
    return <GratitudeManagementLoading />;
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* 통계 카드들 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircledIcon className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">발송완료</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.totalSent}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ScheduledIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">예약됨</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.totalScheduled}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BellIcon className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">감사 필요</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.totalNeedsGratitude}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <PersonIcon className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">총 소개자</p>
                  <p className="text-2xl font-bold">{stats.totalInfluencers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 감사 표현 필요 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BellIcon className="h-5 w-5" />
                    감사 표현 필요
                    {needsGratitude.length > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {needsGratitude.length}명
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    마지막 감사 표현 후 30일이 지난 소개자들 (우선순위순)
                  </CardDescription>
                </div>

                <Select
                  value={sortBy}
                  onValueChange={(value: any) => setSortBy(value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="priority">우선순위</SelectItem>
                    <SelectItem value="date">마지막 감사</SelectItem>
                    <SelectItem value="name">이름순</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {needsGratitude.length > 0 ? (
                <div className="space-y-3">
                  {needsGratitude.slice(0, 10).map(influencer => {
                    const urgencyLevel =
                      influencer.daysSinceLastGratitude > 90
                        ? 'high'
                        : influencer.daysSinceLastGratitude > 60
                          ? 'medium'
                          : 'low';

                    return (
                      <div
                        key={influencer.id}
                        className={cn(
                          'flex items-center justify-between p-4 border rounded-lg transition-colors',
                          urgencyLevel === 'high' && 'border-red-200 bg-red-50',
                          urgencyLevel === 'medium' &&
                            'border-orange-200 bg-orange-50',
                          urgencyLevel === 'low' &&
                            'border-yellow-200 bg-yellow-50'
                        )}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              {influencer.avatar ? (
                                <img
                                  src={influencer.avatar}
                                  alt={influencer.name}
                                />
                              ) : (
                                <AvatarFallback>
                                  {influencer.name[0]}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            {/* 우선순위 인디케이터 */}
                            <div
                              className={cn(
                                'absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold',
                                urgencyLevel === 'high' &&
                                  'bg-red-500 text-white',
                                urgencyLevel === 'medium' &&
                                  'bg-orange-500 text-white',
                                urgencyLevel === 'low' &&
                                  'bg-yellow-500 text-white'
                              )}
                            >
                              !
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="font-medium">
                                {influencer.name}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {influencer.tier}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <ClockIcon className="h-3 w-3" />
                                  {influencer.daysSinceLastGratitude}일 전
                                </span>
                                <span className="flex items-center gap-1">
                                  <StarIcon className="h-3 w-3" />
                                  우선순위 {Math.round(influencer.priority)}
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span>
                                  총 소개 {influencer.totalReferrals}건
                                </span>
                                <span>
                                  계약{' '}
                                  {(
                                    influencer.totalContractValue / 100000000
                                  ).toFixed(1)}
                                  억원
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => onGratitudeClick(influencer)}
                                className={cn(
                                  urgencyLevel === 'high' &&
                                    'bg-red-600 hover:bg-red-700',
                                  urgencyLevel === 'medium' &&
                                    'bg-orange-600 hover:bg-orange-700',
                                  urgencyLevel === 'low' &&
                                    'bg-yellow-600 hover:bg-yellow-700'
                                )}
                              >
                                <HeartIcon className="h-4 w-4 mr-2" />
                                감사 표현
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{influencer.name}님에게 감사 표현 보내기</p>
                              <p className="text-xs">
                                우선순위: {Math.round(influencer.priority)}
                              </p>
                            </TooltipContent>
                          </Tooltip>

                          {/* 우선순위 시각화 */}
                          <div className="w-16">
                            <Progress
                              value={Math.min(
                                (influencer.priority / 50) * 100,
                                100
                              )}
                              className="h-2"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {needsGratitude.length > 10 && (
                    <div className="text-center pt-4">
                      <p className="text-sm text-muted-foreground">
                        +{needsGratitude.length - 10}명 더 있습니다
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                    <CheckIcon className="w-6 h-6 text-green-500" />
                  </div>
                  <h4 className="font-medium mb-2">
                    모든 소개자에게 감사를 표현했습니다
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {influencers.length > 0
                      ? '모든 핵심 소개자들에게 최근 30일 내에 감사를 표현했습니다.'
                      : '아직 핵심 소개자가 없습니다.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 감사 히스토리 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckIcon className="h-5 w-5" />
                감사 활동 기록
                <Badge variant="secondary" className="ml-2">
                  {filteredHistory.length}건
                </Badge>
              </CardTitle>
              <CardDescription>감사 메시지와 선물 발송 기록</CardDescription>

              {/* 필터링 */}
              <div className="flex gap-2 pt-4">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="소개자 검색..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <MixerHorizontalIcon className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 상태</SelectItem>
                    <SelectItem value="sent">발송완료</SelectItem>
                    <SelectItem value="scheduled">예약됨</SelectItem>
                    <SelectItem value="failed">실패</SelectItem>
                    <SelectItem value="cancelled">취소됨</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 유형</SelectItem>
                    <SelectItem value="thank_you_call">감사전화</SelectItem>
                    <SelectItem value="thank_you_message">
                      감사메시지
                    </SelectItem>
                    <SelectItem value="gift_delivery">선물배송</SelectItem>
                    <SelectItem value="meal_invitation">식사초대</SelectItem>
                    <SelectItem value="event_invitation">행사초대</SelectItem>
                    <SelectItem value="holiday_greetings">명절인사</SelectItem>
                    <SelectItem value="birthday_wishes">생일축하</SelectItem>
                    <SelectItem value="custom">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredHistory.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredHistory.map(item => {
                    const typeInfo = getGratitudeTypeInfo(item.type);
                    const statusInfo = getStatusInfo(item.status);

                    return (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center text-lg',
                            typeInfo.color
                          )}
                        >
                          {typeInfo.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-medium truncate">
                              {item.influencerName}
                            </div>
                            <Badge
                              variant="outline"
                              className={cn('text-xs', statusInfo.color)}
                            >
                              {statusInfo.label}
                            </Badge>
                          </div>

                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {item.personalizedMessage ||
                              `${typeInfo.label}을 보냈습니다.`}
                          </p>

                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {typeInfo.label}
                            </Badge>

                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <CalendarIcon className="h-3 w-3" />
                              {new Date(item.createdAt).toLocaleDateString(
                                'ko-KR'
                              )}
                            </div>

                            {item.cost > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {item.cost.toLocaleString()}원
                              </Badge>
                            )}

                            {item.vendor && (
                              <Badge variant="outline" className="text-xs">
                                {item.vendor}
                              </Badge>
                            )}
                          </div>

                          {item.trackingNumber && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              배송번호: {item.trackingNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                    <HeartIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h4 className="font-medium mb-2">
                    {searchQuery ||
                    statusFilter !== 'all' ||
                    typeFilter !== 'all'
                      ? '조건에 맞는 감사 기록이 없습니다'
                      : '감사 활동 기록이 없습니다'}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery ||
                    statusFilter !== 'all' ||
                    typeFilter !== 'all'
                      ? '다른 조건으로 검색해보세요.'
                      : '핵심 소개자들에게 감사를 표현하여 관계를 강화하세요.'}
                  </p>

                  {influencers.length > 0 &&
                    !searchQuery &&
                    statusFilter === 'all' &&
                    typeFilter === 'all' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onGratitudeClick(influencers[0])}
                      >
                        <HeartIcon className="w-4 h-4 mr-2" />첫 감사 표현하기
                      </Button>
                    )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}

// 로딩 상태 컴포넌트
function GratitudeManagementLoading() {
  return (
    <div className="space-y-6">
      {/* 통계 카드 로딩 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-12"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 메인 카드 로딩 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div
                    key={j}
                    className="flex items-center gap-4 p-4 border rounded-lg animate-pulse"
                  >
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="w-20 h-8 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
