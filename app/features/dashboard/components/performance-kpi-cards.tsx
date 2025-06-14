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
import { formatCurrencyTable } from '~/lib/utils/currency';
import { InsuranceAgentEvents } from '~/lib/utils/analytics';

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
      title: '활성 계약',
      value: data.totalActiveContracts || 0,
      change: data.monthlyGrowth.revenue,
      icon: ActivityLogIcon,
      color: 'success',
      description: '체결된 보험계약',
    },
    {
      title: '월 보험료 합계',
      value: formatCurrencyTable(data.totalMonthlyPremium || 0),
      change: data.monthlyGrowth.revenue,
      icon: BarChartIcon,
      color: 'info',
      description: '고객 월 보험료 총합',
    },
    {
      title: '총 수수료',
      value: formatCurrencyTable(data.actualTotalCommission || 0),
      change: data.monthlyGrowth.revenue,
      icon: Share1Icon,
      color: 'warning',
      description: '실제 계약 수수료',
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {kpiItems.map((item, index) => {
          const changeIndicator = getChangeIndicator(item.change);
          const IconComponent = item.icon;

          return (
            <Card
              key={index}
              className="hover:shadow-md transition-all duration-200 border-border/50 hover:border-border cursor-pointer min-touch-target"
              onClick={() => {
                // 🎯 극한 분석: KPI 카드 클릭 이벤트 추적
                InsuranceAgentEvents.dashboardCardClick(item.title, {
                  value: item.value,
                  change: item.change,
                  cardIndex: index,
                });
              }}
            >
              <CardContent className="p-4 sm:p-5">
                {/* 📱 콤팩트한 단일 라인 레이아웃 - 모든 정보를 한 줄에 */}
                <div className="flex items-center justify-between gap-3">
                  {/* 왼쪽: 아이콘 + 제목/설명 */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
                      <IconComponent
                        className={cn(
                          'h-4 w-4 sm:h-5 sm:w-5',
                          getIconColorClass(item.color)
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-foreground truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* 오른쪽: 숫자 값 + 변화율 */}
                  <div className="flex-shrink-0 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <p className="text-xl sm:text-2xl font-bold text-foreground">
                        {typeof item.value === 'number'
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
                  </div>
                </div>

                {/* 💎 추가 세부 정보 - 평균 고객 가치 */}
                {item.title === '총 고객 수' && data.averageClientValue > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        평균 고객 가치
                      </span>
                      <span className="font-medium text-foreground">
                        {formatCurrencyTable(data.averageClientValue)}
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
