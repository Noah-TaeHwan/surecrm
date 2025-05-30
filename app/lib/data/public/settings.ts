import { db } from '../../core/db';
import { siteSettings } from '../../schema';
import { eq } from 'drizzle-orm';

/**
 * 사이트 설정 값 가져오기
 */
export async function getSiteSetting(key: string): Promise<string | null> {
  try {
    const setting = await db
      .select({
        value: siteSettings.value,
      })
      .from(siteSettings)
      .where(eq(siteSettings.key, key))
      .limit(1);

    return setting.length > 0 ? setting[0].value : null;
  } catch (error) {
    console.error(`사이트 설정 조회 실패 (${key}):`, error);
    return null;
  }
}
