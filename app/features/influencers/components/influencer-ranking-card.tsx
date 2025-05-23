import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import { HeartIcon } from '@radix-ui/react-icons';
import { Link } from 'react-router';
import { cn } from '~/lib/utils';
import type { Influencer } from './types';

interface InfluencerRankingCardProps {
  influencers: Influencer[];
  onGratitudeClick: (influencer: Influencer) => void;
}

// 관계 강도별 색상
function getRelationshipColor(strength: number) {
  if (strength >= 90) return 'text-green-700 bg-green-50 border-green-200';
  if (strength >= 80) return 'text-blue-700 bg-blue-50 border-blue-200';
  if (strength >= 70) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
  return 'text-red-700 bg-red-50 border-red-200';
}

export function InfluencerRankingCard({
  influencers,
  onGratitudeClick,
}: InfluencerRankingCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>핵심 소개자 순위</CardTitle>
        <CardDescription>
          소개 건수, 계약 전환율, 네트워크 영향력을 종합한 순위입니다
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {influencers.map((influencer, index) => (
            <div
              key={influencer.id}
              className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              {/* 순위 */}
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                {index + 1}
              </div>

              {/* 프로필 */}
              <div className="flex items-center gap-3 flex-1">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{influencer.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <Link
                    to={`/clients/${influencer.id}`}
                    className="font-semibold hover:text-primary"
                  >
                    {influencer.name}
                  </Link>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>총 소개: {influencer.totalReferrals}건</span>
                    <span>성공: {influencer.successfulContracts}건</span>
                    <span>전환율: {influencer.conversionRate}%</span>
                  </div>
                </div>
              </div>

              {/* 네트워크 정보 */}
              <div className="hidden md:flex flex-col items-center text-sm">
                <div className="font-medium">네트워크</div>
                <div className="text-muted-foreground">
                  {influencer.networkDepth}단계 · {influencer.networkWidth}명
                </div>
              </div>

              {/* 계약 가치 */}
              <div className="hidden lg:flex flex-col items-center text-sm">
                <div className="font-medium">총 계약가치</div>
                <div className="text-muted-foreground">
                  {(influencer.totalContractValue / 100000000).toFixed(1)}억원
                </div>
              </div>

              {/* 관계 강도 */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'px-2 py-1 rounded text-sm font-medium border',
                    getRelationshipColor(influencer.relationshipStrength)
                  )}
                >
                  {influencer.relationshipStrength}%
                </div>
              </div>

              {/* 액션 버튼 */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => onGratitudeClick(influencer)}
              >
                <HeartIcon className="h-4 w-4 mr-2" />
                감사 표현
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
