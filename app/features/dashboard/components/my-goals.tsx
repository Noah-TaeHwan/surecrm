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
  PlusIcon,
  TriangleUpIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
} from '@radix-ui/react-icons';
import { useState } from 'react';
import { GoalSettingModal } from './goal-setting-modal';

interface Goal {
  id: string;
  title: string;
  goalType:
    | 'revenue'
    | 'clients'
    // | 'meetings' // 미팅 관련 주석처리
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
    goalType: 'revenue' | 'clients' | 'referrals';
    targetValue: number;
    title?: string;
    id?: string;
    targetYear: number;
    targetMonth: number;
  }) => Promise<void>;
  onDeleteGoal?: (goalId: string) => Promise<void>;
}

export function MyGoals({
  currentGoals = [],
  onSetGoal,
  onDeleteGoal,
}: MyGoalsProps) {
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  // 현재 보고 있는 월 상태 관리
  const [viewingYear, setViewingYear] = useState(new Date().getFullYear());
  const [viewingMonth, setViewingMonth] = useState(new Date().getMonth() + 1);

  // 실제 현재 월
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // 보고 있는 월의 목표 필터링
  const viewingMonthGoals = currentGoals.filter((goal) => {
    const goalYear = new Date(goal.startDate).getFullYear();
    const goalMonth = new Date(goal.startDate).getMonth() + 1;
    return goalYear === viewingYear && goalMonth === viewingMonth;
  });

  // 월 탐색 함수
  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (viewingMonth === 1) {
        setViewingYear(viewingYear - 1);
        setViewingMonth(12);
      } else {
        setViewingMonth(viewingMonth - 1);
      }
    } else {
      if (viewingMonth === 12) {
        setViewingYear(viewingYear + 1);
        setViewingMonth(1);
      } else {
        setViewingMonth(viewingMonth + 1);
      }
    }
  };

  // 현재 월로 돌아가기
  const goToCurrentMonth = () => {
    setViewingYear(currentYear);
    setViewingMonth(currentMonth);
  };

  // 보고 있는 월이 현재 월인지 확인
  const isCurrentMonth =
    viewingYear === currentYear && viewingMonth === currentMonth;

  const getGoalIcon = (goalType: string) => {
    switch (goalType) {
      case 'revenue':
        return '💰';
      case 'clients':
        return '👥';
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

            {/* 월별 탐색 UI */}
            <div className="flex items-center gap-3">
              {/* 현재 보고 있는 월 표시 */}
              <div className="flex items-center gap-2">
                <Badge
                  variant={isCurrentMonth ? 'default' : 'secondary'}
                  className="text-xs font-medium"
                >
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {viewingYear}년 {viewingMonth}월
                </Badge>

                {/* 현재 월로 돌아가기 버튼 */}
                {!isCurrentMonth && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToCurrentMonth}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                    title="현재 월로 돌아가기"
                  >
                    <HomeIcon className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* 월 탐색 버튼들 */}
              <div className="flex items-center gap-1 border border-border/30 rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                  className="h-6 w-6 p-0 rounded-l-md rounded-r-none hover:bg-muted"
                  title="이전 달"
                >
                  <ChevronLeftIcon className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                  className="h-6 w-6 p-0 rounded-r-md rounded-l-none hover:bg-muted"
                  title="다음 달"
                >
                  <ChevronRightIcon className="h-3 w-3" />
                </Button>
              </div>

              {/* 목표 설정 버튼 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsGoalModalOpen(true)}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                <PlusIcon className="h-3 w-3 mr-1" />
                목표 설정
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {viewingMonthGoals.length > 0 ? (
            <>
              {/* 현재 월 목표 우선 표시 */}
              {viewingMonthGoals.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isCurrentMonth ? 'bg-primary' : 'bg-muted-foreground'
                      }`}
                    ></div>
                    <span
                      className={`text-sm font-medium ${
                        isCurrentMonth
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {isCurrentMonth
                        ? `이번 달 목표`
                        : `${viewingYear}년 ${viewingMonth}월 목표`}
                    </span>
                  </div>
                  {viewingMonthGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className={`p-3 border rounded-lg transition-colors ${
                        isCurrentMonth
                          ? 'border-primary/20 bg-primary/5 hover:bg-primary/10'
                          : 'border-border/30 hover:bg-accent/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">
                            {getGoalIcon(goal.goalType)}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {goal.title || getGoalTypeLabel(goal.goalType)}
                            </p>
                            <p
                              className={`text-xs flex items-center gap-1 ${
                                isCurrentMonth
                                  ? 'text-primary'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              <CalendarIcon className="h-3 w-3" />
                              {isCurrentMonth ? '진행 중' : '완료'}
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

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
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
                          className="h-3"
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
              )}

              {/* 목표 요약 - 현재 월 기준 */}
              {viewingMonthGoals.length > 0 && (
                <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
                  <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                    📊{' '}
                    {isCurrentMonth
                      ? '이번 달'
                      : `${viewingYear}년 ${viewingMonth}월`}{' '}
                    목표 현황
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="text-center">
                      <p className="text-lg text-muted-foreground">달성 완료</p>
                      <p className="text-lg font-medium text-green-600">
                        {
                          viewingMonthGoals.filter((g) => g.progress >= 100)
                            .length
                        }
                        개
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg text-muted-foreground">
                        {isCurrentMonth ? '진행 중' : '미달성'}
                      </p>
                      <p className="text-lg font-medium text-primary">
                        {
                          viewingMonthGoals.filter((g) => g.progress < 100)
                            .length
                        }
                        개
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 mx-auto bg-muted/50 rounded-full flex items-center justify-center">
                <TargetIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  {isCurrentMonth
                    ? '목표를 설정해보세요'
                    : '설정된 목표가 없습니다'}
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  {isCurrentMonth
                    ? `${viewingYear}년 ${viewingMonth}월 목표를 설정하고 실시간으로 달성률을 확인하세요`
                    : `${viewingYear}년 ${viewingMonth}월에는 설정된 목표가 없습니다`}
                </p>
                {isCurrentMonth && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsGoalModalOpen(true)}
                    className="text-xs"
                  >
                    <PlusIcon className="h-3 w-3 mr-1" />첫 번째 목표 설정하기
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 목표 설정 모달 */}
      {onSetGoal && (
        <GoalSettingModal
          currentGoals={currentGoals}
          onSaveGoal={onSetGoal}
          onDeleteGoal={onDeleteGoal}
          isOpen={isGoalModalOpen}
          onOpenChange={setIsGoalModalOpen}
        />
      )}
    </>
  );
}
