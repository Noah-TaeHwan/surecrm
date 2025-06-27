import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';
import { data } from 'react-router';
import { requireAuth } from '~/lib/auth/helpers';
import { GoogleCalendarService } from '~/features/calendar/lib/google-calendar-service.server';

export async function action({ request }: ActionFunctionArgs) {
  try {
    const userId = await requireAuth(request);
    if (!userId) {
      return data({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const googleService = new GoogleCalendarService();

    // 전체 동기화 수행
    const success = await googleService.performFullSync(userId);

    if (success) {
      return data({
        success: true,
        message: '구글 캘린더 동기화가 완료되었습니다.',
      });
    } else {
      return data(
        {
          error: '동기화 중 오류가 발생했습니다',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ 구글 캘린더 동기화 오류:', error);
    return data(
      {
        error:
          error instanceof Error
            ? error.message
            : '알 수 없는 오류가 발생했습니다',
      },
      { status: 500 }
    );
  }
}

// GET 요청은 지원하지 않음
export async function loader() {
  return data({ error: 'POST 요청만 지원됩니다' }, { status: 405 });
}
