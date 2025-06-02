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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-bold">
            <CalendarIcon className="h-5 w-5" />새 미팅 예약
          </DialogTitle>
          <DialogDescription>
            고객과의 미팅 일정을 예약하고 관리합니다.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
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

            {/* 기본 정보 */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>미팅 제목</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="김영희님 상품 설명"
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>고객 선택</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={clients.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue
                              placeholder={
                                clients.length === 0
                                  ? '등록된 고객이 없습니다'
                                  : '고객을 선택하세요'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
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
                      <FormLabel>미팅 유형</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="미팅 유형 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="first_consultation">
                            첫 상담
                          </SelectItem>
                          <SelectItem value="product_explanation">
                            상품 설명
                          </SelectItem>
                          <SelectItem value="contract_review">
                            계약 검토
                          </SelectItem>
                          <SelectItem value="follow_up">정기 점검</SelectItem>
                          <SelectItem value="other">기타</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 일정 정보 */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">일정 정보</h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>날짜</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" className="h-11" />
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
                      <FormLabel>시간</FormLabel>
                      <FormControl>
                        <Input {...field} type="time" className="h-11" />
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
                      <FormLabel>소요 시간</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="30">30분</SelectItem>
                          <SelectItem value="60">1시간</SelectItem>
                          <SelectItem value="90">1시간 30분</SelectItem>
                          <SelectItem value="120">2시간</SelectItem>
                          <SelectItem value="180">3시간</SelectItem>
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
                    <FormLabel>장소</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="고객 사무실, 카페 등"
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 알림 설정 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reminder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>미리 알림</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">알림 없음</SelectItem>
                        <SelectItem value="5_minutes">5분 전</SelectItem>
                        <SelectItem value="15_minutes">15분 전</SelectItem>
                        <SelectItem value="30_minutes">30분 전</SelectItem>
                        <SelectItem value="1_hour">1시간 전</SelectItem>
                        <SelectItem value="1_day">1일 전</SelectItem>
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
                    <FormLabel>반복 설정</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">반복 없음</SelectItem>
                        <SelectItem value="daily">매일</SelectItem>
                        <SelectItem value="weekly">매주</SelectItem>
                        <SelectItem value="monthly">매월</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Google Calendar 안내 */}
            <Alert className="bg-muted/20">
              <InfoCircledIcon className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Google Calendar 연동은 MVP에서 제공되지 않습니다.
              </AlertDescription>
            </Alert>

            {/* 메모 */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>메모 (선택사항)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="미팅 관련 메모, 준비사항 등을 입력하세요"
                      rows={3}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 버튼 영역 */}
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={clients.length === 0}
                className="flex-1"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                미팅 예약하기
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
