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
  FormMessage,
} from '~/common/components/ui/form';
import { Input } from '~/common/components/ui/input';
import {
  PersonIcon,
  MobileIcon,
  EnvelopeClosedIcon,
  HomeIcon,
} from '@radix-ui/react-icons';
import type { UseFormReturn } from 'react-hook-form';
import type { ClientFormData } from '../lib/form-schema';

interface ClientBasicInfoFormProps {
  form: UseFormReturn<ClientFormData>;
  duplicateWarning?: string | null;
  onPhoneChange?: (phone: string) => void;
}

export function ClientBasicInfoForm({
  form,
  duplicateWarning,
  onPhoneChange,
}: ClientBasicInfoFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>기본 정보</CardTitle>
        <CardDescription>
          고객의 기본적인 연락처 정보를 입력하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
                    <Input {...field} className="pl-10" placeholder="홍길동" />
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
                <FormLabel>휴대폰 번호 *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <MobileIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      className="pl-10"
                      placeholder="010-0000-0000"
                      onChange={(e) => {
                        field.onChange(e);
                        onPhoneChange?.(e.target.value);
                      }}
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
                <FormLabel>이메일</FormLabel>
                <FormControl>
                  <div className="relative">
                    <EnvelopeClosedIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      type="email"
                      className="pl-10"
                      placeholder="example@email.com"
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
                <FormLabel>주소</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="서울시 강남구..." />
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
                  <Input {...field} placeholder="회사원, 자영업자 등" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
