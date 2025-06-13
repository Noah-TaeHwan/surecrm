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
  BarChartIcon,
  PersonIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  TriangleUpIcon,
  CalendarIcon,
  GlobeIcon,
  StarIcon,
} from '@radix-ui/react-icons';
import { TrendingUp } from 'lucide-react';
import { cn } from '~/lib/utils';

// 새로운 타입 시스템 import
import type { NetworkAnalysisDisplayData } from '../types';

interface InfluencerAnalysisCardProps {
  analysisData: NetworkAnalysisDisplayData;
  period?: string;
  isLoading?: boolean;
}

// 소개 패턴 차트 렌더링 (향상된 버전)
function renderReferralPatternChart(
  trends: { month: string; count: number }[]
) {
  if (!trends || trends.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        소개 데이터가 없습니다
      </div>
    );
  }

  const maxCount = Math.max(...trends.map(t => t.count));

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-1 h-24">
        {trends.map((trend, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'w-full rounded-t transition-all duration-300 cursor-help',
                    trend.count > 0
                      ? 'bg-primary hover:bg-primary/80'
                      : 'bg-muted'
                  )}
                  style={{
                    height:
                      maxCount > 0
                        ? `${Math.max(
                            (trend.count / maxCount) * 100,
                            trend.count > 0 ? 10 : 2
                          )}%`
                        : '2%',
                  }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {trend.month}: {trend.count}건
                </p>
              </TooltipContent>
            </Tooltip>
            <div className="text-xs text-muted-foreground truncate w-full text-center">
              {trend.month.substring(5)}
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-muted-foreground text-center">
        최근 {trends.length}개월 소개 트렌드
      </div>
    </div>
  );
}

// 네트워크 강도 시각화
function renderNetworkStrength(strength: number, depth: number, width: number) {
  const strengthColor =
    strength >= 8
      ? 'text-green-600'
      : strength >= 6
        ? 'text-blue-600'
        : strength >= 4
          ? 'text-yellow-600'
          : 'text-red-600';

  return (
    <div className="space-y-3">
      <div className="text-center">
        <div className={cn('text-3xl font-bold', strengthColor)}>
          {strength.toFixed(1)}
        </div>
        <div className="text-sm text-muted-foreground">전체 네트워크 강도</div>
        <Progress value={strength * 10} className="mt-2 h-2" />
      </div>

      <div className="grid grid-cols-2 gap-4 pt-3 border-t">
        <div className="text-center">
          <div className="text-xl font-bold text-primary">{depth}</div>
          <div className="text-xs text-muted-foreground">소개 깊이</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-primary">{width}</div>
          <div className="text-xs text-muted-foreground">네트워크 폭</div>
        </div>
      </div>
    </div>
  );
}

// 성장률 표시
function renderGrowthRate(growthRate: number) {
  // 🔥 UX 개선: Infinity/NaN 처리
  if (!isFinite(growthRate) || isNaN(growthRate)) {
    return (
      <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
        <div className="h-3 w-3" />
        <span>신규 데이터</span>
      </div>
    );
  }

  // 극단적 변화 처리
  if (Math.abs(growthRate) >= 500) {
    return (
      <div
        className={cn(
          'flex items-center gap-1 text-sm font-medium',
          growthRate > 0 ? 'text-green-600' : 'text-red-600'
        )}
      >
        {growthRate > 0 ? (
          <ArrowUpIcon className="h-3 w-3" />
        ) : (
          <ArrowDownIcon className="h-3 w-3" />
        )}
        <span>{growthRate > 0 ? '대폭 증가' : '대폭 감소'}</span>
      </div>
    );
  }

  const isPositive = growthRate > 0;
  const isNeutral = growthRate === 0;

  return (
    <div
      className={cn(
        'flex items-center gap-1 text-sm font-medium',
        isPositive && 'text-green-600',
        isNeutral && 'text-muted-foreground',
        !isPositive && !isNeutral && 'text-red-600'
      )}
    >
      {isPositive ? (
        <ArrowUpIcon className="h-3 w-3" />
      ) : isNeutral ? (
        <div className="h-3 w-3" />
      ) : (
        <ArrowDownIcon className="h-3 w-3" />
      )}
      {Math.round(Math.abs(growthRate) * 10) / 10}%
      <span className="text-muted-foreground text-xs">
        {isPositive ? '증가' : isNeutral ? '동일' : '감소'}
      </span>
    </div>
  );
}

// 로딩 상태 컴포넌트
function AnalysisCardLoading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-3 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function InfluencerAnalysisCard({
  analysisData,
  period = 'all',
  isLoading = false,
}: InfluencerAnalysisCardProps) {
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
    return <AnalysisCardLoading />;
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BarChartIcon className="h-6 w-6" />
              네트워크 분석
            </h2>
            <p className="text-muted-foreground">
              {periodLabels[period] || '전체 기간'} 기준 소개 네트워크 상세 분석
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            업데이트:{' '}
            {new Date(analysisData.lastUpdated).toLocaleDateString('ko-KR')}
          </Badge>
        </div>

        {/* 주요 지표 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 네트워크 강도 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <GlobeIcon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">네트워크 강도</span>
              </div>
              <div className="text-2xl font-bold">
                {analysisData.overallNetworkStrength.toFixed(1)}
              </div>
              <div className="flex items-center mt-1">
                {renderGrowthRate(analysisData.networkGrowthRate)}
              </div>
            </CardContent>
          </Card>

          {/* 총 소개자 수 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <PersonIcon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">총 소개자</span>
              </div>
              <div className="text-2xl font-bold">
                {analysisData.totalInfluencers}명
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                활성 {analysisData.activeInfluencers}명
              </div>
            </CardContent>
          </Card>

          {/* 평균 소개 횟수 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <StarIcon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">평균 소개</span>
              </div>
              <div className="text-2xl font-bold">
                {analysisData.averageReferralsPerInfluencer.toFixed(1)}건
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                소개자당 평균
              </div>
            </CardContent>
          </Card>

          {/* 네트워크 깊이 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TriangleUpIcon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">최대 깊이</span>
              </div>
              <div className="text-2xl font-bold">
                {analysisData.maxNetworkDepth}단계
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {analysisData.totalSecondDegreeConnections}명 2차 연결
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 상세 분석 카드들 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 월별 소개 트렌드 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                월별 소개 트렌드
              </CardTitle>
              <CardDescription>
                최근 소개 활동의 시간별 패턴 분석
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderReferralPatternChart(analysisData.monthlyTrends)}

              {/* 트렌드 요약 */}
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span>이번 달 소개</span>
                  <span className="font-medium">
                    {analysisData.monthlyTrends[
                      analysisData.monthlyTrends.length - 1
                    ]?.count || 0}
                    건
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span>월평균 소개</span>
                  <span className="font-medium">
                    {(
                      analysisData.monthlyTrends.reduce(
                        (sum, t) => sum + t.count,
                        0
                      ) / analysisData.monthlyTrends.length
                    ).toFixed(1)}
                    건
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 네트워크 강도 분석 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GlobeIcon className="h-5 w-5" />
                네트워크 강도 분석
              </CardTitle>
              <CardDescription>
                소개 네트워크의 전체적인 연결 강도와 확장성
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderNetworkStrength(
                analysisData.overallNetworkStrength,
                analysisData.maxNetworkDepth,
                analysisData.totalInfluencers
              )}

              {/* 네트워크 품질 평가 */}
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="text-sm font-medium mb-2">
                  네트워크 품질 평가
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>강한 연결 비율</span>
                    <span className="font-medium">
                      {(
                        (analysisData.strongConnections /
                          analysisData.totalInfluencers) *
                        100
                      ).toFixed(0)}
                      %
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>활성 소개자 비율</span>
                    <span className="font-medium">
                      {(
                        (analysisData.activeInfluencers /
                          analysisData.totalInfluencers) *
                        100
                      ).toFixed(0)}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 성과 분석 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                소개 성과 분석
              </CardTitle>
              <CardDescription>
                소개를 통한 계약 성과 및 효율성 지표
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 성과 지표들 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {analysisData.conversionRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">전환율</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {(analysisData.averageContractValue / 10000).toFixed(0)}
                      만원
                    </div>
                    <div className="text-xs text-muted-foreground">
                      평균 계약가치
                    </div>
                  </div>
                </div>

                {/* ROI 분석 */}
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm font-medium mb-2">
                    소개 네트워크 ROI
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {(
                      analysisData.totalNetworkValue /
                      Math.max(analysisData.totalInfluencers * 1000000, 1)
                    ).toFixed(1)}
                    배
                  </div>
                  <div className="text-xs text-muted-foreground">
                    소개자당 투자 대비 수익률
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 개선 제안 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StarIcon className="h-5 w-5" />
                개선 제안
              </CardTitle>
              <CardDescription>
                네트워크 확장 및 효율성 향상을 위한 제안
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysisData.overallNetworkStrength < 6 && (
                  <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <div className="text-sm font-medium text-yellow-800">
                      관계 강화 필요
                    </div>
                    <div className="text-xs text-yellow-700 mt-1">
                      기존 소개자들과의 관계를 더욱 강화하여 소개 빈도를
                      높이세요.
                    </div>
                  </div>
                )}

                {analysisData.networkGrowthRate < 0 && (
                  <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded">
                    <div className="text-sm font-medium text-red-800">
                      신규 소개자 확보
                    </div>
                    <div className="text-xs text-red-700 mt-1">
                      네트워크가 축소되고 있습니다. 새로운 소개자 확보가
                      필요합니다.
                    </div>
                  </div>
                )}

                {analysisData.conversionRate < 30 && (
                  <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                    <div className="text-sm font-medium text-blue-800">
                      소개 품질 개선
                    </div>
                    <div className="text-xs text-blue-700 mt-1">
                      소개받은 고객의 계약 전환율이 낮습니다. 소개 시 사전
                      설명을 강화하세요.
                    </div>
                  </div>
                )}

                {analysisData.maxNetworkDepth < 3 && (
                  <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
                    <div className="text-sm font-medium text-green-800">
                      2차 소개 확대
                    </div>
                    <div className="text-xs text-green-700 mt-1">
                      소개받은 고객들로부터 추가 소개를 받을 수 있는 기회를
                      늘리세요.
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
