/**
 * 한국 주민등록번호 입력 컴포넌트
 *
 * 🔒 보안 기능:
 * - 실시간 유효성 검증
 * - 자동 마스킹 표시
 * - 민감정보 경고
 * - 생년월일/성별 자동 추출
 *
 * 🎨 UX 기능:
 * - 자동 하이픈 추가
 * - 실시간 피드백
 * - 확인 모달
 * - 접근성 지원
 */

import { useState, useEffect } from 'react';
import { Input } from '~/common/components/ui/input';
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '~/common/components/ui/dialog';
import { Label } from '~/common/components/ui/label';
import {
  parseKoreanId,
  formatKoreanIdInput,
  maskKoreanId,
  formatBirthDate,
  formatGender,
  calculateAge,
  type KoreanIdParseResult,
} from '~/lib/utils/korean-id-utils';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface KoreanIdInputProps {
  value?: string;
  onChange: (value: string, parseResult: KoreanIdParseResult | null) => void;
  onValidatedData?: (data: {
    birthDate: Date;
    gender: 'male' | 'female';
    age: number;
  }) => void;
  disabled?: boolean;
  required?: boolean;
  showExtractedInfo?: boolean;
  className?: string;
}

export function KoreanIdInput({
  value = '',
  onChange,
  onValidatedData,
  disabled = false,
  required = false,
  showExtractedInfo = true,
  className = '',
}: KoreanIdInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [parseResult, setParseResult] = useState<KoreanIdParseResult | null>(
    null
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [pendingValue, setPendingValue] = useState('');

  // 초기값 설정
  useEffect(() => {
    if (value && value !== inputValue) {
      setInputValue(value);
      handleValidation(value);
    }
  }, [value]);

  // 입력값 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatKoreanIdInput(rawValue);

    setInputValue(formattedValue);

    // 실시간 검증 (13자리 완성 시에만)
    if (formattedValue.replace('-', '').length === 13) {
      handleValidation(formattedValue);
    } else {
      setParseResult(null);
      onChange(formattedValue, null);
    }
  };

  // 주민등록번호 검증
  const handleValidation = async (idNumber: string) => {
    setIsValidating(true);

    try {
      const result = parseKoreanId(idNumber);
      setParseResult(result);

      if (result.isValid) {
        // 유효한 경우 확인 모달 표시
        setPendingValue(idNumber);
        setShowConfirmModal(true);
      } else {
        // 무효한 경우 즉시 반영
        onChange(idNumber, result);
      }
    } catch (error) {
      console.error('주민등록번호 검증 오류:', error);
      setParseResult({
        isValid: false,
        birthDate: null,
        gender: null,
        century: null,
        genderCode: null,
        maskedId: maskKoreanId(idNumber),
        errors: ['검증 중 오류가 발생했습니다.'],
      });
    }

    setIsValidating(false);
  };

  // 저장 확인
  const handleConfirmSave = () => {
    if (parseResult && parseResult.isValid) {
      onChange(pendingValue, parseResult);

      // 추출된 정보 콜백
      if (onValidatedData && parseResult.birthDate && parseResult.gender) {
        onValidatedData({
          birthDate: parseResult.birthDate,
          gender: parseResult.gender,
          age: calculateAge(parseResult.birthDate),
        });
      }
    }

    setShowConfirmModal(false);
    setPendingValue('');
  };

  // 저장 취소
  const handleCancelSave = () => {
    setShowConfirmModal(false);
    setPendingValue('');
    setInputValue(value); // 원래 값으로 복원
  };

  // 마스킹 토글
  const toggleSensitiveData = () => {
    setShowSensitiveData(!showSensitiveData);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 보안 경고 */}
      <Alert className="border-amber-200 bg-amber-50">
        <Shield className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>민감한 개인정보입니다.</strong> 입력된 주민등록번호는 최고
          수준으로 암호화되어 저장됩니다.
        </AlertDescription>
      </Alert>

      {/* 입력 필드 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="korean-id-input" className="text-sm font-medium">
            주민등록번호 {required && <span className="text-red-500">*</span>}
          </Label>

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
            id="korean-id-input"
            type="text"
            value={showSensitiveData ? inputValue : maskKoreanId(inputValue)}
            onChange={handleInputChange}
            disabled={disabled || isValidating}
            placeholder="YYMMDD-NNNNNNN"
            maxLength={14}
            className={`font-mono ${
              parseResult?.isValid === false ? 'border-red-500' : ''
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
        <p className="text-xs text-muted-foreground">
          13자리 주민등록번호를 입력하세요. 6자리 입력 후 자동으로 하이픈이
          추가됩니다.
        </p>
      </div>

      {/* 검증 결과 표시 */}
      {parseResult && (
        <div className="space-y-2">
          {parseResult.isValid ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <Badge
                variant="outline"
                className="border-green-200 text-green-700"
              >
                유효한 주민등록번호
              </Badge>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <Badge
                  variant="outline"
                  className="border-red-200 text-red-700"
                >
                  유효하지 않음
                </Badge>
              </div>
              <div className="text-sm text-red-600 space-y-1">
                {parseResult.errors.map((error, index) => (
                  <div key={index}>• {error}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 추출된 정보 표시 */}
      {showExtractedInfo &&
        parseResult?.isValid &&
        parseResult.birthDate &&
        parseResult.gender && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              추출된 정보
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-blue-600 font-medium">생년월일:</span>
                <div className="text-blue-800">
                  {formatBirthDate(parseResult.birthDate)}
                </div>
              </div>
              <div>
                <span className="text-blue-600 font-medium">성별:</span>
                <div className="text-blue-800">
                  {formatGender(parseResult.gender)}
                </div>
              </div>
              <div>
                <span className="text-blue-600 font-medium">나이:</span>
                <div className="text-blue-800">
                  {calculateAge(parseResult.birthDate)}세
                </div>
              </div>
            </div>
          </div>
        )}

      {/* 확인 모달 */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              주민등록번호 저장 확인
            </DialogTitle>
            <DialogDescription>
              민감한 개인정보를 저장하시겠습니까?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert className="border-amber-200 bg-amber-50">
              <AlertDescription className="text-amber-800">
                <div className="space-y-2">
                  <div>
                    <strong>입력된 정보:</strong> {maskKoreanId(pendingValue)}
                  </div>
                  {parseResult?.birthDate && (
                    <div>
                      <strong>생년월일:</strong>{' '}
                      {formatBirthDate(parseResult.birthDate)}
                    </div>
                  )}
                  {parseResult?.gender && (
                    <div>
                      <strong>성별:</strong> {formatGender(parseResult.gender)}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            <div className="text-sm text-muted-foreground space-y-1">
              <div>• 주민등록번호는 AES-256 암호화로 저장됩니다</div>
              <div>• 생년월일과 성별 정보가 자동으로 업데이트됩니다</div>
              <div>• 개인정보보호법에 따라 엄격히 관리됩니다</div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelSave}>
              취소
            </Button>
            <Button
              onClick={handleConfirmSave}
              className="bg-blue-600 hover:bg-blue-700"
            >
              저장하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
