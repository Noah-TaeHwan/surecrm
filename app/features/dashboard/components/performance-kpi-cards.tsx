import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import {
  PersonIcon,
  Share1Icon,
  BarChartIcon,
  TriangleUpIcon,
  TriangleDownIcon,
} from '@radix-ui/react-icons';

interface KPIData {
  totalClients: number;
  monthlyNewClients: number;
  totalReferrals: number;
  conversionRate: number;
  monthlyGrowth: {
    clients: number;
    referrals: number;
    revenue: number;
  };
}

interface PerformanceKPICardsProps {
  data: KPIData;
}

export function PerformanceKPICards({ data }: PerformanceKPICardsProps) {
  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getTrendIcon = (value: number) => {
    if (value > 0)
      return <TriangleUpIcon className="h-3 w-3 text-foreground" />;
    if (value < 0)
      return <TriangleDownIcon className="h-3 w-3 text-muted-foreground" />;
    return null;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-foreground';
    if (value < 0) return 'text-muted-foreground';
    return 'text-muted-foreground';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* 총 고객 수 */}
      <Card className="border-border/50 hover:shadow-sm transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            총 고객
          </CardTitle>
          <div className="p-2 bg-primary/10 rounded-lg">
            <PersonIcon className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="pt-1">
          <div className="text-2xl font-bold text-foreground mb-2">
            {data.totalClients.toLocaleString()}
          </div>
          <div className="flex items-center gap-1">
            {getTrendIcon(data.monthlyGrowth.clients)}
            <p
              className={`text-xs font-medium ${getTrendColor(
                data.monthlyGrowth.clients
              )}`}
            >
              전월 대비 {formatPercentage(data.monthlyGrowth.clients)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 이번 달 신규 고객 */}
      <Card className="border-border/50 hover:shadow-sm transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            이번 달 신규
          </CardTitle>
          <div className="p-2 bg-muted/20 rounded-lg">
            <PersonIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="pt-1">
          <div className="text-2xl font-bold text-foreground mb-2">
            {data.monthlyNewClients}
          </div>
          <Badge
            variant="secondary"
            className="text-xs bg-muted/20 text-muted-foreground border-border/30"
          >
            신규 고객
          </Badge>
        </CardContent>
      </Card>

      {/* 총 소개 건수 */}
      <Card className="border-border/50 hover:shadow-sm transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            총 소개
          </CardTitle>
          <div className="p-2 bg-primary/10 rounded-lg">
            <Share1Icon className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="pt-1">
          <div className="text-2xl font-bold text-foreground mb-2">
            {data.totalReferrals}
          </div>
          <div className="flex items-center gap-1">
            {getTrendIcon(data.monthlyGrowth.referrals)}
            <p
              className={`text-xs font-medium ${getTrendColor(
                data.monthlyGrowth.referrals
              )}`}
            >
              전월 대비 {formatPercentage(data.monthlyGrowth.referrals)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 계약 전환율 */}
      <Card className="border-border/50 hover:shadow-sm transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            계약 전환율
          </CardTitle>
          <div className="p-2 bg-muted/20 rounded-lg">
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="pt-1">
          <div className="text-2xl font-bold text-foreground mb-2">
            {data.conversionRate.toFixed(1)}%
          </div>
          <Badge
            variant="secondary"
            className={`text-xs ${
              data.conversionRate >= 70
                ? 'bg-primary/10 text-primary border-primary/20'
                : data.conversionRate >= 50
                ? 'bg-muted/20 text-muted-foreground border-border/30'
                : 'bg-muted/20 text-muted-foreground border-border/30'
            }`}
          >
            {data.conversionRate >= 70
              ? '우수'
              : data.conversionRate >= 50
              ? '양호'
              : '개선 필요'}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
