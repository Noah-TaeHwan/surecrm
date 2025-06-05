#!/usr/bin/env ts-node

// 🕒 매일 자동 실행되는 알림 CRON 스크립트
// crontab: 0 9 * * * /path/to/this/script

import { config } from 'dotenv';
import path from 'path';

// 환경변수 로드
config({ path: path.resolve(process.cwd(), '.env') });

import {
  runDailyNotificationTriggers,
  triggerBirthdayNotifications,
  triggerPipelineStagnationNotifications,
  triggerContractUrgentNotifications,
  triggerMeetingReminders,
} from '../app/features/notifications/lib/event-triggered-notifications';

async function main() {
  const startTime = Date.now();
  console.log('🕒 매일 알림 CRON 작업 시작:', new Date().toISOString());

  try {
    // 모든 사용자에 대해 알림 트리거 실행
    console.log('🚀 일일 알림 트리거 실행...');
    const results = await runDailyNotificationTriggers();

    const executionTime = Date.now() - startTime;

    console.log('✅ CRON 작업 완료:', {
      executionTime: `${executionTime}ms`,
      results,
      timestamp: new Date().toISOString(),
    });

    // 성공 로그를 파일에 기록
    const fs = await import('fs/promises');
    const logEntry = {
      timestamp: new Date().toISOString(),
      status: 'success',
      executionTime,
      results,
    };

    await fs.appendFile(
      path.resolve(process.cwd(), 'logs/notification-cron.log'),
      JSON.stringify(logEntry) + '\n'
    );

    process.exit(0);
  } catch (error) {
    console.error('❌ CRON 작업 실패:', error);

    // 실패 로그를 파일에 기록
    const fs = await import('fs/promises');
    const logEntry = {
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      stack: error instanceof Error ? error.stack : undefined,
    };

    try {
      await fs.appendFile(
        path.resolve(process.cwd(), 'logs/notification-cron.log'),
        JSON.stringify(logEntry) + '\n'
      );
    } catch (logError) {
      console.error('❌ 로그 파일 작성 실패:', logError);
    }

    process.exit(1);
  }
}

// 메인 함수 즉시 실행
main();

export { main };
