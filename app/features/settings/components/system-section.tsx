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
import { Badge } from '~/common/components/ui/badge';
import { GearIcon, GlobeIcon, SunIcon, MoonIcon } from '@radix-ui/react-icons';
import { Form, useSubmit } from 'react-router';
import { useState, useEffect } from 'react';
import type { SystemSectionProps } from '../types';

export function SystemSection({ settings, onUpdate }: SystemSectionProps) {
  const submit = useSubmit();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isApplying, setIsApplying] = useState(false);

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
    setIsApplying(true);

    // 즉시 서버에 저장
    const formData = new FormData();
    formData.append('intent', 'updateSystem');
    formData.append('language', language);
    formData.append('darkMode', localSettings.darkMode.toString());
    submit(formData, { method: 'POST' });

    setTimeout(() => setIsApplying(false), 1000);
  };

  const handleDarkModeToggle = () => {
    const newDarkMode = !localSettings.darkMode;
    const newSettings = {
      ...localSettings,
      darkMode: newDarkMode,
    };
    setLocalSettings(newSettings);
    setIsApplying(true);

    // 즉시 서버에 저장
    const formData = new FormData();
    formData.append('intent', 'updateSystem');
    formData.append('language', localSettings.language);
    formData.append('darkMode', newDarkMode.toString());
    submit(formData, { method: 'POST' });

    // 콜백도 호출 (기존 로직 유지)
    onUpdate(newSettings);

    setTimeout(() => setIsApplying(false), 1000);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GearIcon className="h-5 w-5" />
            <div>
              <CardTitle className="flex items-center gap-2">
                ⚙️ 시스템 설정
                {isApplying && (
                  <Badge variant="secondary" className="animate-pulse text-xs">
                    적용 중...
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                앱의 언어와 테마를 설정하세요. 보험설계사 업무에 최적화된 환경을
                제공합니다.
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 언어 설정 */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3 flex-1">
            <GlobeIcon className="h-4 w-4 text-blue-500" />
            <div>
              <Label className="font-medium flex items-center gap-2">
                언어 설정
                <Badge variant="outline" className="text-xs">
                  MVP
                </Badge>
              </Label>
              <p className="text-sm text-muted-foreground">
                현재 한국어만 지원됩니다. 추후 다국어 지원 예정
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
              <SelectItem value="ko">🇰🇷 한국어</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 다크모드 설정 */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3 flex-1">
            {localSettings.darkMode ? (
              <MoonIcon className="h-4 w-4 text-blue-500" />
            ) : (
              <SunIcon className="h-4 w-4 text-orange-500" />
            )}
            <div>
              <Label className="font-medium flex items-center gap-2">
                다크 모드
                <Badge
                  variant={localSettings.darkMode ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {localSettings.darkMode ? '활성화' : '비활성화'}
                </Badge>
              </Label>
              <p className="text-sm text-muted-foreground">
                {localSettings.darkMode
                  ? '어두운 테마로 눈의 피로를 줄입니다'
                  : '밝은 테마로 선명한 화면을 제공합니다'}
              </p>
            </div>
          </div>
          <Switch
            checked={localSettings.darkMode}
            onCheckedChange={handleDarkModeToggle}
            disabled={isApplying}
          />
        </div>

        {/* 보험설계사 특화 설정 안내 */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-lg">💼</div>
            <div>
              <h4 className="font-medium text-sm mb-1">보험설계사 최적화</h4>
              <p className="text-xs text-muted-foreground mb-2">
                SureCRM은 보험설계사의 업무 패턴에 맞춰 최적화되어 있습니다:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• 📱 카카오톡 연동으로 빠른 고객 소통</li>
                <li>• 📊 실시간 성과 대시보드</li>
                <li>• 🎯 목표 관리 및 진행률 추적</li>
                <li>• 👥 팀 협업 및 추천 관리</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 시스템 정보 */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium">앱 버전</div>
            <div className="text-xs text-muted-foreground">MVP v1.0</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium">마지막 업데이트</div>
            <div className="text-xs text-muted-foreground">2024.12</div>
          </div>
        </div>

        {/* 하단 안내 */}
        <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-md">
          <p className="text-sm text-orange-800 dark:text-orange-400">
            💡 설정 변경사항은 즉시 적용됩니다. 문제가 발생하면 새로고침 후 다시
            시도해주세요.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
