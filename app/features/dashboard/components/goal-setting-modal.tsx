import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/common/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/common/components/ui/form';
import { Input } from '~/common/components/ui/input';
import { Button } from '~/common/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Badge } from '~/common/components/ui/badge';
import { Card, CardContent } from '~/common/components/ui/card';
import {
  TargetIcon,
  Pencil1Icon,
  TrashIcon,
  CheckIcon,
  Cross2Icon,
} from '@radix-ui/react-icons';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const goalSchema = z.object({
  goalType: z.enum(['revenue', 'clients', 'referrals']),
  targetValue: z.string().min(1, '목표값을 입력해주세요'),
  title: z.string().optional(),
  targetYear: z.string().min(1, '목표 연도를 선택해주세요'),
  targetMonth: z.string().min(1, '목표 월을 선택해주세요'),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface Goal {
  id: string;
  title: string;
  goalType: 'revenue' | 'clients' | 'referrals' | 'conversion_rate';
  targetValue: number;
  currentValue: number;
  progress: number;
  period: string;
  startDate: string;
  endDate: string;
}

interface GoalSettingModalProps {
  currentGoals: Goal[];
  onSaveGoal: (goalData: {
    goalType: 'revenue' | 'clients' | 'referrals';
    targetValue: number;
    title?: string;
    id?: string; // 수정 시 필요
    targetYear: number;
    targetMonth: number;
  }) => Promise<void>;
  onDeleteGoal?: (goalId: string) => Promise<void>;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function GoalSettingModal({
  currentGoals,
  onSaveGoal,
  onDeleteGoal,
  trigger,
  isOpen: externalIsOpen,
  onOpenChange: externalOnOpenChange,
}: GoalSettingModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);

  // 외부에서 제어되는 경우와 내부에서 제어되는 경우를 구분
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalOnOpenChange || setInternalIsOpen;

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      goalType: 'revenue',
      targetValue: '',
      title: '',
      targetYear: new Date().getFullYear().toString(),
      targetMonth: (new Date().getMonth() + 1).toString(),
    },
  });

  // ✅ 선택한 년/월에 해당하는 목표만 필터링
  const selectedYear = parseInt(form.watch('targetYear'));
  const selectedMonth = parseInt(form.watch('targetMonth'));

  const filteredGoals = currentGoals.filter((goal) => {
    const goalStartDate = new Date(goal.startDate);
    const goalYear = goalStartDate.getFullYear();
    const goalMonth = goalStartDate.getMonth() + 1;

    return goalYear === selectedYear && goalMonth === selectedMonth;
  });

  const onSubmit = async (data: GoalFormData) => {
    setIsLoading(true);
    try {
      // 🔧 수정: 제목이 비어있을 때 자동으로 한국어 제목 생성
      let autoTitle = data.title;
      if (!autoTitle || autoTitle.trim() === '') {
        const year = data.targetYear;
        const month = data.targetMonth;

        switch (data.goalType) {
          case 'referrals':
            autoTitle = `소개 목표 (${year}년 ${month}월)`;
            break;
          case 'clients':
            autoTitle = `신규 고객 목표 (${year}년 ${month}월)`;
            break;
          case 'revenue':
            autoTitle = `수수료 목표 (${year}년 ${month}월)`;
            break;
          default:
            autoTitle = `목표 (${year}년 ${month}월)`;
        }
      }

      await onSaveGoal({
        ...data,
        title: autoTitle,
        targetValue: Number(data.targetValue),
        targetYear: Number(data.targetYear),
        targetMonth: Number(data.targetMonth),
        id: editingGoal?.id, // 수정 시 ID 포함
      });
      setIsOpen(false);
      form.reset();
      setEditingGoal(null);
    } catch (error) {
      console.error('목표 설정 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    form.setValue('goalType', goal.goalType as any);
    form.setValue('targetValue', goal.targetValue.toString());
    form.setValue('title', goal.title);

    // 목표의 시작 날짜에서 연도와 월 추출
    const startDate = new Date(goal.startDate);
    form.setValue('targetYear', startDate.getFullYear().toString());
    form.setValue('targetMonth', (startDate.getMonth() + 1).toString());
  };

  const handleDelete = async (goalId: string) => {
    if (!onDeleteGoal) return;

    setDeletingGoalId(goalId);
    try {
      await onDeleteGoal(goalId);
    } catch (error) {
      console.error('목표 삭제 오류:', error);
    } finally {
      setDeletingGoalId(null);
    }
  };

  const handleCancel = () => {
    setEditingGoal(null);
    form.reset();
  };

  const getGoalTypeLabel = (type: string) => {
    switch (type) {
      case 'revenue':
        return '수수료';
      case 'clients':
        return '고객 수';
      case 'referrals':
        return '소개 건수';
      default:
        return type;
    }
  };

  const getGoalTypeUnit = (type: string) => {
    switch (type) {
      case 'revenue':
        return '만원';
      case 'clients':
        return '명';
      case 'referrals':
        return '건';
      default:
        return '';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-primary text-primary-foreground';
    if (progress >= 80) return 'bg-chart-2 text-chart-2-foreground';
    if (progress >= 60) return 'bg-chart-3 text-chart-3-foreground';
    if (progress >= 40) return 'bg-chart-4 text-chart-4-foreground';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <TargetIcon className="h-5 w-5 text-primary" />
            {editingGoal ? '목표 수정' : '목표 설정'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {editingGoal
              ? '설정된 목표를 수정하거나 삭제할 수 있습니다.'
              : '특정 월의 목표를 설정하고 달성률을 확인하세요.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 🗓️ STEP 1: 목표 기간 선택 (가장 먼저) */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <h4 className="text-sm font-medium text-primary mb-3 flex items-center gap-2">
                📅 목표 기간 설정
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="targetYear"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium">
                        목표 연도
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 text-sm">
                            <SelectValue placeholder="연도 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 3 }, (_, i) => {
                            const year = new Date().getFullYear() + i;
                            return (
                              <SelectItem
                                key={year}
                                value={year.toString()}
                                className="text-sm py-2"
                              >
                                {year}년
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetMonth"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium">
                        목표 월
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 text-sm">
                            <SelectValue placeholder="월 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => {
                            const month = i + 1;
                            return (
                              <SelectItem
                                key={month}
                                value={month.toString()}
                                className="text-sm py-2"
                              >
                                {month}월
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                💡 선택한 기간의 목표를 설정하고 실시간 달성률을 확인할 수
                있습니다
              </p>
            </div>

            {/* 🎯 STEP 2: 현재 목표 현황 */}
            {currentGoals.length > 0 && !editingGoal && (
              <div className="space-y-4 pb-4 border-b border-border/30">
                <h4 className="text-base font-medium text-foreground flex items-center gap-2">
                  🎯 현재 설정된 목표
                </h4>
                <div className="space-y-3">
                  {filteredGoals.map((goal) => (
                    <Card
                      key={goal.id}
                      className="border-border/50 hover:border-border transition-colors"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <span className="text-sm font-medium text-foreground">
                              {goal.title || getGoalTypeLabel(goal.goalType)}
                            </span>
                            <div className="text-xs text-muted-foreground mt-1">
                              📅 {new Date(goal.startDate).getFullYear()}년{' '}
                              {new Date(goal.startDate).getMonth() + 1}월 목표
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className={`text-xs px-2 py-1 ${getProgressColor(
                                goal.progress
                              )}`}
                            >
                              {Math.round(goal.progress)}%
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(goal)}
                              className="h-7 w-7 p-0 hover:bg-muted"
                            >
                              <Pencil1Icon className="h-3 w-3" />
                            </Button>
                            {onDeleteGoal && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(goal.id)}
                                disabled={deletingGoalId === goal.id}
                                className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <TrashIcon className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <div className="text-lg font-semibold text-foreground">
                            {goal.currentValue.toLocaleString()} /{' '}
                            {goal.targetValue.toLocaleString()}{' '}
                            {getGoalTypeUnit(goal.goalType)}
                          </div>
                        </div>

                        <div className="w-full bg-muted rounded-full h-3 mb-1">
                          <div
                            className="bg-primary h-3 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(goal.progress, 100)}%`,
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 🚀 STEP 3: 새 목표 설정 */}
            <div className="space-y-4">
              <h4 className="text-base font-medium text-foreground flex items-center gap-2">
                🚀 {editingGoal ? '목표 수정' : '새 목표 설정'}
              </h4>

              <FormField
                control={form.control}
                name="goalType"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium">
                      목표 유형
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 text-sm">
                          <SelectValue placeholder="목표 유형을 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="revenue" className="text-sm py-2">
                          💰 수수료 목표
                        </SelectItem>
                        <SelectItem value="clients" className="text-sm py-2">
                          👥 신규 고객 목표
                        </SelectItem>
                        <SelectItem value="referrals" className="text-sm py-2">
                          🤝 소개 목표
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetValue"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium">
                      목표값 ({getGoalTypeUnit(form.watch('goalType'))})
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="목표값을 입력하세요"
                        className="h-10 text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      {form.watch('goalType') === 'revenue' &&
                        '만원 단위로 입력하세요 (예: 5000 = 5천만원)'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium">
                      목표 제목 (선택사항)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="목표에 대한 설명을 입력하세요"
                        className="h-10 text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      비워두면 자동으로 생성됩니다
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2 pt-4">
              {editingGoal && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="gap-2 h-9 px-4"
                >
                  <Cross2Icon className="h-3 w-3" />
                  취소
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="h-9 px-4"
              >
                닫기
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="gap-2 h-9 px-4"
              >
                <CheckIcon className="h-3 w-3" />
                {isLoading
                  ? '저장 중...'
                  : editingGoal
                  ? '목표 수정'
                  : '목표 설정'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
