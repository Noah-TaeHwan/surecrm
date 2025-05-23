import type { Route } from '.react-router/types/app/features/invitations/pages/+types/invitations-page';
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
import { Input } from '~/common/components/ui/input';
import { Textarea } from '~/common/components/ui/textarea';
import { Badge } from '~/common/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/common/components/ui/tabs';
import { Label } from '~/common/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/common/components/ui/table';
import { Progress } from '~/common/components/ui/progress';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import {
  PersonIcon,
  PlusIcon,
  Link2Icon,
  EnvelopeClosedIcon,
  CopyIcon,
  ClockIcon,
  ReloadIcon,
  Cross2Icon,
  Share1Icon,
  CheckCircledIcon,
  CrossCircledIcon,
  TimerIcon,
} from '@radix-ui/react-icons';
import { Link } from 'react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MainLayout } from '~/common/layouts/main-layout';
import { cn } from '~/lib/utils';

// 초대장 폼 스키마
const invitationSchema = z.object({
  email: z
    .string()
    .email('올바른 이메일 형식이 아닙니다')
    .optional()
    .or(z.literal('')),
  message: z.string().optional(),
});

type InvitationFormData = z.infer<typeof invitationSchema>;

export function loader({ request }: Route.LoaderArgs) {
  // TODO: 실제 API에서 데이터 가져오기

  const invitations = [
    {
      id: '1',
      code: 'INV-2024-001',
      email: 'kim@example.com',
      status: 'completed' as const,
      createdAt: '2024-01-10',
      usedAt: '2024-01-12',
      invitee: { id: '1', name: '김영희', email: 'kim@example.com' },
      message: '함께 성장하실 수 있는 좋은 분이라고 생각합니다.',
    },
    {
      id: '2',
      code: 'INV-2024-002',
      email: 'lee@example.com',
      status: 'pending' as const,
      createdAt: '2024-01-15',
      expiresAt: '2024-02-15',
      message: 'SureCRM을 함께 사용하면 좋을 것 같아 초대합니다.',
    },
    {
      id: '3',
      code: 'INV-2024-003',
      email: null,
      status: 'expired' as const,
      createdAt: '2023-12-01',
      expiresAt: '2024-01-01',
      message: null,
    },
    {
      id: '4',
      code: 'INV-2024-004',
      email: 'park@example.com',
      status: 'pending' as const,
      createdAt: '2024-01-20',
      expiresAt: '2024-02-20',
      message: '보험 영업에 관심있으신 분이라 초대드립니다.',
    },
  ];

  const invitationStats = {
    total: 10,
    used: 4,
    remaining: 6,
    pendingCount: 2,
    completedCount: 4,
    expiredCount: 1,
  };

  // 초대 체인 데이터 (클럽하우스 스타일)
  const invitationChain = {
    me: { id: 'me', name: '나', level: 0, children: [] },
    children: [
      {
        id: '1',
        name: '김영희',
        joinedAt: '2024-01-12',
        activityScore: 85,
        invitedCount: 2,
        level: 1,
        children: [
          {
            id: '10',
            name: '이민수',
            joinedAt: '2024-01-18',
            activityScore: 72,
            invitedCount: 1,
            level: 2,
          },
          {
            id: '11',
            name: '박지민',
            joinedAt: '2024-01-20',
            activityScore: 68,
            invitedCount: 0,
            level: 2,
          },
        ],
      },
      {
        id: '2',
        name: '최정훈',
        joinedAt: '2024-01-14',
        activityScore: 90,
        invitedCount: 3,
        level: 1,
        children: [
          {
            id: '20',
            name: '한성호',
            joinedAt: '2024-01-19',
            activityScore: 81,
            invitedCount: 2,
            level: 2,
          },
        ],
      },
    ],
  };

  return { invitations, invitationStats, invitationChain };
}

export function action({ request }: Route.ActionArgs) {
  // TODO: 실제 초대장 생성 로직
  return { success: true };
}

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '초대장 관리 - SureCRM' },
    { name: 'description', content: '초대장을 발급하고 관리합니다' },
  ];
}

export default function InvitationsPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { invitations, invitationStats, invitationChain } = loaderData;

  const [activeTab, setActiveTab] = useState('list');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // 초대장 생성 폼
  const form = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      email: '',
      message: '',
    },
  });

  // 초대장 생성 제출
  const onSubmit = (data: InvitationFormData) => {
    console.log('새 초대장:', data);
    setIsCreateOpen(false);
    form.reset();
  };

  // 초대 링크 복사
  const copyInviteLink = (code: string) => {
    const link = `https://surecrm.com/invite/${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // 초대장 재발송
  const resendInvitation = (id: string) => {
    console.log('재발송:', id);
  };

  // 초대장 취소
  const cancelInvitation = (id: string) => {
    console.log('취소:', id);
  };

  // 상태별 배지 스타일
  const statusBadgeVariant: Record<
    string,
    'default' | 'secondary' | 'outline' | 'destructive'
  > = {
    pending: 'outline',
    completed: 'default',
    expired: 'secondary',
  };

  const statusText: Record<string, string> = {
    pending: '대기 중',
    completed: '사용 완료',
    expired: '만료됨',
  };

  const statusIcon: Record<string, React.ReactNode> = {
    pending: <TimerIcon className="h-3 w-3" />,
    completed: <CheckCircledIcon className="h-3 w-3" />,
    expired: <CrossCircledIcon className="h-3 w-3" />,
  };

  // 초대 네트워크 노드 렌더링
  const renderInvitationNode = (node: any, level: number = 0) => {
    return (
      <div key={node.id} className="relative">
        <div
          className={cn(
            'flex items-center gap-4 p-4 border rounded-lg',
            level === 0 ? 'bg-primary/10 border-primary' : 'bg-background'
          )}
        >
          <Avatar>
            <AvatarFallback>{node.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-medium">{node.name}</div>
            {node.joinedAt && (
              <div className="text-sm text-muted-foreground">
                가입일: {node.joinedAt}
              </div>
            )}
          </div>
          {node.activityScore !== undefined && (
            <div className="text-right">
              <div className="text-sm font-medium">
                활성도: {node.activityScore}%
              </div>
              <div className="text-sm text-muted-foreground">
                초대: {node.invitedCount}명
              </div>
            </div>
          )}
        </div>
        {node.children && node.children.length > 0 && (
          <div className="ml-8 mt-2 space-y-2 border-l-2 border-gray-200 pl-4">
            {node.children.map((child: any) =>
              renderInvitationNode(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <MainLayout title="초대장 관리">
      <div className="container mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">초대장 관리</h1>
            <p className="text-muted-foreground">
              동료들을 SureCRM에 초대하고 함께 성장하세요
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                초대장 생성
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 초대장 생성</DialogTitle>
                <DialogDescription>
                  이메일로 초대하거나 공유 가능한 링크를 생성할 수 있습니다
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>이메일 (선택사항)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <EnvelopeClosedIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type="email"
                              className="pl-10"
                              placeholder="초대할 이메일 주소"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          비워두면 공유 가능한 링크가 생성됩니다
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>개인 메시지 (선택사항)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            placeholder="초대 메시지를 입력하세요..."
                          />
                        </FormControl>
                        <FormDescription>
                          초대받는 사람에게 전달될 메시지입니다
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateOpen(false)}
                    >
                      취소
                    </Button>
                    <Button type="submit">초대장 생성</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* 초대장 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>전체 초대장</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invitationStats.total}</div>
              <Progress
                value={(invitationStats.used / invitationStats.total) * 100}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {invitationStats.used} 사용 / {invitationStats.remaining} 남음
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>대기 중</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                {invitationStats.pendingCount}
                <TimerIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                응답 대기 중인 초대
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>사용 완료</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                {invitationStats.completedCount}
                <CheckCircledIcon className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                성공적으로 가입 완료
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>만료됨</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                {invitationStats.expiredCount}
                <CrossCircledIcon className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                기한이 지난 초대
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 탭 컨텐츠 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="list">초대장 목록</TabsTrigger>
            <TabsTrigger value="network">초대 네트워크</TabsTrigger>
          </TabsList>

          {/* 초대장 목록 탭 */}
          <TabsContent value="list" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>초대장 목록</CardTitle>
                <CardDescription>
                  발급한 모든 초대장의 상태를 확인할 수 있습니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>초대 코드</TableHead>
                      <TableHead>초대 대상</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>생성일</TableHead>
                      <TableHead>만료일/사용일</TableHead>
                      <TableHead>메시지</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell className="font-mono text-sm">
                          {invitation.code}
                        </TableCell>
                        <TableCell>
                          {invitation.status === 'completed' &&
                          invitation.invitee ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {invitation.invitee.name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {invitation.invitee.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {invitation.invitee.email}
                                </div>
                              </div>
                            </div>
                          ) : invitation.email ? (
                            <div className="flex items-center gap-2">
                              <EnvelopeClosedIcon className="h-4 w-4 text-muted-foreground" />
                              <span>{invitation.email}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              링크 공유
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={statusBadgeVariant[invitation.status]}
                            className="gap-1"
                          >
                            {statusIcon[invitation.status]}
                            {statusText[invitation.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>{invitation.createdAt}</TableCell>
                        <TableCell>
                          {invitation.status === 'completed'
                            ? invitation.usedAt
                            : invitation.expiresAt}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <span className="text-sm text-muted-foreground truncate">
                            {invitation.message || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {invitation.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    copyInviteLink(invitation.code)
                                  }
                                >
                                  {copiedCode === invitation.code ? (
                                    <CheckCircledIcon className="h-4 w-4" />
                                  ) : (
                                    <CopyIcon className="h-4 w-4" />
                                  )}
                                </Button>
                                {invitation.email && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      resendInvitation(invitation.id)
                                    }
                                  >
                                    <ReloadIcon className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    cancelInvitation(invitation.id)
                                  }
                                >
                                  <Cross2Icon className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedInvitation(invitation)}
                            >
                              <Share1Icon className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 초대 네트워크 탭 */}
          <TabsContent value="network" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>초대 네트워크</CardTitle>
                <CardDescription>
                  클럽하우스 스타일의 초대 체인을 시각화합니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 나 (루트 노드) */}
                  <div className="flex items-center gap-4 p-4 border-2 border-primary rounded-lg bg-primary/10">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>나</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-lg font-medium">나</div>
                      <div className="text-sm text-muted-foreground">
                        총 {invitationStats.used}명 초대
                      </div>
                    </div>
                  </div>

                  {/* 초대 트리 */}
                  <div className="ml-8 space-y-2 border-l-2 border-primary pl-4">
                    {invitationChain.children.map((child) =>
                      renderInvitationNode(child, 1)
                    )}
                  </div>
                </div>

                {/* 네트워크 통계 */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>1차 초대</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {invitationChain.children.length}명
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>2차 초대</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {invitationChain.children.reduce(
                          (sum, child) => sum + (child.children?.length || 0),
                          0
                        )}
                        명
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>평균 활성도</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">78%</div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 초대장 상세 모달 */}
        {selectedInvitation && (
          <Dialog
            open={!!selectedInvitation}
            onOpenChange={() => setSelectedInvitation(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>초대장 상세 정보</DialogTitle>
                <DialogDescription>
                  초대 코드: {selectedInvitation.code}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>초대 링크</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={`https://surecrm.com/invite/${selectedInvitation.code}`}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={() => copyInviteLink(selectedInvitation.code)}
                    >
                      {copiedCode === selectedInvitation.code ? (
                        <CheckCircledIcon className="h-4 w-4" />
                      ) : (
                        <CopyIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {selectedInvitation.email && (
                  <div>
                    <Label>초대 대상</Label>
                    <p className="mt-1">{selectedInvitation.email}</p>
                  </div>
                )}

                <div>
                  <Label>상태</Label>
                  <Badge
                    variant={statusBadgeVariant[selectedInvitation.status]}
                    className="gap-1 mt-1"
                  >
                    {statusIcon[selectedInvitation.status]}
                    {statusText[selectedInvitation.status]}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>생성일</Label>
                    <p className="mt-1 text-sm">
                      {selectedInvitation.createdAt}
                    </p>
                  </div>
                  <div>
                    <Label>
                      {selectedInvitation.status === 'completed'
                        ? '사용일'
                        : '만료일'}
                    </Label>
                    <p className="mt-1 text-sm">
                      {selectedInvitation.status === 'completed'
                        ? selectedInvitation.usedAt
                        : selectedInvitation.expiresAt}
                    </p>
                  </div>
                </div>

                {selectedInvitation.message && (
                  <div>
                    <Label>메시지</Label>
                    <p className="mt-1 text-sm">{selectedInvitation.message}</p>
                  </div>
                )}

                {selectedInvitation.status === 'completed' &&
                  selectedInvitation.invitee && (
                    <div>
                      <Label>가입 정보</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar>
                          <AvatarFallback>
                            {selectedInvitation.invitee.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {selectedInvitation.invitee.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {selectedInvitation.invitee.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                <div>
                  <Label>QR 코드</Label>
                  <div className="mt-2 p-4 border rounded-lg bg-white">
                    <div className="w-48 h-48 mx-auto bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-muted-foreground">
                        QR 코드 이미지
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
}
