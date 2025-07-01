// Route 타입 정의
namespace Route {
  export type LoaderArgs = any;
  export type ActionArgs = any;
  export type MetaArgs = any;
  export type ComponentProps = any;
}

import { MainLayout } from '~/common/layouts/main-layout';
import { getCurrentUser } from '~/lib/auth/core.server';
import {
  getUserProfile,
  updateUserProfile,
} from '../lib/supabase-settings-data';

import { data, redirect } from 'react-router';
import { createServerClient } from '~/lib/core/supabase';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import { Label } from '~/common/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';

import { Badge } from '~/common/components/ui/badge';

import {
  User,
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
  CheckCircle,
  XCircle,
  Globe,
} from 'lucide-react';
import { useState } from 'react';
import { Form } from 'react-router';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';

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

// 🌍 다국어 메타 정보 (대시보드 페이지와 동일한 패턴)
export function meta({ data }: Route.MetaArgs) {
  const meta = data?.meta;

  if (!meta) {
    // 기본값 fallback
    return [
      { title: '설정 - SureCRM' },
      {
        name: 'description',
        content: '계정 및 앱 환경설정 관리',
      },
    ];
  }

  return [
    { title: meta.title + ' - SureCRM' },
    { name: 'description', content: meta.description },
  ];
}

// 설정 페이지 로더 - 모든 설정 데이터를 실제 데이터베이스에서 로딩
export async function loader({
  request,
}: Route.LoaderArgs): Promise<
  SettingsPageData & { meta: { title: string; description: string } }
> {
  console.log('설정 페이지 로드 시작');

  try {
    // 🔥 구독 상태 확인 (트라이얼 만료 시 billing 페이지로 리다이렉트)
    const { requireActiveSubscription } = await import(
      '~/lib/auth/subscription-middleware.server'
    );
    const { user } = await requireActiveSubscription(request);

    // 🌍 서버에서 다국어 번역 로드
    const { createServerTranslator } = await import(
      '~/lib/i18n/language-manager.server'
    );
    const { t } = await createServerTranslator(request, 'settings');

    console.log('인증 성공:', user.email);

    // 모든 설정 데이터를 병렬로 로딩 (구글 캘린더 설정 포함)
    const [userProfileData, googleCalendarSettings] = await Promise.all([
      getUserProfile(user.id),
      // 구글 캘린더 설정 조회
      (async () => {
        try {
          const { GoogleCalendarService } = await import(
            '~/features/calendar/lib/google-calendar-service.server'
          );
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
      // 🌍 meta용 번역 데이터
      meta: {
        title: t('meta.title', '설정'),
        description: t('meta.description', '계정 및 앱 환경설정 관리'),
      },
      userProfile: {
        id: user.id,
        name: userProfileData?.name || user.fullName || '사용자',
        email: userProfileData?.email || user.email,
        phone: userProfileData?.phone || '',
        company: userProfileData?.company || 'SureCRM',
        position: userProfileData?.position || '보험설계사',
        createdAt: new Date().toISOString(),
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
      // 🌍 에러 시에도 안전한 기본값
      meta: {
        title: '설정',
        description: '계정 및 앱 환경설정 관리',
      },
      userProfile: {
        id: 'error',
        name: '오류',
        email: '',
        phone: '',
        company: '',
        position: '',
        createdAt: new Date().toISOString(),
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
        { success: false, error: 'settings:messages.loginRequired' },
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
        const position = formData.get('position') as string;

        const success = await updateUserProfile(user.id, {
          name,
          phone,
          company,
          position,
        });

        if (success) {
          return data({
            success: true,
            message: 'settings:messages.profileSaveSuccess',
          });
        } else {
          return data({
            success: false,
            error: 'settings:messages.profileSaveError',
          });
        }
      }

      case 'connectGoogleCalendar': {
        // 🔗 구글 캘린더 연동 시작 - OAuth URL로 리다이렉트
        const { GoogleCalendarService } = await import(
          '~/features/calendar/lib/google-calendar-service.server'
        );
        const googleService = new GoogleCalendarService();
        const authUrl = googleService.getAuthUrl(user.id);

        // OAuth URL로 리다이렉트
        return redirect(authUrl);
      }

      case 'disconnectGoogleCalendar': {
        // 🔌 구글 캘린더 연동 해제
        try {
          const { GoogleCalendarService } = await import(
            '~/features/calendar/lib/google-calendar-service.server'
          );
          const googleService = new GoogleCalendarService();
          const success = await googleService.disconnectCalendar(user.id);

          return data({
            success,
            message: success
              ? 'settings:messages.calendarDisconnectSuccess'
              : 'settings:messages.calendarDisconnectError',
          });
        } catch (error) {
          console.error('❌ 구글 캘린더 연동 해제 실패:', error);
          return data({
            success: false,
            message: 'settings:messages.calendarDisconnectError',
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
            error: 'settings:messages.passwordRequired',
          });
        }

        if (newPassword !== confirmPassword) {
          return data({
            success: false,
            error: 'settings:messages.passwordMismatch',
          });
        }

        if (newPassword.length < 6) {
          return data({
            success: false,
            error: 'settings:messages.passwordTooShort',
          });
        }

        if (currentPassword === newPassword) {
          return data({
            success: false,
            error: 'settings:messages.passwordSame',
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
              error: 'settings:messages.passwordIncorrect',
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
              error: 'settings:messages.passwordChangeError',
            });
          }

          return data({
            success: true,
            message: 'settings:messages.passwordChangeSuccess',
          });
        } catch (error) {
          console.error('비밀번호 변경 예외:', error);
          return data({
            success: false,
            error: 'settings:messages.passwordChangeError',
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
  // 🌍 다국어 번역 훅 적용
  const { t } = useHydrationSafeTranslation('settings');
  const { userProfile, calendarSettings, user } = loaderData;

  // 프로필 정보 state
  const [profileData, setProfileData] = useState({
    name: userProfile.name,
    email: userProfile.email,
    phone: userProfile.phone,
    company: userProfile.company,
    position: userProfile.position,
  });

  // 🕐 시간 포맷팅 함수 (suppressHydrationWarning 사용)
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '정보 없음';
    return new Date(dateString).toLocaleString('ko-KR');
  };

  // 비밀번호 변경 state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // 프로필 정보 변경 핸들러
  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // 비밀번호 변경 핸들러
  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // 🌐 캘린더 설정 변경 핸들러

  return (
    <MainLayout title={t('title', '설정')}>
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
        {/* 성공/오류 메시지 - 더 세련된 디자인 */}
        {actionData && (
          <div
            className={`relative overflow-hidden rounded-xl border backdrop-blur-sm transition-all duration-300 ${
              actionData.success
                ? 'bg-primary/10 text-primary border-primary/30'
                : 'bg-destructive/10 text-destructive border-destructive/30'
            }`}
          >
            <div className="flex items-center gap-3 p-3 sm:p-4">
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
                <p className="font-medium text-sm sm:text-base">
                  {actionData.success
                    ? t(
                        String(actionData.message) || 'Success',
                        String(actionData.message) || 'Success'
                      )
                    : t(
                        String(actionData.error) || 'Error',
                        String(actionData.error) || 'Error'
                      )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 🎯 모바일 최적화: 헤더 - 더 임팩트 있게 */}
        <div className="relative">
          <div className="relative bg-card border rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-3 bg-muted rounded-xl">
                    <SettingsIcon className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                      {t('header.title', '설정')}
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      {user ? `${user.fullName || user.email}` : ''}
                      {t(
                        'header.subtitle',
                        '님의 계정 정보와 환경설정을 관리하세요'
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 justify-start sm:justify-end">
                <Badge variant="outline" className="px-3 sm:px-4 py-2">
                  <Crown className="h-3 w-3 mr-2" />
                  {t('header.mvpBadge', 'MVP 버전')}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* 🎯 모바일 최적화: 메인 설정 - 프로필 정보와 보안 설정 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* 🎯 모바일 최적화: 프로필 정보 */}
          <Card className="border bg-card">
            <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-3 text-base sm:text-lg font-semibold">
                <div className="p-2 bg-muted rounded-lg">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                </div>
                {t('profile.title', '프로필 정보')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-5 sm:space-y-6">
              <Form method="post" className="space-y-4 sm:space-y-5">
                <input type="hidden" name="actionType" value="updateProfile" />

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-sm font-medium text-foreground/80"
                    >
                      {t('profile.name', '이름')}
                    </Label>
                    <div className="relative">
                      <Input
                        id="name"
                        name="name"
                        value={profileData.name}
                        onChange={e =>
                          handleProfileChange('name', e.target.value)
                        }
                        placeholder={t(
                          'profile.namePlaceholder',
                          '이름을 입력하세요'
                        )}
                        className="bg-background border min-h-[44px]"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="position"
                      className="text-sm font-medium text-foreground/80"
                    >
                      {t('profile.position', '직책')}
                    </Label>
                    <Select
                      name="position"
                      value={profileData.position}
                      onValueChange={value =>
                        handleProfileChange('position', value)
                      }
                    >
                      <SelectTrigger className="min-h-[44px]">
                        <SelectValue
                          placeholder={t(
                            'profile.positionPlaceholder',
                            '직책을 선택하세요'
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value={t(
                            'profile.positions.insurance_agent',
                            '보험설계사'
                          )}
                        >
                          {t('profile.positions.insurance_agent', '보험설계사')}
                        </SelectItem>
                        <SelectItem
                          value={t(
                            'profile.positions.sales_manager',
                            '영업관리자'
                          )}
                        >
                          {t('profile.positions.sales_manager', '영업관리자')}
                        </SelectItem>
                        <SelectItem
                          value={t('profile.positions.team_leader', '팀장')}
                        >
                          {t('profile.positions.team_leader', '팀장')}
                        </SelectItem>
                        <SelectItem
                          value={t(
                            'profile.positions.branch_manager',
                            '지점장'
                          )}
                        >
                          {t('profile.positions.branch_manager', '지점장')}
                        </SelectItem>
                        <SelectItem
                          value={t(
                            'profile.positions.regional_manager',
                            '지역관리자'
                          )}
                        >
                          {t(
                            'profile.positions.regional_manager',
                            '지역관리자'
                          )}
                        </SelectItem>
                        <SelectItem
                          value={t('profile.positions.director', '이사')}
                        >
                          {t('profile.positions.director', '이사')}
                        </SelectItem>
                        <SelectItem
                          value={t('profile.positions.consultant', '컨설턴트')}
                        >
                          {t('profile.positions.consultant', '컨설턴트')}
                        </SelectItem>
                        <SelectItem
                          value={t('profile.positions.agent', '상담원')}
                        >
                          {t('profile.positions.agent', '상담원')}
                        </SelectItem>
                        <SelectItem
                          value={t('profile.positions.other', '기타')}
                        >
                          {t('profile.positions.other', '기타')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-2 text-sm font-medium text-foreground/80"
                  >
                    <Mail className="h-4 w-4" />
                    {t('profile.email', '이메일')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      placeholder={t('profile.email', '이메일')}
                      className="bg-muted/50 border-white/10 text-muted-foreground cursor-not-allowed pl-10 min-h-[44px]"
                      readOnly
                    />
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Badge className="absolute right-2 top-2 text-xs bg-muted text-muted-foreground">
                      {t('profile.readOnly', '읽기 전용')}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="flex items-center gap-2 text-sm font-medium text-foreground/80"
                  >
                    <Phone className="h-4 w-4 text-foreground" />
                    {t('profile.phone', '전화번호')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={e =>
                        handleProfileChange('phone', e.target.value)
                      }
                      placeholder={t(
                        'profile.phonePlaceholder',
                        '전화번호를 입력하세요'
                      )}
                      className="bg-background border pl-10 min-h-[44px]"
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
                    {t('profile.company', '회사')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="company"
                      name="company"
                      value={profileData.company}
                      onChange={e =>
                        handleProfileChange('company', e.target.value)
                      }
                      placeholder={t(
                        'profile.companyPlaceholder',
                        '회사명을 입력하세요'
                      )}
                      className="bg-background border pl-10 min-h-[44px]"
                    />
                    <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <Button type="submit" className="w-full min-h-[44px]">
                  <Save className="h-4 w-4 mr-2" />
                  {t('profile.save', '프로필 저장')}
                </Button>
              </Form>
            </CardContent>
          </Card>

          {/* 🎯 모바일 최적화: 보안 설정 */}
          <Card className="border bg-card">
            <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-3 text-base sm:text-lg font-semibold">
                <div className="p-2 bg-muted rounded-lg">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                </div>
                {t('security.title', '보안 설정')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-5 sm:space-y-6">
              <Form method="post" className="space-y-4 sm:space-y-5">
                <input type="hidden" name="actionType" value="changePassword" />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">
                      {t('security.currentPassword', '현재 비밀번호')}
                    </Label>
                    <Input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={e =>
                        handlePasswordChange('currentPassword', e.target.value)
                      }
                      placeholder={t(
                        'security.currentPasswordPlaceholder',
                        '현재 비밀번호를 입력하세요'
                      )}
                      className="bg-background border min-h-[44px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">
                      {t('security.newPassword', '새 비밀번호')}
                    </Label>
                    <Input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={e =>
                        handlePasswordChange('newPassword', e.target.value)
                      }
                      placeholder={t(
                        'security.newPasswordPlaceholder',
                        '새 비밀번호를 입력하세요 (6자 이상)'
                      )}
                      className="bg-background border min-h-[44px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">
                      {t('security.confirmPassword', '새 비밀번호 확인')}
                    </Label>
                    <Input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={e =>
                        handlePasswordChange('confirmPassword', e.target.value)
                      }
                      placeholder={t(
                        'security.confirmPasswordPlaceholder',
                        '새 비밀번호를 다시 입력하세요'
                      )}
                      className="bg-background border min-h-[44px]"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="destructive"
                  className="w-full min-h-[44px]"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {t('security.changePassword', '비밀번호 변경')}
                </Button>
              </Form>

              {/* 보안 가이드 */}
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-muted/50 border rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {t('security.guide.title', '보안 권장사항')}
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>
                        •{' '}
                        {t(
                          'security.guide.items.0',
                          '비밀번호는 6자 이상으로 설정하세요'
                        )}
                      </li>
                      <li>
                        •{' '}
                        {t(
                          'security.guide.items.1',
                          '정기적으로 비밀번호를 변경하세요'
                        )}
                      </li>
                      <li>
                        •{' '}
                        {t(
                          'security.guide.items.2',
                          '다른 서비스와 다른 비밀번호를 사용하세요'
                        )}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 🎯 모바일 최적화: 🌐 구글 캘린더 연동 및 설정 가이드 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* 🎯 모바일 최적화: 🌐 구글 캘린더 연동 설정 */}
          <Card className="border bg-card">
            <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-3 text-base sm:text-lg font-semibold">
                <div className="p-2 bg-muted rounded-lg">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                </div>
                {t('calendar.title', '구글 캘린더 연동')}
              </CardTitle>
              <CardDescription className="text-sm">
                {t(
                  'calendar.description',
                  '구글 캘린더와 SureCRM을 연동하여 일정을 통합 관리하세요'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-5 sm:space-y-6">
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
                        ? t('calendar.status.connected', '연동됨')
                        : calendarSettings?.syncStatus === 'error'
                          ? t('calendar.status.error', '연동 오류')
                          : t('calendar.status.disconnected', '연동 안됨')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {calendarSettings?.syncStatus === 'connected' ? (
                        <span suppressHydrationWarning>
                          {t(
                            'calendar.statusDescription.connected',
                            '마지막 동기화: {{lastSync}}',
                            {
                              lastSync: formatDateTime(
                                calendarSettings.lastSyncAt
                              ),
                            }
                          )}
                        </span>
                      ) : calendarSettings?.syncStatus === 'error' ? (
                        t(
                          'calendar.statusDescription.error',
                          '연동에 문제가 발생했습니다'
                        )
                      ) : (
                        t(
                          'calendar.statusDescription.disconnected',
                          '구글 계정을 연결하여 캘린더를 동기화하세요'
                        )
                      )}
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
                    ? t('calendar.badge.active', '활성')
                    : t('calendar.badge.inactive', '비활성')}
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
                    {t('calendar.connect', '구글 계정 연결')}
                  </Button>
                </Form>
              ) : (
                <div className="space-y-4">
                  {/* 연동 해제 */}
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
                      {t('calendar.disconnect', '구글 캘린더 연동 해제')}
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
                      {t('calendar.guide.title', '캘린더 연동 안내')}
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>
                        •{' '}
                        {t(
                          'calendar.guide.items.0',
                          '구글 계정 권한이 필요합니다'
                        )}
                      </li>
                      <li>
                        •{' '}
                        {t(
                          'calendar.guide.items.1',
                          '양방향 동기화 시 데이터 충돌이 발생할 수 있습니다'
                        )}
                      </li>
                      <li>
                        •{' '}
                        {t(
                          'calendar.guide.items.2',
                          '언제든지 연동을 해제할 수 있습니다'
                        )}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 🎯 모바일 최적화: 도움말 및 가이드 */}
          <Card className="border bg-card">
            <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-3 text-base sm:text-lg font-semibold">
                <div className="p-2 bg-muted rounded-lg">
                  <SettingsIcon className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                </div>
                {t('guide.title', '설정 가이드')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 min-h-[44px]">
                  <div className="p-1 bg-primary/10 rounded">
                    <Save className="h-3 w-3 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t('guide.save.title', '설정 저장')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t(
                        'guide.save.description',
                        '모든 변경사항은 저장 버튼을 클릭하여 적용됩니다'
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 min-h-[44px]">
                  <div className="p-1 bg-orange/10 rounded">
                    <Shield className="h-3 w-3 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t('guide.security.title', '보안 관리')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t(
                        'guide.security.description',
                        '정기적으로 비밀번호를 변경해 계정을 안전하게 유지하세요'
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 min-h-[44px]">
                  <div className="p-1 bg-blue/10 rounded">
                    <User className="h-3 w-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t('guide.profile.title', '프로필 관리')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t(
                        'guide.profile.description',
                        '정확한 정보로 업데이트하여 팀과의 협업을 원활하게 하세요'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* MVP 안내 */}
              <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium text-primary">
                    {t('guide.mvp.title', 'MVP 버전')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t(
                    'guide.mvp.description',
                    '현재 베타 버전에서는 기본 설정만 제공됩니다. 추가 기능은 곧 업데이트될 예정입니다.'
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
