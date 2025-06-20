/**
 * 🔍 분석 시스템 디버깅 페이지
 *
 * 개발 환경과 system_admin 사용자 제외 로직을 테스트하고
 * GTM/GA 상태를 확인할 수 있는 디버깅 도구입니다.
 */

import { useState, useEffect } from 'react';
import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import {
  shouldCollectAnalytics,
  isDevelopmentEnvironment,
  getCurrentUserRole,
  isSystemAdminUser,
  analyticsConfig,
  logAnalyticsStatus,
} from '~/lib/utils/analytics-config';
import { trackEvent, trackPageView } from '~/lib/utils/analytics';

interface AnalyticsStatus {
  shouldCollect: boolean;
  isDevelopment: boolean;
  userRole: string | null;
  isSystemAdmin: boolean;
  gaId: string | undefined;
  gtmId: string | undefined;
  gtmLoaded: boolean;
  gaLoaded: boolean;
  dataLayerExists: boolean;
  localStorageRole: string | null;
  currentHostname: string;
  currentPort: string;
  isVercelProduction: boolean;
  userAgent: string;
}

export function meta() {
  return [
    { title: '분석 시스템 디버깅 - SureCRM' },
    { name: 'description', content: 'GA/GTM 분석 시스템 상태 확인 및 테스트' },
  ];
}

export default function DebugAnalyticsPage() {
  const [status, setStatus] = useState<AnalyticsStatus | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    updateStatus();

    // 페이지 뷰 추적 테스트
    trackPageView({ path: '/debug-analytics', title: '분석 디버깅 페이지' });
  }, []);

  const updateStatus = () => {
    const newStatus: AnalyticsStatus = {
      shouldCollect: shouldCollectAnalytics(),
      isDevelopment: isDevelopmentEnvironment(),
      userRole: getCurrentUserRole(),
      isSystemAdmin: isSystemAdminUser(getCurrentUserRole()),
      gaId: analyticsConfig.GA_MEASUREMENT_ID,
      gtmId: analyticsConfig.GTM_CONTAINER_ID,
      gtmLoaded:
        typeof window !== 'undefined' && !!(window as any).google_tag_manager,
      gaLoaded:
        typeof window !== 'undefined' && typeof window.gtag === 'function',
      dataLayerExists:
        typeof window !== 'undefined' && Array.isArray(window.dataLayer),
      localStorageRole:
        typeof window !== 'undefined'
          ? localStorage.getItem('surecrm_user_role')
          : null,
      currentHostname:
        typeof window !== 'undefined' ? window.location.hostname : 'SSR',
      currentPort: typeof window !== 'undefined' ? window.location.port : 'SSR',
      isVercelProduction:
        typeof window !== 'undefined'
          ? window.location.hostname.includes('.vercel.app')
          : false,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'SSR',
    };
    setStatus(newStatus);
  };

  const runTests = () => {
    const results: string[] = [];

    // 1. 개발 환경 테스트
    const isDevTest = isDevelopmentEnvironment();
    results.push(`✅ 개발 환경 감지: ${isDevTest ? '개발환경' : '프로덕션'}`);

    // 2. 사용자 역할 테스트
    const userRole = getCurrentUserRole();
    results.push(`✅ 사용자 역할: ${userRole || '없음'}`);

    // 3. system_admin 테스트
    const isAdmin = isSystemAdminUser(userRole);
    results.push(
      `✅ 시스템 관리자: ${isAdmin ? '예 (GA 차단됨)' : '아니오 (GA 허용)'}`
    );

    // 4. 분석 수집 허용 테스트
    const shouldCollect = shouldCollectAnalytics();
    results.push(
      `${shouldCollect ? '✅' : '❌'} 분석 수집 허용: ${
        shouldCollect ? '예' : '아니오'
      }`
    );

    // 5. 이벤트 추적 테스트
    try {
      trackEvent({
        action: 'debug_test',
        category: 'debugging',
        label: 'analytics_test',
        value: 1,
        custom_parameters: {
          test_environment: isDevTest ? 'development' : 'production',
          user_role: userRole,
          timestamp: Date.now(),
        },
      });
      results.push('✅ 이벤트 추적 테스트: 성공 (콘솔에서 GA 요청 확인 가능)');
    } catch (error) {
      results.push(`❌ 이벤트 추적 테스트: 실패 - ${error}`);
    }

    // 6. GTM DataLayer 테스트
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'debug_test',
        test_data: {
          timestamp: Date.now(),
          page: 'debug-analytics',
          user_role: userRole,
          environment: isDevTest ? 'development' : 'production',
          analytics_allowed: shouldCollect,
        },
      });
      results.push('✅ GTM DataLayer 푸시: 성공');
    } else {
      results.push('❌ GTM DataLayer: 없음');
    }

    // 7. 실제 GA 네트워크 요청 테스트
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'debug_network_test', {
        event_category: 'debug_testing',
        value: 1,
        debug: true,
        send_to: analyticsConfig.GA_MEASUREMENT_ID,
      });
      results.push(
        '✅ GA 네트워크 테스트: 전송됨 (브라우저 개발자도구 > 네트워크에서 google-analytics.com 요청 확인)'
      );
    } else {
      results.push('❌ GA 네트워크 테스트: gtag 함수 없음');
    }

    setTestResults(results);
  };

  const getStatusColor = (value: boolean | string | null): string => {
    if (typeof value === 'boolean') {
      return value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    }
    return value ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
  };

  if (!status) {
    return <div className="p-8">로딩 중...</div>;
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">🔍 분석 시스템 디버깅</h1>
        <p className="text-muted-foreground">
          Google Analytics / Google Tag Manager 상태 확인 및 테스트
        </p>
      </div>

      {/* 환경 상태 */}
      <Card>
        <CardHeader>
          <CardTitle>🌍 환경 상태</CardTitle>
          <CardDescription>
            현재 환경과 분석 수집 허용 여부를 확인합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <Badge className={getStatusColor(status.isDevelopment)}>
              {status.isDevelopment ? '개발환경' : '프로덕션'}
            </Badge>
            <p className="text-sm text-muted-foreground mt-1">환경</p>
          </div>
          <div className="text-center">
            <Badge className={getStatusColor(status.shouldCollect)}>
              {status.shouldCollect ? '수집허용' : '수집차단'}
            </Badge>
            <p className="text-sm text-muted-foreground mt-1">분석 수집</p>
          </div>
          <div className="text-center">
            <Badge className={getStatusColor(status.userRole)}>
              {status.userRole || '없음'}
            </Badge>
            <p className="text-sm text-muted-foreground mt-1">사용자 역할</p>
          </div>
          <div className="text-center">
            <Badge className={getStatusColor(status.isSystemAdmin)}>
              {status.isSystemAdmin ? '관리자' : '일반사용자'}
            </Badge>
            <p className="text-sm text-muted-foreground mt-1">관리자 여부</p>
          </div>
        </CardContent>
      </Card>

      {/* 설정 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>⚙️ 설정 정보</CardTitle>
          <CardDescription>
            환경 변수 및 분석 도구 설정 상태입니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span>Google Analytics ID:</span>
            <Badge variant={status.gaId ? 'default' : 'outline'}>
              {status.gaId || '미설정'}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>Google Tag Manager ID:</span>
            <Badge variant={status.gtmId ? 'default' : 'outline'}>
              {status.gtmId || '미설정'}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>로컬 스토리지 역할:</span>
            <Badge variant={status.localStorageRole ? 'default' : 'outline'}>
              {status.localStorageRole || '없음'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 🚀 환경 진단 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>🌍 환경 진단</CardTitle>
          <CardDescription>
            현재 접속 환경 및 Vercel 배포 상태를 진단합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span>현재 도메인:</span>
            <Badge variant="outline" className="font-mono text-xs">
              {status.currentHostname}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>현재 포트:</span>
            <Badge variant="outline" className="font-mono text-xs">
              {status.currentPort || '443 (HTTPS)'}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>Vercel 프로덕션:</span>
            <Badge
              variant={status.isVercelProduction ? 'default' : 'secondary'}
            >
              {status.isVercelProduction ? '✅ 맞음' : '❌ 아님'}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>개발 환경 감지:</span>
            <Badge variant={status.isDevelopment ? 'destructive' : 'default'}>
              {status.isDevelopment ? '🔧 개발환경' : '🚀 프로덕션'}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>분석 수집 허용:</span>
            <Badge variant={status.shouldCollect ? 'default' : 'destructive'}>
              {status.shouldCollect ? '✅ 허용됨' : '🚫 차단됨'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 로딩 상태 */}
      <Card>
        <CardHeader>
          <CardTitle>📡 로딩 상태</CardTitle>
          <CardDescription>
            분석 도구들의 실제 로딩 및 작동 상태입니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <Badge className={getStatusColor(status.gaLoaded)}>
              {status.gaLoaded ? '로딩됨' : '미로딩'}
            </Badge>
            <p className="text-sm text-muted-foreground mt-1">
              Google Analytics
            </p>
          </div>
          <div className="text-center">
            <Badge className={getStatusColor(status.gtmLoaded)}>
              {status.gtmLoaded ? '로딩됨' : '미로딩'}
            </Badge>
            <p className="text-sm text-muted-foreground mt-1">
              Google Tag Manager
            </p>
          </div>
          <div className="text-center">
            <Badge className={getStatusColor(status.dataLayerExists)}>
              {status.dataLayerExists ? '존재함' : '없음'}
            </Badge>
            <p className="text-sm text-muted-foreground mt-1">Data Layer</p>
          </div>
        </CardContent>
      </Card>

      {/* 테스트 실행 */}
      <Card>
        <CardHeader>
          <CardTitle>🧪 기능 테스트</CardTitle>
          <CardDescription>
            분석 시스템의 각 기능을 실제로 테스트해봅니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={runTests}>전체 테스트 실행</Button>
            <Button variant="outline" onClick={updateStatus}>
              상태 새로고침
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // 로그 캐시 초기화
                localStorage.removeItem('surecrm_admin_login_logged');
                if (typeof window !== 'undefined') {
                  (window as any).__gtm_dev_logged = false;
                  (window as any).__gtm_success_logged = false;
                  (window as any).__ga_dev_logged = false;
                  (window as any).__ga_success_logged = false;
                  (window as any).__analytics_dev_logged = false;
                }
                console.log('🔄 로그 캐시 초기화 완료');
              }}
            >
              로그 캐시 초기화
            </Button>
          </div>

          {testResults.length > 0 && (
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">테스트 결과:</h4>
              <ul className="space-y-1 text-sm">
                {testResults.map((result, index) => (
                  <li key={index}>{result}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 실시간 로그 */}
      <Card>
        <CardHeader>
          <CardTitle>📝 실시간 로그</CardTitle>
          <CardDescription>
            브라우저 개발자 도구의 콘솔을 확인하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <div>// 브라우저 개발자 도구 → 콘솔에서 확인:</div>
            <div>// 1. localStorage.getItem('surecrm_user_role')</div>
            <div>// 2. window.dataLayer</div>
            <div>// 3. window.gtag</div>
            <div>// 4. window.google_tag_manager</div>
            <br />
            <div>// 🎯 현재 상태 요약:</div>
            <div>// 환경: {status.isDevelopment ? '개발환경' : '프로덕션'}</div>
            <div>// 역할: {status.userRole || '일반사용자/로그인안함'}</div>
            <div>
              // 관리자:{' '}
              {status.isSystemAdmin ? '예 (GA 차단됨)' : '아니오 (GA 허용)'}
            </div>
            <div>
              // 분석 수집: {status.shouldCollect ? '✅ 허용' : '❌ 차단'}
            </div>
            <div>
              // GA 로딩: {status.gaLoaded ? '✅ 로딩됨' : '❌ 로딩 안됨'}
            </div>
            {!status.shouldCollect && (
              <div>
                // 차단 이유:{' '}
                {status.isSystemAdmin
                  ? '시스템 관리자'
                  : !status.gaId && !status.gtmId
                    ? '분석 ID 미설정'
                    : '기타'}
              </div>
            )}
            <br />
            <div>// 🔍 실시간 네트워크 확인:</div>
            <div>{'// 개발자도구 > 네트워크 > "google-analytics" 검색'}</div>
            <div>// GA4 요청이 보이면 정상 작동 중</div>
            <br />
            <div>// 🚀 Vercel 배포 확인:</div>
            <div>// URL: https://surecrm-sigma.vercel.app</div>
            <div>// GA ID: {status.gaId || 'G-SZW1G856L5 (기본값)'}</div>
            <div>// GTM ID: {status.gtmId || 'GTM-WTCFV4DC (기본값)'}</div>
            <br />
            <div>// 📊 현재 상태:</div>
            <div>// 개발환경 GA: ❌ 완전 차단</div>
            <div>
              // 프로덕션 GA: {status.shouldCollect ? '✅ 활성화' : '❌ 차단'}
            </div>
            <div>// 로그 출력: 최소화 (은밀 모드)</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
