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
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import { Checkbox } from '~/common/components/ui/checkbox';
import { Badge } from '~/common/components/ui/badge';
import {
  CalendarIcon,
  InfoCircledIcon,
  ExclamationTriangleIcon,
  PersonIcon,
  PlusIcon,
  BellIcon,
  FileTextIcon,
} from '@radix-ui/react-icons';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router';
import { type Client } from '../types/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';

// 미팅 폼 스키마 (Google Calendar 옵션 추가)
const meetingSchema = z.object({
  title: z.string().min(1, '제목을 입력하세요'),
  clientId: z.string().min(1, '고객을 선택하세요'),
  date: z.string(),
  time: z.string(),
  duration: z.number().min(15).max(480),
  type: z.string(),
  location: z.string(),
  description: z.string().optional(),
  reminder: z.string(),
  repeat: z.string(),
  // 🌐 Google Calendar 연동 옵션 (MVP에서는 optional & disabled)
  syncToGoogle: z.boolean().optional(),
  googleMeetLink: z.boolean().optional(),
});

type MeetingFormData = z.infer<typeof meetingSchema>;

interface AddMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  onSubmit: (data: MeetingFormData) => void;
}

export function AddMeetingModal({
  isOpen,
  onClose,
  clients,
  onSubmit,
}: AddMeetingModalProps) {
  const form = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: '',
      clientId: '',
      date: '',
      time: '',
      duration: 60,
      type: 'first_consultation',
      location: '',
      description: '',
      reminder: '30_minutes',
      repeat: 'none',
      syncToGoogle: undefined,
      googleMeetLink: undefined,
    },
  });

  const handleSubmit = (data: MeetingFormData) => {
    // Form 데이터를 실제 POST 요청으로 제출
    const formElement = document.createElement('form');
    formElement.method = 'POST';
    formElement.style.display = 'none';

    // actionType 추가
    const actionInput = document.createElement('input');
    actionInput.name = 'actionType';
    actionInput.value = 'createMeeting';
    formElement.appendChild(actionInput);

    // 폼 데이터 추가
    Object.entries(data).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.name = key;
      input.value = String(value);
      formElement.appendChild(input);
    });

    document.body.appendChild(formElement);
    formElement.submit();
    document.body.removeChild(formElement);

    // 모달 닫기 및 폼 리셋
    onSubmit(data);
    form.reset();
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border border-border bg-card shadow-2xl">
        <DialogHeader className="border-b border-border pb-6 mb-6">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="p-2 bg-muted rounded-lg">
              <CalendarIcon className="h-6 w-6 text-foreground" />
            </div>
            새 미팅 예약
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2 text-base">
            고객과의 미팅 일정을 예약하고 관리합니다.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            {/* 클라이언트가 없는 경우 안내 */}
            {clients.length === 0 && (
              <Alert className="border-muted bg-muted/10">
                <InfoCircledIcon className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  미팅을 예약하려면 먼저 고객을 등록해야 합니다.{' '}
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    asChild
                    className="h-auto p-0 text-sm underline"
                  >
                    <Link to="/clients">고객 등록하러 가기</Link>
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* 기본 정보 섹션 */}
            <Card className="border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <div className="p-2 bg-muted rounded-lg">
                    <PersonIcon className="h-5 w-5 text-foreground" />
                  </div>
                  기본 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        미팅 제목
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="김영희님 상품 설명"
                          className="h-12 bg-background border-border"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          고객 선택
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={clients.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 bg-background border-border">
                              <SelectValue
                                placeholder={
                                  clients.length === 0
                                    ? '등록된 고객이 없습니다'
                                    : '고객을 선택하세요'
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-background border-border">
                            {clients.map((client) => (
                              <SelectItem
                                key={client.id}
                                value={client.id}
                                className="hover:bg-muted"
                              >
                                {client.name}
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
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          미팅 유형
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 bg-background border-border">
                              <SelectValue placeholder="미팅 유형을 선택하세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-background border-border">
                            <SelectItem
                              value="first_consultation"
                              className="hover:bg-muted"
                            >
                              첫 상담
                            </SelectItem>
                            <SelectItem
                              value="product_explanation"
                              className="hover:bg-muted"
                            >
                              상품 설명
                            </SelectItem>
                            <SelectItem
                              value="contract_review"
                              className="hover:bg-muted"
                            >
                              계약 검토
                            </SelectItem>
                            <SelectItem
                              value="follow_up"
                              className="hover:bg-muted"
                            >
                              정기 점검
                            </SelectItem>
                            <SelectItem
                              value="other"
                              className="hover:bg-muted"
                            >
                              기타
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 일정 정보 섹션 */}
            <Card className="border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <div className="p-2 bg-muted rounded-lg">
                    <CalendarIcon className="h-5 w-5 text-foreground" />
                  </div>
                  일정 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          날짜
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="date"
                            className="h-12 bg-background border-border"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          시간
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="time"
                            className="h-12 bg-background border-border"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          소요 시간
                        </FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 bg-background border-border">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-background border-border">
                            <SelectItem value="30" className="hover:bg-muted">
                              30분
                            </SelectItem>
                            <SelectItem value="60" className="hover:bg-muted">
                              1시간
                            </SelectItem>
                            <SelectItem value="90" className="hover:bg-muted">
                              1시간 30분
                            </SelectItem>
                            <SelectItem value="120" className="hover:bg-muted">
                              2시간
                            </SelectItem>
                            <SelectItem value="180" className="hover:bg-muted">
                              3시간
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        장소
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="고객 사무실, 카페 등"
                          className="h-12 bg-background border-border"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* 알림 및 반복 설정 */}
            <Card className="border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <div className="p-2 bg-muted rounded-lg">
                    <BellIcon className="h-5 w-5 text-foreground" />
                  </div>
                  알림 및 반복 설정
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="reminder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          미리 알림
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 bg-background border-border">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-background border-border">
                            <SelectItem value="none" className="hover:bg-muted">
                              알림 없음
                            </SelectItem>
                            <SelectItem
                              value="5_minutes"
                              className="hover:bg-muted"
                            >
                              5분 전
                            </SelectItem>
                            <SelectItem
                              value="15_minutes"
                              className="hover:bg-muted"
                            >
                              15분 전
                            </SelectItem>
                            <SelectItem
                              value="30_minutes"
                              className="hover:bg-muted"
                            >
                              30분 전
                            </SelectItem>
                            <SelectItem
                              value="1_hour"
                              className="hover:bg-muted"
                            >
                              1시간 전
                            </SelectItem>
                            <SelectItem
                              value="1_day"
                              className="hover:bg-muted"
                            >
                              1일 전
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="repeat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          반복 설정
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 bg-background border-border">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-background border-border">
                            <SelectItem value="none" className="hover:bg-muted">
                              반복 없음
                            </SelectItem>
                            <SelectItem
                              value="daily"
                              className="hover:bg-muted"
                            >
                              매일
                            </SelectItem>
                            <SelectItem
                              value="weekly"
                              className="hover:bg-muted"
                            >
                              매주
                            </SelectItem>
                            <SelectItem
                              value="monthly"
                              className="hover:bg-muted"
                            >
                              매월
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Google Calendar 연동 안내 */}
            <Card className="border bg-muted/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-muted rounded-lg">
                    <InfoCircledIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <h4 className="font-semibold text-foreground">
                      Google Calendar 연동
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      MVP에서는 Google Calendar 연동 기능이 제공되지 않습니다.
                      향후 업데이트에서 지원될 예정입니다.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 opacity-60">
                      <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                        <Checkbox
                          checked={false}
                          disabled={true}
                          className="data-[state=checked]:bg-muted data-[state=checked]:border-muted"
                        />
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">
                            Google Calendar 연동
                          </p>
                          <p className="text-xs text-muted-foreground">
                            개발 중인 기능입니다
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                        <Checkbox
                          checked={false}
                          disabled={true}
                          className="data-[state=checked]:bg-muted data-[state=checked]:border-muted"
                        />
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">
                            Google Meet 링크 생성
                          </p>
                          <p className="text-xs text-muted-foreground">
                            개발 중인 기능입니다
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 메모 섹션 */}
            <Card className="border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <div className="p-2 bg-muted rounded-lg">
                    <FileTextIcon className="h-5 w-5 text-foreground" />
                  </div>
                  메모 및 세부사항
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        메모
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="미팅 관련 메모, 준비사항, 특별한 요청사항 등을 입력하세요"
                          rows={4}
                          className="bg-background border-border resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* 버튼 영역 */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0 pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="h-12 px-8"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={clients.length === 0}
                className="h-12 px-8 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                미팅 예약하기
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
