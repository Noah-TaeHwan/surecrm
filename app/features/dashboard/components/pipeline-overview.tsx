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
  TargetIcon,
} from '@radix-ui/react-icons';
import { Link } from 'react-router';
import { useState } from 'react';
import { GoalSettingModal } from './goal-setting-modal';

interface PipelineStage {
  id: string;
  name: string;
  count: number;
  value: number; // 단위: 만원
  conversionRate?: number;
}

interface Goal {
  id: string;
  title: string;
  goalType:
    | 'revenue'
    | 'clients'
    | 'meetings'
    | 'referrals'
    | 'conversion_rate';
  targetValue: number;
  currentValue: number;
  progress: number;
  period: string;
  startDate: string;
  endDate: string;
}

interface PipelineOverviewProps {
  stages: PipelineStage[];
  totalValue: number;
  monthlyTarget: number;
  currentGoals: Goal[];
  onSaveGoal: (goalData: {
    goalType: 'revenue' | 'clients' | 'meetings' | 'referrals';
    targetValue: number;
    title?: string;
  }) => Promise<void>;
}

export function PipelineOverview({
  stages,
  totalValue,
  monthlyTarget,
  currentGoals,
  onSaveGoal,
}: PipelineOverviewProps) {
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const totalDeals = stages.reduce((sum, stage) => sum + stage.count, 0);

  // 현재 활성화된 매출 목표가 있는지 확인
  const hasRevenueGoal = currentGoals.some(
    (goal) => goal.goalType === 'revenue' && goal.targetValue > 0
  );

  // 실제 설정된 매출 목표 찾기
  const revenueGoal = currentGoals.find((goal) => goal.goalType === 'revenue');

  // 목표가 설정되어 있으면 실제 목표값 사용, 없으면 기본값 사용
  const displayTarget = revenueGoal
    ? revenueGoal.targetValue / 10000
    : monthlyTarget;
  const displayProgress =
    displayTarget > 0 ? (totalValue / displayTarget) * 100 : 0;

  // 파이프라인에 데이터가 있는지 확인
  const hasData = totalDeals > 0 || totalValue > 0;

  return (
    <>
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <BarChartIcon className="h-4 w-4 text-primary" />
              </div>
              영업 파이프라인
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsGoalModalOpen(true)}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                <TargetIcon className="h-3 w-3 mr-1" />
                {hasRevenueGoal ? '목표 수정' : '목표 설정'}
              </Button>
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
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasData ? (
            <>
              {/* 월간 목표 진행률 */}
              <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    {hasRevenueGoal ? '월간 목표 달성률' : '예상 매출 현황'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {totalValue.toLocaleString()}만원
                    {hasRevenueGoal && (
                      <>
                        {' / '}
                        {displayTarget.toLocaleString()}만원
                      </>
                    )}
                  </span>
                </div>
                {hasRevenueGoal && (
                  <>
                    <Progress value={displayProgress} className="h-2 mb-2" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {displayProgress.toFixed(1)}% 달성
                      </span>
                      {displayProgress < 100 && (
                        <span className="text-xs text-muted-foreground">
                          목표까지{' '}
                          {(displayTarget - totalValue).toLocaleString()}만원
                        </span>
                      )}
                    </div>
                  </>
                )}
                {!hasRevenueGoal && (
                  <div className="mt-2 p-2 bg-primary/5 border border-primary/20 rounded text-xs text-primary">
                    💡 월간 매출 목표를 설정하면 더 정확한 진행률을 확인할 수
                    있습니다
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setIsGoalModalOpen(true)}
                      className="text-xs text-primary p-0 h-auto ml-2"
                    >
                      목표 설정하기
                    </Button>
                  </div>
                )}
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
                      <span className="text-sm text-foreground">
                        {stage.name}
                      </span>
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
                      {stage.conversionRate && stage.conversionRate > 0 && (
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
                  <div className="text-xs text-muted-foreground">
                    총 진행 건수
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-primary">
                    {totalValue.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    예상 매출(만원)
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-foreground">
                    {totalDeals > 0
                      ? (totalValue / totalDeals).toFixed(0)
                      : '0'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    평균 건당(만원)
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* 빈 상태 */
            <div className="text-center py-8">
              <div className="p-3 bg-muted/20 rounded-full w-fit mx-auto mb-3">
                <BarChartIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                아직 파이프라인에 고객이 없습니다
              </p>
              <div className="flex flex-col gap-2 items-center">
                <Link to="/pipeline">
                  <Button size="sm" variant="outline">
                    파이프라인 관리
                  </Button>
                </Link>
                {!hasRevenueGoal && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setIsGoalModalOpen(true)}
                    className="text-xs text-primary"
                  >
                    매출 목표 설정하기
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 목표 설정 모달 */}
      <GoalSettingModal
        currentGoals={currentGoals}
        onSaveGoal={onSaveGoal}
        isOpen={isGoalModalOpen}
        onOpenChange={setIsGoalModalOpen}
      />
    </>
  );
}
