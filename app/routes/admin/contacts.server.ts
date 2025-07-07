import { db } from '~/lib/core/db.server';
import { contacts } from '~/lib/schema/public';
import { requireAdmin } from '~/lib/auth/guards.server';
import { eq, desc, and, or, like, count } from 'drizzle-orm';
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';

export async function loader({ request }: LoaderFunctionArgs) {
  console.log('🚀 [Vercel Log] /admin/contacts loader: 함수 실행 시작');
  await requireAdmin(request);

  const url = new URL(request.url);
  const searchQuery = url.searchParams.get('search') || '';
  const statusFilter = url.searchParams.get('status') || 'all';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  const filters = [];
  if (searchQuery) {
    filters.push(
      or(
        like(contacts.name, `%${searchQuery}%`),
        like(contacts.email, `%${searchQuery}%`),
        like(contacts.subject, `%${searchQuery}%`)
      )
    );
  }
  if (statusFilter !== 'all') {
    filters.push(eq(contacts.status, statusFilter as any));
  }

  const contactsQuery = db
    .select()
    .from(contacts)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(desc(contacts.createdAt))
    .limit(limit)
    .offset(offset);

  const contactsList = await contactsQuery;

  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(contacts)
    .where(filters.length > 0 ? and(...filters) : undefined);

  const [totalStats] = await db.select({ count: count() }).from(contacts);
  const [pendingStats] = await db
    .select({ count: count() })
    .from(contacts)
    .where(eq(contacts.status, 'pending'));
  const [inProgressStats] = await db
    .select({ count: count() })
    .from(contacts)
    .where(eq(contacts.status, 'in-progress'));
  const [resolvedStats] = await db
    .select({ count: count() })
    .from(contacts)
    .where(eq(contacts.status, 'resolved'));

  const contactsWithISOStrings = contactsList.map(contact => ({
    ...contact,
    createdAt: new Date(contact.createdAt).toISOString(),
    updatedAt: new Date(contact.updatedAt).toISOString(),
    respondedAt: contact.respondedAt
      ? new Date(contact.respondedAt).toISOString()
      : null,
  }));

  return {
    contacts: contactsWithISOStrings,
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
    searchQuery,
    statusFilter,
    stats: {
      total: totalStats.count,
      pending: pendingStats.count,
      inProgress: inProgressStats.count,
      resolved: resolvedStats.count,
    },
  };
}

export async function action({ request }: ActionFunctionArgs) {
  console.log('🚀 [Vercel Log] /admin/contacts action: 함수 실행 시작');
  await requireAdmin(request);

  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const contactId = formData.get('contactId') as string;

  if (intent === 'updateStatus') {
    const status = formData.get('status') as string;
    await db
      .update(contacts)
      .set({
        status: status as any,
        updatedAt: new Date(),
        ...(status === 'resolved' && { respondedAt: new Date() }),
      })
      .where(eq(contacts.id, contactId));
  }

  if (intent === 'respond') {
    const responseMessage = formData.get('responseMessage') as string;
    await db
      .update(contacts)
      .set({
        status: 'resolved',
        responseMessage,
        respondedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(contacts.id, contactId));
  }

  return null;
}
