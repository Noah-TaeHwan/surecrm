import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { Progress } from '~/common/components/ui/progress';
import {
  BarChartIcon,
  ChevronRightIcon,
  PersonIcon,
} from '@radix-ui/react-icons';
import { Link } from 'react-router';

interface PipelineStage {
  id: string;
  name: string;
  count: number;
  value: number; // 단위: 만원
  conversionRate?: number;
}

interface PipelineOverviewProps {
  stages: PipelineStage[];
  totalValue: number;
  monthlyTarget: number;
}

export function PipelineOverview({
  stages,
  totalValue,
  monthlyTarget,
}: PipelineOverviewProps) {
  const progressPercentage = (totalValue / monthlyTarget) * 100;
  const totalDeals = stages.reduce((sum, stage) => sum + stage.count, 0);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <BarChartIcon className="h-4 w-4 text-primary" />
            </div>
            영업 파이프라인
          </CardTitle>
          <Link to="/pipeline">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              상세 보기
              <ChevronRightIcon className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 월간 목표 진행률 */}
        <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              월간 목표 달성률
            </span>
            <span className="text-sm text-muted-foreground">
              {totalValue.toLocaleString()}만원 /{' '}
              {monthlyTarget.toLocaleString()}만원
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2 mb-2" />
          <div className="text-right">
            <span className="text-xs text-muted-foreground">
              {progressPercentage.toFixed(1)}% 달성
            </span>
          </div>
        </div>

        {/* 파이프라인 단계별 현황 */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground mb-2">
            단계별 현황
          </h4>
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              className="flex items-center justify-between p-2 rounded-lg border border-border/30 hover:bg-accent/20 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-sm text-foreground">{stage.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">
                    {stage.count}건
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stage.value.toLocaleString()}만원
                  </div>
                </div>
                {stage.conversionRate && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-muted/20 text-muted-foreground"
                  >
                    {stage.conversionRate}%
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 요약 통계 */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/30">
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {totalDeals}
            </div>
            <div className="text-xs text-muted-foreground">총 진행 건수</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-primary">
              {totalValue.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">예상 매출(만원)</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {(totalValue / totalDeals || 0).toFixed(0)}
            </div>
            <div className="text-xs text-muted-foreground">평균 건당(만원)</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
