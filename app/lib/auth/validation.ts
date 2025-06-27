import { createServerClient } from '../core/supabase';
import { db } from '../core/db.server';
import { invitations } from '../schema';
import { eq } from 'drizzle-orm';
import type { InvitationValidationResult } from './types';

/**
 * 초대장 코드 검증
 */
export async function validateInvitationCode(
  code: string
): Promise<InvitationValidationResult> {
  try {
    const invitation = await db
      .select()
      .from(invitations)
      .where(eq(invitations.code, code))
      .limit(1);

    if (invitation.length === 0) {
      return {
        valid: false,
        error: '유효하지 않은 초대 코드입니다.',
      };
    }

    const inv = invitation[0];

    // 이미 사용된 초대장인지 확인
    if (inv.status === 'used') {
      return {
        valid: false,
        error: '이미 사용된 초대 코드입니다.',
      };
    }

    // 만료되거나 취소된 초대장인지 확인
    if (inv.status === 'expired' || inv.status === 'cancelled') {
      return {
        valid: false,
        error: '만료되거나 취소된 초대 코드입니다.',
      };
    }

    // 만료된 초대장인지 확인
    if (inv.expiresAt && new Date(inv.expiresAt) < new Date()) {
      return {
        valid: false,
        error: '만료된 초대 코드입니다.',
      };
    }

    return {
      valid: true,
      invitation: inv,
    };
  } catch (error) {
    console.error('초대장 코드 검증 중 오류:', error);
    return {
      valid: false,
      error: '초대장 코드 검증 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 이메일 중복 체크 (일반 Auth API 사용)
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const supabase = createServerClient();

    // 임시 비밀번호로 회원가입 시도하여 중복 체크
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: 'temp-check-password-12345', // 임시 비밀번호
      options: {
        data: { temp_check: true },
      },
    });

    if (error) {
      // 이미 등록된 이메일인 경우
      if (
        error.message.includes('already registered') ||
        error.message.includes('User already registered')
      ) {
        return true;
      }
      // 다른 오류인 경우 중복이 아닌 것으로 처리
      return false;
    }

    // 임시로 생성된 사용자 삭제 (가능한 경우)
    if (data.user && data.user.id) {
      try {
        // 클라이언트에서는 삭제할 수 없으므로 로그만 남김
        console.log('임시 사용자 생성됨:', data.user.id, '(자동 삭제 필요)');
      } catch (deleteError) {
        console.log('임시 사용자 삭제 불가:', deleteError);
      }
    }

    // 사용자가 생성되었다면 이메일이 사용 가능하다는 의미
    return false;
  } catch (error) {
    console.error('이메일 중복 체크 중 오류:', error);
    return false;
  }
}
