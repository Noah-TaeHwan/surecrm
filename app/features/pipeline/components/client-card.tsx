import { useState } from 'react';
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
} from 'lucide-react';
import { Link } from 'react-router';
import type { InsuranceInfo } from '~/features/pipeline/types/types';

// 🎨 매직UI 컴포넌트 import
const BorderBeam = ({
  size = 200,
  duration = 15,
  delay = 0,
}: {
  size?: number;
  duration?: number;
  delay?: number;
}) => {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
      <div
        className="absolute inset-0 animate-border-beam"
        style={{
          background: `conic-gradient(from 0deg, 
            transparent 0deg, 
            transparent 90deg, 
            oklch(0.645 0.246 16.439) 180deg,
            oklch(0.769 0.188 70.08) 270deg,
            transparent 360deg
          )`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          maskImage: `
            linear-gradient(white, white),
            linear-gradient(white, white)
          `,
          maskClip: 'padding-box, border-box',
          maskComposite: 'intersect',
          padding: '1px',
        }}
      >
        <div className="h-full w-full rounded-[inherit] bg-card" />
      </div>
      {/* 🌟 추가적인 Glow 효과 */}
      <div
        className="absolute inset-0 animate-border-beam opacity-50"
        style={{
          background: `conic-gradient(from 0deg, 
            transparent 0deg, 
            transparent 45deg, 
            oklch(0.645 0.246 16.439) 135deg,
            oklch(0.769 0.188 70.08) 225deg,
            transparent 315deg,
            transparent 360deg
          )`,
          animationDuration: `${duration * 1.5}s`,
          animationDelay: `${delay + 1}s`,
          filter: 'blur(4px)',
          zIndex: -1,
        }}
      />
    </div>
  );
};

interface ClientCardProps {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  occupation?: string;
  telecomProvider?: string;
  height?: number;
  weight?: number;
  hasDrivingLicense?: boolean;
  hasHealthIssues?: boolean;
  importance: 'high' | 'medium' | 'low';
  tags?: string;
  notes?: string;
  createdAt: string;
  lastContactDate?: string;
  referredBy?: {
    id: string;
    name: string;
  };
  insuranceInfo?: InsuranceInfo;
  interestCategories?: Array<{ label: string; icon: string }>;
  isDragging?: boolean;
  onRemoveFromPipeline?: (clientId: string, clientName: string) => void;
  onCreateContract?: (
    clientId: string,
    clientName: string,
    products: any[]
  ) => void; // 🏢 계약 전환 핸들러
  onEditOpportunity?: (clientId: string, clientName: string) => void; // 🏢 영업 기회 편집 핸들러
  // 🆕 실제 상품 정보 필드들
  products?: Array<{
    id: string;
    productName: string;
    insuranceCompany: string;
    insuranceType: string;
    monthlyPremium?: string;
    expectedCommission?: string;
    notes?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>;
  totalMonthlyPremium?: number;
  totalExpectedCommission?: number;
}

export function ClientCard({
  id,
  name,
  phone,
  email,
  address,
  occupation,
  telecomProvider,
  height,
  weight,
  hasDrivingLicense,
  hasHealthIssues,
  importance,
  tags,
  notes,
  createdAt,
  lastContactDate,
  referredBy,
  insuranceInfo,
  interestCategories = [],
  isDragging = false,
  onRemoveFromPipeline,
  onCreateContract, // 🏢 계약 전환 핸들러
  onEditOpportunity, // 🏢 영업 기회 편집 핸들러
  // 🆕 실제 상품 정보 필드들
  products = [],
  totalMonthlyPremium = 0,
  totalExpectedCommission = 0,
}: ClientCardProps) {
  // 🎯 중요도별 스타일 (왼쪽 보더 제거)
  const importanceStyles = {
    high: {
      bgGradient:
        'bg-gradient-to-br from-orange-50/50 to-white dark:from-orange-950/20 dark:to-background',
      badge:
        'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      icon: 'text-orange-600',
      borderClass: 'client-card-keyman', // 키맨 전용 애니메이션 클래스
    },
    medium: {
      bgGradient:
        'bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/20 dark:to-background',
      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      icon: 'text-blue-600',
      borderClass: 'client-card-normal', // 일반 고객 은은한 효과
    },
    low: {
      bgGradient:
        'bg-gradient-to-br from-muted/30 to-white dark:from-muted/10 dark:to-background',
      badge: 'bg-muted text-muted-foreground',
      icon: 'text-muted-foreground',
      borderClass: 'client-card-low', // 은은한 회색 효과
    },
  };

  const styles = importanceStyles[importance];

  // 📊 실제 월 보험료 (실제 데이터만 사용)
  const getMonthlyPremium = () => {
    return totalMonthlyPremium > 0 ? totalMonthlyPremium : 0;
  };

  // 💰 실제 계약 수수료 (실제 데이터만 사용)
  const getContractCommission = () => {
    return totalExpectedCommission > 0 ? totalExpectedCommission : 0;
  };

  // ⏰ 파이프라인 체류 기간 계산
  const getDaysInPipeline = () => {
    const created = new Date(createdAt);
    const now = new Date();
    return Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  // 📅 마지막 상담일 계산
  const getDaysSinceLastConsultation = () => {
    if (!lastContactDate) return null;
    const lastContact = new Date(lastContactDate);
    const now = new Date();
    return Math.floor(
      (now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const daysInPipeline = getDaysInPipeline();
  const daysSinceLastConsultation = getDaysSinceLastConsultation();
  const monthlyPremium = getMonthlyPremium();
  const contractCommission = getContractCommission();

  // 🚨 긴급도 표시 (7일 이상 상담 없음)
  const isUrgent =
    daysSinceLastConsultation !== null && daysSinceLastConsultation >= 7;
  const isStale = daysInPipeline >= 30; // 30일 이상 체류

  return (
    <div className="relative">
      <Card
        className={`mb-4 relative group transition-all duration-200 select-none ${
          styles.bgGradient
        } ${styles.borderClass} ${
          isDragging
            ? 'shadow-xl opacity-95 transform rotate-1 scale-105 z-50 ring-2 ring-primary/30 border-primary/50'
            : 'hover:shadow-md hover:scale-[1.02] hover:-translate-y-1'
        } border-border/50 backdrop-blur-sm overflow-hidden`}
      >
        {/* 🎯 드래그 핸들 */}
        {!isDragging && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"></div>
        )}

        <CardHeader className="pb-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* 🏷️ 이름 (텍스트 오버플로우 수정) */}
              <h3
                className="font-semibold text-base leading-tight text-foreground truncate pr-8"
                title={name}
              >
                {name}
              </h3>

              {/* 📱 연락처 정보 */}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground truncate">
                  {phone}
                </span>
              </div>
            </div>

            {/* 🎯 중요도 배지 */}
            <Badge
              className={`${styles.badge} text-xs font-medium flex-shrink-0`}
            >
              {importance === 'high'
                ? '키맨'
                : importance === 'medium'
                  ? '일반'
                  : '관심'}
            </Badge>
          </div>

          {/* 🏢 직업 정보 */}
          {occupation && (
            <div className="flex items-center gap-2 mt-2">
              <Building2 className={`h-3.5 w-3.5 ${styles.icon}`} />
              <span className="text-sm text-muted-foreground truncate">
                {occupation}
              </span>
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          {/* 💰 예상 수익 정보 */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className="bg-muted/30 rounded-lg p-3 cursor-pointer hover:bg-muted/40 transition-colors"
              onClick={() => onEditOpportunity?.(id, name)}
              title="클릭하여 월 보험료 설정"
            >
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-3.5 w-3.5 text-green-600" />
                <span className="text-xs text-muted-foreground">월 보험료</span>
              </div>
              <p className="text-sm font-semibold text-foreground text-center">
                {monthlyPremium > 0 ? (
                  formatCurrencyTable(monthlyPremium)
                ) : (
                  <span className="text-muted-foreground hover:text-foreground transition-colors">
                    미설정 (클릭)
                  </span>
                )}
              </p>
            </div>

            <div
              className="bg-muted/30 rounded-lg p-3 cursor-pointer hover:bg-muted/40 transition-colors"
              onClick={() => onEditOpportunity?.(id, name)}
              title="클릭하여 계약 수수료 설정"
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-xs text-muted-foreground">
                  계약 수수료
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground text-center">
                {contractCommission > 0 ? (
                  formatCurrencyTable(contractCommission)
                ) : (
                  <span className="text-muted-foreground hover:text-foreground transition-colors">
                    미설정 (클릭)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* ⏰ 진행 상황 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer
                  className={`h-3.5 w-3.5 ${
                    isStale ? 'text-orange-500' : 'text-muted-foreground'
                  }`}
                />
                <span className="text-xs text-muted-foreground">
                  파이프라인 체류
                </span>
              </div>
              <span
                className={`text-xs font-medium ${
                  isStale ? 'text-orange-600' : 'text-foreground'
                }`}
              >
                {daysInPipeline}일
              </span>
            </div>

            {daysSinceLastConsultation !== null && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock
                    className={`h-3.5 w-3.5 ${
                      isUrgent ? 'text-red-500' : 'text-muted-foreground'
                    }`}
                  />
                  <span className="text-xs text-muted-foreground">
                    마지막 상담
                  </span>
                </div>
                <span
                  className={`text-xs font-medium ${
                    isUrgent ? 'text-red-600' : 'text-foreground'
                  }`}
                >
                  {daysSinceLastConsultation}일 전
                </span>
              </div>
            )}
          </div>

          {/* 🔗 소개자 정보 */}
          {referredBy && (
            <div className="flex items-center gap-2 p-2 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg">
              <Users className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs text-blue-700 dark:text-blue-300 truncate">
                {referredBy.name} 소개
              </span>
            </div>
          )}

          {/* 🎯 관심사항 표시 */}
          {interestCategories && interestCategories.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">관심사항</span>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {interestCategories.slice(0, 3).map((interest, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-1.5 py-0.5 bg-accent/20 rounded text-xs"
                  >
                    <span>{interest.icon}</span>
                    <span className="text-foreground">
                      {interest.label.length > 4
                        ? interest.label.slice(0, 4)
                        : interest.label}
                    </span>
                  </div>
                ))}
                {interestCategories.length > 3 && (
                  <div
                    className="flex items-center px-1.5 py-0.5 bg-muted/30 rounded text-xs"
                    title={`추가 관심사항: ${interestCategories
                      .slice(3)
                      .map(i => i.label)
                      .join(', ')}`}
                  >
                    <span className="text-muted-foreground">
                      +{interestCategories.length - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 🏥 건강 정보 */}
          {hasHealthIssues !== undefined && (
            <div className="flex items-center gap-3">
              {hasHealthIssues === false && (
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-xs text-green-700 dark:text-green-300">
                    건강
                  </span>
                </div>
              )}
              {hasHealthIssues === true && (
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-xs text-orange-600">주의</span>
                </div>
              )}
            </div>
          )}

          {/* 🚨 긴급 알림 */}
          {(isUrgent || isStale) && (
            <div
              className={`flex items-center gap-2 p-2 rounded-lg ${
                isUrgent
                  ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300'
                  : 'bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">
                {isUrgent ? '연락 필요' : '장기 체류'}
              </span>
            </div>
          )}

          {/* 🎯 가로 배치 버튼들 - 상세보기 + 계약전환 + 영업에서 제외 */}
          <div className="space-y-2 pt-1">
            {/* 첫 번째 줄: 상세보기 */}
            <Link
              to={`/clients/${id}`}
              className="flex items-center justify-center gap-2 w-full p-2 text-sm text-primary hover:text-primary/80 hover:bg-primary/5 rounded-lg transition-colors group/link"
            >
              <span>상세보기</span>
              <ChevronRight className="h-3.5 w-3.5 group-hover/link:translate-x-0.5 transition-transform" />
            </Link>

            {/* 두 번째 줄: 계약전환 + 보관 */}
            <div className="flex gap-2">
              {/* 🏢 계약 전환 버튼 - 항상 표시 */}
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs text-green-700 hover:text-green-800 hover:bg-green-50 hover:border-green-300 transition-colors"
                onClick={() => onCreateContract?.(id, name, products)}
              >
                <ShieldCheck className="h-3 w-3 mr-1" />
                계약전환
              </Button>

              {/* 📁 영업에서 보관 버튼 */}
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs text-muted-foreground hover:text-orange-700 hover:bg-orange-50 hover:border-orange-300 transition-colors"
                onClick={() => onRemoveFromPipeline?.(id, name)}
              >
                <Archive className="h-3 w-3 mr-1" />
                보관
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
