import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { LockClosedIcon, PersonIcon } from '@radix-ui/react-icons';
import type { ClientStats } from '~/features/clients/types';

// 🔄 하위 호환성을 위한 레거시 Stats 타입
interface LegacyStats {
  totalReferrals: number;
  averageDepth: number;
  topReferrers: Array<{
    name: string;
    count: number;
  }>;
}

// 🔧 통합 Stats 타입 (레거시와 새 타입 모두 지원)
type UnifiedStats = ClientStats & Partial<LegacyStats>;

interface ClientStatsCardsProps {
  totalCount: number;
  stats: UnifiedStats;
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
          <div className="text-xs text-muted-foreground mt-1">
            활성: {stats.activeClients}명 / 비활성: {stats.inactiveClients}명
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">중요도 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>높음</span>
              <Badge variant="destructive" className="text-xs">
                {stats.importanceDistribution.high}명
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>보통</span>
              <Badge variant="default" className="text-xs">
                {stats.importanceDistribution.medium}명
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>낮음</span>
              <Badge variant="secondary" className="text-xs">
                {stats.importanceDistribution.low}명
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-1">
            <LockClosedIcon className="h-3 w-3" />
            개인정보 보호
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.privacyDistribution ? (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>공개</span>
                <Badge variant="outline" className="text-xs">
                  {stats.privacyDistribution.public}명
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>제한</span>
                <Badge variant="secondary" className="text-xs">
                  {stats.privacyDistribution.restricted}명
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>기밀</span>
                <Badge variant="destructive" className="text-xs">
                  {stats.privacyDistribution.confidential}명
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-2xl font-bold">
              {stats.totalReferrals || 0}건
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            데이터 컴플라이언스
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.dataComplianceStatus ? (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>GDPR 준수</span>
                <Badge variant="default" className="text-xs">
                  {stats.dataComplianceStatus.gdprCompliant}명
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>동의 만료</span>
                <Badge variant="outline" className="text-xs">
                  {stats.dataComplianceStatus.consentExpiring}명
                </Badge>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {stats.topReferrers?.slice(0, 2).map((referrer, index) => (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
