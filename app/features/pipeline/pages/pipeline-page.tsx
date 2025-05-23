import type { Route } from '.react-router/types/app/features/pipeline/pages/+types/pipeline-page';
import { MainLayout } from '~/common/layouts/main-layout';
import { useState } from 'react';
import { PipelineBoard } from '~/features/pipeline/components/pipeline-board';
import { PipelineFilters } from '~/features/pipeline/components/pipeline-filters';
import { AddClientModal } from '~/features/pipeline/components/add-client-modal';
import { Plus, Search, SlidersHorizontal, Users } from 'lucide-react';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import type { Client } from '~/features/pipeline/types';
import { Separator } from '~/common/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '~/common/components/ui/dropdown-menu';

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
        address: '서울시 강남구 테헤란로 123',
        occupation: '직장인 (IT회사)',
        telecomProvider: 'SKT',
        height: 165,
        weight: 55,
        hasDrivingLicense: true,
        importance: 'high',
        lastContactDate: '2023-05-15',
        nextMeeting: {
          date: '2023-05-20',
          time: '14:00',
          type: '상품 설명',
        },
        note: '자녀 교육 보험에 관심 있음. 안정적인 수익을 선호하며 위험도 낮은 상품 희망',
        tags: ['교육보험', '고액', 'VIP'],
        stageId: 'stage-1',
        referredBy: {
          id: 'client-5',
          name: '박지성',
        },
        insuranceInfo: [
          {
            id: 'ins-1',
            type: 'prenatal',
            details: {
              dueDate: '2023-11-15',
              conceptionMethod: 'natural',
              abortionPreventionMeds: false,
              abnormalFindings: false,
              disabilityTestFindings: false,
            },
          },
          {
            id: 'ins-2',
            type: 'auto',
            details: {
              vehicleNumber: '12가3456',
              ownerName: '김영희',
              vehicleType: '승용차',
              manufacturer: '현대',
            },
          },
        ],
        profileImageUrl: '/avatars/kim-younghee.jpg',
        consentDate: '2023-05-01',
      },
      {
        id: 'client-2',
        name: '이철수',
        phone: '010-2345-6789',
        email: 'lee@example.com',
        address: '서울시 서초구 반포대로 456',
        occupation: '자영업 (카페 운영)',
        telecomProvider: 'KT',
        height: 175,
        weight: 70,
        hasDrivingLicense: true,
        importance: 'medium',
        lastContactDate: '2023-05-10',
        note: '사업 확장을 위한 자금 필요. 투자형 보험 상품에 관심',
        tags: ['자영업', '투자형'],
        stageId: 'stage-2',
        insuranceInfo: [
          {
            id: 'ins-3',
            type: 'life',
            details: {
              coverage: '1억원',
              term: '20년',
            },
          },
        ],
        consentDate: '2023-04-28',
      },
      {
        id: 'client-3',
        name: '박민지',
        phone: '010-3456-7890',
        email: 'park@example.com',
        address: '서울시 마포구 월드컵로 789',
        occupation: '대학생',
        telecomProvider: 'LG U+',
        height: 160,
        weight: 50,
        hasDrivingLicense: false,
        importance: 'low',
        note: '학자금 대출 상환 중. 저렴한 보험료 희망',
        tags: ['학생', '저예산'],
        stageId: 'stage-1',
        consentDate: '2023-05-03',
      },
      {
        id: 'client-4',
        name: '최재영',
        phone: '010-4567-8901',
        email: 'choi@example.com',
        address: '서울시 종로구 청계천로 321',
        occupation: '의사 (내과 전문의)',
        telecomProvider: 'SKT',
        height: 180,
        weight: 75,
        hasDrivingLicense: true,
        importance: 'high',
        nextMeeting: {
          date: '2023-05-22',
          time: '10:00',
          type: '계약 체결',
        },
        note: '고액 보험 가입 희망. 세금 절약 목적의 상품 관심',
        tags: ['전문직', '고액', '세금절약'],
        stageId: 'stage-4',
        insuranceInfo: [
          {
            id: 'ins-4',
            type: 'health',
            details: {
              coverage: '2억원',
              familyHistory: '당뇨',
            },
          },
          {
            id: 'ins-5',
            type: 'property',
            details: {
              propertyType: '아파트',
              value: '15억원',
            },
          },
        ],
        consentDate: '2023-04-20',
      },
      {
        id: 'client-5',
        name: '박지성',
        phone: '010-5678-9012',
        email: 'js.park@example.com',
        address: '서울시 송파구 올림픽로 654',
        occupation: '회사 대표 (무역업)',
        telecomProvider: 'SKT',
        height: 178,
        weight: 72,
        hasDrivingLicense: true,
        importance: 'high',
        note: '핵심 소개자. 업계 인맥이 넓어 추가 고객 유치 가능성 높음',
        tags: ['VIP', '영향력자', '소개자'],
        stageId: 'stage-5',
        insuranceInfo: [
          {
            id: 'ins-6',
            type: 'life',
            details: {
              coverage: '5억원',
              beneficiary: '가족',
            },
          },
        ],
        profileImageUrl: '/avatars/park-jisung.jpg',
        consentDate: '2023-03-15',
      },
      {
        id: 'client-6',
        name: '김민수',
        phone: '010-6789-0123',
        email: 'minsu@example.com',
        address: '서울시 영등포구 여의도동 987',
        occupation: '금융업 (증권회사)',
        telecomProvider: 'KT',
        height: 172,
        weight: 68,
        hasDrivingLicense: true,
        importance: 'medium',
        note: '금융 상품에 대한 이해도 높음. 복합 상품 제안 가능',
        tags: ['금융업', '복합상품'],
        stageId: 'stage-3',
        referredBy: {
          id: 'client-5',
          name: '박지성',
        },
        insuranceInfo: [
          {
            id: 'ins-7',
            type: 'auto',
            details: {
              vehicleNumber: '34나5678',
              ownerName: '김민수',
              vehicleType: 'SUV',
              manufacturer: '기아',
            },
          },
        ],
        consentDate: '2023-04-10',
      },
      {
        id: 'client-7',
        name: '정다영',
        phone: '010-7890-1234',
        email: 'jung@example.com',
        address: '서울시 관악구 신림로 147',
        occupation: '교사 (초등학교)',
        telecomProvider: 'LG U+',
        height: 163,
        weight: 52,
        hasDrivingLicense: false,
        importance: 'medium',
        note: '안정적인 직업. 교육 관련 보험 상품에 관심 높음',
        tags: ['공무원', '교육', '안정형'],
        stageId: 'stage-2',
        referredBy: {
          id: 'client-5',
          name: '박지성',
        },
        consentDate: '2023-04-25',
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
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string>('');

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

  // 각 단계별 고객 수와 총 가치 계산
  const getStageStats = (stageId: string) => {
    const stageClients = filteredClients.filter(
      (client) => client.stageId === stageId
    );
    const clientCount = stageClients.length;
    const highImportanceCount = stageClients.filter(
      (client) => client.importance === 'high'
    ).length;

    return { clientCount, highImportanceCount };
  };

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

  // 새 고객 추가 처리 함수
  const handleAddClient = (client: {
    name: string;
    phone: string;
    email?: string;
    stageId: string;
    importance: 'high' | 'medium' | 'low';
    referrerId?: string;
    note?: string;
  }) => {
    // 실제 구현에서는 여기서 API 호출을 통해 DB에 새 고객을 추가합니다
    console.log('Add new client:', client);

    // 성공적으로 추가 후 모달 닫기
    setAddClientOpen(false);
    setSelectedStageId(''); // 단계 선택 초기화
  };

  // 특정 단계에 고객 추가 함수
  const handleAddClientToStage = (stageId: string) => {
    setSelectedStageId(stageId);
    setAddClientOpen(true);
  };

  // 필터가 적용되었는지 확인
  const isFilterActive =
    selectedReferrerId !== null || selectedImportance !== 'all';

  return (
    <MainLayout title="영업 파이프라인">
      <div className="space-y-6">
        {/* 전체 상단 영역 - sticky로 고정 */}
        <div className="sticky -top-8 z-20 bg-background border-b border-border pb-6">
          {/* 필터 및 검색 섹션 */}
          <div className="flex items-center justify-between mb-6 pt-6">
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
              {/* 필터 드롭다운 메뉴 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={isFilterActive ? 'default' : 'outline'}
                    className="flex items-center gap-2"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>필터 {isFilterActive ? '적용됨' : ''}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[320px] p-4 bg-background"
                  align="end"
                  sideOffset={4}
                >
                  <div className="space-y-4">
                    <h3 className="font-medium">필터 설정</h3>
                    <PipelineFilters
                      referrers={referrers}
                      selectedReferrerId={selectedReferrerId}
                      onReferrerChange={setSelectedReferrerId}
                      selectedImportance={selectedImportance}
                      onImportanceChange={setSelectedImportance}
                    />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <Separator orientation="vertical" className="h-6" />

              <Button
                className="flex items-center gap-2"
                onClick={() => {
                  setSelectedStageId('');
                  setAddClientOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                <span>고객 추가</span>
              </Button>
            </div>
          </div>

          {/* 활성화된 필터 표시 */}
          {isFilterActive && (
            <div className="flex flex-wrap gap-2 items-center mb-6">
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

          {/* 칸반보드 헤더 - sticky 영역에 포함 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {stages.map((stage) => {
              const stats = getStageStats(stage.id);

              return (
                <div key={`header-${stage.id}`} className="min-w-[300px]">
                  <div className="flex flex-col p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: stage.color }}
                        />
                        <h3 className="font-semibold text-foreground text-base">
                          {stage.name}
                        </h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleAddClientToStage(stage.id)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span className="font-medium">
                          {stats.clientCount}명
                        </span>
                      </div>
                      {stats.highImportanceCount > 0 && (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <span className="text-xs text-red-600 font-medium">
                            중요 {stats.highImportanceCount}명
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 칸반보드 섹션 */}
        <PipelineBoard
          stages={stages}
          clients={filteredClients as Client[]}
          onClientMove={handleClientMove}
          onAddClientToStage={handleAddClientToStage}
        />

        {/* 고객 추가 모달 */}
        <AddClientModal
          open={addClientOpen}
          onOpenChange={setAddClientOpen}
          stages={stages}
          referrers={referrers}
          initialStageId={selectedStageId}
          onAddClient={handleAddClient}
        />
      </div>
    </MainLayout>
  );
}
