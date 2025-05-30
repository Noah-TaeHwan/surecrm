import { db } from '~/lib/db';
import { profiles, invitations } from '~/lib/supabase-schema';
import { eq } from 'drizzle-orm';
import { createInvitationsForUser } from '~/lib/invitation-utils';

interface ActionArgs {
  request: Request;
}

interface SupabaseWebhookPayload {
  type: string;
  table: string;
  record: any;
  schema: string;
  old_record: any;
}

export async function action({ request }: ActionArgs) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const payload: SupabaseWebhookPayload = await request.json();

    // 사용자 인증 확인 이벤트 처리
    if (payload.type === 'UPDATE' && payload.table === 'users') {
      const user = payload.record;

      // 이메일 확인이 완료된 경우
      if (user.email_confirmed_at && !payload.old_record?.email_confirmed_at) {
        console.log('이메일 인증 완료 감지:', user.id);

        // 사용자 메타데이터에서 회원가입 정보 가져오기
        const userData = user.user_metadata || {};
        const invitationCode = userData.invitation_code;

        if (!invitationCode) {
          console.error('초대 코드를 찾을 수 없습니다:', user.id);
          return Response.json({
            success: false,
            error: 'No invitation code found',
          });
        }

        // 초대장 정보 조회
        const invitation = await db
          .select()
          .from(invitations)
          .where(eq(invitations.code, invitationCode))
          .limit(1);

        if (invitation.length === 0) {
          console.error('유효하지 않은 초대 코드:', invitationCode);
          return Response.json({
            success: false,
            error: 'Invalid invitation code',
          });
        }

        const inv = invitation[0];

        // 프로필 생성 또는 업데이트
        const existingProfile = await db
          .select()
          .from(profiles)
          .where(eq(profiles.id, user.id))
          .limit(1);

        let profile;
        if (existingProfile.length > 0) {
          // 기존 프로필 활성화
          const updatedProfile = await db
            .update(profiles)
            .set({
              isActive: true,
              fullName: userData.full_name || existingProfile[0].fullName,
              phone: userData.phone || existingProfile[0].phone,
              company: userData.company || existingProfile[0].company,
              invitedById: inv.inviterId,
            })
            .where(eq(profiles.id, user.id))
            .returning();

          profile = updatedProfile[0];
        } else {
          // 새 프로필 생성
          const newProfile = await db
            .insert(profiles)
            .values({
              id: user.id,
              fullName: userData.full_name || 'Unknown',
              phone: userData.phone,
              company: userData.company,
              invitedById: inv.inviterId,
              role: 'agent',
              isActive: true,
            })
            .returning();

          profile = newProfile[0];
        }

        // 초대장 사용 처리
        await db
          .update(invitations)
          .set({
            status: 'used',
            usedById: user.id,
            usedAt: new Date(),
          })
          .where(eq(invitations.id, inv.id));

        // 새 사용자에게 초대장 2장 생성
        await createInvitationsForUser(user.id, 2);

        console.log('이메일 인증 후 프로필 생성 완료:', profile.id);

        return Response.json({
          success: true,
          message: 'Profile created successfully',
        });
      }
    }

    return Response.json({ success: true, message: 'Webhook received' });
  } catch (error) {
    console.error('Auth Webhook 처리 오류:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
