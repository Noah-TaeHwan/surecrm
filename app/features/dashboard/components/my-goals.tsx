/* eslint-disable no-unused-vars */
import { useState } from 'react';
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
import { GoalSettingModal } from './goal-setting-modal';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';

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
  const { t, formatCurrency, i18n } = useHydrationSafeTranslation('dashboard');

  const [selectedPeriod, setSelectedPeriod] = useState(currentPeriod);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 선택된 기간의 목표들 필터링 (리포트 페이지와 동일한 로직)
  const periodGoals = goals.filter(goal => {
    const goalStart = new Date(goal.startDate);
    const goalEnd = new Date(goal.endDate);

    // 🔧 수정: 선택된 연월이 목표 기간 내에 포함되는지 확인
    const selectedDate = new Date(
      selectedPeriod.year,
      selectedPeriod.month - 1,
      15
    ); // 해당 월의 중간 날짜

    return goalStart <= selectedDate && goalEnd >= selectedDate;
  });

  // 현재 월인지 확인
  const isCurrentMonth =
    selectedPeriod.year === currentPeriod.year &&
    selectedPeriod.month === currentPeriod.month;

  // 기간 포맷팅 함수 (hydration-safe)
  const formatPeriod = (year: number, month: number) => {
    // 각 언어별 포맷 정의
    const formats = {
      ko: `${year}년 ${month}월`,
      en: `${year}.${month.toString().padStart(2, '0')}`,
      ja: `${year}年${month}月`,
    };

    return t('dateFormat.yearMonth', formats.ko, { year, month });
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

  // 목표 타입별 라벨 가져오기 (hydration-safe)
  const getGoalTypeLabel = (goalType: string) => {
    const defaultLabels: Record<string, string> = {
      revenue: '매출',
      clients: '고객',
      referrals: '소개',
      conversion_rate: '전환율',
    };
    return t(
      `myGoals.goalTypes.${goalType}`,
      defaultLabels[goalType] || '기타'
    );
  };

  // 목표 타입별 단위 가져오기 (hydration-safe)
  const getGoalTypeUnit = (goalType: string) => {
    const defaultUnits: Record<string, string> = {
      revenue: '만원',
      clients: '명',
      referrals: '건',
      conversion_rate: '%',
    };
    return t(`myGoals.units.${goalType}`, defaultUnits[goalType] || '');
  };

  // 목표 달성률에 따른 색상 결정
  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'text-green-600';
    if (progress >= 80) return 'text-blue-600';
    if (progress >= 60) return 'text-orange-600';
    return 'text-muted-foreground';
  };

  // 목표 상태 결정 (hydration-safe)
  const getGoalStatus = (progress: number) => {
    if (progress >= 100) {
      return {
        status: t('myGoals.completed', '완료'),
        color:
          'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      };
    }
    return {
      status: t('myGoals.inProgress', '진행 중'),
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    };
  };

  // 목표값 포맷팅 (언어별 처리)
  const formatGoalValue = (value: number, goalType: string) => {
    if (goalType === 'revenue') {
      const currentLang = i18n?.language || 'ko';

      if (currentLang === 'en') {
        // 영어: 달러로 직접 표시 (입력값 그대로)
        return `$${value.toLocaleString()}`;
      } else if (currentLang === 'ja') {
        // 일본어: 엔으로 직접 표시 (입력값 그대로)
        return `¥${value.toLocaleString()}`;
      } else {
        // 한국어: 만원 단위를 원 단위로 변환
        return formatCurrency(value * 10000);
      }
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
            {t('myGoals.title', '내 목표')}
          </CardTitle>
          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
            variant="outline"
            className="text-xs"
          >
            <PlusIcon className="h-3 w-3 mr-1" />
            {t('myGoals.setGoal', '목표 설정')}
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
              {t('myGoals.backToCurrentMonth', '현재 월로 돌아가기')}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {periodGoals.length > 0 ? (
          <>
            {/* 목표 현황 요약 - 2개 카테고리로 단순화 */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-muted/30 rounded-lg border border-border/30">
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">
                  {
                    periodGoals.filter(goal => {
                      const progress = goal.progress || 0;
                      return progress >= 100;
                    }).length
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('myGoals.achievedGoals', '달성 완료')}
                </div>
                <div className="text-xs text-muted-foreground/70 mt-1">
                  {t('myGoals.achievedDescription', '100% 이상 달성')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">
                  {
                    periodGoals.filter(goal => {
                      const progress = goal.progress || 0;
                      return progress < 100;
                    }).length
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('myGoals.inProgressGoals', '진행 중')}
                </div>
                <div className="text-xs text-muted-foreground/70 mt-1">
                  {t('myGoals.inProgressDescription', '100% 미만 진행')}
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
                          {t('myGoals.target', '목표')}
                        </div>
                        <div className="font-medium text-sm">
                          {formatGoalValue(goal.targetValue, goal.goalType)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {t('myGoals.progress', '진행률')}
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
                                {t(
                                  'myGoals.goalExceeded',
                                  `목표 초과 달성 (+${(goal.progress - 100).toFixed(1)}%)`
                                )}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <span className="text-green-600">✓</span>
                                {t('myGoals.goalAchieved', '목표 달성')} (
                                {goal.progress.toFixed(1)}%)
                              </span>
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
                  {t('myGoals.setGoalPrompt', '목표를 설정하세요')}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t(
                    'myGoals.setGoalDescription',
                    `${selectedPeriod.year}년 ${selectedPeriod.month}월의 목표를 설정해보세요.`
                  )}
                </p>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  size="sm"
                  variant="outline"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  {t('myGoals.setFirstGoal', '첫 번째 목표 설정')}
                </Button>
              </>
            ) : (
              <>
                <h3 className="font-medium text-foreground mb-2">
                  {t('myGoals.noGoalsSet', '설정된 목표가 없습니다')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(
                    'myGoals.noGoalsForMonth',
                    `${selectedPeriod.year}년 ${selectedPeriod.month}월에 설정된 목표가 없습니다.`
                  )}
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
