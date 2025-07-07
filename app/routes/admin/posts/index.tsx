import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { createClient } from '@supabase/supabase-js';
import { Button } from '~/common/components/ui/button';
import { Switch } from '~/common/components/ui/switch';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/common/components/ui/alert-dialog';

// Supabase 클라이언트 직접 생성
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Post {
  id: string;
  title: string | null;
  status: string | null;
  created_at: string;
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, status, created_at')
      .not('status', 'eq', 'archived')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('게시물 목록 조회 실패:', fetchError);
      setError('게시물 목록을 불러오는 중 오류가 발생했습니다.');
    } else {
      setPosts(data as Post[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleStatusChange = async (post: Post, isPublished: boolean) => {
    const newStatus = isPublished ? 'published' : 'draft';
    const publishedAt = isPublished ? new Date().toISOString() : null;

    const { error: updateError } = await supabase
      .from('posts')
      .update({ status: newStatus, published_at: publishedAt })
      .eq('id', post.id);

    if (updateError) {
      toast.error(`상태 변경 실패: ${updateError.message}`);
    } else {
      toast.success(
        `'${post.title}' 게시물 상태가 '${newStatus}'로 변경되었습니다.`
      );
      fetchPosts(); // 목록 새로고침
    }
  };

  const handleDelete = async (postId: string) => {
    const { error: updateError } = await supabase
      .from('posts')
      .update({ status: 'archived' })
      .eq('id', postId);

    if (updateError) {
      toast.error(`게시물 보관 실패: ${updateError.message}`);
    } else {
      toast.success('게시물이 보관 처리되었습니다.');
      fetchPosts(); // 목록 새로고침
    }
  };

  if (loading) {
    return <div>게시물 목록을 불러오는 중...</div>;
  }

  if (error) {
    return <div>오류: {error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-gray-700">블로그 관리</h1>
        <Button asChild>
          <Link to="/admin/posts/new">새 글 작성</Link>
        </Button>
      </div>
      <div className="mt-4">
        <div className="bg-white shadow-md rounded my-6">
          <table className="min-w-max w-full table-auto">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">제목</th>
                <th className="py-3 px-6 text-center">상태</th>
                <th className="py-3 px-6 text-center">작성일</th>
                <th className="py-3 px-6 text-center">발행</th>
                <th className="py-3 px-6 text-center">작업</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {posts.map(post => (
                <tr
                  key={post.id}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    {post.title}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <span
                      className={`py-1 px-3 rounded-full text-xs ${
                        post.status === 'published'
                          ? 'bg-green-200 text-green-600'
                          : 'bg-yellow-200 text-yellow-600'
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    {new Date(post.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <Switch
                      checked={post.status === 'published'}
                      onCheckedChange={isChecked =>
                        handleStatusChange(post, isChecked)
                      }
                    />
                  </td>
                  <td className="py-3 px-6 text-center flex justify-center space-x-2">
                    <Link to={`/admin/posts/${post.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            정말 삭제하시겠습니까?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            이 작업은 되돌릴 수 없습니다. 이 게시물은 영구적으로
                            삭제됩니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(post.id)}
                          >
                            삭제
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
