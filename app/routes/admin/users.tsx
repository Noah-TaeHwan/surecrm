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

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data: profilesData, error: fetchError } = await supabase
      .from('app_user_profiles')
      .select(
        `
        id,
        full_name,
        role,
        created_at,
        user:auth_users(email)
      `
      )
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('사용자 목록 조회 실패:', fetchError);
      setError('사용자 목록을 불러오는 중 오류가 발생했습니다.');
    } else {
      const formattedProfiles = profilesData.map((p: any) => ({
        id: p.id,
        full_name: p.full_name,
        email: p.user?.email || 'N/A',
        role: p.role,
        created_at: p.created_at,
      }));
      setProfiles(formattedProfiles);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error: updateError } = await supabase
      .from('app_user_profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (updateError) {
      toast.error(`역할 변경 실패: ${updateError.message}`);
    } else {
      toast.success('사용자 역할이 성공적으로 변경되었습니다.');
      // 목록을 다시 불러와서 변경사항을 반영합니다.
      fetchProfiles();
    }
  };

  if (loading) {
    return <div>사용자 목록을 불러오는 중...</div>;
  }

  if (error) {
    return <div>오류: {error}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-700">회원 관리</h1>
      <div className="mt-4">
        <div className="bg-white shadow-md rounded my-6">
          <table className="min-w-max w-full table-auto">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">이름</th>
                <th className="py-3 px-6 text-left">이메일</th>
                <th className="py-3 px-6 text-center">역할</th>
                <th className="py-3 px-6 text-center">가입일</th>
                <th className="py-3 px-6 text-center">작업</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {profiles.map(profile => (
                <tr
                  key={profile.id}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    {profile.full_name}
                  </td>
                  <td className="py-3 px-6 text-left">{profile.email}</td>
                  <td className="py-3 px-6 text-center">{profile.role}</td>
                  <td className="py-3 px-6 text-center">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          역할 변경
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {ROLES.map(role => (
                          <DropdownMenuItem
                            key={role}
                            onSelect={() => handleRoleChange(profile.id, role)}
                            disabled={profile.role === role}
                          >
                            {role}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
