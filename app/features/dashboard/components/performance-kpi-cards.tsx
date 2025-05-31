import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Progress } from '~/common/components/ui/progress';
import {
  TriangleUpIcon,
  TriangleDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PersonIcon,
  Share1Icon,
  BarChartIcon,
  ActivityLogIcon,
} from '@radix-ui/react-icons';
import { cn } from '~/lib/utils';

// 새로운 타입 시스템 사용
import type { DashboardKPIData } from '../types';

interface PerformanceKPICardsProps {
  data: DashboardKPIData;
  isLoading?: boolean;
}

export function PerformanceKPICards({
  data,
  isLoading = false,
}: PerformanceKPICardsProps) {
  const kpiItems = [
    {
      title: '총 고객 수',
      value: data.totalClients,
      change: data.clientGrowthPercentage,
      icon: PersonIcon,
      color: 'primary',
      description: '전체 관리 고객',
    },
    {
      title: '신규 고객',
      value: data.monthlyNewClients,
      change: data.monthlyGrowth.clients,
      icon: TriangleUpIcon,
      color: 'success',
      description: '이번 달 신규',
    },
    {
      title: '소개 네트워크',
      value: data.totalReferrals,
      change: data.referralGrowthPercentage,
      icon: Share1Icon,
      color: 'info',
      description: '총 소개 건수',
    },
    {
      title: '전환율',
      value: `${data.conversionRate.toFixed(1)}%`,
      change: data.monthlyGrowth.revenue,
      icon: BarChartIcon,
      color: 'warning',
      description: '계약 전환율',
      isPercentage: true,
    },
  ];

  const getChangeIndicator = (change: number) => {
    if (change > 0) {
      return {
        icon: ArrowUpIcon,
        color: 'text-green-600',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        prefix: '+',
      };
    } else if (change < 0) {
      return {
        icon: ArrowDownIcon,
        color: 'text-red-600',
        bgColor: 'bg-red-100 dark:bg-red-900/20',
        prefix: '',
      };
    } else {
      return {
        icon: null,
        color: 'text-muted-foreground',
        bgColor: 'bg-muted/20',
        prefix: '',
      };
    }
  };

  const getIconColorClass = (color: string) => {
    switch (color) {
      case 'primary':
        return 'text-primary';
      case 'success':
        return 'text-green-600';
      case 'info':
        return 'text-blue-600';
      case 'warning':
        return 'text-orange-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getBackgroundColorClass = (color: string) => {
    switch (color) {
      case 'primary':
        return 'bg-primary/10';
      case 'success':
        return 'bg-green-100 dark:bg-green-900/20';
      case 'info':
        return 'bg-blue-100 dark:bg-blue-900/20';
      case 'warning':
        return 'bg-orange-100 dark:bg-orange-900/20';
      default:
        return 'bg-muted/20';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                  <div className="h-3 bg-muted rounded w-24"></div>
                </div>
                <div className="h-10 w-10 bg-muted rounded-lg"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiItems.map((item, index) => {
        const changeIndicator = getChangeIndicator(item.change);
        const IconComponent = item.icon;

        return (
          <Card
            key={index}
            className="hover:shadow-md transition-all duration-200 border-border/50 hover:border-border"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {item.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-foreground">
                      {typeof item.value === 'number' && !item.isPercentage
                        ? item.value.toLocaleString()
                        : item.value}
                    </p>
                    {item.change !== 0 && (
                      <div
                        className={cn(
                          'flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium',
                          changeIndicator.bgColor
                        )}
                      >
                        {changeIndicator.icon && (
                          <changeIndicator.icon
                            className={cn('h-3 w-3', changeIndicator.color)}
                          />
                        )}
                        <span className={changeIndicator.color}>
                          {changeIndicator.prefix}
                          {Math.abs(item.change).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <div
                  className={cn(
                    'flex items-center justify-center h-12 w-12 rounded-lg',
                    getBackgroundColorClass(item.color)
                  )}
                >
                  <IconComponent
                    className={cn('h-6 w-6', getIconColorClass(item.color))}
                  />
                </div>
              </div>

              {/* 진행률 표시 (전환율의 경우) */}
              {item.title === '전환율' && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>목표 대비</span>
                    <span>{data.conversionRate.toFixed(1)}% / 20%</span>
                  </div>
                  <Progress
                    value={Math.min(data.conversionRate, 20) * 5}
                    className="h-2"
                  />
                </div>
              )}

              {/* 추가 세부 정보 */}
              {item.title === '총 고객 수' && data.averageClientValue > 0 && (
                <div className="mt-4 p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      평균 고객 가치
                    </span>
                    <span className="font-medium text-foreground">
                      {(data.averageClientValue / 10000).toFixed(0)}만원
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
