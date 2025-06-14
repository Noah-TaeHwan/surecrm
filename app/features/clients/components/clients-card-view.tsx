import { Badge } from '~/common/components/ui/badge';
import { formatCurrencyByUnit } from '~/lib/utils/currency';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Star } from 'lucide-react';

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

interface ClientsCardViewProps {
  data: ClientProfile[];
  onClientRowClick: (clientId: string) => void;
}

export function ClientsCardView({
  data,
  onClientRowClick,
}: ClientsCardViewProps) {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((client: ClientProfile) => {
        const cardStyle = getClientCardStyle(client.importance);

        return (
          <div key={client.id} className="relative">
            <Card
              className={`p-2 group hover:shadow-lg transition-all duration-200 ${cardStyle.bgGradient} ${cardStyle.borderClass} cursor-pointer hover:scale-[1.02] hover:-translate-y-1 h-[240px] flex flex-col relative overflow-hidden min-touch-target gap-2`}
              onClick={() => onClientRowClick(client.id)}
            >
              <CardHeader className="pb-0 flex-shrink-0 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
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
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <Badge
                      className={`${getImportanceBadgeColor(
                        client.importance
                      )} border text-xs font-medium px-1.5 py-0.5`}
                    >
                      {getImportanceText(client.importance)}
                    </Badge>
                    {client.importance === 'high' && (
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-0 flex-1 flex flex-col">
                {/* 중복 제거: CardHeader에 이미 이름/전화번호/중요도 표시됨 */}

                {/* 중앙: 핵심 정보 영역 - flex-1로 가변 높이 */}
                <div className="space-y-1.5 flex-1">
                  {/* 영업 단계 - 항상 표시 */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      영업 단계
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs px-1.5 py-0.5"
                      style={{ borderColor: client.currentStage.color }}
                    >
                      {client.currentStage.name}
                    </Badge>
                  </div>

                  {/* 보험 정보 - 항상 표시 (없으면 "미설정") */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      보험 종류
                    </span>
                    <span className="text-xs font-medium text-right">
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
                    <span className="text-xs text-muted-foreground">
                      총 보험료
                    </span>
                    <span className="text-xs font-semibold text-green-600">
                      {client.totalPremium > 0
                        ? formatCurrency(client.totalPremium)
                        : '미설정'}
                    </span>
                  </div>

                  {/* 소개 정보 - 항상 표시 (없으면 "직접 고객") */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      소개자
                    </span>
                    <span className="text-xs">
                      {client.referredBy ? (
                        client.referredBy.name
                      ) : (
                        <span className="text-muted-foreground">직접 고객</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* 최근 연락 - 하단 고정 */}
                <div className="flex items-center justify-between pt-1 border-t border-border/30">
                  <span className="text-xs text-muted-foreground">
                    최근 연락
                  </span>
                  <span className="text-xs">
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
}
