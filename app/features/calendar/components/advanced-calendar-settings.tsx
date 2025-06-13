import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Label } from '~/common/components/ui/label';
import { Input } from '~/common/components/ui/input';
import { Textarea } from '~/common/components/ui/textarea';
import { Switch } from '~/common/components/ui/switch';
import { Slider } from '~/common/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Badge } from '~/common/components/ui/badge';
import { Separator } from '~/common/components/ui/separator';
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/common/components/ui/dialog';
import {
  CalendarIcon,
  GearIcon,
  InfoCircledIcon,
  PlusIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import { useState } from 'react';

// 고급 설정 인터페이스
interface AdvancedCalendarSettings {
  // 동기화 범위 설정
  syncDateRange: {
    pastDays: number;
    futureDays: number;
  };

  // 필터링 설정
  excludePatterns: string[];
  includeOnlyPatterns: string[];
  excludeAllDayEvents: boolean;

  // UI 설정
  showGoogleEventsOnCalendar: boolean;
  googleEventOpacity: number;

  // 알림 설정
  notifyOnSyncConflicts: boolean;
  notifyOnSyncErrors: boolean;

  // 성능 설정
  autoSyncInterval: number;
  maxEventsPerSync: number;
}

interface AdvancedCalendarSettingsProps {
  settings: AdvancedCalendarSettings;
  onSettingsChange: (settings: AdvancedCalendarSettings) => void;
  onSave: () => void;
  isConnected: boolean;
}

export function AdvancedCalendarSettings({
  settings,
  onSettingsChange,
  onSave,
  isConnected,
}: AdvancedCalendarSettingsProps) {
  const [newExcludePattern, setNewExcludePattern] = useState('');
  const [newIncludePattern, setNewIncludePattern] = useState('');

  const updateSettings = (updates: Partial<AdvancedCalendarSettings>) => {
    onSettingsChange({ ...settings, ...updates });
  };

  const addExcludePattern = () => {
    if (newExcludePattern.trim()) {
      updateSettings({
        excludePatterns: [
          ...settings.excludePatterns,
          newExcludePattern.trim(),
        ],
      });
      setNewExcludePattern('');
    }
  };

  const removeExcludePattern = (index: number) => {
    updateSettings({
      excludePatterns: settings.excludePatterns.filter((_, i) => i !== index),
    });
  };

  const addIncludePattern = () => {
    if (newIncludePattern.trim()) {
      updateSettings({
        includeOnlyPatterns: [
          ...settings.includeOnlyPatterns,
          newIncludePattern.trim(),
        ],
      });
      setNewIncludePattern('');
    }
  };

  const removeIncludePattern = (index: number) => {
    updateSettings({
      includeOnlyPatterns: settings.includeOnlyPatterns.filter(
        (_, i) => i !== index
      ),
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={!isConnected}>
          <GearIcon className="h-4 w-4 mr-2" />
          고급 설정
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            구글 캘린더 고급 설정
          </DialogTitle>
          <DialogDescription>
            동기화 범위, 필터링, 성능 등 세부 설정을 조정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 동기화 범위 설정 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">동기화 범위</CardTitle>
              <CardDescription>
                과거와 미래의 어느 범위까지 동기화할지 설정합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pastDays">과거 일정 (일)</Label>
                  <Input
                    id="pastDays"
                    type="number"
                    value={settings.syncDateRange.pastDays}
                    onChange={e =>
                      updateSettings({
                        syncDateRange: {
                          ...settings.syncDateRange,
                          pastDays: parseInt(e.target.value) || 30,
                        },
                      })
                    }
                    min="1"
                    max="365"
                  />
                  <p className="text-xs text-muted-foreground">
                    최대 1년 (365일)까지 설정 가능
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="futureDays">미래 일정 (일)</Label>
                  <Input
                    id="futureDays"
                    type="number"
                    value={settings.syncDateRange.futureDays}
                    onChange={e =>
                      updateSettings({
                        syncDateRange: {
                          ...settings.syncDateRange,
                          futureDays: parseInt(e.target.value) || 365,
                        },
                      })
                    }
                    min="1"
                    max="730"
                  />
                  <p className="text-xs text-muted-foreground">
                    최대 2년 (730일)까지 설정 가능
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 필터링 설정 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">이벤트 필터링</CardTitle>
              <CardDescription>
                특정 패턴의 이벤트를 제외하거나 포함할 수 있습니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 제외 패턴 */}
              <div className="space-y-3">
                <Label>제외할 이벤트 패턴</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="예: 개인, private, 휴가"
                    value={newExcludePattern}
                    onChange={e => setNewExcludePattern(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addExcludePattern()}
                  />
                  <Button size="sm" onClick={addExcludePattern}>
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {settings.excludePatterns.map((pattern, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {pattern}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-auto p-0 hover:bg-transparent"
                        onClick={() => removeExcludePattern(index)}
                      >
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* 포함 패턴 */}
              <div className="space-y-3">
                <Label>포함할 이벤트 패턴 (선택적)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="예: 미팅, 상담, 회의"
                    value={newIncludePattern}
                    onChange={e => setNewIncludePattern(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addIncludePattern()}
                  />
                  <Button size="sm" onClick={addIncludePattern}>
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {settings.includeOnlyPatterns.map((pattern, index) => (
                    <Badge key={index} variant="outline" className="gap-1">
                      {pattern}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-auto p-0 hover:bg-transparent"
                        onClick={() => removeIncludePattern(index)}
                      >
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>종일 이벤트 제외</Label>
                  <p className="text-sm text-muted-foreground">
                    구글 캘린더의 종일 이벤트를 동기화에서 제외합니다
                  </p>
                </div>
                <Switch
                  checked={settings.excludeAllDayEvents}
                  onCheckedChange={checked =>
                    updateSettings({ excludeAllDayEvents: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* UI 및 표시 설정 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">표시 설정</CardTitle>
              <CardDescription>
                SureCRM 캘린더에서 구글 이벤트를 어떻게 표시할지 설정합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>구글 이벤트 표시</Label>
                  <p className="text-sm text-muted-foreground">
                    SureCRM 캘린더에서 구글 이벤트를 함께 표시합니다
                  </p>
                </div>
                <Switch
                  checked={settings.showGoogleEventsOnCalendar}
                  onCheckedChange={checked =>
                    updateSettings({ showGoogleEventsOnCalendar: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>
                  구글 이벤트 투명도: {settings.googleEventOpacity}%
                </Label>
                <Slider
                  value={[settings.googleEventOpacity]}
                  onValueChange={([value]) =>
                    updateSettings({ googleEventOpacity: value })
                  }
                  min={20}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  구글 이벤트와 SureCRM 이벤트를 시각적으로 구분할 수 있습니다
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 알림 설정 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">알림 설정</CardTitle>
              <CardDescription>
                동기화 관련 알림을 받을지 설정합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>충돌 알림</Label>
                  <p className="text-sm text-muted-foreground">
                    동기화 충돌이 발생했을 때 알림을 받습니다
                  </p>
                </div>
                <Switch
                  checked={settings.notifyOnSyncConflicts}
                  onCheckedChange={checked =>
                    updateSettings({ notifyOnSyncConflicts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>오류 알림</Label>
                  <p className="text-sm text-muted-foreground">
                    동기화 오류가 발생했을 때 알림을 받습니다
                  </p>
                </div>
                <Switch
                  checked={settings.notifyOnSyncErrors}
                  onCheckedChange={checked =>
                    updateSettings({ notifyOnSyncErrors: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* 성능 설정 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">성능 설정</CardTitle>
              <CardDescription>
                동기화 성능과 관련된 설정을 조정합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="autoSyncInterval">자동 동기화 간격 (분)</Label>
                <Select
                  value={settings.autoSyncInterval.toString()}
                  onValueChange={value =>
                    updateSettings({ autoSyncInterval: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5분</SelectItem>
                    <SelectItem value="15">15분</SelectItem>
                    <SelectItem value="30">30분</SelectItem>
                    <SelectItem value="60">1시간</SelectItem>
                    <SelectItem value="120">2시간</SelectItem>
                    <SelectItem value="0">수동만</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxEventsPerSync">
                  1회 동기화 최대 이벤트 수
                </Label>
                <Input
                  id="maxEventsPerSync"
                  type="number"
                  value={settings.maxEventsPerSync}
                  onChange={e =>
                    updateSettings({
                      maxEventsPerSync: parseInt(e.target.value) || 250,
                    })
                  }
                  min="50"
                  max="1000"
                />
                <p className="text-xs text-muted-foreground">
                  너무 높으면 성능에 영향을 줄 수 있습니다 (권장: 250개)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 안내 메시지 */}
          <Alert>
            <InfoCircledIcon className="h-4 w-4" />
            <AlertDescription>
              <strong>설정 변경 안내:</strong> 고급 설정을 변경한 후에는 전체
              동기화를 다시 실행하는 것을 권장합니다. 필터링 설정은 새로운
              동기화부터 적용됩니다.
            </AlertDescription>
          </Alert>
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <DialogTrigger asChild>
            <Button variant="outline">취소</Button>
          </DialogTrigger>
          <Button onClick={onSave}>설정 저장</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
