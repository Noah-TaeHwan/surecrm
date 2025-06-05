import { requireAuth } from '~/lib/auth/middleware';
import {
  getClientTagsWithAssignments,
  assignTagToClient,
  removeTagFromClient,
} from '~/features/clients/lib/client-data';

// 🏷️ 특정 클라이언트의 태그 조회 및 관리
export async function loader({
  request,
  params,
}: {
  request: Request;
  params: any;
}) {
  try {
    const url = new URL(request.url);
    const clientId = url.searchParams.get('clientId');

    if (!clientId) {
      return new Response(
        JSON.stringify({ message: '클라이언트 ID가 필요합니다.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = await requireAuth(request);
    const agentId = user.id;

    const tags = await getClientTagsWithAssignments(clientId, agentId);

    return new Response(JSON.stringify(tags), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ 클라이언트 태그 조회 실패:', error);
    return new Response(
      JSON.stringify({
        message:
          error instanceof Error ? error.message : '태그 조회에 실패했습니다.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// 🏷️ 클라이언트에 태그 할당/제거
export async function action({ request }: { request: Request }) {
  try {
    const body = await request.json();
    const { clientId, tagIds, action: actionType, tagId } = body;

    if (!clientId) {
      return new Response(
        JSON.stringify({ message: '클라이언트 ID가 필요합니다.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = await requireAuth(request);
    const agentId = user.id;

    if (actionType === 'remove' && tagId) {
      // 개별 태그 제거
      await removeTagFromClient(clientId, tagId, agentId);
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } else if (actionType === 'update' && Array.isArray(tagIds)) {
      // 태그 일괄 업데이트
      const currentTags = await getClientTagsWithAssignments(clientId, agentId);
      const currentTagIds = currentTags.map((tag) => tag.id);

      // 추가할 태그들
      const tagsToAdd = tagIds.filter((id) => !currentTagIds.includes(id));

      // 제거할 태그들
      const tagsToRemove = currentTagIds.filter((id) => !tagIds.includes(id));

      // 태그 할당
      for (const id of tagsToAdd) {
        await assignTagToClient(clientId, id, agentId);
      }

      // 태그 제거
      for (const id of tagsToRemove) {
        await removeTagFromClient(clientId, id, agentId);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ message: '올바르지 않은 요청입니다.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ 클라이언트 태그 업데이트 실패:', error);
    return new Response(
      JSON.stringify({
        message:
          error instanceof Error
            ? error.message
            : '태그 업데이트에 실패했습니다.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
