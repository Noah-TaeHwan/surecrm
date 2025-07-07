import { useLoaderData } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { db } from '~/lib/core/db.server';
import schema from '~/lib/schema/all';
import { desc, eq, ilike, or, count } from 'drizzle-orm';
import {
  Card,
  CardContent,
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
import { Badge } from '~/common/components/ui/badge';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/common/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/common/components/ui/dialog';
import { Textarea } from '~/common/components/ui/textarea';
import { Label } from '~/common/components/ui/label';
import { Switch } from '~/common/components/ui/switch';
import {
  Megaphone,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Pin,
  Clock,
  CheckCircle,
  Globe,
} from 'lucide-react';
import { useState } from 'react';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const search = url.searchParams.get('search') || '';
  const status = url.searchParams.get('status') || 'all';
  const language = url.searchParams.get('language') || 'all';

  const offset = (page - 1) * limit;

  try {
    // 검색 조건 구성
    const searchConditions = search
      ? or(
          ilike(schema.announcements.title, `%${search}%`),
          ilike(schema.announcements.content, `%${search}%`)
        )
      : undefined;

    const statusCondition =
      status !== 'all'
        ? status === 'published'
          ? eq(schema.announcements.isPublished, true)
          : eq(schema.announcements.isPublished, false)
        : undefined;

    const languageCondition =
      language !== 'all'
        ? eq(schema.announcements.language, language as any)
        : undefined;

    const conditions = [
      searchConditions,
      statusCondition,
      languageCondition,
    ].filter(Boolean);

    // 공지사항 목록 조회
    const announcementsQuery = db
      .select({
        id: schema.announcements.id,
        title: schema.announcements.title,
        content: schema.announcements.content,
        type: schema.announcements.type,
        priority: schema.announcements.priority,
        isPublished: schema.announcements.isPublished,
        isPinned: schema.announcements.isPinned,
        language: schema.announcements.language,
        publishedAt: schema.announcements.publishedAt,
        expiresAt: schema.announcements.expiresAt,
        createdAt: schema.announcements.createdAt,
        updatedAt: schema.announcements.updatedAt,
        authorId: schema.announcements.authorId,
        authorName: schema.profiles.fullName,
      })
      .from(schema.announcements)
      .leftJoin(
        schema.profiles,
        eq(schema.announcements.authorId, schema.profiles.id)
      )
      .orderBy(
        desc(schema.announcements.isPinned),
        desc(schema.announcements.createdAt)
      )
      .limit(limit)
      .offset(offset);

    // 전체 카운트 조회
    const totalCountQuery = db
      .select({ count: count() })
      .from(schema.announcements);

    if (conditions.length > 0) {
      // @ts-ignore
      announcementsQuery.where(...conditions);
      // @ts-ignore
      totalCountQuery.where(...conditions);
    }

    const [announcements, totalCountResult] = await Promise.all([
      announcementsQuery,
      totalCountQuery,
    ]);

    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // 통계
    const statsResults = await Promise.all([
      db.select({ count: count() }).from(schema.announcements),
      db
        .select({ count: count() })
        .from(schema.announcements)
        .where(eq(schema.announcements.isPublished, true)),
      db
        .select({ count: count() })
        .from(schema.announcements)
        .where(eq(schema.announcements.isPublished, false)),
      db
        .select({ count: count() })
        .from(schema.announcements)
        .where(eq(schema.announcements.isPinned, true)),
    ]);

    const stats = {
      total: statsResults[0][0]?.count || 0,
      published: statsResults[1][0]?.count || 0,
      draft: statsResults[2][0]?.count || 0,
      pinned: statsResults[3][0]?.count || 0,
    };

    const announcementsWithISOStrings = announcements.map(announcement => ({
      ...announcement,
      publishedAt: announcement.publishedAt
        ? new Date(announcement.publishedAt).toISOString()
        : null,
      expiresAt: announcement.expiresAt
        ? new Date(announcement.expiresAt).toISOString()
        : null,
      createdAt: announcement.createdAt
        ? new Date(announcement.createdAt).toISOString()
        : null,
      updatedAt: announcement.updatedAt
        ? new Date(announcement.updatedAt).toISOString()
        : null,
    }));

    return {
      announcements: announcementsWithISOStrings,
      totalCount,
      totalPages,
      currentPage: page,
      stats,
      search,
      status,
      language,
    };
  } catch (error) {
    console.error('❌ 공지사항 데이터 로딩 실패:', error);
    return {
      announcements: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      stats: { total: 0, published: 0, draft: 0, pinned: 0 },
      search: '',
      status: 'all',
      language: 'all',
      error: '데이터를 불러오지 못했습니다.',
    };
  }
}

export default function AdminAnnouncementsPage() {
  const {
    announcements,
    totalCount,
    totalPages,
    currentPage,
    stats,
    search,
    status,
    language,
    error,
  } = useLoaderData<typeof loader>();
  const [searchTerm, setSearchTerm] = useState(search);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const formatDate = (date: string | Date | null) => {
    if (!date) return '-';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (
    isPublished: boolean,
    publishedAt?: string | Date | null,
    expiresAt?: string | Date | null
  ) => {
    const now = new Date();
    const expireDate = expiresAt ? new Date(expiresAt) : null;

    if (!isPublished) {
      return (
        <Badge
          variant="secondary"
          className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
        >
          <Edit className="h-3 w-3 mr-1" />
          초안
        </Badge>
      );
    }

    if (expireDate && expireDate < now) {
      return (
        <Badge
          variant="destructive"
          className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
        >
          <Clock className="h-3 w-3 mr-1" />
          만료됨
        </Badge>
      );
    }

    return (
      <Badge
        variant="default"
        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      >
        <CheckCircle className="h-3 w-3 mr-1" />
        게시중
      </Badge>
    );
  };

  const getPriorityBadge = (priority: number) => {
    if (priority >= 80) {
      return (
        <Badge
          variant="destructive"
          className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
        >
          긴급
        </Badge>
      );
    } else if (priority >= 50) {
      return (
        <Badge
          variant="default"
          className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
        >
          높음
        </Badge>
      );
    } else if (priority >= 20) {
      return (
        <Badge
          variant="secondary"
          className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
        >
          보통
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-gray-600 dark:text-gray-400">
          낮음
        </Badge>
      );
    }
  };

  const getLanguageBadge = (language: string) => {
    const languages: Record<string, string> = {
      ko: '한국어',
      en: 'English',
      ja: '日本語',
      zh: '中文',
    };

    return (
      <Badge variant="outline" className="text-xs">
        <Globe className="h-3 w-3 mr-1" />
        {languages[language] || language}
      </Badge>
    );
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    return content.length > maxLength
      ? content.substring(0, maxLength) + '...'
      : content;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            공지사항 관리
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            총 {totalCount}개의 공지사항 관리
          </p>
        </div>
        <div className="flex space-x-3">
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                공지사항 작성
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>새 공지사항 작성</DialogTitle>
                <DialogDescription>
                  새로운 공지사항을 작성하여 사용자들에게 전달하세요.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">제목</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="공지사항 제목"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">유형</Label>
                    <Select name="type" defaultValue="general">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">일반</SelectItem>
                        <SelectItem value="maintenance">점검</SelectItem>
                        <SelectItem value="update">업데이트</SelectItem>
                        <SelectItem value="urgent">긴급</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">우선순위</Label>
                    <Select name="priority" defaultValue="50">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">낮음</SelectItem>
                        <SelectItem value="50">보통</SelectItem>
                        <SelectItem value="80">높음</SelectItem>
                        <SelectItem value="100">긴급</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">언어</Label>
                    <Select name="language" defaultValue="ko">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ko">한국어</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                        <SelectItem value="zh">中文</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">내용</Label>
                  <Textarea
                    id="content"
                    name="content"
                    placeholder="공지사항 내용을 입력하세요..."
                    rows={6}
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="isPublished" name="isPublished" />
                    <Label htmlFor="isPublished">즉시 게시</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="isPinned" name="isPinned" />
                    <Label htmlFor="isPinned">상단 고정</Label>
                  </div>
                </div>
              </form>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  취소
                </Button>
                <Button type="submit">저장</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              전체 공지사항
            </CardTitle>
            <Megaphone className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">
              {stats.total}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              게시중
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.published}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              초안
            </CardTitle>
            <Edit className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {stats.draft}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              고정된 공지
            </CardTitle>
            <Pin className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.pinned}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 검색 */}
      <Card className="bg-white dark:bg-zinc-900">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-1 items-center space-x-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="제목이나 내용으로 검색..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <form method="GET" className="flex space-x-2">
                <input type="hidden" name="search" value={searchTerm} />
                <Select name="status" defaultValue={status}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 상태</SelectItem>
                    <SelectItem value="published">게시중</SelectItem>
                    <SelectItem value="draft">초안</SelectItem>
                  </SelectContent>
                </Select>
                <Select name="language" defaultValue={language}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="언어" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 언어</SelectItem>
                    <SelectItem value="ko">한국어</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  필터 적용
                </Button>
              </form>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border border-gray-200 dark:border-zinc-700">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-zinc-800/50">
                  <TableHead className="w-12">고정</TableHead>
                  <TableHead>제목</TableHead>
                  <TableHead>내용</TableHead>
                  <TableHead>유형</TableHead>
                  <TableHead>우선순위</TableHead>
                  <TableHead>언어</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>작성자</TableHead>
                  <TableHead>작성일</TableHead>
                  <TableHead className="w-12">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.map(announcement => (
                  <TableRow
                    key={announcement.id}
                    className="hover:bg-gray-50 dark:hover:bg-zinc-800/30"
                  >
                    <TableCell>
                      {announcement.isPinned && (
                        <Pin className="h-4 w-4 text-blue-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {announcement.title}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {truncateContent(announcement.content)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {announcement.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getPriorityBadge(announcement.priority)}
                    </TableCell>
                    <TableCell>
                      {getLanguageBadge(announcement.language)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(
                        announcement.isPublished,
                        announcement.publishedAt,
                        announcement.expiresAt
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                      {announcement.authorName || '시스템'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(announcement.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>작업</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            미리보기
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pin className="h-4 w-4 mr-2" />
                            {announcement.isPinned ? '고정 해제' : '상단 고정'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {announcements.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <Megaphone className="h-12 w-12 text-gray-400" />
                        <p className="text-gray-500 dark:text-gray-400">
                          검색 조건에 맞는 공지사항이 없습니다.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {totalCount}개 중 {(currentPage - 1) * 20 + 1}-
            {Math.min(currentPage * 20, totalCount)}개 표시
          </p>
          <div className="flex space-x-2">
            {currentPage > 1 && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`?page=${currentPage - 1}&search=${search}&status=${status}&language=${language}`}
                >
                  이전
                </a>
              </Button>
            )}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, currentPage - 2) + i;
              if (pageNum > totalPages) return null;
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? 'default' : 'outline'}
                  size="sm"
                  asChild
                >
                  <a
                    href={`?page=${pageNum}&search=${search}&status=${status}&language=${language}`}
                  >
                    {pageNum}
                  </a>
                </Button>
              );
            })}
            {currentPage < totalPages && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`?page=${currentPage + 1}&search=${search}&status=${status}&language=${language}`}
                >
                  다음
                </a>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
