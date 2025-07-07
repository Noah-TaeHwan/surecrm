import type { ActionFunctionArgs } from 'react-router';
import { db } from '~/lib/core/db.server';
import { waitlist } from '~/lib/schema/public';
import { eq } from 'drizzle-orm';

export async function action({ request }: ActionFunctionArgs) {
  console.log('🚀 [Vercel Log] /root action: 함수 실행 시작');
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const name = formData.get('name') as string | undefined;

  if (!email) {
    return new Response(
      JSON.stringify({ success: false, error: '이메일은 필수 항목입니다.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // 중복 이메일 체크
    const existingEntry = await db.query.waitlist.findFirst({
      where: eq(waitlist.email, email),
    });

    if (existingEntry) {
      return new Response(
        JSON.stringify({ success: false, error: '이미 등록된 이메일입니다.' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 새 대기자 등록
    await db.insert(waitlist).values({ email, name });
    console.log(`✅ [Vercel Log] Waitlist 등록 성공: ${email}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: '대기자 명단에 성공적으로 등록되었습니다!',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ [Vercel Log] Waitlist 등록 실패:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: '등록 중 오류가 발생했습니다. 다시 시도해주세요.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
