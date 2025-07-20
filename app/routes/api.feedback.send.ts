/* eslint-env node */
/// <reference lib="dom" />

import { type ActionFunctionArgs } from 'react-router';
import nodemailer from 'nodemailer';

// HTML 이스케이프 함수 - XSS 방지
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Response utility function
function json(object: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(object), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
}

// GET 요청 처리를 위한 loader 함수 추가
export async function loader() {
  return json(
    {
      success: false,
      error: 'GET 메서드는 지원되지 않습니다. POST 메서드를 사용해주세요.',
    },
    { status: 405 } // Method Not Allowed
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const clientIP =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For') ||
    request.headers.get('X-Real-IP') ||
    'unknown';

  try {
    const formData = await request.formData();

    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const message = formData.get('message') as string;
    const attachment = formData.get('attachment') as File | null;

    // Basic validation
    if (!title || !category || !message) {
      return json(
        { success: false, error: '모든 필수 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

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

    const categoryMap: Record<string, string> = {
      bug: '버그 리포트',
      feature: '기능 제안',
      general: '일반 피드백',
      other: '기타',
    };

    let htmlContent = `
      <h1>새로운 피드백 도착</h1>
      <p><strong>제목:</strong> ${escapeHtml(title)}</p>
      <p><strong>카테고리:</strong> ${escapeHtml(categoryMap[category] || category)}</p>
      <p><strong>내용:</strong></p>
      <pre>${escapeHtml(message)}</pre>
      <hr />
      <p><strong>보낸 IP:</strong> ${escapeHtml(clientIP)}</p>
    `;

    const attachments = [];
    if (attachment && attachment.size > 0) {
      // Check file size (5MB limit)
      if (attachment.size > 5 * 1024 * 1024) {
        return json(
          { success: false, error: '파일 크기는 5MB를 초과할 수 없습니다.' },
          { status: 400 }
        );
      }

      // Check file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/gif'];
      if (!allowedTypes.includes(attachment.type)) {
        return json(
          {
            success: false,
            error: 'PNG, JPEG, GIF 이미지만 업로드 가능합니다.',
          },
          { status: 400 }
        );
      }

      const arrayBuffer = await attachment.arrayBuffer();
      attachments.push({
        filename: attachment.name,
        content: Buffer.from(arrayBuffer),
        contentType: attachment.type,
      });
      htmlContent += `<p><strong>첨부파일:</strong> ${escapeHtml(attachment.name)}</p>`;
    }

    const recipientEmail =
      process.env.FEEDBACK_RECIPIENT_EMAIL || 'noah@surecrm.pro';

    await transporter.sendMail({
      from: `"SureCRM 피드백" <${emailUser}>`,
      to: recipientEmail,
      subject: `[SureCRM 피드백] ${title.replace(/[\n\r]/g, ' ')}`,
      html: htmlContent,
      attachments,
    });

    return json({
      success: true,
      message: '피드백이 성공적으로 전송되었습니다. 감사합니다!',
    });
  } catch (error) {
    console.error('❌ 피드백 제출 오류:', error);
    return json(
      {
        success: false,
        error: '피드백 전송 중 서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
