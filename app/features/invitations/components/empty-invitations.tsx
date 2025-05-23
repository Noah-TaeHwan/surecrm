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
          <h3 className="font-medium mb-2">모든 초대장을 사용했습니다! 🎉</h3>
          <p className="text-sm text-muted-foreground mb-4">
            초대받은 동료가 가입하면 새로운 초대장을 받을 수 있습니다.
          </p>
          <Badge variant="outline" className="gap-1">
            <PersonIcon className="h-3 w-3" />
            {usedCount}명 초대 완료
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
