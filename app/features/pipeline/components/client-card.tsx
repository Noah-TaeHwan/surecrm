import { Badge } from '~/common/components/ui/badge';
import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '~/common/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/common/components/ui/dropdown-menu';
import {
  Calendar,
  Clock,
  MoreVertical,
  Phone,
  Tag,
  Trash,
  Users,
  Briefcase,
  Shield,
  Car,
  Baby,
  Heart,
  Home,
  ExternalLink,
  AlertCircle,
  User,
  GripVertical,
  Timer,
  Smartphone,
} from 'lucide-react';
import { Link } from 'react-router';
import type { InsuranceInfo } from '~/features/pipeline/types/types';

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
  referredBy?: {
    id: string;
    name: string;
  };
  importance: 'high' | 'medium' | 'low';
  lastContactDate?: string;
  nextMeeting?: {
    date: string;
    time: string;
    type: string;
  };
  note?: string;
  tags?: string[];
  insuranceInfo?: InsuranceInfo[];
  profileImageUrl?: string;
  isDragging?: boolean;
  createdAt?: string;
}

export function ClientCard({
  id,
  name,
  phone,
  occupation,
  telecomProvider,
  hasDrivingLicense,
  referredBy,
  importance,
  lastContactDate,
  nextMeeting,
  note,
  tags,
  insuranceInfo,
  isDragging,
  createdAt,
}: ClientCardProps) {
  const getImportanceConfig = (importance: string) => {
    switch (importance) {
      case 'high':
        return {
          label: '높음',
          borderColor: 'border-l-red-500',
          dotColor: 'bg-red-500',
          badgeColor: 'bg-red-50 border-red-200 text-red-700',
          cardBg: 'bg-red-50/30',
        };
      case 'medium':
        return {
          label: '보통',
          borderColor: 'border-l-yellow-500',
          dotColor: 'bg-yellow-500',
          badgeColor: 'bg-yellow-50 border-yellow-200 text-yellow-700',
          cardBg: 'bg-yellow-50/20',
        };
      case 'low':
        return {
          label: '낮음',
          borderColor: 'border-l-green-500',
          dotColor: 'bg-green-500',
          badgeColor: 'bg-green-50 border-green-200 text-green-700',
          cardBg: 'bg-green-50/20',
        };
      default:
        return {
          label: '미설정',
          borderColor: 'border-l-gray-400',
          dotColor: 'bg-gray-400',
          badgeColor: 'bg-gray-50 border-gray-200 text-gray-700',
          cardBg: 'bg-gray-50/20',
        };
    }
  };

  const getInsuranceIcon = (type: string) => {
    switch (type) {
      case 'auto':
        return <Car className="h-3 w-3" />;
      case 'prenatal':
        return <Baby className="h-3 w-3" />;
      case 'health':
        return <Heart className="h-3 w-3" />;
      case 'property':
        return <Home className="h-3 w-3" />;
      default:
        return <Shield className="h-3 w-3" />;
    }
  };

  const getInsuranceLabel = (type: string) => {
    switch (type) {
      case 'auto':
        return '자동차';
      case 'prenatal':
        return '태아';
      case 'health':
        return '건강';
      case 'life':
        return '생명';
      case 'property':
        return '재산';
      default:
        return '기타';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil(
      (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '내일';
    if (diffDays > 0 && diffDays <= 7) return `${diffDays}일 후`;

    return new Intl.DateTimeFormat('ko-KR', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const formatLastContact = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays <= 7) return `${diffDays}일 전`;
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)}주 전`;

    return `${Math.floor(diffDays / 30)}개월 전`;
  };

  // 파이프라인 체류 기간 계산 (createdAt 기준)
  const formatPipelineStay = (createdAt?: string) => {
    if (!createdAt) return null;

    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return '오늘 등록';
    if (diffDays === 1) return '1일째';
    if (diffDays <= 7) return `${diffDays}일째`;
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)}주째`;

    return `${Math.floor(diffDays / 30)}개월째`;
  };

  // 통신사 아이콘 및 색상 매핑
  const getTelecomInfo = (provider?: string) => {
    if (!provider) return null;

    switch (provider.toLowerCase()) {
      case 'kt':
        return { label: 'KT', color: 'text-red-600 bg-red-50 border-red-200' };
      case 'skt':
      case 'sk텔레콤':
        return { label: 'SKT', color: 'text-red-600 bg-red-50 border-red-200' };
      case 'lg':
      case 'lgu+':
        return {
          label: 'LG U+',
          color: 'text-pink-600 bg-pink-50 border-pink-200',
        };
      default:
        return {
          label: provider,
          color: 'text-gray-600 bg-gray-50 border-gray-200',
        };
    }
  };

  const importanceConfig = getImportanceConfig(importance);

  return (
    <Card
      className={`relative border-l-4 group ${
        importanceConfig.borderColor
      } hover:shadow-lg transition-all duration-200 select-none ${
        isDragging
          ? 'shadow-xl opacity-90 transform rotate-1 scale-105 z-50 ring-2 ring-primary/20'
          : 'hover:scale-[1.02] hover:shadow-md'
      } bg-card border-border ${
        importance === 'high' ? importanceConfig.cardBg : ''
      }`}
    >
      {/* 🎯 MVP 드래그 핸들 - 상단에 배치 */}
      {!isDragging && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      {/* 카드 헤더 - 고객 기본 정보 */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* 고객 이름과 중요도 */}
            <div className="flex mb-2 items-center space-x-2">
              <h3 className="font-semibold text-base truncate text-foreground">
                {name}
              </h3>
              {importance === 'high' && (
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              )}
            </div>

            {/* 전화번호 */}
            <div className="flex mb-1 items-center text-sm text-muted-foreground">
              <Phone className="h-3 w-3 mr-1.5 flex-shrink-0" />
              <span className="truncate">{phone}</span>
            </div>

            {/* 직업 정보 */}
            {occupation && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Briefcase className="h-3 w-3 mr-1.5 flex-shrink-0" />
                <span className="truncate">{occupation}</span>
              </div>
            )}
          </div>

          {/* 중요도 배지 */}
          <Badge
            variant="outline"
            className={`${importanceConfig.badgeColor} text-xs font-medium border px-2 py-1 flex-shrink-0`}
          >
            {importanceConfig.label}
          </Badge>
        </div>
      </CardHeader>

      {/* 카드 콘텐츠 - 부가 정보 */}
      <CardContent className="pt-0 pb-3">
        {/* 소개자 정보 */}
        {referredBy && (
          <div className="flex items-center mb-2 text-sm">
            <Users className="h-3 w-3 mr-1.5 text-blue-500 flex-shrink-0" />
            <span className="text-blue-600 truncate">
              {referredBy.name} 소개
            </span>
          </div>
        )}

        {/* 파이프라인 체류 기간 */}
        {formatPipelineStay(createdAt) && (
          <div className="flex items-center mb-2 text-sm">
            <Timer className="h-3 w-3 mr-1.5 text-orange-500 flex-shrink-0" />
            <span className="text-orange-600 font-medium">
              {formatPipelineStay(createdAt)}
            </span>
          </div>
        )}

        {/* 통신사 정보 */}
        {getTelecomInfo(telecomProvider) && (
          <div className="flex items-center mb-2 text-sm">
            <Smartphone className="h-3 w-3 mr-1.5 text-gray-500 flex-shrink-0" />
            <Badge
              variant="outline"
              className={`text-xs px-2 py-0.5 ${
                getTelecomInfo(telecomProvider)?.color
              }`}
            >
              {getTelecomInfo(telecomProvider)?.label}
            </Badge>
          </div>
        )}

        {/* 운전면허 정보 */}
        {hasDrivingLicense && (
          <div className="flex items-center mb-2 text-sm">
            <Car className="h-3 w-3 mr-1.5 text-green-500 flex-shrink-0" />
            <span className="text-green-600 text-xs font-medium">
              운전면허 보유
            </span>
          </div>
        )}

        {/* 다음 미팅 */}
        {nextMeeting && (
          <div className="flex items-center mb-2 text-sm">
            <Calendar className="h-3 w-3 mr-1.5 text-emerald-500 flex-shrink-0" />
            <span className="text-emerald-600 font-medium">
              {formatDate(nextMeeting.date)} {nextMeeting.time}
            </span>
          </div>
        )}

        {/* 마지막 연락 */}
        {lastContactDate && (
          <div className="flex items-center mb-2 text-sm">
            <Clock className="h-3 w-3 mr-1.5 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">
              {formatLastContact(lastContactDate)} 연락
            </span>
          </div>
        )}

        {/* 보험 정보 */}
        {insuranceInfo && insuranceInfo.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {insuranceInfo.slice(0, 3).map((insurance, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs px-2 py-0.5 flex items-center space-x-1 bg-blue-50 text-blue-700 border-blue-200"
              >
                {getInsuranceIcon(insurance.type)}
                <span>{getInsuranceLabel(insurance.type)}</span>
              </Badge>
            ))}
            {insuranceInfo.length > 3 && (
              <Badge
                variant="secondary"
                className="text-xs px-2 py-0.5 bg-gray-50 text-gray-600 border-gray-200"
              >
                +{insuranceInfo.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* 태그 */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.slice(0, 2).map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 border-purple-200"
              >
                <Tag className="h-2 w-2 mr-1" />
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge
                variant="outline"
                className="text-xs px-2 py-0.5 bg-gray-50 text-gray-600 border-gray-200"
              >
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* 메모 */}
        {note && (
          <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-sm border-l-2 border-muted-foreground/20">
            <p className="line-clamp-2">{note}</p>
          </div>
        )}
      </CardContent>

      {/* 카드 푸터 - 액션 버튼 */}
      <CardFooter className="pt-0 pb-3 px-4">
        <div className="flex items-center justify-between w-full">
          {/* 고객 상세 보기 링크 */}
          <Link to={`/clients/${id}`} className="flex-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs h-7 hover:bg-muted/80"
            >
              <User className="h-3 w-3 mr-1" />
              상세보기
            </Button>
          </Link>

          {/* 더보기 메뉴 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>고객 관리</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs">
                <Calendar className="h-3 w-3 mr-2" />
                미팅 예약
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs">
                <Phone className="h-3 w-3 mr-2" />
                통화하기
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs">
                <ExternalLink className="h-3 w-3 mr-2" />
                수정하기
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs text-destructive">
                <Trash className="h-3 w-3 mr-2" />
                삭제하기
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
}
