// 🧪 가장 간단한 알림 테스트 API

export async function action({ request }: { request: Request }) {
  try {
    console.log('🧪 간단한 알림 테스트 시작');

    // 직접 데이터베이스에 알림 insert 시도
    const { db } = await import('~/lib/core/db.server');
    const { appNotificationQueue } = await import(
      '~/features/notifications/lib/schema'
    );

    const result = await db
      .insert(appNotificationQueue)
      .values({
        userId: 'test-user-simple',
        type: 'system_alert',
        channel: 'in_app',
        priority: 'normal',
        title: '🧪 테스트 알림',
        message: '이것은 간단한 테스트 알림입니다.',
        recipient: 'test-user-simple',
        scheduledAt: new Date(),
        metadata: { test: true },
      })
      .returning();

    console.log('✅ 알림 생성 성공:', result[0]);

    return new Response(
      JSON.stringify({
        success: true,
        message: '간단한 테스트 알림이 생성되었습니다',
        notification: result[0],
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ 간단한 알림 테스트 실패:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        stack: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
