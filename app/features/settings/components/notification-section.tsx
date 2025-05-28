import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Switch } from '~/common/components/ui/switch';
import { Label } from '~/common/components/ui/label';
import { Button } from '~/common/components/ui/button';
import { Separator } from '~/common/components/ui/separator';
import { Form } from 'react-router';
import { useEffect, useRef } from 'react';
import {
  BellIcon,
  CalendarIcon,
  FileTextIcon,
  TargetIcon,
  PersonIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  EnvelopeClosedIcon,
  MobileIcon,
} from '@radix-ui/react-icons';
import type { NotificationSectionProps } from './types';

export function NotificationSection({
  settings,
  onUpdate,
}: NotificationSectionProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleToggle = (key: keyof typeof settings) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key],
    };

    // 로컬 상태 즉시 업데이트
    onUpdate(newSettings);

    // 폼 제출하여 데이터베이스에 저장
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.requestSubmit();
      }
    }, 0);
  };

  // 설정이 변경될 때마다 숨겨진 입력 필드 업데이트
  useEffect(() => {
    if (formRef.current) {
      const form = formRef.current;
      Object.entries(settings).forEach(([key, value]) => {
        const input = form.querySelector(
          `input[name="${key}"]`
        ) as HTMLInputElement;
        if (input) {
          input.value = value.toString();
        }
      });
    }
  }, [settings]);

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
      <CardContent className="space-y-8">
        <Form method="post" ref={formRef}>
          <input type="hidden" name="intent" value="updateNotifications" />

          {/* 숨겨진 입력 필드들 */}
          <input
            type="hidden"
            name="emailNotifications"
            value={settings.emailNotifications.toString()}
          />
          <input
            type="hidden"
            name="smsNotifications"
            value={settings.smsNotifications.toString()}
          />
          <input
            type="hidden"
            name="pushNotifications"
            value={settings.pushNotifications.toString()}
          />
          <input
            type="hidden"
            name="kakaoNotifications"
            value={settings.kakaoNotifications.toString()}
          />
          <input
            type="hidden"
            name="meetingReminders"
            value={settings.meetingReminders.toString()}
          />
          <input
            type="hidden"
            name="goalDeadlines"
            value={settings.goalDeadlines.toString()}
          />
          <input
            type="hidden"
            name="newReferrals"
            value={settings.newReferrals.toString()}
          />
          <input
            type="hidden"
            name="clientMilestones"
            value={settings.clientMilestones.toString()}
          />
          <input
            type="hidden"
            name="teamUpdates"
            value={settings.teamUpdates.toString()}
          />
          <input
            type="hidden"
            name="systemAlerts"
            value={settings.systemAlerts.toString()}
          />
          <input
            type="hidden"
            name="birthdayReminders"
            value={settings.birthdayReminders.toString()}
          />
          <input
            type="hidden"
            name="followUpReminders"
            value={settings.followUpReminders.toString()}
          />
          <input
            type="hidden"
            name="weekendNotifications"
            value={settings.weekendNotifications.toString()}
          />

          {/* 업무 알림 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">업무 알림</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">미팅 알림</Label>
                    <p className="text-xs text-muted-foreground">
                      미팅 30분 전 알림
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.meetingReminders}
                  onCheckedChange={() => handleToggle('meetingReminders')}
                  className="flex-shrink-0"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <TargetIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">목표 마감일</Label>
                    <p className="text-xs text-muted-foreground">
                      마감일 임박 시
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.goalDeadlines}
                  onCheckedChange={() => handleToggle('goalDeadlines')}
                  className="flex-shrink-0"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <PersonIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">새 추천</Label>
                    <p className="text-xs text-muted-foreground">
                      고객 추천 시
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.newReferrals}
                  onCheckedChange={() => handleToggle('newReferrals')}
                  className="flex-shrink-0"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <FileTextIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">고객 마일스톤</Label>
                    <p className="text-xs text-muted-foreground">
                      고객 진행 상황 업데이트
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.clientMilestones}
                  onCheckedChange={() => handleToggle('clientMilestones')}
                  className="flex-shrink-0"
                />
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* 개인 알림 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">개인 알림</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <HeartIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">생일 알림</Label>
                    <p className="text-xs text-muted-foreground">
                      고객 생일 미리 알림
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.birthdayReminders}
                  onCheckedChange={() => handleToggle('birthdayReminders')}
                  className="flex-shrink-0"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <BellIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">팔로업 알림</Label>
                    <p className="text-xs text-muted-foreground">
                      고객 팔로업 일정 알림
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.followUpReminders}
                  onCheckedChange={() => handleToggle('followUpReminders')}
                  className="flex-shrink-0"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <ExclamationTriangleIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">시스템 알림</Label>
                    <p className="text-xs text-muted-foreground">
                      시스템 업데이트 및 공지
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.systemAlerts}
                  onCheckedChange={() => handleToggle('systemAlerts')}
                  className="flex-shrink-0"
                />
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* 알림 채널 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">알림 채널</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <EnvelopeClosedIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">이메일 알림</Label>
                    <p className="text-xs text-muted-foreground">
                      이메일로 받기
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={() => handleToggle('emailNotifications')}
                  className="flex-shrink-0"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <MobileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">푸시 알림</Label>
                    <p className="text-xs text-muted-foreground">앱 내 알림</p>
                  </div>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={() => handleToggle('pushNotifications')}
                  className="flex-shrink-0"
                />
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* 저장 버튼 */}
          <div className="flex justify-end">
            <Button type="submit">설정 저장</Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
