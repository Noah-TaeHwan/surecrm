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
import type { UseFormReturn } from 'react-hook-form';
import type { ClientFormData } from '../lib/form-schema';
import { stageOptions, importanceOptions } from '../lib/form-schema';
import { TagManager } from './tag-manager';

interface Referrer {
  id: string;
  name: string;
}

interface ClientSalesInfoFormProps {
  form: UseFormReturn<ClientFormData>;
  referrers: Referrer[];
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function ClientSalesInfoForm({
  form,
  referrers,
  tags,
  onTagsChange,
}: ClientSalesInfoFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>영업 정보</CardTitle>
        <CardDescription>영업 단계와 관련 정보를 설정하세요</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="currentStageId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>영업 단계 *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="단계 선택" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {stageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
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
            name="importance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>중요도 *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="중요도 선택" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {importanceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
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
                <FormLabel>소개자</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="소개자 선택" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">없음</SelectItem>
                    {referrers.map((referrer) => (
                      <SelectItem key={referrer.id} value={referrer.id}>
                        {referrer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  이 고객을 소개한 사람을 선택하세요
                </FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contractAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>예상 계약금액</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder="50000000"
                    value={field.value || ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                  />
                </FormControl>
                <FormDescription>
                  예상 계약 금액을 원 단위로 입력하세요
                </FormDescription>
              </FormItem>
            )}
          />
        </div>

        {/* 태그 관리 */}
        <TagManager
          tags={tags}
          onTagsChange={onTagsChange}
          placeholder="새 태그 입력"
          label="태그"
        />

        {/* 메모 */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>메모</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={4}
                  placeholder="고객에 대한 특이사항이나 중요한 정보를 입력하세요..."
                />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
