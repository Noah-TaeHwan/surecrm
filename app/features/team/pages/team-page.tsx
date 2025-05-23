import type { Route } from '.react-router/types/app/features/team/pages/+types/team-page';
import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/common/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/common/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Input } from '~/common/components/ui/input';
import { Badge } from '~/common/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/common/components/ui/tabs';
import { Switch } from '~/common/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/common/components/ui/table';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import { Progress } from '~/common/components/ui/progress';
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/common/components/ui/dropdown-menu';
import {
  PersonIcon,
  PlusIcon,
  DotsHorizontalIcon,
  Pencil1Icon,
  TrashIcon,
  EnvelopeClosedIcon,
  LockClosedIcon,
  CheckIcon,
  CrossCircledIcon,
  InfoCircledIcon,
  Share1Icon,
  BarChartIcon,
} from '@radix-ui/react-icons';
import { Link } from 'react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MainLayout } from '~/common/layouts/main-layout';
import { cn } from '~/lib/utils';

// 팀원 초대 폼 스키마
const inviteSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  role: z.string(),
  message: z.string().optional(),
});

type InviteFormData = z.infer<typeof inviteSchema>;

export function loader({ request }: Route.LoaderArgs) {
  // TODO: 실제 API에서 데이터 가져오기

  const teamMembers = [
    {
      id: '1',
      name: '김영희',
      email: 'kim@surecrm.com',
      role: 'admin',
      status: 'active',
      joinedAt: '2023-01-15',
      lastSeen: '2024-01-20 14:30',
      clients: 45,
      conversions: 32,
      revenue: 180000000,
      permissions: {
        clients: { read: true, write: true, delete: true },
        reports: { read: true, write: true, delete: false },
        team: { read: true, write: true, delete: true },
        settings: { read: true, write: true, delete: false },
      },
    },
    {
      id: '2',
      name: '박철수',
      email: 'park@surecrm.com',
      role: 'manager',
      status: 'active',
      joinedAt: '2023-03-20',
      lastSeen: '2024-01-20 16:45',
      clients: 38,
      conversions: 28,
      revenue: 150000000,
      permissions: {
        clients: { read: true, write: true, delete: false },
        reports: { read: true, write: true, delete: false },
        team: { read: true, write: false, delete: false },
        settings: { read: true, write: false, delete: false },
      },
    },
    {
      id: '3',
      name: '이민수',
      email: 'lee@surecrm.com',
      role: 'member',
      status: 'active',
      joinedAt: '2023-06-10',
      lastSeen: '2024-01-19 18:20',
      clients: 25,
      conversions: 18,
      revenue: 95000000,
      permissions: {
        clients: { read: true, write: true, delete: false },
        reports: { read: true, write: false, delete: false },
        team: { read: true, write: false, delete: false },
        settings: { read: false, write: false, delete: false },
      },
    },
    {
      id: '4',
      name: '정수연',
      email: 'jung@example.com',
      role: 'member',
      status: 'pending',
      joinedAt: null,
      invitedAt: '2024-01-18',
      lastSeen: null,
      clients: 0,
      conversions: 0,
      revenue: 0,
    },
  ];

  const teamStats = {
    totalMembers: 4,
    activeMembers: 3,
    pendingInvites: 1,
    totalClients: 108,
    totalRevenue: 425000000,
    avgConversionRate: 74.3,
  };

  const roles = [
    {
      id: 'admin',
      name: '관리자',
      description: '모든 기능에 대한 완전한 접근 권한',
      permissions: ['clients', 'reports', 'team', 'settings', 'billing'],
    },
    {
      id: 'manager',
      name: '매니저',
      description: '팀 관리를 제외한 대부분 기능 접근 가능',
      permissions: ['clients', 'reports', 'settings:read'],
    },
    {
      id: 'member',
      name: '멤버',
      description: '기본적인 고객 관리 및 보고서 조회',
      permissions: ['clients', 'reports:read'],
    },
  ];

  return { teamMembers, teamStats, roles };
}

export function action({ request }: Route.ActionArgs) {
  // TODO: 실제 팀원 초대/관리 로직
  return { success: true };
}

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '팀 관리 - SureCRM' },
    { name: 'description', content: '팀원을 관리하고 팀 설정을 변경합니다' },
  ];
}

export default function TeamPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { teamMembers, teamStats, roles } = loaderData;

  const [activeTab, setActiveTab] = useState('members');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  // 팀원 초대 폼
  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      role: 'member',
      message: '',
    },
  });

  // 팀원 초대 제출
  const onInvite = (data: InviteFormData) => {
    console.log('팀원 초대:', data);
    setIsInviteOpen(false);
    form.reset();
  };

  // 팀원 제거
  const handleRemoveMember = (memberId: string) => {
    if (confirm('정말로 이 팀원을 제거하시겠습니까?')) {
      console.log('팀원 제거:', memberId);
    }
  };

  // 역할 변경
  const handleChangeRole = (memberId: string, newRole: string) => {
    console.log('역할 변경:', memberId, newRole);
  };

  // 상태별 배지 색상
  const statusBadgeVariant: Record<
    string,
    'default' | 'secondary' | 'outline' | 'destructive'
  > = {
    active: 'default',
    pending: 'outline',
    inactive: 'secondary',
  };

  const statusText: Record<string, string> = {
    active: '활성',
    pending: '대기 중',
    inactive: '비활성',
  };

  // 역할별 배지 색상
  const roleBadgeVariant: Record<
    string,
    'default' | 'secondary' | 'outline' | 'destructive'
  > = {
    admin: 'destructive',
    manager: 'default',
    member: 'secondary',
  };

  const roleText: Record<string, string> = {
    admin: '관리자',
    manager: '매니저',
    member: '멤버',
  };

  return (
    <MainLayout title="팀 관리">
      <div className="container mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">팀 관리</h1>
            <p className="text-muted-foreground">
              팀원을 초대하고 권한을 관리하세요
            </p>
          </div>
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                팀원 초대
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 팀원 초대</DialogTitle>
                <DialogDescription>
                  이메일로 새로운 팀원을 초대하세요
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onInvite)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>이메일 주소</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="example@company.com"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>역할</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="역할 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                <div>
                                  <div className="font-medium">{role.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {role.description}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>초대 메시지 (선택사항)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="팀에 합류하세요!" />
                        </FormControl>
                        <FormDescription>
                          초대받는 사람에게 전달될 개인 메시지
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsInviteOpen(false)}
                    >
                      취소
                    </Button>
                    <Button type="submit">
                      <EnvelopeClosedIcon className="mr-2 h-4 w-4" />
                      초대 보내기
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* 팀 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>총 팀원</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teamStats.totalMembers}명
              </div>
              <p className="text-sm text-muted-foreground">
                활성: {teamStats.activeMembers}명
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>대기 중 초대</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teamStats.pendingInvites}명
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>팀 고객 수</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teamStats.totalClients}명
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>팀 총 매출</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(teamStats.totalRevenue / 100000000).toFixed(1)}억원
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 탭 컨텐츠 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="members">팀원 목록</TabsTrigger>
            <TabsTrigger value="roles">역할 및 권한</TabsTrigger>
            <TabsTrigger value="stats">팀 통계</TabsTrigger>
          </TabsList>

          {/* 팀원 목록 탭 */}
          <TabsContent value="members" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>팀원 목록</CardTitle>
                <CardDescription>
                  현재 팀원들과 초대 상태를 관리하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>팀원</TableHead>
                      <TableHead>역할</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>가입일</TableHead>
                      <TableHead>최근 접속</TableHead>
                      <TableHead>성과</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{member.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {member.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={roleBadgeVariant[member.role]}>
                            {roleText[member.role]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusBadgeVariant[member.status]}>
                            {statusText[member.status]}
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
                          {member.lastSeen || (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {member.status === 'active' ? (
                            <div className="space-y-1">
                              <div className="text-sm">
                                고객: {member.clients}명
                              </div>
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
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setSelectedMember(member)}
                              >
                                <Pencil1Icon className="mr-2 h-4 w-4" />
                                권한 편집
                              </DropdownMenuItem>
                              {member.status === 'pending' && (
                                <DropdownMenuItem>
                                  <Share1Icon className="mr-2 h-4 w-4" />
                                  초대 재발송
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleRemoveMember(member.id)}
                              >
                                <TrashIcon className="mr-2 h-4 w-4" />
                                팀에서 제거
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 역할 및 권한 탭 */}
          <TabsContent value="roles" className="mt-6">
            <div className="space-y-6">
              {roles.map((role) => (
                <Card key={role.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Badge variant={roleBadgeVariant[role.id]}>
                            {role.name}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {role.description}
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm">
                        편집
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-3">권한</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span>고객 관리</span>
                              <div className="flex gap-2">
                                <Badge variant="outline" className="text-xs">
                                  읽기
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  쓰기
                                </Badge>
                                {role.id === 'admin' && (
                                  <Badge variant="outline" className="text-xs">
                                    삭제
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>보고서</span>
                              <div className="flex gap-2">
                                <Badge variant="outline" className="text-xs">
                                  읽기
                                </Badge>
                                {role.id !== 'member' && (
                                  <Badge variant="outline" className="text-xs">
                                    쓰기
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span>팀 관리</span>
                              <div className="flex gap-2">
                                {role.id !== 'member' && (
                                  <Badge variant="outline" className="text-xs">
                                    읽기
                                  </Badge>
                                )}
                                {role.id === 'admin' && (
                                  <>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      쓰기
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      삭제
                                    </Badge>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>시스템 설정</span>
                              <div className="flex gap-2">
                                {role.id === 'admin' && (
                                  <>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      읽기
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      쓰기
                                    </Badge>
                                  </>
                                )}
                                {role.id === 'manager' && (
                                  <Badge variant="outline" className="text-xs">
                                    읽기
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 팀 통계 탭 */}
          <TabsContent value="stats" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>팀원별 성과</CardTitle>
                  <CardDescription>
                    각 팀원의 고객 관리 및 영업 성과
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {teamMembers
                      .filter((member) => member.status === 'active')
                      .map((member) => (
                        <div key={member.id} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>
                                  {member.name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{member.name}</div>
                                <Badge
                                  variant={roleBadgeVariant[member.role]}
                                  className="text-xs"
                                >
                                  {roleText[member.role]}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                {(member.revenue / 100000000).toFixed(1)}억원
                              </div>
                              <div className="text-sm text-muted-foreground">
                                전환율:{' '}
                                {Math.round(
                                  (member.conversions / member.clients) * 100
                                )}
                                %
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">
                                고객 수
                              </div>
                              <div className="font-medium">
                                {member.clients}명
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">
                                계약 건수
                              </div>
                              <div className="font-medium">
                                {member.conversions}건
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">
                                수익 기여도
                              </div>
                              <div className="font-medium">
                                {Math.round(
                                  (member.revenue / teamStats.totalRevenue) *
                                    100
                                )}
                                %
                              </div>
                            </div>
                          </div>
                          <Progress
                            value={
                              (member.revenue / teamStats.totalRevenue) * 100
                            }
                            className="h-2"
                          />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>팀 성과 요약</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {teamStats.avgConversionRate}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        평균 전환율
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {Math.round(
                          teamStats.totalClients / teamStats.activeMembers
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        팀원당 평균 고객 수
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {(
                          teamStats.totalRevenue /
                          teamStats.activeMembers /
                          100000000
                        ).toFixed(1)}
                        억
                      </div>
                      <div className="text-sm text-muted-foreground">
                        팀원당 평균 수익
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* 팀원 권한 편집 모달 */}
        {selectedMember && (
          <Dialog
            open={!!selectedMember}
            onOpenChange={() => setSelectedMember(null)}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedMember.name} 권한 설정</DialogTitle>
                <DialogDescription>
                  팀원의 역할과 세부 권한을 관리하세요
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium">역할</label>
                  <Select
                    defaultValue={selectedMember.role}
                    onValueChange={(value) =>
                      handleChangeRole(selectedMember.id, value)
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">세부 권한</label>
                  <div className="mt-3 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">고객 정보 삭제</div>
                        <div className="text-sm text-muted-foreground">
                          고객 데이터를 영구 삭제할 수 있습니다
                        </div>
                      </div>
                      <Switch
                        defaultChecked={
                          selectedMember.permissions?.clients?.delete
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">보고서 편집</div>
                        <div className="text-sm text-muted-foreground">
                          보고서를 생성하고 편집할 수 있습니다
                        </div>
                      </div>
                      <Switch
                        defaultChecked={
                          selectedMember.permissions?.reports?.write
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">팀원 초대</div>
                        <div className="text-sm text-muted-foreground">
                          새로운 팀원을 초대할 수 있습니다
                        </div>
                      </div>
                      <Switch
                        defaultChecked={selectedMember.permissions?.team?.write}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSelectedMember(null)}
                >
                  취소
                </Button>
                <Button>
                  <CheckIcon className="mr-2 h-4 w-4" />
                  권한 저장
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
}
