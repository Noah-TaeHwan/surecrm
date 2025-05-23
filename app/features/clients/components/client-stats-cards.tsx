import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';

interface Stats {
  totalReferrals: number;
  averageDepth: number;
  topReferrers: Array<{
    name: string;
    count: number;
  }>;
}

interface ClientStatsCardsProps {
  totalCount: number;
  stats: Stats;
}

export function ClientStatsCards({ totalCount, stats }: ClientStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">총 고객 수</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCount}명</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">총 소개 건수</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalReferrals}건</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">평균 소개 깊이</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageDepth}차</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">핵심 소개자</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {stats.topReferrers.slice(0, 2).map((referrer, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <span>{referrer.name}</span>
                <Badge variant="outline" className="text-xs">
                  {referrer.count}건
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
