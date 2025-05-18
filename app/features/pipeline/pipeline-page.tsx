import { Button } from '../../common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../common/components/ui/card';
import { Badge } from '../../common/components/ui/badge';

export interface Route {
  ComponentProps: {
    loaderData?: {
      stages: {
        id: string;
        name: string;
        clients: {
          id: string;
          name: string;
          phone: string;
          referredBy?: string;
          nextMeeting?: string;
          note?: string;
          priority: 'low' | 'medium' | 'high';
        }[];
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
  // 실제 구현에서는 DB에서 파이프라인 데이터를 가져옵니다
  // 여기서는 샘플 데이터를 반환합니다
  return {
    stages: [
      {
        id: '1',
        name: '첫 상담',
        clients: [
          {
            id: '1',
            name: '이영희',
            phone: '010-1234-5678',
            referredBy: '김철수',
            nextMeeting: '2023-05-10T14:00:00',
            note: '자녀 교육 보험에 관심 있음',
            priority: 'medium',
          },
          {
            id: '2',
            name: '정지원',
            phone: '010-9876-5432',
            referredBy: '이영희',
            priority: 'high',
          },
        ],
      },
      {
        id: '2',
        name: '니즈 분석',
        clients: [
          {
            id: '3',
            name: '최유진',
            phone: '010-5555-1234',
            referredBy: '박민수',
            nextMeeting: '2023-05-12T11:00:00',
            note: '퇴직 후 연금 설계 필요',
            priority: 'high',
          },
        ],
      },
      {
        id: '3',
        name: '상품 설명',
        clients: [
          {
            id: '4',
            name: '박민수',
            phone: '010-1111-2222',
            referredBy: '김철수',
            nextMeeting: '2023-05-08T16:30:00',
            priority: 'medium',
          },
        ],
      },
      {
        id: '4',
        name: '계약 검토',
        clients: [],
      },
      {
        id: '5',
        name: '계약 완료',
        clients: [
          {
            id: '5',
            name: '김철수',
            phone: '010-3333-4444',
            priority: 'low',
          },
        ],
      },
    ],
  };
}

export function meta(): ReturnType<Route['MetaFunction']> {
  return {
    title: '영업 파이프라인 - SureCRM',
    description: '고객을 단계별로 체계적으로 관리하세요',
  };
}

export default function PipelinePage({ loaderData }: Route['ComponentProps']) {
  const { stages } = loaderData || { stages: [] };

  // 우선순위별 배지 색상
  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  // 우선순위 텍스트
  const priorityText = {
    low: '낮음',
    medium: '중간',
    high: '높음',
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">영업 파이프라인</h1>
        <div className="flex gap-3">
          <Button variant="outline">뷰 전환</Button>
          <Button>고객 추가</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stages.map((stage) => (
          <div key={stage.id} className="flex flex-col">
            <div className="bg-gray-100 rounded-t-md p-3">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">{stage.name}</h3>
                <Badge>{stage.clients.length}</Badge>
              </div>
            </div>
            <div className="bg-gray-50 flex-1 p-2 rounded-b-md min-h-[300px]">
              {stage.clients.length === 0 ? (
                <div className="flex items-center justify-center h-24 border border-dashed border-gray-300 rounded-md text-gray-400 text-sm">
                  고객이 없습니다
                </div>
              ) : (
                <div className="space-y-2">
                  {stage.clients.map((client) => (
                    <Card
                      key={client.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{client.name}</h4>
                          <Badge
                            className={priorityColors[client.priority]}
                            variant="outline"
                          >
                            {priorityText[client.priority]}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-600">{client.phone}</p>
                          {client.referredBy && (
                            <p className="text-gray-500">
                              소개: {client.referredBy}
                            </p>
                          )}
                          {client.nextMeeting && (
                            <p className="text-gray-500">
                              다음 미팅:{' '}
                              {new Date(client.nextMeeting).toLocaleDateString(
                                'ko-KR'
                              )}
                            </p>
                          )}
                          {client.note && (
                            <p className="text-gray-500 line-clamp-2">
                              {client.note}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>파이프라인 통계</CardTitle>
            <CardDescription>
              단계별 고객 수 및 전환율을 확인하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 flex items-center justify-center rounded-md">
              <p className="text-gray-400">차트가 이곳에 표시됩니다.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
