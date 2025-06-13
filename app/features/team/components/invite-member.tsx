import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Input } from '~/common/components/ui/input';
import { Button } from '~/common/components/ui/button';
import { RadioGroup, RadioGroupItem } from '~/common/components/ui/radio-group';
import { Label } from '~/common/components/ui/label';
import { Card, CardContent } from '~/common/components/ui/card';
import { PlusIcon, EnvelopeClosedIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { InviteMemberProps } from '../types';

const inviteSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  role: z.string().min(1, '역할을 선택해주세요'),
  message: z.string().optional(),
});

type InviteFormData = z.infer<typeof inviteSchema>;

export function InviteMember({ onInvite }: InviteMemberProps) {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      role: '',
      message: '',
    },
  });

  const onSubmit = (data: InviteFormData) => {
    onInvite(data.email, data.role, data.message);
    setIsOpen(false);
    form.reset();
  };

  const roles = [
    {
      id: 'member',
      name: '멤버',
      description: '기본적인 고객 관리 및 보고서 조회',
      color: 'bg-blue-50 border-blue-200',
    },
    {
      id: 'manager',
      name: '매니저',
      description: '팀 관리를 제외한 대부분 기능 접근 가능',
      color: 'bg-green-50 border-green-200',
    },
    {
      id: 'admin',
      name: '관리자',
      description: '모든 기능에 대한 완전한 접근 권한',
      color: 'bg-red-50 border-red-200',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button data-testid="invite-trigger">
          <PlusIcon className="mr-2 h-4 w-4" />
          팀원 초대
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>새 팀원 초대</DialogTitle>
          <DialogDescription>
            이메일로 새로운 팀원을 초대하세요
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 이메일 입력 */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일 주소</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="example@company.com"
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 역할 선택 */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>역할 선택</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="space-y-1"
                    >
                      {roles.map(role => (
                        <Label
                          key={role.id}
                          htmlFor={role.id}
                          className="flex items-center space-x-3 rounded-lg border-2 border-gray-800 p-3 cursor-pointer hover:border-primary/5 has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-colors"
                        >
                          <RadioGroupItem value={role.id} id={role.id} />
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {role.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {role.description}
                            </div>
                          </div>
                        </Label>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 초대 메시지 */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>초대 메시지 (선택사항)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="팀에 합류하세요!"
                      className="h-11"
                    />
                  </FormControl>
                  <FormDescription>
                    초대받는 사람에게 전달될 개인 메시지
                  </FormDescription>
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                취소
              </Button>
              <Button type="submit" className="flex-1">
                <EnvelopeClosedIcon className="mr-2 h-4 w-4" />
                초대 보내기
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
