import { Link, type MetaFunction, redirect } from 'react-router';
import { AuthLayout } from '~/common/layouts/auth-layout';
import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { completeUserRegistration } from '~/lib/auth/registration';
import { validateInvitationCode } from '~/lib/auth/validation';
import { createServerClient } from '~/lib/core/supabase';

const supabase = createServerClient();

interface LoaderArgs {
  request: Request;
}

interface ComponentProps {
  loaderData: {
    success: boolean;
    error?: string;
    message?: string;
    userEmail?: string;
  };
}

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const token_hash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');

  // 이메일 인증 토큰이 있는 경우 처리
  if (token_hash && type === 'email') {
    try {
      // 클라이언트측에서 토큰 검증
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: 'email',
      });

      if (error) {
        console.error('이메일 인증 오류:', error);
        return {
          success: false,
          error: '인증 토큰이 유효하지 않거나 만료되었습니다.',
        };
      }

      if (data.user) {
        console.log('이메일 인증 성공:', data.user.id);

        // 사용자 메타데이터에서 초대 코드 가져오기
        const userData = data.user.user_metadata || {};
        const invitationCode = userData.invitation_code;

        if (invitationCode) {
          try {
            // 초대장 검증
            const invitationValidation =
              await validateInvitationCode(invitationCode);

            if (invitationValidation.valid) {
              // 사용자 프로필 완성
              const signUpData = {
                email: data.user.email!,
                fullName: userData.full_name || 'Unknown',
                phone: userData.phone,
                company: userData.company,
                invitationCode: invitationCode,
                password: '', // 이미 생성된 사용자이므로 비밀번호 불필요
              };

              const registrationResult = await completeUserRegistration(
                data.user.id,
                signUpData,
                invitationValidation.invitation!
              );

              if (registrationResult.success) {
                console.log('사용자 등록 완료:', data.user.id);
              } else {
                console.error(
                  '사용자 등록 완료 실패:',
                  registrationResult.error
                );
              }
            }
          } catch (profileError) {
            console.error('프로필 완성 중 오류:', profileError);
          }
        }

        return {
          success: true,
          message: '이메일 인증이 성공적으로 완료되었습니다!',
          userEmail: data.user.email,
        };
      }
    } catch (error) {
      console.error('이메일 인증 처리 오류:', error);
      return {
        success: false,
        error: '이메일 인증 처리 중 오류가 발생했습니다.',
      };
    }
  }

  // 인증 토큰이 없거나 잘못된 경우
  return {
    success: false,
    error: '인증 정보가 없습니다.',
  };
}

export const meta: MetaFunction = () => {
  return [
    { title: '이메일 인증 완료 | SureCRM' },
    { name: 'description', content: '이메일 인증이 완료되었습니다' },
  ];
};

export default function EmailConfirmedPage({ loaderData }: ComponentProps) {
  return (
    <AuthLayout>
      <Card className="w-full bg-transparent border-none shadow-none">
        <CardHeader className="space-y-1 pb-6 flex flex-col items-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              loaderData.success
                ? 'bg-green-100 dark:bg-green-900/20'
                : 'bg-red-100 dark:bg-red-900/20'
            }`}
          >
            {loaderData.success ? (
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center">
            {loaderData.success ? '인증 완료!' : '인증 실패'}
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 text-center">
            {loaderData.success
              ? '이메일 인증이 성공적으로 완료되었습니다'
              : '이메일 인증에 실패했습니다'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            {loaderData.success ? (
              <div className="space-y-4">
                {loaderData.userEmail && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-medium">{loaderData.userEmail}</span>{' '}
                    계정이 활성화되었습니다.
                  </p>
                )}
                <p className="text-slate-600 dark:text-slate-400">
                  {loaderData.message || '이제 SureCRM을 사용하실 수 있습니다.'}
                </p>
                <Button asChild className="w-full">
                  <Link to="/auth/login?message=email-verified">
                    로그인하기
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-red-600 dark:text-red-400">
                  {loaderData.error || '인증에 실패했습니다.'}
                </p>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/auth/signup">다시 가입하기</Link>
                  </Button>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    또는{' '}
                    <Link
                      to="/auth/login"
                      className="font-medium text-slate-900 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200"
                    >
                      로그인 페이지로 이동
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
