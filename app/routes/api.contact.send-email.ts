import { data } from 'react-router';
import type { Route } from './+types/api.contact.send-email';
import { sendEmail } from '~/lib/email/nodemailer.server';

// 한국 시간대로 포맷팅
const formatKoreanTime = (date: Date): string => {
  return date.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// 문의 유형 한국어 매핑
const inquiryTypeMap: Record<string, string> = {
  demo: '데모 요청',
  pricing: '요금 문의',
  support: '기술 지원',
  partnership: '파트너십',
  other: '기타',
};

export async function action({ request }: Route.ActionArgs) {
  try {
    if (request.method !== 'POST') {
      return data({ error: '잘못된 요청 방법입니다.' }, { status: 405 });
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const company = formData.get('company') as string;
    const inquiryType = formData.get('inquiryType') as string;
    const message = formData.get('message') as string;

    // 필수 필드 검증
    if (!name || !email || !message) {
      return data(
        { error: '이름, 이메일, 메시지는 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return data(
        { error: '올바른 이메일 형식을 입력해주세요.' },
        { status: 400 }
      );
    }

    const currentTime = formatKoreanTime(new Date());
    const inquiryTypeKorean = inquiryTypeMap[inquiryType] || '기타';

    // 이메일 HTML 템플릿
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>SureCRM 문의</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 30px; }
            .field { margin-bottom: 20px; }
            .field-label { font-weight: 600; color: #374151; margin-bottom: 5px; display: block; }
            .field-value { background: #f9fafb; padding: 12px; border-radius: 6px; border-left: 4px solid #667eea; }
            .message-field { background: #f9fafb; padding: 16px; border-radius: 6px; border-left: 4px solid #667eea; white-space: pre-wrap; line-height: 1.6; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; border-top: 1px solid #e5e7eb; }
            .reply-button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 SureCRM 새로운 문의</h1>
            </div>
            <div class="content">
              <div class="field">
                <span class="field-label">👤 이름</span>
                <div class="field-value">${name}</div>
              </div>
              
              <div class="field">
                <span class="field-label">📧 이메일</span>
                <div class="field-value">${email}</div>
              </div>
              
              ${
                company
                  ? `
              <div class="field">
                <span class="field-label">🏢 회사명</span>
                <div class="field-value">${company}</div>
              </div>
              `
                  : ''
              }
              
              <div class="field">
                <span class="field-label">📋 문의 유형</span>
                <div class="field-value">${inquiryTypeKorean}</div>
              </div>
              
              <div class="field">
                <span class="field-label">💬 문의 내용</span>
                <div class="message-field">${message}</div>
              </div>
              
              <div class="field">
                <span class="field-label">🕒 접수 시간</span>
                <div class="field-value">${currentTime} (한국시간)</div>
              </div>
              
              <div style="text-align: center;">
                <a href="mailto:${email}?subject=Re: SureCRM 문의 답변" class="reply-button">
                  📩 답변하기
                </a>
              </div>
            </div>
            <div class="footer">
              <p>이 메일은 SureCRM 웹사이트 문의 양식을 통해 자동으로 전송되었습니다.</p>
              <p>📧 답변하시려면 위의 "답변하기" 버튼을 클릭해주세요.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // 텍스트 버전
    const textContent = `
SureCRM 새로운 문의

이름: ${name}
이메일: ${email}
${company ? `회사명: ${company}` : ''}
문의 유형: ${inquiryTypeKorean}
접수 시간: ${currentTime} (한국시간)

문의 내용:
${message}

답변하시려면 ${email}로 회신해주세요.
    `;

    try {
      // 메일 전송
      await sendEmail({
        to: 'noah@surecrm.pro',
        subject: `[SureCRM 문의] ${inquiryTypeKorean} - ${name}`,
        text: textContent,
        html: htmlContent,
      });

      return data({
        success: true,
        message:
          '문의가 성공적으로 전송되었습니다. 빠른 시일 내에 답변드리겠습니다.',
      });
    } catch (emailError) {
      console.error('이메일 전송 실패:', emailError);

      // 구체적인 에러 메시지 반환
      const errorMessage = (emailError as Error).message;

      if (errorMessage.includes('Gmail 인증 실패')) {
        return data(
          {
            error: '메일 서버 설정에 문제가 있습니다. 관리자에게 문의해주세요.',
          },
          { status: 500 }
        );
      }

      return data(
        {
          error: '메일 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API 오류:', error);
    return data(
      { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}
