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
import { Badge } from '~/common/components/ui/badge';
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
import type { NotificationSectionProps } from '../types';

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

  // 활성화된 알림 채널 개수 계산
  const activeChannels = [
    settings.emailNotifications,
    settings.smsNotifications,
    settings.pushNotifications,
    settings.kakaoNotifications,
  ].filter(Boolean).length;

  // 활성화된 업무 알림 개수 계산
  const activeBusinessAlerts = [
    settings.meetingReminders,
    settings.goalDeadlines,
    settings.newReferrals,
    settings.clientMilestones,
    settings.followUpReminders,
  ].filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellIcon className="h-5 w-5" />
            <div>
              <CardTitle className="flex items-center gap-2">
                🔔 알림 설정
                <Badge variant="outline" className="text-xs">
                  {activeChannels + activeBusinessAlerts}개 활성화
                </Badge>
              </CardTitle>
              <CardDescription>
                받고 싶은 알림을 선택하세요. 카카오톡 알림은 보험설계사에게
                최적화되어 있습니다.
              </CardDescription>
            </div>
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

          {/* 알림 채널 설정 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">
                📱 알림 채널
              </h4>
              <Badge variant="secondary" className="text-xs">
                {activeChannels}/4 활성화
              </Badge>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-lg">💬</div>
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      카카오톡 알림
                      <Badge variant="default" className="text-xs">
                        추천
                      </Badge>
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      가장 효과적인 보험설계사 전용 알림
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.kakaoNotifications}
                  onCheckedChange={() => handleToggle('kakaoNotifications')}
                  className="flex-shrink-0"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <EnvelopeClosedIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">이메일 알림</Label>
                    <p className="text-xs text-muted-foreground">
                      상세한 업무 내용 확인
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
                    <Label className="text-sm font-medium">SMS 알림</Label>
                    <p className="text-xs text-muted-foreground">
                      긴급한 알림 전용
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={() => handleToggle('smsNotifications')}
                  className="flex-shrink-0"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <BellIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">푸시 알림</Label>
                    <p className="text-xs text-muted-foreground">
                      앱 내 실시간 알림
                    </p>
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

          <Separator />

          {/* 업무 알림 설정 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">
                💼 업무 알림
              </h4>
              <Badge variant="secondary" className="text-xs">
                {activeBusinessAlerts}/8 활성화
              </Badge>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <CalendarIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">미팅 알림</Label>
                    <p className="text-xs text-muted-foreground">
                      고객 미팅 30분 전 알림
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
                  <TargetIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">목표 마감일</Label>
                    <p className="text-xs text-muted-foreground">
                      월/분기 목표 마감일 임박 시
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
                  <PersonIcon className="h-4 w-4 text-purple-500 flex-shrink-0" />
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">새 고객 추천</Label>
                    <p className="text-xs text-muted-foreground">
                      신규 고객 추천 접수 시
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
                  <FileTextIcon className="h-4 w-4 text-orange-500 flex-shrink-0" />
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">계약 체결</Label>
                    <p className="text-xs text-muted-foreground">
                      보험 계약 체결 및 갱신 시
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.clientMilestones}
                  onCheckedChange={() => handleToggle('clientMilestones')}
                  className="flex-shrink-0"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <HeartIcon className="h-4 w-4 text-pink-500 flex-shrink-0" />
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">고객 생일</Label>
                    <p className="text-xs text-muted-foreground">
                      고객 생일 및 기념일 알림
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
                  <ExclamationTriangleIcon className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">팔로업 알림</Label>
                    <p className="text-xs text-muted-foreground">
                      고객 재연락 및 상담 일정 알림
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.followUpReminders}
                  onCheckedChange={() => handleToggle('followUpReminders')}
                  className="flex-shrink-0"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* 추가 설정 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">
              ⚙️ 추가 설정
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <PersonIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">팀 업데이트</Label>
                    <p className="text-xs text-muted-foreground">
                      팀 공지사항 및 업데이트
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.teamUpdates}
                  onCheckedChange={() => handleToggle('teamUpdates')}
                  className="flex-shrink-0"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <ExclamationTriangleIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">시스템 알림</Label>
                    <p className="text-xs text-muted-foreground">
                      시스템 점검 및 중요 공지
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.systemAlerts}
                  onCheckedChange={() => handleToggle('systemAlerts')}
                  className="flex-shrink-0"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">주말 알림</Label>
                    <p className="text-xs text-muted-foreground">
                      주말에도 업무 알림 받기
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.weekendNotifications}
                  onCheckedChange={() => handleToggle('weekendNotifications')}
                  className="flex-shrink-0"
                />
              </div>
            </div>
          </div>

          {/* 하단 안내 */}
          <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md">
            <p className="text-sm text-blue-800 dark:text-blue-400">
              💡 <strong>카카오톡 알림</strong>이 보험설계사에게 가장
              효과적입니다. 고객 대응시간이 평균 70% 단축됩니다.
            </p>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
