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
import { Button } from '~/common/components/ui/button';
import { GearIcon, GlobeIcon, SunIcon } from '@radix-ui/react-icons';
import { Form, useSubmit } from 'react-router';
import { useState, useEffect } from 'react';
import type { SystemSectionProps } from './types';

export function SystemSection({ settings, onUpdate }: SystemSectionProps) {
  const submit = useSubmit();
  const [localSettings, setLocalSettings] = useState(settings);

  // 실제 다크모드 적용
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (localSettings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [localSettings.darkMode]);

  const handleLanguageChange = (language: string) => {
    const newSettings = {
      ...localSettings,
      language,
    };
    setLocalSettings(newSettings);

    // 즉시 서버에 저장
    const formData = new FormData();
    formData.append('intent', 'updateSystem');
    formData.append('language', language);
    formData.append('darkMode', localSettings.darkMode.toString());
    submit(formData, { method: 'POST' });
  };

  const handleDarkModeToggle = () => {
    const newDarkMode = !localSettings.darkMode;
    const newSettings = {
      ...localSettings,
      darkMode: newDarkMode,
    };
    setLocalSettings(newSettings);

    // 즉시 서버에 저장
    const formData = new FormData();
    formData.append('intent', 'updateSystem');
    formData.append('language', localSettings.language);
    formData.append('darkMode', newDarkMode.toString());
    submit(formData, { method: 'POST' });

    // 콜백도 호출 (기존 로직 유지)
    onUpdate(newSettings);
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
                현재 한국어만 지원됩니다 (MVP 버전)
              </p>
            </div>
          </div>
          <Select
            value={localSettings.language}
            onValueChange={handleLanguageChange}
            disabled
          >
            <SelectTrigger className="w-32 opacity-60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ko">한국어</SelectItem>
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
            checked={localSettings.darkMode}
            onCheckedChange={handleDarkModeToggle}
          />
        </div>
      </CardContent>
    </Card>
  );
}
