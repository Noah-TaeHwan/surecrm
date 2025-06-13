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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/common/components/ui/table';
import { cn } from '~/lib/utils';
import { formatCurrencyByUnit } from '~/lib/utils/currency';
import type { TopPerformersProps } from '../types';

export function TopPerformers({ performers }: TopPerformersProps) {
  // 통일된 통화 포맷팅 함수 사용
  const formatCurrency = (amount: number) => {
    return formatCurrencyByUnit(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>상위 성과자</CardTitle>
        <CardDescription>이번 달 최고 성과를 기록한 팀원들</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>순위</TableHead>
              <TableHead>이름</TableHead>
              <TableHead className="text-center">고객 수</TableHead>
              <TableHead className="text-center">계약 건수</TableHead>
              <TableHead className="text-right">수익</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {performers.map((performer, index) => (
              <TableRow key={performer.id}>
                <TableCell>
                  <div className="flex items-center">
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3',
                        index === 0
                          ? 'bg-yellow-500'
                          : index === 1
                            ? 'bg-gray-400'
                            : 'bg-orange-500'
                      )}
                    >
                      {index + 1}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{performer.name}</TableCell>
                <TableCell className="text-center">
                  {performer.clients}명
                </TableCell>
                <TableCell className="text-center">
                  {performer.conversions}건
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(performer.revenue)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
