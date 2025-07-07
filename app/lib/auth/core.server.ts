import {
  createAdminClient,
  createServerClient,
  createClientSideClient,
} from '../core/supabase';
import { db } from '../core/db.server';
import schema from '../schema/all';
import { eq } from 'drizzle-orm';
import { getUserId } from './session';
import type {
  User,
  LoginAttempt,
  LoginResult,
  MagicLinkRequest,
  MagicLinkResult,
  MagicLinkVerification,
} from './types';

/**
 * 현재 사용자 조회
 */
export async function getCurrentUser(request: Request): Promise<User | null> {
  try {
    // 세션에서 사용자 ID 가져오기
    const userId = await getUserId(request);
    if (!userId) {
      return null;
    }

    // 프로필 정보 조회
    const userProfile = await db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.id, userId))
      .limit(1);

    if (userProfile.length === 0) {
      console.error('프로필을 찾을 수 없음:', userId);
      return null;
    }

    const profile = userProfile[0];

    // Supabase Auth에서 이메일 정보 가져오기
    const supabaseAdmin = createAdminClient();
    const { data: authUser } =
      await supabaseAdmin.auth.admin.getUserById(userId);

    return {
      id: profile.id,
      email: authUser.user?.email || '',
      fullName: profile.fullName,
      role: profile.role,
      teamId: profile.teamId || undefined,
      isActive: profile.isActive,
      invitationsLeft: profile.invitationsLeft,
    };
  } catch (error) {
    console.error('현재 사용자 조회 중 오류:', error);
    return null;
  }
}

/**
 * 인증 상태 확인
 */
export async function checkAuthStatus(request: Request): Promise<boolean> {
  const user = await getCurrentUser(request);
  return user !== null && user.isActive;
}

/**
 * 로그아웃
 */
export async function logoutUser(): Promise<void> {
  // 클라이언트에서는 Supabase 세션 정리
  const supabase = createServerClient();
  await supabase.auth.signOut();
}

/**
 * 매직링크 발송 (새로운 로그인 방식)
 */
export async function sendMagicLink(
  request: MagicLinkRequest
): Promise<MagicLinkResult> {
  try {
    console.log('매직링크 발송 시도:', request.email);

    // 1. Supabase Admin API로 이메일 사용자 조회
    const supabaseAdmin = createAdminClient();
    const { data: users, error: listError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error('사용자 목록 조회 오류:', listError);
      return {
        success: false,
        error: '사용자 확인 중 오류가 발생했습니다.',
      };
    }

    // 이메일로 사용자 찾기
    const existingUser = users.users.find(user => user.email === request.email);

    if (!existingUser) {
      return {
        success: false,
        error: '등록되지 않은 이메일 주소입니다. 회원가입을 먼저 진행해주세요.',
      };
    }

    // 2. 프로필 상태 확인
    const userProfile = await db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.id, existingUser.id))
      .limit(1);

    if (userProfile.length === 0) {
      return {
        success: false,
        error: '사용자 프로필을 찾을 수 없습니다.',
      };
    }

    const profile = userProfile[0];

    // 3. 계정 활성화 상태 확인
    if (!profile.isActive) {
      return {
        success: false,
        error: '비활성화된 계정입니다. 관리자에게 문의하세요.',
      };
    }

    // 4. 매직링크 발송
    const supabase = createServerClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: request.email,
      options: {
        shouldCreateUser: false, // 기존 사용자만 로그인 허용
      },
    });

    if (error) {
      console.error('매직링크 발송 오류:', error);
      return {
        success: false,
        error: '매직링크 발송에 실패했습니다. 잠시 후 다시 시도해주세요.',
      };
    }

    console.log('매직링크 발송 완료:', request.email);

    return {
      success: true,
      message: '로그인 링크가 이메일로 전송되었습니다. 이메일을 확인해주세요.',
    };
  } catch (error) {
    console.error('매직링크 발송 처리 중 오류:', error);
    return {
      success: false,
      error: '매직링크 발송 처리 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 마지막 로그인 시간 업데이트
 */
async function updateLastLoginTime(userId: string): Promise<void> {
  try {
    await db
      .update(schema.profiles)
      .set({
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.profiles.id, userId));

    console.log('마지막 로그인 시간 업데이트 완료:', userId);
  } catch (error) {
    console.error('마지막 로그인 시간 업데이트 실패:', userId, error);
  }
}

/**
 * 사용자 활동 시간 업데이트 (외부에서 호출 가능)
 * 예: 중요한 액션 수행 시 호출하여 마지막 활동 시간을 기록
 */
export async function updateUserActivity(userId: string): Promise<void> {
  try {
    await db
      .update(schema.profiles)
      .set({
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.profiles.id, userId));

    console.log('사용자 활동 시간 업데이트 완료:', userId);
  } catch (error) {
    console.error('사용자 활동 시간 업데이트 실패:', userId, error);
  }
}

/**
 * 매직링크 검증 및 로그인 처리
 */
export async function verifyMagicLink(
  token: string,
  type: string,
  email: string
): Promise<LoginResult> {
  try {
    console.log('매직링크 검증 시작:', email);

    // 1. Supabase를 통한 매직링크 검증
    const supabase = createServerClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: token,
      type: type as any,
    });

    if (error) {
      console.error('매직링크 검증 오류:', error);
      return {
        success: false,
        error: '로그인 링크가 올바르지 않거나 만료되었습니다.',
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: '매직링크 검증에 실패했습니다.',
      };
    }

    console.log('매직링크 검증 성공:', data.user.id);

    // 2. 프로필 정보 조회
    const userProfile = await db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.id, data.user.id))
      .limit(1);

    if (userProfile.length === 0) {
      console.error('프로필을 찾을 수 없음:', data.user.id);
      return {
        success: false,
        error: '사용자 프로필을 찾을 수 없습니다.',
      };
    }

    const profile = userProfile[0];

    // 3. 계정 활성화 상태 재확인
    if (!profile.isActive) {
      return {
        success: false,
        error: '비활성화된 계정입니다. 관리자에게 문의하세요.',
      };
    }

    // 4. 마지막 로그인 시간 업데이트
    await updateLastLoginTime(profile.id);

    console.log('매직링크 로그인 성공:', profile.fullName);

    return {
      success: true,
      user: {
        id: profile.id,
        email: data.user.email!,
        fullName: profile.fullName,
        role: profile.role,
        teamId: profile.teamId || undefined,
        isActive: profile.isActive,
        invitationsLeft: profile.invitationsLeft,
      },
    };
  } catch (error) {
    console.error('매직링크 검증 처리 중 오류:', error);
    return {
      success: false,
      error: '매직링크 검증 처리 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 로그인 처리 (클래식 이메일/비밀번호 방식)
 */
export async function authenticateUser(
  credentials: LoginAttempt
): Promise<LoginResult> {
  try {
    console.log('🔐 [로그인 시작] 이메일:', credentials.email);

    // 1. 서버 클라이언트를 사용하여 브라우저 세션 설정
    const supabase = createServerClient();
    console.log('📡 [1단계] Supabase 클라이언트 생성 완료');

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

    if (authError) {
      console.error('❌ [1단계 실패] Supabase Auth 로그인 오류:', {
        message: authError.message,
        status: authError.status,
        code: authError.name || 'AuthError',
        details: authError,
      });

      // 구체적인 에러 메시지 제공
      if (authError.message?.includes('Invalid login credentials')) {
        return {
          success: false,
          error: '이메일 또는 비밀번호가 올바르지 않습니다.',
        };
      } else if (authError.message?.includes('Email not confirmed')) {
        return {
          success: false,
          error: '이메일 인증이 필요합니다. 이메일을 확인해주세요.',
        };
      } else if (authError.message?.includes('Too many requests')) {
        return {
          success: false,
          error:
            '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.',
        };
      }

      return {
        success: false,
        error: `로그인 오류: ${authError.message}`,
      };
    }

    if (!authData.user) {
      console.error('❌ [1단계] authData.user가 null입니다:', authData);
      return {
        success: false,
        error: '로그인에 실패했습니다.',
      };
    }

    console.log('✅ [1단계 성공] Supabase Auth 로그인 완료:', {
      userId: authData.user.id,
      email: authData.user.email,
      confirmed_at: authData.user.email_confirmed_at,
    });

    // 2. 프로필 정보 조회
    console.log('📂 [2단계] 프로필 조회 시작...');

    try {
      const userProfile = await db
        .select()
        .from(schema.profiles)
        .where(eq(schema.profiles.id, authData.user.id))
        .limit(1);

      console.log('📊 [2단계] DB 쿼리 결과:', {
        userId: authData.user.id,
        profilesFound: userProfile.length,
        profiles: userProfile.length > 0 ? userProfile[0] : null,
      });

      if (userProfile.length === 0) {
        console.error('❌ [2단계 실패] 프로필을 찾을 수 없음:', {
          userId: authData.user.id,
          email: authData.user.email,
          suggestion:
            'app_user_profiles 테이블에 해당 사용자가 없을 수 있습니다',
        });
        return {
          success: false,
          error: '사용자 프로필을 찾을 수 없습니다. 관리자에게 문의하세요.',
        };
      }

      const profile = userProfile[0];
      console.log('✅ [2단계 성공] 프로필 조회 완료:', {
        id: profile.id,
        fullName: profile.fullName,
        isActive: profile.isActive,
        role: profile.role,
      });

      // 3. 계정 활성화 상태 확인
      console.log('🔍 [3단계] 계정 활성화 상태 확인...');

      if (!profile.isActive) {
        console.error('❌ [3단계 실패] 비활성화된 계정:', {
          userId: profile.id,
          fullName: profile.fullName,
          isActive: profile.isActive,
        });
        return {
          success: false,
          error: '비활성화된 계정입니다. 관리자에게 문의하세요.',
        };
      }

      console.log('✅ [3단계 성공] 계정 활성화 상태 정상');

      // 4. 마지막 로그인 시간 업데이트
      console.log('⏰ [4단계] 마지막 로그인 시간 업데이트...');
      await updateLastLoginTime(profile.id);
      console.log('✅ [4단계 성공] 마지막 로그인 시간 업데이트 완료');

      console.log('🎉 [로그인 완료] 모든 단계 성공:', profile.fullName);

      return {
        success: true,
        user: {
          id: profile.id,
          email: authData.user.email!,
          fullName: profile.fullName,
          role: profile.role,
          teamId: profile.teamId || undefined,
          isActive: profile.isActive,
          invitationsLeft: profile.invitationsLeft,
        },
      };
    } catch (dbError) {
      console.error('❌ [2단계 DB 오류] 프로필 조회 중 DB 에러:', {
        error: dbError,
        userId: authData.user.id,
        suggestion: 'DB 연결 상태나 스키마를 확인해주세요',
      });
      return {
        success: false,
        error: 'DB 연결 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      };
    }
  } catch (error) {
    console.error('💥 [로그인 처리 중 예상치 못한 오류]:', {
      error,
      email: credentials.email,
      timestamp: new Date().toISOString(),
    });
    return {
      success: false,
      error: '시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    };
  }
}

/**
 * DB 상태 진단 함수 (디버깅용)
 */
export async function diagnoseAuthDB(email: string): Promise<any> {
  try {
    console.log('🔍 [DB 진단 시작] 이메일:', email);

    // 1. Supabase Admin으로 Auth 사용자 확인
    const supabaseAdmin = createAdminClient();
    const { data: users, error: listError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error('❌ [Auth API 오류]:', listError);
      return { error: 'Auth API 접근 실패', details: listError };
    }

    const authUser = users.users.find(user => user.email === email);
    console.log('📊 [Auth 사용자 상태]:', {
      found: !!authUser,
      id: authUser?.id,
      email: authUser?.email,
      confirmed_at: authUser?.email_confirmed_at,
      last_sign_in_at: authUser?.last_sign_in_at,
    });

    if (!authUser) {
      return { error: 'Supabase Auth에 사용자 없음', authUser: null };
    }

    // 2. app_user_profiles 테이블 확인
    try {
      const userProfile = await db
        .select()
        .from(schema.profiles)
        .where(eq(schema.profiles.id, authUser.id))
        .limit(1);

      console.log('�� [프로필 테이블 상태]:', {
        profilesFound: userProfile.length,
        profile:
          userProfile.length > 0
            ? {
                id: userProfile[0].id,
                fullName: userProfile[0].fullName,
                isActive: userProfile[0].isActive,
                role: userProfile[0].role,
                createdAt: userProfile[0].createdAt,
              }
            : null,
      });

      return {
        success: true,
        authUser: {
          id: authUser.id,
          email: authUser.email,
          confirmed_at: authUser.email_confirmed_at,
        },
        profile: userProfile.length > 0 ? userProfile[0] : null,
        diagnosis: userProfile.length === 0 ? 'PROFILE_MISSING' : 'OK',
      };
    } catch (dbError) {
      console.error('❌ [DB 연결 오류]:', dbError);
      return {
        error: 'DB 연결 실패',
        authUser: { id: authUser.id, email: authUser.email },
        dbError,
      };
    }
  } catch (error) {
    console.error('💥 [진단 실패]:', error);
    return { error: '진단 과정에서 오류 발생', details: error };
  }
}
