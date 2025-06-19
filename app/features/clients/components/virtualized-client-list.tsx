import { memo, useMemo, useRef } from 'react';
import { VList, type VListHandle } from 'virtua';
import { ClientCard, type ClientCardData } from './client-card';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Button } from '~/common/components/ui/button';
import { Users, Plus, Search, Filter, RotateCcw } from 'lucide-react';
import { cn } from '~/lib/utils';
import { useViewport } from '~/common/hooks/use-viewport';

// 🎯 가상화를 위한 클라이언트 프로필 타입 정의
interface ClientProfile {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  occupation?: string;
  importance: 'high' | 'medium' | 'low';
  currentStage: {
    id: string;
    name: string;
    color: string;
  };
  insuranceTypes: string[];
  totalPremium: number;
  referredBy?: {
    id: string;
    name: string;
    relationship: string;
  };
  referralCount: number;
  lastContactDate?: string;
  createdAt: Date;
}

// 🎯 Props 타입 정의
interface VirtualizedClientListProps {
  clients: ClientProfile[];
  onClientClick: (clientId: string) => void;
  onAddClient: () => void;
  isLoading?: boolean;
  className?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedFilters?: string[];
  onFiltersChange?: (filters: string[]) => void;
}

/**
 * 🚀 가상 스크롤링 클라이언트 목록 컴포넌트
 *
 * 🎯 **주요 특징:**
 * - Virtua 기반 가상 스크롤링으로 대용량 데이터 성능 최적화
 * - 모바일 반응형 그리드 레이아웃 (행 단위 가상화)
 * - ClientCard 컴포넌트 통합으로 일관된 UI
 * - 실시간 검색 및 필터링 지원
 * - 터치 친화적 인터랙션
 *
 * 📱 **모바일 최적화:**
 * - 부드러운 터치 스크롤링
 * - 반응형 컬럼 수 조정 (1→2→3→4 컬럼)
 * - 행 단위 가상화로 성능 최적화
 */
export const VirtualizedClientList = memo<VirtualizedClientListProps>(
  function VirtualizedClientList({
    clients,
    onClientClick,
    onAddClient,
    isLoading = false,
    className,
    searchQuery = '',
    onSearchChange,
    selectedFilters = [],
    onFiltersChange,
  }) {
    // 🎯 VList 레퍼런스 (프로그래밍 방식 스크롤 제어용)
    const vlistRef = useRef<VListHandle>(null);

    // 🎯 뷰포트 크기에 따른 컬럼 수 계산
    const { isMobile, isTablet, isDesktop } = useViewport();
    const columnsPerRow = useMemo(() => {
      if (isMobile) return 1;
      if (isTablet) return 2;
      if (isDesktop) return 3;
      return 4; // XL 화면
    }, [isMobile, isTablet, isDesktop]);

    // 🎯 ClientProfile을 ClientCardData로 변환하는 메모이제된 함수
    const transformToClientCardData = useMemo(
      () =>
        (client: ClientProfile): ClientCardData => ({
          id: client.id,
          fullName: client.fullName,
          email: client.email,
          phone: client.phone,
          address: client.address,
          occupation: client.occupation,
          importance: client.importance,
          tags: Array.isArray(client.insuranceTypes)
            ? client.insuranceTypes
            : [],
          currentStage: client.currentStage,
          totalPremium: client.totalPremium,
          lastContactDate: client.lastContactDate,
          nextActionDate: undefined, // 추후 실제 데이터로 교체
          referredBy: client.referredBy,
          referralCount: client.referralCount,
          createdAt: client.createdAt,
        }),
      []
    );

    // 🎯 필터링된 클라이언트 목록 (메모이제이션으로 성능 최적화)
    const filteredClients = useMemo(() => {
      let filtered = clients;

      // 검색 쿼리 필터링
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(
          client =>
            client.fullName.toLowerCase().includes(query) ||
            client.phone.includes(query) ||
            client.email?.toLowerCase().includes(query) ||
            client.occupation?.toLowerCase().includes(query) ||
            client.address?.toLowerCase().includes(query)
        );
      }

      // 추가 필터 적용 (중요도, 보험 종류 등)
      if (selectedFilters.length > 0) {
        filtered = filtered.filter(client =>
          selectedFilters.some(
            filter =>
              client.importance === filter ||
              client.insuranceTypes.includes(filter) ||
              client.currentStage.name === filter
          )
        );
      }

      return filtered;
    }, [clients, searchQuery, selectedFilters]);

    // 🎯 행 단위로 클라이언트 데이터 그룹핑 (가상화를 위해)
    const clientRows = useMemo(() => {
      const rows: ClientProfile[][] = [];
      for (let i = 0; i < filteredClients.length; i += columnsPerRow) {
        rows.push(filteredClients.slice(i, i + columnsPerRow));
      }
      return rows;
    }, [filteredClients, columnsPerRow]);

    // 🎯 빈 상태 렌더링
    const renderEmptyState = () => (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="rounded-full bg-primary/10 p-6 mb-6">
          <Users className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {searchQuery.trim() || selectedFilters.length > 0
            ? '검색 결과가 없습니다'
            : '등록된 고객이 없습니다'}
        </h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          {searchQuery.trim() || selectedFilters.length > 0
            ? '검색 조건을 변경하거나 새 고객을 추가해보세요.'
            : '첫 번째 고객을 추가하여 시작해보세요.'}
        </p>
        <Button onClick={onAddClient} className="gap-2">
          <Plus className="h-4 w-4" />새 고객 추가하기
        </Button>
      </div>
    );

    // 🎯 로딩 상태 렌더링
    const renderLoadingState = () => (
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        {Array.from({ length: 4 }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          >
            {Array.from({ length: columnsPerRow }).map((_, colIndex) => (
              <div
                key={colIndex}
                className="h-[280px] rounded-lg bg-muted/50 animate-pulse"
                aria-label="고객 카드 로딩 중"
              />
            ))}
          </div>
        ))}
      </div>
    );

    // 🎯 가상화된 행 렌더러
    const renderVirtualRow = (rowIndex: number) => {
      const row = clientRows[rowIndex];
      if (!row || row.length === 0) return null;

      return (
        <div
          key={`row-${rowIndex}`}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6"
          style={{ minHeight: '280px' }} // 일관된 행 높이 보장
        >
          {row.map(client => (
            <ClientCard
              key={client.id}
              client={transformToClientCardData(client)}
              onClick={onClientClick}
              className="h-full w-full min-h-[280px]"
              enableSwipe={true} // 🎯 스와이프 기능 활성화
              onCall={(e, clientData) => {
                e.stopPropagation();
                if (clientData.phone) {
                  const phoneNumber = clientData.phone.replace(/[^0-9+]/g, '');
                  window.location.href = `tel:${phoneNumber}`;
                }
              }}
              onEmail={(e, clientData) => {
                e.stopPropagation();
                if (clientData.email) {
                  window.location.href = `mailto:${clientData.email}`;
                }
              }}
              onEdit={(e, clientData) => {
                e.stopPropagation();
                onClientClick(clientData.id);
              }}
              onDelete={(e, clientData) => {
                e.stopPropagation();
                // 삭제 확인 후 처리 로직
                if (
                  confirm(`${clientData.fullName} 고객을 삭제하시겠습니까?`)
                ) {
                  console.log('클라이언트 삭제:', clientData.id);
                  // TODO: 실제 삭제 API 호출
                }
              }}
              onArchive={(e, clientData) => {
                e.stopPropagation();
                // 아카이브 처리 로직
                console.log('클라이언트 아카이브:', clientData.id);
                // TODO: 실제 아카이브 API 호출
              }}
            />
          ))}
          {/* 빈 슬롯 채우기 (마지막 행에서 일관된 레이아웃 유지) */}
          {Array.from({ length: columnsPerRow - row.length }).map(
            (_, index) => (
              <div key={`empty-${index}`} className="min-h-[280px]" />
            )
          )}
        </div>
      );
    };

    // 🎯 유틸리티: 맨 위로 스크롤
    const scrollToTop = () => {
      vlistRef.current?.scrollTo(0);
    };

    // 🎯 특정 클라이언트로 스크롤 (행 단위)
    const scrollToClient = (clientId: string) => {
      const clientIndex = filteredClients.findIndex(
        client => client.id === clientId
      );
      if (clientIndex !== -1) {
        const rowIndex = Math.floor(clientIndex / columnsPerRow);
        vlistRef.current?.scrollToIndex(rowIndex, { align: 'center' });
      }
    };

    return (
      <Card className={cn('h-full flex flex-col', className)}>
        {/* 🎯 헤더 영역 */}
        <CardHeader className="flex-shrink-0 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                고객 목록
                <Badge variant="outline" className="ml-2">
                  {filteredClients.length}명
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                가상 스크롤링으로 최적화된 고객 관리 • {clientRows.length}행
              </p>
            </div>

            {/* 컨트롤 버튼들 */}
            <div className="flex items-center gap-2">
              {filteredClients.length > 20 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={scrollToTop}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />맨 위로
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {/* 🎯 컨텐츠 영역 */}
        <CardContent className="flex-1 min-h-0 p-0">
          {isLoading ? (
            renderLoadingState()
          ) : filteredClients.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="h-full">
              {/* 🚀 Virtua VList - 행 단위 가상 스크롤링 */}
              <VList
                ref={vlistRef}
                style={{ height: '100%' }}
                className="px-4 sm:px-6 py-2"
                overscan={2} // 성능 최적화: 보이지 않는 영역에 2행 미리 렌더링
                onScroll={offset => {
                  // 스크롤 위치 기반 추가 동작 가능 (예: 무한 스크롤)
                  if (process.env.NODE_ENV === 'development') {
                    console.log(
                      'Virtual scroll offset:',
                      offset,
                      'rows:',
                      clientRows.length
                    );
                  }
                }}
              >
                {/* 🎯 가상화된 행들 렌더링 */}
                {clientRows.map((_, rowIndex) => renderVirtualRow(rowIndex))}
              </VList>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

// 🎯 추가 유틸리티 Hook (선택적 사용)
export const useVirtualizedClientList = () => {
  const vlistRef = useRef<VListHandle>(null);

  const scrollToTop = () => vlistRef.current?.scrollTo(0);
  const scrollToClient = (index: number) =>
    vlistRef.current?.scrollToIndex(index, { align: 'center' });

  return {
    vlistRef,
    scrollToTop,
    scrollToClient,
  };
};
