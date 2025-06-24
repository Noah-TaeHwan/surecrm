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
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? (process.env.PRODUCTION_URL || 'https://surecrm-sigma.vercel.app')
        : (process.env.APP_URL || 'http://localhost:5173');
      return redirect(`${baseUrl}/calendar?error=google_auth_denied`);
    }

    if (!code || !state) {
      console.error('❌ 필수 파라미터 누락:', { code: !!code, state: !!state });
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? (process.env.PRODUCTION_URL || 'https://surecrm-sigma.vercel.app')
        : (process.env.APP_URL || 'http://localhost:5173');
      return redirect(`${baseUrl}/calendar?error=missing_params`);
    }

    // 인증 확인
    const user = await requireAuth(request);

    // state 파라미터가 현재 사용자 ID와 일치하는지 확인
    if (state !== user.id) {
      console.error('❌ 사용자 불일치:', { userId: user.id, state });
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? (process.env.PRODUCTION_URL || 'https://surecrm-sigma.vercel.app')
        : (process.env.APP_URL || 'http://localhost:5173');
      return redirect(`${baseUrl}/calendar?error=invalid_user`);
    }

    // OAuth2 클라이언트 생성 - GoogleCalendarService와 동일한 환경 감지 로직 사용
    let redirectUri = 'http://localhost:5173/api/google/calendar/callback'; // 기본값
    
    try {
      const isProduction = 
        process.env.NODE_ENV === 'production' || 
        process.env.VERCEL_ENV === 'production' ||
        process.env.VERCEL === '1';

      if (isProduction) {
        redirectUri = 'https://surecrm-sigma.vercel.app/api/google/calendar/callback';
      }

      console.log('🔍 콜백 핸들러 OAuth2 클라이언트 생성:', {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL: process.env.VERCEL,
        isProduction: isProduction,
        redirectUri: redirectUri
      });
    } catch (error) {
      console.error('❌ 콜백 환경 감지 오류:', error);
      if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
        redirectUri = 'https://surecrm-sigma.vercel.app/api/google/calendar/callback';
      }
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
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

    // 데이터베이스에 토큰 저장 (웹훅 필드 안전 처리)
    try {
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
          // 웹훅 필드는 나중에 추가될 예정
          webhookChannelId: null,
          webhookResourceId: null,
          webhookExpiresAt: null,
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
            // 웹훅 필드 업데이트는 나중에 추가
          },
        });
    } catch (dbError: any) {
      // 웹훅 필드가 없을 때는 웹훅 필드 없이 저장
      if (
        dbError.message?.includes('webhook_channel_id') ||
        (dbError.message?.includes('column') &&
          dbError.message?.includes('does not exist'))
      ) {
        console.warn(
          '⚠️ 웹훅 필드가 아직 마이그레이션되지 않음, 기본 필드만 저장'
        );

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
      } else {
        throw dbError; // 다른 에러는 그대로 throw
      }
    }

    console.log('✅ 구글 캘린더 연동 성공:', { agentId: user.id });

    // 성공 시 캘린더 페이지로 리다이렉트 (강화된 환경 감지 로직 사용)
    let baseUrl = 'http://localhost:5173'; // 기본값
    
    try {
      const isProduction = 
        process.env.NODE_ENV === 'production' || 
        process.env.VERCEL_ENV === 'production' ||
        process.env.VERCEL === '1';

      if (isProduction) {
        baseUrl = 'https://surecrm-sigma.vercel.app';
      }

      console.log('🔍 최종 리다이렉트 URL 결정:', {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL: process.env.VERCEL,
        isProduction: isProduction,
        baseUrl: baseUrl,
        finalUrl: `${baseUrl}/calendar?success=google_calendar_connected`
      });
    } catch (error) {
      console.error('❌ 최종 리다이렉트 환경 감지 오류:', error);
      if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
        baseUrl = 'https://surecrm-sigma.vercel.app';
      }
    }
    
    return redirect(`${baseUrl}/calendar?success=google_calendar_connected`);
  } catch (error) {
    console.error('❌ 구글 캘린더 콜백 처리 실패:', error);
    
    // 에러 시에도 강화된 환경 감지 로직 사용
    let baseUrl = 'http://localhost:5173'; // 기본값
    
    try {
      const isProduction = 
        process.env.NODE_ENV === 'production' || 
        process.env.VERCEL_ENV === 'production' ||
        process.env.VERCEL === '1';

      if (isProduction) {
        baseUrl = 'https://surecrm-sigma.vercel.app';
      }

      console.log('🔍 에러 리다이렉트 URL 결정:', {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL: process.env.VERCEL,
        isProduction: isProduction,
        baseUrl: baseUrl,
        finalUrl: `${baseUrl}/calendar?error=connection_failed`
      });
    } catch (envError) {
      console.error('❌ 에러 리다이렉트 환경 감지 오류:', envError);
      if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
        baseUrl = 'https://surecrm-sigma.vercel.app';
      }
    }
    
    return redirect(`${baseUrl}/calendar?error=connection_failed`);
  }
}
