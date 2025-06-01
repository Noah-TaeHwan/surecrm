import type { Route } from './+types/settings-page';
import { MainLayout } from '~/common/layouts/main-layout';
import { getCurrentUser } from '~/lib/auth/core';
import { getUserProfile, getUserSettings } from '../lib/supabase-settings-data';
import { getNotificationSettings } from '~/features/notifications/lib/notifications-data';

// 설정 페이지 데이터 타입
interface SettingsPageData {
  userProfile: {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    position: string;
  };
  notificationSettings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    kakaoNotifications: boolean;
  };
  systemSettings: {
    language: string;
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
        },
        notificationSettings: {
          emailNotifications: false,
          smsNotifications: false,
          pushNotifications: false,
          kakaoNotifications: false,
        },
        systemSettings: {
          language: 'ko',
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
        phone: userProfileData?.phone || '010-0000-0000',
        company: userProfileData?.company || 'SureCRM',
        position: userProfileData?.position || '보험설계사',
      },
      notificationSettings: {
        emailNotifications:
          notificationSettingsData?.emailNotifications ?? true,
        smsNotifications: notificationSettingsData?.smsNotifications ?? false,
        pushNotifications: notificationSettingsData?.pushNotifications ?? true,
        kakaoNotifications:
          notificationSettingsData?.kakaoNotifications ?? false,
      },
      systemSettings: {
        language: userSettingsData?.language || 'ko',
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
      },
      notificationSettings: {
        emailNotifications: false,
        smsNotifications: false,
        pushNotifications: false,
        kakaoNotifications: false,
      },
      systemSettings: {
        language: 'ko',
        darkMode: true,
      },
      user: null,
    };
  }
}

export default function SettingsPage({ loaderData }: Route.ComponentProps) {
  const { userProfile, notificationSettings, systemSettings, user } =
    loaderData;

  return (
    <MainLayout title="설정">
      <div className="space-y-6">
        {/* 헤더 */}
        <div>
          <p className="text-muted-foreground">
            {user ? `${user.fullName || user.email}님, ` : ''}계정 정보와 앱
            환경설정을 관리하세요
          </p>
        </div>

        {/* 임시 설정 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 프로필 정보 */}
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">👤 프로필 정보</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">이름</label>
                <p className="text-muted-foreground">{userProfile.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">이메일</label>
                <p className="text-muted-foreground">{userProfile.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium">전화번호</label>
                <p className="text-muted-foreground">{userProfile.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium">회사</label>
                <p className="text-muted-foreground">{userProfile.company}</p>
              </div>
              <div>
                <label className="text-sm font-medium">사용자 ID</label>
                <p className="text-xs text-muted-foreground font-mono">
                  {userProfile.id}
                </p>
              </div>
            </div>
          </div>

          {/* 알림 설정 */}
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">🔔 알림 설정</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>이메일 알림</span>
                <span
                  className={
                    notificationSettings.emailNotifications
                      ? 'text-green-600'
                      : 'text-red-600'
                  }
                >
                  {notificationSettings.emailNotifications
                    ? '활성화'
                    : '비활성화'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>SMS 알림</span>
                <span
                  className={
                    notificationSettings.smsNotifications
                      ? 'text-green-600'
                      : 'text-red-600'
                  }
                >
                  {notificationSettings.smsNotifications
                    ? '활성화'
                    : '비활성화'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>푸시 알림</span>
                <span
                  className={
                    notificationSettings.pushNotifications
                      ? 'text-green-600'
                      : 'text-red-600'
                  }
                >
                  {notificationSettings.pushNotifications
                    ? '활성화'
                    : '비활성화'}
                </span>
              </div>
            </div>
          </div>

          {/* 시스템 설정 */}
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">⚙️ 시스템 설정</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>언어</span>
                <span>
                  {systemSettings.language === 'ko' ? '한국어' : 'English'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>다크 모드</span>
                <span
                  className={
                    systemSettings.darkMode
                      ? 'text-blue-600'
                      : 'text-yellow-600'
                  }
                >
                  {systemSettings.darkMode ? '활성화' : '비활성화'}
                </span>
              </div>
            </div>
          </div>

          {/* 보안 설정 */}
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">🔒 보안 설정</h3>
            <div className="space-y-3">
              <p className="text-muted-foreground">비밀번호 변경</p>
              <p className="text-muted-foreground">2단계 인증</p>
              <p className="text-muted-foreground">로그인 기록</p>
            </div>
          </div>
        </div>

        {/* 안내 메시지 */}
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
