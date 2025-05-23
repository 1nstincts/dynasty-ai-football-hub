-- Create leagues table for storing user-created leagues
CREATE TABLE IF NOT EXISTS public.leagues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('dynasty', 'redraft', 'keeper')),
    size INTEGER NOT NULL CHECK (size >= 4 AND size <= 16),
    owner_id TEXT,
    settings JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leagues_updated_at
    BEFORE UPDATE ON public.leagues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policy if needed
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see all leagues for now (can be restricted later)
CREATE POLICY "Allow all to read leagues" ON public.leagues
    FOR SELECT USING (true);

-- Create policy to allow users to insert leagues
CREATE POLICY "Allow users to create leagues" ON public.leagues
    FOR INSERT WITH CHECK (true);

-- Create policy to allow users to update their own leagues
CREATE POLICY "Allow users to update own leagues" ON public.leagues
    FOR UPDATE USING (owner_id = auth.uid()::text);