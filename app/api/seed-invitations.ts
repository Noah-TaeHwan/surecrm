import { db } from '~/lib/core/db';
import { invitations, profiles } from '~/lib/schema';

export async function action({ request }: { request: Request }) {
  try {
    console.log('초대장 시드 데이터 추가 시작...');

    // 먼저 기존 초대장이 있는지 확인
    const existingInvitations = await db.select().from(invitations);
    console.log('기존 초대장 수:', existingInvitations.length);

    if (existingInvitations.length === 0) {
      // 시스템용 더미 프로필이 필요하므로 먼저 생성
      const systemProfile = await db
        .insert(profiles)
        .values({
          id: '550e8400-e29b-41d4-a716-446655440000', // 고정 UUID
          fullName: '시스템 관리자',
          role: 'system_admin',
          invitationsLeft: 999,
          isActive: true,
        })
        .onConflictDoNothing()
        .returning();

      console.log('시스템 프로필 생성/확인 완료');

      // 테스트용 초대장 생성
      const testInvitation = await db
        .insert(invitations)
        .values({
          code: 'NYMCDZ4F',
          inviterId: '550e8400-e29b-41d4-a716-446655440000',
          inviteeEmail: null,
          message: '테스트용 초대장입니다.',
          status: 'pending',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후 만료
        })
        .returning();

      console.log('테스트 초대장 생성 완료:', testInvitation[0]);

      // 추가 초대장들도 생성
      const additionalInvitations = await db
        .insert(invitations)
        .values([
          {
            code: 'WELCOME1',
            inviterId: '550e8400-e29b-41d4-a716-446655440000',
            inviteeEmail: null,
            message: '환영합니다! SureCRM에 가입하세요.',
            status: 'pending',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
          {
            code: 'BETA2024',
            inviterId: '550e8400-e29b-41d4-a716-446655440000',
            inviteeEmail: null,
            message: '베타 테스터 초대장입니다.',
            status: 'pending',
            expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60일 후 만료
          },
        ])
        .returning();

      console.log('추가 초대장 생성 완료:', additionalInvitations.length, '개');

      return Response.json({
        success: true,
        message: '초대장 시드 데이터 추가 완료!',
        createdCount: 1 + additionalInvitations.length,
      });
    } else {
      return Response.json({
        success: true,
        message: '이미 초대장이 존재합니다.',
        existingCount: existingInvitations.length,
      });
    }
  } catch (error) {
    console.error('초대장 시드 데이터 추가 실패:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}
