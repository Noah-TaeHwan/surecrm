import type { Route } from '.react-router/types/app/features/clients/pages/+types/clients-page';
import { Button } from '~/common/components/ui/button';
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
  TableCaption,
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
import { Badge } from '~/common/components/ui/badge';
import {
  DotsHorizontalIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from '@radix-ui/react-icons';
import { Input } from '~/common/components/ui/input';
import { Link } from 'react-router';

export function loader({ request }: Route.LoaderArgs) {
  // TODO: 실제 API에서 데이터 가져오기
  return {
    clients: [
      {
        id: '1',
        name: '김영희',
        email: 'kim@example.com',
        phone: '010-1234-5678',
        company: 'ABC 회사',
        status: 'active' as const,
        stage: '첫 상담',
        referredBy: '박철수',
        createdAt: '2023-03-15T09:30:00.000Z',
        updatedAt: '2023-04-02T14:15:00.000Z',
      },
      {
        id: '2',
        name: '이철수',
        email: 'lee@example.com',
        phone: '010-9876-5432',
        company: 'XYZ 기업',
        status: 'active' as const,
        stage: '니즈 분석',
        referredBy: '김영희',
        createdAt: '2023-02-22T13:45:00.000Z',
        updatedAt: '2023-04-05T10:20:00.000Z',
      },
      {
        id: '3',
        name: '박지민',
        email: 'park@example.com',
        phone: '010-2345-6789',
        company: '대한 기업',
        status: 'inactive' as const,
        stage: '계약 완료',
        createdAt: '2023-01-10T11:30:00.000Z',
        updatedAt: '2023-03-28T15:45:00.000Z',
      },
    ],
  };
}

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '고객 관리 - SureCRM' },
    { name: 'description', content: '고객 목록 관리 및 조회' },
  ];
}

export default function ClientsPage({ loaderData }: Route.ComponentProps) {
  const { clients = [] } = loaderData;

  // 고객 상태별 배지 색상 매핑
  const statusBadgeVariant: Record<
    string,
    'default' | 'secondary' | 'outline' | 'destructive'
  > = {
    active: 'default',
    inactive: 'secondary',
  };

  // 고객 상태 텍스트 매핑
  const statusText: Record<string, string> = {
    active: '활성',
    inactive: '비활성',
  };

  // 영업 단계별 배지 색상 매핑
  const stageBadgeVariant: Record<
    string,
    'default' | 'secondary' | 'outline' | 'destructive'
  > = {
    '첫 상담': 'outline',
    '니즈 분석': 'outline',
    '상품 설명': 'outline',
    '계약 검토': 'outline',
    '계약 완료': 'outline',
  };

  return (
    <div className="container p-6 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">고객 관리</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="고객 검색..."
              className="pl-8 w-64"
            />
          </div>
          <Link to="/clients/edit">
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              고객 추가
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>고객 목록</CardTitle>
          <CardDescription>
            전체 {clients.length}명의 고객이 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>전체 고객 목록</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">고객명</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>회사</TableHead>
                <TableHead>소개인</TableHead>
                <TableHead>단계</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    <Link
                      to={`/clients/${client.id}`}
                      className="hover:underline"
                    >
                      {client.name}
                    </Link>
                  </TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.company || '-'}</TableCell>
                  <TableCell>{client.referredBy || '-'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={stageBadgeVariant[client.stage] || 'outline'}
                    >
                      {client.stage}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant[client.status]}>
                      {statusText[client.status]}
                    </Badge>
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
                        <DropdownMenuItem>
                          <Link to={`/clients/${client.id}`}>상세 보기</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link to={`/clients/edit/${client.id}`}>수정</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
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
