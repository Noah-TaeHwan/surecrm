import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Progress } from '~/common/components/ui/progress';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import type { Client, ReferralNetwork, BadgeVariant } from './types';

interface ClientNetworkTabProps {
  client: Client;
  referralNetwork: ReferralNetwork;
}

export function ClientNetworkTab({
  client,
  referralNetwork,
}: ClientNetworkTabProps) {
  const stageBadgeVariant: Record<string, BadgeVariant> = {
    '첫 상담': 'outline',
    '니즈 분석': 'outline',
    '상품 설명': 'outline',
    '계약 검토': 'outline',
    '계약 완료': 'default',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>소개한 고객들</CardTitle>
              <CardDescription>
                {client.name}님이 소개해주신 고객 목록
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {referralNetwork.referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {referral.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{referral.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {referral.relationship} • {referral.phone}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={stageBadgeVariant[referral.stage]}>
                        {referral.stage}
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">
                        ₩{referral.contractAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>네트워크 통계</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-primary">
                    {referralNetwork.stats.totalReferred}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    소개한 고객
                  </div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {referralNetwork.stats.totalContracts}
                  </div>
                  <div className="text-sm text-muted-foreground">계약 성사</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    ₩{referralNetwork.stats.totalValue.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    총 계약 가치
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>전환율</span>
                    <span>{referralNetwork.stats.conversionRate}%</span>
                  </div>
                  <Progress
                    value={referralNetwork.stats.conversionRate}
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
