import { useLoaderData } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { db } from '~/lib/core/db.server';
import schema from '~/lib/schema/all';
import { desc, eq, ilike, or, count, asc } from 'drizzle-orm';
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
  HelpCircle,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ArrowUp,
  ArrowDown,
  Globe,
  BarChart3,
} from 'lucide-react';
import { useState } from 'react';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const search = url.searchParams.get('search') || '';
  const category = url.searchParams.get('category') || 'all';
  const language = url.searchParams.get('language') || 'all';
  const published = url.searchParams.get('published') || 'all';

  const offset = (page - 1) * limit;

  try {
    // 검색 조건 구성
    const searchConditions = search
      ? or(
          ilike(schema.faqs.question, `%${search}%`),
          ilike(schema.faqs.answer, `%${search}%`)
        )
      : undefined;

    const categoryCondition =
      category !== 'all' ? eq(schema.faqs.category, category) : undefined;

    const languageCondition =
      language !== 'all'
        ? eq(schema.faqs.language, language as any)
        : undefined;

    const publishedCondition =
      published !== 'all'
        ? eq(schema.faqs.isPublished, published === 'true')
        : undefined;

    const conditions = [
      searchConditions,
      categoryCondition,
      languageCondition,
      publishedCondition,
    ].filter(Boolean);

    // FAQ 목록 조회
    const faqsQuery = db
      .select({
        id: schema.faqs.id,
        question: schema.faqs.question,
        answer: schema.faqs.answer,
        category: schema.faqs.category,
        order: schema.faqs.order,
        isPublished: schema.faqs.isPublished,
        language: schema.faqs.language,
        viewCount: schema.faqs.viewCount,
        createdAt: schema.faqs.createdAt,
        updatedAt: schema.faqs.updatedAt,
        authorId: schema.faqs.authorId,
        authorName: schema.profiles.fullName,
      })
      .from(schema.faqs)
      .leftJoin(schema.profiles, eq(schema.faqs.authorId, schema.profiles.id))
      .orderBy(asc(schema.faqs.order), desc(schema.faqs.createdAt))
      .limit(limit)
      .offset(offset);

    // 전체 카운트 조회
    const totalCountQuery = db.select({ count: count() }).from(schema.faqs);

    if (conditions.length > 0) {
      // @ts-ignore
      faqsQuery.where(...conditions);
      // @ts-ignore
      totalCountQuery.where(...conditions);
    }

    const [faqs, totalCountResult] = await Promise.all([
      faqsQuery,
      totalCountQuery,
    ]);

    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // 카테고리 목록 조회
    const categoriesResult = await db
      .selectDistinct({ category: schema.faqs.category })
      .from(schema.faqs);

    const categories = categoriesResult.map(c => c.category);

    // 통계
    const statsResults = await Promise.all([
      db.select({ count: count() }).from(schema.faqs),
      db
        .select({ count: count() })
        .from(schema.faqs)
        .where(eq(schema.faqs.isPublished, true)),
      db
        .select({ count: count() })
        .from(schema.faqs)
        .where(eq(schema.faqs.isPublished, false)),
      db
        .select({ count: count() })
        .from(schema.faqs)
        .where(eq(schema.faqs.language, 'ko')),
    ]);

    const stats = {
      total: statsResults[0][0]?.count || 0,
      published: statsResults[1][0]?.count || 0,
      draft: statsResults[2][0]?.count || 0,
      korean: statsResults[3][0]?.count || 0,
    };

    const faqsWithISOStrings = faqs.map(faq => ({
      ...faq,
      createdAt: faq.createdAt ? new Date(faq.createdAt).toISOString() : null,
      updatedAt: faq.updatedAt ? new Date(faq.updatedAt).toISOString() : null,
    }));

    return {
      faqs: faqsWithISOStrings,
      totalCount,
      totalPages,
      currentPage: page,
      categories,
      stats,
      search,
      category,
      language,
      published,
    };
  } catch (error) {
    console.error('❌ FAQ 데이터 로딩 실패:', error);
    return {
      faqs: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      categories: [],
      stats: { total: 0, published: 0, draft: 0, korean: 0 },
      search: '',
      category: 'all',
      language: 'all',
      published: 'all',
      error: '데이터를 불러오지 못했습니다.',
    };
  }
}

export default function AdminFaqsPage() {
  const {
    faqs,
    totalCount,
    totalPages,
    currentPage,
    categories,
    stats,
    search,
    category,
    language,
    published,
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

  const getPublishedBadge = (isPublished: boolean) => {
    return isPublished ? (
      <Badge
        variant="default"
        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      >
        게시중
      </Badge>
    ) : (
      <Badge
        variant="secondary"
        className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
      >
        초안
      </Badge>
    );
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

  const getCategoryBadge = (category: string) => {
    const categoryColors: Record<string, string> = {
      general:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      account:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      billing:
        'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      technical:
        'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    };

    return (
      <Badge
        variant="secondary"
        className={categoryColors[category] || 'bg-gray-100 text-gray-800'}
      >
        {category}
      </Badge>
    );
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
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
            FAQ 관리
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            총 {totalCount}개의 FAQ 관리
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
                FAQ 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>새 FAQ 추가</DialogTitle>
                <DialogDescription>
                  자주 묻는 질문과 답변을 추가하세요.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">카테고리</Label>
                    <Select name="category" defaultValue="general">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">일반</SelectItem>
                        <SelectItem value="account">계정</SelectItem>
                        <SelectItem value="billing">결제</SelectItem>
                        <SelectItem value="technical">기술지원</SelectItem>
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
                  <Label htmlFor="question">질문</Label>
                  <Input
                    id="question"
                    name="question"
                    placeholder="자주 묻는 질문을 입력하세요"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="answer">답변</Label>
                  <Textarea
                    id="answer"
                    name="answer"
                    placeholder="질문에 대한 답변을 입력하세요..."
                    rows={6}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="order">정렬 순서</Label>
                    <Input
                      id="order"
                      name="order"
                      type="number"
                      placeholder="0"
                      defaultValue="0"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Switch id="isPublished" name="isPublished" />
                    <Label htmlFor="isPublished">즉시 게시</Label>
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
              전체 FAQ
            </CardTitle>
            <HelpCircle className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
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
            <Eye className="h-4 w-4 text-green-500" />
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
              한국어 FAQ
            </CardTitle>
            <Globe className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.korean}
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
                  placeholder="질문이나 답변으로 검색..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <form method="GET" className="flex space-x-2">
                <input type="hidden" name="search" value={searchTerm} />
                <Select name="category" defaultValue={category}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="카테고리" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 카테고리</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
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
                <Select name="published" defaultValue={published}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="게시 상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 상태</SelectItem>
                    <SelectItem value="true">게시중</SelectItem>
                    <SelectItem value="false">초안</SelectItem>
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
                  <TableHead className="w-12">순서</TableHead>
                  <TableHead>질문</TableHead>
                  <TableHead>답변</TableHead>
                  <TableHead>카테고리</TableHead>
                  <TableHead>언어</TableHead>
                  <TableHead>조회수</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>작성자</TableHead>
                  <TableHead>작성일</TableHead>
                  <TableHead className="w-12">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faqs.map(faq => (
                  <TableRow
                    key={faq.id}
                    className="hover:bg-gray-50 dark:hover:bg-zinc-800/30"
                  >
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-mono text-gray-500">
                          {faq.order}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900 dark:text-white max-w-xs">
                        {truncateText(faq.question, 80)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-sm">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {truncateText(faq.answer, 100)}
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryBadge(faq.category)}</TableCell>
                    <TableCell>{getLanguageBadge(faq.language)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <BarChart3 className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {faq.viewCount}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getPublishedBadge(faq.isPublished)}</TableCell>
                    <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                      {faq.authorName || '시스템'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(faq.createdAt)}
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
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <ArrowUp className="h-4 w-4 mr-2" />
                            순서 올리기
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ArrowDown className="h-4 w-4 mr-2" />
                            순서 내리기
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
                {faqs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <HelpCircle className="h-12 w-12 text-gray-400" />
                        <p className="text-gray-500 dark:text-gray-400">
                          검색 조건에 맞는 FAQ가 없습니다.
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
                  href={`?page=${currentPage - 1}&search=${search}&category=${category}&language=${language}&published=${published}`}
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
                    href={`?page=${pageNum}&search=${search}&category=${category}&language=${language}&published=${published}`}
                  >
                    {pageNum}
                  </a>
                </Button>
              );
            })}
            {currentPage < totalPages && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`?page=${currentPage + 1}&search=${search}&category=${category}&language=${language}&published=${published}`}
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
