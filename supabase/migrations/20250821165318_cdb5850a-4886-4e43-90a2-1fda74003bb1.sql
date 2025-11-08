-- Fix RLS policies that are trying to access auth.users table
-- They should use auth.uid() instead

-- Update comments table policies
DROP POLICY IF EXISTS "Users manage own comments" ON public.comments;
DROP POLICY IF EXISTS "Comments viewable on accessible diagrams" ON public.comments;

CREATE POLICY "Users manage own comments" 
ON public.comments 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Comments viewable on accessible diagrams" 
ON public.comments 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM diagrams d 
  WHERE d.id = comments.diagram_id 
  AND (d.user_id = auth.uid() OR d.is_public = true)
));

-- Update provisional_views table policies
DROP POLICY IF EXISTS "Users manage own provisional views" ON public.provisional_views;

CREATE POLICY "Users manage own provisional views" 
ON public.provisional_views 
FOR ALL 
USING (auth.uid() = user_id);

-- Update view_comment_associations table policies
DROP POLICY IF EXISTS "Users access own view-comment associations" ON public.view_comment_associations;

CREATE POLICY "Users access own view-comment associations" 
ON public.view_comment_associations 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM saved_views sv 
  WHERE sv.id = view_comment_associations.view_id 
  AND sv.user_id = auth.uid()
));