import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { TimerIcon, PersonIcon } from '@radix-ui/react-icons';
import type { InvitationStatsProps } from './types';

export function InvitationStatsCards({
  availableCount,
  usedInvitations,
}: InvitationStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            사용 가능한 초대장
          </CardTitle>
          <TimerIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">{availableCount}장</div>
          <p className="text-xs text-muted-foreground">
            {availableCount > 0
              ? '동료를 초대해보세요'
              : '모든 초대장을 사용했습니다'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">초대 성공</CardTitle>
          <PersonIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">
            {usedInvitations.length}명
          </div>
          <p className="text-xs text-muted-foreground">
            {usedInvitations.length > 0
              ? `${
                  usedInvitations[usedInvitations.length - 1]?.invitee?.name
                }님이 최근 가입`
              : '아직 초대한 동료가 없습니다'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
