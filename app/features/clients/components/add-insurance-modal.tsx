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
import { Separator } from '~/common/components/ui/separator';
import {
  CheckIcon,
  Cross2Icon,
  CalendarIcon,
  TrashIcon,
  UploadIcon,
} from '@radix-ui/react-icons';
import { insuranceTypeConfig } from './insurance-config';

// 보험 추가 폼 스키마
const addInsuranceSchema = z.object({
  type: z.enum(['life', 'health', 'auto', 'prenatal', 'property', 'other']),
  premium: z.number().min(0).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['active', 'reviewing', 'pending']).optional(),
  notes: z.string().optional(),

  // 자동차보험 특화 필드들
  vehicleNumber: z.string().optional(),
  ownerName: z.string().optional(),
  vehicleType: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),
  engineType: z.string().optional(),
  displacement: z.number().optional(),

  // 건강보험 특화 필드들
  healthConditions: z.array(z.string()).optional(),
  previousSurgeries: z.array(z.string()).optional(),
  currentMedications: z.array(z.string()).optional(),
  familyHistory: z.array(z.string()).optional(),
  smokingStatus: z.enum(['never', 'former', 'current']).optional(),
  drinkingStatus: z.enum(['never', 'occasionally', 'regularly']).optional(),
});

type AddInsuranceFormData = z.infer<typeof addInsuranceSchema>;

interface AddInsuranceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  onInsuranceAdded?: (insurance: any) => void;
}

export function AddInsuranceModal({
  open,
  onOpenChange,
  clientId,
  onInsuranceAdded,
}: AddInsuranceModalProps) {
  const [healthConditions, setHealthConditions] = useState<string[]>([]);
  const [healthConditionInput, setHealthConditionInput] = useState('');
  const [medications, setMedications] = useState<string[]>([]);
  const [medicationInput, setMedicationInput] = useState('');

  const form = useForm<AddInsuranceFormData>({
    resolver: zodResolver(addInsuranceSchema),
    defaultValues: {
      status: 'reviewing',
      healthConditions: [],
      previousSurgeries: [],
      currentMedications: [],
      familyHistory: [],
    },
  });

  const watchedType = form.watch('type');

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

  const onSubmit = (data: AddInsuranceFormData) => {
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

  const getInsuranceDetails = (data: AddInsuranceFormData) => {
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
                        {Object.entries(insuranceTypeConfig).map(
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
                    {insuranceTypeConfig[watchedType]?.label} 상세 정보
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
