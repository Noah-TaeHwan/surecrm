import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Button } from '~/common/components/ui/button';
import {
  SUPPORTED_LANGUAGES,
  LANGUAGE_CONFIG,
  changeLanguage,
  type SupportedLanguage,
} from '~/lib/i18n';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'buttons';
  size?: 'sm' | 'md' | 'lg';
  showFlag?: boolean;
  showNativeName?: boolean;
  className?: string;
}

export function LanguageSelector({
  variant = 'dropdown',
  size = 'md',
  showFlag = true,
  showNativeName = true,
  className = '',
}: LanguageSelectorProps) {
  const { i18n, t } = useTranslation('common');
  const [isChanging, setIsChanging] = useState(false);

  const currentLanguage = i18n.language as SupportedLanguage;

  const handleLanguageChange = async (language: SupportedLanguage) => {
    if (language === currentLanguage) return;

    setIsChanging(true);
    try {
      await changeLanguage(language);
      // 페이지 새로고침 없이 실시간 언어 변경
      // 필요에 따라 URL도 변경할 수 있음
    } catch (error) {
      console.error('언어 변경 실패:', error);
    } finally {
      setIsChanging(false);
    }
  };

  // Button size prop 매핑
  const getButtonSize = (size: 'sm' | 'md' | 'lg'): 'sm' | 'lg' | 'default' => {
    if (size === 'sm') return 'sm';
    if (size === 'lg') return 'lg';
    return 'default';
  };

  if (variant === 'buttons') {
    return (
      <div className={`flex gap-1 ${className}`}>
        {SUPPORTED_LANGUAGES.map(lang => {
          const config = LANGUAGE_CONFIG[lang];
          const isActive = lang === currentLanguage;

          return (
            <Button
              key={lang}
              variant={isActive ? 'default' : 'outline'}
              size={getButtonSize(size)}
              onClick={() => handleLanguageChange(lang)}
              disabled={isChanging}
              className={`
                ${size === 'sm' ? 'px-2 py-1 text-xs' : ''}
                ${size === 'lg' ? 'px-4 py-2 text-lg' : ''}
                ${isActive ? 'pointer-events-none' : ''}
              `}
            >
              {showFlag && <span className="mr-1">{config.flag}</span>}
              {showNativeName ? config.nativeName : config.name}
            </Button>
          );
        })}
      </div>
    );
  }

  return (
    <Select
      value={currentLanguage}
      onValueChange={value => handleLanguageChange(value as SupportedLanguage)}
      disabled={isChanging}
    >
      <SelectTrigger
        className={`${className} ${size === 'sm' ? 'h-8 text-xs' : ''} ${
          size === 'lg' ? 'h-12 text-lg' : ''
        } w-auto px-2`}
      >
        <SelectValue>
          <div className="flex items-center">
            <span
              className={`${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base'}`}
            >
              {LANGUAGE_CONFIG[currentLanguage].flag}
            </span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_LANGUAGES.map(lang => {
          const config = LANGUAGE_CONFIG[lang];
          return (
            <SelectItem key={lang} value={lang}>
              <div className="flex items-center gap-2">
                {showFlag && <span>{config.flag}</span>}
                <span>{showNativeName ? config.nativeName : config.name}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
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
          <LanguageSelector variant="buttons" />
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
