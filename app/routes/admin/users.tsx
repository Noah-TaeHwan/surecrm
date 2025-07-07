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
    const users = await db
      .select({
        id: schema.profiles.id,
        fullName: schema.profiles.fullName,
        email: schema.authUsers.email, // auth.users 테이블에서 이메일 가져오기
        role: schema.profiles.role,
        createdAt: schema.profiles.createdAt,
      })
      .from(schema.profiles)
      .leftJoin(schema.authUsers, eq(schema.profiles.id, schema.authUsers.id))
      .orderBy(desc(schema.profiles.createdAt));

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
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
        사용자 관리
      </h1>
      <div className="p-4 bg-white rounded-lg shadow-md dark:bg-gray-900">
        <p>{users.length}명의 사용자가 있습니다.</p>
        {/* 여기에 DataTable 컴포넌트가 위치할 것입니다. */}
        <pre>{JSON.stringify(users, null, 2)}</pre>
      </div>
    </div>
  );
}
