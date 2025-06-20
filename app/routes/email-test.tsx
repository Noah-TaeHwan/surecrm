import { useState } from 'react';
import { Link, type MetaFunction } from 'react-router';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Alert, AlertDescription } from '~/common/components/ui/alert';
import { Mail, Send, Eye } from 'lucide-react';

export const meta: MetaFunction = () => {
  return [
    { title: '이메일 테스트 - SureCRM' },
    { name: 'description', content: '웰컴 이메일 테스트 및 미리보기' },
  ];
};

export default function EmailTestPage() {
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('테스트 사용자');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  const handleSendTest = async () => {
    if (!email) {
      setResult({ success: false, error: '이메일 주소를 입력해주세요.' });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('userName', userName);

      const response = await fetch('/api/email/send-test', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: '요청 중 오류가 발생했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openPreview = () => {
    const params = new URLSearchParams({
      userName,
      userEmail: email || 'test@example.com',
    });
    window.open(`/api/email/welcome-preview?${params}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto pt-20">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📧 웰컴 이메일 테스트
          </h1>
          <p className="text-gray-600">
            SureCRM 웰컴 이메일을 실제로 받아보고 테스트해보세요
          </p>
        </div>

        {/* 메인 카드 */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              테스트 이메일 발송
            </CardTitle>
            <CardDescription>
              아래 정보를 입력하고 웰컴 이메일을 실제로 받아보세요.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 입력 폼 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📧 이메일 주소 (실제로 이메일을 받을 주소)
                </label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  👤 사용자 이름 (이메일에 표시될 이름)
                </label>
                <Input
                  type="text"
                  placeholder="홍길동"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* 버튼들 */}
            <div className="flex gap-3">
              <Button
                onClick={handleSendTest}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? '발송 중...' : '🚀 테스트 이메일 발송'}
              </Button>

              <Button
                onClick={openPreview}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                미리보기
              </Button>
            </div>

            {/* 결과 메시지 */}
            {result && (
              <Alert variant={result.success ? 'default' : 'destructive'}>
                <AlertDescription>
                  {result.success ? result.message : result.error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* 설정 안내 */}
        <Card className="mt-6 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 text-lg">
              ⚙️ 실제 이메일 발송 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="text-orange-700 text-sm space-y-3">
            <p>
              <strong>현재 상태:</strong> 개발 모드 (실제 이메일 발송되지 않음)
            </p>

            <div className="space-y-2">
              <p>
                <strong>실제 이메일을 받아보려면:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>
                  <a
                    href="https://resend.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Resend 계정 생성
                  </a>{' '}
                  (무료 한도: 월 3,000통)
                </li>
                <li>
                  API 키 발급 후{' '}
                  <code className="bg-orange-200 px-1 rounded">.env</code>에
                  추가
                </li>
                <li>발송자 도메인 설정</li>
              </ol>
            </div>

            <div className="bg-orange-200 p-3 rounded text-xs">
              <p>
                <strong>환경변수 예시:</strong>
              </p>
              <code>
                RESEND_API_KEY=re_xxxxxxxxxxxxx
                <br />
                FROM_EMAIL=noreply@yourdomain.com
              </code>
            </div>
          </CardContent>
        </Card>

        {/* 돌아가기 */}
        <div className="text-center mt-8">
          <Link
            to="/dashboard"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← 대시보드로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
