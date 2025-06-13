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
import { Textarea } from '~/common/components/ui/textarea';
import { Badge } from '~/common/components/ui/badge';
import { Checkbox } from '~/common/components/ui/checkbox';
import {
  BarChartIcon,
  StarIcon,
  PersonIcon,
  LockClosedIcon,
  EyeClosedIcon,
  PlusIcon,
} from '@radix-ui/react-icons';
import type { UseFormReturn } from 'react-hook-form';
import type { ClientFormData } from '../lib/form-schema';
import type { ClientPrivacyLevel } from '../types';
import { stageOptions, importanceOptions } from '../lib/form-schema';
import { TagManager } from './tag-manager';

interface Referrer {
  id: string;
  name: string;
  confidentialityLevel?: 'public' | 'restricted' | 'private' | 'confidential';
  relationshipType?: 'family' | 'friend' | 'colleague' | 'business' | 'other';
}

interface ClientSalesInfoFormProps {
  form: UseFormReturn<ClientFormData>;
  referrers: Referrer[];
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  isEditing?: boolean; // 🔒 편집 모드 여부
  currentPrivacyLevel?: ClientPrivacyLevel; // 🔒 현재 개인정보 보호 레벨
  onSecurityAudit?: (action: string, field: string) => void;
  showSensitiveData?: boolean; // 🔒 민감한 영업 정보 표시 여부
}

export function ClientSalesInfoForm({
  form,
  referrers,
  tags,
  onTagsChange,
  isEditing = false,
  currentPrivacyLevel = 'restricted',
  onSecurityAudit,
  showSensitiveData = false,
}: ClientSalesInfoFormProps) {
  const [showConfidentialInfo, setShowConfidentialInfo] = useState(false);
  const [salesInfoConsent, setSalesInfoConsent] = useState(false);

  // 🔒 **영업 정보 보안 레벨에 따른 데이터 마스킹**
  const shouldMaskSalesField = (fieldName: string) => {
    if (currentPrivacyLevel === 'confidential')
      return ['contractAmount', 'referredById', 'notes'].includes(fieldName);
    if (currentPrivacyLevel === 'private')
      return ['contractAmount', 'notes'].includes(fieldName);
    return false;
  };

  // 🔒 **보안 감사 로깅**
  const handleSecurityAudit = (action: string, field: string) => {
    onSecurityAudit?.(action, field);
    console.log(`🔒 영업정보 보안 감사: ${action} - ${field}`);
  };

  // 🔒 **필드 변경 시 보안 로깅**
  const handleFieldChange = (
    fieldName: string,
    value: string | number | undefined,
    originalHandler: (value: any) => void
  ) => {
    handleSecurityAudit('sales_field_modified', fieldName);
    originalHandler(value);
  };

  // 🔒 **금액 마스킹**
  const maskAmount = (amount: number | undefined) => {
    if (!amount) return '';
    if (shouldMaskSalesField('contractAmount')) return '***,***,***';
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 🔒 **중요도 배지**
  const getImportanceBadge = (importance: string) => {
    const badges = {
      high: (
        <Badge variant="destructive" className="flex items-center gap-1">
          <StarIcon className="h-3 w-3" />
          높음
        </Badge>
      ),
      medium: (
        <Badge variant="secondary" className="flex items-center gap-1">
          <StarIcon className="h-3 w-3" />
          보통
        </Badge>
      ),
      low: (
        <Badge variant="outline" className="flex items-center gap-1">
          <StarIcon className="h-3 w-3" />
          낮음
        </Badge>
      ),
    };
    return badges[importance as keyof typeof badges] || badges.medium;
  };

  // 🔒 **영업 단계 보안 레벨**
  const getStageSensitivity = (stageId: string) => {
    const sensitivestages = ['contract_pending', 'negotiation', 'closing'];
    return sensitivestages.includes(stageId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <BarChartIcon className="h-5 w-5" />
            영업 정보
            {(currentPrivacyLevel === 'confidential' ||
              currentPrivacyLevel === 'private') && (
              <LockClosedIcon className="h-4 w-4 text-amber-500" />
            )}
          </span>
          {form.watch('importance') &&
            getImportanceBadge(form.watch('importance'))}
        </CardTitle>
        <CardDescription>
          영업 단계와 관련 정보를 설정하세요
          {isEditing && (
            <span className="text-amber-600 ml-2">⚠️ 편집 모드</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 🔒 영업정보 보안 설정 */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              영업정보 보안 설정
            </h4>
            <button
              type="button"
              onClick={() => setShowConfidentialInfo(!showConfidentialInfo)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showConfidentialInfo ? '접기' : '보기'}
            </button>
          </div>

          {showConfidentialInfo && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="salesInfoConsent"
                  checked={salesInfoConsent}
                  onCheckedChange={checked => {
                    setSalesInfoConsent(checked === true);
                    handleSecurityAudit(
                      'sales_consent_changed',
                      `sales_info:${checked}`
                    );
                  }}
                />
                <label htmlFor="salesInfoConsent" className="text-sm">
                  영업정보 수집 및 분석에 동의합니다 (계약금액, 소개자 정보
                  포함)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <EyeClosedIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  민감한 영업정보는 {currentPrivacyLevel} 레벨로 보호됩니다
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="currentStageId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  영업 단계 *
                  {getStageSensitivity(field.value) && (
                    <Badge
                      variant="outline"
                      className="text-orange-600 border-orange-600"
                    >
                      민감
                    </Badge>
                  )}
                </FormLabel>
                <Select
                  onValueChange={value =>
                    handleFieldChange('currentStageId', value, field.onChange)
                  }
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="단계 선택" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {stageOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                        {getStageSensitivity(option.value) && ' 🔒'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
                {getStageSensitivity(field.value) && (
                  <FormDescription className="text-orange-600">
                    ⚠️ 이 단계는 기밀 영업정보를 포함합니다
                  </FormDescription>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="importance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>중요도 *</FormLabel>
                <Select
                  onValueChange={value =>
                    handleFieldChange('importance', value, field.onChange)
                  }
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="중요도 선택" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {importanceOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <StarIcon className="h-3 w-3" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="referredById"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <PersonIcon className="h-4 w-4" />
                  소개자
                  {shouldMaskSalesField('referredById') && (
                    <LockClosedIcon className="h-3 w-3 text-amber-500" />
                  )}
                </FormLabel>
                <Select
                  onValueChange={value =>
                    handleFieldChange('referredById', value, field.onChange)
                  }
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          shouldMaskSalesField('referredById')
                            ? '***'
                            : '소개자 선택'
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">없음</SelectItem>
                    {referrers.map(referrer => (
                      <SelectItem key={referrer.id} value={referrer.id}>
                        <div className="flex items-center gap-2">
                          {shouldMaskSalesField('referredById')
                            ? '***'
                            : referrer.name}
                          {referrer.confidentialityLevel === 'confidential' && (
                            <LockClosedIcon className="h-3 w-3 text-red-500" />
                          )}
                          {referrer.relationshipType && (
                            <Badge variant="outline" className="text-xs">
                              {referrer.relationshipType}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  이 고객을 소개한 사람을 선택하세요
                  {shouldMaskSalesField('referredById') && (
                    <span className="text-amber-600 ml-2">🔒 기밀정보</span>
                  )}
                </FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contractAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <PlusIcon className="h-4 w-4" />
                  예상 계약금액
                  {shouldMaskSalesField('contractAmount') && (
                    <LockClosedIcon className="h-3 w-3 text-amber-500" />
                  )}
                </FormLabel>
                <FormControl>
                  <Input
                    type={
                      shouldMaskSalesField('contractAmount')
                        ? 'password'
                        : 'number'
                    }
                    placeholder={
                      shouldMaskSalesField('contractAmount')
                        ? '***,***,***'
                        : '50,000,000'
                    }
                    value={
                      shouldMaskSalesField('contractAmount') && field.value
                        ? maskAmount(field.value)
                        : field.value || ''
                    }
                    onChange={e => {
                      const value = e.target.value
                        ? parseInt(e.target.value.replace(/,/g, ''))
                        : undefined;
                      handleFieldChange(
                        'contractAmount',
                        value,
                        field.onChange
                      );
                    }}
                  />
                </FormControl>
                <FormDescription>
                  예상 계약 금액을 원 단위로 입력하세요
                  {shouldMaskSalesField('contractAmount') && (
                    <span className="text-amber-600 ml-2">🔒 기밀정보</span>
                  )}
                </FormDescription>
                {field.value && !shouldMaskSalesField('contractAmount') && (
                  <p className="text-sm text-muted-foreground">
                    {new Intl.NumberFormat('ko-KR', {
                      style: 'currency',
                      currency: 'KRW',
                    }).format(field.value)}
                  </p>
                )}
              </FormItem>
            )}
          />
        </div>

        {/* 태그 관리 - 보안 강화 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">태그</label>
            {currentPrivacyLevel === 'confidential' && (
              <Badge
                variant="outline"
                className="text-red-600 border-red-600 text-xs"
              >
                <LockClosedIcon className="h-3 w-3 mr-1" />
                기밀
              </Badge>
            )}
          </div>
          <TagManager
            tags={tags}
            onTagsChange={newTags => {
              handleSecurityAudit('tags_modified', `count:${newTags.length}`);
              onTagsChange(newTags);
            }}
            placeholder={
              currentPrivacyLevel === 'confidential'
                ? '기밀 태그 입력'
                : '새 태그 입력'
            }
            label=""
          />
          {currentPrivacyLevel === 'confidential' && (
            <p className="text-xs text-red-600">
              🔒 이 태그들은 기밀로 분류되어 제한된 인원만 볼 수 있습니다
            </p>
          )}
        </div>

        {/* 메모 - 보안 강화 */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                메모
                {shouldMaskSalesField('notes') && (
                  <LockClosedIcon className="h-3 w-3 text-amber-500" />
                )}
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={4}
                  placeholder={
                    shouldMaskSalesField('notes')
                      ? '기밀 메모 - 민감한 영업정보 포함...'
                      : '고객에 대한 특이사항이나 중요한 정보를 입력하세요...'
                  }
                  onChange={e =>
                    handleFieldChange('notes', e.target.value, field.onChange)
                  }
                />
              </FormControl>
              {shouldMaskSalesField('notes') && (
                <FormDescription className="text-amber-600">
                  🔒 이 메모는 기밀정보로 분류되어 암호화되어 저장됩니다
                </FormDescription>
              )}
            </FormItem>
          )}
        />

        {/* 🔒 영업정보 보안 경고 */}
        {!salesInfoConsent && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-800">
              ⚠️ 영업정보 수집 동의가 필요합니다. 계약금액, 소개자 정보 등
              민감한 영업데이터 처리를 위해 동의해주세요.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
