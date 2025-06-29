/* eslint-disable no-unused-vars */
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { Progress } from '~/common/components/ui/progress';
import { useTranslation } from 'react-i18next';
import {
  formatCurrencyTable,
  type SupportedLocale,
} from '~/lib/utils/currency';
import {
  TargetIcon,
  PlusIcon,
  TriangleUpIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
} from '@radix-ui/react-icons';
import { useState, useEffect } from 'react';
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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GoalData {
  goalType: 'revenue' | 'clients' | 'referrals' | 'conversion_rate';
  targetValue: number;
  title?: string;
  id?: string;
  targetYear: number;
  targetMonth: number;
}

interface MyGoalsProps {
  goals: Goal[];
  currentPeriod?: { year: number; month: number };
  onGoalCreate?: (goalData: GoalData) => void;
  onGoalUpdate?: (goalId: string, goalData: GoalData) => void;
  onGoalDelete?: (goalId: string) => void;
}

export function MyGoals({
  goals = [],
  currentPeriod = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  },
  onGoalCreate,
  onGoalUpdate,
  onGoalDelete,
}: MyGoalsProps) {
  const { t, i18n } = useTranslation('dashboard');
  const locale = (
    i18n.language === 'ko' ? 'ko' : i18n.language === 'ja' ? 'ja' : 'en'
  ) as SupportedLocale;

  const [selectedPeriod, setSelectedPeriod] = useState(currentPeriod);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // hydration 완료 후에만 번역된 텍스트 렌더링
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // 선택된 기간의 목표들 필터링
  const periodGoals = goals.filter(goal => {
    const goalDate = new Date(goal.startDate);
    return (
      goalDate.getFullYear() === selectedPeriod.year &&
      goalDate.getMonth() + 1 === selectedPeriod.month
    );
  });

  // 현재 월인지 확인
  const isCurrentMonth =
    selectedPeriod.year === currentPeriod.year &&
    selectedPeriod.month === currentPeriod.month;

  // 기간 포맷팅 함수
  const formatPeriod = (year: number, month: number) => {
    return t('dateFormat.yearMonth', { year, month });
  };

  // 월 이동 함수
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedPeriod.year, selectedPeriod.month - 1);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedPeriod({
      year: newDate.getFullYear(),
      month: newDate.getMonth() + 1,
    });
  };

  // 현재 월로 돌아가기
  const goToCurrentMonth = () => {
    setSelectedPeriod(currentPeriod);
  };

  // 목표 타입별 라벨 가져오기
  const getGoalTypeLabel = (goalType: string) => {
    return t(`myGoals.goalTypes.${goalType}`, {
      defaultValue: t('myGoals.goalTypes.default'),
    });
  };

  // 목표 타입별 단위 가져오기
  const getGoalTypeUnit = (goalType: string) => {
    return t(`myGoals.units.${goalType}`, { defaultValue: '' });
  };

  // 목표 달성률에 따른 색상 결정
  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'text-green-600';
    if (progress >= 80) return 'text-blue-600';
    if (progress >= 60) return 'text-orange-600';
    return 'text-muted-foreground';
  };

  // 목표 상태 결정
  const getGoalStatus = (progress: number) => {
    if (progress >= 100) {
      return {
        status: t('myGoals.completed'),
        color:
          'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      };
    }
    return {
      status: t('myGoals.inProgress'),
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    };
  };

  // 목표값 포맷팅
  const formatGoalValue = (value: number, goalType: string) => {
    if (goalType === 'revenue') {
      return formatCurrencyTable(value * 10000, locale); // 만원 단위를 원 단위로 변환
    }
    return `${value.toLocaleString()}${getGoalTypeUnit(goalType)}`;
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <TargetIcon className="h-4 w-4 text-primary" />
            </div>
            {isHydrated ? t('myGoals.title') : '내 목표'}
          </CardTitle>
          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
            variant="outline"
            className="text-xs"
          >
            <PlusIcon className="h-3 w-3 mr-1" />
            {isHydrated ? t('myGoals.setGoal') : '목표 설정'}
          </Button>
        </div>

        {/* 월별 네비게이션 */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {formatPeriod(selectedPeriod.year, selectedPeriod.month)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="h-8 w-8 p-0"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
          {!isCurrentMonth && (
            <Button
              variant="ghost"
              size="sm"
              onClick={goToCurrentMonth}
              className="text-xs text-primary hover:text-primary/80"
            >
              <HomeIcon className="h-3 w-3 mr-1" />
              {t('myGoals.backToCurrentMonth')}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {periodGoals.length > 0 ? (
          <>
            {/* 목표 현황 요약 */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-muted/30 rounded-lg border border-border/30">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {periodGoals.filter(goal => goal.progress >= 100).length}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t('myGoals.achievedGoals')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {
                    periodGoals.filter(
                      goal => goal.progress < 100 && goal.progress > 0
                    ).length
                  }
                </div>
                <div className="text-xs text-muted-foreground">
                  {t('myGoals.inProgressGoals')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-muted-foreground">
                  {periodGoals.filter(goal => goal.progress === 0).length}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t('myGoals.unachievedGoals')}
                </div>
              </div>
            </div>

            {/* 개별 목표 카드 */}
            <div className="space-y-3">
              {periodGoals.map(goal => {
                const goalStatus = getGoalStatus(goal.progress);
                const progressValue = Math.min(goal.progress, 100);

                return (
                  <div
                    key={goal.id}
                    className="p-4 border border-border/30 rounded-lg hover:bg-accent/20 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">
                            {goal.title || getGoalTypeLabel(goal.goalType)}
                          </h4>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${goalStatus.color}`}
                          >
                            {goalStatus.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {getGoalTypeLabel(goal.goalType)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">
                          {t('myGoals.target')}
                        </div>
                        <div className="font-medium text-sm">
                          {formatGoalValue(goal.targetValue, goal.goalType)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {t('myGoals.progress')}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={getProgressColor(goal.progress)}>
                            {formatGoalValue(goal.currentValue, goal.goalType)}{' '}
                            /
                          </span>
                          <span className="text-muted-foreground">
                            {formatGoalValue(goal.targetValue, goal.goalType)}
                          </span>
                        </div>
                      </div>

                      <Progress value={progressValue} className="h-2" />

                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-medium ${getProgressColor(goal.progress)}`}
                        >
                          {goal.progress >= 100 ? (
                            goal.progress > 100 ? (
                              <span className="flex items-center gap-1">
                                <TriangleUpIcon className="h-3 w-3" />
                                {t('myGoals.goalExceeded', {
                                  percent: (goal.progress - 100).toFixed(1),
                                })}
                              </span>
                            ) : (
                              t('myGoals.goalAchieved')
                            )
                          ) : (
                            `${goal.progress.toFixed(1)}%`
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="p-4 bg-muted/20 rounded-full w-fit mx-auto mb-4">
              <TargetIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            {isCurrentMonth ? (
              <>
                <h3 className="font-medium text-foreground mb-2">
                  {t('myGoals.setGoalPrompt')}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('myGoals.setGoalDescription', {
                    year: selectedPeriod.year,
                    month: selectedPeriod.month,
                  })}
                </p>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  size="sm"
                  variant="outline"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  {t('myGoals.setFirstGoal')}
                </Button>
              </>
            ) : (
              <>
                <h3 className="font-medium text-foreground mb-2">
                  {t('myGoals.noGoalsSet')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('myGoals.noGoalsForMonth', {
                    year: selectedPeriod.year,
                    month: selectedPeriod.month,
                  })}
                </p>
              </>
            )}
          </div>
        )}
      </CardContent>

      {/* 목표 설정 모달 */}
      <GoalSettingModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        currentGoals={periodGoals}
        onSaveGoal={async (goalData: GoalData) => {
          if (goalData.id) {
            // 수정
            onGoalUpdate?.(goalData.id, goalData);
          } else {
            // 새로 생성
            onGoalCreate?.(goalData);
          }
        }}
        onDeleteGoal={
          onGoalDelete
            ? async (goalId: string) => {
                onGoalDelete(goalId);
              }
            : undefined
        }
      />
    </Card>
  );
}
