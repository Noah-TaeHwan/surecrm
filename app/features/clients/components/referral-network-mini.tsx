import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import { Button } from '~/common/components/ui/button';
import { Link } from 'react-router';
import type { ClientDisplay } from '~/features/clients/types';
import { typeHelpers } from '~/features/clients/types';

interface ReferralNetworkMiniProps {
  client: ClientDisplay;
  referrals: ClientDisplay[];
  onSeeMore?: () => void;
}

export function ReferralNetworkMini({
  client,
  referrals,
  onSeeMore,
}: ReferralNetworkMiniProps) {
  const displayReferrals = referrals.slice(0, 3);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">소개 네트워크</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 현재 고객이 소개받은 사람 */}
          {client.referredBy && (
            <div className="pb-3 border-b">
              <p className="text-sm text-muted-foreground mb-2">소개자</p>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {client.referredBy.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Link
                    to={`/clients/${client.referredBy.id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {client.referredBy.fullName}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {client.referredBy.phone}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 현재 고객이 소개한 사람들 */}
          {displayReferrals.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                소개한 고객 ({referrals.length}명)
              </p>
              <div className="space-y-3">
                {displayReferrals.map((referral) => (
                  <div key={referral.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {typeHelpers.getClientDisplayName(referral).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Link
                        to={`/clients/${referral.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {typeHelpers.getClientDisplayName(referral)}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {referral.currentStage?.name ||
                            referral.stage ||
                            'Lead'}
                        </Badge>
                        {referral.contractAmount && (
                          <span className="text-xs text-muted-foreground">
                            {referral.contractAmount.toLocaleString()}원
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {referrals.length > 3 && onSeeMore && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSeeMore}
                  className="w-full mt-3"
                >
                  더 보기 ({referrals.length - 3}명)
                </Button>
              )}
            </div>
          )}

          {displayReferrals.length === 0 && !client.referredBy && (
            <p className="text-sm text-muted-foreground text-center py-4">
              소개 네트워크가 없습니다.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
