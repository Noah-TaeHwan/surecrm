import { useState } from 'react';
import { MobilePipelineLayout } from '~/features/pipeline/components/mobile-pipeline-layout';
import { MainLayout } from '~/common/layouts/main-layout';
import { Users, TrendingUp, CheckCircle, Star, BarChart3 } from 'lucide-react';

export function meta() {
  return [
    { title: '영업 파이프라인 모바일 테스트 - SureCRM' },
    { name: 'description', content: '영업 파이프라인 모바일 반응형 레이아웃 테스트' },
  ];
}

export default function TestPipelineMobile() {
  // 테스트용 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReferrerId, setSelectedReferrerId] = useState<string | null>(null);
  const [selectedImportance, setSelectedImportance] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // 테스트용 데이터
  const mockStatsCards = [
    {
      id: 'total-clients',
      title: '전체 고객',
      value: 127,
      description: '고객 관리의 모든 고객',
      icon: Users,
      color: 'blue' as const,
    },
    {
      id: 'pipeline-clients',
      title: '영업 관리 중',
      value: 45,
      description: '현재 파이프라인 진행 중',
      icon: TrendingUp,
      color: 'orange' as const,
    },
    {
      id: 'contracted-clients',
      title: '계약 완료',
      value: 23,
      description: '실제 성과 달성 고객',
      icon: CheckCircle,
      color: 'green' as const,
    },
    {
      id: 'high-value-clients',
      title: '키맨 고객',
      value: 12,
      description: '고가치 중요 고객',
      icon: Star,
      color: 'red' as const,
    },
    {
      id: 'conversion-rate',
      title: '전환율',
      value: '68%',
      description: '계약 완료 성공률',
      icon: BarChart3,
      color: 'emerald' as const,
    },
  ];

  const mockStages = [
    {
      id: '1',
      name: '첫 상담',
      order: 1,
      color: '#3B82F6',
      stats: { clientCount: 8, highImportanceCount: 3 },
    },
    {
      id: '2',
      name: '니즈 분석',
      order: 2,
      color: '#F59E0B',
      stats: { clientCount: 6, highImportanceCount: 2 },
    },
    {
      id: '3',
      name: '상품 설명',
      order: 3,
      color: '#8B5CF6',
      stats: { clientCount: 5, highImportanceCount: 2 },
    },
    {
      id: '4',
      name: '계약 검토',
      order: 4,
      color: '#EF4444',
      stats: { clientCount: 3, highImportanceCount: 1 },
    },
    {
      id: '5',
      name: '계약 완료',
      order: 5,
      color: '#10B981',
      stats: { clientCount: 23, highImportanceCount: 4 },
    },
  ];

  const mockClients = [
    {
      id: '1',
      name: '김철수',
      phone: '010-1234-5678',
      stageId: '1',
      importance: 'high' as const,
      products: [],
      totalMonthlyPremium: 0,
      totalExpectedCommission: 0,
    },
    {
      id: '2',
      name: '이영희',
      phone: '010-2345-6789',
      stageId: '2',
      importance: 'medium' as const,
      products: [],
      totalMonthlyPremium: 0,
      totalExpectedCommission: 0,
    },
    {
      id: '3',
      name: '박민수',
      phone: '010-3456-7890',
      stageId: '3',
      importance: 'high' as const,
      products: [],
      totalMonthlyPremium: 0,
      totalExpectedCommission: 0,
    },
  ];

  const mockPotentialReferrers = [
    { id: '1', name: '김철수' },
    { id: '2', name: '이영희' },
    { id: '3', name: '박민수' },
  ];

  const isFilterActive =
    selectedReferrerId !== null ||
    selectedImportance !== 'all' ||
    searchQuery !== '';

  const handleFilterReset = () => {
    setSearchQuery('');
    setSelectedReferrerId(null);
    setSelectedImportance('all');
  };

  // Mock handlers
  const mockHandlers = {
    onClientMove: (clientId: string, sourceStageId: string, destinationStageId: string) => {
      console.log('Client moved:', { clientId, sourceStageId, destinationStageId });
    },
    onAddClientToStage: (stageId: string) => {
      console.log('Add client to stage:', stageId);
    },
    onRemoveFromPipeline: (clientId: string, clientName: string) => {
      console.log('Remove from pipeline:', { clientId, clientName });
    },
    onCreateContract: (clientId: string, clientName: string, products: any[]) => {
      console.log('Create contract:', { clientId, clientName, products });
    },
    onEditOpportunity: (clientId: string, clientName: string) => {
      console.log('Edit opportunity:', { clientId, clientName });
    },
    onAddNewClient: () => {
      console.log('Add new client clicked');
    },
    onExistingClientOpportunity: () => {
      console.log('Existing client opportunity clicked');
    },
  };

  return (
    <MainLayout title="영업 파이프라인 모바일 테스트">
      <div className="space-y-6">
        {/* 안내 메시지 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            📱 모바일 반응형 레이아웃 테스트
          </h2>
          <p className="text-blue-700 text-sm mb-3">
            이 페이지는 영업 파이프라인의 새로운 모바일 반응형 레이아웃을 테스트합니다.
            브라우저 창 크기를 조정하거나 개발자 도구의 모바일 뷰로 확인해보세요.
          </p>
          
          <div className="bg-white rounded-md p-3 border border-blue-100">
            <h3 className="font-medium text-blue-900 mb-2">🔧 최신 개선사항</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>헤더 공백 제거:</strong> 헤더와 콘텐츠 사이 불필요한 공백 제거</li>
              <li>• <strong>Sticky 위치 최적화:</strong> 통계 카드와 탭 네비게이션이 화면 상단에 바로 붙도록 조정</li>
              <li>• <strong>모바일 UX 개선:</strong> 더 깔끔하고 효율적인 화면 공간 활용</li>
            </ul>
          </div>
        </div>

        {/* 모바일 레이아웃 테스트 */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-3 border-b">
            <h3 className="font-medium text-gray-900">새로운 모바일 레이아웃</h3>
          </div>
          <div className="min-h-[600px]">
            <MobilePipelineLayout
              statsCards={mockStatsCards}
              stages={mockStages}
              clients={mockClients as any}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedReferrerId={selectedReferrerId}
              onReferrerChange={setSelectedReferrerId}
              selectedImportance={selectedImportance}
              onImportanceChange={setSelectedImportance}
              potentialReferrers={mockPotentialReferrers}
              isFilterActive={isFilterActive}
              onClientMove={mockHandlers.onClientMove}
              onAddClientToStage={mockHandlers.onAddClientToStage}
              onRemoveFromPipeline={mockHandlers.onRemoveFromPipeline}
              onCreateContract={mockHandlers.onCreateContract}
              onEditOpportunity={mockHandlers.onEditOpportunity}
              onAddNewClient={mockHandlers.onAddNewClient}
              onExistingClientOpportunity={mockHandlers.onExistingClientOpportunity}
              onFilterReset={handleFilterReset}
              filteredClientsCount={mockClients.length}
            />
          </div>
        </div>

        {/* 기능 설명 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">✅ 구현된 기능</h3>
            <ul className="text-green-700 text-sm space-y-1">
              <li>• 통계 카드 토글 (Collapsible)</li>
              <li>• 칸반보드 캐러셀 스와이프</li>
              <li>• 검색 및 필터링</li>
              <li>• 반응형 액션 버튼</li>
              <li>• 고객 상세 페이지 스타일 적용</li>
            </ul>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-900 mb-2">🔧 테스트 방법</h3>
            <ul className="text-amber-700 text-sm space-y-1">
              <li>• 통계 카드 섹션 접기/펼치기</li>
              <li>• 칸반보드 좌우 스와이프</li>
              <li>• 검색어 입력 테스트</li>
              <li>• 필터 드롭다운 사용</li>
              <li>• 액션 버튼 클릭 (콘솔 확인)</li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 