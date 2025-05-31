import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import {
  PersonIcon,
  ClockIcon,
  TargetIcon,
  ActivityLogIcon,
} from '@radix-ui/react-icons';
import type { TeamStatsCardsProps } from '../types';

export function TeamStatsCards({ stats }: TeamStatsCardsProps) {
  // 안전한 계산을 위한 헬퍼 함수
  const getAverageClients = () => {
    if (stats.activeMembers === 0) return 0;
    return Math.round(stats.totalClients / stats.activeMembers);
  };

  const getTeamStatus = () => {
    const totalTeamSize = stats.totalMembers;
    if (totalTeamSize === 0) return '시작 단계';
    if (totalTeamSize <= 3) return '소규모';
    if (totalTeamSize <= 10) return '성장 중';
    return '대규모';
  };

  const getTeamStatusDescription = () => {
    const status = getTeamStatus();
    const pending = stats.pendingInvites;

    if (status === '시작 단계') return '팀원을 초대해 보세요';
    if (pending > 0) return `${pending}명 초대 대기 중`;
    return '팀 운영 중';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">총 팀원</CardTitle>
          <PersonIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalMembers}명</div>
          <p className="text-xs text-muted-foreground">
            활성: {stats.activeMembers}명
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">대기 중 초대</CardTitle>
          <ClockIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingInvites}명</div>
          <p className="text-xs text-muted-foreground">
            {stats.pendingInvites > 0 ? '초대 승인 대기 중' : '모든 초대 완료'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">팀 고객 수</CardTitle>
          <TargetIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalClients}명</div>
          <p className="text-xs text-muted-foreground">
            팀원당 평균 {getAverageClients()}명
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">팀 상태</CardTitle>
          <ActivityLogIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getTeamStatus()}</div>
          <p className="text-xs text-muted-foreground">
            {getTeamStatusDescription()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
