import { Card, CardContent } from '~/common/components/ui/card';
import { TimerIcon, PersonIcon } from '@radix-ui/react-icons';
import type { InvitationStatsProps } from '../types';

export function InvitationStatsCards({
  availableCount,
  usedInvitations,
}: InvitationStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 사용 가능한 추천 코드 */}
      <Card className="hover:shadow-md transition-all duration-200 border-border/50 hover:border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            {/* 왼쪽: 아이콘 + 제목/설명 */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 p-2 bg-blue-500/10 rounded-lg">
                <TimerIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  사용 가능한 추천 코드
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {availableCount > 0
                    ? '동료를 추천해보세요'
                    : '모든 추천 코드를 사용했습니다'}
                </p>
              </div>
            </div>
            {/* 오른쪽: 숫자 값 */}
            <div className="flex-shrink-0">
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                {availableCount}개
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 추천 성공 */}
      <Card className="hover:shadow-md transition-all duration-200 border-border/50 hover:border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            {/* 왼쪽: 아이콘 + 제목/설명 */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 p-2 bg-green-500/10 rounded-lg">
                <PersonIcon className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  추천 성공
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {usedInvitations.length > 0
                    ? `${
                        usedInvitations[usedInvitations.length - 1]?.invitee
                          ?.name
                      }님이 최근 가입`
                    : '아직 추천한 동료가 없습니다'}
                </p>
              </div>
            </div>
            {/* 오른쪽: 숫자 값 */}
            <div className="flex-shrink-0">
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                {usedInvitations.length}명
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
