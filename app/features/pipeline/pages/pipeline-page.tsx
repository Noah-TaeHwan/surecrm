import type { Route } from '.react-router/types/app/features/pipeline/pages/+types/pipeline-page';
import { MainLayout } from '~/common/layouts/main-layout';
import { useState } from 'react';
import { PipelineBoard } from '~/features/pipeline/components/pipeline-board';
import { PipelineFilters } from '~/features/pipeline/components/pipeline-filters';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import type { Client } from './+types/pipeline-page';
import { Separator } from '~/common/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/common/components/ui/sheet';

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '영업 파이프라인 - SureCRM' },
    { name: 'description', content: '영업 단계별 고객 관리 파이프라인' },
  ];
}

export function loader({ request }: Route.LoaderArgs) {
  // 실제 구현에서는 DB에서 데이터를 가져오는 로직이 들어갑니다
  return {
    stages: [
      {
        id: 'stage-1',
        name: '첫 상담',
        order: 0,
        color: '#8884d8',
      },
      {
        id: 'stage-2',
        name: '니즈 분석',
        order: 1,
        color: '#82ca9d',
      },
      {
        id: 'stage-3',
        name: '상품 설명',
        order: 2,
        color: '#ffc658',
      },
      {
        id: 'stage-4',
        name: '계약 검토',
        order: 3,
        color: '#ff8042',
      },
      {
        id: 'stage-5',
        name: '계약 완료',
        order: 4,
        color: '#0088fe',
      },
    ],
    clients: [
      {
        id: 'client-1',
        name: '김영희',
        phone: '010-1234-5678',
        email: 'kim@example.com',
        importance: 'high',
        lastContactDate: '2023-05-15',
        nextMeeting: {
          date: '2023-05-20',
          time: '14:00',
          type: '상품 설명',
        },
        note: '자녀 교육 보험에 관심 있음',
        tags: ['교육보험', '고액'],
        stageId: 'stage-1',
        referredBy: {
          id: 'client-5',
          name: '박지성',
        },
      },
      {
        id: 'client-2',
        name: '이철수',
        phone: '010-2345-6789',
        importance: 'medium',
        lastContactDate: '2023-05-10',
        stageId: 'stage-2',
      },
      {
        id: 'client-3',
        name: '박민지',
        phone: '010-3456-7890',
        email: 'park@example.com',
        importance: 'low',
        stageId: 'stage-1',
      },
      {
        id: 'client-4',
        name: '최재영',
        phone: '010-4567-8901',
        importance: 'high',
        nextMeeting: {
          date: '2023-05-22',
          time: '10:00',
          type: '계약 체결',
        },
        stageId: 'stage-4',
      },
      {
        id: 'client-5',
        name: '박지성',
        phone: '010-5678-9012',
        email: 'js.park@example.com',
        importance: 'high',
        note: '핵심 소개자',
        tags: ['VIP', '영향력자'],
        stageId: 'stage-5',
      },
      {
        id: 'client-6',
        name: '김민수',
        phone: '010-6789-0123',
        importance: 'medium',
        stageId: 'stage-3',
        referredBy: {
          id: 'client-5',
          name: '박지성',
        },
      },
      {
        id: 'client-7',
        name: '정다영',
        phone: '010-7890-1234',
        importance: 'medium',
        stageId: 'stage-2',
        referredBy: {
          id: 'client-5',
          name: '박지성',
        },
      },
    ],
  };
}

export default function PipelinePage({ loaderData }: Route.ComponentProps) {
  const { stages, clients } = loaderData;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReferrerId, setSelectedReferrerId] = useState<string | null>(
    null
  );
  const [selectedImportance, setSelectedImportance] = useState<
    'all' | 'high' | 'medium' | 'low'
  >('all');

  // 필터링된 고객 목록
  const filteredClients = clients.filter((client) => {
    // 검색어 필터링
    const matchesSearch =
      searchQuery === '' ||
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery);

    // 소개자 필터링
    const matchesReferrer =
      selectedReferrerId === null ||
      client.referredBy?.id === selectedReferrerId;

    // 중요도 필터링
    const matchesImportance =
      selectedImportance === 'all' || client.importance === selectedImportance;

    return matchesSearch && matchesReferrer && matchesImportance;
  });

  // 모든 소개자 목록 생성 (중복 제거)
  const referrers = clients
    .filter((client) => clients.some((c) => c.referredBy?.id === client.id))
    .map((client) => ({
      id: client.id,
      name: client.name,
    }));

  // 고객 이동 처리 함수
  const handleClientMove = (
    clientId: string,
    sourceStageId: string,
    destinationStageId: string
  ) => {
    // 실제 구현에서는 여기서 API 호출을 통해 DB 업데이트를 수행합니다
    console.log(
      `Move client ${clientId} from ${sourceStageId} to ${destinationStageId}`
    );
  };

  // 필터가 적용되었는지 확인
  const isFilterActive =
    selectedReferrerId !== null || selectedImportance !== 'all';

  return (
    <MainLayout title="영업 파이프라인">
      <div className="space-y-6">
        {/* 필터 및 검색 섹션 */}
        <div className="flex items-center justify-between">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="search"
              placeholder="고객명, 전화번호 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[250px]"
              autoComplete="off"
            />
            <Button type="submit" size="icon" variant="ghost">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {/* 필터 사이드 패널 */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant={isFilterActive ? 'default' : 'outline'}
                  className="flex items-center gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>필터 {isFilterActive ? '적용됨' : ''}</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>파이프라인 필터</SheetTitle>
                  <SheetDescription>
                    원하는 조건으로 고객을 필터링하세요
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6">
                  <PipelineFilters
                    referrers={referrers}
                    selectedReferrerId={selectedReferrerId}
                    onReferrerChange={setSelectedReferrerId}
                    selectedImportance={selectedImportance}
                    onImportanceChange={setSelectedImportance}
                  />
                </div>
              </SheetContent>
            </Sheet>

            <Separator orientation="vertical" className="h-6" />

            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>고객 추가</span>
            </Button>
          </div>
        </div>

        {/* 활성화된 필터 표시 */}
        {isFilterActive && (
          <div className="flex flex-wrap gap-2 items-center">
            {selectedReferrerId && (
              <div className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm">
                <span className="mr-1">소개자:</span>
                <span className="font-semibold mr-1">
                  {referrers.find((r) => r.id === selectedReferrerId)?.name}
                </span>
                <button
                  onClick={() => setSelectedReferrerId(null)}
                  className="ml-1 rounded-full hover:bg-muted-foreground/20 w-4 h-4 inline-flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            )}

            {selectedImportance !== 'all' && (
              <div className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm">
                <span className="mr-1">중요도:</span>
                <span className="font-semibold mr-1">
                  {selectedImportance === 'high'
                    ? '높음'
                    : selectedImportance === 'medium'
                    ? '중간'
                    : '낮음'}
                </span>
                <button
                  onClick={() => setSelectedImportance('all')}
                  className="ml-1 rounded-full hover:bg-muted-foreground/20 w-4 h-4 inline-flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => {
                setSelectedReferrerId(null);
                setSelectedImportance('all');
              }}
            >
              필터 초기화
            </Button>
          </div>
        )}

        {/* 칸반보드 섹션 */}
        <PipelineBoard
          stages={stages}
          clients={filteredClients as Client[]}
          onClientMove={handleClientMove}
        />
      </div>
    </MainLayout>
  );
}
