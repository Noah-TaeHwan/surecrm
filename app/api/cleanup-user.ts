import { supabaseAdmin } from '~/lib/auth';
import { db } from '~/lib/db';
import { profiles } from '~/lib/schema';
import { eq } from 'drizzle-orm';

interface ActionArgs {
  request: Request;
}

export async function action({ request }: ActionArgs) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json(
        { success: false, error: '이메일 주소가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('사용자 정리 시작:', email);

    // 1. 해당 이메일의 모든 사용자 조회
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const targetUsers = users.users.filter((user) => user.email === email);

    if (targetUsers.length === 0) {
      return Response.json({
        success: true,
        message: '해당 이메일의 사용자가 없습니다.',
      });
    }

    // 2. 각 사용자에 대해 정리 작업
    for (const user of targetUsers) {
      console.log('사용자 정리 중:', user.id);

      // 프로필 삭제
      try {
        await db.delete(profiles).where(eq(profiles.id, user.id));
        console.log('프로필 삭제 완료:', user.id);
      } catch (error) {
        console.log('프로필 삭제 실패 (없을 수 있음):', error);
      }

      // Auth 사용자 삭제
      try {
        await supabaseAdmin.auth.admin.deleteUser(user.id);
        console.log('Auth 사용자 삭제 완료:', user.id);
      } catch (error) {
        console.error('Auth 사용자 삭제 실패:', error);
      }
    }

    return Response.json({
      success: true,
      message: `${targetUsers.length}개의 ${email} 계정이 정리되었습니다.`,
    });
  } catch (error) {
    console.error('사용자 정리 API 오류:', error);
    return Response.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
