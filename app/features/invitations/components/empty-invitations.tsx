import { Card, CardContent } from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { CheckCircledIcon, PersonIcon } from '@radix-ui/react-icons';

interface EmptyInvitationsProps {
  usedCount: number;
}

export function EmptyInvitations({ usedCount }: EmptyInvitationsProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <CheckCircledIcon className="h-12 w-12 text-green-500 mb-4" />
        <div className="text-center">
          <h3 className="font-medium mb-2">
            모든 추천 코드를 사용했습니다! 🎉
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            SureCRM 프리미엄 멤버십은 가입 시 2개의 추천 코드만 제공됩니다.
            소중한 동료들에게 잘 사용하셨네요!
          </p>
          <Badge variant="outline" className="gap-1">
            <PersonIcon className="h-3 w-3" />
            {usedCount}명 추천 완료
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
