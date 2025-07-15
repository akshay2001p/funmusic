-- Database schema for FunMusic app
-- Run these commands in your Supabase SQL Editor

-- Create songs table
CREATE TABLE IF NOT EXISTS songs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    duration INTEGER NOT NULL, -- duration in seconds
    file_url TEXT NOT NULL,
    cover_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create favorites table (for future user authentication)
CREATE TABLE IF NOT EXISTS favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL, -- Will reference auth.users when you add authentication
    song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, song_id) -- Prevent duplicate favorites
);

-- Create RLS policies (Row Level Security)
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Allow read access to songs for everyone
CREATE POLICY "Songs are readable by everyone" ON songs
    FOR SELECT USING (true);

-- Allow insert access to songs for everyone (you can restrict this later)
CREATE POLICY "Songs can be inserted by everyone" ON songs
    FOR INSERT WITH CHECK (true);

-- Allow update access to songs for everyone (you can restrict this later)
CREATE POLICY "Songs can be updated by everyone" ON songs
    FOR UPDATE USING (true);

-- Allow delete access to songs for everyone (you can restrict this later)
CREATE POLICY "Songs can be deleted by everyone" ON songs
    FOR DELETE USING (true);

-- Favorites policies (for when you add authentication)
CREATE POLICY "Users can view their own favorites" ON favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for music files
INSERT INTO storage.buckets (id, name, public)
VALUES ('music-files', 'music-files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to music files bucket
CREATE POLICY "Music files are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'music-files');

CREATE POLICY "Anyone can upload music files" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'music-files');

CREATE POLICY "Anyone can update music files" ON storage.objects
    FOR UPDATE USING (bucket_id = 'music-files');

CREATE POLICY "Anyone can delete music files" ON storage.objects
    FOR DELETE USING (bucket_id = 'music-files');
