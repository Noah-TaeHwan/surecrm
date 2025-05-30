import { Link, useNavigate, type MetaFunction } from 'react-router';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import { getTermsOfService, getPrivacyPolicy } from '~/lib/public-data';
import type { Route } from './+types/terms-page';

// Loader 함수 - 약관 정보 가져오기
export async function loader({ request }: Route.LoaderArgs) {
  try {
    const [termsData, privacyData] = await Promise.all([
      getTermsOfService(),
      getPrivacyPolicy(),
    ]);

    return {
      terms: termsData,
      privacy: privacyData,
      lastUpdated: new Date(termsData.lastUpdated).toLocaleDateString('ko-KR'),
      version: termsData.version,
    };
  } catch (error) {
    console.error('약관 데이터 로드 실패:', error);

    // 에러 시 기본값 반환
    const now = new Date();
    return {
      terms: {
        id: 'default-terms',
        title: '서비스 이용약관',
        content: '',
        version: '1.0',
        effectiveDate: now,
        lastUpdated: now,
      },
      privacy: {
        id: 'default-privacy',
        title: '개인정보처리방침',
        content: '',
        version: '1.0',
        effectiveDate: now,
        lastUpdated: now,
      },
      lastUpdated: now.toLocaleDateString('ko-KR'),
      version: '1.0',
    };
  }
}

export const meta: MetaFunction = () => {
  return [
    {
      title: '서비스 이용약관 - SureCRM',
      description: 'SureCRM 서비스 이용약관 및 개인정보처리방침',
    },
  ];
};

export default function TermsPage({ loaderData }: Route.ComponentProps) {
  const { terms, privacy, lastUpdated, version } = loaderData;
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="container px-4 py-12 mx-auto max-w-5xl">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">서비스 이용약관</h1>
        <p className="text-gray-600 text-center mb-2">
          SureCRM 서비스 이용약관 및 개인정보처리방침을 확인하세요.
        </p>
        <div className="text-sm text-muted-foreground">
          버전 {version} | 최종 업데이트: {lastUpdated}
        </div>
      </div>

      <Card>
        <Tabs defaultValue="terms">
          <CardHeader className="pb-2">
            <TabsList className="w-full mb-2">
              <TabsTrigger value="terms" className="w-1/2">
                이용약관
              </TabsTrigger>
              <TabsTrigger value="privacy" className="w-1/2">
                개인정보처리방침
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent>
            <TabsContent value="terms" className="mt-0">
              <CardTitle className="mb-4">{terms.title}</CardTitle>
              <div className="prose max-w-none">
                <div
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: terms.content.replace(/\n/g, '<br />'),
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="mt-0">
              <CardTitle className="mb-4">{privacy.title}</CardTitle>
              <div className="prose max-w-none">
                <div
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: privacy.content.replace(/\n/g, '<br />'),
                  }}
                />
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      <div className="flex justify-center mt-8">
        <Button variant="outline" onClick={handleGoBack} className="px-6">
          이전 페이지로 돌아가기
        </Button>
      </div>
    </div>
  );
}
