import { useState } from 'react';
import { Link } from 'react-router';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Checkbox } from '~/common/components/ui/checkbox';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/common/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '~/common/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/common/components/ui/tooltip';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '~/common/components/ui/pagination';
import { Button } from '~/common/components/ui/button';
import {
  PersonIcon,
  LockClosedIcon,
  CalendarIcon,
  DotsHorizontalIcon,
  Pencil2Icon,
  EyeOpenIcon,
  Share1Icon,
  TrashIcon,
} from '@radix-ui/react-icons';

import { ReferralDepthIndicator } from './referral-depth-indicator';
import { insuranceTypeIcons, insuranceTypeText } from './insurance-config';

import type {
  ClientDisplay,
  ClientPrivacyLevel,
} from '~/features/clients/types';
import { typeHelpers } from '~/features/clients/types';
import { formatCurrencyTable } from '~/lib/utils/currency';

// 🎨 BadgeVariant 타입 정의
type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

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

interface ClientsTableViewProps {
  data: ClientProfile[];
  onClientRowClick: (clientId: string) => void;
}

export function ClientsTableView({
  data,
  onClientRowClick,
}: ClientsTableViewProps) {
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

  return (
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
        {data.map(client => (
          <TableRow
            key={client.id}
            className="cursor-pointer hover:bg-muted/50"
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
}
