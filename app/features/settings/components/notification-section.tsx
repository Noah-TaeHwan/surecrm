import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Switch } from '~/common/components/ui/switch';
import { Label } from '~/common/components/ui/label';
import { BellIcon, CalendarIcon, FileTextIcon } from '@radix-ui/react-icons';
import type { NotificationSectionProps } from './types';

export function NotificationSection({
  settings,
  onUpdate,
}: NotificationSectionProps) {
  const handleToggle = (key: keyof typeof settings) => {
    onUpdate({
      ...settings,
      [key]: !settings[key],
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BellIcon className="h-5 w-5" />
          <div>
            <CardTitle>알림 설정</CardTitle>
            <CardDescription>받고 싶은 알림을 선택하세요</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <div>
              <Label className="font-medium">미팅 알림</Label>
              <p className="text-sm text-muted-foreground">
                예정된 미팅 30분 전에 알림을 받습니다
              </p>
            </div>
          </div>
          <Switch
            checked={settings.meetingReminder}
            onCheckedChange={() => handleToggle('meetingReminder')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
            <div>
              <Label className="font-medium">계약 업데이트</Label>
              <p className="text-sm text-muted-foreground">
                고객의 계약 상태가 변경될 때 알림을 받습니다
              </p>
            </div>
          </div>
          <Switch
            checked={settings.contractUpdate}
            onCheckedChange={() => handleToggle('contractUpdate')}
          />
        </div>
      </CardContent>
    </Card>
  );
}
