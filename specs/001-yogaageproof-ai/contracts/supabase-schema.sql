-- YogaAgeProof AI - Supabase Database Schema
-- Branch: 001-yogaageproof-ai
-- Date: 2025-11-26
--
-- This schema is designed for Supabase PostgreSQL with Row Level Security.
-- Run this migration via Supabase Dashboard or CLI.

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE skin_type AS ENUM ('oily', 'dry', 'combination', 'sensitive', 'normal');
CREATE TYPE routine_status AS ENUM ('draft', 'active', 'archived');
CREATE TYPE step_type AS ENUM ('face_yoga', 'product_application');
CREATE TYPE session_status AS ENUM ('in_progress', 'completed', 'abandoned');
CREATE TYPE step_completion_status AS ENUM ('completed', 'skipped');
CREATE TYPE mood_type AS ENUM ('stressed', 'calm', 'energized', 'tired', 'happy', 'anxious', 'neutral');
CREATE TYPE sync_status AS ENUM ('local_only', 'pending', 'synced');
CREATE TYPE notification_type AS ENUM ('routine_reminder', 'progress_milestone', 'ai_tip', 'system_update', 'achievement');
CREATE TYPE recommendation_type AS ENUM ('routine_adjustment', 'product_suggestion', 'behavioral_tip');
CREATE TYPE subscription_plan AS ENUM ('free', 'pro');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');
CREATE TYPE product_category AS ENUM ('cleanser', 'toner', 'serum', 'moisturizer', 'eye_cream', 'treatment', 'sunscreen', 'mask', 'oil');

-- ============================================================================
-- TABLES
-- ============================================================================

-- 1. User Profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    avatar_url TEXT,
    language_preference VARCHAR(10) DEFAULT 'en',
    notification_enabled BOOLEAN DEFAULT true,
    notification_routine_reminders BOOLEAN DEFAULT true,
    notification_tips BOOLEAN DEFAULT true,
    notification_milestones BOOLEAN DEFAULT true,
    cloud_backup_enabled BOOLEAN DEFAULT false,
    timezone VARCHAR(50) DEFAULT 'UTC',
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Skin Profiles
CREATE TABLE skin_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    skin_type skin_type NOT NULL,
    concerns JSONB DEFAULT '[]'::jsonb,
    analysis_confidence DECIMAL(3,2) CHECK (analysis_confidence >= 0 AND analysis_confidence <= 1),
    source_photo_url TEXT NOT NULL,
    analysis_metadata JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products (Skincare catalog)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    category product_category NOT NULL,
    description TEXT,
    ingredients JSONB DEFAULT '[]'::jsonb,
    benefits JSONB DEFAULT '[]'::jsonb,
    usage_instructions TEXT,
    skin_types JSONB DEFAULT '[]'::jsonb,
    concerns_addressed JSONB DEFAULT '[]'::jsonb,
    image_url TEXT,
    price_usd DECIMAL(10,2),
    external_url TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Routines
CREATE TABLE routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    skin_profile_id UUID NOT NULL REFERENCES skin_profiles(id) ON DELETE SET NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    focus_area VARCHAR(50) NOT NULL,
    estimated_duration_minutes INTEGER NOT NULL CHECK (estimated_duration_minutes > 0),
    benefits JSONB DEFAULT '[]'::jsonb,
    status routine_status DEFAULT 'draft',
    is_ai_generated BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Routine Steps
CREATE TABLE routine_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    step_type step_type NOT NULL,
    title VARCHAR(100) NOT NULL,
    instructions TEXT NOT NULL,
    tips TEXT,
    duration_seconds INTEGER NOT NULL CHECK (duration_seconds > 0),
    image_url TEXT,
    video_url TEXT,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_amount VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(routine_id, step_number)
);

-- 6. Routine Sessions
CREATE TABLE routine_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    status session_status DEFAULT 'in_progress',
    total_duration_seconds INTEGER,
    steps_completed INTEGER DEFAULT 0,
    steps_skipped INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Step Completions
CREATE TABLE step_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES routine_sessions(id) ON DELETE CASCADE,
    step_id UUID NOT NULL REFERENCES routine_steps(id) ON DELETE CASCADE,
    status step_completion_status NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    UNIQUE(session_id, step_id)
);

-- 8. Diary Entries
CREATE TABLE diary_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    mood mood_type,
    triggers JSONB DEFAULT '[]'::jsonb,
    skin_condition TEXT,
    notes TEXT,
    routine_session_id UUID REFERENCES routine_sessions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, entry_date)
);

-- 9. Progress Photos
CREATE TABLE progress_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    local_path TEXT,
    cloud_url TEXT,
    sync_status sync_status DEFAULT 'local_only',
    captured_at TIMESTAMPTZ NOT NULL,
    lighting_conditions VARCHAR(50),
    analysis_result JSONB,
    thumbnail_url TEXT,
    file_size_bytes INTEGER,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Photo Comparisons
CREATE TABLE photo_comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    before_photo_id UUID NOT NULL REFERENCES progress_photos(id) ON DELETE CASCADE,
    after_photo_id UUID NOT NULL REFERENCES progress_photos(id) ON DELETE CASCADE,
    analyzed_at TIMESTAMPTZ NOT NULL,
    detected_changes JSONB NOT NULL,
    improvement_metrics JSONB DEFAULT '{}'::jsonb,
    ai_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (before_photo_id != after_photo_id)
);

-- 11. Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    scheduled_for TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. AI Recommendations
CREATE TABLE ai_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    type recommendation_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data_sources JSONB DEFAULT '[]'::jsonb,
    is_actioned BOOLEAN DEFAULT false,
    actioned_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(100),
    stripe_subscription_id VARCHAR(100),
    plan subscription_plan DEFAULT 'free',
    status subscription_status DEFAULT 'active',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_skin_profiles_user_active ON skin_profiles(user_id, is_active);
CREATE INDEX idx_routines_user_status ON routines(user_id, status);
CREATE INDEX idx_routine_steps_routine ON routine_steps(routine_id, step_number);
CREATE INDEX idx_routine_sessions_user_date ON routine_sessions(user_id, started_at DESC);
CREATE INDEX idx_step_completions_session ON step_completions(session_id);
CREATE INDEX idx_diary_entries_user_date ON diary_entries(user_id, entry_date DESC);
CREATE INDEX idx_progress_photos_user_date ON progress_photos(user_id, captured_at DESC);
CREATE INDEX idx_progress_photos_sync ON progress_photos(user_id, sync_status) WHERE NOT is_deleted;
CREATE INDEX idx_photo_comparisons_user ON photo_comparisons(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_ai_recommendations_user ON ai_recommendations(user_id, created_at DESC);
CREATE INDEX idx_products_category ON products(category, is_available);
CREATE INDEX idx_products_skin_types ON products USING GIN(skin_types);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_routines_updated_at
    BEFORE UPDATE ON routines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_diary_entries_updated_at
    BEFORE UPDATE ON diary_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Deactivate previous skin profiles when new one created
CREATE OR REPLACE FUNCTION deactivate_old_skin_profiles()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_active = true THEN
        UPDATE skin_profiles
        SET is_active = false
        WHERE user_id = NEW.user_id
          AND id != NEW.id
          AND is_active = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_skin_profiles_deactivate_old
    AFTER INSERT ON skin_profiles
    FOR EACH ROW EXECUTE FUNCTION deactivate_old_skin_profiles();

-- Deactivate previous routines when new one activated
CREATE OR REPLACE FUNCTION deactivate_old_routines()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
        UPDATE routines
        SET status = 'archived'
        WHERE user_id = NEW.user_id
          AND id != NEW.id
          AND status = 'active';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_routines_deactivate_old
    AFTER UPDATE ON routines
    FOR EACH ROW EXECUTE FUNCTION deactivate_old_routines();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Calculate routine consistency for a user over N days
CREATE OR REPLACE FUNCTION calculate_routine_consistency(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS DECIMAL AS $$
DECLARE
    total_sessions INTEGER;
    expected_sessions INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_sessions
    FROM routine_sessions
    WHERE user_id = p_user_id
      AND status = 'completed'
      AND started_at >= NOW() - (p_days || ' days')::INTERVAL;

    -- Assume 4 sessions per week is 100%
    expected_sessions := (p_days / 7) * 4;

    IF expected_sessions = 0 THEN
        RETURN 0;
    END IF;

    RETURN LEAST(1.0, total_sessions::DECIMAL / expected_sessions);
END;
$$ LANGUAGE plpgsql;

-- Get active routine with steps for a user
CREATE OR REPLACE FUNCTION get_active_routine(p_user_id UUID)
RETURNS TABLE (
    routine_id UUID,
    routine_title VARCHAR(100),
    focus_area VARCHAR(50),
    estimated_duration INTEGER,
    step_id UUID,
    step_number INTEGER,
    step_type step_type,
    step_title VARCHAR(100),
    instructions TEXT,
    duration_seconds INTEGER,
    product_name VARCHAR(200),
    product_brand VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id AS routine_id,
        r.title AS routine_title,
        r.focus_area,
        r.estimated_duration_minutes AS estimated_duration,
        rs.id AS step_id,
        rs.step_number,
        rs.step_type,
        rs.title AS step_title,
        rs.instructions,
        rs.duration_seconds,
        p.name AS product_name,
        p.brand AS product_brand
    FROM routines r
    JOIN routine_steps rs ON r.id = rs.routine_id
    LEFT JOIN products p ON rs.product_id = p.id
    WHERE r.user_id = p_user_id
      AND r.status = 'active'
    ORDER BY rs.step_number;
END;
$$ LANGUAGE plpgsql;

-- Get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM notifications
        WHERE user_id = p_user_id
          AND is_read = false
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Skin Profiles: Users can only access their own
CREATE POLICY "Users can manage own skin profiles" ON skin_profiles
    FOR ALL USING (auth.uid() = user_id);

-- Routines: Users can only access their own
CREATE POLICY "Users can manage own routines" ON routines
    FOR ALL USING (auth.uid() = user_id);

-- Routine Steps: Users can access steps of their routines
CREATE POLICY "Users can view own routine steps" ON routine_steps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM routines
            WHERE routines.id = routine_steps.routine_id
              AND routines.user_id = auth.uid()
        )
    );

-- Routine Sessions: Users can only access their own
CREATE POLICY "Users can manage own sessions" ON routine_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Step Completions: Users can access their session completions
CREATE POLICY "Users can manage own step completions" ON step_completions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM routine_sessions
            WHERE routine_sessions.id = step_completions.session_id
              AND routine_sessions.user_id = auth.uid()
        )
    );

-- Diary Entries: Users can only access their own
CREATE POLICY "Users can manage own diary entries" ON diary_entries
    FOR ALL USING (auth.uid() = user_id);

-- Progress Photos: Users can only access their own
CREATE POLICY "Users can manage own photos" ON progress_photos
    FOR ALL USING (auth.uid() = user_id);

-- Photo Comparisons: Users can only access their own
CREATE POLICY "Users can manage own comparisons" ON photo_comparisons
    FOR ALL USING (auth.uid() = user_id);

-- Notifications: Users can only access their own
CREATE POLICY "Users can manage own notifications" ON notifications
    FOR ALL USING (auth.uid() = user_id);

-- AI Recommendations: Users can only access their own
CREATE POLICY "Users can manage own recommendations" ON ai_recommendations
    FOR ALL USING (auth.uid() = user_id);

-- Subscriptions: Users can only access their own
CREATE POLICY "Users can view own subscription" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Products: All authenticated users can read
CREATE POLICY "Authenticated users can view products" ON products
    FOR SELECT TO authenticated USING (true);

-- ============================================================================
-- STORAGE BUCKETS (Run in Supabase Dashboard)
-- ============================================================================

-- Create storage bucket for progress photos
-- INSERT INTO storage.buckets (id, name, public) VALUES ('progress-photos', 'progress-photos', false);

-- Storage policy: Users can only access their own photos
-- CREATE POLICY "Users can upload own photos"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can view own photos"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete own photos"
-- ON storage.objects FOR DELETE
-- USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
