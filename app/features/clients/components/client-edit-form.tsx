import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import { Textarea } from '~/common/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/common/components/ui/form';
import { Separator } from '~/common/components/ui/separator';
import { FileText, Star, User, X, Save } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';

interface ClientEditFormData {
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  occupation?: string;
  importance: 'high' | 'medium' | 'low';
  notes?: string;
}

interface ClientEditFormProps {
  form: UseFormReturn<ClientEditFormData>;
  onSubmit: (data: ClientEditFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ClientEditForm({
  form,
  onSubmit,
  onCancel,
  isSubmitting,
}: ClientEditFormProps) {
  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-background via-background to-muted/20">
      <CardHeader className="pb-8">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">기본 정보</CardTitle>
            <CardDescription className="text-base mt-2">
              정확한 정보로 고객 관계를 더욱 효과적으로 관리하세요
            </CardDescription>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        <Form {...form}>
          <form
            id="client-edit-form"
            onSubmit={form.handleSubmit(onSubmit)}
            method="post"
            className="space-y-8"
          >
            {/* 필수 정보 섹션 */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-primary rounded-full"></div>
                <h3 className="text-lg font-semibold">필수 정보</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 이름 */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        이름 *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="고객 이름을 입력하세요"
                          className="h-12 text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 전화번호 */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        전화번호 *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="010-0000-0000"
                          className="h-12 text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* 연락처 정보 섹션 */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                <h3 className="text-lg font-semibold">연락처 정보</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 이메일 */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        이메일
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="example@email.com"
                          className="h-12 text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 직업 */}
                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        직업
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="직업을 입력하세요"
                          className="h-12 text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 주소 */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      주소
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="상세 주소를 입력하세요"
                        className="h-12 text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* 관리 정보 섹션 */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
                <h3 className="text-lg font-semibold">관리 정보</h3>
              </div>

              {/* 중요도 */}
              <FormField
                control={form.control}
                name="importance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      고객 중요도
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="중요도를 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-red-500" />
                            키맨 고객
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-500" />
                            일반 고객
                          </div>
                        </SelectItem>
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            일반 고객
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 메모 */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      메모 및 특이사항
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="고객에 대한 중요한 정보나 특이사항을 기록하세요..."
                        className="min-h-[120px] text-base resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      상담 내용, 선호사항, 주의사항 등을 자유롭게 기록하세요.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 액션 버튼 */}
            <div className="flex justify-end gap-4 pt-8 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-8 h-12"
              >
                <X className="h-4 w-4 mr-2" />
                취소
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-8 h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2"></div>
                    저장 중...
                  </>
                ) : (
                  '변경사항 저장'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
