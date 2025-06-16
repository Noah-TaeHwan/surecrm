import { memo } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  User,
  TrendingUp,
  Tag,
  Calendar,
  Star,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import { Link } from 'react-router';
import { ReferralDepthIndicator } from './referral-depth-indicator';
import { insuranceTypeIcons, insuranceTypeText } from './insurance-config';
import type { ClientDisplay } from '~/features/clients/types';
import { typeHelpers } from '~/features/clients/types';
import { Button } from '~/common/components/ui/button';
import { cn } from '~/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// 🎯 ClientCard를 위한 타입 정의
export interface ClientCardData {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  address?: string;
  occupation?: string;
  importance: 'high' | 'medium' | 'low';
  tags?: string[];
  currentStage?: {
    id: string;
    name: string;
    color: string;
  };
  totalPremium?: number;
  lastContactDate?: string;
  nextActionDate?: string;
  upcomingMeeting?: {
    date: string;
    type: string;
  };
  engagementScore?: number;
  conversionProbability?: number;
  referralCount?: number;
  referredBy?: {
    id: string;
    name: string;
    relationship: string;
  };
  createdAt?: Date;
}

// 🎯 Props 타입 정의
interface ClientCardProps {
  client: ClientCardData;
  onClick?: (clientId: string) => void;
  onEdit?: (e: React.MouseEvent, client: ClientCardData) => void;
  onDelete?: (e: React.MouseEvent, client: ClientCardData) => void;
  className?: string;
  isSelected?: boolean;
}

// 🎯 중요도별 색상 매핑 (SureCRM 프라이머리 컬러 활용)
const IMPORTANCE_CONFIG = {
  high: {
    label: '키맨',
    className: 'bg-primary text-primary-foreground',
    icon: Star,
  },
  medium: {
    label: '일반',
    className:
      'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    icon: User,
  },
  low: {
    label: '관찰',
    className:
      'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    icon: TrendingUp,
  },
} as const;

// 🎯 금액 포맷팅 함수 (한국 원화)
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0,
  }).format(amount);
};

// 🎯 날짜 포맷팅 함수
const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), 'M월 d일', { locale: ko });
  } catch {
    return dateString;
  }
};

/**
 * 🎯 ClientCard 컴포넌트
 * - 모바일 반응형 최적화
 * - tel/mailto 링크 지원
 * - SureCRM 프라이머리 컬러 적용
 * - 접근성 완전 지원
 * - 터치 최적화
 */
export const ClientCard = memo(function ClientCard({
  client,
  onClick,
  onEdit,
  onDelete,
  className,
  isSelected = false,
}: ClientCardProps) {
  // 🎯 카드 클릭 핸들러
  const handleCardClick = () => {
    onClick?.(client.id);
  };

  // 🎯 편집 버튼 클릭 핸들러 (이벤트 버블링 방지)
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(e, client);
  };

  // 🎯 삭제 버튼 클릭 핸들러 (이벤트 버블링 방지)
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(e, client);
  };

  // 🎯 전화 걸기 핸들러 (이벤트 버블링 방지)
  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (client.phone) {
      const phoneNumber = client.phone.replace(/[^0-9+]/g, '');
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  // 🎯 이메일 보내기 핸들러 (이벤트 버블링 방지)
  const handleEmailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (client.email) {
      window.location.href = `mailto:${client.email}`;
    }
  };

  // 🎯 키보드 접근성 핸들러
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  const importanceConfig = IMPORTANCE_CONFIG[client.importance];
  const ImportanceIcon = importanceConfig.icon;

  return (
    <Card
      className={cn(
        'relative cursor-pointer transition-all duration-200',
        'hover:shadow-md hover:scale-[1.02]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'touch-manipulation', // 터치 최적화
        isSelected && 'ring-2 ring-primary shadow-lg',
        className
      )}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${client.fullName} 고객 정보`}
      aria-pressed={isSelected}
    >
      <CardContent className="p-4 space-y-3">
        {/* 🎯 헤더 영역 - 이름과 중요도 */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground truncate">
              {client.fullName}
            </h3>
            {client.occupation && (
              <p className="text-sm text-muted-foreground truncate">
                {client.occupation}
              </p>
            )}
          </div>

          {/* 중요도 배지 */}
          <Badge
            variant="secondary"
            className={cn(
              'flex items-center gap-1 text-xs font-medium',
              importanceConfig.className
            )}
          >
            <ImportanceIcon className="h-3 w-3" aria-hidden="true" />
            {importanceConfig.label}
          </Badge>
        </div>

        {/* 🎯 연락처 정보 */}
        <div className="space-y-2">
          {client.phone && (
            <div className="flex items-center gap-2">
              <Phone
                className="h-4 w-4 text-muted-foreground flex-shrink-0"
                aria-hidden="true"
              />
              <Button
                variant="link"
                className="h-auto p-0 text-sm text-foreground hover:text-primary focus-visible:ring-1 focus-visible:ring-primary"
                onClick={handlePhoneClick}
                aria-label={`${client.fullName}에게 전화걸기`}
              >
                {client.phone}
              </Button>
            </div>
          )}

          {client.email && (
            <div className="flex items-center gap-2">
              <Mail
                className="h-4 w-4 text-muted-foreground flex-shrink-0"
                aria-hidden="true"
              />
              <Button
                variant="link"
                className="h-auto p-0 text-sm text-foreground hover:text-primary focus-visible:ring-1 focus-visible:ring-primary"
                onClick={handleEmailClick}
                aria-label={`${client.fullName}에게 이메일 보내기`}
              >
                {client.email}
              </Button>
            </div>
          )}

          {client.address && (
            <div className="flex items-center gap-2">
              <MapPin
                className="h-4 w-4 text-muted-foreground flex-shrink-0"
                aria-hidden="true"
              />
              <span className="text-sm text-muted-foreground truncate">
                {client.address}
              </span>
            </div>
          )}
        </div>

        {/* 🎯 현재 단계 */}
        {client.currentStage && (
          <div className="flex items-center gap-2">
            <TrendingUp
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
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
        )}

        {/* 🎯 태그 */}
        {client.tags && client.tags.length > 0 && (
          <div className="flex items-center gap-2">
            <Tag
              className="h-4 w-4 text-muted-foreground flex-shrink-0"
              aria-hidden="true"
            />
            <div className="flex flex-wrap gap-1">
              {client.tags.slice(0, 3).map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs bg-muted text-muted-foreground"
                >
                  {tag}
                </Badge>
              ))}
              {client.tags.length > 3 && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-muted text-muted-foreground"
                >
                  +{client.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* 🎯 하단 정보 영역 */}
        <div className="pt-2 border-t border-border space-y-2">
          {/* 보험료 정보 */}
          {client.totalPremium && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">월 보험료</span>
              <span className="text-sm font-medium text-foreground">
                {formatCurrency(client.totalPremium)}
              </span>
            </div>
          )}

          {/* 다음 액션 */}
          {client.nextActionDate && (
            <div className="flex items-center gap-2">
              <Calendar
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="text-sm text-muted-foreground">
                다음 연락: {formatDate(client.nextActionDate)}
              </span>
            </div>
          )}

          {/* 예정된 미팅 */}
          {client.upcomingMeeting && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
              <span className="text-sm text-primary font-medium">
                {formatDate(client.upcomingMeeting.date)} -{' '}
                {client.upcomingMeeting.type}
              </span>
            </div>
          )}

          {/* 성과 지표 */}
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            {client.engagementScore && (
              <span>참여도: {client.engagementScore}/10</span>
            )}
            {client.conversionProbability && (
              <span>전환율: {client.conversionProbability}%</span>
            )}
            {client.referralCount && (
              <span>소개: {client.referralCount}명</span>
            )}
          </div>
        </div>

        {/* 🎯 액션 버튼들 (선택적) */}
        {(onEdit || onDelete) && (
          <div className="flex gap-2 pt-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditClick}
                className="flex-1 h-8 text-xs"
                aria-label={`${client.fullName} 편집`}
              >
                편집
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteClick}
                className="flex-1 h-8 text-xs text-destructive hover:text-destructive"
                aria-label={`${client.fullName} 삭제`}
              >
                삭제
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default ClientCard;
