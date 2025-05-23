import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import type { Influencer } from './types';

interface InfluencerAnalysisCardProps {
  influencers: Influencer[];
}

// 소개 패턴 차트 렌더링
function renderReferralPattern(pattern: Record<string, number | undefined>) {
  const entries = Object.entries(pattern).filter(
    ([_, count]) => count && count > 0
  );
  const total = entries.reduce((sum, [_, count]) => sum + (count || 0), 0);

  const typeLabels: Record<string, string> = {
    family: '가족보험',
    health: '건강보험',
    car: '자동차보험',
    life: '생명보험',
    property: '재산보험',
  };

  return (
    <div className="space-y-3">
      {entries.map(([type, count]) => (
        <div key={type}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-muted-foreground">
              {typeLabels[type] || type}
            </span>
            <span className="text-sm font-semibold">
              {count}건 ({Math.round(((count || 0) / total) * 100)}%)
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((count || 0) / total) * 100}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function InfluencerAnalysisCard({
  influencers,
}: InfluencerAnalysisCardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {influencers.slice(0, 4).map((influencer) => (
        <Card key={influencer.id}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{influencer.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{influencer.name}</CardTitle>
                <CardDescription>
                  #{influencer.rank} 순위 · 관계강도{' '}
                  {influencer.relationshipStrength}%
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 월별 소개 트렌드 */}
            <div>
              <div className="text-sm font-medium mb-2">월별 소개 건수</div>
              <div className="flex items-end gap-2 h-20">
                {influencer.monthlyReferrals.map((count, index) => (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-full bg-primary/60 rounded-t"
                      style={{
                        height: `${Math.max((count / 4) * 100, 10)}%`,
                      }}
                    />
                    <div className="text-xs text-muted-foreground">{count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 소개 패턴 */}
            <div>
              <div className="text-sm font-medium mb-2">소개 패턴 분석</div>
              {renderReferralPattern(influencer.referralPattern)}
            </div>

            {/* 네트워크 효과 */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {influencer.networkDepth}
                </div>
                <div className="text-sm text-muted-foreground">소개 깊이</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {influencer.networkWidth}
                </div>
                <div className="text-sm text-muted-foreground">네트워크 폭</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
