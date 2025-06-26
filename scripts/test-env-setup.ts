#!/usr/bin/env tsx

/**
 * 🔍 SureCRM 환경변수 검증 스크립트
 *
 * 이 스크립트는 다음 핵심 서비스들의 환경변수 설정을 검증합니다:
 * 1. Supabase 데이터베이스/스토리지 연결
 * 2. Google Calendar API 연동
 * 3. 기타 핵심 서비스들
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

// 색상 출력을 위한 유틸리티
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

const log = {
  success: (msg: string) =>
    console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg: string) =>
    console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  section: (msg: string) =>
    console.log(`\n${colors.bold}${colors.magenta}🔍 ${msg}${colors.reset}`),
  result: (msg: string) =>
    console.log(`${colors.cyan}📊 ${msg}${colors.reset}`),
};

interface TestResult {
  category: string;
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

const results: TestResult[] = [];

function addResult(
  category: string,
  test: string,
  status: TestResult['status'],
  message: string,
  details?: any
) {
  results.push({ category, test, status, message, details });
}

// 필수 환경변수 체크
function checkRequiredEnvVars() {
  log.section('필수 환경변수 검증');

  const required = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_URL',
    'SESSION_SECRET',
    'NODE_ENV',
  ];

  const missing: string[] = [];
  const present: string[] = [];

  required.forEach(key => {
    if (process.env[key]) {
      present.push(key);
      log.success(`${key} 설정됨`);
    } else {
      missing.push(key);
      log.error(`${key} 누락`);
    }
  });

  if (missing.length === 0) {
    addResult(
      'Core',
      '필수 환경변수',
      'success',
      '모든 필수 환경변수가 설정되었습니다'
    );
  } else {
    addResult(
      'Core',
      '필수 환경변수',
      'error',
      `누락된 환경변수: ${missing.join(', ')}`
    );
  }
}

// Supabase 연결 테스트
async function testSupabaseConnection() {
  log.section('Supabase 데이터베이스 연결 테스트');

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      addResult(
        'Supabase',
        '환경변수',
        'error',
        'SUPABASE_URL 또는 SUPABASE_ANON_KEY가 설정되지 않았습니다'
      );
      return;
    }

    log.info(`Supabase URL: ${supabaseUrl}`);

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. 기본 연결 테스트
    log.info('기본 연결 테스트 중...');
    const { data, error } = await supabase
      .from('app_user_profiles')
      .select('count')
      .limit(1);

    if (error) {
      log.error(`연결 실패: ${error.message}`);
      addResult(
        'Supabase',
        '데이터베이스 연결',
        'error',
        `연결 실패: ${error.message}`
      );
    } else {
      log.success('데이터베이스 연결 성공');
      addResult(
        'Supabase',
        '데이터베이스 연결',
        'success',
        '데이터베이스 연결이 정상적으로 작동합니다'
      );
    }

    // 2. 인증 테스트
    log.info('인증 시스템 테스트 중...');
    const { data: authData, error: authError } =
      await supabase.auth.getSession();

    if (authError) {
      log.warning(`인증 세션 확인 실패: ${authError.message}`);
      addResult(
        'Supabase',
        '인증 시스템',
        'warning',
        `인증 세션 확인 실패: ${authError.message}`
      );
    } else {
      log.success('인증 시스템 정상');
      addResult(
        'Supabase',
        '인증 시스템',
        'success',
        '인증 시스템이 정상적으로 작동합니다'
      );
    }

    // 3. 스토리지 테스트
    log.info('스토리지 접근 테스트 중...');
    const { data: buckets, error: storageError } =
      await supabase.storage.listBuckets();

    if (storageError) {
      log.warning(`스토리지 접근 실패: ${storageError.message}`);
      addResult(
        'Supabase',
        '스토리지',
        'warning',
        `스토리지 접근 실패: ${storageError.message}`
      );
    } else {
      log.success(`스토리지 접근 성공 (버킷 ${buckets?.length || 0}개)`);
      addResult(
        'Supabase',
        '스토리지',
        'success',
        `스토리지 접근 성공 (버킷 ${buckets?.length || 0}개)`
      );
    }
  } catch (error: any) {
    log.error(`Supabase 테스트 실패: ${error.message}`);
    addResult(
      'Supabase',
      '전체 테스트',
      'error',
      `테스트 실패: ${error.message}`
    );
  }
}

// Google Calendar API 테스트
async function testGoogleCalendarSetup() {
  log.section('Google Calendar API 설정 테스트');

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const webhookToken = process.env.GOOGLE_WEBHOOK_VERIFY_TOKEN;

    if (!clientId || !clientSecret) {
      log.error('Google 클라이언트 ID 또는 시크릿이 설정되지 않았습니다');
      addResult(
        'Google Calendar',
        '환경변수',
        'error',
        'GOOGLE_CLIENT_ID 또는 GOOGLE_CLIENT_SECRET가 누락되었습니다'
      );
      return;
    }

    log.success('Google 클라이언트 인증 정보 확인됨');
    log.info(`클라이언트 ID: ${clientId.substring(0, 20)}...`);

    // OAuth2 클라이언트 생성 테스트
    const redirectUri =
      process.env.NODE_ENV === 'production'
        ? 'https://surecrm.pro/api/google/calendar/callback'
        : 'http://localhost:5173/api/google/calendar/callback';

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    // 인증 URL 생성 테스트
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
      ],
      prompt: 'consent',
    });

    if (
      authUrl &&
      authUrl.startsWith('https://accounts.google.com/o/oauth2/auth')
    ) {
      log.success('OAuth2 인증 URL 생성 성공');
      addResult(
        'Google Calendar',
        'OAuth2 설정',
        'success',
        'OAuth2 인증 설정이 올바릅니다'
      );
    } else {
      log.error('OAuth2 인증 URL 생성 실패');
      addResult(
        'Google Calendar',
        'OAuth2 설정',
        'error',
        'OAuth2 인증 URL 생성이 실패했습니다'
      );
    }

    if (webhookToken) {
      log.success('웹훅 검증 토큰 설정됨');
      addResult(
        'Google Calendar',
        '웹훅 설정',
        'success',
        '웹훅 검증 토큰이 설정되었습니다'
      );
    } else {
      log.warning('웹훅 검증 토큰이 설정되지 않았습니다');
      addResult(
        'Google Calendar',
        '웹훅 설정',
        'warning',
        'GOOGLE_WEBHOOK_VERIFY_TOKEN이 설정되지 않았습니다'
      );
    }

    // 리다이렉트 URI 검증
    log.info(`리다이렉트 URI: ${redirectUri}`);
    log.warning(
      'Google Cloud Console에서 이 리다이렉트 URI가 등록되어 있는지 확인하세요!'
    );
    addResult(
      'Google Calendar',
      '리다이렉트 URI',
      'warning',
      `리다이렉트 URI 확인 필요: ${redirectUri}`
    );
  } catch (error: any) {
    log.error(`Google Calendar 테스트 실패: ${error.message}`);
    addResult(
      'Google Calendar',
      '전체 테스트',
      'error',
      `테스트 실패: ${error.message}`
    );
  }
}

// 기타 핵심 서비스 테스트
function testOtherServices() {
  log.section('기타 핵심 서비스 환경변수 테스트');

  // Toss Payments
  const tossClientKey = process.env.TOSS_CLIENT_KEY;
  const tossSecretKey = process.env.TOSS_SECRET_KEY;
  if (tossClientKey && tossSecretKey) {
    log.success('Toss Payments 키 설정됨');
    addResult(
      'Payments',
      'Toss Payments',
      'success',
      'Toss Payments 설정이 완료되었습니다'
    );
  } else {
    log.warning('Toss Payments 키가 설정되지 않았습니다');
    addResult(
      'Payments',
      'Toss Payments',
      'warning',
      'Toss Payments 키가 누락되었습니다'
    );
  }

  // Resend Email
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    log.success('Resend 이메일 API 키 설정됨');
    addResult(
      'Email',
      'Resend',
      'success',
      'Resend 이메일 API 설정이 완료되었습니다'
    );
  } else {
    log.warning('Resend API 키가 설정되지 않았습니다');
    addResult('Email', 'Resend', 'warning', 'RESEND_API_KEY가 누락되었습니다');
  }

  // 암호화 키들
  const encryptionKey = process.env.ENCRYPTION_KEY;
  const hashSalt = process.env.HASH_SALT;
  if (encryptionKey && hashSalt) {
    log.success('암호화 키들 설정됨');
    addResult(
      'Security',
      '암호화',
      'success',
      '암호화 관련 설정이 완료되었습니다'
    );
  } else {
    log.error('암호화 키가 설정되지 않았습니다');
    addResult(
      'Security',
      '암호화',
      'error',
      'ENCRYPTION_KEY 또는 HASH_SALT가 누락되었습니다'
    );
  }
}

// 결과 요약 출력
function printSummary() {
  log.section('검증 결과 요약');

  const categories = [...new Set(results.map(r => r.category))];

  categories.forEach(category => {
    const categoryResults = results.filter(r => r.category === category);
    const successCount = categoryResults.filter(
      r => r.status === 'success'
    ).length;
    const errorCount = categoryResults.filter(r => r.status === 'error').length;
    const warningCount = categoryResults.filter(
      r => r.status === 'warning'
    ).length;

    console.log(`\n${colors.bold}📂 ${category}${colors.reset}`);

    categoryResults.forEach(result => {
      const icon =
        result.status === 'success'
          ? '✅'
          : result.status === 'error'
            ? '❌'
            : '⚠️';
      const color =
        result.status === 'success'
          ? colors.green
          : result.status === 'error'
            ? colors.red
            : colors.yellow;
      console.log(
        `   ${icon} ${result.test}: ${color}${result.message}${colors.reset}`
      );
    });

    log.result(
      `${category}: 성공 ${successCount}, 에러 ${errorCount}, 경고 ${warningCount}`
    );
  });

  // 전체 통계
  const totalSuccess = results.filter(r => r.status === 'success').length;
  const totalErrors = results.filter(r => r.status === 'error').length;
  const totalWarnings = results.filter(r => r.status === 'warning').length;

  console.log(`\n${colors.bold}📊 전체 결과${colors.reset}`);
  log.result(
    `총 ${results.length}개 테스트 중 성공 ${totalSuccess}, 에러 ${totalErrors}, 경고 ${totalWarnings}`
  );

  if (totalErrors === 0) {
    log.success(
      '🎉 모든 핵심 테스트가 통과했습니다! 개발 서버를 실행할 수 있습니다.'
    );
  } else {
    log.error(
      `💥 ${totalErrors}개의 에러가 발견되었습니다. 환경변수를 다시 확인해주세요.`
    );
  }
}

// 추가 설정 가이드 출력
function printSetupGuide() {
  log.section('추가 설정 가이드');

  console.log(`
${colors.cyan}🔗 Google Calendar 연동 완료 방법:${colors.reset}
1. Google Cloud Console (https://console.cloud.google.com) 접속
2. 프로젝트 선택/생성
3. APIs & Services → Credentials에서 OAuth 2.0 클라이언트 ID 생성
4. 승인된 리디렉션 URI에 다음 추가:
   - 개발: http://localhost:5173/api/google/calendar/callback
   - 프로덕션: https://surecrm.pro/api/google/calendar/callback
5. Calendar API 활성화 (APIs & Services → Library)

${colors.cyan}💳 Toss Payments 설정 방법:${colors.reset}
1. Toss Payments 개발자센터 (https://developers.tosspayments.com) 접속
2. 상점 생성 및 API 키 발급
3. 테스트 키를 .env에 설정

${colors.cyan}📧 Resend 이메일 설정 방법:${colors.reset}
1. Resend (https://resend.com) 회원가입
2. API Keys에서 새 키 생성
3. .env에 RESEND_API_KEY 설정

${colors.cyan}🚀 개발 서버 실행:${colors.reset}
npm run dev
`);
}

// 메인 실행 함수
async function main() {
  console.log(`${colors.bold}${colors.magenta}
╔══════════════════════════════════════════════════╗
║           🔍 SureCRM 환경변수 검증기              ║
╚══════════════════════════════════════════════════╝
${colors.reset}`);

  try {
    checkRequiredEnvVars();
    await testSupabaseConnection();
    await testGoogleCalendarSetup();
    testOtherServices();

    printSummary();
    printSetupGuide();

    // 에러가 있으면 프로세스 종료 코드 1
    const hasErrors = results.some(r => r.status === 'error');
    process.exit(hasErrors ? 1 : 0);
  } catch (error) {
    log.error(`검증 스크립트 실행 중 오류 발생: ${error}`);
    process.exit(1);
  }
}

main();
