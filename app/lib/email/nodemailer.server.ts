import nodemailer from 'nodemailer';

// 환경 변수 확인 및 검증
const EMAIL_USER = process.env.EMAIL_USER || process.env.GMAIL_USER;
const EMAIL_PASSWORD =
  process.env.EMAIL_PASSWORD ||
  process.env.EMAIL_APP_PASSWORD ||
  process.env.GMAIL_APP_PASSWORD;

if (!EMAIL_USER || !EMAIL_PASSWORD) {
  console.error('⚠️  메일 설정 오류: 환경 변수가 설정되지 않았습니다.');
  console.error('필요한 환경 변수:');
  console.error(
    '- EMAIL_USER 또는 GMAIL_USER: Gmail 계정 (예: your-email@gmail.com)'
  );
  console.error(
    '- EMAIL_PASSWORD 또는 EMAIL_APP_PASSWORD 또는 GMAIL_APP_PASSWORD: Gmail App Password'
  );
  console.error('');
  console.error('📋 Gmail App Password 설정 방법:');
  console.error('1. Gmail 계정에서 2단계 인증을 활성화하세요');
  console.error('2. Google 계정 관리 → 보안 → 앱 비밀번호로 이동하세요');
  console.error(
    '3. "메일" 앱을 선택하고 기기를 선택하여 앱 비밀번호를 생성하세요'
  );
  console.error(
    '4. 생성된 16자리 비밀번호를 환경 변수에 설정하세요 (공백 없이)'
  );
  console.error('');
  console.error('예시 .env 파일:');
  console.error('EMAIL_USER=noah@surecrm.pro');
  console.error('EMAIL_PASSWORD=your16digitapppassword');
}

export const createTransporter = () => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // Gmail에서 필요할 수 있음
      },
    });

    // 연결 테스트 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development') {
      transporter.verify((error: any, success: any) => {
        if (error) {
          console.error('❌ SMTP 연결 실패:', error.message);
          console.error('');
          console.error('해결 방법:');
          console.error(
            '1. Gmail App Password가 올바르게 설정되었는지 확인하세요'
          );
          console.error('2. 2단계 인증이 활성화되어 있는지 확인하세요');
          console.error('3. 환경 변수가 올바르게 설정되었는지 확인하세요');
        } else {
          console.log('✅ SMTP 서버 연결 성공');
        }
      });
    }

    return transporter;
  } catch (error) {
    console.error('❌ 메일 서비스 설정 실패:', error);
    throw error;
  }
};

export const sendEmail = async (options: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) => {
  if (!EMAIL_USER || !EMAIL_PASSWORD) {
    throw new Error(
      '메일 서비스가 설정되지 않았습니다. 환경 변수를 확인해주세요.'
    );
  }

  try {
    const transporter = createTransporter();
    const result = await transporter.sendMail({
      from: `"SureCRM" <${EMAIL_USER}>`,
      ...options,
    });

    console.log('✅ 메일 전송 성공:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ 메일 전송 실패:', error);

    // 구체적인 에러 메시지 제공
    if ((error as any).code === 'EAUTH') {
      throw new Error(
        'Gmail 인증 실패: App Password를 확인해주세요. 2단계 인증이 활성화되어 있고 올바른 App Password를 사용하고 있는지 확인하세요.'
      );
    } else if ((error as any).code === 'ENOTFOUND') {
      throw new Error('네트워크 연결 오류: 인터넷 연결을 확인해주세요.');
    } else if ((error as any).code === 'ETIMEDOUT') {
      throw new Error('연결 시간 초과: SMTP 서버에 연결할 수 없습니다.');
    }

    throw error;
  }
};
