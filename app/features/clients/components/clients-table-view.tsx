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

// 🎨 BadgeVariant 타입 정의
type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

interface ClientsTableViewProps {
  clients: ClientDisplay[];
  selectedClients: string[];
  onSelectedClientsChange: (selected: string[]) => void;
  showConfidentialData: boolean;
  totalPages: number;
  currentPage: number;
}

export function ClientsTableView({
  clients,
  selectedClients,
  onSelectedClientsChange,
  showConfidentialData,
  totalPages,
  currentPage,
}: ClientsTableViewProps) {
  // 🎨 배지 설정들
  const statusBadgeVariant: Record<string, BadgeVariant> = {
    active: 'default',
    inactive: 'secondary',
    pending: 'outline',
  };

  const statusText: Record<string, string> = {
    active: '활성',
    inactive: '비활성',
  };

  const stageBadgeVariant: Record<string, BadgeVariant> = {
    lead: 'outline',
    contact: 'secondary',
    proposal: 'default',
    contract: 'destructive',
  };

  const importanceBadgeVariant: Record<string, BadgeVariant> = {
    high: 'destructive',
    medium: 'default',
    low: 'secondary',
  };

  const importanceText: Record<string, string> = {
    high: '높음',
    medium: '보통',
    low: '낮음',
  };

  // 🔒 개인정보 보호 레벨 설정
  const privacyLevelIcon: Record<ClientPrivacyLevel, any> = {
    public: PersonIcon,
    restricted: PersonIcon,
    private: LockClosedIcon,
    confidential: LockClosedIcon,
  };

  const privacyLevelBadgeVariant: Record<ClientPrivacyLevel, BadgeVariant> = {
    public: 'outline',
    restricted: 'secondary',
    private: 'default',
    confidential: 'destructive',
  };

  const privacyLevelText: Record<ClientPrivacyLevel, string> = {
    public: '공개',
    restricted: '제한',
    private: '비공개',
    confidential: '기밀',
  };

  // 🔒 고객 개인정보 보호 표시 함수
  const renderPrivacyIndicator = (client: ClientDisplay) => {
    const level = (client.accessLevel ||
      client.privacyLevel ||
      'private') as ClientPrivacyLevel;
    const Icon = privacyLevelIcon[level];
    return (
      <Tooltip>
        <TooltipTrigger>
          <Badge variant={privacyLevelBadgeVariant[level]} className="gap-1">
            <Icon className="h-3 w-3" />
            {privacyLevelText[level]}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>개인정보 보호 레벨: {privacyLevelText[level]}</p>
          {client.hasConfidentialData && (
            <p className="text-yellow-600">⚠️ 민감정보 포함</p>
          )}
        </TooltipContent>
      </Tooltip>
    );
  };

  // 🔒 고객 데이터 마스킹 함수
  const maskSensitiveData = (data: string, level: ClientPrivacyLevel) => {
    if (showConfidentialData || level === 'public') return data;

    if (level === 'confidential') {
      return '***';
    }

    if (level === 'restricted' && data.length > 4) {
      return data.slice(0, 2) + '*'.repeat(data.length - 4) + data.slice(-2);
    }

    return data;
  };

  // 전체 선택/해제
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectedClientsChange(clients.map((client) => client.id));
    } else {
      onSelectedClientsChange([]);
    }
  };

  // 개별 선택/해제
  const handleSelectClient = (clientId: string, checked: boolean) => {
    if (checked) {
      onSelectedClientsChange([...selectedClients, clientId]);
    } else {
      onSelectedClientsChange(selectedClients.filter((id) => id !== clientId));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>고객 목록</span>
          <div className="text-sm text-muted-foreground">
            총 {clients.length}명
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      clients.length > 0 &&
                      selectedClients.length === clients.length
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>고객 정보</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>단계</TableHead>
                <TableHead>중요도</TableHead>
                <TableHead>보험 유형</TableHead>
                <TableHead>소개 네트워크</TableHead>
                <TableHead>태그</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => {
                const privacyLevel = (client.accessLevel ||
                  client.privacyLevel ||
                  'private') as ClientPrivacyLevel;

                return (
                  <TableRow key={client.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedClients.includes(client.id)}
                        onCheckedChange={(checked) =>
                          handleSelectClient(client.id, checked === true)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {client.fullName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link
                            to={`/clients/${client.id}`}
                            className="font-medium hover:underline"
                          >
                            {maskSensitiveData(client.fullName, privacyLevel)}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            {renderPrivacyIndicator(client)}
                            {client.company && (
                              <span className="text-xs text-muted-foreground">
                                {client.company}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>
                          {maskSensitiveData(client.phone, privacyLevel)}
                        </div>
                        {client.email && (
                          <div className="text-muted-foreground">
                            {maskSensitiveData(client.email, privacyLevel)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          statusBadgeVariant[
                            client.isActive ? 'active' : 'inactive'
                          ]
                        }
                      >
                        {statusText[client.isActive ? 'active' : 'inactive']}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {client.currentStage ? (
                        <Badge
                          variant={
                            stageBadgeVariant[client.currentStage.name] ||
                            'outline'
                          }
                        >
                          {client.currentStage.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={importanceBadgeVariant[client.importance]}
                      >
                        {importanceText[client.importance]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {client.insuranceTypes?.map((type: string) => (
                          <TooltipProvider key={type}>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge
                                  variant="outline"
                                  className="flex items-center gap-1 text-xs"
                                >
                                  {insuranceTypeIcons[type]}
                                  {insuranceTypeText[type]}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{insuranceTypeText[type]}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {(client.referralCount || 0) > 0 ? (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 w-fit"
                          >
                            <Share1Icon className="h-3 w-3" />
                            {client.referralCount || 0}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            -
                          </span>
                        )}
                        <ReferralDepthIndicator
                          depth={client.referralDepth || 0}
                        />
                      </div>
                      {client.lastContactDate && (
                        <div className="text-xs text-muted-foreground mt-1">
                          최근: {client.lastContactDate}
                        </div>
                      )}
                      {client.nextMeetingDate && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          다음: {client.nextMeetingDate}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {client.tags?.map((tag, index: number) => (
                          <Badge
                            key={typeHelpers.getTagId(tag) || index}
                            variant="outline"
                            className="text-xs"
                          >
                            {typeHelpers.getTagName(tag)}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">메뉴 열기</span>
                            <DotsHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>작업</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer">
                            <Link to={`/clients/${client.id}`}>
                              <div className="flex items-center gap-2">
                                <EyeOpenIcon className="h-3 w-3" />
                                상세 보기
                              </div>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Link to={`/clients/edit/${client.id}`}>
                              <div className="flex items-center gap-2">
                                <Pencil2Icon className="h-3 w-3" />
                                수정
                              </div>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-3 w-3" />
                              미팅 예약
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <div className="flex items-center gap-2">
                              <Share1Icon className="h-3 w-3" />
                              소개 네트워크 보기
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 cursor-pointer">
                            <div className="flex items-center gap-2">
                              <TrashIcon className="h-3 w-3" />
                              삭제
                            </div>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={page === currentPage}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
