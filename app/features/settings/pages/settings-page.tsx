import type { Route } from './+types/settings-page';
import { MainLayout } from '~/common/layouts/main-layout';
import { getCurrentUser } from '~/lib/auth/core';
import {
  getUserProfile,
  getUserSettings,
  updateUserProfile,
  updateUserSettings,
} from '../lib/supabase-settings-data';
import {
  getNotificationSettings,
  upsertNotificationSettings,
} from '~/features/notifications/lib/notifications-data';
import { data } from 'react-router';
import { createServerClient, createAdminClient } from '~/lib/core/supabase';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Switch } from '~/common/components/ui/switch';
import { Input } from '~/common/components/ui/input';
import { Label } from '~/common/components/ui/label';
import { Separator } from '~/common/components/ui/separator';
import { Badge } from '~/common/components/ui/badge';
import {
  User,
  Bell,
  Monitor,
  Shield,
  Save,
  Phone,
  Mail,
  Building,
  Sun,
  Moon,
  Settings as SettingsIcon,
  Check,
  AlertCircle,
  Calendar,
  Crown,
} from 'lucide-react';
import { useState } from 'react';
import { Form } from 'react-router';

// 설정 페이지 데이터 타입
interface SettingsPageData {
  userProfile: {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    position: string;
    createdAt: string;
  };
  notificationSettings: {
    emailNotifications: boolean;
  };
  systemSettings: {
    darkMode: boolean;
  };
  user: {
    id: string;
    email: string;
    fullName: string;
  } | null;
}

export function meta(): any {
  return [
    { title: '설정 | SureCRM' },
    { name: 'description', content: '계정 및 앱 환경설정 관리' },
  ];
}

// 설정 페이지 로더 - 모든 설정 데이터를 실제 데이터베이스에서 로딩
export async function loader({
  request,
}: Route.LoaderArgs): Promise<SettingsPageData> {
  console.log('설정 페이지 로드 시작');

  try {
    // 인증 확인
    const user = await getCurrentUser(request);
    if (!user) {
      console.log('인증 실패 - 로그인이 필요합니다');
      return {
        userProfile: {
          id: 'guest',
          name: '게스트',
          email: '',
          phone: '',
          company: '',
          position: '',
          createdAt: new Date().toISOString(),
        },
        notificationSettings: {
          emailNotifications: false,
        },
        systemSettings: {
          darkMode: true,
        },
        user: null,
      };
    }

    console.log('인증 성공:', user.email);

    // 모든 설정 데이터를 병렬로 로딩
    const [userProfileData, notificationSettingsData, userSettingsData] =
      await Promise.all([
        getUserProfile(user.id),
        getNotificationSettings(user.id),
        getUserSettings(user.id),
      ]);

    console.log('설정 페이지 데이터 로딩 완료');

    return {
      userProfile: {
        id: user.id,
        name: userProfileData?.name || user.fullName || '사용자',
        email: userProfileData?.email || user.email,
        phone: userProfileData?.phone || '',
        company: userProfileData?.company || 'SureCRM',
        position: userProfileData?.position || '보험설계사',
        createdAt: new Date().toISOString(),
      },
      notificationSettings: {
        emailNotifications:
          notificationSettingsData?.emailNotifications ?? true,
      },
      systemSettings: {
        darkMode: userSettingsData?.darkMode ?? true,
      },
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  } catch (error) {
    console.error('설정 페이지 로드 실패:', error);

    // 에러 시 기본값 반환
    return {
      userProfile: {
        id: 'error',
        name: '오류',
        email: '',
        phone: '',
        company: '',
        position: '',
        createdAt: new Date().toISOString(),
      },
      notificationSettings: {
        emailNotifications: false,
      },
      systemSettings: {
        darkMode: true,
      },
      user: null,
    };
  }
}

// Action 함수 - 폼 제출 처리
export async function action({ request }: Route.ActionArgs) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return data(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const actionType = formData.get('actionType');

    switch (actionType) {
      case 'updateProfile': {
        const name = formData.get('name') as string;
        const phone = formData.get('phone') as string;
        const company = formData.get('company') as string;

        const success = await updateUserProfile(user.id, {
          name,
          phone,
          company,
        });

        if (success) {
          return data({
            success: true,
            message: '프로필이 성공적으로 저장되었습니다.',
          });
        } else {
          return data({ success: false, error: '프로필 저장에 실패했습니다.' });
        }
      }

      case 'updateNotifications': {
        const emailNotifications =
          formData.get('emailNotifications') === 'true';

        const success = await upsertNotificationSettings(user.id, {
          emailNotifications,
        });

        if (success) {
          return data({
            success: true,
            message: '알림 설정이 성공적으로 저장되었습니다.',
          });
        } else {
          return data({
            success: false,
            error: '알림 설정 저장에 실패했습니다.',
          });
        }
      }

      case 'updateSystem': {
        const darkMode = formData.get('darkMode') === 'true';

        const success = await updateUserSettings(user.id, {
          darkMode,
        });

        if (success) {
          return data({
            success: true,
            message: '시스템 설정이 성공적으로 저장되었습니다.',
          });
        } else {
          return data({
            success: false,
            error: '시스템 설정 저장에 실패했습니다.',
          });
        }
      }

      case 'changePassword': {
        const currentPassword = formData.get('currentPassword') as string;
        const newPassword = formData.get('newPassword') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (!currentPassword || !newPassword || !confirmPassword) {
          return data({
            success: false,
            error: '모든 비밀번호 필드를 입력해주세요.',
          });
        }

        if (newPassword !== confirmPassword) {
          return data({
            success: false,
            error: '새 비밀번호가 일치하지 않습니다.',
          });
        }

        if (newPassword.length < 6) {
          return data({
            success: false,
            error: '새 비밀번호는 최소 6자 이상이어야 합니다.',
          });
        }

        if (currentPassword === newPassword) {
          return data({
            success: false,
            error: '새 비밀번호는 현재 비밀번호와 다르게 설정해야 합니다.',
          });
        }

        try {
          // 1. 현재 비밀번호로 인증 확인
          const supabase = createServerClient();
          const { error: authError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword,
          });

          if (authError) {
            console.error('현재 비밀번호 인증 실패:', authError);
            return data({
              success: false,
              error: '현재 비밀번호가 올바르지 않습니다.',
            });
          }

          // 2. 인증 성공 후 새 비밀번호로 변경
          const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword,
          });

          if (updateError) {
            console.error('비밀번호 변경 오류:', updateError);
            return data({
              success: false,
              error: '비밀번호 변경에 실패했습니다.',
            });
          }

          return data({
            success: true,
            message:
              '비밀번호가 성공적으로 변경되었습니다. 보안을 위해 다시 로그인해주세요.',
          });
        } catch (error) {
          console.error('비밀번호 변경 예외:', error);
          return data({
            success: false,
            error: '비밀번호 변경 중 오류가 발생했습니다.',
          });
        }
      }

      default:
        return data({ success: false, error: '알 수 없는 액션입니다.' });
    }
  } catch (error) {
    console.error('설정 저장 오류:', error);
    return data({ success: false, error: '설정 저장 중 오류가 발생했습니다.' });
  }
}

export default function SettingsPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { userProfile, notificationSettings, systemSettings, user } =
    loaderData;

  // State 관리
  const [profileData, setProfileData] = useState({
    name: userProfile.name,
    email: userProfile.email,
    phone: userProfile.phone,
    company: userProfile.company,
    position: userProfile.position,
  });

  const [emailNotifications, setEmailNotifications] = useState(
    notificationSettings.emailNotifications
  );

  const [darkMode, setDarkMode] = useState(systemSettings.darkMode);

  // 비밀번호 변경 state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // 프로필 정보 변경 핸들러
  const handleProfileChange = (field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 비밀번호 변경 핸들러
  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 계정 생성일 포맷팅
  const formatJoinDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
      });
    } catch {
      return '2024년 12월';
    }
  };

  return (
    <MainLayout title="설정">
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
          {/* 성공/오류 메시지 - 더 세련된 디자인 */}
          {actionData && (
            <div
              className={`relative overflow-hidden rounded-xl border backdrop-blur-sm transition-all duration-300 ${
                actionData.success
                  ? 'bg-green-500/10 text-green-400 border-green-500/30 shadow-lg shadow-green-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/30 shadow-lg shadow-red-500/20'
              }`}
            >
              <div className="flex items-center gap-3 p-4">
                <div
                  className={`p-2 rounded-full ${
                    actionData.success ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}
                >
                  {actionData.success ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {actionData.success
                      ? (actionData as any).message
                      : (actionData as any).error}
                  </p>
                </div>
              </div>
              <div
                className={`h-1 w-full ${
                  actionData.success
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : 'bg-gradient-to-r from-red-500 to-rose-500'
                }`}
              />
            </div>
          )}

          {/* 헤더 - 더 임팩트 있게 */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-2xl blur-xl" />
            <div className="relative bg-card/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/20 rounded-xl">
                      <SettingsIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        설정
                      </h1>
                      <p className="text-muted-foreground/80">
                        {user ? `${user.fullName || user.email}님의 ` : ''}계정
                        정보와 환경설정을 관리하세요
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="px-4 py-2 bg-primary/10 border-primary/30 text-primary font-medium"
                  >
                    <Crown className="h-3 w-3 mr-2" />
                    MVP 버전
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* 설정 섹션들 - 더 모던한 그리드 레이아웃 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* 프로필 정보 - 개선된 카드 */}
            <Card className="group relative overflow-hidden border-white/10 bg-card/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <User className="h-5 w-5 text-blue-400" />
                  </div>
                  프로필 정보
                  <div className="ml-auto">
                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-6">
                <Form method="post" className="space-y-5">
                  <input
                    type="hidden"
                    name="actionType"
                    value="updateProfile"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-sm font-medium text-foreground/80"
                      >
                        이름
                      </Label>
                      <div className="relative">
                        <Input
                          id="name"
                          name="name"
                          value={profileData.name}
                          onChange={(e) =>
                            handleProfileChange('name', e.target.value)
                          }
                          placeholder="이름을 입력하세요"
                          className="bg-background/50 border-white/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="position"
                        className="text-sm font-medium text-foreground/80"
                      >
                        직책
                      </Label>
                      <div className="relative">
                        <Input
                          id="position"
                          value={profileData.position}
                          placeholder="직책"
                          className="bg-muted/50 border-white/10 text-muted-foreground cursor-not-allowed"
                          readOnly
                        />
                        <Badge className="absolute right-2 top-2 text-xs bg-muted text-muted-foreground">
                          읽기 전용
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="flex items-center gap-2 text-sm font-medium text-foreground/80"
                    >
                      <Mail className="h-4 w-4 text-emerald-400" />
                      이메일
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        placeholder="이메일"
                        className="bg-muted/50 border-white/10 text-muted-foreground cursor-not-allowed pl-10"
                        readOnly
                      />
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Badge className="absolute right-2 top-2 text-xs bg-muted text-muted-foreground">
                        읽기 전용
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="flex items-center gap-2 text-sm font-medium text-foreground/80"
                    >
                      <Phone className="h-4 w-4 text-cyan-400" />
                      전화번호
                    </Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        name="phone"
                        value={profileData.phone}
                        onChange={(e) =>
                          handleProfileChange('phone', e.target.value)
                        }
                        placeholder="전화번호를 입력하세요"
                        className="bg-background/50 border-white/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 pl-10"
                      />
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="company"
                      className="flex items-center gap-2 text-sm font-medium text-foreground/80"
                    >
                      <Building className="h-4 w-4 text-purple-400" />
                      회사
                    </Label>
                    <div className="relative">
                      <Input
                        id="company"
                        name="company"
                        value={profileData.company}
                        onChange={(e) =>
                          handleProfileChange('company', e.target.value)
                        }
                        placeholder="회사명을 입력하세요"
                        className="bg-background/50 border-white/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 pl-10"
                      />
                      <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 h-11"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    프로필 저장
                  </Button>
                </Form>
              </CardContent>
            </Card>

            {/* 알림 설정 */}
            <Card className="group relative overflow-hidden border-white/10 bg-card/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Bell className="h-5 w-5 text-yellow-400" />
                  </div>
                  알림 설정
                  <div className="ml-auto">
                    <Badge
                      className={`text-xs ${
                        emailNotifications
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {emailNotifications ? '활성화' : '비활성화'}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-6">
                <Form method="post" className="space-y-5">
                  <input
                    type="hidden"
                    name="actionType"
                    value="updateNotifications"
                  />
                  <input
                    type="hidden"
                    name="emailNotifications"
                    value={emailNotifications.toString()}
                  />

                  <div className="p-4 rounded-xl bg-background/30 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-emerald-400" />
                          <Label
                            htmlFor="email-notifications"
                            className="font-medium"
                          >
                            이메일 알림
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          새로운 고객, 회의 일정 등 중요한 정보를 이메일로
                          받아보세요
                        </p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-11"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    알림 설정 저장
                  </Button>
                </Form>
              </CardContent>
            </Card>

            {/* 시스템 설정 */}
            <Card className="group relative overflow-hidden border-white/10 bg-card/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Monitor className="h-5 w-5 text-indigo-400" />
                  </div>
                  시스템 설정
                  <div className="ml-auto">
                    <Badge className="bg-indigo-500/20 text-indigo-400 text-xs">
                      {darkMode ? '다크' : '라이트'} 모드
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-6">
                <Form method="post" className="space-y-5">
                  <input type="hidden" name="actionType" value="updateSystem" />
                  <input
                    type="hidden"
                    name="darkMode"
                    value={darkMode.toString()}
                  />

                  <div className="p-4 rounded-xl bg-background/30 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {darkMode ? (
                            <Moon className="h-4 w-4 text-indigo-400" />
                          ) : (
                            <Sun className="h-4 w-4 text-yellow-400" />
                          )}
                          <Label htmlFor="dark-mode" className="font-medium">
                            다크 모드
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          어두운 테마로 눈의 피로를 줄이고 집중력을 높여보세요
                        </p>
                      </div>
                      <Switch
                        id="dark-mode"
                        checked={darkMode}
                        onCheckedChange={setDarkMode}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-11"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    시스템 설정 저장
                  </Button>
                </Form>
              </CardContent>
            </Card>

            {/* 보안 설정 */}
            <Card className="group relative overflow-hidden border-white/10 bg-card/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <Shield className="h-5 w-5 text-red-400" />
                  </div>
                  보안 설정
                  <div className="ml-auto">
                    <Badge className="bg-red-500/20 text-red-400 text-xs">
                      보안
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-6">
                <Form method="post" className="space-y-5">
                  <input
                    type="hidden"
                    name="actionType"
                    value="changePassword"
                  />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground/80">
                        현재 비밀번호
                      </Label>
                      <Input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          handlePasswordChange(
                            'currentPassword',
                            e.target.value
                          )
                        }
                        placeholder="현재 비밀번호를 입력하세요"
                        className="bg-background/50 border-white/20 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground/80">
                        새 비밀번호
                      </Label>
                      <Input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          handlePasswordChange('newPassword', e.target.value)
                        }
                        placeholder="새 비밀번호를 입력하세요 (6자 이상)"
                        className="bg-background/50 border-white/20 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground/80">
                        새 비밀번호 확인
                      </Label>
                      <Input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          handlePasswordChange(
                            'confirmPassword',
                            e.target.value
                          )
                        }
                        placeholder="새 비밀번호를 다시 입력하세요"
                        className="bg-background/50 border-white/20 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-11"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    비밀번호 변경
                  </Button>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* 계정 정보 - 더 세련된 디자인 */}
          <Card className="relative overflow-hidden border-white/10 bg-card/50 backdrop-blur-sm shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <User className="h-5 w-5 text-primary" />
                </div>
                계정 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl bg-background/30 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-blue-500/20 rounded">
                      <User className="h-3 w-3 text-blue-400" />
                    </div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      사용자 ID
                    </Label>
                  </div>
                  <p className="font-mono text-xs text-foreground/80 break-all bg-background/50 p-2 rounded border border-white/10">
                    {userProfile.id}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-background/30 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-green-500/20 rounded">
                      <Calendar className="h-3 w-3 text-green-400" />
                    </div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      가입일
                    </Label>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {formatJoinDate(userProfile.createdAt)}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-background/30 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-purple-500/20 rounded">
                      <Crown className="h-3 w-3 text-purple-400" />
                    </div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      플랜
                    </Label>
                  </div>
                  <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-medium">
                    MVP 베타
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 안내 메시지 - 더 아름답게 */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 backdrop-blur-sm">
            <div className="absolute inset-0 bg-grid-pattern opacity-5" />
            <div className="relative p-6 text-center">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary font-medium text-sm">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                설정 가이드
              </div>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                💡 모든 설정 변경사항은{' '}
                <span className="text-primary font-medium">저장 버튼</span>을
                클릭하여 즉시 적용됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
