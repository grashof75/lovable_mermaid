-- APPLY_003: Debug and Fix Comment Creation Issues
-- This addresses the persistent 400 error when creating comments
-- Simplifies RLS policies and diagnoses insertion problems

-- Step 1: Diagnose current state
-- First, check what's in the comments table
SELECT 'Existing comments:' as info;
SELECT * FROM public.comments LIMIT 5;

-- Check current RLS policies on comments
SELECT 'Current RLS policies:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'comments';

-- Step 2: Temporarily disable RLS to test if that's the issue
SELECT 'Disabling RLS temporarily for testing...' as info;
ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;

-- Step 3: Test direct insertion (you'll test this from frontend after applying)

-- Step 4: Create more specific RLS policies instead of catch-all
SELECT 'Recreating RLS policies with specific permissions...' as info;
DROP POLICY IF EXISTS "Users manage own comments" ON public.comments;

-- Separate policies for each operation
CREATE POLICY "Users can insert own comments" 
ON public.comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select own comments" 
ON public.comments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" 
ON public.comments 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" 
ON public.comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Step 5: Re-enable RLS
SELECT 'Re-enabling RLS...' as info;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Step 6: Verify new policies
SELECT 'New RLS policies:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'comments';

SELECT 'APPLY_003 completed. Now test comment creation from frontend.' as result;