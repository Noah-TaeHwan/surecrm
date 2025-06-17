import { useState, useRef, useCallback } from 'react';
import { Badge } from '~/common/components/ui/badge';
import { Button } from '~/common/components/ui/button';
import { Card, CardContent, CardHeader } from '~/common/components/ui/card';
import { formatCurrencyTable } from '~/lib/utils/currency';
import {
  Calendar,
  Users,
  Briefcase,
  User,
  GripVertical,
  Timer,
  Phone,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Clock,
  Building2,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  ChevronRight,
  PhoneCall,
  Archive,
  Mail,
  MapPin,
  Smartphone,
  Scale,
  Ruler,
  Car,
  Heart,
  Shield,
  Tag,
  StickyNote,
  Network,
  Edit3,
  Trash2,
  Star,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { Link } from 'react-router';
import type { InsuranceInfo } from '~/features/pipeline/types/types';

// 🎯 DealCard Props
interface DealCardProps {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  occupation?: string;
  importance: 'high' | 'medium' | 'low';
  tags?: string;
  notes?: string;
  createdAt: string;
  lastContactDate?: string;
  referredBy?: string;
  insuranceInfo?: InsuranceInfo;
  interestCategories?: string[];
  isDragging?: boolean;
  
  // 🎯 딜 특화 정보
  products?: Array<{
    name: string;
    monthlyPremium: number;
    expectedCommission: number;
  }>;
  totalMonthlyPremium?: number;
  totalExpectedCommission?: number;
  dealValue?: number;
  probability?: number; // 성사 확률 0-100
  nextAction?: string;
  actionDueDate?: string;
  
  // 🎯 액션 핸들러들
  onRemoveFromPipeline?: (clientId: string) => void;
  onCreateContract?: (clientId: string) => void;
  onEditOpportunity?: (clientId: string) => void;
  onQuickEdit?: (clientId: string) => void;
  onArchive?: (clientId: string) => void;
  onSetPriority?: (clientId: string, priority: 'high' | 'medium' | 'low') => void;
}

// 🎯 스와이프 상태 인터페이스
interface SwipeState {
  startX: number;
  currentX: number;
  isDragging: boolean;
  swipeDirection: 'left' | 'right' | null;
  showActions: boolean;
}

export function DealCard({
  id,
  name,
  phone,
  email,
  address,
  occupation,
  importance,
  tags,
  notes,
  createdAt,
  lastContactDate,
  referredBy,
  insuranceInfo,
  interestCategories = [],
  isDragging = false,
  products = [],
  totalMonthlyPremium = 0,
  totalExpectedCommission = 0,
  dealValue = 0,
  probability = 0,
  nextAction,
  actionDueDate,
  onRemoveFromPipeline,
  onCreateContract,
  onEditOpportunity,
  onQuickEdit,
  onArchive,
  onSetPriority,
}: DealCardProps) {
  // 🎯 스와이프 상태 관리
  const [swipeState, setSwipeState] = useState<SwipeState>({
    startX: 0,
    currentX: 0,
    isDragging: false,
    swipeDirection: null,
    showActions: false,
  });

  const cardRef = useRef<HTMLDivElement>(null);
  const swipeThreshold = 80; // 스와이프 인식 임계값

  // 🎯 중요도별 스타일
  const importanceStyles = {
    high: {
      bgGradient: 'bg-gradient-to-br from-orange-50/80 to-white dark:from-orange-950/30 dark:to-background',
      badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      icon: 'text-orange-600',
      borderClass: 'border-orange-200/50 dark:border-orange-800/30',
      priority: '높음',
    },
    medium: {
      bgGradient: 'bg-gradient-to-br from-blue-50/80 to-white dark:from-blue-950/30 dark:to-background',
      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      icon: 'text-blue-600',
      borderClass: 'border-blue-200/50 dark:border-blue-800/30',
      priority: '보통',
    },
    low: {
      bgGradient: 'bg-gradient-to-br from-muted/50 to-white dark:from-muted/20 dark:to-background',
      badge: 'bg-muted text-muted-foreground',
      icon: 'text-muted-foreground',
      borderClass: 'border-muted/50',
      priority: '낮음',
    },
  };

  const styles = importanceStyles[importance];

  // 🎯 스와이프 이벤트 핸들러들
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isDragging) return; // 드래그 중이면 스와이프 비활성화
    
    const touch = e.touches[0];
    setSwipeState(prev => ({
      ...prev,
      startX: touch.clientX,
      currentX: touch.clientX,
      isDragging: true,
      swipeDirection: null,
    }));
  }, [isDragging]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swipeState.isDragging || isDragging) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - swipeState.startX;
    
    setSwipeState(prev => ({
      ...prev,
      currentX: touch.clientX,
      swipeDirection: deltaX > 0 ? 'right' : 'left',
    }));

    // 카드 변형 적용
    if (cardRef.current) {
      const clampedDelta = Math.max(-150, Math.min(150, deltaX));
      cardRef.current.style.transform = `translateX(${clampedDelta}px)`;
      cardRef.current.style.opacity = `${1 - Math.abs(clampedDelta) / 300}`;
    }
  }, [swipeState.isDragging, swipeState.startX, isDragging]);

  const handleTouchEnd = useCallback(() => {
    if (!swipeState.isDragging || isDragging) return;
    
    const deltaX = swipeState.currentX - swipeState.startX;
    const absDelataX = Math.abs(deltaX);

    // 스와이프 액션 실행
    if (absDelataX > swipeThreshold) {
      // 햅틱 피드백
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      if (swipeState.swipeDirection === 'right') {
        // 오른쪽 스와이프: 빠른 편집
        onQuickEdit?.(id);
      } else if (swipeState.swipeDirection === 'left') {
        // 왼쪽 스와이프: 액션 메뉴 표시
        setSwipeState(prev => ({ ...prev, showActions: true }));
      }
    }

    // 카드 위치 복원
    if (cardRef.current) {
      cardRef.current.style.transform = '';
      cardRef.current.style.opacity = '';
    }

    setSwipeState({
      startX: 0,
      currentX: 0,
      isDragging: false,
      swipeDirection: null,
      showActions: swipeState.showActions,
    });
  }, [swipeState, isDragging, onQuickEdit, id]);

  // 🎯 계산된 값들
  const daysInPipeline = Math.floor(
    (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  const daysSinceLastContact = lastContactDate 
    ? Math.floor((new Date().getTime() - new Date(lastContactDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const isUrgent = daysSinceLastContact !== null && daysSinceLastContact >= 7;
  const isStale = daysInPipeline >= 30;

  const actionOverdue = actionDueDate && new Date(actionDueDate) < new Date();

  return (
    <div className="relative">
      {/* 🎯 스와이프 액션 메뉴 */}
      {swipeState.showActions && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm border rounded-lg p-2 z-10 flex items-center justify-around">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onEditOpportunity?.(id);
              setSwipeState(prev => ({ ...prev, showActions: false }));
            }}
            className="flex flex-col items-center gap-1"
          >
            <Edit3 className="h-4 w-4" />
            <span className="text-xs">편집</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSetPriority?.(id, importance === 'high' ? 'medium' : 'high');
              setSwipeState(prev => ({ ...prev, showActions: false }));
            }}
            className="flex flex-col items-center gap-1"
          >
            <Star className="h-4 w-4" />
            <span className="text-xs">우선순위</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onArchive?.(id);
              setSwipeState(prev => ({ ...prev, showActions: false }));
            }}
            className="flex flex-col items-center gap-1"
          >
            <Archive className="h-4 w-4" />
            <span className="text-xs">보관</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSwipeState(prev => ({ ...prev, showActions: false }))}
            className="flex flex-col items-center gap-1 text-muted-foreground"
          >
            <ArrowRight className="h-4 w-4" />
            <span className="text-xs">닫기</span>
          </Button>
        </div>
      )}

      {/* 🎯 메인 딜 카드 */}
      <Card
        ref={cardRef}
        className={`mb-4 relative group transition-all duration-200 select-none ${
          styles.bgGradient
        } ${styles.borderClass} ${
          isDragging
            ? 'shadow-xl opacity-95 transform rotate-1 scale-105 z-50 ring-2 ring-primary/30 border-primary/50'
            : 'hover:shadow-md hover:scale-[1.02] hover:-translate-y-1'
        } border backdrop-blur-sm overflow-hidden`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          touchAction: isDragging ? 'none' : 'auto',
        }}
      >
        {/* 🎯 드래그 핸들 */}
        <div className="absolute top-2 right-2 opacity-30 group-hover:opacity-60 transition-opacity">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* 🎯 긴급/지연 인디케이터 */}
        {(isUrgent || isStale || actionOverdue) && (
          <div className="absolute top-2 left-2">
            <Badge variant="destructive" className="text-xs flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {actionOverdue ? '액션 지연' : isUrgent ? '연락 필요' : '장기 체류'}
            </Badge>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              {/* 🎯 클라이언트 이름 및 중요도 */}
              <div className="flex items-center gap-2 mb-2">
                <Link
                  to={`/clients/${id}`}
                  className="font-semibold text-card-foreground hover:text-primary transition-colors truncate"
                >
                  {name}
                </Link>
                <Badge className={`text-xs ${styles.badge}`}>
                  {styles.priority}
                </Badge>
              </div>

              {/* 🎯 연락처 정보 */}
              <div className="space-y-1 text-sm text-muted-foreground">
                {phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    <a
                      href={`tel:${phone}`}
                      className="hover:text-primary transition-colors"
                    >
                      {phone}
                    </a>
                  </div>
                )}
                {email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    <a
                      href={`mailto:${email}`}
                      className="hover:text-primary transition-colors truncate"
                    >
                      {email}
                    </a>
                  </div>
                )}
                {occupation && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-3 w-3" />
                    <span className="truncate">{occupation}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 🎯 성사 확률 */}
            {probability > 0 && (
              <div className="flex flex-col items-center">
                <div className={`text-lg font-bold ${styles.icon}`}>
                  {probability}%
                </div>
                <div className="text-xs text-muted-foreground">성사율</div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* 🎯 딜 정보 */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* 거래 가치 */}
            <div className="text-center p-2 bg-muted/30 rounded-md">
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign className="h-3 w-3 text-green-600" />
                <span className="text-xs text-muted-foreground">거래가치</span>
              </div>
              <div className="font-semibold text-sm text-green-600">
                {dealValue > 0 ? formatCurrencyTable(dealValue) : formatCurrencyTable(totalMonthlyPremium * 12)}
              </div>
            </div>

            {/* 예상 수수료 */}
            <div className="text-center p-2 bg-muted/30 rounded-md">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="h-3 w-3 text-blue-600" />
                <span className="text-xs text-muted-foreground">예상수수료</span>
              </div>
              <div className="font-semibold text-sm text-blue-600">
                {formatCurrencyTable(totalExpectedCommission)}
              </div>
            </div>
          </div>

          {/* 🎯 다음 액션 */}
          {nextAction && (
            <div className="mb-3 p-2 bg-primary/5 border border-primary/20 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-3 w-3 text-primary" />
                <span className="text-xs font-medium text-primary">다음 액션</span>
                {actionDueDate && (
                  <span className={`text-xs ${actionOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {new Date(actionDueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="text-sm text-foreground">{nextAction}</p>
            </div>
          )}

          {/* 🎯 파이프라인 통계 */}
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{daysInPipeline}일 체류</span>
            </div>
            {daysSinceLastContact !== null && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{daysSinceLastContact}일 전 연락</span>
              </div>
            )}
          </div>

          {/* 🎯 태그 */}
          {tags && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.split(',').slice(0, 2).map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs px-2 py-0"
                >
                  {tag.trim()}
                </Badge>
              ))}
              {tags.split(',').length > 2 && (
                <Badge variant="secondary" className="text-xs px-2 py-0">
                  +{tags.split(',').length - 2}
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        {/* 🎯 스와이프 힌트 */}
        {!swipeState.showActions && (
          <div className="absolute bottom-1 right-1 opacity-20 text-xs text-muted-foreground">
            ←→
          </div>
        )}
      </Card>
    </div>
  );
}
