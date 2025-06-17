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
  Edit3,
  Trash2,
  Archive,
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
import { useRef, useState, useEffect } from 'react';

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
  onArchive?: (e: React.MouseEvent, client: ClientCardData) => void;
  onCall?: (e: React.MouseEvent, client: ClientCardData) => void;
  onEmail?: (e: React.MouseEvent, client: ClientCardData) => void;
  className?: string;
  isSelected?: boolean;
  enableSwipe?: boolean; // 스와이프 기능 활성화 여부
}

// 🎯 스와이프 방향 타입 정의
type SwipeDirection = 'left' | 'right' | null;

// 🎯 스와이프 액션 구성
interface SwipeAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  onClick: (e: React.MouseEvent, client: ClientCardData) => void;
}

// 🎯 스와이프 설정
const SWIPE_THRESHOLD = 80; // 스와이프 인식 임계값 (px)
const SWIPE_RESET_THRESHOLD = 20; // 스와이프 리셋 임계값 (px)

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
  onArchive,
  onCall,
  onEmail,
  className,
  isSelected = false,
  enableSwipe = false,
}: ClientCardProps) {
  // 🎯 카드 클릭 핸들러
  const handleCardClick = () => {
    if (!isSwipeActive) {
      onClick?.(client.id);
    }
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

  // 🎯 스와이프 상태 관리
  const cardRef = useRef<HTMLDivElement>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 터치 시작 위치 추적
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const initialOffset = useRef(0);

  // 🎯 스와이프 액션 구성
  const leftSwipeActions: SwipeAction[] = [
    ...(onCall
      ? [
          {
            id: 'call',
            label: '전화',
            icon: Phone,
            color: 'bg-green-500 text-white',
            onClick: onCall,
          },
        ]
      : []),
    ...(onEmail
      ? [
          {
            id: 'email',
            label: '이메일',
            icon: Mail,
            color: 'bg-blue-500 text-white',
            onClick: onEmail,
          },
        ]
      : []),
    ...(onEdit
      ? [
          {
            id: 'edit',
            label: '편집',
            icon: Edit3,
            color: 'bg-orange-500 text-white',
            onClick: onEdit,
          },
        ]
      : []),
  ];

  const rightSwipeActions: SwipeAction[] = [
    ...(onArchive
      ? [
          {
            id: 'archive',
            label: '보관',
            icon: Archive,
            color: 'bg-yellow-500 text-white',
            onClick: onArchive,
          },
        ]
      : []),
    ...(onDelete
      ? [
          {
            id: 'delete',
            label: '삭제',
            icon: Trash2,
            color: 'bg-red-500 text-white',
            onClick: onDelete,
          },
        ]
      : []),
  ];

  // 🎯 터치 시작 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableSwipe) return;

    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    initialOffset.current = swipeOffset;
    setIsDragging(true);
  };

  // 🎯 터치 이동 핸들러
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!enableSwipe || !isDragging) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    // 수직 스크롤이 더 큰 경우 스와이프 무시
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      return;
    }

    // 수평 스와이프 처리
    e.preventDefault();

    const newOffset = initialOffset.current + deltaX;
    const maxLeftOffset = leftSwipeActions.length * 80;
    const maxRightOffset = rightSwipeActions.length * 80;

    // 오프셋 제한
    const constrainedOffset = Math.max(
      -maxRightOffset,
      Math.min(maxLeftOffset, newOffset)
    );

    setSwipeOffset(constrainedOffset);
    setIsSwipeActive(Math.abs(constrainedOffset) > SWIPE_RESET_THRESHOLD);

    // 스와이프 방향 설정
    if (constrainedOffset > SWIPE_RESET_THRESHOLD) {
      setSwipeDirection('left');
    } else if (constrainedOffset < -SWIPE_RESET_THRESHOLD) {
      setSwipeDirection('right');
    } else {
      setSwipeDirection(null);
    }
  };

  // 🎯 터치 끝 핸들러
  const handleTouchEnd = () => {
    if (!enableSwipe || !isDragging) return;

    setIsDragging(false);

    // 임계값 확인 후 스냅 처리
    if (Math.abs(swipeOffset) < SWIPE_THRESHOLD) {
      // 임계값 미달 시 원위치
      setSwipeOffset(0);
      setIsSwipeActive(false);
      setSwipeDirection(null);
    } else {
      // 임계값 이상 시 액션 영역으로 스냅
      const maxLeftOffset = leftSwipeActions.length * 80;
      const maxRightOffset = rightSwipeActions.length * 80;

      if (swipeOffset > 0) {
        setSwipeOffset(Math.min(maxLeftOffset, SWIPE_THRESHOLD));
      } else {
        setSwipeOffset(Math.max(-maxRightOffset, -SWIPE_THRESHOLD));
      }
    }
  };

  // 🎯 마우스 이벤트 핸들러 (데스크톱 지원)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!enableSwipe) return;

    touchStartX.current = e.clientX;
    touchStartY.current = e.clientY;
    initialOffset.current = swipeOffset;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!enableSwipe || !isDragging) return;

    const deltaX = e.clientX - touchStartX.current;
    const deltaY = e.clientY - touchStartY.current;

    if (Math.abs(deltaY) > Math.abs(deltaX)) return;

    const newOffset = initialOffset.current + deltaX;
    const maxLeftOffset = leftSwipeActions.length * 80;
    const maxRightOffset = rightSwipeActions.length * 80;

    const constrainedOffset = Math.max(
      -maxRightOffset,
      Math.min(maxLeftOffset, newOffset)
    );

    setSwipeOffset(constrainedOffset);
    setIsSwipeActive(Math.abs(constrainedOffset) > SWIPE_RESET_THRESHOLD);

    if (constrainedOffset > SWIPE_RESET_THRESHOLD) {
      setSwipeDirection('left');
    } else if (constrainedOffset < -SWIPE_RESET_THRESHOLD) {
      setSwipeDirection('right');
    } else {
      setSwipeDirection(null);
    }
  };

  const handleMouseUp = () => {
    if (!enableSwipe || !isDragging) return;

    setIsDragging(false);

    if (Math.abs(swipeOffset) < SWIPE_THRESHOLD) {
      setSwipeOffset(0);
      setIsSwipeActive(false);
      setSwipeDirection(null);
    } else {
      const maxLeftOffset = leftSwipeActions.length * 80;
      const maxRightOffset = rightSwipeActions.length * 80;

      if (swipeOffset > 0) {
        setSwipeOffset(Math.min(maxLeftOffset, SWIPE_THRESHOLD));
      } else {
        setSwipeOffset(Math.max(-maxRightOffset, -SWIPE_THRESHOLD));
      }
    }
  };

  // 🎯 외부 클릭 시 스와이프 리셋
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setSwipeOffset(0);
        setIsSwipeActive(false);
        setSwipeDirection(null);
      }
    };

    if (isSwipeActive) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSwipeActive]);

  // 🎯 스와이프 액션 핸들러
  const handleSwipeActionClick = (action: SwipeAction, e: React.MouseEvent) => {
    e.stopPropagation();
    action.onClick(e, client);
    // 액션 실행 후 스와이프 상태 리셋
    setSwipeOffset(0);
    setIsSwipeActive(false);
    setSwipeDirection(null);
  };

  return (
    <Card
      ref={cardRef}
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
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <CardContent
        className={cn('p-4 space-y-3', 'transition-transform duration-200', {
          'translate-x-0': !swipeOffset,
          'translate-x-[-80px]': swipeOffset > 0,
          'translate-x-[80px]': swipeOffset < 0,
        })}
        style={{
          transform: `translateX(${swipeOffset}px)`,
        }}
      >
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
        {(onEdit || onDelete || onArchive || onCall || onEmail) && (
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
            {onArchive && (
              <Button
                variant="outline"
                size="sm"
                onClick={e => onArchive?.(e, client)}
                className="flex-1 h-8 text-xs"
                aria-label={`${client.fullName} 보관`}
              >
                보관
              </Button>
            )}
            {onCall && (
              <Button
                variant="outline"
                size="sm"
                onClick={e => onCall?.(e, client)}
                className="flex-1 h-8 text-xs"
                aria-label={`${client.fullName}에게 전화걸기`}
              >
                전화
              </Button>
            )}
            {onEmail && (
              <Button
                variant="outline"
                size="sm"
                onClick={e => onEmail?.(e, client)}
                className="flex-1 h-8 text-xs"
                aria-label={`${client.fullName}에게 이메일 보내기`}
              >
                이메일
              </Button>
            )}
          </div>
        )}
      </CardContent>

      {/* 🎯 스와이프 액션 영역 */}
      <div
        className={cn(
          'absolute top-0 left-0 w-full h-full flex justify-end',
          'transition-transform duration-200',
          {
            'translate-x-0': !swipeOffset,
            'translate-x-[-80px]': swipeOffset > 0,
            'translate-x-[80px]': swipeOffset < 0,
          }
        )}
        style={{
          transform: `translateX(${swipeOffset}px)`,
        }}
      >
        {swipeDirection === 'left' &&
          leftSwipeActions.map(action => (
            <Button
              key={action.id}
              variant="default"
              size="lg"
              className={cn('flex-1 h-full text-lg font-medium', action.color)}
              onClick={e => handleSwipeActionClick(action, e)}
              aria-label={action.label}
            >
              <action.icon className="h-6 w-6" aria-hidden="true" />
            </Button>
          ))}
        {swipeDirection === 'right' &&
          rightSwipeActions.map(action => (
            <Button
              key={action.id}
              variant="default"
              size="lg"
              className={cn('flex-1 h-full text-lg font-medium', action.color)}
              onClick={e => handleSwipeActionClick(action, e)}
              aria-label={action.label}
            >
              <action.icon className="h-6 w-6" aria-hidden="true" />
            </Button>
          ))}
      </div>
    </Card>
  );
});

export default ClientCard;
