import type { Route } from './+types/settings-page';
import { MainLayout } from '~/common/layouts/main-layout';
import { getCurrentUser } from '~/lib/auth/core';
import { redirect } from 'react-router';
import { useState, useEffect } from 'react';
import {
  getNotificationSettings,
  upsertNotificationSettings,
} from '~/features/notifications/lib/notifications-data';
import {
  getUserProfile,
  updateUserProfile,
  getUserSettings,
  updateUserSettings,
  type UserProfile,
} from '../lib/supabase-settings-data';

// UI imports
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/common/components/ui/accordion';
import { Badge } from '~/common/components/ui/badge';
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';

// 컴포넌트 imports
import { ProfileSection } from '../components/profile-section';
import { NotificationSection } from '../components/notification-section';
import { PasswordSection } from '../components/password-section';
import { SystemSection } from '../components/system-section';

// 타입 imports
import type { NotificationSettings, SystemSettings } from '../types';
import React from 'react';

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getCurrentUser(request);
  if (!user) {
    throw redirect('/auth/login');
  }

  try {
    // 병렬로 데이터 가져오기
    const [userProfileData, notificationSettingsData, userSettingsData] =
      await Promise.all([
        getUserProfile(user.id),
        getNotificationSettings(user.id),
        getUserSettings(user.id),
      ]);

    // 기본값으로 설정 (설정이 없는 경우)
    const defaultNotificationSettings: NotificationSettings = {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      kakaoNotifications: false,
      meetingReminders: true,
      goalDeadlines: true,
      newReferrals: true,
      clientMilestones: true,
      teamUpdates: true,
      systemAlerts: true,
      birthdayReminders: false,
      followUpReminders: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      weekendNotifications: false,
    };

    const userProfile: UserProfile = userProfileData || {
      id: user.id,
      name: '사용자',
      email: user.email || '',
      phone: '',
      company: 'SureCRM',
      position: '보험설계사',
    };

    // 이메일은 auth에서 가져온 정보로 업데이트
    if (userProfile.email === '' && user.email) {
      userProfile.email = user.email;
    }

    const systemSettings: SystemSettings = {
      language: userSettingsData?.language || 'ko',
      darkMode: userSettingsData?.darkMode || true,
    };

    return {
      userProfile,
      notificationSettings: notificationSettingsData
        ? {
            emailNotifications: notificationSettingsData.emailNotifications,
            smsNotifications: notificationSettingsData.smsNotifications,
            pushNotifications: notificationSettingsData.pushNotifications,
            kakaoNotifications: notificationSettingsData.kakaoNotifications,
            meetingReminders: notificationSettingsData.meetingReminders,
            goalDeadlines: notificationSettingsData.goalDeadlines,
            newReferrals: notificationSettingsData.newReferrals,
            clientMilestones: notificationSettingsData.clientMilestones,
            teamUpdates: notificationSettingsData.teamUpdates,
            systemAlerts: notificationSettingsData.systemAlerts,
            birthdayReminders: notificationSettingsData.birthdayReminders,
            followUpReminders: notificationSettingsData.followUpReminders,
            quietHoursStart:
              notificationSettingsData.quietHoursStart || '22:00',
            quietHoursEnd: notificationSettingsData.quietHoursEnd || '08:00',
            weekendNotifications: notificationSettingsData.weekendNotifications,
          }
        : defaultNotificationSettings,
      systemSettings,
    };
  } catch (error) {
    console.error('설정 데이터 로드 실패:', error);

    // 에러 발생 시 기본값 반환
    const userProfile: UserProfile = {
      id: user.id,
      name: '사용자',
      email: user.email || '',
      phone: '',
      company: 'SureCRM',
      position: '보험설계사',
    };

    const notificationSettings: NotificationSettings = {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      kakaoNotifications: false,
      meetingReminders: true,
      goalDeadlines: true,
      newReferrals: true,
      clientMilestones: true,
      teamUpdates: true,
      systemAlerts: true,
      birthdayReminders: false,
      followUpReminders: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      weekendNotifications: false,
    };

    const systemSettings: SystemSettings = {
      language: 'ko',
      darkMode: true,
    };

    return {
      userProfile,
      notificationSettings,
      systemSettings,
    };
  }
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getCurrentUser(request);
  if (!user) {
    throw redirect('/auth/login');
  }

  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  try {
    if (intent === 'updateProfile') {
      // 프로필 정보 업데이트
      const profileUpdates = {
        name: formData.get('name') as string,
        phone: formData.get('phone') as string,
        company: formData.get('company') as string,
      };

      const success = await updateUserProfile(user.id, profileUpdates);

      return {
        success,
        message: success
          ? '프로필이 성공적으로 업데이트되었습니다.'
          : '프로필 업데이트에 실패했습니다.',
      };
    }

    if (intent === 'updateNotifications') {
      // 알림 설정 업데이트
      const notificationSettings = {
        emailNotifications: formData.get('emailNotifications') === 'true',
        smsNotifications: formData.get('smsNotifications') === 'true',
        pushNotifications: formData.get('pushNotifications') === 'true',
        kakaoNotifications: formData.get('kakaoNotifications') === 'true',
        meetingReminders: formData.get('meetingReminders') === 'true',
        goalDeadlines: formData.get('goalDeadlines') === 'true',
        newReferrals: formData.get('newReferrals') === 'true',
        clientMilestones: formData.get('clientMilestones') === 'true',
        teamUpdates: formData.get('teamUpdates') === 'true',
        systemAlerts: formData.get('systemAlerts') === 'true',
        birthdayReminders: formData.get('birthdayReminders') === 'true',
        followUpReminders: formData.get('followUpReminders') === 'true',
        quietHoursStart: (formData.get('quietHoursStart') as string) || '22:00',
        quietHoursEnd: (formData.get('quietHoursEnd') as string) || '08:00',
        weekendNotifications: formData.get('weekendNotifications') === 'true',
      };

      await upsertNotificationSettings(user.id, notificationSettings);

      return {
        success: true,
        message: '알림 설정이 저장되었습니다.',
      };
    }

    if (intent === 'updateSystem') {
      // 시스템 설정 업데이트
      const systemSettings = {
        language: formData.get('language') as string,
        darkMode: formData.get('darkMode') === 'true',
      };

      const success = await updateUserSettings(user.id, systemSettings);

      return {
        success,
        message: success
          ? '시스템 설정이 저장되었습니다.'
          : '시스템 설정 저장에 실패했습니다.',
      };
    }

    return {
      success: false,
      message: '알 수 없는 요청입니다.',
    };
  } catch (error) {
    console.error('설정 저장 실패:', error);
    return {
      success: false,
      message: '설정 저장에 실패했습니다.',
    };
  }
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
  const { userProfile, notificationSettings, systemSettings } = loaderData;
  const [localNotificationSettings, setLocalNotificationSettings] =
    useState(notificationSettings);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // 다크모드 설정 적용
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      if (systemSettings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [systemSettings.darkMode]);

  // 액션 결과 처리
  useEffect(() => {
    if (actionData?.success) {
      setLastSaved(new Date());
      setFeedbackMessage({
        type: 'success',
        message: actionData.message || '설정이 성공적으로 저장되었습니다.',
      });
    } else if (actionData && !actionData.success) {
      setFeedbackMessage({
        type: 'error',
        message: actionData.message,
      });
    }

    // 피드백 메시지 자동 숨김
    if (actionData) {
      const timer = setTimeout(() => {
        setFeedbackMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [actionData]);

  // 자동 저장 함수
  const autoSave = async (formData: FormData) => {
    setIsAutoSaving(true);
    try {
      // Form submission 로직은 기존 action에서 처리
      setLastSaved(new Date());
    } catch (error) {
      console.error('자동 저장 실패:', error);
    } finally {
      setIsAutoSaving(false);
    }
  };

  // 프로필 업데이트
  const handleProfileUpdate = (data: Partial<UserProfile>) => {
    console.log('프로필 업데이트:', data);
    // 실제 구현: Form submission으로 처리됨
  };

  // 알림 설정 업데이트
  const handleNotificationUpdate = (settings: NotificationSettings) => {
    console.log('알림 설정 업데이트:', settings);
    setLocalNotificationSettings(settings);
    // 실제 구현: Form submission으로 처리됨
  };

  // 비밀번호 변경
  const handlePasswordChange = (
    currentPassword: string,
    newPassword: string
  ) => {
    console.log('비밀번호 변경');
    // TODO: API 호출
  };

  // 시스템 설정 업데이트
  const handleSystemUpdate = (settings: SystemSettings) => {
    console.log('시스템 설정 업데이트:', settings);
    // 실제 구현: Form submission으로 처리됨 (SystemSection에서)
  };

  return (
    <MainLayout title="설정">
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              계정 정보와 앱 환경설정을 관리하세요
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isAutoSaving && (
              <Badge variant="secondary" className="animate-pulse">
                저장 중...
              </Badge>
            )}
            {lastSaved && !isAutoSaving && (
              <Badge variant="outline" className="text-xs">
                마지막 저장:{' '}
                {lastSaved.toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Badge>
            )}
          </div>
        </div>

        {/* 피드백 메시지 */}
        {feedbackMessage && (
          <Alert
            className={`${
              feedbackMessage.type === 'success'
                ? 'border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800'
                : 'border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800'
            }`}
          >
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
            <AlertDescription
              className={
                feedbackMessage.type === 'success'
                  ? 'text-green-800 dark:text-green-400'
                  : 'text-red-800 dark:text-red-400'
              }
            >
              {feedbackMessage.message}
            </AlertDescription>
          </Alert>
        )}

        {/* 설정 섹션들 - 아코디언으로 구성 */}
        <Accordion
          type="multiple"
          defaultValue={['profile', 'notifications', 'system']}
          className="w-full"
        >
          {/* 프로필 정보 */}
          <AccordionItem value="profile">
            <AccordionTrigger className="text-lg font-semibold">
              👤 프로필 정보
            </AccordionTrigger>
            <AccordionContent>
              <ProfileSection
                profile={userProfile}
                onUpdate={handleProfileUpdate}
              />
            </AccordionContent>
          </AccordionItem>

          {/* 알림 설정 */}
          <AccordionItem value="notifications">
            <AccordionTrigger className="text-lg font-semibold">
              🔔 알림 설정
            </AccordionTrigger>
            <AccordionContent>
              <NotificationSection
                settings={localNotificationSettings}
                onUpdate={handleNotificationUpdate}
              />
            </AccordionContent>
          </AccordionItem>

          {/* 보안 설정 */}
          <AccordionItem value="security">
            <AccordionTrigger className="text-lg font-semibold">
              🔒 보안 설정
            </AccordionTrigger>
            <AccordionContent>
              <PasswordSection onChangePassword={handlePasswordChange} />
            </AccordionContent>
          </AccordionItem>

          {/* 시스템 설정 */}
          <AccordionItem value="system">
            <AccordionTrigger className="text-lg font-semibold">
              ⚙️ 시스템 설정
            </AccordionTrigger>
            <AccordionContent>
              <SystemSection
                settings={systemSettings}
                onUpdate={handleSystemUpdate}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* 하단 안내 */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            💡 설정 변경사항은 자동으로 저장됩니다. 문제가 발생하면 고객지원팀에
            문의하세요.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
