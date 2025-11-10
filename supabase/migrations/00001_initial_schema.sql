-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    website TEXT,
    theme_preference TEXT CHECK (theme_preference IN ('light', 'dark', 'system')) DEFAULT 'system',
    toast_notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Diagrams table
CREATE TABLE IF NOT EXISTS public.diagrams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    mermaid_code TEXT NOT NULL,
    is_public BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Saved views table
CREATE TABLE IF NOT EXISTS public.saved_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    diagram_id UUID REFERENCES public.diagrams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    zoom_level NUMERIC DEFAULT 1.0,
    pan_x NUMERIC DEFAULT 0,
    pan_y NUMERIC DEFAULT 0,
    parent_id UUID REFERENCES public.saved_views(id) ON DELETE CASCADE,
    is_folder BOOLEAN DEFAULT false,
    expanded BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    diagram_id UUID REFERENCES public.diagrams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    linked_view_id UUID REFERENCES public.saved_views(id) ON DELETE SET NULL,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Provisional views table
CREATE TABLE IF NOT EXISTS public.provisional_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE NOT NULL,
    diagram_id UUID REFERENCES public.diagrams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    zoom_level NUMERIC DEFAULT 1.0,
    pan_x NUMERIC DEFAULT 0,
    pan_y NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- AI prompts table
CREATE TABLE IF NOT EXISTS public.ai_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    diagram_id UUID REFERENCES public.diagrams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    prompt_text TEXT NOT NULL,
    generated_code TEXT NOT NULL,
    model_used TEXT DEFAULT 'gpt-4',
    tokens_used INTEGER,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Diagram shares table
CREATE TABLE IF NOT EXISTS public.diagram_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    diagram_id UUID REFERENCES public.diagrams(id) ON DELETE CASCADE NOT NULL,
    shared_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    is_public BOOLEAN DEFAULT true,
    password_hash TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Collaborators table
CREATE TABLE IF NOT EXISTS public.collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    diagram_id UUID REFERENCES public.diagrams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    invited_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    permission_level TEXT CHECK (permission_level IN ('read', 'comment', 'edit', 'admin')) DEFAULT 'read',
    status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(diagram_id, user_id)
);

-- User API keys table (for storing encrypted API keys)
CREATE TABLE IF NOT EXISTS public.user_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    encrypted_api_key TEXT NOT NULL,
    key_hint TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Prompt pool table (for AI prompt templates and recommendations)
CREATE TABLE IF NOT EXISTS public.prompt_pool (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_key TEXT UNIQUE NOT NULL,
    template TEXT NOT NULL,
    category TEXT NOT NULL,
    complexity TEXT CHECK (complexity IN ('basic', 'intermediate', 'advanced')) DEFAULT 'basic',
    tokens_avg INTEGER DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    success_rate NUMERIC DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_diagrams_user_id ON public.diagrams(user_id);
CREATE INDEX IF NOT EXISTS idx_diagrams_created_at ON public.diagrams(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diagrams_tags ON public.diagrams USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_saved_views_diagram_id ON public.saved_views(diagram_id);
CREATE INDEX IF NOT EXISTS idx_saved_views_user_id ON public.saved_views(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_diagram_id ON public.comments(diagram_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_user_id ON public.ai_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_diagram_id ON public.ai_prompts(diagram_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_diagram_id ON public.collaborators(diagram_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_user_id ON public.collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_diagram_shares_token ON public.diagram_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_prompt_pool_category ON public.prompt_pool(category);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagrams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provisional_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagram_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_pool ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- RLS Policies for diagrams
CREATE POLICY "Public diagrams are viewable by everyone"
    ON public.diagrams FOR SELECT
    USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can insert own diagrams"
    ON public.diagrams FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diagrams"
    ON public.diagrams FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diagrams"
    ON public.diagrams FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for saved_views
CREATE POLICY "Users can view own saved views"
    ON public.saved_views FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved views"
    ON public.saved_views FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved views"
    ON public.saved_views FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved views"
    ON public.saved_views FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for comments
CREATE POLICY "Comments viewable for diagram viewers"
    ON public.comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.diagrams
            WHERE diagrams.id = comments.diagram_id
            AND (diagrams.is_public = true OR diagrams.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert comments on accessible diagrams"
    ON public.comments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.diagrams
            WHERE diagrams.id = diagram_id
            AND (diagrams.is_public = true OR diagrams.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can update own comments"
    ON public.comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
    ON public.comments FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for ai_prompts
CREATE POLICY "Users can view own AI prompts"
    ON public.ai_prompts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI prompts"
    ON public.ai_prompts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for collaborators
CREATE POLICY "Collaborators viewable by diagram owner and collaborators"
    ON public.collaborators FOR SELECT
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.diagrams
            WHERE diagrams.id = collaborators.diagram_id
            AND diagrams.user_id = auth.uid()
        )
    );

CREATE POLICY "Diagram owners can manage collaborators"
    ON public.collaborators FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.diagrams
            WHERE diagrams.id = collaborators.diagram_id
            AND diagrams.user_id = auth.uid()
        )
    );

-- RLS Policies for user_api_keys
CREATE POLICY "Users can view own API keys"
    ON public.user_api_keys FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own API keys"
    ON public.user_api_keys FOR ALL
    USING (auth.uid() = user_id);

-- RLS Policies for prompt_pool (read-only for users)
CREATE POLICY "Prompt pool viewable by authenticated users"
    ON public.prompt_pool FOR SELECT
    USING (auth.role() = 'authenticated');

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.diagrams
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.saved_views
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.collaborators
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.user_api_keys
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.prompt_pool
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Function: Get table info (for debugging and admin purposes)
CREATE OR REPLACE FUNCTION public.get_table_info(table_num TEXT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'table_name', table_name,
        'columns', (
            SELECT json_agg(
                json_build_object(
                    'column_name', column_name,
                    'data_type', data_type,
                    'is_nullable', is_nullable
                )
            )
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = table_num
        )
    ) INTO result
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = table_num;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: List all tables
CREATE OR REPLACE FUNCTION public.list_all_tables()
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT json_agg(table_name)
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Search tables by name
CREATE OR REPLACE FUNCTION public.search_tables(search_term TEXT)
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT json_agg(table_name)
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND table_name ILIKE '%' || search_term || '%'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user statistics
CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_diagrams', (SELECT COUNT(*) FROM public.diagrams WHERE user_id = user_uuid),
        'public_diagrams', (SELECT COUNT(*) FROM public.diagrams WHERE user_id = user_uuid AND is_public = true),
        'total_views', (SELECT COUNT(*) FROM public.saved_views WHERE user_id = user_uuid),
        'total_comments', (SELECT COUNT(*) FROM public.comments WHERE user_id = user_uuid),
        'total_prompts', (SELECT COUNT(*) FROM public.ai_prompts WHERE user_id = user_uuid),
        'collaborating_on', (SELECT COUNT(*) FROM public.collaborators WHERE user_id = user_uuid AND status = 'accepted')
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get prompt recommendation based on description
CREATE OR REPLACE FUNCTION public.get_prompt_recommendation(
    description_text TEXT,
    preferred_category TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'id', id,
        'prompt_key', prompt_key,
        'template', template,
        'category', category,
        'complexity', complexity,
        'success_rate', success_rate
    ) INTO result
    FROM public.prompt_pool
    WHERE (preferred_category IS NULL OR category = preferred_category)
    AND is_active = true
    ORDER BY success_rate DESC, usage_count DESC
    LIMIT 1;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Cleanup expired data
CREATE OR REPLACE FUNCTION public.cleanup_expired_data()
RETURNS JSON AS $$
DECLARE
    deleted_shares INTEGER;
BEGIN
    -- Delete expired diagram shares
    WITH deleted AS (
        DELETE FROM public.diagram_shares
        WHERE expires_at IS NOT NULL
        AND expires_at < now()
        RETURNING *
    )
    SELECT COUNT(*) INTO deleted_shares FROM deleted;

    RETURN json_build_object(
        'deleted_shares', deleted_shares,
        'timestamp', now()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Validate database integrity
CREATE OR REPLACE FUNCTION public.validate_database_integrity()
RETURNS JSON AS $$
DECLARE
    result JSON;
    orphaned_views INTEGER;
    orphaned_comments INTEGER;
BEGIN
    -- Check for orphaned saved views (diagram deleted but views remain)
    SELECT COUNT(*) INTO orphaned_views
    FROM public.saved_views sv
    LEFT JOIN public.diagrams d ON sv.diagram_id = d.id
    WHERE d.id IS NULL;

    -- Check for orphaned comments
    SELECT COUNT(*) INTO orphaned_comments
    FROM public.comments c
    LEFT JOIN public.diagrams d ON c.diagram_id = d.id
    WHERE d.id IS NULL;

    SELECT json_build_object(
        'orphaned_views', orphaned_views,
        'orphaned_comments', orphaned_comments,
        'timestamp', now()
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add is_active column to prompt_pool if not exists (for the recommendation function)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'prompt_pool'
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.prompt_pool ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO postgres, anon, authenticated, service_role;
