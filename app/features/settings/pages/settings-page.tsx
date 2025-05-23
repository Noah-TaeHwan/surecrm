import type { Route } from '.react-router/types/app/features/settings/pages/+types/settings-page';
import { Button } from '~/common/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Input } from '~/common/components/ui/input';
import { Textarea } from '~/common/components/ui/textarea';
import { Switch } from '~/common/components/ui/switch';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/common/components/ui/tabs';
import { Label } from '~/common/components/ui/label';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import { Separator } from '~/common/components/ui/separator';
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import {
  PersonIcon,
  BellIcon,
  LockClosedIcon,
  GearIcon,
  UpdateIcon,
  TrashIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  EnvelopeClosedIcon,
  MobileIcon,
  CalendarIcon,
  DownloadIcon,
} from '@radix-ui/react-icons';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MainLayout } from '~/common/layouts/main-layout';

// 프로필 폼 스키마
const profileSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다'),
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  phone: z.string(),
  company: z.string(),
  position: z.string(),
  bio: z.string().max(500, '소개는 500자 이하로 입력해주세요'),
});

// 비밀번호 변경 폼 스키마
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, '현재 비밀번호를 입력하세요'),
    newPassword: z.string().min(8, '새 비밀번호는 8자 이상이어야 합니다'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export function loader({ request }: Route.LoaderArgs) {
  // TODO: 실제 API에서 데이터 가져오기

  const userProfile = {
    id: '1',
    name: '김영희',
    email: 'kim@example.com',
    phone: '010-1234-5678',
    company: 'ABC 보험',
    position: '영업팀장',
    bio: '10년 경력의 보험 영업 전문가입니다. 고객의 니즈에 맞는 최적의 보험 상품을 제안합니다.',
    avatar: null,
  };

  const notificationSettings = {
    email: {
      newClient: true,
      meetingReminder: true,
      contractUpdate: true,
      weeklyReport: false,
    },
    push: {
      newClient: true,
      meetingReminder: true,
      contractUpdate: false,
      weeklyReport: false,
    },
    sms: {
      meetingReminder: true,
      urgentUpdate: true,
    },
  };

  const securitySettings = {
    twoFactorEnabled: false,
    sessionTimeout: 60, // minutes
    lastPasswordChange: '2023-12-15',
    loginHistory: [
      {
        date: '2024-01-20 09:30',
        device: 'Chrome on Windows',
        location: '서울, 대한민국',
      },
      {
        date: '2024-01-19 18:45',
        device: 'Safari on iPhone',
        location: '서울, 대한민국',
      },
      {
        date: '2024-01-19 14:20',
        device: 'Chrome on Windows',
        location: '서울, 대한민국',
      },
    ],
  };

  const systemSettings = {
    language: 'ko',
    timezone: 'Asia/Seoul',
    dateFormat: 'YYYY-MM-DD',
    currency: 'KRW',
    autoBackup: true,
    darkMode: false,
  };

  return {
    userProfile,
    notificationSettings,
    securitySettings,
    systemSettings,
  };
}

export function action({ request }: Route.ActionArgs) {
  // TODO: 실제 설정 저장 로직
  return { success: true };
}

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '설정 - SureCRM' },
    { name: 'description', content: '계정 및 앱 환경설정을 관리합니다' },
  ];
}

export default function SettingsPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const {
    userProfile,
    notificationSettings,
    securitySettings,
    systemSettings,
  } = loaderData;

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

  // 프로필 폼
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: userProfile.name,
      email: userProfile.email,
      phone: userProfile.phone,
      company: userProfile.company,
      position: userProfile.position,
      bio: userProfile.bio,
    },
  });

  // 비밀번호 변경 폼
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // 프로필 저장
  const onSaveProfile = (data: ProfileFormData) => {
    console.log('프로필 저장:', data);
    setIsEditing(false);
  };

  // 비밀번호 변경
  const onChangePassword = (data: PasswordFormData) => {
    console.log('비밀번호 변경');
    passwordForm.reset();
  };

  // 계정 삭제
  const handleDeleteAccount = () => {
    if (
      confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')
    ) {
      console.log('계정 삭제');
    }
  };

  return (
    <MainLayout title="설정">
      <div className="container mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">설정</h1>
          <p className="text-muted-foreground">
            계정 정보와 앱 환경설정을 관리하세요
          </p>
        </div>

        {/* 탭 컨텐츠 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">프로필</TabsTrigger>
            <TabsTrigger value="notifications">알림</TabsTrigger>
            <TabsTrigger value="security">보안</TabsTrigger>
            <TabsTrigger value="system">시스템</TabsTrigger>
          </TabsList>

          {/* 프로필 탭 */}
          <TabsContent value="profile" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>개인 정보</CardTitle>
                    <CardDescription>
                      프로필 사진과 기본 정보를 관리하세요
                    </CardDescription>
                  </div>
                  <Button
                    variant={isEditing ? 'outline' : 'default'}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? '취소' : '편집'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* 프로필 사진 */}
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="text-2xl">
                        {userProfile.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <div className="space-y-2">
                        <Button variant="outline" size="sm">
                          사진 업로드
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                        >
                          제거
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* 프로필 폼 */}
                  <Form {...profileForm}>
                    <form
                      onSubmit={profileForm.handleSubmit(onSaveProfile)}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>이름</FormLabel>
                              <FormControl>
                                <Input {...field} disabled={!isEditing} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>이메일</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="email"
                                  disabled={!isEditing}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>전화번호</FormLabel>
                              <FormControl>
                                <Input {...field} disabled={!isEditing} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>회사</FormLabel>
                              <FormControl>
                                <Input {...field} disabled={!isEditing} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="position"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>직책</FormLabel>
                              <FormControl>
                                <Input {...field} disabled={!isEditing} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={profileForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>소개</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={3}
                                disabled={!isEditing}
                                placeholder="간단한 자기소개를 입력하세요"
                              />
                            </FormControl>
                            <FormDescription>
                              최대 500자까지 입력 가능합니다
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {isEditing && (
                        <div className="flex justify-end">
                          <Button type="submit">
                            <CheckIcon className="mr-2 h-4 w-4" />
                            저장
                          </Button>
                        </div>
                      )}
                    </form>
                  </Form>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 알림 탭 */}
          <TabsContent value="notifications" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>알림 설정</CardTitle>
                <CardDescription>
                  받고 싶은 알림 유형을 선택하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 이메일 알림 */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <EnvelopeClosedIcon className="h-5 w-5" />
                    <Label className="text-base font-medium">이메일 알림</Label>
                  </div>
                  <div className="space-y-3 ml-7">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">새 고객 등록</div>
                        <div className="text-sm text-muted-foreground">
                          새로운 고객이 등록될 때 알림
                        </div>
                      </div>
                      <Switch
                        defaultChecked={notificationSettings.email.newClient}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">미팅 알림</div>
                        <div className="text-sm text-muted-foreground">
                          예정된 미팅 30분 전 알림
                        </div>
                      </div>
                      <Switch
                        defaultChecked={
                          notificationSettings.email.meetingReminder
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">계약 업데이트</div>
                        <div className="text-sm text-muted-foreground">
                          계약 상태 변경 시 알림
                        </div>
                      </div>
                      <Switch
                        defaultChecked={
                          notificationSettings.email.contractUpdate
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">주간 보고서</div>
                        <div className="text-sm text-muted-foreground">
                          매주 월요일 성과 요약 보고서
                        </div>
                      </div>
                      <Switch
                        defaultChecked={notificationSettings.email.weeklyReport}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 푸시 알림 */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <BellIcon className="h-5 w-5" />
                    <Label className="text-base font-medium">푸시 알림</Label>
                  </div>
                  <div className="space-y-3 ml-7">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">새 고객 등록</div>
                        <div className="text-sm text-muted-foreground">
                          브라우저 푸시 알림
                        </div>
                      </div>
                      <Switch
                        defaultChecked={notificationSettings.push.newClient}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">미팅 알림</div>
                        <div className="text-sm text-muted-foreground">
                          예정된 미팅 알림
                        </div>
                      </div>
                      <Switch
                        defaultChecked={
                          notificationSettings.push.meetingReminder
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* SMS 알림 */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <MobileIcon className="h-5 w-5" />
                    <Label className="text-base font-medium">SMS 알림</Label>
                  </div>
                  <div className="space-y-3 ml-7">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">미팅 알림</div>
                        <div className="text-sm text-muted-foreground">
                          예정된 미팅 1시간 전 SMS
                        </div>
                      </div>
                      <Switch
                        defaultChecked={
                          notificationSettings.sms.meetingReminder
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">긴급 업데이트</div>
                        <div className="text-sm text-muted-foreground">
                          중요한 시스템 업데이트
                        </div>
                      </div>
                      <Switch
                        defaultChecked={notificationSettings.sms.urgentUpdate}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 보안 탭 */}
          <TabsContent value="security" className="mt-6 space-y-6">
            {/* 비밀번호 변경 */}
            <Card>
              <CardHeader>
                <CardTitle>비밀번호 변경</CardTitle>
                <CardDescription>
                  정기적으로 비밀번호를 변경하여 보안을 강화하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form
                    onSubmit={passwordForm.handleSubmit(onChangePassword)}
                    className="space-y-4"
                  >
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>현재 비밀번호</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>새 비밀번호</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormDescription>
                            8자 이상, 영문, 숫자, 특수문자 포함
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>비밀번호 확인</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit">
                      <UpdateIcon className="mr-2 h-4 w-4" />
                      비밀번호 변경
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* 2단계 인증 */}
            <Card>
              <CardHeader>
                <CardTitle>2단계 인증</CardTitle>
                <CardDescription>
                  계정 보안을 강화하기 위해 2단계 인증을 설정하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">2단계 인증 사용</div>
                    <div className="text-sm text-muted-foreground">
                      SMS 또는 인증 앱을 통한 추가 보안
                    </div>
                  </div>
                  <Switch defaultChecked={securitySettings.twoFactorEnabled} />
                </div>
              </CardContent>
            </Card>

            {/* 로그인 기록 */}
            <Card>
              <CardHeader>
                <CardTitle>최근 로그인 기록</CardTitle>
                <CardDescription>
                  계정의 최근 접속 기록을 확인하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securitySettings.loginHistory.map((login, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{login.device}</div>
                        <div className="text-sm text-muted-foreground">
                          {login.location} • {login.date}
                        </div>
                      </div>
                      {index === 0 && (
                        <div className="text-green-600 text-sm font-medium">
                          현재 세션
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 계정 삭제 */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">위험 영역</CardTitle>
                <CardDescription>
                  계정 삭제는 되돌릴 수 없습니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <AlertDescription>
                    계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
                  </AlertDescription>
                </Alert>
                <Button
                  variant="destructive"
                  className="mt-4"
                  onClick={handleDeleteAccount}
                >
                  <TrashIcon className="mr-2 h-4 w-4" />
                  계정 삭제
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 시스템 탭 */}
          <TabsContent value="system" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>시스템 설정</CardTitle>
                <CardDescription>
                  앱의 언어, 시간대, 표시 형식을 설정하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>언어</Label>
                    <Select defaultValue={systemSettings.language}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ko">한국어</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>시간대</Label>
                    <Select defaultValue={systemSettings.timezone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Seoul">서울 (GMT+9)</SelectItem>
                        <SelectItem value="America/New_York">
                          뉴욕 (GMT-5)
                        </SelectItem>
                        <SelectItem value="Europe/London">
                          런던 (GMT+0)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>날짜 형식</Label>
                    <Select defaultValue={systemSettings.dateFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YYYY-MM-DD">2024-01-20</SelectItem>
                        <SelectItem value="MM/DD/YYYY">01/20/2024</SelectItem>
                        <SelectItem value="DD/MM/YYYY">20/01/2024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>통화</Label>
                    <Select defaultValue={systemSettings.currency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KRW">한국 원 (₩)</SelectItem>
                        <SelectItem value="USD">미국 달러 ($)</SelectItem>
                        <SelectItem value="EUR">유로 (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">자동 백업</div>
                      <div className="text-sm text-muted-foreground">
                        매일 자동으로 데이터 백업
                      </div>
                    </div>
                    <Switch defaultChecked={systemSettings.autoBackup} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">다크 모드</div>
                      <div className="text-sm text-muted-foreground">
                        어두운 테마 사용
                      </div>
                    </div>
                    <Switch defaultChecked={systemSettings.darkMode} />
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">데이터 내보내기</div>
                    <div className="text-sm text-muted-foreground">
                      모든 고객 데이터를 CSV 파일로 다운로드
                    </div>
                  </div>
                  <Button variant="outline">
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    내보내기
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 앱 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>앱 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>버전</span>
                    <span>1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>빌드</span>
                    <span>2024.01.20</span>
                  </div>
                  <div className="flex justify-between">
                    <span>라이센스</span>
                    <span>Commercial</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
