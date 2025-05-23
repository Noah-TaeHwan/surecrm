import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { PersonIcon, ClockIcon, FileTextIcon } from '@radix-ui/react-icons';
import type { TeamStatsCardsProps } from './types';

export function TeamStatsCards({ stats }: TeamStatsCardsProps) {
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
          <PersonIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalClients}명</div>
          <p className="text-xs text-muted-foreground">
            팀원당 평균 {Math.round(stats.totalClients / stats.activeMembers)}명
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">성과 요약</CardTitle>
          <FileTextIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">활발</div>
          <p className="text-xs text-muted-foreground">팀 운영 상태 양호</p>
        </CardContent>
      </Card>
    </div>
  );
}
