import { redirect } from 'react-router';
import { getSession, sessionStorage } from '~/lib/auth/session';
import { db } from '~/lib/core/db.server';
import schema from '~/lib/schema/all';
import { eq } from 'drizzle-orm';

/**
 * 요청에서 사용자가 관리자인지 확인하고, 그렇지 않으면 리디렉션합니다.
 * @param request - 현재 요청 객체
 * @returns {Promise<{ user: any, session: any, headers: Headers }>} - 관리자 사용자 객체, 세션 및 헤더
 * @throws {Response} - 사용자가 인증되지 않았거나 관리자가 아닌 경우 리디렉션 응답
 */
export async function requireAdmin(request: Request) {
  const session = await getSession(request);
  const userId = session.get('userId');

  if (!userId) {
    // 사용자가 로그인하지 않은 경우 로그인 페이지로 리디렉션
    session.flash('error', '이 페이지에 접근하려면 로그인이 필요합니다.');
    throw redirect('/auth/login', {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    });
  }

  const userProfiles = await db
    .select({
      id: schema.profiles.id,
      role: schema.profiles.role,
    })
    .from(schema.profiles)
    .where(eq(schema.profiles.id, userId));

  const userProfile = userProfiles[0];

  if (!userProfile) {
    // 프로필을 찾을 수 없는 경우 (데이터 불일치)
    session.unset('userId');
    session.flash(
      'error',
      '사용자 프로필을 찾을 수 없습니다. 다시 로그인해주세요.'
    );
    throw redirect('/auth/login', {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    });
  }

  if (userProfile.role !== 'system_admin') {
    // 사용자가 관리자가 아닌 경우 기본 페이지로 리디렉션
    session.flash('error', '이 페이지에 접근할 권한이 없습니다.');
    throw redirect('/', {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    });
  }

  // 사용자가 관리자인 경우
  return {
    user: userProfile,
    session,
    headers: new Headers({
      'Set-Cookie': await sessionStorage.commitSession(session),
    }),
  };
}
