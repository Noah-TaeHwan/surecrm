import type { ActionFunctionArgs } from 'react-router';
import nodemailer from 'nodemailer';

// Response utility function
function json(object: any, init?: ResponseInit): Response {
  return new Response(JSON.stringify(object), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  // 📬 [API /api/contact] action-이메일 전송 요청 수신
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const formData = await request.formData();
  // 📋 [API /api/contact] 1. 폼 데이터 파싱 완료

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const company = formData.get('company') as string;
  const inquiryType = formData.get('inquiryType') as string;
  const message = formData.get('message') as string;
  const turnstileToken = formData.get('turnstileToken') as string;

  const clientIP =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For') ||
    request.headers.get('X-Real-IP') ||
    'unknown';

  // 1. Turnstile 토큰 검증
  // 🛡️ [API /api/contact] 2. Turnstile 토큰 검증 시작...
  if (!turnstileToken) {
    // ❌ [API /api/contact] Turnstile 토큰이 없습니다.
    return json(
      {
        success: false,
        error: '보안 인증에 실패했습니다. 다시 시도해주세요.',
      },
      { status: 400 }
    );
  }

  try {
    const turnstileResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: turnstileToken,
          remoteip: clientIP,
        }),
      }
    );

    const turnstileData = await turnstileResponse.json();

    if (!turnstileData.success) {
      console.error(
        '❌ [API /api/contact] Turnstile 검증 실패:',
        turnstileData['error-codes']
      );
      return json(
        {
          success: false,
          error: '보안 인증에 실패했습니다. 봇 활동이 감지되었습니다.',
        },
        { status: 400 }
      );
    }
    console.log('✅ [API /api/contact] 2. Turnstile 토큰 검증 성공');

    // 2. 기본 필드 유효성 검사
    console.log('📝 [API /api/contact] 3. 기본 필드 유효성 검사 시작...');
    if (!name || !email || !message) {
      console.error('❌ [API /api/contact] 필수 필드 누락:', {
        name: !!name,
        email: !!email,
        message: !!message,
      });
      return json(
        {
          success: false,
          error: '이름, 이메일, 메시지는 필수 입력 항목입니다.',
        },
        { status: 400 }
      );
    }
    console.log('✅ [API /api/contact] 3. 기본 필드 유효성 검사 통과');

    // 3. 이메일 전송 로직
    console.log('📧 [API /api/contact] 4. 이메일 전송 로직 시작...');
    const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
    const emailPass = process.env.EMAIL_PASSWORD || process.env.GMAIL_PASS;

    if (!emailUser || !emailPass) {
      console.error('Email environment variables are not set.');
      return json(
        {
          success: false,
          error: '메일 서비스 설정 오류입니다. 관리자에게 문의해주세요.',
        },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const inquiryTypeMap: Record<string, string> = {
      demo: '데모 요청',
      pricing: '요금 문의',
      support: '기술 지원',
      partnership: '파트너십',
      other: '기타',
    };

    const htmlContent = `
      <h1>새로운 문의 도착 (surecrm.pro/contact)</h1>
      <p><strong>보낸 사람:</strong> ${name}</p>
      <p><strong>이메일:</strong> ${email}</p>
      <p><strong>회사명:</strong> ${company || 'N/A'}</p>
      <p><strong>문의 유형:</strong> ${
        inquiryTypeMap[inquiryType] || inquiryType || '미지정'
      }</p>
      <hr />
      <h2>메시지 내용:</h2>
      <pre>${message}</pre>
      <hr />
      <p><strong>보낸 IP:</strong> ${clientIP}</p>
      <p><strong>보낸 시간:</strong> ${new Date().toLocaleString('ko-KR', {
        timeZone: 'Asia/Seoul',
      })}</p>
    `;

    const recipientEmail =
      process.env.FEEDBACK_RECIPIENT_EMAIL || 'noah@surecrm.pro';

    console.log(
      `🚀 [API /api/contact] 5. Nodemailer로 이메일 발송 시도... (To: ${recipientEmail})`
    );
    await transporter.sendMail({
      from: `"[공식 문의] ${name}" <${emailUser}>`,
      to: recipientEmail,
      replyTo: email,
      subject: `[SureCRM 문의] ${
        inquiryTypeMap[inquiryType] || '기타 문의'
      } - ${name}`,
      html: htmlContent,
    });

    console.log('✅ [API /api/contact] 6. 이메일 발송 성공!');
    return json({
      success: true,
      message: '문의가 성공적으로 전송되었습니다.',
    });
  } catch (error) {
    console.error('❌ [API /api/contact] 최종 오류 발생:', error);
    return json(
      { success: false, error: '문의 전송 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
