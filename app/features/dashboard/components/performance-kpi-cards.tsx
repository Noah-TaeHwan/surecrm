import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Progress } from '~/common/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/common/components/ui/tooltip';
import {
  TriangleUpIcon,
  TriangleDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PersonIcon,
  Share1Icon,
  BarChartIcon,
  ActivityLogIcon,
  QuestionMarkCircledIcon,
} from '@radix-ui/react-icons';
import { cn } from '~/lib/utils';

// 새로운 타입 시스템 사용
import type { DashboardKPIData } from '../types';

interface PerformanceKPICardsProps {
  data: DashboardKPIData;
  isLoading?: boolean;
  // 🆕 실제 영업 상품 통계 추가
  salesStats?: {
    totalProducts: number;
    totalPremium: number;
    totalCommission: number;
    averagePremium: number;
    averageCommission: number;
    typeStats: Record<
      string,
      { count: number; premium: number; commission: number }
    >;
  };
}

export function PerformanceKPICards({
  data,
  isLoading = false,
  salesStats,
}: PerformanceKPICardsProps) {
  // 🆕 실제 영업 데이터를 활용한 KPI 계산 (1건 계약 = 1회성 수수료)
  const totalExpectedCommission = salesStats ? salesStats.totalCommission : 0;
  const averageCommissionPerDeal = salesStats
    ? salesStats.totalProducts > 0
      ? salesStats.totalCommission / salesStats.totalProducts
      : 0
    : 0;

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
      title: '예상 총 수수료',
      value: `${(totalExpectedCommission / 10000).toFixed(0)}만원`,
      change: data.monthlyGrowth.revenue,
      icon: ActivityLogIcon,
      color: 'success',
      description: `${salesStats?.totalProducts || 0}건 진행 중`,
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
      description: '계약 완료 / 전체 고객',
      isPercentage: true,
    },
  ];

  const getChangeIndicator = (change: number) => {
    // Infinity나 NaN 값 처리 (새로운 데이터)
    if (!isFinite(change)) {
      return {
        icon: null,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        prefix: '',
        isSpecial: true,
        label: '신규',
      };
    }

    // 매우 큰 변화율 처리 (500% 이상)
    if (Math.abs(change) >= 500) {
      return {
        icon: change > 0 ? ArrowUpIcon : ArrowDownIcon,
        color: change > 0 ? 'text-green-600' : 'text-red-600',
        bgColor:
          change > 0
            ? 'bg-green-100 dark:bg-green-900/20'
            : 'bg-red-100 dark:bg-red-900/20',
        prefix: change > 0 ? '+' : '',
        isSpecial: true,
        label: change > 0 ? '대폭증가' : '대폭감소',
      };
    }

    if (change > 0) {
      return {
        icon: ArrowUpIcon,
        color: 'text-green-600',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        prefix: '+',
        isSpecial: false,
      };
    } else if (change < 0) {
      return {
        icon: ArrowDownIcon,
        color: 'text-red-600',
        bgColor: 'bg-red-100 dark:bg-red-900/20',
        prefix: '',
        isSpecial: false,
      };
    } else {
      return {
        icon: null,
        color: 'text-muted-foreground',
        bgColor: 'bg-muted/20',
        prefix: '',
        isSpecial: false,
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
    <TooltipProvider>
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
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        {item.title}
                      </p>
                      {(item.title === '전환율' ||
                        item.title === '총 고객 수' ||
                        item.title === '예상 총 수수료' ||
                        item.title === '소개 네트워크') && (
                        <Tooltip>
                          <TooltipTrigger>
                            <QuestionMarkCircledIcon className="h-3 w-3 text-muted-foreground hover:text-foreground transition-colors" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            {item.title === '전환율' && (
                              <p className="">
                                전체 고객 대비 '계약 완료' 단계에 있는 고객의
                                비율입니다.
                                <br />
                                증가율: 지난 달 대비 계약 완료 고객 증가율
                              </p>
                            )}
                            {item.title === '총 고객 수' && (
                              <p className="">
                                전체 관리 중인 고객의 수입니다.
                                <br />
                                증가율: 지난 달 대비 신규 고객 증가율
                              </p>
                            )}
                            {item.title === '예상 총 수수료' && (
                              <p className="">
                                진행 중인 영업 기회들의 예상 계약 수수료
                                합계입니다.
                                <br />
                                평균 계약당 수수료:{' '}
                                {(averageCommissionPerDeal / 10000).toFixed(0)}
                                만원
                              </p>
                            )}
                            {item.title === '소개 네트워크' && (
                              <p className="">
                                총 소개받은 고객의 수입니다.
                                <br />
                                증가율: 지난 달 대비 소개 건수 증가율
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
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
                            {changeIndicator.isSpecial &&
                            changeIndicator.label ? (
                              changeIndicator.label
                            ) : (
                              <>
                                {changeIndicator.prefix}
                                {Math.round(Math.abs(item.change) * 10) / 10}%
                              </>
                            )}
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
    </TooltipProvider>
  );
}
