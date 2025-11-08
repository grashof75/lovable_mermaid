-- URGENT FIX: Comments Foreign Key Issue
-- Apply this IMMEDIATELY in Supabase SQL Editor
-- This fixes the "Could not find a relationship between 'comments' and 'user_id'" error

-- Step 1: Ensure profiles table exists
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

-- Step 2: Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR ALL 
USING (auth.uid() = id);

-- Step 4: Fix foreign key constraint for comments
ALTER TABLE public.comments 
DROP CONSTRAINT IF EXISTS comments_user_id_fkey;

ALTER TABLE public.comments 
ADD CONSTRAINT comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 5: Create helper function for user profiles
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

GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO authenticated;

-- Step 6: Create view for comments with user info
CREATE OR REPLACE VIEW public.comments_with_user AS
SELECT 
  c.*,
  COALESCE(p.username, split_part(u.email, '@', 1)) as username,
  p.avatar_url
FROM public.comments c
LEFT JOIN auth.users u ON c.user_id = u.id
LEFT JOIN public.profiles p ON c.user_id = p.id;

GRANT SELECT ON public.comments_with_user TO authenticated;

-- Step 7: Update RLS policy for comments
DROP POLICY IF EXISTS "Users manage own comments" ON public.comments;
CREATE POLICY "Users manage own comments" 
ON public.comments 
FOR ALL 
USING (auth.uid() = user_id);

-- Step 8: Refresh PostgREST schema cache (if possible)
NOTIFY pgrst, 'reload schema';