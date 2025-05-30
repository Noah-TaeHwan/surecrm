import { createServerClient, getClientSideClient } from '../../core/supabase';

/**
 * 랜덤 초대 코드 생성
 * 형식: ABC-DEF-GHI (3글자-3글자-3글자, 대문자와 숫자 조합)
 */
export function generateInvitationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = [];

  for (let i = 0; i < 3; i++) {
    let segment = '';
    for (let j = 0; j < 3; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }

  return segments.join('-');
}

/**
 * 초대 코드 중복 확인 및 유니크한 코드 생성
 */
export async function generateUniqueInvitationCode(): Promise<string> {
  const supabase = createServerClient();
  let code: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    code = generateInvitationCode();

    const { data, error } = await supabase
      .from('invitations')
      .select('id')
      .eq('code', code)
      .single();

    if (error && error.code === 'PGRST116') {
      // 데이터가 없음 = 유니크한 코드
      isUnique = true;
      return code;
    }

    attempts++;
  }

  // 최대 시도 횟수 초과 시 UUID 기반 코드 생성
  return `INV-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

/**
 * 사용자에게 초대장 발급
 */
export async function createInvitationsForUser(
  userId: string,
  count: number = 2
): Promise<{ success: boolean; invitations?: any[]; error?: string }> {
  const supabase = createServerClient();

  try {
    const invitations = [];

    for (let i = 0; i < count; i++) {
      const code = await generateUniqueInvitationCode();

      invitations.push({
        code,
        inviter_id: userId,
        status: 'pending',
        // expires_at 제거 - 유효기간 없음
      });
    }

    const { data, error } = await supabase
      .from('invitations')
      .insert(invitations)
      .select();

    if (error) {
      console.error('초대장 생성 오류:', error);
      return { success: false, error: error.message };
    }

    return { success: true, invitations: data };
  } catch (error) {
    console.error('초대장 생성 중 예외 발생:', error);
    return { success: false, error: '초대장 생성 중 오류가 발생했습니다.' };
  }
}

/**
 * 단일 초대장 생성 (auth.ts 호환성)
 */
export async function createInvitation(
  inviterId: string,
  inviteeEmail?: string,
  message?: string
): Promise<{ success: boolean; code?: string; error?: string }> {
  const supabase = createServerClient();

  try {
    const code = await generateUniqueInvitationCode();

    const { data, error } = await supabase
      .from('invitations')
      .insert([
        {
          code,
          inviter_id: inviterId,
          invitee_email: inviteeEmail,
          message,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('초대장 생성 오류:', error);
      return { success: false, error: error.message };
    }

    return { success: true, code };
  } catch (error) {
    console.error('초대장 생성 중 예외 발생:', error);
    return { success: false, error: '초대장 생성 중 오류가 발생했습니다.' };
  }
}

/**
 * 초대 코드 사용 처리
 */
export async function useInvitationCode(
  code: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerClient();

  try {
    const { data, error } = await supabase
      .from('invitations')
      .update({
        status: 'used',
        used_by_id: userId,
        used_at: new Date().toISOString(),
      })
      .eq('code', code)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) {
      console.error('초대 코드 사용 처리 오류:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: '유효하지 않은 초대 코드입니다.' };
    }

    return { success: true };
  } catch (error) {
    console.error('초대 코드 사용 처리 중 예외 발생:', error);
    return { success: false, error: '초대 코드 처리 중 오류가 발생했습니다.' };
  }
}

/**
 * 사용자의 초대장 목록 조회 (클라이언트 사이드용)
 */
export async function getUserInvitations(userId: string) {
  const { data, error } = await getClientSideClient()
    .from('invitations')
    .select('*')
    .eq('inviter_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('초대장 조회 오류:', error);
    return { success: false, error: error.message };
  }

  return { success: true, invitations: data };
}

// 초대장 통계는 stats.ts에서 제공됩니다
// 하위 호환성을 위해 re-export
export { getInviteStats as getInvitationStats } from '../public/stats';
