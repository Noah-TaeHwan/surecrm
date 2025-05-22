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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/common/components/ui/tooltip';
import {
  Calendar,
  Clock,
  Edit,
  MoreVertical,
  Phone,
  Tag,
  Trash,
  User,
  Users,
} from 'lucide-react';
import { Link } from 'react-router';

interface ClientCardProps {
  id: string;
  name: string;
  phone: string;
  email?: string;
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
  isDragging?: boolean;
}

export function ClientCard({
  id,
  name,
  phone,
  email,
  referredBy,
  importance,
  lastContactDate,
  nextMeeting,
  note,
  tags,
  isDragging,
}: ClientCardProps) {
  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-blue-500';
      default:
        return 'border-l-transparent';
    }
  };

  const getImportanceLabel = (importance: string) => {
    switch (importance) {
      case 'high':
        return '높음';
      case 'medium':
        return '중간';
      case 'low':
        return '낮음';
      default:
        return '';
    }
  };

  const getImportanceBadgeColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return '';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <Card
      className={`relative border-l-4 ${getImportanceColor(
        importance
      )} shadow-sm hover:shadow transition-all ${
        isDragging ? 'shadow-md opacity-90' : ''
      }`}
    >
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center">
            <h3 className="font-medium text-sm">{name}</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-1 text-muted-foreground"
                    asChild
                  >
                    <Link to={`/clients/${id}`}>
                      <Edit className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>상세 정보 보기</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Phone className="h-3 w-3 mr-1" />
            <span>{phone}</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
            <DropdownMenuItem className="text-red-600">
              <Trash className="h-4 w-4 mr-2" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="pb-2 text-xs">
        <div className="flex items-center mb-2">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${getImportanceBadgeColor(
              importance
            )}`}
          >
            중요도: {getImportanceLabel(importance)}
          </span>
        </div>

        {referredBy && (
          <div className="flex items-center text-muted-foreground mb-2">
            <Users className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">
              소개자: <span className="font-medium">{referredBy.name}</span>
            </span>
          </div>
        )}

        {nextMeeting && (
          <div className="flex items-start text-muted-foreground mb-2">
            <Calendar className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium">{nextMeeting.type}</div>
              <div className="flex items-center">
                <span>
                  {formatDate(nextMeeting.date)} {nextMeeting.time}
                </span>
              </div>
            </div>
          </div>
        )}

        {lastContactDate && (
          <div className="flex items-center text-muted-foreground mb-2">
            <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
            <span>마지막 연락: {formatDate(lastContactDate)}</span>
          </div>
        )}

        {note && (
          <div className="mb-2 text-muted-foreground text-xs line-clamp-2">
            {note}
          </div>
        )}

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                <Tag className="h-2.5 w-2.5 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 pb-2 justify-between">
        <div className="flex items-center text-xs text-muted-foreground">
          <User className="h-3 w-3 mr-1" />
          <span className="truncate">#{id.split('-')[1]}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
