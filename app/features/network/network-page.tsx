import { Button } from '../../common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../common/components/ui/card';

export interface Route {
  ComponentProps: {
    loaderData?: {
      networkData: {
        nodes: {
          id: string;
          name: string;
          type: string;
          stage?: string;
        }[];
        edges: {
          source: string;
          target: string;
        }[];
      };
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
  // 실제 구현에서는 DB에서 네트워크 데이터를 가져옵니다
  // 여기서는 샘플 데이터를 반환합니다
  return {
    networkData: {
      nodes: [
        { id: '1', name: '김철수', type: 'client', stage: '계약 완료' },
        { id: '2', name: '이영희', type: 'client', stage: '첫 상담' },
        { id: '3', name: '박민수', type: 'client', stage: '상품 설명' },
        { id: '4', name: '정지원', type: 'client', stage: '니즈 분석' },
        { id: '5', name: '최유진', type: 'client', stage: '계약 검토' },
      ],
      edges: [
        { source: '1', target: '2' },
        { source: '1', target: '3' },
        { source: '2', target: '4' },
        { source: '3', target: '5' },
      ],
    },
  };
}

export function meta(): ReturnType<Route['MetaFunction']> {
  return {
    title: '소개 네트워크 - SureCRM',
    description: '고객 소개 관계를 시각적으로 확인하고 관리하세요',
  };
}

export default function NetworkPage({ loaderData }: Route['ComponentProps']) {
  const { networkData } = loaderData || {
    networkData: { nodes: [], edges: [] },
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">소개 네트워크</h1>
        <div className="flex gap-3">
          <Button variant="outline">필터</Button>
          <Button>소개 관계 추가</Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>네트워크 개요</CardTitle>
          <CardDescription>
            총 {networkData.nodes.length}명의 고객과 {networkData.edges.length}
            개의 소개 관계가 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 border rounded-md p-4 text-center">
            <p className="text-lg text-gray-500 mb-4">
              네트워크 그래프 뷰가 이곳에 표시됩니다.
            </p>
            <p className="text-sm text-gray-400">
              이 기능은 현재 개발 중입니다. React Force Graph 또는 유사한
              라이브러리를 활용하여 구현될 예정입니다.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>핵심 소개자</CardTitle>
            <CardDescription>
              가장 많은 소개를 제공한 고객 목록입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="font-medium">김철수</p>
                  <p className="text-sm text-gray-500">소개 2건</p>
                </div>
                <Button variant="outline" size="sm">
                  상세보기
                </Button>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="font-medium">이영희</p>
                  <p className="text-sm text-gray-500">소개 1건</p>
                </div>
                <Button variant="outline" size="sm">
                  상세보기
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>최근 소개 관계</CardTitle>
            <CardDescription>최근에 추가된 소개 관계입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium">박민수 → 최유진</p>
                <p className="text-sm text-gray-500">2023년 5월 1일 추가</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium">이영희 → 정지원</p>
                <p className="text-sm text-gray-500">2023년 4월 28일 추가</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
