import { Button } from '../../common/components/ui/button';
import { Card, CardContent } from '../../common/components/ui/card';
import { Input } from '../../common/components/ui/input';
import { Badge } from '../../common/components/ui/badge';
import { Link } from 'react-router';

export interface Route {
  ComponentProps: {
    loaderData?: {
      clients: {
        id: string;
        name: string;
        phone: string;
        email?: string;
        stage: string;
        referredBy?: string;
        lastContact?: string;
        tags?: string[];
      }[];
    };
  };
  LoaderArgs: {
    request: Request;
  };
  MetaFunction: () => {
    title: string;
    description?: string;
  };
}

export function loader({ request }: Route['LoaderArgs']) {
  // 실제 구현에서는 DB에서 고객 데이터를 가져옵니다
  // 여기서는 샘플 데이터를 반환합니다
  return {
    clients: [
      {
        id: '1',
        name: '김철수',
        phone: '010-3333-4444',
        email: 'chulsoo@example.com',
        stage: '계약 완료',
        lastContact: '2023-04-15',
        tags: ['VIP', '투자형'],
      },
      {
        id: '2',
        name: '이영희',
        phone: '010-1234-5678',
        email: 'younghee@example.com',
        stage: '첫 상담',
        referredBy: '김철수',
        lastContact: '2023-05-01',
        tags: ['교육형'],
      },
      {
        id: '3',
        name: '박민수',
        phone: '010-1111-2222',
        email: 'minsu@example.com',
        stage: '상품 설명',
        referredBy: '김철수',
        lastContact: '2023-04-28',
        tags: ['연금형'],
      },
      {
        id: '4',
        name: '정지원',
        phone: '010-9876-5432',
        email: 'jiwon@example.com',
        stage: '첫 상담',
        referredBy: '이영희',
        lastContact: '2023-04-30',
      },
      {
        id: '5',
        name: '최유진',
        phone: '010-5555-1234',
        email: 'youjin@example.com',
        stage: '니즈 분석',
        referredBy: '박민수',
        lastContact: '2023-05-02',
        tags: ['건강형', '장기고객'],
      },
    ],
  };
}

export function meta(): ReturnType<Route['MetaFunction']> {
  return {
    title: '고객 목록 - SureCRM',
    description: '모든 고객 정보를 한눈에 확인하세요',
  };
}

export default function ClientsPage({ loaderData }: Route['ComponentProps']) {
  const { clients } = loaderData || { clients: [] };

  const stageBadgeColor = (stage: string) => {
    switch (stage) {
      case '첫 상담':
        return 'bg-blue-100 text-blue-800';
      case '니즈 분석':
        return 'bg-indigo-100 text-indigo-800';
      case '상품 설명':
        return 'bg-purple-100 text-purple-800';
      case '계약 검토':
        return 'bg-yellow-100 text-yellow-800';
      case '계약 완료':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const tagColor = (tag: string) => {
    switch (tag) {
      case 'VIP':
        return 'bg-amber-100 text-amber-800';
      case '장기고객':
        return 'bg-emerald-100 text-emerald-800';
      case '투자형':
        return 'bg-cyan-100 text-cyan-800';
      case '교육형':
        return 'bg-violet-100 text-violet-800';
      case '연금형':
        return 'bg-rose-100 text-rose-800';
      case '건강형':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">고객 목록</h1>
        <div className="flex gap-3">
          <div className="relative w-full md:w-64">
            <Input placeholder="고객 검색..." className="pr-8" />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          <Button variant="outline">필터</Button>
          <Button asChild>
            <Link to="/clients/edit">고객 추가</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">이름</th>
                  <th className="text-left py-3 px-4 font-medium">연락처</th>
                  <th className="text-left py-3 px-4 font-medium">단계</th>
                  <th className="text-left py-3 px-4 font-medium">소개자</th>
                  <th className="text-left py-3 px-4 font-medium">
                    마지막 접촉
                  </th>
                  <th className="text-left py-3 px-4 font-medium">태그</th>
                  <th className="text-center py-3 px-4 font-medium">액션</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <Link
                        to={`/clients/${client.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {client.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span>{client.phone}</span>
                        {client.email && (
                          <span className="text-sm text-gray-500">
                            {client.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        className={stageBadgeColor(client.stage)}
                        variant="outline"
                      >
                        {client.stage}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {client.referredBy || '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {client.lastContact
                        ? new Date(client.lastContact).toLocaleDateString(
                            'ko-KR'
                          )
                        : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {client.tags?.map((tag) => (
                          <Badge
                            key={tag}
                            className={tagColor(tag)}
                            variant="outline"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
        <div>총 {clients.length}명의 고객</div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" disabled>
            이전
          </Button>
          <Button variant="outline" size="sm" disabled>
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}
