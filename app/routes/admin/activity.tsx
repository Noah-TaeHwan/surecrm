import { useLoaderData } from 'react-router';
import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Input } from '~/common/components/ui/input';
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
import { Badge } from '~/common/components/ui/badge';
import { Search, Filter, Clock, User, LogIn, Edit, Trash2 } from 'lucide-react';

// TODO: 서버 로직 구현
export async function loader() {
  const logs = [
    {
      id: 'log_1',
      user: 'admin@surecrm.pro',
      action: '로그인',
      ip: '127.0.0.1',
      timestamp: '2023-10-27T12:00:00Z',
      details: '성공적인 로그인',
    },
    {
      id: 'log_2',
      user: 'agent1@surecrm.pro',
      action: '고객 정보 수정',
      ip: '192.168.1.10',
      timestamp: '2023-10-27T11:30:00Z',
      details: '고객 ID: c_123, 필드: phone',
    },
    {
      id: 'log_3',
      user: 'system',
      action: '결제 실패',
      ip: 'N/A',
      timestamp: '2023-10-27T11:00:00Z',
      details: '사용자 ID: u_456, 금액: 50,000원',
    },
  ];
  const totalLogs = 3;
  return { logs, totalLogs };
}

export default function AdminActivityLogPage() {
  const { logs, totalLogs } = useLoaderData<typeof loader>();

  const getActionIcon = (action: string) => {
    if (action.includes('로그인')) return <LogIn className="h-4 w-4" />;
    if (action.includes('수정')) return <Edit className="h-4 w-4" />;
    if (action.includes('삭제')) return <Trash2 className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">활동 로그</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>전체 로그 ({totalLogs}건)</CardTitle>
            <div className="flex items-center gap-2">
              <Input placeholder="사용자, 활동, IP 검색..." className="w-64" />
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 활동</SelectItem>
                  <SelectItem value="login">로그인</SelectItem>
                  <SelectItem value="update">수정</SelectItem>
                  <SelectItem value="delete">삭제</SelectItem>
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
                <TableHead>시간</TableHead>
                <TableHead>사용자</TableHead>
                <TableHead>활동</TableHead>
                <TableHead>IP 주소</TableHead>
                <TableHead>세부 정보</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map(log => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('ko-KR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {log.user}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action)}
                      <span>{log.action}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{log.ip}</TableCell>
                  <TableCell>{log.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
