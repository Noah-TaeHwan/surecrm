import { useState } from 'react';
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';
import { useLoaderData, Form } from 'react-router';
import {
  Search,
  Mail,
  Check,
  Clock,
  AlertCircle,
  MessageSquare,
  Send,
  Eye,
  Edit,
  Archive,
  Trash2,
  Phone,
  Reply,
  Calendar,
  User,
  Plus,
  Filter,
  MoreHorizontal,
  MessageCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/common/components/ui/dropdown-menu';
import type { Route } from './+types/contacts';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/common/components/ui/dialog';
import { Textarea } from '~/common/components/ui/textarea';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { Input } from '~/common/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { ColumnDef } from '@tanstack/react-table';
import { count } from 'drizzle-orm';
import { DataTable } from '~/common/components/ui/data-table';
import { desc, eq, like, or, and } from 'drizzle-orm';
import { requireAdmin } from '~/lib/auth/guards.server';
import schema from '~/lib/schema/all';

export async function loader({ request }: Route.LoaderArgs) {
  console.log('🚀 [Vercel Log] /admin/contacts loader: 함수 실행 시작');
  const { db } = await import('~/lib/core/db.server');
  const { contacts } = await import('~/lib/schema/public');
  const { requireAdmin } = await import('~/lib/auth/guards.server');
  const { eq, desc, and, or, like, count } = await import('drizzle-orm');
  console.log('✅ [Vercel Log] /admin/contacts loader: 서버 모듈 import 완료');

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
        like(contacts.name, `%${searchQuery}%`),
        like(contacts.email, `%${searchQuery}%`),
        like(contacts.subject, `%${searchQuery}%`)
      )
    );
  }
  if (statusFilter !== 'all') {
    filters.push(eq(contacts.status, statusFilter));
  }

  // 문의사항 목록 조회
  const contactsQuery = db
    .select()
    .from(contacts)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(desc(contacts.createdAt))
    .limit(limit)
    .offset(offset);

  const contactsList = await contactsQuery;

  // 총 개수 조회
  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(contacts)
    .where(filters.length > 0 ? and(...filters) : undefined);

  // 통계 데이터 조회
  const [totalStats] = await db.select({ count: count() }).from(contacts);

  const [pendingStats] = await db
    .select({ count: count() })
    .from(contacts)
    .where(eq(contacts.status, 'pending'));

  const [inProgressStats] = await db
    .select({ count: count() })
    .from(contacts)
    .where(eq(contacts.status, 'in-progress'));

  const [resolvedStats] = await db
    .select({ count: count() })
    .from(contacts)
    .where(eq(contacts.status, 'resolved'));

  const contactsWithISOStrings = contactsList.map(contact => ({
    ...contact,
    createdAt: new Date(contact.createdAt).toISOString(),
    updatedAt: new Date(contact.updatedAt).toISOString(),
    respondedAt: contact.respondedAt
      ? new Date(contact.respondedAt).toISOString()
      : null,
  }));

  return {
    contacts: contactsWithISOStrings,
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
    searchQuery,
    statusFilter,
    stats: {
      total: totalStats.count,
      pending: pendingStats.count,
      inProgress: inProgressStats.count,
      resolved: resolvedStats.count,
    },
  };
}

export async function action({ request }: Route.ActionArgs) {
  console.log('🚀 [Vercel Log] /admin/contacts action: 함수 실행 시작');
  const { db } = await import('~/lib/core/db.server');
  const { contacts } = await import('~/lib/schema/public');
  const { requireAdmin } = await import('~/lib/auth/guards.server');
  const { eq } = await import('drizzle-orm');
  console.log('✅ [Vercel Log] /admin/contacts action: 서버 모듈 import 완료');

  await requireAdmin(request);

  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const contactId = formData.get('contactId') as string;

  if (intent === 'updateStatus') {
    const status = formData.get('status') as string;
    await db
      .update(contacts)
      .set({
        status,
        updatedAt: new Date(),
        ...(status === 'resolved' && { respondedAt: new Date() }),
      })
      .where(eq(contacts.id, contactId));
  }

  if (intent === 'respond') {
    const responseMessage = formData.get('responseMessage') as string;
    await db
      .update(contacts)
      .set({
        status: 'resolved',
        responseMessage,
        respondedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(contacts.id, contactId));
  }

  return null;
}

export default function AdminContacts({ loaderData }: Route.ComponentProps) {
  const {
    contacts: contactsList,
    totalCount,
    currentPage,
    totalPages,
    searchQuery,
    statusFilter,
    stats,
  } = loaderData;
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [responseMessage, setResponseMessage] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
          >
            <Clock className="h-3 w-3 mr-1" />
            대기 중
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            처리 중
          </Badge>
        );
      case 'resolved':
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
          >
            <Check className="h-3 w-3 mr-1" />
            해결됨
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Seoul',
    }).format(dateObj);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">문의사항 관리</h1>
          <p className="text-muted-foreground mt-1">
            고객 문의사항을 관리하고 응답하세요
          </p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 문의</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">총 문의사항</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">대기 중</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">답변 대기</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">처리 중</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">처리 진행</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">해결됨</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
            <p className="text-xs text-muted-foreground">완료된 문의</p>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">문의사항 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="이름, 이메일, 제목으로 검색..."
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
                <SelectItem value="pending">대기 중</SelectItem>
                <SelectItem value="in-progress">처리 중</SelectItem>
                <SelectItem value="resolved">해결됨</SelectItem>
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
                <TableHead>문의자</TableHead>
                <TableHead>제목</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>문의일시</TableHead>
                <TableHead>답변일시</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contactsList.map(contact => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {contact.email}
                      </div>
                      {contact.phone && (
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {contact.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate font-medium">
                      {contact.subject}
                    </div>
                    <div className="text-sm text-muted-foreground max-w-xs truncate">
                      {contact.message}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(contact.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(contact.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {contact.respondedAt
                        ? formatDate(contact.respondedAt)
                        : '-'}
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
                        <DropdownMenuItem
                          onClick={() => setSelectedContact(contact)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          상세 보기
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Reply className="h-4 w-4 mr-2" />
                          답변하기
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          상태 변경
                        </DropdownMenuItem>
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

      {/* 문의사항 상세 다이얼로그 */}
      <Dialog
        open={!!selectedContact}
        onOpenChange={() => setSelectedContact(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedContact && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>문의사항 상세</span>
                  {getStatusBadge(selectedContact.status)}
                </DialogTitle>
                <DialogDescription>
                  문의 ID: {selectedContact.id}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* 문의자 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">문의자 정보</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        <span className="font-medium">
                          {selectedContact.name}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>{selectedContact.email}</span>
                      </div>
                      {selectedContact.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          <span>{selectedContact.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">문의 정보</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          문의일시: {formatDate(selectedContact.createdAt)}
                        </span>
                      </div>
                      {selectedContact.respondedAt && (
                        <div className="flex items-center">
                          <Check className="h-4 w-4 mr-2" />
                          <span>
                            답변일시: {formatDate(selectedContact.respondedAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 문의 내용 */}
                <div>
                  <h3 className="font-semibold mb-2">문의 제목</h3>
                  <div className="bg-muted p-3 rounded-md">
                    {selectedContact.subject}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">문의 내용</h3>
                  <div className="bg-muted p-3 rounded-md whitespace-pre-wrap">
                    {selectedContact.message}
                  </div>
                </div>

                {/* 기존 답변 */}
                {selectedContact.responseMessage && (
                  <div>
                    <h3 className="font-semibold mb-2">답변 내용</h3>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-800">
                      <div className="whitespace-pre-wrap">
                        {selectedContact.responseMessage}
                      </div>
                    </div>
                  </div>
                )}

                {/* 답변 작성 */}
                <div>
                  <h3 className="font-semibold mb-2">답변 작성</h3>
                  <Textarea
                    placeholder="답변을 작성하세요..."
                    value={responseMessage}
                    onChange={e => setResponseMessage(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSelectedContact(null)}
                >
                  취소
                </Button>
                <Button
                  onClick={() => {
                    // 답변 전송 로직 구현
                    setSelectedContact(null);
                    setResponseMessage('');
                  }}
                  disabled={!responseMessage.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  답변 전송
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
