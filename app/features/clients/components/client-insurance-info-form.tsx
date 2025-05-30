import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import type { UseFormReturn } from 'react-hook-form';
import type { ClientFormData } from '../lib/form-schema';
import { insuranceTypeOptions, vehicleTypeOptions } from '../lib/form-schema';

interface ClientInsuranceInfoFormProps {
  form: UseFormReturn<ClientFormData>;
  watchInsuranceType: string;
}

export function ClientInsuranceInfoForm({
  form,
  watchInsuranceType,
}: ClientInsuranceInfoFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>보험 정보</CardTitle>
        <CardDescription>
          관심 보험 유형별 상세 정보를 입력하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="insuranceType"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>주요 관심 보험</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="보험 유형 선택" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {insuranceTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* 보험 유형별 동적 필드 */}
        {watchInsuranceType === 'family' && (
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">가족 정보</h4>
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
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 1)
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        )}

        {watchInsuranceType === 'child' && (
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">자녀 정보</h4>
            <div className="space-y-2">
              <Label>자녀 나이</Label>
              <div className="text-sm text-muted-foreground">
                각 자녀의 나이를 입력하세요
              </div>
              {/* 간단한 예시 - 실제로는 동적으로 추가/제거 가능하게 구현 */}
              <Input placeholder="첫째 나이" type="number" />
              <Input placeholder="둘째 나이" type="number" />
            </div>
          </div>
        )}

        {watchInsuranceType === 'car' && (
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">차량 정보</h4>
            <FormField
              control={form.control}
              name="vehicleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>차량 종류</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="차량 종류 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vehicleTypeOptions.map((option) => (
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
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
