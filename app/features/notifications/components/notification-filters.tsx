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
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';
import type { NotificationFiltersProps } from '../types';

export function NotificationFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
}: NotificationFiltersProps) {
  const { t } = useHydrationSafeTranslation('notifications');

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 검색 */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('notifications:filters.search')}
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
                <SelectValue placeholder={t('notifications:filters.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t('notifications:filters.all')}
                </SelectItem>
                <SelectItem value="pending">
                  {t('notifications:status.pending')}
                </SelectItem>
                <SelectItem value="sent">
                  {t('notifications:status.delivered')}
                </SelectItem>
                <SelectItem value="delivered">
                  {t('notifications:status.delivered')}
                </SelectItem>
                <SelectItem value="read">
                  {t('notifications:status.read')}
                </SelectItem>
                <SelectItem value="failed">
                  {t('notifications:status.failed')}
                </SelectItem>
                <SelectItem value="cancelled">
                  {t('notifications:status.cancelled')}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={typeFilter}
              onValueChange={value => onTypeFilterChange(value as any)}
            >
              <SelectTrigger className="w-32 bg-background border-border">
                <SelectValue placeholder={t('notifications:filters.type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t('notifications:filters.all')}
                </SelectItem>
                <SelectItem value="meeting_reminder">
                  {t('notifications:types.meeting_reminder')}
                </SelectItem>
                <SelectItem value="goal_achievement">
                  {t('notifications:types.goal_achievement')}
                </SelectItem>
                <SelectItem value="goal_deadline">
                  {t('notifications:types.goal_deadline')}
                </SelectItem>
                <SelectItem value="new_referral">
                  {t('notifications:types.new_referral')}
                </SelectItem>
                <SelectItem value="client_milestone">
                  {t('notifications:types.client_milestone')}
                </SelectItem>
                <SelectItem value="team_update">
                  {t('notifications:types.team_update')}
                </SelectItem>
                <SelectItem value="system_alert">
                  {t('notifications:types.system_alert')}
                </SelectItem>
                <SelectItem value="birthday_reminder">
                  {t('notifications:types.birthday_reminder')}
                </SelectItem>
                <SelectItem value="follow_up_reminder">
                  {t('notifications:types.follow_up_reminder')}
                </SelectItem>
                <SelectItem value="contract_expiry">
                  {t('notifications:types.contract_expiry')}
                </SelectItem>
                <SelectItem value="payment_due">
                  {t('notifications:types.payment_due')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
