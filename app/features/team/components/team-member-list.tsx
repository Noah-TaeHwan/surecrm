import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/common/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/common/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import { Badge } from '~/common/components/ui/badge';
import { Button } from '~/common/components/ui/button';
import {
  DotsHorizontalIcon,
  TrashIcon,
  Share1Icon,
  PersonIcon,
  PlusIcon,
} from '@radix-ui/react-icons';
import type {
  TeamMemberListProps,
  TeamMemberRole,
  TeamMemberStatus,
} from '../types';
import { TEAM_ROLE_LABELS, TEAM_STATUS_LABELS } from '../types';

export function TeamMemberList({
  members,
  onRemoveMember,
  onResendInvite,
  onViewMember,
}: TeamMemberListProps) {
  const statusBadgeVariant: Record<
    TeamMemberStatus,
    'default' | 'secondary' | 'outline' | 'destructive'
  > = {
    active: 'default',
    pending: 'outline',
    inactive: 'secondary',
  };

  const roleBadgeVariant: Record<
    TeamMemberRole,
    'default' | 'secondary' | 'outline' | 'destructive'
  > = {
    admin: 'destructive',
    manager: 'default',
    member: 'secondary',
  };

  const handleRemoveMember = (memberId: string) => {
    if (confirm('정말로 이 팀원을 제거하시겠습니까?')) {
      onRemoveMember(memberId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>팀원 목록</CardTitle>
        <CardDescription>현재 팀원들과 초대 상태를 관리하세요</CardDescription>
      </CardHeader>
      <CardContent>
        {members.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>팀원</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>가입일</TableHead>
                <TableHead>성과</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {member.name?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <button
                          onClick={() => onViewMember(member)}
                          className="font-medium text-sm hover:text-primary cursor-pointer transition-colors"
                        >
                          {member.name || '이름 없음'}
                        </button>
                        <div className="text-sm text-muted-foreground">
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeVariant[member.role]}>
                      {TEAM_ROLE_LABELS[member.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant[member.status]}>
                      {TEAM_STATUS_LABELS[member.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {member.joinedAt || (
                      <span className="text-muted-foreground">
                        초대됨: {member.invitedAt}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {member.status === 'active' ? (
                      <div className="space-y-1">
                        <div className="text-sm">고객: {member.clients}명</div>
                        <div className="text-sm text-muted-foreground">
                          전환: {member.conversions}건
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">메뉴 열기</span>
                          <DotsHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>작업</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onViewMember(member)}>
                          <PersonIcon className="mr-2 h-4 w-4" />
                          정보 보기
                        </DropdownMenuItem>
                        {member.status === 'pending' && (
                          <DropdownMenuItem
                            onClick={() => onResendInvite(member.id)}
                          >
                            <Share1Icon className="mr-2 h-4 w-4" />
                            초대 재발송
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-600"
                        >
                          <TrashIcon className="mr-2 h-4 w-4" />
                          제거
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <PersonIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">아직 팀원이 없습니다</h3>
            <p className="text-muted-foreground mb-6">
              첫 번째 팀원을 초대해서 협업을 시작하세요
            </p>
            <Button
              onClick={() => {
                const inviteButton = document.querySelector(
                  '[data-testid="invite-trigger"]'
                ) as HTMLButtonElement;
                if (inviteButton) {
                  inviteButton.click();
                }
              }}
            >
              <PlusIcon className="mr-2 h-4 w-4" />첫 팀원 초대하기
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
