import { Button } from '~/common/components/ui/button';
import { Plus, Users } from 'lucide-react';
import { ResponsiveDataDisplay } from '~/common/components/ui/responsive-data-display';
import { ClientsTableView } from './clients-table-view';
import { ClientsCardView } from './clients-card-view';

// 클라이언트 프로필 타입 정의
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

interface ClientListProps {
  filteredClients: ClientProfile[];
  onClientRowClick: (clientId: string) => void;
  onAddClient: () => void;
}

export function ClientListSection({
  filteredClients,
  onClientRowClick,
  onAddClient,
}: ClientListProps) {
  // 아이콘이 포함된 제목 컴포넌트
  const titleWithIcon = (
    <div className="flex items-center gap-2">
      <div className="p-1.5 bg-primary/10 rounded-lg">
        <Users className="h-4 w-4 text-primary" />
      </div>
      고객 목록
    </div>
  );

  return (
    <ResponsiveDataDisplay
      data={filteredClients}
      title={titleWithIcon}
      description="고객 상세 정보를 확인하세요"
      TableComponent={ClientsTableView}
      CardComponent={ClientsCardView}
      tableProps={{ onClientRowClick }}
      cardProps={{ onClientRowClick }}
      defaultViewMode="auto" // 자동 반응형 모드
      allowViewModeToggle={true}
      showViewModeButtons={true}
      showItemCount={true}
      emptyStateConfig={{
        title: '검색 결과가 없습니다',
        description: '검색 조건을 변경하거나 새 고객을 추가해보세요.',
        action: (
          <Button onClick={onAddClient}>
            <Plus className="h-4 w-4 mr-2" />새 고객 추가하기
          </Button>
        ),
      }}
    />
  );
}
