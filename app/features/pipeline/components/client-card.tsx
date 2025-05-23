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
} from 'lucide-react';
import { Link } from 'react-router';
import type { InsuranceInfo } from '~/features/pipeline/types';

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
}

export function ClientCard({
  id,
  name,
  phone,
  occupation,
  referredBy,
  importance,
  lastContactDate,
  nextMeeting,
  note,
  tags,
  insuranceInfo,
  isDragging,
}: ClientCardProps) {
  const getImportanceConfig = (importance: string) => {
    switch (importance) {
      case 'high':
        return {
          label: '높음',
          borderColor: 'border-l-primary',
          dotColor: 'bg-primary',
          badgeColor: 'bg-primary/10 border-primary/20 text-primary',
        };
      case 'medium':
        return {
          label: '보통',
          borderColor: 'border-l-secondary-foreground',
          dotColor: 'bg-secondary-foreground',
          badgeColor: 'bg-secondary text-secondary-foreground',
        };
      case 'low':
        return {
          label: '낮음',
          borderColor: 'border-l-muted-foreground',
          dotColor: 'bg-muted-foreground',
          badgeColor: 'bg-muted text-muted-foreground',
        };
      default:
        return {
          label: '미설정',
          borderColor: 'border-l-border',
          dotColor: 'bg-border',
          badgeColor: 'bg-muted text-muted-foreground',
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

  const importanceConfig = getImportanceConfig(importance);

  return (
    <Card
      className={`relative border-l-4 ${
        importanceConfig.borderColor
      } hover:shadow-md transition-all duration-200 ${
        isDragging ? 'shadow-lg opacity-75 transform rotate-1' : ''
      } bg-card border-border`}
    >
      {/* 카드 헤더 - 고객 기본 정보 */}
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex mb-2 items-center space-x-2">
              <h3 className="font-semibold text-base truncate text-foreground">
                {name}
              </h3>
              <div
                className={`w-2 h-2 rounded-full ${importanceConfig.dotColor} flex-shrink-0`}
              />
            </div>

            <div className="flex mb-2 items-center text-sm text-muted-foreground">
              <Phone className="h-3 w-3 mr-1.5 flex-shrink-0" />
              <span className="truncate">{phone}</span>
            </div>

            {/* 소개자 정보 */}
            {referredBy && (
              <div className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                <Users className="h-3 w-3" />
                <span className="truncate">소개: {referredBy.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-start space-x-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link to={`/clients/${id}`}>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors duration-200 bg-transparent border-0 rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                  style={{
                    // FOUC 방지를 위한 명시적 스타일
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    background: 'transparent',
                    border: '0',
                    padding: '0.25rem',
                    fontSize: '0',
                    lineHeight: '1',
                  }}
                >
                  <MoreVertical className="h-3 w-3" />
                  <span className="sr-only">메뉴 열기</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[160px]">
                <DropdownMenuLabel>고객 관리</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={`/clients/${id}`}>상세 정보</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/clients/edit/${id}`}>정보 수정</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/calendar?client=${id}`}>미팅 예약</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash className="h-4 w-4 mr-2" />
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      {/* 카드 콘텐츠 - 핵심 영업 정보 */}
      <CardContent className="space-y-3">
        {/* 다음 미팅 - 심플하게 표시 */}
        {nextMeeting && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
              <div>
                <div className="text-foreground text-sm font-medium">
                  다음 미팅
                </div>
                <div className="text-muted-foreground text-xs flex items-center space-x-1">
                  <span>{formatDate(nextMeeting.date)}</span>
                  <span>•</span>
                  <span>{nextMeeting.time}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 직업 정보 */}
        {occupation && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Briefcase className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{occupation}</span>
          </div>
        )}

        {/* 보험 정보 - 간결하게 */}
        {insuranceInfo && insuranceInfo.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">
              관심 보험
            </div>
            <div className="flex flex-wrap gap-1">
              {insuranceInfo.slice(0, 3).map((insurance) => (
                <Badge
                  key={insurance.id}
                  variant="outline"
                  className="text-xs h-6 flex items-center bg-muted border-border"
                >
                  {getInsuranceIcon(insurance.type)}
                  <span className="ml-1.5">
                    {getInsuranceLabel(insurance.type)}
                  </span>
                </Badge>
              ))}
              {insuranceInfo.length > 3 && (
                <Badge
                  variant="outline"
                  className="text-xs h-6 bg-muted border-border"
                >
                  +{insuranceInfo.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* 태그 - 최대 2개만 표시 */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs h-5 bg-accent text-accent-foreground"
              >
                <Tag className="h-2.5 w-2.5 mr-1" />
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge
                variant="secondary"
                className="text-xs h-5 bg-muted text-muted-foreground"
              >
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* 메모 */}
        {note && (
          <div className="text-sm text-muted-foreground bg-muted p-2 rounded border-l-2 border-border">
            {note}
          </div>
        )}
      </CardContent>

      {/* 카드 푸터 - 상태 정보 */}
      <CardFooter className="pt-0 pb-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium border ${importanceConfig.badgeColor}`}
          >
            {importanceConfig.label}
          </span>

          {lastContactDate && !nextMeeting && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              <span>{formatLastContact(lastContactDate)}</span>
            </div>
          )}
        </div>

        {nextMeeting && (
          <Badge
            variant="outline"
            className="text-xs h-5 bg-primary/10 border-primary/30 text-primary"
          >
            미팅 예정
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}
