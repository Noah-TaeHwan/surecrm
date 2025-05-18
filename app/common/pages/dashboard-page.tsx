import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">대시보드</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>오늘의 미팅</CardTitle>
          </CardHeader>
          <CardContent>
            <p>예정된 미팅이 없습니다.</p>
            <Button className="mt-4">미팅 예약</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>파이프라인 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <p>아직 고객 데이터가 없습니다.</p>
            <Button className="mt-4">고객 추가</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>핵심 소개자</CardTitle>
          </CardHeader>
          <CardContent>
            <p>아직 소개자 데이터가 없습니다.</p>
            <Button className="mt-4">소개 관계 설정</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
