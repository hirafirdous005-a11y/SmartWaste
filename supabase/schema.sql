-- =========================================================================
-- SMART WASTE MONITORING SYSTEM - SUPABASE POSTGRESQL SCHEMA & POLICIES
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Users, Workers, Administrators)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('citizen', 'worker', 'admin')) DEFAULT 'citizen',
  account_status TEXT NOT NULL CHECK (account_status IN ('active', 'suspended', 'pending')) DEFAULT 'active',
  avatar_url TEXT,
  zone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. WASTE REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.waste_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_number TEXT UNIQUE NOT NULL,
  citizen_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity TEXT NOT NULL DEFAULT 'Medium bin (5-20kg)',
  image_url TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  predicted_category TEXT NOT NULL,
  verified_category TEXT,
  ai_confidence INTEGER CHECK (ai_confidence >= 0 AND ai_confidence <= 100),
  priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Emergency')) DEFAULT 'Medium',
  status TEXT NOT NULL CHECK (status IN ('Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected')) DEFAULT 'Submitted',
  assigned_worker_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  reopened_reason TEXT,
  citizen_feedback TEXT CHECK (citizen_feedback IN ('confirmed', 'reopened')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. WORKER TASKS TABLE
CREATE TABLE IF NOT EXISTS public.worker_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES public.waste_reports(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  task_status TEXT NOT NULL CHECK (task_status IN ('Assigned', 'Accepted', 'On the Way', 'In Progress', 'Completed', 'Issue Reported')) DEFAULT 'Assigned',
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completion_notes TEXT,
  before_image TEXT,
  after_image TEXT,
  issue_type TEXT,
  issue_description TEXT,
  issue_reported_at TIMESTAMPTZ
);

-- 4. TASK IMAGES (Proof of cleaning)
CREATE TABLE IF NOT EXISTS public.task_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.worker_tasks(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type TEXT NOT NULL CHECK (image_type IN ('before', 'after')),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  report_id UUID REFERENCES public.waste_reports(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'status_change',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_waste_reports_citizen ON public.waste_reports(citizen_id);
CREATE INDEX IF NOT EXISTS idx_waste_reports_status ON public.waste_reports(status);
CREATE INDEX IF NOT EXISTS idx_waste_reports_priority ON public.waste_reports(priority);
CREATE INDEX IF NOT EXISTS idx_waste_reports_coords ON public.waste_reports(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_worker_tasks_worker ON public.worker_tasks(worker_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id);

-- TRIGGER TO UPDATE updated_at ON waste_reports
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_waste_reports_modtime
BEFORE UPDATE ON public.waste_reports
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if caller is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles: Users can view own, admins can view all
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Waste Reports: Citizens view their own; anyone can view minimal coordinates for nearby map; admins full access
CREATE POLICY "Citizens can create reports" ON public.waste_reports
  FOR INSERT WITH CHECK (auth.uid() = citizen_id);

CREATE POLICY "Citizens can view own reports" ON public.waste_reports
  FOR SELECT USING (auth.uid() = citizen_id OR public.is_admin());

CREATE POLICY "Workers can view assigned reports" ON public.waste_reports
  FOR SELECT USING (assigned_worker_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can update reports" ON public.waste_reports
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Citizens can reopen or confirm resolved reports" ON public.waste_reports
  FOR UPDATE USING (auth.uid() = citizen_id);

-- Worker Tasks: Workers view/update assigned tasks; admins manage all
CREATE POLICY "Workers can view own tasks" ON public.worker_tasks
  FOR SELECT USING (worker_id = auth.uid() OR public.is_admin());

CREATE POLICY "Workers can update own tasks" ON public.worker_tasks
  FOR UPDATE USING (worker_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can insert tasks" ON public.worker_tasks
  FOR INSERT WITH CHECK (public.is_admin());

-- Notifications: Recipient can view & update read status
CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE USING (recipient_id = auth.uid());

-- Audit logs: Admins only
CREATE POLICY "Admins can read and write audit logs" ON public.audit_logs
  FOR ALL USING (public.is_admin());
