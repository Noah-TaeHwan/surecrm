import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { createClient } from '@supabase/supabase-js';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import { Textarea } from '~/common/components/ui/textarea';
import { Label } from '~/common/components/ui/label';
import { toast } from 'sonner';

// Supabase 클라이언트 직접 생성
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// slug를 생성하는 간단한 유틸리티 함수
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export default function EditPostPage() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      setIsLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (error) {
        toast.error('게시물을 불러오는데 실패했습니다.');
        navigate('/admin/posts');
      } else if (data) {
        setTitle(data.title || '');
        setSlug(data.slug || '');
        setContent(data.content || '');
      }
      setIsLoading(false);
    };
    fetchPost();
  }, [postId, navigate]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setSlug(slugify(newTitle));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase
      .from('posts')
      .update({ title, slug, content })
      .eq('id', postId!);

    if (error) {
      toast.error(`게시물 수정 실패: ${error.message}`);
    } else {
      toast.success('게시물이 성공적으로 수정되었습니다.');
      navigate('/admin/posts');
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return <div>게시물 정보를 불러오는 중...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-700">블로그 글 수정</h1>
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              value={title}
              onChange={handleTitleChange}
              placeholder="게시물 제목을 입력하세요"
              required
            />
          </div>
          <div>
            <Label htmlFor="slug">슬러그 (URL 경로)</Label>
            <Input
              id="slug"
              value={slug}
              onChange={e => setSlug(slugify(e.target.value))}
              placeholder="URL에 사용될 경로"
              required
            />
          </div>
          <div>
            <Label htmlFor="content">내용 (Markdown 지원)</Label>
            <Textarea
              id="content"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="게시물 내용을 입력하세요."
              rows={15}
            />
          </div>
        </div>
        <div className="mt-6">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '저장 중...' : '수정사항 저장'}
          </Button>
        </div>
      </form>
    </div>
  );
}
