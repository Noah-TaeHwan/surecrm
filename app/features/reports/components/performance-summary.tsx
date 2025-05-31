import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Progress } from '~/common/components/ui/progress';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '~/lib/utils';
import type { NetworkStatusProps } from '../types';

export function PerformanceSummary({ performance }: NetworkStatusProps) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>소개 네트워크 현황</CardTitle>
          <CardDescription>이번 달 소개 활동 요약</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm">총 소개 건수</span>
            <span className="font-medium">{performance.totalReferrals}건</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">성공 전환</span>
            <span className="font-medium">
              {Math.round(
                (performance.totalReferrals * performance.conversionRate) / 100
              )}
              건
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">진행 중</span>
            <span className="font-medium">
              {performance.totalReferrals -
                Math.round(
                  (performance.totalReferrals * performance.conversionRate) /
                    100
                )}
              건
            </span>
          </div>
          <div className="pt-2">
            <TrendIndicator value={performance.growth.referrals} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>목표 달성률</CardTitle>
          <CardDescription>이번 달 목표 대비 진행 상황</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>신규 고객</span>
              <span>28/35명 (80%)</span>
            </div>
            <Progress value={80} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>소개 건수</span>
              <span>89/100건 (89%)</span>
            </div>
            <Progress value={89} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>수익 목표</span>
              <span>1.25/1.5억원 (83%)</span>
            </div>
            <Progress value={83} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
