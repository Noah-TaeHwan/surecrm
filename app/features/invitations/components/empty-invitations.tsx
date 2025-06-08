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
            소중한 동료들에게 추천 코드를 잘 사용하셨네요! 추가 코드가
            필요하시면 관리자에게 문의해주세요.
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
