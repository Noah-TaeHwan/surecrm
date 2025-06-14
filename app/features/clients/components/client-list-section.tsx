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

  // 카드 뷰 렌더링
  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredClients.map((client: ClientProfile) => {
        const cardStyle = getClientCardStyle(client.importance);

        return (
          <div key={client.id} className="relative">
            <Card
              className={`group hover:shadow-lg transition-all duration-200 ${cardStyle.bgGradient} ${cardStyle.borderClass} cursor-pointer hover:scale-[1.02] hover:-translate-y-1 h-[320px] flex flex-col relative overflow-hidden min-touch-target`}
              onClick={() => onClientRowClick(client.id)}
            >
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {client.fullName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg truncate">
                        {client.fullName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground truncate">
                        {client.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Badge
                      className={`${getImportanceBadgeColor(
                        client.importance
                      )} border text-xs font-medium`}
                    >
                      {getImportanceText(client.importance)}
                    </Badge>
                    {client.importance === 'high' && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-3 sm:p-4 md:p-6 h-full flex flex-col">
                {/* 상단: 고객 기본 정보 */}
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs sm:text-sm font-medium">
                        {client.fullName.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-foreground">
                        {client.fullName}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {client.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Badge
                      className={`${getImportanceBadgeColor(
                        client.importance
                      )} border text-xs font-medium`}
                    >
                      {getImportanceText(client.importance)}
                    </Badge>
                    {client.importance === 'high' && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {/* 현재 단계 - 항상 표시 */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      현재 단계
                    </span>
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: client.currentStage.color,
                        color: client.currentStage.color,
                      }}
                    >
                      {client.currentStage.name}
                    </Badge>
                  </div>

                  {/* 보험 정보 - 항상 표시 (없으면 "미설정") */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      보험 종류
                    </span>
                    <span className="text-sm font-medium text-right">
                      {client.insuranceTypes.length > 0 ? (
                        <>
                          {client.insuranceTypes.slice(0, 2).join(', ')}
                          {client.insuranceTypes.length > 2 &&
                            ` 외 ${client.insuranceTypes.length - 2}개`}
                        </>
                      ) : (
                        <span className="text-muted-foreground">미설정</span>
                      )}
                    </span>
                  </div>

                  {/* 총 보험료 - 항상 표시 */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      총 보험료
                    </span>
                    <span className="text-sm font-semibold text-green-600">
                      {client.totalPremium > 0
                        ? formatCurrency(client.totalPremium)
                        : '미설정'}
                    </span>
                  </div>

                  {/* 소개 정보 - 항상 표시 (없으면 "직접 고객") */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      소개자
                    </span>
                    <span className="text-sm">
                      {client.referredBy ? (
                        client.referredBy.name
                      ) : (
                        <span className="text-muted-foreground">직접 고객</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* 최근 연락 - 하단 고정 */}
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <span className="text-sm text-muted-foreground">
                    최근 연락
                  </span>
                  <span className="text-sm">
                    {formatDate(client.lastContactDate)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );

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
            className="cursor-pointer hover:bg-muted/50"
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
          <div>
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
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
            <div className="rounded-full bg-primary/10 p-4 sm:p-6 mb-4 sm:mb-6">
              <Users className="h-8 w-8 sm:h-12 sm:w-12 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
              검색 결과가 없습니다
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground text-center max-w-md mb-4 sm:mb-6">
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
