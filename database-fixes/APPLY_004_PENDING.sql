-- APPLY_004: Add CASCADE DELETE for comments when view is deleted
-- This ensures database-level integrity when views are deleted
-- Addresses: Comments become orphaned when views are deleted

-- Step 1: Check current foreign key constraints
SELECT 'Current foreign key constraints on comments:' as info;
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'comments'
    AND tc.table_schema = 'public';

-- Step 2: Drop existing foreign key constraint for linked_view_id
SELECT 'Dropping existing foreign key constraint...' as info;
ALTER TABLE public.comments 
DROP CONSTRAINT IF EXISTS comments_linked_view_id_fkey;

-- Step 3: Add new foreign key constraint with CASCADE DELETE
SELECT 'Adding CASCADE DELETE constraint...' as info;
ALTER TABLE public.comments 
ADD CONSTRAINT comments_linked_view_id_fkey 
FOREIGN KEY (linked_view_id) REFERENCES public.saved_views(id) ON DELETE CASCADE;

-- Step 4: Verify the new constraint
SELECT 'Verifying new constraint:' as info;
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'comments'
    AND kcu.column_name = 'linked_view_id'
    AND tc.table_schema = 'public';

-- Step 5: Test the cascade (optional verification)
-- You can test this by:
-- 1. Creating a test view
-- 2. Creating a test comment linked to that view  
-- 3. Deleting the view
-- 4. Verifying the comment is auto-deleted

SELECT 'APPLY_004 completed. Comments will now be auto-deleted when views are deleted.' as result;