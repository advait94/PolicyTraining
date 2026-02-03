-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations Table (formerly Tenants)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Users Table (extends auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  display_name TEXT,
  role TEXT CHECK (role IN ('admin', 'learner')) DEFAULT 'learner',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Modules Table
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  sequence_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Slides Table
CREATE TABLE public.slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Markdown content
  sequence_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Questions Table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Answers Table
CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. User Progress Table
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT FALSE,
  quiz_score INTEGER, -- Percentage or raw score
  certificate_id UUID, -- Placeholder for generated certificate reference
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, module_id)
);

-- RLS POLICIES ------------------------------------------------

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's organization_id
CREATE OR REPLACE FUNCTION get_auth_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM public.users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Organizations: Users can view their own organization
CREATE POLICY "Users can view their own organization" ON public.organizations
  FOR SELECT USING (id = get_auth_organization_id());

-- Users: Users can view members of their organization
CREATE POLICY "Users can view members of their organization" ON public.users
  FOR SELECT USING (
    organization_id = get_auth_organization_id() OR id = auth.uid()
  );

-- Modules/Slides/Questions/Answers: Publicly readable for authenticated users
CREATE POLICY "Auth users can view modules" ON public.modules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can view slides" ON public.slides FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can view questions" ON public.questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can view answers" ON public.answers FOR SELECT TO authenticated USING (true);

-- User Progress: Only view/edit own progress
CREATE POLICY "Users view own progress" ON public.user_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users update own progress" ON public.user_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users modify own progress" ON public.user_progress
  FOR UPDATE USING (user_id = auth.uid());
