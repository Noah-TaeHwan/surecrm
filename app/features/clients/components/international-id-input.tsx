/**
 * 국제적 신분증 ID 입력 컴포넌트
 *
 * 🌍 다국어 지원:
 * - 한국어: 주민등록번호 (엄격한 검증)
 * - 영어: Social Security Number (기본 검증)
 * - 일본어: マイナンバー (기본 검증)
 *
 * 🔒 보안 기능:
 * - 언어별 맞춤 마스킹
 * - 실시간 유효성 검증
 * - 민감정보 보호
 */

import { useState, useEffect } from 'react';
import { Input } from '~/common/components/ui/input';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import { Label } from '~/common/components/ui/label';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react';
import {
  validateInternationalId,
  formatIdInput,
  maskIdInput,
  getIdConfigForLanguage,
  type SupportedLanguage,
  type InternationalIdResult,
} from '~/lib/utils/international-id-utils';
import { useTranslation } from 'react-i18next';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';

interface InternationalIdInputProps {
  value?: string;
  onChange: (
    value: string,
    validationResult: InternationalIdResult | null
  ) => void;
  onValidatedData?: (data: {
    birthDate?: Date;
    gender?: 'male' | 'female';
    age?: number;
  }) => void;
  disabled?: boolean;
  required?: boolean;
  showExtractedInfo?: boolean;
  className?: string;
  language?: SupportedLanguage;
}

export function InternationalIdInput({
  value = '',
  onChange,
  onValidatedData,
  disabled = false,
  required = false,
  showExtractedInfo = true,
  className = '',
  language = 'ko',
}: InternationalIdInputProps) {
  const { t, i18n } = useHydrationSafeTranslation('clients');
  const [inputValue, setInputValue] = useState(value);
  const [validationResult, setValidationResult] =
    useState<InternationalIdResult | null>(null);
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // 현재 언어에 따른 ID 설정
  const currentLanguage = (
    i18n.language?.startsWith('ko')
      ? 'ko'
      : i18n.language?.startsWith('ja')
        ? 'ja'
        : 'en'
  ) as SupportedLanguage;
  const idConfig = getIdConfigForLanguage(language || currentLanguage);

  // 초기값 설정
  useEffect(() => {
    if (value && value !== inputValue) {
      setInputValue(value);
      handleValidation(value);
    }
  }, [value]);

  // 언어 변경 시 재검증
  useEffect(() => {
    if (inputValue) {
      handleValidation(inputValue);
    }
  }, [currentLanguage, language]);

  // 입력값 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatIdInput(rawValue, language || currentLanguage);

    setInputValue(formattedValue);

    // 실시간 검증
    const cleanValue = formattedValue.replace(/[^0-9]/g, '');
    if (cleanValue.length >= idConfig.format.replace(/[^N]/g, '').length) {
      handleValidation(formattedValue);
    } else {
      setValidationResult(null);
      onChange(formattedValue, null);
    }
  };

  // ID 검증
  const handleValidation = async (idNumber: string) => {
    setIsValidating(true);

    try {
      const result = validateInternationalId(
        idNumber,
        language || currentLanguage
      );
      setValidationResult(result);
      onChange(idNumber, result);

      // 추출된 정보 콜백 (한국어에서만)
      if (
        result.isValid &&
        result.birthDate &&
        result.gender &&
        onValidatedData
      ) {
        onValidatedData({
          birthDate: result.birthDate,
          gender: result.gender,
          age: result.extractedInfo?.age,
        });
      }
    } catch (error) {
      console.error('ID 검증 오류:', error);
      const errorResult: InternationalIdResult = {
        isValid: false,
        errorMessage: t(
          'idInput.validationError',
          '검증 중 오류가 발생했습니다.'
        ),
      };
      setValidationResult(errorResult);
      onChange(idNumber, errorResult);
    }

    setIsValidating(false);
  };

  // 마스킹 토글
  const toggleSensitiveData = () => {
    setShowSensitiveData(!showSensitiveData);
  };

  // 보안 경고 메시지
  const getSecurityMessage = () => {
    if (currentLanguage === 'ko') {
      return t(
        'idInput.securityWarning',
        '민감한 개인정보입니다. 입력된 정보는 최고 수준으로 암호화되어 저장됩니다.'
      );
    } else if (currentLanguage === 'en') {
      return 'Sensitive personal information. All data is encrypted with the highest security standards.';
    } else {
      return '機密性の高い個人情報です。入力された情報は最高レベルの暗号化で保存されます。';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 보안 경고 */}
      <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
        <Shield className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 dark:text-amber-300">
          <strong>{t('idInput.sensitiveInfo', '민감한 개인정보')}</strong>
          <br />
          {getSecurityMessage()}
        </AlertDescription>
      </Alert>

      {/* 입력 필드 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label
            htmlFor="international-id-input"
            className="text-sm font-medium"
          >
            {idConfig.label}{' '}
            {required && <span className="text-red-500">*</span>}
          </Label>

          {/* 언어 표시 배지 */}
          <Badge variant="outline" className="text-xs">
            {currentLanguage.toUpperCase()}
          </Badge>

          {inputValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleSensitiveData}
              className="h-6 px-2"
            >
              {showSensitiveData ? (
                <EyeOff className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>

        <div className="relative">
          <Input
            id="international-id-input"
            type="text"
            value={
              showSensitiveData
                ? inputValue
                : maskIdInput(inputValue, language || currentLanguage)
            }
            onChange={handleInputChange}
            disabled={disabled || isValidating}
            placeholder={idConfig.placeholder}
            maxLength={idConfig.maxLength}
            className={`font-mono ${
              validationResult?.isValid === false
                ? 'border-destructive'
                : validationResult?.isValid === true
                  ? 'border-green-500'
                  : ''
            }`}
            autoComplete="off"
          />

          {isValidating && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          )}
        </div>

        {/* 입력 안내 */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <div>
            <div>{idConfig.description}</div>
            <div className="mt-1">
              {t('idInput.example', '예시')}:{' '}
              <code className="bg-muted px-1 rounded">{idConfig.example}</code>
            </div>
          </div>
        </div>
      </div>

      {/* 검증 결과 표시 */}
      {validationResult && (
        <div className="space-y-2">
          {validationResult.isValid ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>{t('idInput.valid', '유효한 ID입니다')}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <XCircle className="h-4 w-4" />
              <span>{validationResult.errorMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* 추출된 정보 표시 (한국어에서만) */}
      {showExtractedInfo &&
        validationResult?.isValid &&
        validationResult.birthDate &&
        validationResult.gender &&
        currentLanguage === 'ko' && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
              {t('idInput.extractedInfo', '추출된 정보')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  {t('idInput.birthDate', '생년월일')}:
                </span>
                <div className="text-blue-800 dark:text-blue-300">
                  {validationResult.birthDate.toLocaleDateString('ko-KR')}
                </div>
              </div>
              <div>
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  {t('idInput.gender', '성별')}:
                </span>
                <div className="text-blue-800 dark:text-blue-300">
                  {validationResult.gender === 'male'
                    ? t('idInput.male', '남성')
                    : t('idInput.female', '여성')}
                </div>
              </div>
              {validationResult.extractedInfo?.age && (
                <div>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    {t('idInput.age', '나이')}:
                  </span>
                  <div className="text-blue-800 dark:text-blue-300">
                    {validationResult.extractedInfo.age}
                    {t('idInput.ageUnit', '세')}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
}
