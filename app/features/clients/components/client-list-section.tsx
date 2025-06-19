import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { formatCurrencyByUnit } from '~/lib/utils/currency';
import {
  Card,
  CardContent,
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
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Users, Plus, Star } from 'lucide-react';
import { formatCurrencyTable } from '~/lib/utils/currency';
import { ClientCard, type ClientCardData } from './client-card';

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
  viewMode: 'cards' | 'table';
  onClientRowClick: (clientId: string) => void;
  onAddClient: () => void;
}

export function ClientListSection({
  filteredClients,
  viewMode,
  onClientRowClick,
  onAddClient,
}: ClientListProps) {
  // 헬퍼 함수들
  const getImportanceBadgeColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200';
      case 'low':
        return 'bg-muted text-muted-foreground border-muted-foreground/20';
      default:
        return 'bg-muted text-muted-foreground border-muted-foreground/20';
    }
  };

  const getImportanceText = (importance: string) => {
    switch (importance) {
      case 'high':
        return '키맨';
      case 'medium':
        return '일반';
      case 'low':
        return '관심';
      default:
        return '미설정';
    }
  };

  // 통일된 통화 포맷팅 함수 사용
  const formatCurrency = (amount: number) => {
    return formatCurrencyByUnit(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'yyyy.MM.dd', { locale: ko });
  };

  // 중요도별 카드 스타일
  const getClientCardStyle = (importance: string) => {
    switch (importance) {
      case 'high':
        return {
          bgGradient:
            'bg-gradient-to-br from-orange-50/50 to-white dark:from-orange-950/20 dark:to-background',
          borderClass: 'client-card-keyman', // 키맨 전용 애니메이션 클래스
        };
      case 'medium':
        return {
          bgGradient:
            'bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/20 dark:to-background',
          borderClass: 'client-card-normal', // 일반 고객 은은한 효과
        };
      case 'low':
        return {
          bgGradient:
            'bg-gradient-to-br from-muted/30 to-white dark:from-muted/10 dark:to-background',
          borderClass: 'client-card-low', // 은은한 회색 효과
        };
      default:
        return {
          bgGradient:
            'bg-gradient-to-br from-muted/30 to-white dark:from-muted/10 dark:to-background',
          borderClass: '',
        };
    }
  };

  // 📱 모바일 반응형 카드 뷰 렌더링 (새로운 ClientCard 사용)
  const renderCardView = () => {
    // ClientProfile을 ClientCardData로 변환하는 헬퍼 함수
    const transformToClientCardData = (
      client: ClientProfile
    ): ClientCardData => ({
      id: client.id,
      fullName: client.fullName,
      email: client.email,
      phone: client.phone,
      address: client.address,
      occupation: client.occupation,
      importance: client.importance,
      tags: Array.isArray(client.insuranceTypes) ? client.insuranceTypes : [],
      currentStage: client.currentStage,
      totalPremium: client.totalPremium,
      lastContactDate: client.lastContactDate,
      nextActionDate: undefined, // 추후 실제 데이터로 교체
      referredBy: client.referredBy,
      referralCount: client.referralCount,
      createdAt: client.createdAt,
    });

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredClients.map((client: ClientProfile) => (
          <ClientCard
            key={client.id}
            client={transformToClientCardData(client)}
            onClick={() => onClientRowClick(client.id)}
            className="h-auto min-h-[280px]" // 일관된 높이 유지
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
              onClientRowClick(clientData.id);
            }}
            onDelete={(e, clientData) => {
              e.stopPropagation();
              // 삭제 확인 후 처리 로직
              if (confirm(`${clientData.fullName} 고객을 삭제하시겠습니까?`)) {
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
      </div>
    );
  };

  // 테이블 뷰 렌더링
  const renderTableView = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-left">고객 정보</TableHead>
          <TableHead className="text-left">연락처</TableHead>
          <TableHead className="text-left">소개 관계</TableHead>
          <TableHead className="text-left">중요도</TableHead>
          <TableHead className="text-left">영업 단계</TableHead>
          <TableHead className="text-left">성과</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredClients.map(client => (
          <TableRow
            key={client.id}
            className="cursor-pointer hover:bg-muted/50 "
            onClick={() => onClientRowClick(client.id)}
          >
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                    {client.fullName.charAt(0)}
                  </div>
                </div>
                <div>
                  <p className="font-medium">{client.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {client.phone}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <p className="text-sm">{client.occupation || '미입력'}</p>
                <p className="text-xs text-muted-foreground">
                  {client.address || '주소 미입력'}
                </p>
              </div>
            </TableCell>
            <TableCell>
              {client.referredBy ? (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {client.referredBy.name}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    ({client.referredBy.relationship})
                  </span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">직접 고객</span>
              )}
            </TableCell>
            <TableCell>
              <Badge
                className={`${getImportanceBadgeColor(
                  client.importance
                )} border`}
              >
                {getImportanceText(client.importance)}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${client.currentStage.color}`}
                />
                <span className="text-sm">{client.currentStage.name}</span>
              </div>
            </TableCell>
            <TableCell className="text-left">
              <div className="text-sm">
                <div className="font-medium">{client.referralCount}명 소개</div>
                <div className="text-xs text-muted-foreground">
                  {formatCurrencyTable(client.totalPremium)} 월납
                </div>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              고객 목록
              <Badge variant="outline" className="ml-2">
                {filteredClients.length}명
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {viewMode === 'cards'
                ? '카드 뷰로 고객 상세 정보를 확인하세요'
                : '테이블 뷰로 고객을 빠르게 비교하세요'}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="rounded-full bg-primary/10 p-6 mb-6">
              <Users className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              검색 결과가 없습니다
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              검색 조건을 변경하거나 새 고객을 추가해보세요.
            </p>
            <Button onClick={onAddClient}>
              <Plus className="h-4 w-4 mr-2" />새 고객 추가하기
            </Button>
          </div>
        ) : viewMode === 'cards' ? (
          renderCardView()
        ) : (
          renderTableView()
        )}
      </CardContent>
    </Card>
  );
}
