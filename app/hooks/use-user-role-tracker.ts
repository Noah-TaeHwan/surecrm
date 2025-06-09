/**
 * 🔒 사용자 역할 추적 훅
 *
 * 사용자 역할 정보를 로컬 스토리지에 저장하여
 * 분석 시스템에서 system_admin 사용자를 제외할 수 있도록 합니다.
 */

import { useEffect } from 'react';
import { getClientSideClient } from '~/lib/core/supabase';

export function useUserRoleTracker() {
  const supabase = getClientSideClient();

  useEffect(() => {
    async function updateUserRole() {
      try {
        // 현재 로그인된 사용자 가져오기
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          // 로그아웃 시 역할 정보 제거
          localStorage.removeItem('surecrm_user_role');
          return;
        }

        // 사용자 프로필에서 역할 정보 가져오기
        const { data: profiles } = await supabase
          .from('app_user_profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profiles?.role) {
          // 로컬 스토리지에 역할 정보 저장
          localStorage.setItem('surecrm_user_role', profiles.role);

          // 분석 설정 업데이트 (필요 시)
          if (profiles.role === 'system_admin') {
            console.log('👑 시스템 관리자 로그인: 분석 데이터 수집 비활성화');
          }
        }
      } catch (error) {
        console.error('사용자 역할 정보 업데이트 실패:', error);
      }
    }

    updateUserRole();

    // 인증 상태 변경 시 역할 정보 업데이트
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        updateUserRole();
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('surecrm_user_role');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return null;
}

// 사용자 역할을 로컬 스토리지에서 가져오는 헬퍼 함수
export function getUserRoleFromStorage(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem('surecrm_user_role');
  } catch (error) {
    console.debug('로컬 스토리지에서 사용자 역할 가져오기 실패:', error);
    return null;
  }
}

// 사용자 역할을 로컬 스토리지에 저장하는 헬퍼 함수
export function setUserRoleToStorage(role: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('surecrm_user_role', role);
  } catch (error) {
    console.debug('로컬 스토리지에 사용자 역할 저장 실패:', error);
  }
}
