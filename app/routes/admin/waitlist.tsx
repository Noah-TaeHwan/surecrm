import { useState } from 'react';
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';
import { useLoaderData, Form } from 'react-router';
import { db } from '~/lib/core/db.server';
import schema from '~/lib/schema/all';
import { desc, eq, like, or, and } from 'drizzle-orm';
import { DataTable } from '~/common/components/ui/data-table';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import { Badge } from '~/common/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/common/components/ui/dialog';
import { Textarea } from '~/common/components/ui/textarea';
import {
  Search,
  Mail,
  Check,
  X,
  Download,
  Filter,
  UserCheck,
  Calendar,
  Users,
  Phone,
  Building,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Eye,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { ColumnDef } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/common/components/ui/dropdown-menu';
import { requireAdmin } from '~/lib/auth/guards.server';
import { waitlist } from '~/lib/schema/public';
import { count } from 'drizzle-orm';
import type { Route } from './+types/waitlist';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/common/components/ui/table';

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);

  const url = new URL(request.url);
  const searchQuery = url.searchParams.get('search') || '';
  const statusFilter = url.searchParams.get('status') || 'all';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  // 필터 조건 설정
  const filters = [];
  if (searchQuery) {
    filters.push(
      or(
        like(waitlist.name, `%${searchQuery}%`),
        like(waitlist.email, `%${searchQuery}%`),
        like(waitlist.company, `%${searchQuery}%`)
      )
    );
  }
  if (statusFilter === 'contacted') {
    filters.push(eq(waitlist.isContacted, true));
  } else if (statusFilter === 'not-contacted') {
    filters.push(eq(waitlist.isContacted, false));
  }

  // 대기자 목록 조회
  const waitlistQuery = db
    .select()
    .from(waitlist)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(desc(waitlist.createdAt))
    .limit(limit)
    .offset(offset);

  const waitlistData = await waitlistQuery;

  // 총 개수 조회
  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(waitlist)
    .where(filters.length > 0 ? and(...filters) : undefined);

  // 통계 데이터 조회
  const [totalStats] = await db.select({ count: count() }).from(waitlist);

  const [contactedStats] = await db
    .select({ count: count() })
    .from(waitlist)
    .where(eq(waitlist.isContacted, true));

  const [notContactedStats] = await db
    .select({ count: count() })
    .from(waitlist)
    .where(eq(waitlist.isContacted, false));

  return {
    waitlist: waitlistData,
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
    searchQuery,
    statusFilter,
    stats: {
      total: totalStats.count,
      contacted: contactedStats.count,
      notContacted: notContactedStats.count,
    },
  };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);

  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const waitlistId = formData.get('waitlistId') as string;

  if (intent === 'markContacted') {
    await db
      .update(waitlist)
      .set({
        isContacted: true,
        contactedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(waitlist.id, waitlistId));
  }

  if (intent === 'addNote') {
    const notes = formData.get('notes') as string;
    await db
      .update(waitlist)
      .set({
        notes,
        updatedAt: new Date(),
      })
      .where(eq(waitlist.id, waitlistId));
  }

  return null;
}

interface WaitlistItem {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  role: string | null;
  message: string | null;
  source: string | null;
  isContacted: boolean;
  contactedAt: Date | null;
  notes: string | null;
  createdAt: Date;
}

export default function AdminWaitlist({ loaderData }: Route.ComponentProps) {
  const {
    waitlist: waitlistData,
    totalCount,
    currentPage,
    totalPages,
    searchQuery,
    statusFilter,
    stats,
  } = loaderData;
  const [selectedItem, setSelectedItem] = useState<WaitlistItem | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  };

  const getStatusBadge = (isContacted: boolean) => {
    if (isContacted) {
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
        >
          <Check className="h-3 w-3 mr-1" />
          연락완료
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
      >
        <Clock className="h-3 w-3 mr-1" />
        대기중
      </Badge>
    );
  };

  const handleExportCSV = () => {
    const csvContent = [
      [
        '이름',
        '이메일',
        '회사',
        '역할',
        '메시지',
        '가입일',
        '연락여부',
        '연락일',
        '메모',
      ],
      ...waitlistData.map(item => [
        item.name || '',
        item.email,
        item.company || '',
        item.role || '',
        item.message || '',
        formatDate(item.createdAt),
        item.isContacted ? '완료' : '미완료',
        item.contactedAt ? formatDate(item.contactedAt) : '',
        item.notes || '',
      ]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `waitlist_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const columns: ColumnDef<WaitlistItem>[] = [
    {
      accessorKey: 'name',
      header: '이름',
      cell: ({ row }) => row.getValue('name') || '-',
    },
    {
      accessorKey: 'email',
      header: '이메일',
      cell: ({ row }) => (
        <a
          href={`mailto:${row.getValue('email')}`}
          className="text-blue-600 hover:underline"
        >
          {row.getValue('email')}
        </a>
      ),
    },
    {
      accessorKey: 'company',
      header: '회사',
      cell: ({ row }) => row.getValue('company') || '-',
    },
    {
      accessorKey: 'role',
      header: '역할',
      cell: ({ row }) => row.getValue('role') || '-',
    },
    {
      accessorKey: 'source',
      header: '유입경로',
      cell: ({ row }) => {
        const source = row.getValue('source') as string;
        const sourceMap: Record<string, string> = {
          landing: '랜딩페이지',
          direct: '직접가입',
          referral: '추천',
        };
        return sourceMap[source] || source || '-';
      },
    },
    {
      accessorKey: 'createdAt',
      header: '가입일',
      cell: ({ row }) => (
        <div>
          <div className="text-sm">{formatDate(row.getValue('createdAt'))}</div>
        </div>
      ),
    },
    {
      accessorKey: 'isContacted',
      header: '연락여부',
      cell: ({ row }) => {
        const isContacted = row.getValue('isContacted') as boolean;
        return (
          <Badge variant={isContacted ? 'default' : 'secondary'}>
            {isContacted ? (
              <>
                <Check className="w-3 h-3 mr-1" />
                완료
              </>
            ) : (
              <>
                <X className="w-3 h-3 mr-1" />
                미완료
              </>
            )}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">메뉴 열기</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedItem(item);
                  setContactDialogOpen(true);
                }}
                disabled={item.isContacted}
              >
                <UserCheck className="w-4 h-4 mr-2" />
                연락 완료 표시
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => window.open(`mailto:${item.email}`, '_blank')}
              >
                <Mail className="w-4 h-4 mr-2" />
                이메일 보내기
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">대기자 명단 관리</h1>
          <p className="text-muted-foreground mt-1">
            랜딩페이지 대기자 명단을 관리하고 연락하세요
          </p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 대기자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">총 대기자 수</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">연락 완료</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contacted}</div>
            <p className="text-xs text-muted-foreground">연락한 대기자</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">연락 대기</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.notContacted}</div>
            <p className="text-xs text-muted-foreground">연락 대기 중</p>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">대기자 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="이름, 이메일, 회사명으로 검색..."
                className="pl-10"
                defaultValue={searchQuery}
                name="search"
              />
            </div>
            <Select defaultValue={statusFilter} name="status">
              <SelectTrigger className="w-32">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="contacted">연락완료</SelectItem>
                <SelectItem value="not-contacted">연락대기</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              필터
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>대기자 정보</TableHead>
                <TableHead>회사/역할</TableHead>
                <TableHead>출처</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>등록일</TableHead>
                <TableHead>연락일</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {waitlistData.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {item.name || '이름 없음'}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {item.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {item.company && (
                        <div className="text-sm flex items-center">
                          <Building className="h-3 w-3 mr-1" />
                          {item.company}
                        </div>
                      )}
                      {item.role && (
                        <div className="text-sm text-muted-foreground">
                          {item.role}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {item.source || 'landing'}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(item.isContacted)}</TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDate(item.createdAt)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {item.contactedAt ? formatDate(item.contactedAt) : '-'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          상세 보기
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          메모 추가
                        </DropdownMenuItem>
                        {!item.isContacted && (
                          <DropdownMenuItem>
                            <UserCheck className="h-4 w-4 mr-2" />
                            연락완료 표시
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                전체 {totalCount}건 중 {(currentPage - 1) * 20 + 1}-
                {Math.min(currentPage * 20, totalCount)}건
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                >
                  이전
                </Button>
                <span className="text-sm">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                >
                  다음
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 연락 완료 다이얼로그 */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent>
          <Form method="post" onSubmit={() => setContactDialogOpen(false)}>
            <input type="hidden" name="_action" value="markContacted" />
            <input type="hidden" name="id" value={selectedItem?.id} />
            <DialogHeader>
              <DialogTitle>연락 완료 표시</DialogTitle>
              <DialogDescription>
                {selectedItem?.name || selectedItem?.email}님에게 연락을
                완료하셨나요?
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="notes" className="text-sm font-medium">
                  메모 (선택사항)
                </label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="연락 내용이나 특이사항을 입력하세요..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setContactDialogOpen(false)}
              >
                취소
              </Button>
              <Button type="submit">
                <Check className="h-4 w-4 mr-2" />
                완료 표시
              </Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
