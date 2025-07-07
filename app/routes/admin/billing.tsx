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
  DollarSign,
  CreditCard,
  TrendingDown,
  Users,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

// TODO: 서버 로직 구현
export async function loader() {
  const stats = { mrr: 12500000, activeSubs: 250, churnRate: 2.1, newSubs: 15 };
  const transactions = [
    {
      id: 'txn_1',
      customer: '김고객',
      email: 'kim@example.com',
      plan: 'Pro',
      amount: 50000,
      status: 'succeeded',
      date: '2023-10-27T10:00:00Z',
    },
    {
      id: 'txn_2',
      customer: '이고객',
      email: 'lee@example.com',
      plan: 'Standard',
      amount: 30000,
      status: 'succeeded',
      date: '2023-10-27T09:00:00Z',
    },
    {
      id: 'txn_3',
      customer: '박고객',
      email: 'park@example.com',
      plan: 'Pro',
      amount: 50000,
      status: 'failed',
      date: '2023-10-26T15:00:00Z',
    },
  ];
  return { stats, transactions };
}

export default function AdminBillingPage() {
  const { stats, transactions } = useLoaderData<typeof loader>();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'succeeded')
      return (
        <Badge className="bg-green-100 text-green-700">
          <CheckCircle className="h-3 w-3 mr-1" />
          성공
        </Badge>
      );
    if (status === 'failed')
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          실패
        </Badge>
      );
    return (
      <Badge variant="secondary">
        <AlertCircle className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">결제 관리</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              MRR
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.mrr)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              활성 구독
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              신규 구독 (30일)
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newSubs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              이탈률 (Churn)
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.churnRate}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>결제 내역</CardTitle>
            <div className="flex items-center gap-2">
              <Input placeholder="이메일, 거래 ID 검색..." className="w-64" />
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 상태</SelectItem>
                  <SelectItem value="succeeded">성공</SelectItem>
                  <SelectItem value="failed">실패</SelectItem>
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
                <TableHead>거래 ID</TableHead>
                <TableHead>고객</TableHead>
                <TableHead>플랜</TableHead>
                <TableHead>금액</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>결제일</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">{item.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{item.customer}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.email}
                    </div>
                  </TableCell>
                  <TableCell>{item.plan}</TableCell>
                  <TableCell>{formatCurrency(item.amount)}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>
                    {new Date(item.date).toLocaleString('ko-KR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>영수증 보기</DropdownMenuItem>
                        <DropdownMenuItem>사용자 정보 보기</DropdownMenuItem>
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
