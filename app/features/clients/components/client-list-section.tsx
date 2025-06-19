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
import {
  Users,
  Plus,
  Star,
  Building2,
  DollarSign,
  TrendingUp,
  Clock,
  Network,
  Shield,
  ChevronRight,
} from 'lucide-react';
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
  viewMode: 'grid' | 'table';
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

  // �� 모바일 반응형 카드 뷰 렌더링 (영업 파이프라인 스타일 적용)
  const renderCardView = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredClients.map((client: ClientProfile) => {
          // 🎯 중요도별 스타일 (영업 파이프라인 패턴)
          const importanceStyles = {
            high: {
              bgGradient:
                'bg-gradient-to-br from-orange-50/50 to-white dark:from-orange-950/20 dark:to-background',
              badge: 'bg-primary text-primary-foreground',
              icon: 'text-orange-600',
              borderClass:
                'border-orange-200/50 dark:border-orange-800/30 hover:border-orange-300 dark:hover:border-orange-700',
            },
            medium: {
              bgGradient:
                'bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/20 dark:to-background',
              badge:
                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
              icon: 'text-blue-600',
              borderClass:
                'border-blue-200/50 dark:border-blue-800/30 hover:border-blue-300 dark:hover:border-blue-700',
            },
            low: {
              bgGradient:
                'bg-gradient-to-br from-muted/30 to-white dark:from-muted/10 dark:to-background',
              badge: 'bg-muted text-muted-foreground',
              icon: 'text-muted-foreground',
              borderClass: 'border-border/50 hover:border-border',
            },
          };

          const styles = importanceStyles[client.importance];

          return (
            <Card
              key={client.id}
              className={`relative group transition-all duration-200 cursor-pointer select-none ${
                styles.bgGradient
              } ${styles.borderClass} 
                hover:shadow-md hover:scale-[1.02] hover:-translate-y-1
                border backdrop-blur-sm overflow-hidden`}
              onClick={() => onClientRowClick(client.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* 🏷️ 이름 */}
                    <h3
                      className="font-semibold text-base leading-tight text-foreground truncate pr-2"
                      title={client.fullName}
                    >
                      {client.fullName}
                    </h3>

                    {/* 📱 연락처 정보 */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground truncate">
                        {client.phone}
                      </span>
                    </div>
                  </div>

                  {/* 🎯 중요도 배지 */}
                  <Badge
                    className={`${styles.badge} text-xs font-medium flex-shrink-0`}
                  >
                    {getImportanceText(client.importance)}
                  </Badge>
                </div>

                {/* 🏢 직업 정보 */}
                {client.occupation && (
                  <div className="flex items-center gap-2 mt-2">
                    <Building2 className={`h-3.5 w-3.5 ${styles.icon}`} />
                    <span className="text-sm text-muted-foreground truncate">
                      {client.occupation}
                    </span>
                  </div>
                )}
              </CardHeader>

              <CardContent className="pt-0 space-y-4">
                {/* 💰 성과 정보 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="h-3.5 w-3.5 text-green-600" />
                      <span className="text-xs text-muted-foreground">
                        월 보험료
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground text-center">
                      {client.totalPremium > 0 ? (
                        formatCurrency(client.totalPremium)
                      ) : (
                        <span className="text-muted-foreground">미설정</span>
                      )}
                    </p>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-3.5 w-3.5 text-blue-600" />
                      <span className="text-xs text-muted-foreground">
                        소개 실적
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground text-center">
                      {client.referralCount > 0 ? (
                        `${client.referralCount}명`
                      ) : (
                        <span className="text-muted-foreground">0명</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* 🎯 영업 단계 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        영업 단계
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: client.currentStage.color,
                        color: client.currentStage.color,
                      }}
                      className="text-xs"
                    >
                      {client.currentStage.name}
                    </Badge>
                  </div>

                  {/* ⏰ 마지막 연락일 */}
                  {client.lastContactDate && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          마지막 연락
                        </span>
                      </div>
                      <span className="text-xs font-medium text-foreground">
                        {formatDate(client.lastContactDate)}
                      </span>
                    </div>
                  )}
                </div>

                {/* 🔗 소개자 정보 */}
                {client.referredBy && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg">
                    <Network className="h-3.5 w-3.5 text-blue-600" />
                    <span className="text-xs text-blue-700 dark:text-blue-300 truncate">
                      {client.referredBy.name} 소개
                    </span>
                  </div>
                )}

                {/* 🏥 보험 유형 */}
                {client.insuranceTypes && client.insuranceTypes.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        보험 관심사
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      {client.insuranceTypes.slice(0, 2).map((type, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs bg-accent/20 text-foreground"
                        >
                          {type}
                        </Badge>
                      ))}
                      {client.insuranceTypes.length > 2 && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-muted/30 text-muted-foreground"
                          title={`추가 보험: ${client.insuranceTypes
                            .slice(2)
                            .join(', ')}`}
                        >
                          +{client.insuranceTypes.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* 🎯 액션 버튼 - 상세보기 */}
                <div className="pt-1">
                  <div
                    className="flex items-center justify-center gap-2 w-full p-2 text-sm text-primary hover:text-primary/80 hover:bg-primary/5 rounded-lg transition-colors group/link"
                    onClick={e => {
                      e.stopPropagation();
                      onClientRowClick(client.id);
                    }}
                  >
                    <span>상세보기</span>
                    <ChevronRight className="h-3.5 w-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
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
            <p className="text-sm text-muted-foreground pb-4">
              {viewMode === 'grid'
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
        ) : viewMode === 'grid' ? (
          renderCardView()
        ) : (
          renderTableView()
        )}
      </CardContent>
    </Card>
  );
}
