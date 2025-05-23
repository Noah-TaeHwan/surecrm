import type { Route } from '.react-router/types/app/features/settings/pages/+types/settings-page';
import { MainLayout } from '~/common/layouts/main-layout';

// 컴포넌트 imports
import { ProfileSection } from '../components/profile-section';
import { NotificationSection } from '../components/notification-section';
import { PasswordSection } from '../components/password-section';
import { SystemSection } from '../components/system-section';

// 타입 imports
import type {
  UserProfile,
  NotificationSettings,
  SystemSettings,
} from '../components/types';

export function loader({ request }: Route.LoaderArgs) {
  // TODO: 실제 API에서 데이터 가져오기
  const userProfile: UserProfile = {
    id: '1',
    name: '김영희',
    email: 'kim@example.com',
    phone: '010-1234-5678',
    company: 'ABC 보험',
    position: '영업팀장',
    team: {
      id: 'team-1',
      name: '서울 강남팀',
      description: '강남 지역 전담 영업팀',
    },
  };

  const notificationSettings: NotificationSettings = {
    meetingReminder: true,
    contractUpdate: true,
  };

  const systemSettings: SystemSettings = {
    language: 'ko',
    darkMode: false,
  };

  return {
    userProfile,
    notificationSettings,
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
  const { userProfile, notificationSettings, systemSettings } = loaderData;

  // 프로필 업데이트
  const handleProfileUpdate = (data: Partial<UserProfile>) => {
    console.log('프로필 업데이트:', data);
    // TODO: API 호출
  };

  // 알림 설정 업데이트
  const handleNotificationUpdate = (settings: NotificationSettings) => {
    console.log('알림 설정 업데이트:', settings);
    // TODO: API 호출
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
    // TODO: API 호출
  };

  return (
    <MainLayout title="설정">
      <div className="space-y-6">
        {/* 헤더 */}
        <div>
          <p className="text-muted-foreground">
            계정 정보와 앱 환경설정을 관리하세요
          </p>
        </div>

        {/* 프로필 정보 */}
        <ProfileSection profile={userProfile} onUpdate={handleProfileUpdate} />

        {/* 알림 설정 */}
        <NotificationSection
          settings={notificationSettings}
          onUpdate={handleNotificationUpdate}
        />

        {/* 비밀번호 변경 */}
        <PasswordSection onChangePassword={handlePasswordChange} />

        {/* 시스템 설정 */}
        <SystemSection
          settings={systemSettings}
          onUpdate={handleSystemUpdate}
        />
      </div>
    </MainLayout>
  );
}
