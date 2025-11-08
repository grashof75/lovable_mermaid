-- Migration: Fix comments foreign key relationship
-- Created: 2025-08-22
-- Purpose: Ensure proper foreign key relationships for comments table

-- First, ensure we have the auth.users reference or create profiles table if needed

-- Check if profiles table exists, if not create it
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    website TEXT,
    theme_preference TEXT DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
    toast_notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR ALL 
USING (auth.uid() = id);

-- Now fix the foreign key constraint for comments
-- Drop existing constraint if it exists
ALTER TABLE public.comments 
DROP CONSTRAINT IF EXISTS comments_user_id_fkey;

-- Add proper foreign key constraint referencing auth.users
-- This should work better with Supabase's PostgREST
ALTER TABLE public.comments 
ADD CONSTRAINT comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update the function for better relationship handling in PostgREST
-- Create a function to get user info that PostgREST can understand
CREATE OR REPLACE FUNCTION public.get_user_profile(user_uuid UUID)
RETURNS TABLE(id UUID, email TEXT, username TEXT)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    u.id,
    u.email::TEXT,
    COALESCE(p.username, split_part(u.email, '@', 1)) as username
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  WHERE u.id = user_uuid;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO authenticated;

-- Create a view for comments with user info that PostgREST can handle
CREATE OR REPLACE VIEW public.comments_with_user AS
SELECT 
  c.*,
  COALESCE(p.username, split_part(u.email, '@', 1)) as username,
  p.avatar_url
FROM public.comments c
LEFT JOIN auth.users u ON c.user_id = u.id
LEFT JOIN public.profiles p ON c.user_id = p.id;

-- Grant permissions on the view
GRANT SELECT ON public.comments_with_user TO authenticated;

-- Update RLS policy for comments to be more permissive for foreign key checks
DROP POLICY IF EXISTS "Users manage own comments" ON public.comments;
CREATE POLICY "Users manage own comments" 
ON public.comments 
FOR ALL 
USING (auth.uid() = user_id);