import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Switch } from '~/common/components/ui/switch';
import { Label } from '~/common/components/ui/label';
import { GearIcon, GlobeIcon, SunIcon } from '@radix-ui/react-icons';
import type { SystemSectionProps } from './types';

export function SystemSection({ settings, onUpdate }: SystemSectionProps) {
  const handleLanguageChange = (language: string) => {
    onUpdate({
      ...settings,
      language,
    });
  };

  const handleDarkModeToggle = () => {
    onUpdate({
      ...settings,
      darkMode: !settings.darkMode,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <GearIcon className="h-5 w-5" />
          <div>
            <CardTitle>시스템 설정</CardTitle>
            <CardDescription>앱의 언어와 테마를 설정하세요</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GlobeIcon className="h-4 w-4 text-muted-foreground" />
            <div>
              <Label className="font-medium">언어</Label>
              <p className="text-sm text-muted-foreground">
                앱에서 사용할 언어를 선택하세요
              </p>
            </div>
          </div>
          <Select
            value={settings.language}
            onValueChange={handleLanguageChange}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ko">한국어</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SunIcon className="h-4 w-4 text-muted-foreground" />
            <div>
              <Label className="font-medium">다크 모드</Label>
              <p className="text-sm text-muted-foreground">
                어두운 테마를 사용합니다
              </p>
            </div>
          </div>
          <Switch
            checked={settings.darkMode}
            onCheckedChange={handleDarkModeToggle}
          />
        </div>
      </CardContent>
    </Card>
  );
}
