import { requireAuth } from '~/lib/auth/middleware';
import {
  getClientTags,
  createClientTag,
} from '~/features/clients/lib/client-data';

// 🏷️ 에이전트의 모든 태그 조회
export async function loader({ request }: { request: Request }) {
  try {
    const user = await requireAuth(request);
    const agentId = user.id;

    const tags = await getClientTags(agentId);

    return new Response(JSON.stringify(tags), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ 태그 조회 실패:', error);
    return new Response(
      JSON.stringify({
        message:
          error instanceof Error ? error.message : '태그 조회에 실패했습니다.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// 🏷️ 새 태그 생성
export async function action({ request }: { request: Request }) {
  try {
    const user = await requireAuth(request);
    const agentId = user.id;

    const body = await request.json();
    const { name, color, description } = body;

    if (!name || !color) {
      return new Response(
        JSON.stringify({ message: '태그 이름과 색상은 필수입니다.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const newTag = await createClientTag(
      {
        agentId,
        name: name.trim(),
        color,
        description: description?.trim() || null,
      },
      agentId
    );

    return new Response(JSON.stringify(newTag), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ 태그 생성 실패:', error);
    return new Response(
      JSON.stringify({
        message:
          error instanceof Error ? error.message : '태그 생성에 실패했습니다.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
