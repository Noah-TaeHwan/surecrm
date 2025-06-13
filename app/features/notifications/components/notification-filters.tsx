import { Input } from '~/common/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Card, CardContent } from '~/common/components/ui/card';
import { Search } from 'lucide-react';
import type { NotificationFiltersProps } from '../types';

export function NotificationFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
}: NotificationFiltersProps) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 검색 */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="알림 검색..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
          </div>

          {/* 필터 */}
          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onValueChange={value => onStatusFilterChange(value as any)}
            >
              <SelectTrigger className="w-32 bg-background border-border">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="pending">대기중</SelectItem>
                <SelectItem value="sent">발송됨</SelectItem>
                <SelectItem value="delivered">전달됨</SelectItem>
                <SelectItem value="read">읽음</SelectItem>
                <SelectItem value="failed">실패</SelectItem>
                <SelectItem value="cancelled">취소</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={typeFilter}
              onValueChange={value => onTypeFilterChange(value as any)}
            >
              <SelectTrigger className="w-32 bg-background border-border">
                <SelectValue placeholder="유형" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 유형</SelectItem>
                <SelectItem value="meeting_reminder">미팅 알림</SelectItem>
                <SelectItem value="goal_achievement">목표 달성</SelectItem>
                <SelectItem value="goal_deadline">목표 마감</SelectItem>
                <SelectItem value="new_referral">새 추천</SelectItem>
                <SelectItem value="client_milestone">고객 이정표</SelectItem>
                <SelectItem value="team_update">팀 업데이트</SelectItem>
                <SelectItem value="system_alert">시스템 알림</SelectItem>
                <SelectItem value="birthday_reminder">생일 알림</SelectItem>
                <SelectItem value="follow_up_reminder">팔로업 알림</SelectItem>
                <SelectItem value="contract_expiry">계약 만료</SelectItem>
                <SelectItem value="payment_due">결제 예정</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
