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
import { TargetIcon } from '@radix-ui/react-icons';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const goalSchema = z.object({
  goalType: z.enum(['revenue', 'clients', 'meetings', 'referrals']),
  targetValue: z.string().min(1, '목표값을 입력해주세요'),
  title: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

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

interface GoalSettingModalProps {
  currentGoals: Goal[];
  onSaveGoal: (goalData: {
    goalType: 'revenue' | 'clients' | 'meetings' | 'referrals';
    targetValue: number;
    title?: string;
  }) => Promise<void>;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function GoalSettingModal({
  currentGoals,
  onSaveGoal,
  trigger,
  isOpen: externalIsOpen,
  onOpenChange: externalOnOpenChange,
}: GoalSettingModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 외부에서 제어되는 경우와 내부에서 제어되는 경우를 구분
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalOnOpenChange || setInternalIsOpen;

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      goalType: 'revenue',
      targetValue: '',
      title: '',
    },
  });

  const onSubmit = async (data: GoalFormData) => {
    setIsLoading(true);
    try {
      await onSaveGoal({
        ...data,
        targetValue: Number(data.targetValue),
      });
      setIsOpen(false);
      form.reset();
    } catch (error) {
      console.error('목표 설정 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getGoalTypeLabel = (type: string) => {
    switch (type) {
      case 'revenue':
        return '매출';
      case 'clients':
        return '고객 수';
      case 'meetings':
        return '미팅 수';
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
      case 'meetings':
        return '건';
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TargetIcon className="h-5 w-5 text-primary" />
            월간 목표 설정
          </DialogTitle>
          <DialogDescription>
            이번 달 달성하고 싶은 목표를 설정하세요. 설정된 목표는 대시보드에서
            진행률을 확인할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        {/* 현재 목표 현황 */}
        {currentGoals.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">현재 목표</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentGoals.map((goal) => (
                <Card key={goal.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">
                        {getGoalTypeLabel(goal.goalType)}
                      </span>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getProgressColor(goal.progress)}`}
                      >
                        {Math.round(goal.progress)}%
                      </Badge>
                    </div>
                    <div className="text-lg font-semibold text-foreground mb-1">
                      {goal.currentValue.toLocaleString()} /{' '}
                      {goal.targetValue.toLocaleString()}{' '}
                      {getGoalTypeUnit(goal.goalType)}
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(goal.progress, 100)}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="goalType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>목표 유형</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="목표 유형을 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="revenue">매출 목표</SelectItem>
                        <SelectItem value="clients">신규 고객 목표</SelectItem>
                        <SelectItem value="meetings">미팅 목표</SelectItem>
                        <SelectItem value="referrals">소개 목표</SelectItem>
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
                  <FormItem>
                    <FormLabel>
                      목표값 ({getGoalTypeUnit(form.watch('goalType'))})
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="목표값을 입력하세요"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {form.watch('goalType') === 'revenue' &&
                        '만원 단위로 입력하세요 (예: 5000 = 5천만원)'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>목표 제목 (선택사항)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="목표에 대한 설명을 입력하세요"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    비워두면 자동으로 생성됩니다
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                취소
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? '저장 중...' : '목표 설정'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
