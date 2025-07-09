-- Create posts table
CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT,
    excerpt TEXT,
    cover_image_url TEXT,
    author_id UUID REFERENCES public.app_user_profiles(id),
    status TEXT DEFAULT 'draft'
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;