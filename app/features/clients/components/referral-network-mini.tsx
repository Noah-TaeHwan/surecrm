import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import { ArrowLeftIcon, Share1Icon } from '@radix-ui/react-icons';
import { Link } from 'react-router';

interface Client {
  id: string;
  name: string;
  referredBy?: {
    id: string;
    name: string;
    relationship: string;
  };
}

interface Referral {
  id: string;
  name: string;
  relationship: string;
}

interface ReferralNetworkStats {
  totalReferred: number;
  conversionRate: number;
}

interface ReferralNetworkMiniProps {
  client: Client;
  referrals: Referral[];
  stats: ReferralNetworkStats;
}

export function ReferralNetworkMini({
  client,
  referrals,
  stats,
}: ReferralNetworkMiniProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share1Icon className="h-5 w-5" />
          소개 네트워크
        </CardTitle>
        <CardDescription>이 고객을 중심으로 한 소개 관계</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 네트워크 통계 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {stats.totalReferred}
              </div>
              <div className="text-sm text-muted-foreground">소개한 고객</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {stats.conversionRate}%
              </div>
              <div className="text-sm text-muted-foreground">계약 전환율</div>
            </div>
          </div>

          {/* 소개 관계 시각화 */}
          <div className="space-y-3">
            {/* 소개받은 관계 */}
            {client.referredBy && (
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs bg-blue-100">
                      {client.referredBy.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{client.referredBy.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {client.referredBy.relationship}
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <ArrowLeftIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs bg-primary/10">
                      {client.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="font-medium">{client.name}</div>
                </div>
              </div>
            )}

            {/* 소개한 관계들 */}
            {referrals.slice(0, 3).map((referral) => (
              <div
                key={referral.id}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs bg-primary/10">
                      {client.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="font-medium">{client.name}</div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <ArrowLeftIcon className="h-4 w-4 text-muted-foreground rotate-180" />
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs bg-green-100">
                      {referral.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{referral.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {referral.relationship}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {referrals.length > 3 && (
              <div className="text-center">
                <Link to={`/network?focus=${client.id}`}>
                  <Button variant="outline" size="sm">
                    전체 네트워크 보기 ({referrals.length}명)
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
