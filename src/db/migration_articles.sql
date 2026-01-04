-- Create the articles table
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    read_time TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    image TEXT,
    content TEXT NOT NULL,
    published_at TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON public.articles
    FOR SELECT USING (true);

-- Allow authenticated service role to manage articles (for scripts)
CREATE POLICY "Allow service role all access" ON public.articles
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
