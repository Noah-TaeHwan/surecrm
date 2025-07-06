CREATE TABLE public.invitation_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    company_name text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.invitation_requests OWNER TO postgres;

ALTER TABLE ONLY public.invitation_requests
    ADD CONSTRAINT invitation_requests_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.invitation_requests
    ADD CONSTRAINT invitation_requests_email_key UNIQUE (email);

ALTER TABLE public.invitation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public anonymous insert" ON public.invitation_requests FOR INSERT WITH CHECK (true);
