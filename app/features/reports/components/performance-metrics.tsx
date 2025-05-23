import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Progress } from '~/common/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  BarChart3,
  DollarSign,
} from 'lucide-react';
import { cn } from '~/lib/utils';
import type { PerformanceMetricsProps } from './types';

export function PerformanceMetrics({ performance }: PerformanceMetricsProps) {
  const formatCurrency = (amount: number) => {
    return `${(amount / 10000000).toFixed(1)}천만원`;
  };

  const TrendIndicator = ({
    value,
    className,
  }: {
    value: number;
    className?: string;
  }) => {
    const isPositive = value > 0;
    return (
      <div
        className={cn(
          'flex items-center gap-1 text-sm',
          isPositive ? 'text-green-600' : 'text-red-600',
          className
        )}
      >
        {isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        <span>{Math.abs(value)}%</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardDescription>총 고객 수</CardDescription>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">{performance.totalClients}</CardTitle>
        </CardHeader>
        <CardContent>
          <TrendIndicator value={performance.growth.clients} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardDescription>이번 달 신규</CardDescription>
            <Target className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">{performance.newClients}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            소개 {performance.totalReferrals}건 포함
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardDescription>계약 전환율</CardDescription>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">
            {performance.conversionRate}%
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={performance.conversionRate} className="h-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardDescription>총 수익</CardDescription>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">
            {formatCurrency(performance.revenue)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TrendIndicator value={performance.growth.revenue} />
        </CardContent>
      </Card>
    </div>
  );
}
