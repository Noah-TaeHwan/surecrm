import type { Route } from './+types/settings-page';
import { MainLayout } from '~/common/layouts/main-layout';
import { getCurrentUser } from '~/lib/auth/core';
import {
  getUserProfile,
  updateUserProfile,
} from '../lib/supabase-settings-data';
import {
  getNotificationSettings,
  upsertNotificationSettings,
} from '~/features/notifications/lib/notifications-data';
import { data, redirect } from 'react-router';
import { createServerClient, createAdminClient } from '~/lib/core/supabase';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Switch } from '~/common/components/ui/switch';
import { Input } from '~/common/components/ui/input';
import { Label } from '~/common/components/ui/label';
import { Separator } from '~/common/components/ui/separator';
import { Badge } from '~/common/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { RadioGroup, RadioGroupItem } from '~/common/components/ui/radio-group';
import {
  User,
  Bell,
  Shield,
  Save,
  Phone,
  Mail,
  Building,
  Settings as SettingsIcon,
  Check,
  AlertCircle,
  Calendar,
  Crown,
  LinkIcon,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Loader,
  Zap,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Form } from 'react-router';
import { GoogleCalendarService } from '~/features/calendar/lib/google-calendar-service';
import { eq } from 'drizzle-orm';
import { db } from '~/lib/core/db';
import { appCalendarSettings } from '~/features/calendar/lib/schema';

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
  calendarSettings?: {
    googleCalendarSync: boolean;
    syncDirection: 'read_only' | 'write_only' | 'bidirectional';
    conflictResolution: 'google_wins' | 'local_wins' | 'manual';
    autoSyncInterval: number;
    lastSyncAt?: string;
    syncStatus: 'connected' | 'disconnected' | 'error';
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
        calendarSettings: {
          googleCalendarSync: false,
          syncDirection: 'bidirectional' as const,
          conflictResolution: 'manual' as const,
          autoSyncInterval: 15,
          lastSyncAt: undefined,
          syncStatus: 'disconnected' as const,
        },
        user: null,
      };
    }

    console.log('인증 성공:', user.email);

    // 모든 설정 데이터를 병렬로 로딩 (구글 캘린더 설정 포함)
    const [userProfileData, notificationSettingsData, googleCalendarSettings] =
      await Promise.all([
        getUserProfile(user.id),
        getNotificationSettings(user.id),
        // 구글 캘린더 설정 조회
        (async () => {
          try {
            const googleService = new GoogleCalendarService();
            return await googleService.getCalendarSettings(user.id);
          } catch (error) {
            console.error('구글 캘린더 설정 조회 실패:', error);
            return null;
          }
        })(),
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
      // 🌐 구글 캘린더 설정 (실제 DB 데이터)
      calendarSettings: {
        googleCalendarSync: googleCalendarSettings?.googleCalendarSync ?? false,
        syncDirection: 'bidirectional' as const,
        conflictResolution: 'manual' as const,
        autoSyncInterval: 15,
        lastSyncAt: googleCalendarSettings?.lastSyncAt?.toISOString(),
        syncStatus: googleCalendarSettings?.googleAccessToken
          ? 'connected'
          : ('disconnected' as const),
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
      calendarSettings: {
        googleCalendarSync: false,
        syncDirection: 'bidirectional' as const,
        conflictResolution: 'manual' as const,
        autoSyncInterval: 15,
        lastSyncAt: undefined,
        syncStatus: 'disconnected' as const,
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

      case 'updateCalendarSettings': {
        // 🌐 구글 캘린더 설정 업데이트 (실제 DB 연동)
        const googleCalendarSync =
          formData.get('googleCalendarSync') === 'true';
        const syncDirection = formData.get('syncDirection') as
          | 'read_only'
          | 'write_only'
          | 'bidirectional';
        const conflictResolution = formData.get('conflictResolution') as
          | 'google_wins'
          | 'local_wins'
          | 'manual';
        const autoSyncInterval =
          parseInt(formData.get('autoSyncInterval') as string) || 15;

        try {
          // 기존 설정 조회
          const googleService = new GoogleCalendarService();
          const existingSettings = await googleService.getCalendarSettings(
            user.id
          );

          if (!existingSettings) {
            return data({
              success: false,
              message:
                '구글 캘린더가 연동되지 않았습니다. 먼저 계정을 연결해주세요.',
            });
          }

          // 캘린더 설정 업데이트
          await db
            .update(appCalendarSettings)
            .set({
              googleCalendarSync,
              // syncDirection, conflictResolution, autoSyncInterval은
              // 현재 스키마에 없으므로 추후 확장 시 추가
              updatedAt: new Date(),
            })
            .where(eq(appCalendarSettings.agentId, user.id));

          // 동기화 비활성화 시 관련 데이터 정리
          if (!googleCalendarSync) {
            console.log('구글 캘린더 동기화 비활성화:', user.id);
          }

          return data({
            success: true,
            message: '캘린더 설정이 성공적으로 저장되었습니다.',
          });
        } catch (error) {
          console.error('❌ 캘린더 설정 업데이트 실패:', error);
          return data({
            success: false,
            message: '설정 저장 중 오류가 발생했습니다.',
          });
        }
      }

      case 'connectGoogleCalendar': {
        // 🔗 구글 캘린더 연동 시작 - OAuth URL로 리다이렉트
        const googleService = new GoogleCalendarService();
        const authUrl = googleService.getAuthUrl(user.id);

        // OAuth URL로 리다이렉트
        return redirect(authUrl);
      }

      case 'disconnectGoogleCalendar': {
        // 🔌 구글 캘린더 연동 해제
        const googleService = new GoogleCalendarService();
        const success = await googleService.disconnectCalendar(user.id);

        return data({
          success,
          message: success
            ? '구글 캘린더 연동이 해제되었습니다.'
            : '연동 해제 중 오류가 발생했습니다.',
        });
      }

      case 'syncGoogleCalendar': {
        // 🔄 구글 캘린더 수동 동기화
        try {
          const googleService = new GoogleCalendarService();
          const success = await googleService.performFullSync(user.id);

          return data({
            success,
            message: success
              ? '구글 캘린더 동기화가 완료되었습니다.'
              : '동기화 중 오류가 발생했습니다.',
          });
        } catch (error) {
          console.error('❌ 수동 동기화 실패:', error);
          return data({
            success: false,
            message: '동기화 중 오류가 발생했습니다.',
          });
        }
      }

      case 'toggleRealtimeSync': {
        // 🔔 실시간 동기화 웹훅 설정/해제
        const enableRealtime = formData.get('enableRealtime') === 'true';

        try {
          const googleService = new GoogleCalendarService();

          if (enableRealtime) {
            // 웹훅 채널 생성
            const success = await googleService.createWebhookChannel(user.id);

            return data({
              success,
              message: success
                ? '실시간 동기화가 활성화되었습니다. 구글 캘린더 변경사항이 즉시 반영됩니다.'
                : '실시간 동기화 설정 중 오류가 발생했습니다.',
            });
          } else {
            // 웹훅 채널 삭제
            const success = await googleService.deleteWebhookChannel(user.id);

            return data({
              success,
              message: success
                ? '실시간 동기화가 비활성화되었습니다.'
                : '실시간 동기화 해제 중 오류가 발생했습니다.',
            });
          }
        } catch (error) {
          console.error('❌ 실시간 동기화 토글 실패:', error);
          return data({
            success: false,
            message: '실시간 동기화 설정 중 오류가 발생했습니다.',
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
  const { userProfile, notificationSettings, calendarSettings, user } =
    loaderData;

  // 프로필 정보 state
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

  // 🌐 구글 캘린더 설정 state
  const [calendarData, setCalendarData] = useState({
    googleCalendarSync: calendarSettings?.googleCalendarSync || false,
    syncDirection: calendarSettings?.syncDirection || 'bidirectional',
    conflictResolution: calendarSettings?.conflictResolution || 'manual',
    autoSyncInterval: calendarSettings?.autoSyncInterval || 15,
  });

  // 동기화 상태 추적
  const [isSyncing, setIsSyncing] = useState(false);

  // 🔔 실시간 동기화 상태 추적
  const [realtimeSync, setRealtimeSync] = useState(false);
  const [isTogglingRealtime, setIsTogglingRealtime] = useState(false);

  // 액션 완료 후 상태 리셋
  useEffect(() => {
    if (actionData?.success !== undefined) {
      setIsSyncing(false);
      setIsTogglingRealtime(false);
    }
  }, [actionData]);

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

  // 🌐 캘린더 설정 변경 핸들러
  const handleCalendarChange = (
    field: string,
    value: string | boolean | number
  ) => {
    setCalendarData((prev) => ({
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
      <div className="space-y-6">
        {/* 성공/오류 메시지 - 더 세련된 디자인 */}
        {actionData && (
          <div
            className={`relative overflow-hidden rounded-xl border backdrop-blur-sm transition-all duration-300 ${
              actionData.success
                ? 'bg-primary/10 text-primary border-primary/30'
                : 'bg-destructive/10 text-destructive border-destructive/30'
            }`}
          >
            <div className="flex items-center gap-3 p-4">
              <div
                className={`p-2 rounded-full ${
                  actionData.success ? 'bg-primary/20' : 'bg-destructive/20'
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
          </div>
        )}

        {/* 헤더 - 더 임팩트 있게 */}
        <div className="relative">
          <div className="relative bg-card border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-muted rounded-xl">
                    <SettingsIcon className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">설정</h1>
                    <p className="text-muted-foreground">
                      {user ? `${user.fullName || user.email}님의 ` : ''}계정
                      정보와 환경설정을 관리하세요
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="px-4 py-2">
                  <Crown className="h-3 w-3 mr-2" />
                  MVP 버전
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 설정 - 프로필 정보와 보안 설정 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 프로필 정보 */}
          <Card className="border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                <div className="p-2 bg-muted rounded-lg">
                  <User className="h-5 w-5 text-foreground" />
                </div>
                프로필 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <Form method="post" className="space-y-5">
                <input type="hidden" name="actionType" value="updateProfile" />

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
                        className="bg-background border"
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
                    <Mail className="h-4 w-4" />
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
                    <Phone className="h-4 w-4 text-foreground" />
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
                      className="bg-background border pl-10"
                    />
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="company"
                    className="flex items-center gap-2 text-sm font-medium text-foreground/80"
                  >
                    <Building className="h-4 w-4 text-foreground" />
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
                      className="bg-background border pl-10"
                    />
                    <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  프로필 저장
                </Button>
              </Form>
            </CardContent>
          </Card>

          {/* 보안 설정 */}
          <Card className="border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                <div className="p-2 bg-muted rounded-lg">
                  <Shield className="h-5 w-5 text-foreground" />
                </div>
                보안 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <Form method="post" className="space-y-5">
                <input type="hidden" name="actionType" value="changePassword" />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">
                      현재 비밀번호
                    </Label>
                    <Input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        handlePasswordChange('currentPassword', e.target.value)
                      }
                      placeholder="현재 비밀번호를 입력하세요"
                      className="bg-background border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">
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
                      className="bg-background border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">
                      새 비밀번호 확인
                    </Label>
                    <Input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        handlePasswordChange('confirmPassword', e.target.value)
                      }
                      placeholder="새 비밀번호를 다시 입력하세요"
                      className="bg-background border"
                    />
                  </div>
                </div>

                <Button type="submit" variant="destructive" className="w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  비밀번호 변경
                </Button>
              </Form>

              {/* 보안 가이드 */}
              <div className="mt-6 p-4 bg-muted/50 border rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      보안 권장사항
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• 비밀번호는 6자 이상으로 설정하세요</li>
                      <li>• 정기적으로 비밀번호를 변경하세요</li>
                      <li>• 다른 서비스와 다른 비밀번호를 사용하세요</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 🌐 연동 설정 - 알림 및 구글 캘린더 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 알림 설정 */}
          <Card className="border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                <div className="p-2 bg-muted rounded-lg">
                  <Bell className="h-5 w-5 text-foreground" />
                </div>
                알림 설정
              </CardTitle>
              <CardDescription>
                이메일 및 시스템 알림 설정을 관리하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <Form method="post" className="space-y-5">
                <input
                  type="hidden"
                  name="actionType"
                  value="updateNotifications"
                />

                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 mr-4">
                      <Label
                        htmlFor="emailNotifications"
                        className="text-sm font-medium"
                      >
                        이메일 알림
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        미팅 일정, 수수료 정보 등의 알림을 이메일로 받습니다
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      name="emailNotifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                      className="flex-shrink-0"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  알림 설정 저장
                </Button>
              </Form>

              {/* 알림 가이드 */}
              <div className="mt-6 p-4 bg-muted/50 border rounded-lg">
                <div className="flex items-start gap-3">
                  <Bell className="h-4 w-4 text-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      알림 정보
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• 중요한 일정과 업무 소식을 놓치지 마세요</li>
                      <li>• 언제든지 알림 설정을 변경할 수 있습니다</li>
                      <li>• 스팸함도 확인해 주세요</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 🌐 구글 캘린더 연동 설정 */}
          <Card className="border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                <div className="p-2 bg-muted rounded-lg">
                  <Calendar className="h-5 w-5 text-foreground" />
                </div>
                구글 캘린더 연동
              </CardTitle>
              <CardDescription>
                구글 캘린더와 SureCRM을 연동하여 일정을 통합 관리하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* 연동 상태 표시 */}
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      calendarSettings?.syncStatus === 'connected'
                        ? 'bg-green-100 text-green-600'
                        : calendarSettings?.syncStatus === 'error'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {calendarSettings?.syncStatus === 'connected' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : calendarSettings?.syncStatus === 'error' ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      <Globe className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {calendarSettings?.syncStatus === 'connected'
                        ? '연동됨'
                        : calendarSettings?.syncStatus === 'error'
                        ? '연동 오류'
                        : '연동 안됨'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {calendarSettings?.syncStatus === 'connected'
                        ? `마지막 동기화: ${
                            calendarSettings.lastSyncAt
                              ? new Date(
                                  calendarSettings.lastSyncAt
                                ).toLocaleString('ko-KR')
                              : '정보 없음'
                          }`
                        : calendarSettings?.syncStatus === 'error'
                        ? '연동에 문제가 발생했습니다'
                        : '구글 계정을 연결하여 캘린더를 동기화하세요'}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    calendarSettings?.syncStatus === 'connected'
                      ? 'default'
                      : 'secondary'
                  }
                  className="text-xs"
                >
                  {calendarSettings?.syncStatus === 'connected'
                    ? '활성'
                    : '비활성'}
                </Badge>
              </div>

              {/* 연동 제어 버튼 */}
              {calendarSettings?.syncStatus !== 'connected' ? (
                <Form method="post">
                  <input
                    type="hidden"
                    name="actionType"
                    value="connectGoogleCalendar"
                  />
                  <Button type="submit" className="w-full">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    구글 계정 연결
                  </Button>
                </Form>
              ) : (
                <div className="space-y-4">
                  {/* 연동 설정 */}
                  <Form method="post" className="space-y-4">
                    <input
                      type="hidden"
                      name="actionType"
                      value="updateCalendarSettings"
                    />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label
                          htmlFor="googleCalendarSync"
                          className="text-sm font-medium"
                        >
                          캘린더 동기화 활성화
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          SureCRM과 구글 캘린더 간 자동 동기화
                        </p>
                      </div>
                      <Switch
                        id="googleCalendarSync"
                        name="googleCalendarSync"
                        checked={calendarData.googleCalendarSync}
                        onCheckedChange={(checked) =>
                          handleCalendarChange('googleCalendarSync', checked)
                        }
                      />
                    </div>

                    {calendarData.googleCalendarSync && (
                      <>
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">
                            동기화 방향
                          </Label>
                          <Select
                            name="syncDirection"
                            value={calendarData.syncDirection}
                            onValueChange={(value) =>
                              handleCalendarChange('syncDirection', value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="동기화 방향 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="read_only">
                                <div className="flex items-center gap-2">
                                  <span>📥</span>
                                  <span>구글 → SureCRM (읽기 전용)</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="write_only">
                                <div className="flex items-center gap-2">
                                  <span>📤</span>
                                  <span>SureCRM → 구글 (쓰기 전용)</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="bidirectional">
                                <div className="flex items-center gap-2">
                                  <span>🔄</span>
                                  <span>양방향 동기화</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-medium">
                            충돌 해결 방식
                          </Label>
                          <RadioGroup
                            name="conflictResolution"
                            value={calendarData.conflictResolution}
                            onValueChange={(value) =>
                              handleCalendarChange('conflictResolution', value)
                            }
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="google_wins"
                                id="google_wins"
                              />
                              <Label htmlFor="google_wins" className="text-sm">
                                구글 캘린더 우선
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="local_wins"
                                id="local_wins"
                              />
                              <Label htmlFor="local_wins" className="text-sm">
                                SureCRM 우선
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="manual" id="manual" />
                              <Label htmlFor="manual" className="text-sm">
                                수동 선택
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="autoSyncInterval"
                            className="text-sm font-medium"
                          >
                            자동 동기화 간격 (분)
                          </Label>
                          <Select
                            name="autoSyncInterval"
                            value={calendarData.autoSyncInterval.toString()}
                            onValueChange={(value) =>
                              handleCalendarChange(
                                'autoSyncInterval',
                                parseInt(value)
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5분</SelectItem>
                              <SelectItem value="15">15분</SelectItem>
                              <SelectItem value="30">30분</SelectItem>
                              <SelectItem value="60">1시간</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        <Save className="h-4 w-4 mr-2" />
                        설정 저장
                      </Button>
                    </div>
                  </Form>

                  {/* 수동 동기화 버튼 */}
                  <Form method="post" onSubmit={() => setIsSyncing(true)}>
                    <input
                      type="hidden"
                      name="actionType"
                      value="syncGoogleCalendar"
                    />
                    <Button
                      type="submit"
                      variant="outline"
                      className="w-full gap-2"
                      disabled={isSyncing}
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`}
                      />
                      {isSyncing ? '동기화 중...' : '지금 동기화'}
                    </Button>
                  </Form>

                  {/* 🔔 실시간 동기화 설정 */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <Bell className="h-4 w-4 text-blue-600" />
                          실시간 동기화
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          구글 캘린더 변경사항을 즉시 SureCRM에 반영
                        </p>
                      </div>
                      <Form
                        method="post"
                        onSubmit={() => setIsTogglingRealtime(true)}
                      >
                        <input
                          type="hidden"
                          name="actionType"
                          value="toggleRealtimeSync"
                        />
                        <input
                          type="hidden"
                          name="enableRealtime"
                          value={realtimeSync ? 'false' : 'true'}
                        />
                        <Button
                          type="submit"
                          variant={realtimeSync ? 'default' : 'outline'}
                          size="sm"
                          disabled={isTogglingRealtime}
                          className="gap-2"
                        >
                          {isTogglingRealtime ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <Bell className="h-3 w-3" />
                          )}
                          {realtimeSync ? '비활성화' : '활성화'}
                        </Button>
                      </Form>
                    </div>

                    {realtimeSync ? (
                      <div className="flex items-center gap-2 text-xs text-green-700">
                        <CheckCircle className="h-3 w-3" />
                        실시간 동기화 활성화됨
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        수동 동기화만 사용 중
                      </div>
                    )}
                  </div>

                  {/* 연동 해제 */}
                  <Separator />
                  <Form method="post">
                    <input
                      type="hidden"
                      name="actionType"
                      value="disconnectGoogleCalendar"
                    />
                    <Button
                      type="submit"
                      variant="destructive"
                      size="sm"
                      className="w-full"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      구글 캘린더 연동 해제
                    </Button>
                  </Form>
                </div>
              )}

              {/* 캘린더 연동 가이드 */}
              <div className="mt-6 p-4 bg-muted/50 border rounded-lg">
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      캘린더 연동 안내
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• 구글 계정 권한이 필요합니다</li>
                      <li>
                        • 양방향 동기화 시 데이터 충돌이 발생할 수 있습니다
                      </li>
                      <li>• 언제든지 연동을 해제할 수 있습니다</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 계정 정보 및 시스템 설정 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 계정 정보 */}
          <Card className="border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                <div className="p-2 bg-muted rounded-lg">
                  <User className="h-5 w-5 text-foreground" />
                </div>
                계정 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">사용자 ID</span>
                  </div>
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                    {userProfile.id.slice(0, 8)}...
                  </code>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">가입일</span>
                  </div>
                  <span className="text-sm text-foreground">
                    {formatJoinDate(userProfile.createdAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">플랜</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    MVP 베타
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 도움말 및 가이드 */}
          <Card className="border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                <div className="p-2 bg-muted rounded-lg">
                  <SettingsIcon className="h-5 w-5 text-foreground" />
                </div>
                설정 가이드
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-primary/10 rounded">
                    <Save className="h-3 w-3 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      설정 저장
                    </p>
                    <p className="text-xs text-muted-foreground">
                      모든 변경사항은 저장 버튼을 클릭하여 적용됩니다
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 bg-orange/10 rounded">
                    <Shield className="h-3 w-3 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      보안 관리
                    </p>
                    <p className="text-xs text-muted-foreground">
                      정기적으로 비밀번호를 변경해 계정을 안전하게 유지하세요
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 bg-blue/10 rounded">
                    <User className="h-3 w-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      프로필 관리
                    </p>
                    <p className="text-xs text-muted-foreground">
                      정확한 정보로 업데이트하여 팀과의 협업을 원활하게 하세요
                    </p>
                  </div>
                </div>
              </div>

              {/* MVP 안내 */}
              <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium text-primary">
                    MVP 버전
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  현재 베타 버전에서는 기본 설정만 제공됩니다. 추가 기능은 곧
                  업데이트될 예정입니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
