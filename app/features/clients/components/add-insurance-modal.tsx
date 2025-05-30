import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/common/components/ui/dialog';
import {
  Form,
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
import { Button } from '~/common/components/ui/button';
import { Badge } from '~/common/components/ui/badge';
import { Checkbox } from '~/common/components/ui/checkbox';
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import { Separator } from '~/common/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/common/components/ui/tooltip';
import {
  CheckIcon,
  Cross2Icon,
  CalendarIcon,
  TrashIcon,
  UploadIcon,
  LockClosedIcon,
  EyeClosedIcon,
  ExclamationTriangleIcon,
  PersonIcon,
} from '@radix-ui/react-icons';
import {
  secureInsuranceTypeConfig,
  getInsuranceSecurityLevel,
  requiresHealthInfo,
  requiresFinancialInfo,
  privacyLevelIcons,
  privacyLevelColors,
} from './insurance-config';
import type { ClientPrivacyLevel } from '../types';

// 🔒 **보안 강화된 보험 추가 스키마**
const secureInsuranceSchema = z.object({
  type: z.enum(['life', 'health', 'auto', 'prenatal', 'property', 'other']),
  premium: z.number().min(0).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z
    .enum(['active', 'reviewing', 'pending', 'rejected', 'cancelled'])
    .optional(),
  notes: z.string().max(1000, '메모가 너무 깁니다').optional(),

  // 🔒 보안 및 동의 관련 필드들
  privacyLevel: z.enum(['public', 'restricted', 'private', 'confidential']),
  dataProcessingConsent: z.boolean(),
  healthInfoConsent: z.boolean().optional(),
  financialInfoConsent: z.boolean().optional(),
  medicalRecordsConsent: z.boolean().optional(),
  isEncrypted: z.boolean(),
  accessRestriction: z.enum(['agent', 'manager', 'admin']).optional(),

  // 자동차보험 특화 필드들 (개인정보 포함)
  vehicleNumber: z.string().max(20, '차량번호가 너무 깁니다').optional(),
  ownerName: z.string().max(50, '소유자명이 너무 깁니다').optional(),
  vehicleType: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  year: z.number().min(1900).max(2030).optional(),
  engineType: z.string().optional(),
  displacement: z.number().min(0).optional(),

  // 🔒 건강보험 특화 필드들 (최고 기밀)
  healthConditions: z.array(z.string()).optional(),
  previousSurgeries: z.array(z.string()).optional(),
  currentMedications: z.array(z.string()).optional(),
  familyHistory: z.array(z.string()).optional(),
  smokingStatus: z.enum(['never', 'former', 'current']).optional(),
  drinkingStatus: z.enum(['never', 'occasionally', 'regularly']).optional(),
});

type SecureInsuranceFormData = z.infer<typeof secureInsuranceSchema>;

// 🔒 **보험 보안 감사 로그**
interface InsuranceSecurityLog {
  id: string;
  timestamp: string;
  action: string;
  insuranceType: string;
  clientId: string;
  agentId: string;
  privacyLevel: ClientPrivacyLevel;
  sensitiveDataAccessed: boolean;
  details: string;
}

interface AddInsuranceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  onInsuranceAdded?: (insurance: any) => void;
  // 🔒 보안 강화 props
  enableSecurity?: boolean;
  currentUserRole?: 'agent' | 'manager' | 'admin';
  agentId?: string;
  onSecurityAudit?: (log: InsuranceSecurityLog) => void;
}

export function AddInsuranceModal({
  open,
  onOpenChange,
  clientId,
  onInsuranceAdded,
  enableSecurity = false,
  currentUserRole = 'agent',
  agentId = '',
  onSecurityAudit,
}: AddInsuranceModalProps) {
  const [healthConditions, setHealthConditions] = useState<string[]>([]);
  const [healthConditionInput, setHealthConditionInput] = useState('');
  const [medications, setMedications] = useState<string[]>([]);
  const [medicationInput, setMedicationInput] = useState('');

  // 🔒 **보안 강화된 상태들**
  const [showPrivacyWarning, setShowPrivacyWarning] = useState(false);
  const [consentGiven, setConsentGiven] = useState({
    dataProcessing: false,
    healthInfo: false,
    financialInfo: false,
    medicalRecords: false,
  });
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [sensitiveDataWarnings, setSensitiveDataWarnings] = useState<string[]>(
    []
  );

  const form = useForm<SecureInsuranceFormData>({
    resolver: zodResolver(secureInsuranceSchema),
    defaultValues: {
      status: 'reviewing',
      privacyLevel: 'restricted' as ClientPrivacyLevel,
      dataProcessingConsent: false,
      healthInfoConsent: false,
      financialInfoConsent: false,
      medicalRecordsConsent: false,
      isEncrypted: true,
      accessRestriction: currentUserRole,
      healthConditions: [],
      previousSurgeries: [],
      currentMedications: [],
      familyHistory: [],
    },
  });

  const watchedType = form.watch('type');

  // 🔒 **보안 감사 로깅 함수**
  const logSecurityAction = (
    action: string,
    details: string,
    privacyLevel: ClientPrivacyLevel = 'restricted',
    sensitiveDataAccessed: boolean = false
  ) => {
    if (!enableSecurity || !onSecurityAudit) return;

    const log: InsuranceSecurityLog = {
      id: `ins_audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      action,
      insuranceType: watchedType || 'unknown',
      clientId,
      agentId,
      privacyLevel,
      sensitiveDataAccessed,
      details,
    };

    onSecurityAudit(log);
    console.log(`🔒 [보험보안] ${action}: ${details}`);
  };

  // 🔒 **보험 타입별 보안 레벨 적용**
  const handleInsuranceTypeChange = (type: string) => {
    const securityLevel = getInsuranceSecurityLevel(type);
    const requiresHealth = requiresHealthInfo(type);
    const requiresFinancial = requiresFinancialInfo(type);

    form.setValue('privacyLevel', securityLevel);
    form.setValue('healthInfoConsent', requiresHealth);
    form.setValue('financialInfoConsent', requiresFinancial);

    // 보안 경고 표시
    if (securityLevel === 'confidential') {
      setShowPrivacyWarning(true);
      setSensitiveDataWarnings([
        '이 보험은 최고 기밀 정보를 포함합니다',
        '모든 데이터는 암호화됩니다',
        '접근이 제한되며 감사 로그가 기록됩니다',
      ]);
    } else if (securityLevel === 'private') {
      setSensitiveDataWarnings([
        '개인정보가 포함된 보험입니다',
        '적절한 보안 처리가 필요합니다',
      ]);
    } else {
      setSensitiveDataWarnings([]);
    }

    logSecurityAction(
      'INSURANCE_TYPE_SELECTED',
      `보험 타입 선택: ${type} (보안레벨: ${securityLevel})`,
      securityLevel
    );
  };

  // 🔒 **민감한 건강정보 검증**
  const validateHealthCondition = (
    condition: string
  ): { isValid: boolean; warning?: string } => {
    const sensitiveConditions = [
      '암',
      'cancer',
      '정신질환',
      'depression',
      '심장병',
      'diabetes',
      '당뇨',
      'HIV',
      'AIDS',
      '간염',
      'hepatitis',
      '결핵',
      'tuberculosis',
    ];

    const isSensitive = sensitiveConditions.some((keyword) =>
      condition.toLowerCase().includes(keyword.toLowerCase())
    );

    if (isSensitive) {
      return {
        isValid: true,
        warning: '민감한 건강정보가 감지되었습니다. 최고 보안으로 처리됩니다.',
      };
    }

    return { isValid: true };
  };

  // 건강 상태 추가
  const addHealthCondition = () => {
    if (
      healthConditionInput.trim() &&
      !healthConditions.includes(healthConditionInput.trim())
    ) {
      setHealthConditions([...healthConditions, healthConditionInput.trim()]);
      setHealthConditionInput('');
    }
  };

  // 건강 상태 제거
  const removeHealthCondition = (condition: string) => {
    setHealthConditions(healthConditions.filter((c) => c !== condition));
  };

  // 복용 약물 추가
  const addMedication = () => {
    if (
      medicationInput.trim() &&
      !medications.includes(medicationInput.trim())
    ) {
      setMedications([...medications, medicationInput.trim()]);
      setMedicationInput('');
    }
  };

  // 복용 약물 제거
  const removeMedication = (medication: string) => {
    setMedications(medications.filter((m) => m !== medication));
  };

  const onSubmit = (data: SecureInsuranceFormData) => {
    const newInsurance = {
      id: Date.now().toString(),
      type: data.type,
      status: data.status,
      premium: data.premium || 0,
      startDate: data.startDate,
      endDate: data.endDate,
      notes: data.notes,
      details: getInsuranceDetails(data),
      documents: [],
      createdAt: new Date().toISOString(),
    };

    console.log('새 보험 정보:', newInsurance);
    onInsuranceAdded?.(newInsurance);
    onOpenChange(false);
    form.reset();
    setHealthConditions([]);
    setMedications([]);
  };

  const getInsuranceDetails = (data: SecureInsuranceFormData) => {
    switch (data.type) {
      case 'auto':
        return {
          vehicleNumber: data.vehicleNumber || '',
          ownerName: data.ownerName || '',
          vehicleType: data.vehicleType || '',
          manufacturer: data.manufacturer || '',
          model: data.model || '',
          year: data.year || 0,
          engineType: data.engineType || '',
          displacement: data.displacement || 0,
        };
      case 'health':
        return {
          healthConditions,
          previousSurgeries: [],
          currentMedications: medications,
          familyHistory: [],
          smokingStatus: data.smokingStatus || 'never',
          drinkingStatus: data.drinkingStatus || 'never',
        };
      default:
        return {};
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 보험 추가</DialogTitle>
          <DialogDescription>
            고객의 새로운 보험 정보를 입력하세요.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>보험 유형 *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="보험 유형 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(secureInsuranceTypeConfig).map(
                          ([key, config]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                {config.icon}
                                {config.label}
                              </div>
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>상태</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="reviewing">검토중</SelectItem>
                        <SelectItem value="active">활성</SelectItem>
                        <SelectItem value="pending">대기중</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="premium"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>보험료 (원)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2000000"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value) || undefined)
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value ? `₩${field.value.toLocaleString()}` : ''}
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>시작일</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input type="date" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>종료일</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input type="date" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* 보험 유형별 특화 정보 */}
            {watchedType && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-4">
                    {secureInsuranceTypeConfig[watchedType]?.label} 상세 정보
                  </h4>

                  {/* 자동차보험 상세 정보 */}
                  {watchedType === 'auto' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="vehicleNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>차량번호</FormLabel>
                            <FormControl>
                              <Input placeholder="12가3456" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="ownerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>소유자명</FormLabel>
                            <FormControl>
                              <Input placeholder="홍길동" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="vehicleType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>차량종류</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="차량종류 선택" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="승용차">승용차</SelectItem>
                                <SelectItem value="SUV">SUV</SelectItem>
                                <SelectItem value="화물차">화물차</SelectItem>
                                <SelectItem value="승합차">승합차</SelectItem>
                                <SelectItem value="오토바이">
                                  오토바이
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="manufacturer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>제조회사</FormLabel>
                            <FormControl>
                              <Input placeholder="현대" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="model"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>모델명</FormLabel>
                            <FormControl>
                              <Input placeholder="아반떼" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="year"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>연식</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="2023"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    Number(e.target.value) || undefined
                                  )
                                }
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="engineType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>연료종류</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="연료종류 선택" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="가솔린">가솔린</SelectItem>
                                <SelectItem value="디젤">디젤</SelectItem>
                                <SelectItem value="LPG">LPG</SelectItem>
                                <SelectItem value="하이브리드">
                                  하이브리드
                                </SelectItem>
                                <SelectItem value="전기">전기</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="displacement"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>배기량 (cc)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="1600"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    Number(e.target.value) || undefined
                                  )
                                }
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* 건강보험 상세 정보 */}
                  {watchedType === 'health' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="smokingStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>흡연상태</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="흡연상태 선택" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="never">비흡연</SelectItem>
                                  <SelectItem value="former">
                                    과거흡연
                                  </SelectItem>
                                  <SelectItem value="current">
                                    현재흡연
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="drinkingStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>음주상태</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="음주상태 선택" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="never">금주</SelectItem>
                                  <SelectItem value="occasionally">
                                    가끔
                                  </SelectItem>
                                  <SelectItem value="regularly">
                                    정기적
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* 기존 질환 */}
                      <div>
                        <label className="text-sm font-medium">기존 질환</label>
                        <div className="mt-2 space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {healthConditions.map((condition, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {condition}
                                <Cross2Icon
                                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                                  onClick={() =>
                                    removeHealthCondition(condition)
                                  }
                                />
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              value={healthConditionInput}
                              onChange={(e) =>
                                setHealthConditionInput(e.target.value)
                              }
                              placeholder="질환명 입력"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addHealthCondition();
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={addHealthCondition}
                            >
                              추가
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* 복용 중인 약물 */}
                      <div>
                        <label className="text-sm font-medium">
                          복용 중인 약물
                        </label>
                        <div className="mt-2 space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {medications.map((medication, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {medication}
                                <Cross2Icon
                                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                                  onClick={() => removeMedication(medication)}
                                />
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              value={medicationInput}
                              onChange={(e) =>
                                setMedicationInput(e.target.value)
                              }
                              placeholder="약물명 입력"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addMedication();
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={addMedication}
                            >
                              추가
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* 메모 */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>추가 메모</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="보험 관련 추가 정보나 특이사항을 입력하세요..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                취소
              </Button>
              <Button type="submit">
                <CheckIcon className="mr-2 h-4 w-4" />
                보험 추가
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
