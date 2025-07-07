import { useLoaderData } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { db } from '~/lib/core/db.server';
import schema from '~/lib/schema/all';
import { eq } from 'drizzle-orm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import { Label } from '~/common/components/ui/label';
import { Textarea } from '~/common/components/ui/textarea';
import { Switch } from '~/common/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import { Separator } from '~/common/components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/common/components/ui/tabs';
import {
  Settings,
  Globe,
  Shield,
  Mail,
  Database,
  Bell,
  Palette,
  Save,
  RefreshCw,
} from 'lucide-react';
import { useState } from 'react';
import type { SiteSetting } from '~/lib/schema/public';

// settings 객체에 대한 명확한 타입 정의
interface SiteSettingsMap {
  site_name?: string;
  site_url?: string;
  site_description?: string;
  admin_email?: string;
  support_email?: string;
  default_theme?: string;
  brand_color?: string;
  default_language?: string;
  timezone?: string;
  session_timeout?: string;
  max_login_attempts?: string;
  require_2fa?: string;
  force_https?: string;
  enable_audit_log?: string;
  smtp_host?: string;
  smtp_port?: string;
  smtp_username?: string;
  smtp_password?: string;
  smtp_use_tls?: string;
  backup_retention?: string;
  log_retention?: string;
  auto_backup?: string;
  maintenance_mode?: string;
  notify_new_user?: string;
  notify_payment?: string;
  notify_support?: string;
  notify_welcome?: string;
  notify_trial_end?: string;
  notify_billing?: string;
}

type LoaderData = {
  settings: SiteSettingsMap;
  siteSettings: SiteSetting[];
  error?: string;
};

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<LoaderData> {
  try {
    // 사이트 설정 조회
    const siteSettings = await db
      .select()
      .from(schema.siteSettings)
      .orderBy(schema.siteSettings.key);

    // 설정을 키-값 객체로 변환
    const settings: SiteSettingsMap = {};
    siteSettings.forEach(setting => {
      (settings as any)[setting.key] = setting.value;
    });

    return {
      settings,
      siteSettings,
    };
  } catch (error) {
    console.error('❌ 시스템 설정 로딩 실패:', error);
    return {
      settings: {},
      siteSettings: [],
      error: '설정을 불러오지 못했습니다.',
    };
  }
}

export default function AdminSettingsPage() {
  const { settings, siteSettings, error } = useLoaderData<LoaderData>();
  const [hasChanges, setHasChanges] = useState(false);

  const settingCategories = [
    {
      id: 'general',
      title: '일반 설정',
      description: '사이트 기본 정보 및 일반 설정',
      icon: Settings,
    },
    {
      id: 'localization',
      title: '다국어 설정',
      description: '언어 및 지역 설정',
      icon: Globe,
    },
    {
      id: 'security',
      title: '보안 설정',
      description: '보안 정책 및 인증 설정',
      icon: Shield,
    },
    {
      id: 'email',
      title: '이메일 설정',
      description: 'SMTP 설정 및 이메일 템플릿',
      icon: Mail,
    },
    {
      id: 'maintenance',
      title: '시스템 관리',
      description: '데이터베이스 및 시스템 유지보수',
      icon: Database,
    },
    {
      id: 'notifications',
      title: '알림 설정',
      description: '시스템 알림 및 푸시 설정',
      icon: Bell,
    },
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            시스템 설정
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            SureCRM 시스템의 전반적인 설정을 관리합니다
          </p>
        </div>
        {hasChanges && (
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setHasChanges(false)}>
              취소
            </Button>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              변경사항 저장
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          {settingCategories.map(category => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="flex items-center space-x-2"
            >
              <category.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{category.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* 일반 설정 */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>사이트 기본 정보</span>
              </CardTitle>
              <CardDescription>
                사이트의 기본 정보를 설정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="site_name">사이트 이름</Label>
                  <Input
                    id="site_name"
                    name="site_name"
                    defaultValue={settings.site_name || 'SureCRM'}
                    onChange={() => setHasChanges(true)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site_url">사이트 URL</Label>
                  <Input
                    id="site_url"
                    name="site_url"
                    defaultValue={settings.site_url || 'https://surecrm.pro'}
                    onChange={() => setHasChanges(true)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="site_description">사이트 설명</Label>
                <Textarea
                  id="site_description"
                  name="site_description"
                  defaultValue={settings.site_description || ''}
                  placeholder="사이트에 대한 간단한 설명을 입력하세요"
                  onChange={() => setHasChanges(true)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin_email">관리자 이메일</Label>
                  <Input
                    id="admin_email"
                    name="admin_email"
                    type="email"
                    defaultValue={settings.admin_email || 'admin@surecrm.pro'}
                    onChange={() => setHasChanges(true)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support_email">고객지원 이메일</Label>
                  <Input
                    id="support_email"
                    name="support_email"
                    type="email"
                    defaultValue={
                      settings.support_email || 'support@surecrm.pro'
                    }
                    onChange={() => setHasChanges(true)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>테마 설정</span>
              </CardTitle>
              <CardDescription>
                사이트의 테마와 외관을 설정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default_theme">기본 테마</Label>
                  <Select
                    name="default_theme"
                    defaultValue={settings.default_theme || 'light'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">라이트 모드</SelectItem>
                      <SelectItem value="dark">다크 모드</SelectItem>
                      <SelectItem value="system">시스템 설정 따름</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand_color">브랜드 컬러</Label>
                  <Input
                    id="brand_color"
                    name="brand_color"
                    type="color"
                    defaultValue={settings.brand_color || '#3b82f6'}
                    onChange={() => setHasChanges(true)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 다국어 설정 */}
        <TabsContent value="localization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>언어 설정</span>
              </CardTitle>
              <CardDescription>
                지원 언어 및 기본 언어를 설정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default_language">기본 언어</Label>
                  <Select
                    name="default_language"
                    defaultValue={settings.default_language || 'ko'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ko">한국어</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">시간대</Label>
                  <Select
                    name="timezone"
                    defaultValue={settings.timezone || 'Asia/Seoul'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Seoul">서울 (KST)</SelectItem>
                      <SelectItem value="Asia/Tokyo">도쿄 (JST)</SelectItem>
                      <SelectItem value="America/New_York">
                        뉴욕 (EST)
                      </SelectItem>
                      <SelectItem value="Europe/London">런던 (GMT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-4">
                <Label>지원 언어</Label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { code: 'ko', name: '한국어', enabled: true },
                    { code: 'en', name: 'English', enabled: true },
                    { code: 'ja', name: '日本語', enabled: false },
                    { code: 'zh', name: '中文', enabled: false },
                  ].map(lang => (
                    <div
                      key={lang.code}
                      className="flex items-center space-x-2"
                    >
                      <Switch
                        id={`lang_${lang.code}`}
                        defaultChecked={lang.enabled}
                        onCheckedChange={() => setHasChanges(true)}
                      />
                      <Label htmlFor={`lang_${lang.code}`}>{lang.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 보안 설정 */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>보안 정책</span>
              </CardTitle>
              <CardDescription>시스템 보안 정책을 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session_timeout">세션 타임아웃 (분)</Label>
                  <Input
                    id="session_timeout"
                    name="session_timeout"
                    type="number"
                    defaultValue={settings.session_timeout || '60'}
                    onChange={() => setHasChanges(true)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_login_attempts">
                    최대 로그인 시도 횟수
                  </Label>
                  <Input
                    id="max_login_attempts"
                    name="max_login_attempts"
                    type="number"
                    defaultValue={settings.max_login_attempts || '5'}
                    onChange={() => setHasChanges(true)}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="require_2fa"
                    defaultChecked={settings.require_2fa === 'true'}
                    onCheckedChange={() => setHasChanges(true)}
                  />
                  <Label htmlFor="require_2fa">2단계 인증 필수</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="force_https"
                    defaultChecked={settings.force_https === 'true'}
                    onCheckedChange={() => setHasChanges(true)}
                  />
                  <Label htmlFor="force_https">HTTPS 강제 사용</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable_audit_log"
                    defaultChecked={settings.enable_audit_log === 'true'}
                    onCheckedChange={() => setHasChanges(true)}
                  />
                  <Label htmlFor="enable_audit_log">감사 로그 활성화</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 이메일 설정 */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>SMTP 설정</span>
              </CardTitle>
              <CardDescription>
                이메일 발송을 위한 SMTP 서버를 설정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp_host">SMTP 호스트</Label>
                  <Input
                    id="smtp_host"
                    name="smtp_host"
                    defaultValue={settings.smtp_host || ''}
                    placeholder="smtp.gmail.com"
                    onChange={() => setHasChanges(true)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_port">SMTP 포트</Label>
                  <Input
                    id="smtp_port"
                    name="smtp_port"
                    type="number"
                    defaultValue={settings.smtp_port || '587'}
                    onChange={() => setHasChanges(true)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp_username">SMTP 사용자명</Label>
                  <Input
                    id="smtp_username"
                    name="smtp_username"
                    defaultValue={settings.smtp_username || ''}
                    onChange={() => setHasChanges(true)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_password">SMTP 비밀번호</Label>
                  <Input
                    id="smtp_password"
                    name="smtp_password"
                    type="password"
                    defaultValue="••••••••"
                    onChange={() => setHasChanges(true)}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="smtp_use_tls"
                  defaultChecked={settings.smtp_use_tls === 'true'}
                  onCheckedChange={() => setHasChanges(true)}
                />
                <Label htmlFor="smtp_use_tls">TLS 사용</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 시스템 관리 */}
        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>데이터베이스 관리</span>
              </CardTitle>
              <CardDescription>
                데이터베이스 최적화 및 백업 설정입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="backup_retention">백업 보관 기간 (일)</Label>
                  <Input
                    id="backup_retention"
                    name="backup_retention"
                    type="number"
                    defaultValue={settings.backup_retention || '30'}
                    onChange={() => setHasChanges(true)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="log_retention">로그 보관 기간 (일)</Label>
                  <Input
                    id="log_retention"
                    name="log_retention"
                    type="number"
                    defaultValue={settings.log_retention || '90'}
                    onChange={() => setHasChanges(true)}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto_backup"
                    defaultChecked={settings.auto_backup === 'true'}
                    onCheckedChange={() => setHasChanges(true)}
                  />
                  <Label htmlFor="auto_backup">자동 백업 활성화</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="maintenance_mode"
                    defaultChecked={settings.maintenance_mode === 'true'}
                    onCheckedChange={() => setHasChanges(true)}
                  />
                  <Label htmlFor="maintenance_mode">점검 모드</Label>
                </div>
              </div>
              <Separator />
              <div className="flex space-x-4">
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  캐시 초기화
                </Button>
                <Button variant="outline">
                  <Database className="h-4 w-4 mr-2" />
                  DB 최적화
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 알림 설정 */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>알림 설정</span>
              </CardTitle>
              <CardDescription>
                시스템 알림 및 사용자 알림을 설정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">관리자 알림</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="notify_new_user"
                        defaultChecked={settings.notify_new_user === 'true'}
                        onCheckedChange={() => setHasChanges(true)}
                      />
                      <Label htmlFor="notify_new_user">신규 사용자 가입</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="notify_payment"
                        defaultChecked={settings.notify_payment === 'true'}
                        onCheckedChange={() => setHasChanges(true)}
                      />
                      <Label htmlFor="notify_payment">결제 완료</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="notify_support"
                        defaultChecked={settings.notify_support === 'true'}
                        onCheckedChange={() => setHasChanges(true)}
                      />
                      <Label htmlFor="notify_support">고객지원 요청</Label>
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-2">사용자 알림</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="notify_welcome"
                        defaultChecked={settings.notify_welcome === 'true'}
                        onCheckedChange={() => setHasChanges(true)}
                      />
                      <Label htmlFor="notify_welcome">환영 이메일</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="notify_trial_end"
                        defaultChecked={settings.notify_trial_end === 'true'}
                        onCheckedChange={() => setHasChanges(true)}
                      />
                      <Label htmlFor="notify_trial_end">체험 종료 알림</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="notify_billing"
                        defaultChecked={settings.notify_billing === 'true'}
                        onCheckedChange={() => setHasChanges(true)}
                      />
                      <Label htmlFor="notify_billing">결제 관련 알림</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
