import { type ActionFunctionArgs } from 'react-router';
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

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Suspicious patterns and spam detection
const SUSPICIOUS_PATTERNS = [
  /https?:\/\/[^\s]+/gi, // URLs
  /\b(buy|sale|cheap|discount|money|profit|click here|urgent|limited time)\b/gi,
  /\b[A-Z]{5,}\b/g, // Excessive capitals
  /(.)\1{4,}/g, // Repeated characters
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Credit card patterns
];

const BLACKLISTED_DOMAINS = [
  'tempmail.org',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'yopmail.com',
];

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  turnstileToken: string;
}

// Rate limiting function
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const key = ip;
  const limit = rateLimitStore.get(key);

  if (!limit || now > limit.resetTime) {
    // Reset or create new entry (5 requests per 15 minutes)
    rateLimitStore.set(key, { count: 1, resetTime: now + 15 * 60 * 1000 });
    return true;
  }

  if (limit.count >= 5) {
    return false; // Rate limit exceeded
  }

  limit.count++;
  return true;
}

// Content validation and spam detection
function validateContent(data: ContactFormData): {
  isValid: boolean;
  reason?: string;
} {
  const { name, email, subject, message } = data;

  // Check for suspicious patterns
  const allContent = `${name} ${email} ${subject} ${message}`;
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(allContent)) {
      return { isValid: false, reason: 'Suspicious content detected' };
    }
  }

  // Check email domain
  const emailDomain = email.split('@')[1]?.toLowerCase();
  if (emailDomain && BLACKLISTED_DOMAINS.includes(emailDomain)) {
    return { isValid: false, reason: 'Blacklisted email domain' };
  }

  // Check message length (too short or too long)
  if (message.length < 10) {
    return { isValid: false, reason: 'Message too short' };
  }

  if (message.length > 5000) {
    return { isValid: false, reason: 'Message too long' };
  }

  // Check for excessive repetition
  const words = message.toLowerCase().split(/\s+/);
  const wordCount = new Map<string, number>();
  for (const word of words) {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  }

  // If any word appears more than 30% of total words, it's suspicious
  const totalWords = words.length;
  for (const [word, count] of wordCount) {
    if (word.length > 2 && count / totalWords > 0.3) {
      return { isValid: false, reason: 'Excessive word repetition' };
    }
  }

  return { isValid: true };
}

// Enhanced logging function
function logSecurityEvent(ip: string, event: string, details: any) {
  const timestamp = new Date().toISOString();
  console.log(`[SECURITY] ${timestamp} - IP: ${ip} - Event: ${event}`, details);

  // In production, send to security monitoring system
  // Example: send to Cloudflare Analytics, Sentry, or custom logging service
}

// Verify Turnstile token
async function verifyTurnstileToken(
  token: string,
  ip: string
): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error('TURNSTILE_SECRET_KEY not found in environment variables');
    return false;
  }

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: secretKey,
          response: token,
          remoteip: ip,
        }),
      }
    );

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const clientIP =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For') ||
    request.headers.get('X-Real-IP') ||
    'unknown';

  try {
    // Rate limiting check
    if (!checkRateLimit(clientIP)) {
      logSecurityEvent(clientIP, 'RATE_LIMIT_EXCEEDED', {
        userAgent: request.headers.get('User-Agent'),
      });

      return json(
        {
          success: false,
          error: '요청이 너무 많습니다. 15분 후에 다시 시도해 주세요.',
        },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const contactData: ContactFormData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
      turnstileToken: formData.get('turnstileToken') as string,
    };

    // Validate required fields
    if (
      !contactData.name ||
      !contactData.email ||
      !contactData.subject ||
      !contactData.message
    ) {
      return json(
        { success: false, error: '모든 필드를 입력해 주세요.' },
        { status: 400 }
      );
    }

    // Verify Turnstile token first
    if (!contactData.turnstileToken) {
      logSecurityEvent(clientIP, 'MISSING_TURNSTILE_TOKEN', contactData);
      return json(
        { success: false, error: '보안 인증이 필요합니다.' },
        { status: 400 }
      );
    }

    const isValidToken = await verifyTurnstileToken(
      contactData.turnstileToken,
      clientIP
    );
    if (!isValidToken) {
      logSecurityEvent(clientIP, 'INVALID_TURNSTILE_TOKEN', {
        ...contactData,
        turnstileToken: '[REDACTED]',
      });

      return json(
        {
          success: false,
          error:
            '보안 인증에 실패했습니다. 페이지를 새로고침하고 다시 시도해 주세요.',
        },
        { status: 400 }
      );
    }

    // Content validation and spam detection
    const contentValidation = validateContent(contactData);
    if (!contentValidation.isValid) {
      logSecurityEvent(clientIP, 'CONTENT_VALIDATION_FAILED', {
        reason: contentValidation.reason,
        name: contactData.name,
        email: contactData.email,
        subject: contactData.subject,
        messageLength: contactData.message.length,
      });

      return json(
        {
          success: false,
          error: '메시지 내용이 정책에 위반됩니다. 다시 확인해 주세요.',
        },
        { status: 400 }
      );
    }

    // Additional security checks
    const userAgent = request.headers.get('User-Agent') || '';

    // Check for suspicious user agents
    const suspiciousUAs = ['bot', 'crawler', 'spider', 'scraper'];
    const isSuspiciousUA = suspiciousUAs.some(ua =>
      userAgent.toLowerCase().includes(ua.toLowerCase())
    );

    if (isSuspiciousUA && !userAgent.includes('Googlebot')) {
      logSecurityEvent(clientIP, 'SUSPICIOUS_USER_AGENT', {
        userAgent,
        ...contactData,
      });
    }

    // 환경변수 검증
    const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
    const emailPass = process.env.EMAIL_PASSWORD || process.env.GMAIL_PASS;

    if (!emailUser || !emailPass) {
      console.error('이메일 환경변수 누락:', {
        EMAIL_USER: !!process.env.EMAIL_USER,
        GMAIL_USER: !!process.env.GMAIL_USER,
        EMAIL_PASSWORD: !!process.env.EMAIL_PASSWORD,
        GMAIL_PASS: !!process.env.GMAIL_PASS,
      });

      logSecurityEvent(clientIP, 'EMAIL_CONFIG_ERROR', {
        missingEmailUser: !emailUser,
        missingEmailPass: !emailPass,
      });

      return json(
        {
          success: false,
          error: '메일 서비스 설정 오류입니다. 관리자에게 문의해주세요.',
        },
        { status: 500 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // Enhanced email template with security info
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
          <h2 style="color: white; margin: 0;">🛡️ SureCRM 보안 검증 완료</h2>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; padding: 10px; margin-bottom: 20px;">
            <strong style="color: #155724;">✅ 보안 인증 완료</strong>
            <p style="margin: 5px 0 0 0; color: #155724; font-size: 14px;">
              이 메시지는 Cloudflare Turnstile 보안 검증을 통과했습니다.
            </p>
          </div>
          
          <h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">📬 문의 내용</h3>
          
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
            <p><strong>👤 이름:</strong> ${contactData.name}</p>
            <p><strong>📧 이메일:</strong> ${contactData.email}</p>
            <p><strong>📋 제목:</strong> ${contactData.subject}</p>
            <p><strong>💬 메시지:</strong></p>
            <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #667eea; margin-top: 10px;">
              ${contactData.message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="background: #e9ecef; padding: 10px; border-radius: 5px; margin-top: 20px; font-size: 12px; color: #6c757d;">
            <strong>🔒 보안 정보</strong><br>
            IP 주소: ${clientIP}<br>
            전송 시간: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}<br>
            User-Agent: ${userAgent.substring(0, 100)}${userAgent.length > 100 ? '...' : ''}
          </div>
        </div>
      </div>
    `;

    // Send email
    await transporter.sendMail({
      from: emailUser,
      to: emailUser,
      subject: `🛡️ [보안 검증 완료] SureCRM 문의: ${contactData.subject}`,
      html: htmlContent,
    });

    // Log successful submission
    logSecurityEvent(clientIP, 'CONTACT_FORM_SUCCESS', {
      name: contactData.name,
      email: contactData.email,
      subject: contactData.subject,
      messageLength: contactData.message.length,
      userAgent: userAgent.substring(0, 100),
    });

    return json({
      success: true,
      message: '문의가 성공적으로 전송되었습니다!',
    });
  } catch (error) {
    console.error('Contact form error:', error);

    // Log error with security context
    logSecurityEvent(clientIP, 'CONTACT_FORM_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userAgent: request.headers.get('User-Agent'),
    });

    return json(
      {
        success: false,
        error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      },
      { status: 500 }
    );
  }
}
