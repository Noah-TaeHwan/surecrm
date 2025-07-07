import { useState } from 'react';
import { useLoaderData } from 'react-router';
import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Input } from '~/common/components/ui/input';
import { Badge } from '~/common/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Switch } from '~/common/components/ui/switch';
import { Label } from '~/common/components/ui/label';
import { Textarea } from '~/common/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '~/common/components/ui/dialog';
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
  DropdownMenuTrigger,
} from '~/common/components/ui/dropdown-menu';
import {
  Star,
  Check,
  X,
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  MessageSquare,
  ThumbsUp,
  Clock,
} from 'lucide-react';

// TODO: 서버 로직 구현
export async function loader() {
  const testimonials = [
    {
      id: '1',
      customerName: '김철수',
      company: '삼성생명',
      rating: 5,
      content: 'SureCRM 덕분에 고객 관리가 정말 편해졌어요. 최고의 툴입니다!',
      status: 'approved',
      isFeatured: true,
      createdAt: '2023-10-27T10:00:00Z',
    },
    {
      id: '2',
      customerName: '이영희',
      company: '한화생명',
      rating: 4,
      content: '자동화 기능이 특히 마음에 듭니다. 반복 업무가 줄었어요.',
      status: 'pending',
      isFeatured: false,
      createdAt: '2023-10-26T14:30:00Z',
    },
    {
      id: '3',
      customerName: '박지성',
      company: '교보생명',
      rating: 5,
      content: '고객 데이터를 한눈에 볼 수 있어서 상담의 질이 올라갔습니다.',
      status: 'approved',
      isFeatured: false,
      createdAt: '2023-10-25T09:00:00Z',
    },
  ];
  const stats = { total: 3, approved: 2, pending: 1, featured: 1 };
  return { testimonials, stats };
}

export default function AdminTestimonialsPage() {
  const { testimonials, stats } = useLoaderData<typeof loader>();

  const getStatusBadge = (status: string) => {
    if (status === 'approved')
      return (
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
          <Check className="h-3 w-3 mr-1" />
          승인
        </Badge>
      );
    if (status === 'pending')
      return (
        <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
          <Clock className="h-3 w-3 mr-1" />
          대기
        </Badge>
      );
    return (
      <Badge variant="destructive">
        <X className="h-3 w-3 mr-1" />
        숨김
      </Badge>
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">고객 후기 관리</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          후기 추가
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 후기 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">승인된 후기</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">승인 대기</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">추천 후기</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.featured}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>후기 목록</CardTitle>
            <div className="flex items-center gap-2">
              <Input placeholder="고객명, 내용 검색..." className="w-64" />
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 상태</SelectItem>
                  <SelectItem value="approved">승인</SelectItem>
                  <SelectItem value="pending">대기</SelectItem>
                  <SelectItem value="rejected">숨김</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                필터
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">추천</TableHead>
                <TableHead>고객 정보</TableHead>
                <TableHead>평점</TableHead>
                <TableHead>내용</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>작성일</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonials.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Switch checked={item.isFeatured} />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{item.customerName}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.company}
                    </div>
                  </TableCell>
                  <TableCell>{renderStars(item.rating)}</TableCell>
                  <TableCell className="max-w-sm truncate">
                    {item.content}
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>
                    {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>수정</DropdownMenuItem>
                        <DropdownMenuItem>상태 변경</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500">
                          삭제
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
    </div>
  );
}
