import { Badge } from '~/common/components/ui/badge';
import { Button } from '~/common/components/ui/button';
import { Card, CardContent, CardHeader } from '~/common/components/ui/card';
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
  isDragging?: boolean;
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
  isDragging = false,
}: ClientCardProps) {
  // 🎯 중요도별 스타일 (서비스 톤앤매너 적용)
  const importanceStyles = {
    high: {
      borderColor: 'border-l-orange-500',
      bgGradient:
        'bg-gradient-to-br from-orange-50/50 to-white dark:from-orange-950/20 dark:to-background',
      badge:
        'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      icon: 'text-orange-600',
    },
    medium: {
      borderColor: 'border-l-blue-500',
      bgGradient:
        'bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/20 dark:to-background',
      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      icon: 'text-blue-600',
    },
    low: {
      borderColor: 'border-l-muted-foreground',
      bgGradient:
        'bg-gradient-to-br from-muted/30 to-white dark:from-muted/10 dark:to-background',
      badge: 'bg-muted text-muted-foreground',
      icon: 'text-muted-foreground',
    },
  };

  const styles = importanceStyles[importance];

  // 📊 예상 보험료 계산 (직업 기반)
  const calculateExpectedPremium = () => {
    const basePremium = 150000; // 기본 15만원
    const occupationMultiplier =
      occupation?.includes('의사') || occupation?.includes('변호사')
        ? 2.5
        : occupation?.includes('회사원')
        ? 1.2
        : 1.0;
    return Math.round(basePremium * occupationMultiplier);
  };

  // 💰 예상 연 수수료 계산
  const calculateExpectedCommission = () => {
    return Math.round(calculateExpectedPremium() * 12 * 0.15); // 15% 수수료율
  };

  // ⏰ 파이프라인 체류 기간 계산
  const getDaysInPipeline = () => {
    const created = new Date(createdAt);
    const now = new Date();
    return Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  // 📅 마지막 연락일 계산
  const getDaysSinceLastContact = () => {
    if (!lastContactDate) return null;
    const lastContact = new Date(lastContactDate);
    const now = new Date();
    return Math.floor(
      (now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const daysInPipeline = getDaysInPipeline();
  const daysSinceLastContact = getDaysSinceLastContact();
  const expectedPremium = calculateExpectedPremium();
  const expectedCommission = calculateExpectedCommission();

  // 🚨 긴급도 표시 (7일 이상 연락 없음)
  const isUrgent = daysSinceLastContact !== null && daysSinceLastContact >= 7;
  const isStale = daysInPipeline >= 30; // 30일 이상 체류

  return (
    <Card
      className={`relative ${
        styles.borderColor
      } border-l-4 group transition-all duration-200 select-none ${
        styles.bgGradient
      } ${
        isDragging
          ? 'shadow-xl opacity-95 transform rotate-1 scale-105 z-50 ring-2 ring-primary/30 border-primary/50'
          : 'hover:shadow-md hover:scale-[1.02] hover:-translate-y-1'
      } border-border/50 backdrop-blur-sm overflow-hidden`}
    >
      {/* 🎯 드래그 핸들 */}
      {!isDragging && (
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      <CardHeader className="pb-3">
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
              {telecomProvider && (
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                  {telecomProvider}
                </Badge>
              )}
            </div>
          </div>

          {/* 🎯 중요도 배지 */}
          <Badge
            className={`${styles.badge} text-xs font-medium flex-shrink-0`}
          >
            {importance === 'high'
              ? 'VIP'
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
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-3.5 w-3.5 text-green-600" />
              <span className="text-xs text-muted-foreground">월 보험료</span>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {(expectedPremium / 10000).toFixed(0)}만원
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs text-muted-foreground">연 수수료</span>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {(expectedCommission / 10000).toFixed(0)}만원
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

          {daysSinceLastContact !== null && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock
                  className={`h-3.5 w-3.5 ${
                    isUrgent ? 'text-red-500' : 'text-muted-foreground'
                  }`}
                />
                <span className="text-xs text-muted-foreground">
                  마지막 연락
                </span>
              </div>
              <span
                className={`text-xs font-medium ${
                  isUrgent ? 'text-red-600' : 'text-foreground'
                }`}
              >
                {daysSinceLastContact}일 전
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

        {/* 🏥 건강 정보 */}
        {(hasHealthIssues !== undefined || hasDrivingLicense !== undefined) && (
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
            {hasDrivingLicense && (
              <div className="flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-xs text-blue-700 dark:text-blue-300">
                  운전
                </span>
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

        {/* 🔗 상세보기 링크 */}
        <Link
          to={`/clients/${id}`}
          className="flex items-center justify-center gap-2 w-full p-2 text-sm text-primary hover:text-primary/80 hover:bg-primary/5 rounded-lg transition-colors group/link"
        >
          <span>상세보기</span>
          <ChevronRight className="h-3.5 w-3.5 group-hover/link:translate-x-0.5 transition-transform" />
        </Link>
      </CardContent>
    </Card>
  );
}
