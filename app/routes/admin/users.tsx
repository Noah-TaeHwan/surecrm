import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/common/components/ui/dropdown-menu';
import { Button } from '~/common/components/ui/button';
import { toast } from 'sonner';
import type { LoaderFunctionArgs } from 'react-router';
import { useLoaderData } from 'react-router';
import { db } from '~/lib/core/db.server';
import schema from '~/lib/schema/all';
import { desc, eq } from 'drizzle-orm';
import { DataTable } from '~/common/components/ui/data-table';
import { columns } from './users.columns';

// Supabase 클라이언트 직접 생성
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  created_at: string;
}

const ROLES = ['agent', 'editor', 'admin'];

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const usersData = await db
      .select({
        id: schema.profiles.id,
        fullName: schema.profiles.fullName,
        email: schema.authUsers.email,
        role: schema.profiles.role,
        createdAt: schema.profiles.createdAt,
      })
      .from(schema.profiles)
      .leftJoin(schema.authUsers, eq(schema.profiles.id, schema.authUsers.id))
      .orderBy(desc(schema.profiles.createdAt));

    const users = usersData.map(user => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
    }));

    return { users };
  } catch (error) {
    console.error('사용자 목록 조회 실패:', error);
    return { users: [], error: '사용자 목록을 불러오지 못했습니다.' };
  }
}

export default function AdminUsersPage() {
  const { users, error } = useLoaderData<typeof loader>();

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold leading-tight text-gray-900 dark:text-white">
          사용자 관리
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          시스템의 모든 사용자를 관리합니다.
        </p>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <DataTable columns={columns} data={users} />
      </div>
    </div>
  );
}
