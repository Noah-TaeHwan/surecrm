import type { LoaderFunctionArgs } from 'react-router';
import { redirect } from 'react-router';
import { google } from 'googleapis';
import { db } from '~/lib/core/db';
import { appCalendarSettings } from '~/features/calendar/lib/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '~/lib/auth/middleware';

// 구글 캘린더 OAuth 콜백 처리
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state'); // agentId
    const error = url.searchParams.get('error');

    // 에러 처리
    if (error) {
      console.error('❌ 구글 OAuth 에러:', error);
      return redirect('/settings?error=google_auth_denied');
    }

    if (!code || !state) {
      console.error('❌ 필수 파라미터 누락:', { code: !!code, state: !!state });
      return redirect('/settings?error=missing_params');
    }

    // 인증 확인 (state가 현재 사용자 ID와 일치하는지)
    const user = await requireAuth(request);
    if (user.id !== state) {
      console.error('❌ 사용자 불일치:', { userId: user.id, state });
      return redirect('/settings?error=invalid_user');
    }

    // OAuth2 클라이언트 생성
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${
        process.env.NODE_ENV === 'production'
          ? process.env.PRODUCTION_URL
          : process.env.APP_URL
      }/api/google/calendar/callback`
    );

    // 토큰 교환
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      throw new Error('액세스 토큰을 받을 수 없습니다');
    }

    // 토큰 암호화 (간단한 Base64 인코딩 - 실제로는 더 강력한 암호화 필요)
    const encryptedAccessToken = Buffer.from(tokens.access_token).toString(
      'base64'
    );
    const encryptedRefreshToken = tokens.refresh_token
      ? Buffer.from(tokens.refresh_token).toString('base64')
      : null;

    // 데이터베이스에 토큰 저장
    await db
      .insert(appCalendarSettings)
      .values({
        agentId: user.id,
        googleCalendarSync: true,
        googleAccessToken: encryptedAccessToken,
        googleRefreshToken: encryptedRefreshToken,
        googleTokenExpiresAt: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : null,
        syncStatus: 'synced',
        lastSyncAt: new Date(),
      })
      .onConflictDoUpdate({
        target: appCalendarSettings.agentId,
        set: {
          googleCalendarSync: true,
          googleAccessToken: encryptedAccessToken,
          googleRefreshToken: encryptedRefreshToken,
          googleTokenExpiresAt: tokens.expiry_date
            ? new Date(tokens.expiry_date)
            : null,
          syncStatus: 'synced',
          lastSyncAt: new Date(),
          updatedAt: new Date(),
        },
      });

    console.log('✅ 구글 캘린더 연동 성공:', { agentId: user.id });

    // 성공 시 설정 페이지로 리다이렉트
    return redirect('/settings?success=google_calendar_connected');
  } catch (error) {
    console.error('❌ 구글 캘린더 콜백 처리 실패:', error);
    return redirect('/settings?error=connection_failed');
  }
}
