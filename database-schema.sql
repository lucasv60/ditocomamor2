-- Supabase SQL Schema for Memories Table

-- Create enum for payment status
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'abandoned');

-- Create memories table
CREATE TABLE memories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    love_letter_content TEXT NOT NULL,
    relationship_start_date DATE NOT NULL,
    photos_urls JSONB,
    youtube_music_url TEXT,
    payment_status payment_status DEFAULT 'pending' NOT NULL,
    preference_id TEXT,
    payment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on slug for fast lookups
CREATE INDEX idx_memories_slug ON memories(slug);

-- Create index on payment_status for filtering
CREATE INDEX idx_memories_payment_status ON memories(payment_status);

-- Create index on preference_id for IPN lookups
CREATE INDEX idx_memories_preference_id ON memories(preference_id);

-- Enable Row Level Security
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access only if payment_status is 'paid'
CREATE POLICY "Public read access for paid memories" ON memories
    FOR SELECT USING (payment_status = 'paid');

-- Policy: Allow service role to insert/update/delete (for server-side operations)
CREATE POLICY "Service role full access" ON memories
    FOR ALL USING (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_memories_updated_at
    BEFORE UPDATE ON memories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Optional: Function to clean up abandoned payments (run via cron or scheduled job)
CREATE OR REPLACE FUNCTION cleanup_abandoned_memories()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete memories with 'pending' status older than 24 hours
    DELETE FROM memories
    WHERE payment_status = 'pending'
    AND created_at < NOW() - INTERVAL '24 hours';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;