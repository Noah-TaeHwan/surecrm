import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/common/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Input } from '~/common/components/ui/input';
import { Badge } from '~/common/components/ui/badge';
import { Checkbox } from '~/common/components/ui/checkbox';
import {
  PersonIcon,
  MobileIcon,
  EnvelopeClosedIcon,
  HomeIcon,
  LockClosedIcon,
  GearIcon,
} from '@radix-ui/react-icons';
import type { UseFormReturn } from 'react-hook-form';
import type { ClientFormData } from '../lib/form-schema';
import type { ClientPrivacyLevel } from '../types';

interface ClientBasicInfoFormProps {
  form: UseFormReturn<ClientFormData>;
  duplicateWarning?: string | null;
  onPhoneChange?: (phone: string) => void;
  isEditing?: boolean;
  currentPrivacyLevel?: ClientPrivacyLevel;
  onPrivacyChange?: (level: ClientPrivacyLevel) => void;
  onSecurityAudit?: (action: string, field: string) => void;
}

export function ClientBasicInfoForm({
  form,
  duplicateWarning,
  onPhoneChange,
  isEditing = false,
  currentPrivacyLevel = 'restricted',
  onPrivacyChange,
  onSecurityAudit,
}: ClientBasicInfoFormProps) {
  const [showSecurityOptions, setShowSecurityOptions] = useState(false);
  const [dataProcessingConsent, setDataProcessingConsent] = useState(false);

  const shouldMaskField = (fieldName: string) => {
    if (currentPrivacyLevel === 'confidential')
      return ['phone', 'email', 'address'].includes(fieldName);
    if (currentPrivacyLevel === 'private')
      return ['address'].includes(fieldName);
    return false;
  };

  const handleSecurityAudit = (action: string, field: string) => {
    onSecurityAudit?.(action, field);
    console.log(`🔒 보안 감사: ${action} - ${field}`);
  };

  const handleFieldChange = (
    fieldName: string,
    value: string,
    originalHandler: (value: string) => void
  ) => {
    handleSecurityAudit('field_modified', fieldName);
    originalHandler(value);

    if (fieldName === 'phone') {
      onPhoneChange?.(value);
    }
  };

  const getPrivacyLevelBadge = (level: ClientPrivacyLevel) => {
    const badges = {
      public: (
        <Badge variant="outline" className="text-green-600 border-green-600">
          공개
        </Badge>
      ),
      restricted: (
        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
          제한
        </Badge>
      ),
      private: (
        <Badge variant="outline" className="text-orange-600 border-orange-600">
          비공개
        </Badge>
      ),
      confidential: (
        <Badge variant="outline" className="text-red-600 border-red-600">
          기밀
        </Badge>
      ),
    };
    return badges[level];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            기본 정보
            {(currentPrivacyLevel === 'confidential' ||
              currentPrivacyLevel === 'private') && (
              <LockClosedIcon className="h-4 w-4 text-amber-500" />
            )}
          </span>
          {getPrivacyLevelBadge(currentPrivacyLevel)}
        </CardTitle>
        <CardDescription>
          고객의 기본적인 연락처 정보를 입력하세요
          {isEditing && (
            <span className="text-amber-600 ml-2">⚠️ 편집 모드</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-slate-50 p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium flex items-center gap-2">
              <GearIcon className="h-4 w-4" />
              개인정보 보호 설정
            </h4>
            <button
              type="button"
              onClick={() => setShowSecurityOptions(!showSecurityOptions)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showSecurityOptions ? '접기' : '보기'}
            </button>
          </div>

          {showSecurityOptions && (
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  개인정보 보호 레벨
                </label>
                <Select
                  onValueChange={(value: ClientPrivacyLevel) => {
                    onPrivacyChange?.(value);
                    handleSecurityAudit('privacy_level_changed', value);
                  }}
                  value={currentPrivacyLevel}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      공개 - 모든 직원이 볼 수 있음
                    </SelectItem>
                    <SelectItem value="restricted">
                      제한 - 팀 내에서만 공유
                    </SelectItem>
                    <SelectItem value="private">
                      비공개 - 관리자와 담당자만
                    </SelectItem>
                    <SelectItem value="confidential">
                      기밀 - 담당자만 접근
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  고객 정보의 공개 범위를 설정하세요
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dataProcessingConsent"
                  checked={dataProcessingConsent}
                  onCheckedChange={checked => {
                    setDataProcessingConsent(checked === true);
                    handleSecurityAudit(
                      'consent_changed',
                      `data_processing:${checked}`
                    );
                  }}
                />
                <label htmlFor="dataProcessingConsent" className="text-sm">
                  개인정보 처리 및 보관에 동의합니다 (GDPR 준수)
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이름 *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <PersonIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      className="pl-10"
                      placeholder="홍길동"
                      onChange={e =>
                        handleFieldChange(
                          'fullName',
                          e.target.value,
                          field.onChange
                        )
                      }
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  휴대폰 번호{' '}
                  <span className="text-muted-foreground">(선택사항)</span>
                  {shouldMaskField('phone') && (
                    <LockClosedIcon className="h-3 w-3 text-amber-500" />
                  )}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <MobileIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      className="pl-10"
                      placeholder={
                        shouldMaskField('phone')
                          ? '***-****-****'
                          : '010-0000-0000'
                      }
                      type={shouldMaskField('phone') ? 'password' : 'text'}
                      onChange={e =>
                        handleFieldChange(
                          'phone',
                          e.target.value,
                          field.onChange
                        )
                      }
                    />
                  </div>
                </FormControl>
                <FormMessage />
                {duplicateWarning && (
                  <p className="text-sm text-yellow-600 mt-1">
                    {duplicateWarning}
                  </p>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  이메일
                  {shouldMaskField('email') && (
                    <LockClosedIcon className="h-3 w-3 text-amber-500" />
                  )}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <EnvelopeClosedIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      type={shouldMaskField('email') ? 'password' : 'email'}
                      className="pl-10"
                      placeholder={
                        shouldMaskField('email')
                          ? '***@****.***'
                          : 'example@email.com'
                      }
                      onChange={e =>
                        handleFieldChange(
                          'email',
                          e.target.value,
                          field.onChange
                        )
                      }
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  주소
                  {shouldMaskField('address') && (
                    <LockClosedIcon className="h-3 w-3 text-amber-500" />
                  )}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <HomeIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      className="pl-10"
                      placeholder={
                        shouldMaskField('address')
                          ? '***시 ***구...'
                          : '서울시 강남구...'
                      }
                      type={shouldMaskField('address') ? 'password' : 'text'}
                      onChange={e =>
                        handleFieldChange(
                          'address',
                          e.target.value,
                          field.onChange
                        )
                      }
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="occupation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>직업</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="회사원, 자영업자 등"
                    onChange={e =>
                      handleFieldChange(
                        'occupation',
                        e.target.value,
                        field.onChange
                      )
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {!dataProcessingConsent && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ 개인정보 처리 동의가 필요합니다. GDPR 및 개인정보보호법 준수를
              위해 동의 후 저장해주세요.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
