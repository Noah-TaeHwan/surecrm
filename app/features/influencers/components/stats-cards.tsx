import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Progress } from '~/common/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/common/components/ui/tooltip';
import {
  BadgeIcon,
  DoubleArrowUpIcon,
  BarChartIcon,
  Link2Icon,
  InfoCircledIcon,
} from '@radix-ui/react-icons';
import type { NetworkAnalysis } from './types';

interface StatsCardsProps {
  networkAnalysis: NetworkAnalysis;
}

export function StatsCards({ networkAnalysis }: StatsCardsProps) {
  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">
                총 핵심 소개자
              </CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoCircledIcon className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>활발한 소개 활동을 하는 고객의 총 수입니다.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <BadgeIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex justify-start items-center">
            <div className="text-2xl font-bold mr-2">
              {networkAnalysis.totalInfluencers}
            </div>
            <p className="text-sm text-muted-foreground">명</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">
                평균 계약 전환율
              </CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoCircledIcon className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    소개받은 고객 중 실제 계약으로 이어진 비율의 평균입니다.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <DoubleArrowUpIcon className="h-4 w-4 text-muted-foreground" />
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">
                총 네트워크 가치
              </CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoCircledIcon className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>소개 네트워크를 통해 발생한 총 계약 금액입니다.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(networkAnalysis.totalNetworkValue / 100000000).toFixed(1)}억원
            </div>
            <p className="text-xs text-muted-foreground">
              월 성장률 +{networkAnalysis.monthlyGrowth}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">
                평균 네트워크 규모
              </CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoCircledIcon className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p>
                      <strong>단계:</strong> 소개의 연결 깊이 (A→B→C = 2단계)
                    </p>
                    <p>
                      <strong>폭:</strong> 한 사람이 소개한 총 인원 수
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
            <Link2Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex justify-start items-center">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold">
                  {networkAnalysis.avgNetworkDepth}
                </div>
                <p className="text-sm text-muted-foreground">단계</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold">
                  {networkAnalysis.avgNetworkWidth}
                </div>
                <p className="text-sm text-muted-foreground">폭</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
