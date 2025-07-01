import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';
import { Button } from '~/common/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/common/components/ui/dropdown-menu';
import { Badge } from '~/common/components/ui/badge';
import { Globe, Check } from 'lucide-react';
import {
  changeLanguageClient,
  detectClientLanguage,
} from '~/lib/i18n/language-manager.client';
import {
  LANGUAGE_CONFIG,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from '~/lib/i18n/index';

interface LanguageSelectorProps {
  variant?: 'button' | 'minimal' | 'badge';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showLabel?: boolean;
}

export function LanguageSelector({
  variant = 'button',
  size = 'default',
  className = '',
  showLabel = true,
}: LanguageSelectorProps) {
  const { t, i18n } = useHydrationSafeTranslation('common');
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentLanguage, setCurrentLanguage] =
    useState<SupportedLanguage>('ko');
  const [isChanging, setIsChanging] = useState(false);

  // Hydration 완료 후 언어 상태 동기화
  useEffect(() => {
    const detectedLanguage = detectClientLanguage();
    setCurrentLanguage(detectedLanguage);
    setIsHydrated(true);
  }, []);

  // i18next 언어 변경 감지
  useEffect(() => {
    if (isHydrated && i18n.language) {
      setCurrentLanguage(i18n.language as SupportedLanguage);
    }
  }, [i18n.language, isHydrated]);

  const handleLanguageChange = async (language: SupportedLanguage) => {
    if (language === currentLanguage) return;

    setIsChanging(true);

    try {
      const success = await changeLanguageClient(language);
      if (success) {
        // 언어 상태를 즉시 업데이트
        setCurrentLanguage(language);

        // i18next가 번역 리소스를 로드할 시간을 제공
        // react-i18next는 자동으로 모든 useTranslation 훅을 업데이트함
        setTimeout(() => {
          setIsChanging(false);
        }, 200); // UI 업데이트를 위한 충분한 시간 제공
      } else {
        setIsChanging(false);
      }
    } catch (error) {
      console.error('언어 변경 실패:', error);
      setIsChanging(false);
    }
  };

  // Hydration 전에는 한국어 기본값으로 렌더링
  const displayLanguage = isHydrated ? currentLanguage : 'ko';
  const displayConfig = LANGUAGE_CONFIG[displayLanguage];

  if (variant === 'badge') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Badge
            variant="outline"
            className={`cursor-pointer hover:bg-accent ${className}`}
          >
            <span className="mr-1">{displayConfig.flag}</span>
            {displayConfig.name}
          </Badge>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {SUPPORTED_LANGUAGES.map(lang => {
            const config = LANGUAGE_CONFIG[lang];
            const isSelected = displayLanguage === lang;

            return (
              <DropdownMenuItem
                key={lang}
                className={`cursor-pointer ${isSelected ? 'bg-accent' : ''}`}
                onClick={() => handleLanguageChange(lang)}
                disabled={isChanging}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span>{config.flag}</span>
                    <span>{config.nativeName}</span>
                  </div>
                  {isSelected && <Check className="h-4 w-4" />}
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === 'minimal') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1 ${className}`}
            disabled={isChanging}
          >
            <span>{displayConfig.flag}</span>
            <span className="text-xs">{displayLanguage.toUpperCase()}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {SUPPORTED_LANGUAGES.map(lang => {
            const config = LANGUAGE_CONFIG[lang];
            const isSelected = displayLanguage === lang;

            return (
              <DropdownMenuItem
                key={lang}
                className={`cursor-pointer ${isSelected ? 'bg-accent' : ''}`}
                onClick={() => handleLanguageChange(lang)}
                disabled={isChanging}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span>{config.flag}</span>
                    <span className="text-sm">{config.nativeName}</span>
                  </div>
                  {isSelected && <Check className="h-4 w-4" />}
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default button variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={size}
          className={`gap-2 ${className}`}
          disabled={isChanging}
        >
          <Globe className="h-4 w-4" />
          <span className="flex items-center gap-1">
            <span>{displayConfig.flag}</span>
            {showLabel && (
              <span className="hidden sm:inline">
                {isHydrated ? t('language') : '언어'}
              </span>
            )}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground border-b">
          {isHydrated ? t('selectLanguage') : '언어 선택'}
        </div>
        {SUPPORTED_LANGUAGES.map(lang => {
          const config = LANGUAGE_CONFIG[lang];
          const isSelected = displayLanguage === lang;

          return (
            <DropdownMenuItem
              key={lang}
              className={`cursor-pointer ${isSelected ? 'bg-accent' : ''}`}
              onClick={() => handleLanguageChange(lang)}
              disabled={isChanging}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{config.flag}</span>
                  <div className="flex flex-col">
                    <span className="font-medium">{config.nativeName}</span>
                    <span className="text-xs text-muted-foreground">
                      {config.name}
                    </span>
                  </div>
                </div>
                {isSelected && <Check className="h-4 w-4 text-primary" />}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// 🎯 사용 예시 컴포넌트
export function LanguageSelectorDemo() {
  const { t } = useTranslation(['common', 'navigation']);

  return (
    <div className="space-y-6 p-6 border rounded-lg">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {t('navigation:header.settings')} -{' '}
          {t('common:label.language', { defaultValue: '언어' })}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t('common:message.info', { defaultValue: '언어를 선택해주세요.' })}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            드롭다운 형태 (기본)
          </label>
          <LanguageSelector />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">버튼 형태</label>
          <LanguageSelector variant="button" />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">작은 크기</label>
          <LanguageSelector size="sm" className="w-40" />
        </div>
      </div>

      <div className="pt-4 border-t">
        <h4 className="font-medium mb-2">번역 테스트:</h4>
        <ul className="space-y-1 text-sm">
          <li>• {t('common:button.save')}</li>
          <li>• {t('common:button.cancel')}</li>
          <li>• {t('common:message.success')}</li>
          <li>• {t('navigation:header.dashboard')}</li>
          <li>• {t('navigation:tabs.overview')}</li>
        </ul>
      </div>
    </div>
  );
}
