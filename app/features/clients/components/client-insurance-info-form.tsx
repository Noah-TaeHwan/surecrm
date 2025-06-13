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
import { Label } from '~/common/components/ui/label';
import { Badge } from '~/common/components/ui/badge';
import { Checkbox } from '~/common/components/ui/checkbox';
import { Button } from '~/common/components/ui/button';
import { Textarea } from '~/common/components/ui/textarea';
import {
  GearIcon,
  HeartIcon,
  BackpackIcon,
  PersonIcon,
  LockClosedIcon,
  EyeClosedIcon,
  CalendarIcon,
  PlusIcon,
  Cross1Icon,
} from '@radix-ui/react-icons';
import type { UseFormReturn } from 'react-hook-form';
import type { ClientFormData } from '../lib/form-schema';
import type { ClientPrivacyLevel } from '../types';
import { insuranceTypeOptions, vehicleTypeOptions } from '../lib/form-schema';

interface HealthCondition {
  id: string;
  condition: string;
  severity: 'mild' | 'moderate' | 'severe';
  diagnosedDate: string;
  isActive: boolean;
  notes?: string;
}

interface FamilyMember {
  id: string;
  relationship: 'spouse' | 'child' | 'parent' | 'sibling';
  name: string;
  age: number;
  healthConditions?: HealthCondition[];
  currentInsurance?: string;
}

interface VehicleInfo {
  id: string;
  vehicleNumber: string;
  manufacturer: string;
  model: string;
  year: number;
  engineType: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
  drivingExperience: number;
  accidentHistory?: Array<{
    date: string;
    description: string;
    claimAmount?: number;
  }>;
}

interface ClientInsuranceInfoFormProps {
  form: UseFormReturn<ClientFormData>;
  watchInsuranceType: string;
  isEditing?: boolean; // 🔒 편집 모드 여부
  currentPrivacyLevel?: ClientPrivacyLevel; // 🔒 현재 개인정보 보호 레벨
  onSecurityAudit?: (action: string, field: string) => void;
  showSensitiveData?: boolean; // 🔒 민감한 건강정보 표시 여부
}

export function ClientInsuranceInfoForm({
  form,
  watchInsuranceType,
  isEditing = false,
  currentPrivacyLevel = 'restricted',
  onSecurityAudit,
  showSensitiveData = false,
}: ClientInsuranceInfoFormProps) {
  const [showHealthInfo, setShowHealthInfo] = useState(false);
  const [healthInfoConsent, setHealthInfoConsent] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [vehicles, setVehicles] = useState<VehicleInfo[]>([]);
  const [healthConditions, setHealthConditions] = useState<HealthCondition[]>(
    []
  );

  // 🔒 **보험 정보 보안 레벨에 따른 데이터 마스킹**
  const shouldMaskInsuranceField = (fieldName: string) => {
    if (currentPrivacyLevel === 'confidential')
      return [
        'healthConditions',
        'familyMembers',
        'vehicleInfo',
        'accidentHistory',
      ].includes(fieldName);
    if (currentPrivacyLevel === 'private')
      return ['healthConditions', 'accidentHistory'].includes(fieldName);
    return false;
  };

  // 🔒 **보안 감사 로깅**
  const handleSecurityAudit = (action: string, field: string) => {
    onSecurityAudit?.(action, field);
    console.log(`🔒 보험정보 보안 감사: ${action} - ${field}`);
  };

  // 🔒 **필드 변경 시 보안 로깅**
  const handleFieldChange = (
    fieldName: string,
    value: any,
    originalHandler: (value: any) => void
  ) => {
    handleSecurityAudit('insurance_field_modified', fieldName);
    originalHandler(value);
  };

  // 🔒 **보험 유형별 민감도 레벨**
  const getInsuranceTypeSensitivity = (type: string) => {
    const highSensitivity = ['health', 'cancer', 'dental', 'family'];
    const mediumSensitivity = ['life', 'pension', 'disability'];

    if (highSensitivity.includes(type)) return 'high';
    if (mediumSensitivity.includes(type)) return 'medium';
    return 'low';
  };

  // 🔒 **민감도 배지**
  const getSensitivityBadge = (level: string) => {
    const badges = {
      high: (
        <Badge variant="destructive" className="flex items-center gap-1">
          <LockClosedIcon className="h-3 w-3" />
          높음
        </Badge>
      ),
      medium: (
        <Badge variant="secondary" className="flex items-center gap-1">
          <EyeClosedIcon className="h-3 w-3" />
          보통
        </Badge>
      ),
      low: (
        <Badge variant="outline" className="flex items-center gap-1">
          낮음
        </Badge>
      ),
    };
    return badges[level as keyof typeof badges] || badges.low;
  };

  // 🔒 **가족 구성원 추가**
  const addFamilyMember = () => {
    const newMember: FamilyMember = {
      id: Date.now().toString(),
      relationship: 'spouse',
      name: '',
      age: 0,
      healthConditions: [],
    };
    setFamilyMembers([...familyMembers, newMember]);
    handleSecurityAudit(
      'family_member_added',
      `total:${familyMembers.length + 1}`
    );
  };

  // 🔒 **차량 정보 추가**
  const addVehicle = () => {
    const newVehicle: VehicleInfo = {
      id: Date.now().toString(),
      vehicleNumber: '',
      manufacturer: '',
      model: '',
      year: new Date().getFullYear(),
      engineType: 'gasoline',
      drivingExperience: 0,
      accidentHistory: [],
    };
    setVehicles([...vehicles, newVehicle]);
    handleSecurityAudit('vehicle_added', `total:${vehicles.length + 1}`);
  };

  // 🔒 **건강상태 추가**
  const addHealthCondition = () => {
    const newCondition: HealthCondition = {
      id: Date.now().toString(),
      condition: '',
      severity: 'mild',
      diagnosedDate: '',
      isActive: true,
    };
    setHealthConditions([...healthConditions, newCondition]);
    handleSecurityAudit(
      'health_condition_added',
      `total:${healthConditions.length + 1}`
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <GearIcon className="h-5 w-5" />
            보험 정보
            {(currentPrivacyLevel === 'confidential' ||
              currentPrivacyLevel === 'private') && (
              <LockClosedIcon className="h-4 w-4 text-amber-500" />
            )}
          </span>
          {watchInsuranceType &&
            getSensitivityBadge(
              getInsuranceTypeSensitivity(watchInsuranceType || '')
            )}
        </CardTitle>
        <CardDescription>
          관심 보험 유형별 상세 정보를 입력하세요
          {isEditing && (
            <span className="text-amber-600 ml-2">⚠️ 편집 모드</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 🔒 건강정보 보안 설정 */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium flex items-center gap-2">
              <HeartIcon className="h-4 w-4" />
              건강정보 보안 설정
            </h4>
            <button
              type="button"
              onClick={() => setShowHealthInfo(!showHealthInfo)}
              className="text-sm text-green-600 hover:text-green-800"
            >
              {showHealthInfo ? '접기' : '보기'}
            </button>
          </div>

          {showHealthInfo && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="healthInfoConsent"
                  checked={healthInfoConsent}
                  onCheckedChange={checked => {
                    setHealthInfoConsent(checked === true);
                    handleSecurityAudit(
                      'health_consent_changed',
                      `health_info:${checked}`
                    );
                  }}
                />
                <label htmlFor="healthInfoConsent" className="text-sm">
                  건강정보 수집 및 활용에 동의합니다 (의료진 진단서, 투약이력
                  포함)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <EyeClosedIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  건강정보는 최고 보안등급({currentPrivacyLevel})으로 암호화
                  보관됩니다
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 주요 관심 보험 선택 */}
        <FormField
          control={form.control}
          name="insuranceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                주요 관심 보험 *
                {field.value &&
                  getInsuranceTypeSensitivity(field.value) === 'high' && (
                    <Badge variant="destructive" className="text-xs">
                      건강정보 필수
                    </Badge>
                  )}
              </FormLabel>
              <Select
                onValueChange={value =>
                  handleFieldChange('insuranceType', value, field.onChange)
                }
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="보험 유형 선택" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {insuranceTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {option.label}
                        {getInsuranceTypeSensitivity(option.value) ===
                          'high' && (
                          <LockClosedIcon className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
              {field.value &&
                getInsuranceTypeSensitivity(field.value) === 'high' && (
                  <FormDescription className="text-orange-600">
                    ⚠️ 이 보험은 민감한 건강정보가 필요합니다
                  </FormDescription>
                )}
            </FormItem>
          )}
        />

        {/* 🔒 보험 유형별 동적 필드 - 보안 강화 */}
        {watchInsuranceType === 'family' && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2">
                <PersonIcon className="h-4 w-4" />
                가족 정보
                {shouldMaskInsuranceField('familyMembers') && (
                  <LockClosedIcon className="h-3 w-3 text-amber-500" />
                )}
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFamilyMember}
              >
                <PlusIcon className="h-3 w-3 mr-1" />
                가족 추가
              </Button>
            </div>

            <FormField
              control={form.control}
              name="familySize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>가족 구성원 수</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="1"
                      placeholder={
                        shouldMaskInsuranceField('familyMembers') ? '***' : '4'
                      }
                      onChange={e => {
                        const value = parseInt(e.target.value) || 1;
                        handleFieldChange('familySize', value, field.onChange);
                      }}
                    />
                  </FormControl>
                  {shouldMaskInsuranceField('familyMembers') && (
                    <FormDescription className="text-amber-600">
                      🔒 가족 정보는 기밀로 처리됩니다
                    </FormDescription>
                  )}
                </FormItem>
              )}
            />

            {/* 동적 가족 구성원 목록 */}
            {familyMembers.map((member, index) => (
              <div key={member.id} className="bg-slate-50 p-3 rounded border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    가족 구성원 #{index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFamilyMembers(
                        familyMembers.filter(m => m.id !== member.id)
                      );
                      handleSecurityAudit('family_member_removed', member.id);
                    }}
                  >
                    <Cross1Icon className="h-3 w-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Select defaultValue={member.relationship}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="관계" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spouse">배우자</SelectItem>
                      <SelectItem value="child">자녀</SelectItem>
                      <SelectItem value="parent">부모</SelectItem>
                      <SelectItem value="sibling">형제자매</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder={
                      shouldMaskInsuranceField('familyMembers') ? '***' : '이름'
                    }
                    className="text-xs"
                    type={
                      shouldMaskInsuranceField('familyMembers')
                        ? 'password'
                        : 'text'
                    }
                  />
                  <Input
                    placeholder={
                      shouldMaskInsuranceField('familyMembers') ? '**' : '나이'
                    }
                    type="number"
                    className="text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {watchInsuranceType === 'child' && (
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium flex items-center gap-2">
              <PersonIcon className="h-4 w-4" />
              자녀 정보
            </h4>
            <div className="space-y-2">
              <Label>자녀 나이별 정보</Label>
              <div className="text-sm text-muted-foreground">
                각 자녀의 나이와 건강상태를 입력하세요
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Input
                    placeholder={
                      shouldMaskInsuranceField('familyMembers')
                        ? '***'
                        : '첫째 이름'
                    }
                    type={
                      shouldMaskInsuranceField('familyMembers')
                        ? 'password'
                        : 'text'
                    }
                  />
                  <Input placeholder="나이" type="number" />
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder={
                      shouldMaskInsuranceField('familyMembers')
                        ? '***'
                        : '둘째 이름'
                    }
                    type={
                      shouldMaskInsuranceField('familyMembers')
                        ? 'password'
                        : 'text'
                    }
                  />
                  <Input placeholder="나이" type="number" />
                </div>
              </div>
            </div>
          </div>
        )}

        {watchInsuranceType === 'car' && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2">
                <BackpackIcon className="h-4 w-4" />
                차량 정보
                {shouldMaskInsuranceField('vehicleInfo') && (
                  <LockClosedIcon className="h-3 w-3 text-amber-500" />
                )}
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addVehicle}
              >
                <PlusIcon className="h-3 w-3 mr-1" />
                차량 추가
              </Button>
            </div>

            <FormField
              control={form.control}
              name="vehicleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>주차량 종류</FormLabel>
                  <Select
                    onValueChange={value =>
                      handleFieldChange('vehicleType', value, field.onChange)
                    }
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="차량 종류 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vehicleTypeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="drivingExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>운전 경력 (년)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      placeholder={
                        shouldMaskInsuranceField('vehicleInfo') ? '**' : '5'
                      }
                      onChange={e => {
                        const value = parseInt(e.target.value) || 0;
                        handleFieldChange(
                          'drivingExperience',
                          value,
                          field.onChange
                        );
                      }}
                    />
                  </FormControl>
                  {shouldMaskInsuranceField('vehicleInfo') && (
                    <FormDescription className="text-amber-600">
                      🔒 차량 정보는 보안 처리됩니다
                    </FormDescription>
                  )}
                </FormItem>
              )}
            />

            {/* 사고 이력 */}
            <div className="bg-red-50 p-3 rounded border border-red-200">
              <Label className="text-sm font-medium text-red-800">
                사고 이력 (선택사항)
              </Label>
              <div className="text-xs text-red-600 mb-2">
                ⚠️ 정확한 사고 이력은 보험료 산정에 중요합니다
              </div>
              <Textarea
                placeholder={
                  shouldMaskInsuranceField('accidentHistory')
                    ? '***기밀정보***'
                    : '2023년 3월 접촉사고, 보험금 50만원 지급...'
                }
                rows={2}
                className="text-sm"
              />
            </div>
          </div>
        )}

        {/* 🔒 건강상태 정보 (건강보험류) */}
        {['health', 'cancer', 'dental', 'family'].includes(
          watchInsuranceType
        ) && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2">
                <HeartIcon className="h-4 w-4" />
                건강상태 정보
                <Badge variant="destructive" className="text-xs">
                  기밀
                </Badge>
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addHealthCondition}
                disabled={!healthInfoConsent}
              >
                <PlusIcon className="h-3 w-3 mr-1" />
                질병 추가
              </Button>
            </div>

            {!healthInfoConsent && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  ⚠️ 건강정보 수집 동의가 필요합니다. 정확한 보험 상품 추천을
                  위해 동의해주세요.
                </p>
              </div>
            )}

            {healthInfoConsent && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">흡연 여부</Label>
                    <Select>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">비흡연</SelectItem>
                        <SelectItem value="former">금연</SelectItem>
                        <SelectItem value="current">흡연</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">음주 여부</Label>
                    <Select>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">금주</SelectItem>
                        <SelectItem value="occasionally">가끔</SelectItem>
                        <SelectItem value="regularly">자주</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 동적 건강상태 목록 */}
                {healthConditions.map((condition, index) => (
                  <div
                    key={condition.id}
                    className="bg-red-50 p-3 rounded border border-red-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-red-800">
                        질병/상태 #{index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setHealthConditions(
                            healthConditions.filter(c => c.id !== condition.id)
                          );
                          handleSecurityAudit(
                            'health_condition_removed',
                            condition.id
                          );
                        }}
                      >
                        <Cross1Icon className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Input placeholder="질병명" className="text-xs" />
                      <Select>
                        <SelectTrigger className="text-xs">
                          <SelectValue placeholder="심각도" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mild">경미</SelectItem>
                          <SelectItem value="moderate">보통</SelectItem>
                          <SelectItem value="severe">심각</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input type="date" className="text-xs" />
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* 🔒 보험정보 보안 경고 */}
        {!healthInfoConsent &&
          ['health', 'cancer', 'dental', 'family'].includes(
            watchInsuranceType
          ) && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-800">
                ⚠️ 건강보험 상품 추천을 위해서는 건강정보 수집 동의가
                필요합니다. 모든 건강정보는 최고 보안등급으로 암호화되어
                보관됩니다.
              </p>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
