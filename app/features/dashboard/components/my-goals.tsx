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
  TargetIcon,
  ChevronRightIcon,
  PlusIcon,
  TriangleUpIcon,
  CalendarIcon,
} from '@radix-ui/react-icons';
import { Link } from 'react-router';
import { useState } from 'react';
import { GoalSettingModal } from './goal-setting-modal';

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

interface MyGoalsProps {
  currentGoals?: Goal[];
  onSetGoal?: (goalData: {
    goalType: 'revenue' | 'clients' | 'meetings' | 'referrals';
    targetValue: number;
    title?: string;
  }) => Promise<void>;
}

export function MyGoals({ currentGoals = [], onSetGoal }: MyGoalsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const getGoalIcon = (goalType: string) => {
    switch (goalType) {
      case 'revenue':
        return '💰';
      case 'clients':
        return '👥';
      case 'meetings':
        return '📅';
      case 'referrals':
        return '🤝';
      case 'conversion_rate':
        return '📈';
      default:
        return '🎯';
    }
  };

  const getGoalTypeLabel = (goalType: string) => {
    switch (goalType) {
      case 'revenue':
        return '매출 목표';
      case 'clients':
        return '신규 고객';
      case 'meetings':
        return '미팅 수';
      case 'referrals':
        return '소개 건수';
      case 'conversion_rate':
        return '전환율';
      default:
        return '목표';
    }
  };

  const formatValue = (value: number, type: string) => {
    switch (type) {
      case 'revenue':
        return value >= 10000
          ? `${(value / 10000).toFixed(1)}억원`
          : `${value.toLocaleString()}만원`;
      case 'conversion_rate':
        return `${value}%`;
      default:
        return `${value.toLocaleString()}${type === 'clients' ? '명' : '건'}`;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 80) return 'bg-primary';
    if (progress >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const activeGoals = currentGoals.filter((goal) => goal.targetValue > 0);
  const displayGoals = isExpanded ? activeGoals : activeGoals.slice(0, 2);
  const completedGoals = activeGoals.filter((g) => g.progress >= 100).length;
  const inProgressGoals = activeGoals.filter((g) => g.progress < 100).length;

  return (
    <>
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <TargetIcon className="h-4 w-4 text-primary" />
              </div>
              내 목표
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsGoalModalOpen(true)}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                <PlusIcon className="h-3 w-3 mr-1" />
                목표 추가
              </Button>
              <Link to="/settings">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  관리
                  <ChevronRightIcon className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeGoals.length > 0 ? (
            <>
              <div className="space-y-3">
                {displayGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-3 border border-border/30 rounded-lg hover:bg-accent/20 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {getGoalIcon(goal.goalType)}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {goal.title || getGoalTypeLabel(goal.goalType)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {goal.period}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {formatValue(goal.currentValue, goal.goalType)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          목표: {formatValue(goal.targetValue, goal.goalType)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          진행률
                        </span>
                        <Badge
                          variant={
                            goal.progress >= 80 ? 'default' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {Math.min(100, goal.progress).toFixed(1)}%
                        </Badge>
                      </div>
                      <Progress
                        value={Math.min(100, goal.progress)}
                        className="h-2"
                      />
                    </div>

                    {goal.progress >= 100 && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                        <TriangleUpIcon className="h-3 w-3" />
                        <span>목표 달성 완료!</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {activeGoals.length > 2 && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs"
                  >
                    {isExpanded
                      ? `접기`
                      : `+${activeGoals.length - 2}개 더 보기`}
                  </Button>
                </div>
              )}

              {/* 이번 달 요약 */}
              <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
                <h4 className="text-xs font-medium text-foreground mb-2 flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  이번 달 요약
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center">
                    <p className="text-muted-foreground">진행중</p>
                    <p className="font-medium text-foreground">
                      {inProgressGoals}개
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">완료</p>
                    <p className="font-medium text-green-600">
                      {completedGoals}개
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="p-3 bg-muted/20 rounded-full w-fit mx-auto mb-3">
                <TargetIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                아직 설정된 목표가 없습니다
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                월간 매출, 신규 고객 등의 목표를 설정해보세요
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsGoalModalOpen(true)}
              >
                <PlusIcon className="h-3 w-3 mr-1" />첫 목표 설정하기
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 목표 설정 모달 */}
      {onSetGoal && (
        <GoalSettingModal
          currentGoals={currentGoals}
          onSaveGoal={onSetGoal}
          isOpen={isGoalModalOpen}
          onOpenChange={setIsGoalModalOpen}
        />
      )}
    </>
  );
}
